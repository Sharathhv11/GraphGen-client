import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp, Download, Loader2, AlertCircle, CircleDot, Key, Copy, Check } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import useHistory from '../../utils/useHistory';
import useApiKeyStatus from '../../utils/useApiKeyStatus';
import { copyToClipboard } from '../../utils/clipboard';
import { Graphviz } from 'graphviz-react';
import geminiIcon from '../../assets/gemini-icon.png';
import './DFA.css';

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash' },
  { id: 'gemma-4-26b-a4b-it',    label: 'Gemma 4 26B' },
  { id: 'gemma-4-31b-it',        label: 'Gemma 4 31B' },
  { id: 'gemini-flash-latest',   label: 'Gemini Flash Latest' },
];

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
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-lite');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vizCode, setVizCode] = useState('');
  const [regularExpression, setRegularExpression] = useState('');
  const [contextFreeGrammar, setContextFreeGrammar] = useState([]);
  const [activeTab, setActiveTab] = useState('diagram');
  const [copiedType, setCopiedType] = useState('');
  const copyTimerRef = useRef(null);

  const { saveHistory } = useHistory('dfa');
  const { hasApiKey } = useApiKeyStatus();

  /* ── Restore from History page navigation ── */
  useEffect(() => {
    if (location.state?.fromHistory) {
      setVizCode(location.state.outputData?.vizCode || '');
      setRegularExpression(
        typeof location.state.outputData?.regularExpression === 'string'
          ? location.state.outputData.regularExpression
          : ''
      );
      if (Array.isArray(location.state.outputData?.contextFreeGrammar)) {
        setContextFreeGrammar(location.state.outputData.contextFreeGrammar.filter(Boolean));
      } else if (typeof location.state.outputData?.contextFreeGrammar === 'string') {
        setContextFreeGrammar(
          location.state.outputData.contextFreeGrammar
            .split('\n')
            .map((rule) => rule.trim())
            .filter(Boolean)
        );
      } else {
        setContextFreeGrammar([]);
      }
      if (location.state.inputData?.prompt) setDescription(location.state.inputData.prompt);
      setActiveTab('diagram');
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  useEffect(() => () => {
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
  }, []);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please provide a problem description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/diagram/toc/dfa', {
        query: description,
        model: selectedModel,
      });

      if (response.data.status === 'success' && response.data.data) {
        const responseData = response.data.data;
        let rawCode = responseData.vizCode || '';
        
        // Strip markdown code block backticks if present (e.g., ```dot ... ```)
        rawCode = rawCode.replace(/```[a-zA-Z]*\n/gi, '').replace(/```/g, '').trim();

        // Extract just the valid graphviz block to discard arbitrary conversational text
        const digraphMatch = rawCode.match(/(?:strict\s+)?(?:di)?graph\s+.*?\{[\s\S]*\}/i);
        if (digraphMatch) {
          rawCode = digraphMatch[0];
        }

        setVizCode(rawCode);
        setRegularExpression(typeof responseData.regularExpression === 'string' ? responseData.regularExpression.trim() : '');
        setContextFreeGrammar(
          Array.isArray(responseData.contextFreeGrammar)
            ? responseData.contextFreeGrammar.filter(Boolean)
            : typeof responseData.contextFreeGrammar === 'string'
              ? responseData.contextFreeGrammar.split('\n').map((rule) => rule.trim()).filter(Boolean)
              : []
        );
        setActiveTab('diagram');

        // Save to history
        saveHistory(
          { prompt: description },
          {
            vizCode: rawCode,
            regularExpression: typeof responseData.regularExpression === 'string' ? responseData.regularExpression.trim() : '',
            contextFreeGrammar: Array.isArray(responseData.contextFreeGrammar)
              ? responseData.contextFreeGrammar.filter(Boolean)
              : typeof responseData.contextFreeGrammar === 'string'
                ? responseData.contextFreeGrammar.split('\n').map((rule) => rule.trim()).filter(Boolean)
                : [],
          }
        );
      } else {
        setError('Failed to generate output. Invalid response format.');
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

  const markCopied = (type) => {
    setCopiedType(type);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedType(''), 1800);
  };

  const handleCopyRegex = async () => {
    const result = await copyToClipboard(regularExpression);
    if (result.success) {
      markCopied('regex');
    } else {
      setError(result.error);
    }
  };

  const handleCopyCFG = async () => {
    const result = await copyToClipboard(contextFreeGrammar.join('\n'));
    if (result.success) {
      markCopied('cfg');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="dfa-page">
      <div className="dfa-container">
        {/* Left Pane - Inputs */}
        <div className="dfa-input-pane">

          {/* No API Key Banner */}
          {!hasApiKey && (
            <div className="no-key-banner" onClick={() => navigate('/home')}>
              <Key size={14} />
              <span>No API key configured. <strong>Go to Dashboard</strong> to add your Gemini key.</span>
            </div>
          )}
          <div className="pane-header">
            <div className="dfa-title-row">
              <CircleDot size={22} className="dfa-title-icon" />
              <h2>DFA Generator</h2>
            </div>
            <p>Describe the Deterministic Finite Automaton (DFA) you want to generate.</p>
          </div>

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
            <h2>Generated Output</h2>
            {activeTab === 'diagram' && vizCode && (
              <button className="btn-download" onClick={handleDownloadPNG} title="Download PNG">
                <Download size={18} />
                <span>Export PNG</span>
              </button>
            )}
          </div>

          <div className="output-tabs">
            <button className={`output-tab ${activeTab === 'diagram' ? 'active' : ''}`} onClick={() => setActiveTab('diagram')}>
              Diagram
            </button>
            <button className={`output-tab ${activeTab === 'regex' ? 'active' : ''}`} onClick={() => setActiveTab('regex')}>
              Regular Expression
            </button>
            <button className={`output-tab ${activeTab === 'cfg' ? 'active' : ''}`} onClick={() => setActiveTab('cfg')}>
              Context-Free Grammar
            </button>
          </div>

          <div className={`viz-render-area ${activeTab !== 'diagram' ? 'text-mode' : ''}`}>
            {activeTab === 'diagram' ? (
              loading ? (
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
              )
            ) : activeTab === 'regex' ? (
              <div className="text-output-block">
                <div className="text-output-header">
                  <h3>Regular Expression</h3>
                  <button className="btn-copy" onClick={handleCopyRegex} disabled={!regularExpression}>
                    {copiedType === 'regex' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedType === 'regex' ? 'Copied' : 'Copy Regex'}</span>
                  </button>
                </div>
                {loading ? (
                  <div className="text-loading">Loading regular expression…</div>
                ) : regularExpression ? (
                  <>
                    <p className="text-output-description">Equivalent pattern for the generated automaton:</p>
                    <pre className="text-output-pre">{regularExpression}</pre>
                  </>
                ) : (
                  <p className="text-output-empty">Regular expression is not available for this output.</p>
                )}
              </div>
            ) : (
              <div className="text-output-block">
                <div className="text-output-header">
                  <h3>Context-Free Grammar</h3>
                  <button className="btn-copy" onClick={handleCopyCFG} disabled={contextFreeGrammar.length === 0}>
                    {copiedType === 'cfg' ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedType === 'cfg' ? 'Copied' : 'Copy Grammar'}</span>
                  </button>
                </div>
                {loading ? (
                  <div className="text-loading">Loading grammar rules…</div>
                ) : contextFreeGrammar.length > 0 ? (
                  <ol className="cfg-list">
                    {contextFreeGrammar.map((rule, index) => (
                      <li key={index}>
                        <code>{rule}</code>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-output-empty">Context-free grammar is not available for this output.</p>
                )}
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
