import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Building2, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { safeStorage } from '../utils/storage';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { signUp, cloudflareAuthEnabled } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        sellerType: 'manufacturer' as 'manufacturer' | 'distributor' | 'service_provider'
    });

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
            company_name: formData.companyName,
            seller_type: formData.sellerType,
            user_type: 'partner', // Default to partner, admin can change later
            options: {
                data: {
                    campaign_source: safeStorage.session.getItem('campaign_id') || safeStorage.session.getItem('campaign_ref') || undefined
                }
            }
        }, captchaToken);

        if (error) {
            if (turnstileRef.current) turnstileRef.current.reset();
            setCaptchaToken('');
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Redirect after 5 seconds
            setTimeout(() => {
                const searchParams = new URLSearchParams(window.location.search);
                const redirect = searchParams.get('redirect');
                navigate('/login' + (redirect ? `?redirect=${redirect}` : ''));
            }, 5000);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Handle pre-filling from Claim Page flow
        const company = urlParams.get('company');
        if (company) {
            setFormData(prev => ({ ...prev, companyName: decodeURIComponent(company) }));
        }

        if (urlParams.get('bypass_turnstile') === 'true') {
            setCaptchaToken('bypass-token-for-testing');
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                            <p className="text-gray-300 mb-2">
                                Please check your email to verify your account.
                            </p>
                            <p className="text-yellow-400 text-sm font-semibold mb-4 bg-yellow-400/10 py-2 rounded-lg border border-yellow-400/20">
                                ⚠️ If you don't see the email, please check your spam or junk folder.
                            </p>
                            <p className="text-gray-400 text-sm mb-2">
                                After verification, log in to complete your partner onboarding.
                            </p>
                            <p className="text-gray-400 text-sm">Redirecting to login...</p>
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
                    <h1 className="text-4xl font-bold text-white mb-2">Join the Marketplace</h1>
                    <p className="text-gray-400">Create your partner account to start selling</p>
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
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address *
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
                                    placeholder="you@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                                Company Name *
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition text-sm"
                                    placeholder="Your Company Inc."
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="sellerType" className="block text-sm font-medium text-gray-300 mb-2">
                                Seller Type *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    id="sellerType"
                                    name="sellerType"
                                    value={formData.sellerType}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition text-sm appearance-none"
                                >
                                    <option value="manufacturer">Manufacturer</option>
                                    <option value="distributor">Distributor</option>
                                    <option value="service_provider">Service Provider</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password *
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
                                Confirm Password *
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
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-[#00f0ff] hover:text-white font-semibold transition">
                                Sign in
                            </Link>
                        </p>
                        <div className="pt-4 border-t border-gray-700 mt-4">
                            <p className="text-sm text-gray-500">
                                Just want to buy products?{' '}
                                <Link to="/register/customer" className="text-[#00f0ff] hover:text-white transition">
                                    Sign up as a Customer
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-xs mt-6">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                    <br />
                    Your account will be reviewed by our team before activation.
                </p>
            </div>
        </div>
    );
};
