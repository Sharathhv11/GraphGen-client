import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Trash2, Loader2, Workflow, CircleDot, GitFork,
  Database, Network, Search, Filter,
} from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import './History.css';

/* ── Type metadata: labels, icons, routes, accent colors ── */
const TYPE_META = {
  flowchart:        { label: 'Flowchart',       icon: Workflow,  route: '/home/flowchart',       color: '#10b981' },
  dfa:              { label: 'DFA',             icon: CircleDot, route: '/home/dfa',             color: '#a78bfa' },
  nfa:              { label: 'NFA',             icon: GitFork,   route: '/home/nfa',             color: '#f97316' },
  'er-diagram':     { label: 'ER Diagram',      icon: Database,  route: '/home/er-diagram',      color: '#3b82f6' },
  'data-structure': { label: 'Data Structure',   icon: Network,   route: '/home/data-structure',  color: '#06b6d4' },
};

const ALL_TYPES = Object.keys(TYPE_META);

export default function HistoryPage() {
  useTitle('History');
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  /* ── Fetch all history on mount ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/history');
        if (res.data.status === 'success') {
          setHistory(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Delete ── */
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/history/${id}`);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  /* ── Click to restore — navigate to the page with state ── */
  const handleSelect = (item) => {
    const meta = TYPE_META[item.actionType];
    if (!meta) return;

    // Navigate to the target page, passing the history data via location state
    navigate(meta.route, {
      state: {
        fromHistory: true,
        inputData: item.inputData,
        outputData: item.outputData,
      },
    });
  };

  /* ── Filter & Search ── */
  const filtered = history.filter((item) => {
    if (filter !== 'all' && item.actionType !== filter) return false;
    if (search.trim()) {
      const prompt = item.inputData?.prompt || item.inputData?.query || item.inputData?.code || '';
      return prompt.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  /* ── Helpers ── */
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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncate = (text, maxLen = 80) => {
    if (!text) return 'Untitled';
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
  };

  const typeCounts = {};
  history.forEach((h) => {
    typeCounts[h.actionType] = (typeCounts[h.actionType] || 0) + 1;
  });

  return (
    <div className="hist-page">
      {/* Header */}
      <div className="hist-header">
        <div className="hist-header-left">
          <Clock size={26} className="hist-header-icon" />
          <div>
            <h1>Generation History</h1>
            <p>{history.length} total generation{history.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Filter chips */}
      <div className="hist-toolbar">
        <div className="hist-search-wrap">
          <Search size={16} className="hist-search-icon" />
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="hist-search"
          />
        </div>

        <div className="hist-filters">
          <Filter size={14} className="hist-filter-icon" />
          <button
            className={`hist-chip ${filter === 'all' ? 'hist-chip-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({history.length})
          </button>
          {ALL_TYPES.map((type) => {
            const meta = TYPE_META[type];
            const count = typeCounts[type] || 0;
            if (count === 0) return null;
            const Icon = meta.icon;
            return (
              <button
                key={type}
                className={`hist-chip ${filter === type ? 'hist-chip-active' : ''}`}
                onClick={() => setFilter(type)}
                style={{ '--chip-color': meta.color }}
              >
                <Icon size={13} />
                {meta.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* History list */}
      <div className="hist-list">
        {loading ? (
          <div className="hist-empty-state">
            <Loader2 size={32} className="hist-spin" />
            <p>Loading history…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="hist-empty-state">
            <Clock size={44} strokeWidth={1} className="hist-empty-icon" />
            <p>{search || filter !== 'all' ? 'No matching history' : 'No history yet'}</p>
            <span>
              {search || filter !== 'all'
                ? 'Try changing your search or filter.'
                : 'Generate a diagram to see it appear here.'}
            </span>
          </div>
        ) : (
          filtered.map((item) => {
            const meta = TYPE_META[item.actionType] || {
              label: item.actionType,
              icon: Clock,
              color: '#6b7280',
            };
            const Icon = meta.icon;
            const prompt =
              item.inputData?.prompt || item.inputData?.query || item.inputData?.code || '';

            return (
              <div
                className="hist-card"
                key={item._id}
                onClick={() => handleSelect(item)}
                style={{ '--card-accent': meta.color }}
              >
                <div className="hist-card-body">
                  <div className="hist-card-top">
                    <div className="hist-card-badge">
                      <Icon size={14} />
                      <span>{meta.label}</span>
                    </div>
                    <div className="hist-card-meta">
                      <span className="hist-card-date">{formatDate(item.createdAt)}</span>
                      <button
                        className="hist-card-delete"
                        onClick={(e) => handleDelete(item._id, e)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <p className="hist-card-prompt">{truncate(prompt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
