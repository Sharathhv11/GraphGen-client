import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'graphgen_api_keys';

/**
 * Custom hook for managing multiple Gemini API keys in localStorage.
 * Supports adding, deleting, and setting an active key.
 */
export default function useApiKeys() {
  const [keys, setKeys] = useState([]);
  const [activeKeyId, setActiveKeyId] = useState(null);

  // Load keys from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setKeys(parsed.keys || []);
        setActiveKeyId(parsed.activeKeyId || null);
      }
    } catch {
      // Corrupt data — reset
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persist to localStorage whenever keys or activeKeyId change
  const persist = useCallback((newKeys, newActiveId) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ keys: newKeys, activeKeyId: newActiveId })
    );
  }, []);

  /** Add a new API key with an optional label */
  const addKey = useCallback((apiKey, label = '') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const newKey = {
      id,
      key: apiKey,
      label: label || `Key ${keys.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    const newKeys = [...keys, newKey];
    // If this is the first key, auto-activate it
    const newActiveId = keys.length === 0 ? id : activeKeyId;
    setKeys(newKeys);
    setActiveKeyId(newActiveId);
    persist(newKeys, newActiveId);
    return id;
  }, [keys, activeKeyId, persist]);

  /** Delete a key by its id */
  const deleteKey = useCallback((id) => {
    const newKeys = keys.filter(k => k.id !== id);
    let newActiveId = activeKeyId;
    // If the deleted key was active, pick the first remaining or null
    if (activeKeyId === id) {
      newActiveId = newKeys.length > 0 ? newKeys[0].id : null;
    }
    setKeys(newKeys);
    setActiveKeyId(newActiveId);
    persist(newKeys, newActiveId);
  }, [keys, activeKeyId, persist]);

  /** Set a specific key as active */
  const setActiveKey = useCallback((id) => {
    setActiveKeyId(id);
    persist(keys, id);
  }, [keys, persist]);

  /** Update the label of a key */
  const updateLabel = useCallback((id, newLabel) => {
    const newKeys = keys.map(k =>
      k.id === id ? { ...k, label: newLabel } : k
    );
    setKeys(newKeys);
    persist(newKeys, activeKeyId);
  }, [keys, activeKeyId, persist]);

  /** Get the currently active API key string (or empty string) */
  const getActiveKey = useCallback(() => {
    const active = keys.find(k => k.id === activeKeyId);
    return active ? active.key : '';
  }, [keys, activeKeyId]);

  return {
    keys,
    activeKeyId,
    addKey,
    deleteKey,
    setActiveKey,
    updateLabel,
    getActiveKey,
    hasActiveKey: !!activeKeyId && keys.some(k => k.id === activeKeyId),
  };
}
