import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('Authentication required');

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: requester } } = await adminClient.auth.getUser();
    if (!requester) throw new Error('Authentication required');

    const { data: requesterProfile } = await adminClient.from('profiles').select('role').eq('id', requester.id).single();
    if (requesterProfile?.role !== 'admin') throw new Error('Only admins can invite admins');

    const { email, full_name } = await request.json();
    if (!email || !full_name) throw new Error('Name and email are required');

    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name, is_seller: false },
    });
    if (error) throw error;

    const { error: profileError } = await adminClient
      .from('profiles')
      .update({ full_name, role: 'admin', is_seller: false })
      .eq('id', data.user.id);
    if (profileError) throw profileError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Unable to create admin' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
