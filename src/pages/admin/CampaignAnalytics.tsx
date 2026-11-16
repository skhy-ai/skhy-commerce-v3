import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, Clock, ShoppingBag, CheckCircle, XCircle, Loader } from 'lucide-react';

interface CampaignEvent {
    id: string;
    campaign_id: string;
    event_type: 'email_open' | 'link_click' | 'marketplace_visit' | 'product_click' | 'registration';
    meta: any;
    created_at: string;
    user_session_id?: string;
}

const CampaignAnalytics: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pitch_deck' | 'marketplace' | 'partner'>('pitch_deck');
    const [loading, setLoading] = useState(true);
    const [pitchDeckData, setPitchDeckData] = useState<any[]>([]);
    const [marketplaceEvents, setMarketplaceEvents] = useState<CampaignEvent[]>([]);
    const [partnerEvents, setPartnerEvents] = useState<CampaignEvent[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Pitch Deck Data (Existing Logic Reuse)
            const { data: recipients } = await supabase.from('pitch_deck_recipients').select('*').order('created_at', { ascending: false });
            const { data: links } = await supabase.from('pitch_deck_campaign_links').select('*');

            // Compile basic pitch deck data
            const pdData = (recipients || []).map(recipient => {
                const link = links?.find(l => l.recipient_id === recipient.id);
                return { recipient, link, analytics: [] };
            });
            setPitchDeckData(pdData);

            // 2. Fetch General Campaign Events
            const { data: events } = await supabase
                .from('campaign_events')
                .select('*')
                .order('created_at', { ascending: false });

            if (events) {
                setMarketplaceEvents(events.filter(e => ['marketplace_visit', 'product_click'].includes(e.event_type)));
                setPartnerEvents(events.filter(e => e.event_type === 'registration'));
            }

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const renderPitchDeckView = () => (
        <div className="bg-navy-900 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-navy-950">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Recipient</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Activity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {pitchDeckData.map((item) => {
                            const clicked = item.link && item.link.click_count > 0;
                            return (
                                <tr key={item.recipient.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-white">{item.recipient.name}</div>
                                        <div className="text-xs text-gray-400">{item.recipient.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {clicked ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-xs">
                                                <CheckCircle className="w-3 h-3" /> Clicked ({item.link.click_count})
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/10 border border-gray-500/30 text-gray-400 rounded text-xs">
                                                <XCircle className="w-3 h-3" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {formatDateTime(item.link?.last_clicked_at)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMarketplaceView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <h3 className="text-gray-400 text-sm uppercase mb-2">Total Visits</h3>
                    <p className="text-3xl font-bold text-white">
                        {marketplaceEvents.filter(e => e.event_type === 'marketplace_visit').length}
                    </p>
                </div>
                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <h3 className="text-gray-400 text-sm uppercase mb-2">Product Clicks</h3>
                    <p className="text-3xl font-bold text-white">
                        {marketplaceEvents.filter(e => e.event_type === 'product_click').length}
                    </p>
                </div>
                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <h3 className="text-gray-400 text-sm uppercase mb-2">Avg Time Spent</h3>
                    <p className="text-3xl font-bold text-white">
                        {(() => {
                            const timedEvents = marketplaceEvents.filter(e => e?.meta?.duration_seconds);
                            if (!timedEvents.length) return '0s';
                            const avg = timedEvents.reduce((acc, curr) => acc + curr.meta.duration_seconds, 0) / timedEvents.length;
                            return `${Math.round(avg)}s`;
                        })()}
                    </p>
                </div>
            </div>

            <div className="bg-navy-900 rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {marketplaceEvents.slice(0, 10).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                {event.event_type === 'product_click' ? <ShoppingBag className="text-blue-400" /> : <Clock className="text-gray-400" />}
                                <div>
                                    <div className="text-white font-medium">
                                        {event.event_type === 'product_click' ? `Clicked Product: ${event.meta?.product_name || 'Unknown'}` : 'Marketplace Visit'}
                                    </div>
                                    <div className="text-xs text-gray-500">Session: {event.user_session_id?.slice(0, 8)}...</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">
                                {formatDateTime(event.created_at)}
                            </div>
                        </div>
                    ))}
                    {marketplaceEvents.length === 0 && <p className="text-gray-500">No activity recorded yet.</p>}
                </div>
            </div>
        </div>
    );

    const renderPartnerView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <h3 className="text-gray-400 text-sm uppercase mb-2">Conversion Count</h3>
                    <p className="text-3xl font-bold text-white">{partnerEvents.length}</p>
                </div>
            </div>

            <div className="bg-navy-900 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-navy-950">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Source Campaign</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {partnerEvents.map(event => (
                            <tr key={event.id} className="hover:bg-white/5">
                                <td className="px-6 py-4 text-gray-300">{formatDateTime(event.created_at)}</td>
                                <td className="px-6 py-4 text-white font-mono text-xs">{event.campaign_id || 'Unknown'}</td>
                                <td className="px-6 py-4 text-gray-400 text-xs">{event.user_session_id}</td>
                            </tr>
                        ))}
                        {partnerEvents.length === 0 && (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No partner conversions yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const handleExport = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        let filename = `campaign_analytics_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;

        if (activeTab === 'pitch_deck') {
            csvContent += "Recipient Name,Email,Status,Last Activity\n";
            pitchDeckData.forEach(item => {
                const clicked = item.link && item.link.click_count > 0;
                csvContent += `${item.recipient.name},${item.recipient.email},${clicked ? 'Clicked' : 'Pending'},${item.link?.last_clicked_at || ''}\n`;
            });
        } else if (activeTab === 'marketplace') {
            csvContent += "Event Type,Product/URL,Session ID,Date\n";
            marketplaceEvents.forEach(e => {
                const details = e.event_type === 'product_click' ? e.meta?.product_name : 'N/A';
                csvContent += `${e.event_type},${details},${e.user_session_id || 'anon'},${e.created_at}\n`;
            });
        } else if (activeTab === 'partner') {
            csvContent += "Date,Campaign ID,Source,User ID\n";
            partnerEvents.forEach(e => {
                csvContent += `${e.created_at},${e.campaign_id},${e.meta?.ref || 'N/A'},${e.user_session_id}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 min-h-screen bg-navy-950">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Campaign Analytics</h1>
                    <p className="text-gray-400">Unified view of all campaign performance metrics</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 px-4 py-2 rounded-lg transition-colors border border-white/10 text-white"
                >
                    <Download className="w-4 h-4" /> Export Report
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('pitch_deck')}
                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'pitch_deck' ? 'text-turquoise-400 border-b-2 border-turquoise-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Pitch Decks (VC)
                </button>
                <button
                    onClick={() => setActiveTab('marketplace')}
                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'marketplace' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Marketplace (Customers)
                </button>
                <button
                    onClick={() => setActiveTab('partner')}
                    className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'partner' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Partner Acquisition
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center h-64 items-center">
                    <Loader className="w-8 h-8 animate-spin text-turquoise-400" />
                </div>
            ) : (
                <>
                    {activeTab === 'pitch_deck' && renderPitchDeckView()}
                    {activeTab === 'marketplace' && renderMarketplaceView()}
                    {activeTab === 'partner' && renderPartnerView()}
                </>
            )}
        </div>
    );
};

export default CampaignAnalytics;
