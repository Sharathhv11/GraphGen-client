import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp, Download, Loader2, AlertCircle, CircleDot, Key } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import useHistory from '../../utils/useHistory';
import useApiKeys from '../../utils/useApiKeys';
import { Graphviz } from 'graphviz-react';
import './DFA.css';

const EXAMPLE_PROMPTS = [
  "Design a DFA for strings over {a,b} that end with 'abb'",
  "DFA for binary strings with an even number of 0s",
  "DFA that accepts strings over {0,1} starting with '10'",
  "DFA for strings containing the substring '010'",
];

export default function DFA() {
  useTitle('DFA Generator');
  const location = useLocation();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vizCode, setVizCode] = useState('');

  const { saveHistory } = useHistory('dfa');
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
      const response = await api.post('/api/diagram/toc/dfa', {
        query: description,
        apiKey
      });

      if (response.data.status === 'success' && response.data.data.vizCode) {
        let rawCode = response.data.data.vizCode;
        
        // Strip markdown code block backticks if present (e.g., ```dot ... ```)
        rawCode = rawCode.replace(/```[a-zA-Z]*\n/gi, '').replace(/```/g, '').trim();

        // Extract just the valid graphviz block to discard arbitrary conversational text
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
      console.error('Error generating DFA:', err);
      setError(err.response?.data?.message || 'Failed to connect to the server. Please check your API key and try again.');
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

  const handleDownloadPNG = () => {
    // Graphviz-react renders an SVG inside its container
    const svgElement = document.querySelector('.viz-container svg');
    if (!svgElement) return;

    const viewBox = svgElement.viewBox.baseVal;
    let width = viewBox.width || svgElement.getBoundingClientRect().width;
    let height = viewBox.height || svgElement.getBoundingClientRect().height;

    const scale = 3;
    width *= scale;
    height *= scale;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      DOMURL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'dfa-diagram.png';
      link.href = pngUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = url;
  };

  return (
    <div className="dfa-page">
      <div className="dfa-container">
        {/* Left Pane - Inputs */}
        <div className="dfa-input-pane">
          <div className="pane-header">
            <div className="dfa-title-row">
              <CircleDot size={22} className="dfa-title-icon" />
              <h2>DFA Generator</h2>
            </div>
            <p>Describe the Deterministic Finite Automaton (DFA) you want to generate.</p>
          </div>

          {!hasActiveKey && (
            <div className="no-key-banner" onClick={() => navigate('/home/api-keys')}>
              <AlertCircle size={16} />
              <span>No active API key — <strong>click to add one</strong></span>
            </div>
          )}

          <div className="input-group flex-grow">
            <label htmlFor="description">Problem Description</label>
            <div className="prompt-input-wrapper">
              <textarea 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Design a DFA for strings over {a,b} that end with 'abb'" 
                className="dfa-textarea"
              />
              <button 
                className="prompt-send-btn" 
                onClick={handleGenerate}
                disabled={loading || !description.trim()}
                title="Generate DFA"
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
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Pane - Output */}
        <div className="dfa-output-pane">
          <div className="pane-header output-header">
            <h2>Generated Diagram</h2>
            {vizCode && (
              <button className="btn-download" onClick={handleDownloadPNG} title="Download PNG">
                <Download size={18} />
                <span>Export PNG</span>
              </button>
            )}
          </div>

          <div className="viz-render-area">
            {loading ? (
              <div className="loading-state">
                <Loader2 className="spinner-large" />
                <p>Analyzing description and rendering graph...</p>
                <span className="loading-subtext">This process involves deep reasoning and may take a few moments.</span>
              </div>
            ) : vizCode ? (
              <div className="viz-container">
                <Graphviz 
                  dot={vizCode} 
                  options={{ zoom: true, height: "100%", width: "100%", fit: true }} 
                />
              </div>
            ) : (
              <div className="empty-state">
                <div className="dfa-empty-icon">
                  <CircleDot size={44} strokeWidth={1.2} />
                </div>
                <p>No diagram generated yet.</p>
                <span>Enter your configuration and description on the left to begin.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
