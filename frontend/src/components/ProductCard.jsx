import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap, ShieldCheck } from 'lucide-react';
import { formatINR, getConditionStyle, isUserOwnProduct } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const conditionStyle = getConditionStyle(product.condition);

  const isOwnListing = isUserOwnProduct(user, product);

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = addToCart(product, 1);
    if (added) {
      navigate('/checkout');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <Link to={`/products/${product.id}`} className="block relative">
        {/* Product Image & Badges */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <img
            src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />

          {/* Condition Badge */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md shadow-xs ${conditionStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${conditionStyle.dot}`} />
              {product.condition}
            </span>
          </div>

          {/* Unique item indicator */}
          {product.isUniqueItem && (
            <div className="absolute bottom-2 left-2.5">
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                Unique Used Item
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
              {product.category}
            </span>
            <span className="text-[11px] text-slate-600">
              {product.seller?.college ? 'Verified Peer' : 'Student'}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-teal-700 transition-colors leading-snug">
            {product.title}
          </h3>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-lg font-bold text-slate-900">
                {formatINR(product.price)}
              </span>
              <span className="text-xs text-slate-600 ml-1">fixed</span>
            </div>
            {product.seller?.name && (
              <span className="text-[11px] text-slate-600 flex items-center gap-1 truncate max-w-[120px]">
                <ShieldCheck className="w-3 h-3 text-teal-600 flex-shrink-0" />
                {product.seller.name.split(' ')[0]}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="p-4 pt-0 border-t border-slate-100 mt-2">
        {isOwnListing ? (
          <div className="py-2 px-2.5 rounded-lg text-xs font-semibold text-center text-slate-500 bg-slate-100 border border-slate-200">
            Your Listing (Self-Purchase Blocked)
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors"
              aria-label={`Add ${product.title} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-xs transition-colors"
              aria-label={`Buy ${product.title} now`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
