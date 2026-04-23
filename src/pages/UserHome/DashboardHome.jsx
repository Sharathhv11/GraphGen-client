import { 
  Workflow, Database, Network, CircleDot, GitFork, 
  Lightbulb, ArrowRight, BookOpen, Info, HelpCircle, 
  Sparkles, Target, Compass, Image as ImageIcon
} from 'lucide-react';
import useTitle from '../../utils/useTitle';
import './DashboardHome.css';

// Import learning examples
import dfaImg from '../../assets/learning-examples/dfa-example.png';

const DETAILED_GUIDES = [
  {
    id: 'dfa-guide',
    topic: 'Deterministic Finite Automata (DFA)',
    icon: CircleDot,
    color: '#a78bfa',
    whatIs: "A Deterministic Finite Automaton (DFA) is a theoretical machine used in computer science to recognize patterns within input strings. It is 'Deterministic' because for every state and input symbol, there is exactly one unique transition to a next state. It is a mathematical model for systems with a finite number of states.",
    howToSolve: [
      "Identify the Alphabet (Σ): Know what characters are allowed (e.g., {0, 1}).",
      "Draft the States: Determine the logic paths needed to reach an 'Accept' state.",
      "Check Transitions: Ensure every state handles every character in your alphabet once.",
      "Find the Final States: Mark states that signify a 'Success' or 'Accepted' string."
    ],
    generationGuide: `To generate a DFA, describe the logic of the language you want to accept. The AI will automatically construct the states and transition table for you. For example, tell the AI: 'Construct a DFA for alphabet {a, b} that accepts strings containing the substring "abb".'`,
    example: {
      question: "dfa to accept the string ends with aaa",
      image: dfaImg
    }
  }
];

export default function DashboardHome() {
  useTitle('Dashboard Home');

  return (
    <div className="dash-home">
      {/* Hero Section */}
      <header className="dash-hero">
        <h1>Welcome to GraphGen</h1>
        <p>
          Your intelligent workspace for generating professional diagrams and visualizations 
          using natural language. Choose a tool from the sidebar to get started.
        </p>
      </header>

      {/* Detailed Learning Center (TOC) */}
      <div className="dash-learning-center">
        <div className="dash-section-title">
          <BookOpen size={24} color="#3b82f6" />
          <h2>The Learning Center</h2>
        </div>

        <div className="dash-guides-stack">
          {DETAILED_GUIDES.map((guide) => (
            <div key={guide.id} className="detail-guide-card" style={{ '--guide-color': guide.color }}>
              <div className="guide-sidebar">
                <div className="guide-sidebar-item active">
                  
                  <span>{guide.topic}</span>
                </div>
                <div className="guide-sidebar-item disabled">
                  
                  <span>ER Diagram (Coming Soon)</span>
                </div>
                <div className="guide-sidebar-item disabled">
                  
                  <span>Data Structure (Coming Soon)</span>
                </div>
              </div>

              <div className="guide-main-content">
                <div className="guide-content-section">
                  <div className="guide-section-head">
                    <Info size={18} />
                    <h3>What is {guide.topic}?</h3>
                  </div>
                  <p>{guide.whatIs}</p>
                </div>

                <div className="guide-content-section">
                  <div className="guide-section-head">
                    <Target size={18} />
                    <h3>How to solve it?</h3>
                  </div>
                  <ul className="guide-steps">
                    {guide.howToSolve.map((step, idx) => (
                      <li key={idx}>
                        <ArrowRight size={14} className="step-arrow" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Example Section */}
                {guide.example && (
                  <div className="guide-content-section">
                    <div className="guide-section-head">
                      <HelpCircle size={18} />
                      <h3>Ex: {guide.example.question}</h3>
                    </div>
                    <div className="guide-example-container">
                      <div className="guide-example-image-wrapper">
                        <img 
                          src={guide.example.image} 
                          alt={`Example for ${guide.topic}`} 
                          className="guide-example-img" 
                        />
                        <div className="image-overlay">
                          <ImageIcon size={20} />
                          <span>Visual Logic Diagram</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="guide-content-section">
                  <div className="guide-section-head">
                    <Compass size={18} />
                    <h3>Guide: How to Generate via GraphGen</h3>
                  </div>
                  <div className="guide-gen-box">
                    <Sparkles size={16} className="sparkle-icon" />
                    <p>{guide.generationGuide}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
