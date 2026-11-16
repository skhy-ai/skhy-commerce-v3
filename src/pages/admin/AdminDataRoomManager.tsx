import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
    Plus, Edit, Trash2, Eye, EyeOff, FileText, CheckCircle2, 
    Search, Save, ArrowLeft, Tag, Layers, Calendar, DollarSign, Briefcase, Shield, RefreshCw
} from 'lucide-react';

export interface DataRoomItem {
    id: string;
    category: 'meetings' | 'partnerships' | 'financials' | 'captable' | 'ip' | 'legal' | 'demos';
    title: string;
    company_or_entity?: string;
    type?: string;
    status: 'Published' | 'Draft';
    date?: string;
    deal_value?: string;
    summary: string;
    content_markdown: string;
    linked_product_ids: string[];
    author?: string;
    created_at?: string;
    updated_at?: string;
}

const DEFAULT_SEED_ITEMS: DataRoomItem[] = [
    {
        id: 'sima-ai-seed',
        category: 'meetings',
        title: 'SiMa.ai Partnership & Defense Edge AI Integration',
        company_or_entity: 'SiMa.ai',
        type: 'Hardware OEM Partner',
        status: 'Published',
        date: '2026-10-08',
        deal_value: '$1.8M Joint Pipeline',
        summary: 'Benchmarked Vidur AI middleware on SiMa.ai MLSoC silicon achieving 4.2ms end-to-end DoA latency under 15W. Drafted joint defense GTM LOI for 25 pilot units by Q1 2027.',
        linked_product_ids: ['vidur-ai-os', 'threat-awareness'],
        content_markdown: `# Meeting Note: SiMa.ai Partnership & Defense Edge AI Integration

- **Date**: 2026-10-08
- **Lead / Entity Type**: Hardware OEM Partner / Edge AI Silicon
- **Status**: LOI Drafted / Technical Integration Stage
- **Skhy AI Attendees**: Founder & Chief AI Architect
- **Counterpart Attendees**: VP of Ecosystem Partnerships, Lead Systems Architect (SiMa.ai)

---

## 🎯 Objective
Establish technical interoperability between Skhy AI's **Vidur AI Edge Middleware** and SiMa.ai’s **Modalix / MLSoC (Machine Learning System on Chip)** for ultra-low latency acoustic beamforming and multi-modal autonomous threat awareness at the tactical edge.

## 📝 Key Discussion Points
1. **Edge Chip Benchmark**:
   - Vidur AI pipeline demonstrated 4.2ms end-to-end latency for passive acoustic threat detection on SiMa.ai MLSoC running under 15W power envelope.
   - SiMa.ai team confirmed native support for Skhy AI's quantized neural beamforming models without custom C++ kernel rewrite.
2. **Joint Go-To-Market (GTM)**:
   - Co-marketing for defense primes requiring ITAR/EAR-compliant, low-power edge surveillance nodes (UAV, UGVs, and fixed border watchtowers).
   - Agreed to bundle Vidur AI OS evaluation image with SiMa.ai Defense Starter Kits for international military clients.
3. **Hardware Deployment Roadmap**:
   - Target pilot integration for 25 field test units with defense partners by Q1 2027.

## ⚡ Action Items & Next Steps
- [x] **Skhy AI Tech Lead**: Deliver Docker container of Vidur AI runtime configured for SiMa.ai SDK (Completed 2026-10-08).
- [ ] **SiMa.ai Partnership Team**: Review and sign joint MOU / LOI for defense GTM (Target: 2026-10-18).
- [ ] **Skhy AI Systems Lead**: Benchmark passive acoustic array under thermal stress on MLSoC devkit (Target: 2026-10-25).

## 📊 Evaluation Metrics & Deal Value
- **Joint Opportunity Pipeline**: $1.8M (First 3 defense customer deployments)
- **Target Commercial Launch**: Q2 2027
- **Deal Stage Probability**: 85%`
    },
    {
        id: 'lockheed-martin-seed',
        category: 'meetings',
        title: 'Lockheed Martin Ventures — Seed Due Diligence',
        company_or_entity: 'Lockheed Martin Ventures',
        type: 'Strategic Defense VC',
        status: 'Published',
        date: '2026-09-24',
        deal_value: '$500K - $750K Check',
        summary: 'Deep-dive technical review on acoustic beamforming IP in GPS-denied environments and ATAK integration. Participating as strategic co-investor in $2.3M Seed Round.',
        linked_product_ids: ['sentry-os', 'threat-awareness'],
        content_markdown: `# Meeting Note: Lockheed Martin Ventures — Seed Due Diligence

- **Date**: 2026-09-24
- **Lead / Entity Type**: Strategic Defense VC / Investor
- **Status**: Due Diligence / Data Room Review
- **Skhy AI Attendees**: CEO & CTO
- **Counterpart Attendees**: Investment Director, Principal Technical Evaluator (Lockheed Martin Ventures)

---

## 🎯 Objective
Deep-dive technical due diligence on Skhy AI's acoustic beamforming IP, hardware-agnostic OS architecture (Vidur AI), and commercial traction for autonomous perimeter defense (SentryOS).

## 📝 Key Discussion Points
1. **Competitive Moat & IP Defense**:
   - Evaluated Skhy AI's patent portfolio on direction-of-arrival (DoA) estimation in heavy electronic warfare / GPS-denied environments.
   - Verified that acoustic tracking operates passively (zero RF signature emitted), making it un-jammable compared to traditional radar.
2. **Integration with Legacy C2 Systems**:
   - Discussed API interoperability with Android Tactical Assault Kit (ATAK) and NATO STANAG 4586 compliance.
   - Live demo of TAM (Threat Awareness Manager) streaming real-time drone acoustic telemetry into ATAK plug-in.
3. **Syndicate & Term Sheet Discussion**:
   - LMV expressed interest in participating in the $2.3M Seed Round as a strategic co-investor alongside lead financial VC.

## ⚡ Action Items & Next Steps
- [x] **Skhy AI Team**: Grant access code to upgraded Investor Data Room & financial model (Completed 2026-09-25).
- [ ] **Lockheed Evaluation Team**: Schedule follow-up live field demonstration at test range (Target: Q4 2026).
- [ ] **Skhy AI CEO**: Share updated cap table and syndicate allocation (Target: 2026-10-15).

## 📊 Evaluation Metrics & Deal Value
- **Potential Investment Check Size**: $500K - $750K
- **Seed Round Target**: $2.3M at $12M Post-Money Valuation
- **Deal Stage Probability**: 70%`
    }
];

export const AdminDataRoomManager: React.FC = () => {
    const [items, setItems] = useState<DataRoomItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeFilterCategory, setActiveFilterCategory] = useState<string>('all');
    const [editingItem, setEditingItem] = useState<DataRoomItem | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState<'editor' | 'preview'>('editor');
    
    // SKHY Provided Products across Defense, Industry, and SKHY Store Pages
    const SKHY_PRODUCTS_BASELINE = [
        // Defense Page Systems
        { id: 'vidur-ai-os', name: 'Vidur AI Edge Middleware (Defense)', category: 'Defense' },
        { id: 'threat-awareness', name: 'Threat Awareness Manager / TAM (Defense)', category: 'Defense' },
        { id: 'sentry-os', name: 'Sentry OS Perimeter Defense (Defense)', category: 'Defense' },
        { id: 'mobisuite', name: 'SKHY MOBISUITE RF & Acoustic Engine (Defense)', category: 'Defense' },
        { id: 'mobisense', name: 'SKHY MOBISENSE Perimeter Sensor Node (Defense)', category: 'Defense' },
        { id: 'swarm-ai-radar', name: 'Swarm AI & Tactical Radar (Defense)', category: 'Defense' },
        { id: 'kinetic-interceptors', name: 'Canister Kinetic Interceptors (Defense)', category: 'Defense' },

        // Industry & Mission Architect Platforms
        { id: 'heavy-lift-multirotor', name: 'Heavy-Lift Multirotor Platform (Industries)', category: 'Industries' },
        { id: 'fixed-wing-surveyor', name: 'Fixed-Wing Long Range Surveyor (Industries)', category: 'Industries' },
        { id: 'tactical-rover', name: 'Tactical Terrestrial UGV Rover (Industries)', category: 'Industries' },
    ];

    const [catalogProducts, setCatalogProducts] = useState<Array<{ id: string; name: string; category?: string }>>(SKHY_PRODUCTS_BASELINE);

    useEffect(() => {
        fetchItems();
        fetchCatalogProducts();
    }, []);

    const fetchCatalogProducts = async () => {
        try {
            const { getMarketplaceProducts } = await import('../../data/cachedMarketplace');
            const allProducts = await getMarketplaceProducts();
            
            // Exclusively filter SKHY proprietary products (show_on_skhy_store = true AND SKHY manufacturer/seller)
            const skhyStoreItems = allProducts.filter((p: any) => 
                p.show_on_skhy_store === true && 
                (
                    (p.manufacturer && p.manufacturer.toLowerCase().includes('skhy')) ||
                    (p.seller?.company_name && p.seller.company_name.toLowerCase().includes('skhy')) ||
                    (p.name && p.name.toLowerCase().includes('skhy'))
                )
            );

            if (skhyStoreItems.length > 0) {
                setCatalogProducts(prev => {
                    const combined = [...prev];
                    skhyStoreItems.forEach((p: any) => {
                        const pid = String(p.id);
                        if (!combined.some(c => c.id === pid)) {
                            combined.push({ 
                                id: pid, 
                                name: `${p.name} (SKHY Store)`,
                                category: 'SKHY Store'
                            });
                        }
                    });
                    return combined;
                });
            }
        } catch (e) {
            console.warn("Could not fetch SKHY store products:", e);
        }
    };

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('investor_data_room_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error || !data || data.length === 0) {
                // Check local storage or baseline seed
                const local = localStorage.getItem('skhy_investor_data_room_items');
                if (local) {
                    setItems(JSON.parse(local));
                } else {
                    setItems(DEFAULT_SEED_ITEMS);
                }
            } else {
                setItems(data);
            }
        } catch (err) {
            console.warn("Using local baseline items for data room:", err);
            setItems(DEFAULT_SEED_ITEMS);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveItem = async (itemToSave: DataRoomItem) => {
        try {
            const payload = {
                ...itemToSave,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('investor_data_room_items')
                .upsert([payload]);

            if (error) {
                console.warn("Supabase save warning (saving locally):", error);
            }

            // Save to state and local storage fallback
            const updatedItems = items.some(i => i.id === payload.id)
                ? items.map(i => i.id === payload.id ? payload : i)
                : [payload, ...items];
            
            setItems(updatedItems);
            localStorage.setItem('skhy_investor_data_room_items', JSON.stringify(updatedItems));

            setEditingItem(null);
            setIsCreating(false);
            alert(`Document "${payload.title}" saved and set to ${payload.status}!`);
        } catch (err: any) {
            alert('Error saving document: ' + err.message);
        }
    };

    const handleToggleStatus = async (item: DataRoomItem) => {
        const newStatus = item.status === 'Published' ? 'Draft' : 'Published';
        const updated = { ...item, status: newStatus as 'Published' | 'Draft' };
        await handleSaveItem(updated);
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document from the Investor Data Room?')) return;
        
        try {
            await supabase.from('investor_data_room_items').delete().eq('id', id);
        } catch (e) { console.warn("Supabase delete failed:", e); }

        const filtered = items.filter(i => i.id !== id);
        setItems(filtered);
        localStorage.setItem('skhy_investor_data_room_items', JSON.stringify(filtered));
    };

    const handleCreateNew = () => {
        const newItem: DataRoomItem = {
            id: 'item_' + Date.now(),
            category: 'meetings',
            title: '',
            company_or_entity: '',
            type: 'Customer / Defense Prime',
            status: 'Published',
            date: new Date().toISOString().split('T')[0],
            deal_value: '',
            summary: '',
            content_markdown: `# Document Title\n\n- **Date**: ${new Date().toISOString().split('T')[0]}\n- **Entity**: \n\n## 📝 Summary & Key Points\nAdd details here...`,
            linked_product_ids: [],
            author: 'Admin'
        };
        setEditingItem(newItem);
        setIsCreating(true);
        setActiveModalTab('editor');
    };

    const filteredItems = items.filter(i => {
        const matchesCategory = activeFilterCategory === 'all' || i.category === activeFilterCategory;
        const matchesSearch = 
            i.title.toLowerCase().includes(search.toLowerCase()) ||
            (i.company_or_entity && i.company_or_entity.toLowerCase().includes(search.toLowerCase())) ||
            i.summary.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-slate-100 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <FileText className="w-8 h-8 text-turquoise-400" />
                        Investor Data Room Manager
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Create, edit, preview, and publish confidential markdown documents, meeting notes, financial models, and LOIs.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchItems}
                        className="p-2.5 bg-navy-900 hover:bg-navy-800 text-gray-300 rounded-xl border border-white/10 transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleCreateNew}
                        className="px-5 py-2.5 bg-turquoise-500 hover:bg-turquoise-400 text-navy-950 font-bold rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-turquoise-500/20 text-sm"
                    >
                        <Plus className="w-4 h-4" /> New Document
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-navy-900/60 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
                    {[
                        { id: 'all', label: 'All Sections' },
                        { id: 'meetings', label: '📋 Meetings' },
                        { id: 'partnerships', label: '🤝 LOIs & Partners' },
                        { id: 'financials', label: '💰 Financials' },
                        { id: 'captable', label: '📈 Cap Table' },
                        { id: 'ip', label: '🛡️ IP Portfolio' },
                        { id: 'legal', label: '📜 Legal' },
                        { id: 'demos', label: '🎮 Demos' },
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveFilterCategory(cat.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                                activeFilterCategory === cat.id
                                    ? 'bg-turquoise-500 text-navy-950 shadow-sm'
                                    : 'bg-navy-950 text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                
                <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-navy-950 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-turquoise-500"
                    />
                </div>
            </div>

            {/* Document Table */}
            <div className="bg-navy-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-navy-950 border-b border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                                <th className="py-3.5 px-4">Title & Entity</th>
                                <th className="py-3.5 px-4">Category</th>
                                <th className="py-3.5 px-4">Date</th>
                                <th className="py-3.5 px-4">Deal Value</th>
                                <th className="py-3.5 px-4">Linked Products</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-medium">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-gray-500">
                                        No documents found. Click "New Document" to create one.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-white text-sm">{item.title}</div>
                                            {item.company_or_entity && (
                                                <div className="text-xs text-turquoise-400 mt-0.5">{item.company_or_entity} ({item.type || 'Entity'})</div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2.5 py-1 bg-navy-950 border border-white/10 rounded-md font-mono text-[11px] uppercase text-gray-300">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-400 font-mono">{item.date || '—'}</td>
                                        <td className="py-4 px-4 font-mono text-emerald-400 font-bold">{item.deal_value || '—'}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {item.linked_product_ids && item.linked_product_ids.length > 0 ? (
                                                    item.linked_product_ids.map((pid, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-turquoise-500/10 text-turquoise-300 border border-turquoise-500/20 rounded text-[10px]">
                                                            {pid}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-600 text-[10px]">None</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={() => handleToggleStatus(item)}
                                                className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all ${
                                                    item.status === 'Published'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                                }`}
                                            >
                                                {item.status === 'Published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                {item.status}
                                            </button>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setIsCreating(false);
                                                        setActiveModalTab('editor');
                                                    }}
                                                    className="p-2 bg-navy-950 hover:bg-turquoise-500/20 text-turquoise-400 rounded-lg border border-white/10 transition-colors"
                                                    title="Edit Document"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-2 bg-navy-950 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-white/10 transition-colors"
                                                    title="Delete Document"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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

            {/* EDIT / CREATE MODAL */}
            {editingItem && (
                <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-navy-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
                        
                        {/* Modal Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-navy-950">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Edit className="w-5 h-5 text-turquoise-400" />
                                    {isCreating ? 'Create New Investor Document' : `Edit: ${editingItem.title || 'Untitled Document'}`}
                                </h3>
                                <p className="text-xs text-gray-400">Content will be dynamically published to the gated Investor Data Room.</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="bg-navy-900 p-1 rounded-xl border border-white/10 flex items-center gap-1">
                                    <button
                                        onClick={() => setActiveModalTab('editor')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                            activeModalTab === 'editor' ? 'bg-turquoise-500 text-navy-950' : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Editor
                                    </button>
                                    <button
                                        onClick={() => setActiveModalTab('preview')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                            activeModalTab === 'preview' ? 'bg-turquoise-500 text-navy-950' : 'text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        Live Preview
                                    </button>
                                </div>
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors text-xs font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-grow space-y-6">
                            {activeModalTab === 'editor' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Category Section</label>
                                            <select
                                                value={editingItem.category}
                                                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                                                className="w-full bg-navy-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-turquoise-500"
                                            >
                                                <option value="meetings">📋 Meeting Notes Log</option>
                                                <option value="partnerships">🤝 Partnerships & LOIs</option>
                                                <option value="financials">💰 Financial Model</option>
                                                <option value="captable">📈 Cap Table</option>
                                                <option value="ip">🛡️ IP Portfolio</option>
                                                <option value="legal">📜 Legal Documents</option>
                                                <option value="demos">🎮 Technology Demos</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Publication Status</label>
                                            <select
                                                value={editingItem.status}
                                                onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                                                className="w-full bg-navy-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-turquoise-500 font-bold"
                                            >
                                                <option value="Published">🟢 Published (Visible to Investors)</option>
                                                <option value="Draft">🟡 Draft (Admin Only)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1">Document Title</label>
                                        <input
                                            type="text"
                                            value={editingItem.title}
                                            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                            placeholder="e.g., SiMa.ai Partnership & Defense Edge AI Integration"
                                            className="w-full bg-navy-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-turquoise-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Counterpart Company / Entity</label>
                                            <input
                                                type="text"
                                                value={editingItem.company_or_entity || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, company_or_entity: e.target.value })}
                                                placeholder="e.g. SiMa.ai / Lockheed Martin"
                                                className="w-full bg-navy-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-turquoise-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Entity Type</label>
                                            <input
                                                type="text"
                                                value={editingItem.type || ''}
                                                onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                                                placeholder="e.g. Hardware OEM / Strategic VC"
                                                className="w-full bg-navy-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-turquoise-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-300 mb-1">Date / Value</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={editingItem.date || ''}
                                                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                                                    className="w-1/2 bg-navy-950 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-turquoise-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={editingItem.deal_value || ''}
                                                    onChange={(e) => setEditingItem({ ...editingItem, deal_value: e.target.value })}
                                                    placeholder="$ Value"
                                                    className="w-1/2 bg-navy-950 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-turquoise-500 font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Linked Product Catalog Tagging */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                                            Link to Products / Demos (Cross-reference in Catalog)
                                        </label>
                                        <div className="flex flex-wrap gap-2 bg-navy-950 p-3 rounded-xl border border-gray-800">
                                            {catalogProducts.map(p => {
                                                const isSelected = editingItem.linked_product_ids.includes(p.id);
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const newIds = isSelected
                                                                ? editingItem.linked_product_ids.filter(id => id !== p.id)
                                                                : [...editingItem.linked_product_ids, p.id];
                                                            setEditingItem({ ...editingItem, linked_product_ids: newIds });
                                                        }}
                                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                                            isSelected
                                                                ? 'bg-turquoise-500/20 text-turquoise-300 border-turquoise-500'
                                                                : 'bg-navy-900 text-gray-400 border-gray-800 hover:text-white'
                                                        }`}
                                                    >
                                                        <Tag className="w-3 h-3" /> {p.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1">Short Card Summary</label>
                                        <textarea
                                            value={editingItem.summary}
                                            onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                                            rows={2}
                                            placeholder="Overview displayed on preview cards..."
                                            className="w-full bg-navy-950 border border-gray-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-turquoise-500"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-xs font-semibold text-gray-300">Markdown Content Body</label>
                                            <span className="text-[10px] text-turquoise-400 font-mono">Supports GitHub Markdown & Tables</span>
                                        </div>
                                        <textarea
                                            value={editingItem.content_markdown}
                                            onChange={(e) => setEditingItem({ ...editingItem, content_markdown: e.target.value })}
                                            rows={12}
                                            className="w-full bg-navy-950 border border-gray-700 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-turquoise-500 leading-relaxed"
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Live Preview Pane */
                                <div className="space-y-4">
                                    <div className="p-4 bg-navy-950 rounded-xl border border-white/10 flex items-center justify-between">
                                        <div>
                                            <span className="text-xs font-mono text-turquoise-400">{editingItem.date || 'No Date'}</span>
                                            <h2 className="text-2xl font-bold text-white mt-1">{editingItem.title || 'Untitled Document'}</h2>
                                            {editingItem.company_or_entity && (
                                                <p className="text-xs text-gray-400 mt-1">{editingItem.company_or_entity} ({editingItem.type})</p>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                            editingItem.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                        }`}>
                                            {editingItem.status}
                                        </span>
                                    </div>

                                    <div className="bg-navy-950 p-6 rounded-xl border border-white/10 text-xs sm:text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                                        {editingItem.content_markdown || 'No content written yet.'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-white/10 bg-navy-950 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-gray-300 rounded-xl text-xs font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSaveItem(editingItem)}
                                className="px-6 py-2 bg-turquoise-500 hover:bg-turquoise-400 text-navy-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-turquoise-500/20"
                            >
                                <Save className="w-4 h-4" /> Save & Publish Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDataRoomManager;
