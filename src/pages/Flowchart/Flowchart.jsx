import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Download, Loader2, AlertCircle, Info, Workflow,
  MessageSquare, Code2, ChevronDown,
} from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import { Graphviz } from 'graphviz-react';
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
  { id: 'java',       label: 'Java',       icon: '☕' },
  { id: 'python',     label: 'Python',     icon: '🐍' },
  { id: 'javascript', label: 'JavaScript', icon: '⚡' },
];

export default function Flowchart() {
  useTitle('Flowchart Generator');

  /* ── shared ── */
  const [apiKey, setApiKey]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [vizCode, setVizCode] = useState('');

  /* ── mode: 'prompt' | 'code' ── */
  const [mode, setMode] = useState('prompt');

  /* ── prompt-mode state ── */
  const [description, setDescription] = useState('');

  /* ── code-mode state ── */
  const [language, setLanguage]       = useState('python');
  const [code, setCode]               = useState('');
  const [langDropOpen, setLangDropOpen] = useState(false);

  /* ─────────────────────────────────── */
  const handleGenerate = async () => {
    const query = mode === 'prompt' ? description : code;

    if (!query.trim()) {
      setError(mode === 'prompt'
        ? 'Please describe the process or algorithm.'
        : 'Please paste your code to convert.');
      return;
    }
    if (!apiKey.trim()) {
      setError('Gemini API Key is required.');
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

  const handleDownloadSVG = () => {
    const svgEl = document.querySelector('.fc-viz-container svg');
    if (!svgEl) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'flowchart.svg';
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  };

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

          {/* API Key */}
          <div className="fc-input-group">
            <div className="fc-label-with-action">
              <label htmlFor="fcApiKey">Gemini API Key</label>
              <Link to="/home/demo" className="fc-demo-link">
                <Info size={13} /><span>Guide</span>
              </Link>
            </div>
            <input
              type="password"
              id="fcApiKey"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API Key"
              className="fc-input"
            />
          </div>

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
                <textarea
                  id="fcDescription"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Create a flowchart for a user login process with OTP verification..."
                  className="fc-textarea"
                />
              </div>

              {/* Example chips */}
              <div className="fc-examples">
                <span className="fc-examples-label">Try an example:</span>
                <div className="fc-examples-list">
                  {EXAMPLE_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      className="fc-example-chip"
                      onClick={() => { setDescription(p); setError(null); }}
                      title={p}
                    >
                      {p.length > 52 ? p.slice(0, 52) + '…' : p}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── CODE MODE ── */}
          {mode === 'code' && (
            <>
              {/* Language Selector */}
              <div className="fc-input-group">
                <label>Programming Language</label>
                <div className="fc-lang-dropdown-wrap">
                  <button
                    className="fc-lang-dropdown-btn"
                    onClick={() => setLangDropOpen(o => !o)}
                  >
                    <span>{selectedLang.icon} {selectedLang.label}</span>
                    <ChevronDown size={15} className={`fc-chevron ${langDropOpen ? 'fc-chevron-open' : ''}`} />
                  </button>
                  {langDropOpen && (
                    <div className="fc-lang-dropdown-menu">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.id}
                          className={`fc-lang-option ${language === lang.id ? 'fc-lang-selected' : ''}`}
                          onClick={() => { setLanguage(lang.id); setLangDropOpen(false); }}
                        >
                          <span>{lang.icon}</span>
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Code textarea */}
              <div className="fc-input-group fc-flex-grow">
                <label htmlFor="fcCode">Paste your {selectedLang.label} code</label>
                <textarea
                  id="fcCode"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder={`// Paste your ${selectedLang.label} code here...\n${CODE_EXAMPLES[language]}`}
                  className="fc-textarea fc-code-textarea"
                  spellCheck={false}
                />
              </div>

              {/* Quick-fill code examples */}
              <div className="fc-examples">
                <span className="fc-examples-label">Load an example:</span>
                <div className="fc-examples-list">
                  {Object.entries(CODE_EXAMPLES).map(([lang, snippet]) => (
                    <button
                      key={lang}
                      className="fc-example-chip"
                      onClick={() => {
                        setLanguage(lang);
                        setCode(snippet);
                        setError(null);
                      }}
                    >
                      {lang === 'java' ? '☕ Factorial (Java)' :
                       lang === 'python' ? '🐍 Bubble Sort (Python)' :
                       '⚡ Binary Search (JS)'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="fc-error-message">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          {/* Generate Button */}
          <button className="fc-btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <><Loader2 className="fc-spinner" size={17} />Generating Flowchart...</>
            ) : (
              <><Play size={17} />Generate Flowchart</>
            )}
          </button>
        </div>

        {/* ══ RIGHT PANE ══ */}
        <div className="fc-output-pane">
          <div className="fc-pane-header fc-output-header">
            <h2>Generated Flowchart</h2>
            {vizCode && (
              <button className="fc-btn-download" onClick={handleDownloadSVG}>
                <Download size={16} /><span>Export SVG</span>
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
                    ? 'Describe an algorithm or process on the left and click Generate.'
                    : 'Paste your Java, Python, or JavaScript code and click Generate.'}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
