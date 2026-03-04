import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, ArrowLeft, Send, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './ForgotPassword.css';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/auth`;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(`${API_BASE}/forgot-password`, { email });
      setSuccess(res.data.message || 'Password reset link sent! Check your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <div className="forgot-card">
          <div className="forgot-header">
            <div className="forgot-icon-wrapper">
              <KeyRound />
            </div>
            <h1>Forgot password?</h1>
            <p>No worries. Enter your email and we'll send you a reset link.</p>
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

          <form className="forgot-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="forgot-email">Email address</label>
              <div className="input-wrapper">
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                    if (success) setSuccess('');
                  }}
                  autoComplete="email"
                />
                <Mail />
              </div>
            </div>

            <button type="submit" className="forgot-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="spinner" />
                  Sending...
                </>
              ) : (
                <>
                  <Send />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <div className="forgot-footer">
            <Link to="/login">
              <ArrowLeft />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
