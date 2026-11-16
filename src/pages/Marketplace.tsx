import ProductCard, { MarketplaceProduct } from '../components/marketplace/ProductCard';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  Package,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AddDeviceModal } from '../components/simulators/MissionArchitect/AddDeviceModal';

import { useMarketplace } from '../hooks/useMarketplace';
import { safeStorage } from '../utils/storage';
import { getAllCountries } from '../utils/countryData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import CompareBar from '../components/marketplace/CompareBar.tsx';
import CompareModal from '../components/marketplace/CompareModal.tsx';
import SiteVisitorTrackingBar from '../components/SiteVisitorTrackingBar';
import { VerificationModal } from '../components/VerificationModal';

import { trackEvent } from '../services/analyticsService';

import { MissionArchitectCTA } from '../components/marketplace/MissionArchitectCTA';

export default function Marketplace() {
  const [searchParams] = useSearchParams();

  const { products: allCachedProducts, loading: marketplaceLoading } = useMarketplace();
  const [filteredProducts, setFilteredProducts] = useState<MarketplaceProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allCountries, setAllCountries] = useState<{ code: string, name: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 21;

  // Comparison
  const [compareList, setCompareList] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);

  useEffect(() => {
    // Initialize filters from URL params
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const typeParam = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    if (categoryParam !== null) setSelectedCategory(categoryParam);
    if (searchParam !== null) setSearchTerm(searchParam);
    if (typeParam !== null) setSelectedType(typeParam);
    if (minPrice !== null || maxPrice !== null) {
      setPriceRange({
        min: minPrice || '',
        max: maxPrice || ''
      });
    }
  }, [searchParams]);

  // Track search query telemetry (debounced)
  useEffect(() => {
    if (!searchTerm.trim() && !selectedCategory) return;
    const timer = setTimeout(() => {
      trackEvent({
        eventType: 'market_search',
        searchTerm: searchTerm.trim() || undefined,
        categoryFilter: selectedCategory || undefined,
        metadata: {
          selectedType,
          selectedCountry,
          sortBy
        }
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedType, selectedCountry]);

  const loadMarketplaceProducts = React.useCallback(() => {
    const data = allCachedProducts as any[];

    // Filter for marketplace display
    // Hide products without valid image assets
    const availableProducts = (data || []).filter(p => {
      if (!p.show_on_marketplace) return false;

      const assets = p.product_assets || [];
      const hasValidImage = assets.some(
        (a: any) =>
          a.asset_type === 'image' &&
          a.file_url &&
          a.file_url.trim() !== '' &&
          !a.file_url.includes('unsplash.com') &&
          !a.file_url.includes('placeholder')
      );

      if (!hasValidImage) return false;

      const name = p.name.toLowerCase();
      return !name.includes('sentryos') && !name.includes('trellisware') && !name.includes('silvus');
    });

    // Build dynamic category list from actual products
    const cats = Array.from(new Set(availableProducts
      .map(p => p.category)
      .filter((c): c is string => !!c)
    )).sort();
    setAllCategories(cats);

    // Build dynamic country list
    const countries = Array.from(new Set(availableProducts
      .map(p => p.country_of_origin)
      .filter((c): c is string => !!c)
    ));
    setAllCountries(getAllCountries(countries));

    // Client-side filter across all products
    const applyFilters = (p: any) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false;
      }
      if (selectedCategory && !p.category?.toLowerCase().includes(selectedCategory.toLowerCase())) return false;
      if (selectedType && p.type !== selectedType) return false;
      if (selectedCountry && p.country_of_origin !== selectedCountry) return false;
      if (priceRange.min && (p.base_price ?? 0) < parseFloat(priceRange.min)) return false;
      if (priceRange.max && (p.base_price ?? 0) > parseFloat(priceRange.max)) return false;
      return true;
    };

    // Sort results
    let sorted = availableProducts.filter(applyFilters);
    if (sortBy === 'price_low') sorted = sorted.sort((a, b) => (a.base_price ?? 0) - (b.base_price ?? 0));
    else if (sortBy === 'price_high') sorted = sorted.sort((a, b) => (b.base_price ?? 0) - (a.base_price ?? 0));
    else if (sortBy === 'name') sorted = sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'company') sorted = sorted.sort((a, b) => (a.seller?.company_name ?? '').localeCompare(b.seller?.company_name ?? ''));

    setFilteredProducts(sorted as MarketplaceProduct[]);
  }, [allCachedProducts, searchTerm, selectedCategory, selectedType, priceRange, sortBy, selectedCountry]);

  useEffect(() => {
    if (!marketplaceLoading) {
      loadMarketplaceProducts();
      setCurrentPage(1);
    }
  }, [marketplaceLoading, loadMarketplaceProducts, searchTerm, selectedCategory, selectedType, selectedCountry, priceRange, sortBy]);

  // Tracking Logic
  useEffect(() => {
    const startTime = Date.now();
    const campaignId = safeStorage.session.getItem('campaign_id');
    const campaignRef = safeStorage.session.getItem('campaign_ref');

    if (campaignId) {
      supabase.from('campaign_events').insert({
        campaign_id: campaignId,
        event_type: 'marketplace_visit',
        recipient_email: 'anonymous',
        user_session_id: safeStorage.session.getItem('session_id') || 'anon',
        meta: { url: window.location.href, ref: campaignRef }
      }).then(({ error }) => {
        if (error) console.error('Error tracking visit', error);
      });
    }

    return () => {
      const duration = (Date.now() - startTime) / 1000;
      if (campaignId && duration > 5) {
        supabase.from('campaign_events').insert({
          campaign_id: campaignId,
          event_type: 'marketplace_visit',
          recipient_email: 'anonymous',
          meta: { duration_seconds: duration, type: 'time_spent' }
        }).then();
      }
    };
  }, []);

  const trackProductClick = (productId: string | number, productName: string) => {
    const campaignId = safeStorage.session.getItem('campaign_id');
    if (campaignId) {
      supabase.from('campaign_events').insert({
        campaign_id: campaignId,
        event_type: 'product_click',
        meta: { product_id: productId, product_name: productName }
      }).then();
    }
  };

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

  const [showVerification, setShowVerification] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<MarketplaceProduct | null>(null);

  const isTactical = (product: MarketplaceProduct) => 
    product.category?.toLowerCase() === 'jamming' || 
    product.segment === 'jamming' || 
    product.name.toLowerCase().includes('anti-jam') || 
    product.name.toLowerCase().includes('tactical');

  const handleAddToCart = React.useCallback(async (product: MarketplaceProduct) => {
    if (isTactical(product) && (!user || !user.government_id_verified)) {
      setPendingProduct(product);
      setShowVerification(true);
      return;
    }

    if (product.base_price !== null && product.base_price !== undefined && product.base_price > 0) {
      trackProductClick(product.id, product.name);
      await addToCart(product.id, 1, product);
    } else {
      trackProductClick(product.id, product.name);
      navigate('/contact');
    }
  }, [addToCart, navigate, user]);

  const handleToggleCompare = React.useCallback((productId: number) => {
    setCompareList(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }

      const newProduct = allCachedProducts.find(p => p.id === productId);
      if (prev.length > 0 && newProduct) {
        const firstProduct = allCachedProducts.find(p => p.id === prev[0]);
        if (firstProduct && firstProduct.category !== newProduct.category) {
          alert(`You can only compare products within the same category (${firstProduct.category}).`);
          return prev;
        }
      }

      if (prev.length >= 4) return prev; // Max 4
      return [...prev, productId];
    });
  }, [allCachedProducts]);

  const compareProducts = React.useMemo(() => {
    return filteredProducts.filter(p => compareList.includes(Number(p.id)));
  }, [filteredProducts, compareList]);

  if (marketplaceLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Marketplace Catalog */}
      {/* Marketplace Catalog */}
      <div className="py-12 px-4 max-w-7xl mx-auto container flex-1 w-full mt-32" id="marketplace-content">
        {/* Mission Architect Builder Banner */}
        <MissionArchitectCTA />

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Marketplace Catalog
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Discover cutting-edge AI, sensing, and communication technologies from verified partners.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {allCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="service">Service</option>
              <option value="system">System</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="company">Company Name</option>
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">All Regions</option>
              {allCountries.map(country => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-slate-600 text-sm">Price Range:</span>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <button
              onClick={() => setPriceRange({ min: '', max: '' })}
              className="text-sky-600 hover:text-sky-700 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <p className="text-slate-600">
            Showing {filteredProducts.length} products
          </p>
          <button
            id="add-missing-device-btn"
            onClick={() => {
              if (!user) {
                navigate('/login?redirect=marketplace&reason=add_device');
              } else {
                setAddDeviceOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 hover:border-sky-400 transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Add a Missing Device
          </button>
        </div>

        {/* Add Missing Device — auth gate notice */}
        {!user && (
          <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-start gap-2">
            <span className="mt-0.5 text-amber-500">🔒</span>
            <span>
              <strong>Want to contribute a device for Build Your Own Autonomy?</strong>{' '}
              <button
                onClick={() => navigate('/login?redirect=marketplace&reason=add_device')}
                className="underline font-semibold hover:text-amber-900 transition-colors"
              >
                Sign in
              </button>{' '}
              to add a hardware component to the global catalog.
            </span>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product as any}
                    onAddToCart={handleAddToCart}
                    formatPrice={formatPrice}
                    onToggleCompare={handleToggleCompare}
                    isInCompare={compareList.includes(Number(product.id))}
                  />
                ))}
            </div>

            {/* Pagination Controls */}
            {filteredProducts.length > itemsPerPage && (
              <div className="flex justify-center items-center mt-12 gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {(() => {
                    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
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
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg border transition-all ${currentPage === pageNum
                              ? 'bg-sky-600 border-sky-600 text-white font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-sky-600 hover:text-sky-600'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    });
                  })()}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProducts.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
                  className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {filteredProducts.length > 0 && (
          <div className="text-center mt-12 mb-12">
            <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Ready to Partner with Skhy AI?
              </h3>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Join our marketplace and showcase your innovative technologies to a global audience of buyers and integrators.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center px-8 py-3 bg-turquoise-600 text-white rounded-lg hover:bg-turquoise-700 transition-colors font-medium"
              >
                Become a Partner
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Compare Bar */}
      <CompareBar
        compareList={compareProducts}
        onRemove={(id: number) => handleToggleCompare(id)}
        onClear={() => setCompareList([])}
        onCompare={() => setShowCompareModal(true)}
      />

      {/* Compare Modal */}
      <CompareModal
        products={compareProducts}
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        formatPrice={formatPrice}
      />


      <SiteVisitorTrackingBar pagePath="/marketplace" />
      <Footer />

      {/* Add Device Modal */}
      {user && (
        <AddDeviceModal isOpen={addDeviceOpen} onClose={() => setAddDeviceOpen(false)} />
      )}

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