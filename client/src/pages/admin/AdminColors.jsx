import { useState, useEffect } from 'react';
import { colorsApi } from '../../api';
import toast from 'react-hot-toast';

export default function AdminColors() {
  const [colors, setColors]          = useState([]);
  const [loading, setLoading]        = useState(true);
  const [newName, setNewName]        = useState('');
  const [newHex, setNewHex]          = useState('#888888');
  const [adding, setAdding]          = useState(false);
  const [editingId, setEditingId]    = useState(null);
  const [editName, setEditName]      = useState('');
  const [editHex, setEditHex]        = useState('#888888');
  const [saving, setSaving]          = useState(false);
  const [deletingId, setDeletingId]  = useState(null);

  const fetchColors = async () => {
    setLoading(true);
    try {
      const res = await colorsApi.getAll();
      setColors(res.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchColors(); }, []);

  /* ── Add ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await colorsApi.create(newName.trim(), newHex);
      setColors(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      setNewHex('#888888');
      toast.success(`Couleur "${res.data.name}" créée`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setAdding(false);
    }
  };

  /* ── Start edit ── */
  const startEdit = (col) => {
    setEditingId(col._id);
    setEditName(col.name);
    setEditHex(col.hex || '#888888');
  };

  /* ── Save edit ── */
  const handleSave = async (id) => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await colorsApi.update(id, editName.trim(), editHex);
      setColors(prev =>
        prev.map(c => (c._id === id ? res.data : c))
            .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      toast.success('Couleur mise à jour');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer la couleur "${name}" ?`)) return;
    setDeletingId(id);
    try {
      await colorsApi.delete(id);
      setColors(prev => prev.filter(c => c._id !== id));
      toast.success('Couleur supprimée');
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
        <h1 className="font-display text-3xl text-white font-bold">Couleurs</h1>
        <p className="text-gray-500 text-sm mt-1">
          {colors.length} couleur{colors.length !== 1 ? 's' : ''} — utilisées dans les variantes produit
        </p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="card p-5 mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-40">
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Nom de la couleur</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="ex: Turquoise"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-2 block">Couleur hex</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newHex}
                onChange={e => setNewHex(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border border-dark-400 p-0.5"
              />
              <input
                type="text"
                value={newHex}
                onChange={e => setNewHex(e.target.value)}
                placeholder="#888888"
                className="input-field w-28 font-mono text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="btn-primary px-5 flex items-center gap-2 shrink-0 self-end"
          >
            {adding
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <span>+</span>
            }
            Ajouter
          </button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : colors.length === 0 ? (
        <div className="card p-10 text-center text-gray-500">Aucune couleur. Ajoutez-en une ci-dessus.</div>
      ) : (
        <div className="card overflow-hidden">
          <ul className="divide-y divide-dark-300">
            {colors.map((col) => (
              <li key={col._id} className="flex items-center gap-3 px-5 py-4 hover:bg-dark-200/40 transition-colors group">
                {/* Color swatch */}
                {editingId === col._id ? (
                  <input
                    type="color"
                    value={editHex}
                    onChange={e => setEditHex(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border border-dark-400 p-0.5 shrink-0"
                  />
                ) : (
                  <span
                    className="w-8 h-8 rounded-sm border border-dark-400 shrink-0 block"
                    style={{ background: col.hex || '#888' }}
                  />
                )}

                {/* Inline edit or label */}
                {editingId === col._id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSave(col._id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="input-field flex-1 py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      value={editHex}
                      onChange={e => setEditHex(e.target.value)}
                      className="input-field w-28 py-1.5 text-sm font-mono"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <span className="text-white font-medium">{col.name}</span>
                    <span className="text-gray-600 text-xs font-mono ml-3">{col.hex}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {editingId === col._id ? (
                    <>
                      <button
                        onClick={() => handleSave(col._id)}
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
                        onClick={() => startEdit(col)}
                        className="text-gray-600 hover:text-brand-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(col._id, col.name)}
                        disabled={deletingId === col._id}
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
        💡 Cliquez sur ✏️ pour modifier — la pastille de couleur reflète le code hex en temps réel.
      </p>
    </div>
  );
}
