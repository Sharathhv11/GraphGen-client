import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  Download,
  Loader2,
  AlertCircle,
  Database,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import useHistory from '../../utils/useHistory';
import useApiKeyStatus from '../../utils/useApiKeyStatus';
import { Graphviz } from 'graphviz-react';
import geminiIcon from '../../assets/gemini-icon.png';
import './ERDiagram.css';

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash' },
  { id: 'gemma-4-26b-a4b-it',    label: 'Gemma 4 26B' },
  { id: 'gemma-4-31b-it',        label: 'Gemma 4 31B' },
  { id: 'gemini-flash-latest',   label: 'Gemini Flash Latest' },
];

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
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-lite');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vizCode, setVizCode] = useState('');
  const [sqlOutput, setSqlOutput] = useState([]);
  const [showSqlPanel, setShowSqlPanel] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const { saveHistory } = useHistory('er-diagram');
  const { hasApiKey } = useApiKeyStatus();

  const getSqlStatements = (responsePayload) => {
    const rawSql =
      responsePayload?.sql ??
      responsePayload?.sqlStatements ??
      responsePayload?.createTableStatements;

    if (Array.isArray(rawSql)) {
      return rawSql.filter((statement) => typeof statement === 'string' && statement.trim());
    }

    if (typeof rawSql === 'string' && rawSql.trim()) {
      return [rawSql.trim()];
    }

    return [];
  };

  /* ── Restore from History page navigation ── */
  useEffect(() => {
    if (location.state?.fromHistory) {
      if (location.state.outputData?.vizCode) setVizCode(location.state.outputData.vizCode);
      setSqlOutput(getSqlStatements(location.state.outputData));
      if (location.state.inputData?.prompt) setDescription(location.state.inputData.prompt);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please provide a system description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/diagram/toc/er', {
        query: description,
        model: selectedModel,
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

        const sqlStatements = getSqlStatements(response.data.data);
        setVizCode(rawCode);
        setSqlOutput(sqlStatements);
        setShowSqlPanel(false);
        setCopiedSql(false);

        // Save to history
        saveHistory({ prompt: description }, { vizCode: rawCode, sql: sqlStatements });
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

  const sqlContent = sqlOutput.join('\n\n');

  const handleCopySQL = async () => {
    if (!sqlContent) return;
    try {
      await navigator.clipboard.writeText(sqlContent);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 1500);
    } catch (err) {
      console.error('Failed to copy SQL:', err);
      setError('Failed to copy SQL to clipboard.');
    }
  };

  const handleDownloadSQL = () => {
    if (!sqlContent) return;
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'er-diagram.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleDownloadPNG = () => {
    const svgElement = document.querySelector('.er-viz-container svg');
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
      link.download = 'er-diagram.png';
      link.href = pngUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = url;
  };

  return (
    <div className="er-page">
      <div className="er-container">
        {/* Left Pane - Inputs */}
        <div className="er-input-pane">

          {/* No API Key Banner */}
          {!hasApiKey && (
            <div className="no-key-banner" onClick={() => navigate('/home')}>
              <Key size={14} />
              <span>No API key configured. <strong>Go to Dashboard</strong> to add your Gemini key.</span>
            </div>
          )}
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
            <div className="er-output-actions">
              {sqlOutput.length > 0 && (
                <button
                  className="er-btn-download"
                  onClick={() => setShowSqlPanel((prev) => !prev)}
                  title={showSqlPanel ? 'Hide SQL' : 'View SQL'}
                >
                  {showSqlPanel ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span>{showSqlPanel ? 'Hide SQL' : 'View SQL'}</span>
                </button>
              )}
              {vizCode && (
                <button className="er-btn-download" onClick={handleDownloadPNG} title="Download PNG">
                  <Download size={18} />
                  <span>Export PNG</span>
                </button>
              )}
            </div>
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
          {showSqlPanel && sqlOutput.length > 0 && (
            <div className="er-sql-panel">
              <div className="er-sql-panel-header">
                <h3>Generated SQL</h3>
                <div className="er-sql-actions">
                  <button className="er-btn-download" onClick={handleCopySQL} title="Copy SQL">
                    {copiedSql ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                  <button className="er-btn-download" onClick={handleDownloadSQL} title="Download SQL">
                    <Download size={16} />
                    <span>Download SQL</span>
                  </button>
                </div>
              </div>
              <pre className="er-sql-content">{sqlContent}</pre>
            </div>
          )}
          <div className="powered-by-gemini">
            powered by <img src={geminiIcon} alt="Gemini" /> gemini
          </div>
        </div>
      </div>
    </div>
  );
}
