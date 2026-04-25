import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp, Download, Loader2, AlertCircle, GitFork, Key } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import useHistory from '../../utils/useHistory';
import useApiKeys from '../../utils/useApiKeys';
import { Graphviz } from 'graphviz-react';
import './NFA.css';

const EXAMPLE_PROMPTS = [
  "Design an NFA for strings over {a,b} that end with 'ab'",
  "NFA for strings where the third symbol from right is '1'",
  "NFA that accepts strings starting with 'a' and ending with 'b'",
  "NFA for the regular expression (a|b)*abb",
];

export default function NFA() {
  useTitle('NFA Generator');
  const location = useLocation();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vizCode, setVizCode] = useState('');

  const { saveHistory } = useHistory('nfa');
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
      setError('Please provide a problem description.');
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
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

          {!hasActiveKey && (
            <div className="no-key-banner" onClick={() => navigate('/home/api-keys')}>
              <AlertCircle size={16} />
              <span>No active API key — <strong>click to add one</strong></span>
            </div>
          )}

          <div className="nfa-input-group nfa-flex-grow">
            <label htmlFor="nfaDescription">Problem Description</label>
            <div className="prompt-input-wrapper">
              <textarea
                id="nfaDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Design an NFA for strings over {a,b} that end with 'ab'"
                className="nfa-textarea"
              />
              <button 
                className="prompt-send-btn" 
                onClick={handleGenerate}
                disabled={loading || !description.trim()}
                title="Generate NFA"
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
            <div className="nfa-error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
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
                  Describe an NFA problem on the left and press <strong>Enter</strong> or click the arrow to generate.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
