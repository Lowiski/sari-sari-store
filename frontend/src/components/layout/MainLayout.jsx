import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

export default function MainLayout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen ? (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <div className="main-area">
        <Navbar
          sidebarOpen={sidebarOpen}
          onMenu={() => setSidebarOpen((open) => !open)}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
