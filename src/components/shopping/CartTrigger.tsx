import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export const CartTrigger: React.FC = () => {
    const { setIsOpen, itemCount } = useCart();

    return (
        <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-gray-100 hover:text-sky-400 transition-colors"
        >
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                </span>
            )}
        </button>
    );
};
