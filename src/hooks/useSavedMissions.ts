import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CartItem } from '../types/checkout';
import { saveWaitlistLead } from '../services/leadStorageService';

export interface SavedMission {
    id: string;
    name: string;
    items: CartItem[];
    created_at: string;
}

export function useSavedMissions() {
    const { user } = useAuth();
    const [savedMissions, setSavedMissions] = useState<SavedMission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMissions = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('saved_missions')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && !error) {
                setSavedMissions(data);
            }
        } catch (e) {
            console.error("Error fetching missions", e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMissions();
    }, [fetchMissions]);

    const saveMission = async (name: string, items: CartItem[]) => {
        if (!user) return { success: false, error: 'User not logged in' };

        const tier = user.subscription_tier || 'free';
        
        // Logical Gate
        if (tier === 'free' && user.user_type !== 'admin' && savedMissions.length >= 1) {
            return { success: false, requiresUpgrade: true };
        }

        const { data, error } = await supabase
            .from('saved_missions')
            .insert({
                user_id: user.id,
                name,
                items
            })
            .select()
            .single();

        if (error) {
            return { success: false, error };
        }

        setSavedMissions(prev => [data, ...prev]);
        return { success: true, data };
    };

    const deleteMission = async (id: string) => {
        if (!user) return;
        const { error } = await supabase
            .from('saved_missions')
            .delete()
            .eq('id', id);

        if (!error) {
            setSavedMissions(prev => prev.filter(m => m.id !== id));
        }
        return { error };
    };

    const submitInterest = async (email: string) => {
        await saveWaitlistLead({
            email,
            intent: 'build_drone',
            subCategory: 'pro_upgrade',
            productName: 'Mission Architect Pro',
            source: 'simulator_upgrade_modal',
            message: 'User requested Mission Architect PRO subscription upgrade.'
        });

        const { error } = await supabase
            .from('pro_subscriptions_interest')
            .insert({
                user_id: user?.id,
                email
            });
            
        return { success: true, error };
    };

    return {
        savedMissions,
        loading,
        fetchMissions,
        saveMission,
        deleteMission,
        submitInterest
    };
}
