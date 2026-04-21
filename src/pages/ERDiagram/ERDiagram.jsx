import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Download, Loader2, AlertCircle, Info, Database } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import { Graphviz } from 'graphviz-react';
import './ERDiagram.css';

const EXAMPLE_PROMPTS = [
  'Design an ER diagram for a University system with Students, Courses, and Professors.',
  'Design an ER diagram for an E-commerce platform with Products, Customers, and Orders.',
  'Design an ER diagram for a Hospital system with Patients, Doctors, and Appointments.',
  'Design an ER diagram for a Library system with Books, Members, and Loans.',
];

export default function ERDiagram() {
  useTitle('ER Diagram Generator');
  const [apiKey, setApiKey] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vizCode, setVizCode] = useState('');

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please provide a system description.');
      return;
    }
    if (!apiKey.trim()) {
      setError('API Key is required.');
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

  const handleExampleClick = (prompt) => {
    setDescription(prompt);
    setError(null);
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

          <div className="er-input-group">
            <div className="er-label-with-action">
              <label htmlFor="erApiKey">Gemini API Key</label>
              <Link to="/home/demo" className="er-demo-link">
                <Info size={14} />
                <span>Demo / Guide</span>
              </Link>
            </div>
            <input
              type="password"
              id="erApiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API Key"
              className="er-input"
            />
          </div>

          <div className="er-input-group er-flex-grow">
            <label htmlFor="erDescription">System Description</label>
            <textarea
              id="erDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Design an ER diagram for a Library system with Books, Members, and Loans..."
              className="er-textarea"
            />
          </div>

          {/* Quick-fill example prompts */}
          <div className="er-examples">
            <span className="er-examples-label">Try an example:</span>
            <div className="er-examples-list">
              {EXAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  className="er-example-chip"
                  onClick={() => handleExampleClick(prompt)}
                  title={prompt}
                >
                  {prompt.length > 55 ? prompt.slice(0, 55) + '…' : prompt}
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

          <button className="er-btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="er-spinner" size={18} />
                Generating ER Diagram...
              </>
            ) : (
              <>
                <Play size={18} />
                Generate ER Diagram
              </>
            )}
          </button>
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
                  Describe a database system on the left and click <strong>Generate</strong> to
                  create an ER diagram.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
