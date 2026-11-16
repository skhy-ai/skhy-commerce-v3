import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);
    const [sessionError, setSessionError] = useState('');

    // On mount, verify we actually have a recovery session
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
                setSessionError('Invalid or expired reset link. Please request a new one.');
            } else {
                setSessionReady(true);
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) throw updateError;

            setSuccess(true);
            // Sign out the recovery session so user logs in fresh
            await supabase.auth.signOut();
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050a14] px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <a href="/" className="inline-block mb-6">
                        <img
                            src="/skhy-logo.jpg"
                            alt="Skhy AI Logo"
                            className="h-14 w-auto mx-auto rounded-lg hover:opacity-90 transition"
                        />
                    </a>
                    <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
                    <p className="text-gray-400">Choose a strong password for your account</p>
                </div>

                <div className="bg-[#0a0a0a] backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">

                    {/* Session error — bad/expired link */}
                    {sessionError && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Link Expired</h2>
                            <p className="text-red-300 text-sm">{sessionError}</p>
                            <Link
                                to="/forgot-password"
                                className="mt-2 inline-block w-full bg-[#00f0ff] text-black py-3 px-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-200 text-center"
                            >
                                Request New Reset Link
                            </Link>
                        </div>
                    )}

                    {/* Success state */}
                    {!sessionError && success && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Password Updated!</h2>
                            <p className="text-green-300 text-sm">
                                Your password has been changed successfully. Redirecting to login…
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    {!sessionError && !success && sessionReady && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-200 text-sm">{error}</p>
                                </div>
                            )}

                            {/* New password */}
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-gray-300 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                        className="w-full pl-11 pr-11 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition"
                                        placeholder="At least 8 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="confirm-password"
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-11 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition"
                                        placeholder="Re-enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition"
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#00f0ff] text-black py-3 px-4 rounded-lg font-semibold hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                        <span>Updating…</span>
                                    </div>
                                ) : 'Update Password'}
                            </button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-sm text-gray-400 hover:text-white transition"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}

                    {/* Loading skeleton while checking session */}
                    {!sessionError && !success && !sessionReady && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                            <p className="text-gray-400 text-sm">Verifying reset link…</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
