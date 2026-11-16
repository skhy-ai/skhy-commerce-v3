import React, { useEffect, useState } from 'react';
import {
    Activity,
    TrendingUp,
    AlertTriangle,
    Clock,
    Package,
    RotateCcw,
    Award
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { handleError, ErrorContexts } from '../../utils/ErrorHandler';
import { ErrorNotification } from '../../components/ErrorNotification';

interface PerformanceMetrics {
    partner_id: string;
    total_orders: number;
    completed_orders: number;
    cancelled_orders: number;
    refunded_orders: number;
    on_time_shipment_rate: number;
    defect_rate: number;
    refund_rate: number;
    average_response_time_hours: number | null;
    average_ship_time_hours: number | null;
    overall_quality_score: number;
    qos_violation_count: number;
    last_calculated_at: string;
}

export const PartnerPerformance: React.FC = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (user) {
            loadMetrics();
        }
    }, [user]);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('partner_performance_metrics')
                .select('*')
                .eq('partner_id', user!.id) // Non-null assertion safe due to auth check
                .maybeSingle();

            if (error) throw error;

            // If no data exists yet, we can either initiate calculation or show empty state
            // For now, let's assume if it's null, we just show 0s or a "not enough data" state
            setMetrics(data || {
                partner_id: user!.id,
                total_orders: 0,
                completed_orders: 0,
                cancelled_orders: 0,
                refunded_orders: 0,
                on_time_shipment_rate: 100,
                defect_rate: 0,
                refund_rate: 0,
                average_response_time_hours: null,
                average_ship_time_hours: null,
                overall_quality_score: 100,
                qos_violation_count: 0,
                last_calculated_at: new Date().toISOString()
            });

        } catch (err) {
            setError(handleError(err, ErrorContexts.DATA_FETCH));
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 75) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getProgressBarColor = (score: number, inverse = false) => {
        if (inverse) {
            if (score <= 5) return 'bg-green-500';
            if (score <= 10) return 'bg-yellow-500';
            return 'bg-red-500';
        }
        if (score >= 90) return 'bg-green-500';
        if (score >= 75) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Performance Metrics</h1>
                    <p className="text-gray-400">
                        Track your QoS scores and operational efficiency.
                        <span className="text-xs ml-2 text-gray-500">
                            Last updated: {metrics?.last_calculated_at ? new Date(metrics.last_calculated_at).toLocaleString() : 'Never'}
                        </span>
                    </p>
                </div>
                <button
                    onClick={loadMetrics}
                    className="p-2 bg-navy-800 hover:bg-navy-700 rounded-lg border border-navy-600 text-gray-300 transition-colors"
                >
                    <Activity className="w-5 h-5" />
                </button>
            </div>

            {error && <ErrorNotification error={error} onClose={() => setError(null)} />}

            {/* Overall Quality Score */}
            <div className="bg-gradient-to-br from-navy-800/80 to-navy-900/80 border border-navy-600 rounded-xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Award className="w-48 h-48 text-sky-400" />
                </div>

                <h2 className="text-xl font-medium text-gray-300 mb-2">Overall Quality Score</h2>
                <div className={`text-6xl font-bold mb-4 ${getScoreColor(metrics?.overall_quality_score || 0)}`}>
                    {metrics?.overall_quality_score || 0}
                    <span className="text-2xl text-gray-500">/100</span>
                </div>
                <p className="max-w-md mx-auto text-gray-400 text-sm">
                    Combined score based on shipment speed, defect rate, and refund frequency.
                    Keep this above 90 to maintain Top Rated Seller status.
                </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* On-Time Rate */}
                <div className="bg-navy-800 border border-navy-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-300 font-medium flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-sky-400" />
                            On-Time Shipments
                        </h3>
                        <span className={`text-xl font-bold ${getScoreColor(metrics?.on_time_shipment_rate || 0)}`}>
                            {metrics?.on_time_shipment_rate}%
                        </span>
                    </div>
                    <div className="w-full bg-navy-900 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${getProgressBarColor(metrics?.on_time_shipment_rate || 0)}`}
                            style={{ width: `${metrics?.on_time_shipment_rate}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Target: &ge; 95%</p>
                </div>

                {/* Defect Rate */}
                <div className="bg-navy-800 border border-navy-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-300 font-medium flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                            Defect Rate
                        </h3>
                        <span className={`text-xl font-bold ${getScoreColor(100 - (metrics?.defect_rate || 0))}`}>
                            {metrics?.defect_rate}%
                        </span>
                    </div>
                    <div className="w-full bg-navy-900 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${getProgressBarColor(metrics?.defect_rate || 0, true)}`}
                            style={{ width: `${Math.min(metrics?.defect_rate || 0, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Target: &le; 1%</p>
                </div>

                {/* Refund Rate */}
                <div className="bg-navy-800 border border-navy-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-300 font-medium flex items-center">
                            <RotateCcw className="w-5 h-5 mr-2 text-yellow-400" />
                            Refund Rate
                        </h3>
                        <span className={`text-xl font-bold ${getScoreColor(100 - (metrics?.refund_rate || 0))}`}>
                            {metrics?.refund_rate}%
                        </span>
                    </div>
                    <div className="w-full bg-navy-900 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${getProgressBarColor(metrics?.refund_rate || 0, true)}`}
                            style={{ width: `${Math.min(metrics?.refund_rate || 0, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Target: &le; 5%</p>
                </div>
            </div>

            {/* Operational Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="bg-sky-500/10 p-3 rounded-full mb-3">
                        <Package className="w-6 h-6 text-sky-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">{metrics?.total_orders}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Total Orders</span>
                </div>

                <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="bg-green-500/10 p-3 rounded-full mb-3">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">{metrics?.completed_orders}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Completed</span>
                </div>

                <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="bg-red-500/10 p-3 rounded-full mb-3">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">{metrics?.qos_violation_count}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">QoS Violations</span>
                </div>

                <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <div className="bg-purple-500/10 p-3 rounded-full mb-3">
                        <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">
                        {metrics?.average_ship_time_hours
                            ? `${metrics.average_ship_time_hours}h`
                            : 'N/A'}
                    </span>
                    <span className="text-xs text-gray-400 uppercase tracking-wider mt-1">Avg Ship Time</span>
                </div>
            </div>
        </div>
    );
};
