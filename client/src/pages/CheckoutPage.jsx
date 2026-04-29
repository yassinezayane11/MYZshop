import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { selectCartItems, selectCartSubtotal, clearCart } from '../store/cartSlice';
import { ordersApi, deliveryApi } from '../api';

const TUNISIAN_CITIES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
  'Béja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
  'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine',
  'Tataouine', 'Gafsa', 'Tozeur', 'Kébili',
];

export default function CheckoutPage() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', deliveryType: 'home', notes: '',
  });
  const [deliveryInfo, setDeliveryInfo] = useState({ price: 8, estimatedDays: '2-3' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items]);

  useEffect(() => {
    if (form.city) {
      deliveryApi.getPriceForCity(form.city).then(r => {
        setDeliveryInfo({ price: r.data.price, estimatedDays: r.data.estimatedDays });
      }).catch(() => {});
    }
  }, [form.city]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.phone.trim() || !/^[0-9+\s-]{8,15}$/.test(form.phone.trim())) e.phone = 'Téléphone invalide';
    if (!form.address.trim()) e.address = 'Adresse requise';
    if (!form.city) e.city = 'Ville requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const orderData = {
        customerInfo: form,
        items: items.map(i => ({
          productId: i.productId,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
      };

      const res = await ordersApi.create(orderData);
      dispatch(clearCart());
      navigate(`/order-confirmation/${res.data.orderNumber}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  const total = subtotal + deliveryInfo.price;

  return (
    <div className="pt-20 min-h-screen animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/cart" className="text-gray-500 hover:text-brand-400 text-sm flex items-center gap-2 mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Retour au panier
        </Link>

        <h1 className="section-title mb-2">Finaliser la Commande</h1>
        <p className="text-gray-500 mb-8 text-sm">Aucun compte requis — commandez en tant qu'invité</p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout form */}
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h2 className="font-display text-xl text-white mb-6">Informations de Livraison</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Nom complet *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Mohamed Ben Ali"
                      className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Téléphone *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+216 XX XXX XXX"
                      className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Adresse complète *</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="Rue, numéro, quartier..."
                      className={`input-field ${errors.address ? 'border-red-500' : ''}`}
                    />
                    {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Ville *</label>
                    <select
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                    >
                      <option value="">Choisir une ville...</option>
                      {TUNISIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Mode de livraison</label>
                    <select
                      value={form.deliveryType}
                      onChange={e => setForm(f => ({ ...f, deliveryType: e.target.value }))}
                      className="input-field"
                    >
                      <option value="home">Livraison à domicile</option>
                      <option value="pickup">Point de retrait</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Notes (optionnel)</label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Instructions spéciales pour la livraison..."
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                </div>

                {form.city && (
                  <div className="mt-4 bg-brand-500/10 border border-brand-500/30 px-4 py-3 text-sm text-brand-400 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9 6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    Livraison vers {form.city}: <strong>{deliveryInfo.price} DT</strong> — délai estimé: {deliveryInfo.estimatedDays} jours
                  </div>
                )}
              </div>

              {/* Payment info */}
              <div className="card p-6 mt-4">
                <h2 className="font-display text-xl text-white mb-4">Paiement</h2>
                <div className="flex items-center gap-4 bg-dark-200 border border-dark-300 px-4 py-4">
                  <span className="text-3xl">💵</span>
                  <div>
                    <p className="text-white font-medium">Paiement à la livraison</p>
                    <p className="text-gray-500 text-sm">Payez en espèces lors de la réception de votre commande</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="card p-6 sticky top-24">
                <h3 className="font-display text-xl text-white mb-5">Votre Commande</h3>

                <div className="flex flex-col gap-3 mb-5 max-h-60 overflow-y-auto">
                  {items.map(item => (
                    <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between items-start gap-2 pb-3 border-b border-dark-300 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">{item.productName}</p>
                        <p className="text-gray-500 text-xs">{item.size} · {item.color} · ×{item.quantity}</p>
                      </div>
                      <span className="text-gray-400 text-sm shrink-0">{(item.price * item.quantity).toFixed(0)} DT</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-dark-300">
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(0)} DT</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Livraison</span>
                    <span>{deliveryInfo.price.toFixed(0)} DT</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-dark-300">
                    <span>Total</span>
                    <span className="text-brand-400">{total.toFixed(0)} DT</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-5 py-4 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    'Confirmer la Commande'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
