import React, { useState } from 'react';
import { Wallet, PlusCircle, ArrowDownLeft, ShieldCheck, History } from 'lucide-react';

export default function WalletPage({ currentUser }) {
  const [balance, setBalance] = useState(0);
  const [addAmount, setAddAmount] = useState('');
  const [toast, setToast] = useState('');

  const handleAddFunds = (e) => {
    e.preventDefault();
    const val = parseFloat(addAmount);
    if (!val || val <= 0) return;
    setBalance(prev => prev + val);
    setAddAmount('');
    setToast(`Successfully added ₹${val} to your B2B Wallet!`);
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div style={{ maxW: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Page Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#FEF3C7', color: '#D97706', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center' }}>
          <Wallet size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>B2B Escrow Wallet</h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>Instant payments, credit limits, and escrow security for wholesale orders.</p>
        </div>
      </div>

      {toast && (
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.75rem 1.25rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
          🎉 {toast}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: '2rem' }}>
        {/* Wallet Balance Card */}
        <div style={{ background: 'linear-gradient(135deg, #0F3B9A, #0E2F6F)', color: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 25px rgba(15, 59, 154, 0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#93C5FD', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AVAILABLE BALANCE</span>
              <ShieldCheck size={20} style={{ color: '#60A5FA' }} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.75rem 0' }}>
              ₹{balance.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#BFDBFE' }}>
              100% Escrow Protected for ChallengeRate Manufacturers
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <div>
              <div style={{ color: '#93C5FD' }}>Active Account</div>
              <div style={{ fontWeight: 700 }}>{currentUser ? currentUser.name : 'Aditi (Buyer)'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#93C5FD' }}>KYC Status</div>
              <div style={{ fontWeight: 700, color: '#34D399' }}>Verified ✔</div>
            </div>
          </div>
        </div>

        {/* Add Funds Form & Options */}
        <div style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>Add Funds to Wallet</h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Top up using UPI, NetBanking, NEFT/RTGS, or Corporate Credit Card.</p>

          <form onSubmit={handleAddFunds}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>Enter Amount (₹)</label>
              <input
                type="number"
                placeholder="5000"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #CBD5E1', fontSize: '1rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {['1000', '5000', '10000', '50000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAddAmount(amt)}
                  style={{ flex: 1, padding: '0.4rem', border: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <button
              type="submit"
              style={{ width: '100%', background: '#00A3FF', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <PlusCircle size={18} />
              <span>Add Money Now</span>
            </button>
          </form>

          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <History size={16} /> Recent Wallet Activity
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#64748B', background: '#F8FAFC', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' }}>
              No recent transactions recorded today.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
