import React, { useState } from 'react';
import { X, Send, CheckCircle2, Loader2, User, Mail, Building2, Phone, MessageSquare, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { saveWaitlistLead } from '../services/leadStorageService';

interface ExpressInterestModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName?: string;
    productId?: string;
    isResidential?: boolean;
}

const ExpressInterestModal: React.FC<ExpressInterestModalProps> = ({ isOpen, onClose, productName = '', productId = '', isResidential = false }) => {
    const [selectedProduct, setSelectedProduct] = useState(productName || 'Autonomous Acoustic Sentinels & C-UAS Defense');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync selectedProduct if prop changes
    React.useEffect(() => {
        if (productName) {
            setSelectedProduct(productName);
        }
    }, [productName]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const targetProduct = selectedProduct.trim() || productName || 'General Hardware Inquiry';

        try {
            await saveWaitlistLead({
                email: formData.email,
                name: formData.fullName,
                fullName: formData.fullName,
                phone: formData.phone,
                company: formData.company,
                companyName: formData.company,
                productName: targetProduct,
                productId: productId,
                intent: 'product_interest',
                source: 'express_interest_form',
                message: formData.message
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({ fullName: '', email: '', phone: '', company: '', message: '' });
            }, 3000);
        } catch (err: any) {
            console.error('Error submitting interest:', err);
            setError('Failed to submit. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md font-sans">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl relative shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Express Interest</h2>
                        <p className="text-slate-500 text-sm mt-1">Join the official waitlist and receive technical datasheets</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8">
                    {success ? (
                        <div className="py-12 flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Thank You!</h3>
                            <p className="text-slate-600 max-w-xs">
                                We've recorded your interest in <strong className="text-slate-900">{selectedProduct}</strong>. Our team will contact you shortly with full technical specifications.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                                    {error}
                                </div>
                            )}

                            {/* Product / Solution Interest Input (Pre-populated) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Product / Hardware Interest</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-sky-50/50 border border-sky-200 rounded-xl font-medium text-sky-900 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                    placeholder="Target product or solution name"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-slate-800"
                                            placeholder="John Doe"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
                                        {isResidential ? 'Email' : 'Work Email'}
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="email"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-slate-800"
                                            placeholder={isResidential ? "john@example.com" : "john@company.com"}
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-slate-800"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {!isResidential && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Company</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-slate-800"
                                                placeholder="Acme Corp"
                                                value={formData.company}
                                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Message (Optional)</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <textarea
                                        rows={3}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-slate-800 resize-none"
                                        placeholder="Tell us about your requirements..."
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg shadow-sky-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        Submit Interest
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-center text-slate-400 px-4">
                                By submitting, you agree to be contacted regarding {selectedProduct || 'our products'} and future updates.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpressInterestModal;
