import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface ExtendedUser extends User {
    user_type?: string;
    company_name?: string;
    approved?: boolean;
    subscription_tier?: string;
    government_id_verified?: boolean;
}

interface AuthContextType {
    user: ExtendedUser | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, metadata?: any, captchaToken?: string) => Promise<{ error: any }>;
    signIn: (email: string, password: string, captchaToken?: string) => Promise<{ error: any; session?: any }>;
    signInWithOtp: (email: string, captchaToken?: string) => Promise<{ error: any }>;
    verifyOtp: (email: string, token: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string, captchaToken?: string) => Promise<{ error: any }>;
    updateProfile: (updates: any) => Promise<{ error: any }>;
    cloudflareAuthEnabled: boolean;
    isCommercialEmail: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [cloudflareAuthEnabled, setCloudflareAuthEnabled] = useState(false);

    const enrichUserWithProfile = async (authUser: User | null): Promise<ExtendedUser | null> => {
        if (!authUser) return null;

        try {
            const { data, error } = await supabase
                .from('users')
                .select('user_type, company_name, approved, subscription_tier, government_id_verified')
                .eq('user_id', authUser.id)
                .single();

            if (data && !error) {
                return { ...authUser, user_type: data.user_type, company_name: data.company_name, approved: data.approved, subscription_tier: data.subscription_tier, government_id_verified: data.government_id_verified };
            }
        } catch (e) {
            console.error("Error enriching user:", e);
        }

        return authUser;
    };

    useEffect(() => {
        let isMounted = true;

        // Run getSession and fetchSettings in parallel
        const sessionPromise = supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!isMounted) return;
            setSession(session);
            // Set user immediately from session data (no DB query) so loading clears fast
            setUser(session?.user ?? null);
            setLoading(false);
            // Enrich in background (non-blocking)
            if (session?.user) {
                enrichUserWithProfile(session.user).then(enriched => {
                    if (isMounted) setUser(enriched);
                });
            }
        });

        const fetchSettings = async () => {
            try {
                const { data } = await supabase
                    .from('site_config')
                    .select('is_enabled')
                    .eq('section', 'cloudflare_auth')
                    .single();
                if (data && isMounted) {
                    setCloudflareAuthEnabled(data.is_enabled);
                }
            } catch (error) {
                console.error('Error fetching site config:', error);
            }
        };

        // Start both in parallel
        Promise.all([sessionPromise, fetchSettings()]);

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;
            setSession(session);
            // Set user immediately so UI reacts without waiting for DB enrichment
            setUser(session?.user ?? null);
            setLoading(false);
            // Enrich in background
            if (session?.user) {
                enrichUserWithProfile(session.user).then(enriched => {
                    if (isMounted) setUser(enriched);
                });
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, metadata?: any, captchaToken?: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                captchaToken,
            },
        });
        return { error };
    };

    const signIn = async (email: string, password: string, captchaToken?: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
                captchaToken,
            }
        });
        return { error, session: data?.session };
    };

    const signInWithOtp = async (email: string, captchaToken?: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                captchaToken,
                // Setting shouldCreateUser to false ensures only existing users can use OTP to log in on this form
                shouldCreateUser: false,
            },
        });
        return { error };
    };

    const verifyOtp = async (email: string, token: string) => {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });

        if (data?.session) {
            setSession(data.session);
            const enrichedUser = await enrichUserWithProfile(data.session.user ?? null);
            setUser(enrichedUser);
        }

        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const resetPassword = async (email: string, captchaToken?: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback`,
            captchaToken,
        });

        // Security: Always return success to prevent email enumeration,
        // unless it's a rate limit or system error we want to expose (optional).
        // Supabase defaults to 200 OK even if user doesn't exist, but if it returns an error:
        if (error) {
            console.warn('Reset password error (hidden from user):', error.message);
            // Verify if it's a rate limit to potentially show it, otherwise hide
            if (error.status === 429) {
                return { error };
            }
        }

        return { error: null };
    };

    const updateProfile = async (updates: any) => {
        if (!user) return { error: new Error('No user logged in') };

        const { error } = await supabase
            .from('users')
            .upsert({
                user_id: user.id,
                email: user.email,
                ...updates,
                updated_at: new Date().toISOString(),
            });

        return { error };
    };

    const isCommercialEmail = React.useMemo(() => {
        if (!user || !user.email) return false;
        const emailLower = user.email.toLowerCase();
        const commercialDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
            'proton.me', 'protonmail.com', 'icloud.com', 'aol.com', 'zoho.com'
        ];
        return commercialDomains.some(domain => emailLower.endsWith(`@${domain}`));
    }, [user]);

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithOtp,
        verifyOtp,
        signOut,
        resetPassword,
        updateProfile,
        cloudflareAuthEnabled,
        isCommercialEmail,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
