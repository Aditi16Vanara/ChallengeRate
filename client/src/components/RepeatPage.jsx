import React from 'react';
import { RotateCcw, Package, Clock, ArrowRight } from 'lucide-react';

const mockPastOrders = [
  {
    id: "ORD-9821",
    title: "Water 200 ML. ( Clonex )",
    quantity: "35 bottle",
    date: "14 Sep 2026",
    status: "Delivered",
    amount: "₹70",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4e?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "ORD-9410",
    title: "Premium Grade Raw Areca Nut / Whole Supari",
    quantity: "500 Kgs",
    date: "28 Aug 2026",
    status: "Delivered",
    amount: "₹2,10,000",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300"
  }
];

export default function RepeatPage({ onReorderClick }) {
  return (
    <div style={{ maxW: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center' }}>
          <RotateCcw size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Repeat Orders</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>Quickly re-order your previous B2B wholesale purchases with 1-click.</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {mockPastOrders.map((order) => (
          <div key={order.id} style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img src={order.image} alt={order.title} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '0.75rem' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00A3FF', background: '#F0F9FF', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>{order.id}</span>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Package size={12} /> {order.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{order.title}</h3>
                <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '0.2rem', display: 'flex', gap: '1rem' }}>
                  <span>Qty: {order.quantity}</span>
                  <span>Date: {order.date}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Amount</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{order.amount}</div>
              </div>
              <button
                onClick={() => onReorderClick && onReorderClick(order)}
                style={{ background: '#00A3FF', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(0,163,255,0.25)' }}
              >
                <span>Re-Order Now</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
