import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Briefcase, Tag, Building2, Truck, Package, ChevronLeft, ChevronRight, ZoomIn, ArrowLeft, FileText, Settings, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { getFlagEmoji, getCountryName } from '../utils/countryData';
import { CountryFlag } from '../components/common/CountryFlag';
import { getMarketplaceProducts } from '../data/cachedMarketplace';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReviewSection from '../components/marketplace/ReviewSection.tsx';
import { MarketplaceProduct } from '../components/marketplace/ProductCard.tsx';
import ExpressInterestModal from '../components/ExpressInterestModal';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<MarketplaceProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [relatedProducts, setRelatedProducts] = useState<MarketplaceProduct[]>([]);
    const [similarProducts, setSimilarProducts] = useState<MarketplaceProduct[]>([]);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // Use cached data from chunks
                const cachedProducts = await getMarketplaceProducts();
                const data = cachedProducts.find(p => String(p.id) === id);

                if (data) {
                    setProduct(data as MarketplaceProduct);
                    document.title = `${data.name} | SKHY AI Marketplace`;
                } else {
                    // Fallback to Supabase only if not in chunks
                    console.warn(`Product ${id} not found in chunks, falling back to Supabase...`);
                    const { data: dbData, error } = await supabase
                        .from('products')
                        .select(`
                            *,
                            seller:users!products_user_id_fkey_public(
                                user_id, company_name, email, seller_type, logo_url,
                                shipping_rates(*)
                            ),
                            product_assets(*)
                        `)
                        .eq('id', parseInt(id))
                        .maybeSingle();

                    if (error) throw error;
                    if (dbData) {
                        setProduct(dbData as MarketplaceProduct);
                        document.title = `${dbData.name} | SKHY AI Marketplace`;
                    }
                }
            } catch (err) {
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!product || !id) return;
            setLoadingRelated(true);
            try {
                const cachedProducts = await getMarketplaceProducts();

                // 1. More from this Seller (strictly same user_id)
                const fromSeller = cachedProducts
                    .filter(p => p.user_id === product.user_id && String(p.id) !== id)
                    .slice(0, 8);
                setRelatedProducts(fromSeller as MarketplaceProduct[]);

                // 2. Similar Products (same category/subcategory, different seller)
                const similar = cachedProducts
                    .filter(p =>
                        p.user_id !== product.user_id &&
                        String(p.id) !== id &&
                        (p.category === product.category || p.subcategory === product.subcategory)
                    )
                    .slice(0, 8);
                setSimilarProducts(similar as MarketplaceProduct[]);

            } catch (err) {
                console.error('Error fetching related products:', err);
            } finally {
                setLoadingRelated(false);
            }
        };

        if (product) {
            fetchRelatedProducts();
        }
    }, [product, id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Package className="w-16 h-16 text-slate-300 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
                    <button onClick={() => navigate('/marketplace')} className="text-sky-600 hover:text-sky-700 font-medium">
                        ← Back to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    const filteredAssets = product.product_assets?.filter(a => a.asset_type === 'image' || a.asset_type === 'video') || [];
    const mediaAssets = filteredAssets.length > 0 ? filteredAssets : [];
    const currentAsset = mediaAssets[currentAssetIndex] || mediaAssets[0];
    const imageUrl = currentAsset?.file_url || '';

    const isSoftware = product.category?.toLowerCase() === 'software' || product.type === 'service';
    const isPreOrder = ['manet', 'sensors'].some(t => product.category?.toLowerCase().includes(t));

    let trlStatus: string | null = null;
    const cat = product.category?.toLowerCase() || '';
    const name = product.name.toLowerCase();
    if (name.includes('surveyor')) {
        trlStatus = 'TRL-7';
    } else if (cat === 'acoustic' || name.includes('edge device') || name.includes('edge ai')) {
        trlStatus = 'TRL-4';
    }
    const isComingSoon = !!trlStatus;
    const hasShipping = (product.seller?.shipping_rates?.length ?? 0) > 0;

    const formatPrice = (p: MarketplaceProduct) => {
        const price = p.base_price ?? 0;
        if (price > 0) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: p.currency || 'USD',
                maximumFractionDigits: 2,
            }).format(price);
        }
        return 'Custom Pricing';
    };

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

    const handleAddToCart = async () => {
        if (isComingSoon) {
            setIsInterestModalOpen(true);
            return;
        }
        if (product.base_price != null && product.base_price > 0) {
            await addToCart(product.id, 1, product);
        } else {
            navigate('/contact');
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x, y });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-8 mt-32 flex-1 w-full">
                {/* Breadcrumb */}
                <button
                    onClick={() => navigate('/marketplace')}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-sky-600 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Marketplace
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left: Image Gallery */}
                    <div>
                        <div
                            className="relative bg-white border border-slate-200 rounded-xl overflow-hidden aspect-square group cursor-crosshair"
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
                                    className="w-full h-full object-contain bg-black/5"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <div
                                    className={`w-full h-full transition-transform duration-200 flex items-center justify-center p-4 ${isZoomed ? 'scale-[2.5] cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
                                    style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                                >
                                    <OptimizedImage
                                        src={imageUrl}
                                        fallbackSrc={currentAsset?.file_name ? `/images/marketplace/${currentAsset.file_name}` : currentAsset?.local_url}
                                        alt={product.name}
                                        className="w-full h-full object-contain drop-shadow-lg"
                                    />
                                </div>
                            )}

                            {!isZoomed && currentAsset?.asset_type !== 'video' && (
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-slate-400 bg-white/80 p-3 rounded-full backdrop-blur-sm">
                                    <ZoomIn className="w-6 h-6" />
                                </div>
                            )}

                            {mediaAssets.length > 1 && !isZoomed && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setCurrentAssetIndex((prev) => (prev - 1 + mediaAssets.length) % mediaAssets.length); }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full transition-colors z-20 shadow-lg"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setCurrentAssetIndex((prev) => (prev + 1) % mediaAssets.length); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white text-slate-700 rounded-full transition-colors z-20 shadow-lg"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        {mediaAssets.length > 1 && (
                            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                {mediaAssets.map((asset, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentAssetIndex(i)}
                                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${i === currentAssetIndex ? 'border-sky-500' : 'border-slate-200 hover:border-slate-400'
                                            }`}
                                    >
                                        <OptimizedImage
                                            src={asset.file_url || ''}
                                            fallbackSrc={asset.file_name ? `/images/marketplace/${asset.file_name}` : asset.local_url}
                                            alt={`${product.name} - ${i + 1}`}
                                            className="w-full h-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Details */}
                    <div className="space-y-6">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.type === 'hardware' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                }`}>
                                {product.type}
                            </span>
                            {trlStatus && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                    Express Interest ({trlStatus})
                                </span>
                            )}
                            {isPreOrder && !isComingSoon && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                    Pre-Order
                                </span>
                            )}
                            {product.segment && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 capitalize">
                                    {product.segment}
                                </span>
                            )}
                        </div>

                        {/* Title & Price */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-3">{product.name}</h1>
                            <div className="text-4xl font-bold text-sky-600">{formatPrice(product)}</div>
                            {isSoftware && <p className="text-sm text-slate-500 mt-1">Licensing terms apply</p>}
                        </div>

                        {/* Meta Info */}
                        <div className="space-y-3 text-sm">
                            {product.category && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Tag className="w-4 h-4 text-slate-400" />
                                    {product.category}
                                    {product.subcategory && <span className="text-slate-400">/ {product.subcategory}</span>}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-slate-600">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <button
                                    onClick={() => navigate(`/marketplace/seller/${product.user_id}`)}
                                    className="font-medium hover:text-sky-600 transition-colors"
                                >
                                    {product.manufacturer || product.seller?.company_name || 'Unknown'}
                                </button>
                                {product.country_of_origin && (
                                    <CountryFlag countryCode={product.country_of_origin} size="sm" />
                                )}
                                <span className="px-2 py-0.5 bg-slate-100 text-xs rounded border border-slate-200">
                                    {product.seller?.seller_type || 'Seller'}
                                </span>
                            </div>
                            {hasShipping && (
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Truck className="w-4 h-4 text-slate-400" />
                                    Shipping available
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleAddToCart}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-white font-bold text-lg transition-colors shadow-md ${isComingSoon ? 'bg-purple-600 hover:bg-purple-500' : isPreOrder ? 'bg-orange-600 hover:bg-orange-500' : 'bg-sky-600 hover:bg-sky-500'
                                    }`}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {isComingSoon ? 'Express Interest' : isPreOrder ? 'Pre-Order Now' : ((product.base_price || 0) > 0 ? 'Add to Cart' : 'Contact Sales')}
                            </button>
                            <a
                                href={product.seller?.email ? `mailto:${product.seller.email}?subject=Inquiry about ${product.name}` : '#'}
                                className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-colors font-medium text-sm border border-slate-200 shadow-sm"
                            >
                                <Briefcase className="w-4 h-4" />
                                Contact Seller
                            </a>
                        </div>

                        {/* Overview Section */}
                        {product.description && (
                            <div className="pt-8 border-t border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 bg-sky-50 rounded-lg">
                                        <FileText className="w-4 h-4 text-sky-600" />
                                    </div>
                                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Product Overview</h3>
                                </div>
                                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                                    <p className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Specifications Section */}
                        {(product.sku || product.weight_kg != null || product.dimensions || product.power_draw_w != null || product.stock_quantity != null) && (
                            <div className="pt-8 border-t border-slate-200">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                                        <Settings className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Technical Specifications</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {product.sku && (
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <span className="text-[10px] text-slate-500 uppercase block">SKU</span>
                                            <span className="text-sm font-medium text-slate-800">{product.sku}</span>
                                        </div>
                                    )}
                                    {product.weight_kg != null && (
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <span className="text-[10px] text-slate-500 uppercase block">Weight</span>
                                            <span className="text-sm font-medium text-slate-800">{product.weight_kg} kg</span>
                                        </div>
                                    )}
                                    {product.dimensions && (
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <span className="text-[10px] text-slate-500 uppercase block">Dimensions</span>
                                            <span className="text-sm font-medium text-slate-800">{product.dimensions}</span>
                                        </div>
                                    )}
                                    {product.power_draw_w != null && (
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <span className="text-[10px] text-slate-500 uppercase block">Power Draw</span>
                                            <span className="text-sm font-medium text-slate-800">{product.power_draw_w}W</span>
                                        </div>
                                    )}
                                    {product.operating_voltage && (
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <span className="text-[10px] text-slate-500 uppercase block">Voltage</span>
                                            <span className="text-sm font-medium text-slate-800">{product.operating_voltage}</span>
                                        </div>
                                    )}
                                    {product.operating_current && (
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <span className="text-[10px] text-slate-500 uppercase block">Current</span>
                                            <span className="text-sm font-medium text-slate-800">{product.operating_current}</span>
                                        </div>
                                    )}
                                    {product.stock_quantity != null && (
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <span className="text-[10px] text-slate-500 uppercase block">Stock</span>
                                            <span className="text-sm font-medium text-slate-800">
                                                {product.stock_quantity > 0 ? `${product.stock_quantity} units` : 'Out of Stock'}
                                            </span>
                                        </div>
                                    )}
                                    {product.pricing_model && (
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <span className="text-[10px] text-slate-500 uppercase block">Pricing Model</span>
                                            <span className="text-sm font-medium text-slate-800 capitalize">{product.pricing_model}</span>
                                        </div>
                                    )}
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 col-span-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] text-slate-500 uppercase block">Pin Layout</span>
                                            {!product.pin_layout && (
                                                <a
                                                    href={`mailto:${product.seller?.email || 'sales@skhy.ai'}?subject=Request Pin Layout for ${product.name}`}
                                                    className="text-[10px] text-sky-600 hover:underline font-bold"
                                                >
                                                    Request from Vendor
                                                </a>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-slate-800">{formatPinLayout(product.pin_layout) || 'Technical documentation pending'}</span>
                                    </div>
                                    {product.product_assets?.some(a => a.asset_type === 'datasheet') && (
                                        <div className="bg-sky-50 rounded-lg p-3 border border-sky-100 col-span-2 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-sky-600 uppercase block font-bold">Documentation</span>
                                                <span className="text-sm font-medium text-slate-800">Technical Datasheet (Markdown)</span>
                                            </div>
                                            <button
                                                onClick={() => window.open(`/marketplace/product/${product.id}/datasheet`, '_blank')}
                                                className="flex items-center gap-2 px-4 py-2 bg-white text-sky-600 border border-sky-200 rounded-lg text-xs font-bold hover:bg-sky-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                View Datasheet
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Features Section */}
                        {product.features && product.features.length > 0 && (
                            <div className="pt-8 border-t border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 bg-emerald-50 rounded-lg">
                                        <Zap className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Key Features & Benefits</h3>
                                </div>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {product.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50/30 p-3 rounded-xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                                            <div className="p-0.5 bg-emerald-100 rounded-full mt-0.5">
                                                <Zap className="w-3 h-3 text-emerald-600" />
                                            </div>
                                            <span className="leading-snug">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Investor Data Room Linked Proof Banner */}
                        <div className="pt-8 border-t border-slate-200">
                            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-bold uppercase tracking-wider">
                                            Verified OEM & Investor Proof
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-base text-white">Confidential Meeting Notes & Integration Record</h4>
                                    <p className="text-slate-400 text-xs mt-1">This platform has active meeting notes, technical benchmarks, or joint LOIs published in the Skhy AI Investor Data Room.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/investor-data-room')}
                                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-md transition-all border border-cyan-500/30"
                                >
                                    View Data Room Notes →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Rail */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20 pt-10 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">More from {product.seller?.company_name || 'this Seller'}</h2>
                            <button
                                onClick={() => navigate(`/marketplace/seller/${product.user_id}`)}
                                className="text-sky-600 hover:text-sky-700 font-medium text-sm flex items-center gap-1"
                            >
                                View Seller Store <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
                            {relatedProducts.map((p) => (
                                <ProductRailCard key={p.id} product={p} formatPrice={formatPrice} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Similar Products Rail */}
                {similarProducts.length > 0 && (
                    <div className="mt-12 pt-10 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Similar Products</h2>
                            <button
                                onClick={() => navigate(`/marketplace?category=${product.category}`)}
                                className="text-sky-600 hover:text-sky-700 font-medium text-sm flex items-center gap-1"
                            >
                                Explore Category <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
                            {similarProducts.map((p) => (
                                <ProductRailCard key={p.id} product={p} formatPrice={formatPrice} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <ReviewSection productId={parseInt(id || '0')} />
            </div>

            <Footer />

            {product && (
                <ExpressInterestModal
                    isOpen={isInterestModalOpen}
                    onClose={() => setIsInterestModalOpen(false)}
                    productName={product.name}
                    productId={String(product.id)}
                />
            )}
        </div>
    );
}

function ProductRailCard({ product, formatPrice }: { product: MarketplaceProduct; formatPrice: (p: MarketplaceProduct) => string }) {
    const navigate = useNavigate();
    const primaryAsset = product.product_assets?.find(a => a.asset_type === 'image');

    return (
        <div
            className="w-72 flex-shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => {
                window.open(`/marketplace/product/${product.id}`, '_blank');
            }}
        >
            <div className="aspect-square relative overflow-hidden bg-slate-50">
                <OptimizedImage
                    src={primaryAsset?.file_url || ''}
                    fallbackSrc={primaryAsset?.file_name ? `/images/marketplace/${primaryAsset.file_name}` : primaryAsset?.local_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                />
            </div>
            <div className="p-4">
                <h4 className="font-bold text-slate-900 line-clamp-1 mb-1">{product.name}</h4>
                <div className="text-sky-600 font-bold">
                    {formatPrice(product)}
                </div>
            </div>
        </div>
    );
}
