import React, { useState } from 'react';
import { X, Lock, Mail, User, Building, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    gstin: '',
    role: 'buyer'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        if (data.token) {
          localStorage.setItem('cr_token', data.token);
        }
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.message || 'Authentication failed');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to connect to backend server');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem', color: '#0F3B9A' }}>
          {isRegister ? 'Create ChallengeRate Account' : 'Login to ChallengeRate'}
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {isRegister ? 'Join India\'s premier B2B wholesale network' : 'Enter your credentials to access B2B pricing'}
        </p>

        {errorMsg && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.6rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Evaluation Login Switcher */}
        {!isRegister && (
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: '#F8FAFC', borderRadius: '0.75rem', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
              Quick Evaluation Credentials
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, email: 'aditi@gmail.com', password: 'Password123!' });
                }}
                style={{
                  background: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#1D4ED8',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🛒 Buyer Account
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#60A5FA' }}>aditi@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, email: 'seller@clonex.com', password: 'Password123!' });
                }}
                style={{
                  background: '#FEF3C7',
                  border: '1.5px solid #FDE68A',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#92400E',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🏭 Manufacturer Account
                <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#D97706' }}>seller@clonex.com</div>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              {/* Role Picker */}
              <div className="form-group">
                <label className="form-label">I want to register as:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'buyer' })}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '0.5rem',
                      border: `1.5px solid ${formData.role === 'buyer' ? '#00A3FF' : '#E2E8F0'}`,
                      background: formData.role === 'buyer' ? '#EFF6FF' : 'white',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: formData.role === 'buyer' ? '#0F3B9A' : '#64748B',
                      cursor: 'pointer'
                    }}
                  >
                    Wholesale Buyer
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'supplier' })}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '0.5rem',
                      border: `1.5px solid ${formData.role === 'supplier' ? '#00A3FF' : '#E2E8F0'}`,
                      background: formData.role === 'supplier' ? '#EFF6FF' : 'white',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: formData.role === 'supplier' ? '#0F3B9A' : '#64748B',
                      cursor: 'pointer'
                    }}
                  >
                    Manufacturer
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name / Contact Person</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ramesh Patel"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="buyer@business.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Business / Firm Name (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Patel Enterprises Surat"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GSTIN (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="24AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            style={{ color: '#21A3FF', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </span>
        </div>
      </div>
    </div>
  );
}
