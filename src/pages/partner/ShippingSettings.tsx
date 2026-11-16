import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { handleError, ErrorContexts } from '../../utils/ErrorHandler';
import { ErrorNotification } from '../../components/ErrorNotification';
import { ShippingRate } from '../../types/partner';
import { useAuth } from '../../contexts/AuthContext';

export const ShippingSettings: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [shippingRates, setShippingRates] = useState<Partial<ShippingRate>[]>([]);
    const [shippingPreference, setShippingPreference] = useState<'self_managed' | 'skhy_ai'>('self_managed');

    useEffect(() => {
        loadShippingData();
    }, [user]);

    const loadShippingData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Load user preference
            const { data: userData } = await supabase
                .from('users')
                .select('shipping_preference')
                .eq('user_id', user.id)
                .single();

            if (userData) {
                setShippingPreference(userData.shipping_preference || 'self_managed');
            }

            // Load rates
            const { data: rates } = await supabase
                .from('shipping_rates')
                .select('*')
                .eq('seller_id', user.id);

            if (rates) {
                setShippingRates(rates);
            }
        } catch (err) {
            setError(handleError(err, ErrorContexts.SHIPPING_LOAD));
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            // Save preference
            await supabase
                .from('users')
                .update({ shipping_preference: shippingPreference })
                .eq('user_id', user.id);

            // Save rates
            if (shippingPreference === 'self_managed') {
                for (const rate of shippingRates) {
                    // Only save valid rates
                    if (rate.rate_type && rate.base_rate) {
                        await supabase
                            .from('shipping_rates')
                            .upsert({
                                ...rate,
                                seller_id: user.id,
                                updated_at: new Date().toISOString()
                            });
                    }
                }
            }

            alert('Shipping settings saved successfully.');
        } catch (err) {
            setError(handleError(err, ErrorContexts.SHIPPING_SAVE));
        } finally {
            setLoading(false);
        }
    };

    const addRate = () => {
        setShippingRates([...shippingRates, {
            rate_type: 'flat',
            origin_country: 'US',
            destination_country: 'US',
            base_rate: 10.00,
            currency: 'USD'
        }]);
    };

    const removeRate = async (index: number) => {
        const rate = shippingRates[index];
        if (rate.id) {
            if (!confirm('Are you sure you want to delete this shipping rate?')) return;
            try {
                const { error } = await supabase
                    .from('shipping_rates')
                    .delete()
                    .eq('id', rate.id);

                if (error) throw error;
            } catch (err) {
                console.error('Error deleting rate:', err);
                return;
            }
        }
        setShippingRates(shippingRates.filter((_, i) => i !== index));
    };

    const updateRate = (index: number, field: string, value: any) => {
        const updated = [...shippingRates];
        updated[index] = { ...updated[index], [field]: value };
        setShippingRates(updated);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Truck className="w-6 h-6 text-sky-400" />
                    Shipping Configuration
                </h2>
                <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {error && <ErrorNotification error={error} onDismiss={() => setError(null)} />}

            <div className="bg-navy-800 p-6 rounded-xl border border-navy-600">
                <h3 className="text-lg font-semibold text-white mb-4">Fulfillment Method</h3>
                <div className="space-y-4">
                    <label className="flex items-center space-x-3 p-4 bg-navy-700/50 rounded-lg cursor-pointer hover:bg-navy-700 transition">
                        <input
                            type="radio"
                            name="shipping_preference"
                            value="self_managed"
                            checked={shippingPreference === 'self_managed'}
                            onChange={() => setShippingPreference('self_managed')}
                            className="w-4 h-4 text-sky-500 focus:ring-sky-500 bg-navy-900 border-navy-500"
                        />
                        <div>
                            <span className="block text-white font-medium">Self-Managed Shipping</span>
                            <span className="text-sm text-gray-400">You handle shipping logistics and configure your own rates.</span>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 p-4 bg-navy-700/50 rounded-lg cursor-pointer hover:bg-navy-700 transition">
                        <input
                            type="radio"
                            name="shipping_preference"
                            value="skhy_ai"
                            checked={shippingPreference === 'skhy_ai'}
                            onChange={() => setShippingPreference('skhy_ai')}
                            className="w-4 h-4 text-sky-500 focus:ring-sky-500 bg-navy-900 border-navy-500"
                        />
                        <div>
                            <span className="block text-white font-medium">Fulfilled by Skhy AI</span>
                            <span className="text-sm text-gray-400">Skhy AI handles logistics. You don't need to configure rates.</span>
                        </div>
                    </label>
                </div>
            </div>

            {shippingPreference === 'self_managed' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">Shipping Rates</h3>
                        <button
                            onClick={addRate}
                            className="flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Rate
                        </button>
                    </div>

                    {shippingRates.length === 0 ? (
                        <div className="text-center py-12 bg-navy-800/50 rounded-xl border border-navy-700 border-dashed">
                            <Truck className="w-12 h-12 text-navy-600 mx-auto mb-4" />
                            <p className="text-gray-400">No shipping rates configured yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {shippingRates.map((rate, index) => (
                                <div key={index} className="bg-navy-800 p-6 rounded-xl border border-navy-600 relative group">
                                    <button
                                        onClick={() => removeRate(index)}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                                            <select
                                                value={rate.rate_type || 'flat'}
                                                onChange={(e) => updateRate(index, 'rate_type', e.target.value)}
                                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                            >
                                                <option value="flat">Flat Rate</option>
                                                <option value="weight_based">Weight Based</option>
                                                <option value="tiered">Tiered</option>
                                                <option value="distance_based">Distance Based</option>
                                                <option value="dhl_calculated">DHL Automated Rate</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Base Cost ({rate.currency || 'USD'})</label>
                                            <input
                                                type="number"
                                                value={rate.base_rate || 0}
                                                onChange={(e) => updateRate(index, 'base_rate', parseFloat(e.target.value))}
                                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Courier</label>
                                            <input
                                                type="text"
                                                value={rate.courier_name || ''}
                                                onChange={(e) => updateRate(index, 'courier_name', e.target.value)}
                                                placeholder="e.g. FedEx"
                                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Origin</label>
                                            <input
                                                type="text"
                                                value={rate.origin_country || ''}
                                                onChange={(e) => updateRate(index, 'origin_country', e.target.value)}
                                                placeholder="Country Code (e.g. US)"
                                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Destination</label>
                                            <input
                                                type="text"
                                                value={rate.destination_country || ''}
                                                onChange={(e) => updateRate(index, 'destination_country', e.target.value)}
                                                placeholder="Country Code (e.g. CA)"
                                                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-sky-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
