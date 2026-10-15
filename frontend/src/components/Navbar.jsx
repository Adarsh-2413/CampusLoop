import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  User,
  ShieldCheck,
  Package,
  Layers,
  LogOut,
  Menu,
  X,
  Compass
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { cartCount } = useCart();
  const { currentUser, role, switchRole, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* Logo & Campus Tag */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                Campus<span className="text-teal-600">Loop</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider -mt-1">
                Student Exchange
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop/Tablet) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cycles, books, calculators, kettles..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-slate-100/80 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
            />
          </form>

          {/* Right Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Quick Role Switcher for Phase 1 Demo */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">
              <span className="text-slate-400">View as:</span>
              <button
                type="button"
                onClick={() => switchRole('BUYER')}
                className={`px-2 py-0.5 rounded ${role === 'BUYER' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => switchRole('SELLER')}
                className={`px-2 py-0.5 rounded ${role === 'SELLER' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
              >
                Seller
              </button>
              <button
                type="button"
                onClick={() => switchRole('ADMIN')}
                className={`px-2 py-0.5 rounded ${role === 'ADMIN' ? 'bg-white text-teal-700 shadow-xs font-semibold' : 'hover:text-slate-900'}`}
              >
                Admin
              </button>
            </div>

            {/* Sell Item Button */}
            <Link
              to="/sell"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Sell Item</span>
              <span className="sm:hidden">Sell</span>
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Dashboard Menu */}
            {currentUser ? (
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden xl:inline text-sm font-medium text-slate-800 max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 hidden group-hover:block transition-all z-50">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-700 rounded border border-teal-200">
                      Role: {currentUser.role}
                    </span>
                  </div>

                  <Link
                    to="/orders"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                  >
                    <Package className="w-4 h-4 text-slate-400" />
                    My Orders
                  </Link>

                  <Link
                    to="/seller"
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                  >
                    <Layers className="w-4 h-4 text-slate-400" />
                    Seller Dashboard
                  </Link>

                  {currentUser.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700"
                    >
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      Admin Moderation
                    </Link>
                  )}

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-teal-700 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-3 py-1.5 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden py-2.5 border-t border-slate-100">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cycles, books, lab coats..."
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-slate-100 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </form>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-2">
            <div className="p-2 bg-slate-100 rounded-lg text-xs space-y-1.5">
              <span className="font-semibold text-slate-600 block">Switch Demo Role:</span>
              <div className="flex gap-2">
                {['BUYER', 'SELLER', 'ADMIN'].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setIsMenuOpen(false);
                    }}
                    className={`flex-1 py-1 rounded text-center text-xs font-semibold ${role === r ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/orders"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium hover:bg-slate-100"
              >
                <Package className="w-4 h-4 text-teal-600" />
                My Orders
              </Link>
              <Link
                to="/seller"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium hover:bg-slate-100"
              >
                <Layers className="w-4 h-4 text-teal-600" />
                Seller Portal
              </Link>
              {role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="col-span-2 flex items-center gap-2 p-2.5 rounded-lg bg-teal-50 text-teal-800 text-sm font-medium"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  Admin Moderation
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
