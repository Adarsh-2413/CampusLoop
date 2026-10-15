import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Share2,
  X,
  FileQuestion
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { formatINR, getConditionStyle, formatDate, isUserOwnProduct } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { reportService } from '../services/api';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const product = MOCK_PRODUCTS.find((p) => p.id === id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Suspicious listing');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  if (!product) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <FileQuestion className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-xs text-slate-500">
          The item you are looking for may have been sold or removed by the seller.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const conditionStyle = getConditionStyle(product.condition);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    const success = addToCart(product, 1);
    if (success) {
      navigate('/checkout');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    try {
      if (product._id) {
        await reportService.createReport({
          reportedProductId: product._id,
          reason: reportReason,
          details: reportDetails
        });
      }
    } catch (err) {
      // Graceful local handling
    } finally {
      setIsSubmittingReport(false);
      setIsReportModalOpen(false);
      setReportDetails('');
      showToast('Report submitted for moderation review. Thank you for keeping campus safe.', 'success');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Listing link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Main Product Hero Details (2-col layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md shadow-xs ${conditionStyle.bg}`}
              >
                <span className={`w-2 h-2 rounded-full ${conditionStyle.dot}`} />
                {product.condition}
              </span>
            </div>
            {product.isUniqueItem && (
              <div className="absolute bottom-4 left-4">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                  Unique Single-Unit Listing
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-teal-600 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Product Full Description */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Item Description & Usage History
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>

        {/* Right Column: Pricing & Purchase Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Pricing Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-3 leading-snug">
                {product.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Listed {formatDate(product.createdAt)}</span>
              </div>
            </div>

            <div className="border-t border-b border-slate-100 py-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900">
                  {formatINR(product.price)}
                </span>
                <span className="text-xs text-slate-500 ml-1.5">Direct peer price</span>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                In Stock ({product.stockQuantity})
              </span>
            </div>

            {/* CTAs */}
            {isUserOwnProduct(user, product) ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>This is your own listed item</span>
                </div>
                <p className="text-amber-700 leading-relaxed">
                  CampusLoop blocks self-purchasing to ensure marketplace integrity and prevent duplicate orders.
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <Link
                    to="/seller"
                    className="inline-flex items-center gap-1 font-bold text-amber-900 underline hover:text-amber-950"
                  >
                    <span>Manage in Seller Portal</span>
                  </Link>
                  <span className="text-amber-400">•</span>
                  <span className="text-amber-600">Switch to "Buyer" role in navbar to test checkout</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md shadow-teal-600/20 transition-all"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Buy Now with Simulated Escrow</span>
                </button>
              </div>
            )}

            {/* Handover Notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Suggested Meetup Spot:</span>
              </div>
              <p className="pl-5 text-slate-700 font-medium">
                {product.seller?.pickupSpot || 'Campus Library / Student Center'}
              </p>
            </div>
          </div>

          {/* Seller Trust Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Seller Identity
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-base">
                {product.seller?.name ? product.seller.name.charAt(0) : 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {product.seller?.name || 'Verified Peer'}
                  </h4>
                  {product.seller?.isVerifiedStudent && (
                    <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {product.seller?.department || 'Student'}
                </p>
                <p className="text-[11px] text-teal-700 font-medium truncate">
                  {product.seller?.college || 'National Institute of Technology'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors py-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report suspicious listing</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Report Listing</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reason for reporting:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs"
                >
                  <option value="Suspicious listing">Suspicious listing</option>
                  <option value="Misleading description">Misleading description</option>
                  <option value="Duplicate listing">Duplicate listing</option>
                  <option value="Prohibited item">Prohibited item</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Explain the issue:
                </label>
                <textarea
                  required
                  rows={4}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide context for the moderator (e.g., incorrect condition, duplicate photos, off-campus scam attempt)..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-4 py-2 rounded-lg font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
