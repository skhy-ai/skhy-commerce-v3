import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useAuth } from '../../contexts/AuthContext';
import { useDeviceOtp } from '../../hooks/useDeviceOtp';
import { ShieldCheck, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [captchaToken, setCaptchaToken] = useState('');
    const { cloudflareAuthEnabled } = useAuth();
    const turnstileRef = React.useRef<TurnstileInstance>(null);

    // Device OTP step-up (7-day trust for admin)
    const { isNewDevice, sendDeviceOtp, verifyAndTrust } = useDeviceOtp({ role: 'admin' });
    const [deviceOtpStep, setDeviceOtpStep] = useState(false);
    const [deviceOtpCode, setDeviceOtpCode] = useState('');
    const [deviceOtpSending, setDeviceOtpSending] = useState(false);
    const [loggedInUserId, setLoggedInUserId] = useState('');

    const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log("AdminLogin: Attempting to sign in...", { email, cloudflareAuthEnabled, hasCaptcha: !!captchaToken });
        
        setLoading(true);
        setError(null);

        if (cloudflareAuthEnabled && !captchaToken) {
            console.log("AdminLogin: Missing CAPTCHA token");
            setError('Please complete the CAPTCHA validation.');
            setLoading(false);
            return;
        }

        try {
            console.log("AdminLogin: Calling supabase.auth.signInWithPassword...");
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
                options: {
                    captchaToken,
                }
            });

            console.log("AdminLogin: signInWithPassword returned", { hasData: !!data?.user, authError });

            if (authError) {
                console.error("AdminLogin: Auth Error encountered:", authError);
                setError(authError.message);
                
                turnstileRef.current?.reset?.();
                setCaptchaToken('');
            } else {
                // ── Password OK — check device trust ──────────────────────────
                if (isNewDevice(email)) {
                    console.log("AdminLogin: New device detected. Sending OTP...");
                    setLoggedInUserId(data.user?.id || '');
                    setDeviceOtpSending(true);
                    const { error: otpErr } = await sendDeviceOtp(email);
                    setDeviceOtpSending(false);
                    if (otpErr) {
                        setError(`Could not send verification code: ${otpErr.message}`);
                        return;
                    }
                    setDeviceOtpStep(true);
                    return;
                }

                console.log("AdminLogin: Login successful. Navigating to /admin...");
                navigate('/admin');
            }
        } catch (err: any) {
            console.error("AdminLogin: Unexpected exception during login:", err);
            setError(err?.message || "An unexpected error occurred during admin login");
            if (turnstileRef.current) turnstileRef.current.reset();
            setCaptchaToken('');
        } finally {
            setLoading(false);
        }
    };

    // ── Device OTP verification handler ──────────────────────────────────────
    const handleVerifyDevice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (deviceOtpCode.length !== 8) {
            setError('Please enter the 8-digit code from your email.');
            return;
        }
        setLoading(true);
        setError(null);
        console.log("AdminLogin: Verifying device OTP...");
        const { error: verifyErr } = await verifyAndTrust(email, deviceOtpCode, loggedInUserId);
        if (verifyErr) {
            setError(`Invalid code: ${verifyErr.message}`);
            setLoading(false);
            return;
        }
        console.log("AdminLogin: Device verified. Navigating to /admin...");
        navigate('/admin');
    };

    // ── Device OTP verification screen ────────────────────────────────────────
    if (deviceOtpStep) {
        return (
            <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-navy-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <ShieldCheck className="w-12 h-12 text-turquoise-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Security Verification</h1>
                        <p className="text-gray-400 mt-2">
                            An 8-digit code was sent to <span className="text-white">{email}</span>. 
                            Please enter it to verify this device.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleVerifyDevice} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={8}
                                    value={deviceOtpCode}
                                    onChange={(e) => setDeviceOtpCode(e.target.value.replace(/\D/g, ''))}
                                    autoFocus
                                    className="w-full bg-navy-950 border border-gray-700 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-turquoise-500 transition-colors text-center tracking-widest text-xl font-mono"
                                    placeholder="00000000"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                This device will be trusted for 7 days once verified.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || deviceOtpCode.length !== 8}
                            className="w-full bg-gradient-to-r from-turquoise-500 to-blue-600 hover:from-turquoise-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Verifying...' : 'Verify & Access Dashboard'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setDeviceOtpStep(false); setDeviceOtpCode(''); setError(null); }}
                            className="w-full text-gray-400 hover:text-gray-300 text-sm transition-colors flex items-center justify-center gap-1"
                        >
                            <ArrowLeft className="w-3 h-3" /> Back to login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-navy-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <a href="/" className="inline-block mb-6">
                        <img
                            src="/skhy-logo.jpg"
                            alt="Skhy AI Logo"
                            className="h-16 w-auto mx-auto rounded-lg"
                        />
                    </a>
                    <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    <p className="text-gray-400 mt-2">Enter your credentials to continue</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-navy-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise-500 transition-colors"
                            placeholder="admin@skhy.systems"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-navy-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {cloudflareAuthEnabled && (
                        <div className="flex justify-center">
                            <Turnstile
                                ref={turnstileRef}
                                siteKey={TURNSTILE_SITE_KEY}
                                onSuccess={(token) => setCaptchaToken(token)}
                                options={{ theme: 'dark' }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || deviceOtpSending || (cloudflareAuthEnabled && !captchaToken)}
                        className="w-full bg-gradient-to-r from-turquoise-500 to-blue-600 hover:from-turquoise-400 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || deviceOtpSending ? (deviceOtpSending ? 'Sending Code...' : 'Signing in...') : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
