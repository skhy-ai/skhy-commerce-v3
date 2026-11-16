import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Building2, Briefcase, Plus, Trash2 } from 'lucide-react';

interface User {
    user_id: string;
    email: string;
    full_name: string;
    company_name: string;
    user_type: string;
}

interface SalesAgent {
    id: string;
    user_id: string;
    rating: number;
    default_commission_rate: number;
    user?: User; // Joined
}

interface Agreement {
    id: string;
    agent_id: string;
    partner_id: string;
    commission_rate: number;
    status: string;
    partner?: User; // Joined
}

export const SalesAgentsManagement: React.FC = () => {
    const [agents, setAgents] = useState<SalesAgent[]>([]);
    const [partners, setPartners] = useState<User[]>([]);
    const [potentialAgents, setPotentialAgents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedAgent, setSelectedAgent] = useState<SalesAgent | null>(null);
    const [agreements, setAgreements] = useState<Agreement[]>([]);

    // Form states
    const [newAgentUserId, setNewAgentUserId] = useState('');
    const [newAgentRate, setNewAgentRate] = useState(3.8);
    const [newAgentRating, setNewAgentRating] = useState(1);

    const [newAgreementPartnerId, setNewAgreementPartnerId] = useState('');
    const [newAgreementRate, setNewAgreementRate] = useState(3.8);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch users to use for selection (both internal users and partners)
            const { data: allUsers, error: usersError } = await supabase
                .from('users')
                .select('user_id, email, full_name, company_name, user_type');

            if (usersError) throw usersError;

            const allPartnersList = allUsers?.filter(u => u.user_type === 'partner') || [];
            setPartners(allPartnersList);

            // Fetch agents
            const { data: agentsData, error: agentsError } = await supabase
                .from('sales_agents')
                .select('*');

            if (agentsError) throw agentsError;

            // Map user data to agents
            const enrichedAgents = (agentsData || []).map(agent => ({
                ...agent,
                user: allUsers?.find(u => u.user_id === agent.user_id)
            }));

            setAgents(enrichedAgents);

            // Determine potential agents (users who aren't already agents)
            const agentUserIds = new Set(agentsData?.map(a => a.user_id));
            const availableUsers = allUsers?.filter(u => !agentUserIds.has(u.user_id)) || [];
            setPotentialAgents(availableUsers);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAgreements = async (agentId: string) => {
        try {
            const { data, error } = await supabase
                .from('agent_partner_agreements')
                .select('*')
                .eq('agent_id', agentId);

            if (error) throw error;

            const enriched = (data || []).map(agreement => ({
                ...agreement,
                partner: partners.find(p => p.user_id === agreement.partner_id)
            }));

            setAgreements(enriched);
        } catch (error) {
            console.error('Error loading agreements:', error);
        }
    };

    const handleSelectAgent = (agent: SalesAgent) => {
        setSelectedAgent(agent);
        loadAgreements(agent.id);
        // Reset agreement form
        setNewAgreementPartnerId('');
        setNewAgreementRate(agent.default_commission_rate);
    };

    const handleAddAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAgentUserId) return;

        try {
            const { error } = await supabase.from('sales_agents').insert({
                user_id: newAgentUserId,
                rating: newAgentRating,
                default_commission_rate: newAgentRate
            });

            if (error) throw error;
            
            // Reset and reload
            setNewAgentUserId('');
            setNewAgentRate(3.8);
            setNewAgentRating(1);
            loadData();
        } catch (error) {
            console.error('Error adding agent:', error);
            alert('Failed to add sales agent.');
        }
    };



    const handleDeleteAgent = async (agentId: string) => {
        if (!confirm('Are you sure you want to remove this sales agent? Agreements will be deleted.')) return;
        try {
            const { error } = await supabase.from('sales_agents').delete().eq('id', agentId);
            if (error) throw error;
            if (selectedAgent?.id === agentId) setSelectedAgent(null);
            loadData();
        } catch (error) {
            console.error('Error deleting agent:', error);
        }
    };

    const handleAddAgreement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgent || !newAgreementPartnerId) return;

        try {
            const { error } = await supabase.from('agent_partner_agreements').insert({
                agent_id: selectedAgent.id,
                partner_id: newAgreementPartnerId,
                commission_rate: newAgreementRate
            });

            if (error) throw error;
            
            setNewAgreementPartnerId('');
            loadAgreements(selectedAgent.id);
        } catch (error) {
            console.error('Error adding agreement:', error);
            alert('Failed to add agreement. May already exist.');
        }
    };

    const handleDeleteAgreement = async (agreementId: string) => {
        try {
            const { error } = await supabase.from('agent_partner_agreements').delete().eq('id', agreementId);
            if (error) throw error;
            if (selectedAgent) loadAgreements(selectedAgent.id);
        } catch (error) {
            console.error('Error deleting agreement:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Sales Agents Management</h2>
                <p className="text-gray-400 mt-1">Manage internal sales agents and partner-specific commission agreements.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Agents List */}
                <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-xl font-bold text-white mb-4">Add Sales Agent</h3>
                        <form onSubmit={handleAddAgent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Select User</label>
                                <select 
                                    value={newAgentUserId} 
                                    onChange={(e) => setNewAgentUserId(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5"
                                >
                                    <option value="">-- Select a User --</option>
                                    {potentialAgents.map(u => (
                                        <option key={u.user_id} value={u.user_id}>
                                            {u.full_name || u.company_name || u.email} ({u.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Commission (%)</label>
                                    <input 
                                        type="number" step="0.01" min="0" max="100"
                                        value={newAgentRate} onChange={(e) => setNewAgentRate(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Rating (1-5)</label>
                                    <input 
                                        type="number" min="1" max="5"
                                        value={newAgentRating} onChange={(e) => setNewAgentRating(parseInt(e.target.value) || 1)}
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-turquoise-500 hover:bg-turquoise-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition">
                                <Plus className="w-5 h-5" /> Add Agent
                            </button>
                        </form>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Active Agents</h3>
                        {agents.length === 0 ? (
                            <p className="text-gray-400">No sales agents configured.</p>
                        ) : (
                            agents.map(agent => (
                                <div 
                                    key={agent.id} 
                                    className={`bg-gray-800 rounded-xl p-4 border transition cursor-pointer ${selectedAgent?.id === agent.id ? 'border-turquoise-500 bg-gray-800/80' : 'border-gray-700 hover:border-gray-500'}`}
                                    onClick={() => handleSelectAgent(agent)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                                <Briefcase className="w-5 h-5 text-turquoise-400" />
                                                {agent.user?.full_name || agent.user?.email || 'Unknown User'}
                                            </h4>
                                            <p className="text-gray-400 text-sm mt-1">{agent.user?.email}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteAgent(agent.id); }}
                                            className="text-red-400 hover:text-red-300 p-1"
                                            title="Remove Agent"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-700 flex gap-6 text-sm">
                                        <div>
                                            <span className="text-gray-400">Default Rate: </span>
                                            <span className="text-white font-mono">{agent.default_commission_rate}%</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Rating: </span>
                                            <span className="text-yellow-400">{'★'.repeat(agent.rating)}{'☆'.repeat(5 - agent.rating)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Agreements */}
                <div>
                    {selectedAgent ? (
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                            <h3 className="text-xl font-bold text-white mb-4">
                                Agreements for {selectedAgent.user?.full_name || selectedAgent.user?.email}
                            </h3>

                            <form onSubmit={handleAddAgreement} className="mb-6 space-y-4 p-4 border border-turquoise-500/30 bg-turquoise-500/5 rounded-lg">
                                <h4 className="text-white font-medium">New Partner Agreement</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Partner</label>
                                    <select 
                                        value={newAgreementPartnerId} 
                                        onChange={(e) => setNewAgreementPartnerId(e.target.value)}
                                        required
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5"
                                    >
                                        <option value="">-- Select a Partner --</option>
                                        {partners.map(p => (
                                            <option key={p.user_id} value={p.user_id}>
                                                {p.company_name || p.full_name || p.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-4 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Commission Rate (%)</label>
                                        <input 
                                            type="number" step="0.01" min="0" max="100"
                                            value={newAgreementRate} onChange={(e) => setNewAgreementRate(parseFloat(e.target.value) || 0)}
                                            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5"
                                        />
                                    </div>
                                    <button type="submit" className="bg-turquoise-500 hover:bg-turquoise-600 text-gray-900 font-bold py-2.5 px-6 rounded-lg transition h-[46px]">
                                        Add
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-3">
                                {agreements.length === 0 ? (
                                    <p className="text-gray-400 text-center py-4 bg-gray-900/50 rounded-lg">No specific agreements found.</p>
                                ) : (
                                    agreements.map(agreement => (
                                        <div key={agreement.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Building2 className="w-5 h-5 text-gray-500" />
                                                <div>
                                                    <p className="text-white font-medium">{agreement.partner?.company_name || agreement.partner?.email}</p>
                                                    <p className="text-sm text-gray-400">Rate: <span className="text-turquoise-400 font-mono">{agreement.commission_rate}%</span></p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteAgreement(agreement.id)}
                                                className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition"
                                                title="Delete Agreement"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-800/20 rounded-xl p-12 border border-gray-700/50 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                            <Briefcase className="w-16 h-16 text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400 mb-2">No Agent Selected</h3>
                            <p className="text-gray-500">Select an agent from the left to view and manage their partner-specific commission agreements.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
