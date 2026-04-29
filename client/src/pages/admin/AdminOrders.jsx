import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ordersApi } from '../../api';

const STATUS_COLORS = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};
const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};
const ALL_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      if (search) params.search = search;
      const res = await ordersApi.getAll(params);
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-white font-bold">Commandes</h1>
          <p className="text-gray-500 text-sm mt-1">{total} commandes au total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setParam('search', e.target.value)}
          placeholder="Rechercher (numéro, nom, téléphone)..."
          className="input-field flex-1 max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setParam('status', '')}
            className={`px-3 py-2 text-xs uppercase tracking-wider transition-all ${!status ? 'bg-brand-500 text-white' : 'border border-dark-400 text-gray-400 hover:border-brand-500 hover:text-white'}`}
          >Toutes</button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setParam('status', s)}
              className={`px-3 py-2 text-xs uppercase tracking-wider transition-all ${status === s ? 'bg-brand-500 text-white' : 'border border-dark-400 text-gray-400 hover:border-brand-500 hover:text-white'}`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-8 text-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-500">Aucune commande trouvée</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-300 bg-dark-200/50">
                    <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3">N° Commande</th>
                    <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Client</th>
                    <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3 hidden md:table-cell">Articles</th>
                    <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Total</th>
                    <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Statut</th>
                    <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Date</th>
                    <th className="text-right text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} className="border-b border-dark-300/50 hover:bg-dark-200/30 transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-brand-400 font-mono text-sm">{order.orderNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-white text-sm font-medium">{order.customerInfo?.name}</div>
                        <div className="text-gray-500 text-xs">{order.customerInfo?.phone}</div>
                        <div className="text-gray-600 text-xs">{order.customerInfo?.city}</div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-gray-400 text-sm">{order.items?.length} article{order.items?.length > 1 ? 's' : ''}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-brand-400 font-semibold">{order.totalPrice?.toFixed(0)} DT</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell text-gray-500 text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link to={`/admin/orders/${order._id}`} className="text-gray-400 hover:text-brand-400 transition-colors text-sm">
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set('page', i + 1);
                    setSearchParams(p);
                  }}
                  className={`w-9 h-9 text-sm transition-all ${page === i + 1 ? 'bg-brand-500 text-white' : 'border border-dark-400 text-gray-400 hover:border-brand-500 hover:text-white'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
