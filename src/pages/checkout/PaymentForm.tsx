import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { formatMoney, CurrencyCode } from '../../utils/geoCurrency';

interface PaymentFormProps {
    currency: CurrencyCode;
    amount: number;
    onSuccess: (paymentIntentId: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ currency, amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL is required, but we handle redirect manually if not redirected by Stripe
                // Stripe might redirect for 3D Secure
                return_url: window.location.origin + '/checkout/success',
            },
            redirect: 'if_required', // Attempt to handle without redirect if possible
        });

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.');
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        } else {
            setErrorMessage('Payment status: ' + (paymentIntent?.status || 'unknown'));
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-white rounded-md border border-gray-200">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/50 p-3 rounded text-red-400 text-sm">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? 'Processing...' : `Pay ${formatMoney(amount, currency)}`}
            </button>

            <p className="text-xs text-gray-500 text-center mt-2">
                Payments are securely processed by Stripe.
            </p>
        </form>
    );
};
