import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Store, X } from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants.js';
import { useAuth } from '../../hooks/useAuth.js';

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Store size={20} /></div>
        <div className="brand-text">
          <strong>Sari-Sari Analytics</strong>
          <span>Sales & Inventory BA</span>
        </div>
        <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
          <X size={16} />
        </button>
      </div>

      <p className="side-label">Workspace</p>
      <nav className="nav-list">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={label}
            onClick={onClose}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <strong>{user?.username || 'Staff'}</strong><br />
            {user?.role || 'user'} account
          </div>
          <button className="icon-btn" onClick={handleLogout} title="Log out" style={{ color: '#d7f6f1', borderColor: 'rgba(255,255,255,.25)', background: 'transparent' }}>
            <LogOut size={15} />
          </button>
        </div>
        <div style={{ marginTop: 10, opacity: .65 }}>Capstone BA System · v1.0</div>
      </div>
    </aside>
  );
}
