import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import '../auth/LoginPage.css';

export default function ForgotPasswordPage() {
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]         = useState('email'); // email | otp | reset
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const sendOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('OTP sent to your email!');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const resetPass = async (e) => {
    e.preventDefault();
    if (newPass !== confirm) { setError('Passwords do not match'); return; }
    if (newPass.length < 6)  { setError('Minimum 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, newPassword: newPass });
      saveAuth(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fadeUp">
        <div className="auth-brand">
          <span className="auth-brand__logo">🛒</span>
          <span className="auth-brand__name">LoopKart</span>
        </div>

        <h1 className="auth-title">{step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Enter OTP' : 'Reset Password'}</h1>
        <p className="auth-subtitle">
          {step === 'email' ? "We'll send an OTP to your email" : step === 'otp' ? `OTP sent to ${email}` : 'Set your new password'}
        </p>

        {error   && <div className="auth-alert animate-shake">{error}</div>}
        {success && <div className="auth-alert" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>{success}</div>}

        {step === 'email' && (
          <form onSubmit={sendOtp} className="auth-form">
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" fullWidth size="lg" loading={loading}>Send OTP</Button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('reset'); setSuccess(''); }} className="auth-form">
            <Input label="Enter 6-digit OTP" type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
            <Button type="submit" fullWidth size="lg">Verify OTP</Button>
            <button type="button" className="auth-resend" onClick={sendOtp}>Resend OTP</button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={resetPass} className="auth-form">
            <Input label="New Password" type="password" placeholder="Min 6 characters" value={newPass} onChange={(e) => setNewPass(e.target.value)} required />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            <Button type="submit" fullWidth size="lg" loading={loading}>Reset Password</Button>
          </form>
        )}

        <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  );
}
