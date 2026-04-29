import { useState, useEffect } from 'react';
import { deliveryApi } from '../../api';
import toast from 'react-hot-toast';

const DEFAULT_CITIES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
  'Béja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
  'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine',
  'Tataouine', 'Gafsa', 'Tozeur', 'Kébili',
];

export default function AdminDelivery() {
  const [config, setConfig] = useState({
    defaultPrice: 8,
    estimatedDays: '2-3',
    freeDeliveryThreshold: '',
    cityPrices: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCity, setNewCity] = useState({ city: '', price: '', estimatedDays: '2-3' });

  useEffect(() => {
    deliveryApi.getConfig().then(r => {
      if (r.data) {
        setConfig({
          defaultPrice: r.data.defaultPrice ?? 8,
          estimatedDays: r.data.estimatedDays ?? '2-3',
          freeDeliveryThreshold: r.data.freeDeliveryThreshold ?? '',
          cityPrices: r.data.cityPrices ?? [],
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await deliveryApi.updateConfig({
        defaultPrice: parseFloat(config.defaultPrice),
        estimatedDays: config.estimatedDays,
        freeDeliveryThreshold: config.freeDeliveryThreshold ? parseFloat(config.freeDeliveryThreshold) : null,
        cityPrices: config.cityPrices,
      });
      toast.success('Configuration sauvegardée !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const addCity = () => {
    if (!newCity.city || !newCity.price) { toast.error('Ville et prix requis'); return; }
    if (config.cityPrices.find(c => c.city.toLowerCase() === newCity.city.toLowerCase())) {
      toast.error('Cette ville existe déjà');
      return;
    }
    setConfig(c => ({
      ...c,
      cityPrices: [...c.cityPrices, { city: newCity.city, price: parseFloat(newCity.price), estimatedDays: newCity.estimatedDays }],
    }));
    setNewCity({ city: '', price: '', estimatedDays: '2-3' });
  };

  const removeCity = (city) => {
    setConfig(c => ({ ...c, cityPrices: c.cityPrices.filter(cp => cp.city !== city) }));
  };

  const updateCityPrice = (city, field, value) => {
    setConfig(c => ({
      ...c,
      cityPrices: c.cityPrices.map(cp => cp.city === city ? { ...cp, [field]: field === 'price' ? parseFloat(value) || 0 : value } : cp),
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white font-bold">Configuration Livraison</h1>
        <p className="text-gray-500 text-sm mt-1">Définissez les prix et délais de livraison</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Default settings */}
        <div className="card p-6">
          <h2 className="text-white font-medium uppercase tracking-widest text-xs mb-5">Paramètres par Défaut</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Prix par défaut (DT)</label>
              <input
                type="number"
                value={config.defaultPrice}
                onChange={e => setConfig(c => ({ ...c, defaultPrice: e.target.value }))}
                min="0"
                step="0.5"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Délai par défaut</label>
              <input
                type="text"
                value={config.estimatedDays}
                onChange={e => setConfig(c => ({ ...c, estimatedDays: e.target.value }))}
                placeholder="2-3"
                className="input-field"
              />
              <p className="text-gray-600 text-xs mt-1">Ex: 2-3 (jours)</p>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Livraison gratuite dès (DT)</label>
              <input
                type="number"
                value={config.freeDeliveryThreshold}
                onChange={e => setConfig(c => ({ ...c, freeDeliveryThreshold: e.target.value }))}
                min="0"
                placeholder="Laisser vide si désactivé"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* City prices */}
        <div className="card p-6">
          <h2 className="text-white font-medium uppercase tracking-widest text-xs mb-5">Prix par Ville</h2>

          {/* Add city */}
          <div className="flex gap-3 flex-wrap mb-6 p-4 bg-dark-200 border border-dark-300">
            <div className="flex-1 min-w-32">
              <label className="text-gray-500 text-xs mb-1 block">Ville</label>
              <select
                value={newCity.city}
                onChange={e => setNewCity(c => ({ ...c, city: e.target.value }))}
                className="input-field text-sm py-2"
              >
                <option value="">Choisir...</option>
                {DEFAULT_CITIES.filter(c => !config.cityPrices.find(cp => cp.city === c)).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="w-28">
              <label className="text-gray-500 text-xs mb-1 block">Prix (DT)</label>
              <input
                type="number"
                value={newCity.price}
                onChange={e => setNewCity(c => ({ ...c, price: e.target.value }))}
                min="0"
                step="0.5"
                className="input-field text-sm py-2"
              />
            </div>
            <div className="w-28">
              <label className="text-gray-500 text-xs mb-1 block">Délai (j)</label>
              <input
                type="text"
                value={newCity.estimatedDays}
                onChange={e => setNewCity(c => ({ ...c, estimatedDays: e.target.value }))}
                placeholder="2-3"
                className="input-field text-sm py-2"
              />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={addCity} className="btn-secondary py-2 px-4 text-sm">
                + Ajouter
              </button>
            </div>
          </div>

          {config.cityPrices.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">
              Aucun prix personnalisé par ville. Le prix par défaut sera utilisé partout.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-300">
                    <th className="text-left text-gray-500 text-xs py-2 pr-4">Ville</th>
                    <th className="text-left text-gray-500 text-xs py-2 pr-4">Prix (DT)</th>
                    <th className="text-left text-gray-500 text-xs py-2 pr-4">Délai (jours)</th>
                    <th className="text-right text-gray-500 text-xs py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {config.cityPrices.map((cp) => (
                    <tr key={cp.city} className="border-b border-dark-300/50">
                      <td className="py-2 pr-4 text-white font-medium">{cp.city}</td>
                      <td className="py-2 pr-4">
                        <input
                          type="number"
                          value={cp.price}
                          onChange={e => updateCityPrice(cp.city, 'price', e.target.value)}
                          min="0"
                          step="0.5"
                          className="w-24 bg-dark-300 border border-dark-400 text-white px-2 py-1 text-sm focus:outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="text"
                          value={cp.estimatedDays}
                          onChange={e => updateCityPrice(cp.city, 'estimatedDays', e.target.value)}
                          className="w-20 bg-dark-300 border border-dark-400 text-white px-2 py-1 text-sm focus:outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => removeCity(cp.city)}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Save */}
        <div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sauvegarde...</> : '✓ Enregistrer la configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
