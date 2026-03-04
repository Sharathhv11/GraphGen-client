import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import useTitle from '../../utils/useTitle';
import logolight from '../../assets/graphgen-light.png';
import logodark from '../../assets/graphgen-dark.png';
import api from '../../utils/api';
import './Signup.css';

export default function Signup() {
  const { theme } = useTheme();
  useTitle('Create Account');
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/auth/sign-up', {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      setSuccess(res.data.message || 'Verification email sent! Please check your inbox.');
      
      // Redirect to login after 3 seconds so user can read the message
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <img src={theme === 'dark' ? logolight : logodark} alt="GraphGen Logo" className="auth-logo" />
            <h1>Create account</h1>
            <p>Get started with your free account</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle />
              <span>{success}</span>
            </div>
          )}

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <div className="input-wrapper">
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
                <User />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <div className="input-wrapper">
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                <Mail />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="input-wrapper">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <Lock />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <span className="password-requirements">Must be at least 8 characters</span>
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="signup-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
