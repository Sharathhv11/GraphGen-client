import { Github, PlayCircle, Code2, Cpu, ArrowRight, Mail, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import useTitle from '../../utils/useTitle';
import './Home.css';
import logolight from '../../assets/graphgen-light.png';
import logodark from '../../assets/graphgen-dark.png';
import { Link } from 'react-router-dom';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  useTitle('AI-Powered Diagram Generator');

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      <div className="home-content-wrapper">
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-left">
            <img 
              src={theme === 'dark' ? logolight : logodark} 
              alt="GraphGen Logo" 
              className="nav-logo" 
            />
          </div>

          <div className="nav-center">
            <div className="nav-links">
              <button className="nav-link" onClick={() => scrollToSection('about')} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>About</button>
              <button className="nav-link" onClick={() => scrollToSection('features')} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>Features</button>
              <button className="nav-link" onClick={() => scrollToSection('contact')} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}>Contact</button>
            </div>
          </div>
          
          <div className="nav-right">
            <a 
              href="https://github.com/Sharathhv11/MINI-Project-Back-end.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
              title="View Source on GitHub"
            >
              <Github size={20} />
            </a>

            <button 
              className="theme-toggle" 
              onClick={toggleTheme} 
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Log in</Link>
              <Link to="/signup" className="btn-signup">Sign up</Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {/* Hero Section */}
          <section className="hero-section">
            <h1 className="hero-title">Generate diagrams from plain text in seconds.</h1>
            <p className="hero-subtitle">
              GraphGen uses advanced LLM reasoning to instantly translate your descriptions into precise DFA layouts, Flowcharts, and structural diagrams with zero manual dragging.
            </p>
            <div className="hero-cta">
              <Link to="/login" className="btn-primary">
                Try it for free <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-secondary" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
                See how it works
              </a>
              
              <div className="hero-mobile-actions">
                <a 
                  href="https://github.com/Sharathhv11/MINI-Project-Back-end.git" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="github-link"
                  title="View Source on GitHub"
                >
                  <Github size={20} />
                </a>

                <button 
                  className="theme-toggle" 
                  onClick={toggleTheme} 
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="content-section">
            <h2 className="section-title">About GraphGen</h2>
            <div className="about-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <PlayCircle />
                </div>
                <h3 className="feature-title">Two-Stage Pipeline</h3>
                <p className="feature-desc">
                  We use Gemma-3-27b for deep reasoning of DFA rules, then seamlessly pipeline the logic into Gemini to output native Viz.js DOT code.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Code2 />
                </div>
                <h3 className="feature-title">Code-Driven Generation</h3>
                <p className="feature-desc">
                  Say goodbye to WYSIWYG editors. Describe the problem (e.g., "strings over {`{a,b}`} ending with abb") and get mathematically sound, perfectly spaced directed graphs.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Cpu />
                </div>
                <h3 className="feature-title">React Flow & D3</h3>
                <p className="feature-desc">
                  Built on modern rendering engines to guarantee smooth zoom/pan interactions, exact node positioning, and orthogonal edge routing.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="content-section">
            <h2 className="section-title">Get in touch</h2>
            <div className="contact-wrapper">
              <p style={{ color: 'var(--text-secondary)' }}>
                Have a question or want to contribute to the project? Reach out to us.
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  <Mail />
                  <span>hello@graphgen.com</span>
                </div>
                <div className="contact-item" style={{ marginTop: '0.5rem' }}>
                  <Github />
                  <a href="https://github.com/Sharathhv11/MINI-Project-Back-end.git" style={{textDecoration: 'underline'}}>GitHub Repository</a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="footer-top">
            <div className="footer-brand">
              <img 
                src={theme === 'dark' ? logolight : logodark} 
                alt="GraphGen Logo" 
                className="footer-logo" 
              />
              <p className="footer-desc">
                Intelligent workspace for generating professional diagrams and visualizations using natural language.
              </p>
              <div className="footer-socials">
                <a href="https://github.com/Sharathhv11/MINI-Project-Back-end.git" target="_blank" rel="noopener noreferrer"><Github size={18} /></a>
                <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>
                <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
              </div>
            </div>

            <div className="footer-links-group">
              <div className="footer-col">
                <h4>Product</h4>
                <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
                <Link to="/login">Try GraphGen</Link>
                <a href="#pricing">Pricing</a>
              </div>
              <div className="footer-col">
                <h4>Resources</h4>
                <a href="#docs">Documentation</a>
                <a href="#api">API Reference</a>
                <a href="#blog">Blog</a>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About Us</a>
                <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }}>Contact</a>
                <a href="#privacy">Privacy Policy</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} GraphGen. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#status">Status</a>
              <a href="#security">Security</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
