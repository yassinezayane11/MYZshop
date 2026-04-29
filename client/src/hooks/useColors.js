/**
 * useColors — fetches the color list from the API once per session.
 * Returns: { colors: [{_id, name, hex}], hexFor: (name) => string }
 *
 * Uses a module-level cache so the fetch only happens once even when
 * multiple components call this hook simultaneously.
 */
import { useState, useEffect } from 'react';
import { colorsApi } from '../api';

let cache = null;         // [{_id, name, hex}]
let pending = null;       // in-flight Promise

export function useColors() {
  const [colors, setColors] = useState(cache || []);

  useEffect(() => {
    if (cache) return; // already loaded

    if (!pending) {
      pending = colorsApi.getAll()
        .then(r => { cache = r.data; })
        .catch(() => { cache = []; });
    }

    pending.then(() => setColors(cache));
  }, []);

  const hexFor = (name) => {
    const found = colors.find(c => c.name === name);
    return found?.hex || '#888888';
  };

  return { colors, hexFor };
}
