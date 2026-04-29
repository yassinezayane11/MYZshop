import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsApi, categoriesApi, colorsApi } from '../../api';
import toast from 'react-hot-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

/* ─────────────────────────────────────────
   Tiny inline "Add new" popover component
───────────────────────────────────────── */
function AddNewPopover({ label, placeholder, onAdd, onClose, withHex = false }) {
  const [name, setName] = useState('');
  const [hex, setHex]   = useState('#888888');
  const [busy, setBusy] = useState(false);
  const inputRef        = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onAdd(name.trim(), hex);
      onClose();
    } catch {
      /* errors handled by caller */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="absolute z-50 top-full mt-1 left-0 bg-dark-100 border border-brand-500/40 shadow-2xl p-4 min-w-[260px]">
      <p className="text-white text-xs font-medium uppercase tracking-widest mb-3">{label}</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={placeholder}
          className="input-field py-2 text-sm"
          required
        />
        {withHex && (
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={hex}
              onChange={e => setHex(e.target.value)}
              className="w-9 h-9 rounded cursor-pointer bg-transparent border border-dark-400 p-0.5 shrink-0"
            />
            <input
              type="text"
              value={hex}
              onChange={e => setHex(e.target.value)}
              className="input-field py-2 text-sm font-mono flex-1"
              placeholder="#888888"
            />
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="flex-1 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white text-xs py-2 uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
          >
            {busy
              ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Créer'
            }
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 border border-dark-400 text-gray-400 hover:text-white text-xs transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────
   Main product form component
───────────────────────────────────── */
export default function AdminProductForm() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const isEdit       = !!id;
  const fileInputRef = useRef(null);

  /* ── API-driven lists ── */
  const [categories, setCategories]     = useState([]);
  const [colors, setColors]             = useState([]);
  const [metaLoading, setMetaLoading]   = useState(true);

  /* ── Popover toggles ── */
  const [showAddCat, setShowAddCat]       = useState(false);
  const [showAddColor, setShowAddColor]   = useState(false);

  /* ── Form state ── */
  const [loading, setLoading]                 = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [form, setForm]                       = useState({
    name: '', description: '', basePrice: '', category: '', featured: false,
  });
  const [variants, setVariants]               = useState([]);
  const [existingImages, setExistingImages]   = useState([]);
  const [newFiles, setNewFiles]               = useState([]);
  const [newFilePreviews, setNewFilePreviews] = useState([]);
  const [variantForm, setVariantForm]         = useState({ size: 'M', color: '', stock: 10 });

  /* ── Load categories + colors ── */
  useEffect(() => {
    Promise.all([categoriesApi.getAll(), colorsApi.getAll()])
      .then(([catRes, colRes]) => {
        setCategories(catRes.data);
        setColors(colRes.data);
        if (colRes.data.length > 0) {
          setVariantForm(f => ({ ...f, color: colRes.data[0].name }));
        }
      })
      .catch(() => toast.error('Erreur chargement catégories/couleurs'))
      .finally(() => setMetaLoading(false));
  }, []);

  /* ── Load product in edit mode ── */
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    productsApi.getById(id)
      .then(r => {
        const p = r.data;
        setForm({
          name: p.name, description: p.description,
          basePrice: p.basePrice, category: p.category, featured: p.featured,
        });
        setVariants(p.variants);
        setExistingImages(p.images || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Inline create category ── */
  const handleCreateCategory = async (name) => {
    const res    = await categoriesApi.create(name);
    const newCat = res.data;
    setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
    setForm(f => ({ ...f, category: newCat.name }));
    toast.success(`Catégorie "${newCat.name}" créée`);
  };

  /* ── Inline create color ── */
  const handleCreateColor = async (name, hex) => {
    const res    = await colorsApi.create(name, hex);
    const newCol = res.data;
    setColors(prev => [...prev, newCol].sort((a, b) => a.name.localeCompare(b.name)));
    setVariantForm(f => ({ ...f, color: newCol.name }));
    toast.success(`Couleur "${newCol.name}" créée`);
  };

  /* ── Hex helper ── */
  const hexFor = (colorName) =>
    colors.find(c => c.name === colorName)?.hex || '#888888';

  /* ── Image helpers ── */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
    setNewFilePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };
  const removeExistingImage = (idx) =>
    setExistingImages(imgs => imgs.filter((_, i) => i !== idx));
  const removeNewFile = (idx) => {
    setNewFiles(f => f.filter((_, i) => i !== idx));
    setNewFilePreviews(p => p.filter((_, i) => i !== idx));
  };

  /* ── Variant helpers ── */
  const addVariant = () => {
    if (!variantForm.color) { toast.error('Sélectionnez une couleur'); return; }
    const dup = variants.find(v => v.size === variantForm.size && v.color === variantForm.color);
    if (dup) { toast.error('Cette combinaison taille/couleur existe déjà'); return; }
    setVariants(vs => [...vs, { ...variantForm, stock: parseInt(variantForm.stock) || 0 }]);
  };
  const updateVariantStock = (idx, stock) =>
    setVariants(vs => vs.map((v, i) => i === idx ? { ...v, stock: parseInt(stock) || 0 } : v));
  const removeVariant = (idx) =>
    setVariants(vs => vs.filter((_, i) => i !== idx));

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (variants.length === 0)                          { toast.error('Ajoutez au moins une variante'); return; }
    if (existingImages.length === 0 && newFiles.length === 0) { toast.error('Ajoutez au moins une image'); return; }

    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('variants', JSON.stringify(variants));
      data.append('existingImages', JSON.stringify(existingImages));
      newFiles.forEach(f => data.append('images', f));

      if (isEdit) {
        await productsApi.update(id, data);
        toast.success('Produit mis à jour !');
      } else {
        await productsApi.create(data);
        toast.success('Produit créé !');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading spinner ── */
  if (loading || metaLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div className="animate-fade-in max-w-4xl">

      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/products" className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="font-display text-3xl text-white font-bold">
          {isEdit ? 'Modifier le Produit' : 'Nouveau Produit'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ── SECTION: Basic info ── */}
        <div className="card p-6">
          <h2 className="text-white font-medium mb-5 uppercase tracking-widest text-xs">
            Informations générales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Nom du produit *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Chemise Oxford Classic"
                className="input-field"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Description *</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description détaillée du produit..."
                rows={4}
                className="input-field resize-none"
                required
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Prix (DT) *</label>
              <input
                type="number"
                value={form.basePrice}
                onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                placeholder="89"
                min="0"
                step="0.5"
                className="input-field"
                required
              />
            </div>

            {/* ── DYNAMIC CATEGORY SELECT ── */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">
                Catégorie *
                <Link
                  to="/admin/categories"
                  className="ml-2 text-brand-600 hover:text-brand-400 normal-case tracking-normal font-normal"
                  title="Gérer les catégories"
                >
                  (gérer)
                </Link>
              </label>
              <div className="relative">
                <div className="flex gap-2">
                  <select
                    value={form.category}
                    onChange={e => {
                      setShowAddCat(false);
                      setForm(f => ({ ...f, category: e.target.value }));
                    }}
                    className="input-field flex-1"
                    required
                  >
                    <option value="">Choisir une catégorie...</option>
                    {categories.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>

                  {/* "+" button to open popover */}
                  <button
                    type="button"
                    onClick={() => { setShowAddCat(v => !v); setShowAddColor(false); }}
                    title="Créer une nouvelle catégorie"
                    className={`shrink-0 w-10 h-10 border flex items-center justify-center text-xl font-light transition-all ${
                      showAddCat
                        ? 'border-brand-500 text-brand-400 bg-brand-500/10'
                        : 'border-dark-400 text-gray-400 hover:border-brand-500 hover:text-brand-400'
                    }`}
                  >
                    +
                  </button>
                </div>

                {showAddCat && (
                  <AddNewPopover
                    label="Nouvelle catégorie"
                    placeholder="ex: Costumes"
                    onAdd={handleCreateCategory}
                    onClose={() => setShowAddCat(false)}
                  />
                )}
              </div>

              {categories.length === 0 && !showAddCat && (
                <p className="text-yellow-500/80 text-xs mt-1">
                  Aucune catégorie — cliquez sur + pour en créer une.
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                  className="w-4 h-4 accent-brand-500"
                />
                <span className="text-gray-300 text-sm">Mettre en avant (coup de cœur)</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── SECTION: Images ── */}
        <div className="card p-6">
          <h2 className="text-white font-medium mb-5 uppercase tracking-widest text-xs">Images</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">

            {existingImages.map((img, i) => (
              <div key={i} className="relative aspect-square bg-dark-300 group">
                <img
                  src={img.startsWith('http') ? img : `${API_URL}${img}`}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200'; }}
                  className="w-full h-full object-cover"
                  alt=""
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >×</button>
              </div>
            ))}

            {newFilePreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative aspect-square bg-dark-300 group">
                <img src={src} className="w-full h-full object-cover" alt="" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >×</button>
                <span className="absolute bottom-1 left-1 bg-green-500/80 text-white text-xs px-1">NEW</span>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-dark-400 hover:border-brand-500 flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-brand-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-xs">Ajouter</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-gray-600 text-xs">PNG, JPG, WebP — max 5 MB par image</p>
        </div>

        {/* ── SECTION: Variants ── */}
        <div className="card p-6">
          <h2 className="text-white font-medium mb-5 uppercase tracking-widest text-xs">
            Variantes (Taille / Couleur / Stock)
          </h2>

          {/* Add-variant row */}
          <div className="p-4 bg-dark-200 border border-dark-300 mb-5">
            <div className="flex gap-3 flex-wrap items-end">

              {/* Size */}
              <div>
                <label className="text-gray-500 text-xs mb-1 block">Taille</label>
                <select
                  value={variantForm.size}
                  onChange={e => setVariantForm(f => ({ ...f, size: e.target.value }))}
                  className="input-field text-sm py-2"
                >
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* ── DYNAMIC COLOR SELECT ── */}
              <div>
                <label className="text-gray-500 text-xs mb-1 flex items-center gap-2">
                  Couleur
                  <Link
                    to="/admin/colors"
                    className="text-brand-600 hover:text-brand-400 text-xs"
                    title="Gérer les couleurs"
                  >
                    (gérer)
                  </Link>
                </label>
                <div className="relative flex gap-2">
                  <select
                    value={variantForm.color}
                    onChange={e => {
                      setShowAddColor(false);
                      setVariantForm(f => ({ ...f, color: e.target.value }));
                    }}
                    className="input-field text-sm py-2 min-w-[150px]"
                  >
                    <option value="">Choisir...</option>
                    {colors.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>

                  {/* "+" button */}
                  <button
                    type="button"
                    onClick={() => { setShowAddColor(v => !v); setShowAddCat(false); }}
                    title="Créer une nouvelle couleur"
                    className={`shrink-0 w-10 h-10 border flex items-center justify-center text-xl font-light transition-all ${
                      showAddColor
                        ? 'border-brand-500 text-brand-400 bg-brand-500/10'
                        : 'border-dark-400 text-gray-400 hover:border-brand-500 hover:text-brand-400'
                    }`}
                  >
                    +
                  </button>

                  {showAddColor && (
                    <AddNewPopover
                      label="Nouvelle couleur"
                      placeholder="ex: Turquoise"
                      withHex
                      onAdd={handleCreateColor}
                      onClose={() => setShowAddColor(false)}
                    />
                  )}
                </div>

                {colors.length === 0 && !showAddColor && (
                  <p className="text-yellow-500/80 text-xs mt-1">
                    Aucune couleur — cliquez sur + pour en créer une.
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="text-gray-500 text-xs mb-1 block">Stock</label>
                <input
                  type="number"
                  value={variantForm.stock}
                  onChange={e => setVariantForm(f => ({ ...f, stock: e.target.value }))}
                  min="0"
                  className="input-field text-sm py-2 w-24"
                />
              </div>

              {/* Live color dot preview */}
              {variantForm.color && (
                <div
                  className="w-8 h-8 rounded-sm border border-dark-400 mb-0.5 shrink-0"
                  style={{ background: hexFor(variantForm.color) }}
                  title={variantForm.color}
                />
              )}

              <button
                type="button"
                onClick={addVariant}
                className="btn-secondary py-2 px-4 text-sm shrink-0"
              >
                + Ajouter variante
              </button>
            </div>
          </div>

          {/* Variant table */}
          {variants.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">
              Aucune variante. Ajoutez des combinaisons taille / couleur ci-dessus.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-300">
                    <th className="text-left text-gray-500 text-xs py-2 pr-4">Taille</th>
                    <th className="text-left text-gray-500 text-xs py-2 pr-4">Couleur</th>
                    <th className="text-left text-gray-500 text-xs py-2 pr-4">Stock</th>
                    <th className="text-right text-gray-500 text-xs py-2">Suppr.</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={i} className="border-b border-dark-300/50 hover:bg-dark-200/30 transition-colors">
                      <td className="py-2 pr-4 text-white font-medium">{v.size}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-dark-400 shrink-0"
                            style={{ background: hexFor(v.color) }}
                          />
                          {v.color}
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={e => updateVariantStock(i, e.target.value)}
                          min="0"
                          className="w-20 bg-dark-300 border border-dark-400 text-white px-2 py-1 text-sm focus:outline-none focus:border-brand-500"
                        />
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="text-gray-600 hover:text-red-400 transition-colors p-1"
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
              <p className="text-gray-600 text-xs mt-3">
                Total stock: {variants.reduce((s, v) => s + v.stock, 0)} unités
              </p>
            </div>
          )}
        </div>

        {/* ── Submit ── */}
        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sauvegarde...</>
              : isEdit ? '✓ Mettre à jour' : '✓ Créer le produit'
            }
          </button>
          <Link to="/admin/products" className="btn-secondary">Annuler</Link>
        </div>

      </form>
    </div>
  );
}
