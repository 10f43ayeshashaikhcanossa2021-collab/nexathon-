import React, { useState } from 'react';
import { api } from '../api/client';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('creator@lumora.test');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setIsLoading(true);
    setError(null);
    try {
      await api.login(demoEmail, 'Password123!');
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate demo user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1B3A]">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#139A93] flex items-center justify-center text-white mx-auto shadow-md font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-wider uppercase text-[#0B1B3A]">
            INKLOOM AI
          </h1>
          <p className="text-xs text-slate-500">
            Brand Governance & Content Intelligence Platform
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] uppercase tracking-wider mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3A] uppercase tracking-wider mb-1.5">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Organisation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Fast Demo Sign-In (Server Verified)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('creator@lumora.test')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left cursor-pointer transition-colors"
            >
              <div className="font-bold text-[#0B1B3A]">Ishaan Verma</div>
              <div className="text-[10px] text-blue-600 font-semibold uppercase">Creator</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('reviewer@lumora.test')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left cursor-pointer transition-colors"
            >
              <div className="font-bold text-[#0B1B3A]">Neil D'Souza</div>
              <div className="text-[10px] text-teal-600 font-semibold uppercase">Reviewer</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin@lumora.test')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left cursor-pointer transition-colors"
            >
              <div className="font-bold text-[#0B1B3A]">Maya Rao</div>
              <div className="text-[10px] text-purple-600 font-semibold uppercase">Admin</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('viewer@lumora.test')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left cursor-pointer transition-colors"
            >
              <div className="font-bold text-[#0B1B3A]">Kavita Iyer</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Viewer</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
