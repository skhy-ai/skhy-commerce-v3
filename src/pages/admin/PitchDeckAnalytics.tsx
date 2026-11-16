import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, ChevronDown, ChevronUp, Clock, MapPin, Globe } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title as ChartTitle,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ChartTitle,
    Tooltip,
    Legend
);

interface Metric {
    slide_number: number;
    avg_duration: number;
    total_views: number;
}

interface Lead {
    id: string;
    email: string;
    created_at: string;
}

interface SessionData {
    session_id: string;
    start_time: string;
    total_duration: number;
    ip_address?: string;
    location?: {
        city?: string;
        region?: string;
        country?: string;
        country_code?: string;
    };
    timezone?: string;
    slides: Array<{
        slide_number: number;
        duration: number;
    }>;
}

const PitchDeckAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [totalSessions, setTotalSessions] = useState(0);
    const [avgSessionDuration, setAvgSessionDuration] = useState(0);
    const [slideMetrics, setSlideMetrics] = useState<Metric[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [expandedSession, setExpandedSession] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Analytics
            const { data: analytics, error: analyticsError } = await supabase
                .from('pitch_deck_analytics')
                .select('*');

            if (analyticsError) throw analyticsError;

            // Fetch Leads
            const { data: leadsData, error: leadsError } = await supabase
                .from('pitch_deck_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (leadsError) throw leadsError;

            processAnalytics(analytics);
            setLeads(leadsData || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processAnalytics = (data: any[]) => {
        if (!data || data.length === 0) return;

        // Unique Sessions
        const sessionSet = new Set(data.map(r => r.session_id));
        setTotalSessions(sessionSet.size);

        // Slide Metrics
        const slideMap = new Map<number, { totalDuration: number; count: number }>();
        const sessionDurations = new Map<string, number>();

        // Build Session Data
        const sessionDataMap = new Map<string, SessionData>();

        data.forEach(row => {
            // Slide Stats
            const current = slideMap.get(row.slide_number) || { totalDuration: 0, count: 0 };
            slideMap.set(row.slide_number, {
                totalDuration: current.totalDuration + row.duration_seconds,
                count: current.count + 1
            });

            // Session Stats
            const currentSessionDuration = sessionDurations.get(row.session_id) || 0;
            sessionDurations.set(row.session_id, currentSessionDuration + row.duration_seconds);

            // Session Details
            if (!sessionDataMap.has(row.session_id)) {
                // Extract location from session_location or meta
                const location = row.session_location || row.meta?.location;
                const ipAddress = row.ip_address || row.meta?.ip;

                sessionDataMap.set(row.session_id, {
                    session_id: row.session_id,
                    start_time: row.timestamp,
                    total_duration: 0,
                    ip_address: ipAddress,
                    location: location ? {
                        city: location.city,
                        region: location.region,
                        country: location.country,
                        country_code: location.country_code
                    } : undefined,
                    timezone: location?.timezone,
                    slides: []
                });
            }

            const sessionData = sessionDataMap.get(row.session_id)!;
            // Keep track of earliest timestamp for this session
            if (new Date(row.timestamp) < new Date(sessionData.start_time)) {
                sessionData.start_time = row.timestamp;
            }

            sessionData.slides.push({
                slide_number: row.slide_number,
                duration: row.duration_seconds
            });
        });

        // Finalize sessions
        const sessionsArray: SessionData[] = Array.from(sessionDataMap.values()).map(session => ({
            ...session,
            total_duration: sessionDurations.get(session.session_id) || 0,
            slides: session.slides.sort((a, b) => a.slide_number - b.slide_number)
        }));

        // Sort by most recent first
        sessionsArray.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
        setSessions(sessionsArray);

        // Calculate Averages
        const metrics: Metric[] = [];
        slideMap.forEach((val, key) => {
            metrics.push({
                slide_number: key,
                avg_duration: val.count > 0 ? Math.round(val.totalDuration / val.count) : 0,
                total_views: val.count
            });
        });
        setSlideMetrics(metrics.sort((a, b) => a.slide_number - b.slide_number));

        // Avg Session Duration
        let totalDuration = 0;
        sessionDurations.forEach(d => totalDuration += d);
        setAvgSessionDuration(sessionSet.size > 0 ? Math.round(totalDuration / sessionSet.size) : 0);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const formatDateTime = (dateString: string, timezone?: string) => {
        const date = new Date(dateString);
        const formatted = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Add timezone info if available
        if (timezone) {
            return `${formatted} (${timezone})`;
        }

        // Otherwise show UTC offset
        const offset = -date.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(offset) / 60);
        const offsetMinutes = Math.abs(offset) % 60;
        const offsetSign = offset >= 0 ? '+' : '-';
        const offsetString = `UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;

        return `${formatted} (${offsetString})`;
    };

    const exportLeads = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Email,Date\\n"
            + leads.map(l => `${l.email},${new Date(l.created_at).toLocaleString()}`).join("\\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "skhy_leads.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-white">Loading Analytics...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Pitch Deck Analytics</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <h3 className="text-gray-400 text-sm uppercase mb-2">Total Unique Viewers</h3>
                    <p className="text-4xl font-bold text-turquoise-400">{totalSessions}</p>
                </div>
                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <h3 className="text-gray-400 text-sm uppercase mb-2">Avg. Time Spent</h3>
                    <p className="text-4xl font-bold text-turquoise-400">{formatTime(avgSessionDuration)}</p>
                </div>
                <div className="bg-navy-900 p-6 rounded-xl border border-white/10">
                    <h3 className="text-gray-400 text-sm uppercase mb-2">Total Leads Captured</h3>
                    <p className="text-4xl font-bold text-turquoise-400">{leads.length}</p>
                </div>
            </div>

            {/* Session History */}
            <div className="mb-8 bg-navy-900 rounded-xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Session History</h2>
                    <p className="text-sm text-gray-400 mt-1">Click to view per-slide duration details</p>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <div key={session.session_id} className="border-b border-white/5 last:border-b-0">
                                <button
                                    onClick={() => setExpandedSession(expandedSession === session.session_id ? null : session.session_id)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <Clock className="w-5 h-5 text-turquoise-400 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <p className="text-white font-medium">{formatDateTime(session.start_time, session.timezone)}</p>
                                                {session.location && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>
                                                            {session.location.city && `${session.location.city}, `}
                                                            {session.location.country || 'Unknown'}
                                                            {session.location.country_code && ` (${session.location.country_code})`}
                                                        </span>
                                                    </div>
                                                )}
                                                {session.ip_address && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Globe className="w-4 h-4" />
                                                        <span className="font-mono">{session.ip_address}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Session ID: {session.session_id.substring(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <span className="text-turquoise-400 font-medium">{formatTime(session.total_duration)}</span>
                                        {expandedSession === session.session_id ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </button>
                                {expandedSession === session.session_id && (
                                    <div className="px-6 pb-6">
                                        <SessionGraph session={session} />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-gray-500">No session data available yet.</div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Slide Performance */}
                <div className="bg-navy-900 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">Slide Engagement</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-navy-950">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Slide #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg Duration</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Views</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {slideMetrics.map((slide) => (
                                    <tr key={slide.slide_number} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Slide {slide.slide_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{slide.avg_duration}s</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{slide.total_views}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Leads List */}
                <div className="bg-navy-900 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Captured Leads</h2>
                        <button onClick={exportLeads} className="flex items-center gap-2 text-sm text-turquoise-400 hover:text-turquoise-300 transition-colors">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-navy-950 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {leads.length > 0 ? (
                                    leads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{lead.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-8 text-center text-gray-500">No leads captured yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SessionGraph: React.FC<{ session: SessionData }> = ({ session }) => {
    const chartData = {
        labels: session.slides.map(s => `Slide ${s.slide_number}`),
        datasets: [
            {
                label: 'Duration (seconds)',
                data: session.slides.map(s => s.duration),
                borderColor: 'rgb(94, 234, 212)',
                backgroundColor: 'rgba(94, 234, 212, 0.1)',
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(5, 10, 20, 0.95)',
                titleColor: '#fff',
                bodyColor: '#5eeac4',
                borderColor: 'rgba(94, 234, 212, 0.3)',
                borderWidth: 1,
                padding: 12,
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#9ca3af',
                    callback: function (value: any) {
                        return value + 's';
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                }
            },
            x: {
                ticks: {
                    color: '#9ca3af'
                },
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="bg-navy-950 p-4 rounded-lg mt-4">
            <h4 className="text-white font-medium mb-4">Per-Slide Duration</h4>
            <div className="h-64">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default PitchDeckAnalytics;
