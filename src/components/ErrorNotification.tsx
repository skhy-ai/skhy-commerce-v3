import React, { useEffect, useState } from 'react';
import { AlertCircle, X, MessageSquare, RefreshCw } from 'lucide-react';
import { ErrorInfo } from '../utils/ErrorHandler';

interface ErrorNotificationProps {
    error: ErrorInfo | null;
    onClose: () => void;
    onRetry?: () => void;
    onGetHelp?: () => void;
    autoHideDuration?: number;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
    error,
    onClose,
    onRetry,
    onGetHelp,
    autoHideDuration = 0 // 0 means don't auto-hide
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (error) {
            setIsVisible(true);

            if (autoHideDuration > 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, autoHideDuration);

                return () => clearTimeout(timer);
            }
        } else {
            setIsVisible(false);
        }
    }, [error, autoHideDuration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    if (!error) return null;

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-md transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm shadow-2xl">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-red-500 font-semibold text-sm">
                                {error.title}
                            </h3>
                            <button
                                onClick={handleClose}
                                className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-red-200 text-sm mb-1">
                            {error.message}
                        </p>

                        <p className="text-red-300/80 text-xs mb-3">
                            {error.suggestion}
                        </p>

                        <div className="flex gap-2 flex-wrap">
                            {error.canRetry && onRetry && (
                                <button
                                    onClick={() => {
                                        onRetry();
                                        handleClose();
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Try Again
                                </button>
                            )}

                            {error.shouldShowChatbot && onGetHelp && (
                                <button
                                    onClick={() => {
                                        onGetHelp();
                                        handleClose();
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-lg text-xs font-medium transition-colors"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Get Help
                                </button>
                            )}
                        </div>

                        {error.technicalDetails && (
                            <details className="mt-3 text-xs">
                                <summary className="text-red-400/60 cursor-pointer hover:text-red-400/80 transition-colors">
                                    Technical details
                                </summary>
                                <pre className="mt-2 p-2 bg-navy-900/50 rounded text-red-300/60 overflow-x-auto text-[10px]">
                                    {error.technicalDetails}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
