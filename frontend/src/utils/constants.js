import {
  LayoutDashboard, Package, ShoppingCart, Boxes, Users, BarChart3,
  FileText, Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/sales', label: 'Sales / POS', icon: ShoppingCart },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const CHART_COLORS = ['#0d9488', '#f59e0b', '#6366f1', '#ef4444', '#10b981', '#8b5cf6'];

export const PAYMENT_METHODS = ['cash', 'gcash', 'maya', 'card'];

export const CUSTOMER_TYPES = ['walk-in', 'regular', 'member', 'wholesale'];

export const RISK_COLORS = {
  'OUT OF STOCK': 'danger',
  HIGH: 'danger',
  CRITICAL: 'danger',
  MEDIUM: 'warning',
  LOW: 'success',
};
