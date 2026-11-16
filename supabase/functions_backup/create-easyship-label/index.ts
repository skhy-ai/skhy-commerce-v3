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
      orderId,
      destination_name,
      destination_address_line_1,
      destination_address_line_2,
      destination_city,
      destination_state,
      destination_postal_code,
      destination_country_alpha2,
      destination_phone_number,
      items, // [{ quantity, actual_weight, length, width, height, category, declared_currency, declared_customs_value, description }]
      selected_courier_id
    } = await req.json()

    const apiKey = Deno.env.get('EASYSHIP_API_KEY')
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Easyship API key not configured' }), { status: 400, headers: corsHeaders })
    }

    // Default origin for the company
    const origin_country_alpha2 = 'SG'
    // Origin details (should be in env or site_config)
    const origin_details = {
        line_1: 'Skhy AI Hub',
        city: 'Singapore',
        state: 'Singapore',
        postal_code: '123456',
        contact_name: 'Skhy AI Operations',
        contact_phone: '+6512345678',
        contact_email: 'ops@skhyai.com'
    }

    // Step 1: Create Shipment
    const shipmentResponse = await fetch('https://api.easyship.com/v2/shipments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platform_order_number: orderId,
        origin_country_alpha2,
        origin_address_line_1: origin_details.line_1,
        origin_city: origin_details.city,
        origin_state: origin_details.state,
        origin_postal_code: origin_details.postal_code,
        origin_contact_name: origin_details.contact_name,
        origin_contact_phone: origin_details.contact_phone,
        origin_contact_email: origin_details.contact_email,
        destination_country_alpha2,
        destination_name,
        destination_address_line_1,
        destination_address_line_2,
        destination_city,
        destination_state,
        destination_postal_code,
        destination_contact_name: destination_name,
        destination_contact_phone: destination_phone_number,
        items,
        selected_courier_id,
        incoterms: 'DDU',
        insurance: { is_insured: false },
        shipping_settings: {
            units: { weight: 'kg', dimensions: 'cm' }
        }
      }),
    })

    if (!shipmentResponse.ok) {
      const errorText = await shipmentResponse.text()
      throw new Error(`Easyship shipment creation failed: ${errorText}`)
    }

    const shipmentData = await shipmentResponse.json()
    const shipmentId = shipmentData.shipment.easyship_shipment_id

    // Step 2: Buy Label (Optional, depends if selected_courier_id is present)
    let labelData = null
    if (selected_courier_id) {
        const buyResponse = await fetch(`https://api.easyship.com/v2/shipments/${shipmentId}/buy`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                courier_id: selected_courier_id
            })
        })

        if (!buyResponse.ok) {
            const errorText = await buyResponse.text()
            console.error(`Easyship buy label failed: ${errorText}`)
        } else {
            labelData = await buyResponse.json()
        }
    }

    return new Response(
      JSON.stringify({ 
        shipment_id: shipmentId, 
        label: labelData?.label || null,
        tracking_number: labelData?.shipment?.tracking_number || null
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
