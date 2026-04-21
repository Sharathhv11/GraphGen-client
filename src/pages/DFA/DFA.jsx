import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Download, Loader2, AlertCircle, Info } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import api from '../../utils/api';
import { Graphviz } from 'graphviz-react';
import './DFA.css';

export default function DFA() {
  useTitle('DFA Generator');
  const [apiKey, setApiKey] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vizCode, setVizCode] = useState('');

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

  const handleDownloadSVG = () => {
    // Graphviz-react renders an SVG inside its container
    const svgElement = document.querySelector('.viz-container svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dfa-diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dfa-page">
      <div className="dfa-container">
        {/* Left Pane - Inputs */}
        <div className="dfa-input-pane">
          <div className="pane-header">
            <h2>DFA Configuration</h2>
            <p>Describe the Deterministic Finite Automaton (DFA) you want to generate.</p>
          </div>

          <div className="input-group">
            <div className="label-with-action">
              <label htmlFor="apiKey">Gemini API Key</label>
              <Link to="/home/demo" className="demo-link">
                <Info size={14} />
                <span>Demo / Guide</span>
              </Link>
            </div>
            <input 
              type="password" 
              id="apiKey" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API Key" 
              className="dfa-input"
            />
          </div>

          <div className="input-group flex-grow">
            <label htmlFor="description">Problem Description</label>
            <textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Design a DFA for strings over {a,b} that end with 'abb'" 
              className="dfa-textarea"
            />
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <button 
            className="btn-generate" 
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={18} />
                Generating Analysis...
              </>
            ) : (
              <>
                <Play size={18} />
                Generate DFA
              </>
            )} 
          </button>
        </div>

        {/* Right Pane - Output */}
        <div className="dfa-output-pane">
          <div className="pane-header output-header">
            <h2>Generated Diagram</h2>
            {vizCode && (
              <button className="btn-download" onClick={handleDownloadSVG} title="Download SVG">
                <Download size={18} />
                <span>Export SVG</span>
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
                <div className="empty-icon-placeholder"></div>
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
