import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');

  const [form, setForm]         = useState({ name: user?.name || '', email: user?.email || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [msg, setMsg]           = useState('');
  const [err, setErr]           = useState('');
  const [loading, setLoading]   = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(''); setErr('');
    try {
      const { data } = await api.put('/profile/me', form);
      updateUser(data.user);
      setMsg('Profile updated successfully!');
    } catch (error) {
      setErr(error.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmNew) { setErr('New passwords do not match'); return; }
    if (passForm.newPassword.length < 6) { setErr('Password must be at least 6 characters'); return; }
    setLoading(true); setMsg(''); setErr('');
    try {
      await api.put('/profile/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      setMsg('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="profile-page">
      <Navbar />
      <div className="container profile-inner">

        {/* Header */}
        <div className="profile-header animate-fadeUp">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h1 className="profile-name">{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-joined">Member since {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button className={`profile-tab ${tab === 'profile' ? 'profile-tab--active' : ''}`} onClick={() => { setTab('profile'); setMsg(''); setErr(''); }}>👤 Edit Profile</button>
          <button className={`profile-tab ${tab === 'password' ? 'profile-tab--active' : ''}`} onClick={() => { setTab('password'); setMsg(''); setErr(''); }}>🔒 Change Password</button>
        </div>

        {/* Messages */}
        {msg && <div className="profile-msg profile-msg--success animate-fadeIn">✅ {msg}</div>}
        {err && <div className="profile-msg profile-msg--error animate-shake">⚠️ {err}</div>}

        {/* Profile Form */}
        {tab === 'profile' && (
          <form onSubmit={handleProfile} className="profile-form animate-fadeUp">
            <Input label="Full Name" name="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            <Input label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
            <Button type="submit" loading={loading} size="lg">Save Changes</Button>
          </form>
        )}

        {/* Password Form */}
        {tab === 'password' && (
          <form onSubmit={handlePassword} className="profile-form animate-fadeUp">
            <Input label="Current Password" name="currentPassword" type="password" value={passForm.currentPassword} onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))} required />
            <Input label="New Password" name="newPassword" type="password" value={passForm.newPassword} onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))} required />
            <Input label="Confirm New Password" name="confirmNew" type="password" value={passForm.confirmNew} onChange={(e) => setPassForm((p) => ({ ...p, confirmNew: e.target.value }))} required />
            <Button type="submit" loading={loading} size="lg">Change Password</Button>
          </form>
        )}
      </div>
    </div>
  );
}
