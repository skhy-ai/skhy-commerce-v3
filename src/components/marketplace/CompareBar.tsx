import React from 'react';
import { X, GitCompareArrows } from 'lucide-react';
import { OptimizedImage } from '../common/OptimizedImage';
import type { MarketplaceProduct } from './ProductCard';

interface CompareBarProps {
    compareList: MarketplaceProduct[];
    onRemove: (productId: number) => void;
    onClear: () => void;
    onCompare: () => void;
}

const CompareBar: React.FC<CompareBarProps> = ({ compareList, onRemove, onClear, onCompare }) => {
    if (compareList.length < 1) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-sky-500 shadow-2xl shadow-black/20">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-x-auto">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 flex-shrink-0">
                        <GitCompareArrows className="w-5 h-5 text-sky-600" />
                        <span>Compare ({compareList.length}/4)</span>
                    </div>
                    {compareList.map(product => {
                        const imgAsset = product.product_assets?.find(a => a.asset_type === 'image');
                        return (
                            <div
                                key={product.id}
                                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 flex-shrink-0"
                            >
                                <div className="w-8 h-8 rounded overflow-hidden bg-slate-200 flex-shrink-0">
                                    <OptimizedImage
                                        src={imgAsset?.file_url || ''}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-xs text-slate-700 font-medium max-w-[120px] truncate">
                                    {product.name}
                                </span>
                                <button
                                    onClick={() => onRemove(Number(product.id))}
                                    className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={onClear}
                        className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onCompare}
                        disabled={compareList.length < 2}
                        className="px-4 py-1.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        Compare Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompareBar;
