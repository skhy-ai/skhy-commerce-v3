import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, Calendar, DollarSign, MapPin, Download, Truck, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { handleError, ErrorContexts, type ErrorInfo } from '../../utils/ErrorHandler';
import { ErrorNotification } from '../../components/ErrorNotification';
import { generateInvoicePDF } from '../../services/InvoiceService';
import { formatMoney } from '../../utils/geoCurrency';

interface Order {
    id: string;
    order_number: string;
    buyer_email: string;
    total_amount: number;
    status: string;
    shipping_address: any;
    created_at: string;
    tracking_number?: string;
    carrier?: string;
    currency?: string;
    escrow_hold_id?: string;
    escrow_holds?: {
        status: 'held' | 'released' | 'refunded' | 'disputed';
        released_at: string | null;
        release_date: string | null;
    } | null;
}

export const OrderHistory: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorInfo | null>(null);

    useEffect(() => {
        loadOrders();
    }, [user]);

    const loadOrders = async () => {
        if (!user) return;

        try {
            // Join with escrow_holds to get payment status
            const { data, error } = await supabase
                .from('orders')
                .select('*, escrow_holds!orders_escrow_hold_id_fkey(status, released_at, release_date)')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error: any) {
            const errorInfo = handleError(error, ErrorContexts.ORDER_LOAD);
            setError(errorInfo);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;
            
            // Trigger Wise Payout if status is delivered
            if (newStatus === 'delivered') {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await supabase.functions.invoke('trigger-partner-payout', {
                        body: { order_id: orderId },
                        headers: { Authorization: `Bearer ${session.access_token}` }
                    });
                }
            }

            loadOrders();
        } catch (error: any) {
            const errorInfo = handleError(error, ErrorContexts.ORDER_UPDATE);
            setError(errorInfo);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
            processing: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
            delivered: 'bg-green-500/20 text-green-400 border-green-500/50',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/50'
        };
        return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    };

    const getEscrowStatusBadge = (order: Order) => {
        const escrow = order.escrow_holds;
        if (!escrow) return null;

        if (escrow.status === 'released') {
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20" title={`Released on ${new Date(escrow.released_at!).toLocaleDateString()}`}>
                    <CheckCircle className="w-3 h-3" />
                    Funds Released
                </div>
            );
        } else if (escrow.status === 'held') {
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full border border-blue-500/20" title={`Scheduled release: ${new Date(escrow.release_date!).toLocaleDateString()}`}>
                    <ShieldCheck className="w-3 h-3" />
                    Funds in Escrow
                </div>
            );
        } else if (escrow.status === 'disputed') {
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-full border border-red-500/20">
                    <Clock className="w-3 h-3" />
                    Disputed
                </div>
            );
        }
        return null;
    };

    const updateTracking = async (orderId: string, carrier: string, trackingNumber: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    carrier,
                    tracking_number: trackingNumber,
                    status: 'shipped' // Auto-update status to shipped if tracking provided
                })
                .eq('id', orderId);

            if (error) throw error;
            loadOrders();
        } catch (error: any) {
            const errorInfo = handleError(error, ErrorContexts.ORDER_UPDATE);
            setError(errorInfo);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ErrorNotification
                error={error}
                onClose={() => setError(null)}
                onRetry={loadOrders}
            />

            <div>
                <h2 className="text-2xl font-bold text-white">Orders</h2>
                <p className="text-gray-400 mt-1">View and manage your customer orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700/50 text-center">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No orders yet</p>
                    <p className="text-gray-500 text-sm mt-2">Orders will appear here once customers start purchasing</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-2">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">Order #{order.order_number}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-gray-400 text-sm">{order.buyer_email}</p>
                                            {getEscrowStatusBadge(order)}
                                        </div>
                                    </div>
                                </div>

                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border bg-transparent ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                                >
                                    <option value="pending" className="bg-gray-900 text-yellow-400">Pending</option>
                                    <option value="processing" className="bg-gray-900 text-blue-400">Processing</option>
                                    <option value="shipped" className="bg-gray-900 text-purple-400">Shipped</option>
                                    <option value="delivered" className="bg-gray-900 text-green-400">Delivered</option>
                                    <option value="cancelled" className="bg-gray-900 text-red-400">Cancelled</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-700/50 pt-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm flex-1">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <DollarSign className="w-4 h-4" />
                                        <span className="text-white font-semibold">{formatMoney(order.total_amount, order.currency || 'USD')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {order.shipping_address && (
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{order.shipping_address.city}, {order.shipping_address.country}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-2">
                                        {(order.tracking_number || order.status === 'processing' || order.status === 'shipped') && (
                                            <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
                                                <Truck className="w-4 h-4 text-sky-400" />
                                                <input
                                                    placeholder="Carrier"
                                                    defaultValue={order.carrier}
                                                    className="bg-transparent border-none text-xs text-white w-20 focus:ring-0"
                                                    onBlur={(e) => {
                                                        if (e.target.value !== order.carrier) {
                                                            updateTracking(order.id, e.target.value, order.tracking_number || '');
                                                        }
                                                    }}
                                                />
                                                <input
                                                    placeholder="Tracking #"
                                                    defaultValue={order.tracking_number}
                                                    className="bg-transparent border-none text-xs text-white w-32 focus:ring-0"
                                                    onBlur={(e) => {
                                                        if (e.target.value !== order.tracking_number) {
                                                            updateTracking(order.id, order.carrier || 'FedEx', e.target.value);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={async () => {
                                        try {
                                            const blob = await generateInvoicePDF(order.id);
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `invoice-${order.order_number}.pdf`;
                                            a.click();
                                        } catch (e) {
                                            console.error('Invoice error', e);
                                            alert('Failed to generate invoice');
                                        }
                                    }}
                                    className="ml-4 p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition"
                                    title="Download Invoice"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
