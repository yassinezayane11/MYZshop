import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useColors } from '../hooks/useColors';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export default function ProductCard({ product }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const { hexFor } = useColors();

  const totalStock = product.variants?.reduce((s, v) => s + v.stock, 0) ?? 0;
  const isOutOfStock = totalStock === 0;

  const getImageSrc = (src) => {
    if (!src) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600';
    if (src.startsWith('http')) return src;
    return `${API_URL}${src}`;
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block card hover:border-brand-600/50 transition-all duration-300"
    >
      <div
        className="relative aspect-[3/4] overflow-hidden bg-dark-200"
        onMouseEnter={() => product.images?.length > 1 && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}
      >
        <img
          src={imgError ? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600' : getImageSrc(product.images?.[imgIdx])}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-brand-500 text-white text-xs px-2 py-0.5 uppercase tracking-widest font-medium">
              Coup de cœur
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-dark-100/90 text-gray-400 text-xs px-2 py-0.5 uppercase tracking-widest border border-dark-300">
              Épuisé
            </span>
          )}
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/30 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <span className="bg-white text-dark text-xs uppercase tracking-widest px-4 py-2 font-medium">
            Voir le produit
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{product.category}</p>
        <h3 className="font-display text-white font-medium text-lg leading-tight group-hover:text-brand-400 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-brand-400 font-semibold text-xl">{product.basePrice} DT</span>
          {/* Color dots */}
          <div className="flex gap-1">
            {[...new Set(product.variants?.map(v => v.color))].slice(0, 4).map(color => (
              <span
                key={color}
                title={color}
                className="w-3 h-3 rounded-full border border-dark-400"
                style={{ background: hexFor(color) }}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}


