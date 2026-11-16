import React, { useState } from 'react';
import { X, Mail, CheckCircle, AlertTriangle, List, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MarketplaceProduct } from '../../types/partner';

interface DelistModalProps {
    isOpen: boolean;
    onClose: () => void;
    sellerId: string;
    sellerEmail: string;
    products: MarketplaceProduct[];
}

export const DelistModal: React.FC<DelistModalProps> = ({ isOpen, onClose, sellerId, sellerEmail, products }) => {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: Selection, 3: Success
    const [selectedProducts, setSelectedProducts] = useState<(string | number)[]>([]);
    const [isFullPage, setIsFullPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const sellerDomain = sellerEmail ? sellerEmail.split('@')[1]?.toLowerCase() : '';
    const isSkhyInternal = sellerDomain === 'skhy.systems' || sellerEmail === 'sales@skhy.systems';

    const handleVerifyEmail = () => {
        if (!email) {
            setError('Please enter your business email address.');
            return;
        }

        const inputEmail = email.trim().toLowerCase();
        const inputDomain = inputEmail.split('@')[1];
        
        // Security check: Must match seller's registered domain
        if (sellerDomain && inputDomain === sellerDomain) {
            setStep(2);
            setError('');
        } else if (isSkhyInternal && inputDomain === 'skhy.systems') {
            // Special case for SKHY internal accounts
            setStep(2);
            setError('');
        } else if (!sellerDomain) {
            // If seller email is missing from DB, we'll allow the request but it will require strict admin review
            setStep(2);
            setError('');
        } else {
            setError(`Security Error: This request must be verified by an email from the @${sellerDomain} domain.`);
        }
    };

    const toggleProduct = (id: string | number) => {
        setSelectedProducts(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!isFullPage && selectedProducts.length === 0) {
            setError('Please select at least one product to delist, or choose to delist the whole page.');
            return;
        }

        setLoading(true);
        try {
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            
            const { error: insertError } = await supabase.from('delist_requests').insert({
                seller_id: sellerId,
                email: email,
                products: isFullPage ? products.map(p => p.id) : selectedProducts,
                is_full_page: isFullPage,
                token: token,
                confirmed: false
            });

            if (insertError) throw insertError;
            
            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-xl">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Delist Offerings</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-slate-600 text-sm leading-relaxed">
                                {isSkhyInternal 
                                    ? "This page is managed by SKHY. Please verify your internal authority by entering your @skhy.systems email address."
                                    : `To protect manufacturers, delisting requests must be verified. Please enter your professional email associated with @${sellerDomain || 'the manufacturer domain'}.`
                                }
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Business Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={`you@${sellerDomain}`}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-xs text-red-600">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <button 
                                onClick={handleVerifyEmail}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                            >
                                Verify & Continue
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 mb-2">What would you like to delist?</h3>
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => setIsFullPage(true)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                            isFullPage ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-500/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <ShieldAlert className="w-5 h-5" />
                                            <span className="font-semibold">Whole Seller Profile</span>
                                        </div>
                                        {isFullPage && <CheckCircle className="w-5 h-5" />}
                                    </button>
                                    <button 
                                        onClick={() => setIsFullPage(false)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                            !isFullPage ? 'bg-red-50 border-red-200 text-red-700 ring-2 ring-red-500/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <List className="w-5 h-5" />
                                            <span className="font-semibold">Specific Products</span>
                                        </div>
                                        {!isFullPage && <CheckCircle className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {!isFullPage && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Products</label>
                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {products.map(p => (
                                            <button 
                                                key={p.id}
                                                onClick={() => toggleProduct(p.id)}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-all ${
                                                    selectedProducts.includes(p.id) ? 'bg-white border-red-400 text-red-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                <span className="truncate">{p.name}</span>
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedProducts.includes(p.id) ? 'bg-red-500 border-red-500 text-white' : 'border-slate-300'}`}>
                                                    {selectedProducts.includes(p.id) && <CheckCircle className="w-4 h-4" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-xs text-red-600">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="pt-2">
                                <button 
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        'Request Delisting'
                                    )}
                                </button>
                                <button 
                                    onClick={() => setStep(1)}
                                    className="w-full mt-2 py-2 text-slate-500 text-xs font-semibold hover:text-slate-800 transition-colors"
                                >
                                    Back to Email Verification
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Request Submitted</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                A confirmation link has been sent to <strong>{email}</strong>. 
                                Please click the link in your email to finalize the delisting process.
                            </p>
                            <p className="text-[10px] text-slate-400 italic mb-6">
                                Note: This is a simulation. In production, this would trigger an SMTP event.
                            </p>
                            <button 
                                onClick={onClose}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
