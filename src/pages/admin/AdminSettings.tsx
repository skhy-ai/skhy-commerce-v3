import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RefreshCw, AlertCircle, CheckCircle, Monitor, X } from 'lucide-react';

// Enhanced SwiftDetails to include address info
interface SwiftAddress {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

interface SwiftDetails {
    bank_name: string;
    account_name: string;
    swift_code: string;
    account_number: string;
    bank_address?: SwiftAddress;
    beneficiary_address?: SwiftAddress;
}

interface PayPalConfig {
    client_id: string;
    secret_key: string;
    mode: 'sandbox' | 'live';
}

const AdminSettings: React.FC = () => {
    // const [loading, setLoading] = useState(true); // Removed unused
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showLandingPreview, setShowLandingPreview] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);

    // Email Config State
    const [emailConfig, setEmailConfig] = useState({
        provider: 'resend',
        apiKey: '',
        fromName: '',
        fromEmail: ''
    });
    const [sendingTest, setSendingTest] = useState(false);

    // Financial Config State (Restored)
    const [platformFee, setPlatformFee] = useState<string>('3.8');
    const [stripeKey, setStripeKey] = useState<string>('');
    const [stripeSecretKey, setStripeSecretKey] = useState<string>('');
    const [paypalConfig, setPaypalConfig] = useState<PayPalConfig>({
        client_id: '',
        secret_key: '',
        mode: 'sandbox'
    });
    const [swiftDetails, setSwiftDetails] = useState<SwiftDetails>({
        bank_name: '',
        account_name: '',
        swift_code: '',
        account_number: '',
        bank_address: { street: '', city: '', state: '', postal_code: '', country: '' },
        beneficiary_address: { street: '', city: '', state: '', postal_code: '', country: '' }
    });

    // Apollo & Security State
    const [apolloKey, setApolloKey] = useState<string>('');
    // Maintenance Config State
    const [maintenanceConfig, setMaintenanceConfig] = useState({
        enabled: false,
        message: 'System Upgrade in Progress: Intermittent issues may arise until Feb 3, 2026.',
        buttonText: '',
        buttonUrl: ''
    });

    // Password Change State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [cloudflareAuthEnabled, setCloudflareAuthEnabled] = useState(false);

    // New Integrations State
    const [razorpayConfig, setRazorpayConfig] = useState({
        keyId: '',
        keySecret: ''
    });
    const [easyshipConfig, setEasyshipConfig] = useState({
        apiKey: ''
    });
    const [wiseConfig, setWiseConfig] = useState({
        apiKey: '',
        profileId: ''
    });

    // Multi-Payment Crypto Wallet Config
    const [cryptoConfig, setCryptoConfig] = useState({
        enabled: true,
        merchantEvmAddress: '0x71C94511B3e3612806A3F140a8523c9E39F24177',
        merchantSolanaAddress: 'Skhy9XWqZq8YhWbVvQpLtJ1vF4wGmBn2Kx3T8yU6oP1',
        coinbaseApiKey: '',
        coinbaseWebhookSecret: '',
        nowpaymentsApiKey: '',
        supportedChains: ['polygon', 'ethereum', 'arbitrum', 'solana'],
        supportedTokens: ['USDC', 'USDT', 'ETH', 'SOL'],
        acceptedStablecoinsOnly: false
    });

    // Multi-Carrier Delivery Partners Config
    const [deliveryPartners, setDeliveryPartners] = useState({
        dhl: {
            enabled: true,
            apiKey: '',
            accountNumber: '',
            mode: 'live' as 'sandbox' | 'live',
            handlingFeeUSD: 5
        },
        ups: {
            enabled: true,
            clientId: '',
            clientSecret: '',
            accountNumber: '',
            mode: 'live' as 'sandbox' | 'live',
            handlingFeeUSD: 5
        },
        parcelhub: {
            enabled: true,
            apiToken: '',
            merchantId: '',
            handlingFeeUSD: 3
        }
    });

    // Frontpage Config State
    const [frontpageConfig, setFrontpageConfig] = useState<string[]>([
        'hero', 'problemStatements', 'coreApplications', 'scenarioPlanner', 'partnerCTA', 'enablingHardware', 'whitepapers', 'industries', 'latestInsights', 'team', 'contact'
    ]);

    // Analytics Config State
    const [seedVisitorCount, setSeedVisitorCount] = useState<number>(324);

    const allFrontpageSections = [
        { id: 'hero', label: 'Hero Section' },
        { id: 'problemStatements', label: 'Problem Statements' },
        { id: 'coreApplications', label: 'Core Applications' },
        { id: 'scenarioPlanner', label: 'Scenario Planner' },
        { id: 'partnerCTA', label: 'Partner CTA' },
        { id: 'enablingHardware', label: 'Enabling Hardware' },
        { id: 'whitepapers', label: 'Whitepapers' },
        { id: 'industries', label: 'Industries' },
        { id: 'latestInsights', label: 'Latest Insights' },
        { id: 'team', label: 'Team' },
        { id: 'contact', label: 'Contact' }
    ];

    // Currency Config State
    const [currencyConfig, setCurrencyConfig] = useState({
        defaultCurrency: 'USD',
        supportedCurrencies: ['USD', 'INR', 'EUR', 'GBP']
    });

    // Partner Policies Config
    const [partnerPolicies, setPartnerPolicies] = useState({
        returnPolicies: [
            { id: 'return_14', label: '14 Days Return', enabled: true },
            { id: 'return_30', label: '30 Days Return', enabled: true },
            { id: 'return_no', label: 'No Returns Accepted', enabled: true },
            { id: 'return_case', label: 'Case-by-Case Basis', enabled: true },
        ],
        shippingPolicies: [
            { id: 'ship_free_ww', label: 'Free Standard Shipping Worldwide', enabled: true },
            { id: 'ship_free_dom', label: 'Free Standard Shipping (Domestic)', enabled: true },
            { id: 'ship_flat', label: 'Flat Rate Shipping', enabled: true },
            { id: 'ship_calc', label: 'Calculated at Checkout', enabled: true },
        ]
    });

    // Country Config State
    const [countryConfig, setCountryConfig] = useState({
        blockedCountries: 'PK, BD, NP, MM, AF'
    });

    // Frontpage Assets State
    const [pageAssets, setPageAssets] = useState({
        heroTitle: 'Physical AI for Real-Time Situational Awareness',
        heroSubtitle: 'Skhy AI delivers actionable intelligence through advanced sensor fusion and edge computing.',
        heroVideoUrl: 'https://www.youtube.com/embed/cstmN7QS9aI'
    });

    // Problem Statements Config State
    const [problemConfig, setProblemConfig] = useState({
        title: 'The Operational Gap',
        description: 'Why legacy security architectures fail in modern threat environments',
        problemsJson: ''
    });

    // Core Applications Config State
    const [coreAppsConfig, setCoreAppsConfig] = useState({
        title: 'Applications for AI and Physical Sovereignty',
        description: 'Advanced AI applications designed for Defense, Enterprise, and Commercial Security and Independence.',
        appsJson: ''
    });
    
    // Industries Config State
    const [industriesConfig, setIndustriesConfig] = useState({
        title: 'Industries Covered',
        description: 'Specialized solutions for diverse sectors',
        industriesJson: ''
    });

    // Scenario Planner Config State
    const [scenarioPlannerConfig, setScenarioPlannerConfig] = useState({
        title: 'Build Your Own Autonomy',
        description: 'End-to-end interactive framework to engineer, validate, and build mission-critical hardware architectures.',
        videoId: 'cstmN7QS9aI',
        scenariosJson: ''
    });

    // Team Config State
    const [teamConfig, setTeamConfig] = useState({
        title: 'Our Team',
        description: 'A global network of experts in AI, hardware, and defense operations.',
        membersJson: ''
    });

    // Latest Insights Config State
    const [latestInsightsConfig, setLatestInsightsConfig] = useState({
        title: 'Latest Insights',
        description: 'Stay updated with our latest technological breakthroughs and field reports.',
    });

    const loadConfig = async () => {
        // setLoading(true);
        try {
            // Load System Config (admin-only, secrets)
            const { data: systemData } = await supabase
                .from('system_config')
                .select('key, value');

            if (systemData) {
                systemData.forEach(item => {
                    if (item.key === 'platform_fee_percent') setPlatformFee(String(item.value));
                    if (item.key === 'stripe_config') {
                        setStripeKey(item.value.publishable_key || '');
                        setStripeSecretKey(item.value.secret_key || '');
                    }
                    if (item.key === 'paypal_config') setPaypalConfig(item.value);
                    if (item.key === 'swift_details') setSwiftDetails(item.value);
                    if (item.key === 'email_config') setEmailConfig(item.value);
                    if (item.key === 'apollo_api_key') setApolloKey(item.value);
                    if (item.key === 'razorpay_config') setRazorpayConfig(item.value);
                    if (item.key === 'easyship_config') setEasyshipConfig(item.value);
                    if (item.key === 'wise_config') setWiseConfig(item.value);
                    if (item.key === 'crypto_wallet_config' && item.value) {
                        setCryptoConfig(prev => ({ ...prev, ...item.value }));
                    }
                    if (item.key === 'delivery_partners_config' && item.value) {
                        setDeliveryPartners(prev => ({
                            dhl: { ...prev.dhl, ...(item.value.dhl || {}) },
                            ups: { ...prev.ups, ...(item.value.ups || {}) },
                            parcelhub: { ...prev.parcelhub, ...(item.value.parcelhub || {}) },
                        }));
                    }
                });
            }

            // Load Site Config (public, non-sensitive)
            const { data: siteData } = await supabase
                .from('site_config')
                .select('section, content, is_enabled');

            if (siteData) {
                siteData.forEach(item => {
                    if (item.section === 'maintenance_config') {
                        setMaintenanceConfig({
                            enabled: item.is_enabled ?? false,
                            message: item.content?.message || '',
                            buttonText: item.content?.buttonText || '',
                            buttonUrl: item.content?.buttonUrl || ''
                        });
                    }
                    if (item.section === 'cloudflare_auth') {
                        setCloudflareAuthEnabled(item.is_enabled ?? false);
                    }
                    if (item.section === 'analytics_config') {
                        setSeedVisitorCount(item.content?.seedVisitorCount ?? 324);
                    }
                    if (item.section === 'frontpage_config') {
                        setFrontpageConfig(item.content?.sections || []);
                    }
                    if (item.section === 'currency_config') {
                        setCurrencyConfig({
                            defaultCurrency: item.content?.defaultCurrency || 'USD',
                            supportedCurrencies: item.content?.supportedCurrencies || ['USD', 'INR', 'EUR', 'GBP']
                        });
                    }
                    if (item.section === 'partner_policies_config') {
                        setPartnerPolicies({
                            returnPolicies: item.content?.returnPolicies || partnerPolicies.returnPolicies,
                            shippingPolicies: item.content?.shippingPolicies || partnerPolicies.shippingPolicies
                        });
                    }
                    if (item.section === 'country_config') {
                        setCountryConfig({
                            blockedCountries: (item.content?.blockedCountries || ['PK', 'BD', 'NP', 'MM', 'AF']).join(', ')
                        });
                    }
                    if (item.section === 'frontpage_assets') {
                        setPageAssets({
                            heroTitle: item.content?.heroTitle || 'Real-Time Hyperspectral AI for Global Awareness',
                            heroSubtitle: item.content?.heroSubtitle || 'Skhy AI delivers actionable intelligence through advanced sensor fusion and edge computing.',
                            heroVideoUrl: item.content?.heroVideoUrl || 'https://www.youtube.com/embed/cstmN7QS9aI'
                        });
                    }
                    if (item.section === 'problem_statements_config') {
                        setProblemConfig({
                            title: item.content?.title || 'The Operational Gap',
                            description: item.content?.description || 'Why legacy security architectures fail in modern threat environments',
                            problemsJson: item.content?.problems ? JSON.stringify(item.content.problems, null, 2) : ''
                        });
                    }
                    if (item.section === 'core_applications_config') {
                        setCoreAppsConfig({
                            title: item.content?.title || 'Applications for AI and Physical Sovereignty',
                            description: item.content?.description || 'Advanced AI applications designed for Defense, Enterprise, and Commercial Security and Independence.',
                            appsJson: item.content?.apps ? JSON.stringify(item.content.apps, null, 2) : ''
                        });
                    }
                    if (item.section === 'industries_config') {
                        setIndustriesConfig({
                            title: item.content?.title || 'Industries Covered',
                            description: item.content?.description || 'Specialized solutions for diverse sectors',
                            industriesJson: item.content?.industries ? JSON.stringify(item.content.industries, null, 2) : ''
                        });
                    }
                    if (item.section === 'scenario_planner_config') {
                        setScenarioPlannerConfig({
                            title: item.content?.title || 'Build Your Own Autonomy',
                            description: item.content?.description || 'End-to-end interactive framework to engineer, validate, and build mission-critical hardware architectures.',
                            videoId: item.content?.videoId || 'cstmN7QS9aI',
                            scenariosJson: item.content?.scenarios ? JSON.stringify(item.content.scenarios, null, 2) : ''
                        });
                    }
                    if (item.section === 'team_config') {
                        setTeamConfig({
                            title: item.content?.title || 'Our Team',
                            description: item.content?.description || 'A global network of experts in AI, hardware, and defense operations.',
                            membersJson: item.content?.members ? JSON.stringify(item.content.members, null, 2) : ''
                        });
                    }
                    if (item.section === 'latest_insights_config') {
                        setLatestInsightsConfig({
                            title: item.content?.title || 'Latest Insights',
                            description: item.content?.description || 'Stay updated with our latest technological breakthroughs and field reports.'
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error loading config:', error);
            setMessage({ type: 'error', text: 'Failed to load configuration' });
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // Update system_config (secrets, admin-only)
            const systemUpdates = [
                { key: 'platform_fee_percent', value: Number(platformFee), description: 'Platform fee percentage' },
                {
                    key: 'stripe_config',
                    value: { publishable_key: stripeKey, secret_key: stripeSecretKey },
                    description: 'Stripe API keys'
                },
                { key: 'paypal_config', value: paypalConfig, description: 'PayPal configuration' },
                { key: 'swift_details', value: swiftDetails, description: 'Bank transfer details' },
                { key: 'email_config', value: emailConfig, description: 'Email provider settings' },
                { key: 'apollo_api_key', value: apolloKey, description: 'Apollo.io API Key' },
                { key: 'cloudflare_auth_enabled', value: cloudflareAuthEnabled, description: 'Cloudflare Turnstile global toggle' },
                { key: 'razorpay_config', value: razorpayConfig, description: 'RazorPay API Credentials (India Domestic)' },
                { key: 'easyship_config', value: easyshipConfig, description: 'Easyship API Keys' },
                { key: 'wise_config', value: wiseConfig, description: 'Wise Payout Credentials' },
                { key: 'crypto_wallet_config', value: cryptoConfig, description: 'Crypto Wallet & Web3 Configuration' },
                { key: 'delivery_partners_config', value: deliveryPartners, description: 'Delivery Partners Configuration (UPS, DHL, ParcelHub)' }
            ];

            const { error: systemError } = await supabase
                .from('system_config')
                .upsert(systemUpdates, { onConflict: 'key' });

            if (systemError) throw systemError;

            // Update site_config (public, non-sensitive)
            const siteUpdates = [
                {
                    section: 'maintenance_config',
                    is_enabled: maintenanceConfig.enabled,
                    content: {
                        message: maintenanceConfig.message,
                        buttonText: maintenanceConfig.buttonText,
                        buttonUrl: maintenanceConfig.buttonUrl
                    }
                },
                {
                    section: 'platform_fee_percent',
                    is_enabled: true,
                    content: Number(platformFee)
                },
                {
                    section: 'cloudflare_auth',
                    is_enabled: cloudflareAuthEnabled,
                    content: { enabled: cloudflareAuthEnabled }
                },
                {
                    section: 'analytics_config',
                    is_enabled: true,
                    content: { seedVisitorCount: Number(seedVisitorCount) }
                },
                {
                    section: 'frontpage_config',
                    is_enabled: true,
                    content: { sections: frontpageConfig }
                },
                {
                    section: 'currency_config',
                    is_enabled: true,
                    content: { 
                        defaultCurrency: currencyConfig.defaultCurrency,
                        supportedCurrencies: currencyConfig.supportedCurrencies
                    }
                },
                {
                    section: 'partner_policies_config',
                    is_enabled: true,
                    content: partnerPolicies
                },
                {
                    section: 'country_config',
                    is_enabled: true,
                    content: {
                        blockedCountries: countryConfig.blockedCountries.split(',').map(c => c.trim().toUpperCase()).filter(c => c)
                    }
                },
                {
                    section: 'frontpage_assets',
                    is_enabled: true,
                    content: pageAssets
                },
                {
                    section: 'problem_statements_config',
                    is_enabled: true,
                    content: {
                        title: problemConfig.title,
                        description: problemConfig.description,
                        problems: problemConfig.problemsJson ? JSON.parse(problemConfig.problemsJson) : null
                    }
                },
                {
                    section: 'core_applications_config',
                    is_enabled: true,
                    content: {
                        title: coreAppsConfig.title,
                        description: coreAppsConfig.description,
                        apps: coreAppsConfig.appsJson ? JSON.parse(coreAppsConfig.appsJson) : null
                    }
                },
                {
                    section: 'industries_config',
                    is_enabled: true,
                    content: {
                        title: industriesConfig.title,
                        description: industriesConfig.description,
                        industries: industriesConfig.industriesJson ? JSON.parse(industriesConfig.industriesJson) : null
                    }
                },
                {
                    section: 'scenario_planner_config',
                    is_enabled: true,
                    content: {
                        title: scenarioPlannerConfig.title,
                        description: scenarioPlannerConfig.description,
                        videoId: scenarioPlannerConfig.videoId,
                        scenarios: scenarioPlannerConfig.scenariosJson ? JSON.parse(scenarioPlannerConfig.scenariosJson) : null
                    }
                },
                {
                    section: 'team_config',
                    is_enabled: true,
                    content: {
                        title: teamConfig.title,
                        description: teamConfig.description,
                        members: teamConfig.membersJson ? JSON.parse(teamConfig.membersJson) : null
                    }
                },
                {
                    section: 'latest_insights_config',
                    is_enabled: true,
                    content: {
                        title: latestInsightsConfig.title,
                        description: latestInsightsConfig.description
                    }
                }
            ];

            const { error: siteError } = await supabase
                .from('site_config')
                .upsert(siteUpdates, { onConflict: 'section' });

            if (siteError) throw siteError;

            setMessage({ type: 'success', text: 'Configuration saved successfully' });
        } catch (error: any) {
            console.error('Error saving config:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save configuration' });
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        setSendingTest(true);
        setTimeout(() => {
            setSendingTest(false);
            setMessage({ type: 'success', text: 'Test email request processed (Simulated)' });
        }, 1500);
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setMessage({ type: 'success', text: 'Password updated successfully' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update password' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-8">System Settings</h1>

            {/* Landing Page Preview Modal */}
            {showLandingPreview && (
                <div className="fixed inset-0 z-[300] flex flex-col bg-slate-950/95 backdrop-blur-sm">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-navy-900 shrink-0">
                        <div>
                            <span className="text-white font-semibold text-sm">Landing Page Preview</span>
                            <span className="ml-3 text-xs text-gray-500">Reflects <span className="text-turquoise-400">saved</span> changes only</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPreviewKey(k => k + 1)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" /> Refresh
                            </button>
                            <button
                                onClick={() => setShowLandingPreview(false)}
                                className="p-1.5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <iframe
                            key={previewKey}
                            src="/"
                            title="Landing Page Preview"
                            className="w-full h-full border-none"
                        />
                    </div>
                </div>
            )}

            {message && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            <div className="space-y-8">
                {/* Maintenance Banner Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Maintenance Banner</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={maintenanceConfig.enabled}
                                    onChange={(e) => setMaintenanceConfig({ ...maintenanceConfig, enabled: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-300">Enable Banner</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Banner Message</label>
                            <input
                                type="text"
                                value={maintenanceConfig.message}
                                onChange={(e) => setMaintenanceConfig({ ...maintenanceConfig, message: e.target.value })}
                                placeholder="Enter maintenance message... (URLs will be automatically linked)"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Tip: Include URLs like https://example.com in the message - they'll be automatically clickable</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Button Text (Optional)</label>
                                <input
                                    type="text"
                                    value={maintenanceConfig.buttonText}
                                    onChange={(e) => setMaintenanceConfig({ ...maintenanceConfig, buttonText: e.target.value })}
                                    placeholder="e.g., Learn More"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Button URL (Optional)</label>
                                <input
                                    type="url"
                                    value={maintenanceConfig.buttonUrl}
                                    onChange={(e) => setMaintenanceConfig({ ...maintenanceConfig, buttonUrl: e.target.value })}
                                    placeholder="https://example.com/status"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">Add a call-to-action button to the banner (both fields required to show button)</p>
                    </div>
                </section>

                {/* Analytics Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Analytics Configuration</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Seed Visitor Count</label>
                            <input
                                type="number"
                                value={seedVisitorCount}
                                onChange={(e) => setSeedVisitorCount(Number(e.target.value))}
                                className="w-full max-w-xs bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">This number will be added to the total organic visitor count shown on the site.</p>
                        </div>
                    </div>
                </section>

                {/* Frontpage Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                        <h2 className="text-xl font-semibold text-white">Frontpage Layout Control</h2>
                        <button
                            type="button"
                            onClick={() => setShowLandingPreview(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-turquoise-500/20 hover:bg-turquoise-500/30 text-turquoise-400 border border-turquoise-500/40 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Monitor className="w-4 h-4" />
                            Preview Landing Page
                        </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-6">Toggle the sections you want to display on the landing page.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {allFrontpageSections.map(section => (
                            <div key={section.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                                <span className="text-gray-300 text-sm font-medium">{section.label}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={frontpageConfig.includes(section.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFrontpageConfig([...frontpageConfig, section.id]);
                                            } else {
                                                setFrontpageConfig(frontpageConfig.filter(id => id !== section.id));
                                            }
                                        }}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Frontpage Assets */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Frontpage Assets & Media</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Hero Title</label>
                            <input
                                type="text"
                                value={pageAssets.heroTitle}
                                onChange={(e) => setPageAssets({ ...pageAssets, heroTitle: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Hero Subtitle</label>
                            <textarea
                                value={pageAssets.heroSubtitle}
                                onChange={(e) => setPageAssets({ ...pageAssets, heroSubtitle: e.target.value })}
                                rows={3}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Hero Background (YouTube Embed URL)</label>
                            <input
                                type="text"
                                value={pageAssets.heroVideoUrl}
                                onChange={(e) => setPageAssets({ ...pageAssets, heroVideoUrl: e.target.value })}
                                placeholder="https://www.youtube.com/embed/..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-2">Use the "Embed" URL format for YouTube videos.</p>
                        </div>
                    </div>
                </section>

                {/* Problem Statements Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Problem Statements</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Title</label>
                            <input
                                type="text"
                                value={problemConfig.title}
                                onChange={(e) => setProblemConfig({ ...problemConfig, title: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Subtitle</label>
                            <textarea
                                value={problemConfig.description}
                                onChange={(e) => setProblemConfig({ ...problemConfig, description: e.target.value })}
                                rows={2}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Advanced: Problems Array (JSON)</label>
                            <textarea
                                value={problemConfig.problemsJson}
                                onChange={(e) => setProblemConfig({ ...problemConfig, problemsJson: e.target.value })}
                                rows={6}
                                placeholder='[ { "title": "Example", "description": "...", "iconName": "EyeOff" } ]'
                                className="w-full font-mono text-sm bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                            />
                            <p className="text-xs text-gray-500 mt-2">Leave blank to use default hardcoded problems.</p>
                        </div>
                    </div>
                </section>

                {/* Core Applications Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Core Applications</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Title</label>
                            <input
                                type="text"
                                value={coreAppsConfig.title}
                                onChange={(e) => setCoreAppsConfig({ ...coreAppsConfig, title: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Subtitle</label>
                            <textarea
                                value={coreAppsConfig.description}
                                onChange={(e) => setCoreAppsConfig({ ...coreAppsConfig, description: e.target.value })}
                                rows={2}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Advanced: Applications Array (JSON)</label>
                            <textarea
                                value={coreAppsConfig.appsJson}
                                onChange={(e) => setCoreAppsConfig({ ...coreAppsConfig, appsJson: e.target.value })}
                                rows={8}
                                placeholder='[ { "name": "...", "description": "...", "videoId": "...", "bulletPoints": ["..."] } ]'
                                className="w-full font-mono text-sm bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                            />
                            <p className="text-xs text-gray-500 mt-2">Leave blank to use default hardcoded applications.</p>
                        </div>
                    </div>
                </section>

                {/* Industries Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Industries Section</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Title</label>
                            <input
                                type="text"
                                value={industriesConfig.title}
                                onChange={(e) => setIndustriesConfig({ ...industriesConfig, title: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Subtitle</label>
                            <textarea
                                value={industriesConfig.description}
                                onChange={(e) => setIndustriesConfig({ ...industriesConfig, description: e.target.value })}
                                rows={2}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Advanced: Industries Array (JSON)</label>
                            <textarea
                                value={industriesConfig.industriesJson}
                                onChange={(e) => setIndustriesConfig({ ...industriesConfig, industriesJson: e.target.value })}
                                rows={8}
                                placeholder='[ { "id": "defense", "name": "Defense", "description": "...", "icon": "plane", "image": "...", "actionUrl": "...", "actionText": "..." } ]'
                                className="w-full font-mono text-sm bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                            />
                        </div>
                    </div>
                </section>

                {/* Scenario Planner Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Build Your Own Autonomy (Scenario Planner)</h2>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Section Title</label>
                                <input
                                    type="text"
                                    value={scenarioPlannerConfig.title}
                                    onChange={(e) => setScenarioPlannerConfig({ ...scenarioPlannerConfig, title: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">YouTube Video ID</label>
                                <input
                                    type="text"
                                    value={scenarioPlannerConfig.videoId}
                                    onChange={(e) => setScenarioPlannerConfig({ ...scenarioPlannerConfig, videoId: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Subtitle</label>
                            <textarea
                                value={scenarioPlannerConfig.description}
                                onChange={(e) => setScenarioPlannerConfig({ ...scenarioPlannerConfig, description: e.target.value })}
                                rows={2}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Advanced: Scenarios Array (JSON)</label>
                            <textarea
                                value={scenarioPlannerConfig.scenariosJson}
                                onChange={(e) => setScenarioPlannerConfig({ ...scenarioPlannerConfig, scenariosJson: e.target.value })}
                                rows={8}
                                placeholder='[ { "id": "1", "title": "...", "description": "...", "iconName": "Plane", "color": "..." } ]'
                                className="w-full font-mono text-sm bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                            />
                        </div>
                    </div>
                </section>

                {/* Team Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Our Team Section</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Title</label>
                            <input
                                type="text"
                                value={teamConfig.title}
                                onChange={(e) => setTeamConfig({ ...teamConfig, title: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Subtitle</label>
                            <textarea
                                value={teamConfig.description}
                                onChange={(e) => setTeamConfig({ ...teamConfig, description: e.target.value })}
                                rows={2}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Advanced: Team Members Array (JSON)</label>
                            <textarea
                                value={teamConfig.membersJson}
                                onChange={(e) => setTeamConfig({ ...teamConfig, membersJson: e.target.value })}
                                rows={8}
                                placeholder='[ { "id": "1", "name": "...", "role": "...", "image": "...", "bio": "...", "social": { "linkedin": "...", "twitter": "..." } } ]'
                                className="w-full font-mono text-sm bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                            />
                        </div>
                    </div>
                </section>

                {/* Latest Insights Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Latest Insights Section</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Title</label>
                            <input
                                type="text"
                                value={latestInsightsConfig.title}
                                onChange={(e) => setLatestInsightsConfig({ ...latestInsightsConfig, title: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Section Subtitle</label>
                            <textarea
                                value={latestInsightsConfig.description}
                                onChange={(e) => setLatestInsightsConfig({ ...latestInsightsConfig, description: e.target.value })}
                                rows={2}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Currency & Country Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Currency & Country Features</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Default Currency</label>
                            <select
                                value={currencyConfig.defaultCurrency}
                                onChange={(e) => setCurrencyConfig({ ...currencyConfig, defaultCurrency: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="INR">INR (₹)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Supported Currencies (Comma separated)</label>
                            <input
                                type="text"
                                value={currencyConfig.supportedCurrencies.join(', ')}
                                onChange={(e) => setCurrencyConfig({ 
                                    ...currencyConfig, 
                                    supportedCurrencies: e.target.value.split(',').map(c => c.trim().toUpperCase()).filter(c => c)
                                })}
                                placeholder="e.g., USD, INR, EUR"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Blocked Countries (Alpha-2 codes, Comma separated)</label>
                            <input
                                type="text"
                                value={countryConfig.blockedCountries}
                                onChange={(e) => setCountryConfig({ ...countryConfig, blockedCountries: e.target.value })}
                                placeholder="e.g., PK, BD, SA, CN"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                            />
                            <p className="text-xs text-gray-500 mt-2">Users from these countries will be blocked entirely via GeoIP.</p>
                        </div>
                    </div>
                </section>

                {/* Partner Policies Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Partner Store Policies</h2>
                    <p className="text-sm text-gray-400 mb-6">Toggle which shipping and return policies partners can select during onboarding or profile editing.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg text-white mb-4">Return Policies</h3>
                            <div className="space-y-3">
                                {partnerPolicies.returnPolicies.map((policy, idx) => (
                                    <div key={policy.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                                        <span className="text-gray-300 text-sm">{policy.label}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={policy.enabled}
                                                onChange={(e) => {
                                                    const newPolicies = [...partnerPolicies.returnPolicies];
                                                    newPolicies[idx].enabled = e.target.checked;
                                                    setPartnerPolicies({ ...partnerPolicies, returnPolicies: newPolicies });
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg text-white mb-4">Shipping Policies</h3>
                            <div className="space-y-3">
                                {partnerPolicies.shippingPolicies.map((policy, idx) => (
                                    <div key={policy.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                                        <span className="text-gray-300 text-sm">{policy.label}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={policy.enabled}
                                                onChange={(e) => {
                                                    const newPolicies = [...partnerPolicies.shippingPolicies];
                                                    newPolicies[idx].enabled = e.target.checked;
                                                    setPartnerPolicies({ ...partnerPolicies, shippingPolicies: newPolicies });
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Email Configuration (Outbound) */}

                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Email Configuration (Outbound)</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Provider</label>
                            <select
                                className="w-full px-4 py-2 bg-navy-950 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                                disabled
                                value={emailConfig.provider}
                            >
                                <option value="resend">Resend (Recommended)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Currently supporting Resend only.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                            <input
                                type="password"
                                value={emailConfig.apiKey}
                                onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                                placeholder="re_..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">
                                Get your API Key here &rarr;
                            </a>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">From Name</label>
                            <input
                                type="text"
                                value={emailConfig.fromName}
                                onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                                placeholder="Skhy AI Team"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">From Email</label>
                            <input
                                type="email"
                                value={emailConfig.fromEmail}
                                onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                                placeholder="aiskhy7@gmail.com"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={handleTestEmail}
                            disabled={sendingTest || !emailConfig.apiKey || !emailConfig.fromEmail}
                            className="text-sm px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {sendingTest ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                            Send Test Email
                        </button>
                    </div>
                </section>

                {/* Financial Settings */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Financial Configuration</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Platform Fee (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={platformFee}
                                onChange={(e) => setPlatformFee(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-2">Percentage taken from each transaction.</p>
                        </div>
                    </div>
                </section>

                {/* Payment Gateways Section */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Payment Gateways</h2>
                    
                    <div className="space-y-8">
                        {/* RazorPay Configuration */}
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                RazorPay Integration (India Domestic)
                                <span className="text-[10px] px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full uppercase tracking-wider">Conditional</span>
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">RazorPay is only shown to customers with Indian shipping addresses.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Key ID</label>
                                    <input
                                        type="text"
                                        value={razorpayConfig.keyId}
                                        onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keyId: e.target.value })}
                                        placeholder="rzp_live_xxxxxx or rzp_test_xxxxxx"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Key Secret</label>
                                    <input
                                        type="password"
                                        value={razorpayConfig.keySecret}
                                        onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keySecret: e.target.value })}
                                        placeholder="Enter RazorPay Key Secret"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stripe Configuration */}
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <h3 className="text-lg font-medium text-white mb-4">Stripe Integration (Fallback)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Publishable Key</label>
                                    <input
                                        type="text"
                                        value={stripeKey}
                                        onChange={(e) => setStripeKey(e.target.value)}
                                        placeholder="pk_test_..."
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Secret Key</label>
                                    <input
                                        type="password"
                                        value={stripeSecretKey}
                                        onChange={(e) => setStripeSecretKey(e.target.value)}
                                        placeholder="sk_test_..."
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Crypto Wallet Configuration */}
                        <div className="bg-black/20 p-4 rounded-lg border border-cyan-500/20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    <span>Crypto Wallet & Web3 Integration</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full uppercase tracking-wider">
                                        Multi-Chain (Polygon / Ethereum / Arbitrum / Solana)
                                    </span>
                                </h3>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cryptoConfig.enabled}
                                        onChange={(e) => setCryptoConfig({ ...cryptoConfig, enabled: e.target.checked })}
                                        className="rounded bg-navy-950 border-white/20 text-cyan-500 focus:ring-cyan-400"
                                    />
                                    <span className="text-xs text-cyan-400 font-mono">Enable Crypto Payments</span>
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 mb-4">
                                Allow direct stablecoin/crypto transfers (USDC, USDT, ETH, SOL) to merchant cold/multisig addresses with TXID audit or automated invoice processing.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Merchant EVM Receiving Address (Polygon/Ethereum/Arbitrum)</label>
                                    <input
                                        type="text"
                                        value={cryptoConfig.merchantEvmAddress}
                                        onChange={(e) => setCryptoConfig({ ...cryptoConfig, merchantEvmAddress: e.target.value })}
                                        placeholder="0x..."
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Merchant Solana Receiving Address (SOL / Solana USDC)</label>
                                    <input
                                        type="text"
                                        value={cryptoConfig.merchantSolanaAddress}
                                        onChange={(e) => setCryptoConfig({ ...cryptoConfig, merchantSolanaAddress: e.target.value })}
                                        placeholder="Solana Base58 Address..."
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Coinbase Commerce API Key (Optional)</label>
                                    <input
                                        type="password"
                                        value={cryptoConfig.coinbaseApiKey}
                                        onChange={(e) => setCryptoConfig({ ...cryptoConfig, coinbaseApiKey: e.target.value })}
                                        placeholder="Enter Coinbase Commerce API Key"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">NOWPayments API Key (Optional)</label>
                                    <input
                                        type="password"
                                        value={cryptoConfig.nowpaymentsApiKey}
                                        onChange={(e) => setCryptoConfig({ ...cryptoConfig, nowpaymentsApiKey: e.target.value })}
                                        placeholder="Enter NOWPayments API Key"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PayPal Configuration */}
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <h3 className="text-lg font-medium text-white mb-4">PayPal Integration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Client ID</label>
                                    <input
                                        type="text"
                                        value={paypalConfig.client_id}
                                        onChange={(e) => setPaypalConfig({ ...paypalConfig, client_id: e.target.value })}
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Secret Key</label>
                                    <input
                                        type="password"
                                        value={paypalConfig.secret_key}
                                        onChange={(e) => setPaypalConfig({ ...paypalConfig, secret_key: e.target.value })}
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Mode</label>
                                    <select
                                        value={paypalConfig.mode}
                                        onChange={(e) => setPaypalConfig({ ...paypalConfig, mode: e.target.value as 'sandbox' | 'live' })}
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="sandbox">Sandbox</option>
                                        <option value="live">Live</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Shipping & Delivery Partners Section */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Delivery Partners & Logistics Configuration</h2>
                    
                    <div className="space-y-6">
                        {/* DHL Express */}
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    <span>DHL Express Worldwide</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full uppercase tracking-wider">
                                        Priority Air Freight
                                    </span>
                                </h3>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={deliveryPartners.dhl.enabled}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            dhl: { ...deliveryPartners.dhl, enabled: e.target.checked }
                                        })}
                                        className="rounded bg-navy-950 border-white/20 text-cyan-500 focus:ring-cyan-400"
                                    />
                                    <span className="text-xs text-cyan-400 font-mono">Enable DHL Express</span>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">DHL API Key</label>
                                    <input
                                        type="password"
                                        value={deliveryPartners.dhl.apiKey}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            dhl: { ...deliveryPartners.dhl, apiKey: e.target.value }
                                        })}
                                        placeholder="Enter DHL Express API Key"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Account Number</label>
                                    <input
                                        type="text"
                                        value={deliveryPartners.dhl.accountNumber}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            dhl: { ...deliveryPartners.dhl, accountNumber: e.target.value }
                                        })}
                                        placeholder="DHL 9-digit account #"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Handling Surcharge (USD)</label>
                                    <input
                                        type="number"
                                        value={deliveryPartners.dhl.handlingFeeUSD}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            dhl: { ...deliveryPartners.dhl, handlingFeeUSD: parseFloat(e.target.value) || 0 }
                                        })}
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* UPS */}
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    <span>UPS Worldwide</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase tracking-wider">
                                        Saver & Expedited
                                    </span>
                                </h3>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={deliveryPartners.ups.enabled}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            ups: { ...deliveryPartners.ups, enabled: e.target.checked }
                                        })}
                                        className="rounded bg-navy-950 border-white/20 text-cyan-500 focus:ring-cyan-400"
                                    />
                                    <span className="text-xs text-cyan-400 font-mono">Enable UPS</span>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Client ID</label>
                                    <input
                                        type="text"
                                        value={deliveryPartners.ups.clientId}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            ups: { ...deliveryPartners.ups, clientId: e.target.value }
                                        })}
                                        placeholder="UPS OAuth Client ID"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Client Secret</label>
                                    <input
                                        type="password"
                                        value={deliveryPartners.ups.clientSecret}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            ups: { ...deliveryPartners.ups, clientSecret: e.target.value }
                                        })}
                                        placeholder="UPS OAuth Secret"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">UPS Account #</label>
                                    <input
                                        type="text"
                                        value={deliveryPartners.ups.accountNumber}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            ups: { ...deliveryPartners.ups, accountNumber: e.target.value }
                                        })}
                                        placeholder="6-character Shipper #"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Handling Fee (USD)</label>
                                    <input
                                        type="number"
                                        value={deliveryPartners.ups.handlingFeeUSD}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            ups: { ...deliveryPartners.ups, handlingFeeUSD: parseFloat(e.target.value) || 0 }
                                        })}
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ParcelHub */}
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    <span>ParcelHub Logistics</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full uppercase tracking-wider">
                                        Cross-Border & Regional
                                    </span>
                                </h3>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={deliveryPartners.parcelhub.enabled}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            parcelhub: { ...deliveryPartners.parcelhub, enabled: e.target.checked }
                                        })}
                                        className="rounded bg-navy-950 border-white/20 text-cyan-500 focus:ring-cyan-400"
                                    />
                                    <span className="text-xs text-cyan-400 font-mono">Enable ParcelHub</span>
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">API Token</label>
                                    <input
                                        type="password"
                                        value={deliveryPartners.parcelhub.apiToken}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            parcelhub: { ...deliveryPartners.parcelhub, apiToken: e.target.value }
                                        })}
                                        placeholder="ParcelHub Merchant API Token"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Merchant ID</label>
                                    <input
                                        type="text"
                                        value={deliveryPartners.parcelhub.merchantId}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            parcelhub: { ...deliveryPartners.parcelhub, merchantId: e.target.value }
                                        })}
                                        placeholder="ParcelHub Account ID"
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Handling Fee (USD)</label>
                                    <input
                                        type="number"
                                        value={deliveryPartners.parcelhub.handlingFeeUSD}
                                        onChange={(e) => setDeliveryPartners({
                                            ...deliveryPartners,
                                            parcelhub: { ...deliveryPartners.parcelhub, handlingFeeUSD: parseFloat(e.target.value) || 0 }
                                        })}
                                        className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Easyship Configuration */}
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <h3 className="text-lg font-medium text-white mb-4">Easyship Configuration</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">API Key</label>
                                <input
                                    type="password"
                                    value={easyshipConfig.apiKey}
                                    onChange={(e) => setEasyshipConfig({ ...easyshipConfig, apiKey: e.target.value })}
                                    placeholder="Enter Easyship Production API Key"
                                    className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                                />
                                <p className="text-xs text-gray-500 mt-2">Fallback aggregator for regional rates and label generation.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Partner Payouts Section */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Partner Payouts</h2>
                    <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                        <h3 className="text-lg font-medium text-white mb-4">Wise Integration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Wise API Key</label>
                                <input
                                    type="password"
                                    value={wiseConfig.apiKey}
                                    onChange={(e) => setWiseConfig({ ...wiseConfig, apiKey: e.target.value })}
                                    placeholder="Enter Wise API Key"
                                    className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Wise Profile ID</label>
                                <input
                                    type="text"
                                    value={wiseConfig.profileId}
                                    onChange={(e) => setWiseConfig({ ...wiseConfig, profileId: e.target.value })}
                                    placeholder="Enter Wise Profile ID"
                                    className="w-full bg-navy-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 italic">Note: Payouts are automatically triggered when an order is updated to "Delivered" in the Partner Dashboard.</p>
                    </div>
                </section>

                {/* Bank Details */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">SWIFT / Bank Transfer Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Bank Name</label>
                            <input
                                type="text"
                                value={swiftDetails.bank_name}
                                onChange={(e) => setSwiftDetails({ ...swiftDetails, bank_name: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Account Name</label>
                            <input
                                type="text"
                                value={swiftDetails.account_name}
                                onChange={(e) => setSwiftDetails({ ...swiftDetails, account_name: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">SWIFT / BIC Code</label>
                            <input
                                type="text"
                                value={swiftDetails.swift_code}
                                onChange={(e) => setSwiftDetails({ ...swiftDetails, swift_code: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Account Number / IBAN</label>
                            <input
                                type="text"
                                value={swiftDetails.account_number}
                                onChange={(e) => setSwiftDetails({ ...swiftDetails, account_number: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="border-t border-white/5 mt-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bank Address */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 mb-4">Bank Address</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    value={swiftDetails.bank_address?.street || ''}
                                    onChange={(e) => setSwiftDetails({ ...swiftDetails, bank_address: { ...swiftDetails.bank_address!, street: e.target.value } })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={swiftDetails.bank_address?.city || ''}
                                        onChange={(e) => setSwiftDetails({ ...swiftDetails, bank_address: { ...swiftDetails.bank_address!, city: e.target.value } })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="State/Province"
                                        value={swiftDetails.bank_address?.state || ''}
                                        onChange={(e) => setSwiftDetails({ ...swiftDetails, bank_address: { ...swiftDetails.bank_address!, state: e.target.value } })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Postal Code"
                                        value={swiftDetails.bank_address?.postal_code || ''}
                                        onChange={(e) => setSwiftDetails({ ...swiftDetails, bank_address: { ...swiftDetails.bank_address!, postal_code: e.target.value } })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Country"
                                        value={swiftDetails.bank_address?.country || ''}
                                        onChange={(e) => setSwiftDetails({ ...swiftDetails, bank_address: { ...swiftDetails.bank_address!, country: e.target.value } })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Beneficiary Address */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-300 mb-4">Beneficiary Address</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    value={swiftDetails.beneficiary_address?.street || ''}
                                    onChange={(e) => setSwiftDetails({ ...swiftDetails, beneficiary_address: { ...swiftDetails.beneficiary_address!, street: e.target.value } })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={swiftDetails.beneficiary_address?.city || ''}
                                        onChange={(e) => setSwiftDetails({ ...swiftDetails, beneficiary_address: { ...swiftDetails.beneficiary_address!, city: e.target.value } })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="State/Province"
                                        value={swiftDetails.beneficiary_address?.state || ''}
                                        onChange={(e) => setSwiftDetails({ ...swiftDetails, beneficiary_address: { ...swiftDetails.beneficiary_address!, state: e.target.value } })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Postal Code"
                                        value={swiftDetails.beneficiary_address?.postal_code || ''}
                                        onChange={(e) => setSwiftDetails({ ...swiftDetails, beneficiary_address: { ...swiftDetails.beneficiary_address!, postal_code: e.target.value } })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Country"
                                        value={swiftDetails.beneficiary_address?.country || ''}
                                        onChange={(e) => setSwiftDetails({ ...swiftDetails, beneficiary_address: { ...swiftDetails.beneficiary_address!, country: e.target.value } })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Enrichment Configuration */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Data Enrichment Configuration (Apollo.io)</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Apollo API Key</label>
                            <input
                                type="password"
                                value={apolloKey}
                                onChange={(e) => setApolloKey(e.target.value)}
                                placeholder="Enter Apollo.io API Key..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                            />
                            <a href="https://app.apollo.io/#/settings/integrations/api" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">
                                Get your API Key here &rarr;
                            </a>
                        </div>
                    </div>
                </section>

                {/* Security & Access Settings */}
                <section className="bg-navy-900 border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-6 border-b border-white/10 pb-4">Security & Access Control</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5">
                            <div>
                                <h3 className="text-white font-medium">Cloudflare Turnstile (CAPTCHA)</h3>
                                <p className="text-sm text-gray-400">Add an extra layer of security to Login and Register pages.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={cloudflareAuthEnabled}
                                    onChange={(e) => setCloudflareAuthEnabled(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {newPassword && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <button
                                type="button"
                                onClick={handleChangePassword}
                                disabled={saving || !newPassword || newPassword !== confirmPassword || newPassword.length < 6}
                                className="text-sm px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                Update Password
                            </button>
                            <p className="text-xs text-gray-500 mt-2">Requires active login session.</p>
                        </div>
                    )}
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                        Save Configuration
                    </button>
                </div>
            </div >
        </div >
    );
};

export default AdminSettings;


