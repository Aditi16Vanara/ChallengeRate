import React, { useState, useEffect } from 'react';
import { RotateCcw, Package, Clock, ArrowRight, Eye, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RepeatPage({ currentUser, onReorderToCart, onTrackOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    const email = currentUser ? currentUser.email : 'aditi@business.com';
    fetch(`/api/orders/my-orders?buyerEmail=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
            <RotateCcw size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Repeat Orders & History
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              Live B2B orders stored in MongoDB with 1-click repeat re-ordering.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          style={{ background: 'white', border: '1px solid #CBD5E1', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Refresh Orders
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
          Loading real order records from database...
        </div>
      ) : orders.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Package size={44} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#334155' }}>No orders placed yet</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
            When you checkout wholesale items from verified manufacturers, your orders will appear here for fast re-ordering.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => {
            const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;

            return (
              <div key={order._id || order.orderNumber} style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Left: Product & Order Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {firstItem && (
                    <img
                      src={firstItem.image || 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?auto=format&fit=crop&q=80&w=300'}
                      alt={firstItem.title}
                      style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '0.75rem', background: '#F1F5F9' }}
                    />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00A3FF', background: '#F0F9FF', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        #{order.orderNumber}
                      </span>
                      <span className="badge-unit">
                        {order.orderStatus ? order.orderStatus.replace('_', ' ') : 'ORDER PLACED'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
                        Escrow: {order.escrowStatus || 'HELD'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {firstItem ? firstItem.title : 'Wholesale Consignment'}
                      {order.items && order.items.length > 1 && ` (+${order.items.length - 1} more items)`}
                    </h3>

                    <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '0.2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      <span>Supplier: <strong>{order.supplierName}</strong></span>
                      <span>Total Qty: <strong>{order.items ? order.items.reduce((acc, i) => acc + i.quantity, 0) : 0} units</strong></span>
                      <span>Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>Pay: {order.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Amount</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                      ₹{Math.round(order.totalAmount).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => onTrackOrder && onTrackOrder(order)}
                    style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', padding: '0.6rem 1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Eye size={15} /> Track Order
                  </button>

                  <button
                    onClick={() => onReorderToCart && onReorderToCart(order)}
                    style={{ background: '#00A3FF', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(0,163,255,0.25)' }}
                  >
                    <RotateCcw size={15} />
                    <span>Re-Order Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
