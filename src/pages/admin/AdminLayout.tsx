import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, FileText, LogOut, Home, CheckSquare, Users, BarChart3, Settings, TrendingUp, Mail, Target, ShieldAlert, ShieldCheck } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/admin/login');
            return;
        }

        try {
            // Server-side admin verification using Edge Function
            const { data, error } = await supabase.functions.invoke('verify-admin', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (error || !data?.isAdmin) {
                await supabase.auth.signOut();
                alert('Unauthorized Access: This area is restricted to administrators only.');
                navigate('/admin/login');
                return;
            }

            setLoading(false);
        } catch (err) {
            console.error('Admin verification error:', err);
            await supabase.auth.signOut();
            navigate('/admin/login');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin/login');
    };

    if (loading) return <div className="min-h-screen bg-navy-950 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-navy-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-navy-900 border-r border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center gap-2">
                    <img src="/skhy-logo.jpg" alt="Logo" className="h-8 rounded" />
                    <span className="font-bold text-white">Skhy Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link to="/admin/blog" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <FileText className="w-5 h-5" />
                        Blog Posts
                    </Link>
                    <Link to="/admin/pitch-deck-analytics" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <TrendingUp className="w-5 h-5" />
                        Pitch Deck Stats
                    </Link>
                    <Link to="/admin/data-room" className="flex items-center gap-3 px-4 py-3 text-turquoise-400 font-semibold hover:bg-white/5 rounded-lg transition-colors">
                        <FileText className="w-5 h-5" />
                        Data Room Manager
                    </Link>
                    <Link to="/admin/contacts" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                        Contacts Manager
                    </Link>
                    <Link to="/admin/leads" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                        Waitlist Leads
                    </Link>
                    <Link to="/admin/campaign-analytics" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <Target className="w-5 h-5" />
                        Campaign Analytics
                    </Link>

                    <div className="pt-4 pb-2 px-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Marketplace</span>
                    </div>

                    <Link to="/admin/marketplace/analytics" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <BarChart3 className="w-5 h-5" />
                        Analytics
                    </Link>
                    <Link to="/admin/marketplace/products" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <CheckSquare className="w-5 h-5" />
                        Product Management
                    </Link>
                    <Link to="/admin/marketplace/partners" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                        Partners
                    </Link>
                    <Link to="/admin/marketplace/campaigns" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <Mail className="w-5 h-5" />
                        Email Campaigns
                    </Link>
                    <Link to="/admin/marketplace/delist-requests" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <ShieldAlert className="w-5 h-5 text-red-400" />
                        Delist Requests
                    </Link>
                    <Link to="/admin/marketplace/compliance" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <ShieldCheck className="w-5 h-5 text-turquoise-400" />
                        Supplier Compliance
                    </Link>

                    <div className="pt-4 pb-2 px-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Configuration</span>
                    </div>

                    <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <Settings className="w-5 h-5" />
                        Settings
                    </Link>
                    <Link to="/admin/sales-agents" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                        Sales Agents
                    </Link>
                    <Link to="/admin/quote-generator" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-turquoise-400 rounded-lg transition-colors">
                        <FileText className="w-5 h-5" />
                        Quote Generator
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors">
                        <Home className="w-5 h-5" />
                        Back to Site
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
