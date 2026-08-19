import React, { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PageView, CompanyCode, Asset } from '../../types';
import { Menu, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: PageView;
  onNavigate: (page: PageView, assetId?: string) => void;
  selectedCompany: CompanyCode | 'ALL';
  onSelectCompany: (c: CompanyCode | 'ALL') => void;
  assets: Asset[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  selectedCompany,
  onSelectCompany,
  assets,
  searchQuery,
  setSearchQuery,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        selectedCompany={selectedCompany}
        assets={assets}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header Bar */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-slate-950 px-4 text-white lg:hidden">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span>ACCURATE GROUP IT INVENTORY</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Desktop Top Header */}
        <Header
          selectedCompany={selectedCompany}
          onSelectCompany={onSelectCompany}
          onNavigate={onNavigate}
          assets={assets}
          onOpenGlobalSearch={() => onNavigate('assets')}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
