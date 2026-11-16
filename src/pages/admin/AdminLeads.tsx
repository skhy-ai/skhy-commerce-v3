import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Search, Loader, Tag, Shield, Cpu, MessageSquare, FileText, ChevronDown, ChevronUp, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { safeStorage } from '../../utils/storage';

interface WaitlistLead {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    company_name: string;
    intent?: string;
    sub_category?: string;
    product_name: string;
    source?: string;
    message: string;
    status?: string;
    created_at: string;
}

interface QuoteRequest {
    id: string;
    quote_id: string;
    customer_name: string;
    customer_email: string;
    items_json: any[];
    status: string;
    created_at: string;
}

const EXPIRED_LEADS_KEY = 'skhy_expired_lead_ids';
const EXPIRED_RFQS_KEY = 'skhy_expired_rfq_ids';

function getExpiredIds(key: string): Set<string> {
    try {
        const raw = safeStorage.local.getItem(key);
        if (raw) return new Set(JSON.parse(raw));
    } catch {}
    return new Set();
}

function addExpiredId(key: string, id: string) {
    try {
        const set = getExpiredIds(key);
        set.add(id);
        safeStorage.local.setItem(key, JSON.stringify(Array.from(set)));
    } catch {}
}

import { getTelemetryEvents, StoredTelemetryEvent } from '../../services/analyticsService';
import { BarChart3, Search as SearchIcon, Eye } from 'lucide-react';

export const AdminLeads: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'waitlist' | 'rfqs' | 'analytics'>('waitlist');
    const [leads, setLeads] = useState<WaitlistLead[]>([]);
    const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
    const [telemetryEvents, setTelemetryEvents] = useState<StoredTelemetryEvent[]>([]);
    const [loadingLeads, setLoadingLeads] = useState(true);
    const [loadingQuotes, setLoadingQuotes] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchLeads();
        fetchQuotes();
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const localEvts = getTelemetryEvents();
            const { data } = await supabase
                .from('visitor_telemetry')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (data && data.length > 0) {
                const dbEvts: StoredTelemetryEvent[] = data.map(d => ({
                    id: d.id,
                    eventType: d.event_type,
                    sectionName: d.section_name,
                    searchTerm: d.search_term,
                    categoryFilter: d.category_filter,
                    dwellTimeMs: d.dwell_time_ms,
                    visitorIntent: d.visitor_intent,
                    visitorEmail: d.visitor_email,
                    timestamp: d.created_at
                }));
                setTelemetryEvents([...dbEvts, ...localEvts]);
            } else {
                setTelemetryEvents(localEvts);
            }
        } catch (e) {
            setTelemetryEvents(getTelemetryEvents());
        }
    };

    const fetchLeads = async () => {
        setLoadingLeads(true);
        const expiredSet = getExpiredIds(EXPIRED_LEADS_KEY);
        try {
            // 1. Try fetching primary waitlist_leads
            const { data: waitlistData, error: waitlistError } = await supabase
                .from('waitlist_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (!waitlistError && waitlistData && waitlistData.length > 0) {
                setLeads(waitlistData.map(item => {
                    const isExp = expiredSet.has(item.id) || item.status === 'expired';
                    return {
                        id: item.id,
                        full_name: item.full_name || item.name || 'Website Visitor',
                        email: item.email || '',
                        phone: item.phone || '',
                        company_name: item.company_name || item.company || '-',
                        intent: item.intent || 'Product Interest',
                        sub_category: item.sub_category || '',
                        product_name: item.product_name || 'General Product Inquiry',
                        source: item.source || 'website_lead',
                        message: item.message || '-',
                        status: isExp ? 'expired' : (item.status || 'active'),
                        created_at: item.created_at || new Date().toISOString()
                    };
                }));
            } else {
                // 2. Fall back to product_waitlist table
                const { data: legacyData } = await supabase
                    .from('product_waitlist')
                    .select('*')
                    .order('created_at', { ascending: false });

                setLeads((legacyData || []).map(item => {
                    const isExp = expiredSet.has(item.id) || item.status === 'expired';
                    return {
                        id: item.id,
                        full_name: item.full_name || 'Website Visitor',
                        email: item.email || '',
                        phone: item.phone || '',
                        company_name: item.company_name || '-',
                        intent: 'Product Interest',
                        sub_category: '',
                        product_name: item.product_name || 'General Hardware',
                        source: 'express_interest',
                        message: item.message || '-',
                        status: isExp ? 'expired' : (item.status || 'active'),
                        created_at: item.created_at || new Date().toISOString()
                    };
                }));
            }
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setLoadingLeads(false);
        }
    };

    const fetchQuotes = async () => {
        setLoadingQuotes(true);
        const expiredSet = getExpiredIds(EXPIRED_RFQS_KEY);
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setQuotes(data.map(item => ({
                    ...item,
                    status: (expiredSet.has(item.id) || item.status === 'expired') ? 'expired' : item.status
                })));
            }
        } catch (err) {
            console.error('Error fetching quotes:', err);
        } finally {
            setLoadingQuotes(false);
        }
    };

    const expireLead = async (leadId: string) => {
        if (!confirm('Are you sure you want to mark this lead as EXPIRED?')) return;
        addExpiredId(EXPIRED_LEADS_KEY, leadId);
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'expired' } : l));

        try {
            await supabase
                .from('waitlist_leads')
                .update({ status: 'expired' })
                .eq('id', leadId);

            await supabase
                .from('product_waitlist')
                .update({ status: 'expired' })
                .eq('id', leadId);
        } catch (err) {
            console.warn('Silent note updating DB status:', err);
        }
    };

    const expireRFQ = async (quoteDbId: string) => {
        if (!confirm('Are you sure you want to mark this RFQ/Quote as EXPIRED?')) return;
        addExpiredId(EXPIRED_RFQS_KEY, quoteDbId);
        setQuotes(prev => prev.map(q => q.id === quoteDbId ? { ...q, status: 'expired' } : q));

        try {
            await supabase
                .from('quotes')
                .update({ status: 'expired' })
                .eq('id', quoteDbId);
        } catch (err) {
            console.warn('Silent note updating DB RFQ status:', err);
        }
    };

    const toggleMessageExpand = (id: string) => {
        setExpandedMessages(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredLeads = leads.filter(lead => 
        lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.intent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredQuotes = quotes.filter(q =>
        q.quote_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'quoted':
            case 'accepted':
            case 'active':
                return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
            case 'rejected':
            case 'expired':
                return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
            default:
                return <Clock className="w-3.5 h-3.5 text-amber-400" />;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 font-mono">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-900 p-6 rounded-2xl border border-white/10 shadow-2xl">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#00f0ff]" />
                        Admin & Sales Lead Portal
                    </h1>
                    <p className="text-slate-400 mt-1 text-xs">
                        Authorized access for Admins and Sales Personnel to manage, review, and expire Waitlist Leads and Marketplace RFQs.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-black/60 p-1.5 rounded-xl border border-white/10 shrink-0">
                    <button
                        onClick={() => setActiveTab('waitlist')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'waitlist'
                                ? 'bg-[#00f0ff] text-black shadow-lg'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Shield className="w-4 h-4" />
                        <span>Waitlist Leads</span>
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">
                            {leads.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('rfqs')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'rfqs'
                                ? 'bg-[#00f0ff] text-black shadow-lg'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Marketplace RFQs</span>
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">
                            {quotes.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'analytics'
                                ? 'bg-[#00f0ff] text-black shadow-lg'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>Visitor Analytics & Search</span>
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]">
                            {telemetryEvents.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-navy-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                {/* Search & Counter Bar */}
                <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-950/50">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={activeTab === 'waitlist' ? "Search intent, name, email, product..." : "Search quote ID, email, status..."}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-navy-800 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:ring-1 focus:ring-[#00f0ff] focus:border-transparent outline-none transition-all placeholder:text-slate-500 font-mono"
                        />
                    </div>
                    <div className="text-xs text-slate-400">
                        Showing: <span className="text-[#00f0ff] font-bold">
                            {activeTab === 'waitlist' ? filteredLeads.length : filteredQuotes.length}
                        </span> records
                    </div>
                </div>

                {/* TAB 1: WAITLIST LEADS TABLE */}
                {activeTab === 'waitlist' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-navy-950/80 border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400">
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium">Contact</th>
                                    <th className="p-4 font-medium">Company</th>
                                    <th className="p-4 font-medium">Visitor Intent</th>
                                    <th className="p-4 font-medium">Source</th>
                                    <th className="p-4 font-medium">Product / Interest</th>
                                    <th className="p-4 font-medium min-w-[260px]">Full Message</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-navy-900/50 text-xs">
                                {loadingLeads ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-slate-400">
                                            <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00f0ff]" />
                                            Loading waitlist leads...
                                        </td>
                                    </tr>
                                ) : filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-slate-400">
                                            No waitlist leads found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map(lead => {
                                        const isExpanded = !!expandedMessages[lead.id];
                                        const msgText = lead.message || '-';
                                        const isLong = msgText.length > 70;
                                        const isExpired = lead.status === 'expired';

                                        return (
                                            <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group align-top">
                                                <td className="p-4">
                                                    <div className="text-white font-bold">{lead.full_name}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-[#00f0ff]">{lead.email}</div>
                                                    {lead.phone && <div className="text-slate-500 text-[10px] mt-0.5">{lead.phone}</div>}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-slate-300">{lead.company_name || '-'}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-bold uppercase tracking-wider">
                                                        <Shield className="w-3 h-3 shrink-0" />
                                                        <span>{lead.intent || 'solutions'}</span>
                                                        {lead.sub_category && <span className="opacity-60">({lead.sub_category})</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10 text-[10px] uppercase">
                                                        {lead.source || 'website'}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-amber-300 font-medium">
                                                        {lead.product_name}
                                                    </div>
                                                </td>
                                                {/* Expanded Message Field */}
                                                <td className="p-4 max-w-sm">
                                                    <div className="bg-black/40 border border-white/10 rounded p-2 text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                                                        {isLong && !isExpanded ? (
                                                            <>
                                                                {msgText.slice(0, 70)}...
                                                                <button
                                                                    onClick={() => toggleMessageExpand(lead.id)}
                                                                    className="text-[#00f0ff] font-bold ml-1 hover:underline inline-flex items-center gap-0.5"
                                                                >
                                                                    <span>Read More</span>
                                                                    <ChevronDown className="w-3 h-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {msgText}
                                                                {isLong && (
                                                                    <button
                                                                        onClick={() => toggleMessageExpand(lead.id)}
                                                                        className="text-[#00f0ff] font-bold block mt-1 hover:underline inline-flex items-center gap-0.5"
                                                                    >
                                                                        <span>Show Less</span>
                                                                        <ChevronUp className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                                                        isExpired
                                                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                                    }`}>
                                                        {isExpired ? 'Expired' : 'Active'}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {!isExpired ? (
                                                        <button
                                                            onClick={() => expireLead(lead.id)}
                                                            className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold uppercase transition-all"
                                                            title="Mark lead as expired"
                                                        >
                                                            Expire Lead
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-500">Expired</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 2: MARKETPLACE RFQS TABLE */}
                {activeTab === 'rfqs' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-navy-950/80 border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-400">
                                    <th className="p-4 font-medium">Quote ID</th>
                                    <th className="p-4 font-medium">Customer</th>
                                    <th className="p-4 font-medium">Requested Items / Products</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-navy-900/50 text-xs">
                                {loadingQuotes ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">
                                            <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00f0ff]" />
                                            Loading marketplace quote requests...
                                        </td>
                                    </tr>
                                ) : filteredQuotes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">
                                            No marketplace quote requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredQuotes.map(quote => {
                                        const isExpired = quote.status === 'expired';

                                        return (
                                            <tr key={quote.id} className="hover:bg-white/[0.02] transition-colors group align-top">
                                                <td className="p-4">
                                                    <div className="font-bold text-[#00f0ff]">{quote.quote_id}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-white font-bold">{quote.customer_name || 'Customer'}</div>
                                                    <div className="text-slate-400 text-[11px]">{quote.customer_email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        {(quote.items_json as any[])?.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 bg-black/40 border border-white/10 px-2.5 py-1 rounded text-[11px]">
                                                                <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                                <span className="text-white font-medium">{item.name || `Product #${item.product_id}`}</span>
                                                                {item.unit_price && (
                                                                    <span className="text-emerald-400 font-bold ml-auto">${item.unit_price}</span>
                                                                )}
                                                            </div>
                                                        )) || <span className="text-slate-500">No items specified</span>}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider">
                                                        {getStatusIcon(quote.status)}
                                                        <span className={quote.status === 'quoted' || quote.status === 'accepted' ? 'text-emerald-400' : quote.status === 'expired' || quote.status === 'rejected' ? 'text-red-400' : 'text-amber-400'}>
                                                            {quote.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-slate-400 text-[11px] whitespace-nowrap">
                                                        {new Date(quote.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            to={`/quote/${quote.quote_id}`}
                                                            target="_blank"
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 rounded text-xs font-bold transition-all"
                                                        >
                                                            <span>Customer Page</span>
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>

                                                        {!isExpired ? (
                                                            <button
                                                                onClick={() => expireRFQ(quote.id)}
                                                                className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-bold transition-all"
                                                                title="Expire this quote request"
                                                            >
                                                                Expire RFQ
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-500">Expired</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 3: VISITOR ANALYTICS & MARKET SEARCH INSIGHTS */}
                {activeTab === 'analytics' && (
                    <div className="p-6 space-y-6">
                        {/* Metrics Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-bold uppercase">Total Telemetry Events</span>
                                    <BarChart3 className="w-5 h-5 text-[#00f0ff]" />
                                </div>
                                <div className="text-2xl font-bold text-white mt-2">{telemetryEvents.length}</div>
                                <p className="text-[10px] text-slate-500 mt-1">Real-time visitor interactions logged</p>
                            </div>

                            <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-bold uppercase">Marketplace Search Queries</span>
                                    <SearchIcon className="w-5 h-5 text-amber-400" />
                                </div>
                                <div className="text-2xl font-bold text-amber-400 mt-2">
                                    {telemetryEvents.filter(e => e.eventType === 'market_search').length}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">Unique product catalog searches</p>
                            </div>

                            <div className="bg-black/60 border border-white/10 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-bold uppercase">Page Section Views</span>
                                    <Eye className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="text-2xl font-bold text-emerald-400 mt-2">
                                    {telemetryEvents.filter(e => e.eventType === 'section_view' || e.eventType === 'page_visit').length}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">Section and page dwell events</p>
                            </div>
                        </div>

                        {/* Top Searched Keywords Table */}
                        <div className="bg-black/40 border border-white/10 rounded-xl p-5 space-y-4">
                            <h3 className="text-sm font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
                                <SearchIcon className="w-4 h-4" />
                                Top Searched Marketplace Products & Keywords
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[10px] uppercase text-slate-400">
                                            <th className="py-2 px-3">Search Query / Term</th>
                                            <th className="py-2 px-3">Category Filter</th>
                                            <th className="py-2 px-3">Visitor Intent</th>
                                            <th className="py-2 px-3">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {telemetryEvents.filter(e => e.eventType === 'market_search').length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-4 text-center text-slate-500">
                                                    No marketplace search queries recorded yet. Search terms will appear here automatically when visitors search products in the Marketplace catalog.
                                                </td>
                                            </tr>
                                        ) : (
                                            telemetryEvents.filter(e => e.eventType === 'market_search').slice(0, 15).map(evt => (
                                                <tr key={evt.id} className="hover:bg-white/[0.02]">
                                                    <td className="py-2 px-3 font-bold text-white">
                                                        {evt.searchTerm || <span className="text-slate-500 italic">All Catalog</span>}
                                                    </td>
                                                    <td className="py-2 px-3 text-amber-300">
                                                        {evt.categoryFilter || '-'}
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-400 uppercase text-[10px]">
                                                        {evt.visitorIntent || 'general'}
                                                    </td>
                                                    <td className="py-2 px-3 text-slate-500 text-[10px]">
                                                        {new Date(evt.timestamp).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Telemetry Event Log */}
                        <div className="bg-black/40 border border-white/10 rounded-xl p-5 space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-[#00f0ff]" />
                                Full Live Telemetry Stream
                            </h3>
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                {telemetryEvents.map(evt => (
                                    <div key={evt.id} className="p-3 bg-navy-950/60 border border-white/5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                evt.eventType === 'market_search' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                                evt.eventType === 'section_view' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                                                evt.eventType === 'cta_click' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                                                evt.eventType === 'whitepaper_download' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                                                'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40'
                                            }`}>
                                                {evt.eventType}
                                            </span>
                                            <span className="text-white font-medium">
                                                {evt.searchTerm ? `Searched: "${evt.searchTerm}"` : 
                                                 evt.eventType === 'cta_click' ? `Clicked CTA: ${evt.sectionName || 'Button'}` :
                                                 evt.eventType === 'whitepaper_download' ? `Accessed Resource: ${evt.sectionName}` :
                                                 evt.sectionName ? `Viewed Section/Page: ${evt.sectionName}` : 
                                                 'Page Access Event'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                            <span>Intent: <strong className="text-slate-300 uppercase">{evt.visitorIntent || 'general'}</strong></span>
                                            <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
