import React from 'react';
import { CheckCircle2, Eye, Share2, ArrowLeft, Zap, ShoppingCart } from 'lucide-react';

export default function ProductDetail({ product, onBack, onOrderClick, onChallengeRate }) {
  if (!product) return null;

  return (
    <div className="product-detail-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none', background: 'none', color: '#21A3FF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 460px) 1fr', gap: '2.5rem' }}>
        {/* Left Column: Product Image & Seller Info */}
        <div className="left-col">
          {/* Main Image Container */}
          <div style={{ position: 'relative', borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <img
              src={product.image}
              alt={product.title}
              style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&q=80&w=800';
              }}
            />
            {/* Views counter badge */}
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(4px)', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.775rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Eye size={14} />
              <span>{product.viewsCount ? product.viewsCount.toLocaleString() : '6,426'} views</span>
            </div>
            {/* Share WhatsApp button */}
            <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'white', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>
              <span style={{ color: '#25D366', fontWeight: 'bold' }}>💬</span> Share
            </div>
          </div>

          {/* Seller / Brand Profile Box */}
          <div style={{ marginTop: '1.25rem', background: '#F1F5F9', borderRadius: '1.25rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', background: '#0F3B9A', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                CR
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>ChallengeRate.Com</span>
                <CheckCircle2 size={16} style={{ color: '#21A3FF', fill: '#21A3FF' }} />
              </div>
            </div>
            <button style={{ background: '#00A3FF', color: 'white', border: 'none', padding: '0.4rem 1.1rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              Profile
            </button>
          </div>
        </div>

        {/* Right Column: Title, Pricing, Order CTA & Details Tables */}
        <div className="right-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Title & Qualification */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {product.title}
              </h1>
              {product.qualified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#10B981', fontWeight: 700, fontSize: '0.85rem' }}>
                  <CheckCircle2 size={15} /> Qualified
                </span>
              )}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00A3FF', marginTop: '0.5rem' }}>
              ₹{product.basePrice} <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>/ {product.unit}</span>
            </div>
          </div>

          {/* Action CTAs: Order (Cart) & Challenge Rate */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '0.75rem' }}>
              <button
                onClick={() => onOrderClick(product)}
                style={{ width: '100%', background: '#00A3FF', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '9999px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0, 163, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ShoppingCart size={18} />
                <span>Order ({product.minOrder || product.moq})</span>
              </button>

              <button
                onClick={() => onChallengeRate && onChallengeRate(product)}
                style={{ width: '100%', background: 'linear-gradient(135deg, #0F3B9A, #0E2F6F)', color: 'white', border: 'none', padding: '0.85rem', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(15, 59, 154, 0.25)' }}
              >
                <Zap size={16} />
                <span>Challenge Rate</span>
              </button>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'center' }}>
              Quantity starts at {product.minOrder || product.moq}. Edit it in View Cart by {product.orderMultiple || product.moq} each time.
            </p>
          </div>

          {/* Payment breakdown card */}
          <div style={{ background: '#F8FAFC', borderRadius: '1rem', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#475569', borderBottom: '1px solid #E2E8F0' }}>
              <span>Payment</span>
              <span>Price</span>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Online Payment</span>
                <span style={{ background: '#E2E8F0', color: '#475569', fontSize: '0.725rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Best</span>
              </div>
              <span style={{ fontWeight: 700 }}>₹{product.onlinePrice || product.basePrice}</span>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
              <span style={{ fontWeight: 600 }}>10-Day Credit</span>
              <span style={{ fontWeight: 700 }}>₹{product.creditPrice || product.basePrice}</span>
            </div>
          </div>

          {/* Product Details Section Card */}
          <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, padding: '1rem 1.25rem', margin: 0, color: '#0F172A', borderBottom: '1px solid #E2E8F0' }}>
              Product Details
            </h3>
            <div style={{ padding: '0.75rem 1.25rem', display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Company</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{product.supplier ? product.supplier.name : 'Verified'}</span>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Packing</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{product.packing || '35 bottle'}</span>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', display: 'grid', gridTemplateColumns: '140px 1fr', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Location</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{product.supplier ? product.supplier.location : 'Surat'}</span>
            </div>
          </div>

          {/* BUSINESS INFORMATION Section Card */}
          <div style={{ background: '#F8FAFC', borderRadius: '1rem', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '0.85rem 1.25rem', fontSize: '0.775rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', borderBottom: '1px solid #E2E8F0' }}>
              BUSINESS INFORMATION
            </div>
            <div style={{ padding: '0.75rem 1.25rem', display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid #E2E8F0', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>GST Rate</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{product.gstRate || '5%'}</span>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', display: 'grid', gridTemplateColumns: '140px 1fr', borderBottom: '1px solid #E2E8F0', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Min. Order</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{product.minOrder || product.moq}</span>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', display: 'grid', gridTemplateColumns: '140px 1fr', fontSize: '0.875rem' }}>
              <span style={{ color: '#64748B' }}>Order Multiple</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{product.orderMultiple || product.moq}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
