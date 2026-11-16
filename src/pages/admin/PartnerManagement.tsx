import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Building2, Mail, Calendar, ToggleLeft, ToggleRight, Award } from 'lucide-react';

interface Partner {
    user_id: string;
    email: string;
    company_name: string;
    seller_type: string | null;
    approved: boolean;
    created_at: string;
    logo_url?: string;
    // Joined metrics
    metrics?: {
        overall_quality_score: number;
        on_time_shipment_rate: number;
    }
}

export const PartnerManagement: React.FC = () => {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

    useEffect(() => {
        loadPartners();
    }, [filter]);

    const loadPartners = async () => {
        try {
            // First get partners
            let query = supabase
                .from('users')
                .select('*')
                .eq('user_type', 'partner')
                .order('created_at', { ascending: false });

            if (filter === 'approved') {
                query = query.eq('approved', true);
            } else if (filter === 'pending') {
                query = query.eq('approved', false);
            }

            const { data: partnersData, error: partnersError } = await query;
            if (partnersError) throw partnersError;

            // Then get metrics for these partners
            if (partnersData && partnersData.length > 0) {
                const partnerIds = partnersData.map(p => p.user_id);
                const { data: metricsData } = await supabase
                    .from('partner_performance_metrics')
                    .select('partner_id, overall_quality_score, on_time_shipment_rate')
                    .in('partner_id', partnerIds);

                // Merge data
                const mergedPartners = partnersData.map(p => ({
                    ...p,
                    metrics: metricsData?.find(m => m.partner_id === p.user_id)
                }));
                setPartners(mergedPartners);
            } else {
                setPartners([]);
            }

        } catch (error) {
            console.error('Error loading partners:', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePartnerApproval = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ approved: !currentStatus })
                .eq('user_id', userId);

            if (error) throw error;
            loadPartners(); // Reload to refresh list
        } catch (error) {
            console.error('Error updating partner:', error);
        }
    };

    const getScoreColor = (score?: number) => {
        if (score === undefined) return 'text-gray-500';
        if (score >= 90) return 'text-green-400';
        if (score >= 75) return 'text-yellow-400';
        return 'text-red-400';
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Partner Management</h2>
                    <p className="text-gray-400 mt-1">{partners.length} total partners</p>
                </div>

                <div className="flex gap-2">
                    {(['all', 'approved', 'pending'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === f
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {partners.length === 0 ? (
                <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700/50 text-center">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No partners found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {partners.map((partner) => (
                        <div
                            key={partner.user_id}
                            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    {partner.logo_url ? (
                                        <img
                                            src={partner.logo_url}
                                            alt={partner.company_name}
                                            className="w-16 h-16 rounded-lg object-cover border border-gray-700"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-gray-700/50 flex items-center justify-center border border-gray-700">
                                            <Building2 className="w-8 h-8 text-gray-500" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white">{partner.company_name}</h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${partner.approved
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}
                                            >
                                                {partner.approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Mail className="w-4 h-4" />
                                                <span>{partner.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Building2 className="w-4 h-4" />
                                                <span className="capitalize">{(partner.seller_type || 'N/A').replace('_', ' ')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(partner.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400" title="Overall Quality Score">
                                                <Award className="w-4 h-4" />
                                                <span className={`font-medium ${getScoreColor(partner.metrics?.overall_quality_score)}`}>
                                                    QoS: {partner.metrics ? partner.metrics.overall_quality_score : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => togglePartnerApproval(partner.user_id, partner.approved)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${partner.approved
                                        ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/50'
                                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/50'
                                        }`}
                                >
                                    {partner.approved ? (
                                        <>
                                            <ToggleRight className="w-5 h-5" />
                                            Revoke
                                        </>
                                    ) : (
                                        <>
                                            <ToggleLeft className="w-5 h-5" />
                                            Approve
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
