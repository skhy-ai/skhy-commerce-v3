// src/utils/analytics.ts

declare global {
    interface Window {
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}

export const GA_TRACKING_ID = 'G-5ZZXGCWCF3';

export const initAnalytics = () => {
    if (typeof window === 'undefined') return;
    const consent = localStorage.getItem('skhy_cookie_consent');
    if (consent !== 'true') return;

    if (document.getElementById('gtag-script')) return; // Already initialized

    // 1. Inject gtag script
    const script = document.createElement('script');
    script.id = 'gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // 2. Initialize dataLayer and window.gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) { window.dataLayer.push(args); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID, {
        page_path: window.location.pathname,
    });
};

type EventName =
    | 'click_cta'
    | 'click_nav'
    | 'view_item'
    | 'form_submission'
    | 'video_interaction';

interface AnalyticsEvent {
    action: EventName;
    category: string;
    label?: string;
    value?: number;
    [key: string]: any;
}

export const trackEvent = ({ action, category, label, value, ...rest }: AnalyticsEvent) => {
    const consent = localStorage.getItem('skhy_cookie_consent');
    if (consent !== 'true') return;

    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
            ...rest,
        });
    } else {
        console.log('[Analytics (Gatekeeper Passed)]', { action, category, label, value, ...rest });
    }
};

export const AnalyticsCategories = {
    NAVBAR: 'Navigation',
    HERO: 'Hero Section',
    CORE_APPS: 'Core Applications',
    HARDWARE: 'Enabling Hardware',
    FOOTER: 'Footer',
    BLOG: 'Blog',
    CONTACT: 'Contact Form',
};
