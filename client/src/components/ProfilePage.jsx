import React, { useState } from 'react';
import { User, Building2, MapPin, ShieldCheck, FileText, LogOut } from 'lucide-react';

export default function ProfilePage({ currentUser, onOpenAuth }) {
  const name = currentUser ? currentUser.name : 'Aditi';
  const email = currentUser ? currentUser.email : 'aditi@business.com';

  return (
    <div style={{ maxW: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Profile Header Card */}
      <div style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid #E2E8F0', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #21A3FF, #0F3B9A)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.75rem', textTransform: 'uppercase' }}>
            {name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{name}</h1>
              <span style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '9999px' }}>
                Verified Buyer & Merchant
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>{email}</p>
          </div>
        </div>

        <button
          onClick={onOpenAuth}
          style={{ background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', padding: '0.55rem 1.25rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <LogOut size={16} /> Switch Account / Login
        </button>
      </div>

      {/* Account Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Business Profile */}
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0F3B9A' }}>
            <Building2 size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Business Details</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: '0.5rem' }}>
              <span style={{ color: '#64748B' }}>Firm Name</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Aditi Commercial Traders</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', pb: '0.5rem' }}>
              <span style={{ color: '#64748B' }}>GSTIN</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>24AAACA1234A1Z0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Business Type</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>Wholesale Distributor</span>
            </div>
          </div>
        </div>

        {/* Primary Delivery Location */}
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0F3B9A' }}>
            <MapPin size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Default Delivery Warehouse</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>
            G-30, Meridian Business Center,<br />
            Lajamni Chowk, Mota Varachha,<br />
            Surat, Gujarat 394101, India
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ShieldCheck size={16} /> Verified Unloading Site
          </div>
        </div>

        {/* Verification Status */}
        <div style={{ background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0F3B9A' }}>
            <FileText size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Verification Documents</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>GST Certificate</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>Approved ✔</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>PAN Card Verification</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>Approved ✔</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Bank Account Mandate</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>Active ✔</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
