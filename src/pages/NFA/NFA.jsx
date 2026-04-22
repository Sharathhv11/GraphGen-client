import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, Download, Loader2, AlertCircle, Info, GitFork } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import useHistory from '../../utils/useHistory';
import { Graphviz } from 'graphviz-react';
import './NFA.css';

export default function NFA() {
  useTitle('NFA Generator');
  const location = useLocation();
  const [apiKey, setApiKey] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vizCode, setVizCode] = useState('');

  const { saveHistory } = useHistory('nfa');

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
      setError('Please provide a problem description.');
      return;
    }
    if (!apiKey.trim()) {
      setError('API Key is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/diagram/toc/nfa', {
        query: description,
        apiKey,
      });

      if (response.data.status === 'success' && response.data.data.vizCode) {
        let rawCode = response.data.data.vizCode;

        // Strip markdown code block backticks if present
        rawCode = rawCode.replace(/```[a-zA-Z]*\n/gi, '').replace(/```/g, '').trim();

        // Extract valid graphviz block
        const digraphMatch = rawCode.match(/(?:strict\s+)?(?:di)?graph\s+.*?\{[\s\S]*\}/i);
        if (digraphMatch) {
          rawCode = digraphMatch[0];
        }

        setVizCode(rawCode);

        // Save to history
        saveHistory({ prompt: description }, { vizCode: rawCode });
      } else {
        setError('Failed to generate diagram. Invalid response format.');
      }
    } catch (err) {
      console.error('Error generating NFA:', err);
      setError(
        err.response?.data?.message ||
          'Failed to connect to the server. Please check your API key and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSVG = () => {
    const svgElement = document.querySelector('.nfa-viz-container svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'nfa-diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="nfa-page">
      <div className="nfa-container">
        {/* Left Pane - Inputs */}
        <div className="nfa-input-pane">
          <div className="nfa-pane-header">
            <div className="nfa-title-row">
              <GitFork size={22} className="nfa-title-icon" />
              <h2>NFA Generator</h2>
            </div>
            <p>
              Describe the Nondeterministic Finite Automaton (NFA) you want to generate.
            </p>
          </div>

          <div className="nfa-input-group">
            <div className="nfa-label-with-action">
              <label htmlFor="nfaApiKey">Gemini API Key</label>
              <Link to="/home/demo" className="nfa-demo-link">
                <Info size={14} />
                <span>Demo / Guide</span>
              </Link>
            </div>
            <input
              type="password"
              id="nfaApiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API Key"
              className="nfa-input"
            />
          </div>

          <div className="nfa-input-group nfa-flex-grow">
            <label htmlFor="nfaDescription">Problem Description</label>
            <textarea
              id="nfaDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Design an NFA for strings over {a,b} that end with 'ab'"
              className="nfa-textarea"
            />
          </div>

          {error && (
            <div className="nfa-error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button
            className="nfa-btn-generate"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="nfa-spinner" size={18} />
                Generating Analysis...
              </>
            ) : (
              <>
                <Play size={18} />
                Generate NFA
              </>
            )}
          </button>
        </div>

        {/* Right Pane - Output */}
        <div className="nfa-output-pane">
          <div className="nfa-pane-header nfa-output-header">
            <h2>Generated Diagram</h2>
            {vizCode && (
              <button className="nfa-btn-download" onClick={handleDownloadSVG} title="Download SVG">
                <Download size={18} />
                <span>Export SVG</span>
              </button>
            )}
          </div>

          <div className="nfa-viz-render-area">
            {loading ? (
              <div className="nfa-loading-state">
                <Loader2 className="nfa-spinner-large" />
                <p>Analyzing description and rendering NFA graph...</p>
                <span className="nfa-loading-subtext">
                  The AI is reasoning through nondeterministic transitions. This may take a moment.
                </span>
              </div>
            ) : vizCode ? (
              <div className="nfa-viz-container">
                <Graphviz
                  dot={vizCode}
                  options={{ zoom: true, height: '100%', width: '100%', fit: true }}
                />
              </div>
            ) : (
              <div className="nfa-empty-state">
                <div className="nfa-empty-icon">
                  <GitFork size={44} strokeWidth={1.2} />
                </div>
                <p>No diagram generated yet.</p>
                <span>
                  Describe an NFA problem on the left and click <strong>Generate</strong> to create the automaton diagram.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
