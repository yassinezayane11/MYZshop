import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../../api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'badge-pending', confirmed: 'badge-confirmed',
  shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};
const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée',
  shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};
const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered'];

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    ordersApi.getById(id).then(r => setOrder(r.data)).finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (newStatus) => {
    if (!confirm(`Passer la commande au statut "${STATUS_LABELS[newStatus]}" ?`)) return;
    setUpdating(true);
    try {
      const res = await ordersApi.updateStatus(id, newStatus, note);
      setOrder(res.data);
      setNote('');
      toast.success('Statut mis à jour !');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!order) return <div className="text-center py-20"><p className="text-gray-500">Commande introuvable</p></div>;

  const currentStatusIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentStatusIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentStatusIdx + 1] : null;

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/orders" className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="font-display text-3xl text-white font-bold">Commande {order.orderNumber}</h1>
          <span className={`badge ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="md:col-span-2 flex flex-col gap-5">
          {/* Customer info */}
          <div className="card p-5">
            <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-4">Informations Client</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-gray-500 text-xs mb-1">Nom</p>
                <p className="text-white">{order.customerInfo.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Téléphone</p>
                <a href={`tel:${order.customerInfo.phone}`} className="text-brand-400 hover:text-brand-300">
                  {order.customerInfo.phone}
                </a>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500 text-xs mb-1">Adresse</p>
                <p className="text-white">{order.customerInfo.address}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Ville</p>
                <p className="text-white">{order.customerInfo.city}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Type de livraison</p>
                <p className="text-white capitalize">{order.customerInfo.deliveryType === 'home' ? '🏠 Domicile' : '📦 Point relais'}</p>
              </div>
              {order.customerInfo.notes && (
                <div className="sm:col-span-2">
                  <p className="text-gray-500 text-xs mb-1">Notes</p>
                  <p className="text-gray-300 italic">"{order.customerInfo.notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="card p-5">
            <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-4">Articles commandés</h3>
            <div className="flex flex-col gap-4">
              {order.items.map((item, i) => {
                const imgSrc = item.productImage?.startsWith('http')
                  ? item.productImage
                  : item.productImage ? `${API_URL}${item.productImage}` : null;
                return (
                  <div key={i} className="flex gap-4 items-center pb-4 border-b border-dark-300 last:border-0">
                    <div className="w-14 h-16 bg-dark-300 shrink-0 overflow-hidden">
                      <img
                        src={imgSrc || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100'}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100'; }}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{item.productName}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        Taille: <span className="text-gray-300">{item.size}</span> ·
                        Couleur: <span className="text-gray-300">{item.color}</span> ·
                        Qté: <span className="text-gray-300">{item.quantity}</span>
                      </p>
                      <p className="text-gray-500 text-xs">{item.price} DT / unité</p>
                    </div>
                    <span className="text-brand-400 font-semibold">{(item.price * item.quantity).toFixed(0)} DT</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-dark-300 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Sous-total</span>
                <span>{order.subtotal.toFixed(0)} DT</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Livraison</span>
                <span>{order.deliveryPrice.toFixed(0)} DT</span>
              </div>
              <div className="flex justify-between text-white font-bold text-base border-t border-dark-300 pt-2 mt-1">
                <span>Total</span>
                <span className="text-brand-400">{order.totalPrice.toFixed(0)} DT</span>
              </div>
            </div>
          </div>

          {/* Status history */}
          <div className="card p-5">
            <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-4">Historique</h3>
            <div className="flex flex-col gap-3">
              {order.statusHistory?.map((h, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-white text-sm">{STATUS_LABELS[h.status]}</p>
                    {h.note && <p className="text-gray-500 text-xs italic">"{h.note}"</p>}
                    <p className="text-gray-600 text-xs">{new Date(h.date).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex flex-col gap-5">
          <div className="card p-5">
            <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-4">Mettre à jour le statut</h3>

            <div className="mb-4">
              <label className="text-gray-400 text-xs mb-2 block">Note interne (optionnel)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ajouter une note..."
                rows={2}
                className="input-field text-sm resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              {nextStatus && (
                <button
                  onClick={() => updateStatus(nextStatus)}
                  disabled={updating}
                  className="btn-primary w-full text-sm py-3"
                >
                  {updating ? '...' : `→ ${STATUS_LABELS[nextStatus]}`}
                </button>
              )}
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button
                  onClick={() => updateStatus('cancelled')}
                  disabled={updating}
                  className="w-full py-3 text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider"
                >
                  Annuler la commande
                </button>
              )}

              {/* All status options */}
              <div className="mt-3 border-t border-dark-300 pt-3">
                <p className="text-gray-600 text-xs mb-2 uppercase tracking-wider">Forcer le statut:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => updateStatus(key)}
                      disabled={updating || order.status === key}
                      className={`px-2 py-1 text-xs transition-all ${order.status === key ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'border border-dark-400 text-gray-500 hover:border-brand-500 hover:text-white'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 text-sm text-gray-500">
            <p className="mb-1">Passée le:</p>
            <p className="text-white">{new Date(order.createdAt).toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
