import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../components/ui/Toast/ToastContext';
import Navbar from '../../components/layout/Navbar';
import './OrdersPage.css';

const STATUS_COLOR = { confirmed: 'blue', shipped: 'orange', delivered: 'green', cancelled: 'red', pending: 'gray' };
const STATUS_ICON  = { confirmed: '✅', shipped: '🚚', delivered: '📦', cancelled: '❌', pending: '⏳' };
const TIMELINE_STEPS = ['confirmed', 'shipped', 'delivered'];

export default function OrdersPage() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const { toast }  = useToast();
  const navigate   = useNavigate();

  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  const cancelOrder = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrders((prev) => prev.map((o) => o._id === id ? data.order : o));
      toast('Order cancelled successfully', 'info');
    } catch (err) {
      toast(err.response?.data?.message || 'Cannot cancel order', 'error');
    }
  };

  if (loading) return <div className="page-loader">Loading orders...</div>;

  return (
    <div className="orders-page">
      <Navbar />
      <div className="container orders-inner">
        <h1 className="orders-title">My Orders</h1>

        {orders.length === 0 ? (
          <div className="orders-empty animate-fadeUp">
            <div className="orders-empty__icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
            <button className="orders-shop-btn" onClick={() => navigate('/')}>Start Shopping →</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card animate-fadeUp">
                <div className="order-card__header" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                  <div>
                    <p className="order-card__id">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="order-card__date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`order-card__status order-card__status--${STATUS_COLOR[order.status]}`}>
                      {STATUS_ICON[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="order-card__chevron">{expanded === order._id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Order Timeline */}
                {order.status !== 'cancelled' && (
                  <div className="order-timeline">
                    {TIMELINE_STEPS.map((step, i) => {
                      const stepIdx    = TIMELINE_STEPS.indexOf(order.status);
                      const isComplete = i <= stepIdx;
                      const isActive   = i === stepIdx;
                      return (
                        <div key={step} className={`timeline-step ${isComplete ? 'timeline-step--done' : ''} ${isActive ? 'timeline-step--active' : ''}`}>
                          <div className="timeline-step__dot">{isComplete ? '✓' : i + 1}</div>
                          {i < TIMELINE_STEPS.length - 1 && <div className={`timeline-step__line ${isComplete && i < stepIdx ? 'timeline-step__line--done' : ''}`} />}
                          <p className="timeline-step__label">{step.charAt(0).toUpperCase() + step.slice(1)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Expanded details */}
                {expanded === order._id && (
                  <div className="order-card__expanded animate-fadeIn">
                    <div className="order-card__items">
                      {order.items.map((item, i) => (
                        <div key={i} className="order-card__item">
                          <span className="order-card__item-emoji">{item.emoji}</span>
                          <span className="order-card__item-name">{item.name}</span>
                          <span className="order-card__item-qty">×{item.quantity}</span>
                          <span className="order-card__item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-card__footer">
                      <div className="order-card__address">📍 {order.address?.city}, {order.address?.state} - {order.address?.pincode}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {order.discountAmount > 0 && <span style={{ fontSize: 13, color: 'var(--success)' }}>Saved ₹{order.discountAmount}</span>}
                        <div className="order-card__total">Total: <strong>₹{order.totalAmount.toLocaleString()}</strong></div>
                        {!['delivered', 'cancelled'].includes(order.status) && (
                          <button className="order-cancel-btn" onClick={() => cancelOrder(order._id)}>Cancel Order</button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
