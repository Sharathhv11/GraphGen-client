import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, ExternalLink } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import step1 from '../../assets/gemini/step1.jpeg';
import step2 from '../../assets/gemini/step2.jpeg';
import step3 from '../../assets/gemini/step3.jpeg';
import './Demo.css';

export default function Demo() {
  const navigate = useNavigate();
  useTitle('API Guide');

  return (
    <div className="demo-page">
      <div className="demo-container">
        <header className="demo-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back to Generator</span>
          </button>
          <h1>How to obtain your Gemini API Key</h1>
          <p className="subtitle">Follow these simple steps to get started with GraphGen.</p>
        </header>

        <section className="privacy-assurance">
          <div className="assurance-card">
            <ShieldCheck size={32} className="icon-shield" />
            <div className="assurance-text">
              <h3>We respect your privacy</h3>
              <p>Your API key is <strong>never stored</strong> on our servers. It is only used to authenticate requests directly from your browser to Google's Gemini API.</p>
            </div>
          </div>
        </section>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Visit Google AI Studio</h3>
              <p>Go to the official Google AI Studio website to manage your API keys.</p>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-external"
              >
                Access Google AI Studio <ExternalLink size={16} />
              </a>
              <div className="step-image-placeholder">
                <img 
                  src={step1} 
                  alt="AI Studio Interface" 
                />
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Create API Key</h3>
              <p>Click on the "Create API key in new project" button. If you already have a project, you can select it from the list.</p>
              <div className="step-image-placeholder">
                 <img 
                  src={step2} 
                  alt="Create Key Button" 
                />
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Copy and Paste</h3>
              <p>Once generated, copy the key and paste it into the "Gemini API Key" field on our DFA generator page.</p>
              <div className="step-image-placeholder">
                 <img 
                  src={step3} 
                  alt="Copy Paste Interface" 
                />
              </div>
            </div>
          </div>
        </div>

        <footer className="demo-footer">
          <p>Need more help? Check out the <a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer">official documentation</a>.</p>
        </footer>
      </div>
    </div>
  );
}
