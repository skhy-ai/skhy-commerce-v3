import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface SimulatorProtectedRouteProps {
    children: React.ReactNode;
}

export const SimulatorProtectedRoute: React.FC<SimulatorProtectedRouteProps> = ({
    children
}) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-500"></div>
            </div>
        );
    }

    // 1. Not logged in -> Redirect to customer registration (primary path for mission architect)
    if (!user) {
        return <Navigate to={`/register/customer?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }

    // Use enriched user_type from AuthContext, fallback to user_metadata
    const userType = user.user_type || user.user_metadata?.user_type;

    // 2. Logged in, but is a Partner -> Deny Access
    if (userType === 'partner') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-lg w-full text-center shadow-2xl">
                    <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
                    <p className="text-slate-400 mb-6">
                        The "Build your drone" mission architect and simulators are exclusive to Skhy Customers and Administrators.
                        Partner accounts do not have access to these specific design tools.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // 3. User is Customer or Admin -> Allow Access
    return <>{children}</>;
};
