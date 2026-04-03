import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, KeyRound, Mail, RotateCcw, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import OtpInput from '../../components/ui/OtpInput';
import AuthShell from '../../components/auth/AuthShell';
import './LoginPage.css';

export default function ForgotPasswordPage() {
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [passwords, setPasswords] = useState({ next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('A six-digit OTP has been sent to your email.');
      setStep('otp');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpStep = (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      setError('Enter the full 6-digit OTP.');
      return;
    }

    setError('');
    setSuccess('');
    setStep('reset');
  };

  const resetPassword = async (event) => {
    event.preventDefault();

    if (!passwords.next || passwords.next.length < 6) {
      setError('Use at least 6 characters for the new password.');
      return;
    }

    if (passwords.next !== passwords.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword: passwords.next,
      });
      saveAuth(data);
      navigate('/');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Recovery flow"
      title="Regain access without friction."
      subtitle="Reset your password with the same premium, low-stress experience the rest of LoopKart is moving toward."
      asideTitle="Security should still feel elegant."
      asideText="The recovery flow keeps the tone calm, the steps clear, and the result immediate so users can get back into the marketplace fast."
      highlights={[
        { icon: '✉', title: 'OTP-based recovery', copy: 'A six-digit verification flow keeps the reset experience quick and familiar.' },
        { icon: '⛨', title: 'Credential safety', copy: 'New passwords are written through the same protected auth stack used by sign-in.' },
      ]}
      stats={[
        { value: '15 min', label: 'token access window' },
        { value: '7 days', label: 'refresh token life' },
      ]}
      footer={
        <p className="auth-shell__footer">
          Remembered it? <Link to="/?auth=login">Back to sign in</Link>
        </p>
      }
    >
      <div className="auth-panel__header">
        <p className="auth-panel__kicker">Forgot password</p>
        <h2>{step === 'email' ? 'Request your OTP.' : step === 'otp' ? 'Enter the code.' : 'Set the new password.'}</h2>
      </div>

      {error ? <div className="auth-panel__alert">{error}</div> : null}
      {success ? <div className="auth-panel__success">{success}</div> : null}

      {step === 'email' ? (
        <form className="auth-panel__form" onSubmit={sendOtp}>
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError('');
              setSuccess('');
            }}
            icon={<Mail size={18} />}
            required
          />

          <div className="auth-panel__meta">
            <div className="auth-panel__meta-item">
              <ShieldCheck size={14} />
              <span>We will send a reset OTP to the email linked with your account.</span>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Send OTP
            <ArrowRight size={16} />
          </Button>
        </form>
      ) : null}

      {step === 'otp' ? (
        <form className="auth-panel__form" onSubmit={verifyOtpStep}>
          <div className="auth-panel__otp">
            <p className="auth-panel__otp-label">Enter the six-digit code sent to {email}</p>
            <OtpInput value={otp} onChange={setOtp} error={error && otp.length !== 6 ? error : ''} />
          </div>

          <Button type="submit" fullWidth size="lg">
            Verify OTP
            <ArrowRight size={16} />
          </Button>

          <button type="button" className="auth-panel__resend" onClick={sendOtp}>
            <RotateCcw size={14} />
            Resend OTP
          </button>
        </form>
      ) : null}

      {step === 'reset' ? (
        <form className="auth-panel__form" onSubmit={resetPassword}>
          <Input
            label="New password"
            name="newPassword"
            type="password"
            placeholder="At least 6 characters"
            value={passwords.next}
            onChange={(event) => {
              setPasswords((current) => ({ ...current, next: event.target.value }));
              setError('');
            }}
            icon={<KeyRound size={18} />}
            required
          />

          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat the password"
            value={passwords.confirm}
            onChange={(event) => {
              setPasswords((current) => ({ ...current, confirm: event.target.value }));
              setError('');
            }}
            icon={<KeyRound size={18} />}
            required
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Reset password
            <ArrowRight size={16} />
          </Button>
        </form>
      ) : null}
    </AuthShell>
  );
}
