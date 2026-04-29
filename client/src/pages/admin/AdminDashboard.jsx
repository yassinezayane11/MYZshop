import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';

const STATUS_COLORS = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  shipped: 'badge-shipped',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
};
const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = [
    { label: 'Commandes Total', value: stats?.totalOrders ?? 0, icon: '📦', to: '/admin/orders', color: 'text-blue-400' },
    { label: 'En Attente', value: stats?.pendingOrders ?? 0, icon: '⏳', to: '/admin/orders?status=pending', color: 'text-yellow-400' },
    { label: 'Produits Actifs', value: stats?.totalProducts ?? 0, icon: '👕', to: '/admin/products', color: 'text-green-400' },
    { label: 'Chiffre d\'Affaires', value: `${(stats?.totalRevenue ?? 0).toFixed(0)} DT`, icon: '💰', to: '/admin/orders', color: 'text-brand-400' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white font-bold">Tableau de Bord</h1>
        <p className="text-gray-500 text-sm mt-1">Bienvenue sur votre panneau d'administration DBACH</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <Link key={card.label} to={card.to} className="card p-5 hover:border-brand-600/50 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className={`text-2xl font-bold font-mono mb-1 ${card.color}`}>{card.value}</div>
            <div className="text-gray-500 text-xs uppercase tracking-wider">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="p-5 border-b border-dark-300 flex items-center justify-between">
          <h2 className="font-display text-xl text-white">Commandes Récentes</h2>
          <Link to="/admin/orders" className="text-brand-500 hover:text-brand-400 text-sm transition-colors">Voir tout →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-300">
                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3">N° Commande</th>
                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Client</th>
                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Total</th>
                <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-600 py-8">Aucune commande</td>
                </tr>
              )}
              {stats?.recentOrders?.map(order => (
                <tr key={order._id} className="border-b border-dark-300/50 hover:bg-dark-200/50 transition-colors">
                  <td className="px-5 py-4">
                    <Link to={`/admin/orders/${order._id}`} className="text-brand-400 hover:text-brand-300 font-mono text-sm">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-white text-sm">{order.customerInfo?.name}</div>
                    <div className="text-gray-500 text-xs">{order.customerInfo?.city}</div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-gray-300 text-sm">{order.totalPrice?.toFixed(0)} DT</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Link to="/admin/products/new" className="card p-5 hover:border-brand-600/50 transition-all flex items-center gap-4 group">
          <div className="w-10 h-10 bg-brand-500/10 flex items-center justify-center text-xl">➕</div>
          <div>
            <p className="text-white font-medium text-sm">Ajouter un produit</p>
            <p className="text-gray-500 text-xs">Créer une nouvelle fiche</p>
          </div>
        </Link>
        <Link to="/admin/orders?status=pending" className="card p-5 hover:border-yellow-500/30 transition-all flex items-center gap-4 group">
          <div className="w-10 h-10 bg-yellow-500/10 flex items-center justify-center text-xl">⏳</div>
          <div>
            <p className="text-white font-medium text-sm">Commandes en attente</p>
            <p className="text-gray-500 text-xs">{stats?.pendingOrders} à traiter</p>
          </div>
        </Link>
        <Link to="/admin/delivery" className="card p-5 hover:border-blue-500/30 transition-all flex items-center gap-4 group">
          <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center text-xl">🚚</div>
          <div>
            <p className="text-white font-medium text-sm">Config. Livraison</p>
            <p className="text-gray-500 text-xs">Prix par ville</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
