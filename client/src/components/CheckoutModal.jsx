import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CreditCard, Wallet, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  currentUser,
  onOrderSuccess
}) {
  if (!isOpen || !items || items.length === 0) return null;

  const [shippingAddress, setShippingAddress] = useState({
    recipientName: currentUser ? currentUser.name : 'Aditi Vanara',
    phone: currentUser ? (currentUser.phone || '+91 98765 43210') : '+91 98765 43210',
    street: currentUser && currentUser.address ? currentUser.address.street : 'G-30, Meridian Business Center, Lajamni Chowk',
    city: currentUser && currentUser.address ? currentUser.address.city : 'Surat',
    state: currentUser && currentUser.address ? currentUser.address.state : 'Gujarat',
    pincode: currentUser && currentUser.address ? currentUser.address.pincode : '394101'
  });

  const [gstin, setGstin] = useState(currentUser ? (currentUser.gstin || '24AAACA1234A1Z0') : '24AAACA1234A1Z0');
  const [businessName, setBusinessName] = useState(currentUser ? (currentUser.businessName || 'Aditi Commercial Traders') : 'Aditi Commercial Traders');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // 'ONLINE' | 'CREDIT_10_DAYS' | 'WALLET'

  const [walletInfo, setWalletInfo] = useState({ balance: 12500, credit: { limit: 50000, used: 0, available: 50000 } });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [serverValidated, setServerValidated] = useState(null);

  // Validate cart on server when modal opens
  useEffect(() => {
    let isMounted = true;
    const payload = {
      items: items.map(i => ({
        productId: i._id,
        quantity: i.quantity,
        title: i.title,
        unitPrice: i.currentUnitPrice || i.basePrice,
        isNegotiated: !!i.isNegotiated
      }))
    };

    fetch('/api/products/validate-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success) {
          setServerValidated(data);
        } else if (isMounted && data.message) {
          setErrorMsg(data.message);
        }
      })
      .catch(err => {
        console.error('Cart validation error:', err);
      });

    // Fetch live wallet and credit limits
    const userEmail = currentUser ? currentUser.email : 'aditi@business.com';
    fetch(`/api/wallet?userEmail=${encodeURIComponent(userEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success) {
          setWalletInfo({
            balance: data.balance || 0,
            credit: data.credit || { limit: 50000, used: 0, available: 50000 }
          });
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [items]);

  const subtotal = serverValidated ? serverValidated.subtotal : items.reduce((acc, i) => acc + (i.itemSubtotal || (i.basePrice * i.quantity)), 0);
  const gstTotal = serverValidated ? serverValidated.gstTotal : items.reduce((acc, i) => acc + (i.itemGst || 0), 0);
  const grandTotal = serverValidated ? serverValidated.totalAmount : (subtotal + gstTotal);

  const availableCredit = walletInfo.credit.available;
  const isCreditEligible = grandTotal <= availableCredit;
  const isWalletEligible = grandTotal <= walletInfo.balance;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (paymentMethod === 'CREDIT_10_DAYS' && !isCreditEligible) {
      setErrorMsg(`Order total (₹${grandTotal}) exceeds your available 10-day credit limit (₹${availableCredit}).`);
      return;
    }

    if (paymentMethod === 'WALLET' && !isWalletEligible) {
      setErrorMsg(`Insufficient wallet balance (Available: ₹${walletInfo.balance}). Please choose another payment method or top up.`);
      return;
    }

    setLoading(true);

    const orderPayload = {
      buyerId: currentUser ? currentUser.id : undefined,
      buyerName: shippingAddress.recipientName,
      buyerEmail: currentUser ? currentUser.email : 'aditi@business.com',
      buyerPhone: shippingAddress.phone,
      items: items.map(i => ({
        productId: i._id,
        quantity: i.quantity,
        title: i.title,
        unitPrice: i.currentUnitPrice || i.basePrice,
        isNegotiated: !!i.isNegotiated
      })),
      shippingAddress,
      gstin,
      paymentMethod
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        onOrderSuccess(data.data);
        onClose();
      } else {
        setErrorMsg(data.message || data.error || 'Failed to place order.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error connecting to order service.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="checkout-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Confirm Wholesale Checkout
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Direct Manufacturer Purchase with Escrow Protection
            </span>
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

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* Left Column: Delivery Address & Business Details */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                1. Delivery & Unloading Warehouse
              </h3>

              <div className="form-group">
                <label className="form-label">Contact Person Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={shippingAddress.recipientName}
                  onChange={e => setShippingAddress({ ...shippingAddress, recipientName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone / WhatsApp for Freight Dispatch</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={shippingAddress.phone}
                  onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Address / Street</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={shippingAddress.street}
                  onChange={e => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={shippingAddress.city}
                    onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={shippingAddress.state}
                    onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PIN</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={shippingAddress.pincode}
                    onChange={e => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                  />
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginTop: '1rem', marginBottom: '0.75rem' }}>
                2. Business GST Billing
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Firm Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GSTIN (Optional / Tax Input)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={gstin}
                    onChange={e => setGstin(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Payment Method */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                3. Order Items Summary ({items.length})
              </h3>

              <div style={{ maxHeight: '180px', overflowY: 'auto', background: '#F8FAFC', borderRadius: '0.75rem', padding: '0.75rem', border: '1px solid #E2E8F0', marginBottom: '1rem' }}>
                {items.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #EEF2F6', fontSize: '0.825rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{item.title}</div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem' }}>
                        Qty: {item.quantity} {item.unit} | Tier: ₹{item.currentUnitPrice || item.basePrice}/{item.unit}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>
                      ₹{Math.round(item.itemTotal || ((item.currentUnitPrice || item.basePrice) * item.quantity)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                4. Select B2B Payment Term
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {/* Option 1: Online Escrow */}
                <label
                  style={{
                    border: `1.5px solid ${paymentMethod === 'ONLINE' ? '#00A3FF' : '#E2E8F0'}`,
                    background: paymentMethod === 'ONLINE' ? '#F0F9FF' : 'white',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CreditCard size={16} /> Online Payment (Escrow Protected)
                      <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Recommended</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Pay via UPI, NEFT/RTGS, or NetBanking (Sandbox Simulated)
                    </div>
                  </div>
                </label>

                {/* Option 2: 10-Day Credit */}
                <label
                  style={{
                    border: `1.5px solid ${paymentMethod === 'CREDIT_10_DAYS' ? '#00A3FF' : '#E2E8F0'}`,
                    background: paymentMethod === 'CREDIT_10_DAYS' ? '#F0F9FF' : 'white',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    opacity: isCreditEligible ? 1 : 0.7
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_10_DAYS"
                    checked={paymentMethod === 'CREDIT_10_DAYS'}
                    onChange={() => setPaymentMethod('CREDIT_10_DAYS')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={16} /> 10-Day Trade Credit
                      <span style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>B2B Term</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: isCreditEligible ? '#64748B' : '#DC2626' }}>
                      Available Credit: ₹{availableCredit.toLocaleString('en-IN')} / ₹{walletInfo.credit.limit.toLocaleString('en-IN')}
                      {!isCreditEligible && ' (Exceeded limit)'}
                    </div>
                  </div>
                </label>

                {/* Option 3: Wallet */}
                <label
                  style={{
                    border: `1.5px solid ${paymentMethod === 'WALLET' ? '#00A3FF' : '#E2E8F0'}`,
                    background: paymentMethod === 'WALLET' ? '#F0F9FF' : 'white',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="WALLET"
                    checked={paymentMethod === 'WALLET'}
                    onChange={() => setPaymentMethod('WALLET')}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Wallet size={16} /> B2B Escrow Wallet
                    </div>
                    <div style={{ fontSize: '0.75rem', color: isWalletEligible ? '#64748B' : '#DC2626' }}>
                      Balance: ₹{walletInfo.balance.toLocaleString('en-IN')}
                      {!isWalletEligible && ' (Insufficient balance)'}
                    </div>
                  </div>
                </label>
              </div>

              {/* Price Calculation Box */}
              <div style={{ background: '#F8FAFC', borderRadius: '0.75rem', padding: '0.85rem', border: '1px solid #E2E8F0', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: '0.3rem' }}>
                  <span>Wholesale Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: '0.3rem' }}>
                  <span>GST Taxes</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{Math.round(gstTotal).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '1px', background: '#E2E8F0', margin: '0.4rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                  <span style={{ color: '#0F172A' }}>Total Amount</span>
                  <span style={{ color: '#00A3FF' }}>₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-checkout"
                style={{ width: '100%', padding: '0.85rem' }}
              >
                {loading ? 'Validating & Placing Order...' : `Confirm & Place Order (₹${Math.round(grandTotal).toLocaleString('en-IN')})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
