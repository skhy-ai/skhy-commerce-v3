import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, Briefcase, Tag, Building2, DollarSign, Truck, Package, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { OptimizedImage } from '../common/OptimizedImage';
import type { MarketplaceProduct } from './ProductCard';
import { getFlagEmoji, getCountryName } from '../../utils/countryData';
import { CountryFlag } from '../common/CountryFlag';

interface MarketplaceProductModalProps {
    product: MarketplaceProduct | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: MarketplaceProduct) => void;
    formatPrice: (product: MarketplaceProduct) => string;
}

const MarketplaceProductModal: React.FC<MarketplaceProductModalProps> = ({
    product, isOpen, onClose, onAddToCart, formatPrice
}) => {
    const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCurrentAssetIndex(0);
            setIsZoomed(false);
        }
        else document.body.style.overflow = 'unset';
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !product) return null;

    const filteredAssets = product.product_assets?.filter(a => a.asset_type === 'image' || a.asset_type === 'video') || [];
    const mediaAssets = filteredAssets.length > 0 
        ? filteredAssets 
        : [{ asset_type: 'image', file_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80&w=800' } as any];
    const currentAsset = mediaAssets[currentAssetIndex] || mediaAssets[0];
    const imageUrl = currentAsset.file_url;

    const priceLabel = formatPrice(product);
    const isSoftware = product.category?.toLowerCase() === 'software' || product.type === 'service';
    const isPreOrder = ['manet', 'acoustic', 'sensors'].some(t => product.category?.toLowerCase().includes(t)) || product.name.toLowerCase().includes('edge device');
    const hasShipping = (product.seller?.shipping_rates?.length ?? 0) > 0;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x, y });
    };

    const nextAsset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentAssetIndex((prev) => (prev + 1) % Math.max(1, mediaAssets.length));
    };

    const prevAsset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentAssetIndex((prev) => (prev - 1 + mediaAssets.length) % Math.max(1, mediaAssets.length));
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); onClose(); }} />

            {/* Modal */}
            <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Image panel */}
                <div 
                    className="md:w-2/5 flex-shrink-0 bg-slate-800 relative min-h-[220px] overflow-hidden group cursor-crosshair"
                    onMouseMove={handleMouseMove}
                    onClick={() => setIsZoomed(!isZoomed)}
                >
                    {currentAsset?.asset_type === 'video' ? (
                        <video 
                            src={imageUrl} 
                            controls 
                            autoPlay 
                            muted 
                            loop 
                            className="w-full h-full object-contain bg-black/50"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <div 
                            className={`w-full h-full transition-transform duration-200 flex items-center justify-center ${isZoomed ? 'scale-[2.5] cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
                            style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                        >
                            <OptimizedImage
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-full object-contain drop-shadow-2xl"
                            />
                        </div>
                    )}
                    
                    {!isZoomed && currentAsset?.asset_type !== 'video' && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-white/50 bg-black/40 p-3 rounded-full backdrop-blur-sm">
                            <ZoomIn className="w-8 h-8" />
                        </div>
                    )}

                    {mediaAssets.length > 1 && !isZoomed && (
                        <>
                            <button 
                                onClick={prevAsset} 
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-20"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={nextAsset} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-20"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                {mediaAssets.map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentAssetIndex ? 'bg-white' : 'bg-white/40'}`} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${product.type === 'hardware' ? 'bg-blue-900/80 text-blue-300 border border-blue-700' : 'bg-green-900/80 text-green-300 border border-green-700'}`}>
                            {product.type}
                        </span>
                        {isPreOrder && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-900/80 text-orange-300 border border-orange-700 w-fit">
                                Pre-Order
                            </span>
                        )}
                    </div>
                </div>

                {/* Content panel */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Title + Price */}
                    <div>
                        <h2 className="text-2xl font-bold text-white leading-tight">{product.name}</h2>
                        <div className="mt-2 text-3xl font-bold text-sky-400">{priceLabel}</div>
                        {isSoftware && <p className="text-xs text-slate-400 mt-1">Licensing terms apply</p>}
                    </div>

                    {/* Meta */}
                    <div className="space-y-2 text-sm">
                        {product.category && (
                            <div className="flex items-center gap-2 text-slate-300">
                                <Tag className="w-4 h-4 text-slate-500" />
                                {product.category}
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-300">
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <span className="font-medium">{product.manufacturer || product.seller?.company_name || 'Unknown'}</span>
                            
                            {/* Country of Origin Flag */}
                            {product.country_of_origin && (
                                <CountryFlag countryCode={product.country_of_origin} size="sm" />
                            )}

                            <span className="text-xs px-2 py-0.5 bg-slate-700 rounded border border-slate-600">{product.seller?.seller_type || 'Seller'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                            <DollarSign className="w-4 h-4 text-slate-500" />
                            {product.tax_exempt ? 'Tax Exempt' : 'Tax may apply'}
                        </div>
                        {hasShipping && (
                            <div className="flex items-center gap-2 text-slate-300">
                                <Truck className="w-4 h-4 text-slate-500" />
                                Shipping available
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-300">
                            <Package className="w-4 h-4 text-slate-500" />
                            {product.pricing_model ? `Pricing: ${product.pricing_model}` : 'Unit Pricing'}
                        </div>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div>
                            <h4 className="text-xs uppercase tracking-widest text-turquoise-400 font-semibold mb-2">Overview</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{product.description}</p>
                        </div>
                    )}

                    {/* Specifications */}
                    {(product.sku || product.weight_kg != null || product.dimensions || product.power_draw_w != null || product.stock_quantity != null || product.segment || product.subcategory) && (
                        <div className="mt-6 mb-2">
                            <h4 className="text-xs uppercase tracking-widest text-turquoise-400 font-semibold mb-3">Specifications</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-4">
                                {product.sku && (
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase block">SKU</span>
                                        <span className="text-sm font-medium text-slate-300">{product.sku}</span>
                                    </div>
                                )}
                                {product.weight_kg != null && (
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase block">Weight (kg)</span>
                                        <span className="text-sm font-medium text-slate-300">{product.weight_kg}</span>
                                    </div>
                                )}
                                {product.dimensions && (
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase block">Dimensions</span>
                                        <span className="text-sm font-medium text-slate-300">{product.dimensions}</span>
                                    </div>
                                )}
                                {product.power_draw_w != null && (
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase block">Power Draw (W)</span>
                                        <span className="text-sm font-medium text-slate-300">{product.power_draw_w}W</span>
                                    </div>
                                )}
                                {product.stock_quantity != null && (
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase block">Stock</span>
                                        <span className="text-sm font-medium text-slate-300">{product.stock_quantity > 0 ? `${product.stock_quantity} units` : 'Out of Stock'}</span>
                                    </div>
                                )}
                                {product.segment && (
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase block">Segment</span>
                                        <span className="text-sm font-medium text-slate-300 capitalize">{product.segment}</span>
                                    </div>
                                )}
                                {product.subcategory && (
                                    <div className="col-span-2 lg:col-span-1">
                                        <span className="text-[10px] text-slate-500 uppercase block">Subcategory</span>
                                        <span className="text-sm font-medium text-slate-300">{product.subcategory}</span>
                                    </div>
                                )}
                                {product.country_of_origin && (
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase block">Origin</span>
                                        <span className="text-sm font-medium text-slate-300">
                                            {getCountryName(product.country_of_origin)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                        <div className="mt-4 mb-4">
                            <h4 className="text-xs uppercase tracking-widest text-turquoise-400 font-semibold mb-3">Key Features</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {product.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-slate-300">
                                        <span className="inline-block w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => { onAddToCart(product); onClose(); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold transition-colors ${isPreOrder ? 'bg-orange-600 hover:bg-orange-500' : 'bg-sky-600 hover:bg-sky-500'}`}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {isPreOrder ? 'Pre-Order Now' : ((product.base_price || 0) > 0 ? 'Add to Cart' : 'Contact Sales')}
                        </button>
                        <a
                            href={product.seller?.email ? `mailto:${product.seller.email}?subject=Inquiry about ${product.name}` : '#'}
                            className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-colors font-medium text-sm border border-slate-600"
                        >
                            <Briefcase className="w-4 h-4" />
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceProductModal;
