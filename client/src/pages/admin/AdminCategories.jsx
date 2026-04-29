import { useState, useEffect } from 'react';
import { categoriesApi } from '../../api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [newName, setNewName]        = useState('');
  const [adding, setAdding]          = useState(false);
  const [editingId, setEditingId]    = useState(null);
  const [editName, setEditName]      = useState('');
  const [saving, setSaving]          = useState(false);
  const [deletingId, setDeletingId]  = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  /* ── Add ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await categoriesApi.create(newName.trim());
      setCategories(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      toast.success(`Catégorie "${res.data.name}" créée`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setAdding(false);
    }
  };

  /* ── Start edit ── */
  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  /* ── Save edit ── */
  const handleSave = async (id) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await categoriesApi.update(id, editName.trim());
      setCategories(prev =>
        prev.map(c => (c._id === id ? res.data : c))
            .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      toast.success('Catégorie mise à jour');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer la catégorie "${name}" ?\nLes produits existants gardent leur catégorie sous forme de texte.`)) return;
    setDeletingId(id);
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success('Catégorie supprimée');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white font-bold">Catégories</h1>
        <p className="text-gray-500 text-sm mt-1">
          {categories.length} catégorie{categories.length !== 1 ? 's' : ''} — utilisées dans le formulaire produit
        </p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="card p-5 mb-6 flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nouvelle catégorie (ex: Costumes)"
          className="input-field flex-1"
          required
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="btn-primary px-5 flex items-center gap-2 shrink-0"
        >
          {adding
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <span>+</span>
          }
          Ajouter
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">Aucune catégorie. Ajoutez-en une ci-dessus.</div>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-dark-300">
            {categories.map((cat) => (
              <li key={cat._id} className="flex items-center gap-3 px-5 py-4 hover:bg-dark-200/40 transition-colors group">
                {/* Icon */}
                <span className="text-lg shrink-0">🏷️</span>

                {/* Inline edit or label */}
                {editingId === cat._id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSave(cat._id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="input-field flex-1 py-1.5 text-sm"
                  />
                ) : (
                  <span className="flex-1 text-white font-medium">{cat.name}</span>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {editingId === cat._id ? (
                    <>
                      <button
                        onClick={() => handleSave(cat._id)}
                        disabled={saving}
                        className="text-green-400 hover:text-green-300 transition-colors p-1"
                        title="Enregistrer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500 hover:text-white transition-colors p-1"
                        title="Annuler"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-gray-600 hover:text-brand-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="Renommer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        disabled={deletingId === cat._id}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-gray-600 text-xs mt-4">
        💡 Renommez en cliquant sur ✏️ — appuyez sur Entrée pour confirmer, Échap pour annuler.
      </p>
    </div>
  );
}
