// Mock data pour les types de base
import type { SalesData, DashboardStats, MenuItem } from "../../types/Dashboard/dashboardItems";
import {
  Grid3X3,
  UsersRound,
  CheckSquare,
  Settings,
  User
} from "lucide-react";

// Dashboard data
export const salesData: SalesData[] = [
  { month: "Jan", value: 150 },
  { month: "Feb", value: 380 },
  { month: "Mar", value: 200 },
  { month: "Apr", value: 280 },
  { month: "May", value: 180 },
  { month: "Jun", value: 190 },
  { month: "Jul", value: 280 },
  { month: "Aug", value: 200 },
  { month: "Sep", value: 380 },
  { month: "Oct", value: 260 },
];

export const dashboardStats: DashboardStats = {
  customers: 3782,
  customerChange: 11.01,
  orders: 5359,
  orderChange: -9.05,
  monthlyTarget: 75.55,
  targetPercentage: 75.55,
  dailyEarnings: 3287,
};

export const menuItems: MenuItem[] = [
  {
    id: "acceuil",
    label: "Acceuil",
    icon: Grid3X3,
    path: "/",
    hasSubmenu: false,
  },
  {
    id: "applications",
    label: "Applications",
    icon: CheckSquare,
    path: "/dashboard/applications",
    hasSubmenu: false
  },
  {
    id: "politique",
    label: "Politique de sécurité",
    icon: Settings,
    path: "/dashboard/politique-securité",
    hasSubmenu: false,
  },
  {
    id: "utilisateur",
    label: "Utilisateur",
    icon: UsersRound,
    path: "/dashboard/users",
    hasSubmenu: false
  },
  {
    id: "roleUser",
    label: "Role utilisateur",
    icon: User,
    path: "/dashboard/user-role",
    hasSubmenu: false
  },
];

