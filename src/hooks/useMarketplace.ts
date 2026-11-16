import { useState, useEffect, useCallback } from 'react';
import { getMarketplaceProducts } from '../data/cachedMarketplace';

export interface MarketplaceProduct {
  id: number;
  name: string;
  [key: string]: any;
}

let persistentProducts: MarketplaceProduct[] = [];
let isInitialLoaded = false;

export const useMarketplace = () => {
  const [products, setProducts] = useState<MarketplaceProduct[]>(persistentProducts);
  const [loading, setLoading] = useState(!isInitialLoaded);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      if (!isInitialLoaded) setLoading(true);
      const data = await getMarketplaceProducts();
      persistentProducts = data;
      setProducts(data);
      isInitialLoaded = true;
      setError(null);
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, error, refresh: loadProducts };
};
