import React, { useRef } from 'react';
import { PartnerPaymentSetup, PartnerPaymentSetupRef } from '../../components/partner/PartnerPaymentSetup';
import { DollarSign, ShieldCheck } from 'lucide-react';

export const PayoutSettings: React.FC = () => {
    const paymentSetupRef = useRef<PartnerPaymentSetupRef>(null);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Payout Settings</h1>
                <p className="text-gray-400">
                    Choose your preferred payout method. We support Bank Transfer, Stripe, PayPal, Wise, and Crypto (USDC).
                </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8">
                <div className="flex items-start gap-4 mb-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold text-blue-400 mb-1">Secure Payment Processing</h3>
                        <p className="text-gray-300 text-sm">
                            Skhy AI uses a secure escrow system. Payments are held until order delivery is confirmed.
                            Once released, funds are automatically transferred to the bank account below.
                        </p>
                    </div>
                </div>

                <PartnerPaymentSetup ref={paymentSetupRef} />

                <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span>Payouts are processed automatically every week for released funds.</span>
                    </div>
                    <div>
                        Need help? <a href="mailto:support@skhy.ai" className="text-blue-400 hover:underline">Contact Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
