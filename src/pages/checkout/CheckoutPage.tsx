import { CheckoutAddressSchema } from '../../schemas/validation';
import { z } from 'zod';
import React, { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, CreditCard, ShieldCheck, AlertTriangle, Banknote, Info, Wallet } from 'lucide-react';
import { Address } from '../../types/checkout';
import { sendOrderConfirmationEmail } from '../../services/EmailService';
import { formatMoney, convertCurrency } from '../../utils/geoCurrency';
import { OptimizedImage } from '../../components/common/OptimizedImage';
import { calculateDHLShippingMYR, getDHLZone } from '../../utils/dhlCalculator';
import { COUNTRIES } from '../../data/countries';
import { CryptoPaymentForm } from './CryptoPaymentForm';
import { fetchCheckoutShippingRates } from '../../services/shippingService';
import { getPaymentGatewaysConfig } from '../../services/paymentConfigService';
import { AllPaymentGatewaysConfig } from '../../types/payment';

// Steps: 1. Address, 2. Shipping, 3. Payment
type CheckoutStep = 'address' | 'shipping' | 'payment';

// Initialize Stripe
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from './PaymentForm';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// RazorPay SDK injection (conditional for India domestic)
const loadRazorpay = (): Promise<void> => {
    return new Promise((resolve) => {
        if ((window as any).Razorpay) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
    });
};

// Replace with your actual publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export const CheckoutPage: React.FC = () => {
    const { items, cartTotal, clearCart, currency } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState<CheckoutStep>('address');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [zodErrors, setZodErrors] = useState<Record<string, string>>({});

    // Configuration
    const [platformFeePercent, setPlatformFeePercent] = useState(3.8);
    const [swiftDetails, setSwiftDetails] = useState<any>(null);

    // Form State
    const [address, setAddress] = useState<Address>({
        name: user?.user_metadata?.full_name || '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: user?.user_metadata?.country || '',
        phone: ''
    });

    const [easyshipRates, setEasyshipRates] = useState<any[]>([]);
    const [selectedRate, setSelectedRate] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'razorpay' | 'bank_transfer' | 'crypto'>('card');
    const [paymentGateways, setPaymentGateways] = useState<AllPaymentGatewaysConfig | null>(null);
    const [orderNote, setOrderNote] = useState('');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const isIndianDomestic = address.country?.toLowerCase() === 'india' || address.country?.toLowerCase() === 'in';
    const [paypalClientId, setPaypalClientId] = useState<string | null>(null);

    const totalWeight = items.reduce((acc, item) => acc + (item.quantity * (item.product?.weight_kg || 0.5)), 0);

    const [previewDHLZone, setPreviewDHLZone] = useState<number | null>(null);
    const [previewDHLRate, setPreviewDHLRate] = useState<number | null>(null);

    useEffect(() => {
        if (address.country) {
            const countryCode = address.country_code || (address.country.length === 2 ? address.country : 'MY');
            const zone = getDHLZone(countryCode);
            setPreviewDHLZone(zone);
            
            const rate = calculateDHLShippingMYR({
                destinationCountryCode: countryCode, 
                actualWeightKg: totalWeight,
                isDocument: false
            });
            setPreviewDHLRate(rate);
        } else {
            setPreviewDHLZone(null);
            setPreviewDHLRate(null);
        }
    }, [address.country, address.country_code, items]);

    useEffect(() => {
        fetchSystemConfig();
    }, []);

    const fetchSystemConfig = async () => {
        try {
            // Fetch platform fee from public site_config table
            const { data: feeData } = await supabase
                .from('site_config')
                .select('content')
                .eq('section', 'platform_fee_percent')
                .maybeSingle();

            if (feeData?.content) {
                // Handle both direct number and string representation
                const rawVal = feeData.content;
                const parsed = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal);
                if (!isNaN(parsed)) {
                    setPlatformFeePercent(parsed);
                }
            }

            // Fetch SWIFT details via Edge Function for security
            // This prevents exposing system_config to clients
            if (paymentMethod === 'bank_transfer') {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { data: swiftData } = await supabase.functions.invoke('get-bank-transfer-details', {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`
                        }
                    });
                    if (swiftData) {
                        setSwiftDetails(swiftData);
                    }
                }
            }

            // Fetch PayPal config
            const { data: paypalData } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'paypal_config')
                .maybeSingle();

            if (paypalData?.value?.client_id) {
                setPaypalClientId(paypalData.value.client_id);
            }

            // Fetch Comprehensive Payment Gateways Config (Stripe, PayPal, Crypto, SWIFT)
            const gateways = await getPaymentGatewaysConfig();
            setPaymentGateways(gateways);
            if (gateways?.paypal?.clientId && !paypalClientId) {
                setPaypalClientId(gateways.paypal.clientId);
            }
        } catch (err) {
            console.error('Failed to fetch config:', err);
        }
    };

    // Redirect if cart empty
    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
                <button onClick={() => navigate('/marketplace')} className="text-blue-400 hover:text-blue-300">Return to Marketplace</button>
            </div>
        );
    }

    const checkRestrictions = async () => {
        setError(null);
        // Gather seller IDs
        const sellerIds = Array.from(new Set(items.map(item => item.product?.user_id).filter(Boolean)));

        if (sellerIds.length === 0) return true;

        try {
            const { data: sellers } = await supabase
                .from('users')
                .select('user_id, company_name, restricted_countries')
                .in('user_id', sellerIds);

            if (!sellers) return true;

            const country = address.country.trim().toLowerCase();

            for (const seller of sellers) {
                if (seller.restricted_countries && Array.isArray(seller.restricted_countries)) {
                    const restricted = seller.restricted_countries.map((c: string) => c.toLowerCase());
                    if (restricted.includes(country)) {
                        setError(`One or more items in your cart cannot be shipped to ${address.country} due to seller (${seller.company_name}) restrictions.`);
                        return false;
                    }
                }
            }
            return true;
        } catch (err) {
            console.error('Error checking restrictions:', err);
            return true;
        }
    };

    const fetchShippingRates = async () => {
        setLoading(true);
        setError(null);
        try {
            let calculatedRates: any[] = [];

            try {
                const { data, error } = await supabase.functions.invoke('calculate-shipping-rates', {
                    body: {
                        destination_country_alpha2: address.country_code || 'US', // Assuming country_code exists or derived
                        destination_postal_code: address.postal_code,
                        items: items.map(item => ({
                            quantity: item.quantity,
                            actual_weight: 0.5, // Mock weights if not in DB
                            length: 10,
                            width: 10,
                            height: 5,
                            category: 'electronics',
                            declared_currency: currency,
                            declared_customs_value: item.unit_price
                        }))
                    }
                });
                if (!error && data) {
                    calculatedRates = [...data];
                }
            } catch (err) {
                console.warn('EasyShip rate fetch failed, continuing with fallback rates:', err);
            }
            
            try {
                // Determine destination ISO Alpha-2 code
                const countryCode = address.country_code || (address.country.length === 2 ? address.country : 'MY');
                
                // Fetch dynamic carrier quotes for DHL, UPS, and ParcelHub
                const carrierQuotes = await fetchCheckoutShippingRates({
                    destinationCountryCode: countryCode,
                    actualWeightKg: totalWeight,
                    lengthCm: 10,
                    widthCm: 10,
                    heightCm: 10
                });

                carrierQuotes.forEach(q => {
                    const converted = convertCurrency(q.rateUSD, 'USD', currency);
                    calculatedRates.push({
                        courier_id: q.id,
                        courier_name: `${q.carrierName} - ${q.serviceName}`,
                        min_delivery_time: parseInt(q.estimatedDays.split(' ')[0]) || 2,
                        max_delivery_time: parseInt(q.estimatedDays.split(' ')[2]) || 5,
                        total_charge: converted,
                        description: q.description
                    });
                });
            } catch(e) {
                console.error("Carrier rates calculation error", e);
            }

            calculatedRates.push({
                courier_id: 'custom_shipping',
                courier_name: 'Use Your Own Shipping Account',
                min_delivery_time: null,
                max_delivery_time: null,
                total_charge: 0,
                description: 'Provide your own courier account details after checkout'
            });

            if (calculatedRates.length === 0) {
                throw new Error("No shipping options available.");
            }

            setEasyshipRates(calculatedRates);
        } catch (err) {
            console.error('Error fetching shipping rates:', err);
            setError('Failed to fetch shipping rates. Please check your address.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setZodErrors({});

        // Validate Address
        try {
            CheckoutAddressSchema.parse(address);
        } catch (err) {
            if (err instanceof z.ZodError) {
                const fieldErrors: any = {};
                (err as any).errors.forEach((e: any) => {
                    const field = e.path[0];
                    if (field) fieldErrors[field] = e.message;
                });
                setZodErrors(fieldErrors);
                return;
            }
        }

        setLoading(true);
        const allowed = await checkRestrictions();
        if (allowed) {
            await fetchShippingRates();
            setStep('shipping');
        }
        setLoading(false);
    };

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRate) {
            setError('Please select a shipping method');
            return;
        }
        setStep('payment');
    };

    // Calculate financials
    const shippingCost = selectedRate?.total_charge || 0;
    const platformFee = items.reduce((sum, item) => {
        const seller = item.product?.seller_name?.toLowerCase() || '';
        const isSkhy = seller.includes('skhy') && !seller.includes('partner network');
        if (isSkhy) return sum;

        const itemCurrency = item.product?.currency || 'USD';
        const itemPrice = item.unit_price || 0;
        const convertedPrice = convertCurrency(itemPrice, itemCurrency, currency);

        return sum + (convertedPrice * item.quantity * platformFeePercent) / 100;
    }, 0);
    const total = cartTotal + shippingCost + platformFee;

    const handlePaymentSubmit = async () => {
        // Legacy/Bank Transfer Submit Handler
        if (!user) {
            const returnUrl = encodeURIComponent('/checkout');
            navigate(`/login?redirect=${returnUrl}`);
            return;
        }

        setLoading(true);
        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: user.id,
                    total_amount: total,
                    status: 'pending',
                    shipping_address: address, // Store as JSONB
                    shipping_amount: shippingCost,
                    tax_amount: platformFee,
                    notes: orderNote,
                    shipping_method: selectedRate?.courier_name || 'Standard',
                    payment_method: paymentMethod,
                    shipping_courier_id: selectedRate?.courier_id
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = items.map(item => {
                const itemBasePrice = item.product?.base_price || 0;
                const itemCurrency = item.product?.currency || 'USD';
                const convertedUnitPrice = convertCurrency(itemBasePrice, itemCurrency, currency);

                return {
                    order_id: order.id,
                    product_id: typeof item.product_id === 'number' ? item.product_id : null,
                    product_name: item.product?.name || 'Unknown Product',
                    quantity: item.quantity,
                    unit_price: convertedUnitPrice,
                    total_price: convertedUnitPrice * item.quantity,
                    product_metadata: { 
                        seller_id: item.product?.user_id, 
                        currency: currency, 
                        is_virtual: typeof item.product_id === 'string',
                        original_id: item.product_id
                    }
                };
            });

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            // 3. Create Payment Record
            const { error: paymentError } = await supabase.from('payments').insert({
                order_id: order.id,
                amount: total,
                status: paymentMethod === 'bank_transfer' ? 'pending' : 'successful', // Mock success for card
                payment_method: paymentMethod
            });

            if (paymentError) console.error('Payment record error:', paymentError);

            if (order) {
                await sendOrderConfirmationEmail(order, user.email || '');
            }

            await new Promise(resolve => setTimeout(resolve, 1500)); // Sim processing

            await clearCart();
            // Pass state to success page if needed, or just navigate
            navigate('/checkout/success', { state: { orderId: order.id } });

        } catch (err) {
            console.error(err);
            alert('Order creation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStripeSuccess = async (paymentIntentId: string) => {
        // Handle post-payment success for Stripe
        if (!user) return;

        setLoading(true);
        try {
            // 1. Create Order (Status: paid)
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: user.id,
                    total_amount: total,
                    status: 'paid', // Confirmed via Stripe
                    shipping_address: address,
                    shipping_amount: shippingCost,
                    tax_amount: platformFee,
                    notes: orderNote,
                    shipping_method: selectedRate?.courier_name || 'Standard',
                    payment_method: 'card',
                    payment_intent_id: paymentIntentId,
                    shipping_courier_id: selectedRate?.courier_id
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = items.map(item => {
                const itemBasePrice = item.product?.base_price || 0;
                const itemCurrency = item.product?.currency || 'USD';
                const convertedUnitPrice = convertCurrency(itemBasePrice, itemCurrency, currency);

                return {
                    order_id: order.id,
                    product_id: typeof item.product_id === 'number' ? item.product_id : null,
                    product_name: item.product?.name || 'Unknown Product',
                    quantity: item.quantity,
                    unit_price: convertedUnitPrice,
                    total_price: convertedUnitPrice * item.quantity,
                    product_metadata: { 
                        seller_id: item.product?.user_id, 
                        currency: currency,
                        is_virtual: typeof item.product_id === 'string',
                        original_id: item.product_id
                    }
                };
            });

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            // 3. Create Payment Record
            const { error: paymentError } = await supabase.from('payments').insert({
                order_id: order.id,
                amount: total,
                status: 'successful',
                payment_method: 'card',
                transaction_id: paymentIntentId
            });
            if (paymentError) console.error('Payment record error:', paymentError);

            if (order) {
                await sendOrderConfirmationEmail(order, user.email || '');
            }

            await clearCart();
            // Trigger Easyship Label Generation
            await triggerEasyshipLabel(order.id);
            navigate('/checkout/success', { state: { orderId: order.id } });

        } catch (err) {
            console.error(err);
            alert('Order creation failed after payment. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    const handleCryptoSuccess = async (details: { txHash: string; network: string; token: string; amount: number }) => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    buyer_id: user.id,
                    total_amount: total,
                    status: 'paid',
                    shipping_address: address,
                    shipping_amount: shippingCost,
                    tax_amount: platformFee,
                    notes: `Paid via Crypto Wallet (${details.token} on ${details.network.toUpperCase()}). TxHash: ${details.txHash}. ${orderNote}`,
                    shipping_method: selectedRate?.courier_name || 'Standard Courier',
                    payment_method: 'crypto',
                    payment_intent_id: details.txHash,
                    shipping_courier_id: selectedRate?.courier_id
                })
                .select()
                .single();

            if (orderError) throw orderError;

            const orderItems = items.map(item => {
                const itemBasePrice = item.product?.base_price || 0;
                const itemCurrency = item.product?.currency || 'USD';
                const convertedUnitPrice = convertCurrency(itemBasePrice, itemCurrency, currency);

                return {
                    order_id: order.id,
                    product_id: typeof item.product_id === 'number' ? item.product_id : null,
                    product_name: item.product?.name || 'Unknown Product',
                    quantity: item.quantity,
                    unit_price: convertedUnitPrice,
                    total_price: convertedUnitPrice * item.quantity,
                    product_metadata: { 
                        seller_id: item.product?.user_id, 
                        currency: currency, 
                        is_virtual: typeof item.product_id === 'string',
                        original_id: item.product_id,
                        crypto: details
                    }
                };
            });

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            await supabase.from('payments').insert({
                order_id: order.id,
                amount: total,
                status: 'successful',
                payment_method: 'crypto',
                transaction_id: details.txHash
            });

            if (order) {
                await sendOrderConfirmationEmail(order, user.email || '');
            }

            await clearCart();
            navigate('/checkout/success', { state: { orderId: order.id } });
        } catch (err) {
            console.error(err);
            alert('Crypto order creation failed. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    // PayPal Handlers
    const handlePayPalCreateOrder = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('create-paypal-order', {
                body: { 
                    amount: total,
                    currency: currency.toUpperCase()
                }
            });

            if (error) throw error;
            return data.orderID;
        } catch (err) {
            console.error('PayPal create order error:', err);
            setError('Failed to initiate PayPal payment.');
            throw err;
        }
    };

    const handlePayPalApprove = async (data: any) => {
        setLoading(true);
        try {
            const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-order', {
                body: { 
                    orderID: data.orderID,
                    cartItems: items.map(item => ({
                        id: item.product_id,
                        name: item.product?.name,
                        price: convertCurrency(item.product?.base_price || 0, item.product?.currency || 'USD', currency),
                        quantity: item.quantity,
                        seller_id: item.product?.user_id
                    })),
                    shippingAddress: address,
                    billingAddress: address,
                    userId: user?.id,
                    currency: currency,
                    totalAmount: total,
                    shippingCost: selectedRate?.total_charge || 0,
                    taxAmount: platformFee,
                    notes: orderNote,
                    shippingMethod: selectedRate?.courier_name || 'Standard',
                    shippingCourierId: selectedRate?.courier_id
                }
            });

            if (error) throw error;

            if (captureData.success) {
                await clearCart();
                // Send confirmation email
                const { data: order } = await supabase.from('orders').select('*').eq('id', captureData.orderId).single();
                if (order && user) {
                    await sendOrderConfirmationEmail(order, user.email || '');
                    await triggerEasyshipLabel(order.id);
                }
                navigate('/checkout/success', { state: { orderId: captureData.orderId } });
            }
        } catch (err) {
            console.error('PayPal capture error:', err);
            setError('Payment captured by PayPal but failed to update order. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Client Secret when entering Payment Step
    useEffect(() => {
        if (step === 'payment') {
            const initializePayment = async () => {
                setLoading(true);
                setError(null);
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) return;

                    // Initialize Stripe for card payments
                    if (paymentMethod === 'card' && !clientSecret) {
                        const { data, error: stripeError } = await supabase.functions.invoke('create-payment-intent', {
                            body: { amount: total, currency: currency.toLowerCase() },
                            headers: { Authorization: `Bearer ${session.access_token}` }
                        });
                        if (stripeError) throw stripeError;
                        if (data?.clientSecret) setClientSecret(data.clientSecret);
                    }

                    // Preload RazorPay SDK if India domestic
                    if (paymentMethod === 'razorpay') {
                        await loadRazorpay();
                    }
                } catch (err) {
                    console.error('Error initializing payment:', err);
                    setError('Failed to initialize payment system. Please try again.');
                } finally {
                    setLoading(false);
                }
            };
            initializePayment();
        }
    }, [step, paymentMethod, total, currency]);

    const triggerEasyshipLabel = async (orderId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await supabase.functions.invoke('create-easyship-label', {
                body: {
                    orderId,
                    destination_name: address.name,
                    destination_address_line_1: address.line1,
                    destination_address_line_2: address.line2,
                    destination_city: address.city,
                    destination_state: address.state,
                    destination_postal_code: address.postal_code,
                    destination_country_alpha2: address.country_code || 'US',
                    destination_phone_number: address.phone,
                    items: items.map(item => ({
                        description: item.product?.name,
                        quantity: item.quantity,
                        actual_weight: 0.5,
                        length: 10,
                        width: 10,
                        height: 5,
                        category: 'electronics',
                        declared_currency: currency,
                        declared_customs_value: item.unit_price
                    })),
                    selected_courier_id: selectedRate?.courier_id
                },
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
        } catch (err) {
            console.error('Failed to trigger Easyship label:', err);
        }
    };

    const handleRazorpayPayment = async () => {
        if (!user) return;
        await loadRazorpay();

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Create RazorPay order via Edge Function
            const { data: orderData, error: rpError } = await supabase.functions.invoke('create-razorpay-order', {
                body: { amount: total, currency: 'INR' },
                headers: { Authorization: `Bearer ${session.access_token}` }
            });
            if (rpError) throw rpError;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount: orderData?.amount,
                currency: 'INR',
                name: 'SKHY AI',
                description: `Order Payment`,
                order_id: orderData?.id,
                handler: async () => {
                    // Payment successful — create order
                    await handlePaymentSubmit();
                },
                prefill: {
                    name: address.name,
                    email: user.email || '',
                    contact: address.phone || '',
                },
                theme: { color: '#0284c7' },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('RazorPay error:', err);
            setError('RazorPay payment failed. Please try an alternative method.');
            setPaymentMethod('card');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Steps */}
            <div className="lg:col-span-8 space-y-6">

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="text-red-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Step 1: Address */}
                <div className={`bg-gray-800 rounded-xl p-6 border ${step === 'address' ? 'border-blue-500' : 'border-gray-700'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'address' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>1</div>
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5" /> Shipping Address
                        </h2>
                    </div>

                    {step === 'address' ? (
                        <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1">
                                <input required placeholder="Full Name" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white ${zodErrors.name ? 'border-red-500' : 'border-gray-700'}`} />
                                {zodErrors.name && <p className="text-red-400 text-xs pl-1">{zodErrors.name}</p>}
                            </div>
                            <div className="col-span-2 space-y-1">
                                <input required placeholder="Address Line 1" value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white ${zodErrors.line1 ? 'border-red-500' : 'border-gray-700'}`} />
                                {zodErrors.line1 && <p className="text-red-400 text-xs pl-1">{zodErrors.line1}</p>}
                            </div>
                            <input placeholder="Apt, Suite, etc (Optional)" value={address.line2} onChange={e => setAddress({ ...address, line2: e.target.value })} className="col-span-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                            <div className="space-y-1">
                                <input required placeholder="City" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white ${zodErrors.city ? 'border-red-500' : 'border-gray-700'}`} />
                                {zodErrors.city && <p className="text-red-400 text-xs pl-1">{zodErrors.city}</p>}
                            </div>
                            <input required placeholder="State / Province" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white" />
                            <div className="space-y-1">
                                <input required placeholder="Postal Code" value={address.postal_code} onChange={e => setAddress({ ...address, postal_code: e.target.value })} className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white ${zodErrors.postal_code ? 'border-red-500' : 'border-gray-700'}`} />
                                {zodErrors.postal_code && <p className="text-red-400 text-xs pl-1">{zodErrors.postal_code}</p>}
                            </div>
                            <div className="col-span-2 space-y-1">
                                <select 
                                    required 
                                    value={address.country_code || ''} 
                                    onChange={e => {
                                        const code = e.target.value;
                                        const name = COUNTRIES.find(c => c.code === code)?.name || '';
                                        setAddress({ ...address, country_code: code, country: name });
                                    }} 
                                    className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white ${zodErrors.country ? 'border-red-500' : 'border-gray-700'}`}
                                >
                                    <option value="" disabled>Select Country</option>
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                                {zodErrors.country && <p className="text-red-400 text-xs pl-1">{zodErrors.country}</p>}
                            </div>
                            
                            {previewDHLZone && previewDHLRate && (
                                <div className="col-span-2 text-sm text-blue-300 bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 flex flex-col gap-1">
                                    <div className="flex items-center">
                                        <Truck className="w-4 h-4 mr-2" />
                                        <span>Identified <strong>DHL Zone {previewDHLZone}</strong>. Estimated Express Rate: <strong>{formatMoney(convertCurrency(previewDHLRate, 'MYR', currency), currency)}</strong></span>
                                    </div>
                                    <div className="ml-6 text-xs text-blue-400 opacity-80">
                                        Calculated for {totalWeight.toFixed(2)} kg (Dimensions: 10x10x10 cm)
                                    </div>
                                </div>
                            )}
                            <button type="submit" disabled={loading} className="col-span-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex justify-center">
                                {loading ? 'Checking Restrictions...' : 'Continue to Shipping'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-gray-400 pl-11">
                            <p>{address.name}</p>
                            <p>{address.line1}, {address.city}, {address.country}</p>
                            <button onClick={() => setStep('address')} className="text-blue-400 text-sm mt-2 hover:underline">Edit</button>
                        </div>
                    )}
                </div>

                {/* Step 2: Shipping */}
                <div className={`bg-gray-800 rounded-xl p-6 border ${step === 'shipping' ? 'border-blue-500' : 'border-gray-700'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'shipping' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>2</div>
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Truck className="w-5 h-5" /> Shipping Method
                        </h2>
                    </div>
                    {step === 'shipping' && (
                        <div className="space-y-3">
                            <div className="bg-gray-700/30 p-3 rounded-lg text-sm text-gray-300 flex items-center gap-2 mb-4">
                                <Info className="w-4 h-4 text-blue-400" />
                                <span>Package weight: <strong>{totalWeight.toFixed(2)} kg</strong> | Dimensions: <strong>10x10x10 cm</strong></span>
                            </div>
                            {easyshipRates.length > 0 ? (
                                easyshipRates.map((rate: any) => (
                                    <label key={rate.courier_id} className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-700 transition ${selectedRate?.courier_id === rate.courier_id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="shipping" checked={selectedRate?.courier_id === rate.courier_id} onChange={() => setSelectedRate(rate)} className="text-blue-500" />
                                            <div>
                                                <p className="font-medium text-white">{rate.courier_name}</p>
                                                <p className="text-sm text-gray-400">{rate.min_delivery_time}-{rate.max_delivery_time} Business Days</p>
                                            </div>
                                        </div>
                                        <span className="text-white font-medium">{formatMoney(rate.total_charge, currency)}</span>
                                    </label>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    {loading ? 'Fetching live rates from Easyship...' : 'No shipping methods available for this address.'}
                                </div>
                            )}
                            <button onClick={handleShippingSubmit} disabled={!selectedRate || loading} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:bg-gray-600">
                                Continue to Payment
                            </button>
                        </div>
                    )}
                </div>

                {/* Step 3: Payment */}
                <div className={`bg-gray-800 rounded-xl p-6 border ${step === 'payment' ? 'border-blue-500' : 'border-gray-700'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 'payment' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>3</div>
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Payment
                        </h2>
                    </div>
                    {step === 'payment' && (
                        <div className="space-y-6">

                            {/* Payment Method Toggle */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`p-3.5 border rounded-lg flex flex-col items-center gap-1.5 ${paymentMethod === 'card' ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <CreditCard className={paymentMethod === 'card' ? 'text-cyan-400' : 'text-gray-400'} />
                                    <span className={`text-xs ${paymentMethod === 'card' ? 'text-white font-bold' : 'text-gray-400'}`}>Card (Stripe)</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('paypal')}
                                    className={`p-3.5 border rounded-lg flex flex-col items-center gap-1.5 ${paymentMethod === 'paypal' ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <Banknote className={paymentMethod === 'paypal' ? 'text-cyan-400' : 'text-gray-400'} />
                                    <span className={`text-xs ${paymentMethod === 'paypal' ? 'text-white font-bold' : 'text-gray-400'}`}>PayPal</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('crypto')}
                                    className={`p-3.5 border rounded-lg flex flex-col items-center gap-1.5 ${paymentMethod === 'crypto' ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <Wallet className={paymentMethod === 'crypto' ? 'text-cyan-400' : 'text-gray-400'} />
                                    <span className={`text-xs ${paymentMethod === 'crypto' ? 'text-white font-bold' : 'text-gray-400'}`}>Crypto Wallet</span>
                                </button>
                                {isIndianDomestic && (
                                    <button
                                        onClick={() => setPaymentMethod('razorpay')}
                                        className={`p-3.5 border rounded-lg flex flex-col items-center gap-1.5 ${paymentMethod === 'razorpay' ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                                    >
                                        <CreditCard className={paymentMethod === 'razorpay' ? 'text-cyan-400' : 'text-gray-400'} />
                                        <span className={`text-xs ${paymentMethod === 'razorpay' ? 'text-white font-bold' : 'text-gray-400'}`}>RazorPay</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setPaymentMethod('bank_transfer')}
                                    className={`p-3.5 border rounded-lg flex flex-col items-center gap-1.5 ${paymentMethod === 'bank_transfer' ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-700 bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <Banknote className={paymentMethod === 'bank_transfer' ? 'text-cyan-400' : 'text-gray-400'} />
                                    <span className={`text-xs ${paymentMethod === 'bank_transfer' ? 'text-white font-bold' : 'text-gray-400'}`}>SWIFT Wire</span>
                                </button>
                            </div>

                            <div className="p-4 border border-blue-500/30 bg-blue-500/10 rounded-lg">
                                <p className="text-sm text-blue-300">
                                    <ShieldCheck className="inline w-4 h-4 mr-1" />
                                    Transactions are secure and encrypted.
                                    {paymentMethod === 'card' && ' Stripe processing fees may apply.'}
                                </p>
                            </div>

                            {paymentMethod === 'card' ? (
                                <div className="bg-white p-4 rounded-md">
                                    {clientSecret && (
                                        <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                                            <PaymentForm
                                                amount={total}
                                                currency={currency}
                                                onSuccess={handleStripeSuccess}
                                            />
                                        </Elements>
                                    )}
                                    {!clientSecret && loading && (
                                        <div className="flex gap-2 justify-center py-8">
                                            <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                    )}
                                    {!clientSecret && !loading && error && (
                                        <div className="text-red-500 text-center py-4">
                                            Unable to load payment form. Please try again.
                                        </div>
                                    )}
                                </div>
                            ) : paymentMethod === 'bank_transfer' ? (
                                <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-600">
                                    <h4 className="text-white font-semibold mb-4">Bank Transfer Details</h4>
                                    <div className="space-y-2 text-sm text-gray-300">
                                        <div className="flex justify-between border-b border-gray-600 pb-2">
                                            <span>Bank Name:</span>
                                            <span className="text-white">{swiftDetails?.bank_name || 'Contact Support'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-600 pb-2">
                                            <span>Account Name:</span>
                                            <span className="text-white">{swiftDetails?.account_name || 'Contact Support'}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-600 pb-2">
                                            <span>SWIFT / BIC:</span>
                                            <span className="text-white font-mono">{swiftDetails?.swift_code || '---'}</span>
                                        </div>
                                        <div className="flex justify-between pb-2">
                                            <span>Account Number:</span>
                                            <span className="text-white font-mono">{swiftDetails?.account_number || '---'}</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded">
                                        <Info className="inline w-3 h-3 mr-1" />
                                        Please include your Order ID in the transfer description. Your order will be processed once funds are received.
                                    </p>
                                </div>
                            ) : paymentMethod === 'crypto' ? (
                                <CryptoPaymentForm
                                    amountUSD={convertCurrency(total, currency, 'USD')}
                                    currency={currency}
                                    config={paymentGateways?.crypto}
                                    onSuccess={handleCryptoSuccess}
                                />
                            ) : paymentMethod === 'paypal' && paypalClientId && (
                                <div className="space-y-4">
                                    <PayPalScriptProvider options={{ 
                                        "clientId": paypalClientId,
                                        currency: currency.toUpperCase(),
                                        intent: "capture"
                                    }}>
                                        <PayPalButtons 
                                            style={{ layout: "vertical" }}
                                            createOrder={handlePayPalCreateOrder}
                                            onApprove={handlePayPalApprove}
                                            onError={(err) => {
                                                console.error('PayPal Button Error:', err);
                                                setError('An error occurred with PayPal. Please try again.');
                                            }}
                                        />
                                    </PayPalScriptProvider>
                                </div>
                            )}

                            {/* Order Note */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Order Note (Optional)
                                </label>
                                <textarea
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                    placeholder="Special instructions or notes for the seller..."
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white resize-none h-24"
                                />
                            </div>

                            {paymentMethod !== 'paypal' && (
                                <button onClick={paymentMethod === 'razorpay' ? handleRazorpayPayment : handlePaymentSubmit} disabled={loading} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-green-900/20">
                                    {loading ? 'Processing...' : `Place Order - ${formatMoney(total, currency)}`}
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-24">
                    <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                    <div className="space-y-4 mb-6">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-3">
                                <div className="h-16 w-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                    <OptimizedImage
                                        src={item.product?.image_url || ''}
                                        fallbackSrc={item.product?.fallback_url}
                                        alt={item.product?.name || 'Product'}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white text-sm line-clamp-2">{item.product?.name}</p>
                                    <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                                    <p className="text-gray-400 text-xs mt-0.5">
                                        Weight: {(item.product?.weight_kg || 0.5).toFixed(2)} kg 
                                        {item.product?.dimensions ? ` | Dim: ${item.product.dimensions}` : ' | Dim: 10x10x10 cm'}
                                    </p>
                                </div>
                                <p className="text-white font-medium">
                                    {formatMoney(
                                        convertCurrency(item.unit_price || 0, item.product?.currency || 'USD', currency) * item.quantity,
                                        currency
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-700 pt-4 space-y-2">
                        <div className="flex justify-between text-gray-400">
                            <span>Subtotal</span>
                            <span>{formatMoney(cartTotal, currency)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Total Weight</span>
                            <span>{totalWeight.toFixed(2)} kg</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Shipping</span>
                            <span>{selectedRate ? formatMoney(selectedRate.total_charge, currency) : '---'}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-700 mt-2">
                            <span>Total</span>
                            <span>{formatMoney(total, currency)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
