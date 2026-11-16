import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard, { MarketplaceProduct } from '../components/marketplace/ProductCard';
import { ShoppingBag } from 'lucide-react';
import SiteVisitorTrackingBar from '../components/SiteVisitorTrackingBar';
import { VerificationModal } from '../components/VerificationModal';

import { useMarketplace } from '../hooks/useMarketplace';

export default function SkhyStore() {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { products, loading } = useMarketplace();
    const storeProducts = products.filter(p => p.show_on_skhy_store === true);

    const [showVerification, setShowVerification] = useState(false);
    const [pendingProduct, setPendingProduct] = useState<MarketplaceProduct | null>(null);

    const formatPrice = (product: MarketplaceProduct) => {
        const price = product.base_price ?? 0;
        if (price > 0) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: product.currency || 'USD',
                maximumFractionDigits: 0,
            }).format(price);
        }
        return 'Contact Sales';
    };

    const isTactical = (product: MarketplaceProduct) => 
        product.category?.toLowerCase() === 'jamming' || 
        product.segment === 'jamming' || 
        product.name.toLowerCase().includes('anti-jam') || 
        product.name.toLowerCase().includes('tactical') ||
        product.name.toLowerCase().includes('interceptor');

    const handleAddToCart = async (product: MarketplaceProduct) => {
        if (isTactical(product) && (!user || !user.government_id_verified)) {
            setPendingProduct(product);
            setShowVerification(true);
            return;
        }

        if (product.base_price !== null && product.base_price > 0) {
            await addToCart(product.id, 1, product);
        } else {
            navigate('/contact');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-navy-950 text-white pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-emerald-400">
                        SKHY Proprietary Systems
                    </h1>
                    <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                        Direct access to advanced autonomous interceptors, C2 platforms, and intelligent RF mitigation tools developed by SKHY AI.
                    </p>
                </div>
            </div>

            {/* Products Grid */}
            <div className="py-16 px-4 max-w-7xl mx-auto container flex-1 w-full">
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
                    </div>
                ) : storeProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Store coming soon</h3>
                        <p className="text-slate-500">We are currently updating our catalog.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {storeProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product as MarketplaceProduct}
                                onAddToCart={handleAddToCart}
                                formatPrice={formatPrice}
                            />
                        ))}
                    </div>
                )}
            </div>


            <Footer />

            <VerificationModal 
                isOpen={showVerification} 
                onClose={() => {
                    setShowVerification(false);
                    setPendingProduct(null);
                }} 
                onSuccess={() => {
                    setShowVerification(false);
                    if (pendingProduct) {
                        handleAddToCart(pendingProduct);
                        setPendingProduct(null);
                    }
                }} 
            />
        </div>
    );
}
