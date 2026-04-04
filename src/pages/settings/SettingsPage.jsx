import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast/ToastContext';
import api from '../../utils/api';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    chatNotifications: true,
    marketingEmails: false,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast('Settings updated', 'success');
  };

  const handleLogoutAll = async () => {
    if (!confirm('This will log you out from all devices. Continue?')) return;
    setLoading(true);
    try {
      await api.post('/auth/logout-all');
      toast('Logged out from all devices', 'success');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1000);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to logout', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') {
      toast('Please type DELETE to confirm', 'warning');
      return;
    }
    setLoading(true);
    try {
      await api.delete('/profile/delete-account');
      toast('Account deleted successfully', 'success');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 1500);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <Navbar />
      <div className="container settings-inner">
        <div className="settings-header animate-fadeUp">
          <h1 className="settings-title">⚙️ Settings</h1>
          <p className="settings-subtitle">Manage your account preferences and privacy</p>
        </div>

        {/* Privacy Section */}
        <section className="settings-section animate-fadeUp">
          <div className="settings-section-header">
            <h2>🔒 Privacy</h2>
            <p>Control who can see your information</p>
          </div>
          <div className="settings-card">
            <div className="settings-item">
              <div className="settings-item-info">
                <h3>Profile Visibility</h3>
                <p>Your profile is visible to all LoopKart users</p>
              </div>
              <span className="settings-badge">Public</span>
            </div>
            <div className="settings-item">
              <div className="settings-item-info">
                <h3>Show Online Status</h3>
                <p>Let others see when you're online</p>
              </div>
              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
            <div className="settings-item">
              <div className="settings-item-info">
                <h3>Show Last Seen</h3>
                <p>Display your last active time</p>
              </div>
              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="settings-section animate-fadeUp">
          <div className="settings-section-header">
            <h2>🔔 Notifications</h2>
            <p>Choose what updates you want to receive</p>
          </div>
          <div className="settings-card">
            <div className="settings-item">
              <div className="settings-item-info">
                <h3>Email Notifications</h3>
                <p>Receive important updates via email</p>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
            <div className="settings-item">
              <div className="settings-item-info">
                <h3>Order Updates</h3>
                <p>Get notified about order status changes</p>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.orderUpdates}
                  onChange={() => handleToggle('orderUpdates')}
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
            <div className="settings-item">
              <div className="settings-item-info">
                <h3>Chat Notifications</h3>
                <p>Receive alerts for new messages</p>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.chatNotifications}
                  onChange={() => handleToggle('chatNotifications')}
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
            <div className="settings-item">
              <div className="settings-item-info">
                <h3>Marketing Emails</h3>
                <p>Promotional offers and deals</p>
              </div>
              <label className="settings-toggle">
                <input 
                  type="checkbox" 
                  checked={settings.marketingEmails}
                  onChange={() => handleToggle('marketingEmails')}
                />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* Chat Safety Tips */}
        <section className="settings-section animate-fadeUp">
          <div className="settings-section-header">
            <h2>💬 Chat Safety Tips</h2>
            <p>Stay safe while chatting with buyers and sellers</p>
          </div>
          <div className="settings-card settings-tips">
            <div className="settings-tip">
              <span className="settings-tip-icon">✅</span>
              <div>
                <h4>Keep conversations on LoopKart</h4>
                <p>Don't share personal contact details until you're ready to meet</p>
              </div>
            </div>
            <div className="settings-tip">
              <span className="settings-tip-icon">🚫</span>
              <div>
                <h4>Never share financial information</h4>
                <p>Don't share bank details, OTPs, or passwords with anyone</p>
              </div>
            </div>
            <div className="settings-tip">
              <span className="settings-tip-icon">🤝</span>
              <div>
                <h4>Meet in public places</h4>
                <p>For in-person transactions, choose safe, public locations</p>
              </div>
            </div>
            <div className="settings-tip">
              <span className="settings-tip-icon">⚠️</span>
              <div>
                <h4>Report suspicious activity</h4>
                <p>If something feels wrong, report the user immediately</p>
              </div>
            </div>
            <div className="settings-tip">
              <span className="settings-tip-icon">💳</span>
              <div>
                <h4>Use secure payment methods</h4>
                <p>Prefer online payments through LoopKart for buyer protection</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Actions */}
        <section className="settings-section animate-fadeUp">
          <div className="settings-section-header">
            <h2>🛡️ Security</h2>
            <p>Manage your account security</p>
          </div>
          <div className="settings-card">
            <div className="settings-item settings-item--action">
              <div className="settings-item-info">
                <h3>Logout from All Devices</h3>
                <p>End all active sessions on other devices</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogoutAll}
                loading={loading}
              >
                Logout All
              </Button>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="settings-section animate-fadeUp">
          <div className="settings-section-header">
            <h2>⚠️ Danger Zone</h2>
            <p>Irreversible actions</p>
          </div>
          <div className="settings-card settings-card--danger">
            {!showDeleteConfirm ? (
              <div className="settings-item settings-item--action">
                <div className="settings-item-info">
                  <h3>Delete Account</h3>
                  <p>Permanently delete your account and all data</p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </Button>
              </div>
            ) : (
              <div className="settings-delete-confirm">
                <h3>⚠️ Are you absolutely sure?</h3>
                <p>This action cannot be undone. This will permanently delete your account, all your listings, orders, and messages.</p>
                <div className="settings-delete-input">
                  <label>Type <strong>DELETE</strong> to confirm:</label>
                  <input 
                    type="text" 
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
                <div className="settings-delete-actions">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteInput('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDeleteAccount}
                    loading={loading}
                    disabled={deleteInput !== 'DELETE'}
                  >
                    Delete My Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
