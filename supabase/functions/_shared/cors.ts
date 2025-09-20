import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRole);

/**
 * Headers CORS standard
 */
export function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

/**
 * Retrieve user from Authorization header in the request.
 * This requires the Supabase JWT to be passed in the Authorization header of the Request as a Bearer token.
 * To work, the supabase client must be instantiated with the Service Role key.
 */
export async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!authHeader) {
    return { user: null, error: 'Missing Supabase JWT' };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(authHeader);

  if (error || !user) {
    return { user: null, error: 'Invalid Supabase JWT' };
  }

  return { user, error: null };
}
