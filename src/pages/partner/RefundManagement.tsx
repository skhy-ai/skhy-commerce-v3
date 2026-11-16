import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AlertCircle, CheckCircle, XCircle, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { handleError, ErrorContexts, type ErrorInfo } from '../../utils/ErrorHandler';
import { ErrorNotification } from '../../components/ErrorNotification';

interface RefundRequest {
    id: string;
    order_id: string;
    refund_amount: number;
    refund_type: string;
    reason: string;
    description: string;
    evidence_urls: string[];
    status: string;
    created_at: string;
    partner_response?: string;
    partner_accepts?: boolean;
    partner_responded_at?: string;
    order: {
        order_number: string;
        buyer_email: string;
    }
}

export const RefundManagement: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<RefundRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [responseForm, setResponseForm] = useState<{ [key: string]: { note: string, accept: boolean } }>({});
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadRequests();
    }, [user]);

    const loadRequests = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('refund_requests')
                .select(`
                    *,
                    order:orders(order_number)
                `)
                .eq('partner_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (err: any) {
            const errorInfo = handleError(err, ErrorContexts.ORDER_LOAD);
            setError(errorInfo);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRequest = async (id: string, accept: boolean, note: string) => {
        if (!note.trim()) {
            alert('Please provide a response note explaining your decision.');
            return;
        }

        try {
            setProcessingId(id);

            const newStatus = accept ? 'pending_admin' : 'partner_rejected'; // If accepted, moves to admin. If rejected, stops here (or disputed).
            // Note: Use 'pending_admin' if dual approval is required. The schema comment says "Partner -> Admin".

            const { error } = await supabase
                .from('refund_requests')
                .update({
                    status: newStatus,
                    partner_response: note,
                    partner_accepts: accept,
                    partner_responded_at: new Date().toISOString(),
                    partner_reviewed_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            // Refresh
            await loadRequests();
            setExpandedId(null);

        } catch (err: any) {
            const errorInfo = handleError(err, ErrorContexts.ORDER_UPDATE);
            setError(errorInfo);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending_partner':
                return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs border border-yellow-500/30 flex items-center gap-1"><Clock size={12} /> Awaiting Review</span>;
            case 'pending_admin':
                return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30 flex items-center gap-1"><Clock size={12} /> Pending Admin</span>;
            case 'partner_approved': // Should technically be pending_admin if flow is strictly linear
            case 'admin_approved':
            case 'processed':
                return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30 flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
            case 'partner_rejected':
            case 'rejected':
                return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs border border-red-500/30 flex items-center gap-1"><XCircle size={12} /> Rejected</span>;
            default:
                return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs border border-gray-500/30">{status}</span>;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Loading requests...</div>;
    }

    return (
        <div className="space-y-6">
            <ErrorNotification error={error} onClose={() => setError(null)} onRetry={loadRequests} />

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Refund Requests</h2>
                    <p className="text-gray-400 mt-1">Manage return and refund requests</p>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700/50 text-center">
                    <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No refund requests</p>
                    <p className="text-gray-500 text-sm mt-2">Any disputes or return requests will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                            <div
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition"
                                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-800 p-2 rounded-lg">
                                        <AlertCircle className={`w-5 h-5 ${req.status === 'pending_partner' ? 'text-yellow-500' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-white font-medium">Order #{req.order?.order_number || 'Unknown'}</h3>
                                            {getStatusBadge(req.status)}
                                        </div>
                                        <p className="text-sm text-gray-400 mt-0.5">
                                            Requested ${req.refund_amount} • <span className="capitalize">{req.reason.replace(/_/g, ' ')}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                    {expandedId === req.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>

                            {expandedId === req.id && (
                                <div className="p-6 border-t border-gray-800 bg-gray-900/80">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Request Details */}
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Customer Issue</h4>
                                                <p className="text-white bg-gray-800 p-3 rounded-lg text-sm leading-relaxed">
                                                    {req.description}
                                                </p>
                                            </div>

                                            {req.evidence_urls && req.evidence_urls.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Evidence</h4>
                                                    <ul className="space-y-1">
                                                        {req.evidence_urls.map((url, idx) => (
                                                            <li key={idx}>
                                                                <a
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-400 hover:underline text-sm flex items-center gap-1"
                                                                >
                                                                    <ExternalLink size={12} /> Evidence #{idx + 1}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Partner Action */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Your Response</h4>

                                            {req.status === 'pending_partner' ? (
                                                <div className="space-y-4">
                                                    <textarea
                                                        placeholder="Add a note to the customer and admin (required)..."
                                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32"
                                                        value={responseForm[req.id]?.note || ''}
                                                        onChange={(e) => setResponseForm({
                                                            ...responseForm,
                                                            [req.id]: { ...responseForm[req.id], note: e.target.value }
                                                        })}
                                                    />
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleProcessRequest(req.id, true, responseForm[req.id]?.note || '')}
                                                            disabled={processingId === req.id}
                                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
                                                        >
                                                            {processingId === req.id ? 'Processing...' : 'Accept & Forward to Admin'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleProcessRequest(req.id, false, responseForm[req.id]?.note || '')}
                                                            disabled={processingId === req.id}
                                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
                                                        >
                                                            Reject Request
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Note: Accepting will forward the request to Skhy AI admins for final approval and refund processing.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {req.partner_accepts ? (
                                                            <span className="text-green-400 flex items-center gap-1 font-medium text-sm"><CheckCircle size={14} /> You accepted this request</span>
                                                        ) : (
                                                            <span className="text-red-400 flex items-center gap-1 font-medium text-sm"><XCircle size={14} /> You rejected this request</span>
                                                        )}
                                                        <span className="text-gray-500 text-xs">• {new Date(req.partner_responded_at!).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-gray-300 text-sm italic">"{req.partner_response}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
