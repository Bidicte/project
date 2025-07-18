/* eslint-disable @typescript-eslint/no-explicit-any */
// ===== src/types/index.ts (Mise à jour) =====
export interface SalesData {
  month: string;
  value: number;
}

export interface DashboardStats {
  customers: number;
  customerChange: number;
  orders: number;
  orderChange: number;
  monthlyTarget: number;
  targetPercentage: number;
  dailyEarnings: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  hasSubmenu: boolean;
  submenuItems?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  label: string;
  path: string;
  hasSubmenu?: boolean;
  submenuItems?: SubMenuItem[];
}

