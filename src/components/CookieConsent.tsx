import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { initAnalytics } from '../utils/analytics';

export const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('skhy_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('skhy_cookie_consent', 'true');
        setIsVisible(false);
        
        // Save campaign params retroactively if accepted
        const params = new URLSearchParams(window.location.search);
        const campaignId = params.get('campaign_id');
        const ref = params.get('ref');
        if (campaignId) sessionStorage.setItem('campaign_id', campaignId);
        if (ref) sessionStorage.setItem('campaign_ref', ref);
        
        // Init Analytics
        initAnalytics();
    };

    const handleDecline = () => {
        localStorage.setItem('skhy_cookie_consent', 'false');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-[100] p-4 pointer-events-none sm:p-6 sm:bottom-4 md:left-4 md:w-[420px]">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl p-5 pointer-events-auto flex flex-col gap-4 relative isolate overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -z-10" />
                
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-sky-400">
                        <Cookie size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-sm font-bold text-slate-200">Privacy & Cookies</h3>
                            <button 
                                onClick={handleDecline}
                                className="text-slate-500 hover:text-slate-300 transition-colors hidden sm:block"
                                aria-label="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            We use cookies to ensure you get the best experience on our website, personalize content, and analyze traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies in compliance with GDPR.
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <button 
                        onClick={handleAccept}
                        className="flex-1 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-colors text-center shadow-lg shadow-sky-500/20 uppercase tracking-wide"
                    >
                        Accept All
                    </button>
                    <button 
                        onClick={handleDecline}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold py-2.5 px-4 rounded-lg transition-colors text-center uppercase tracking-wide"
                    >
                        Necessary Only
                    </button>
                </div>
            </div>
        </div>
    );
};
