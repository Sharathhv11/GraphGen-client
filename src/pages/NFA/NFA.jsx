import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp, Download, Loader2, AlertCircle, GitFork, Key } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import useHistory from '../../utils/useHistory';
import useApiKeyStatus from '../../utils/useApiKeyStatus';
import { Graphviz } from 'graphviz-react';
import geminiIcon from '../../assets/gemini-icon.png';
import './NFA.css';

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash' },
  { id: 'gemma-4-26b-a4b-it',    label: 'Gemma 4 26B' },
  { id: 'gemma-4-31b-it',        label: 'Gemma 4 31B' },
  { id: 'gemini-flash-latest',   label: 'Gemini Flash Latest' },
];

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
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-lite');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vizCode, setVizCode] = useState('');

  const { saveHistory } = useHistory('nfa');
  const { hasApiKey } = useApiKeyStatus();

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

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/diagram/toc/nfa', {
        query: description,
        model: selectedModel,
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

  const handleDownloadPNG = () => {
    const svgElement = document.querySelector('.nfa-viz-container svg');
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
      link.download = 'nfa-diagram.png';
      link.href = pngUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = url;
  };

  return (
    <div className="nfa-page">
      <div className="nfa-container">
        {/* Left Pane - Inputs */}
        <div className="nfa-input-pane">

          {/* No API Key Banner */}
          {!hasApiKey && (
            <div className="no-key-banner" onClick={() => navigate('/home')}>
              <Key size={14} />
              <span>No API key configured. <strong>Go to Dashboard</strong> to add your Gemini key.</span>
            </div>
          )}
          <div className="nfa-pane-header">
            <div className="nfa-title-row">
              <GitFork size={22} className="nfa-title-icon" />
              <h2>NFA Generator</h2>
            </div>
            <p>
              Describe the Nondeterministic Finite Automaton (NFA) you want to generate.
            </p>
          </div>

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
              <select
                className="model-select-inline"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                title="Select AI model"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
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
              <button className="nfa-btn-download" onClick={handleDownloadPNG} title="Download PNG">
                <Download size={18} />
                <span>Export PNG</span>
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
          <div className="powered-by-gemini">
            powered by <img src={geminiIcon} alt="Gemini" /> gemini
          </div>
        </div>
      </div>
    </div>
  );
}
