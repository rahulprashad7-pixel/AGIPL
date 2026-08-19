export type CompanyCode = 'AGIPL' | 'ASSPL' | 'ONYX';

export const COMPANY_NAMES: Record<CompanyCode, string> = {
  AGIPL: 'Accurate Gauging Instrument Pvt. Ltd.',
  ASSPL: 'Accurate Sales and Services Pvt. Ltd.',
  ONYX: 'Onyx Precision',
};

export const COMPANY_BADGES: Record<CompanyCode, { bg: string; text: string; border: string }> = {
  AGIPL: { bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', text: 'text-blue-700', border: 'border-blue-200 dark:border-blue-800' },
  ASSPL: { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', text: 'text-emerald-700', border: 'border-emerald-200 dark:border-emerald-800' },
  ONYX: { bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300', text: 'text-purple-700', border: 'border-purple-200 dark:border-purple-800' },
};

export type AssetStatus = 'ACTIVE' | 'IN STOCK' | 'SCRAPPED' | 'UNDER REPAIR' | 'RETIRED';

export const STATUS_COLORS: Record<AssetStatus, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500' },
  'IN STOCK': { bg: 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300', text: 'text-blue-800 dark:text-blue-300', dot: 'bg-blue-500' },
  'UNDER REPAIR': { bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300', text: 'text-amber-800 dark:text-amber-300', dot: 'bg-amber-500' },
  RETIRED: { bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300', text: 'text-slate-800 dark:text-slate-300', dot: 'bg-slate-500' },
  SCRAPPED: { bg: 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300', text: 'text-rose-800 dark:text-rose-300', dot: 'bg-rose-500' },
};

export type Condition = 'NEW' | 'OLD';

export type UserRole = 'IT_MANAGER' | 'IT_SUPPORT' | 'AUDITOR';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  designation: string;
  organization: CompanyCode | 'ALL';
  phone?: string;
  avatarUrl?: string;
  lastLogin?: string;
  active?: boolean;
  allowedCompanies?: CompanyCode[];
}

export type User = UserProfile;

export interface Asset {
  id: string; // Firestore document ID
  assetId: string; // e.g. AGIPL-DSK-001
  company: CompanyCode;
  assetType: string; // Laptop, Desktop, Server, Monitor, Printer, Network Device, UPS, etc.
  assetNumber: string; // Internal tag
  status: AssetStatus;
  condition: Condition;
  
  // Assignment & Location
  assignedEmployeeName: string;
  assetUserName: string;
  department: string;
  location: string;
  ipAddress: string;
  
  // Hardware Specs
  serialNumber: string;
  manufacturer: string;
  model: string;
  processor: string;
  storage: string;
  ram: string;
  motherboard: string;
  display: string;
  displaySize: string;
  lanCard: string;
  upsBattery: string;
  
  // Software Specs
  windowsVersion: string;
  msOffice: string;
  escan: string;
  
  // Financial & Procurement
  vendor: string;
  purchaseDate: string; // YYYY-MM-DD
  purchaseCost: number;
  invoiceNumber: string;
  expectedLife: number; // in years, default 3-5
  expectedReplacementDate: string; // YYYY-MM-DD
  depreciatedValue: number;
  assetAge: string; // e.g. "2 yrs 4 mos"
  
  // Maintenance & Warranties
  warrantyStart: string;
  warrantyEnd: string;
  warrantyAlert: boolean;
  amcStart: string;
  amcEnd: string;
  lastServiceDate: string;
  replacementAlert: boolean;
  remarks: string;
  
  // Meta
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLog {
  id: string;
  assetDocId: string;
  assetId: string;
  company: CompanyCode;
  action: 'CREATED' | 'UPDATED' | 'ASSIGNED' | 'RETURNED' | 'SERVICED' | 'RETIRED' | 'SCRAPPED' | 'IMPORTED';
  details: string;
  performedBy: string;
  performedByEmail: string;
  timestamp: string;
  previousState?: Partial<Asset>;
  newState?: Partial<Asset>;
}

export interface ServiceRecord {
  id: string;
  assetDocId: string;
  assetId: string;
  serviceDate: string;
  serviceType: 'Routine Maintenance' | 'Hardware Repair' | 'Upgrade' | 'Software Fix' | 'Warranty Claim';
  vendor: string;
  cost: number;
  issueDescription: string;
  actionTaken: string;
  partsReplaced: string;
  nextFollowup: string;
  recordedBy: string;
  createdAt: string;
}

export interface CompanySetting {
  id: CompanyCode;
  code: CompanyCode;
  name: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  assetPrefix: string;
  totalAssetsCount?: number;
}

export interface AssetFilterState {
  company: CompanyCode | 'ALL';
  status: AssetStatus | 'ALL';
  assetType: string;
  department: string;
  location: string;
  searchQuery: string;
  warrantyAlertOnly: boolean;
  replacementAlertOnly: boolean;
  condition: Condition | 'ALL';
}

export type PageView =
  | 'dashboard'
  | 'assets'
  | 'asset-add'
  | 'asset-edit'
  | 'asset-details'
  | 'import-csv'
  | 'reports'
  | 'users'
  | 'settings';
