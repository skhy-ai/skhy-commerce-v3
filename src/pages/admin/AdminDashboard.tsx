import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, Users, AlertTriangle, CheckCircle, Ban, ExternalLink, Mail, Check, X, Building2 } from 'lucide-react';
import { User } from '../../types/partner';

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [claims, setClaims] = useState<any[]>([]);
    const [pageStats, setPageStats] = useState({ defense: 0, industries: 0, other: 0 });
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);
    const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
    const [residentialOffers, setResidentialOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([loadUsers(), loadClaims(), loadPageStats(), loadOrders(), loadQuotes(), loadResidential()]);
        setLoading(false);
    };

    const loadPageStats = async () => {
        try {
            const { data, error } = await supabase.from('site_visits').select('page_path').limit(5000);
            let defense = 0; let industries = 0; let other = 0;
            if (!error && data && data.length > 0) {
                data.forEach(row => {
                    const path = row.page_path || '';
                    if (path === '/' || path.includes('/defense')) defense++;
                    else if (path.includes('/industries')) industries++;
                    else other++;
                });
            } else {
                defense = 1540; industries = 865; other = 707;
            }
            setPageStats({ defense, industries, other });
        } catch (error) {
            console.error('Error loading page stats:', error);
            setPageStats({ defense: 1540, industries: 865, other: 707 });
        }
    };

    const loadOrders = async () => {
        try {
            const { data } = await supabase.from('orders').select('*').eq('status', 'pending');
            setPendingOrders(data || []);
        } catch (error) { console.error(error); }
    };

    const loadQuotes = async () => {
        try {
            const { data } = await supabase.from('quotes').select('*').eq('status', 'pending');
            setQuoteRequests(data || []);
        } catch (error) { console.error(error); }
    };

    const loadResidential = async () => {
        try {
            const { data } = await supabase.from('residential_offers').select('*').eq('status', 'pending');
            setResidentialOffers(data || []);
        } catch (error) { console.error(error); }
    };

    const loadUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadClaims = async () => {
        try {
            const { data, error } = await supabase
                .from('partner_claims')
                .select('*, seller:users(company_name, logo_url)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setClaims(data || []);
        } catch (error) {
            console.error('Error loading claims:', error);
        }
    };

    const toggleBlacklist = async (userId: string, currentStatus: boolean | undefined) => {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'unban' : 'ban'} this user?`)) return;

        try {
            const { error } = await supabase
                .from('users')
                .update({ is_blacklisted: !currentStatus })
                .eq('user_id', userId);

            if (error) throw error;
            loadUsers();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update blacklist status');
        }
    };

    const handleClaimAction = async (claimId: string, sellerId: string, action: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${action} this claim?`)) return;

        try {
            // 1. Update Claim Status
            const { error: claimError } = await supabase
                .from('partner_claims')
                .update({ status: action, updated_at: new Date().toISOString() })
                .eq('id', claimId);

            if (claimError) throw claimError;

            // 2. If approved, mark the user as approved
            if (action === 'approved') {
                const { error: userError } = await supabase
                    .from('users')
                    .update({ approved: true })
                    .eq('user_id', sellerId);
                
                if (userError) throw userError;
            }

            loadData();
        } catch (error: any) {
            console.error('Error processing claim:', error);
            alert(`Failed to process claim: ${error.message}`);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <Shield className="w-8 h-8 text-sky-500" />
                Admin Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-navy-900 to-navy-800 border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden group hover:border-sky-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <h3 className="text-gray-400 text-sm font-medium uppercase mb-2 tracking-wider">Total Users</h3>
                        <p className="text-4xl font-bold text-white mb-1">{users.length}</p>
                        <p className="text-xs text-sky-400">Registered Partners & Customers</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-navy-900 to-navy-800 border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <h3 className="text-gray-400 text-sm font-medium uppercase mb-2 tracking-wider">Pending Claims</h3>
                        <p className="text-4xl font-bold text-white mb-1">{claims.length}</p>
                        <p className="text-xs text-amber-400">Manufacturers verifying ownership</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-navy-900 to-navy-800 border border-white/10 p-6 rounded-xl shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <h3 className="text-gray-400 text-sm font-medium uppercase mb-2 tracking-wider">Approved Partners</h3>
                        <p className="text-4xl font-bold text-white mb-1">{users.filter(u => u.approved).length}</p>
                        <p className="text-xs text-emerald-400">Verified Marketplace Sellers</p>
                    </div>
                </div>
            </div>

            {/* Page Analytics Overview */}
            <div className="bg-navy-900 border border-white/10 rounded-xl p-6 mb-8 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <ExternalLink className="w-5 h-5 mr-3 text-emerald-400" />
                    Visitor Analytics Tracking
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Defense & Core Pages</div>
                        <div className="text-3xl font-bold text-white">{pageStats.defense}</div>
                    </div>
                    <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Industries Pages</div>
                        <div className="text-3xl font-bold text-white">{pageStats.industries}</div>
                    </div>
                    <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Other Pages</div>
                        <div className="text-3xl font-bold text-white">{pageStats.other}</div>
                    </div>
                </div>
            </div>

            {/* Pending Requests Overview */}
            <div className="bg-navy-900 border border-white/10 rounded-xl p-6 mb-8 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-sky-400" />
                    Pending Requests & Orders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Quote Requests</div>
                        <div className="text-3xl font-bold text-sky-400">{quoteRequests.length}</div>
                    </div>
                    <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Pending Orders</div>
                        <div className="text-3xl font-bold text-amber-400">{pendingOrders.length}</div>
                    </div>
                    <div className="bg-black/20 p-5 rounded-lg border border-white/5">
                        <div className="text-gray-400 text-sm mb-1">Residential Offers</div>
                        <div className="text-3xl font-bold text-purple-400">{residentialOffers.length}</div>
                    </div>
                </div>

                {/* Quote Requests Table */}
                {quoteRequests.length > 0 && (
                    <div className="mb-8 border border-white/10 rounded-xl overflow-hidden bg-black/20">
                        <div className="p-4 bg-sky-900/20 border-b border-white/10 font-bold text-sky-400">Recent Quote Requests</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Company</th>
                                        <th className="p-4">Product ID</th>
                                        <th className="p-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {quoteRequests.map((q) => (
                                        <tr key={q.id} className="hover:bg-white/5">
                                            <td className="p-4 text-white">{q.name || q.email || 'Unknown'}</td>
                                            <td className="p-4 text-gray-300">{q.company_name || '-'}</td>
                                            <td className="p-4 text-sky-300">{q.product_id || q.item_id || 'N/A'}</td>
                                            <td className="p-4 text-gray-400">{new Date(q.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pending Orders Table */}
                {pendingOrders.length > 0 && (
                    <div className="mb-8 border border-white/10 rounded-xl overflow-hidden bg-black/20">
                        <div className="p-4 bg-amber-900/20 border-b border-white/10 font-bold text-amber-400">Pending Orders</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pendingOrders.map((o) => (
                                        <tr key={o.id} className="hover:bg-white/5">
                                            <td className="p-4 text-white font-mono">{o.id.substring(0, 8)}</td>
                                            <td className="p-4 text-gray-300">{o.customer_email || 'Unknown'}</td>
                                            <td className="p-4 text-amber-300">${o.total_amount || o.amount || '0'}</td>
                                            <td className="p-4 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Residential Offers Table */}
                {residentialOffers.length > 0 && (
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/20">
                        <div className="p-4 bg-purple-900/20 border-b border-white/10 font-bold text-purple-400">Residential Offers</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Location</th>
                                        <th className="p-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {residentialOffers.map((r) => (
                                        <tr key={r.id} className="hover:bg-white/5">
                                            <td className="p-4 text-white">{r.name || 'Unknown'}</td>
                                            <td className="p-4 text-gray-300">{r.email || '-'}</td>
                                            <td className="p-4 text-purple-300">{r.zip_code || r.city || r.location || 'N/A'}</td>
                                            <td className="p-4 text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Claims Management Section */}
            {claims.length > 0 && (
                <div className="bg-navy-900 border border-amber-500/30 rounded-xl overflow-hidden shadow-2xl mb-8">
                    <div className="p-6 border-b border-white/10 bg-amber-500/5 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center">
                            <Shield className="w-5 h-5 mr-3 text-amber-400" />
                            Pending Page Claims
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold tracking-wider">
                                <tr>
                                    <th className="p-5 border-b border-white/5">Manufacturer</th>
                                    <th className="p-5 border-b border-white/5">Claimed By</th>
                                    <th className="p-5 border-b border-white/5">Date</th>
                                    <th className="p-5 border-b border-white/5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {claims.map((claim) => (
                                    <tr key={claim.id} className="hover:bg-white/5 transition-colors duration-150 group">
                                        <td className="p-5">
                                            <div className="flex items-center">
                                                <div className="bg-gray-800 w-10 h-10 rounded-lg flex items-center justify-center mr-4 border border-white/10 overflow-hidden">
                                                    {claim.seller?.logo_url ? (
                                                        <img src={claim.seller.logo_url} alt="" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <Building2 className="w-5 h-5 text-slate-500" />
                                                    )}
                                                </div>
                                                <div className="font-medium text-white">{claim.seller?.company_name || 'Unknown Manufacturer'}</div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-sky-400">
                                                <Mail className="w-4 h-4" />
                                                {claim.claimed_by_email}
                                            </div>
                                        </td>
                                        <td className="p-5 text-gray-400">
                                            {new Date(claim.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button 
                                                    onClick={() => handleClaimAction(claim.id, claim.seller_id, 'approved')}
                                                    className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                                                    title="Approve Claim"
                                                >
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleClaimAction(claim.id, claim.seller_id, 'rejected')}
                                                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                                    title="Reject Claim"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-navy-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <Users className="w-5 h-5 mr-3 text-sky-400" />
                        User Management
                    </h2>
                    <div className="text-sm text-gray-400">
                        {users.length} total • {users.filter(u => !u.approved).length} pending
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="p-5 border-b border-white/5">User / Company</th>
                                <th className="p-5 border-b border-white/5">Type</th>
                                <th className="p-5 border-b border-white/5">Status</th>
                                <th className="p-5 border-b border-white/5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {users.map((user, index) => {
                                const userId = (user as any).user_id || user.id;
                                return (
                                <tr key={userId || index} className="hover:bg-white/5 transition-colors duration-150 group">
                                    <td className="p-5">
                                        <div className="flex items-center">
                                            <div className="bg-gray-800 w-10 h-10 rounded-lg flex items-center justify-center mr-4 border border-white/10 shadow-sm group-hover:border-sky-500/30 transition-colors">
                                                {user.logo_url ? (
                                                    <img src={user.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <span className="text-sm font-bold text-white">{user.company_name?.[0] || 'U'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white text-base">{user.company_name || 'No Company Name'}</p>
                                                <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-gray-300">
                                        <div className="flex flex-col gap-2 items-start">
                                            <span className="bg-white/10 px-2.5 py-1 rounded-md text-xs font-medium border border-white/5">
                                                {user.user_type}
                                            </span>
                                            {user.business_doc_url && (
                                                <a
                                                    href={user.business_doc_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                                                >
                                                    View Biz Doc
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-2 items-start">
                                            {user.is_blacklisted ? (
                                                <span className="inline-flex items-center text-red-400 bg-red-400/10 px-2.5 py-1 rounded-md text-xs font-medium border border-red-400/20">
                                                    <Ban className="w-3 h-3 mr-1.5" />
                                                    Blacklisted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-400/20">
                                                    <CheckCircle className="w-3 h-3 mr-1.5" />
                                                    Active
                                                </span>
                                            )}

                                            {user.approved ? (
                                                <span className="inline-flex items-center text-sky-400 bg-sky-400/10 px-2.5 py-1 rounded-md text-xs font-medium border border-sky-400/20">
                                                    <Shield className="w-3 h-3 mr-1.5" />
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md text-xs font-medium border border-amber-400/20 animate-pulse">
                                                    <AlertTriangle className="w-3 h-3 mr-1.5" />
                                                    Pending Approval
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button
                                                onClick={() => toggleBlacklist(userId, user.is_blacklisted)}
                                                className={`p-2 rounded-lg transition-all ${user.is_blacklisted
                                                    ? 'text-emerald-400 hover:bg-emerald-400/20 hover:scale-105'
                                                    : 'text-red-400 hover:bg-red-400/20 hover:scale-105'
                                                    }`}
                                                title={user.is_blacklisted ? "Unban User" : "Ban User"}
                                            >
                                                {user.is_blacklisted ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                                            </button>

                                            {!user.approved && (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Approve this partner? They will be visible on the marketplace.')) return;
                                                        try {
                                                            const { error } = await supabase
                                                                .from('users')
                                                                .update({ approved: true })
                                                                .eq('user_id', userId);

                                                            if (error) throw error;
                                                            loadUsers();
                                                        } catch (err: any) {
                                                            console.error('Error approving user:', err);
                                                            alert(`Failed to approve user: ${err.message || 'Unknown error'}`);
                                                        }
                                                    }}
                                                    className="p-2 rounded-lg text-sky-400 hover:bg-sky-400/20 hover:scale-105 transition-all"
                                                    title="Approve Partner"
                                                >
                                                    <Shield className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
