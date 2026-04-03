import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './LoginPage.css';

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function RegisterPage() {
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      saveAuth(data);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { data } = await api.post('/auth/google', {
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.sub,
        avatar: decoded.picture
      });
      saveAuth(data);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Google signup failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setServerError('Google signup failed. Please try again.');
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fadeUp">

        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand__logo">🛒</span>
          <span className="auth-brand__name">LoopKart</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join LoopKart and start shopping</p>

        {/* Server error */}
        {serverError && (
          <div className="auth-alert animate-shake">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          <Input
            label="Full Name"
            name="name"
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            icon={<UserIcon />}
            autoComplete="name"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            icon={<EmailIcon />}
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            icon={<LockIcon />}
            autoComplete="new-password"
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={<LockIcon />}
            autoComplete="new-password"
            required
          />

          <Button type="submit" fullWidth loading={loading} size="lg">
            Create Account
          </Button>
        </form>

        {/* Social Login Divider */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Social Login Buttons */}
        <div className="auth-social">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="outline"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
