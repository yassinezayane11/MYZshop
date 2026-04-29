import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { productsApi } from '../api';
import { addToCart } from '../store/cartSlice';
import { useColors } from '../hooks/useColors';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hexFor } = useColors();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState({});

  useEffect(() => {
    productsApi.getById(id).then(r => {
      setProduct(r.data);
      setLoading(false);
    }).catch(() => navigate('/products'));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const sizes = [...new Set(product.variants.map(v => v.size))];
  const colorsForSize = selectedSize
    ? [...new Set(product.variants.filter(v => v.size === selectedSize && v.stock > 0).map(v => v.color))]
    : [...new Set(product.variants.filter(v => v.stock > 0).map(v => v.color))];

  const currentVariant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
  const stockAvailable = currentVariant?.stock ?? 0;
  const canAddToCart = selectedSize && selectedColor && stockAvailable > 0;

  const getStockForSize = (size) => {
    return product.variants.filter(v => v.size === size).reduce((s, v) => s + v.stock, 0);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    // Reset color if not available in this size
    const availColors = product.variants.filter(v => v.size === size && v.stock > 0).map(v => v.color);
    if (!availColors.includes(selectedColor)) setSelectedColor('');
  };

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    dispatch(addToCart({
      productId: product._id,
      productName: product.name,
      productImage: product.images?.[0] || '',
      size: selectedSize,
      color: selectedColor,
      price: product.basePrice,
      quantity,
    }));
    toast.success(`${product.name} ajouté au panier !`);
  };

  const getImgSrc = (src) => {
    if (!src) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600';
    if (src.startsWith('http')) return src;
    return `${API_URL}${src}`;
  };

  return (
    <div className="pt-20 min-h-screen animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <div className="aspect-[4/5] overflow-hidden bg-dark-200 mb-3">
              <img
                src={imgError[activeImg] ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800' : getImgSrc(product.images?.[activeImg])}
                alt={product.name}
                onError={() => setImgError(e => ({ ...e, [activeImg]: true }))}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 overflow-hidden transition-all ${activeImg === i ? 'border-2 border-brand-500' : 'border border-dark-400 opacity-60 hover:opacity-100'}`}
                  >
                    <img
                      src={imgError[`thumb-${i}`] ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100' : getImgSrc(img)}
                      onError={() => setImgError(e => ({ ...e, [`thumb-${i}`]: true }))}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div>
            <p className="text-brand-500 uppercase tracking-widest text-xs mb-2">{product.category}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">{product.name}</h1>
            <p className="text-brand-400 text-3xl font-semibold mb-6">{product.basePrice} DT</p>

            <p className="text-gray-400 leading-relaxed mb-8">{product.description}</p>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-gray-400 text-xs uppercase tracking-wider">Taille</label>
                {selectedSize && (
                  <span className="text-brand-400 text-xs">Sélectionné: <strong>{selectedSize}</strong></span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map(size => {
                  const stock = getStockForSize(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      disabled={stock === 0}
                      className={`min-w-[44px] h-11 px-3 text-sm font-medium transition-all relative ${
                        selectedSize === size
                          ? 'bg-brand-500 text-white border-brand-500'
                          : stock === 0
                          ? 'border border-dark-400 text-gray-600 cursor-not-allowed line-through'
                          : 'border border-dark-400 text-gray-300 hover:border-brand-500 hover:text-white'
                      }`}
                    >
                      {size}
                      {stock > 0 && stock <= 3 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" title="Stock limité" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-gray-400 text-xs uppercase tracking-wider">Couleur</label>
                {selectedColor && (
                  <span className="text-brand-400 text-xs">Sélectionné: <strong>{selectedColor}</strong></span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {[...new Set(product.variants.map(v => v.color))].map(color => {
                  const available = colorsForSize.includes(color);
                  return (
                    <div key={color} className="relative">
                      <button
                        key={color}
                        onClick={() => available && setSelectedColor(color)}
                        disabled={!available}
                        className={`px-3 py-2 text-sm transition-all flex items-center gap-2 ${
                          selectedColor === color
                            ? 'border border-brand-500 text-brand-400 bg-brand-500/10'
                            : !available
                            ? 'border border-dark-300 text-gray-600 cursor-not-allowed opacity-50'
                            : 'border border-dark-400 text-gray-400 hover:border-brand-500 hover:text-white'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ background: hexFor(color) }} />
                        {color}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stock info */}
            {selectedSize && selectedColor && (
              <div className={`mb-6 px-4 py-3 text-sm ${stockAvailable > 0 ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                {stockAvailable > 0
                  ? stockAvailable <= 5
                    ? `⚠️ Plus que ${stockAvailable} en stock !`
                    : `✅ En stock (${stockAvailable} disponibles)`
                  : '❌ Rupture de stock pour cette combinaison'
                }
              </div>
            )}

            {/* Quantity */}
            {canAddToCart && (
              <div className="mb-6">
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-3 block">Quantité</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 border border-dark-400 text-white hover:border-brand-500 flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="text-white font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(stockAvailable, q + 1))}
                    className="w-10 h-10 border border-dark-400 text-white hover:border-brand-500 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`w-full py-4 text-sm font-medium uppercase tracking-widest transition-all ${
                canAddToCart
                  ? 'bg-brand-500 hover:bg-brand-400 text-white'
                  : 'bg-dark-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {!selectedSize ? 'Choisir une taille'
                : !selectedColor ? 'Choisir une couleur'
                : stockAvailable === 0 ? 'Rupture de stock'
                : 'Ajouter au Panier'}
            </button>

            {/* Info */}
            <div className="mt-6 flex flex-col gap-3 border-t border-dark-300 pt-6">
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9 6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                Livraison partout en Tunisie
              </div>
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                Paiement à la livraison
              </div>
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.990" />
                </svg>
                Retours acceptés sous 14 jours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


