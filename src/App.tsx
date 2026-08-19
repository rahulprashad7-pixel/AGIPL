import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { AssetsListPage } from './pages/AssetsListPage';
import { AddEditAssetPage } from './pages/AddEditAssetPage';
import { AssetDetailsPage } from './pages/AssetDetailsPage';
import { ImportCsvPage } from './pages/ImportCsvPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { Asset, AuditLog, ServiceRecord, User, CompanyCode, PageView } from './types';
import { DataService } from './services/dataService';
import { Laptop, RefreshCw } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  // Navigation & Scope State
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyCode | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Data Store State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load / Reload Data from DataService
  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [fetchedAssets, fetchedLogs, fetchedServices, fetchedUsers] = await Promise.all([
        DataService.getAssets(),
        DataService.getAuditLogs(),
        DataService.getServiceRecords(),
        DataService.getUsers(),
      ]);
      setAssets(fetchedAssets);
      setAuditLogs(fetchedLogs);
      setServiceRecords(fetchedServices);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Navigate Handler
  const handleNavigate = (page: PageView, assetId?: string) => {
    if (page === 'asset-details' || page === 'asset-edit') {
      if (assetId) setSelectedAssetId(assetId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user navigates to Login page or is not authenticated
  if (currentPage === 'login' || (!isAuthenticated && !isAuthLoading)) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setCurrentPage('dashboard');
          loadData();
        }}
      />
    );
  }

  // Initial Loading Spinner
  if (isAuthLoading || (dataLoading && assets.length === 0)) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/30">
          <Laptop className="h-8 w-8 animate-pulse" />
        </div>
        <h2 className="mt-4 text-base font-bold tracking-wide">ACCURATE GROUP IT ASSET INVENTORY</h2>
        <p className="mt-1 text-xs text-slate-400">Loading multi-organization hardware registry...</p>
        <div className="mt-6 flex items-center gap-2 text-xs text-blue-400">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Synchronizing database...</span>
        </div>
      </div>
    );
  }

  // Active View Render
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            assets={assets}
            auditLogs={auditLogs}
            selectedCompany={selectedCompany}
            onNavigate={handleNavigate}
            onSelectCompany={setSelectedCompany}
          />
        );

      case 'assets':
        return (
          <AssetsListPage
            assets={assets}
            selectedCompany={selectedCompany}
            onSelectCompany={setSelectedCompany}
            onNavigate={handleNavigate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );

      case 'asset-add':
        return (
          <AddEditAssetPage
            assetIdToEdit={null}
            assets={assets}
            onNavigate={handleNavigate}
            onRefreshAssets={loadData}
          />
        );

      case 'asset-edit':
        return (
          <AddEditAssetPage
            assetIdToEdit={selectedAssetId}
            assets={assets}
            onNavigate={handleNavigate}
            onRefreshAssets={loadData}
          />
        );

      case 'asset-details':
        return (
          <AssetDetailsPage
            assetId={selectedAssetId || assets[0]?.id || ''}
            assets={assets}
            auditLogs={auditLogs}
            serviceRecords={serviceRecords}
            onNavigate={handleNavigate}
            onRefreshData={loadData}
          />
        );

      case 'import-csv':
        return (
          <ImportCsvPage
            existingAssets={assets}
            onNavigate={handleNavigate}
            onRefreshData={loadData}
          />
        );

      case 'reports':
        return (
          <ReportsPage
            assets={assets}
            selectedCompany={selectedCompany}
            onNavigate={handleNavigate}
          />
        );

      case 'users':
        return <UsersPage users={users} onRefreshData={loadData} />;

      case 'settings':
        return <SettingsPage onRefreshData={loadData} />;

      default:
        return (
          <DashboardPage
            assets={assets}
            auditLogs={auditLogs}
            selectedCompany={selectedCompany}
            onNavigate={handleNavigate}
            onSelectCompany={setSelectedCompany}
          />
        );
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      selectedCompany={selectedCompany}
      onSelectCompany={setSelectedCompany}
      assets={assets}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
