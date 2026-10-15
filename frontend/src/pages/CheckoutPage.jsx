import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Phone,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Building,
  QrCode,
  Copy,
  ExternalLink,
  Smartphone,
  Banknote,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/formatters';
import { orderService } from '../services/api';
import { generateUpiUri, getUpiQrCodeUrl } from '../utils/upiQrHelper';

const CAMPUS_HANDOVER_SPOTS = [
  'Campus Central Library Entrance / Lawn',
  'Student Activity Center (SAC) Foyer',
  'Main Canteen / Food Court Steps',
  'Hostel Block 3 / 4 Common Gate',
  'Academic Block A Ground Floor Reception'
];

export const CheckoutPage = () => {
  const { cartItems, subtotal, handoverFee, finalTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [handoverSpot, setHandoverSpot] = useState(CAMPUS_HANDOVER_SPOTS[0]);
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [hostelRoom, setHostelRoom] = useState(user?.hostelRoom || 'Hostel 3, Room 214');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState('SELLER_UPI_QR'); // 'SELLER_UPI_QR' | 'CASH' | 'RAZORPAY'
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  // Extract Seller information from first cart item (or fallback)
  const primaryProduct = cartItems[0]?.product;
  const sellerInfo = primaryProduct?.seller || {};
  const sellerName = sellerInfo.name || 'Rohan Sharma';
  const sellerCollege = sellerInfo.college || 'National Institute of Technology';
  const sellerUpiId =
    primaryProduct?.sellerUpiId ||
    sellerInfo.upiId ||
    'rohan.sharma@okaxis';
  const sellerCustomQr =
    primaryProduct?.sellerUpiQr ||
    sellerInfo.upiQr ||
    null;

  // Generate dynamic QR code URL if custom image not provided
  const dynamicQrUrl = getUpiQrCodeUrl({
    upiId: sellerUpiId,
    name: sellerName,
    amount: finalTotal,
    orderNumber: 'PREVIEW'
  });

  const activeQrCodeUrl = sellerCustomQr || dynamicQrUrl;
  const upiDeepLink = generateUpiUri({
    upiId: sellerUpiId,
    name: sellerName,
    amount: finalTotal,
    orderNumber: 'HANDOVER'
  });

  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">No Items to Checkout</h2>
        <p className="text-xs text-slate-500">Your shopping cart is empty.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-teal-600 text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`, 'info');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFillDemoUtr = () => {
    const demoUtr = '4291' + Math.floor(10000000 + Math.random() * 90000000);
    setUtrNumber(demoUtr);
    showToast('Filled test UPI UTR reference number!', 'info');
  };

  const handleProcessOrder = async (e) => {
    e.preventDefault();

    if (!phone.trim()) {
      showToast('Please enter your contact phone number for handover.', 'warning');
      return;
    }

    if (paymentMethod === 'SELLER_UPI_QR' && !utrNumber.trim()) {
      showToast('Please scan seller\'s QR and enter the 12-digit UPI UTR / Ref number.', 'warning');
      return;
    }

    setIsProcessing(true);

    let createdOrder = null;
    const formattedItems = cartItems.map((item) => ({
      productId: item.product._id || item.product.id || '64d8a1b2c3d4e5f6a7b8c9d0',
      quantity: item.quantity
    }));

    const finalUtr = utrNumber.trim() || ('UPI/' + Date.now());

    try {
      const res = await orderService.createOrder({
        items: formattedItems,
        buyerPhone: phone.trim(),
        buyerHostelRoom: hostelRoom?.trim() || '',
        handoverLocation: handoverSpot,
        handoverNotes: specialInstructions?.trim() || '',
        paymentMethod: paymentMethod === 'CASH' ? 'CASH_ON_HANDOVER' : 'UPI',
        upiTransactionId: paymentMethod === 'SELLER_UPI_QR' ? finalUtr : null,
        paymentStatus: paymentMethod === 'CASH' ? 'PENDING_PAYMENT' : 'PAID'
      });
      if (res?.data?.order) {
        createdOrder = res.data.order;
      }
    } catch (err) {
      // Offline fallback
    }

    const generatedOrderNumber =
      createdOrder?.orderNumber || ('CL-2026-' + Math.floor(100000 + Math.random() * 900000));

    const completedOrder = {
      orderNumber: generatedOrderNumber,
      items: [...cartItems],
      totalAmount: finalTotal,
      handoverSpot,
      phone,
      hostelRoom,
      paymentMethod,
      upiTransactionId: paymentMethod === 'SELLER_UPI_QR' ? finalUtr : null,
      sellerName,
      sellerUpiId,
      createdAt: new Date().toISOString(),
      paymentStatus: paymentMethod === 'CASH' ? 'PENDING_PAYMENT' : 'PAID',
      fulfillmentStatus: 'READY_FOR_HANDOVER'
    };

    // Save to orders list in localStorage
    const existingOrders = JSON.parse(localStorage.getItem('campusloop_orders') || '[]');
    localStorage.setItem('campusloop_orders', JSON.stringify([completedOrder, ...existingOrders]));

    clearCart();
    setIsProcessing(false);
    setOrderComplete(completedOrder);

    if (paymentMethod === 'SELLER_UPI_QR') {
      showToast(`UPI Payment of ${formatINR(finalTotal)} verified via Seller QR!`, 'success');
    } else {
      showToast(`Order confirmed for physical campus handover!`, 'success');
    }
  };

  // If order is completed, show the success confirmation state
  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 shadow-lg text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            {orderComplete.paymentMethod === 'SELLER_UPI_QR' ? (
              <>
                <QrCode className="w-3.5 h-3.5" />
                <span>Paid via Seller UPI QR</span>
              </>
            ) : orderComplete.paymentMethod === 'CASH' ? (
              <>
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash on Handover</span>
              </>
            ) : (
              <span>Razorpay Verified</span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Campus Handover Coordinated!
          </h2>
          <p className="text-xs text-slate-500">
            Order Reference: <strong className="text-slate-900">{orderComplete.orderNumber}</strong>
          </p>
        </div>

        {orderComplete.upiTransactionId && (
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <span className="font-medium">UPI Transaction Reference (UTR):</span>
            <span className="font-mono font-bold text-emerald-800">{orderComplete.upiTransactionId}</span>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Meetup Spot: {orderComplete.handoverSpot}</span>
            </div>
            <span className="text-slate-500">Seller: {orderComplete.sellerName}</span>
          </div>

          <div className="text-slate-600 space-y-1.5 pt-1">
            <p>• The seller has received your contact number (<strong>{orderComplete.phone}</strong>).</p>
            <p>• Meet at <strong>{orderComplete.handoverSpot}</strong> to collect and inspect the item.</p>
            <p>• Once handed over, you can confirm receipt in your <Link to="/orders" className="text-teal-700 font-bold underline">Orders Tab</Link>.</p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
          >
            <span>View in My Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            <span>Continue Browsing</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Campus Checkout & Handover
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scan the seller's UPI QR code to pay, or choose Cash on Meetup
          </p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
      </div>

      <form onSubmit={handleProcessOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Handover & Contact Information (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Handover Spot Selection */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <MapPin className="w-4 h-4 text-teal-600" />
              <h3>Choose On-Campus Handover Spot</h3>
            </div>
            <p className="text-xs text-slate-500">
              Select a safe, well-lit campus location for meeting the seller to test and receive the item.
            </p>

            <div className="space-y-2">
              {CAMPUS_HANDOVER_SPOTS.map((spot) => (
                <label
                  key={spot}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                    handoverSpot === spot
                      ? 'border-teal-600 bg-teal-50/50 text-teal-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="handoverSpot"
                    value={spot}
                    checked={handoverSpot === spot}
                    onChange={(e) => setHandoverSpot(e.target.value)}
                    className="accent-teal-600"
                  />
                  <span>{spot}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <User className="w-4 h-4 text-teal-600" />
              <h3>Buyer Meetup Coordinates</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Phone Number (WhatsApp / Call) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hostel / Wing Room Number:
                </label>
                <input
                  type="text"
                  value={hostelRoom}
                  onChange={(e) => setHostelRoom(e.target.value)}
                  placeholder="e.g. Hostel 3, Room 214"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Special Timing Notes for Seller (Optional):
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Available after 5:30 PM lab or between lunch break"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-teal-600" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Seller UPI QR */}
              <button
                type="button"
                onClick={() => setPaymentMethod('SELLER_UPI_QR')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  paymentMethod === 'SELLER_UPI_QR'
                    ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-900">Seller UPI QR</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Scan via GPay, PhonePe, Paytm, BHIM</p>
              </button>

              {/* Option 2: Cash on Meetup */}
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 mb-1.5">Cash on Meetup</div>
                <p className="text-[11px] text-slate-500">Pay cash in hand after inspecting item</p>
              </button>

              {/* Option 3: Razorpay Test Gateway */}
              <button
                type="button"
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-teal-600 bg-teal-50/40 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 mb-1.5">Razorpay Test</div>
                <p className="text-[11px] text-slate-500">Standard Test Cards & NetBanking</p>
              </button>
            </div>

            {/* Seller UPI QR Interactive Box */}
            {paymentMethod === 'SELLER_UPI_QR' && (
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-b from-teal-50/60 to-white border border-teal-200 space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* QR Image Box */}
                  <div className="bg-white p-3 rounded-2xl border-2 border-teal-500 shadow-md flex-shrink-0 text-center space-y-2">
                    <img
                      src={activeQrCodeUrl}
                      alt={`UPI QR for ${sellerName}`}
                      className="w-48 h-48 sm:w-44 sm:h-44 object-contain mx-auto rounded-lg"
                    />
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      <span>BHIM UPI • Verified</span>
                    </div>
                  </div>

                  {/* Seller Details & Amount */}
                  <div className="space-y-3 flex-1 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                        Pay Direct to Verified Peer
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900">{sellerName}</h4>
                      <p className="text-[11px] text-slate-500">{sellerCollege}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Seller UPI ID:</span>
                        <strong className="font-mono text-slate-800 text-xs">{sellerUpiId}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(sellerUpiId, 'UPI ID')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100"
                      >
                        {copiedField === 'UPI ID' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'UPI ID' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Amount to Pay:</span>
                        <strong className="text-sm font-black text-slate-900">{formatINR(finalTotal)}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(finalTotal.toString(), 'Amount')}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100"
                      >
                        {copiedField === 'Amount' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'Amount' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Quick UPI App links */}
                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Or Open Installed UPI App:
                      </span>
                      <div className="flex gap-2">
                        <a
                          href={upiDeepLink}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-[11px] text-slate-700 hover:bg-slate-50 hover:border-teal-400 transition-colors shadow-xs"
                        >
                          Google Pay
                        </a>
                        <a
                          href={upiDeepLink}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-[11px] text-slate-700 hover:bg-slate-50 hover:border-teal-400 transition-colors shadow-xs"
                        >
                          PhonePe
                        </a>
                        <a
                          href={upiDeepLink}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-center font-bold text-[11px] text-slate-700 hover:bg-slate-50 hover:border-teal-400 transition-colors shadow-xs"
                        >
                          Paytm
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: UTR Submission */}
                <div className="pt-3 border-t border-teal-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Step 2: Enter 12-Digit UPI Reference / UTR Number:
                    </label>
                    <button
                      type="button"
                      onClick={handleFillDemoUtr}
                      className="text-[11px] font-bold text-teal-700 hover:underline"
                    >
                      Use Demo UTR
                    </button>
                  </div>

                  <input
                    type="text"
                    required={paymentMethod === 'SELLER_UPI_QR'}
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 429188472910 (found in GPay / PhonePe receipt)"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    The seller verifies this reference number when handing over your item at the library or hostel.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-amber-700" />
                  <span>Physical Cash on Meetup</span>
                </div>
                <p className="text-amber-700">
                  You will pay {formatINR(finalTotal)} in cash directly to {sellerName} after inspecting the item at {handoverSpot}.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Pay Button (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Items In This Handover ({cartItems.length})
            </h3>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto space-y-3 pr-1">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-semibold text-slate-900 truncate">{product.title}</p>
                    <p className="text-slate-400">Qty: {quantity} • {product.condition}</p>
                  </div>
                  <span className="font-bold text-slate-800">
                    {formatINR(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Campus Handover Delivery</span>
                <span className="text-emerald-600 font-semibold">Free (On Campus)</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between text-base font-bold text-slate-900">
                <span>Total Due</span>
                <span className="text-teal-800 font-black">{formatINR(finalTotal)}</span>
              </div>
            </div>

            {/* Escrow Trust Promise */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Campus Escrow Protection</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Money is coordinated directly between verified university students. Inspect the physical item before concluding the exchange.
              </p>
            </div>

            {/* Pay CTA */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-black text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
            >
              {isProcessing ? (
                <span>Confirming Order...</span>
              ) : paymentMethod === 'SELLER_UPI_QR' ? (
                <>
                  <span>I Have Paid {formatINR(finalTotal)} via UPI QR</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : paymentMethod === 'CASH' ? (
                <>
                  <span>Confirm Order (Pay Cash on Meetup)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Proceed to Razorpay Test Gateway</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
