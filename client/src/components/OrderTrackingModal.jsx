import React, { useState } from 'react';
import { X, CheckCircle2, Clock, Truck, Package, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

export default function OrderTrackingModal({ isOpen, onClose, order, onDeliveryConfirmed }) {
  if (!isOpen || !order) return null;

  const [confirming, setConfirming] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const stages = [
    { key: 'ORDER_PLACED', label: 'Order Placed', desc: 'Escrow payment verified & hold' },
    { key: 'MANUFACTURER_ACCEPTED', label: 'Accepted by Manufacturer', desc: 'Production confirmed' },
    { key: 'PROCESSING', label: 'Processing & Packaging', desc: 'Quality inspection & boxing' },
    { key: 'DISPATCHED', label: 'Dispatched', desc: 'Freight truckload assigned' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Shipment received & verified' }
  ];

  const getStageIndex = (current) => {
    switch (current) {
      case 'ORDER_PLACED': return 0;
      case 'MANUFACTURER_ACCEPTED': return 1;
      case 'PROCESSING': return 2;
      case 'DISPATCHED':
      case 'IN_TRANSIT': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStageIndex(order.orderStatus);

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/confirm-delivery`, { method: 'POST' });
      const data = await res.json();
      setConfirming(false);
      if (data.success) {
        setSuccessMsg('Delivery confirmed! Escrow funds have been released to manufacturer.');
        if (onDeliveryConfirmed) onDeliveryConfirmed(data.data);
      }
    } catch (err) {
      setConfirming(false);
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="tracking-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Order #{order.orderNumber}
              </h2>
              <span className="badge-unit">{order.orderStatus ? order.orderStatus.replace('_', ' ') : 'ORDER PLACED'}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | Supplier: {order.supplierName}
            </span>
          </div>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {successMsg && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem', textAlign: 'center' }}>
            🎉 {successMsg}
          </div>
        )}

        {/* Visual Fulfillment Pipeline Timeline */}
        <div style={{ background: '#F8FAFC', borderRadius: '1rem', padding: '1.5rem 1rem', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {/* Timeline progress line */}
            <div style={{ position: 'absolute', top: '16px', left: '20px', right: '20px', height: '3px', background: '#E2E8F0', zIndex: 1 }} />
            <div style={{ position: 'absolute', top: '16px', left: '20px', width: `${Math.min(100, (Math.max(0, currentIndex) / (stages.length - 1)) * 100)}%`, height: '3px', background: '#10B981', zIndex: 2, transition: 'width 0.4s ease' }} />

            {stages.map((stage, idx) => {
              const isDone = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={stage.key} style={{ zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '90px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isDone ? '#10B981' : 'white',
                      border: `2px solid ${isDone ? '#10B981' : '#CBD5E1'}`,
                      color: isDone ? 'white' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'
                    }}
                  >
                    {isDone ? <CheckCircle2 size={18} /> : idx + 1}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 700 : 600, color: isCurrent ? '#0F172A' : '#64748B', marginTop: '0.5rem', lineHeight: 1.2 }}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* E-way Bill and Courier Info (if provided) */}
        {(order.ewayBillNumber || order.trackingNumber) && (
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '0.75rem', padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={16} /> Freight Dispatch Reference
              </div>
              <div style={{ color: '#3B82F6', marginTop: '0.2rem' }}>
                {order.ewayBillNumber && <span>E-Way Bill: <strong>{order.ewayBillNumber}</strong> </span>}
                {order.courierName && <span>| Courier: <strong>{order.courierName}</strong> </span>}
                {order.trackingNumber && <span>| LR/Docket: <strong>{order.trackingNumber}</strong></span>}
              </div>
            </div>
            <span style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              Active Transit
            </span>
          </div>
        )}

        {/* Order Details & Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
          {/* Purchased Items */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.6rem' }}>
              Purchased Wholesale Items
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {order.items && order.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', background: 'white', border: '1px solid #E2E8F0', borderRadius: '0.6rem', padding: '0.6rem' }}>
                  <img
                    src={it.image}
                    alt={it.title}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.4rem' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&q=80&w=300';
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {it.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Qty: <strong>{it.quantity} {it.unit}</strong> • Rate: ₹{it.unitPrice}/{it.unit} (GST: {it.gstRate})
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F172A' }}>
                    ₹{Math.round(it.total).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment Details */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.6rem' }}>
              Warehouse Delivery Details
            </h4>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.6rem', padding: '0.75rem', fontSize: '0.825rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              <div><strong>Recipient:</strong> {order.shippingAddress ? order.shippingAddress.recipientName : order.buyerName}</div>
              <div><strong>Address:</strong> {order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}` : 'Surat, Gujarat'}</div>
              <div><strong>Phone:</strong> {order.shippingAddress ? order.shippingAddress.phone : order.buyerPhone}</div>
              {order.gstin && <div><strong>GSTIN:</strong> {order.gstin}</div>}
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.6rem', padding: '0.75rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ color: '#64748B' }}>Payment Method:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ color: '#64748B' }}>Escrow Status:</span>
                <span style={{ fontWeight: 700, color: order.escrowStatus === 'RELEASED' ? '#10B981' : '#D97706' }}>
                  {order.escrowStatus}
                </span>
              </div>
              <div style={{ height: '1px', background: '#E2E8F0', margin: '0.3rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.95rem' }}>
                <span>Total Amount:</span>
                <span style={{ color: '#00A3FF' }}>₹{Math.round(order.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Confirm Delivery & Release Escrow */}
        {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={handleConfirmDelivery}
              disabled={confirming}
              style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)' }}
            >
              <CheckCircle2 size={16} />
              <span>{confirming ? 'Releasing Escrow...' : 'Confirm Delivery & Release Escrow'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
