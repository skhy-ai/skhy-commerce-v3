import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';

interface Stats {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    revenue: number;
}

export const DashboardOverview: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
        if (!user) return;

        try {
            // Fetch products
            const { data: products } = await supabase
                .from('products')
                .select('*')
                .eq('user_id', user.id);

            // Fetch orders
            const { data: orders } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('seller_id', user.id)
                .eq('status', 'completed');

            const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

            setStats({
                totalProducts: products?.length || 0,
                activeProducts: products?.filter(p => p.is_active).length || 0,
                totalOrders: orders?.length || 0,
                revenue: totalRevenue
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Products',
            value: stats.totalProducts,
            icon: Package,
            color: 'blue',
            subtext: `${stats.activeProducts} active`
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: 'green',
            subtext: 'All time'
        },
        {
            title: 'Revenue',
            value: `$${stats.revenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'purple',
            subtext: 'Total earnings'
        },
        {
            title: 'Avg Order Value',
            value: stats.totalOrders > 0 ? `$${(stats.revenue / stats.totalOrders).toFixed(2)}` : '$0',
            icon: TrendingUp,
            color: 'orange',
            subtext: 'Per order'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition"
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

            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/partner/products?new=true"
                        className="p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg hover:bg-blue-500/20 transition text-center"
                    >
                        <Package className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-blue-400 font-medium">Add New Product</p>
                    </a>
                    <a
                        href="/partner/orders"
                        className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg hover:bg-green-500/20 transition text-center"
                    >
                        <ShoppingBag className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-400 font-medium">View Orders</p>
                    </a>
                    <a
                        href="/partner/profile"
                        className="p-4 bg-purple-500/10 border border-purple-500/50 rounded-lg hover:bg-purple-500/20 transition text-center"
                    >
                        <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-purple-400 font-medium">Update Profile</p>
                    </a>
                </div>
            </div>
        </div>
    );
};
