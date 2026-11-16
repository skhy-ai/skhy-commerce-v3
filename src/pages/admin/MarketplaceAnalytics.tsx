import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, Activity } from 'lucide-react';

interface MarketplaceStats {
    totalPartners: number;
    approvedPartners: number;
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    totalRevenue: number;
}

export const MarketplaceAnalytics: React.FC = () => {
    const [stats, setStats] = useState<MarketplaceStats>({
        totalPartners: 0,
        approvedPartners: 0,
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Load partners
            const { data: partners } = await supabase
                .from('users')
                .select('user_id, approved')
                .eq('user_type', 'partner');

            // Load products
            const { data: products } = await supabase
                .from('products')
                .select('id, is_active');

            // Load orders
            const { data: orders } = await supabase
                .from('orders')
                .select('total_amount');

            const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

            setStats({
                totalPartners: partners?.length || 0,
                approvedPartners: partners?.filter(p => p.approved).length || 0,
                totalProducts: products?.length || 0,
                activeProducts: products?.filter(p => p.is_active).length || 0,
                totalOrders: orders?.length || 0,
                totalRevenue
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Partners',
            value: stats.totalPartners,
            subtext: `${stats.approvedPartners} approved`,
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Total Products',
            value: stats.totalProducts,
            subtext: `${stats.activeProducts} active`,
            icon: Package,
            color: 'purple'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            subtext: 'All time',
            icon: ShoppingBag,
            color: 'green'
        },
        {
            title: 'Total Revenue',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            subtext: 'Marketplace sales',
            icon: DollarSign,
            color: 'orange'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Marketplace Analytics</h2>
                <p className="text-gray-400 mt-1">Overview of marketplace performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                                    <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                                </div>
                            </div>
                            <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-gray-500 text-xs">{stat.subtext}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Quick Stats
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Approval Rate</span>
                            <span className="text-white font-semibold">
                                {stats.totalPartners > 0
                                    ? ((stats.approvedPartners / stats.totalPartners) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Active Product Rate</span>
                            <span className="text-white font-semibold">
                                {stats.totalProducts > 0
                                    ? ((stats.activeProducts / stats.totalProducts) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Avg Order Value</span>
                            <span className="text-white font-semibold">
                                ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Growth Metrics
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Products per Partner</span>
                            <span className="text-white font-semibold">
                                {stats.approvedPartners > 0
                                    ? (stats.totalProducts / stats.approvedPartners).toFixed(1)
                                    : '0'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Revenue per Partner</span>
                            <span className="text-white font-semibold">
                                ${stats.approvedPartners > 0
                                    ? (stats.totalRevenue / stats.approvedPartners).toFixed(2)
                                    : '0.00'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Orders per Product</span>
                            <span className="text-white font-semibold">
                                {stats.activeProducts > 0
                                    ? (stats.totalOrders / stats.activeProducts).toFixed(1)
                                    : '0'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
