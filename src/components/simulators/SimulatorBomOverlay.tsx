import React, { useState } from 'react';
import { ShoppingCart, Loader2, CheckCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import LeadCaptureModal from '../LeadCaptureModal';

interface BomItem {
    id: number;
    name: string;
    price: number;
    qty?: number;
}

interface Props {
    /** Human-readable label shown on the button */
    label: string;
    /** Items to add to the cart when the button is clicked */
    items: BomItem[];
    /** Interests to tag the lead with (e.g. ['heavy-lift']) */
    interests?: string[];
}

const SimulatorBomOverlay: React.FC<Props> = ({ label, items, interests = [] }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [hasCapturedLead, setHasCapturedLead] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('skhy_simulator_lead_captured') === 'true';
        }
        return false;
    });

    const performAddToCart = async () => {
        setLoading(true);
        try {
            for (const item of items) {
                await addToCart(item.id, item.qty ?? 1, {
                    ...item,
                    base_price: item.price,
                    currency: 'USD',
                    stock_quantity: 99
                });
            }
            setDone(true);
        } catch (err) {
            console.error('BOM add-to-cart failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = async () => {
        if (done) return;

        // If not logged in and never captured lead, show modal
        if (!user && !hasCapturedLead) {
            setIsLeadModalOpen(true);
            return;
        }

        await performAddToCart();
    };

    const handleLeadSuccess = () => {
        localStorage.setItem('skhy_simulator_lead_captured', 'true');
        setHasCapturedLead(true);
        setIsLeadModalOpen(false);
        performAddToCart(); // Continue with adding to cart after capture
    };

    return (
        /* pointer-events-none on the full overlay div, re-enabled only on the button */
        <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
        >
            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2 pointer-events-auto">
                {done && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-slate-900/95 px-3 py-1.5 rounded-full border border-emerald-500/40 shadow-lg">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Added to build — view in Architecture tab
                    </span>
                )}
                <button
                    onClick={handleClick}
                    disabled={loading || done}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl transition-all
            ${done
                            ? 'bg-emerald-700 text-emerald-200 cursor-default'
                            : 'bg-sky-600 hover:bg-sky-500 active:scale-95 text-white shadow-sky-900/50'
                        } disabled:opacity-75`}
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    ) : done ? (
                        <><CheckCircle className="w-4 h-4" /> Saved to Build</>
                    ) : (
                        <><ShoppingCart className="w-4 h-4" /> Save to Build</>
                    )}
                </button>
            </div>

            <LeadCaptureModal
                isOpen={isLeadModalOpen}
                onClose={() => setIsLeadModalOpen(false)}
                onSuccess={handleLeadSuccess}
                title="Save Configuration"
                subtitle="Provide your details to save this mission configuration and receive personalized technical support."
                interests={interests}
            />
        </div>
    );
};

export default SimulatorBomOverlay;
