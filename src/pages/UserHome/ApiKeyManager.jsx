import { useState, useEffect, useCallback } from 'react';
import { Key, Shield, Check, Trash2, AlertCircle, Eye, EyeOff, Loader } from 'lucide-react';
import api from '../../utils/api';
import './ApiKeyManager.css';

export default function ApiKeyManager() {
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState(null);   // { type: 'success'|'error', message }
  const [isEditing, setIsEditing] = useState(false);

  // Fetch API key status on mount
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/auth/api-key/status');
      setHasKey(data.data.hasApiKey);
    } catch {
      // Silently fail — card will show "no key" state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Clear status message after 4 seconds
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const handleSave = async () => {
    if (!apiKey.trim() || apiKey.trim().length < 10) {
      setStatus({ type: 'error', message: 'API key must be at least 10 characters.' });
      return;
    }

    try {
      setSaving(true);
      const { data } = await api.post('/api/auth/api-key', { apiKey: apiKey.trim() });
      setHasKey(data.data.hasApiKey);
      setApiKey('');
      setShowKey(false);
      setIsEditing(false);
      setStatus({ type: 'success', message: 'API key saved and encrypted successfully!' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save API key.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete('/api/auth/api-key');
      setHasKey(false);
      setApiKey('');
      setIsEditing(false);
      setStatus({ type: 'success', message: 'API key removed.' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to remove API key.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !saving) handleSave();
  };

  if (loading) {
    return (
      <div className="akm-card akm-loading">
        <Loader size={20} className="akm-spinner" />
        <span>Checking API key status…</span>
      </div>
    );
  }

  return (
    <div className="akm-card">
      {/* Header */}
      <div className="akm-header">
        <div className="akm-title-row">
          <div className="akm-icon-wrap">
            <Key size={18} />
          </div>
          <div>
            <h3 className="akm-title">Gemini API Key</h3>
            <p className="akm-subtitle">
              {hasKey
                ? 'Your key is securely stored and encrypted.'
                : 'Add your personal API key to start generating diagrams.'}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div className={`akm-badge ${hasKey ? 'akm-badge--active' : 'akm-badge--missing'}`}>
          {hasKey ? (
            <>
              <Check size={12} />
              <span>Configured</span>
            </>
          ) : (
            <>
              <AlertCircle size={12} />
              <span>Not Set</span>
            </>
          )}
        </div>
      </div>

      {/* Key Input */}
      {(!hasKey || isEditing) && (
        <div className="akm-input-section">
          <div className="akm-input-wrap">
            <input
              id="api-key-input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="AIzaSy… paste your Gemini API key"
              className="akm-input"
              autoComplete="off"
              spellCheck="false"
            />
            <button
              className="akm-eye-btn"
              onClick={() => setShowKey((p) => !p)}
              title={showKey ? 'Hide key' : 'Show key'}
              type="button"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="akm-actions">
            <button
              className="akm-btn akm-btn--primary"
              onClick={handleSave}
              disabled={saving || !apiKey.trim()}
            >
              {saving ? (
                <Loader size={14} className="akm-spinner" />
              ) : (
                <Shield size={14} />
              )}
              <span>{saving ? 'Encrypting…' : hasKey ? 'Update Key' : 'Save Key'}</span>
            </button>

            {isEditing && (
              <button
                className="akm-btn akm-btn--ghost"
                onClick={() => {
                  setIsEditing(false);
                  setApiKey('');
                  setShowKey(false);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions when key exists and not editing */}
      {hasKey && !isEditing && (
        <div className="akm-configured-actions">
          <button
            className="akm-btn akm-btn--outline"
            onClick={() => setIsEditing(true)}
          >
            <Key size={14} />
            <span>Change Key</span>
          </button>
          <button
            className="akm-btn akm-btn--danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <Loader size={14} className="akm-spinner" />
            ) : (
              <Trash2 size={14} />
            )}
            <span>{deleting ? 'Removing…' : 'Remove Key'}</span>
          </button>
        </div>
      )}

      {/* Status toast */}
      {status && (
        <div className={`akm-toast akm-toast--${status.type}`}>
          {status.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Security notice */}
      <div className="akm-security-note">
        <Shield size={13} />
        <span>
          Your key is encrypted with AES-256-GCM before storage and is never exposed in responses.
          <a
            href="https://ai.google.dev/gemini-api/docs/api-key"
            target="_blank"
            rel="noopener noreferrer"
          >
            {' '}Get a free key →
          </a>
        </span>
      </div>
    </div>
  );
}
