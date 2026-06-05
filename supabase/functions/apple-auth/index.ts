import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  try {
    const contentType = req.headers.get('content-type') || ''
    let id_token = ''

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const body = await req.text()
      const params = new URLSearchParams(body)
      id_token = params.get('id_token') || ''
    } else if (contentType.includes('application/json')) {
      const body = await req.json()
      id_token = body.id_token || ''
    }

    if (!id_token) {
      return Response.redirect('https://checkrezerve.com/auth/callback?error=no_token', 302)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: id_token,
    })

    if (error || !data.session) {
      console.error('signInWithIdToken error:', JSON.stringify(error))
      return Response.redirect('https://checkrezerve.com/auth/callback?error=apple_auth_failed', 302)
    }

    const { access_token, refresh_token } = data.session

    return Response.redirect(
      `https://checkrezerve.com/auth/callback#access_token=${access_token}&refresh_token=${refresh_token}&token_type=bearer`,
      302
    )
  } catch (err) {
    console.error('Edge function error:', err)
    return Response.redirect('https://checkrezerve.com/auth/callback?error=server_error', 302)
  }
})
