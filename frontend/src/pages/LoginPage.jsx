import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ShieldCheck, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'warning');
      return;
    }

    setIsLoading(true);
    await login(email, password);
    setIsLoading(false);
    showToast('Signed in successfully!', 'success');
    navigate('/');
  };

  const fillQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('CampusPass@2026');
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-md shadow-teal-600/20">
          <Compass className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Sign in to CampusLoop</h1>
        <p className="text-xs text-slate-500">
          Use your verified college email ID to access student marketplace listings
        </p>
      </div>

      {/* Quick Demo Pre-fills */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-2">
        <span className="font-bold text-slate-700 block">Quick Demo Logins:</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillQuickDemo('buyer@college.edu')}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 font-medium hover:bg-slate-100"
          >
            Buyer Demo
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('seller.rohan@college.edu')}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 font-medium hover:bg-slate-100"
          >
            Seller Demo
          </button>
          <button
            type="button"
            onClick={() => fillQuickDemo('admin.moderator@college.edu')}
            className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 font-medium hover:bg-slate-100"
          >
            Admin Demo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
            College Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rollnumber@college.edu"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
        >
          {isLoading ? (
            <span>Signing In...</span>
          ) : (
            <>
              <span>Sign In with College ID</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-teal-700 hover:underline">
          Register with Student Email
        </Link>
      </div>
    </div>
  );
};
