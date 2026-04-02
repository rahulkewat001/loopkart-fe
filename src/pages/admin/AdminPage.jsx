import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast/ToastContext';
import api from '../../utils/api';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import './AdminPage.css';

const STATUS_STEPS = ['confirmed', 'shipped', 'delivered'];

export default function AdminPage() {
  const { user }   = useAuth();
  const { toast }  = useToast();
  const navigate   = useNavigate();
  const [tab, setTab]         = useState('dashboard');
  const [stats, setStats]     = useState(null);
  const [orders, setOrders]   = useState([]);
  const [users, setUsers]     = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', emoji: '📦', price: '', originalPrice: '', category: 'Electronics', description: '', stock: 100, badge: '' });

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    loadTab(tab);
  }, [tab]);

  const loadTab = async (t) => {
    setLoading(true);
    try {
      if (t === 'dashboard') { const { data } = await api.get('/admin/dashboard'); setStats(data); }
      if (t === 'orders')    { const { data } = await api.get('/admin/orders');    setOrders(data.orders); }
      if (t === 'users')     { const { data } = await api.get('/admin/users');     setUsers(data.users); }
      if (t === 'products')  { const { data } = await api.get('/products');        setProducts(data.products); }
    } catch { toast('Failed to load data', 'error'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
      toast(`Order marked as ${status}`, 'success');
    } catch { toast('Failed to update status', 'error'); }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        const { data } = await api.put(`/admin/products/${editProduct._id}`, form);
        setProducts((prev) => prev.map((p) => p._id === editProduct._id ? data.product : p));
        toast('Product updated!', 'success');
      } else {
        const { data } = await api.post('/admin/products', form);
        setProducts((prev) => [...prev, data.product]);
        toast('Product added!', 'success');
      }
      setShowForm(false); setEditProduct(null);
      setForm({ name: '', emoji: '📦', price: '', originalPrice: '', category: 'Electronics', description: '', stock: 100, badge: '' });
    } catch { toast('Failed to save product', 'error'); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast('Product deleted', 'info');
    } catch { toast('Failed to delete', 'error'); }
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ name: p.name, emoji: p.emoji, price: p.price, originalPrice: p.originalPrice, category: p.category, description: p.description, stock: p.stock, badge: p.badge || '' });
    setShowForm(true);
  };

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-layout">

        {/* Sidebar */}
        <aside className="admin-sidebar">
          <p className="admin-sidebar__title">Admin Panel</p>
          {[
            { key: 'dashboard', icon: '📊', label: 'Dashboard' },
            { key: 'orders',    icon: '📦', label: 'Orders' },
            { key: 'products',  icon: '🛍️', label: 'Products' },
            { key: 'users',     icon: '👥', label: 'Users' },
          ].map((item) => (
            <button key={item.key} className={`admin-sidebar__item ${tab === item.key ? 'admin-sidebar__item--active' : ''}`} onClick={() => setTab(item.key)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main className="admin-content">
          {loading ? <div className="admin-loading">Loading...</div> : (

            <>
              {/* Dashboard */}
              {tab === 'dashboard' && stats && (
                <div className="animate-fadeUp">
                  <h2 className="admin-title">Dashboard Overview</h2>
                  <div className="admin-stats">
                    {[
                      { icon: '👥', label: 'Total Users',    value: stats.totalUsers },
                      { icon: '🛍️', label: 'Total Products', value: stats.totalProducts },
                      { icon: '📦', label: 'Total Orders',   value: stats.totalOrders },
                      { icon: '💰', label: 'Total Revenue',  value: `₹${stats.revenue?.toLocaleString()}` },
                    ].map((s, i) => (
                      <div key={i} className="admin-stat-card">
                        <span className="admin-stat-card__icon">{s.icon}</span>
                        <div>
                          <p className="admin-stat-card__value">{s.value}</p>
                          <p className="admin-stat-card__label">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <h3 className="admin-subtitle">Recent Orders</h3>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {stats.recentOrders?.map((o) => (
                          <tr key={o._id}>
                            <td>#{o._id.slice(-8).toUpperCase()}</td>
                            <td>{o.user?.name}</td>
                            <td>₹{o.totalAmount?.toLocaleString()}</td>
                            <td><span className={`admin-badge admin-badge--${o.status}`}>{o.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Orders */}
              {tab === 'orders' && (
                <div className="animate-fadeUp">
                  <h2 className="admin-title">All Orders ({orders.length})</h2>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o._id}>
                            <td>#{o._id.slice(-8).toUpperCase()}</td>
                            <td>{o.user?.name}<br /><small>{o.user?.email}</small></td>
                            <td>{o.items?.length} items</td>
                            <td>₹{o.totalAmount?.toLocaleString()}</td>
                            <td><span className={`admin-badge admin-badge--${o.status}`}>{o.status}</span></td>
                            <td>
                              <select className="admin-select" value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                                {['confirmed','shipped','delivered','cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Products */}
              {tab === 'products' && (
                <div className="animate-fadeUp">
                  <div className="admin-header">
                    <h2 className="admin-title">Products ({products.length})</h2>
                    <Button onClick={() => { setShowForm(true); setEditProduct(null); }}>+ Add Product</Button>
                  </div>

                  {showForm && (
                    <form onSubmit={handleProductSubmit} className="admin-form">
                      <h3>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
                      <div className="admin-form-grid">
                        {[
                          { name: 'name',          label: 'Product Name', type: 'text' },
                          { name: 'emoji',         label: 'Emoji',        type: 'text' },
                          { name: 'price',         label: 'Price (₹)',    type: 'number' },
                          { name: 'originalPrice', label: 'MRP (₹)',      type: 'number' },
                          { name: 'stock',         label: 'Stock',        type: 'number' },
                          { name: 'badge',         label: 'Badge',        type: 'text' },
                        ].map((f) => (
                          <div key={f.name} className="admin-field">
                            <label>{f.label}</label>
                            <input type={f.type} value={form[f.name]} onChange={(e) => setForm((p) => ({ ...p, [f.name]: e.target.value }))} required={['name','price','originalPrice'].includes(f.name)} />
                          </div>
                        ))}
                        <div className="admin-field">
                          <label>Category</label>
                          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                            {['Electronics','Fashion','Beauty','Sports','Books','Toys','Kitchen','Home & Living'].map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="admin-field admin-field--full">
                          <label>Description</label>
                          <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
                        </div>
                      </div>
                      <div className="admin-form-actions">
                        <Button type="submit">{editProduct ? 'Update' : 'Add Product'}</Button>
                        <Button variant="ghost" type="button" onClick={() => { setShowForm(false); setEditProduct(null); }}>Cancel</Button>
                      </div>
                    </form>
                  )}

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p._id}>
                            <td><span style={{ marginRight: 8 }}>{p.emoji}</span>{p.name}</td>
                            <td>{p.category}</td>
                            <td>₹{p.price?.toLocaleString()}</td>
                            <td>{p.stock}</td>
                            <td>
                              <button className="admin-action-btn" onClick={() => openEdit(p)}>✏️ Edit</button>
                              <button className="admin-action-btn admin-action-btn--danger" onClick={() => deleteProduct(p._id)}>🗑️ Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Users */}
              {tab === 'users' && (
                <div className="animate-fadeUp">
                  <h2 className="admin-title">All Users ({users.length})</h2>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td><span className={`admin-badge admin-badge--${u.role}`}>{u.role}</span></td>
                            <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
