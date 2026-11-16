import React from 'react';
import { UserPlus, X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-sky-900 to-indigo-900 px-6 py-6 relative text-center">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/20 rounded-full p-2">
                        <X className="w-5 h-5" />
                    </button>
                    <UserPlus className="w-12 h-12 text-sky-400 mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-white tracking-wider">Authentication Required</h2>
                </div>

                <div className="p-6 text-center">
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                        To save your drone build configuration, please create a customer account or log in if you already have one.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => navigate('/register/customer?redirect=/plan-scenario')}
                            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" /> Create Customer Account
                        </button>
                        <button 
                            onClick={() => navigate('/login?redirect=/plan-scenario')}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-600 flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogIn className="w-4 h-4" /> Log In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
