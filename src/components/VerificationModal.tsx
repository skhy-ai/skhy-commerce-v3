import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user, updateProfile } = useAuth();
    const [status, setStatus] = useState<'idle' | 'uploading' | 'verifying' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleVerify = async () => {
        if (!user) {
            setStatus('error');
            return;
        }

        setStatus('uploading');
        
        // Mock upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('verifying');
        
        // Mock verification delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            const { error } = await updateProfile({ government_id_verified: true });
            if (error) throw error;
            
            setStatus('success');
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (err) {
            console.error('Failed to verify ID', err);
            setStatus('error');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Shield className="text-cyan-500 w-6 h-6" />
                            <h3 className="text-xl font-bold text-white">Government ID Verification</h3>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <p className="text-slate-300 text-sm">
                            Access to tactical features and sovereign hardware requires identity verification. Please upload a valid Government ID.
                        </p>

                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-800/30">
                            {status === 'idle' && (
                                <>
                                    <Upload className="w-10 h-10 text-slate-500 mb-4" />
                                    <p className="text-slate-400 text-sm mb-4">Drag and drop your ID or click to browse</p>
                                    <button
                                        onClick={handleVerify}
                                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Select File
                                    </button>
                                </>
                            )}

                            {(status === 'uploading' || status === 'verifying') && (
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                                    <p className="text-cyan-400 font-medium">
                                        {status === 'uploading' ? 'Uploading securely...' : 'Verifying identity...'}
                                    </p>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="flex flex-col items-center">
                                    <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
                                    <p className="text-emerald-400 font-medium">Identity Verified Successfully</p>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="flex flex-col items-center">
                                    <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
                                    <p className="text-rose-400 font-medium mb-4">Verification failed</p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
