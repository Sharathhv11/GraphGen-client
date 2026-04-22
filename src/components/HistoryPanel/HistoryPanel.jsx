import { useState } from 'react';
import { Clock, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import './HistoryPanel.css';

/**
 * Collapsible history panel for diagram pages.
 *
 * Props:
 * - history: Array of history records
 * - historyLoading: boolean
 * - onSelect: (item) => void — called when the user clicks a history item
 * - onDelete: (id) => void — called to delete a history entry
 * - accentColor: string (CSS color for theming)
 */
export default function HistoryPanel({
  history,
  historyLoading,
  onSelect,
  onDelete,
  accentColor = '#06b6d4',
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncate = (text, maxLen = 60) => {
    if (!text) return 'Untitled';
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
  };

  return (
    <div className="hp-wrapper">
      <button
        className="hp-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ '--hp-accent': accentColor }}
      >
        <div className="hp-toggle-left">
          <Clock size={15} />
          <span>History</span>
          {history.length > 0 && (
            <span className="hp-badge">{history.length}</span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="hp-list">
          {historyLoading ? (
            <div className="hp-loading">
              <Loader2 size={16} className="hp-spin" />
              <span>Loading history…</span>
            </div>
          ) : history.length === 0 ? (
            <div className="hp-empty">
              <span>No history yet</span>
            </div>
          ) : (
            history.map((item) => (
              <div className="hp-item" key={item._id}>
                <button
                  className="hp-item-main"
                  onClick={() => onSelect(item)}
                  title={item.inputData?.prompt || item.inputData?.query || ''}
                >
                  <span className="hp-item-text">
                    {truncate(item.inputData?.prompt || item.inputData?.query || item.inputData?.code)}
                  </span>
                  <span className="hp-item-date">{formatDate(item.createdAt)}</span>
                </button>
                <button
                  className="hp-item-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item._id);
                  }}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
