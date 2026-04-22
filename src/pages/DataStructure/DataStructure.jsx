import { useState, useEffect, Component } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, Download, Loader2, AlertCircle, Info, Network, RefreshCcw } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import useHistory from '../../utils/useHistory';
import { Graphviz } from 'graphviz-react';
import './DataStructure.css';

/* ── Error Boundary to catch Graphviz rendering crashes ── */
class GraphvizErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error?.message || 'Unknown rendering error' };
  }

  reset = () => this.setState({ hasError: false, errorMsg: '' });

  render() {
    if (this.state.hasError) {
      return (
        <div className="ds-empty-state">
          <div className="ds-empty-icon" style={{ background: 'linear-gradient(135deg, #fecaca, #f87171)' }}>
            <AlertCircle size={44} strokeWidth={1.2} color="#991b1b" />
          </div>
          <p>Diagram rendering failed</p>
          <span style={{ marginBottom: '1rem' }}>
            The generated DOT code couldn't be rendered. Try generating again.
          </span>
          <button
            className="ds-btn-download"
            onClick={() => {
              this.reset();
              if (this.props.onRetry) this.props.onRetry();
            }}
          >
            <RefreshCcw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Example prompts ── */
const EXAMPLE_PROMPTS = [
  'Create a BST by inserting 50, 30, 70, 20, 40, 60, 80',
  'Visualize a singly linked list with values 10 → 20 → 30 → 40',
  'Show a max-heap with elements [90, 80, 70, 50, 60, 40, 30]',
  'Draw a stack with elements: A, B, C, D (D on top)',
  'Draw an undirected graph with 5 vertices and edges A-B, B-C, C-D, D-E, E-A, A-C',
];

export default function DataStructure() {
  useTitle('Data Structure Visualizer');
  const location = useLocation();

  const [apiKey, setApiKey] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vizCode, setVizCode] = useState('');
  const [renderKey, setRenderKey] = useState(0);

  const { saveHistory } = useHistory('data-structure');

  /* ── Restore from History page navigation ── */
  useEffect(() => {
    if (location.state?.fromHistory) {
      if (location.state.outputData?.vizCode) {
        setVizCode(location.state.outputData.vizCode);
        setRenderKey((k) => k + 1);
      }
      if (location.state.inputData?.prompt) setDescription(location.state.inputData.prompt);
      // Clear state so refreshing doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please describe the data structure you want to visualize.');
      return;
    }
    if (!apiKey.trim()) {
      setError('Gemini API Key is required.');
      return;
    }

    setLoading(true);
    setError(null);
    setVizCode('');

    try {
      const response = await api.post('/api/diagram/ds', {
        query: description,
        apiKey,
      });

      if (response.data.status === 'success' && response.data.data.vizCode) {
        let rawCode = response.data.data.vizCode;

        // Strip markdown code block backticks if present
        rawCode = rawCode.replace(/```[a-zA-Z]*\n/gi, '').replace(/```/g, '').trim();

        // Extract valid graphviz block — supports both 'digraph' and 'graph' (undirected)
        const graphMatch = rawCode.match(/(?:strict\s+)?(?:di)?graph\s+.*?\{[\s\S]*\}/i);
        if (graphMatch) rawCode = graphMatch[0];

        // Fix invalid <-> edges: convert to undirected graph with -- edges
        if (rawCode.includes('<->')) {
          rawCode = rawCode.replace(/\bdigraph\b/i, 'graph');
          rawCode = rawCode.replace(/<->/g, '--');
        }

        // If 'graph' (undirected) still has -> edges, fix them to --
        if (/^\s*graph\b/i.test(rawCode) && rawCode.includes('->')) {
          rawCode = rawCode.replace(/->/g, '--');
        }

        // If 'digraph' still has -- edges, fix them to ->
        if (/^\s*digraph\b/i.test(rawCode) && /\s--\s/.test(rawCode)) {
          rawCode = rawCode.replace(/\s--\s/g, ' -> ');
        }

        setVizCode(rawCode);
        setRenderKey((k) => k + 1); // force fresh error boundary

        // Save to history
        saveHistory({ prompt: description }, { vizCode: rawCode });
      } else {
        setError('Failed to generate diagram. Please try again.');
      }
    } catch (err) {
      console.error('Data Structure error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to connect. Please check your API key and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSVG = () => {
    const svgEl = document.querySelector('.ds-viz-container svg');
    if (!svgEl) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data-structure.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ds-page">
      <div className="ds-container">
        {/* ══ LEFT PANE ══ */}
        <div className="ds-input-pane">
          <div className="ds-pane-header">
            <div className="ds-title-row">
              <Network size={22} className="ds-title-icon" />
              <h2>Data Structure Visualizer</h2>
            </div>
            <p>
              Describe any data structure and visualize it instantly — BST, Linked Lists,
              Heaps, Graphs, Stacks, Queues, and more.
            </p>
          </div>

          {/* API Key */}
          <div className="ds-input-group">
            <div className="ds-label-with-action">
              <label htmlFor="dsApiKey">Gemini API Key</label>
              <Link to="/home/demo" className="ds-demo-link">
                <Info size={13} />
                <span>Guide</span>
              </Link>
            </div>
            <input
              type="password"
              id="dsApiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API Key"
              className="ds-input"
            />
          </div>

          {/* Description */}
          <div className="ds-input-group ds-flex-grow">
            <label htmlFor="dsDescription">Describe your data structure</label>
            <textarea
              id="dsDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Create a BST by inserting 50, 30, 70, 20, 40, 60, 80"
              className="ds-textarea"
            />
          </div>

          {/* Example Chips */}
          <div className="ds-examples">
            <span className="ds-examples-label">Try an example:</span>
            <div className="ds-examples-list">
              {EXAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  className="ds-example-chip"
                  onClick={() => setDescription(prompt)}
                  title={prompt}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="ds-error-message">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          {/* Generate */}
          <button className="ds-btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="ds-spinner" size={17} />
                Generating Visualization...
              </>
            ) : (
              <>
                <Play size={17} />
                Generate Diagram
              </>
            )}
          </button>
        </div>

        {/* ══ RIGHT PANE ══ */}
        <div className="ds-output-pane">
          <div className="ds-pane-header ds-output-header">
            <h2>Generated Diagram</h2>
            {vizCode && (
              <button className="ds-btn-download" onClick={handleDownloadSVG}>
                <Download size={16} />
                <span>Export SVG</span>
              </button>
            )}
          </div>

          <div className="ds-viz-render-area">
            {loading ? (
              <div className="ds-loading-state">
                <Loader2 className="ds-spinner-large" />
                <p>Building your data structure…</p>
                <span className="ds-loading-subtext">
                  The AI is analyzing nodes, edges, and relationships. This may take a moment.
                </span>
              </div>
            ) : vizCode ? (
              <GraphvizErrorBoundary
                key={renderKey}
                onRetry={() => setVizCode('')}
              >
                <div className="ds-viz-container">
                  <Graphviz
                    dot={vizCode}
                    options={{
                      useWorker: false,
                      zoom: true,
                      height: '100%',
                      width: '100%',
                      fit: true,
                    }}
                  />
                </div>
              </GraphvizErrorBoundary>
            ) : (
              <div className="ds-empty-state">
                <div className="ds-empty-icon">
                  <Network size={44} strokeWidth={1.2} />
                </div>
                <p>No diagram generated yet</p>
                <span>
                  Describe a data structure on the left and click <strong>Generate</strong> to
                  visualize it.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
