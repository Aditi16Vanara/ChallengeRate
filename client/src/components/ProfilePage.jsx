import React, { useState, useEffect } from 'react';
import { User, Building2, MapPin, ShieldCheck, FileText, LogOut, CreditCard, Wallet, Edit3, Save, CheckCircle2 } from 'lucide-react';

export default function ProfilePage({ currentUser, onOpenAuth, onRoleSwitch }) {
  const [profile, setProfile] = useState(currentUser || { name: 'Aditi Vanara', email: 'aditi@business.com', role: 'buyer' });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    businessName: profile.businessName || 'Aditi Commercial Traders',
    gstin: profile.gstin || '24AAACA1234A1Z0',
    phone: profile.phone || '+91 98765 43210',
    street: profile.address ? profile.address.street : 'G-30, Meridian Business Center, Lajamni Chowk',
    city: profile.address ? profile.address.city : 'Surat',
    state: profile.address ? profile.address.state : 'Gujarat',
    pincode: profile.address ? profile.address.pincode : '394101'
  });
  const [toast, setToast] = useState('');

  const token = localStorage.getItem('cr_token');

  const fetchProfile = () => {
    if (!token) return;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setProfile(data.user);
          setEditForm({
            businessName: data.user.businessName || 'Aditi Commercial Traders',
            gstin: data.user.gstin || '24AAACA1234A1Z0',
            phone: data.user.phone || '+91 98765 43210',
            street: data.user.address ? data.user.address.street : 'G-30, Meridian Business Center, Lajamni Chowk',
            city: data.user.address ? data.user.address.city : 'Surat',
            state: data.user.address ? data.user.address.state : 'Gujarat',
            pincode: data.user.address ? data.user.address.pincode : '394101'
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: editForm.businessName,
          gstin: editForm.gstin,
          phone: editForm.phone,
          address: {
            street: editForm.street,
            city: editForm.city,
            state: editForm.state,
            pincode: editForm.pincode
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        setToast('Business profile updated successfully!');
        setTimeout(() => setToast(''), 3000);
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const name = profile.name || 'Aditi Vanara';
  const email = profile.email || 'aditi@business.com';
  const role = profile.role || 'buyer';

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Profile Header Card */}
      <div style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid #E2E8F0', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #21A3FF, #0F3B9A)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.75rem', textTransform: 'uppercase' }}>
            {name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{name}</h1>
              <span style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '9999px', textTransform: 'uppercase' }}>
                Role: {role}
              </span>
              <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} /> KYC Verified Merchant
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>{email} • {editForm.phone}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onRoleSwitch && (
            <button
              onClick={() => onRoleSwitch(role === 'buyer' ? 'supplier' : 'buyer')}
              style={{ background: '#EFF6FF', color: '#00A3FF', border: '1px solid #BFDBFE', padding: '0.55rem 1.1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.825rem', cursor: 'pointer' }}
            >
              Switch to {role === 'buyer' ? 'Manufacturer' : 'Buyer'} View
            </button>
          )}

          <button
            onClick={onOpenAuth}
            style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', padding: '0.55rem 1.15rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.825rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogOut size={15} /> Switch / Login
          </button>
        </div>
      </div>

      {toast && (
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.75rem 1.25rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
          🎉 {toast}
        </div>
      )}

      {/* Account Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Business Profile */}
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0F3B9A' }}>
              <Building2 size={20} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Business Details</h3>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{ background: 'none', border: 'none', color: '#00A3FF', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Edit3 size={14} /> {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Firm / Business Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.businessName}
                  onChange={e => setEditForm({ ...editForm, businessName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">GSTIN</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.gstin}
                  onChange={e => setEditForm({ ...editForm, gstin: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ justifyContent: 'center', padding: '0.6rem', marginTop: '0.5rem' }}
              >
                <Save size={15} /> Save Changes
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Firm Name</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{editForm.businessName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>GSTIN</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{editForm.gstin}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#64748B' }}>Trade Role</span>
                <span style={{ fontWeight: 600, color: '#0F172A', textTransform: 'capitalize' }}>{role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Contact Number</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{editForm.phone}</span>
              </div>
            </div>
          )}
        </div>

        {/* Primary Delivery Warehouse */}
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0F3B9A' }}>
            <MapPin size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Default Delivery Warehouse</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>
            {editForm.street},<br />
            {editForm.city}, {editForm.state} {editForm.pincode}, India
          </p>
          <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={16} /> Verified Pan-India Freight Unloading Site
          </div>
        </div>

        {/* B2B Trade Terms & Credit */}
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0F3B9A' }}>
            <FileText size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Trade Credit & Escrow Status</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>10-Day Credit Limit</span>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>₹{profile.creditLimit ? profile.creditLimit.toLocaleString('en-IN') : '50,000'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Available Credit</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>
                ₹{Math.max(0, (profile.creditLimit || 50000) - (profile.creditUsed || 0)).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>GST Certificate Verification</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>Approved ✔</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Escrow Holding Account</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>Active (Protected) ✔</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
