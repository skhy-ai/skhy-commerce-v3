import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

export const CustomerRegister: React.FC = () => {
    const { signUp, cloudflareAuthEnabled } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });
    const [isSubscribed, setIsSubscribed] = useState(true);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const turnstileRef = React.useRef<TurnstileInstance>(null);

    const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (cloudflareAuthEnabled && !captchaToken) {
            setError('Please complete the CAPTCHA validation.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const { error } = await signUp(formData.email, formData.password, {
            full_name: formData.fullName,
            user_type: 'customer', // Explicitly set as customer
        }, captchaToken);

        if (error) {
            if (turnstileRef.current) turnstileRef.current.reset();
            setCaptchaToken('');
            setError(error.message);
            setLoading(false);
        } else {
            // Newsletter Sync
            if (isSubscribed) {
                try {
                    await supabase
                        .from('pitch_deck_recipients')
                        .insert({
                            email: formData.email,
                            name: formData.fullName,
                            category: 'customer',
                            source: 'registration',
                            is_subscribed: true
                        });
                } catch (err) {
                    console.error('Newsletter sync error:', err);
                    // Don't block registration if newsletter sync fails
                }
            }
            
            setSuccess(true);
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050a14] px-4">
                <div className="max-w-md w-full">
                    <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-green-700/50">
                        <div className="text-center">
                            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
                            <p className="text-gray-300 mb-6 text-lg">
                                We've sent a verification link to <strong>{formData.email}</strong>.
                            </p>
                            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mb-6 text-left">
                                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-[#00f0ff]" /> What happens next?
                                </h3>
                                <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                                    <li>Click the link in the email we just sent you.</li>
                                    <li>You'll be automatically redirected to the marketplace.</li>
                                    <li>Start browsing and purchasing products!</li>
                                </ul>
                            </div>
                            <p className="text-yellow-400 text-sm font-semibold mb-4 bg-yellow-400/10 py-2 rounded-lg border border-yellow-400/20">
                                ⚠️ Didn't receive the email? Please check your spam or junk folder.
                            </p>
                            <Link to="/login" className="inline-block mt-2 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition">
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050a14] px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <a href="/" className="inline-block mb-6">
                        <img
                            src="/skhy-logo.jpg"
                            alt="Skhy AI Logo"
                            className="h-14 w-auto mx-auto rounded-lg hover:opacity-90 transition"
                        />
                    </a>
                    <h1 className="text-4xl font-bold text-white mb-2">Join Skhy Marketplace</h1>
                    <p className="text-gray-400">Create your account to start shopping</p>
                </div>

                <div className="bg-[#0a0a0a] backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-200 text-sm">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition text-sm"
                                    placeholder="••••••••"
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

                        <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                            <input
                                id="isSubscribed"
                                name="isSubscribed"
                                type="checkbox"
                                checked={isSubscribed}
                                onChange={(e) => setIsSubscribed(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-700 bg-gray-900 text-[#00f0ff] focus:border-[#00f0ff] focus:ring-0/50 focus:ring-offset-0"
                            />
                            <label htmlFor="isSubscribed" className="text-sm text-gray-400 leading-tight cursor-pointer select-none">
                                <span className="text-gray-200 font-medium block mb-1">Stay informed with Skhy AI</span>
                                Subscribe to our newsletter for the latest updates on defense technology, AI advancements, and marketplace highlights.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (cloudflareAuthEnabled && !captchaToken)}
                            className="w-full bg-[#00f0ff] text-black py-3 px-4 rounded-lg font-semibold hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Creating account...</span>
                                </div>
                            ) : (
                                'Create Customer Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-4">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#00f0ff] hover:text-white font-semibold transition">
                                Sign in
                            </Link>
                        </p>
                        <div className="pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-500">
                                Want to sell on Skhy?{' '}
                                <Link to="/register" className="text-[#00f0ff] hover:text-white transition">
                                    Apply as a Partner
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
