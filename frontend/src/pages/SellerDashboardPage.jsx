import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  PlusCircle,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  MapPin,
  QrCode,
  Upload,
  Copy,
  Check,
  CheckCircle2
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { formatINR, getConditionStyle, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/api';
import { getUpiQrCodeUrl } from '../utils/upiQrHelper';

export const SellerDashboardPage = () => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [myListings, setMyListings] = useState([]);
  const [upiId, setUpiId] = useState(currentUser?.upiId || 'rohan.sharma@okaxis');
  const [upiQrImage, setUpiQrImage] = useState(currentUser?.upiQrImage || '');
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be under 5MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpiQrImage(reader.result);
        if (updateProfile) updateProfile({ upiQrImage: reader.result, upiId });
        showToast('Personal UPI QR Code updated!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUpiId = () => {
    if (!upiId.trim()) {
      showToast('Please enter a valid UPI ID / VPA', 'warning');
      return;
    }
    if (updateProfile) updateProfile({ upiId: upiId.trim(), upiQrImage });
    setIsEditingUpi(false);
    showToast('UPI ID saved successfully!', 'success');
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    showToast('UPI ID copied to clipboard!', 'info');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  useEffect(() => {
    // Load default listings matching seller + any added by the user
    const savedUserListings = JSON.parse(localStorage.getItem('campusloop_user_listings') || '[]');
    const defaultSellerItems = MOCK_PRODUCTS.slice(0, 3);
    setMyListings([...savedUserListings, ...defaultSellerItems]);
  }, []);

  const handleToggleStatus = async (id) => {
    const item = myListings.find((i) => i.id === id || i._id === id);
    const nextStatus = item?.status === 'ACTIVE' ? 'SOLD' : 'ACTIVE';

    if (item && item._id) {
      try {
        await productService.updateProduct(item._id, { status: nextStatus });
      } catch (err) {
        // Fallback to local state
      }
    }

    setMyListings((prev) =>
      prev.map((i) => {
        if (i.id === id || i._id === id) {
          showToast(`Listing marked as ${nextStatus}`, 'info');
          return { ...i, status: nextStatus };
        }
        return i;
      })
    );
  };

  const activeCount = myListings.filter((i) => i.status === 'ACTIVE').length;
  const totalValue = myListings.reduce((acc, i) => acc + i.price, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Title & Sell Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Seller Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your active campus catalog listings, mark items as sold, and track incoming handovers
          </p>
        </div>

        <Link
          to="/sell"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Listing</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Listings</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{activeCount}</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Catalog Value</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{formatINR(totalValue)}</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Handovers</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">1</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Seller UPI QR Management Card */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Your UPI Payment Receiving QR</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Active for Direct Handovers
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Buyers scan this QR code on the checkout screen to pay you directly via PhonePe, GPay, Paytm, or BHIM
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 cursor-pointer transition-colors self-start sm:self-auto shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>{upiQrImage ? 'Replace QR Code' : 'Upload GPay/PhonePe QR'}</span>
            <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* QR Display */}
          <div className="md:col-span-4 flex items-center justify-center">
            <div className="bg-white p-3 rounded-2xl shadow-lg border-2 border-teal-400/50 text-center">
              <img
                src={upiQrImage || getUpiQrCodeUrl({ upiId, name: currentUser?.name || 'Seller', amount: 500 })}
                alt="Seller UPI QR Code"
                className="w-36 h-36 object-contain rounded-lg mx-auto"
              />
              <span className="text-[10px] font-bold text-slate-700 block mt-1.5 font-mono">
                {upiQrImage ? 'Custom Uploaded QR' : 'NPCI Auto-Generated QR'}
              </span>
            </div>
          </div>

          {/* Details & Edit */}
          <div className="md:col-span-8 space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider block">
                Active Receiving VPA / UPI ID
              </span>
              {isEditingUpi ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-slate-900 border border-teal-400 text-white font-mono text-xs focus:outline-none"
                    placeholder="e.g. rohan.sharma@okaxis"
                  />
                  <button
                    onClick={handleSaveUpiId}
                    className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingUpi(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs hover:bg-white/30"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-teal-200">{upiId}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyUpi}
                      className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-[11px] inline-flex items-center gap-1"
                    >
                      {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy VPA'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditingUpi(true)}
                      className="px-2.5 py-1 rounded-md bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/30 font-semibold text-[11px]"
                    >
                      Edit UPI ID
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-300 space-y-1">
              <p>• When buyers purchase your calculator, cycle, or books, they scan this QR at checkout.</p>
              <p>• The buyer submits their 12-digit UTR reference ID after paying, which you can verify in your orders.</p>
              <p>• You can upload the QR from your PhonePe, Google Pay, Paytm, or BHIM app profile.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Your Campus Listings ({myListings.length})
          </h3>
          <span className="text-xs text-slate-400">Click toggle to mark item as Sold</span>
        </div>

        <div className="divide-y divide-slate-100">
          {myListings.map((item) => {
            const isSold = item.status === 'SOLD';
            const conditionStyle = getConditionStyle(item.condition);

            return (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    <img
                      src={item.images && item.images[0] ? item.images[0] : ''}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${conditionStyle.bg}`}>
                        {item.condition}
                      </span>
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      {isSold && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                          SOLD
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/products/${item.id}`}
                      className="text-sm font-bold text-slate-900 hover:text-teal-700 block truncate"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Handover: {item.seller?.pickupSpot || 'Campus Lawn'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span className="text-base font-extrabold text-slate-900">
                    {formatINR(item.price)}
                  </span>

                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isSold
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {isSold ? 'Reactivate' : 'Mark as Sold'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
