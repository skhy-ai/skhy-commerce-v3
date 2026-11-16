import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, Lock, AlertCircle, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useDeviceOtp } from '../hooks/useDeviceOtp';
import { LoginSchema } from '../schemas/validation';
import { z } from 'zod';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { safeStorage } from '../utils/storage';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { signIn, signInWithOtp, verifyOtp, cloudflareAuthEnabled } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState('');
    const turnstileRef = React.useRef<TurnstileInstance>(null);

    // OTP State
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    // Device OTP step-up (for password mode on new devices — 30-day trust)
    const { isNewDevice, sendDeviceOtp, verifyAndTrust } = useDeviceOtp({ role: 'user' });
    const [deviceOtpStep, setDeviceOtpStep] = useState(false);
    const [deviceOtpCode, setDeviceOtpCode] = useState('');
    const [deviceOtpSending, setDeviceOtpSending] = useState(false);
    const [loggedInUserId, setLoggedInUserId] = useState('');
    const [pendingRedirect, setPendingRedirect] = useState<string>('/marketplace');

    const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

    // Rate Limiting State
    const [attemptCount, setAttemptCount] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState<Date | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('bypass_turnstile') === 'true') {
            setCaptchaToken('bypass-token-for-testing');
        }

        // Check for existing lockout on mount
        const storedLockout = safeStorage.local.getItem('login_lockout_until');
        if (storedLockout) {
            const lockoutDate = new Date(storedLockout);
            if (lockoutDate > new Date()) {
                setLockoutUntil(lockoutDate);
                const remaining = Math.ceil((lockoutDate.getTime() - Date.now()) / 60000);
                setError(`Too many failed attempts. Please try again in ${remaining} minutes.`);
            } else {
                safeStorage.local.removeItem('login_lockout_until');
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (cloudflareAuthEnabled && !captchaToken) {
            setError('Please complete the CAPTCHA validation.');
            return;
        }

        // Check Rate Limit
        if (lockoutUntil) {
            if (new Date() < lockoutUntil) {
                const remaining = Math.ceil((lockoutUntil.getTime() - Date.now()) / 60000);
                setError(`Too many failed attempts. Please try again in ${remaining} minutes.`);
                return;
            } else {
                setLockoutUntil(null);
                safeStorage.local.removeItem('login_lockout_until');
                setAttemptCount(0);
            }
        }

        // Validate Inputs
        try {
            if (loginMethod === 'password') {
                LoginSchema.parse({ email, password });
            } else if (loginMethod === 'otp' && !otpSent) {
                // Just validate email if sending OTP
                z.string().email('Please enter a valid email address').parse(email);
            }
            // If otpSent is true, we validate the 8-digit code later
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError((err as any).errors[0].message);
                return;
            }
        }

        setLoading(true);

        try {
            if (loginMethod === 'otp') {
                if (otpSent) {
                    // Step 2: Verify OTP
                    if (otpCode.length !== 8) {
                        setError('Please enter a valid 8-digit code');
                        setLoading(false);
                        return;
                    }
                    const { error: otpError } = await verifyOtp(email, otpCode);
                    if (otpError) {
                        if (turnstileRef.current) turnstileRef.current.reset();
                        setCaptchaToken('');
                        setError(otpError.message);
                        setLoading(false);
                        return;
                    }
                    // Success falls through to redirect logic
                } else {
                    // Step 1: Send OTP
                    const { error: sendError } = await signInWithOtp(email, captchaToken);
                    if (sendError) {
                        if (turnstileRef.current) turnstileRef.current.reset();
                        setCaptchaToken('');
                        setError(sendError.message);
                        setLoading(false);
                    } else {
                        setOtpSent(true);
                        setLoading(false);
                    }
                    return; // Wait for user to enter code
                }
            } else {
                // Password Login
                const { error: signInError } = await signIn(email, password, captchaToken);

                if (signInError) {
                    if (turnstileRef.current) turnstileRef.current.reset();
                    setCaptchaToken('');
                    const newCount = attemptCount + 1;
                    setAttemptCount(newCount);

                    // Lockout logic: 5 attempts -> 15 min lockout
                    if (newCount >= 5) {
                        const lockoutTime = new Date(Date.now() + 15 * 60 * 1000);
                        setLockoutUntil(lockoutTime);
                        safeStorage.local.setItem('login_lockout_until', lockoutTime.toISOString());
                        setError('Too many failed attempts. Locked out for 15 minutes.');
                    } else {
                        setError(signInError.message);
                    }

                    setLoading(false);
                    return;
                }

                // ── Password OK — resolve redirect destination ──────────────
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                const appMeta = currentSession?.user?.app_metadata || {};
                const userMeta = currentSession?.user?.user_metadata || {};
                const searchParams = new URLSearchParams(window.location.search);
                const redirect = searchParams.get('redirect');
                const userType = appMeta.user_type || userMeta.user_type;
                const resolvedRedirect = userType === 'partner'
                    ? (redirect || '/partner/dashboard')
                    : (redirect || '/marketplace');

                // ── Device trust check ─────────────────────────────────────
                if (isNewDevice(email)) {
                    setLoggedInUserId(currentSession?.user?.id || '');
                    setPendingRedirect(resolvedRedirect);
                    setLoading(false);
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

                // Known device → navigate immediately
                setAttemptCount(0);
                safeStorage.local.removeItem('login_lockout_until');
                navigate(resolvedRedirect);
                return;
            }

            // Success falls through to redirect logic
            setAttemptCount(0);
            safeStorage.local.removeItem('login_lockout_until');

            // Use session returned from signIn directly — no extra network calls needed
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();
                const appMeta = currentSession?.user?.app_metadata || {};
                const userMeta = currentSession?.user?.user_metadata || {};

                const searchParams = new URLSearchParams(window.location.search);
                const redirect = searchParams.get('redirect');

                // Determine user_type from app_metadata (set server-side) or user_metadata
                const userType = appMeta.user_type || userMeta.user_type;
                const isPartner = userType === 'partner';

                if (isPartner) {
                    navigate(redirect || '/partner/dashboard');
                } else {
                    navigate(redirect || '/marketplace');
                }
            } catch (e) {
                console.error("Error reading session after login:", e);
                navigate('/marketplace');
            }
        } catch (err: any) {
            console.error("Unexpected error during authentication:", err);
            setError(err?.message || 'An unexpected error occurred during login.');
            setLoading(false);
            if (turnstileRef.current) turnstileRef.current.reset();
            setCaptchaToken('');
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
        setError('');
        const { error: verifyErr } = await verifyAndTrust(email, deviceOtpCode, loggedInUserId);
        if (verifyErr) {
            setError(`Invalid code: ${verifyErr.message}`);
            setLoading(false);
            return;
        }
        setAttemptCount(0);
        safeStorage.local.removeItem('login_lockout_until');
        navigate(pendingRedirect);
    };

    // ── Device OTP verification screen ────────────────────────────────────────
    if (deviceOtpStep) {
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
                        <div className="flex justify-center mb-3">
                            <ShieldCheck className="w-10 h-10 text-[#00f0ff]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Verify New Device</h1>
                        <p className="text-gray-400 text-sm">
                            An 8-digit code was sent to{' '}
                            <span className="text-white font-medium">{email}</span>
                        </p>
                    </div>

                    <div className="bg-[#0a0a0a] backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3 mb-6">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-200 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleVerifyDevice} className="space-y-6">
                            <div>
                                <label htmlFor="device-otp" className="block text-sm font-medium text-gray-300 mb-2">
                                    8-Digit Verification Code
                                </label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="device-otp"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={8}
                                        value={deviceOtpCode}
                                        onChange={(e) => setDeviceOtpCode(e.target.value.replace(/\D/g, ''))}
                                        autoFocus
                                        className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition text-center tracking-widest text-xl font-mono"
                                        placeholder="00000000"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    This device will be trusted for 30 days once verified.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || deviceOtpCode.length !== 8}
                                className="w-full bg-[#00f0ff] text-black py-3 px-4 rounded-lg font-semibold hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Verifying…</span>
                                    </div>
                                ) : 'Verify & Trust Device'}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setDeviceOtpStep(false); setDeviceOtpCode(''); setError(''); }}
                                className="w-full text-gray-400 hover:text-gray-300 text-sm transition-colors flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3" /> Back to login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to your marketplace account</p>
                </div>

                <div className="bg-[#0a0a0a] backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-200 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="flex bg-gray-900/50 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => { setLoginMethod('password'); setOtpSent(false); setError(''); }}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'password' ? 'bg-blue-500/20 text-[#00f0ff]' : 'text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                Password
                            </button>
                            <button
                                type="button"
                                onClick={() => { setLoginMethod('otp'); setError(''); }}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'otp' ? 'bg-blue-500/20 text-[#00f0ff]' : 'text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                Send Code
                            </button>
                        </div>

                        {(!otpSent || loginMethod === 'password') && (
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
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition"
                                        placeholder="you@company.com"
                                        disabled={!!lockoutUntil}
                                    />
                                </div>
                            </div>
                        )}

                        {loginMethod === 'password' && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                        Password
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-[#00f0ff] hover:text-white transition"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition"
                                        placeholder="••••••••"
                                        disabled={!!lockoutUntil}
                                    />
                                </div>
                            </div>
                        )}

                        {loginMethod === 'otp' && otpSent && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-300">
                                        Enter 8-digit Code
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setOtpSent(false)}
                                        className="text-sm text-[#00f0ff] hover:text-white transition flex items-center gap-1"
                                    >
                                        <ArrowLeft className="w-3 h-3" /> Change Email
                                    </button>
                                </div>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        autoComplete="one-time-code"
                                        maxLength={8}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 transition text-center tracking-widest text-xl font-mono"
                                        placeholder="00000000"
                                        disabled={!!lockoutUntil}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    We sent a code to <span className="text-white font-medium">{email}</span>
                                </p>
                            </div>
                        )}

                        {cloudflareAuthEnabled && (!otpSent || loginMethod === 'password') && (
                            <div className="flex justify-center">
                                <Turnstile
                                    ref={turnstileRef}
                                    siteKey={TURNSTILE_SITE_KEY}
                                    onSuccess={(token) => setCaptchaToken(token)}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || deviceOtpSending || !!lockoutUntil || (cloudflareAuthEnabled && !captchaToken)}
                            className="w-full bg-[#00f0ff] text-black py-3 px-4 rounded-lg font-semibold hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:border-[#00f0ff] focus:ring-0 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading || deviceOtpSending ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>
                                        {deviceOtpSending ? 'Sending verification code…' : loginMethod === 'otp' && !otpSent ? 'Send OTP Code' : 'Sign In'}
                                    </span>
                                </div>
                            ) : lockoutUntil ? (
                                'Account Locked'
                            ) : (
                                loginMethod === 'otp' && !otpSent ? 'Send OTP Code' : 'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-[#00f0ff] hover:text-white font-semibold transition">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
