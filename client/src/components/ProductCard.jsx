import React, { useState } from 'react';
import { CheckCircle2, Star, ShoppingCart, Zap } from 'lucide-react';

export default function ProductCard({ product, onChallengeRate, onSelectProduct, onAddToCart }) {
  const [added, setAdded] = useState(false);

  const handleChallenge = (e) => {
    e.stopPropagation();
    if (onChallengeRate) onChallengeRate(product);
  };

  const handleCartAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div
      className="b2b-card"
      onClick={() => onSelectProduct && onSelectProduct(product)}
      style={{ cursor: 'pointer' }}
    >
      {/* Top Section */}
      <div className="card-top">
        <img src={product.image} alt={product.title} className="product-thumb" />
        <div className="product-info">
          <div>
            <div className="category-tag">{product.category}</div>
            <h3 className="product-title">{product.title}</h3>
          </div>
          <div className="supplier-badge">
            <CheckCircle2 className="verified-icon" />
            <span style={{ fontWeight: 600 }}>{product.supplier ? product.supplier.name : 'Verified'}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', color: '#F59E0B' }}>
              <Star size={13} fill="#F59E0B" /> {product.supplier ? product.supplier.rating : 4.8}
            </span>
          </div>
        </div>
      </div>

      {/* Tier Price Table */}
      <div className="tier-box">
        <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: '#0F3B9A', fontSize: '0.775rem' }}>
          WHOLESALE TIERED PRICING
        </div>
        {product.tiers && product.tiers.map((tier, idx) => (
          <div key={idx} className="tier-row">
            <span className="tier-label">{tier.qtyRange}</span>
            <span className="tier-val">₹{tier.price} / {product.unit}</span>
          </div>
        ))}
      </div>

      {/* Card Footer with MOQ, Add to Cart & Challenge Rate CTA */}
      <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div className="moq-tag" style={{ fontSize: '0.75rem' }}>
          MOQ: {product.minOrder || product.moq}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={handleCartAdd}
            style={{
              background: added ? '#10B981' : '#F1F5F9',
              color: added ? 'white' : '#0F172A',
              border: '1px solid #CBD5E1',
              padding: '0.45rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            title="Add MOQ to Cart"
          >
            <ShoppingCart size={13} />
            <span>{added ? 'Added!' : '+ Cart'}</span>
          </button>

          <button className="btn-challenge" onClick={handleChallenge} title="Negotiate wholesale price">
            <Zap size={13} />
            <span>Challenge Rate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
