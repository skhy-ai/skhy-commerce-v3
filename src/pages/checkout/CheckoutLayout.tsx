import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const CheckoutLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Simple Header */}
            <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        {/* Reusing logo */}
                        <img src="/skhy-logo.jpg" alt="Skhy AI" className="h-8 w-auto mix-blend-screen" />
                    </Link>
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        <ShieldCheck size={16} />
                        Secure Checkout
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Skhy AI. All rights reserved.</p>
            </footer>
        </div>
    );
};
