import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';

export const OrderConfirmation: React.FC = () => {
    // In a real app, we'd fetch the latest order by ID from params
    return (
        <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
            <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Thank you for your purchase. We have received your order and are processing it.
                You will receive an email confirmation shortly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                    to="/marketplace"
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                    Continue Shopping
                </Link>
                <Link
                    to="/partner/orders" // If buyer, should be /account/orders, but we only have partner portal for now.
                    // For typical buyers, we might need a separate /account section.
                    // For now, let's assume they might be partners too, or redirect home.
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                    View Order Details <ArrowRight size={18} />
                </Link>
            </div>

            <button className="mt-8 text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1 mx-auto">
                <Download size={16} /> Download Invoice
            </button>
        </div>
    );
};
