import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('User not found')
    }

    const { amount, currency = 'USD', orderId } = await req.json()

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount')
    }

    const apiKey = Deno.env.get('AIRWALLEX_API_KEY')
    const clientId = Deno.env.get('AIRWALLEX_CLIENT_ID')

    if (!apiKey || !clientId) {
      throw new Error('Airwallex credentials not configured')
    }

    // Step 1: Login to Airwallex to get token
    const loginResponse = await fetch('https://api.airwallex.com/api/v1/authentication/login', {
      method: 'POST',
      headers: {
        'x-client-id': clientId,
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    })

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text()
      throw new Error(`Airwallex login failed: ${errorText}`)
    }

    const { token } = await loginResponse.json()

    // Step 2: Create Payment Intent
    const intentResponse = await fetch('https://api.airwallex.com/api/v1/pa/payment_intents/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_id: crypto.randomUUID(),
        amount: amount,
        currency: currency,
        merchant_order_id: orderId || `SKHY-${Date.now()}`,
        // Airwallex will determine local payment methods based on IP/Country
        payment_method_options: {
          card: {
            three_ds: {
              enforce_3ds: true,
            },
          },
        },
      }),
    })

    if (!intentResponse.ok) {
      const errorText = await intentResponse.text()
      throw new Error(`Airwallex intent creation failed: ${errorText}`)
    }

    const intentData = await intentResponse.json()

    return new Response(
      JSON.stringify({ 
        client_secret: intentData.client_secret,
        intent_id: intentData.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
