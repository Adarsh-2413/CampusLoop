import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto my-20 bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-500">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900">404</h1>
      <h2 className="text-base font-bold text-slate-800">Page Not Found</h2>
      <p className="text-xs text-slate-500">
        The campus trail you're looking for doesn't exist or has moved.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    </div>
  );
};
