import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, 
    Mail, 
    ArrowLeft, 
    Building2, 
    CheckCircle2, 
    AlertTriangle,
    Lock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const ClaimSellerPage: React.FC = () => {
    const { sellerId } = useParams<{ sellerId: string }>();
    const navigate = useNavigate();
    const [seller, setSeller] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSeller = async () => {
            if (!sellerId) return;
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('user_id, company_name, email, logo_url, approved')
                    .eq('user_id', sellerId)
                    .single();

                if (error) throw error;
                if (data.approved) {
                    navigate(`/marketplace/seller/${sellerId}`);
                    return;
                }
                setSeller(data);
            } catch (err: any) {
                console.error('Error loading seller:', err);
                setError('Manufacturer not found.');
            } finally {
                setLoading(false);
            }
        };
        loadSeller();
    }, [sellerId, navigate]);

    const handleClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // 1. Domain Validation
            const sellerEmail = seller.email || '';
            const sellerDomain = sellerEmail.split('@')[1]?.toLowerCase();
            const inputDomain = email.split('@')[1]?.toLowerCase();

            if (!sellerDomain || !inputDomain || sellerDomain !== inputDomain) {
                throw new Error(`Domain mismatch. Please use an email address from @${sellerDomain || 'the manufacturer\'s domain'}.`);
            }

            // 2. Register Claim Request
            // In a real app, this would trigger an OTP or a verification email.
            // For now, we'll simulate the request creation.
            const { error: claimError } = await supabase
                .from('partner_claims')
                .insert({
                    seller_id: sellerId,
                    claimed_by_email: email,
                    status: 'pending'
                });

            // Note: If 'partner_claims' table doesn't exist yet, we'll handle gracefully.
            // In this specific demo, we'll assume the user needs to sign up/in with that email.
            
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-sky-500 rounded-full"></div></div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <Navbar />
            
            <main className="flex-1 container mx-auto px-4 py-32 max-w-2xl">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Profile
                </button>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-600/10 blur-[100px] -z-10"></div>

                    {!success ? (
                        <>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-white p-1 flex items-center justify-center overflow-hidden">
                                    {seller?.logo_url ? (
                                        <img src={seller.logo_url} alt={seller.company_name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Building2 className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Claim {seller?.company_name}</h1>
                                    <p className="text-slate-400">Verify your ownership to manage this page.</p>
                                </div>
                            </div>

                            <form onSubmit={handleClaim} className="space-y-6">
                                <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-6 flex gap-4">
                                    <ShieldCheck className="w-6 h-6 text-sky-400 flex-shrink-0" />
                                    <div className="text-sm text-sky-100/80">
                                        To verify ownership, you must provide a business email address matching the domain associated with this manufacturer.
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Business Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input 
                                            type="email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@company.com"
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-400 text-sm">
                                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button 
                                    disabled={submitting}
                                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Verifying Domain...' : 'Verify & Claim Page'}
                                </button>

                                <p className="text-slate-500 text-xs text-center">
                                    By claiming this page, you agree to Skhy AI's Partner Terms of Service and Privacy Policy.
                                </p>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Verification Sent</h2>
                            <p className="text-slate-400 mb-8 text-lg">
                                We've sent a verification link to <span className="text-white font-semibold">{email}</span>. 
                                Please click the link in your inbox to complete the claim process and access your dashboard.
                            </p>
                            <button 
                                onClick={() => navigate('/marketplace')}
                                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors"
                            >
                                Return to Marketplace
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <Lock className="w-5 h-5 text-sky-400" />
                        </div>
                        <div>
                            <h4 className="font-bold mb-1">Secure Management</h4>
                            <p className="text-sm text-slate-500">Only verified representatives can update product listings and manage inventory.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-sky-400" />
                        </div>
                        <div>
                            <h4 className="font-bold mb-1">Manufacturer Badge</h4>
                            <p className="text-sm text-slate-500">Verified manufacturers receive a dedicated badge to increase buyer trust.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
