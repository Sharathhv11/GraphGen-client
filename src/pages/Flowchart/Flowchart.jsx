import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUp, Download, Loader2, AlertCircle, Workflow,
  MessageSquare, Code2, Key,
} from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import useHistory from '../../utils/useHistory';
import useApiKeys from '../../utils/useApiKeys';
import { Graphviz } from 'graphviz-react';
import Editor from '@monaco-editor/react';
import './Flowchart.css';

/* ── Prompt-mode examples ─────────────────────────────────── */
const EXAMPLE_PROMPTS = [
  'Create a flowchart for a user login process with email verification.',
  'Generate a flowchart for an ATM cash withdrawal machine.',
  'Show the algorithm for finding the largest number in an array.',
  'Draw a flowchart for a library book checkout with late fee checking.',
];

/* ── Code-mode examples ───────────────────────────────────── */
const CODE_EXAMPLES = {
  java: `public int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
  python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
  javascript: `function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
};

const LANGUAGES = [
  { id: 'java',       label: 'Java' },
  { id: 'python',     label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
];

export default function Flowchart() {
  useTitle('Flowchart Generator');
  const location = useLocation();
  const navigate = useNavigate();

  /* ── shared ── */
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [vizCode, setVizCode] = useState('');

  /* ── history (save only) ── */
  const { saveHistory } = useHistory('flowchart');
  const { getActiveKey, hasActiveKey } = useApiKeys();

  /* ── mode: 'prompt' | 'code' ── */
  const [mode, setMode] = useState('prompt');

  /* ── prompt-mode state ── */
  const [description, setDescription] = useState('');

  /* ── code-mode state ── */
  const [language, setLanguage]       = useState('python');
  const [code, setCode]               = useState(CODE_EXAMPLES.python);

  /* ─────────────────────────────────── */
  const handleGenerate = async () => {
    const query = mode === 'prompt' ? description : code;

    if (!query.trim()) {
      setError(mode === 'prompt'
        ? 'Please describe the process or algorithm.'
        : 'Please paste your code to convert.');
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
      const payload = { query, apiKey };
      if (mode === 'code') payload.language = language;

      const response = await api.post('/api/diagram/flow-chart', payload);

      if (response.data.status === 'success' && response.data.data.vizCode) {
        let rawCode = response.data.data.vizCode;
        rawCode = rawCode.replace(/```[a-zA-Z]*\n?/gi, '').replace(/```/g, '').trim();
        const graphMatch = rawCode.match(/(?:strict\s+)?(?:di)?graph\s+[^{]*\{[\s\S]*\}/i);
        if (graphMatch) rawCode = graphMatch[0];
        setVizCode(rawCode);

        // Save to history
        const prompt = mode === 'prompt' ? description : code;
        saveHistory({ prompt, mode, language: mode === 'code' ? language : undefined }, { vizCode: rawCode });
      } else {
        setError('Failed to generate diagram. Please try again.');
      }
    } catch (err) {
      console.error('Flowchart error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to connect. Please check your API key and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && mode === 'prompt') {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleDownloadPNG = () => {
    const svgEl = document.querySelector('.fc-viz-container svg');
    if (!svgEl) return;

    const viewBox = svgEl.viewBox.baseVal;
    let width = viewBox.width || svgEl.getBoundingClientRect().width;
    let height = viewBox.height || svgEl.getBoundingClientRect().height;

    const scale = 3;
    width *= scale;
    height *= scale;

    const svgData = new XMLSerializer().serializeToString(svgEl);
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
      link.download = 'flowchart.png';
      link.href = pngUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = url;
  };

  /* ── Restore from History page navigation ── */
  useEffect(() => {
    if (location.state?.fromHistory) {
      if (location.state.outputData?.vizCode) {
        setVizCode(location.state.outputData.vizCode);
      }
      if (location.state.inputData?.prompt) {
        if (location.state.inputData.mode === 'code') {
          setMode('code');
          setCode(location.state.inputData.prompt);
          if (location.state.inputData.language) setLanguage(location.state.inputData.language);
        } else {
          setMode('prompt');
          setDescription(location.state.inputData.prompt);
        }
      }
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const selectedLang = LANGUAGES.find(l => l.id === language);

  return (
    <div className="fc-page">
      <div className="fc-container">

        {/* ══ LEFT PANE ══ */}
        <div className="fc-input-pane">

          {/* Header */}
          <div className="fc-pane-header">
            <div className="fc-title-row">
              <Workflow size={22} className="fc-title-icon" />
              <h2>Flowchart Generator</h2>
            </div>
            <p>Convert code or text descriptions into visual flowcharts instantly.</p>
          </div>

          {!hasActiveKey && (
            <div className="no-key-banner" onClick={() => navigate('/home/api-keys')}>
              <AlertCircle size={16} />
              <span>No active API key — <strong>click to add one</strong></span>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="fc-mode-toggle">
            <button
              className={`fc-mode-btn ${mode === 'prompt' ? 'fc-mode-active' : ''}`}
              onClick={() => setMode('prompt')}
            >
              <MessageSquare size={15} />
              Prompt
            </button>
            <button
              className={`fc-mode-btn ${mode === 'code' ? 'fc-mode-active' : ''}`}
              onClick={() => setMode('code')}
            >
              <Code2 size={15} />
              Code
            </button>
          </div>

          {/* ── PROMPT MODE ── */}
          {mode === 'prompt' && (
            <>
              <div className="fc-input-group fc-flex-grow">
                <label htmlFor="fcDescription">Describe your process or algorithm</label>
                <div className="prompt-input-wrapper">
                  <textarea
                    id="fcDescription"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Create a flowchart for a user login process with OTP verification..."
                    className="fc-textarea"
                  />
                  <button 
                    className="prompt-send-btn" 
                    onClick={handleGenerate}
                    disabled={loading || !description.trim()}
                    title="Generate Flowchart"
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
            </>
          )}

          {/* ── CODE MODE ── */}
          {mode === 'code' && (
            <>
              {/* Code Editor */}
              <div className="fc-input-group fc-flex-grow" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label style={{ marginBottom: 0 }}>Paste your {selectedLang.label} code</label>
                  <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    className="fc-input"
                    style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.id} value={lang.id}>{lang.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', minHeight: '200px', backgroundColor: '#1e1e1e' }}>
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineHeight: 22,
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                      padding: { top: 12, bottom: 12 }
                    }}
                  />
                </div>
              </div>

              {/* Inline send for code mode */}
              <button 
                className="prompt-send-btn prompt-send-btn-standalone" 
                onClick={handleGenerate}
                disabled={loading || !code.trim()}
                title="Generate Flowchart"
              >
                {loading ? (
                  <Loader2 className="spinner" size={18} />
                ) : (
                  <ArrowUp size={18} />
                )}
              </button>
            </>
          )}


          {/* Error */}
          {error && (
            <div className="fc-error-message">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ══ RIGHT PANE ══ */}
        <div className="fc-output-pane">
          <div className="fc-pane-header fc-output-header">
            <h2>Generated Flowchart</h2>
            {vizCode && (
              <button className="fc-btn-download" onClick={handleDownloadPNG}>
                <Download size={16} /><span>Export PNG</span>
              </button>
            )}
          </div>

          <div className="fc-viz-render-area">
            {loading ? (
              <div className="fc-loading-state">
                <Loader2 className="fc-spinner-large" />
                <p>Building your flowchart…</p>
                <span className="fc-loading-subtext">
                  The AI is tracing logic flows, decisions, and loops. This may take a moment.
                </span>
              </div>
            ) : vizCode ? (
              <div className="fc-viz-container">
                <Graphviz
                  dot={vizCode}
                  options={{ zoom: true, height: '100%', width: '100%', fit: true }}
                />
              </div>
            ) : (
              <div className="fc-empty-state">
                <div className="fc-empty-icon">
                  <Workflow size={44} strokeWidth={1.2} />
                </div>
                <p>No flowchart yet</p>
                <span>
                  {mode === 'prompt'
                    ? 'Describe an algorithm or process on the left and press Enter.'
                    : 'Paste your Java, Python, or JavaScript code and click the arrow.'}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
