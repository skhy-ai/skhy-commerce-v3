import React, { useState, useEffect } from 'react';
import { Building2, Globe, Mail, Save, AlertTriangle, Trash2 } from 'lucide-react';
import { ImageUploader } from '../ImageUploader';
import { User } from '../../types/partner';
import { supabase } from '../../lib/supabase';
import { CountryFlag } from '../common/CountryFlag';

interface ProfileFormProps {
    user: User | null;
    initialData?: Partial<User>;
    onSave?: (data: Partial<User>) => Promise<void>;
    onChange?: (data: Partial<User>) => void;
    loading?: boolean;
    showEmail?: boolean;
    showDelete?: boolean;
    onDelete?: () => void;
    requireBusinessDoc?: boolean;
    hideSubmit?: boolean;
    // Pass the Supabase auth user id separately for folder paths
    authUserId?: string;
}

const COUNTRIES = [
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Australia', code: 'AU' },
    { name: 'India', code: 'IN' },
    { name: 'China', code: 'CN' },
    { name: 'Russia', code: 'RU' },
    { name: 'North Korea', code: 'KP' },
    { name: 'Iran', code: 'IR' },
    { name: 'Pakistan', code: 'PK' },
    { name: 'Yemen', code: 'YE' },
    { name: 'Ukraine', code: 'UA' },
    { name: 'Syria', code: 'SY' },
    { name: 'Cuba', code: 'CU' },
    { name: 'Venezuela', code: 'VE' },
];

export const ProfileForm: React.FC<ProfileFormProps> = ({
    user,
    initialData,
    onSave,
    onChange,
    loading = false,
    showEmail = true,
    showDelete = false,
    onDelete,
    requireBusinessDoc = false,
    hideSubmit = false,
    authUserId,
}) => {
    const [formData, setFormData] = useState<Partial<User>>({
        company_name: '',
        seller_type: 'manufacturer',
        logo_url: '',
        default_currency: 'USD',
        restricted_countries: ['Pakistan', 'Ukraine', 'Yemen', 'North Korea', 'Iran'],
        business_doc_url: '',
        ...initialData
    });

    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [countrySearchTerm, setCountrySearchTerm] = useState('');

    const [availableReturnPolicies, setAvailableReturnPolicies] = useState<{ id: string, label: string }[]>([]);
    const [availableShippingPolicies, setAvailableShippingPolicies] = useState<{ id: string, label: string }[]>([]);

    useEffect(() => {
        const fetchPolicies = async () => {
            const { data } = await supabase.from('site_config').select('content').eq('section', 'partner_policies_config').maybeSingle();
            if (data?.content) {
                setAvailableReturnPolicies(data.content.returnPolicies?.filter((p: any) => p.enabled) || []);
                setAvailableShippingPolicies(data.content.shippingPolicies?.filter((p: any) => p.enabled) || []);
            } else {
                setAvailableReturnPolicies([
                    { id: 'return_14', label: '14 Days Return' },
                    { id: 'return_30', label: '30 Days Return' },
                    { id: 'return_no', label: 'No Returns Accepted' },
                    { id: 'return_case', label: 'Case-by-Case Basis' }
                ]);
                setAvailableShippingPolicies([
                    { id: 'ship_free_ww', label: 'Free Standard Shipping Worldwide' },
                    { id: 'ship_free_dom', label: 'Free Standard Shipping (Domestic)' },
                    { id: 'ship_flat', label: 'Flat Rate Shipping' },
                    { id: 'ship_calc', label: 'Calculated at Checkout' }
                ]);
            }
        };
        fetchPolicies();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
            if (initialData.user_metadata) {
                if (initialData.user_metadata.website) {
                    setWebsite(initialData.user_metadata.website);
                }
                if (initialData.user_metadata.description) {
                    setDescription(initialData.user_metadata.description);
                }
            }
        }
    }, [initialData]);

    // Folder for storage uploads — use authUserId (Supabase auth uid) for path isolation
    const uploadFolder = authUserId || user?.id;

    const handleChange = (newData: Partial<User>) => {
        setFormData(newData);
        if (onChange) {
            onChange({
                ...newData,
                ['website' as any]: website,
                ['description' as any]: description
            });
        }
    };

    const handleMetadataChange = (field: 'website' | 'description', value: string) => {
        if (field === 'website') setWebsite(value);
        if (field === 'description') setDescription(value);

        if (onChange) {
            onChange({
                ...formData,
                ['website' as any]: field === 'website' ? value : website,
                ['description' as any]: field === 'description' ? value : description
            });
        }
    };

    const handleSaveClick = async () => {
        if (onSave) {
            await onSave({
                ...formData,
                ['website' as any]: website,
                ['description' as any]: description
            });
        }
    };

    // Use div as wrapper to avoid form-submission conflicts when embedded inside
    // a parent step wizard (hideSubmit=true). Only wrap in form when standalone.
    const Wrapper = hideSubmit ? 'div' : 'form';
    const wrapperProps = hideSubmit
        ? {}
        : {
            onSubmit: async (e: React.FormEvent) => {
                e.preventDefault();
                await handleSaveClick();
            }
          };

    return (
        <Wrapper {...(wrapperProps as any)} className="space-y-6">
            {/* Business Document Upload (Only if required/requested) */}
            {requireBusinessDoc && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-xl mb-6">
                    <h3 className="text-white font-semibold mb-2">Business Verification</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Upload your business formation document (Certificate of Incorporation, Business License, etc.).
                        Accepted: JPG, PNG, PDF. Max 5MB. This is optional now but required for approval.
                    </p>
                    <ImageUploader
                        bucket="business-docs"
                        folder={uploadFolder}
                        currentImage={formData.business_doc_url}
                        currentPath={formData.business_doc_url
                            ? (() => {
                                try {
                                    const url = new URL(formData.business_doc_url);
                                    // Extract path after /object/public/business-docs/ or /object/sign/business-docs/
                                    const parts = url.pathname.split('/business-docs/');
                                    return parts.length > 1 ? parts[1].split('?')[0] : '';
                                } catch { return ''; }
                              })()
                            : undefined
                        }
                        onUploadComplete={(url) => {
                            handleChange({ ...formData, business_doc_url: url });
                        }}
                        onDelete={() => handleChange({ ...formData, business_doc_url: '' })}
                        label="Business Document (Image or PDF)"
                        maxSizeMB={5}
                        acceptedTypes="image/*,application/pdf"
                        allowedMimeTypes={['image/*', 'application/pdf']}
                    />
                </div>
            )}

            {/* Company Logo */}
            <ImageUploader
                bucket="company-logos"
                folder={uploadFolder}
                currentImage={formData.logo_url || undefined}
                currentPath={formData.logo_url
                    ? (() => {
                        try {
                            const url = new URL(formData.logo_url);
                            const parts = url.pathname.split('/company-logos/');
                            return parts.length > 1 ? parts[1].split('?')[0] : '';
                        } catch { return ''; }
                      })()
                    : undefined
                }
                onUploadComplete={(url) => {
                    handleChange({ ...formData, logo_url: url });
                }}
                onDelete={() => handleChange({ ...formData, logo_url: '' })}
                label="Company Logo"
                maxSizeMB={2}
                acceptedTypes="image/*"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Name *
                    </label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={formData.company_name}
                            onChange={(e) => handleChange({ ...formData, company_name: e.target.value })}
                            required={!hideSubmit}
                            className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Your Company Inc."
                        />
                    </div>
                </div>

                {/* Seller Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Seller Type *
                    </label>
                    <select
                        value={formData.seller_type || 'manufacturer'}
                        onChange={(e) => handleChange({ ...formData, seller_type: e.target.value as any })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="manufacturer">Manufacturer</option>
                        <option value="distributor">Distributor</option>
                        <option value="service_provider">Service Provider</option>
                        <option value="reseller">Reseller</option>
                    </select>
                </div>

                {/* Default Currency */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Default Currency *
                    </label>
                    <select
                        value={formData.default_currency || 'USD'}
                        onChange={(e) => handleChange({ ...formData, default_currency: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="AUD">AUD ($)</option>
                        <option value="CAD">CAD ($)</option>
                    </select>
                </div>

                {/* Website */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Website
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="url"
                            value={website}
                            onChange={(e) => handleMetadataChange('website', e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://yourcompany.com"
                        />
                    </div>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => handleMetadataChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell buyers about your company..."
                />
            </div>

            {/* Policies Section */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Save className="w-5 h-5 text-blue-400" />
                    Store Policies
                </h3>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Return Policy</label>
                        <select
                            value={formData.policies?.return_policy || ''}
                            onChange={(e) => handleChange({
                                ...formData,
                                policies: { ...formData.policies, return_policy: e.target.value }
                            })}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Select a return policy</option>
                            {formData.policies?.return_policy && !availableReturnPolicies.find(p => p.label === formData.policies?.return_policy) && (
                                <option value={formData.policies.return_policy} disabled>{formData.policies.return_policy} (Legacy Option)</option>
                            )}
                            {availableReturnPolicies.map(p => (
                                <option key={p.id} value={p.label}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Policy</label>
                        <select
                            value={formData.policies?.shipping_policy || ''}
                            onChange={(e) => handleChange({
                                ...formData,
                                policies: { ...formData.policies, shipping_policy: e.target.value }
                            })}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Select a shipping policy</option>
                            {formData.policies?.shipping_policy && !availableShippingPolicies.find(p => p.label === formData.policies?.shipping_policy) && (
                                <option value={formData.policies.shipping_policy} disabled>{formData.policies.shipping_policy} (Legacy Option)</option>
                            )}
                            {availableShippingPolicies.map(p => (
                                <option key={p.id} value={p.label}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Restricted Countries */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-red-400" />
                    Restricted Countries
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                    Select countries where you do NOT want to ship your products. Buyers from these countries will be blocked.
                </p>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-300">Restricted Countries (Select multiple)</label>
                        <input
                            type="text"
                            placeholder="Search countries..."
                            value={countrySearchTerm}
                            onChange={(e) => setCountrySearchTerm(e.target.value)}
                            className="w-1/2 px-3 py-1.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-700 rounded-lg bg-gray-900/50">
                        {COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearchTerm.toLowerCase())).map(country => (
                            <label key={country.name} className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.restricted_countries?.includes(country.name)}
                                    onChange={(e) => {
                                        const current = formData.restricted_countries || [];
                                        let updated;
                                        if (e.target.checked) {
                                            updated = [...current, country.name];
                                        } else {
                                            updated = current.filter(c => c !== country.name);
                                        }
                                        handleChange({
                                            ...formData,
                                            restricted_countries: updated
                                        });
                                    }}
                                    className="rounded border-gray-700 bg-gray-900 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="mr-2 flex items-center">
                                    <CountryFlag countryCode={country.code} size="sm" />
                                </span>
                                <span className="text-gray-300 text-sm">{country.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Return Address Section */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    Return Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Address Line 1</label>
                        <input
                            type="text"
                            value={formData.return_address?.line1 || ''}
                            onChange={(e) => handleChange({
                                ...formData,
                                return_address: { ...formData.return_address!, line1: e.target.value }
                            })}
                            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                        <input
                            type="text"
                            value={formData.return_address?.city || ''}
                            onChange={(e) => handleChange({
                                ...formData,
                                return_address: { ...formData.return_address!, city: e.target.value }
                            })}
                            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">State/Province</label>
                        <input
                            type="text"
                            value={formData.return_address?.state || ''}
                            onChange={(e) => handleChange({
                                ...formData,
                                return_address: { ...formData.return_address!, state: e.target.value }
                            })}
                            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Postal Code</label>
                        <input
                            type="text"
                            value={formData.return_address?.postal_code || ''}
                            onChange={(e) => handleChange({
                                ...formData,
                                return_address: { ...formData.return_address!, postal_code: e.target.value }
                            })}
                            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                        <input
                            type="text"
                            value={formData.return_address?.country || ''}
                            onChange={(e) => handleChange({
                                ...formData,
                                return_address: { ...formData.return_address!, country: e.target.value }
                            })}
                            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Email (Read-only) */}
            {showEmail && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
            )}

            {/* Submit Button (only when not embedded in a wizard) */}
            {!hideSubmit && (
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            )}

            {/* Delete Account Section */}
            {showDelete && onDelete && (
                <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-xl p-8 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
                            <p className="text-gray-400 mb-6">
                                Permanently delete your account and all associated data. This action cannot be undone.
                                Any active subscriptions will be cancelled and you will lose access to all your products and orders.
                            </p>
                            <button
                                type="button"
                                onClick={onDelete}
                                className="flex items-center gap-2 px-6 py-3 bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50 rounded-lg font-semibold transition"
                                disabled={loading}
                            >
                                <Trash2 className="w-5 h-5" />
                                {loading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Wrapper>
    );
};
