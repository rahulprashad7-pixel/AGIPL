export function formatCurrencyINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function calculateAssetAge(purchaseDateStr?: string): string {
  if (!purchaseDateStr) return 'Unknown';
  try {
    const purchase = new Date(purchaseDateStr);
    const now = new Date();
    if (isNaN(purchase.getTime()) || purchase > now) return '0 months';
    
    let years = now.getFullYear() - purchase.getFullYear();
    let months = now.getMonth() - purchase.getMonth();
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    if (months === 0) {
      return `${years} ${years === 1 ? 'yr' : 'yrs'}`;
    }
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
  } catch {
    return 'Unknown';
  }
}

export function calculateDepreciatedValue(
  purchaseCost: number,
  purchaseDateStr?: string,
  expectedLifeYears: number = 5,
  salvagePercentage: number = 0.05
): number {
  if (!purchaseCost || purchaseCost <= 0) return 0;
  if (!purchaseDateStr) return purchaseCost;
  
  try {
    const purchase = new Date(purchaseDateStr);
    const now = new Date();
    if (isNaN(purchase.getTime())) return purchaseCost;
    
    const diffMs = now.getTime() - purchase.getTime();
    if (diffMs <= 0) return purchaseCost;
    
    const ageInYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    const salvageValue = purchaseCost * salvagePercentage;
    const depreciableBase = purchaseCost - salvageValue;
    
    const yearlyDepreciation = depreciableBase / (expectedLifeYears || 5);
    const totalDepreciation = yearlyDepreciation * ageInYears;
    
    const currentValue = purchaseCost - totalDepreciation;
    return Math.max(Math.round(currentValue), Math.round(salvageValue));
  } catch {
    return purchaseCost;
  }
}

export function calculateExpectedReplacementDate(purchaseDateStr?: string, expectedLifeYears: number = 5): string {
  if (!purchaseDateStr) return '';
  try {
    const d = new Date(purchaseDateStr);
    if (isNaN(d.getTime())) return '';
    d.setFullYear(d.getFullYear() + (expectedLifeYears || 5));
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export function checkWarrantyAlert(warrantyEndDateStr?: string): { isAlert: boolean; status: 'EXPIRED' | 'EXPIRING_SOON' | 'ACTIVE' | 'NONE'; daysLeft?: number } {
  if (!warrantyEndDateStr) return { isAlert: false, status: 'NONE' };
  try {
    const end = new Date(warrantyEndDateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (isNaN(end.getTime())) return { isAlert: false, status: 'NONE' };
    
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { isAlert: true, status: 'EXPIRED', daysLeft: diffDays };
    }
    if (diffDays <= 60) {
      return { isAlert: true, status: 'EXPIRING_SOON', daysLeft: diffDays };
    }
    return { isAlert: false, status: 'ACTIVE', daysLeft: diffDays };
  } catch {
    return { isAlert: false, status: 'NONE' };
  }
}

export function checkReplacementAlert(purchaseDateStr?: string, expectedLifeYears: number = 5, replacementDateStr?: string): boolean {
  if (replacementDateStr) {
    const repDate = new Date(replacementDateStr);
    if (!isNaN(repDate.getTime())) {
      const now = new Date();
      return repDate <= now;
    }
  }
  if (purchaseDateStr) {
    const purchase = new Date(purchaseDateStr);
    if (!isNaN(purchase.getTime())) {
      const ageMs = Date.now() - purchase.getTime();
      const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
      return ageYears >= (expectedLifeYears || 5);
    }
  }
  return false;
}
