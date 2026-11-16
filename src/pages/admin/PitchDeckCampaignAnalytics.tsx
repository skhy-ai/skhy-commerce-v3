import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, Mail, ExternalLink, MapPin, Clock, TrendingUp, Users, CheckCircle, XCircle, Loader } from 'lucide-react';

interface Recipient {
    id: string;
    name: string;
    email: string;
    company?: string;
    country: string;
    region?: string;
}

interface CampaignLink {
    id: string;
    recipient_id: string;
    tracking_token: string;
    click_count: number;
    first_clicked_at?: string;
    last_clicked_at?: string;
    created_at: string;
}

interface EngagementData {
    recipient: Recipient;
    campaignLink: CampaignLink | null;
    totalTimeSpent: number;
    slidesViewed: number[];
    location?: {
        city?: string;
        country?: string;
    };
}

const PitchDeckCampaignAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [engagementFilter, setEngagementFilter] = useState<string>('all'); // 'all', 'clicked', 'not-clicked'

    useEffect(() => {
        fetchEngagementData();
    }, []);

    const fetchEngagementData = async () => {
        setLoading(true);
        try {
            // Fetch all recipients
            const { data: recipients, error: recipientsError } = await supabase
                .from('pitch_deck_recipients')
                .select('*')
                .order('created_at', { ascending: false });

            if (recipientsError) throw recipientsError;

            // Fetch all campaign links
            const { data: campaignLinks, error: linksError } = await supabase
                .from('pitch_deck_campaign_links')
                .select('*');

            if (linksError) throw linksError;

            // For each recipient, compile engagement data
            const engagementPromises = (recipients || []).map(async (recipient) => {
                // Find campaign link for this recipient
                const link = (campaignLinks || []).find(l => l.recipient_id === recipient.id) || null;

                // If link exists and was clicked, fetch analytics
                let totalTimeSpent = 0;
                let slidesViewed: number[] = [];
                let location: any = undefined;

                if (link && link.click_count > 0) {
                    const { data: analytics, error: analyticsError } = await supabase
                        .from('pitch_deck_analytics')
                        .select('*')
                        .eq('campaign_link_id', link.id);

                    if (!analyticsError && analytics && analytics.length > 0) {
                        // Calculate total time spent
                        totalTimeSpent = analytics.reduce((sum, entry) => sum + (entry.duration_seconds || 0), 0);

                        // Get unique slides viewed
                        slidesViewed = [...new Set(analytics.map(entry => entry.slide_number))].sort((a, b) => a - b);

                        // Get location from first analytics entry
                        if (analytics[0].session_location) {
                            location = analytics[0].session_location;
                        }
                    }
                }

                return {
                    recipient,
                    campaignLink: link,
                    totalTimeSpent,
                    slidesViewed,
                    location
                };
            });

            const data = await Promise.all(engagementPromises);
            setEngagementData(data);
        } catch (err) {
            console.error('Error fetching engagement data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportCSV = () => {
        const filtered = filteredEngagementData();
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Email,Company,Country,Region,Link Clicked,Click Count,First Click,Last Click,Time Spent,Slides Viewed,Location\n"
            + filtered.map(e => {
                const clicked = e.campaignLink && e.campaignLink.click_count > 0;
                return `${e.recipient.name},${e.recipient.email},${e.recipient.company || ''},${e.recipient.country},${e.recipient.region || ''},${clicked ? 'Yes' : 'No'},${e.campaignLink?.click_count || 0},${formatDateTime(e.campaignLink?.first_clicked_at)},${formatDateTime(e.campaignLink?.last_clicked_at)},${formatTime(e.totalTimeSpent)},${e.slidesViewed.join('; ')},${e.location ? `${e.location.city || ''} ${e.location.country || ''}` : ''}`;
            }).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `pitch_deck_campaign_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredEngagementData = () => {
        return engagementData.filter(e => {
            const matchesCountry = countryFilter === 'all' || e.recipient.country === countryFilter;
            const clicked = e.campaignLink && e.campaignLink.click_count > 0;
            const matchesEngagement = engagementFilter === 'all' ||
                (engagementFilter === 'clicked' && clicked) ||
                (engagementFilter === 'not-clicked' && !clicked);
            return matchesCountry && matchesEngagement;
        });
    };

    const copyTrackingLink = (token: string, recipientEmail: string) => {
        const link = `${window.location.origin}/pitch-deck?token=${token}`;
        navigator.clipboard.writeText(link);
        alert(`Link copied for ${recipientEmail}`);
    };

    const filtered = filteredEngagementData();

    // Calculate stats
    const totalRecipients = engagementData.length;
    const clickedCount = engagementData.filter(e => e.campaignLink && e.campaignLink.click_count > 0).length;
    const clickThroughRate = totalRecipients > 0 ? ((clickedCount / totalRecipients) * 100).toFixed(1) : 0;
    const totalClicks = engagementData.reduce((sum, e) => sum + (e.campaignLink?.click_count || 0), 0);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Pitch Deck Campaign Analytics</h1>
                    <p className="text-gray-400">Monitor engagement and click-through rates for your VC outreach</p>
                </div>
                <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 px-4 py-2 rounded-lg transition-colors border border-white/10 text-white"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-turquoise-400" />
                        <h3 className="text-gray-400 text-sm uppercase">Total Recipients</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalRecipients}</p>
                </div>

                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <h3 className="text-gray-400 text-sm uppercase">Clicked Links</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{clickedCount}</p>
                </div>

                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <h3 className="text-gray-400 text-sm uppercase">Click-Through Rate</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{clickThroughRate}%</p>
                </div>

                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <ExternalLink className="w-5 h-5 text-purple-400" />
                        <h3 className="text-gray-400 text-sm uppercase">Total Clicks</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalClicks}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
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

                <select
                    value={engagementFilter}
                    onChange={(e) => setEngagementFilter(e.target.value)}
                    className="px-4 py-2 bg-navy-900 border border-white/10 rounded-lg focus:outline-none focus:border-turquoise-400 text-white"
                >
                    <option value="all">All Engagement</option>
                    <option value="clicked">Clicked</option>
                    <option value="not-clicked">Not Clicked</option>
                </select>
            </div>

            {/* Engagement Table */}
            <div className="bg-navy-900 rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-navy-950">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Recipient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Clicks</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">First Click</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time Spent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Slides</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        <Loader className="w-6 h-6 animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        No recipients found. {engagementData.length > 0 ? 'Try adjusting your filters.' : ''}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((engagement) => {
                                    const clicked = engagement.campaignLink && engagement.campaignLink.click_count > 0;
                                    return (
                                        <tr key={engagement.recipient.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-white">{engagement.recipient.name}</div>
                                                <div className="text-xs text-gray-400">{engagement.recipient.email}</div>
                                                {engagement.recipient.company && (
                                                    <div className="text-xs text-gray-500">{engagement.recipient.company}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">{engagement.recipient.country}</div>
                                                {engagement.recipient.region && (
                                                    <div className="text-xs text-gray-500">{engagement.recipient.region}</div>
                                                )}
                                                {engagement.location && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {engagement.location.city}, {engagement.location.country}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {clicked ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-xs">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Clicked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/10 border border-gray-500/30 text-gray-400 rounded text-xs">
                                                        <XCircle className="w-3 h-3" />
                                                        Not Clicked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {engagement.campaignLink?.click_count || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-300">
                                                    {formatDateTime(engagement.campaignLink?.first_clicked_at)}
                                                </div>
                                                {engagement.campaignLink?.last_clicked_at && engagement.campaignLink.click_count > 1 && (
                                                    <div className="text-xs text-gray-500">
                                                        Last: {formatDateTime(engagement.campaignLink.last_clicked_at)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {clicked ? (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-turquoise-400" />
                                                        {formatTime(engagement.totalTimeSpent)}
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {engagement.slidesViewed.length > 0 ? (
                                                    <span className="text-xs">{engagement.slidesViewed.length} slides</span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {engagement.campaignLink && (
                                                    <button
                                                        onClick={() => copyTrackingLink(engagement.campaignLink!.tracking_token, engagement.recipient.email)}
                                                        className="text-turquoise-400 hover:text-turquoise-300 text-xs"
                                                        title="Copy tracking link"
                                                    >
                                                        Copy Link
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 text-sm text-gray-500">
                Showing {filtered.length} of {engagementData.length} recipients
                {countryFilter !== 'all' && ` • Filtered by ${countryFilter}`}
                {engagementFilter !== 'all' && ` • ${engagementFilter === 'clicked' ? 'Clicked only' : 'Not clicked only'}`}
            </div>
        </div>
    );
};

export default PitchDeckCampaignAnalytics;
