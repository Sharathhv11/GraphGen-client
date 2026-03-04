import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import useTitle from '../../utils/useTitle';
import logolight from '../../assets/graphgen-light.png';
import logodark from '../../assets/graphgen-dark.png';
import api from '../../utils/api';
import './Login.css';

export default function Login() {
  const { theme } = useTheme();
  useTitle('Login');
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Using the central api instance which handles VITE_API_URL and interceptors
      const res = await api.post('/api/auth/login', {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userName', res.data.user?.name || form.email.split('@')[0]);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src={theme === 'dark' ? logolight : logodark} alt="GraphGen Logo" className="auth-logo" />
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <div className="input-wrapper">
                <input
                  id="login-email"
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
              <label htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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
            </div>

            <div className="form-options">
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
