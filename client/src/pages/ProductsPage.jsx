import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi, categoriesApi, colorsApi } from '../api';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);  // [{_id, name}]
  const [colors, setColors]         = useState([]);  // [{_id, name, hex}]
  const [loading, setLoading]     = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const size     = searchParams.get('size')     || '';
  const color    = searchParams.get('color')    || '';

  const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (search)   params.search   = search;
      if (size)     params.size     = size;
      if (color)    params.color    = color;
      const res = await productsApi.getAll(params);
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  }, [category, search, size, color]);

  // Load categories and colors from the database (dynamic)
  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data)).catch(() => {});
    colorsApi.getAll().then(r => setColors(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});

  const hasFilters = category || search || size || color;

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">
              {category || 'Toute la Collection'}
            </h1>
            {!loading && (
              <p className="text-gray-500 text-sm mt-1">{products.length} articles</p>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden flex items-center gap-2 btn-secondary text-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filtres
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-full md:w-60 shrink-0`}>
            <div className="card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-medium uppercase tracking-widest text-xs">Filtres</h3>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-brand-500 text-xs hover:text-brand-400">
                    Effacer
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Recherche</label>
                <input
                  type="text"
                  value={search}
                  onChange={e => setParam('search', e.target.value)}
                  placeholder="Nom du produit..."
                  className="input-field text-sm"
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-3 block">Catégorie</label>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setParam('category', '')}
                    className={`text-left text-sm px-3 py-2 transition-colors ${!category ? 'text-brand-400 bg-brand-500/10' : 'text-gray-400 hover:text-white'}`}
                  >
                    Toutes
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat._id}
                      onClick={() => setParam('category', cat.name)}
                      className={`text-left text-sm px-3 py-2 transition-colors ${category === cat.name ? 'text-brand-400 bg-brand-500/10' : 'text-gray-400 hover:text-white'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-6">
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-3 block">Taille</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => setParam('size', size === s ? '' : s)}
                      className={`w-10 h-10 text-sm transition-all ${size === s ? 'bg-brand-500 text-white border-brand-500' : 'border border-dark-400 text-gray-400 hover:border-brand-500 hover:text-white'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color — loaded from database */}
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-3 block">Couleur</label>
                <div className="flex flex-col gap-1">
                  {colors.map(c => (
                    <button
                      key={c._id}
                      onClick={() => setParam('color', color === c.name ? '' : c.name)}
                      className={`text-left text-sm px-3 py-2 transition-colors flex items-center gap-2 ${color === c.name ? 'text-brand-400' : 'text-gray-400 hover:text-white'}`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-dark-400 shrink-0"
                        style={{ background: c.hex || '#888' }}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-[3/4] bg-dark-300" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-dark-300 w-1/3" />
                      <div className="h-5 bg-dark-300 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">👗</div>
                <h3 className="font-display text-2xl text-white mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500 mb-6">Essayez de modifier vos filtres</p>
                <button onClick={clearFilters} className="btn-primary">Effacer les filtres</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



