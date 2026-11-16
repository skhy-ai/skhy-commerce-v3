import React, { useState } from 'react';
import { ShieldAlert, Zap, Cpu, X, CheckCircle2 } from 'lucide-react';
import { useSavedMissions } from '../../../hooks/useSavedMissions';
import { useAuth } from '../../../contexts/AuthContext';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { submitInterest } = useSavedMissions();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState(user?.email || '');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const { success } = await submitInterest(email);
        if (success) {
            setSuccess(true);
        } else {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
                {/* Header Graphic */}
                <div className="bg-gradient-to-r from-sky-900 to-indigo-900 px-6 py-8 relative text-center">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/20 rounded-full p-2">
                        <X className="w-5 h-5" />
                    </button>
                    <ShieldAlert className="w-12 h-12 text-sky-400 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Mission Save Limit Reached</h2>
                    <p className="text-sky-200 text-sm mt-2">Upgrade to Build Your Own Autonomy PRO</p>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-6">
                            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Interest Recorded</h3>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                Thank you for your interest in Build Your Own Autonomy PRO. Our team will reach out to you shortly to finalize your subscription upgrade and unlock unlimited configurations.
                            </p>
                            <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-600 transition-colors">
                                Return to Simulator
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                                You currently have <strong className="text-white">1 saved active mission</strong>. The free tier allows you to compare and iterate on a single configuration. Upgrade to <strong>PRO</strong> to unlock unlimited comparative architectural builds, historical tracking, and direct hardware API integration.
                            </p>
                            
                            <ul className="space-y-4 mb-6">
                                <li className="flex gap-3 text-sm text-slate-300">
                                    <Zap className="w-5 h-5 text-sky-400 shrink-0" />
                                    <span>Save unlimited multi-domain mission load-outs.</span>
                                </li>
                                <li className="flex gap-3 text-sm text-slate-300">
                                    <Cpu className="w-5 h-5 text-sky-400 shrink-0" />
                                    <span>Directly export BOM to CRM / ERP software.</span>
                                </li>
                            </ul>

                            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 mb-6 text-center">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">Early Access Pricing</span>
                                <span className="text-2xl font-black text-white">$49</span>
                                <span className="text-slate-500">/mo</span>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">Notification Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                                        placeholder="admin@yourcompany.com"
                                    />
                                </div>
                                <div className="text-xs text-amber-500 mb-4 text-center">
                                    * Stripe integration is currently pending. Submit your email to join the waitlist and a representative will contact you immediately.
                                </div>
                                <button type="submit" disabled={submitting} className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg uppercase tracking-wider text-sm transition-all shadow-xl shadow-sky-900/20">
                                    {submitting ? 'Submitting...' : 'Request PRO Upgrade'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
