import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  QrCode,
  Banknote
} from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatters';

const DEFAULT_MOCK_ORDERS = [
  {
    orderNumber: 'CL-2026-881923',
    items: [
      {
        product: {
          id: 'prod-001',
          title: 'Casio fx-991EX ClassWiz Scientific Calculator',
          price: 850,
          condition: 'Like New',
          images: ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=400&q=80']
        },
        quantity: 1
      }
    ],
    totalAmount: 850,
    handoverSpot: 'Campus Central Library Entrance / Lawn',
    phone: '+91 98765 43210',
    hostelRoom: 'Hostel 3, Room 214',
    createdAt: '2026-10-14T15:20:00Z',
    paymentStatus: 'PAID',
    fulfillmentStatus: 'READY_FOR_HANDOVER'
  }
];

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('campusloop_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOrders(parsed.length > 0 ? parsed : DEFAULT_MOCK_ORDERS);
      } catch (e) {
        setOrders(DEFAULT_MOCK_ORDERS);
      }
    } else {
      setOrders(DEFAULT_MOCK_ORDERS);
    }
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'READY_FOR_HANDOVER':
        return {
          label: 'Ready for Handover',
          class: 'bg-teal-50 text-teal-800 border-teal-200'
        };
      case 'COMPLETED':
        return {
          label: 'Handover Completed',
          class: 'bg-emerald-50 text-emerald-800 border-emerald-200'
        };
      case 'PAID':
        return {
          label: 'Payment Verified',
          class: 'bg-blue-50 text-blue-800 border-blue-200'
        };
      case 'PROCESSING':
        return {
          label: 'Coordinating Seller',
          class: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      default:
        return {
          label: status,
          class: 'bg-slate-50 text-slate-700 border-slate-200'
        };
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Orders Placed Yet</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Once you complete simulated checkout for campus items, you can track meetup statuses here.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700"
          >
            <span>Start Browsing</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Orders & Handovers</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your campus exchange receipts, verified payments, and scheduled meetup locations
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const statusBadge = getStatusBadge(order.fulfillmentStatus || 'READY_FOR_HANDOVER');

          return (
            <div
              key={order.orderNumber}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Order Card Top Bar */}
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Order ID</span>
                    <strong className="text-slate-900 font-mono">{order.orderNumber}</strong>
                  </div>
                  <div className="hidden sm:block border-l border-slate-200 pl-4">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
                    <span className="text-slate-700 font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
                    <span className="text-teal-800 font-bold">{formatINR(order.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {order.paymentMethod === 'SELLER_UPI_QR' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      <QrCode className="w-3 h-3" />
                      <span>UPI QR</span>
                    </span>
                  )}
                  {order.paymentMethod === 'CASH' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Banknote className="w-3 h-3" />
                      <span>Cash on Meetup</span>
                    </span>
                  )}
                  {order.upiTransactionId && (
                    <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      UTR: {order.upiTransactionId}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.class}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {statusBadge.label}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-slate-100">
                {order.items.map(({ product, quantity }, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        <img
                          src={product.images && product.images[0] ? product.images[0] : ''}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/products/${product.id}`}
                          className="text-sm font-semibold text-slate-900 hover:text-teal-700 truncate block"
                        >
                          {product.title}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Qty: {quantity} • Condition: {product.condition}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">
                        {formatINR(product.price * quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Handover Coordinate Footer */}
              <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>
                    Meetup Coordinate: <strong>{order.handoverSpot}</strong>
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Protected by CampusLoop Test Mode Escrow
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
