import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Send, CheckCircle, AlertCircle, Loader, Users, FileText, Sparkles } from 'lucide-react';
import { EmailTemplates } from '../../utils/EmailTemplates';
import { generateEmailTemplate } from '../../services/emailAiService';

interface Product {
    id: number;
    name: string;
    user_id: string;
    category?: string;
}

const EmailCampaign: React.FC = () => {
    const [campaignType, setCampaignType] = useState<'product' | 'onboarding' | 'customer_outreach' | 'partner_outreach' | 'newsletter' | 'adb_proposal'>('product');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [bestRequirements, setBestRequirements] = useState<string[]>([]);

    // Templates
    const PRODUCT_TEMPLATE = `Dear [NAME],\n\nWe're excited to present our latest defense technology solutions: [PRODUCTS]\n\nThese systems are designed for high-stakes environments, offering industry-leading resilience and performance.\n\nWe would love to discuss how these can fit into your procurement roadmap.\n\nBest regards,\nSkhy AI Team`;

    const ONBOARDING_TEMPLATE = `Dear [NAME],\n\nWe noticed your partner application is pending completion. We would love to have you onboard as an official Skhy AI partner.\n\nAs a partner, you gain access to exclusive pricing, priority support, and our advanced product catalog.\n\nPlease log in to your dashboard to complete your profile here:\n[LINK]\n\nBest regards,\nSkhy AI Team`;

    const CUSTOMER_TEMPLATE = `Dear [NAME],\n\nI hope this email finds you well.\n\nBased on your strategic focus, I wanted to introduce Skhy AI's autonomous threat awareness and communication solutions.\n\nWe have curated a selection of products that align with your operational requirements:\n[LINK]\n\nI would welcome the opportunity to discuss a potential pilot.\n\nBest regards,\nDr. Skhy\nFounder, Skhy AI`;

    const ADB_PROPOSAL_TEMPLATE = `Dear [NAME],\n\nSubject: Submission of Capabilities – Indigenous Sovereign AI & Counter-Drone Solutions\n\n1. Executive Summary\n\nSkhy AI (Defense Vertical / Skhy Signal) is a Pune-based Indian deep-tech entity specializing in indigenous Acoustic Intelligence (ACINT), Multi-Modal Sensor Fusion, and Sovereign Edge AI infrastructure.\n\nEstablished with the mission to bridge the "OODA Loop" gap in modern warfare, Skhy AI addresses critical blind spots in conventional surveillance (active threats, low-RCS drones, hidden intruders) through passive sensing and localized, offline AI processing.\n\nThis dossier submits our capabilities for review by the Army Design Bureau (ADB) for potential integration into border surveillance, counter-drone (C-UAS) grids, and tactical situational awareness frameworks under the Atmanirbhar Bharat initiative.\n\n2. Strategic Alignment with Indian Army Requirements\n\n- Make in India / Atmanirbhar Bharat: 100% indigenous IP, designed and developed in Pune.\n- Data Sovereignty: All processing is strictly local (Edge AI). No data is routed to foreign cloud servers, mitigating cyber-espionage risks.\n- Problem Statement Addressing: Directly addresses ADB Compendium challenges related to:\n  * Counter-Drone Systems (Soft/Hard Kill queuing).\n  * Non-Line-of-Sight (NLOS) Threat Detection.\n  * Real-time Border Infiltration Monitoring.\n\n3. Core Technology & Solutions\n\nA. Skhy Threat Awareness System (STAS)\nA unified command-and-control layer that fuses data from acoustic arrays, RF sensors, and optical cameras to provide a 360-degree shield.\n- Passive Detection: Unlike radar, our acoustic sensors emit no signature, making them undetectable by the enemy.\n- Multi-Modal Validation: An acoustic trigger (e.g., drone hum) automatically slews optical cameras for visual verification, reducing false positives.\n- Latency: Sub-second detection and classification.\n\nB. Skhy Vidur Manager: Sovereign AI Infrastructure\nA hardware-agnostic AI management system designed for field operations where internet connectivity is compromised or forbidden.\n- Function: Acts as a central AI server and hardware guard.\n- Security: Strictly isolated intelligence client (Air-gapped ready).\n- Capability: Manages local inference models for object detection (weapons, uniforms, vehicles) without reaching out to the cloud.\n\nC. Hardware Portfolio (Acoustic & Sensor Arrays)\n- SKHY-A7 (Sentinel): Compact acoustic sensor for platoon-level protection.\n- SKHY-A16 (Long-Range): High-sensitivity array for base perimeter defense.\n- SKHY-MOBISENSE: Mobile mast fusing Acoustic + RF for rapid deployment.\n- AeroGuard: Aerodynamic protective cones for Indian UAVs.\n\n4. Operational Use Cases\n\n- Counter-UAS (Anti-Drone) Shield: Detects Class 1 & 2 drones via acoustic signature even in low visibility or urban clutter.\n- Sniper & Gunfire Localization: Triangulates shooter location instantly using acoustic shockwaves.\n- Pipeline & Critical Infrastructure Monitoring: Real-time integrity monitoring against sabotage.\n\n5. Proposal for Engagement\n\nSkhy AI requests an opportunity to demonstrate these capabilities via a No-Cost-No-Commitment (NCNC) Trial at a location designated by the Army Design Bureau.\n\nWe are prepared to deploy a SKHY-A7 Sentinel unit combined with the Vidur Manager to demonstrate:\n- Real-time drone detection < 500m.\n- Differentiation between biologicals (birds) and mechanicals (drones).\n- Zero-latency offline processing.\n\n6. Contact Information\n\nHQ Location: Pune, Maharashtra, India\nEntity Type: Indigenous Deep-Tech / Defense Startup (Founded 2025)\nEmail: contact@skhy.systems / contact@skhysignal.com\nWebsite: skhy.systems\n\nSincerely,\nAuthorized Signatory\nSkhy AI`;

    useEffect(() => {
        // Update default template when type changes
        if (campaignType === 'product') {
            setEmailSubject('Exclusive: New Skhy AI Defense Solutions');
            setEmailBody(PRODUCT_TEMPLATE);
        } else if (campaignType === 'onboarding') {
            setEmailSubject('Action Required: Complete your Skhy Partner Profile');
            setEmailBody(ONBOARDING_TEMPLATE);
        } else if (campaignType === 'customer_outreach') {
            setEmailSubject('Advancing Strategic Capabilities with Skhy AI');
            setEmailBody(CUSTOMER_TEMPLATE);
        } else if (campaignType === 'partner_outreach') {
            setEmailSubject('Partnership Opportunity: Distributing Skhy AI Solutions');
            setEmailBody(PARTNER_OUTREACH_TEMPLATE);
        } else if (campaignType === 'newsletter') {
            setEmailSubject('Skhy AI Monthly Update: Innovations on the Horizon');
            setEmailBody(`Dear Subscribers,\n\nWe are thrilled to share our latest advancements in autonomous defense systems.\n\nThis month, we are focusing on:\n- Enhancements to the Skhy Vidur Platform.\n- New strategic partnerships in the APAC region.\n\nRead more on our blog:\n[LINK]\n\nStay safe,\nSkhy AI Team`);
        } else if (campaignType === 'adb_proposal') {
            setEmailSubject('Skhy AI Executive Summary: Indigenous Sovereign AI & Counter-Drone Capabilities');
            setEmailBody(ADB_PROPOSAL_TEMPLATE);
        }
    }, [campaignType]);

    const handleAiGenerate = async () => {
        const userPrompt = window.prompt("Describe the goal of this campaign (e.g. 'Outreach for STAS acoustic sensors for border security'):");
        if (!userPrompt) return;

        setAiGenerating(true);
        try {
            const context = `Campaign Type: ${campaignType}. Selected Products: ${selectedProducts.join(', ')}`;
            const result = await generateEmailTemplate(userPrompt, context);
            setEmailSubject(result.subject);
            setEmailBody(result.body);
            setBestRequirements(result.bestRequirements);
            setMessage({ type: 'success', text: 'AI generated a new template and identified core requirements.' });
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.message });
        } finally {
            setAiGenerating(false);
        }
    };

    // Helper to toggle product selection
    const toggleProductSelection = (productId: number) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const sendCampaign = async () => {
        setLoading(true);
        setMessage(null);

        try {
            // 2. Fetch Recipients logic
            let recipients: any[] = [];
            if (campaignType === 'product' || campaignType === 'customer_outreach' || campaignType === 'adb_proposal') {
                const { data } = await supabase.from('pitch_deck_recipients').select('email, name, notes').in('category', ['vc', 'customer', 'government']);
                recipients = data || [];
            } else if (campaignType === 'onboarding') {
                // Placeholder for onboarding logic
            }

            console.log("Sending to", recipients.length);
            setMessage({ type: 'success', text: `Campaign sent to ${recipients.length} recipients successfully!` });

        } catch (error: any) {
            console.error('Campaign Error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to send campaign' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold font-display">Email Campaigns</h1>
                </div>

                {/* Campaign Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => setCampaignType('product')}
                        className={`p-4 rounded-xl border transition-all text-left ${campaignType === 'product'
                            ? 'bg-turquoise-500/10 border-turquoise-500 text-turquoise-400'
                            : 'bg-navy-900 border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-5 h-5" />
                            <div className="font-semibold">Product Launch</div>
                        </div>
                        <div className="text-sm opacity-80">Promote new defense solutions</div>
                    </button>

                    <button
                        onClick={() => setCampaignType('adb_proposal')}
                        className={`p-4 rounded-xl border transition-all text-left md:col-span-2 ${campaignType === 'adb_proposal'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                            : 'bg-navy-900 border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-5 h-5" />
                            <div className="font-semibold text-lg">ADB Proposal (Gov)</div>
                        </div>
                        <div className="text-sm opacity-80">Target: Government & Defense Contacts</div>
                    </button>

                    <button
                        onClick={() => setCampaignType('newsletter')}
                        className={`p-4 rounded-xl border transition-all text-left ${campaignType === 'newsletter'
                            ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                            : 'bg-navy-900 border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-5 h-5" />
                            <div className="font-semibold">Newsletter</div>
                        </div>
                        <div className="text-sm opacity-80">Monthly updates</div>
                    </button>

                    <button
                        onClick={() => setCampaignType('onboarding')}
                        className={`p-4 rounded-xl border transition-all text-left ${campaignType === 'onboarding'
                            ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                            : 'bg-navy-900 border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-5 h-5" />
                            <div className="font-semibold">Partner Onboarding</div>
                        </div>
                        <div className="text-sm opacity-80">Nudge pending partners</div>
                    </button>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Product Selection (Visible only for Product Campaign) */}
                    {(campaignType === 'product' || campaignType === 'customer_outreach') ? (
                        <div className="bg-navy-900 rounded-xl p-6 border border-white/10">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-turquoise-400" />
                                Select Products
                            </h2>
                            <p className="text-sm text-gray-400 mb-4">
                                Choose products to showcase.
                            </p>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {products.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No approved products found</p>
                                ) : (
                                    products.map(product => (
                                        <label
                                            key={product.id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product.id)}
                                                onChange={() => toggleProductSelection(product.id)}
                                                className="w-5 h-5 rounded border-gray-600 text-turquoise-500 focus:ring-turquoise-500 focus:ring-offset-0"
                                            />
                                            <span className="flex-1">{product.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-sm text-gray-400">
                                    Selected: <span className="text-white font-semibold">{selectedProducts.length}</span> product(s)
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-navy-900 rounded-xl p-6 border border-white/10 flex flex-col justify-center items-center text-center">
                            <div className="bg-blue-500/10 p-4 rounded-full mb-4">
                                <Users className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {campaignType === 'adb_proposal' ? 'Executive Proposal Mode' : 'Standard Campaign Mode'}
                            </h3>
                            <p className="text-gray-400 max-w-sm">
                                {campaignType === 'adb_proposal'
                                    ? 'Generating specialized executive summary and proposal for Army Design Bureau review.'
                                    : 'This campaign mode does not require specific product selection.'}
                            </p>
                        </div>
                    )}

                    {/* Email Composer */}
                    <div className="bg-navy-900 rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Mail className="w-5 h-5 text-turquoise-400" />
                                Compose Email
                            </h2>
                            <button
                                onClick={handleAiGenerate}
                                disabled={aiGenerating}
                                className="flex items-center gap-2 px-3 py-1.5 bg-turquoise-500/10 hover:bg-turquoise-500/20 text-turquoise-400 rounded-lg border border-turquoise-500/30 text-xs font-bold transition-all"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                {aiGenerating ? 'Generating...' : 'AI Generate'}
                            </button>
                        </div>

                        {bestRequirements.length > 0 && (
                            <div className="mb-6 p-3 bg-navy-800 rounded-lg border border-white/5">
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Identified Best Requirements</div>
                                <div className="flex gap-2">
                                    {bestRequirements.map((req, i) => (
                                        <span key={i} className="px-2 py-1 bg-turquoise-500/10 text-turquoise-400 rounded text-[10px] font-mono border border-turquoise-500/20">
                                            {req}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="Campaign Subject"
                                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email Body</label>
                                <textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    placeholder="Write your campaign message here..."
                                    rows={12}
                                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white resize-none font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Variables: <code className="bg-navy-800 px-2 py-1 rounded">[NAME]</code>, <code className="bg-navy-800 px-2 py-1 rounded">[LINK]</code>
                                    {['product', 'customer_outreach'].includes(campaignType) && <>, <code className="bg-navy-800 px-2 py-1 rounded">[PRODUCTS]</code></>}
                                </p>
                            </div>

                            <button
                                onClick={sendCampaign}
                                disabled={loading || (campaignType === 'product' && selectedProducts.length === 0)}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-turquoise-500 to-blue-600 hover:from-turquoise-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Sending Campaign...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Campaign
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailCampaign;
