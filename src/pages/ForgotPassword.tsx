import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

export const ForgotPassword: React.FC = () => {
    const { resetPassword, cloudflareAuthEnabled } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');
    const turnstileRef = React.useRef<TurnstileInstance>(null);

    const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setMessage('');
            setError('');

            if (cloudflareAuthEnabled && !captchaToken) {
                setError('Please complete the CAPTCHA validation.');
                return;
            }

            setLoading(true);

            const { error } = await resetPassword(email, captchaToken);

            if (error) {
                throw error;
            }

            setMessage('Check your inbox for password reset instructions');
        } catch (err: any) {
            if (turnstileRef.current) turnstileRef.current.reset();
            setCaptchaToken('');
            setError(err.message || 'Failed to reset password');
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
                    <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-gray-400">Enter your email to receive reset instructions</p>
                </div>

                <div className="bg-[#0a0a0a] backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
                    {message ? (
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Check Your Email</h3>
                            <p className="text-gray-300 mb-6">{message}</p>
                            <Link
                                to="/login"
                                className="inline-block w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-200 text-sm">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition"
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>

                            {cloudflareAuthEnabled && (
                                <div className="flex justify-center my-2">
                                    <Turnstile
                                        ref={turnstileRef}
                                        siteKey={TURNSTILE_SITE_KEY}
                                        onSuccess={(token) => setCaptchaToken(token)}
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || (cloudflareAuthEnabled && !captchaToken)}
                                className="w-full bg-[#00f0ff] text-black py-3 px-4 rounded-lg font-semibold hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Sending...</span>
                                    </div>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
