import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast/ToastContext';
import api from '../../utils/api';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './SellerPages.css';

const CATEGORIES = ['Electronics','Fashion','Home & Living','Beauty','Sports','Books','Toys','Kitchen'];
const CONDITIONS  = [
  { value: 'new',      label: '✨ Brand New' },
  { value: 'like_new', label: '🌟 Like New' },
  { value: 'good',     label: '👍 Good' },
  { value: 'fair',     label: '🔧 Fair' },
];
const CONDITION_COLORS = { new: 'green', like_new: 'blue', good: 'orange', fair: 'red' };

const emptyForm = { name: '', emoji: '📦', price: '', originalPrice: '', category: 'Electronics', description: '', stock: 1, condition: 'good', badge: '' };

export default function SellerDashboard() {
  const { user, updateUser } = useAuth();
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const [tab, setTab]           = useState('dashboard');
  const [stats, setStats]       = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [shopForm, setShopForm] = useState({
    shopName: user?.sellerProfile?.shopName || '',
    shopDesc: user?.sellerProfile?.shopDesc || '',
    phone:    user?.sellerProfile?.phone    || '',
    city:     user?.sellerProfile?.city     || '',
    state:    user?.sellerProfile?.state    || '',
  });

  useEffect(() => {
    if (!['seller', 'admin'].includes(user?.role)) { navigate('/become-seller'); return; }
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'dashboard') { const { data } = await api.get('/seller/dashboard'); setStats(data); }
      if (tab === 'listings')  { const { data } = await api.get('/seller/listings');  setListings(data.products); }
    } catch { toast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) { toast('Fill required fields', 'warning'); return; }
    setSaving(true);
    try {
      if (editItem) {
        const { data } = await api.put(`/seller/listings/${editItem._id}`, form);
        setListings((prev) => prev.map((p) => p._id === editItem._id ? data.product : p));
        toast('Listing updated!', 'success');
      } else {
        const { data } = await api.post('/seller/listings', form);
        setListings((prev) => [data.product, ...prev]);
        toast('Product listed successfully! 🎉', 'success');
      }
      setShowForm(false); setEditItem(null); setForm(emptyForm); setImagePreview(null);
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast('Please upload an image file', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast('Image size should be less than 5MB', 'error');
      return;
    }

    setUploading(true);
    try {
      // Try Cloudinary upload first
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        const { data } = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setForm(p => ({ ...p, image: data.url }));
        setImagePreview(data.url);
        toast('Image uploaded successfully!', 'success');
      } catch (uploadErr) {
        // Fallback to base64 if Cloudinary fails
        console.log('Cloudinary upload failed, using base64 fallback');
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          setForm(p => ({ ...p, image: base64String }));
          setImagePreview(base64String);
          toast('Image added (using fallback)', 'success');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      toast('Failed to process image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/seller/listings/${id}`);
      setListings((prev) => prev.filter((p) => p._id !== id));
      toast('Listing deleted', 'info');
    } catch { toast('Failed to delete', 'error'); }
  };

  const markSold = async (id) => {
    try {
      const { data } = await api.put(`/seller/listings/${id}/sold`);
      setListings((prev) => prev.map((p) => p._id === id ? data.product : p));
      toast('Marked as sold!', 'success');
    } catch { toast('Failed to update', 'error'); }
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({ name: p.name, emoji: p.emoji, image: p.image || '', price: p.price, originalPrice: p.originalPrice, category: p.category, description: p.description, stock: p.stock, condition: p.condition, badge: p.badge || '' });
    setImagePreview(p.image || null);
    setShowForm(true); setTab('listings');
  };

  const saveShopProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/seller/profile', shopForm);
      updateUser(data.user);
      toast('Shop profile updated!', 'success');
    } catch { toast('Failed to update profile', 'error'); }
  };

  return (
    <div className="seller-page">
      <Navbar />
      <div className="seller-layout">

        {/* Sidebar */}
        <aside className="seller-sidebar">
          <div className="seller-sidebar__shop">
            <div className="seller-sidebar__avatar">{user?.sellerProfile?.shopName?.[0]?.toUpperCase() || '🏪'}</div>
            <div>
              <p className="seller-sidebar__name">{user?.sellerProfile?.shopName || 'My Shop'}</p>
              <p className="seller-sidebar__badge">⭐ Seller</p>
            </div>
          </div>
          {[
            { key: 'dashboard', icon: '📊', label: 'Dashboard' },
            { key: 'listings',  icon: '📦', label: 'My Listings' },
            { key: 'profile',   icon: '🏪', label: 'Shop Profile' },
          ].map((item) => (
            <button key={item.key} className={`seller-sidebar__item ${tab === item.key ? 'seller-sidebar__item--active' : ''}`} onClick={() => { setTab(item.key); setShowForm(false); setEditItem(null); }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
          <button className="seller-sidebar__item seller-sidebar__item--new" onClick={() => { setTab('listings'); setShowForm(true); setEditItem(null); setForm(emptyForm); }}>
            <span>➕</span> Add New Listing
          </button>
        </aside>

        {/* Main Content */}
        <main className="seller-content">
          {loading ? <div className="seller-loading">Loading...</div> : (
            <>
              {/* ── Dashboard ── */}
              {tab === 'dashboard' && stats && (
                <div className="animate-fadeUp">
                  <h2 className="seller-title">Welcome back, {user?.sellerProfile?.shopName}! 👋</h2>
                  <div className="seller-stats">
                    {[
                      { icon: '📦', label: 'Total Listings',  value: stats.totalListings,  color: 'purple' },
                      { icon: '✅', label: 'Active',          value: stats.activeListings, color: 'green' },
                      { icon: '🏷️', label: 'Sold',            value: stats.soldListings,   color: 'blue' },
                      { icon: '💰', label: 'Revenue',         value: `₹${stats.totalRevenue?.toLocaleString()}`, color: 'gold' },
                      { icon: '👁️', label: 'Total Views',     value: stats.totalViews,     color: 'pink' },
                      { icon: '🛒', label: 'Orders',          value: stats.totalOrders,    color: 'orange' },
                    ].map((s, i) => (
                      <div key={i} className={`seller-stat-card seller-stat-card--${s.color}`}>
                        <span className="seller-stat-card__icon">{s.icon}</span>
                        <p className="seller-stat-card__value">{s.value}</p>
                        <p className="seller-stat-card__label">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="seller-subtitle">Recent Listings</h3>
                  {stats.recentListings?.length === 0 ? (
                    <div className="seller-empty">
                      <p>No listings yet.</p>
                      <Button onClick={() => { setTab('listings'); setShowForm(true); }}>+ Add Your First Product</Button>
                    </div>
                  ) : (
                    <div className="seller-recent">
                      {stats.recentListings.map((p) => (
                        <div key={p._id} className="seller-recent-item">
                          <span className="seller-recent-item__emoji">{p.emoji}</span>
                          <div className="seller-recent-item__info">
                            <p className="seller-recent-item__name">{p.name}</p>
                            <p className="seller-recent-item__price">₹{p.price?.toLocaleString()}</p>
                          </div>
                          <span className={`seller-status seller-status--${p.status}`}>{p.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Listings ── */}
              {tab === 'listings' && (
                <div className="animate-fadeUp">
                  <div className="seller-header">
                    <h2 className="seller-title">My Listings ({listings.length})</h2>
                    <Button onClick={() => { setShowForm(true); setEditItem(null); setForm(emptyForm); }}>+ Add Product</Button>
                  </div>

                  {/* Add/Edit Form */}
                  {showForm && (
                    <div className="seller-form-panel animate-fadeUp">
                      <h3>{editItem ? '✏️ Edit Listing' : '➕ Add New Listing'}</h3>
                      <form onSubmit={handleSubmit} className="seller-listing-form">
                        <div className="seller-listing-form__grid">
                          {/* Image Upload */}
                          <div className="slg-field slg-field--full">
                            <label className="slg-label">Product Photo *</label>
                            <div className="image-upload-area">
                              {imagePreview ? (
                                <div className="image-preview">
                                  <img src={imagePreview} alt="Preview" />
                                  <button 
                                    type="button" 
                                    className="image-remove"
                                    onClick={() => {
                                      setImagePreview(null);
                                      setForm(p => ({ ...p, image: '' }));
                                    }}
                                  >
                                    ✕ Remove
                                  </button>
                                </div>
                              ) : (
                                <label className="image-upload-label">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    style={{ display: 'none' }}
                                  />
                                  <div className="image-upload-content">
                                    {uploading ? (
                                      <>
                                        <div className="upload-spinner"></div>
                                        <p>Uploading...</p>
                                      </>
                                    ) : (
                                      <>
                                        <span className="upload-icon">📷</span>
                                        <p><strong>Click to upload</strong> or drag and drop</p>
                                        <small>PNG, JPG up to 5MB</small>
                                      </>
                                    )}
                                  </div>
                                </label>
                              )}
                            </div>
                          </div>

                          <div className="slg-field slg-field--full">
                            <Input label="Product Name *" name="name" placeholder="e.g. iPhone 12 Pro Max 256GB" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                          </div>
                          <div className="slg-field">
                            <label className="slg-label">Emoji / Icon</label>
                            <input className="slg-input" placeholder="📱" value={form.emoji} onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))} />
                          </div>
                          <div className="slg-field">
                            <label className="slg-label">Your Price (₹) *</label>
                            <input className="slg-input" type="number" placeholder="5000" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
                          </div>
                          <div className="slg-field">
                            <label className="slg-label">Original MRP (₹)</label>
                            <input className="slg-input" type="number" placeholder="10000" value={form.originalPrice} onChange={(e) => setForm((p) => ({ ...p, originalPrice: e.target.value }))} />
                          </div>
                          <div className="slg-field">
                            <label className="slg-label">Stock / Quantity</label>
                            <input className="slg-input" type="number" min="1" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
                          </div>
                          <div className="slg-field">
                            <label className="slg-label">Category *</label>
                            <select className="slg-input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="slg-field">
                            <label className="slg-label">Condition *</label>
                            <select className="slg-input" value={form.condition} onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}>
                              {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                          </div>
                          <div className="slg-field">
                            <label className="slg-label">Badge <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(optional)</span></label>
                            <input className="slg-input" placeholder="e.g. Hot Deal" value={form.badge} onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))} />
                          </div>
                          <div className="slg-field slg-field--full">
                            <label className="slg-label">Description</label>
                            <textarea className="slg-textarea" placeholder="Describe your product — condition details, age, reason for selling..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={4} />
                          </div>
                        </div>
                        <div className="seller-form-actions">
                          <Button type="submit" loading={saving}>{editItem ? 'Update Listing' : '🚀 Publish Listing'}</Button>
                          <Button variant="ghost" type="button" onClick={() => { setShowForm(false); setEditItem(null); }}>Cancel</Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Listings Grid */}
                  {listings.length === 0 && !showForm ? (
                    <div className="seller-empty animate-fadeUp">
                      <div style={{ fontSize: 64 }}>📦</div>
                      <h3>No listings yet</h3>
                      <p>Start selling by adding your first product</p>
                      <Button onClick={() => setShowForm(true)}>+ Add Your First Product</Button>
                    </div>
                  ) : (
                    <div className="seller-listings-grid">
                      {listings.map((p) => (
                        <div key={p._id} className={`seller-listing-card ${p.status === 'sold' ? 'seller-listing-card--sold' : ''}`}>
                          <div className="seller-listing-card__img">
                            {p.image ? (
                              <img src={p.image} alt={p.name} />
                            ) : (
                              <span style={{ fontSize: 52 }}>{p.emoji}</span>
                            )}
                          </div>
                          <div className="seller-listing-card__body">
                            <div className="seller-listing-card__top">
                              <p className="seller-listing-card__name">{p.name}</p>
                              <span className={`seller-status seller-status--${p.status}`}>{p.status}</span>
                            </div>
                            <div className="seller-listing-card__meta">
                              <span className="seller-listing-card__price">₹{p.price?.toLocaleString()}</span>
                              <span className={`seller-condition seller-condition--${CONDITION_COLORS[p.condition]}`}>
                                {CONDITIONS.find((c) => c.value === p.condition)?.label || p.condition}
                              </span>
                            </div>
                            <p className="seller-listing-card__cat">{p.category} · {p.stock} in stock · {p.views || 0} views</p>
                            <div className="seller-listing-card__actions">
                              <button className="seller-action-btn" onClick={() => openEdit(p)}>✏️ Edit</button>
                              {p.status !== 'sold' && <button className="seller-action-btn seller-action-btn--sold" onClick={() => markSold(p._id)}>✅ Mark Sold</button>}
                              <button className="seller-action-btn seller-action-btn--del" onClick={() => deleteListing(p._id)}>🗑️ Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Shop Profile ── */}
              {tab === 'profile' && (
                <div className="animate-fadeUp">
                  <h2 className="seller-title">Shop Profile</h2>
                  <form onSubmit={saveShopProfile} className="seller-profile-form">
                    <Input label="Shop Name" value={shopForm.shopName} onChange={(e) => setShopForm((p) => ({ ...p, shopName: e.target.value }))} required />
                    <div className="seller-form__field">
                      <label className="slg-label">Shop Description</label>
                      <textarea className="slg-textarea" rows={3} value={shopForm.shopDesc} onChange={(e) => setShopForm((p) => ({ ...p, shopDesc: e.target.value }))} placeholder="Tell buyers about your shop..." />
                    </div>
                    <Input label="Phone" value={shopForm.phone} onChange={(e) => setShopForm((p) => ({ ...p, phone: e.target.value }))} required />
                    <div className="seller-form__row">
                      <Input label="City"  value={shopForm.city}  onChange={(e) => setShopForm((p) => ({ ...p, city: e.target.value }))} required />
                      <Input label="State" value={shopForm.state} onChange={(e) => setShopForm((p) => ({ ...p, state: e.target.value }))} required />
                    </div>
                    <Button type="submit" size="lg">Save Profile</Button>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
