import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Package, Edit, Save, X, Eye, Image } from 'lucide-react';
import ProductCard from '../../components/marketplace/ProductCard';

interface ProductAsset {
    id: number;
    product_id: number;
    asset_type: string;
    file_url: string;
    created_at: string;
}

interface PendingProduct {
    id: number;
    name: string;
    description: string;
    category: string;
    user_id: string;
    show_on_marketplace: boolean;
    show_on_skhy_store?: boolean;
    is_active: boolean;
    created_at: string;
    currency?: string;
    type?: string;
    pricing_model?: string;
    tax_exempt?: boolean;
    weight_kg?: number;
    dimensions?: string;
    users: {
        company_name: string;
        email: string;
    };
    product_assets?: ProductAsset[];
}

export const ProductApproval: React.FC = () => {
    const [products, setProducts] = useState<PendingProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'live'>('pending');
    
    // Edit Modal State
    const [editingProduct, setEditingProduct] = useState<PendingProduct | null>(null);
    const [editForm, setEditForm] = useState<Partial<PendingProduct> & { imageUrl?: string }>({});

    // Preview Modal State
    const [previewProduct, setPreviewProduct] = useState<PendingProduct | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
                  *,
                  users:user_id (company_name, email),
                  product_assets (id, product_id, asset_type, file_url, created_at)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const approveProduct = async (productId: number) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    show_on_marketplace: true,
                    is_active: true
                })
                .eq('id', productId);

            if (error) throw error;
            loadProducts();
        } catch (error) {
            console.error('Error approving product:', error);
        }
    };

    const rejectProduct = async (productId: number) => {
        if (!confirm('Are you sure you want to reject/delete this product?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;
            loadProducts();
        } catch (error) {
            console.error('Error rejecting product:', error);
        }
    };

    const getProductImage = (product: PendingProduct): string => {
        const imageAsset = product.product_assets?.find(a => a.asset_type === 'image');
        return imageAsset?.file_url || '';
    };

    const handleEditClick = (product: PendingProduct) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            description: product.description,
            category: product.category,
            base_price: product.base_price,
            show_on_marketplace: product.show_on_marketplace,
            show_on_skhy_store: product.show_on_skhy_store,
            is_active: product.is_active,
            weight_kg: product.weight_kg,
            dimensions: product.dimensions,
            imageUrl: getProductImage(product),
        });
    };

    const handleSaveEdit = async () => {
        if (!editingProduct) return;
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    name: editForm.name,
                    description: editForm.description,
                    category: editForm.category,
                    base_price: editForm.base_price,
                    weight_kg: editingProduct.type === 'hardware' ? editForm.weight_kg : null,
                    dimensions: editingProduct.type === 'hardware' ? editForm.dimensions : null,
                    show_on_marketplace: editForm.show_on_marketplace,
                    show_on_skhy_store: editForm.show_on_skhy_store,
                    is_active: editForm.is_active
                })
                .eq('id', editingProduct.id);

            if (error) throw error;

            // Upsert image asset if URL was provided
            if (editForm.imageUrl !== undefined) {
                const existingAsset = editingProduct.product_assets?.find(a => a.asset_type === 'image');
                if (editForm.imageUrl.trim()) {
                    if (existingAsset) {
                        await supabase
                            .from('product_assets')
                            .update({ file_url: editForm.imageUrl.trim() })
                            .eq('id', existingAsset.id);
                    } else {
                        await supabase
                            .from('product_assets')
                            .insert({
                                product_id: editingProduct.id,
                                asset_type: 'image',
                                file_url: editForm.imageUrl.trim(),
                            });
                    }
                } else if (existingAsset) {
                    // Clear image if URL was cleared
                    await supabase
                        .from('product_assets')
                        .delete()
                        .eq('id', existingAsset.id);
                }
            }

            setEditingProduct(null);
            loadProducts();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product details.');
        }
    };

    // Build a marketplace-compatible product object for ProductCard preview
    const buildPreviewProduct = (product: PendingProduct) => ({
        ...product,
        type: product.type || 'hardware',
        pricing_model: product.pricing_model || 'flat',
        currency: product.currency || 'USD',
        tax_exempt: product.tax_exempt ?? false,
        updated_at: product.created_at,
        seller: {
            id: product.user_id,
            company_name: product.users?.company_name || 'Unknown Seller',
            email: product.users?.email || '',
            user_type: 'seller' as const,
            seller_type: 'manufacturer' as const,
            created_at: product.created_at,
            updated_at: product.created_at,
        },
    } as any);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const toggleSKHYStoreVisibility = async (productId: number, currentVal?: boolean) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    show_on_skhy_store: !currentVal,
                    is_active: true
                })
                .eq('id', productId);

            if (error) throw error;
            loadProducts();
        } catch (error) {
            console.error('Error toggling SKHY store visibility:', error);
        }
    };

    const toggleMarketplaceVisibility = async (productId: number, currentVal?: boolean) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({
                    show_on_marketplace: !currentVal,
                    is_active: true
                })
                .eq('id', productId);

            if (error) throw error;
            loadProducts();
        } catch (error) {
            console.error('Error toggling marketplace visibility:', error);
        }
    };

    const pendingProducts = products.filter(p => !p.show_on_marketplace && !p.show_on_skhy_store);
    const liveProducts = products.filter(p => p.show_on_marketplace || p.show_on_skhy_store);
    
    const displayProducts = activeTab === 'pending' ? pendingProducts : liveProducts;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Marketplace & SKHY Store Products</h2>
                    <p className="text-gray-400 mt-1">Manage listings and 1-click toggle visibility on SKHY Store & Marketplace.</p>
                </div>
                
                <div className="flex bg-navy-900 border border-white/10 rounded-lg overflow-hidden">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'pending' ? 'bg-turquoise-500/20 text-turquoise-400' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        Pending ({pendingProducts.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('live')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'live' ? 'bg-turquoise-500/20 text-turquoise-400' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        Live ({liveProducts.length})
                    </button>
                </div>
            </div>

            {displayProducts.length === 0 ? (
                <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700/50 text-center">
                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No {activeTab} products found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {displayProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 flex flex-col lg:flex-row lg:items-start justify-between gap-6 hover:border-gray-600/50 transition"
                        >
                            {/* Product image thumbnail */}
                            <div className="flex-shrink-0">
                                {getProductImage(product) ? (
                                    <img
                                        src={getProductImage(product)}
                                        alt={product.name}
                                        className="w-20 h-20 object-cover rounded-lg border border-white/10"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-lg border border-white/10 bg-gray-700/50 flex items-center justify-center">
                                        <Image className="w-8 h-8 text-gray-500" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                    {product.is_active ? 
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Active</span> : 
                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">Inactive</span>
                                    }
                                </div>
                                <p className="text-gray-400 mb-4 line-clamp-2">{product.description}</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                    <div>
                                        <span className="text-gray-500 block text-xs uppercase mb-0.5">Seller</span>
                                        <p className="text-white font-medium truncate">{product.users?.company_name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs uppercase mb-0.5">Email</span>
                                        <p className="text-white truncate">{product.users?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs uppercase mb-0.5">Category</span>
                                        <p className="text-white">{product.category}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs uppercase mb-0.5">Base Price</span>
                                        <p className="text-white font-semibold">${product.base_price}</p>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500">
                                    Submitted: {new Date(product.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Actions & 1-Click Visibility Toggles */}
                            <div className="flex flex-col gap-2 shrink-0">
                                <div className="flex items-center gap-2">
                                    {/* 1-Click SKHY Store Toggle */}
                                    <button
                                        onClick={() => toggleSKHYStoreVisibility(product.id, product.show_on_skhy_store)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                                            product.show_on_skhy_store
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30'
                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                        }`}
                                        title="Toggle SKHY Store Direct Visibility"
                                    >
                                        <span className={`w-2 h-2 rounded-full ${product.show_on_skhy_store ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                                        <span>SKHY Store: {product.show_on_skhy_store ? 'VISIBLE' : 'HIDDEN'}</span>
                                    </button>

                                    {/* 1-Click Marketplace Toggle */}
                                    <button
                                        onClick={() => toggleMarketplaceVisibility(product.id, product.show_on_marketplace)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center gap-1.5 ${
                                            product.show_on_marketplace
                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'
                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                        }`}
                                        title="Toggle Marketplace Direct Visibility"
                                    >
                                        <span className={`w-2 h-2 rounded-full ${product.show_on_marketplace ? 'bg-blue-400' : 'bg-slate-500'}`} />
                                        <span>Marketplace: {product.show_on_marketplace ? 'VISIBLE' : 'HIDDEN'}</span>
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-1">
                                    {activeTab === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => approveProduct(product.id)}
                                                className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/50 transition text-xs font-bold"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                <span>Approve All</span>
                                            </button>
                                            <button
                                                onClick={() => rejectProduct(product.id)}
                                                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/50 transition text-xs font-bold"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                <span>Delete</span>
                                            </button>
                                        </>
                                    )}
                                    
                                    <button
                                        onClick={() => handleEditClick(product)}
                                        className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/50 transition text-xs font-bold"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        onClick={() => setPreviewProduct(product)}
                                        className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/50 transition text-xs font-bold"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Preview</span>
                                    </button>
                                    
                                    {activeTab === 'live' && (
                                        <button
                                            onClick={() => rejectProduct(product.id)}
                                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/50 transition text-xs font-bold"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                            <span>Delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-navy-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Edit Product</h3>
                            <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                                <input 
                                    type="text" 
                                    value={editForm.name || ''} 
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea 
                                    rows={4}
                                    value={editForm.description || ''} 
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white resize-y"
                                ></textarea>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                    <input 
                                        type="text" 
                                        value={editForm.category || ''} 
                                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Base Price (USD)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={editForm.base_price || 0} 
                                            onChange={(e) => setEditForm({...editForm, base_price: parseFloat(e.target.value)})}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {editingProduct?.type === 'hardware' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={editForm.weight_kg || ''} 
                                            onChange={(e) => setEditForm({...editForm, weight_kg: parseFloat(e.target.value) || undefined})}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Dimensions</label>
                                        <input 
                                            type="text" 
                                            value={editForm.dimensions || ''} 
                                            onChange={(e) => setEditForm({...editForm, dimensions: e.target.value})}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            placeholder="L x W x H cm"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Image URL Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                                    <Image className="w-4 h-4" />
                                    Product Image URL
                                </label>
                                <input
                                    type="url"
                                    value={editForm.imageUrl || ''}
                                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                    placeholder="https://example.com/product-image.jpg"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-600"
                                />
                                {editForm.imageUrl && (
                                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10 h-32">
                                        <img
                                            src={editForm.imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                                    <div className="flex-1">
                                        <span className="text-white text-sm font-medium block">Show on Marketplace</span>
                                        <span className="text-gray-500 text-xs">Is it generally visible?</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!editForm.show_on_marketplace}
                                            onChange={(e) => setEditForm({...editForm, show_on_marketplace: e.target.checked})}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                                    <div className="flex-1">
                                        <span className="text-white text-sm font-medium block">Show on SKHY Store</span>
                                        <span className="text-gray-500 text-xs">Exclusive to SKHY Store?</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!editForm.show_on_skhy_store}
                                            onChange={(e) => setEditForm({...editForm, show_on_skhy_store: e.target.checked})}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    </label>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                                    <div className="flex-1">
                                        <span className="text-white text-sm font-medium block">Is Active</span>
                                        <span className="text-gray-500 text-xs">Can it be purchased?</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!editForm.is_active}
                                            onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/10">
                            <button 
                                onClick={() => setEditingProduct(null)}
                                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Card Preview Modal */}
            {previewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-sm shadow-2xl">
                        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
                            <div>
                                <h3 className="text-white font-semibold">Marketplace Card Preview</h3>
                                <p className="text-gray-500 text-xs mt-0.5">How it appears to buyers</p>
                            </div>
                            <button onClick={() => setPreviewProduct(null)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-100">
                            <ProductCard
                                product={buildPreviewProduct(previewProduct)}
                                onAddToCart={() => {}}
                                formatPrice={(p) => (p.base_price ?? 0) > 0 ? `$${p.base_price}` : 'Custom Pricing'}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductApproval;
