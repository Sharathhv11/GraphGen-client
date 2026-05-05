import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Shield, ChevronLeft } from 'lucide-react';
import useTitle from '../../utils/useTitle';
import './Profile.css';

export default function Profile() {
  useTitle('Profile');
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'User', email: 'Unknown Email' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName') || 'User';
    
    let email = 'Unknown Email';
    let username = name;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email) email = payload.email;
        if (payload.username) username = payload.username;
      } catch (e) {
        console.error('Failed to parse token for user info');
      }
    }
    
    setUser({ name: username, email });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate('/home')}>
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <h2>My Profile</h2>
        </div>

        <div className="profile-card">
          <div className="profile-avatar-section">
            <img 
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`} 
              alt={`${user.name}'s Avatar`} 
              className="profile-large-avatar"
            />
            <div className="profile-name-role">
              <h3>{user.name}</h3>
              <span className="badge">Pro Member</span>
            </div>
          </div>

          <div className="profile-details-section">
            <div className="detail-group">
              <div className="detail-icon"><User size={18} /></div>
              <div className="detail-content">
                <label>Username</label>
                <p>{user.name}</p>
              </div>
            </div>

            <div className="detail-group">
              <div className="detail-icon"><Mail size={18} /></div>
              <div className="detail-content">
                <label>Email Address</label>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="detail-group">
              <div className="detail-icon"><Shield size={18} /></div>
              <div className="detail-content">
                <label>Account Status</label>
                <p className="status-active">Active</p>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-logout-large" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
