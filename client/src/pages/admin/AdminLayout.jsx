import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectAdminUsername } from '../../store/authSlice';
import { useState } from 'react';

const navItems = [
  { to: '/admin', icon: '📊', label: 'Tableau de Bord', end: true },
  { to: '/admin/products', icon: '👕', label: 'Produits' },
  { to: '/admin/orders', icon: '📦', label: 'Commandes' },
  { to: '/admin/delivery', icon: '🚚', label: 'Livraison' },
  { to: '/admin/categories', icon: '🏷️', label: 'Catégories' },
  { to: '/admin/colors', icon: '🎨', label: 'Couleurs' },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const username = useSelector(selectAdminUsername);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-dark-100 border-r border-dark-300 flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-dark-300">
          <h1 className="font-display text-2xl font-bold text-white">DBACH</h1>
          <p className="text-gray-500 text-xs mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500'
                    : 'text-gray-400 hover:text-white hover:bg-dark-200'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-brand-500/20 flex items-center justify-center">
              <span className="text-brand-400 text-sm font-bold">{username?.[0]?.toUpperCase()}</span>
            </div>
            <span className="text-gray-400 text-sm">{username}</span>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-gray-600 hover:text-red-400 text-sm transition-colors py-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar mobile */}
        <header className="md:hidden bg-dark-100 border-b border-dark-300 px-4 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="font-display text-white font-bold">DBACH Admin</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
