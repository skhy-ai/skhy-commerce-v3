import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, Calendar, DollarSign, Download, ExternalLink, ArrowRight } from 'lucide-react';
import { generateInvoicePDF } from '../../services/InvoiceService';
import { Link } from 'react-router-dom';
import { formatMoney } from '../../utils/geoCurrency';

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    currency?: string;
    shipping_address: any;
    created_at: string;
    tracking_number?: string;
    carrier?: string;
    escrow_hold_id?: string;
    order_items: {
        id: string;
        quantity: number;
        unit_price: number;
        product_name?: string;
        product: {
            name: string;
            image_url?: string; // from product_assets check
        }
    }[];
}

export const BuyerOrders: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, [user]);

    const loadOrders = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        id,
                        quantity,
                        unit_price,
                        product_name,
                        product:products (
                            name
                        )
                    )
                `)
                .eq('buyer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'text-yellow-400',
            processing: 'text-blue-400',
            shipped: 'text-purple-400',
            delivered: 'text-green-400',
            cancelled: 'text-red-400'
        };
        return colors[status] || 'text-gray-400';
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading orders...</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
            <p className="text-gray-400 mb-8">Track and manage your purchases</p>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                    <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No orders yet</h3>
                    <Link to="/marketplace" className="text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2">
                        Start Shopping <ArrowRight size={16} />
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-800/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div>
                                        <p className="text-gray-400 mb-1 flex items-center gap-1"><Calendar size={14} /> Order Placed</p>
                                        <p className="text-white font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1 flex items-center gap-1"><DollarSign size={14} /> Total</p>
                                        <p className="text-white font-medium">{formatMoney(order.total_amount, order.currency || 'USD')}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 mb-1 flex items-center gap-1"><Package size={14} /> Order #</p>
                                        <p className="text-white font-medium">{order.order_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`font-bold capitalize ${getStatusColor(order.status)}`}>
                                        {order.status}
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
                                            } catch (e) { console.error(e); }
                                        }}
                                        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm border border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition"
                                    >
                                        <Download size={14} /> Invoice
                                    </button>
                                    {order.status === 'delivered' && (
                                        <Link
                                            to={`/marketplace/orders/${order.id}/refund`}
                                            className="text-red-400 hover:text-red-300 flex items-center gap-2 text-sm border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition"
                                        >
                                            Request Refund
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.order_items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-gray-600">
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{item.product_name || item.product?.name}</p>
                                                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="text-white font-medium">{formatMoney(item.unit_price, order.currency || 'USD')}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Tracking Info (Phase 5) */}
                                {(order.tracking_number || order.status === 'shipped') && (
                                    <div className="mt-6 pt-6 border-t border-gray-800 flex items-center gap-3 text-sm text-gray-300">
                                        <ExternalLink size={16} className="text-blue-400" />
                                        {order.tracking_number ? (
                                            <span>
                                                Tracking Number: <span className="text-white font-mono ml-1">{order.tracking_number}</span>
                                                {order.carrier && <span className="text-gray-500 ml-2">({order.carrier})</span>}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 italic">Tracking information unavailable</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
