import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../api';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};
const STATUS_ICONS = { pending: '⏳', confirmed: '✅', shipped: '🚚', delivered: '🎉', cancelled: '❌' };

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi.track(orderNumber)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h2 className="font-display text-3xl text-white mb-3">Commande introuvable</h2>
          <Link to="/" className="btn-primary inline-block mt-4">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="pt-20 min-h-screen animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand-500/10 border-2 border-brand-500/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            Commande Confirmée !
          </h1>
          <p className="text-gray-400">
            Merci <strong className="text-white">{order.customerInfo.name}</strong> ! Votre commande a bien été reçue.
          </p>
          <div className="mt-4 inline-block bg-dark-200 border border-dark-400 px-5 py-2">
            <span className="text-gray-500 text-sm">Numéro de commande: </span>
            <span className="text-brand-400 font-mono font-bold text-lg">{order.orderNumber}</span>
          </div>
        </div>

        {/* Status tracker */}
        {order.status !== 'cancelled' && (
          <div className="card p-6 mb-6">
            <h3 className="text-white font-medium mb-6 uppercase tracking-widest text-xs">Suivi de Commande</h3>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                      i <= stepIndex
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : 'border-dark-400 text-gray-600'
                    }`}>
                      {i <= stepIndex ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs mt-2 text-center ${i <= stepIndex ? 'text-brand-400' : 'text-gray-600'}`}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 ${i < stepIndex ? 'bg-brand-500' : 'bg-dark-400'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Customer info */}
          <div className="card p-5">
            <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-4">Livraison</h3>
            <div className="flex flex-col gap-1">
              <p className="text-white font-medium">{order.customerInfo.name}</p>
              <p className="text-gray-400 text-sm">📞 {order.customerInfo.phone}</p>
              <p className="text-gray-400 text-sm">📍 {order.customerInfo.address}</p>
              <p className="text-gray-400 text-sm">🏙️ {order.customerInfo.city}</p>
              {order.customerInfo.notes && (
                <p className="text-gray-500 text-sm mt-1 italic">"{order.customerInfo.notes}"</p>
              )}
            </div>
          </div>

          {/* Price summary */}
          <div className="card p-5">
            <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-4">Récapitulatif</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sous-total</span>
                <span className="text-white">{order.subtotal.toFixed(0)} DT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Livraison</span>
                <span className="text-white">{order.deliveryPrice.toFixed(0)} DT</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-dark-300">
                <span className="text-white">Total</span>
                <span className="text-brand-400 text-lg">{order.totalPrice.toFixed(0)} DT</span>
              </div>
              <p className="text-gray-600 text-xs mt-1">💵 Paiement à la livraison</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card p-5 mb-8">
          <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-4">Articles commandés</h3>
          <div className="flex flex-col gap-4">
            {order.items.map((item, i) => {
              const imgSrc = item.productImage?.startsWith('http')
                ? item.productImage
                : item.productImage ? `${API_URL}${item.productImage}` : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200';
              return (
                <div key={i} className="flex gap-3 items-center pb-3 border-b border-dark-300 last:border-0">
                  <div className="w-14 h-16 shrink-0 overflow-hidden bg-dark-200">
                    <img
                      src={imgSrc}
                      alt={item.productName}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100'; }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item.productName}</p>
                    <p className="text-gray-500 text-xs">{item.size} · {item.color} · ×{item.quantity}</p>
                  </div>
                  <span className="text-gray-400 text-sm">{(item.price * item.quantity).toFixed(0)} DT</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary text-center">
            Retour à l'Accueil
          </Link>
          <Link to="/products" className="btn-secondary text-center">
            Continuer les Achats
          </Link>
        </div>
      </div>
    </div>
  );
}
