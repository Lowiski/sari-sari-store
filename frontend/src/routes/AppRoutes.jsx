import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import MainLayout from '../components/layout/MainLayout.jsx';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Products from '../pages/Products.jsx';
import Sales from '../pages/Sales.jsx';
import Inventory from '../pages/Inventory.jsx';
import Customers from '../pages/Customers.jsx';
import Analytics from '../pages/Analytics.jsx';
import Reports from '../pages/Reports.jsx';
import Settings from '../pages/Settings.jsx';

function Protected({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Guest({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Guest><Login /></Guest>} />
      <Route
        element={<Protected><MainLayout /></Protected>}
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
