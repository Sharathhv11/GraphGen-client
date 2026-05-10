import { useState, useEffect, useCallback } from 'react';
import api from './api';

/**
 * Custom hook to check if the authenticated user has a Gemini API key configured.
 *
 * @returns {{ hasApiKey: boolean, loading: boolean, recheck: () => void }}
 */
export default function useApiKeyStatus() {
  const [hasApiKey, setHasApiKey] = useState(true);   // optimistic default
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/auth/api-key/status');
      setHasApiKey(data.data.hasApiKey);
    } catch {
      // If the call fails (e.g. no token), assume key exists to avoid blocking UI
      setHasApiKey(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { hasApiKey, loading, recheck: fetchStatus };
}
