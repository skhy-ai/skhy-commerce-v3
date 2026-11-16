import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Building2, 
    Globe, 
    Mail, 
    ShieldCheck, 
    Package, 
    ArrowLeft,
    ExternalLink,
    AlertCircle,
    ShieldAlert,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getMarketplaceProducts } from '../../data/cachedMarketplace';
import { MarketplaceProduct, User } from '../../types/partner';
import { useCart } from '../../contexts/CartContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProductCard from '../../components/marketplace/ProductCard';
import { DelistModal } from '../../components/marketplace/DelistModal';

export const SellerProfilePage: React.FC = () => {
    const { sellerId } = useParams<{ sellerId: string }>();
    const navigate = useNavigate();
    const [seller, setSeller] = useState<User | null>(null);
    const [products, setProducts] = useState<MarketplaceProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDelistModalOpen, setIsDelistModalOpen] = useState(false);
    const { addToCart } = useCart();

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    const paginatedProducts = products.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(products.length / itemsPerPage);

    const formatPrice = React.useCallback((product: MarketplaceProduct) => {
        const price = product.base_price ?? 0;
        if (price > 0) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: product.currency || 'USD',
                maximumFractionDigits: 2,
            }).format(price);
        }
        return 'Custom Pricing';
    }, []);

    const handleAddToCart = React.useCallback(async (product: MarketplaceProduct) => {
        if (product.base_price !== null && product.base_price !== undefined && product.base_price > 0) {
            await addToCart(product.id, 1, product);
        } else {
            navigate('/contact');
        }
    }, [addToCart, navigate]);

    useEffect(() => {
        const loadSellerData = async () => {
            if (!sellerId) return;
            setLoading(true);
            try {
                // 1. Fetch Seller Info
                const { data: sellerData, error: sellerError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('user_id', sellerId)
                    .single();

                if (sellerError) throw sellerError;
                setSeller(sellerData);

                // 2. Fetch Seller Products from Cache
                const allProducts = await getMarketplaceProducts();
                const sellerProducts = allProducts.filter(p => p.user_id === sellerId);
                setProducts(sellerProducts as MarketplaceProduct[]);

            } catch (err: any) {
                console.error('Error loading seller profile:', err);
                setError(err.message || 'Failed to load seller profile');
            } finally {
                setLoading(false);
            }
        };

        loadSellerData();
    }, [sellerId]);

    const handleClaimPage = () => {
        navigate(`/register?type=partner&company=${encodeURIComponent(seller?.company_name || '')}&claim=${sellerId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    if (error || !seller) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Seller Not Found</h1>
                <p className="text-slate-600 mb-6">{error || "The seller profile you're looking for doesn't exist."}</p>
                <button 
                    onClick={() => navigate('/marketplace')}
                    className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Marketplace
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            
            {/* Header / Hero */}
            <div className="bg-slate-900 pt-32 pb-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Logo */}
                        <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-xl flex-shrink-0 flex items-center justify-center overflow-hidden border-4 border-slate-800">
                            {seller.logo_url ? (
                                <img src={seller.logo_url} alt={seller.company_name} className="w-full h-full object-contain" />
                            ) : (
                                <Building2 className="w-16 h-16 text-slate-300" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <h1 className="text-4xl font-bold text-white">{seller.company_name}</h1>
                                {seller.approved && seller.user_metadata?.claimed && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-500/30">
                                        <ShieldCheck className="w-4 h-4" /> Verified Partner
                                    </div>
                                )}
                                {!seller.user_metadata?.claimed && seller.company_name?.toUpperCase() !== 'SKHY' && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold border border-amber-500/30">
                                        <AlertCircle className="w-4 h-4" /> Verification Pending
                                    </div>
                                )}
                            </div>

                            <p className="text-slate-400 text-lg max-w-2xl mb-6">
                                {seller.user_metadata?.description || (seller.company_name?.toUpperCase() === 'SKHY' 
                                    ? "Leading defense technology provider specializing in innovative tactical solutions."
                                    : "Trusted manufacturer providing high-quality components and solutions for the autonomous systems industry.")}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-300">
                                {seller.user_metadata?.website && (
                                    <a 
                                        href={seller.user_metadata.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:text-sky-400 transition-colors"
                                    >
                                        <Globe className="w-5 h-5" /> {new URL(seller.user_metadata.website).hostname}
                                    </a>
                                )}
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5" /> {products.length} Products
                                </div>
                                <div className="flex items-center gap-2 capitalize">
                                    <ShieldCheck className="w-5 h-5" /> {seller.seller_type?.replace('_', ' ') || 'Partner'}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {!seller.user_metadata?.claimed && seller.company_name?.toUpperCase() !== 'SKHY' && (
                            <div className="flex-shrink-0">
                                <button 
                                    onClick={handleClaimPage}
                                    className="px-8 py-4 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-sky-500/20 transition-all flex items-center gap-2"
                                >
                                    Claim this Page <ExternalLink className="w-5 h-5" />
                                </button>
                                <p className="text-slate-500 text-xs text-center mt-2">Are you {seller.company_name}?</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold text-slate-900">Product Catalog</h2>
                    <div className="text-slate-500 font-medium">
                        Showing {products.length} items
                    </div>
                </div>

                {products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {paginatedProducts.map((product) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onAddToCart={(p) => { handleAddToCart(p); }}
                                    formatPrice={formatPrice}
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-12 gap-4">
                                <button
                                    onClick={() => {
                                        setCurrentPage(p => Math.max(1, p - 1));
                                        window.scrollTo({ top: 500, behavior: 'smooth' });
                                    }}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const maxPages = 5;
                                        let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
                                        let endPage = Math.min(totalPages, startPage + maxPages - 1);

                                        if (endPage - startPage + 1 < maxPages) {
                                            startPage = Math.max(1, endPage - maxPages + 1);
                                        }

                                        return Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
                                            const pageNum = startPage + i;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => {
                                                        setCurrentPage(pageNum);
                                                        window.scrollTo({ top: 500, behavior: 'smooth' });
                                                    }}
                                                    className={`w-12 h-12 rounded-xl border font-bold transition-all ${
                                                        currentPage === pageNum
                                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20'
                                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        });
                                    })()}
                                </div>

                                <button
                                    onClick={() => {
                                        setCurrentPage(p => Math.min(totalPages, p + 1));
                                        window.scrollTo({ top: 500, behavior: 'smooth' });
                                    }}
                                    disabled={currentPage === totalPages}
                                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Available</h3>
                        <p className="text-slate-500">This manufacturer hasn't listed any products on the marketplace yet.</p>
                    </div>
                )}
            </div>

            {/* Delist Request Link */}
            <div className="container mx-auto px-4 pb-12">
                <div className="flex justify-center border-t border-slate-200 pt-8">
                    <button 
                        onClick={() => setIsDelistModalOpen(true)}
                        className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-xs font-medium transition-colors"
                    >
                        <ShieldAlert className="w-3 h-3" />
                        Are you {seller.company_name}? Request to delist offerings
                    </button>
                </div>
            </div>

            {seller && (
                <DelistModal 
                    isOpen={isDelistModalOpen}
                    onClose={() => setIsDelistModalOpen(false)}
                    sellerId={sellerId || ''}
                    sellerEmail={seller.email || ''}
                    products={products}
                />
            )}

            <Footer />
        </div>
    );
};
