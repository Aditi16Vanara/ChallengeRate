import React, { useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';

export default function ProductCard({ product, onChallengeRate, onSelectProduct }) {
  const [inquired, setInquired] = useState(false);

  const handleInquiry = (e) => {
    e.stopPropagation();
    setInquired(true);
    if (onChallengeRate) onChallengeRate(product);
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
            <span style={{ fontWeight: 600 }}>{product.supplier.name}</span>
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '2px', color: '#F59E0B' }}>
              <Star size={13} fill="#F59E0B" /> {product.supplier.rating}
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

      {/* Card Footer */}
      <div className="card-footer">
        <div className="moq-tag">
          MOQ: {product.moq}
        </div>
        <button className="btn-challenge" onClick={handleInquiry}>
          {inquired ? 'Rate Challenged!' : 'Challenge Rate'}
        </button>
      </div>
    </div>
  );
}
