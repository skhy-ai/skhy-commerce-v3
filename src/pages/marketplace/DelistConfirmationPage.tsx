import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const DelistConfirmationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [details, setDetails] = useState<{ isFullPage: boolean, productCount: number } | null>(null);

    useEffect(() => {
        const confirmDelisting = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid or missing confirmation token.');
                return;
            }

            try {
                // 1. Find the request by token
                const { data: request, error: fetchError } = await supabase
                    .from('delist_requests')
                    .select('*')
                    .eq('token', token)
                    .eq('confirmed', false)
                    .single();

                if (fetchError || !request) {
                    throw new Error('This confirmation link is invalid or has already been used.');
                }

                // 2. Mark request as confirmed by seller and move to pending admin
                const { error: updateError } = await supabase
                    .from('delist_requests')
                    .update({ 
                        confirmed: true,
                        status: 'pending_admin'
                    })
                    .eq('id', request.id);

                if (updateError) throw updateError;

                setDetails({
                    isFullPage: request.is_full_page,
                    productCount: Array.isArray(request.products) ? request.products.length : 0
                });
                setStatus('success');
                setMessage('Your identity has been verified. Your delisting request has been submitted to the marketplace administrators for final approval.');

            } catch (err: any) {
                console.error('Delisting confirmation error:', err);
                setStatus('error');
                setMessage(err.message || 'An unexpected error occurred during confirmation.');
            }
        };

        confirmDelisting();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            
            <main className="flex-1 flex items-center justify-center p-4 pt-32 pb-20">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="p-8 text-center">
                        {status === 'loading' && (
                            <div className="space-y-6">
                                <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold text-slate-900">Verifying Request</h1>
                                    <p className="text-slate-500">Please wait while we process your delisting confirmation...</p>
                                </div>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="space-y-6">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <ShieldCheck className="w-10 h-10 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold text-slate-900">Delisting Confirmed</h1>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {message}
                                        </p>
                                        <ul className="mt-4 space-y-2 text-xs font-medium text-slate-500">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                Action: {details?.isFullPage ? 'Profile Removal' : 'Product Removal'}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                Impact: {details?.isFullPage ? 'All products hidden' : `${details?.productCount} products hidden`}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => navigate('/marketplace')}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Home className="w-5 h-5" /> Return to Marketplace
                                    </button>
                                </div>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-6">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                    <AlertTriangle className="w-10 h-10 text-red-600" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold text-slate-900">Confirmation Failed</h1>
                                    <p className="text-slate-500">{message}</p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => navigate('/marketplace')}
                                        className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all"
                                    >
                                        Back to Marketplace
                                    </button>
                                    <a 
                                        href="mailto:support@skhy.ai"
                                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        Contact Support
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Bottom accent bar */}
                    <div className={`h-1.5 w-full ${
                        status === 'success' ? 'bg-green-500' : 
                        status === 'error' ? 'bg-red-500' : 'bg-sky-500 animate-pulse'
                    }`} />
                </div>
            </main>

            <Footer />
        </div>
    );
};
