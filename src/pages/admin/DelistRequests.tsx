import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, CheckCircle, XCircle, Clock, Trash2, Building2, Package, Eye, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface DelistRequest {
    id: string;
    seller_id: string;
    email: string;
    products: number[];
    is_full_page: boolean;
    status: 'pending_seller' | 'pending_admin' | 'approved' | 'rejected';
    confirmed: boolean;
    created_at: string;
    // Joined data
    seller?: {
        company_name: string;
        email: string;
    };
    product_details?: {
        id: number;
        name: string;
    }[];
}

export const DelistRequests: React.FC = () => {
    const [requests, setRequests] = useState<DelistRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending_admin' | 'all'>('pending_admin');

    useEffect(() => {
        loadRequests();
    }, [filter]);

    const loadRequests = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('delist_requests')
                .select('*, seller:users(company_name, email)')
                .order('created_at', { ascending: false });

            if (filter === 'pending_admin') {
                query = query.eq('status', 'pending_admin');
            }

            const { data, error } = await query;
            if (error) throw error;

            // Fetch product names for each request
            const requestsWithProducts = await Promise.all((data || []).map(async (req) => {
                if (req.products && req.products.length > 0) {
                    const { data: pData } = await supabase
                        .from('products')
                        .select('id, name')
                        .in('id', req.products);
                    return { ...req, product_details: pData || [] };
                }
                return { ...req, product_details: [] };
            }));

            setRequests(requestsWithProducts);
        } catch (error: any) {
            toast.error('Error loading delist requests: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (request: DelistRequest, approve: boolean) => {
        const action = approve ? 'approve' : 'reject';
        if (!confirm(`Are you sure you want to ${action} this delisting request?`)) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // 1. Update request status
            const { error: updateError } = await supabase
                .from('delist_requests')
                .update({ 
                    status: approve ? 'approved' : 'rejected',
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: user?.id
                })
                .eq('id', request.id);

            if (updateError) throw updateError;

            // 2. If approved, perform the delisting
            if (approve) {
                if (request.is_full_page) {
                    const { error: pError } = await supabase
                        .from('products')
                        .update({ show_on_marketplace: false, is_active: false })
                        .eq('user_id', request.seller_id);
                    if (pError) throw pError;
                } else {
                    const { error: pError } = await supabase
                        .from('products')
                        .update({ show_on_marketplace: false, is_active: false })
                        .in('id', request.products);
                    if (pError) throw pError;
                }
            }

            toast.success(`Request ${approve ? 'approved' : 'rejected'} successfully`);
            loadRequests();
        } catch (error: any) {
            toast.error('Action failed: ' + error.message);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                        Delist Requests
                    </h2>
                    <p className="text-gray-400 mt-1">Review and approve manufacturer delisting requests</p>
                </div>

                <div className="flex gap-2 bg-navy-900 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setFilter('pending_admin')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'pending_admin' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Pending Admin
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        All History
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-navy-900/50 rounded-2xl p-12 border border-white/10 text-center">
                    <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No delist requests found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-navy-900 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-xl ${req.is_full_page ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {req.is_full_page ? <Building2 className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">
                                                {req.is_full_page ? 'Entire Profile Removal' : 'Selected Products Removal'}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                                <Building2 className="w-3 h-3" />
                                                <span>{req.seller?.company_name}</span>
                                                <span className="text-gray-600">•</span>
                                                <Mail className="w-3 h-3" />
                                                <span>{req.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            req.status === 'pending_admin' ? 'bg-blue-500/20 text-blue-400' :
                                            req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                            req.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {req.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            {new Date(req.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <Package className="w-3 h-3" />
                                        Impacted Offerings ({req.is_full_page ? 'Full Page' : req.product_details?.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {req.is_full_page ? (
                                            <span className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20">
                                                All manufacturer products will be hidden
                                            </span>
                                        ) : (
                                            req.product_details?.map(p => (
                                                <span key={p.id} className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-xs border border-white/10">
                                                    {p.name}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {req.status === 'pending_admin' && (
                                    <div className="flex items-center gap-3 mt-6">
                                        <button
                                            onClick={() => handleApproval(req, true)}
                                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve Delisting
                                        </button>
                                        <button
                                            onClick={() => handleApproval(req, false)}
                                            className="flex-1 py-3 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-red-500/30"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject Request
                                        </button>
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
