import { useState } from 'react';
import { Key, Plus, Trash2, CheckCircle2, Circle, AlertCircle, Eye, EyeOff, Tag } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import useApiKeys from '../../utils/useApiKeys';
import './ApiKeys.css';

export default function ApiKeys() {
  useTitle('API Key Management');
  const { keys, activeKeyId, addKey, deleteKey, setActiveKey, updateLabel } = useApiKeys();

  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [showKey, setShowKey] = useState({});
  const [error, setError] = useState('');
  const [editingLabel, setEditingLabel] = useState(null);
  const [editLabelValue, setEditLabelValue] = useState('');

  const handleAddKey = () => {
    const trimmed = newKey.trim();
    if (!trimmed) {
      setError('Please enter an API key.');
      return;
    }
    if (trimmed.length < 10) {
      setError('API key seems too short. Please enter a valid Gemini API key.');
      return;
    }
    // Check for duplicates
    if (keys.some(k => k.key === trimmed)) {
      setError('This API key already exists.');
      return;
    }
    addKey(trimmed, newLabel.trim());
    setNewKey('');
    setNewLabel('');
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddKey();
  };

  const toggleShowKey = (id) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key) => {
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
  };

  const startEditLabel = (id, currentLabel) => {
    setEditingLabel(id);
    setEditLabelValue(currentLabel);
  };

  const saveLabel = (id) => {
    if (editLabelValue.trim()) {
      updateLabel(id, editLabelValue.trim());
    }
    setEditingLabel(null);
  };

  return (
    <div className="apikeys-page">
      <div className="apikeys-container">
        {/* Header */}
        <div className="apikeys-header">
          <div className="apikeys-title-row">
            <Key size={24} className="apikeys-title-icon" />
            <h2>API Key Management</h2>
          </div>
          <p>
            Manage your Gemini API keys. Add multiple keys and set one as active 
            to use across all diagram generators.
          </p>
        </div>

        {/* Add New Key Section */}
        <div className="apikeys-add-section">
          <h3>Add New Key</h3>
          <div className="apikeys-add-form">
            <div className="apikeys-add-fields">
              <div className="apikeys-field">
                <label htmlFor="newLabel">Label (optional)</label>
                <input
                  type="text"
                  id="newLabel"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Personal, School, Work"
                  className="apikeys-input apikeys-label-input"
                />
              </div>
              <div className="apikeys-field apikeys-field-grow">
                <label htmlFor="newApiKey">API Key</label>
                <input
                  type="password"
                  id="newApiKey"
                  value={newKey}
                  onChange={(e) => { setNewKey(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste your Gemini API Key here"
                  className="apikeys-input"
                />
              </div>
            </div>
            <button className="apikeys-add-btn" onClick={handleAddKey}>
              <Plus size={18} />
              <span>Add Key</span>
            </button>
          </div>
          {error && (
            <div className="apikeys-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Keys List */}
        <div className="apikeys-list-section">
          <div className="apikeys-list-header">
            <h3>Your Keys</h3>
            <span className="apikeys-count">{keys.length} key{keys.length !== 1 ? 's' : ''}</span>
          </div>

          {keys.length === 0 ? (
            <div className="apikeys-empty">
              <div className="apikeys-empty-icon">
                <Key size={36} strokeWidth={1.2} />
              </div>
              <p>No API keys added yet</p>
              <span>Add your first Gemini API key above to start generating diagrams.</span>
            </div>
          ) : (
            <div className="apikeys-list">
              {keys.map((keyItem) => {
                const isActive = keyItem.id === activeKeyId;
                return (
                  <div
                    key={keyItem.id}
                    className={`apikeys-card ${isActive ? 'apikeys-card-active' : ''}`}
                  >
                    <div className="apikeys-card-left">
                      <button
                        className={`apikeys-radio ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveKey(keyItem.id)}
                        title={isActive ? 'Currently active' : 'Set as active'}
                      >
                        {isActive ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                      <div className="apikeys-card-info">
                        <div className="apikeys-card-label-row">
                          {editingLabel === keyItem.id ? (
                            <input
                              className="apikeys-edit-label-input"
                              value={editLabelValue}
                              onChange={(e) => setEditLabelValue(e.target.value)}
                              onBlur={() => saveLabel(keyItem.id)}
                              onKeyDown={(e) => { if (e.key === 'Enter') saveLabel(keyItem.id); }}
                              autoFocus
                            />
                          ) : (
                            <span
                              className="apikeys-card-label"
                              onClick={() => startEditLabel(keyItem.id, keyItem.label)}
                              title="Click to edit label"
                            >
                              <Tag size={13} />
                              {keyItem.label}
                            </span>
                          )}
                          {isActive && <span className="apikeys-active-badge">Active</span>}
                        </div>
                        <div className="apikeys-card-key">
                          <code>
                            {showKey[keyItem.id] ? keyItem.key : maskKey(keyItem.key)}
                          </code>
                          <button
                            className="apikeys-toggle-vis"
                            onClick={() => toggleShowKey(keyItem.id)}
                            title={showKey[keyItem.id] ? 'Hide key' : 'Show key'}
                          >
                            {showKey[keyItem.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <span className="apikeys-card-date">
                          Added {new Date(keyItem.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="apikeys-card-actions">
                      {!isActive && (
                        <button
                          className="apikeys-activate-btn"
                          onClick={() => setActiveKey(keyItem.id)}
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        className="apikeys-delete-btn"
                        onClick={() => deleteKey(keyItem.id)}
                        title="Delete this key"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="apikeys-info">
          <AlertCircle size={15} />
          <span>
            API keys are stored locally in your browser and never sent to our servers.
            They are passed directly to the Gemini API for diagram generation.
          </span>
        </div>
      </div>
    </div>
  );
}
