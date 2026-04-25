import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp, Download, Loader2, AlertCircle, Database, Key } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import useHistory from '../../utils/useHistory';
import useApiKeys from '../../utils/useApiKeys';
import { Graphviz } from 'graphviz-react';
import './ERDiagram.css';

const EXAMPLE_PROMPTS = [
  "Design an ER diagram for a Library system with Books, Members, and Loans",
  "ER diagram for a University with Students, Courses, and Professors",
  "Hospital management system with Patients, Doctors, and Appointments",
  "E-commerce platform with Users, Products, Orders, and Reviews",
];

export default function ERDiagram() {
  useTitle('ER Diagram Generator');
  const location = useLocation();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vizCode, setVizCode] = useState('');

  const { saveHistory } = useHistory('er-diagram');
  const { getActiveKey, hasActiveKey } = useApiKeys();

  /* ── Restore from History page navigation ── */
  useEffect(() => {
    if (location.state?.fromHistory) {
      if (location.state.outputData?.vizCode) setVizCode(location.state.outputData.vizCode);
      if (location.state.inputData?.prompt) setDescription(location.state.inputData.prompt);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please provide a system description.');
      return;
    }
    const apiKey = getActiveKey();
    if (!apiKey) {
      setError('No active API key. Please add one in API Key settings.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/diagram/toc/er', {
        query: description,
        apiKey,
      });

      if (response.data.status === 'success' && response.data.data.vizCode) {
        let rawCode = response.data.data.vizCode;

        // Strip markdown code block backticks if present
        rawCode = rawCode.replace(/```[a-zA-Z]*\n/gi, '').replace(/```/g, '').trim();

        // Extract valid graphviz block — ER uses undirected 'graph'
        const graphMatch = rawCode.match(/(?:strict\s+)?(?:di)?graph\s+.*?\{[\s\S]*\}/i);
        if (graphMatch) {
          rawCode = graphMatch[0];
        }

        setVizCode(rawCode);

        // Save to history
        saveHistory({ prompt: description }, { vizCode: rawCode });
      } else {
        setError('Failed to generate diagram. Invalid response format.');
      }
    } catch (err) {
      console.error('Error generating ER Diagram:', err);
      setError(
        err.response?.data?.message ||
          'Failed to connect to the server. Please check your API key and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleDownloadSVG = () => {
    const svgElement = document.querySelector('.er-viz-container svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'er-diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="er-page">
      <div className="er-container">
        {/* Left Pane - Inputs */}
        <div className="er-input-pane">
          <div className="er-pane-header">
            <div className="er-title-row">
              <Database size={22} className="er-title-icon" />
              <h2>ER Diagram</h2>
            </div>
            <p>
              Describe a real-world system and generate its Entity-Relationship diagram
              automatically.
            </p>
          </div>

          {!hasActiveKey && (
            <div className="no-key-banner" onClick={() => navigate('/home/api-keys')}>
              <AlertCircle size={16} />
              <span>No active API key — <strong>click to add one</strong></span>
            </div>
          )}

          <div className="er-input-group er-flex-grow">
            <label htmlFor="erDescription">System Description</label>
            <div className="prompt-input-wrapper">
              <textarea
                id="erDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Design an ER diagram for a Library system with Books, Members, and Loans..."
                className="er-textarea"
              />
              <button 
                className="prompt-send-btn" 
                onClick={handleGenerate}
                disabled={loading || !description.trim()}
                title="Generate ER Diagram"
              >
                {loading ? (
                  <Loader2 className="spinner" size={18} />
                ) : (
                  <ArrowUp size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Example Chips */}
          <div className="prompt-examples">
            <span className="prompt-examples-label">Try an example:</span>
            <div className="prompt-examples-list">
              {EXAMPLE_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  className="prompt-example-chip"
                  onClick={() => setDescription(prompt)}
                  title={prompt}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="er-error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Pane - Output */}
        <div className="er-output-pane">
          <div className="er-pane-header er-output-header">
            <h2>Generated Diagram</h2>
            {vizCode && (
              <button className="er-btn-download" onClick={handleDownloadSVG} title="Download SVG">
                <Download size={18} />
                <span>Export SVG</span>
              </button>
            )}
          </div>

          <div className="er-viz-render-area">
            {loading ? (
              <div className="er-loading-state">
                <Loader2 className="er-spinner-large" />
                <p>Analyzing system description & building ER model...</p>
                <span className="er-loading-subtext">
                  The AI is identifying entities, attributes, and relationships. This may take a
                  moment.
                </span>
              </div>
            ) : vizCode ? (
              <div className="er-viz-container">
                <Graphviz
                  dot={vizCode}
                  options={{ zoom: true, height: '100%', width: '100%', fit: true }}
                />
              </div>
            ) : (
              <div className="er-empty-state">
                <div className="er-empty-icon">
                  <Database size={48} strokeWidth={1} />
                </div>
                <p>No diagram generated yet.</p>
                <span>
                  Describe a database system on the left and press <strong>Enter</strong> or click the arrow to generate.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
