import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ProfileForm } from '../../components/partner/ProfileForm';
import { Trash2, AlertTriangle } from 'lucide-react';
import { User } from '../../types/partner';
import { handleError, ErrorContexts, type ErrorInfo } from '../../utils/ErrorHandler';
import { ErrorNotification } from '../../components/ErrorNotification';

export const PartnerProfile: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<ErrorInfo | null>(null);
    const [profile, setProfile] = useState<Partial<User>>({});

    useEffect(() => {
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (fetchError) throw fetchError;

            if (data) {
                setProfile({
                    ...data,
                    website: data.user_metadata?.website || '',
                    description: data.user_metadata?.description || ''
                } as any);
            }
        } catch (error: any) {
            const errorInfo = handleError(error, ErrorContexts.PROFILE_LOAD);
            setError(errorInfo);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('EXTREMELY CRITICAL WARNING:\n\nAre you sure you want to delete your account? This action is IRREVERSIBLE.\n\nAll your products, orders, and company data will be permanently deleted immediately.')) {
            return;
        }

        if (!confirm('Please confirm one last time: Do you really want to delete your account and all associated data?')) {
            return;
        }

        setLoading(true);

        try {
            // Delete user record from public.users
            // RLS policy "Users can delete their own profile" will allow this.
            // Note: This does not delete the Auth user (requires Admin API), but effectively removes them from the app.
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('user_id', user?.id);

            if (error) throw error;

            // Sign out
            await useAuth().signOut();
            window.location.href = '/';

        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Failed to delete account. Please try again or contact support.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <ErrorNotification
                error={error}
                onClose={() => setError(null)}
                onRetry={loadProfile}
            />

            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6">Company Profile</h2>

                <ProfileForm
                    user={user as any} // Type assertion to bypass Supabase User vs Partner User mismatch for now
                    initialData={profile as Partial<User>}
                    onSave={async (data: any) => {
                        setLoading(true);
                        setSuccess(false);
                        setError(null);

                        const { website, description, ...restData } = data;

                        const { error: updateError } = await updateProfile({
                            ...restData,
                            user_metadata: {
                                ...(profile.user_metadata as any),
                                website,
                                description
                            }
                        });

                        setLoading(false);

                        if (updateError) {
                            const errorInfo = handleError(updateError, ErrorContexts.PROFILE_SAVE);
                            setError(errorInfo);
                        } else {
                            setSuccess(true);
                            setTimeout(() => setSuccess(false), 3000);
                        }
                    }}
                    loading={loading}
                    showEmail={true}
                    showDelete={false}
                />
                {success && (
                    <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center font-medium">
                        Profile updated successfully!
                    </div>
                )}
            </div>

            {/* Delete Account Section */}
            <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-xl p-8 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/20 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
                        <p className="text-gray-400 mb-6">
                            Permanently delete your account and all associated data. This action cannot be undone.
                            Any active subscriptions will be cancelled and you will lose access to all your products and orders.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50 rounded-lg font-semibold transition"
                            disabled={loading}
                        >
                            <Trash2 className="w-5 h-5" />
                            {loading ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};
