import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertCircle, ArrowLeft, Send, Upload } from 'lucide-react';
import { handleError, ErrorContexts, type ErrorInfo } from '../../utils/ErrorHandler';
import { ErrorNotification } from '../../components/ErrorNotification';

interface OrderDetails {
    id: string;
    order_number: string;
    total_amount: number;
    currency: string;
    status: string;
    seller_id: string; // Needed for RLS insert
}

export const RefundRequest: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    const [isEligible, setIsEligible] = useState(false);
    const [ineligibilityReason, setIneligibilityReason] = useState('');
    const [error, setError] = useState<ErrorInfo | null>(null);

    const [formData, setFormData] = useState({
        refund_type: 'full' as 'full' | 'partial',
        refund_amount: '',
        reason: 'defective',
        description: '',
        evidence_urls: '' // Simplified as textarea for list of URLs
    });

    useEffect(() => {
        if (orderId && user) {
            loadOrderAndCheckEligibility();
        }
    }, [orderId, user]);

    const loadOrderAndCheckEligibility = async () => {
        if (!orderId) return;

        try {
            // 1. Load Order Details
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('id, order_number, total_amount, currency, status, seller_id')
                .eq('id', orderId)
                .single();

            if (orderError) throw orderError;
            setOrder(orderData);
            setFormData(prev => ({ ...prev, refund_amount: orderData.total_amount.toString() }));

            // 2. Check Eligibility via RPC
            const { data: eligibility, error: rpcError } = await supabase
                .rpc('check_refund_eligibility', { p_order_id: orderId });

            // RPC returns a single object if user-defined type/table row, or array? 
            // The function returns TABLE(is_eligible boolean, reason text). 
            // Supabase RPC generally returns keys matching columns.

            if (rpcError) throw rpcError;

            // Handle potential array response if RPC returns multiple rows (should be 1)
            const result = Array.isArray(eligibility) ? eligibility[0] : eligibility;

            if (result && result.is_eligible) {
                setIsEligible(true);
            } else {
                setIsEligible(false);
                setIneligibilityReason(result?.reason || 'Order is not eligible for refund');
            }

        } catch (err: any) {
            const errorInfo = handleError(err, ErrorContexts.ORDER_LOAD);
            setError(errorInfo);
        } finally {
            setLoading(false);
            setCheckingEligibility(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!order || !user) return;

        try {
            setLoading(true);

            // Parse evidence URLs
            const evidenceArray = formData.evidence_urls
                .split('\n')
                .map(url => url.trim())
                .filter(url => url.length > 0);

            const payload = {
                order_id: order.id,
                buyer_id: user.id,
                partner_id: order.seller_id,
                refund_amount: parseFloat(formData.refund_amount),
                refund_type: formData.refund_type,
                reason: formData.reason,
                description: formData.description,
                evidence_urls: evidenceArray,
                status: 'pending_partner'
            };

            const { error: insertError } = await supabase
                .from('refund_requests')
                .insert([payload]);

            if (insertError) throw insertError;

            // Success redirect
            navigate('/marketplace/orders'); // Or a specific success page
            alert('Refund request submitted successfully. The partner will review it shortly.');

        } catch (err: any) {
            const errorInfo = handleError(err, ErrorContexts.PAYMENT_PROCESSING); // Context can be adjusted
            setError(errorInfo);
            setLoading(false);
        }
    };

    if (loading || checkingEligibility) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
                <button onClick={() => navigate(-1)} className="text-blue-400 hover:underline">Go Back</button>
            </div>
        );
    }

    if (!isEligible) {
        return (
            <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
                <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Not Eligible for Refund</h2>
                    <p className="text-gray-400 mb-6">{ineligibilityReason}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                    >
                        Return to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </button>

                <h1 className="text-3xl font-bold mb-2">Request Refund</h1>
                <p className="text-gray-400 mb-8">
                    Order #{order.order_number} • ${order.total_amount} {order.currency}
                </p>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
                    <ErrorNotification error={error} onClose={() => setError(null)} />

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Refund Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer border rounded-lg p-4 flex items-center justify-center gap-2 transition ${formData.refund_type === 'full' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'}`}>
                                <input
                                    type="radio"
                                    name="refund_type"
                                    value="full"
                                    className="hidden"
                                    checked={formData.refund_type === 'full'}
                                    onChange={() => setFormData(prev => ({ ...prev, refund_type: 'full', refund_amount: order.total_amount.toString() }))}
                                />
                                <span className="font-semibold">Full Refund</span>
                            </label>

                            <label className={`cursor-pointer border rounded-lg p-4 flex items-center justify-center gap-2 transition ${formData.refund_type === 'partial' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'}`}>
                                <input
                                    type="radio"
                                    name="refund_type"
                                    value="partial"
                                    className="hidden"
                                    checked={formData.refund_type === 'partial'}
                                    onChange={() => setFormData(prev => ({ ...prev, refund_type: 'partial' }))}
                                />
                                <span className="font-semibold">Partial Refund</span>
                            </label>
                        </div>

                        {/* Amount - Only show if partial, but always validate */}
                        {formData.refund_type === 'partial' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Refund Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        max={order.total_amount}
                                        value={formData.refund_amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, refund_amount: e.target.value }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-8 pr-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Maximum refundable: ${order.total_amount}</p>
                            </div>
                        )}

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Reason for Refund</label>
                            <select
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="qos_violation">Quality Issue (QoS Violation)</option>
                                <option value="defective">Defective / Damaged</option>
                                <option value="not_as_described">Not as Described</option>
                                <option value="did_not_arrive">Item Did Not Arrive</option>
                                <option value="changed_mind">Changed Mind</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Please provide details about your issue..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                                required
                            />
                        </div>

                        {/* Evidence URLs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center justify-between">
                                <span>Evidence (Image/Video URLs)</span>
                                <span className="text-xs text-gray-500">One URL per line</span>
                            </label>
                            <div className="relative">
                                <Upload className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                                <textarea
                                    value={formData.evidence_urls}
                                    onChange={(e) => setFormData(prev => ({ ...prev, evidence_urls: e.target.value }))}
                                    placeholder="https://example.com/photo1.jpg&#10;https://example.com/video.mp4"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] font-mono text-sm"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">Processing...</span>
                                ) : (
                                    <span className="flex items-center gap-2">Submit Request <Send size={18} /></span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
