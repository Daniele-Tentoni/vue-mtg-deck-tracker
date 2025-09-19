import { createClient } from 'npm:@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { corsHeaders, getUserFromRequest } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const challongeClientId = Deno.env.get('CHALLONGE_CLIENT_ID')!;
const challongeClientSecret = Deno.env.get('CHALLONGE_CLIENT_SECRET')!;
const redirectUri = Deno.env.get('CHALLONGE_REDIRECT_URI')!;

serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '*';
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code' }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    const authorization = req.headers.get('Authorization')!;
    if (!authorization) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    console.log('Received code:', code);
    console.log('Using redirect URI:', redirectUri);

    // Scambio del code con access_token
    const tokenResp = await fetch('https://api.challonge.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: challongeClientId,
        client_secret: challongeClientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResp.ok) {
      const err = await tokenResp.text();
      return new Response(JSON.stringify({ error: 'Token exchange failed', details: err }), {
        status: 400,
        headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
      });
    }

    const jTokens = await tokenResp.json();

    console.log('Obtained access_token:', jTokens);

    const { access_token, refresh_token, expires_in } = jTokens;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    });

    // Salvo token in DB
    const me = await supabaseClient.auth.getUser();
    const s = await supabaseClient.from('user_tokens').upsert(
      {
        user_id: me.id,
        provider: 'Challonge',
        access_token,
        refresh_token,
      },
      { onConflict: ['user_id', 'provider'] },
    );

    console.log('Upsert result:', s);

    return new Response(JSON.stringify({ success: true, mail: me.email }), {
      status: 200,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
    });
  }
});
