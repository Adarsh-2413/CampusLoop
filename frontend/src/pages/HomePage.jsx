import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Laptop,
  Bike,
  Coffee,
  FlaskConical,
  Calculator,
  Compass
} from 'lucide-react';
import { MOCK_PRODUCTS, CATEGORIES, CONDITIONS } from '../data/mockProducts';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../services/api';

const CATEGORY_ICONS = {
  All: Compass,
  Books: BookOpen,
  Electronics: Laptop,
  Calculators: Calculator,
  Cycles: Bike,
  'Hostel Essentials': Coffee,
  'Lab Equipment': FlaskConical,
  Other: Sparkles
};

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL search query sync
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [catalogItems, setCatalogItems] = useState(MOCK_PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const res = await productService.getProducts();
        if (isMounted && res?.data?.products?.length > 0) {
          // Merge unique mock items with server items
          const serverProducts = res.data.products;
          setCatalogItems((prev) => {
            const ids = new Set(serverProducts.map((p) => p.id || p._id));
            const remainingMocks = MOCK_PRODUCTS.filter((m) => !ids.has(m.id));
            return [...serverProducts, ...remainingMocks];
          });
        }
      } catch (err) {
        // Fallback preserved
      }
    };
    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setMaxPrice(10000);
    setSortBy('newest');
    setSearchParams({});
  };

  const filteredProducts = useMemo(() => {
    return catalogItems.filter((product) => {
      // Search matching title or description
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Category matching
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      // Condition matching
      if (selectedCondition !== 'All' && product.condition !== selectedCondition) {
        return false;
      }

      // Price matching
      if (product.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      // newest default
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [searchQuery, selectedCategory, selectedCondition, maxPrice, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 sm:p-10 lg:p-12 shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus-Verified Peer Exchange</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Smart, Affordable Gear from Fellow Students.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Pass down lab kits, cycles, engineering calculators, and hostel appliances safely. Direct on-campus handovers with simulated test-mode escrow.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#listings-section"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-teal-500 text-slate-950 hover:bg-teal-400 active:bg-teal-300 transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Listings</span>
            </a>
            <Link
              to="/sell"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors backdrop-blur-md"
            >
              <span>List Your Item</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Category Horizontal Quick Filter Pills */}
      <section className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Sparkles;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-teal-600'}`} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Listings Layout (Filters + Grid) */}
      <section id="listings-section" className="space-y-4">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Filters {selectedCondition !== 'All' || maxPrice < 10000 ? '• Active' : ''}</span>
            </button>

            <span className="text-xs text-slate-500">
              Showing <strong className="text-slate-800">{filteredProducts.length}</strong> available item{filteredProducts.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label htmlFor="sort-select" className="text-xs text-slate-500 hidden sm:inline">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              <option value="newest">Newest Listed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {isFilterOpen && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Condition Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Item Condition
              </label>
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedCondition === cond
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">Max Price</span>
                <span className="font-semibold text-teal-700">Under ₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="200"
                max="10000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>₹200</span>
                <span>₹5,000</span>
                <span>₹10,000+</span>
              </div>
            </div>

            {/* Reset Filter Button */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Search / Filter Tag */}
        {(searchQuery || selectedCategory !== 'All' || selectedCondition !== 'All' || maxPrice < 10000) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-md">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-teal-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-md">
                Category: {selectedCategory}
                <button onClick={() => handleCategoryClick('All')} className="hover:text-teal-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCondition !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-md">
                Condition: {selectedCondition}
                <button onClick={() => setSelectedCondition('All')} className="hover:text-teal-950">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-teal-700 hover:underline font-semibold ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 my-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No items found matching your filters</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Try adjusting your search terms, removing specific category constraints, or resetting the price filter.
            </p>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
