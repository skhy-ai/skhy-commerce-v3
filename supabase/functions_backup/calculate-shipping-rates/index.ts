import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      destination_country_alpha2, 
      destination_postal_code, 
      items // [{ quantity, actual_weight, length, width, height, category, declared_currency, declared_customs_value }]
    } = await req.json()

    const apiKey = Deno.env.get('EASYSHIP_API_KEY')
    if (!apiKey) {
      throw new Error('Easyship API key not configured')
    }

    // Default origin for the company
    const origin_country_alpha2 = 'SG' // Singapore as primary warehouse location

    const response = await fetch('https://api.easyship.com/v2/rates', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin_country_alpha2,
        destination_country_alpha2,
        destination_postal_code,
        items,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Easyship API error: ${errorText}`)
    }

    const data = await response.json()

    // Easyship returns rates in 'rates' array
    return new Response(
      JSON.stringify(data.rates || []),
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
