import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ featured: true }),
      productsApi.getCategories(),
    ]).then(([featRes, catRes]) => {
      setFeatured(featRes.data.slice(0, 4));
      setCategories(catRes.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/50 to-dark" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-brand-400 uppercase tracking-[0.5em] text-xs md:text-sm mb-6 animate-fade-in">
            Nouvelle Collection
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6 animate-slide-up">
            L'Élégance
            <br />
            <span className="text-brand-400">Masculine</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Vêtements de qualité premium pour l'homme moderne. Style, confort et caractère — livré chez vous en Tunisie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-primary inline-block text-center">
              Découvrir la Collection
            </Link>
            <Link to="/products?category=Nouveautés" className="btn-secondary inline-block text-center">
              Voir les Nouveautés
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-gray-600 text-xs uppercase tracking-widest">Scroll</span>
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Features bar */}
      <section className="bg-dark-100 border-y border-dark-300">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            {[
              { icon: '🚀', title: 'Livraison Rapide', sub: 'Partout en Tunisie' },
              { icon: '✨', title: 'Qualité Premium', sub: 'Matières sélectionnées' },
              { icon: '🔄', title: 'Retours Faciles', sub: '14 jours pour changer' },
              { icon: '🔒', title: 'Paiement Sécurisé', sub: 'À la livraison' },
            ].map(f => (
              <div key={f.title} className="flex flex-col items-center gap-1 py-2">
                <span className="text-2xl">{f.icon}</span>
                <span className="text-white text-sm font-medium">{f.title}</span>
                <span className="text-gray-500 text-xs">{f.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-500 uppercase tracking-[0.3em] text-xs mb-2">Sélection</p>
            <h2 className="section-title">Coups de Cœur</h2>
          </div>
          <Link to="/products" className="btn-ghost text-sm hidden sm:block">
            Tout voir →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[3/4] bg-dark-300" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-dark-300 w-1/3" />
                  <div className="h-5 bg-dark-300 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link to="/products" className="btn-secondary inline-block">Voir tout</Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="mb-10">
          <p className="text-brand-500 uppercase tracking-[0.3em] text-xs mb-2">Explorer</p>
          <h2 className="section-title">Nos Catégories</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map(cat => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="card p-6 hover:border-brand-600/50 transition-all duration-300 flex items-center justify-between group"
            >
              <span className="font-medium text-gray-300 group-hover:text-brand-400 transition-colors">{cat}</span>
              <svg className="w-4 h-4 text-brand-600 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* Banner CTA */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400)' }}
        />
        <div className="absolute inset-0 bg-dark/75" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-4 py-24">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Commandez Sans Créer de Compte
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Checkout rapide et simple. Payez à la livraison. Aucune inscription requise.
          </p>
          <Link to="/products" className="btn-primary inline-block text-base px-10 py-4">
            Commander Maintenant
          </Link>
        </div>
      </section>
    </div>
  );
}
