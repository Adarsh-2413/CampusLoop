import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Sparkles, AlertTriangle, Compass } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      {/* Campus Trust Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Student-Only Network</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Only peers with verified college email IDs can list and trade items on CampusLoop.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Direct Campus Handover</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Exchange goods safely at designated on-campus landmarks (Library, Canteen, Student Center).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Circular Campus Economy</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Passing down textbooks, lab gear, and cycles saves students money and minimizes e-waste.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-900">
                <Compass className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold">Campus<span className="text-teal-400">Loop</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A peer-to-peer student marketplace built for engineering & university campuses. Buy, sell, and hand over essentials safely.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Popular Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/?category=Calculators" className="hover:text-teal-400 transition-colors">Scientific Calculators</Link></li>
              <li><Link to="/?category=Cycles" className="hover:text-teal-400 transition-colors">Bicycles & Commuting</Link></li>
              <li><Link to="/?category=Books" className="hover:text-teal-400 transition-colors">Engineering & Medical Textbooks</Link></li>
              <li><Link to="/?category=Hostel Essentials" className="hover:text-teal-400 transition-colors">Hostel Appliances & Lamps</Link></li>
              <li><Link to="/?category=Lab Equipment" className="hover:text-teal-400 transition-colors">Lab Coats & Kits</Link></li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/sell" className="hover:text-teal-400 transition-colors">Sell an Item</Link></li>
              <li><Link to="/cart" className="hover:text-teal-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/orders" className="hover:text-teal-400 transition-colors">Order Tracking</Link></li>
              <li><Link to="/seller" className="hover:text-teal-400 transition-colors">Seller Portal</Link></li>
              <li><Link to="/admin" className="hover:text-teal-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Safety & Project Notice */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Safety & Disclaimer</h4>
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Test Mode Environment</span>
              </div>
              <p className="text-slate-400">
                This project uses simulated Razorpay checkout in test mode. Never transfer unverified advance funds outside the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusLoop. Academic Full-Stack Marketplace Project.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400">Terms of Exchange</span>
            <span>•</span>
            <span className="hover:text-slate-400">Handover Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
