import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Package,
    Settings,
    LogOut,
    ShoppingBag,
    DollarSign,
    Truck,
    RotateCcw,
    TrendingUp,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { SupportChatbot } from '../../components/SupportChatbot';

export const PartnerDashboard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const navItems = [
        { path: '/partner/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { path: '/partner/products', icon: Package, label: 'Products', requiresApproval: true },
        { path: '/partner/orders', icon: ShoppingBag, label: 'Orders', requiresApproval: true },
        { path: '/partner/refunds', icon: RotateCcw, label: 'Refunds', requiresApproval: true },
        { path: '/partner/shipping', icon: Truck, label: 'Shipping', requiresApproval: true },
        { path: '/partner/payouts', icon: DollarSign, label: 'Payouts', requiresApproval: true },
        { path: '/partner/performance', icon: TrendingUp, label: 'Performance', requiresApproval: true },
        { path: '/partner/profile', icon: Settings, label: 'Profile' },
    ].filter(item => user?.approved || !item.requiresApproval);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700/50">
                <div className="p-6">
                    <a href="/" className="block mb-6">
                        <img
                            src="/skhy-logo.jpg"
                            alt="Skhy AI Logo"
                            className="h-10 w-auto rounded-lg hover:opacity-90 transition"
                        />
                    </a>
                    <h2 className="text-2xl font-bold text-white mb-1">Partner Portal</h2>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                </div>

                <nav className="px-3 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700/50">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="ml-64 min-h-screen">
                <header className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
                    <div className="px-8 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>
                </header>

                <main className="p-8">
                    {user?.approved ? (
                        <div className="mb-8 p-6 bg-green-900/30 border border-green-700/50 rounded-xl flex items-start gap-4 shadow-lg shadow-green-900/10">
                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold text-green-500 mb-2">Welcome to your Seller Dashboard!</h3>
                                <p className="text-green-200/90 leading-relaxed max-w-3xl mb-4">
                                    Your account is approved. You can now manage your public seller page and add products to the marketplace.
                                </p>
                                <div className="flex gap-4">
                                    <Link to={`/marketplace/seller/${user.id}`} className="bg-green-600/80 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                                        View Public Seller Page
                                    </Link>
                                    <Link to="/partner/profile" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                                        Manage Profile
                                    </Link>
                                    <Link to="/partner/products?new=true" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                                        Add New Product
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 p-6 bg-yellow-900/30 border border-yellow-700/50 rounded-xl flex items-start gap-4 shadow-lg shadow-yellow-900/10">
                            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold text-yellow-500 mb-2">Account Pending Approval</h3>
                                <p className="text-yellow-200/90 leading-relaxed max-w-3xl">
                                    Your partner account is currently under review by our administration team. 
                                    You will be notified once approved, at which point you will gain access to add products, configure shipping, manage payouts, and fulfill orders.
                                </p>
                            </div>
                        </div>
                    )}
                    <Outlet />
                </main>

                <footer className="p-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <img
                            src="/skhy-logo.jpg"
                            alt="Skhy AI"
                            className="h-6 w-6 rounded opacity-50 grayscale hover:grayscale-0 transition"
                        />
                        <span>Skhy AI</span>
                    </div>
                    &copy; {new Date().getFullYear()} Skhy AI. All rights reserved.
                </footer>
            </div>
            <SupportChatbot />
        </div>
    );
};
