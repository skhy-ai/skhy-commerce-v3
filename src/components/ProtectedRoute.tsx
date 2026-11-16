import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAdmin = false
}) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
            </div>
        );
    }

    if (!user) {
        const redirectUrl = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
    }

    // Check for onboarding completion if not explicitly exempt
    const isOnboardingPage = window.location.pathname === '/partner/onboarding';

    // Use enriched user_type from AuthContext, fallback to user_metadata
    const userType = user.user_type || user.user_metadata?.user_type;
    const isPartner = userType === 'partner';

    if (isPartner && !isOnboardingPage && !user.user_metadata?.onboarding_complete) {
        return <Navigate to="/partner/onboarding" replace />;
    }

    return <>{children}</>;
};
