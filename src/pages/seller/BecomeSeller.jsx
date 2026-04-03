import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast/ToastContext';
import api from '../../utils/api';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './SellerPages.css';

const PERKS = [
  { icon: '🏪', title: 'Your Own Shop',      desc: 'Create your personal storefront with a custom shop name' },
  { icon: '💰', title: 'Earn Money',          desc: 'List your second-hand items and earn from every sale' },
  { icon: '📦', title: 'Easy Listing',        desc: 'List products in under 2 minutes with our simple form' },
  { icon: '📊', title: 'Seller Dashboard',    desc: 'Track your sales, revenue and views in real-time' },
  { icon: '🔒', title: 'Secure Payments',     desc: 'Get paid safely via Razorpay directly to your account' },
  { icon: '🌍', title: 'Reach Millions',      desc: 'Access LoopKart\'s growing customer base instantly' },
];

const CATEGORIES = [
  { value: 'Electronics', icon: '💻', desc: 'Phones, Laptops, Cameras' },
  { value: 'Fashion', icon: '👕', desc: 'Clothes, Shoes, Accessories' },
  { value: 'Home & Living', icon: '🏠', desc: 'Furniture, Decor, Appliances' },
  { value: 'Beauty', icon: '💄', desc: 'Makeup, Skincare, Perfumes' },
  { value: 'Sports', icon: '⚽', desc: 'Gym, Yoga, Outdoor Gear' },
  { value: 'Books', icon: '📚', desc: 'Novels, Textbooks, Comics' },
  { value: 'Toys', icon: '🧸', desc: 'Kids Toys, Games, Puzzles' },
  { value: 'Kitchen', icon: '🍳', desc: 'Cookware, Utensils, Appliances' },
  { value: 'Accessories', icon: '⌚', desc: 'Watches, Bags, Wallets' },
  { value: 'Grocery', icon: '🛒', desc: 'Food, Beverages, Snacks' },
];

export default function BecomeSeller() {
  const { user, updateUser } = useAuth();
  const { toast }  = useToast();
  const navigate   = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    shopName: '', 
    shopDesc: '', 
    phone: '', 
    city: '', 
    state: '',
    categories: [] // Selected categories
  });
  const [errors, setErrors] = useState({});

  if (user?.role === 'seller' || user?.role === 'admin') {
    navigate('/seller/dashboard'); return null;
  }

  const validate = () => {
    const e = {};
    if (!form.shopName.trim()) e.shopName = 'Shop name is required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = 'Valid 10-digit phone required';
    if (!form.city.trim())  e.city  = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (form.categories.length === 0) e.categories = 'Select at least one category';
    return e;
  };

  const toggleCategory = (cat) => {
    setForm(p => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter(c => c !== cat)
        : [...p.categories, cat]
    }));
    setErrors(e => ({ ...e, categories: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/seller/become', form);
      updateUser(data.user);
      toast('🎉 Welcome to LoopKart Sellers!', 'success');
      navigate('/seller/dashboard');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to register', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="seller-page">
      <Navbar />
      <div className="become-hero">
        <div className="container become-hero__inner">
          <div className="become-hero__content animate-fadeUp">
            <span className="become-hero__tag">🚀 Start Selling Today</span>
            <h1 className="become-hero__title">Turn Your Items Into <span className="become-hero__accent">Cash</span></h1>
            <p className="become-hero__desc">Join thousands of sellers on LoopKart. List your second-hand products and reach millions of buyers — completely free.</p>
            <div className="become-hero__stats">
              <div className="become-stat"><strong>10K+</strong><span>Active Sellers</span></div>
              <div className="become-stat-div" />
              <div className="become-stat"><strong>₹2Cr+</strong><span>Total Sales</span></div>
              <div className="become-stat-div" />
              <div className="become-stat"><strong>Free</strong><span>To List</span></div>
            </div>
          </div>
          <div className="become-hero__form animate-fadeUp">
            <div className="seller-form-card">
              <h2 className="seller-form-card__title">Create Your Shop</h2>
              <p className="seller-form-card__sub">Fill in your details to get started</p>
              <form onSubmit={handleSubmit} className="seller-form">
                <Input label="Shop Name" name="shopName" placeholder="e.g. Rahul's Electronics" value={form.shopName} onChange={(e) => setForm((p) => ({ ...p, shopName: e.target.value }))} error={errors.shopName} required />
                <div className="seller-form__field">
                  <label>Shop Description <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>(optional)</span></label>
                  <textarea className="seller-textarea" placeholder="Tell buyers about your shop..." value={form.shopDesc} onChange={(e) => setForm((p) => ({ ...p, shopDesc: e.target.value }))} rows={3} />
                </div>
                
                {/* Category Selection */}
                <div className="seller-form__field">
                  <label>What will you sell? <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Select categories you want to sell in (choose multiple)</p>
                  <div className="category-selector">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        className={`category-chip ${form.categories.includes(cat.value) ? 'category-chip--active' : ''}`}
                        onClick={() => toggleCategory(cat.value)}
                      >
                        <span className="category-chip__icon">{cat.icon}</span>
                        <div className="category-chip__text">
                          <strong>{cat.value}</strong>
                          <small>{cat.desc}</small>
                        </div>
                        {form.categories.includes(cat.value) && <span className="category-chip__check">✓</span>}
                      </button>
                    ))}
                  </div>
                  {errors.categories && <p className="input-error">{errors.categories}</p>}
                </div>

                <Input label="Phone Number" name="phone" placeholder="9876543210" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} error={errors.phone} required />
                <div className="seller-form__row">
                  <Input label="City" name="city" placeholder="Mumbai" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} error={errors.city} required />
                  <Input label="State" name="state" placeholder="Maharashtra" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} error={errors.state} required />
                </div>
                <Button type="submit" fullWidth size="lg" loading={loading}>🚀 Start Selling for Free</Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Perks */}
      <section className="become-perks">
        <div className="container">
          <h2 className="become-perks__title">Why Sell on LoopKart?</h2>
          <div className="perks-grid">
            {PERKS.map((p, i) => (
              <div key={i} className="perk-card animate-fadeUp" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="perk-card__icon">{p.icon}</span>
                <h3 className="perk-card__title">{p.title}</h3>
                <p className="perk-card__desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
