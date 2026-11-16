import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { CreditCard, Building, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PartnerPaymentInfo } from '../../types/partner';
import { handleError, ErrorContexts } from '../../utils/ErrorHandler';
import { ErrorNotification } from '../ErrorNotification';

export interface PartnerPaymentSetupRef {
    save: () => Promise<void>;
}

interface PartnerPaymentSetupProps {
    onComplete?: () => void;
    hideSubmit?: boolean;
}

const PAYOUT_METHODS = [
    { id: 'bank_transfer', label: 'Bank Transfer (SWIFT)', icon: Building },
    { id: 'stripe', label: 'Stripe Connect', icon: CreditCard },
    { id: 'paypal', label: 'PayPal', icon: Globe }, // Use Globe for now, or specific icon if available
    { id: 'wise', label: 'Wise', icon: Globe },
    { id: 'crypto', label: 'Crypto (USDC)', icon: Globe } // Placeholder icon
] as const;

export const PartnerPaymentSetup = forwardRef<PartnerPaymentSetupRef, PartnerPaymentSetupProps>(({
    onComplete,
    hideSubmit = false
}, ref) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [data, setData] = useState<Partial<PartnerPaymentInfo>>({
        payout_method: 'bank_transfer',
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        swift_code: '',
        bank_country: '',
        bank_address: {
            street: '',
            city: '',
            state: '',
            postal_code: '',
            country: ''
        },
        paypal_email: '',
        wise_email: '',
        crypto_wallet_address: '',
        crypto_network: 'ETH'
    });

    useEffect(() => {
        loadPaymentInfo();
    }, []);

    const loadPaymentInfo = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: paymentInfo, error } = await supabase
                .from('partner_payment_info')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;

            if (paymentInfo) {
                setData(paymentInfo);
            }
        } catch (err) {
            console.log('No existing payment info found');
        }
    };

    const handleStripeConnect = async () => {
        // Simulation for now
        setLoading(true);
        setTimeout(() => {
            setData(prev => ({
                ...prev,
                stripe_account_id: 'acct_' + Math.random().toString(36).substr(2, 9),
                stripe_account_verified: true,
                payout_method: 'stripe'
            }));
            setLoading(false);
            alert('Stripe account connected successfully (Simulator)');
        }, 1500);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Validation based on method
            if (data.payout_method === 'bank_transfer') {
                if (!data.account_holder_name || !data.bank_name || !data.account_number || !data.swift_code || !data.bank_country) {
                    throw new Error('Please fill in all required bank details');
                }
            } else if (data.payout_method === 'stripe') {
                if (!data.stripe_account_id) {
                    throw new Error('Please connect your Stripe account');
                }
            } else if (data.payout_method === 'paypal') {
                if (!data.paypal_email) throw new Error('Please enter your PayPal email');
            } else if (data.payout_method === 'wise') {
                if (!data.wise_email) throw new Error('Please enter your Wise email');
            } else if (data.payout_method === 'crypto') {
                if (!data.crypto_wallet_address) throw new Error('Please enter your wallet address');
            }

            const paymentData = {
                ...data,
                user_id: user.id,
                updated_at: new Date().toISOString()
            };

            const { error: upsertError } = await supabase
                .from('partner_payment_info')
                .upsert(paymentData);

            if (upsertError) throw upsertError;

            if (onComplete) onComplete();
            if (!hideSubmit) alert('Payment information saved successfully!');
        } catch (err: any) {
            const errorInfo = handleError(err, ErrorContexts.PAYMENT_PROCESSING);
            setError(errorInfo);
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        save: () => handleSubmit()
    }));

    return (
        <div className="space-y-8">
            {error && (
                <ErrorNotification
                    error={error}
                    onClose={() => setError(null)}
                />
            )}

            {/* Method Selection Tabs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {PAYOUT_METHODS.map((method) => (
                    <button
                        key={method.id}
                        onClick={() => setData({ ...data, payout_method: method.id as any })}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${data.payout_method === method.id
                            ? 'bg-sky-600/20 border-sky-500 text-sky-400'
                            : 'bg-navy-800 border-navy-600 text-gray-400 hover:bg-navy-700'
                            }`}
                    >
                        <method.icon className="w-6 h-6 mb-2" />
                        <span className="text-xs font-medium text-center">{method.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-navy-800 p-6 rounded-lg border border-navy-600">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    Payment Details
                </h3>

                {/* BANK TRANSFER FORM */}
                {data.payout_method === 'bank_transfer' && (
                    <div className="space-y-6">
                        <p className="text-gray-400 text-sm">
                            Direct international wire transfer via SWIFT. Processed weekly.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Account Holder Name *</label>
                                <input
                                    type="text"
                                    value={data.account_holder_name}
                                    onChange={(e) => setData({ ...data, account_holder_name: e.target.value })}
                                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Bank Name *</label>
                                <input
                                    type="text"
                                    value={data.bank_name}
                                    onChange={(e) => setData({ ...data, bank_name: e.target.value })}
                                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Account Number / IBAN *</label>
                                <input
                                    type="text"
                                    value={data.account_number}
                                    onChange={(e) => setData({ ...data, account_number: e.target.value })}
                                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">SWIFT / BIC Code *</label>
                                <input
                                    type="text"
                                    value={data.swift_code}
                                    onChange={(e) => setData({ ...data, swift_code: e.target.value })}
                                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Bank Country *</label>
                                <input
                                    type="text"
                                    value={data.bank_country}
                                    onChange={(e) => setData({ ...data, bank_country: e.target.value })}
                                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                    placeholder="e.g., USA, UK, Singapore"
                                />
                            </div>
                        </div>

                        <div className="border-t border-navy-700 pt-6">
                            <h4 className="text-sm font-medium text-gray-300 mb-4">Bank Address (Optional but recommended)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Street</label>
                                    <input
                                        type="text"
                                        value={data.bank_address?.street || ''}
                                        onChange={(e) => setData({ ...data, bank_address: { ...(data.bank_address as any), street: e.target.value } })}
                                        className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={data.bank_address?.city || ''}
                                        onChange={(e) => setData({ ...data, bank_address: { ...(data.bank_address as any), city: e.target.value } })}
                                        className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STRIPE CONNECT */}
                {data.payout_method === 'stripe' && (
                    <div className="text-center py-8">
                        <div className="bg-white/5 p-6 rounded-xl inline-block mb-6">
                            <CreditCard className="w-16 h-16 text-sky-400 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-white mb-2">Stripe Connect</h4>
                            <p className="text-gray-400 max-w-sm mx-auto">
                                Automatically receive payouts to your debit card or bank account via Stripe.
                                Fastest processing times (often same-day).
                            </p>
                        </div>

                        {data.stripe_account_id ? (
                            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg flex items-center justify-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                                <div className="text-left">
                                    <p className="text-green-400 font-semibold">Account Connected</p>
                                    <p className="text-green-300/60 text-xs font-mono">ID: {data.stripe_account_id}</p>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleStripeConnect}
                                disabled={loading}
                                className="bg-[#635BFF] hover:bg-[#5851E1] text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-indigo-500/20"
                            >
                                {loading ? 'Connecting...' : 'Connect with Stripe'}
                            </button>
                        )}
                    </div>
                )}

                {/* PAYPAL */}
                {data.payout_method === 'paypal' && (
                    <div className="space-y-6">
                        <p className="text-gray-400 text-sm">
                            Receive funds directly to your PayPal account.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">PayPal Email Address *</label>
                            <input
                                type="email"
                                value={data.paypal_email || ''}
                                onChange={(e) => setData({ ...data, paypal_email: e.target.value })}
                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>
                )}

                {/* WISE */}
                {data.payout_method === 'wise' && (
                    <div className="space-y-6">
                        <p className="text-gray-400 text-sm">
                            Low-cost international transfers via Wise (formerly TransferWise).
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Wise Email Address *</label>
                            <input
                                type="email"
                                value={data.wise_email || ''}
                                onChange={(e) => setData({ ...data, wise_email: e.target.value })}
                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>
                )}

                {/* CRYPTO */}
                {data.payout_method === 'crypto' && (
                    <div className="space-y-6">
                        <p className="text-gray-400 text-sm">
                            Receive payouts in USDC directly to your wallet.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address (USDC) *</label>
                            <input
                                type="text"
                                value={data.crypto_wallet_address || ''}
                                onChange={(e) => setData({ ...data, crypto_wallet_address: e.target.value })}
                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500 font-mono"
                                placeholder="0x..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Network *</label>
                            <select
                                value={data.crypto_network || 'ETH'}
                                onChange={(e) => setData({ ...data, crypto_network: e.target.value })}
                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="ETH">Ethereum (ERC20)</option>
                                <option value="SOL">Solana</option>
                                <option value="POLYGON">Polygon</option>
                            </select>
                        </div>
                    </div>
                )}

            </div>

            <div className="bg-sky-900/20 border border-sky-600/30 p-4 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-sky-400 mr-3 mt-0.5" />
                <div>
                    <h4 className="text-sky-400 font-medium mb-1">Verification Required</h4>
                    <p className="text-sky-100 text-sm">
                        For security, changing payout methods requires re-verification by our compliance team.
                        Payouts may be paused for 24-48 hours.
                    </p>
                </div>
            </div>

            {!hideSubmit && (
                <div className="flex justify-end">
                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Payout Settings'}
                    </button>
                </div>
            )}
        </div>
    );
});

PartnerPaymentSetup.displayName = 'PartnerPaymentSetup';
