import React, { useState } from 'react';
import { User, UserRole } from '../types/inkloom';
import { SEED_USERS } from '../services/store';
import { api } from '../api/client';
import { EvalModal } from './EvalModal';
import { AiEngineModal } from './AiEngineModal';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  FileCheck2,
  FileText,
  Clock,
  BarChart3,
  Users,
  Shield,
  Settings,
  ChevronDown,
  Layers,
  Inbox,
  Cpu,
  TestTube2,
  RefreshCw,
  LogOut,
  Share2,
  Database,
} from 'lucide-react';

interface AppShellProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentUser,
  onUserChange,
  currentPage,
  onNavigate,
  children,
}) => {
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'reviewer', 'creator'] },
    { id: 'submissions-new', label: 'Submit Draft', icon: FileText, roles: ['creator', 'admin'] },
    { id: 'review-queue', label: 'Review Queue', icon: Inbox, roles: ['reviewer', 'admin'] },
    { id: 'social-publishing', label: 'Social Publishing', icon: Share2, roles: ['admin', 'reviewer', 'creator'] },
    { id: 'brand-hub', label: 'Brand Hub', icon: Layers, roles: ['admin'] },
    { id: 'guidelines', label: 'Guidelines & Facts', icon: BookOpen, roles: ['admin', 'reviewer', 'creator'] },
    { id: 'history', label: 'Submission History', icon: Clock, roles: ['admin', 'reviewer', 'creator'] },
    { id: 'analytics', label: 'Governance Analytics', icon: BarChart3, roles: ['admin', 'reviewer'] },
    { id: 'users', label: 'Team Members', icon: Users, roles: ['admin'] },
    { id: 'audit-logs', label: 'Audit Trail', icon: Shield, roles: ['admin'] },
    { id: 'settings', label: 'Tenant Settings', icon: Settings, roles: ['admin'] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  const handleSelectUser = (user: User) => {
    api.setCurrentUser(user);
    onUserChange(user);
    setIsPersonaOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'reviewer':
        return 'bg-teal-100 text-[#0d706b] border-teal-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]">
      {/* Top Navbar */}
      <header className="h-16 bg-[#0B1B3A] text-white flex items-center justify-between px-6 border-b border-[#162C5B] shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#139A93] flex items-center justify-center text-white shadow-sm font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-1.5">
                <span>INKLOOM AI</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-semibold">
                  v1.0
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans tracking-wide">
                Brand Governance & Content Intelligence
              </div>
            </div>
          </button>
        </div>

        {/* Right Tools & Persona Switcher */}
        <div className="flex items-center gap-3">
          {/* Supabase Live DB Badge */}
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
            title="Supabase Cloud PostgreSQL Database: Connected"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Supabase Live</span>
          </button>

          {/* AI Engine Status Button */}
          <button
            type="button"
            onClick={() => setIsAiModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#162C5B] hover:bg-[#1E3B77] text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>AI Engine: gemini-3.8-flash</span>
          </button>

          {/* Test Suite Runner Button */}
          <button
            type="button"
            onClick={() => setIsEvalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <TestTube2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Benchmark Evaluator</span>
          </button>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPersonaOpen(!isPersonaOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#162C5B] hover:bg-[#1E3B77] border border-[#274685] transition-colors cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                {currentUser.full_name[0]}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white truncate max-w-[120px]">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-teal-300 uppercase font-semibold">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPersonaOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#D5DBE5] p-2 z-50 text-slate-800">
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Demo Persona (1-Click)
                </div>
                <div className="space-y-1 mt-1">
                  {SEED_USERS.map((u) => {
                    const isSelected = u.user_id === currentUser.user_id;
                    return (
                      <button
                        key={u.user_id}
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-teal-50 border border-teal-200' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0B1B3A] truncate">
                            {u.full_name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-white border-r border-[#D5DBE5] p-4 hidden lg:flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Workspace Navigation
            </div>
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPage === item.id ||
                (item.id === 'submissions-new' && currentPage === 'results');

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#139A93] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tenant Info Card */}
          <div className="bg-[#FBFAF7] border border-[#E8E4DC] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-bold text-[#0B1B3A]">Lumora Fitness Inc.</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Active Tenant
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Calm, encouraging brand voice. Strict claim verification active.
            </p>
          </div>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Modals */}
      <EvalModal isOpen={isEvalOpen} onClose={() => setIsEvalOpen(false)} />
      <AiEngineModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
};
