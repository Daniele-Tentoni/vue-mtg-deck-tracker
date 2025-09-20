import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const API_BASE = 'https://api.challonge.com/v2.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const challongeClientId = Deno.env.get('CHALLONGE_CLIENT_ID')!;
const challongeClientSecret = Deno.env.get('CHALLONGE_CLIENT_SECRET')!;
const redirectUri = Deno.env.get('CHALLONGE_REDIRECT_URI')!;

const providerName = 'Challonge';
const providerTokenUrl = 'https://api.challonge.com/oauth/token';

async function refreshTokens(refresh_token: string) {
  const clientId = Deno.env.get('CHALLONGE_CLIENT_ID')!;
  const clientSecret = Deno.env.get('CHALLONGE_CLIENT_SECRET')!;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token,
    }),
  });
  if (!res.ok) return null;
  return await res.json();
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  const authorization = req.headers.get('Authorization')!;
  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const me = await supabaseClient.auth.getUser();
  console.log('User:', me.id, authorization);
  const { data: tokens, error: tokenErr } = await supabaseClient
    .from('user_tokens')
    .select('access_token')
    .eq('user_id', me.id)
    .eq('provider', providerName)
    .single();

  if (tokenErr || !tokens) {
    return new Response(JSON.stringify({ error: 'No Challonge token found' }), {
      status: 404,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const path = url.searchParams.get('path'); // es. "/tournaments.json"
  if (!path)
    return new Response(JSON.stringify({ error: 'missing path' }), {
      status: 400,
      headers: cors,
    });

  const reqUrl = `${API_BASE}${path}`; //${url.search};
  const upstream = async (accessToken: string) =>
    fetch(reqUrl, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Authorization-Type': 'v2',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text(),
    });

  // primo tentativo
  let res = await upstream(tokens.access_token);
  console.log(`Upstream response status ${res.status}: ${reqUrl}...`);
  let setCookieHeader: string | undefined;

  // se 401 e ho refresh_token, tenta refresh
  /*if (res.status === 401 && session.refresh_token) {
    const refreshed = await refreshTokens(session.refresh_token);
    if (refreshed?.access_token) {
      // prepara cookie aggiornato
      const maxAge = Math.max(60, Math.min(refreshed.expires_in ?? 3600, 24 * 3600));
      setCookieHeader = [
        `challonge_session=${btoa(JSON.stringify(refreshed))}`,
        'HttpOnly',
        'Secure',
        'SameSite=Lax',
        `Max-Age=${maxAge}`,
        'Path=/',
      ].join('; ');
      res = await upstream(refreshed.access_token);
    }
  }*/

  const body = await res.arrayBuffer();
  const headers = new Headers(res.headers);
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json');
  if (setCookieHeader) headers.append('Set-Cookie', setCookieHeader);
  return new Response(body, { status: res.status, headers: { ...cors, ...headers } });
});
