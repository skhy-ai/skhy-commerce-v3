import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MaintenanceConfig {
    enabled: boolean;
    message: string;
    buttonText?: string;
    buttonUrl?: string;
}

export const SystemUpgradeBanner: React.FC = () => {
    const [config, setConfig] = useState<MaintenanceConfig | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // Fetch from public site_config table
                const { data } = await supabase
                    .from('site_config')
                    .select('content, is_enabled')
                    .eq('section', 'maintenance_config')
                    .single();

                if (data?.content) {
                    setConfig({
                        enabled: data.is_enabled ?? true,
                        message: data.content.message || 'System maintenance in progress.',
                        buttonText: data.content.buttonText,
                        buttonUrl: data.content.buttonUrl
                    });
                } else {
                    // Default fallback if not found
                    setConfig({
                        enabled: false,
                        message: 'Tactical Build Your Own Autonomy: Stability optimization in progress. Real-time telemetry sync may experience latency.'
                    });
                }
            } catch (error) {
                console.error('Error fetching banner config:', error);
            }
        };

        fetchConfig();

        // Realtime subscription
        const subscription = supabase
            .channel('site_config_maintenance')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'site_config',
                    filter: 'section=eq.maintenance_config'
                },
                (payload) => {
                    if (payload.new && payload.new.content) {
                        setConfig({
                            enabled: payload.new.is_enabled ?? true,
                            message: payload.new.content.message || 'System maintenance in progress.',
                            buttonText: payload.new.content.buttonText,
                            buttonUrl: payload.new.content.buttonUrl
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (!isVisible) return null;

    // Validate button URL
    const isValidButtonUrl = (url: string | undefined) => {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const shouldShowButton = config &&
        config.buttonText &&
        config.buttonUrl &&
        isValidButtonUrl(config.buttonUrl);

    // Function to render message with clickable links
    const renderMessage = (message: string) => {
        if (!message) return null;

        // Regex to detect URLs in the message
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = message.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                // Validate URL before rendering as link
                try {
                    const url = new URL(part);
                    // Only allow http and https protocols
                    if (url.protocol === 'http:' || url.protocol === 'https:') {
                        return (
                            <a
                                key={index}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                    // Prevent default if URL seems suspicious
                                    if (!part.startsWith('http://') && !part.startsWith('https://')) {
                                        e.preventDefault();
                                        console.warn('Blocked suspicious URL:', part);
                                    }
                                }}
                                className="underline hover:text-amber-400 transition-colors"
                            >
                                {part}
                            </a>
                        );
                    }
                } catch (e) {
                    // Invalid URL, render as text
                    console.warn('Invalid URL in banner:', part);
                }
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <div className="bg-slate-900 border-b border-slate-800 backdrop-blur-md relative z-[100] py-2.5">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
                <div className="flex-1 flex justify-center">
                    <p className="text-xs text-slate-300 leading-snug text-center">
                        If you're a{' '}
                        <span className="text-sky-400 font-semibold">hobbyist builder</span>{' '}or an{' '}
                        <span className="text-purple-400 font-semibold">Army Veteran</span>,
                        Build Your Own Autonomy is <span className="text-white font-bold">Available for Beta Release.</span>
                        <a
                            href="/register?type=hobbyist"
                            className="ml-2 text-amber-400 underline underline-offset-4 hover:text-amber-300 font-bold transition-colors"
                        >
                            Claim Yours →
                        </a>
                    </p>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
