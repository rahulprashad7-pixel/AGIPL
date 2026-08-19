import React, { useState } from 'react';
import {
  Laptop,
  ShieldCheck,
  Shield,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Building,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_USERS } from '../services/sampleData';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, switchUser, currentUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your company email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password || 'default123');
      onLoginSuccess();
    } catch (err: any) {
      setError(err?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (userKey: 'sameer-tupe' | 'rahul-prasad') => {
    const user =
      userKey === 'sameer-tupe'
        ? DEFAULT_USERS[0]
        : DEFAULT_USERS[1];
    if (user) switchUser(user);
    onLoginSuccess();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20 text-white">
            <Laptop className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white">
            ACCURATE GROUP
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
            IT Asset Inventory & Lifecycle System
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span>AGIPL</span>
            <span>•</span>
            <span>ASSPL</span>
            <span>•</span>
            <span>ONYX PRECISION</span>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 rounded-lg bg-rose-950/80 p-3 text-xs text-rose-300 border border-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@accurate.in"
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-800/80 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Inventory'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick 1-Click Role Switchers for Testing */}
          <div className="mt-6 border-t border-slate-800 pt-5">
            <div className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              One-Click Role Selection
            </div>

            <div className="space-y-2.5">
              {/* Sameer Tupe */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sameer-tupe')}
                className="flex w-full items-center justify-between rounded-xl border border-purple-800/50 bg-purple-950/30 p-3 text-left transition-all hover:bg-purple-900/40 hover:border-purple-600"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-xs">
                    ST
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Sameer Tupe</div>
                    <div className="text-[10px] text-purple-300">IT Manager / Super Admin (Full Access)</div>
                  </div>
                </div>
                <ShieldCheck className="h-4 w-4 text-purple-400" />
              </button>

              {/* Rahul Prasad */}
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('rahul-prasad')}
                className="flex w-full items-center justify-between rounded-xl border border-blue-800/50 bg-blue-950/30 p-3 text-left transition-all hover:bg-blue-900/40 hover:border-blue-600"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                    RP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Rahul Prasad</div>
                    <div className="text-[10px] text-blue-300">IT Support (Assets, Service & CSV)</div>
                  </div>
                </div>
                <Shield className="h-4 w-4 text-blue-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500">
          Accurate Group IT Department • Secure Internal Access
        </div>
      </div>
    </div>
  );
};
