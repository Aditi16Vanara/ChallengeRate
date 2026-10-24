import React, { useState } from 'react';
import { X, Zap, TrendingDown, Clock, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ChallengeModal({
  isOpen,
  onClose,
  product,
  currentUser,
  onChallengeSuccess
}) {
  if (!isOpen || !product) return null;

  const extractNumber = (val, defaultVal = 100) => {
    if (typeof val === 'number') return val;
    if (!val) return defaultVal;
    const match = String(val).replace(/,/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : defaultVal;
  };

  const defaultQty = extractNumber(product.minOrder || product.moq, 100) * 2;
  const [requestedQuantity, setRequestedQuantity] = useState(defaultQty);
  const [proposedPrice, setProposedPrice] = useState(Math.round(product.basePrice * 0.9 * 10) / 10);
  const [expectedTimeline, setExpectedTimeline] = useState('Within 7-10 Days');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const moqNum = extractNumber(product.minOrder || product.moq, 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (requestedQuantity < moqNum) {
      setErrorMsg(`Quantity must be at least the MOQ (${product.minOrder || product.moq}).`);
      return;
    }

    if (proposedPrice <= 0 || proposedPrice >= product.basePrice * 1.5) {
      setErrorMsg('Please propose a reasonable target price.');
      return;
    }

    setLoading(true);

    const payload = {
      buyerId: currentUser ? currentUser.id : undefined,
      buyerName: currentUser ? currentUser.name : 'Aditi Vanara',
      buyerEmail: currentUser ? currentUser.email : 'aditi@business.com',
      productId: product._id,
      requestedQuantity: Number(requestedQuantity),
      proposedPrice: Number(proposedPrice),
      expectedDeliveryTimeline: expectedTimeline,
      notes
    };

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        onChallengeSuccess(data.data);
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to submit challenge.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error connecting to challenge service.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="challenge-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #21A3FF, #0F3B9A)', color: 'white', padding: '0.45rem', borderRadius: '0.6rem', display: 'flex' }}>
              <Zap size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Challenge Wholesale Rate
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Negotiate directly with {product.supplier ? product.supplier.name : 'Manufacturer'}
              </span>
            </div>
          </div>
          <button className="cart-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Product Reference Card */}
        <div style={{ display: 'flex', gap: '1rem', background: '#F8FAFC', padding: '0.85rem', borderRadius: '0.85rem', border: '1px solid #E2E8F0', marginBottom: '1.25rem' }}>
          <img
            src={product.image}
            alt={product.title}
            style={{ width: '65px', height: '65px', borderRadius: '0.5rem', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&q=80&w=300';
            }}
          />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{product.title}</h4>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
              Listed Base Price: <strong style={{ color: '#00A3FF' }}>₹{product.basePrice} / {product.unit}</strong> | MOQ: {product.minOrder || product.moq}
            </div>
            {product.tiers && product.tiers.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                Tiers: {product.tiers.map(t => `${t.qtyRange}: ₹${t.price}`).join(' • ')}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Requested Bulk Quantity ({product.unit || 'Units'})</label>
              <input
                type="number"
                required
                min={moqNum}
                className="form-input"
                value={requestedQuantity}
                onChange={e => setRequestedQuantity(e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Must be at least {moqNum} {product.unit}</span>
            </div>

            <div className="form-group">
              <label className="form-label">Your Proposed Target Price (₹ / {product.unit})</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input"
                value={proposedPrice}
                onChange={e => setProposedPrice(e.target.value)}
              />
              <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>
                {proposedPrice < product.basePrice ? `Save ₹${Math.round((product.basePrice - proposedPrice) * 100) / 100} / ${product.unit}` : ''}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Delivery Timeline</label>
            <select
              className="form-input"
              value={expectedTimeline}
              onChange={e => setExpectedTimeline(e.target.value)}
            >
              <option value="Urgent Dispatch (Within 3-5 Days)">Urgent Dispatch (Within 3-5 Days)</option>
              <option value="Standard Schedule (Within 7-10 Days)">Standard Schedule (Within 7-10 Days)</option>
              <option value="Flexible (Within 15-20 Days)">Flexible (Within 15-20 Days)</option>
              <option value="Monthly Recurring Supply">Monthly Recurring Supply</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Specifications / Note to Manufacturer (Optional)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. Regular monthly volume required for Surat factory. Need moisture certified certificate."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div style={{ background: '#EFF6FF', padding: '0.75rem', borderRadius: '0.65rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#1E40AF', display: 'flex', gap: '0.5rem' }}>
            <TrendingDown size={18} style={{ flexShrink: 0 }} />
            <span>
              Total Estimated Deal Value: <strong>₹{Math.round(requestedQuantity * proposedPrice).toLocaleString('en-IN')}</strong> (at your proposed rate). The manufacturer will receive your proposal instantly.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
          >
            {loading ? 'Submitting Challenge...' : 'Submit Challenge Rate Proposal'}
          </button>
        </form>
      </div>
    </div>
  );
}
