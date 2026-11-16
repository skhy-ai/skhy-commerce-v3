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
    const { order_id } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const wiseApiKey = Deno.env.get('WISE_API_KEY')
    const wiseProfileId = Deno.env.get('WISE_PROFILE_ID')

    if (!supabaseUrl || !supabaseKey || !wiseApiKey || !wiseProfileId) {
      throw new Error('Supabase or Wise credentials not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch Order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, seller_id')
      .eq('id', order_id)
      .single()

    if (orderError || !order) throw new Error('Order not found')

    // 2. Fetch Seller details (Wise account email)
    const { data: seller, error: sellerError } = await supabase
      .from('users')
      .select('email, company_name, wise_email')
      .eq('user_id', order.seller_id)
      .single()

    if (sellerError || !seller) throw new Error('Seller not found')

    // 3. Calculate payout (Total - Platform Fee)
    const payoutAmount = order.total_amount - (order.tax_amount || 0)
    const currency = order.currency || 'USD'

    // Step 1: Create Wise Quote
    const quoteResponse = await fetch('https://api.transferwise.com/v2/quotes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${wiseApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceCurrency: 'USD',
        targetCurrency: currency,
        sourceAmount: payoutAmount,
        profile: wiseProfileId
      }),
    })

    if (!quoteResponse.ok) {
        const errorText = await quoteResponse.text()
        throw new Error(`Wise Quote failed: ${errorText}`)
    }

    const quote = await quoteResponse.json()

    // Log the transfer
    console.log(`Initialized Wise payout for order ${order_id} to ${seller.company_name} (${seller.wise_email || seller.email}): ${payoutAmount} ${currency}`)

    return new Response(
      JSON.stringify({ 
        message: 'Wise transfer initialized', 
        quote_id: quote.id,
        payout_amount: payoutAmount,
        currency: currency,
        seller: seller.company_name,
        status: 'processing'
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
