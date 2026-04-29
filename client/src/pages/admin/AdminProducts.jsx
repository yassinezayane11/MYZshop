import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../api';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch all including inactive for admin view
      const res = await productsApi.getAll(search ? { search } : {});
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    setDeleting(id);
    try {
      await productsApi.delete(id);
      toast.success('Produit supprimé');
      fetchProducts();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const getImgSrc = (src) => {
    if (!src) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100';
    if (src.startsWith('http')) return src;
    return `${API_URL}${src}`;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-white font-bold">Produits</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} produits</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary text-center">
          + Ajouter un Produit
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="input-field max-w-md"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse h-32" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👕</div>
          <p className="text-gray-500 mb-4">Aucun produit trouvé</p>
          <Link to="/admin/products/new" className="btn-primary inline-block">Ajouter un produit</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-300 bg-dark-200/50">
                  <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Produit</th>
                  <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3 hidden md:table-cell">Catégorie</th>
                  <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Prix</th>
                  <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Stock</th>
                  <th className="text-left text-gray-500 text-xs uppercase tracking-wider px-5 py-3 hidden md:table-cell">Vedette</th>
                  <th className="text-right text-gray-500 text-xs uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const totalStock = p.variants?.reduce((s, v) => s + v.stock, 0) ?? 0;
                  return (
                    <tr key={p._id} className="border-b border-dark-300/50 hover:bg-dark-200/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 shrink-0 overflow-hidden bg-dark-300">
                            <img
                              src={getImgSrc(p.images?.[0])}
                              alt={p.name}
                              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100'; }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{p.name}</p>
                            <p className="text-gray-600 text-xs">{p._id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-gray-400 text-sm">{p.category}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-brand-400 font-semibold">{p.basePrice} DT</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className={`text-sm font-medium ${totalStock === 0 ? 'text-red-400' : totalStock <= 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {totalStock} unités
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {p.featured ? (
                          <span className="text-brand-400 text-sm">⭐ Oui</span>
                        ) : (
                          <span className="text-gray-600 text-sm">Non</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/products/${p._id}/edit`} className="text-gray-400 hover:text-white transition-colors p-1" title="Modifier">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            disabled={deleting === p._id}
                            className="text-gray-600 hover:text-red-400 transition-colors p-1"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
