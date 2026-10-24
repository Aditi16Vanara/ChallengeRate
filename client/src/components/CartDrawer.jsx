import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus, AlertCircle } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout
}) {
  if (!isOpen) return null;

  // Helper to extract numeric step / MOQ from strings like "35 bottle", "1000 Meters", or numbers
  const extractStep = (val, defaultVal = 1) => {
    if (typeof val === 'number') return val;
    if (!val) return defaultVal;
    const match = String(val).replace(/,/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : defaultVal;
  };

  // Helper to calculate tier price client-side for immediate responsive feedback
  const getClientTierPrice = (item, qty) => {
    if (!item.tiers || item.tiers.length === 0) return item.basePrice || 1;
    for (const tier of item.tiers) {
      if (!tier.qtyRange) continue;
      const str = tier.qtyRange.replace(/,/g, '');
      if (str.includes('>')) {
        const m = str.match(/>\s*(\d+)/);
        if (m && qty > parseInt(m[1], 10)) {
          return tier.price;
        }
      } else if (str.includes('-')) {
        const m = str.match(/(\d+)\s*-\s*(\d+)/);
        if (m) {
          const min = parseInt(m[1], 10);
          const max = parseInt(m[2], 10);
          if (qty >= min && qty <= max) {
            return tier.price;
          }
        }
      }
    }
    return item.basePrice || 1;
  };

  // Calculate totals
  let subtotal = 0;
  let gstTotal = 0;

  const enrichedItems = cartItems.map((item) => {
    const qty = item.quantity;
    const unitPrice = getClientTierPrice(item, qty);
    const itemSub = unitPrice * qty;
    const gstRateNum = extractStep(item.gstRate, 5);
    const itemGst = (itemSub * gstRateNum) / 100;
    subtotal += itemSub;
    gstTotal += itemGst;

    return {
      ...item,
      currentUnitPrice: unitPrice,
      itemSubtotal: itemSub,
      itemGst,
      itemTotal: itemSub + itemGst
    };
  });

  const grandTotal = subtotal + gstTotal;

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: '#E0F2FE', color: '#0284C7', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex' }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Wholesale Cart ({cartItems.length})
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>B2B Minimum Order Quantities Enforced</span>
            </div>
          </div>
          <button className="cart-close-btn" onClick={onClose} title="Close Cart">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <ShoppingBag size={48} style={{ color: '#94A3B8', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>Your wholesale cart is empty</h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', maxWidth: '280px', margin: '0.5rem auto 1.5rem' }}>
                Add bulk items from verified Indian manufacturers to begin order placement.
              </p>
              <button
                className="btn-primary"
                onClick={onClose}
                style={{ padding: '0.6rem 1.5rem' }}
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Order Items</span>
                <button
                  onClick={onClearCart}
                  style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Trash2 size={13} /> Clear All
                </button>
              </div>

              {enrichedItems.map((item) => {
                const step = extractStep(item.orderMultiple || item.moq, 1);
                const moqNum = extractStep(item.minOrder || item.moq, 1);

                return (
                  <div key={item._id} className="cart-item-card">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="cart-item-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&q=80&w=300';
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                          {item.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item._id)}
                          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.2rem' }}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.2rem' }}>
                        Supplier: <strong style={{ color: '#0F3B9A' }}>{item.supplier ? item.supplier.name : 'Verified'}</strong>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                        <span className="badge-unit">Pack: {item.packing || 'Bulk'}</span>
                        <span className="badge-tier">Tier Price: ₹{item.currentUnitPrice} / {item.unit || 'Unit'}</span>
                        <span className="badge-gst">GST: {item.gstRate || '5%'}</span>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <div className="stepper-box">
                          <button
                            className="stepper-btn"
                            disabled={item.quantity <= moqNum}
                            onClick={() => onUpdateQuantity(item._id, item.quantity - step)}
                            title={`Decrease by ${step}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="stepper-value">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            className="stepper-btn"
                            onClick={() => onUpdateQuantity(item._id, item.quantity + step)}
                            title={`Increase by ${step}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            Subtotal: ₹{Math.round(item.itemSubtotal).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                            ₹{Math.round(item.itemTotal).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.3rem' }}>
                        MOQ: {item.minOrder || item.moq} | Step: +{step} each time
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer with Totals & Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Subtotal (Excl. Tax)</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Estimated GST</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{Math.round(gstTotal).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Shipping & Transport</span>
                <span style={{ fontWeight: 600, color: '#10B981' }}>Standard Freight Included</span>
              </div>
              <div style={{ height: '1px', background: '#E2E8F0', margin: '0.4rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                <span>Total Payable</span>
                <span style={{ color: '#00A3FF' }}>₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', color: '#64748B', marginBottom: '0.75rem' }}>
              <ShieldCheck size={16} style={{ color: '#10B981' }} />
              <span>Payments held in ChallengeRate Escrow until verified delivery</span>
            </div>

            <button
              className="btn-checkout"
              onClick={() => {
                onClose();
                onProceedToCheckout(enrichedItems, subtotal, gstTotal, grandTotal);
              }}
            >
              <span>Proceed to B2B Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
