import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getPayPalAccessToken(clientId: string, secretKey: string, mode: string) {
  const auth = btoa(`${clientId}:${secretKey}`)
  const baseUrl = mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      orderID, cartItems, shippingAddress, billingAddress, userId,
      currency = 'USD', totalAmount, shippingCost, taxAmount, notes,
      shippingMethod, shippingCourierId
    } = await req.json()

    // Get PayPal config
    const { data: configData, error: configError } = await supabaseClient
      .from('system_config')
      .select('value')
      .eq('key', 'paypal_config')
      .single()

    if (configError || !configData) {
      throw new Error('PayPal configuration not found')
    }

    const { client_id, secret_key, mode } = configData.value
    const accessToken = await getPayPalAccessToken(client_id, secret_key, mode)
    const baseUrl = mode === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com'

    // Capture the order
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const captureData = await captureResponse.json()

    if (captureData.status !== 'COMPLETED') {
      throw new Error(`PayPal capture failed: ${captureData.status}`)
    }

    // Now create the order in our database
    // This part should be similar to how orders are created after Stripe success
    // For now, I'll return success and the frontend can handle the redirection or further updates
    // But ideally, we create the order here to avoid any frontend failures
    
    // Calculate total if not provided (fallback)
    const calculatedTotal = totalAmount || cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

    // Create Order record
    const { data: orderRecord, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        buyer_id: userId,
        status: 'paid', // Consistent with stripe
        total_amount: calculatedTotal,
        currency: currency,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        shipping_amount: shippingCost || 0,
        tax_amount: taxAmount || 0,
        notes: notes || '',
        shipping_method: shippingMethod || 'Standard',
        shipping_courier_id: shippingCourierId,
        payment_method: 'paypal',
        payment_intent_id: orderID,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create Order Items
    const orderItems = cartItems.map((item: any) => ({
      order_id: orderRecord.id,
      product_id: typeof item.id === 'number' ? item.id : null,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
      product_metadata: {
        seller_id: item.seller_id,
        currency: currency,
        is_virtual: typeof item.id === 'string',
        original_id: item.id
      }
    }))

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Create Payment record
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        order_id: orderRecord.id,
        amount: calculatedTotal,
        currency: currency,
        status: 'successful',
        payment_method: 'paypal',
        transaction_id: captureData.purchase_units[0].payments.captures[0].id,
        payment_metadata: captureData,
      })

    if (paymentError) throw paymentError

    return new Response(
      JSON.stringify({ success: true, orderId: orderRecord.id }),
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
