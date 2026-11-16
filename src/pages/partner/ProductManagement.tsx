import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image, ShieldCheck } from 'lucide-react';
import type { Product } from '../../types/partner';
import { handleError, ErrorContexts, type ErrorInfo } from '../../utils/ErrorHandler';
import { ErrorNotification } from '../../components/ErrorNotification';

export const ProductManagement: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingImageUrl, setEditingImageUrl] = useState<string>('');
    const [error, setError] = useState<ErrorInfo | null>(null);

    useEffect(() => {
        loadProducts();
    }, [user]);

    const loadProducts = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, product_assets (id, product_id, asset_type, file_url)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error: any) {
            const errorInfo = handleError(error, ErrorContexts.PRODUCT_LOAD);
            setError(errorInfo);
        } finally {
            setLoading(false);
        }
    };

    const toggleProductStatus = async (productId: string | number, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: !currentStatus })
                .eq('id', productId);

            if (error) throw error;
            loadProducts();
        } catch (error: any) {
            const errorInfo = handleError(error, ErrorContexts.PRODUCT_UPDATE);
            setError(errorInfo);
        }
    };

    const handleOpenAddProduct = () => {
        setEditingImageUrl('');
        setEditingProduct({
            id: 0,
            name: '',
            description: '',
            base_price: 0,
            type: 'hardware',
            category: '',
            currency: (user?.user_metadata?.default_currency as string) || 'USD',
            pricing_model: 'flat',
            tax_exempt: true,
            is_active: false,
            show_on_marketplace: false,
            ready_to_sale: false,
            hide_pricing: false,
            created_at: '',
            updated_at: ''
        });
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct || !user) return;

        try {
            // Check for duplicates
            const { data: existing } = await supabase
                .from('products')
                .select('id, name')
                .eq('user_id', user.id)
                .ilike('name', editingProduct.name)
                .neq('id', editingProduct.id || -1)
                .maybeSingle();

            if (existing) {
                alert('A product with this name already exists.');
                return;
            }

            let savedProductId: string | number = editingProduct.id;

            const payload = {
                name: editingProduct.name,
                description: editingProduct.description,
                base_price: editingProduct.base_price,
                type: editingProduct.type,
                category: editingProduct.category,
                currency: editingProduct.currency,
                weight_kg: editingProduct.type === 'hardware' ? editingProduct.weight_kg : null,
                dimensions: editingProduct.type === 'hardware' ? editingProduct.dimensions : null,
                operating_voltage: editingProduct.type === 'hardware' ? editingProduct.operating_voltage : null,
                operating_current: editingProduct.type === 'hardware' ? editingProduct.operating_current : null,
                pricing_model: editingProduct.pricing_model || 'flat',
                tax_exempt: editingProduct.tax_exempt || false,
                is_active: editingProduct.is_active || false,
                show_on_marketplace: editingProduct.show_on_marketplace || false,
                ready_to_sale: editingProduct.ready_to_sale || false,
                hide_pricing: editingProduct.hide_pricing || false,
            };

            if (editingProduct.id) {
                // Update
                const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', editingProduct.id);
                if (error) throw error;
            } else {
                // Create
                const { data: newProduct, error } = await supabase
                    .from('products')
                    .insert([{
                        ...payload,
                        user_id: user.id
                    }])
                    .select('id')
                    .single();
                if (error) throw error;
                savedProductId = newProduct.id;
            }

            // Upsert image asset
            const existingAsset = (editingProduct as any).product_assets?.find((a: any) => a.asset_type === 'image');
            if (editingImageUrl.trim()) {
                if (existingAsset) {
                    await supabase.from('product_assets').update({ file_url: editingImageUrl.trim() }).eq('id', existingAsset.id);
                } else {
                    await supabase.from('product_assets').insert({ product_id: savedProductId, asset_type: 'image', file_url: editingImageUrl.trim() });
                }
            } else if (existingAsset) {
                await supabase.from('product_assets').delete().eq('id', existingAsset.id);
            }

            setEditingProduct(null);
            setEditingImageUrl('');
            loadProducts();
        } catch (error: any) {
            const errorInfo = handleError(error, ErrorContexts.PRODUCT_UPDATE);
            setError(errorInfo);
        }
    };

    const deleteProduct = async (productId: string | number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;
            loadProducts();
        } catch (error: any) {
            const errorInfo = handleError(error, ErrorContexts.PRODUCT_DELETE);
            setError(errorInfo);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ErrorNotification
                error={error}
                onClose={() => setError(null)}
                onRetry={loadProducts}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Products</h2>
                    <p className="text-gray-400 mt-1">Manage your product catalog</p>
                </div>
                <button
                    onClick={handleOpenAddProduct}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {products.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700/50 text-center">
                    <p className="text-gray-400 text-lg mb-4">No products yet</p>
                    <button
                        onClick={handleOpenAddProduct}
                        className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${product.is_active
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                                }`}
                                        >
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 mb-3">{product.description}</p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <span className="text-gray-500">
                                            Category: <span className="text-gray-300">{product.category}</span>
                                        </span>
                                        <span className="text-gray-500">
                                            Type: <span className="text-gray-300">{product.type}</span>
                                        </span>
                                        <span className="text-gray-500">
                                            Price: <span className="text-gray-300">${product.base_price}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => toggleProductStatus(product.id, product.is_active || false)}
                                        className="p-2 hover:bg-gray-700/50 rounded-lg transition"
                                        title={product.is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        {product.is_active ? (
                                            <EyeOff className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const imgAsset = (product as any).product_assets?.find((a: any) => a.asset_type === 'image');
                                            setEditingImageUrl(imgAsset?.file_url || '');
                                            setEditingProduct(product);
                                        }}
                                        className="p-2 hover:bg-gray-700/50 rounded-lg transition"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-5 h-5 text-blue-400" />
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="p-2 hover:bg-gray-700/50 rounded-lg transition"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                        </h3>
                        <form onSubmit={handleUpdateProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={editingProduct.description || ''}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                                        Price
                                        {editingProduct.supplier_managed_pricing && (
                                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-0.5" title="Managed by Supplier Agreement">
                                                <ShieldCheck className="w-2 h-2" /> Locked
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editingProduct.base_price || 0}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, base_price: parseFloat(e.target.value) })}
                                        className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white ${editingProduct.supplier_managed_pricing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        required
                                        disabled={!!editingProduct.supplier_managed_pricing}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                                    <select
                                        value={editingProduct.type}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, type: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                    >
                                        <option value="hardware">Hardware</option>
                                        <option value="service">Service</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={editingProduct.category || ''}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                        placeholder="e.g. Electronics"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                                    <input
                                        type="text"
                                        value={editingProduct.currency || 'USD'}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, currency: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                    />
                                </div>
                            </div>
                            {editingProduct.type === 'hardware' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Weight (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editingProduct.weight_kg || ''}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, weight_kg: parseFloat(e.target.value) || undefined })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                            placeholder="e.g. 1.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Dimensions</label>
                                        <input
                                            type="text"
                                            value={editingProduct.dimensions || ''}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, dimensions: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                            placeholder="L x W x H cm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Op. Voltage</label>
                                        <input
                                            type="text"
                                            value={editingProduct.operating_voltage || ''}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, operating_voltage: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                            placeholder="e.g. 12V-24V"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Op. Current</label>
                                        <input
                                            type="text"
                                            value={editingProduct.operating_current || ''}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, operating_current: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                            placeholder="e.g. 500mA"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                                    <Image className="w-4 h-4" /> Product Image URL
                                </label>
                                <input
                                    type="url"
                                    value={editingImageUrl}
                                    onChange={(e) => setEditingImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-600"
                                />
                                {editingImageUrl && (
                                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-700 h-28">
                                        <img src={editingImageUrl} alt="Preview" className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                )}
                            </div>

                            {/* Visibility & Lifecycle Flags */}
                            <div className="pt-4 border-t border-gray-700">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                                    <p className="text-blue-400 text-xs leading-relaxed">
                                        <strong>Pro Tip:</strong> Use <code className="text-blue-300">Is Active</code> to enable/disable the product in the system entirely. Use <code className="text-blue-300">Ready to Sale</code> to control if customers can actually buy it (e.g., set to off for Pre-orders or Out of Stock items while keeping them visible for planning).
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="flex-1">
                                        <span className="text-white text-sm font-medium block">Is Active</span>
                                        <span className="text-gray-500 text-xs">Can it be bought?</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!editingProduct.is_active}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="flex-1">
                                        <span className="text-white text-sm font-medium block">Show on Marketplace</span>
                                        <span className="text-gray-500 text-xs">Is it public?</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!editingProduct.show_on_marketplace}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, show_on_marketplace: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    </label>
                                </div>
                                
                                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="flex-1">
                                        <span className="text-white text-sm font-medium block">Ready to Sale</span>
                                        <span className="text-gray-500 text-xs">Inventory ready?</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!editingProduct.ready_to_sale}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, ready_to_sale: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="flex-1">
                                        <span className="text-white text-sm font-medium block">Hide Pricing</span>
                                        <span className="text-gray-500 text-xs">Contact for pricing?</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!editingProduct.hide_pricing}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, hide_pricing: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    {editingProduct.id ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
