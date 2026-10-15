import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ShieldCheck, ArrowRight, Lock, Mail, User, School, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('National Institute of Technology');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BUYER');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setIsLoading(true);
    await register({ name, email, college, role });
    setIsLoading(false);
    showToast('Registration initiated! Welcome to CampusLoop.', 'success');
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-md shadow-teal-600/20">
          <Compass className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Student Registration</h1>
        <p className="text-xs text-slate-500">
          Join our verified student marketplace to buy and pass down academic essentials
        </p>
      </div>

      <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-800 space-y-1">
        <div className="flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-4 h-4 text-teal-700" />
          <span>Student Verification Policy</span>
        </div>
        <p>
          Registration requires an active college-affiliated email address (.edu / .ac.in / college domain).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Adarsh Sharma"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Student Email ID *
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
            College / University *
          </label>
          <div className="relative">
            <School className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. National Institute of Technology"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Primary Initial Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('BUYER')}
              className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-colors ${
                role === 'BUYER'
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Buyer / Student
            </button>
            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-colors ${
                role === 'SELLER'
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Seller
            </button>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">
            Create Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
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
            <span>Creating Account...</span>
          ) : (
            <>
              <span>Complete Student Registration</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
        Already registered?{' '}
        <Link to="/login" className="font-bold text-teal-700 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
