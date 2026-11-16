import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { CartItem } from '../types/checkout';
import { convertCurrency, CurrencyCode } from '../utils/geoCurrency';
import { safeStorage } from '../utils/storage';
import { getMarketplaceProducts } from '../data/cachedMarketplace';


// ─── ARCHITECTURE: CACHE-FIRST CART ──────────────────────────────────────────
//
// Product data comes ENTIRELY from cachedMarketplace.ts (build-time cache),
// which contains richer fields than the live products table in Supabase:
//   → images, power_draw_w, segment, sku, weight_kg, dimensions, features, etc.
//
// Supabase cart_items table is used ONLY as a persistence layer (id, product_id,
// quantity). It is treated as a dumb key-value store — we never join products
// from it. Enrichment always happens from cachedProducts.
//
// Guest users: cart is stored in localStorage only.
// Logged-in users: [product_id, quantity] pairs are synced to Supabase,
//   but product data comes from cachedMarketplace.
//
// This means:
//  • The cart works 100% offline (product data never fetched at runtime)
//  • No Supabase FK errors from simulator-only products
//  • No 409 Conflicts from upserts
//  • Richer product info (power_draw_w, segment, sku etc.) always available
// ─────────────────────────────────────────────────────────────────────────────

// We'll manage this in state now to support lazy loading
let productCacheMap = new Map<string | number, any>();


/** Enrich a (product_id, quantity) pair using the local cache. */
function enrichFromCache(
    productId: string | number,
    quantity: number,
    rowId: string,
    overrides?: any // pass-through for simulator-added items that aren't in cache
): CartItem {
    // 🎯 FIX: Robust ID matching (handles string vs number mismatches between cache and persistence layer)
    const cached = productCacheMap.get(productId) || productCacheMap.get(Number(productId)) || productCacheMap.get(productId.toString());
    
    // Extract the primary image from the cache or fallback to overrides.product_assets if they exist.
    const asset = cached?.product_assets?.find((a: any) => a.asset_type === 'image') 
               || overrides?.product_assets?.find((a: any) => a.asset_type === 'image');

    return {
        id: rowId,
        product_id: productId,
        quantity,
        unit_price: cached?.base_price ?? overrides?.base_price ?? 0,
        platform_pill: overrides?.platform_pill,
        phase: overrides?.phase,
        product: {
            id: productId,
            name: cached?.name ?? overrides?.name ?? 'Product',
            description: cached?.description ?? overrides?.description ?? '',
            image_url: asset?.file_url ?? overrides?.image_url,
            fallback_url: asset?.local_url ?? overrides?.fallback_url,
            seller_name: overrides?.seller_name ?? 'SKHY OEM',
            stock_quantity: cached?.stock_quantity ?? overrides?.stock_quantity ?? 99,
            user_id: cached?.user_id ?? overrides?.user_id ?? '',
            base_price: cached?.base_price ?? overrides?.base_price ?? 0,
            currency: cached?.currency ?? overrides?.currency ?? 'USD',
            category: cached?.category ?? overrides?.category,
            subcategory: cached?.subcategory ?? overrides?.subcategory,
            power_draw_w: cached?.power_draw_w ?? overrides?.power_draw_w,
            segment: cached?.segment ?? overrides?.segment,
            // Extra rich fields from cache
            sku: cached?.sku,
            weight_kg: cached?.weight_kg,
            dimensions: cached?.dimensions,
            features: cached?.features,
        },
    };
}

interface CartContextType {
    items: CartItem[];
    addToCart: (productId: string | number, quantity?: number, productDetails?: any) => Promise<void>;
    removeFromCart: (productId: string | number) => Promise<void>;
    removePhaseFromCart: (phase: string, platform: string) => Promise<void>;
    updateQuantity: (productId: string | number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    cartTotal: number;
    itemCount: number;
    isLoading: boolean;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
    airPowerTotal: number;
    gcsPowerTotal: number;
    roverPowerTotal: number;
    hasPowerSource: boolean;
    isMarketplaceLoading: boolean;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [currency, setCurrency] = useState<CurrencyCode>('USD');
    const [isMarketplaceLoading, setIsMarketplaceLoading] = useState(true);
    const [items, setItems] = useState<CartItem[]>(() => {

        // Hydrate from localStorage on first render
        if (typeof window !== 'undefined') {
            const raw = safeStorage.local.getItem('skhy_local_cart') || safeStorage.local.getItem('guest_cart');
            try { return raw ? JSON.parse(raw) : []; }
            catch { return []; }
        }
        return [];
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // 🎯 NEW: Load Marketplace Data asynchronously from split chunks
    useEffect(() => {
        const loadMarketplace = async () => {
            try {
                const products = await getMarketplaceProducts();
                // Update the module-level map
                productCacheMap = new Map(products.map((p: any) => [p.id as number, p]));
                
                // Trigger a re-enrichment of existing items once cache is ready
                setItems(prev => prev.map(item => 
                    enrichFromCache(item.product_id, item.quantity, item.id, item.product)
                ));
            } catch (err) {
                console.error('[CartContext] Failed to load marketplace data:', err);
            } finally {
                setIsMarketplaceLoading(false);
            }
        };
        loadMarketplace();
    }, []);


    // ── Fetch persisted cart IDs from Supabase, enrich from local cache ──────
    const syncFromRemote = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Fetch ONLY ids — no product join needed; enrichment is local
            const { data, error } = await supabase
                .from('cart_items')
                .select('id, product_id, quantity')
                .eq('user_id', user.id);

            if (error) throw error;

            const enriched: CartItem[] = (data ?? []).map((row: any) =>
                enrichFromCache(row.product_id, row.quantity, row.id)
            );

            setItems(prev => {
                const dbProductIds = new Set(enriched.map(i => i.product_id));
                // Retain any items currently in state that the database didn't return
                // (these are the transient simulator-added items with no FK)
                const localOnly = prev.filter(i => !dbProductIds.has(i.product_id));
                return [...enriched, ...localOnly];
            });
        } catch (err) {
            console.warn('[CartContext] Remote sync failed, keeping local cart:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // ── On login: merge local cart into remote, then sync ────────────────────
    useEffect(() => {
        if (!user) return;

        const mergeAndSync = async () => {
            // Read any locally-stored items built while guest
            const raw = safeStorage.local.getItem('guest_cart');
            let localItems: CartItem[] = [];
            try { localItems = raw ? JSON.parse(raw) : []; } catch { /* */ }

            if (localItems.length > 0) {
                // Persist local items to Supabase (best-effort, skip non-DB products)
                for (const item of localItems) {
                    const isDbProduct = typeof item.product_id === 'number' || (typeof item.product_id === 'string' && !isNaN(Number(item.product_id)) && String(item.product_id).trim() !== '');
                    if (!isDbProduct) continue;

                    try {
                        const { data: existing } = await supabase
                            .from('cart_items')
                            .select('id, quantity')
                            .eq('user_id', user.id)
                            .eq('product_id', item.product_id)
                            .maybeSingle();

                        if (existing) {
                            await supabase
                                .from('cart_items')
                                .update({ quantity: existing.quantity + item.quantity })
                                .eq('id', existing.id);
                        } else {
                            await supabase
                                .from('cart_items')
                                .insert({ user_id: user.id, product_id: item.product_id, quantity: item.quantity });
                        }
                    } catch {
                        // Silently skip simulator-only products (no FK in products table)
                    }
                }
                safeStorage.local.removeItem('guest_cart'); // Clear local after merge
            }

            await syncFromRemote();
        };

        mergeAndSync();
    }, [user, syncFromRemote]);

    // ── Persist to localStorage for fallback ───────────────────────────────────
    useEffect(() => {
        safeStorage.local.setItem('skhy_local_cart', JSON.stringify(items));
    }, [items]);

    // ── Add to cart ──────────────────────────────────────────────────────────
    const addToCart = async (productId: string | number, quantity = 1, productDetails?: any) => {
        setIsLoading(true);
        
        // Mandatory prefixing for NON-NUMERIC products added from simulators
        const effectiveId = typeof productId === 'string' && !productId.startsWith('local_') 
            ? `local_${productId}` 
            : productId;

        // 1. Optimistically update local state immediately (UX feels instant)
        setItems(prev => {
            const existing = prev.find(i => i.product_id === effectiveId);
            if (existing) {
                return prev.map(i =>
                    i.product_id === effectiveId ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            // Enrich from cache (or fall back to productDetails for simulator items)
            return [...prev, enrichFromCache(
                effectiveId,
                quantity,
                `item_${Date.now()}_${effectiveId}`,
                productDetails
            )];
        });
        // Note: Do not auto-open drawer on add-to-cart; items count badge in Cart icon is updated

        // 2. Persist to Supabase if logged in (fire-and-forget, errors are silent)
        const isDbProduct = typeof productId === 'number' || (typeof productId === 'string' && !isNaN(Number(productId)) && String(productId).trim() !== '');
        
        if (user && isDbProduct) {
            try {
                const { data: existing } = await supabase
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('user_id', user.id)
                    .eq('product_id', productId)
                    .maybeSingle();

                if (existing) {
                    await supabase
                        .from('cart_items')
                        .update({ quantity: existing.quantity + quantity })
                        .eq('id', existing.id);
                } else {
                    // ONLY persist real database products to remote state
                    await supabase
                        .from('cart_items')
                        .insert({ user_id: user.id, product_id: isDbProduct ? productId : effectiveId, quantity });
                }

                // Removed await syncFromRemote() here to prevent simulator items from being overwritten
                // by the database if they fail to insert (due to FK constraints), ensuring they persist locally.
            } catch {
                // Simulator products not in products table — local state is already correct
            }
        }

        setIsLoading(false);
    };

    // ── Update quantity ──────────────────────────────────────────────────────
    const updateQuantity = async (productId: string | number, quantity: number) => {
        if (quantity < 1) return removeFromCart(productId);

        // Optimistic update
        setItems(prev => prev.map(item =>
            item.product_id === productId ? { ...item, quantity } : item
        ));

        const isDbProduct = typeof productId === 'number' || (typeof productId === 'string' && !isNaN(Number(productId)) && String(productId).trim() !== '');
        if (user && isDbProduct) {
            try {
                await supabase
                    .from('cart_items')
                    .update({ quantity })
                    .eq('user_id', user.id)
                    .eq('product_id', productId);
            } catch { /* silent */ }
        }
    };

    // ── Remove from cart ─────────────────────────────────────────────────────
    const removeFromCart = async (productId: string | number) => {
        // Optimistic update
        setItems(prev => prev.filter(item => item.product_id !== productId));

        const isDbProduct = typeof productId === 'number' || (typeof productId === 'string' && !isNaN(Number(productId)) && String(productId).trim() !== '');
        if (user && isDbProduct) {
            try {
                await supabase
                    .from('cart_items')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId);
            } catch { /* silent */ }
        }
    };

    // ── Remove phase from cart ───────────────────────────────────────────────
    const removePhaseFromCart = async (phase: string, platform: string) => {
        const itemsToRemove = items.filter(item => item.phase === phase && item.platform_pill === platform);
        if (itemsToRemove.length === 0) return;

        setItems(prev => prev.filter(item => !(item.phase === phase && item.platform_pill === platform)));

        if (user) {
            try {
                const dbProductIdsToRemove = itemsToRemove
                    .map(item => item.product_id)
                    .filter(id => typeof id === 'number' || (typeof id === 'string' && !isNaN(Number(id)) && String(id).trim() !== ''));

                if (dbProductIdsToRemove.length > 0) {
                    // Supabase JS doesn't have an easy way to delete by an array of values using `in` for delete directly if not chained carefully,
                    // Actually `.in('product_id', dbProductIdsToRemove)` works fine.
                    await supabase
                        .from('cart_items')
                        .delete()
                        .eq('user_id', user.id)
                        .in('product_id', dbProductIdsToRemove);
                }
            } catch { /* silent */ }
        }
    };

    // ── Clear cart ───────────────────────────────────────────────────────────
    const clearCart = async () => {
        setItems([]);
        if (user) {
            try {
                await supabase.from('cart_items').delete().eq('user_id', user.id);
            } catch { /* silent */ }
        }
    };

    // ── Derived state ────────────────────────────────────────────────────────
    const cartTotal = items.reduce((sum, item) => {
        const itemCurrency = item.product?.currency || 'USD';
        const converted = convertCurrency(item.unit_price || 0, itemCurrency, currency);
        return sum + converted * item.quantity;
    }, 0);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const airPowerTotal = items.reduce((sum, item) =>
        item.product?.segment === 'air'
            ? sum + (item.product.power_draw_w || 0) * item.quantity
            : sum, 0);

    const gcsPowerTotal = items.reduce((sum, item) =>
        item.product?.segment === 'gcs'
            ? sum + (item.product.power_draw_w || 0) * item.quantity
            : sum, 0);

    const roverPowerTotal = items.reduce((sum, item) =>
        item.product?.segment === 'rover'
            ? sum + (item.product.power_draw_w || 0) * item.quantity
            : sum, 0);

    const hasPowerSource = items.some(item => {
        const category = (item.product?.category || '').toLowerCase();
        const name = (item.product?.name || '').toLowerCase();
        const features = (item.product?.features || []).map(f => f.toLowerCase());

        return (
            category === 'batteries' ||
            name.includes('power module') ||
            name.includes('pdb') ||
            name.includes('bec') ||
            name.includes('battery') ||
            name.includes('array') ||
            name.includes('hv') ||
            name.includes('lipo') ||
            name.includes('li-ion') ||
            name.includes('12s') ||
            name.includes('6s') ||
            features.some(f => f.includes('integrated pdb') || f.includes('integrated bec') || f.includes('power source'))
        );
    });

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            removePhaseFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            itemCount,
            isLoading,
            isOpen,
            setIsOpen,
            currency,
            setCurrency,
            airPowerTotal,
            gcsPowerTotal,
            roverPowerTotal,
            hasPowerSource,
            isMarketplaceLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
