import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { selectCartItems, selectCartSubtotal, updateQuantity, removeFromCart } from '../store/cartSlice';
import { deliveryApi } from '../api';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export default function CartPage() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deliveryPrice, setDeliveryPrice] = useState(8);

  useEffect(() => {
    deliveryApi.getConfig().then(r => {
      setDeliveryPrice(r.data?.defaultPrice ?? 8);
    }).catch(() => {});
  }, []);

  const total = subtotal + deliveryPrice;

  const getImgSrc = (src) => {
    if (!src) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200';
    if (src.startsWith('http')) return src;
    return `${API_URL}${src}`;
  };

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="font-display text-3xl text-white mb-3">Votre panier est vide</h2>
          <p className="text-gray-500 mb-8">Découvrez notre collection et ajoutez des articles</p>
          <Link to="/products" className="btn-primary inline-block">Voir la Collection</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="section-title mb-8">Mon Panier <span className="text-brand-500 font-body text-2xl font-normal">({items.length} article{items.length > 1 ? 's' : ''})</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map(item => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="card p-4 flex gap-4">
                <div className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 overflow-hidden bg-dark-200">
                  <img
                    src={getImgSrc(item.productImage)}
                    alt={item.productName}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200'; }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-medium text-white text-sm sm:text-base leading-tight">{item.productName}</h3>
                    <button
                      onClick={() => {
                        dispatch(removeFromCart({ productId: item.productId, size: item.size, color: item.color }));
                        toast.success('Article supprimé');
                      }}
                      className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-gray-500 text-xs bg-dark-300 px-2 py-0.5">{item.size}</span>
                    <span className="text-gray-500 text-xs bg-dark-300 px-2 py-0.5">{item.color}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-dark-400">
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, size: item.size, color: item.color, quantity: item.quantity - 1 }))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-300 transition-colors"
                      >−</button>
                      <span className="w-8 text-center text-white text-sm">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, size: item.size, color: item.color, quantity: item.quantity + 1 }))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-300 transition-colors"
                      >+</button>
                    </div>
                    <span className="text-brand-400 font-semibold">{(item.price * item.quantity).toFixed(0)} DT</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h3 className="font-display text-xl text-white mb-5">Récapitulatif</h3>
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(0)} DT</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Livraison estimée</span>
                  <span>{deliveryPrice.toFixed(0)} DT</span>
                </div>
                <div className="border-t border-dark-300 pt-3 flex justify-between text-white font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-brand-400">{total.toFixed(0)} DT</span>
                </div>
              </div>
              <p className="text-gray-600 text-xs mb-4">* Prix de livraison final calculé à la commande selon votre ville</p>
              <button
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full text-center"
              >
                Passer la Commande
              </button>
              <Link to="/products" className="block text-center text-gray-500 hover:text-brand-400 text-sm mt-4 transition-colors">
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
