import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark-100 border-t border-dark-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-display text-2xl font-bold text-white">DBACH</span>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              Mode masculine premium en Tunisie. Qualité, style et élégance pour l'homme moderne.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-4">Navigation</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-gray-500 hover:text-brand-400 text-sm transition-colors">Accueil</Link>
              <Link to="/products" className="text-gray-500 hover:text-brand-400 text-sm transition-colors">Collection</Link>
              <Link to="/cart" className="text-gray-500 hover:text-brand-400 text-sm transition-colors">Mon Panier</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-gray-500 text-sm">
              <span>📍 Tunis, Tunisie</span>
              <span>📞 +216 XX XXX XXX</span>
              <span>✉️ contact@dbach.tn</span>
            </div>
          </div>
        </div>
        <div className="border-t border-dark-300 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} DBACH. Tous droits réservés.</p>
          <Link to="/admin" className="text-gray-700 hover:text-gray-500 text-xs transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
