import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Handles Supabase auth redirects:
 *  - Email verification after signup (type=signup)
 *  - Password reset (type=recovery)
 *  - Magic link login (type=magiclink)
 *
 * Supabase sends users here after they click the link in their email.
 * The URL contains an access_token (hash fragment) or a code (PKCE).
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically exchanges the code/token from URL
        // getSession() will pick up the session from the URL hash or search params
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Verification failed. The link may have expired. Please try registering again.');
          setTimeout(() => navigate('/register'), 4000);
          return;
        }

        if (!session) {
          // No session yet — might need to exchange the hash token
          // This handles the implicit flow where tokens are in the URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const type = hashParams.get('type');

          if (accessToken && refreshToken) {
            const { data: { session: newSession }, error: setError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setError || !newSession) {
              setStatus('error');
              setMessage('Verification failed. Please try again.');
              setTimeout(() => navigate('/login'), 3000);
              return;
            }

            // Redirect based on type and user type
            await redirectUser(newSession.user, type);
          } else {
            // No tokens found — redirect to login
            navigate('/login');
          }
          return;
        }

        // Session exists — determine redirect
        const searchParams = new URLSearchParams(window.location.search);
        const type = searchParams.get('type') || new URLSearchParams(window.location.hash.substring(1)).get('type');
        await redirectUser(session.user, type);
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setStatus('error');
        setMessage('Something went wrong. Redirecting to login...');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    const redirectUser = async (user: any, type: string | null) => {
      // Handle password recovery
      if (type === 'recovery') {
        setStatus('success');
        setMessage('Password reset link confirmed! Redirecting...');
        setTimeout(() => navigate('/reset-password'), 1500);
        return;
      }

      // Determine user type from metadata or DB
      const userType = user.user_metadata?.user_type || user.app_metadata?.user_type;
      const onboardingComplete = user.user_metadata?.onboarding_complete;

      // For signup confirmations
      if (type === 'signup' || type === 'magiclink' || !type) {
        if (userType === 'partner') {
          setStatus('success');
          if (!onboardingComplete) {
            setMessage('Email confirmed! Taking you to partner onboarding...');
            setTimeout(() => navigate('/partner/onboarding'), 1500);
          } else {
            setMessage('Welcome back! Taking you to your dashboard...');
            setTimeout(() => navigate('/partner/dashboard'), 1500);
          }
        } else if (userType === 'customer' || userType === 'buyer') {
          setStatus('success');
          setMessage('Email confirmed! Welcome to the Skhy marketplace!');
          setTimeout(() => navigate('/marketplace'), 1500);
        } else {
          // Unknown user type — check DB
          try {
            const { data } = await supabase
              .from('users')
              .select('user_type')
              .eq('user_id', user.id)
              .maybeSingle();

            if (data?.user_type === 'partner') {
              setStatus('success');
              setMessage('Email confirmed! Taking you to partner onboarding...');
              setTimeout(() => navigate('/partner/onboarding'), 1500);
            } else {
              setStatus('success');
              setMessage('Email confirmed! Welcome to Skhy!');
              setTimeout(() => navigate('/marketplace'), 1500);
            }
          } catch {
            setStatus('success');
            setMessage('Account verified! Redirecting...');
            setTimeout(() => navigate('/marketplace'), 1500);
          }
        }
      } else {
        navigate('/marketplace');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="max-w-md w-full text-center">
        <a href="/" className="inline-block mb-8">
          <img
            src="/skhy-logo.jpg"
            alt="Skhy AI Logo"
            className="h-14 w-auto mx-auto rounded-lg hover:opacity-90 transition"
          />
        </a>

        <div className={`rounded-2xl p-8 shadow-2xl border ${
          status === 'error'
            ? 'bg-red-900/30 border-red-700/50'
            : status === 'success'
            ? 'bg-green-900/30 border-green-700/50'
            : 'bg-gray-800/50 border-gray-700/50'
        } backdrop-blur-sm`}>
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              <p className="text-gray-300 text-lg">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Success!</h2>
              <p className="text-green-300">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
              <p className="text-red-300">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
