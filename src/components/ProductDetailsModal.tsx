import React, { useEffect, useState } from 'react';
import { X, Send, FileText, ShoppingCart } from 'lucide-react';
import ExpressInterestModal from './ExpressInterestModal';
import { OptimizedImage } from './common/OptimizedImage';
import { getTRLStatus, type CatalogProduct, type ProductDetailBlock } from '../data/productCatalog';
import config from '../data/config.json';

interface ProductDetailsModalProps {
  isOpen: boolean;
  product: CatalogProduct | null;
  onClose: () => void;
  priceLabel?: string;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  product,
  onClose,
  priceLabel
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInterestOpen, setIsInterestOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const renderBlock = (block: ProductDetailBlock, idx: number) => {
    if (block.type === 'text') {
      return (
        <div key={idx} className="space-y-2">
          {block.title ? (
            <h4 className="text-sm font-semibold text-sky-300">{block.title}</h4>
          ) : null}
          <p className="text-sky-100 leading-relaxed">{block.text}</p>
        </div>
      );
    }

    if (block.type === 'list') {
      return (
        <div key={idx} className="space-y-3">
          <h4 className="text-sm font-semibold text-turquoise-400">{block.title}</h4>
          <ul className="space-y-2">
            {block.items.map((it, i) => (
              <li key={i} className="text-sky-100 text-sm leading-relaxed">
                {it}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (block.type === 'specs') {
      return (
        <div key={idx} className="space-y-3">
          <h4 className="text-sm font-semibold text-turquoise-400">{block.title}</h4>
          <div className="space-y-3">
            {block.items.map((row, i) => (
              <div key={i} className="border-l-2 border-turquoise-500/30 pl-3">
                <div className="text-xs text-sky-300 font-semibold mb-1">{row.label}</div>
                <div className="text-sm text-sky-100 leading-relaxed">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'table') {
      return (
        <div key={idx} className="space-y-3">
          <h4 className="text-sm font-semibold text-turquoise-400">{block.title}</h4>
          <div className="overflow-x-auto rounded-lg border border-navy-700">
            <table className="min-w-full text-left">
              <thead className="bg-navy-800">
                <tr>
                  {block.columns.map((c, i) => (
                    <th key={i} className="px-4 py-3 text-xs font-semibold text-sky-300 whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700">
                {block.rows.map((r, ri) => (
                  <tr key={ri} className="bg-navy-900/30">
                    {r.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 text-sm text-sky-100 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black bg-opacity-95 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex w-full h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {product.imageUrls && product.imageUrls.length > 1 ? (
              <div className="flex flex-col gap-4 w-full h-full max-h-[80vh]">
                <div className="flex-1 relative flex items-center justify-center">
                  <OptimizedImage
                    src={product.imageUrls[currentImageIndex]}
                    fallbackSrc={product.localImageUrl}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-all duration-300"
                  />
                </div>
                <div className="flex gap-3 justify-center overflow-x-auto py-4 px-2 no-scrollbar">
                  {product.imageUrls.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`group relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-lg ${
                        i === currentImageIndex ? 'border-sky-500 scale-105 shadow-sky-500/20' : 'border-white/10 hover:border-sky-400/50'
                      }`}
                    >
                      <div className="absolute inset-0 bg-navy-900/40 group-hover:bg-transparent transition-colors duration-300" />
                      <OptimizedImage src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="relative max-w-full max-h-full">
                <OptimizedImage
                  src={product.imageUrl}
                  fallbackSrc={product.localImageUrl}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[460px] bg-navy-900/95 backdrop-blur-md border-l border-navy-700 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                <p className="text-sky-200 mt-2">{product.tagline}</p>
                <div className="mt-4 flex items-center gap-3">
                  {priceLabel ? (
                    <div className="text-3xl font-bold text-sky-400">{priceLabel}</div>
                  ) : null}
                  {(() => {
                    const trlStatus = getTRLStatus(product);
                    if (trlStatus) {
                      return (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/50 text-purple-300 border border-purple-500/30">
                          Express Interest ({trlStatus})
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {product.details
                .filter((block) => {
                  if (config.enablePricing) return true;
                  // Hide pricing blocks if disabled
                  if (block.type === 'specs' && (block.title === 'Pricing' || block.title === 'Pricing Model')) return false;
                  if (block.type === 'table' && block.title === 'Software Bandwidth Upgrades') return false;
                  return true;
                })
                .map((block, idx) => renderBlock(block, idx))}
            </div>

            <div className="pt-6 border-t border-navy-700 flex flex-col gap-3">
              {(() => {
                  const trlStatus = getTRLStatus(product);

                  if (trlStatus) {
                      return (
                          <button
                              onClick={() => setIsInterestOpen(true)}
                              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                          >
                              <Send className="w-5 h-5" />
                              Express Interest ({trlStatus})
                          </button>
                      );
                  } else {
                      return (
                          <button
                              onClick={() => window.open(`/marketplace/product/${product.id}`, '_blank')}
                              className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                          >
                              <ShoppingCart className="w-5 h-5" />
                              Buy Now / View in Marketplace
                          </button>
                      );
                  }
              })()}

              <button
                onClick={() => window.open(`/marketplace/product/${product.id}/datasheet`, '_blank')}
                className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <FileText className="w-5 h-5" />
                View Technical Datasheet
              </button>
            </div>
          </div>
        </div>
      </div>

      <ExpressInterestModal 
        isOpen={isInterestOpen} 
        onClose={() => setIsInterestOpen(false)} 
        productName={product.name}
        productId={product.id}
      />
    </div>
  );
};

export default ProductDetailsModal;
