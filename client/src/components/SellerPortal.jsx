import React, { useState, useEffect } from 'react';
import {
  Package, ShoppingCart, Zap, MessageSquare, Plus, CheckCircle2,
  XCircle, Truck, Clock, ShieldCheck, ChevronRight, ToggleLeft, ToggleRight
} from 'lucide-react';

export default function SellerPortal({ currentUser, onProductAdded }) {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'challenges' | 'add_product'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Form state for adding new product
  const [newProd, setNewProd] = useState({
    title: '',
    category: 'Textiles',
    basePrice: '',
    unit: 'Meter',
    moq: '500 Meters',
    minOrder: '500 Meters',
    orderMultiple: '50 Meters',
    packing: '100 Meter Roll',
    gstRate: '5%',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800',
    description: '',
    stockQuantity: 10000,
    tier1Qty: '500 - 2000 Meters',
    tier1Price: '',
    tier2Qty: '> 2000 Meters',
    tier2Price: ''
  });

  // State for dispatch modal/input
  const [dispatchInfo, setDispatchInfo] = useState({ orderId: null, ewayBill: '', courier: '' });

  // State for counter offer modal/input
  const [counterInfo, setCounterInfo] = useState({ challengeId: null, price: '', notes: '' });

  const fetchData = () => {
    setLoading(true);
    const sellerName = currentUser && currentUser.businessName ? currentUser.businessName : 'Clonex';

    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch(`/api/orders/seller-orders?supplierName=${encodeURIComponent(sellerName)}`).then(res => res.json()),
      fetch(`/api/challenges/manufacturer?supplierName=${encodeURIComponent(sellerName)}`).then(res => res.json())
    ])
      .then(([prodData, ordData, chlData]) => {
        if (prodData.success) setProducts(prodData.data);
        if (ordData.success) setOrders(ordData.data);
        if (chlData.success) setChallenges(chlData.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Seller data fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Handle in-stock toggle
  const handleToggleStock = async (productId, currentStatus) => {
    try {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p._id === productId ? { ...p, inStock: !currentStatus } : p));
        setToast(`Stock status updated to ${!currentStatus ? 'In Stock' : 'Out of Stock'}!`);
        setTimeout(() => setToast(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle create product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProd.title || !newProd.basePrice) {
      alert('Please fill in title and base price.');
      return;
    }

    const payload = {
      ...newProd,
      supplierName: currentUser && currentUser.businessName ? currentUser.businessName : 'Clonex Manufacturing',
      location: currentUser && currentUser.address ? `${currentUser.address.city}, ${currentUser.address.state}` : 'Surat, Gujarat',
      tiers: [
        { qtyRange: newProd.tier1Qty || `500 - 2000 ${newProd.unit}`, price: Number(newProd.tier1Price || newProd.basePrice) },
        { qtyRange: newProd.tier2Qty || `> 2000 ${newProd.unit}`, price: Number(newProd.tier2Price || Math.round(newProd.basePrice * 0.95)) }
      ]
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setToast('Wholesale product published successfully to marketplace!');
        setTimeout(() => setToast(''), 4000);
        setActiveTab('products');
        fetchData();
        if (onProductAdded) onProductAdded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle update order status
  const handleUpdateOrderStatus = async (orderId, newStatus, extra = {}) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ewayBillNumber: extra.ewayBill,
          courierName: extra.courier,
          updatedBy: currentUser ? currentUser.name : 'Manufacturer'
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast(`Order updated to ${newStatus}!`);
        setTimeout(() => setToast(''), 3000);
        setDispatchInfo({ orderId: null, ewayBill: '', courier: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle challenge response (Accept, Counter, Decline)
  const handleChallengeAction = async (challengeId, action, extra = {}) => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          counterOfferPrice: extra.price,
          notes: extra.notes,
          manufacturerName: currentUser && currentUser.businessName ? currentUser.businessName : 'Clonex'
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast(`Challenge proposal ${action.toLowerCase()}ed!`);
        setTimeout(() => setToast(''), 3000);
        setCounterInfo({ challengeId: null, price: '', notes: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0F3B9A, #0E2F6F)', borderRadius: '1.25rem', padding: '1.75rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(15, 59, 154, 0.2)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> Verified Manufacturer Portal
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>
            {currentUser && currentUser.businessName ? currentUser.businessName : 'Clonex Manufacturing & Mills'}
          </h1>
          <p style={{ color: '#BFDBFE', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            GSTIN: 24AAACA1234A1Z0 | Location: Surat, Gujarat | Pan-India Wholesale Supply
          </p>
        </div>

        <button
          onClick={() => setActiveTab('add_product')}
          style={{ background: '#00A3FF', color: 'white', border: 'none', padding: '0.65rem 1.35rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(0,163,255,0.4)' }}
        >
          <Plus size={18} /> Add New Wholesale Product
        </button>
      </div>

      {toast && (
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.75rem 1.25rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
          🎉 {toast}
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.85rem' }}>
            <span>Active Products</span>
            <Package size={18} style={{ color: '#00A3FF' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
            {products.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>All listed with tiered rates</span>
        </div>

        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.85rem' }}>
            <span>Incoming Orders</span>
            <ShoppingCart size={18} style={{ color: '#10B981' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
            {orders.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Escrow-protected purchases</span>
        </div>

        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.85rem' }}>
            <span>Pending Challenges</span>
            <Zap size={18} style={{ color: '#F59E0B' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
            {challenges.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600 }}>Awaiting manufacturer response</span>
        </div>

        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.85rem' }}>
            <span>Escrow Held Funds</span>
            <ShieldCheck size={18} style={{ color: '#0F3B9A' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem' }}>
            ₹{orders.filter(o => o.orderStatus !== 'CANCELLED' && o.orderStatus !== 'DELIVERED').reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Released on buyer receipt</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{ padding: '0.65rem 1.25rem', border: 'none', background: 'none', borderBottom: `2.5px solid ${activeTab === 'products' ? '#00A3FF' : 'transparent'}`, color: activeTab === 'products' ? '#00A3FF' : '#64748B', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Package size={17} /> Product Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{ padding: '0.65rem 1.25rem', border: 'none', background: 'none', borderBottom: `2.5px solid ${activeTab === 'orders' ? '#00A3FF' : 'transparent'}`, color: activeTab === 'orders' ? '#00A3FF' : '#64748B', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ShoppingCart size={17} /> Incoming Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('challenges')}
          style={{ padding: '0.65rem 1.25rem', border: 'none', background: 'none', borderBottom: `2.5px solid ${activeTab === 'challenges' ? '#00A3FF' : 'transparent'}`, color: activeTab === 'challenges' ? '#00A3FF' : '#64748B', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Zap size={17} /> Rate Challenges ({challenges.length})
        </button>

        <button
          onClick={() => setActiveTab('add_product')}
          style={{ padding: '0.65rem 1.25rem', border: 'none', background: 'none', borderBottom: `2.5px solid ${activeTab === 'add_product' ? '#00A3FF' : 'transparent'}`, color: activeTab === 'add_product' ? '#00A3FF' : '#64748B', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={17} /> Publish Product
        </button>
      </div>

      {/* Tab 1: Products List */}
      {activeTab === 'products' && (
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Manufacturer Inventory & Listed Catalog
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Live on pan-India marketplace</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {products.map(p => (
              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '0.85rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{ width: '60px', height: '60px', borderRadius: '0.5rem', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&q=80&w=300';
                    }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{p.title}</h4>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Category: <strong>{p.category}</strong> | Base Rate: ₹{p.basePrice}/{p.unit} | MOQ: {p.minOrder || p.moq} | GST: {p.gstRate}
                    </div>
                    {p.tiers && p.tiers.length > 0 && (
                      <div style={{ fontSize: '0.725rem', color: '#0F3B9A', marginTop: '0.2rem' }}>
                        Tiers: {p.tiers.map(t => `${t.qtyRange}: ₹${t.price}`).join(' • ')}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {/* Stock Toggle */}
                  <button
                    onClick={() => handleToggleStock(p._id, p.inStock !== false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: p.inStock !== false ? '#10B981' : '#EF4444' }}
                  >
                    {p.inStock !== false ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    <span>{p.inStock !== false ? 'In Stock' : 'Out of Stock'}</span>
                  </button>

                  <span style={{ fontSize: '0.8rem', color: '#64748B', background: '#F1F5F9', padding: '0.3rem 0.6rem', borderRadius: '6px' }}>
                    Pack: {p.packing}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Incoming Orders */}
      {activeTab === 'orders' && (
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.25rem' }}>
            Incoming Wholesale Orders Assigned to You ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
              No incoming orders currently. When buyers place orders, they will show up here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(ord => (
                <div key={ord._id} style={{ border: '1px solid #E2E8F0', borderRadius: '0.85rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F3B9A' }}>#{ord.orderNumber}</span>
                        <span className="badge-unit">{ord.orderStatus ? ord.orderStatus.replace('_', ' ') : 'ORDER PLACED'}</span>
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                          Escrow: {ord.escrowStatus || 'HELD'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                        Buyer: <strong>{ord.buyerName}</strong> ({ord.buyerPhone}) | Delivery: {ord.shippingAddress ? `${ord.shippingAddress.city}, ${ord.shippingAddress.state}` : 'Surat'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Deal Amount</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                        ₹{Math.round(ord.totalAmount).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Payment: {ord.paymentMethod}</div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {ord.items && ord.items.map((it, idx) => (
                      <span key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                        {it.title} × <strong>{it.quantity} {it.unit}</strong> (@ ₹{it.unitPrice}/{it.unit})
                      </span>
                    ))}
                  </div>

                  {/* Fulfillment Action Pipeline */}
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      {ord.ewayBillNumber && <span>E-Way Bill: <strong>{ord.ewayBillNumber}</strong> | </span>}
                      {ord.courierName && <span>Courier: <strong>{ord.courierName}</strong></span>}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {ord.orderStatus === 'ORDER_PLACED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord._id, 'MANUFACTURER_ACCEPTED')}
                          style={{ background: '#00A3FF', color: 'white', border: 'none', padding: '0.45rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Accept Order
                        </button>
                      )}

                      {ord.orderStatus === 'MANUFACTURER_ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord._id, 'PROCESSING')}
                          style={{ background: '#0F3B9A', color: 'white', border: 'none', padding: '0.45rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Mark Processing
                        </button>
                      )}

                      {ord.orderStatus === 'PROCESSING' && (
                        dispatchInfo.orderId === ord._id ? (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="E-Way Bill #"
                              value={dispatchInfo.ewayBill}
                              onChange={e => setDispatchInfo({ ...dispatchInfo, ewayBill: e.target.value })}
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            />
                            <input
                              type="text"
                              placeholder="Courier / Transporter"
                              value={dispatchInfo.courier}
                              onChange={e => setDispatchInfo({ ...dispatchInfo, courier: e.target.value })}
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            />
                            <button
                              onClick={() => handleUpdateOrderStatus(ord._id, 'DISPATCHED', dispatchInfo)}
                              style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Confirm Dispatch
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDispatchInfo({ orderId: ord._id, ewayBill: 'EWB-24987123', courier: 'Surat Cargo Express' })}
                            style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.45rem 1rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Truck size={14} /> Dispatch with E-Way Bill
                          </button>
                        )
                      )}

                      {ord.orderStatus === 'DISPATCHED' && (
                        <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={15} /> In Transit (Awaiting Buyer Receipt)
                        </span>
                      )}

                      {ord.orderStatus === 'DELIVERED' && (
                        <span style={{ fontSize: '0.8rem', color: '#0F3B9A', fontWeight: 800 }}>
                          ✔ Delivered & Escrow Released
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Incoming Challenges */}
      {activeTab === 'challenges' && (
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.25rem' }}>
            Incoming Wholesale Rate Challenges ({challenges.length})
          </h3>

          {challenges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>
              No active rate challenge proposals at this time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {challenges.map(chl => (
                <div key={chl._id} style={{ border: '1px solid #E2E8F0', borderRadius: '0.85rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: '#0F3B9A' }}>{chl.challengeId}</span>
                        <span className="badge-unit">{chl.status}</span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0.3rem 0 0.1rem' }}>{chl.productTitle}</h4>
                      <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
                        Buyer: <strong>{chl.buyerName}</strong> ({chl.buyerEmail}) | Timeline: {chl.expectedDeliveryTimeline}
                      </div>
                      {chl.notes && <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '0.3rem', fontStyle: 'italic' }}>Buyer Note: "{chl.notes}"</div>}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Requested Volume</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                        {chl.requestedQuantity.toLocaleString('en-IN')} {chl.unit}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#00A3FF', fontWeight: 700 }}>
                        Proposed: ₹{chl.proposedPrice}/{chl.unit} (Listed: ₹{chl.listedPrice})
                      </div>
                    </div>
                  </div>

                  {/* Counter Form */}
                  {counterInfo.challengeId === chl._id ? (
                    <div style={{ marginTop: '1rem', background: '#FEF3C7', padding: '0.85rem', borderRadius: '0.65rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400E', marginBottom: '0.5rem' }}>
                        Make Counter-Offer to Buyer
                      </div>
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Counter Price (₹)"
                          value={counterInfo.price}
                          onChange={e => setCounterInfo({ ...counterInfo, price: e.target.value })}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Note e.g. Can do ₹1.90 with minimum 1000 order"
                          value={counterInfo.notes}
                          onChange={e => setCounterInfo({ ...counterInfo, notes: e.target.value })}
                          style={{ flex: 1, minWidth: '200px', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                        />
                        <button
                          onClick={() => handleChallengeAction(chl._id, 'COUNTER', counterInfo)}
                          style={{ background: '#D97706', color: 'white', border: 'none', padding: '0.45rem 1rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          Send Counter-Offer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      {(chl.status === 'SUBMITTED' || chl.status === 'UNDER_REVIEW') && (
                        <>
                          <button
                            onClick={() => handleChallengeAction(chl._id, 'ACCEPT')}
                            style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.45rem 1.1rem', borderRadius: '9999px', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Accept Target Rate
                          </button>
                          <button
                            onClick={() => setCounterInfo({ challengeId: chl._id, price: chl.proposedPrice * 1.05, notes: '' })}
                            style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '0.45rem 1.1rem', borderRadius: '9999px', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Counter-Offer
                          </button>
                          <button
                            onClick={() => handleChallengeAction(chl._id, 'DECLINE')}
                            style={{ background: '#F1F5F9', color: '#EF4444', border: '1px solid #CBD5E1', padding: '0.45rem 0.9rem', borderRadius: '9999px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {(chl.status === 'ACCEPTED' || chl.status === 'BUYER_ACCEPTED') && (
                        <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 800 }}>
                          ✔ Deal Negotiated & Ready for Checkout
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Add New Product Form */}
      {activeTab === 'add_product' && (
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.25rem' }}>
            Publish New B2B Wholesale Product
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Configure Minimum Order Quantities (MOQ), tiered pricing breaks, and packing specifications.
          </p>

          <form onSubmit={handleCreateProduct}>
            <div className="form-group">
              <label className="form-label">Product Title</label>
              <input
                type="text"
                required
                placeholder="e.g. 100% Combed Grey Cotton Yarn 30s Count"
                className="form-input"
                value={newProd.title}
                onChange={e => setNewProd({ ...newProd, title: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={newProd.category}
                  onChange={e => setNewProd({ ...newProd, category: e.target.value })}
                >
                  <option value="Textiles">Textiles & Garments</option>
                  <option value="Agro & Beverages">Agro & Beverages (Water, Juices)</option>
                  <option value="Supari & Agro">Supari, Spices & Agro</option>
                  <option value="Agro & Fertilizer">Bio-Fertilizer & Agro Chemicals</option>
                  <option value="Chemicals & Polymers">Chemicals & Plastic Polymers</option>
                  <option value="Industrial Electronics">Solar & Electronics</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Unit of Measure</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. bottle, Meter, Kg, Bag"
                  className="form-input"
                  value={newProd.unit}
                  onChange={e => setNewProd({ ...newProd, unit: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Base Price (₹ / unit)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 120"
                  className="form-input"
                  value={newProd.basePrice}
                  onChange={e => setNewProd({ ...newProd, basePrice: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">MOQ (Minimum Order)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 Meters"
                  className="form-input"
                  value={newProd.minOrder}
                  onChange={e => setNewProd({ ...newProd, minOrder: e.target.value, moq: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Order Increment (Step)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 Meters"
                  className="form-input"
                  value={newProd.orderMultiple}
                  onChange={e => setNewProd({ ...newProd, orderMultiple: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Packaging Unit</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Meter Roll or 35 bottle crate"
                  className="form-input"
                  value={newProd.packing}
                  onChange={e => setNewProd({ ...newProd, packing: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Applicable GST Rate</label>
                <select
                  className="form-input"
                  value={newProd.gstRate}
                  onChange={e => setNewProd({ ...newProd, gstRate: e.target.value })}
                >
                  <option value="5%">5% (Agro, Textiles, Raw Materials)</option>
                  <option value="12%">12% (Processed items, Bio-fertilizer)</option>
                  <option value="18%">18% (Industrial goods, Chemicals)</option>
                  <option value="28%">28% (Luxury & Special items)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={newProd.image}
                onChange={e => setNewProd({ ...newProd, image: e.target.value })}
              />
            </div>

            {/* Pricing Tiers configuration */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F3B9A', marginBottom: '0.5rem' }}>
                Wholesale Tiered Volume Discounts
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Tier 1 Bracket (e.g. 500 - 2000 Meters)"
                  className="form-input"
                  value={newProd.tier1Qty}
                  onChange={e => setNewProd({ ...newProd, tier1Qty: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Tier 1 Price (₹)"
                  className="form-input"
                  value={newProd.tier1Price}
                  onChange={e => setNewProd({ ...newProd, tier1Price: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Tier 2 Bracket (e.g. > 2000 Meters)"
                  className="form-input"
                  value={newProd.tier2Qty}
                  onChange={e => setNewProd({ ...newProd, tier2Qty: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Tier 2 Price (₹)"
                  className="form-input"
                  value={newProd.tier2Price}
                  onChange={e => setNewProd({ ...newProd, tier2Price: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
            >
              Publish Wholesale Listing Live
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
