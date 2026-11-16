// Replaces VCRecipientManagement with a generalized Contacts Manager
// Handles VCs, Customers, and potential Partners

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Plus, Upload, Download, Edit2, Trash2, Link as LinkIcon, CheckCircle, AlertCircle, Loader, Search, Filter, Briefcase, UserCircle, Handshake, Mail, X, Copy, ExternalLink } from 'lucide-react';

interface Recipient {
    id: string;
    name: string;
    email: string;
    company?: string;
    country: string;
    region?: string;
    notes?: string;
    category: 'vc' | 'customer' | 'partner' | 'newsletter';
    created_at: string;
    linkedin_url?: string;
    is_subscribed: boolean;
    unsubscribed_at?: string;
    source?: string;
    interests?: string[];
    activity_log?: any[];
}

const ContactManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'vc' | 'customer' | 'partner' | 'newsletter'>('vc');
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [generatingExport, setGeneratingExport] = useState(false);
    
    // Zoho Email modal state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedEmailData, setSelectedEmailData] = useState<{
        recipientName: string;
        recipientEmail: string;
        subject: string;
        body: string;
    } | null>(null);
    const [zohoDomain, setZohoDomain] = useState<string>(() => {
        return localStorage.getItem('skhy_zoho_domain') || 'mail.zoho.com';
    });

    // Form state
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        country: 'UAE',
        region: '',
        notes: '',
        linkedin_url: '',
        is_subscribed: true,
        interests: [] as string[]
    });

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [interestFilter, setInterestFilter] = useState<string>('all');

    // CSV Import
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchRecipients();
    }, [activeTab]); // Refetch when tab changes

    const fetchRecipients = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('pitch_deck_recipients')
                .select('*')
                .eq('category', activeTab)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRecipients(data || []);
        } catch (err) {
            console.error('Error fetching recipients:', err);
            setMessage({ type: 'error', text: 'Failed to load recipients' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.country) {
            setMessage({ type: 'error', text: 'Please fill in all required fields' });
            return;
        }

        try {
            if (editingId) {
                // Update existing
                const { error } = await supabase
                    .from('pitch_deck_recipients')
                    .update({
                        name: formData.name,
                        email: formData.email,
                        company: formData.company || null,
                        country: formData.country,
                        region: formData.region || null,
                        notes: formData.notes || null,
                        linkedin_url: formData.linkedin_url || null,
                        is_subscribed: formData.is_subscribed,
                        interests: formData.interests
                    })
                    .eq('id', editingId);

                if (error) throw error;
                setMessage({ type: 'success', text: 'Recipient updated successfully' });
            } else {
                // Create new
                const { error } = await supabase
                    .from('pitch_deck_recipients')
                    .insert({
                        name: formData.name,
                        email: formData.email,
                        company: formData.company || null,
                        country: formData.country,
                        region: formData.region || null,
                        notes: formData.notes || null,
                        linkedin_url: formData.linkedin_url || null,
                        category: activeTab,
                        is_subscribed: formData.is_subscribed,
                        interests: formData.interests
                    });

                if (error) throw error;
                setMessage({ type: 'success', text: 'Recipient added successfully' });
            }

            resetForm();
            fetchRecipients();
        } catch (err: any) {
            console.error('Error saving recipient:', err);
            if (err.code === '23505') {
                setMessage({ type: 'error', text: 'Email already exists' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save recipient' });
            }
        }
    };

    const handleEdit = (recipient: Recipient) => {
        setFormData({
            name: recipient.name,
            email: recipient.email,
            company: recipient.company || '',
            country: recipient.country,
            region: recipient.region || '',
            notes: recipient.notes || '',
            linkedin_url: recipient.linkedin_url || '',
            is_subscribed: recipient.is_subscribed,
            interests: recipient.interests || []
        });
        setEditingId(recipient.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this recipient?')) return;

        try {
            const { error } = await supabase
                .from('pitch_deck_recipients')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Recipient deleted' });
            fetchRecipients();
        } catch (err) {
            console.error('Error deleting recipient:', err);
            setMessage({ type: 'error', text: 'Failed to delete recipient' });
        }
    };

    const toggleSubscription = async (recipient: Recipient) => {
        try {
            const { error } = await supabase
                .from('pitch_deck_recipients')
                .update({ is_subscribed: !recipient.is_subscribed })
                .eq('id', recipient.id);

            if (error) throw error;
            setMessage({ type: 'success', text: `Subscription ${!recipient.is_subscribed ? 'activated' : 'deactivated'} for ${recipient.email}` });
            fetchRecipients();
        } catch (err) {
            console.error('Error toggling subscription:', err);
            setMessage({ type: 'error', text: 'Failed to update subscription status' });
        }
    };

    const generateTrackingLink = async (recipient: Recipient) => {
        try {
            // Check if link already exists
            const { data: existing } = await supabase
                .from('pitch_deck_campaign_links')
                .select('tracking_token')
                .eq('recipient_id', recipient.id)
                .is('campaign_id', null)
                .maybeSingle();

            let token = existing?.tracking_token;

            if (!token) {
                // Create new tracking link
                const { data, error } = await supabase
                    .from('pitch_deck_campaign_links')
                    .insert({
                        recipient_id: recipient.id,
                        campaign_id: null
                    })
                    .select('tracking_token')
                    .single();

                if (error) throw error;
                token = data.tracking_token;
            }

            let path = '/pitch-deck';
            const params = new URLSearchParams();
            params.append('token', token);

            if (recipient.category === 'partner') {
                path = '/register';
                params.append('type', 'partner');
            } else if (recipient.category === 'customer') {
                path = '/marketplace';
                // Try to parse interest from notes
                if (recipient.notes) {
                    const interestMatch = recipient.notes.match(/Interested in:\s*([^,.\n]+)/i);
                    if (interestMatch && interestMatch[1]) {
                        params.append('category', interestMatch[1].trim());
                    }
                }
            }

            return `${window.location.origin}${path}?${params.toString()}`;
        } catch (err) {
            console.error('Error generating link:', err);
            return null;
        }
    };

    const copyTrackingLink = async (recipient: Recipient) => {
        const link = await generateTrackingLink(recipient);
        if (link) {
            await navigator.clipboard.writeText(link);
            setMessage({ type: 'success', text: `Link copied for ${recipient.email}` });
        } else {
            setMessage({ type: 'error', text: 'Failed to generate tracking link' });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            company: '',
            country: 'UAE',
            region: '',
            notes: '',
            linkedin_url: '',
            is_subscribed: true,
            interests: []
        });
        setEditingId(null);
        setShowAddForm(false);
    };

    const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());

            // Skip header row
            const dataLines = lines.slice(1);
            let candidates: any[] = [];

            for (const line of dataLines) {
                // Handle simple CSV splitting
                const [name, email, company, country, region, notes, linkedin_url] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
                if (name && email) {
                    candidates.push({
                        name,
                        email: email.toLowerCase(), // Normalize
                        company: company || null,
                        country: country || 'UAE',
                        region: region || null,
                        notes: notes || null,
                        linkedin_url: linkedin_url || null,
                        category: activeTab
                    });
                }
            }

            if (candidates.length === 0) {
                setMessage({ type: 'error', text: 'No valid recipients found in CSV' });
                return;
            }

            // 1. Fetch existing emails for this category
            const candidateEmails = candidates.map(c => c.email);
            const { data: existing, error: fetchError } = await supabase
                .from('pitch_deck_recipients')
                .select('email')
                .eq('category', activeTab)
                .in('email', candidateEmails);

            if (fetchError) throw fetchError;

            const existingEmails = new Set(existing?.map(e => e.email.toLowerCase()) || []);

            // 2. Filter out duplicates
            const newRecipients = candidates.filter(c => !existingEmails.has(c.email));

            if (newRecipients.length === 0) {
                setMessage({ type: 'success', text: 'All contacts in this CSV already exist. No new entries added.' });
                return;
            }

            // 3. Bulk insert new unique records
            const { error } = await supabase
                .from('pitch_deck_recipients')
                .insert(newRecipients);

            if (error) throw error;

            const skipped = candidates.length - newRecipients.length;
            setMessage({
                type: 'success',
                text: `Imported ${newRecipients.length} new recipients. Skipped ${skipped} duplicates.`
            });

            fetchRecipients();
        } catch (err: any) {
            console.error('CSV import error:', err);
            setMessage({ type: 'error', text: 'Failed to import CSV' });
        } finally {
            setImporting(false);
            e.target.value = ''; // Reset file input
        }
    };

    const handleGenerateEmail = async (recipient: Recipient) => {
        let subject = "";
        let bodyIntro = "";

        // Customize subject and intro based on category
        if (recipient.category === 'vc') {
            const nameLower = recipient.name.toLowerCase();
            const companyLower = (recipient.company || '').toLowerCase();
            const notesLower = (recipient.notes || '').toLowerCase();
            
            // Build matching profiles for investors based on their focus
            if (companyLower.includes('chiratae') || nameLower.includes('shailja')) {
                subject = `Chiratae x Skhy AI: Sovereign Edge Intelligence for Global Markets`;
                bodyIntro = `Given Chiratae's outstanding track record of backing highly transformative deep tech and SaaS leaders out of India (such as Uniphore and Lenskart), I wanted to share Skhy AI's thesis.

We have engineered Atmanirbhar passive acoustic intelligence arrays (TRL-5 TAM sensor mesh) and high-assurance middleware (Vidur AI OS) out of Pune, designed to scale globally. We believe Skhy AI fits perfectly into Chiratae’s vision of backing world-class deep tech solving critical physical security problems.`;
            } else if (companyLower.includes('g42')) {
                subject = `Skhy AI x G42: High-Assurance Sovereign Edge Infrastructure`;
                bodyIntro = `Given G42's leadership in building the UAE's sovereign AI and massive data center cloud infrastructure (such as Khazna and Core42), I wanted to highlight how Skhy AI provides direct strategic alignment.

We build decentralized, air-gapped acoustic sensor grids powered by our custom cryptographic middleware, Vidur AI OS. By keeping data processing strictly at the tactical edge without reliance on Western hyperscaler clouds, Skhy AI delivers high-assurance perimeter security that complements G42's vision of national AI self-reliance.`;
            } else if (companyLower.includes('next 50') || companyLower.includes('next50')) {
                subject = `Skhy AI x Next 50: Continuous Acoustic Auditing for Industrial Automation`;
                bodyIntro = `Given Next 50's focus on accelerating industrial AI, heavy machinery automation, and smart transport infrastructure, I wanted to reach out regarding an exciting synergy.

Skhy AI's Threat Awareness Manager (TAM) leverages passive acoustic meshes to continuously audit and protect high-value industrial assets (power grids, pipelines, and logistics corridors). We detect mechanical stress anomalies and physical perimeter breaches instantly at the edge, offering a highly autonomous security layer for your smart automation portfolio.`;
            } else if (companyLower.includes('dubai future')) {
                subject = `Skhy AI x Dubai Future District Fund: Autonomous Robotics and Urban Safety`;
                bodyIntro = `Following Dubai Future District Fund's mandate to establish Dubai as a global hub for future robotics, advanced AI, and autonomous systems, I wanted to introduce Skhy AI.

We provide modular, dual-use passive acoustic sensor arrays (TRL-5) and flight-validated mission planning middleware (TRL-8 Mission Architect) that integrate directly with autonomous ground rovers and UAV fleets. Our platform provides high-fidelity, real-time threat mapping, perfectly aligning with Dubai's future-ready robotics initiatives.`;
            } else if (companyLower.includes('waha')) {
                subject = `Skhy AI x Waha Capital: Capital-Efficient Dual-Use Defense Technology`;
                bodyIntro = `Given Waha Capital's focus on private and public markets tech exposure and capital-efficient growth, I wanted to share our deployment updates.

Skhy AI has built a highly scalable, low-CAPEX hardware-enabled software model. With our TRL-8 Mission Architect and TRL-5 TAM acoustic array mesh already deployed and validating configurations in real-time, we are unlocking massive commercial margins in the dual-use defense and infrastructure security sectors.`;
            } else if (companyLower.includes('ithmar')) {
                subject = `Skhy AI x Ithmar Capital: Securing UAE's Critical National Assets`;
                bodyIntro = `Given Ithmar Capital's deep roots in strategic private equity and large-scale infrastructure growth in the GCC, I wanted to present Skhy AI.

We build high-security passive acoustic sensor arrays (TAM) that act as an invisible, continuous digital shield for critical physical national assets—including oil facilities, sea ports, and high-value transport links. Our low-power edge nodes offer long-term asset protection and border security with minimal maintenance.`;
            } else if (companyLower.includes('vy capital') || companyLower.includes('vy ')) {
                subject = `Skhy AI x Vy Capital: Building the Global Sensor Layer for Edge AI`;
                bodyIntro = `Given Vy Capital's legacy of backing massive, paradigm-shifting tech companies like SpaceX, Neuralink, and xAI, I wanted to share Skhy AI.

We are building a global decentralized sensory layer. Skhy AI pairs specialized edge hardware (our passive acoustic tetrahedral arrays) with robust middleware (Vidur AI OS) to process complex real-world sounds instantly. Much like SpaceX revolutionized launch, we are restructuring passive defense intelligence from the ground up.`;
            } else if (companyLower.includes('nowais')) {
                subject = `Skhy AI x Al Nowais: Passive Acoustic Defense for Energy Infrastructure`;
                bodyIntro = `Given Al Nowais's extensive portfolio in energy, industrial systems, and infrastructure technology, I am reaching out to share a highly synergistic application.

Skhy AI’s passive acoustic arrays provide terrain-aware, continuous perimeter defense for critical energy assets, oil pipelines, refineries, and power generation hubs. Operating silently and invisibly, our edge nodes detect breaches, drone presence, and structural anomalies, adding robust security without electromagnetic noise.`;
            } else if (companyLower.includes('hamoodah')) {
                subject = `Skhy AI x Bin Hamoodah: Next-Gen Industrial Site Defense & Safety`;
                bodyIntro = `Given Bin Hamoodah Group's multi-decade leadership in oil & gas services, critical utilities, and industrial safety, I wanted to reach out regarding our passive monitoring arrays.

Skhy AI provides air-gapped acoustic monitoring meshes (TAM) designed to detect equipment failure and external security threats in high-hazard industrial environments. Running entirely on the edge, it ensures continuous site safety without generating radio frequencies.`;
            } else if (companyLower.includes('habtoor')) {
                subject = `Skhy AI x Al Habtoor: Invisible VIP and Commercial Asset Security`;
                bodyIntro = `Given Al Habtoor Group's legacy in high-end hospitality, automotive, and commercial real estate, I wanted to present Skhy AI's non-intrusive security arrays.

Unlike intrusive cameras or radars, Skhy AI's passive acoustic mesh monitors perimeters silently and invisibly. It automatically identifies audio threats (drones, glass breaks, vehicles) while fully respecting privacy, offering a premium safety layer for luxury estates, resorts, and major real estate assets.`;
            } else if (companyLower.includes('sultan')) {
                subject = `Skhy AI x Sultan Investments: Next-Gen Infrastructure Security`;
                bodyIntro = `Given Sultan Investments' strong portfolio in real estate developments and technical infrastructure, I wanted to highlight Skhy AI.

We provide edge AI-powered passive acoustic sensor arrays that integrate into smart real estate boundaries, high-security data centers, and transport depots. Our system delivers zero-latency threat alerts, enhancing the resilience of premium physical infrastructure.`;
            } else if (companyLower.includes('obs')) {
                subject = `Skhy AI x OBS Group: Disruptive Edge Computing & Spatial AI`;
                bodyIntro = `Given OBS Group's legacy of nurturing disruptive, high-growth companies across diverse sectors, I wanted to share Skhy AI's recent breakthrough.

We have built a unified software-hardware framework for acoustic edge intelligence. Our proprietary Vidur AI OS provides air-gapped, high-assurance cryptographic isolation, allowing defense and industrial customers to run sensitive spatial AI algorithms directly on low-power edge nodes.`;
            } else if (companyLower.includes('chalhoub')) {
                subject = `Skhy AI x Chalhoub Group: High-Assurance Retail Security & Smart Spaces`;
                bodyIntro = `Given Chalhoub Group's leadership in luxury retail and your exploration of smart spaces and retail AI, I wanted to introduce a privacy-first security solution.

Skhy AI's passive sensor networks detect auditory threats (glass shattering, alarms, unauthorized entries) with absolute privacy preservation. It does not record speech or capture video, making it ideal for continuous, non-intrusive spatial protection in premium retail zones.`;
            } else if (companyLower.includes('rostamani') || companyLower.includes('gmg') || companyLower.includes('gulf marketing')) {
                subject = `Skhy AI: Securing Advanced Logistics and Automotive Assets`;
                bodyIntro = `Given your extensive footprint in automotive retail, commercial fleets, and high-volume logistics infrastructure, I wanted to share Skhy AI.

We deploy passive acoustic sensors to secure major logistics depots, distribution centers, and shipping ports. Our edge nodes detect unauthorized vehicles, drone intrusion, and physical perimeter breaches, minimizing inventory risk across regional supply chains.`;
            } else if (companyLower.includes('kanoo')) {
                subject = `Skhy AI x Kanoo Group: Silent Maritime Port & Supply Chain Defense`;
                bodyIntro = `Given the Kanoo Group's historical leadership in regional shipping, logistics, and port operations, I wanted to reach out regarding our physical defense systems.

Skhy AI's Threat Awareness Manager (TAM) deploys passive acoustic arrays to monitor maritime borders and port facilities. By identifying acoustic signatures of approaching airborne drones or surface vessels, we secure supply chain choke points silently and efficiently.`;
            } else if (companyLower.includes('al tayer') || companyLower.includes('seddiqi')) {
                subject = `Skhy AI: Premium Non-Intrusive Spatial Threat Awareness`;
                bodyIntro = `Given your focus on luxury brand management, real estate, and high-end automotive systems, I wanted to share Skhy AI.

We engineer silent, passive acoustic arrays that monitor commercial perimeters without visual cameras or active radar. Our edge technology respects user privacy while delivering high-assurance threat mapping, perfectly suited for high-value commercial centers.`;
            } else if (companyLower.includes('majid') || companyLower.includes('futtaim') || companyLower.includes('ghurair')) {
                subject = `Skhy AI: Decentralized Smart City and Real Estate Security`;
                bodyIntro = `Given your pioneer status in constructing smart cities, mixed-use communities, and massive retail hubs (like Mall of the Emirates), I wanted to introduce Skhy AI's passive sensory grid.

Our TAM acoustic mesh integrates seamlessly with smart city operations centers, mapping noise pollution and immediately flagging gunshot, glass break, or illegal drone audio signatures in real time, keeping master-planned developments safe and resilient.`;
            } else if (companyLower.includes('rady')) {
                subject = `Skhy AI x Rady Industries: Industrial Edge AI and Acoustic Diagnostics`;
                bodyIntro = `Given Rady Industries' deep tech focus and industrial engineering heritage, I wanted to share Skhy AI's edge monitoring solutions.

We deploy passive sound analysis nodes right on heavy industrial machinery. Our edge CNNs can listen to mechanical sounds to isolate micro-vibrations and predict mechanical fatigue before failure occurs, boosting factory runtime and high-value asset security.`;
            } else if (companyLower.includes('saverin') || companyLower.includes('b capital')) {
                subject = `B Capital x Skhy AI: Sovereign Dual-Use Tech Bridging India, UAE, and SEA`;
                bodyIntro = `Given B Capital's deep partnership with BCG and track record of backing global tech giants scaling across US and Asia, I wanted to share Skhy AI.

We are a dual-use defense deep tech company specializing in passive acoustic intelligence and sovereign edge AI. With our strategic bridge spanning R&D in Pune (India) and our regional business HQ, we are capturing massive market share in sovereign perimeter security and UAV flight simulation.`;
            } else if (companyLower.includes('heritas')) {
                subject = `Skhy AI x Heritas Capital: Secure Acoustic Monitoring and Smart Facility Tech`;
                bodyIntro = `Given Heritas Capital's investments in cutting-edge science and smart technologies, I wanted to share our edge-AI acoustic monitoring arrays.

Skhy AI builds low-power passive acoustic systems that continuously monitor large spaces for sound anomalies, glass breakages, and environmental shifts, adding a high-security layer to specialized facilities and medical grids.`;
            } else if (companyLower.includes('vertex')) {
                subject = `Skhy AI x Vertex: Temasek-Backed Deep-Tech Dual-Use Security`;
                bodyIntro = `Given Vertex's exceptional legacy of backing deep-tech and dual-use frontier tech (backed by Temasek), I wanted to share Skhy AI's traction.

We have reached TRL-8 for our Mission Architect simulator and TRL-5 for our edge Threat Awareness Manager (TAM). Designed out of India and UAE, Skhy AI delivers high-assurance, air-gapped cryptographic middleware (Vidur AI OS) to protect national-scale borders and pipelines.`;
            } else if (companyLower.includes('openspace')) {
                subject = `Skhy AI x Openspace Ventures: Scaling SEA's Sovereign Defense Infrastructure`;
                bodyIntro = `Given Openspace's leadership in scaling high-impact technology platforms across Southeast Asia, I wanted to introduce Skhy AI.

We represent the next generation of dual-use deep tech. Operating with an HQ in Pune, India and an international sales office in Kuala Lumpur, Skhy AI provides passive acoustic array grids for national security and critical supply chains, capturing first-mover advantage in SEA's sovereign defense sector.`;
            } else if (companyLower.includes('hassana')) {
                subject = `Skhy AI x Hassana Investment: Long-Term Infrastructure and National Safety`;
                bodyIntro = `Given Hassana's long-term mandate of protecting and investing in critical national infrastructure assets, I wanted to introduce Skhy AI.

We build autonomous, low-maintenance passive acoustic grids that continuously safeguard oil pipelines, national utility hubs, and border perimeters. Our technology operates completely on-device, offering high-assurance sovereign safety for your long-term infrastructure holdings.`;
            } else if (companyLower.includes('k3')) {
                subject = `Skhy AI x K3 Ventures: Scaling Sovereign Edge AI and Spatial Intelligence`;
                bodyIntro = `Given K3's legacy of making strategic, highly successful tech bets on globally transformative companies (like ByteDance and Grab), I wanted to share Skhy AI.

We are commercializing the next frontier of spatial computing: edge acoustic intelligence. By deploying specialized microphone arrays that run deep CNNs locally, we map physical threats silently and dynamically, positioning Skhy AI as the sovereign leader in edge AI platforms.`;
            } else if (companyLower.includes('rumah')) {
                subject = `Skhy AI x Rumah Group: Sustainable Dual-Use Sensor Networks`;
                bodyIntro = `Given Rumah Group's unique focus on sustainable technologies and high-impact tech, I wanted to share Skhy AI's dual-use passive sensor grids.

In addition to border security, our Threat Awareness Manager (TAM) acoustic arrays are deployed for environmental conservation—such as detecting illegal logging, anti-poaching telemetry, and monitoring marine bio-acoustics, proving that deep-tech defense can drive global impact.`;
            } else if (companyLower.includes('apricot') || companyLower.includes('whampoa')) {
                subject = `Skhy AI: High-Assurance Cryptographic Edge AI for Family Offices`;
                bodyIntro = `Given your family office's focus on backing disruptive digital assets and high-growth deep tech, I wanted to share Skhy AI.

We have developed Vidur AI OS, a secure cryptographic edge middleware that guarantees high-assurance data isolation for defense and industrial systems. Skhy AI bridges hardware sensor meshes with advanced spatial software, capturing valuable intellectual property in the sovereign edge AI market.`;
            } else if (companyLower.includes('sing lun') || companyLower.includes('singlun') || companyLower.includes('golden equator')) {
                subject = `Skhy AI: Advanced Acoustic Security for Industrial Manufacturing`;
                bodyIntro = `Given your deep investments in industrial manufacturing, tech innovation, and smart building systems, I wanted to present Skhy AI.

We deliver edge AI passive acoustic grids that protect industrial manufacturing facilities and optimize building perimeters. Our systems analyze ambient sound to detect structural stresses, machinery fatigue, and physical security violations.`;
            } else if (companyLower.includes('gaw') || companyLower.includes('pontiac') || companyLower.includes('far east') || companyLower.includes('rge')) {
                subject = `Skhy AI: Smart Real Estate Perimeter Defense & Acoustic Asset Protection`;
                bodyIntro = `Given your extensive leadership in smart building technologies, luxury real estate, and resources, I wanted to share Skhy AI.

We construct invisible, passive acoustic boundaries for premium commercial real estate, data centers, and industrial facilities. Skhy AI monitors perimeter safety and flags drone presences or physical breaches silently and with absolute privacy preservation.`;
            } else if (companyLower.includes('vulpes')) {
                subject = `Skhy AI x Vulpes: Capital-Efficient Defense-Tech at High TRL`;
                bodyIntro = `Given Steve Diggle's legacy at Vulpes of identifying asymmetric, high-upside early-stage technology companies, I wanted to share Skhy AI's progress.

We have engineered highly capital-efficient, high-TRL defense systems (TRL-8 Mission Architect, TRL-5 TAM acoustic mesh). Skhy AI is solving massive tactical problems with minimal hardware costs, producing premium software-centric margins in the dual-use aerospace sector.`;
            } else if (companyLower.includes('tsao') || companyLower.includes('tolaram')) {
                subject = `Skhy AI: Passive Acoustic Port and Supply Chain Border Defense`;
                bodyIntro = `Given your major footprint in shipping, maritime operations, and global supply chains (such as the IMC Group), I wanted to reach out regarding Skhy AI's port security arrays.

Our Threat Awareness Manager (TAM) deploys passive sonar and airborne microphone arrays to monitor port facilities and freight yards, identifying airborne drone threats or underwater acoustics to secure key global supply chain nodes.`;
            } else if (companyLower.includes('manipal')) {
                subject = `Skhy AI x Manipal Group: High-Assurance Campus and Facility Security`;
                bodyIntro = `Given MEMG's extensive global leadership in educational campuses, medical institutions, and healthcare security, I wanted to present Skhy AI.

We build passive edge-AI acoustic monitoring networks designed to ensure safety in massive campus environments. Our non-intrusive nodes identify security incidents (glass break, panic alarms, building entries) immediately, ensuring student and patient safety without violating privacy.`;
            } else if (companyLower.includes('reliance') || nameLower.includes('ambani')) {
                subject = `Reliance Strategic x Skhy AI: 5G Edge Acoustic Intelligence & Defense Self-Reliance`;
                bodyIntro = `Given Reliance's massive push into Atmanirbhar defense manufacturing, deep AI, and 5G edge computing, I wanted to highlight Skhy AI's strategic alignment.

Developed in Pune, Skhy AI’s passive acoustic arrays integrate directly with Jio's 5G edge networks. Our Threat Awareness Manager (TRL-5) provides silent, passive UAV detection grids that complement Reliance's aerospace expansion, driving state-of-the-art national defense self-reliance.`;
            } else if (companyLower.includes('premji')) {
                subject = `Premji Invest x Skhy AI: Long-Term Indian Sovereign Edge Tech & AI`;
                bodyIntro = `Given Premji Invest's patient, multi-decade capital backing Indian deep-tech and AI leaders, I wanted to share Skhy AI's milestones.

We are building high-assurance edge computing and acoustic spatial intelligence. With our TRL-8 Mission Architect and TRL-5 Threat Awareness Manager developed natively in India, Skhy AI represents the peak of Indian defense-tech self-reliance, scaling to protect critical global borders.`;
            } else if (companyLower.includes('catamaran')) {
                subject = `Catamaran Ventures x Skhy AI: High-Assurance Sovereign Software OS`;
                bodyIntro = `Given Catamaran's focus on backing scalable software architectures and transformative tech systems, I wanted to present Skhy AI's software layer.

Beyond our sensor hardware, we have engineered Vidur AI OS, a secure cryptographic middleware, and our TRL-8 Mission Architect. We believe Skhy AI fits perfectly with Catamaran's philosophy of backing high-assurance, IP-rich software systems that solve large physical problems.`;
            } else if (companyLower.includes('tata')) {
                subject = `Skhy AI x RNT Associates: Atmanirbhar Passive Acoustic Intelligence`;
                bodyIntro = `Given the Tata Group's historic legacy of building India's strategic defense systems and backing transformative engineering, I wanted to share Skhy AI's Pune-based laboratory updates.

We have engineered Atmanirbhar passive acoustic arrays (TAM, TRL-5) and secure middleware (Vidur AI OS) to detect and track aerial threats completely silently. Designed and built in Pune, Skhy AI is dedicated to providing absolute technological self-reliance for Indian aerospace and defense.`;
            } else if (companyLower.includes('unilazer')) {
                subject = `Unilazer x Skhy AI: High-Impact Sovereign Defense Technologies`;
                bodyIntro = `Given Ronnie Screwvala's focus on backing high-impact, disruptive technology platforms, I wanted to introduce Skhy AI.

We are solving the immediate global challenge of Counter-UAV and border defense using passive acoustics. By combining smart edge sensors with automated 3D mission planning, Skhy AI delivers an high-assurance, rapid-deployment tactical ecosystem.`;
            } else if (companyLower.includes('hero')) {
                subject = `Skhy AI x Hero Enterprise: Scaled Manufacturing of Sovereign Edge Hardware`;
                bodyIntro = `Given Hero Enterprise's deep roots in world-class Indian manufacturing and high-growth technology investments, I wanted to explore manufacturing synergies.

Skhy AI designs passive acoustic sensors that are low-cost and highly reliable at scale. Partnering with India's manufacturing giants, we are scaling the production of our edge arrays to secure airports, pipelines, and national borders globally.`;
            } else if (companyLower.includes('burman') || companyLower.includes('rpg') || companyLower.includes('mariwala') || companyLower.includes('sharrp') || companyLower.includes('patni')) {
                subject = `Skhy AI: Indian Deep-Tech & Sovereign Edge Intelligence`;
                bodyIntro = `Given your family office's focus on emerging deep-tech sectors and building high-defensibility software platforms in India, I wanted to share Skhy AI.

We design Atmanirbhar passive acoustic intelligence arrays and edge middleware (Vidur AI OS). With R&D in Pune, Skhy AI represents the next phase of Indian deep-tech defense, combining IP-rich edge models with global export readiness.`;
            } else if (companyLower.includes('dlf') || companyLower.includes('piramal')) {
                subject = `Skhy AI: High-Assurance Security for Tech Infrastructure & Smart Cities`;
                bodyIntro = `Given your strategic leadership in smart commercial real estate and tech infrastructure developments in India, I wanted to introduce Skhy AI.

We build passive acoustic array sensors that secure high-value data centers, commercial parks, and real estate perimeters. Operating silently, our edge nodes detect breaches and drone threats, integrating seamlessly with master smart city operations.`;
            } else if (companyLower.includes('bajaj')) {
                subject = `Bajaj Holdings x Skhy AI: Pune-Based Sovereign Aerospace Engineering`;
                bodyIntro = `Given Bajaj Holdings' legendary industrial heritage in Pune and your focus on long-term industrial tech, I wanted to share Skhy AI's local updates.

We have established our main R&D and acoustics laboratory right in Pune, partnering with local academic talent to build passive acoustic sensor meshes and our TRL-8 Mission Architect. We are proud to scale Pune-engineered dual-use defense tech globally.`;
            } else if (companyLower.includes('jsw')) {
                subject = `Skhy AI x JSW Ventures: Heavy Industrial Site Security & Threat Mapping`;
                bodyIntro = `Given JSW's massive industrial footprint and focus on tech for industrial applications, I am reaching out to share a major synergy.

Skhy AI provides terrain-aware, passive acoustic meshes that protect steel plants, mining zones, and energy pipelines from unauthorized access. Our edge nodes audit ambient noise to ensure continuous site safety without generating radio interference.`;
            } else if (companyLower.includes('info edge') || companyLower.includes('bikhchandani')) {
                subject = `Skhy AI x Info Edge: Pioneering India's Sovereign Deep-Tech Ecosystem`;
                bodyIntro = `Given Sanjeev Bikhchandani's pioneering role in backing and structuring the Indian tech ecosystem, I wanted to introduce Skhy AI.

We are pioneering the dual-use defense aerospace sector in India. Built out of Pune, Skhy AI is commercializing passive acoustics and sovereign edge AI (Vidur AI OS), demonstrating that Indian deep-tech companies can build world-class strategic systems.`;
            } else if (companyLower.includes('three sisters') || companyLower.includes('godrej')) {
                subject = `Skhy AI: Advanced Systems Engineering & Strategic Perimeter Safety`;
                bodyIntro = `Given your extensive footprint in advanced systems engineering, sustainable energy, and manufacturing innovation, I wanted to share Skhy AI.

We build passive, high-precision acoustic sensors and edge software that secure national infrastructure assets, wind energy corridors, and high-security manufacturing campuses.`;
            } else if (companyLower.includes('adani')) {
                subject = `Adani Family Office x Skhy AI: Strategic Counter-UAV & Border Security Integrations`;
                bodyIntro = `Given the Adani Group's leadership in strategic defense and aerospace manufacturing, counter-UAV platforms, and border security infrastructure, I want to present Skhy AI.

Our Threat Awareness Manager (TRL-5) passive acoustic sensor grids perfectly complement Adani’s active radar and electronic jammer systems. By providing completely silent, undetectable target detection, Skhy AI acts as a stealth cueing layer for your kinetic systems.`;
            } else if (companyLower.includes('strategic development') || companyLower.includes('sdf') || companyLower.includes('edge group')) {
                subject = `Strategic Development Fund x Skhy AI: EDGE Group Strategic Synergies`;
                bodyIntro = `Given SDF's mandate of backing cutting-edge defense and aerospace platforms for the EDGE Group, I wanted to highlight Skhy AI's tactical array meshes.

Our passive acoustic tetrahedral arrays (TAM, TRL-5) provide silent, undetectable aerial threat tracking, offering zero-emission cueing for smart weapons and electronic warfare systems. Skhy AI offers direct tactical synergies to the EDGE Group’s autonomous systems portfolio.`;
            } else if (companyLower.includes('dwf')) {
                subject = `Skhy AI x DWF Labs: Deep Tech & Edge AI Auditory Spatial Grids`;
                bodyIntro = `Given DWF Labs' focus on deep tech, edge networking, and next-gen hardware systems, I wanted to present Skhy AI's dual-use passive acoustic sensor arrays.

We are building a highly scalable spatial auditory network. By pairing low-power MEMS hardware sensors with our cryptographic middleware (Vidur AI OS), we process real-time physical telemetry for sovereign defense and civilian airspace (UTM) grids.`;
            } else if (companyLower.includes('venturesouq') || companyLower.includes('plus')) {
                subject = `Skhy AI: Scaling Deep-Tech and Edge AI in the GCC`;
                bodyIntro = `Given your focus on backing high-growth frontier tech and early-stage software platforms in the MENA region, I wanted to introduce Skhy AI's GCC scaling plan.

We deploy passive acoustic edge AI grids that monitor commercial perimeters, airports, and smart city hubs. By processing spatial audio on-device, we offer unmatched security to MENA's high-growth tech market.`;
            } else if (companyLower.includes('mubadala') || companyLower.includes('hub71')) {
                subject = `Skhy AI x Mubadala Capital: Abu Dhabi Sovereign Defense Localization`;
                bodyIntro = `Following Mubadala's mandate to establish Abu Dhabi as a global powerhouse in AI and defense innovation, I wanted to present Skhy AI's Hub71 expansion.

We have engineered high-assurance passive acoustic sensor meshes (TRL-5 TAM) and modular simulation software (TRL-8 Mission Architect). Skhy AI is planning a regional operation hub at Hub71 to localize our edge cryptographic middleware, Vidur AI OS, for the UAE's national security networks.`;
            } else if (companyLower.includes('alpha intelligence') || companyLower.includes('aicapital')) {
                subject = `Skhy AI: Advanced Edge CNNs and GCC-PHAT Spatial Auditory Models`;
                bodyIntro = `Given Alpha Intelligence Capital's deep algorithmic focus on backing world-class AI/ML breakthroughs, I wanted to share Skhy AI's mathematical foundations.

We run customized GCC-PHAT sound source localization solvers and edge Mel-Frequency CNN classification models directly on low-power microcontrollers. Skhy AI is proving that high-dimensional spatial acoustics can be solved reliably at the tactical edge.`;
            } else if (companyLower.includes('beco') || companyLower.includes('mevp') || companyLower.includes('shorooq')) {
                subject = `Skhy AI: Frontier Deep-Tech Defense for the MENA Region`;
                bodyIntro = `Given your leadership in early-stage tech investing and your mandate to scale the next generation of software platforms across the Middle East, I wanted to present Skhy AI.

We provide passive, AI-powered spatial threat mapping arrays for critical borders, oil facilities, and airports. Designed for extreme terrain resilience, our edge nodes are capturing valuable first-mover advantage in GCC's sovereign defense market.`;
            } else if (companyLower.includes('redalpine') || companyLower.includes('verve') || companyLower.includes('session') || companyLower.includes('constructor') || companyLower.includes('lakestar') || companyLower.includes('sictic') || companyLower.includes('serpentine') || companyLower.includes('qbit') || companyLower.includes('founderful') || companyLower.includes('wingman')) {
                subject = `Skhy AI x European Deep-Tech: High-Precision Sovereign Defense & Swiss Cryptography`;
                bodyIntro = `Given your fund's outstanding track record of backing high-precision engineering, advanced AI, and high-assurance cybersecurity platforms in Europe, I wanted to present Skhy AI.

We specialize in passive acoustic intelligence and sovereign edge AI. Our Vidur AI OS is built as a high-assurance, air-gapped cryptographic middleware to secure distributed sensor arrays, aligning perfectly with European tech sovereignty requirements.`;
            } else if (companyLower.includes('jungle') || companyLower.includes('iglobe') || companyLower.includes('beenext') || companyLower.includes('tnb') || companyLower.includes('antler') || companyLower.includes('wavemaker')) {
                subject = `Skhy AI: Scaling Deep-Tech Dual-Use Security in SEA`;
                bodyIntro = `Given your fund's focus on deep-tech innovation and building highly defensible tech platforms in Southeast Asia, I wanted to present Skhy AI.

We bridge passive acoustic hardware meshes with advanced edge AI. Operating through a strategic structure spanning Southeast Asia and India, we deliver silent, non-intrusive border surveillance and maritime depot defense across the region.`;
            } else if (companyLower.includes('st engineering') || companyLower.includes('cap vista') || companyLower.includes('sginnovate')) {
                subject = `Skhy AI x Singapore Dual-Use: High-Assurance Silent Coastal & Urban Defense`;
                bodyIntro = `Given your fund's mandate of securing cutting-edge dual-use defense and security technologies for Singapore (such as CAP Vista and ST Engineering), I want to share Skhy AI's passive sonar arrays.

Our Threat Awareness Manager (TRL-5) passive acoustic grid provides completely silent, radio-silent UAV and coastal vessel tracking. Designed for dense urban borders and port environments, Skhy AI provides an invisible defense layer that perfectly aligns with Singapore's dual-use security needs.`;
            } else if (companyLower.includes('eifo') || companyLower.includes('etna') || companyLower.includes('seed capital') || companyLower.includes('myriad') || companyLower.includes('heartcore') || companyLower.includes('byfounders') || companyLower.includes('accelerace') || companyLower.includes('identity') || companyLower.includes('nordic') || companyLower.includes('psv')) {
                subject = `Skhy AI: Nordic Dual-Use Defense Scaling and Tactical Counter-UAS`;
                bodyIntro = `Given your fund's deep interest in supporting European defense self-reliance, green tech, and dual-use hardware (such as the D3 Defense Fund and Myriad's counter-UAS portfolio), I wanted to introduce Skhy AI.

Our Threat Awareness Manager (TRL-5) passive acoustic array mesh provides silent target tracking that complements active kinetic countermeasures. We believe Skhy AI aligns seamlessly with the Nordic mandate of building robust, decentralized security systems for national defense.`;
            } else if (companyLower.includes('earlybird') || companyLower.includes('rheingau') || companyLower.includes('zoho.vc') || companyLower.includes('vanagon') || companyLower.includes('project a') || companyLower.includes('esg') || companyLower.includes('uvc') || companyLower.includes('vsquared') || companyLower.includes('hv capital') || companyLower.includes('cherry')) {
                subject = `Skhy AI x European Sovereign Defense: Edge AI Drones & Critical Infrastructure`;
                bodyIntro = `Given your fund's strong commitment to backing European tech sovereignty, B2B deep tech, and defense innovations (such as ESG's investments in Quantum Systems), I wanted to present Skhy AI.

We provide edge AI-powered passive acoustic monitoring arrays and our secure Vidur AI OS middleware. Built for extreme operational environments, our silent meshes secure critical borders, wind hubs, and military depots completely air-gapped from global hyper-clouds.`;
            } else if (companyLower.includes('seafund')) {
                subject = `Seafund x Skhy AI: Indian Dual-Use Defense & Edge AI Security`;
                bodyIntro = `Given Seafund's dedicated focus on Indian deep tech, dual-use aerospace, and edge security systems, I wanted to present Skhy AI's latest Pune-based deployments.

We deploy TRL-5 passive acoustic arrays (TAM) and TRL-8 flight simulation middleware (Mission Architect). We provide Atmanirbhar national security solutions designed to detect and track airborne threats silently and robustly.`;
            } else {
                // Fallback for general VCs
                subject = `Investment Opportunity: Skhy AI x ${recipient.company || recipient.name}`;
                bodyIntro = `I wanted to introduce you to Skhy AI. We are building the next generation of high-assurance sovereign edge AI and passive acoustic sensor meshes.

Our dual-use platform secures national borders (TRL-5 counter-UAS) and monitors civilian urban skyways (UTM/eVTOL) with zero active radio emissions, providing completely silent physical security and airspace awareness.`;
            }
        } else {
            // Non-VC Categories
            switch (recipient.category) {
                case 'customer':
                    subject = `Enhancing Operations with Skhy AI: ${recipient.company || recipient.name}`;
                    bodyIntro = `I noticed your work at ${recipient.company || 'your company'} and wanted to reach out.\n\nSkhy AI provides advanced autonomous sensing and threat awareness solutions that could significantly enhance your operational capabilities.`;
                    break;
                case 'partner': {
                    const partnerCompanyLower = (recipient.company || '').toLowerCase();
                    if (partnerCompanyLower.includes('sima')) {
                        subject = `Skhy AI x SiMa.ai: MLSoC Integration for Jamming-Resilient Edge AI Defense`;
                        bodyIntro = `I'm reaching out from Skhy AI to explore a strategic hardware partnership with SiMa.ai around your MLSoC platform.

Skhy AI builds jamming-resilient, multi-domain edge intelligence systems for defense, critical infrastructure, and autonomous platforms. Our flagship product—the SKHY Jamming Resilient Edge AI & RF Fusion Node—currently integrates NVIDIA Ampere + Xilinx FPGA architectures to deliver up to 67 TOPS of inference alongside real-time MIMO mesh radio and anti-jam GNSS.

We believe SiMa.ai's Modalix MLSoC family (25–200 TOPS, sub-10W) represents an ideal next-generation compute backbone for our edge nodes. Specifically, we are interested in:

1. **Chipset Supply**: Evaluating the Modalix M50/M100 as a drop-in AI accelerator for our ruggedized edge boxes, replacing or augmenting current GPU-based inference with dramatically lower power consumption.
2. **Board-Level Integration**: Exploring SiMa.ai SoMs or PCIe accelerator cards as production-ready modules for our SKHY Edge Node product line.
3. **Co-Development**: Jointly optimizing our acoustic CNN classifiers (GCC-PHAT sound source localization, Mel-Frequency edge models) and RF signal processing pipelines on the MLSoC architecture.
4. **Defense & Drone Market**: Leveraging SiMa.ai's existing partnerships with ARC Aerospace and drone intelligence platforms to co-address the rapidly growing counter-UAS and autonomous defense market.

Our platform currently deploys passive acoustic sensor meshes, tactical MANET radios, anti-jamming GNSS systems, and kinetic interceptor drones—all orchestrated by our sovereign middleware, Vidur AI OS. A power-efficient, high-TOPS MLSoC like Modalix would be transformative for our SWaP-constrained field deployments.`;
                    } else {
                        subject = `Partnership Opportunity: Skhy AI x ${recipient.company || recipient.name}`;
                        bodyIntro = `I'm reaching out to explore potential partnership synergies between Skhy AI and ${recipient.company || 'your organization'}.\n\nWe are building a decentralized ecosystem for autonomous defense and security, and we believe your expertise would be valuable.`;
                    }
                    break;
                }
                default:
                    subject = `Skhy AI Introduction`;
                    bodyIntro = `I wanted to introduce you to Skhy AI.`;
            }
        }

        // Extract interest from notes if available (clean any residual quotes)
        let interestNote = "";
        if (recipient.notes && !recipient.notes.startsWith("AI Super-") && !recipient.notes.startsWith("Industrial ") && !recipient.notes.startsWith("Govt-") && !recipient.notes.startsWith("Public/") && !recipient.notes.startsWith("Private ") && !recipient.notes.startsWith("Global ") && !recipient.notes.startsWith("Energy ") && !recipient.notes.startsWith("Oil ") && !recipient.notes.startsWith("Hospitality ") && !recipient.notes.startsWith("Real ") && !recipient.notes.startsWith("Diversified") && !recipient.notes.startsWith("Luxury ") && !recipient.notes.startsWith("Automotive ") && !recipient.notes.startsWith("Retail ") && !recipient.notes.startsWith("Logistics ") && !recipient.notes.startsWith("Smart ") && !recipient.notes.startsWith("Deep ") && !recipient.notes.startsWith("Direct ") && !recipient.notes.startsWith("Healthcare ") && !recipient.notes.startsWith("Temasek-") && !recipient.notes.startsWith("Active ") && !recipient.notes.startsWith("Strategic ") && !recipient.notes.startsWith("Long ") && !recipient.notes.startsWith("Kuok ") && !recipient.notes.startsWith("Sustainable ") && !recipient.notes.startsWith("Super ") && !recipient.notes.startsWith("Lee ") && !recipient.notes.startsWith("Industrial ") && !recipient.notes.startsWith("Tech ") && !recipient.notes.startsWith("Real ") && !recipient.notes.startsWith("Steve ") && !recipient.notes.startsWith("Ng ") && !recipient.notes.startsWith("Kwee ") && !recipient.notes.startsWith("Sukanto ") && !recipient.notes.startsWith("Maritime ") && !recipient.notes.startsWith("Diversified") && !recipient.notes.startsWith("\"Tech ") && !recipient.notes.startsWith("\"Strategic ") && !recipient.notes.startsWith("\"Long-") && !recipient.notes.startsWith("\"Legacy ") && !recipient.notes.startsWith("\"Ronnie ") && !recipient.notes.startsWith("\"Sunil ") && !recipient.notes.startsWith("\"Harsh ") && !recipient.notes.startsWith("\"Sharrp ") && !recipient.notes.startsWith("\"Deep ") && !recipient.notes.startsWith("\"Diversifying ") && !recipient.notes.startsWith("\"Focus:") && !recipient.notes.startsWith("Invests ") && !recipient.notes.startsWith("Seed/") && !recipient.notes.startsWith("State-") && !recipient.notes.startsWith("Abu ") && !recipient.notes.startsWith("Early-") && !recipient.notes.startsWith("Pre-") && !recipient.notes.startsWith("Science ") && !recipient.notes.startsWith("Heavy ") && !recipient.notes.startsWith("Global ") && !recipient.notes.startsWith("Leading ") && !recipient.notes.startsWith("Major ") && !recipient.notes.startsWith("Part ") && !recipient.notes.startsWith("Top ") && !recipient.notes.startsWith("Corporate ") && !recipient.notes.startsWith("State-owned") && !recipient.notes.startsWith("Largest ") && !thought_contains_notes_check(recipient.notes)) {
            interestNote = `Given your focus on ${recipient.notes.replace(/"/g, '')},\n\n`;
        }

        function thought_contains_notes_check(notes: string) {
            return notes.toLowerCase().includes("alliance") || notes.toLowerCase().includes("member") || notes.toLowerCase().includes("stage") || notes.toLowerCase().includes("stage");
        }

        // Generate the unique tracking link
        const trackingLink = await generateTrackingLink(recipient);

        // Determine which link to share based on category
        let linkLabel = "Pitch Deck";
        let linkToUse = trackingLink || `${window.location.origin}/pitch-deck`;

        if (recipient.category === 'customer') {
            linkLabel = "Product Teaser & Info";
            linkToUse = `${window.location.origin}/teaser-deck`;
        }

        const calendlyLink = "https://calendly.com/nikki-skhy-ai/30min?hide_gdpr_banner=1";

        const body = `Hi ${recipient.name.split(' ')[0]},

I trust this email finds you well.

${interestNote}${bodyIntro}

I've attached our ${linkLabel.toLowerCase()} for your review:
${linkLabel}: ${linkToUse}

If you're interested in discussing this further, please feel free to book a time on my calendar:
${calendlyLink}

Best regards,

Skhy AI Team`;

        // Copy body content directly to clipboard for extremely fast seamless pasting
        try {
            await navigator.clipboard.writeText(body);
        } catch (clipErr) {
            console.warn('Clipboard write failed. User can copy manually from modal.', clipErr);
        }

        // Set state to trigger our premium email composer modal
        setSelectedEmailData({
            recipientName: recipient.name,
            recipientEmail: recipient.email,
            subject,
            body
        });
        setShowEmailModal(true);
    };

    const exportCSV = () => {
        const filtered = filteredRecipients();
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Email,Company,Country,Region,LinkedIn URL,Interests,Notes\n"
            + filtered.map(r => `${r.name},${r.email},${r.company || ''},${r.country},${r.region || ''},${r.linkedin_url || ''},"${(r.interests || []).join(', ')}",${r.notes || ''}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${activeTab}_recipients_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportLinkedInCSV = async () => {
        setGeneratingExport(true);
        const filtered = filteredRecipients();
        // Expanded columns for generic automation tools
        let csvContent = "ProfileUrl,FirstName,LastName,Email,ConnectionNote,FollowUpMessage\n";

        for (const recipient of filtered) {
            const trackingLink = await generateTrackingLink(recipient);
            const nameParts = recipient.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            const company = recipient.company || 'your company';

            let connectionNote = '';
            let followUpMessage = '';

            if (activeTab === 'vc') {
                connectionNote = `Hi ${firstName}, I'm building Skhy AI, a sovereign edge AI defense OS and passive acoustic sensor mesh (TAM). Would love to share our latest APAC deployments.`;
                followUpMessage = `Thanks for connecting, ${firstName}. Here is our sovereign defense pitch deck: ${trackingLink}`;
            } else if (activeTab === 'customer') {
                connectionNote = `Hi ${firstName}, saw you're at ${company}. We provide passive acoustic airspace grids to secure physical boundaries and urban skyways. Let's connect.`;
                followUpMessage = `Great to connect, ${firstName}. You can explore our interactive Threat & UTM Airspace Manager here: ${trackingLink}`;
            } else if (activeTab === 'partner') {
                connectionNote = `Hi ${firstName}, looking for strategic partners in the region for Skhy AI's dual-use passive defense and UTM airspace grids.`;
                followUpMessage = `Thanks ${firstName}. We are onboarding aerospace and critical infrastructure partners. You can view our capability deck here: ${trackingLink}`;
            }

            // Escape quotes in messages
            const safeNote = `"${connectionNote.replace(/"/g, '""')}"`;
            const safeFollowUp = `"${followUpMessage.replace(/"/g, '""')}"`;

            csvContent += `${recipient.linkedin_url || ''},${firstName},${lastName},${recipient.email},${safeNote},${safeFollowUp}\n`;
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `linkedin_${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setGeneratingExport(false);
    };

    const filteredRecipients = () => {
        return recipients.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (r.company || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCountry = countryFilter === 'all' || r.country === countryFilter;
            const matchesInterest = interestFilter === 'all' || (r.interests && r.interests.includes(interestFilter));
            return matchesSearch && matchesCountry && matchesInterest;
        });
    };

    const getAllInterests = () => {
        const interests = new Set<string>();
        recipients.forEach(r => {
            if (r.interests) r.interests.forEach(i => interests.add(i));
        });
        return Array.from(interests).sort();
    };

    const filtered = filteredRecipients();

    const getTabLabel = (tab: string) => {
        switch (tab) {
            case 'vc': return 'VCs & Investors';
            case 'customer': return 'Customers';
            case 'partner': return 'Potential Partners';
            case 'newsletter': return 'Newsletter Subs';
            default: return tab;
        }
    }

    return (
        <div className="min-h-screen bg-navy-950 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-turquoise-400" />
                        <h1 className="text-3xl font-bold">Contacts Manager</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 px-4 py-2 rounded-lg cursor-pointer transition-colors border border-white/10">
                            <Upload className="w-4 h-4" />
                            <span className="text-sm">{importing ? 'Importing...' : 'Import CSV'}</span>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleCSVImport}
                                disabled={importing}
                                className="hidden"
                            />
                        </label>

                        <button
                            onClick={exportLinkedInCSV}
                            disabled={generatingExport}
                            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors border border-white/10"
                            title="Export CSV formatted for PhantomBuster/LinkedIn Automation"
                        >
                            {generatingExport ? <Loader className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                            <span className="text-sm">Export for LinkedIn</span>
                        </button>

                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 px-4 py-2 rounded-lg transition-colors border border-white/10"
                        >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Export CSV</span>
                        </button>

                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-blue-600 hover:from-turquoise-400 hover:to-blue-500 px-4 py-2 rounded-lg transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm">Add {activeTab !== 'vc' ? activeTab : 'Recipient'}</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
                    <button
                        onClick={() => setActiveTab('vc')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors border-b-2 ${activeTab === 'vc'
                            ? 'border-turquoise-400 text-turquoise-400 bg-white/5'
                            : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Briefcase className="w-4 h-4" />
                        VCs & Investors
                    </button>
                    <button
                        onClick={() => setActiveTab('customer')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors border-b-2 ${activeTab === 'customer'
                            ? 'border-turquoise-400 text-turquoise-400 bg-white/5'
                            : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <UserCircle className="w-4 h-4" />
                        Customers
                    </button>
                    <button
                        onClick={() => setActiveTab('partner')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors border-b-2 ${activeTab === 'partner'
                            ? 'border-turquoise-400 text-turquoise-400 bg-white/5'
                            : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Handshake className="w-4 h-4" />
                        Partner Leads
                    </button>
                    <button
                        onClick={() => setActiveTab('newsletter')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-t-lg transition-colors border-b-2 ${activeTab === 'newsletter'
                            ? 'border-turquoise-400 text-turquoise-400 bg-white/5'
                            : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Mail className="w-4 h-4" />
                        Newsletter
                    </button>
                </div>

                <p className="text-gray-400 mb-6">
                    Manage your {getTabLabel(activeTab)} list. {activeTab === 'vc' ? 'Send pitch decks and track engagement.' : 'Send product updates and onboarding invitations.'}
                </p>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Add/Edit Form */}
                {showAddForm && (
                    <div className="bg-navy-900 rounded-xl p-6 border border-white/10 mb-6">
                        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Contact' : `Add New ${activeTab === 'vc' ? 'VC' : activeTab === 'customer' ? 'Customer' : 'Partner'}`}</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Interests (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.interests.join(', ')}
                                    onChange={(e) => setFormData({ ...formData, interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    placeholder="e.g. anti-jam, rover, edge-ai"
                                    className="w-full px-4 py-2 bg-navy-800 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_subscribed_form"
                                    checked={formData.is_subscribed}
                                    onChange={(e) => setFormData({ ...formData, is_subscribed: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-700 bg-navy-800 text-turquoise-500 focus:ring-turquoise-500"
                                />
                                <label htmlFor="is_subscribed_form" className="text-sm font-medium">Subscribed to Newsletter</label>
                            </div>

                            <div className="md:col-span-2 flex gap-3">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-blue-600 hover:from-turquoise-400 hover:to-blue-500 px-6 py-2 rounded-lg transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    {editingId ? 'Update' : 'Add'} Contact
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-navy-800 hover:bg-navy-700 px-6 py-2 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-navy-900 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className="px-4 py-2 bg-navy-900 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                        >
                            <option value="all">All Countries</option>
                            <option value="UAE">UAE</option>
                            <option value="India">India</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={interestFilter}
                            onChange={(e) => setInterestFilter(e.target.value)}
                            className="px-4 py-2 bg-navy-900 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                        >
                            <option value="all">All Interests</option>
                            {getAllInterests().map(interest => (
                                <option key={interest} value={interest}>{interest}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Recipients Table */}
                <div className="bg-navy-900 rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-navy-950">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name / Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Interests</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Activity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">LinkedIn</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            <Loader className="w-6 h-6 animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No recipients found in {getTabLabel(activeTab)}. {recipients.length > 0 ? 'Try adjusting your filters.' : 'Add your first contact above.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((recipient) => (
                                        <tr key={recipient.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-white">{recipient.name}</div>
                                                <div className="text-xs text-gray-400">{recipient.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">{recipient.company || '—'}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">{recipient.country}</div>
                                                {recipient.region && <div className="text-xs text-gray-500">{recipient.region}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => toggleSubscription(recipient)}
                                                    className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${recipient.is_subscribed 
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                                                >
                                                    {recipient.is_subscribed ? 'Subscribed' : 'Unsubscribed'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 italic">{recipient.source || '—'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {recipient.interests && recipient.interests.length > 0 ? (
                                                        recipient.interests.map(interest => (
                                                            <span key={interest} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">
                                                                {interest}
                                                            </span>
                                                        ))
                                                    ) : <span className="text-gray-500">—</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[10px] text-gray-500 max-w-[120px] truncate" title={recipient.activity_log ? JSON.stringify(recipient.activity_log) : ''}>
                                                    {recipient.activity_log && recipient.activity_log.length > 0 ? (
                                                        `${recipient.activity_log.length} events`
                                                    ) : '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {recipient.linkedin_url ? (
                                                    <a href={recipient.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                                                        <LinkIcon className="w-4 h-4" />
                                                    </a>
                                                ) : <span className="text-gray-500">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">{recipient.notes || '—'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleGenerateEmail(recipient)}
                                                        className="p-2 hover:bg-white/10 rounded transition-colors"
                                                        title="Generate Email"
                                                    >
                                                        <Mail className="w-4 h-4 text-purple-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => copyTrackingLink(recipient)}
                                                        className="p-2 hover:bg-white/10 rounded transition-colors"
                                                        title="Generate & Copy Tracking Link"
                                                    >
                                                        <LinkIcon className="w-4 h-4 text-turquoise-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(recipient)}
                                                        className="p-2 hover:bg-white/10 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-blue-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(recipient.id)}
                                                        className="p-2 hover:bg-white/10 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                    Showing {filtered.length} of {recipients.length} recipients
                    {countryFilter !== 'all' && ` • Filtered by ${countryFilter}`}
                </div>

                {/* CSV Import Template Help */}
                <div className="mt-8 bg-navy-900/50 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold mb-3 text-turquoise-400">CSV Import Format</h3>
                    <p className="text-sm text-gray-400 mb-3">Your CSV file should have the following columns (header row required):</p>
                    <code className="block bg-navy-950 p-3 rounded text-xs text-gray-300 font-mono">
                        Name,Email,Company,Country,Region,Notes,LinkedIn URL
                    </code>
                    <p className="text-xs text-gray-500 mt-2">Example: BECO Capital,contact@beco.capital,BECO Capital,UAE,Dubai,Leading MENA VC,https://linkedin.com/in/...</p>
                </div>
            </div>

            {/* Zoho Compose Helper Modal */}
            {showEmailModal && selectedEmailData && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
                    <div className="bg-navy-950 border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl backdrop-blur-lg flex flex-col relative max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                    <Mail className="w-5 h-5 text-purple-400 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Prefilled Zoho Mail Draft</h2>
                                    <p className="text-xs text-gray-400">Custom pitch generated for {selectedEmailData.recipientName}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowEmailModal(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Success Notification */}
                        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg flex items-center gap-2 text-xs">
                            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                            <span>Story automatically copied to clipboard! You can paste it directly into your Zoho Mail editor.</span>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
                            {/* Recipient */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Recipient</label>
                                <div className="bg-navy-900 border border-white/5 px-3 py-2 rounded text-sm text-gray-300 flex justify-between items-center">
                                    <span>{selectedEmailData.recipientEmail}</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedEmailData.recipientEmail);
                                            setMessage({ type: 'success', text: 'Recipient email copied!' });
                                        }}
                                        className="text-xs text-turquoise-400 hover:text-turquoise-300 flex items-center gap-1 font-medium"
                                    >
                                        <Copy className="w-3 h-3" /> Copy
                                    </button>
                                </div>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Subject Line</label>
                                <div className="bg-navy-900 border border-white/5 px-3 py-2 rounded text-sm text-gray-200 flex justify-between items-center font-medium">
                                    <span>{selectedEmailData.subject}</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedEmailData.subject);
                                            setMessage({ type: 'success', text: 'Subject line copied!' });
                                        }}
                                        className="text-xs text-turquoise-400 hover:text-turquoise-300 flex items-center gap-1 font-medium"
                                    >
                                        <Copy className="w-3 h-3" /> Copy
                                    </button>
                                </div>
                            </div>

                            {/* Custom Story Body */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Customized Story Pitch</label>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedEmailData.body);
                                            setMessage({ type: 'success', text: 'Email body copied!' });
                                        }}
                                        className="text-xs text-turquoise-400 hover:text-turquoise-300 flex items-center gap-1 font-medium"
                                    >
                                        <Copy className="w-3 h-3" /> Copy Body
                                    </button>
                                </div>
                                <textarea
                                    readOnly
                                    value={selectedEmailData.body}
                                    rows={10}
                                    className="w-full bg-navy-900 border border-white/5 rounded-lg p-3 text-xs text-gray-300 font-mono focus:outline-none resize-none leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="pt-4 border-t border-white/10 space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-400 font-semibold">Select Preferred Zoho Mail Region</span>
                                    <select
                                        value={zohoDomain}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setZohoDomain(val);
                                            localStorage.setItem('skhy_zoho_domain', val);
                                        }}
                                        className="bg-navy-900 border border-white/10 rounded px-2 py-1 text-xs text-turquoise-400 font-medium cursor-pointer"
                                    >
                                        <option value="mail.zoho.com">Global (.com)</option>
                                        <option value="mail.zoho.eu">Europe (.eu)</option>
                                        <option value="mail.zoho.in">India (.in)</option>
                                        <option value="mail.zoho.com.cn">China (.com.cn)</option>
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <a
                                        href={`https://${zohoDomain}/zm/#mail/compose`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => setShowEmailModal(false)}
                                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg border border-purple-500/20"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span>Compose in Zoho Mail</span>
                                    </a>

                                    <a
                                        href={`mailto:${selectedEmailData.recipientEmail}?subject=${encodeURIComponent(selectedEmailData.subject)}&body=${encodeURIComponent(selectedEmailData.body)}`}
                                        onClick={() => setShowEmailModal(false)}
                                        className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-gray-300 py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/10"
                                    >
                                        <Mail className="w-4 h-4 text-turquoise-400" />
                                        <span>Default mailto client</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactManager;
