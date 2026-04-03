import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, Recycle, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AuthShell from '../../components/auth/AuthShell';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import './LoginPage.css';

export default function LoginPage() {
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address';

    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 6) nextErrors.password = 'Minimum 6 characters';

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const { data } = await api.post('/auth/login', form);
      saveAuth(data);
      navigate('/');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Circular access"
      title="Sign in beautifully."
      subtitle="Continue your buying journey, reopen saved finds, and step back into a marketplace that treats reuse like premium commerce."
      asideTitle="Every product here carries context."
      asideText="LoopKart is built to make second-hand feel trusted, detailed, and worth exploring. Sign in to unlock the full buyer and seller experience."
      highlights={[
        { icon: '♻', title: 'Impact-first discovery', copy: 'See why each product matters before you even open the page.' },
        { icon: '✦', title: 'Premium resale UX', copy: 'Smooth browsing, richer product stories, and better trust cues by default.' },
        { icon: '⛨', title: 'Seller transparency', copy: 'Condition, usage, and health score show up early so decisions feel easy.' },
      ]}
      stats={[
        { value: '48', label: 'active city clusters' },
        { value: '11.4M', label: 'product views this year' },
        { value: '2M tons', label: 'waste diverted in 2025' },
      ]}
      footer={
        <p className="auth-shell__footer">
          New to LoopKart? <Link to="/register">Create an account</Link>
        </p>
      }
    >
      <div className="auth-panel__header">
        <p className="auth-panel__kicker">Welcome back</p>
        <h2>Sign in to buy or sell with confidence.</h2>
      </div>

      {serverError ? <div className="auth-panel__alert">{serverError}</div> : null}

      <form className="auth-panel__form" onSubmit={handleSubmit}>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => {
            setForm((current) => ({ ...current, email: event.target.value }));
            setErrors((current) => ({ ...current, email: '' }));
            setServerError('');
          }}
          icon={<Mail size={18} />}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => {
            setForm((current) => ({ ...current, password: event.target.value }));
            setErrors((current) => ({ ...current, password: '' }));
            setServerError('');
          }}
          icon={<LockKeyhole size={18} />}
          error={errors.password}
          required
        />

        <div className="auth-panel__meta">
          <div className="auth-panel__meta-item">
            <ShieldCheck size={14} />
            <span>Tokens refresh automatically</span>
          </div>
          <Link to="/forgot-password" className="auth-panel__link">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Sign in
          <ArrowRight size={16} />
        </Button>
      </form>

      <div className="auth-panel__divider">
        <span>or continue with</span>
      </div>

      <GoogleAuthButton
        onAuthSuccess={(data) => {
          saveAuth(data);
          navigate('/');
        }}
        onAuthError={setServerError}
      />

      <div className="auth-panel__footnotes">
        <div className="auth-panel__footnote">
          <Recycle size={14} />
          <span>Built for trusted recommerce</span>
        </div>
        <div className="auth-panel__footnote">
          <Sparkles size={14} />
          <span>Premium resale, not a classifieds feed</span>
        </div>
      </div>
    </AuthShell>
  );
}
