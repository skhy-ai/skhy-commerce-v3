import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { OptimizedImage } from '../common/OptimizedImage';
import type { MarketplaceProduct } from './ProductCard';
import { getFlagEmoji, getCountryName } from '../../utils/countryData';
import { CountryFlag } from '../common/CountryFlag';

interface CompareModalProps {
    products: MarketplaceProduct[];
    isOpen: boolean;
    onClose: () => void;
    formatPrice: (product: MarketplaceProduct) => string;
}

const CompareModal: React.FC<CompareModalProps> = ({ products, isOpen, onClose, formatPrice }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || products.length < 2) return null;

    const formatPinLayout = (layout: any) => {
        if (!layout) return null;
        if (typeof layout === 'string') return layout;
        if (typeof layout === 'object') {
            if (layout.type && layout.ports) {
                return `${layout.type.toUpperCase()}: ${Object.entries(layout.ports)
                    .map(([name, pins]) => `${name}(${Array.isArray(pins) ? pins.join(',') : pins})`)
                    .join(' | ')}`;
            }
            if (layout.pins && Array.isArray(layout.pins)) {
                return layout.pins.map((p: any) => `${p.name || p.id} (${p.type || 'data'})`).join(', ');
            }
            return JSON.stringify(layout);
        }
        return String(layout);
    };

    const parseDynamicSpecs = (product: MarketplaceProduct) => {
        const dynamicSpecs: Record<string, string> = {};
        if (product.features && Array.isArray(product.features)) {
            product.features.forEach(feature => {
                if (feature.includes(':')) {
                    const [key, ...valueParts] = feature.split(':');
                    const value = valueParts.join(':').trim();
                    if (key && value && value !== 'null' && value !== '—') {
                        dynamicSpecs[key.trim()] = value;
                    }
                }
            });
        }
        return dynamicSpecs;
    };

    // Get all unique dynamic spec keys across all products
    const allDynamicKeys = Array.from(new Set(
        products.flatMap(p => Object.keys(parseDynamicSpecs(p)))
    )).sort();

    const baseSpecs: { label: string; key: string; render?: (p: MarketplaceProduct) => React.ReactNode }[] = [
        {
            label: 'Image',
            key: 'image',
            render: (p) => {
                const img = p.product_assets?.find(a => a.asset_type === 'image');
                return (
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-100 p-2">
                        <OptimizedImage
                            src={img?.file_url || ''}
                            fallbackSrc={img?.file_name ? `/images/marketplace/${img.file_name}` : img?.local_url}
                            alt={p.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                );
            }
        },
        { label: 'Name', key: 'name', render: (p) => <span className="font-semibold text-slate-900 leading-tight">{p.name}</span> },
        { label: 'Price', key: 'price', render: (p) => <span className="font-bold text-sky-600">{formatPrice(p)}</span> },
        { label: 'Category', key: 'category', render: (p) => <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">{p.category || '—'}</span> },
        { label: 'Subcategory', key: 'subcategory', render: (p) => <span>{p.subcategory || '—'}</span> },
    ];

    const dynamicSpecs: { label: string; key: string; isDynamic: boolean; render?: (p: MarketplaceProduct) => React.ReactNode }[] = allDynamicKeys.map(key => ({
        label: key,
        key: key,
        isDynamic: true,
        render: (p) => <span>{parseDynamicSpecs(p)[key] || '—'}</span>
    }));

    const technicalSpecs: { label: string; key: string; render?: (p: MarketplaceProduct) => React.ReactNode }[] = [
        { label: 'Power Draw', key: 'power_draw_w', render: (p) => <span>{p.power_draw_w != null ? `${p.power_draw_w}W` : '—'}</span> },
        { label: 'Voltage', key: 'operating_voltage', render: (p) => <span>{p.operating_voltage || '—'}</span> },
        { label: 'Current', key: 'operating_current', render: (p) => <span>{p.operating_current || '—'}</span> },
        { label: 'Weight', key: 'weight_kg', render: (p) => <span>{p.weight_kg != null ? `${p.weight_kg} kg` : '—'}</span> },
        { label: 'Dimensions', key: 'dimensions', render: (p) => <span>{p.dimensions || '—'}</span> },
        {
            label: 'Country',
            key: 'country_of_origin',
            render: (p) => p.country_of_origin
                ? <CountryFlag countryCode={p.country_of_origin} showName={true} size="sm" />
                : <span>—</span>
        },
        { label: 'Seller', key: 'seller', render: (p) => <span>{p.manufacturer || p.seller?.company_name || '—'}</span> },
        { label: 'SKU', key: 'sku', render: (p) => <span className="font-mono text-[10px] text-slate-500">{p.sku || '—'}</span> },
        { 
            label: 'Pin Layout', 
            key: 'pin_layout', 
            render: (p) => (
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs break-words max-w-[200px]">{formatPinLayout(p.pin_layout) || '—'}</span>
                    {!p.pin_layout && (
                        <a 
                            href={`mailto:${p.seller?.email || 'sales@skhy.ai'}?subject=Request Pin Layout for ${p.name}`}
                            className="text-[10px] text-sky-600 hover:underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Request from Vendor
                        </a>
                    )}
                </div>
            )
        },
    ];

    const allSpecs = [...baseSpecs, ...dynamicSpecs, ...technicalSpecs];

    // Check if values differ across products for a given spec
    const valuesAreDifferent = (spec: any) => {
        const values = products.map(p => {
            if (spec.key === 'seller') return p.manufacturer || p.seller?.company_name || '';
            if (spec.key === 'price') return formatPrice(p);
            if (spec.isDynamic) return parseDynamicSpecs(p)[spec.key] || '';
            return (p as any)[spec.key] ?? '';
        });
        const uniqueValues = new Set(values.map(String).filter(v => v !== '' && v !== '—' && v !== 'null'));
        return uniqueValues.size > 1;
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">Product Comparison</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-auto flex-1">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-slate-100 z-10 w-32 px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                    Parameter
                                </th>
                                {products.map(p => (
                                    <th key={p.id} className="px-4 py-3 text-center text-sm font-semibold text-slate-700 border-b border-slate-200 min-w-[180px]">
                                        {p.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {allSpecs.map((spec, idx) => {
                                const isDiff = valuesAreDifferent(spec);
                                return (
                                    <tr key={spec.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 hover:bg-slate-100/50 transition-colors'}>
                                        <td className="sticky left-0 bg-inherit z-10 px-4 py-3 text-sm font-semibold text-slate-600 border-b border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                            {spec.label}
                                        </td>
                                        {products.map(p => {
                                            const value = spec.render ? spec.render(p) : (p as any)[spec.key];
                                            const isEmpty = !value || value === '—' || value === 'null';
                                            
                                            return (
                                                <td
                                                    key={p.id}
                                                    className={`px-4 py-3 text-sm text-slate-700 text-center border-b border-slate-200 border-r border-slate-100 last:border-r-0 ${
                                                        isDiff ? 'bg-sky-50/30' : ''
                                                    }`}
                                                >
                                                    <div className={isEmpty ? 'opacity-30' : ''}>
                                                        {value ?? '—'}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompareModal;
