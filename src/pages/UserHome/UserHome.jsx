import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Github, SquareMenu, ChevronRight, ChevronDown, Sun, 
  Moon, LogOut, History, Home as HomeIcon, Key, User 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import useTitle from '../../utils/useTitle';
import logolight from '../../assets/graphgen-light.png';
import logodark from '../../assets/graphgen-dark.png';
import './UserHome.css';
import { useState, useEffect, useRef } from 'react';

export default function UserHome() {
  const { theme, toggleTheme } = useTheme();
  useTitle('Dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    
    if (!name && !token) {
      navigate('/login');
    } else {
      setUserName(name || 'User');
    }
  }, [navigate]);

  // Handle mobile responsiveness for sidebar navigation
  useEffect(() => {
    const handleAutoClose = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      }
    };
    handleAutoClose();
  }, [location.pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleToc = () => setIsTocOpen(!isTocOpen);

  // Breadcrumbs Logic
  const renderBreadcrumbs = () => {
    const path = location.pathname;
    const parts = path.split('/').filter(p => p !== '');
    
    // Always start with Home
    const crumbs = [{ label: 'Home', path: '/home', icon: HomeIcon }];

    const lastPart = parts[parts.length - 1];
    
    // Check if nested in TOC (DFA, NFA)
    const tocItems = ['dfa', 'nfa'];
    if (tocItems.includes(lastPart)) {
      crumbs.push({ label: 'TOC', path: null });
    }

    const labels = {
      'dfa': 'DFA',
      'nfa': 'NFA',
      'er-diagram': 'ER Diagram',
      'flowchart': 'Flowchart',
      'data-structure': 'Data Structure',
      'history': 'History',
      'api-keys': 'API Keys'
    };

    if (lastPart && lastPart !== 'home') {
      crumbs.push({ 
        label: labels[lastPart] || lastPart.charAt(0).toUpperCase() + lastPart.slice(1), 
        path: path 
      });
    }

    return (
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        {crumbs.map((crumb, idx) => (
          <div key={idx} className="breadcrumb-item">
            {idx > 0 && <ChevronRight size={12} className="breadcrumb-separator" />}
            {crumb.path ? (
              <Link to={crumb.path} className={`breadcrumb-link ${idx === crumbs.length - 1 ? 'active' : ''}`}>
                {crumb.icon && <crumb.icon size={14} className="crumb-icon" />}
                <span>{crumb.label}</span>
              </Link>
            ) : (
              <span className="breadcrumb-text">{crumb.label}</span>
            )}
          </div>
        ))}
      </nav>
    );
  };

  return (
    <div className="user-home-page">
      <nav className="user-navbar">
        <div className="nav-left">
          <button className="sidebar-toggle" onClick={toggleSidebar} title="Toggle Sidebar">
            <SquareMenu size={28} />
          </button>
          <img 
            src={theme === 'dark' ? logolight : logodark} 
            alt="GraphGen Logo" 
            className="nav-logo" 
          />
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
          
          {/* User Profile with Dropdown */}
          <div className="user-profile" ref={profileRef}>
            <div 
              className="user-profile-trigger"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img 
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(userName)}`} 
                alt={`${userName}'s Avatar`} 
                className="user-avatar" 
              />
              <span className="user-greeting">Hi, {userName.split(' ')[0]}</span>
              <ChevronDown size={14} className={`profile-chevron ${isProfileOpen ? 'rotated' : ''}`} />
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <img 
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(userName)}`} 
                    alt={`${userName}'s Avatar`} 
                    className="dropdown-avatar" 
                  />
                  <div>
                    <span className="dropdown-name">{userName}</span>
                    <span className="dropdown-role">Member</span>
                  </div>
                </div>
                <div className="profile-dropdown-divider" />
                <button 
                  className="profile-dropdown-item"
                  onClick={() => { setIsProfileOpen(false); /* future: navigate to profile */ }}
                >
                  <User size={16} />
                  <span>View Profile</span>
                </button>
                <button 
                  className="profile-dropdown-item"
                  onClick={() => { setIsProfileOpen(false); navigate('/home/api-keys'); }}
                >
                  <Key size={16} />
                  <span>API Keys</span>
                </button>
                <div className="profile-dropdown-divider" />
                <button 
                  className="profile-dropdown-item profile-dropdown-logout"
                  onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="user-layout">
        {/* Sidebar */}
        <aside className={`user-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-content">
            <div className="menu-group">
             
 <button 
                className={`menu-item ${location.pathname.includes('/home/history') ? 'active-submenu' : ''}`}
                onClick={() => navigate('/home/history')}
              >
                <div className="menu-item-content">
                  <History size={18} />
                  <span className="menu-text">History</span>
                </div>
              </button>
              <button 
                className={`menu-item accordion-header ${isTocOpen ? 'active' : ''}`}
                onClick={toggleToc}
              >
                <div className="menu-item-content">
                  <span className="menu-text">TOC</span>
                </div>
                {isTocOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              
              {/* Expandable Sub-menu */}
              <div className={`submenu ${isTocOpen ? 'expanded' : 'collapsed'}`}>
                
                <button 
                  className="submenu-item"
                  onClick={() => navigate('/home/dfa')}
                >
                  <span className="submenu-text">DFA</span>
                </button>
                <button 
                  className="submenu-item"
                  onClick={() => navigate('/home/nfa')}
                >
                  <span className="submenu-text">NFA</span>
                </button>
              </div>
              
              <button 
                className={`menu-item accordion-header ${location.pathname.includes('/home/flowchart') ? 'active-submenu' : ''}`}
                onClick={() => navigate('/home/flowchart')}
              >
                <div className="menu-item-content">
                  <span className="menu-text">Flowchart</span>
                </div>
              </button>
              
              <button 
                className="menu-item accordion-header"
                onClick={() => navigate('/home/er-diagram')}
              >
                <div className="menu-item-content">
                  <span className="menu-text">ER Diagram</span>
                </div>
              </button>
              
              <button 
                className={`menu-item accordion-header ${location.pathname.includes('/home/data-structure') ? 'active-submenu' : ''}`}
                onClick={() => navigate('/home/data-structure')}
              >
                <div className="menu-item-content">
                  <span className="menu-text">Data Structure</span>
                </div>
              </button>
              
            </div>
          </div>
          <div className="sidebar-footer">
            <button className="btn-sidebar-logout" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`user-main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="main-content-header">
            {renderBreadcrumbs()}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
