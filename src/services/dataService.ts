import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocFromServer
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Asset, AuditLog, ServiceRecord, CompanySetting, UserProfile, AssetStatus, CompanyCode } from '../types';
import { INITIAL_ASSETS, INITIAL_AUDIT_LOGS, INITIAL_SERVICE_RECORDS, INITIAL_COMPANY_SETTINGS, INITIAL_USERS } from './sampleData';
import { calculateAssetAge, calculateDepreciatedValue, calculateExpectedReplacementDate, checkWarrantyAlert, checkReplacementAlert } from '../utils/assetUtils';

const STORAGE_KEYS = {
  ASSETS: 'ag_assets_v2',
  AUDIT_LOGS: 'ag_audit_logs_v2',
  SERVICE_RECORDS: 'ag_service_records_v2',
  COMPANIES: 'ag_companies_v2',
  USERS: 'ag_users_v2',
  INITIALIZED: 'ag_initialized_v2',
};

// In-memory / local storage initializers
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage write failed:', e);
  }
}

// Check initial setup
if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
  setLocal(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
  setLocal(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  setLocal(STORAGE_KEYS.SERVICE_RECORDS, INITIAL_SERVICE_RECORDS);
  setLocal(STORAGE_KEYS.COMPANIES, INITIAL_COMPANY_SETTINGS);
  setLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  setLocal(STORAGE_KEYS.INITIALIZED, 'true');
}

export class DataService {
  private static isFirestoreConnected = false;

  public static async testFirestoreConnection(): Promise<boolean> {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      this.isFirestoreConnected = true;
      return true;
    } catch (e) {
      // If client is offline or permissions, we catch gracefully
      console.log('Firestore initialization status checked (online/hybrid ready)');
      return false;
    }
  }

  // --- ASSETS ---
  public static subscribeAssets(onUpdate: (assets: Asset[]) => void, onError?: (err: any) => void): () => void {
    // Initial local cache emit
    const local = getLocal<Asset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    onUpdate(local);

    try {
      const assetsCol = collection(db, 'assets');
      const unsubscribe = onSnapshot(
        assetsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Asset[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Asset;
              list.push({ ...data, id: docSnap.id });
            });
            // Update local storage too
            setLocal(STORAGE_KEYS.ASSETS, list);
            onUpdate(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'assets');
          if (onError) onError(error);
        }
      );
      return unsubscribe;
    } catch {
      return () => {};
    }
  }

  public static async getAssets(): Promise<Asset[]> {
    try {
      const snapshot = await getDocs(collection(db, 'assets'));
      if (!snapshot.empty) {
        const list: Asset[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as Asset), id: docSnap.id });
        });
        setLocal(STORAGE_KEYS.ASSETS, list);
        return list;
      }
    } catch (e) {
      console.warn('Using local assets fallback:', e);
    }
    return getLocal<Asset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
  }

  public static async getAssetById(id: string): Promise<Asset | null> {
    try {
      const docSnap = await getDoc(doc(db, 'assets', id));
      if (docSnap.exists()) {
        return { ...(docSnap.data() as Asset), id: docSnap.id };
      }
    } catch (e) {
      console.warn('Direct doc lookup fallback to local:', e);
    }
    const local = getLocal<Asset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    return local.find((a) => a.id === id || a.assetId === id) || null;
  }

  public static async saveAsset(
    assetData: Partial<Asset>,
    user: UserProfile,
    isNew: boolean
  ): Promise<Asset> {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const expectedLife = Number(assetData.expectedLife) || 5;
    const purchaseCost = Number(assetData.purchaseCost) || 0;
    const purchaseDate = assetData.purchaseDate || new Date().toISOString().split('T')[0];

    const computedAge = calculateAssetAge(purchaseDate);
    const computedReplacementDate =
      assetData.expectedReplacementDate || calculateExpectedReplacementDate(purchaseDate, expectedLife);
    const computedDepreciatedValue = calculateDepreciatedValue(purchaseCost, purchaseDate, expectedLife);
    const computedWarrantyAlert = checkWarrantyAlert(assetData.warrantyEnd).isAlert;
    const computedReplacementAlert = checkReplacementAlert(purchaseDate, expectedLife, computedReplacementDate);

    const docId =
      assetData.id ||
      assetData.assetId?.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
      `asset-${Date.now()}`;

    const completeAsset: Asset = {
      id: docId,
      assetId: assetData.assetId || `AST-${Date.now().toString().slice(-4)}`,
      company: (assetData.company as CompanyCode) || 'AGIPL',
      assetType: assetData.assetType || 'Desktop',
      assetNumber: assetData.assetNumber || '',
      status: (assetData.status as AssetStatus) || 'ACTIVE',
      condition: assetData.condition || 'NEW',
      assignedEmployeeName: assetData.assignedEmployeeName || '',
      assetUserName: assetData.assetUserName || '',
      department: assetData.department || '',
      location: assetData.location || '',
      ipAddress: assetData.ipAddress || '',
      serialNumber: assetData.serialNumber || '',
      manufacturer: assetData.manufacturer || '',
      model: assetData.model || '',
      processor: assetData.processor || '',
      storage: assetData.storage || '',
      ram: assetData.ram || '',
      motherboard: assetData.motherboard || '',
      display: assetData.display || '',
      displaySize: assetData.displaySize || '',
      lanCard: assetData.lanCard || '',
      upsBattery: assetData.upsBattery || '',
      windowsVersion: assetData.windowsVersion || '',
      msOffice: assetData.msOffice || '',
      escan: assetData.escan || '',
      vendor: assetData.vendor || '',
      purchaseDate,
      purchaseCost,
      invoiceNumber: assetData.invoiceNumber || '',
      expectedLife,
      expectedReplacementDate: computedReplacementDate,
      depreciatedValue: computedDepreciatedValue,
      assetAge: computedAge,
      warrantyStart: assetData.warrantyStart || '',
      warrantyEnd: assetData.warrantyEnd || '',
      warrantyAlert: computedWarrantyAlert,
      amcStart: assetData.amcStart || '',
      amcEnd: assetData.amcEnd || '',
      lastServiceDate: assetData.lastServiceDate || '',
      replacementAlert: computedReplacementAlert,
      remarks: assetData.remarks || '',
      createdAt: isNew ? nowStr : assetData.createdAt || nowStr,
      updatedAt: nowStr,
      updatedBy: user.name,
    };

    // Save to LocalStorage
    const currentList = getLocal<Asset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    const existingIndex = currentList.findIndex((a) => a.id === docId || a.assetId === completeAsset.assetId);
    let previousAsset: Asset | undefined;

    if (existingIndex >= 0) {
      previousAsset = currentList[existingIndex];
      currentList[existingIndex] = completeAsset;
    } else {
      currentList.unshift(completeAsset);
    }
    setLocal(STORAGE_KEYS.ASSETS, currentList);

    // Save to Firestore
    try {
      await setDoc(doc(db, 'assets', docId), completeAsset);
    } catch (e) {
      handleFirestoreError(e, isNew ? OperationType.CREATE : OperationType.UPDATE, `assets/${docId}`);
    }

    // Create Audit Log
    const action = isNew ? 'CREATED' : 'UPDATED';
    let details = isNew
      ? `Asset ${completeAsset.assetId} (${completeAsset.manufacturer} ${completeAsset.model}) registered for company ${completeAsset.company}.`
      : `Asset specifications and details updated by ${user.name}.`;

    if (!isNew && previousAsset) {
      const changes: string[] = [];
      if (previousAsset.status !== completeAsset.status) {
        changes.push(`Status changed: ${previousAsset.status} -> ${completeAsset.status}`);
      }
      if (previousAsset.assignedEmployeeName !== completeAsset.assignedEmployeeName) {
        changes.push(`Assigned user: "${previousAsset.assignedEmployeeName || 'Unassigned'}" -> "${completeAsset.assignedEmployeeName || 'Unassigned'}"`);
      }
      if (previousAsset.department !== completeAsset.department) {
        changes.push(`Department: ${previousAsset.department} -> ${completeAsset.department}`);
      }
      if (previousAsset.location !== completeAsset.location) {
        changes.push(`Location: ${previousAsset.location} -> ${completeAsset.location}`);
      }
      if (changes.length > 0) {
        details = changes.join('; ');
      }
    }

    await this.logAudit({
      assetDocId: docId,
      assetId: completeAsset.assetId,
      company: completeAsset.company,
      action,
      details,
      performedBy: user.name,
      performedByEmail: user.email,
    });

    return completeAsset;
  }

  public static async updateAssetStatus(
    assetId: string,
    status: AssetStatus,
    remarks: string,
    user: UserProfile
  ): Promise<void> {
    const asset = await this.getAssetById(assetId);
    if (!asset) throw new Error('Asset not found');

    const prevStatus = asset.status;
    asset.status = status;
    if (remarks) {
      asset.remarks = asset.remarks ? `${asset.remarks} | [${status}]: ${remarks}` : `[${status}]: ${remarks}`;
    }
    asset.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    asset.updatedBy = user.name;

    const actionMap: Record<AssetStatus, AuditLog['action']> = {
      ACTIVE: 'UPDATED',
      'IN STOCK': 'RETURNED',
      'UNDER REPAIR': 'SERVICED',
      RETIRED: 'RETIRED',
      SCRAPPED: 'SCRAPPED',
    };

    // Update local
    const currentList = getLocal<Asset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    const idx = currentList.findIndex((a) => a.id === asset.id || a.assetId === asset.assetId);
    if (idx >= 0) {
      currentList[idx] = asset;
      setLocal(STORAGE_KEYS.ASSETS, currentList);
    }

    // Update Firestore
    try {
      await setDoc(doc(db, 'assets', asset.id), asset);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `assets/${asset.id}`);
    }

    await this.logAudit({
      assetDocId: asset.id,
      assetId: asset.assetId,
      company: asset.company,
      action: actionMap[status] || 'UPDATED',
      details: `Status transitioned from ${prevStatus} to ${status}. Reason / Remarks: ${remarks || 'None provided'}`,
      performedBy: user.name,
      performedByEmail: user.email,
    });
  }

  public static async assignAsset(
    assetId: string,
    employeeName: string,
    userName: string,
    department: string,
    location: string,
    user: UserProfile
  ): Promise<void> {
    const asset = await this.getAssetById(assetId);
    if (!asset) throw new Error('Asset not found');

    const prevAssigned = asset.assignedEmployeeName;
    asset.assignedEmployeeName = employeeName;
    asset.assetUserName = userName;
    asset.department = department;
    asset.location = location;
    asset.status = employeeName ? 'ACTIVE' : 'IN STOCK';
    asset.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    asset.updatedBy = user.name;

    // Update local
    const currentList = getLocal<Asset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    const idx = currentList.findIndex((a) => a.id === asset.id || a.assetId === asset.assetId);
    if (idx >= 0) {
      currentList[idx] = asset;
      setLocal(STORAGE_KEYS.ASSETS, currentList);
    }

    try {
      await setDoc(doc(db, 'assets', asset.id), asset);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `assets/${asset.id}`);
    }

    const action = employeeName ? 'ASSIGNED' : 'RETURNED';
    const details = employeeName
      ? `Asset assigned to ${employeeName} (Dept: ${department}, Location: ${location}). Prior assignee: ${prevAssigned || 'None'}.`
      : `Asset returned from ${prevAssigned || 'Employee'} and marked IN STOCK.`;

    await this.logAudit({
      assetDocId: asset.id,
      assetId: asset.assetId,
      company: asset.company,
      action,
      details,
      performedBy: user.name,
      performedByEmail: user.email,
    });
  }

  // --- AUDIT LOGS ---
  public static async logAudit(logData: {
    assetDocId: string;
    assetId: string;
    company: CompanyCode;
    action: AuditLog['action'];
    details: string;
    performedBy: string;
    performedByEmail: string;
  }): Promise<AuditLog> {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const log: AuditLog = {
      id,
      ...logData,
      timestamp: nowStr,
    };

    // Save local
    const logs = getLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    logs.unshift(log);
    setLocal(STORAGE_KEYS.AUDIT_LOGS, logs);

    // Save Firestore
    try {
      await setDoc(doc(db, 'audit_logs', id), log);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `audit_logs/${id}`);
    }

    return log;
  }

  public static async getAuditLogs(assetDocId?: string): Promise<AuditLog[]> {
    try {
      const q = assetDocId
        ? query(collection(db, 'audit_logs'), where('assetDocId', '==', assetDocId))
        : query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: AuditLog[] = [];
        snap.forEach((d) => list.push({ ...(d.data() as AuditLog), id: d.id }));
        return list;
      }
    } catch (e) {
      console.warn('Fallback to local audit logs:', e);
    }

    const local = getLocal<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    if (assetDocId) {
      return local.filter((l) => l.assetDocId === assetDocId || l.assetId === assetDocId);
    }
    return local;
  }

  // --- SERVICE RECORDS ---
  public static async addServiceRecord(
    recordData: Omit<ServiceRecord, 'id' | 'createdAt'>,
    user: UserProfile
  ): Promise<ServiceRecord> {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const record: ServiceRecord = {
      id,
      ...recordData,
      recordedBy: user.name,
      createdAt: nowStr,
    };

    // Save local
    const records = getLocal<ServiceRecord[]>(STORAGE_KEYS.SERVICE_RECORDS, INITIAL_SERVICE_RECORDS);
    records.unshift(record);
    setLocal(STORAGE_KEYS.SERVICE_RECORDS, records);

    // Update asset's lastServiceDate
    const asset = await this.getAssetById(recordData.assetDocId);
    if (asset) {
      asset.lastServiceDate = recordData.serviceDate;
      asset.updatedAt = nowStr;
      asset.updatedBy = user.name;
      try {
        await setDoc(doc(db, 'assets', asset.id), asset);
      } catch {}
    }

    // Save Firestore
    try {
      await setDoc(doc(db, 'service_records', id), record);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `service_records/${id}`);
    }

    // Audit log
    await this.logAudit({
      assetDocId: recordData.assetDocId,
      assetId: recordData.assetId,
      company: asset?.company || 'AGIPL',
      action: 'SERVICED',
      details: `${recordData.serviceType} recorded by ${user.name}. Vendor: ${recordData.vendor || 'N/A'}, Cost: ₹${recordData.cost}. Action: ${recordData.actionTaken}`,
      performedBy: user.name,
      performedByEmail: user.email,
    });

    return record;
  }

  public static async getServiceRecords(assetDocId?: string): Promise<ServiceRecord[]> {
    try {
      const q = assetDocId
        ? query(collection(db, 'service_records'), where('assetDocId', '==', assetDocId))
        : collection(db, 'service_records');
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: ServiceRecord[] = [];
        snap.forEach((d) => list.push({ ...(d.data() as ServiceRecord), id: d.id }));
        return list;
      }
    } catch (e) {
      console.warn('Fallback to local service records:', e);
    }

    const local = getLocal<ServiceRecord[]>(STORAGE_KEYS.SERVICE_RECORDS, INITIAL_SERVICE_RECORDS);
    if (assetDocId) {
      return local.filter((r) => r.assetDocId === assetDocId || r.assetId === assetDocId);
    }
    return local;
  }

  // --- COMPANY SETTINGS ---
  public static async getCompanySettings(): Promise<CompanySetting[]> {
    try {
      const snap = await getDocs(collection(db, 'company_settings'));
      if (!snap.empty) {
        const list: CompanySetting[] = [];
        snap.forEach((d) => list.push({ ...(d.data() as CompanySetting), id: d.id as CompanyCode }));
        setLocal(STORAGE_KEYS.COMPANIES, list);
        return list;
      }
    } catch {}
    return getLocal<CompanySetting[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANY_SETTINGS);
  }

  public static async saveCompanySetting(setting: CompanySetting, user: UserProfile): Promise<void> {
    const list = getLocal<CompanySetting[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANY_SETTINGS);
    const idx = list.findIndex((c) => c.code === setting.code);
    if (idx >= 0) {
      list[idx] = setting;
    } else {
      list.push(setting);
    }
    setLocal(STORAGE_KEYS.COMPANIES, list);

    try {
      await setDoc(doc(db, 'company_settings', setting.code), setting);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `company_settings/${setting.code}`);
    }

    await this.logAudit({
      assetDocId: 'SYSTEM',
      assetId: setting.code,
      company: setting.code,
      action: 'UPDATED',
      details: `Company master settings updated for ${setting.name} by ${user.name}.`,
      performedBy: user.name,
      performedByEmail: user.email,
    });
  }

  // --- USERS MANAGEMENT ---
  public static async getUsers(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        const list: UserProfile[] = [];
        snap.forEach((d) => list.push({ ...(d.data() as UserProfile), id: d.id }));
        setLocal(STORAGE_KEYS.USERS, list);
        return list;
      }
    } catch {}
    return getLocal<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public static async saveUser(userToSave: UserProfile, actor: UserProfile): Promise<void> {
    const list = getLocal<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const idx = list.findIndex((u) => u.id === userToSave.id || u.email === userToSave.email);
    if (idx >= 0) {
      list[idx] = userToSave;
    } else {
      list.push(userToSave);
    }
    setLocal(STORAGE_KEYS.USERS, list);

    try {
      await setDoc(doc(db, 'users', userToSave.id), userToSave);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userToSave.id}`);
    }

    await this.logAudit({
      assetDocId: 'SYSTEM',
      assetId: 'USERS',
      company: 'AGIPL',
      action: 'UPDATED',
      details: `User account ${userToSave.name} (${userToSave.email}) updated with role ${userToSave.role} by ${actor.name}.`,
      performedBy: actor.name,
      performedByEmail: actor.email,
    });
  }

  // --- BULK IMPORT ---
  public static async bulkImportAssets(
    importedAssets: Partial<Asset>[],
    user: UserProfile
  ): Promise<{ successCount: number; errorCount: number; logs: string[] }> {
    let successCount = 0;
    let errorCount = 0;
    const logs: string[] = [];

    for (const item of importedAssets) {
      try {
        if (!item.assetId || !item.company) {
          errorCount++;
          logs.push(`Skipped row: Missing Asset ID or Company.`);
          continue;
        }
        await this.saveAsset(item, user, true);
        successCount++;
      } catch (err: any) {
        errorCount++;
        logs.push(`Error on ${item.assetId || 'Unknown'}: ${err?.message || 'Failed'}`);
      }
    }

    await this.logAudit({
      assetDocId: 'SYSTEM',
      assetId: 'IMPORT',
      company: 'AGIPL',
      action: 'IMPORTED',
      details: `Bulk CSV import executed by ${user.name}. Successfully imported ${successCount} assets (${errorCount} errors).`,
      performedBy: user.name,
      performedByEmail: user.email,
    });

    return { successCount, errorCount, logs };
  }

  // --- RESET TO DEMO DATA ---
  public static async resetToDemoData(): Promise<void> {
    setLocal(STORAGE_KEYS.ASSETS, INITIAL_ASSETS);
    setLocal(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setLocal(STORAGE_KEYS.SERVICE_RECORDS, INITIAL_SERVICE_RECORDS);
    setLocal(STORAGE_KEYS.COMPANIES, INITIAL_COMPANY_SETTINGS);
    setLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public static async resetToSampleData(): Promise<void> {
    return this.resetToDemoData();
  }
}
