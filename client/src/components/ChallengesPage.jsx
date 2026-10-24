import React, { useState, useEffect } from 'react';
import { Zap, Clock, CheckCircle2, XCircle, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';

export default function ChallengesPage({ currentUser, onOrderNegotiatedDeal }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const fetchChallenges = () => {
    setLoading(true);
    const email = currentUser ? currentUser.email : 'aditi@business.com';
    fetch(`/api/challenges/my-challenges?buyerEmail=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setChallenges(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching challenges:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchChallenges();
  }, [currentUser]);

  const handleBuyerResponse = async (challengeId, action) => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/buyer-respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          buyerName: currentUser ? currentUser.name : 'Aditi Vanara'
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast(`Counter-offer ${action === 'ACCEPT' ? 'accepted' : 'rejected'} successfully!`);
        setTimeout(() => setToast(''), 4000);
        fetchChallenges();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
      case 'BUYER_ACCEPTED':
        return <span className="status-badge success"><CheckCircle2 size={13} /> {status.replace('_', ' ')}</span>;
      case 'COUNTERED':
        return <span className="status-badge warning"><Clock size={13} /> COUNTER-OFFERED</span>;
      case 'DECLINED':
      case 'BUYER_REJECTED':
        return <span className="status-badge danger"><XCircle size={13} /> {status.replace('_', ' ')}</span>;
      case 'UNDER_REVIEW':
        return <span className="status-badge info"><Clock size={13} /> UNDER REVIEW</span>;
      default:
        return <span className="status-badge neutral"><Zap size={13} /> SUBMITTED</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #21A3FF, #0F3B9A)', color: 'white', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
            <Zap size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Rate Challenge Negotiations
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              Direct B2B wholesale price challenges and manufacturer counter-offers.
            </p>
          </div>
        </div>

        <button
          onClick={fetchChallenges}
          style={{ background: 'white', border: '1px solid #CBD5E1', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Refresh Deals
        </button>
      </div>

      {toast && (
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.75rem 1.25rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
          🎉 {toast}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
          Loading negotiation threads...
        </div>
      ) : challenges.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Zap size={44} style={{ color: '#94A3B8', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#334155' }}>No Rate Challenges active yet</h3>
          <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            When viewing wholesale products in the catalog, click "Challenge Rate" to negotiate custom volume discounts directly with Indian manufacturers.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {challenges.map(chl => (
            <div key={chl._id || chl.challengeId} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={chl.productImage}
                    alt={chl.productTitle}
                    style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '0.65rem' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&q=80&w=300';
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00A3FF', background: '#F0F9FF', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {chl.challengeId}
                      </span>
                      {getStatusBadge(chl.status)}
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{chl.productTitle}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Manufacturer: <strong>{chl.supplierName}</strong> | Timeline: {chl.expectedDeliveryTimeline}
                    </div>
                  </div>
                </div>

                {/* Price Comparisons */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Listed Price</div>
                    <div style={{ fontSize: '0.95rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                      ₹{chl.listedPrice} / {chl.unit}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Your Proposed Rate</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#00A3FF' }}>
                      ₹{chl.proposedPrice} / {chl.unit}
                    </div>
                  </div>

                  {chl.counterOfferPrice && (
                    <div style={{ textAlign: 'right', background: '#FEF3C7', padding: '0.35rem 0.75rem', borderRadius: '0.6rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: 700 }}>COUNTER-OFFER</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#B45309' }}>
                        ₹{chl.counterOfferPrice} / {chl.unit}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Action Area */}
              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ fontSize: '0.825rem', color: '#475569' }}>
                  <strong>Volume:</strong> {chl.requestedQuantity.toLocaleString('en-IN')} {chl.unit}s |
                  <strong> Deal Value:</strong> ₹{Math.round(chl.requestedQuantity * (chl.counterOfferPrice || chl.proposedPrice)).toLocaleString('en-IN')}
                  {chl.manufacturerNotes && (
                    <div style={{ marginTop: '0.35rem', color: '#0F3B9A', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      💬 Manufacturer: "{chl.manufacturerNotes}"
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {chl.status === 'COUNTERED' && (
                    <>
                      <button
                        onClick={() => handleBuyerResponse(chl._id, 'ACCEPT')}
                        style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <CheckCircle2 size={16} /> Accept Counter-Offer
                      </button>
                      <button
                        onClick={() => handleBuyerResponse(chl._id, 'REJECT')}
                        style={{ background: '#F1F5F9', color: '#EF4444', border: '1px solid #CBD5E1', padding: '0.55rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {(chl.status === 'ACCEPTED' || chl.status === 'BUYER_ACCEPTED') && (
                    <button
                      onClick={() => onOrderNegotiatedDeal && onOrderNegotiatedDeal(chl)}
                      style={{ background: 'linear-gradient(135deg, #00A3FF, #0F3B9A)', color: 'white', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(0,163,255,0.3)' }}
                    >
                      <span>Checkout at Negotiated Rate</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
