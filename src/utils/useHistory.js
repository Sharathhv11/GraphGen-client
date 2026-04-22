import { useState, useEffect, useCallback } from 'react';
import api from './api';

/**
 * Custom hook for diagram history management.
 *
 * @param {string} actionType - The diagram type identifier (e.g. 'flowchart', 'dfa', 'nfa', 'er-diagram', 'data-structure')
 * @returns {object} history utilities
 */
export default function useHistory(actionType) {
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch history for the given actionType on mount
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/api/history');
      if (res.data.status === 'success') {
        // Filter by actionType so each page only sees its own history
        const filtered = res.data.data.filter((h) => h.actionType === actionType);
        setHistory(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, [actionType]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Save a new history entry after successful generation
  const saveHistory = useCallback(
    async (inputData, outputData) => {
      try {
        const res = await api.post('/api/history', {
          actionType,
          inputData,
          outputData,
        });
        if (res.data.status === 'success') {
          // Prepend the new record to the local list
          setHistory((prev) => [res.data.data, ...prev]);
        }
      } catch (err) {
        console.error('Failed to save history:', err);
      }
    },
    [actionType]
  );

  // Delete a history entry
  const deleteHistoryItem = useCallback(async (id) => {
    try {
      await api.delete(`/api/history/${id}`);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error('Failed to delete history:', err);
    }
  }, []);

  return {
    history,
    historyLoading,
    saveHistory,
    deleteHistoryItem,
    refreshHistory: fetchHistory,
  };
}
