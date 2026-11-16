import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { QoSTerms } from '../../types/partner';

export interface PartnerQoSAcceptanceRef {
    accept: () => Promise<boolean>;
    isAccepted: () => boolean;
}

interface PartnerQoSAcceptanceProps {
    onComplete?: () => void;
    hideSubmit?: boolean;
    accepted?: boolean;
}

export const PartnerQoSAcceptance = forwardRef<PartnerQoSAcceptanceRef, PartnerQoSAcceptanceProps>(({
    onComplete,
    hideSubmit = false,
    accepted = false
}, ref) => {
    const [loading, setLoading] = useState(true);
    const [agreeLoading, setAgreeLoading] = useState(false);
    const [terms, setTerms] = useState<QoSTerms | null>(null);
    const [hasAccepted, setHasAccepted] = useState(accepted);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadLatestTerms();
    }, []);

    const loadLatestTerms = async () => {
        try {
            // Fetch latest active terms
            const { data, error } = await supabase
                .from('qos_terms')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code !== 'PGRST116') { // Not found error
                    console.error('Error loading QoS terms:', error);
                    setError('Failed to load Quality of Service terms.');
                } else {
                    // Fallback for dev if no terms exist
                    setTerms({
                        id: 'default',
                        version: 'v1.0',
                        terms_text: `Skhy AI Marketplace Quality of Service Standards v1.0
                 
1. Ship orders within committed timeframes
2. Provide accurate product descriptions
3. Maintain product quality as advertised
4. Respond to customer inquiries within 24 hours
5. Accept refund requests for legitimate quality issues`,
                        qos_standards: {
                            max_shipping_delay_days: 3,
                            defect_rate_threshold_percent: 2,
                            response_time_hours: 24,
                            accurate_product_description_required: true,
                            quality_as_advertised_required: true
                        },
                        is_active: true,
                        effective_date: new Date().toISOString()
                    });
                }
            } else {
                setTerms(data);
            }

            // Check if user already accepted THIS version
            const { data: { user } } = await supabase.auth.getUser();
            if (user && data) {
                const { data: acceptance } = await supabase
                    .from('partner_qos_acceptance')
                    .select('accepted')
                    .eq('partner_id', user.id)
                    .eq('qos_version', data.version)
                    .maybeSingle();

                if (acceptance?.accepted) {
                    setHasAccepted(true);
                }
            }

        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred loading terms.');
        } finally {
            setLoading(false);
        }
    };

    const handleAgree = async (): Promise<boolean> => {
        if (!terms) return false;
        setAgreeLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Insert acceptance record
            const { error } = await supabase
                .from('partner_qos_acceptance')
                .upsert({
                    partner_id: user.id,
                    qos_version: terms.version,
                    accepted: true,
                    accepted_at: new Date().toISOString(),
                    user_agent: navigator.userAgent
                });

            if (error) throw error;

            setHasAccepted(true);
            if (onComplete) onComplete();
            return true;

        } catch (err: any) {
            console.error('Error accepting terms:', err);
            setError(err.message || 'Failed to record acceptance.');
            return false;
        } finally {
            setAgreeLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        accept: () => handleAgree(),
        isAccepted: () => hasAccepted
    }), [hasAccepted]); // Add dependency to ensure ref has latest state

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Loading terms...</div>;
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg text-red-400 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-navy-800 p-6 rounded-lg border border-navy-600">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                        <ShieldCheck className="w-6 h-6 mr-2 text-sky-400" />
                        Quality of Service Standards {terms?.version && <span className="text-sm font-normal text-gray-400 ml-2">({terms.version})</span>}
                    </h3>
                    {hasAccepted && (
                        <div className="flex items-center text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-sm font-medium">
                            <Check className="w-4 h-4 mr-1" />
                            Accepted
                        </div>
                    )}
                </div>

                <div className="bg-navy-900 rounded-lg p-6 border border-navy-700 max-h-96 overflow-y-auto mb-6">
                    {terms?.qos_standards && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-navy-700">
                            <div className="bg-navy-800 p-4 rounded border border-navy-600">
                                <div className="text-gray-400 text-xs uppercase mb-1">Max Shipping Delay</div>
                                <div className="text-white font-mono">{terms.qos_standards.max_shipping_delay_days} Days</div>
                            </div>
                            <div className="bg-navy-800 p-4 rounded border border-navy-600">
                                <div className="text-gray-400 text-xs uppercase mb-1">Max Defect Rate</div>
                                <div className="text-white font-mono">{terms.qos_standards.defect_rate_threshold_percent}%</div>
                            </div>
                            <div className="bg-navy-800 p-4 rounded border border-navy-600">
                                <div className="text-gray-400 text-xs uppercase mb-1">Response Time</div>
                                <div className="text-white font-mono">{terms.qos_standards.response_time_hours} Hours</div>
                            </div>
                            <div className="bg-navy-800 p-4 rounded border border-navy-600">
                                <div className="text-gray-400 text-xs uppercase mb-1">Accurate Description</div>
                                <div className="text-white font-mono">{terms.qos_standards.accurate_product_description_required ? 'Required' : 'Optional'}</div>
                            </div>
                        </div>
                    )}

                    <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
                            {terms?.terms_text}
                        </p>
                    </div>
                </div>

                <div className="bg-sky-900/20 border border-sky-600/30 p-4 rounded-lg flex items-start mb-6">
                    <AlertCircle className="w-5 h-5 text-sky-400 mr-3 mt-0.5" />
                    <div>
                        <h4 className="text-sky-400 font-medium mb-1">Important Note</h4>
                        <p className="text-sky-100 text-sm">
                            Failure to maintain these standards may result in payment holds, warnings, or removal from the marketplace.
                        </p>
                    </div>
                </div>

                {!hasAccepted && !hideSubmit && (
                    <div className="flex justify-end">
                        <button
                            onClick={handleAgree}
                            disabled={agreeLoading}
                            className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
                        >
                            {agreeLoading ? 'Processing...' : 'I Accept These Standards'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

PartnerQoSAcceptance.displayName = 'PartnerQoSAcceptance';
