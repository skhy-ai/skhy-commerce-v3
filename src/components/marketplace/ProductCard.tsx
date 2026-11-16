import React, { memo, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Briefcase, Tag, Building2, Truck, GitCompareArrows, FileText } from 'lucide-react';
import { OptimizedImage } from '../common/OptimizedImage';
import { Product, ProductAsset, User as UserType, ShippingRate, PricingTier, UsageRate } from '../../types/partner';
import { getFlagEmoji, getCountryName } from '../../utils/countryData';
import { CountryFlag } from '../common/CountryFlag';
import { HoverVideoPlayer } from '../common/HoverVideoPlayer';
import ExpressInterestModal from '../ExpressInterestModal';
import { getTRLStatus } from '../../data/productCatalog';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export interface MarketplaceProduct extends Product {
    seller: UserType & { shipping_rates?: ShippingRate[] };
    product_assets?: ProductAsset[];
    thirdPartyType?: 'OEM' | 'Partner';
    features?: string[];
    power_draw_w?: number;
    segment?: 'air' | 'gcs' | 'rover' | 'jamming' | 'edge-ai' | 'general';
    subcategory?: string;
    pin_layout?: string | null;
    pricing_tiers?: PricingTier[];
    usage_rates?: UsageRate[];
    specifications?: Array<{ parameter: string; value: string }>;
    shipping?: {
        weight_kg?: number | string;
        dimensions?: string;
        shipping_class?: string;
        countries?: string[];
        requires_export_license?: boolean;
        installation_required?: boolean;
    };
    inventory_quantity?: number;
    requires_shipping?: boolean;
    is_digital?: boolean;
    supplier_managed_pricing?: boolean;
}

interface ProductCardProps {
    product: MarketplaceProduct;
    onAddToCart: (product: MarketplaceProduct) => void;
    formatPrice: (product: MarketplaceProduct) => string;
    onToggleCompare?: (productId: number) => void;
    isInCompare?: boolean;
}

const extractYoutubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, formatPrice, onToggleCompare, isInCompare }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
    const [rfqSent, setRfqSent] = useState(false);
    const [rfqLoading, setRfqLoading] = useState(false);

    // Price range: display min (10% below) to max (current price)
    const priceRange = useMemo(() => {
        const price = product.base_price ?? 0;
        if (price <= 0) return null;
        const min = Math.floor(price * 0.90);
        const max = price;
        const currency = product.currency || 'USD';
        const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
        return { min: fmt(min), max: fmt(max) };
    }, [product.base_price, product.currency]);

    const handleRFQ = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) { navigate('/login?redirect=/marketplace&reason=rfq'); return; }
        setRfqLoading(true);
        try {
            const qId = `QT-${new Date().getFullYear()}-${Math.random().toString(36).toUpperCase().slice(2, 7)}`;
            await supabase.from('quotes').insert({
                quote_id: qId,
                customer_email: user.email,
                customer_name: user.user_metadata?.full_name || user.email,
                items_json: [{ name: product.name, qty: 1, unit_price: product.base_price, product_id: product.id }],
                status: 'pending',
            });
            setRfqSent(true);
        } catch (err) {
            console.error('RFQ error:', err);
        } finally {
            setRfqLoading(false);
        }
    };

    const getProductAssets = (product: MarketplaceProduct) => {
        // Find valid image asset, filtering out datasheets (.md, .pdf)
        const asset = product.product_assets?.find(a => 
            a.asset_type === 'image' || 
            (a.file_url && /\.(png|jpe?g|webp|svg|gif)$/i.test(a.file_url) && !/\.(md|pdf)$/i.test(a.file_url))
        );

        const localPath = asset?.local_url || (asset?.file_name ? `/images/marketplace/${asset.file_name}` : undefined);
        const remoteUrl = asset?.file_url;

        const isInter = product.subcategory?.toLowerCase().includes('interceptor') || product.name.toLowerCase().includes('interceptor');
        const defaultImg = isInter ? '/images/catalog/effectors/interceptor_5.png' : '/images/products/carbon_propeller.png';

        // If a local asset exists, use it as primary to avoid slow external CDN latency
        const primarySrc = localPath || remoteUrl || defaultImg;
        const fallbackSrc = (remoteUrl && remoteUrl !== localPath) ? remoteUrl : defaultImg;

        return {
            src: primarySrc,
            fallback: fallbackSrc
        };
    };

    const isPreOrder = useMemo(() => {
        const cat = product.category?.toLowerCase() || '';
        return cat.includes('manet') || cat.includes('sensors');
    }, [product]);

    const isInterceptor = useMemo(() => {
        return product.subcategory?.toLowerCase().includes('interceptor') || product.name.toLowerCase().includes('interceptor');
    }, [product]);

    const trlStatus = useMemo(() => {
        return getTRLStatus(product as any);
    }, [product]);

    const isComingSoon = !!trlStatus;

    const isSoftware = useMemo(() => {
        return product.category?.toLowerCase() === 'software' || product.type === 'service';
    }, [product]);

    const isPlatformFeeWaived = useMemo(() => {
        const seller = product.manufacturer?.toLowerCase() || product.seller?.company_name?.toLowerCase() || '';
        const isSkhy = seller.includes('skhy') && !seller.includes('partner network');
        return isSkhy || product.thirdPartyType === 'OEM';
    }, [product]);

    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isComingSoon) {
            setIsInterestModalOpen(true);
            return;
        }
        if (isSoftware) {
            const enrichedProduct = {
                ...product,
                description: (product.description || '') + '\n\n*Licensing and Deployment Cost estimated upon request.*'
            };
            onAddToCart(enrichedProduct);
        } else {
            onAddToCart(product);
        }
    };

    const handleCardClick = () => {
        window.open(`/marketplace/product/${product.id}`, '_blank');
    };

    return (
        <div 
            onClick={handleCardClick}
            className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border group flex flex-col h-full cursor-pointer ${
                isInCompare ? 'border-sky-500 ring-2 ring-sky-200' : 'border-slate-200'
            }`}
        >
            {/* Product Image / Video */}
            <div className={`relative flex-shrink-0 bg-slate-100 overflow-hidden ${isInterceptor ? 'h-64' : 'h-48'}`}>
                {product.youtube_url ? (
                    <HoverVideoPlayer 
                        videoId={extractYoutubeId(product.youtube_url)} 
                        title={product.name}
                        className={`w-full h-full rounded-none border-none shadow-none ${isInterceptor ? 'object-cover' : ''}`}
                    />
                ) : (
                    <OptimizedImage
                        src={getProductAssets(product).src}
                        fallbackSrc={getProductAssets(product).fallback}
                        alt={product.name}
                        className={`w-full h-full group-hover:scale-105 transition-transform duration-500 ${isInterceptor ? 'object-cover p-0' : 'object-contain p-2'}`}
                    />
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${product.type === 'hardware'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                        {product.type}
                    </span>
                    {trlStatus && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200 w-fit">
                            Express Interest ({trlStatus})
                        </span>
                    )}
                    {isPreOrder && !isComingSoon && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200 w-fit">
                            Out of Stock
                        </span>
                    )}
                    {isPlatformFeeWaived && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300 w-fit shadow-sm">
                            Platform Fee Waived Off
                        </span>
                    )}
                    {product.supplier_managed_pricing && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300 w-fit shadow-sm flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Verified Supplier
                        </span>
                    )}
                </div>
                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                    <span className="px-2 py-1 bg-white/90 text-slate-700 rounded-full text-xs font-medium backdrop-blur-sm border border-slate-200 shadow-sm">
                        {product.pricing_model || 'Unit'}
                    </span>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex flex-col mb-auto">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-slate-900 line-clamp-2">
                            {product.name}
                        </h3>
                        <div className="text-right ml-4 flex-shrink-0">
                            {priceRange ? (
                                <>
                                    <div className="text-base font-bold text-sky-600">
                                        {priceRange.min} – {priceRange.max}
                                    </div>
                                    <div className="text-[10px] text-emerald-600 font-medium">Best Price Negotiable</div>
                                </>
                            ) : (
                                <div className="text-lg font-bold text-sky-600">
                                    {formatPrice(product)}
                                </div>
                            )}
                            {product.unit && !isSoftware && (
                                <div className="text-xs text-slate-500">per {product.unit}</div>
                            )}
                            {isSoftware && (
                                <div className="text-xs text-slate-500">Licensing applies</div>
                            )}
                        </div>
                    </div>

                    {product.category && (
                        <div className="flex items-center mb-2">
                            <Tag className="w-4 h-4 text-slate-400 mr-2" />
                            <span className="text-sm text-slate-600">{product.category}</span>
                            {product.subcategory && (
                                <>
                                    <span className="text-slate-300 mx-2">/</span>
                                    <span className="text-sm text-slate-500">{product.subcategory}</span>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex items-center mb-3">
                        <Building2 className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                        <span className="text-sm text-slate-600 font-medium truncate">{product.manufacturer || product.seller?.company_name || 'Unknown Seller'}</span>
                        
                        {/* Country of Origin Flag */}
                        {product.country_of_origin && (
                            <div className="ml-2 flex items-center">
                                <CountryFlag countryCode={product.country_of_origin} size="sm" />
                            </div>
                        )}

                        <span className="ml-2 px-2 py-1 bg-slate-100 text-xs text-slate-500 rounded border border-slate-200 flex-shrink-0">
                            {product.seller?.seller_type || 'Seller'}
                        </span>
                    </div>

                    {product.description && (
                        <p className="text-slate-600 text-sm mb-3 line-clamp-3">
                            {product.description}
                        </p>
                    )}

                    {/* Quick Specs / Features (if available) */}
                    {(product.power_draw_w != null || product.weight_kg != null || (product.features && product.features.length > 0) || product.sku) && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {product.sku && (
                                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                        SKU: {product.sku}
                                    </span>
                                )}
                                {product.power_draw_w != null && (
                                    <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100">
                                        Power: {product.power_draw_w}W
                                    </span>
                                )}
                                {product.weight_kg != null && (
                                    <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                        Weight: {product.weight_kg}kg
                                    </span>
                                )}
                                {product.segment && (
                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100 capitalize">
                                        {product.segment}
                                    </span>
                                )}
                            </div>
                            {product.features && product.features.length > 0 && (
                                <ul className="text-xs text-slate-500 space-y-1 line-clamp-2">
                                    {product.features.slice(0, 2).map((feat, i) => (
                                        <li key={i} className="flex items-start">
                                            <div className="w-1 h-1 bg-slate-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                                            <span className="truncate">{feat}</span>
                                        </li>
                                    ))}
                                    {product.features.length > 2 && (
                                        <li className="text-[10px] text-sky-600 pl-3">+{product.features.length - 2} more...</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Logistics */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 border-t border-slate-100 pt-3">
                    <div className="flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        <span>{product.pricing_model || 'Unit Pricing'}</span>
                    </div>
                    {product.seller?.shipping_rates && (product.seller.shipping_rates.length ?? 0) > 0 && (
                        <div className="flex items-center">
                            <Truck className="w-3 h-3 mr-1" />
                            <span>Shipping Available</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleAction}
                            className={`flex-1 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow ${isPreOrder ? 'bg-orange-600 hover:bg-orange-700' : 'bg-sky-600 hover:bg-sky-700'
                                }`}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {isComingSoon ? 'Express Interest' : isPreOrder ? 'Pre-order' : ((product.base_price || 0) > 0 ? 'Add to Cart' : 'Contact Sales')}
                        </button>
                        <a
                            href={product.seller?.email ? `mailto:${product.seller.email}?subject=Inquiry about ${product.name}` : '#'}
                            className={`px-3 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors flex items-center justify-center ${!product.seller?.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Contact Seller"
                        >
                            <Briefcase className="w-4 h-4" />
                        </a>
                        {onToggleCompare && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleCompare(Number(product.id)); }}
                                className={`px-3 py-2 border rounded-lg transition-colors flex items-center justify-center ${
                                    isInCompare
                                        ? 'bg-sky-100 text-sky-700 border-sky-300 hover:bg-sky-200'
                                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                                title={isInCompare ? 'Remove from Compare' : 'Add to Compare'}
                            >
                                <GitCompareArrows className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {/* Request for Quote */}
                    {(product.base_price ?? 0) > 0 && (
                        rfqSent ? (
                            <div className="text-center text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg py-1.5 px-3">
                                ✅ Quote requested — we'll contact you within 48h
                            </div>
                        ) : (
                            <button
                                onClick={handleRFQ}
                                disabled={rfqLoading}
                                className="w-full py-1.5 px-3 border border-sky-200 text-sky-700 hover:bg-sky-50 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                {rfqLoading ? 'Submitting...' : 'Request for Quote (Better Price)'}
                            </button>
                        )
                    )}
                </div>
            </div>

            <ExpressInterestModal 
                isOpen={isInterestModalOpen}
                onClose={() => setIsInterestModalOpen(false)}
                productName={product.name}
                productId={String(product.id)}
            />
        </div>
    );
};

export default memo(ProductCard);
