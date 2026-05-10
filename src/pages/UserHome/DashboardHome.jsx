import { useState } from 'react';
import { 
  Workflow, Database, Network, CircleDot, GitFork, 
  Lightbulb, ArrowRight, BookOpen, Info, HelpCircle, 
  Sparkles, Target, Compass, Image as ImageIcon
} from 'lucide-react';
import useTitle from '../../utils/useTitle';
import ApiKeyManager from './ApiKeyManager';
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
  },
  {
    id: 'nfa-guide',
    topic: 'Nondeterministic Finite Automata (NFA)',
    icon: GitFork,
    color: '#f472b6',
    whatIs: "A Nondeterministic Finite Automaton (NFA) is similar to a DFA but allows for multiple possible transitions from a single state for the same input symbol, including empty (epsilon) transitions. It represents multiple parallel computation paths.",
    howToSolve: [
      "Define the Language: Understand the exact pattern the NFA needs to accept.",
      "Use Epsilon Transitions: Link states without consuming input to simplify the design.",
      "Branch Logic: Allow multiple paths for the same input character where needed.",
      "Identify Accepting States: Ensure at least one valid path reaches an accepting state."
    ],
    generationGuide: "Describe your NFA's language. NFAs are often easier to describe than DFAs because you don't need to specify every transition. Example: 'Draw an NFA that accepts strings starting with 1 and ending with 0 over {0,1}.'"
  },
  {
    id: 'flowchart-guide',
    topic: 'Flowcharts',
    icon: Workflow,
    color: '#3b82f6',
    whatIs: "A Flowchart is a visual representation of a process, algorithm, or workflow. It uses standard shapes (like rectangles for steps, diamonds for decisions, and ovals for start/end) connected by arrows to show the direction of flow.",
    howToSolve: [
      "Identify Start and End points.",
      "Break down the process into sequential steps.",
      "Identify decision points (if/else conditions) and their branching paths.",
      "Connect all elements with directional arrows."
    ],
    generationGuide: "You can either describe a process in natural language (e.g., 'If it rains, take an umbrella, else wear sunglasses') or paste a snippet of code. GraphGen will parse the logic and map it into a standardized flowchart."
  },
  {
    id: 'er-guide',
    topic: 'Entity-Relationship (ER) Diagrams',
    icon: Database,
    color: '#10b981',
    whatIs: "An ER Diagram illustrates the logical structure of databases. It shows entities (like tables), their attributes (columns), and the relationships between them (one-to-one, one-to-many, etc.).",
    howToSolve: [
      "Identify the main Entities (e.g., Users, Orders, Products).",
      "List the Attributes for each entity (e.g., ID, Name, Date).",
      "Determine Primary Keys (unique identifiers).",
      "Map the Relationships and define their cardinality."
    ],
    generationGuide: "Describe your database schema. Example: 'A system where a User has many Orders, and an Order contains many Products.' GraphGen will automatically generate the tables, attributes, and relationship links."
  },
  {
    id: 'ds-guide',
    topic: 'Data Structures',
    icon: Network,
    color: '#f59e0b',
    whatIs: "Data Structure visualizations represent how data is organized and stored in memory. This includes Trees (Binary, AVL, Red-Black), Graphs, Linked Lists, and Hash Tables.",
    howToSolve: [
      "Determine the structure type (e.g., Binary Search Tree).",
      "Identify the nodes and their values.",
      "Establish the pointers/edges connecting the nodes.",
      "Highlight specific states if demonstrating an algorithm."
    ],
    generationGuide: "Describe the specific data structure state you want to visualize. Example: 'Draw a Binary Search Tree with the root node 50, left child 30, and right child 70.' The tool will output the exact node-link representation."
  },
  {
    id: 'uml-guide',
    topic: 'UML Diagrams',
    icon: Lightbulb,
    color: '#6366f1',
    whatIs: "Unified Modeling Language (UML) diagrams are standard visual models used in software engineering to describe the architecture, design, and implementation of complex software systems.",
    howToSolve: [
      "Determine the diagram type (Class, Sequence, Use Case, etc.).",
      "Identify actors, classes, or objects involved.",
      "Map out their interactions, inheritance, or dependencies.",
      "Follow standard UML notation for arrows and shapes."
    ],
    generationGuide: "Specify the type of UML diagram and the system architecture. Example: 'Create a Class Diagram for a library system with Book, Member, and Librarian classes, showing inheritance and associations.'"
  }
];

export default function DashboardHome() {
  useTitle('Dashboard Home');
  const [activeGuideId, setActiveGuideId] = useState(DETAILED_GUIDES[0].id);

  const activeGuide = DETAILED_GUIDES.find(g => g.id === activeGuideId) || DETAILED_GUIDES[0];

  return (
    <div className="dash-home">
      {/* API Key Configuration */}
      <ApiKeyManager />

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
          <div className="detail-guide-card" style={{ '--guide-color': activeGuide.color }}>
            <div className="guide-sidebar">
              {DETAILED_GUIDES.map((guide) => (
                <div 
                  key={guide.id}
                  className={`guide-sidebar-item ${activeGuideId === guide.id ? 'active' : ''}`}
                  onClick={() => setActiveGuideId(guide.id)}
                >
                  <guide.icon size={18} />
                  <span>{guide.topic.split(' (')[0]}</span>
                </div>
              ))}
            </div>

            <div className="guide-main-content">
              <div className="guide-content-section">
                <div className="guide-section-head">
                  <Info size={18} />
                  <h3>What is {activeGuide.topic}?</h3>
                </div>
                <p>{activeGuide.whatIs}</p>
              </div>

              <div className="guide-content-section">
                <div className="guide-section-head">
                  <Target size={18} />
                  <h3>How to solve it?</h3>
                </div>
                <ul className="guide-steps">
                  {activeGuide.howToSolve.map((step, idx) => (
                    <li key={idx}>
                      <ArrowRight size={14} className="step-arrow" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example Section */}
              {activeGuide.example && (
                <div className="guide-content-section">
                  <div className="guide-section-head">
                    <HelpCircle size={18} />
                    <h3>Ex: {activeGuide.example.question}</h3>
                  </div>
                  <div className="guide-example-container">
                    <div className="guide-example-image-wrapper">
                      <img 
                        src={activeGuide.example.image} 
                        alt={`Example for ${activeGuide.topic}`} 
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
                  <p>{activeGuide.generationGuide}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
