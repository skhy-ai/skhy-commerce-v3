import React, { useState, useEffect } from 'react';
import { Product, PricingTier, UsageRate } from '../../types/partner';
import { PRODUCT_CATEGORIES, PRODUCT_TYPES, PRICING_MODELS, COUNTRY_OPTIONS } from '../../data/partnerData';
import { Plus, Trash2 } from 'lucide-react';

interface ProductFormProps {
    initialData?: Partial<Product> & { pricing_tiers?: Partial<PricingTier>[], usage_rates?: Partial<UsageRate>[] };
    onSave?: (product: Partial<Product> & { pricing_tiers?: Partial<PricingTier>[], usage_rates?: Partial<UsageRate>[] }) => void;
    onChange?: (product: Partial<Product> & { pricing_tiers?: Partial<PricingTier>[], usage_rates?: Partial<UsageRate>[] }) => void;
    onCancel?: () => void;
    hideSubmit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    onSave,
    onChange,
    onCancel,
    hideSubmit = false
}) => {
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        base_price: 0,
        type: 'hardware',
        category: '',
        pricing_model: 'flat',
        unit: 'each',
        currency: 'USD',
        tax_exempt: true,
        country_of_origin: 'CN',
        ...initialData
    });

    const [pricingTiers, setPricingTiers] = useState<Partial<PricingTier>[]>(initialData?.pricing_tiers || []);
    const [usageRates, setUsageRates] = useState<Partial<UsageRate>[]>(initialData?.usage_rates || []);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
            if (initialData.pricing_tiers) setPricingTiers(initialData.pricing_tiers);
            if (initialData.usage_rates) setUsageRates(initialData.usage_rates);
        }
    }, [initialData]);

    const notifyChange = (newData: Partial<Product>, newTiers: Partial<PricingTier>[], newRates: Partial<UsageRate>[]) => {
        if (onChange) {
            onChange({
                ...newData,
                pricing_tiers: newTiers,
                usage_rates: newRates
            });
        }
    };

    const handleFieldChange = (field: keyof Product, value: any) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        notifyChange(newData, pricingTiers, usageRates);
    };

    const handleTierChange = (index: number, field: keyof PricingTier, value: any) => {
        const newTiers = [...pricingTiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        setPricingTiers(newTiers);
        notifyChange(formData, newTiers, usageRates);
    };

    const addPricingTier = () => {
        const newTiers = [...pricingTiers, { min_units: 1, price: 0 }];
        setPricingTiers(newTiers);
        notifyChange(formData, newTiers, usageRates);
    };

    const removePricingTier = (indexToRemove: number) => {
        const newTiers = pricingTiers.filter((_, index) => index !== indexToRemove);
        setPricingTiers(newTiers);
        notifyChange(formData, newTiers, usageRates);
    };

    const handleRateChange = (index: number, field: keyof UsageRate, value: any) => {
        const newRates = [...usageRates];
        newRates[index] = { ...newRates[index], [field]: value };
        setUsageRates(newRates);
        notifyChange(formData, pricingTiers, newRates);
    };

    const addUsageRate = () => {
        const newRates = [...usageRates, { metric: '', rate: 0 }];
        setUsageRates(newRates);
        notifyChange(formData, pricingTiers, newRates);
    };

    const removeUsageRate = (indexToRemove: number) => {
        const newRates = usageRates.filter((_, index) => index !== indexToRemove);
        setUsageRates(newRates);
        notifyChange(formData, pricingTiers, newRates);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSave) {
            onSave({
                ...formData,
                pricing_tiers: pricingTiers,
                usage_rates: usageRates
            });
        }
    };

    // Helper to determine if we should show certain sections
    const showBasePrice = formData.pricing_model === 'flat' || formData.pricing_model === 'package';
    const showTiers = formData.pricing_model === 'tiered';
    const showRates = formData.pricing_model === 'usage';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <select
                        value={formData.category}
                        onChange={(e) => handleFieldChange('category', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                        <option value="">Select Category</option>
                        {PRODUCT_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Inventory & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">SKU</label>
                    <input
                        type="text"
                        value={formData.sku || ''}
                        onChange={(e) => handleFieldChange('sku', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Stock Quantity</label>
                    <input
                        type="number"
                        value={formData.stock_quantity || 0}
                        onChange={(e) => handleFieldChange('stock_quantity', parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.weight_kg || 0}
                        onChange={(e) => handleFieldChange('weight_kg', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Dimensions (LxWxH cm)</label>
                    <input
                        type="text"
                        value={formData.dimensions || ''}
                        onChange={(e) => handleFieldChange('dimensions', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        placeholder="e.g. 10x10x5"
                    />
                </div>
                {/* Placeholder for future specific shipping options */}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                    <select
                        value={formData.type}
                        onChange={(e) => handleFieldChange('type', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                        {PRODUCT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Country of Origin</label>
                    <select
                        value={formData.country_of_origin}
                        onChange={(e) => handleFieldChange('country_of_origin', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                        <option value="">Select Country</option>
                        {COUNTRY_OPTIONS.map(country => (
                            <option key={country.value} value={country.value}>{country.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Pricing Model</label>
                    <select
                        value={formData.pricing_model}
                        onChange={(e) => handleFieldChange('pricing_model', e.target.value as any)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                        {PRICING_MODELS.map(model => (
                            <option key={model.value} value={model.value}>{model.label}</option>
                        ))}
                    </select>
                </div>

                {showBasePrice && (
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Base Price</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.base_price || 0}
                            onChange={(e) => handleFieldChange('base_price', parseFloat(e.target.value))}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            required
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Unit</label>
                    <input
                        type="text"
                        value={formData.unit || ''}
                        onChange={(e) => handleFieldChange('unit', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        placeholder="e.g., each, hour"
                    />
                </div>
                <div className="flex items-center mt-6">
                    <input
                        type="checkbox"
                        checked={formData.tax_exempt || false}
                        onChange={(e) => handleFieldChange('tax_exempt', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-400">Tax Exempt</label>
                </div>
            </div>

            {/* Pricing Tiers */}
            {showTiers && (
                <div className="space-y-2 border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-white">Pricing Tiers</h4>
                        <button type="button" onClick={addPricingTier} className="text-blue-400 text-xs hover:underline flex items-center gap-1">
                            <Plus size={14} /> Add Tier
                        </button>
                    </div>
                    {pricingTiers.map((tier, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-center">
                            <input type="number" placeholder="Min" value={tier.min_units || ''} onChange={(e) => handleTierChange(index, 'min_units', parseInt(e.target.value) || 0)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                            <input type="number" placeholder="Max (optional)" value={tier.max_units || ''} onChange={(e) => handleTierChange(index, 'max_units', parseInt(e.target.value) || undefined)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                            <input type="number" placeholder="Price" value={tier.price || ''} onChange={(e) => handleTierChange(index, 'price', parseFloat(e.target.value) || 0)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                            <button type="button" onClick={() => removePricingTier(index)} className="text-red-400 hover:text-red-500">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Usage Rates */}
            {showRates && (
                <div className="space-y-2 border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-white">Usage Rates</h4>
                        <button type="button" onClick={addUsageRate} className="text-blue-400 text-xs hover:underline flex items-center gap-1">
                            <Plus size={14} /> Add Rate
                        </button>
                    </div>
                    {usageRates.map((rate, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 items-center">
                            <input type="text" placeholder="Metric" value={rate.metric || ''} onChange={(e) => handleRateChange(index, 'metric', e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                            <input type="number" placeholder="Rate" value={rate.rate || ''} onChange={(e) => handleRateChange(index, 'rate', parseFloat(e.target.value) || 0)} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm" />
                            <button type="button" onClick={() => removeUsageRate(index)} className="text-red-400 hover:text-red-500">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {!hideSubmit && (onCancel || onSave) && (
                <div className="flex justify-end gap-3 mt-6">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-400 hover:text-white transition"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </form>
    );
};
