import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants.js';
import { useAuth } from '../../hooks/useAuth.js';
import { formatDate } from '../../utils/formatDate.js';

const DESCRIPTIONS = {
  '/dashboard': 'Business analytics overview',
  '/products': 'Catalog, pricing and stock levels',
  '/sales': 'Point of sale and transaction history',
  '/inventory': 'Stock movements and low-stock alerts',
  '/customers': 'Customer master file and segments',
  '/analytics': 'Descriptive · Predictive · Prescriptive',
  '/reports': 'Exportable sales and inventory reports',
  '/settings': 'System and project information',
};

export default function Navbar({ sidebarOpen = false, onMenu = () => {} }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.to));
  const title = current?.label || 'Dashboard';

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button
          className="icon-btn menu-btn"
          onClick={onMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={sidebarOpen}
        >
          <Menu size={18} />
        </button>
        <div className="topbar-heading">
          <div className="topbar-title">{title}</div>
          <div className="topbar-sub">
            {DESCRIPTIONS[pathname] || current?.label || ''} · {formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
      <div className="topbar-right">
        <span className="top-chip"><span className="dot" /> Neon DB connected</span>
        <button className="icon-btn" title="Notifications"><Bell size={16} /></button>
        <div className="user-pill">
          <div className="avatar">{(user?.username || 'U').slice(0, 2).toUpperCase()}</div>
          <span>{user?.username || 'Staff'}</span>
        </div>
      </div>
    </header>
  );
}
