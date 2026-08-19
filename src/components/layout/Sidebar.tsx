import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  PlusCircle,
  UploadCloud,
  FileBarChart2,
  Users2,
  Settings,
  ShieldCheck,
  Laptop,
  Building,
  HardDrive,
  LogOut,
  Sparkles,
  Lock
} from 'lucide-react';
import { PageView, CompanyCode, Asset } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  selectedCompany: CompanyCode | 'ALL';
  assets: Asset[];
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  selectedCompany,
  assets,
  mobileOpen,
  setMobileOpen,
}) => {
  const { currentUser, isITManager } = useAuth();

  const agiplCount = assets.filter((a) => a.company === 'AGIPL').length;
  const assplCount = assets.filter((a) => a.company === 'ASSPL').length;
  const onyxCount = assets.filter((a) => a.company === 'ONYX').length;

  const navItems = [
    {
      id: 'dashboard' as PageView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'assets' as PageView,
      label: 'Assets Inventory',
      icon: Boxes,
      badge: assets.length.toString(),
    },
    {
      id: 'asset-add' as PageView,
      label: 'Add New Asset',
      icon: PlusCircle,
      badge: undefined,
    },
    {
      id: 'import-csv' as PageView,
      label: 'Import CSV',
      icon: UploadCloud,
      badge: undefined,
    },
    {
      id: 'reports' as PageView,
      label: 'Reports & Valuation',
      icon: FileBarChart2,
      badge: undefined,
    },
    {
      id: 'users' as PageView,
      label: 'User Management',
      icon: Users2,
      restricted: !isITManager,
      badge: isITManager ? 'Manager' : 'Locked',
    },
    {
      id: 'settings' as PageView,
      label: 'Settings & Orgs',
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#0f172a] text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            A
          </div>
          <div className="leading-tight">
            <span className="block text-white font-bold text-sm tracking-wide">ACCURATE GROUP</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">IT Asset Inventory</span>
          </div>
        </div>

        {/* Organizations Quick Indicator */}
        <div className="border-b border-slate-800/80 px-4 py-3 bg-slate-900/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            3 Group Organizations
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-md bg-slate-800/80 p-1.5 border border-slate-700/50">
              <div className="text-[10px] font-bold text-blue-400">AGIPL</div>
              <div className="text-xs font-semibold text-white">{agiplCount}</div>
            </div>
            <div className="rounded-md bg-slate-800/80 p-1.5 border border-slate-700/50">
              <div className="text-[10px] font-bold text-emerald-400">ASSPL</div>
              <div className="text-xs font-semibold text-white">{assplCount}</div>
            </div>
            <div className="rounded-md bg-slate-800/80 p-1.5 border border-slate-700/50">
              <div className="text-[10px] font-bold text-purple-400">ONYX</div>
              <div className="text-xs font-semibold text-white">{onyxCount}</div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isLocked = item.restricted;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isLocked
                    ? 'text-slate-500 hover:bg-slate-800/60'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-white' : isLocked ? 'text-slate-600' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isLocked
                        ? 'bg-slate-800 text-slate-500 flex items-center gap-1'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isLocked && <Lock className="h-2.5 w-2.5" />}
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active User Footer */}
        <div className="border-t border-slate-800 p-4 bg-[#0f172a]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser.role === 'IT_MANAGER' ? 'IT Manager / Admin' : 'IT Support Specialist'}
              </p>
            </div>
            {isITManager && (
              <span title="Full Access">
                <ShieldCheck className="h-4 w-4 text-purple-400" />
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
