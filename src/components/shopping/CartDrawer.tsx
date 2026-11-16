import React, { Fragment } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { SUPPORTED_CURRENCIES, formatMoney, convertCurrency } from '../../utils/geoCurrency';
import { useAuth } from '../../contexts/AuthContext';

import { OptimizedImage } from '../common/OptimizedImage';

export const CartDrawer: React.FC = () => {
    const { 
        items, isOpen, setIsOpen, updateQuantity, removeFromCart, clearCart, 
        cartTotal, isLoading, currency, setCurrency
    } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        setIsOpen(false);
        if (!user) {
            // Trigger login/registration flow for guest users
            const returnUrl = encodeURIComponent('/checkout');
            navigate(`/login?redirect=${returnUrl}`);
        } else {
            navigate('/checkout');
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto z-10 flex items-center justify-center p-4 sm:p-6 md:p-10">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translateY-4"
                        enterTo="opacity-100 scale-100 translateY-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translateY-0"
                        leaveTo="opacity-0 scale-95 translateY-4"
                    >
                        <Dialog.Panel className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
                            {/* Left Panel: Items list */}
                            <div className="flex-1 flex flex-col overflow-hidden p-6 sm:p-8">
                                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                                    <Dialog.Title className="text-2xl font-bold text-white flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                        <span>Your Shopping Cart</span>
                                        <span className="text-sm font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                            {items.reduce((acc, i) => acc + i.quantity, 0)} items
                                        </span>
                                    </Dialog.Title>
                                    
                                    {items.length > 0 && (
                                        <button
                                            type="button"
                                            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20"
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to empty your cart?')) {
                                                    clearCart();
                                                }
                                            }}
                                        >
                                            Empty Cart
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto py-6 pr-2 custom-scrollbar">
                                    {isLoading && items.length === 0 ? (
                                        <div className="flex justify-center py-16">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400"></div>
                                        </div>
                                    ) : items.length === 0 ? (
                                        <div className="text-center py-16 flex flex-col items-center justify-center">
                                            <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-5 text-slate-500">
                                                <ShoppingBag className="w-10 h-10" />
                                            </div>
                                            <p className="text-slate-300 text-xl font-medium mb-2">Your cart is currently empty</p>
                                            <p className="text-slate-400 text-sm max-w-md mb-6">Explore our marketplace and simulator build configurations to add high-performance drone hardware and equipment.</p>
                                            <button
                                                onClick={() => { setIsOpen(false); navigate('/marketplace'); }}
                                                className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium transition-all shadow-lg shadow-sky-500/20"
                                            >
                                                Explore Marketplace &rarr;
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {items.map((item) => (
                                                <div 
                                                    key={item.id} 
                                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all"
                                                >
                                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                                                        <OptimizedImage
                                                            src={item.product?.image_url || ''}
                                                            fallbackSrc={item.product?.fallback_url}
                                                            alt={item.product?.name || 'Product'}
                                                            className="h-full w-full object-cover object-center"
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-base font-semibold text-white truncate">
                                                            {item.product?.name || 'Unknown Product'}
                                                        </h3>
                                                        <p className="text-xs text-slate-400 mt-0.5">{item.product?.seller_name || 'SKHY AI Ecosystem'}</p>
                                                        <div className="mt-2 text-sm font-bold text-sky-400">
                                                            {formatMoney(
                                                                convertCurrency(item.unit_price || 0, item.product?.currency || 'USD', currency),
                                                                currency
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center border border-slate-800 rounded-xl bg-slate-900 p-1">
                                                            <button
                                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                                title="Decrease quantity"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="text-white font-medium w-8 text-center text-sm">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                                title="Increase quantity"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.product_id)}
                                                            className="p-2 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel: Order Summary & Checkout */}
                            <div className="w-full md:w-80 lg:w-96 bg-slate-950/80 border-t md:border-t-0 md:border-l border-slate-800/80 p-6 sm:p-8 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                                        <h3 className="text-lg font-bold text-white">Order Summary</h3>
                                        <button
                                            type="button"
                                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Display Currency</label>
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value as any)}
                                            className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent block p-3 transition"
                                        >
                                            {SUPPORTED_CURRENCIES.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.label} ({c.symbol})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-3 pt-2 border-t border-slate-800/60">
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>Items ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
                                            <span className="text-slate-200">{formatMoney(cartTotal, currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>Estimated Tax</span>
                                            <span className="text-slate-400 font-mono text-xs">Calculated at checkout</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>Shipping</span>
                                            <span className="text-slate-400 font-mono text-xs">Calculated at checkout</span>
                                        </div>

                                        <div className="flex justify-between text-lg font-bold text-white pt-4 border-t border-slate-800">
                                            <span>Total Amount</span>
                                            <span className="text-sky-400">{formatMoney(cartTotal, currency)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <button
                                        onClick={handleCheckout}
                                        disabled={items.length === 0}
                                        className={`flex w-full items-center justify-center rounded-xl bg-sky-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/20 transition-all ${
                                            items.length === 0 
                                                ? 'opacity-50 cursor-not-allowed' 
                                                : 'hover:bg-sky-400 hover:shadow-sky-500/30 active:scale-[0.98]'
                                        }`}
                                    >
                                        Proceed to Checkout <ArrowRight size={18} className="ml-2" />
                                    </button>

                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="w-full text-center text-sm font-medium text-slate-400 hover:text-slate-200 py-2 transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
};
