import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR, getConditionStyle } from '../utils/formatters';

export const CartPage = () => {
  const {
    cartItems,
    cartCount,
    subtotal,
    handoverFee,
    platformFee,
    finalTotal,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-5">
        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto border border-teal-100">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Your Campus Bag is Empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Explore verified textbooks, calculators, and essentials listed by students across campus.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all"
          >
            <span>Explore Campus Gear</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            {cartCount} item{cartCount === 1 ? '' : 's'} ready for campus handover
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
        >
          Clear Cart
        </button>
      </div>

      {/* Main 2-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cartItems.map(({ product, quantity }) => {
            const conditionStyle = getConditionStyle(product.condition);

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Product thumbnail & basic details */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                    <img
                      src={product.images && product.images[0] ? product.images[0] : ''}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${conditionStyle.bg}`}
                    >
                      {product.condition}
                    </span>
                    <Link
                      to={`/products/${product.id}`}
                      className="block text-sm font-semibold text-slate-900 hover:text-teal-700 truncate"
                    >
                      {product.title}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      Seller: {product.seller?.name || 'Verified Peer'} ({product.seller?.college || 'Campus'})
                    </p>
                    <div className="text-xs font-bold text-slate-900 sm:hidden">
                      {formatINR(product.price)} each
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  
                  {/* Quantity Increment/Decrement */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-800 min-w-[28px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={product.isUniqueItem || quantity >= product.stockQuantity}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {product.isUniqueItem && (
                      <span className="text-[10px] text-amber-600 font-medium mt-1">
                        Max 1 (Unique item)
                      </span>
                    )}
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right min-w-[80px]">
                    <span className="block text-sm font-bold text-slate-900">
                      {formatINR(product.price * quantity)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatINR(product.price)} × {quantity}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    aria-label="Remove item from cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 hover:text-teal-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Breakdown (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Campus Handover</span>
                <span className="font-semibold text-emerald-600">FREE (In-Person)</span>
              </div>

              <div className="flex justify-between">
                <span>Platform Escrow Simulation</span>
                <span className="font-semibold text-slate-800">₹0</span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-lg font-black text-teal-800">{formatINR(finalTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md shadow-teal-600/20 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Protected by CampusLoop</span>
              </div>
              <p>
                Funds are retained securely until buyer and seller meet on campus to inspect and confirm handover.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
