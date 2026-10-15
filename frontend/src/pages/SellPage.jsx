import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlusCircle,
  Image as ImageIcon,
  DollarSign,
  Layers,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  QrCode,
  Upload,
  Trash2
} from 'lucide-react';
import { CATEGORIES, CONDITIONS } from '../data/mockProducts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatters';
import { productService } from '../services/api';
import { getUpiQrCodeUrl } from '../utils/upiQrHelper';

const DEFAULT_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?auto=format&fit=crop&w=800&q=80'
];

export const SellPage = () => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Calculators');
  const [condition, setCondition] = useState('Good');
  const [price, setPrice] = useState('');
  const [isUniqueItem, setIsUniqueItem] = useState(true);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState(DEFAULT_SAMPLE_IMAGES[0]);
  const [pickupSpot, setPickupSpot] = useState('Library Lawn or Front Gate');
  const [upiId, setUpiId] = useState(currentUser?.upiId || 'rohan.sharma@okaxis');
  const [upiQrImage, setUpiQrImage] = useState(currentUser?.upiQrImage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQrFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('QR code image should be less than 5MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpiQrImage(reader.result);
        showToast('Custom UPI QR Code uploaded!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !price) {
      showToast('Please fill in all mandatory listing fields.', 'warning');
      return;
    }

    const numericPrice = Number(price);
    if (numericPrice <= 0) {
      showToast('Price must be greater than zero.', 'warning');
      return;
    }

    setIsSubmitting(true);
    let createdProduct = null;

    try {
      const res = await productService.createProduct({
        title: title.trim(),
        description: description.trim(),
        category,
        price: numericPrice,
        condition,
        isUniqueItem,
        stockQuantity: isUniqueItem ? 1 : Number(stockQuantity),
        images: [imageUrl],
        pickupLocationNote: pickupSpot,
        sellerUpiId: upiId.trim(),
        sellerUpiQr: upiQrImage
      });
      if (res?.data?.product) {
        createdProduct = res.data.product;
      }
    } catch (err) {
      // Local fallback if offline
    }

    if (!createdProduct) {
      createdProduct = {
        id: 'prod-' + Date.now(),
        title: title.trim(),
        description: description.trim(),
        category,
        price: numericPrice,
        priceInPaise: numericPrice * 100,
        condition,
        isUniqueItem,
        stockQuantity: isUniqueItem ? 1 : Number(stockQuantity),
        images: [imageUrl],
        seller: {
          id: currentUser?.id || 'user-seller-1',
          name: currentUser?.name || 'Current Student',
          college: currentUser?.college || 'National Institute of Technology',
          department: 'Engineering',
          isVerifiedStudent: true,
          pickupSpot,
          upiId: upiId.trim(),
          upiQr: upiQrImage
        },
        sellerUpiId: upiId.trim(),
        sellerUpiQr: upiQrImage,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
    }

    // Save seller's UPI settings to their profile
    if (updateProfile) {
      updateProfile({ upiId: upiId.trim(), upiQrImage });
    }

    // Save to local listings cache for offline and seller dashboard
    const savedUserListings = JSON.parse(localStorage.getItem('campusloop_user_listings') || '[]');
    localStorage.setItem('campusloop_user_listings', JSON.stringify([createdProduct, ...savedUserListings]));

    setIsSubmitting(false);
    showToast(`Listing "${title.slice(0, 20)}..." created with UPI QR!`, 'success');
    navigate('/seller');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">List an Item for Sale</h1>
          <p className="text-xs text-slate-500 mt-1">
            Turn your unused campus books, electronics, or gear into cash for other students
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Fields (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Listing Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Casio fx-991EX ClassWiz or Roadeo 21-Speed Cycle"
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
              >
                {CONDITIONS.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Price (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  required
                  min="10"
                  max="100000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="850"
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Item Listing Type
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isUniqueItem}
                  onChange={(e) => {
                    setIsUniqueItem(e.target.checked);
                    if (e.target.checked) setStockQuantity(1);
                  }}
                  className="accent-teal-600 rounded"
                />
                <span className="font-medium text-slate-700">Unique single-unit used item (Qty 1)</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description & Course Relevance *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention semester usage, working condition, accessories included, and suitable branches..."
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs leading-relaxed"
            />
          </div>

          {/* Image selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs font-mono"
            />
            <div className="flex gap-2 mt-2">
              {DEFAULT_SAMPLE_IMAGES.map((sample, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImageUrl(sample)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    imageUrl === sample ? 'border-teal-600 ring-2 ring-teal-500/20' : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={sample} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Pickup location note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Campus Handover Coordinate *
            </label>
            <input
              type="text"
              required
              value={pickupSpot}
              onChange={(e) => setPickupSpot(e.target.value)}
              placeholder="e.g. Central Library lawn or Hostel 4 common room"
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
            />
          </div>

          {/* Direct UPI Payment & QR Code Upload */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-600 text-white">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Your UPI QR & Payment Info
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Buyers will scan this QR at checkout to pay you directly
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                Instant Handover
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Your UPI ID / VPA *
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. rohan.sharma@okaxis or 9823456789@paytm"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Used for auto-generating your scan-and-pay link
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Upload Your Personal UPI QR Image (Optional)
                </label>
                <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-lg bg-white cursor-pointer transition-colors text-xs text-teal-700 font-semibold">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{upiQrImage ? 'Replace QR Image' : 'Upload GPay/PhonePe QR'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">
                  Upload screenshot of your personal PhonePe, Paytm, or GPay QR
                </p>
              </div>
            </div>

            {/* QR Preview Box */}
            <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-teal-100">
              <div className="w-20 h-20 bg-slate-50 rounded-md border border-slate-200 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={
                    upiQrImage ||
                    getUpiQrCodeUrl({
                      upiId: upiId || 'rohan.sharma@okaxis',
                      name: currentUser?.name || 'Seller',
                      amount: Number(price) || 100
                    })
                  }
                  alt="UPI QR Code Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live Buyer View: {upiQrImage ? 'Custom QR Image' : 'Auto-Generated QR'}</span>
                </div>
                <p className="truncate text-slate-500">
                  VPA: <strong className="font-mono text-slate-800">{upiId || 'rohan.sharma@okaxis'}</strong>
                </p>
                {upiQrImage && (
                  <button
                    type="button"
                    onClick={() => setUpiQrImage('')}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Reset to Auto-Generated QR</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <span>Publishing Listing...</span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish to Campus Catalog</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Live Card Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Live Student Preview</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="relative aspect-[4/3] bg-slate-100">
              <img
                src={imageUrl || DEFAULT_SAMPLE_IMAGES[0]}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  {condition}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span className="font-semibold text-teal-700">{category}</span>
                <span>Verified Peer</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                {title || 'Casio fx-991EX ClassWiz Scientific Calculator'}
              </h3>
              <div className="pt-1 flex items-baseline justify-between">
                <span className="text-lg font-bold text-slate-900">
                  {price ? formatINR(Number(price)) : '₹850'}
                </span>
                <span className="text-[11px] text-slate-400">Fixed</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <h4 className="font-bold text-slate-800">CampusLoop Seller Code:</h4>
            <p>• Only list items currently with you in campus hostels or quarters.</p>
            <p>• Clean and test functional items before handing over.</p>
            <p>• Agree to meetup only at visible campus landmarks.</p>
          </div>
        </div>

      </form>
    </div>
  );
};
