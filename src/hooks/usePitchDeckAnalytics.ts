import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useSearchParams } from 'react-router-dom';

interface VisitorData {
    ip?: string;
    city?: string;
    region?: string;
    country?: string;
    [key: string]: any;
}

export const usePitchDeckAnalytics = () => {
    const [searchParams] = useSearchParams();
    const sessionId = useRef(crypto.randomUUID());
    const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
    const [campaignLinkId, setCampaignLinkId] = useState<string | null>(null);

    // Fetch Visitor Data on Mount
    useEffect(() => {
        const fetchVisitorData = async () => {
            try {
                // Primary: GeoJS (Rich Data for Analytics)
                const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
                if (!res.ok) throw new Error('GeoJS failed');
                const data = await res.json();
                setVisitorData(data);
            } catch (err) {
                console.warn("GeoJS fetch failed, trying fallbacks:", err);
                // Fallback 1: Try our internal utility (which uses ipapi/country.is)
                // Note: The internal utility mainly returns country code, so we might lose city level data in fallback
                try {
                    // We manually hit ipapi.co if the utility doesn't give us enough, or just accept the simpler data
                    const res2 = await fetch('https://ipapi.co/json/');
                    if (res2.ok) {
                        const data2 = await res2.json();
                        setVisitorData(data2);
                        return;
                    }
                } catch (e) { console.warn("ipapi fallback failed", e); }

                // Fallback 2: ipify (IP only)
                try {
                    const res3 = await fetch('https://api.ipify.org?format=json');
                    const data3 = await res3.json();
                    setVisitorData({ ip: data3.ip });
                } catch (err2) {
                    console.error("All IP fetches failed:", err2);
                }
            }
        };
        fetchVisitorData();
    }, []);

    // Detect and validate campaign tracking token
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            validateAndLogCampaignClick(token);
        }
    }, [searchParams]);

    const validateAndLogCampaignClick = async (token: string) => {
        try {
            // Verify token exists and get campaign link ID
            const { data: campaignLink, error: fetchError } = await supabase
                .from('pitch_deck_campaign_links')
                .select('id, click_count, first_clicked_at')
                .eq('tracking_token', token)
                .single();

            if (fetchError || !campaignLink) {
                console.warn('Invalid tracking token:', token);
                return;
            }

            setCampaignLinkId(campaignLink.id);

            // Update click metrics
            const now = new Date().toISOString();
            const updateData: any = {
                last_clicked_at: now,
                click_count: (campaignLink.click_count || 0) + 1
            };

            // Set first_clicked_at if this is the first click
            if (!campaignLink.first_clicked_at) {
                updateData.first_clicked_at = now;
            }

            const { error: updateError } = await supabase
                .from('pitch_deck_campaign_links')
                .update(updateData)
                .eq('id', campaignLink.id);

            if (updateError) {
                console.error('Failed to update click metrics:', updateError);
            }
        } catch (err) {
            console.error('Error processing campaign token:', err);
        }
    };

    const trackSlideView = async (slideNumber: number, duration: number) => {
        if (duration < 1) return;

        // Prepare structured location data for dedicated column
        const sessionLocation = visitorData ? {
            city: visitorData.city || null,
            region: visitorData.region || null,
            country: visitorData.country || null,
            country_code: visitorData.country_code || null,
            latitude: visitorData.latitude || null,
            longitude: visitorData.longitude || null
        } : null;

        const metaData = {
            user_agent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            location: visitorData || {}
        };

        if (visitorData?.ip) {
            (metaData as any).ip = visitorData.ip;
        }

        const { error } = await supabase.from('pitch_deck_analytics').insert({
            session_id: sessionId.current,
            slide_number: slideNumber,
            duration_seconds: duration,
            ip_address: visitorData?.ip || null,
            session_location: sessionLocation,
            meta: metaData,
            campaign_link_id: campaignLinkId // Associate with campaign if tracking token present
        });

        if (error) console.error("Tracking error:", error);
    };

    const captureLead = async (email: string) => {
        const { error } = await supabase.from('pitch_deck_leads').insert({
            session_id: sessionId.current,
            email: email
        });
        return { error };
    };

    return {
        trackSlideView,
        captureLead,
        visitorData,
        campaignLinkId,
        sessionId
    };
};
