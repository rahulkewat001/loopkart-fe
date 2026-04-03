import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AuthShell from '../../components/auth/AuthShell';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import './LoginPage.css';

export default function RegisterPage() {
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Full name is required';
    else if (form.name.trim().length < 2) nextErrors.name = 'Use at least 2 characters';

    if (!form.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address';

    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 6) nextErrors.password = 'Minimum 6 characters';

    if (!form.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match';

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
      const { data } = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      saveAuth(data);
      navigate('/');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Account creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setServerError('');
  };

  return (
    <AuthShell
      eyebrow="Seller and buyer onboarding"
      title="Create your LoopKart identity."
      subtitle="Start buying beautiful second-hand finds or open your own high-trust resale storefront in minutes."
      asideTitle="Built for serious resale from day one."
      asideText="The new LoopKart experience balances aspiration with transparency so sellers look credible and buyers feel confident at first glance."
      highlights={[
        { icon: '✦', title: 'Premium profile setup', copy: 'Your account becomes the foundation for trust, wishlist memory, and seller reputation.' },
        { icon: '↺', title: 'Ready for circular commerce', copy: 'One account lets you buy today and list tomorrow without switching platforms.' },
        { icon: '⟡', title: 'Google sign-in ready', copy: 'OAuth support activates automatically once your Google client ID is configured.' },
      ]}
      stats={[
        { value: '301', label: 'top seller orders fulfilled' },
        { value: '4.9', label: 'average seller rating' },
        { value: '16', label: 'dummy products already staged locally' },
      ]}
      footer={
        <p className="auth-shell__footer">
          Already have an account? <Link to="/login">Sign in instead</Link>
        </p>
      }
    >
      <div className="auth-panel__header">
        <p className="auth-panel__kicker">Create account</p>
        <h2>Join the premium resale loop.</h2>
      </div>

      {serverError ? <div className="auth-panel__alert">{serverError}</div> : null}

      <form className="auth-panel__form" onSubmit={handleSubmit}>
        <Input
          label="Full name"
          name="name"
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
          icon={<UserRound size={18} />}
          error={errors.name}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          icon={<Mail size={18} />}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
          icon={<LockKeyhole size={18} />}
          error={errors.password}
          required
        />

        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat the password"
          value={form.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          icon={<LockKeyhole size={18} />}
          error={errors.confirmPassword}
          required
        />

        <div className="auth-panel__meta">
          <div className="auth-panel__meta-item">
            <ShieldCheck size={14} />
            <span>Email signup is live now. OTP confirmation can be layered in when your mail credentials are ready.</span>
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create account
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
          <Sparkles size={14} />
          <span>One identity for buying and selling</span>
        </div>
      </div>
    </AuthShell>
  );
}
