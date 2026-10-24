import React, { useState, useEffect } from 'react';
import { Wallet, PlusCircle, ShieldCheck, History, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function WalletPage({ currentUser }) {
  const [balance, setBalance] = useState(0);
  const [escrowHeld, setEscrowHeld] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [credit, setCredit] = useState({ limit: 50000, used: 0, available: 50000, isApproved: true });
  const [addAmount, setAddAmount] = useState('5000');
  const [repayAmount, setRepayAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const fetchWallet = () => {
    setLoading(true);
    const email = currentUser ? currentUser.email : 'aditi@business.com';
    fetch(`/api/wallet?userEmail=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBalance(data.balance || 0);
          setEscrowHeld(data.escrowHeld || 0);
          setTransactions(data.transactions || []);
          if (data.credit) setCredit(data.credit);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWallet();
  }, [currentUser]);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const val = parseFloat(addAmount);
    if (!val || val <= 0) return;

    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser ? currentUser.email : 'aditi@business.com',
          amount: val,
          paymentMethod: 'UPI Sandbox / Simulated'
        })
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
        setToast(`Topped up ₹${val.toLocaleString('en-IN')} (Simulated Sandbox) with Escrow Protection!`);
        setTimeout(() => setToast(''), 4000);
        fetchWallet();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRepayCredit = async (e) => {
    e.preventDefault();
    const val = parseFloat(repayAmount);
    if (!val || val <= 0) return;

    try {
      const res = await fetch('/api/wallet/credit/repay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser ? currentUser.id : undefined,
          userEmail: currentUser ? currentUser.email : 'aditi@business.com',
          amount: val
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast(`Repaid ₹${val.toLocaleString('en-IN')} towards your credit limit!`);
        setRepayAmount('');
        setTimeout(() => setToast(''), 4000);
        fetchWallet();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Page Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#FEF3C7', color: '#D97706', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
            <Wallet size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              B2B Escrow Wallet & Trade Credit
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
              Instant wholesale checkout, 100% escrow protection, and 10-day manufacturer trade credit.
            </p>
          </div>
        </div>

        <button
          onClick={fetchWallet}
          style={{ background: 'white', border: '1px solid #CBD5E1', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Ledger
        </button>
      </div>

      {toast && (
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.75rem 1.25rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
          🎉 {toast}
        </div>
      )}

      {/* Main Row: Escrow Wallet Card & 10-Day Credit Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Wallet Balance Card */}
        <div style={{ background: 'linear-gradient(135deg, #0F3B9A, #0E2F6F)', color: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 10px 25px rgba(15, 59, 154, 0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.825rem', color: '#93C5FD', fontWeight: 700, letterSpacing: '0.05em' }}>AVAILABLE WALLET BALANCE</span>
              <ShieldCheck size={22} style={{ color: '#60A5FA' }} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.75rem 0' }}>
              ₹{balance.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#BFDBFE' }}>
              Escrow Active: ₹{escrowHeld.toLocaleString('en-IN')} held for pending deliveries
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <div>
              <div style={{ color: '#93C5FD' }}>Account Owner</div>
              <div style={{ fontWeight: 700 }}>{currentUser ? currentUser.name : 'Aditi Vanara'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#93C5FD' }}>Protection</div>
              <div style={{ fontWeight: 700, color: '#34D399' }}>100% Escrow Backed ✔</div>
            </div>
          </div>
        </div>

        {/* 10-Day Credit Line Card */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2rem', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.825rem', color: '#64748B', fontWeight: 700 }}>10-DAY TRADE CREDIT LINE</span>
              <Calendar size={22} style={{ color: '#00A3FF' }} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', margin: '0.75rem 0' }}>
              ₹{credit.available.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#64748B' }}>
              Credit Used: ₹{credit.used.toLocaleString('en-IN')} of ₹{credit.limit.toLocaleString('en-IN')} total limit
            </div>
          </div>

          {credit.used > 0 && (
            <form onSubmit={handleRepayCredit} style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="number"
                placeholder="Repay Amount (₹)"
                value={repayAmount}
                onChange={e => setRepayAmount(e.target.value)}
                style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
              <button
                type="submit"
                style={{ background: '#10B981', color: 'white', border: 'none', padding: '0.45rem 1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Repay Credit
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ color: '#64748B' }}>Term: 10 Days Net</span>
            <span style={{ color: '#10B981', fontWeight: 700 }}>Pre-Approved for Verified Merchant</span>
          </div>
        </div>
      </div>

      {/* Forms & Transaction History Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: '2rem' }}>
        {/* Add Funds Form */}
        <div style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
            Add Funds to Wallet
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Top up instantly using UPI, NEFT, or Corporate NetBanking (Sandbox Simulated).
          </p>

          <form onSubmit={handleAddFunds}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Enter Top-Up Amount (₹)
              </label>
              <input
                type="number"
                required
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #CBD5E1', fontSize: '1.1rem', fontWeight: 700, outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {['2000', '5000', '10000', '25000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAddAmount(amt)}
                  style={{ flex: 1, padding: '0.4rem', border: '1px solid #E2E8F0', background: addAmount === amt ? '#00A3FF' : '#F8FAFC', color: addAmount === amt ? 'white' : '#0F172A', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <div style={{ background: '#EFF6FF', padding: '0.75rem', borderRadius: '0.65rem', fontSize: '0.75rem', color: '#1E40AF', marginBottom: '1.25rem' }}>
              🛡️ <strong>Simulated Sandbox Mode:</strong> Real money is NOT deducted from your bank. All transactions are logged in the persistent MongoDB audit ledger for project evaluation.
            </div>

            <button
              type="submit"
              style={{ width: '100%', background: '#00A3FF', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,163,255,0.25)' }}
            >
              <PlusCircle size={18} />
              <span>Simulate Top-Up Now</span>
            </button>
          </form>
        </div>

        {/* Transaction History Audit Ledger */}
        <div style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid #E2E8F0', padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} /> Persistent Transaction Audit Ledger ({transactions.length})
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Every credit, debit, and escrow hold is recorded permanently with transaction IDs.
          </p>

          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B', background: '#F8FAFC', borderRadius: '0.75rem' }}>
              No transactions recorded yet. Top up or place an order to see ledger entries.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '340px', overflowY: 'auto' }}>
              {transactions.map(tx => (
                <div key={tx._id || tx.referenceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{tx.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                      Ref: <strong>{tx.referenceId}</strong> • {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: tx.type.includes('DEBIT') ? '#EF4444' : '#10B981' }}>
                      {tx.type.includes('DEBIT') ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                      Bal: ₹{tx.balanceAfter ? tx.balanceAfter.toLocaleString('en-IN') : balance}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
