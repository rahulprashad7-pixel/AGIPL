import React, { useState } from 'react';
import {
  Search,
  Bell,
  Building2,
  ShieldCheck,
  UserCheck,
  LogOut,
  ChevronDown,
  AlertTriangle,
  Clock,
  Sparkles,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CompanyCode, COMPANY_NAMES, Asset } from '../../types';
import { INITIAL_USERS } from '../../services/sampleData';

interface HeaderProps {
  selectedCompany: CompanyCode | 'ALL';
  onSelectCompany: (company: CompanyCode | 'ALL') => void;
  onNavigate: (page: any, assetId?: string) => void;
  assets: Asset[];
  onOpenGlobalSearch: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCompany,
  onSelectCompany,
  onNavigate,
  assets,
  onOpenGlobalSearch,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentUser, switchUser, isITManager, firebaseUser, signInWithGoogle, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  const warrantyAlerts = assets.filter((a) => a.warrantyAlert && a.status !== 'RETIRED' && a.status !== 'SCRAPPED');
  const replacementAlerts = assets.filter((a) => a.replacementAlert && a.status !== 'RETIRED' && a.status !== 'SCRAPPED');
  const totalAlerts = warrantyAlerts.length + replacementAlerts.length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left: Organization Selector & Global Search */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Organization Filter Pill */}
        <div className="relative">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800/80">
            <button
              id="org-filter-all"
              onClick={() => onSelectCompany('ALL')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                selectedCompany === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-slate-500" />
              <span>All Orgs</span>
            </button>
            <button
              id="org-filter-agipl"
              onClick={() => onSelectCompany('AGIPL')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                selectedCompany === 'AGIPL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'
              }`}
              title="Accurate Gauging Instrument Pvt. Ltd."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              <span>AGIPL</span>
            </button>
            <button
              id="org-filter-asspl"
              onClick={() => onSelectCompany('ASSPL')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                selectedCompany === 'ASSPL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400'
              }`}
              title="Accurate Sales and Services Pvt. Ltd."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>ASSPL</span>
            </button>
            <button
              id="org-filter-onyx"
              onClick={() => onSelectCompany('ONYX')}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                selectedCompany === 'ONYX'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400'
              }`}
              title="Onyx Precision"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
              <span>ONYX</span>
            </button>
          </div>
        </div>

        {/* Global Search Input */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search Asset ID, Serial, or User..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim().length > 0) {
                onOpenGlobalSearch();
              }
            }}
            className="block w-64 md:w-80 pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Right: Quick Action, Sync, Alerts, and User Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Add Asset Button */}
        <button
          onClick={() => onNavigate('asset-add')}
          className="hidden sm:inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
        >
          <span>+ Add Asset</span>
        </button>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        {/* Firestore Sync Badge */}
        <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 md:flex">
          <Cloud className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Sync Active</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            id="alerts-bell-button"
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Warranty & Replacement Alerts"
          >
            <Bell className="h-4 w-4" />
            {totalAlerts > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Alerts Flyout */}
          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:w-96">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Action Alerts ({totalAlerts})</span>
                </div>
                <span className="text-[11px] text-slate-500">Live inventory monitoring</span>
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto py-2">
                {totalAlerts === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-emerald-500" />
                    All assets have active warranties & healthy lifecycles.
                  </div>
                ) : (
                  <>
                    {warrantyAlerts.map((asset) => (
                      <div
                        key={`w-${asset.id}`}
                        onClick={() => {
                          setShowAlertsMenu(false);
                          onNavigate('asset-details', asset.id);
                        }}
                        className="cursor-pointer rounded-lg border border-amber-100 bg-amber-50/60 p-2.5 text-xs transition-colors hover:bg-amber-100/60 dark:border-amber-900/40 dark:bg-amber-950/30"
                      >
                        <div className="flex items-center justify-between font-semibold text-amber-900 dark:text-amber-300">
                          <span>{asset.assetId} ({asset.company})</span>
                          <span className="text-[10px] uppercase font-bold text-amber-700">Warranty Alert</span>
                        </div>
                        <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                          {asset.manufacturer} {asset.model} • Ends: {asset.warrantyEnd || 'Expired'}
                        </p>
                      </div>
                    ))}

                    {replacementAlerts.map((asset) => (
                      <div
                        key={`r-${asset.id}`}
                        onClick={() => {
                          setShowAlertsMenu(false);
                          onNavigate('asset-details', asset.id);
                        }}
                        className="cursor-pointer rounded-lg border border-rose-100 bg-rose-50/60 p-2.5 text-xs transition-colors hover:bg-rose-100/60 dark:border-rose-900/40 dark:bg-rose-950/30"
                      >
                        <div className="flex items-center justify-between font-semibold text-rose-900 dark:text-rose-300">
                          <span>{asset.assetId} ({asset.company})</span>
                          <span className="text-[10px] uppercase font-bold text-rose-700">Past Life Span</span>
                        </div>
                        <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                          Age: {asset.assetAge} • Expected: {asset.expectedLife} yrs ({asset.expectedReplacementDate})
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowAlertsMenu(false);
                    onNavigate('reports');
                  }}
                  className="w-full rounded-md bg-slate-100 py-1.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  View Full Expiry & Replacement Reports →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Account / Role Menu */}
        <div className="relative">
          <button
            id="user-profile-menu-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 font-semibold text-white dark:bg-blue-600 text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {currentUser.role === 'IT_MANAGER' ? 'IT Manager / Super Admin' : 'IT Support'}
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 pb-2 px-2 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                    isITManager ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}>
                    {isITManager ? '👑 IT Manager (Full Control)' : '🛠️ IT Support'}
                  </span>
                </div>
              </div>

              {/* Quick Role Switcher (For easy evaluation & demonstration) */}
              <div className="py-2">
                <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Active Role Persona
                </p>
                <div className="mt-1 space-y-1">
                  {INITIAL_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                        currentUser.id === u.id
                          ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-500">{u.designation}</div>
                      </div>
                      {currentUser.id === u.id && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Sign In / Out */}
              <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    signInWithGoogle();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>{firebaseUser ? 'Signed In with Google' : 'Sign in with Google Account'}</span>
                </button>
                {firebaseUser && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
