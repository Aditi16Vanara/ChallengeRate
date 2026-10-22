import React, { useState } from 'react';
import { Handshake, CheckCircle2, Shield, TrendingUp, Truck } from 'lucide-react';

export default function PartnerPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    gstin: '',
    category: 'Textiles',
    city: 'Surat',
    state: 'Gujarat',
    phone: '',
    email: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxW: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Hero Header */}
      <div style={{ textCenter: 'center', marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#EFF6FF', color: '#00A3FF', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          <Handshake size={16} /> Manufacturer Partner Program
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Sell Directly to Verified Wholesale Buyers Across India
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.05rem', maxW: '750px', margin: '0.75rem auto 0' }}>
          Join 2,500+ Indian manufacturers on ChallengeRate. Zero listing fees, guaranteed escrow payments, and pan-India logistics support.
        </p>
      </div>

      {/* Grid: Benefits & Application Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 460px)', gap: '2.5rem' }}>
        {/* Left Column: Benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#F0FDF4', color: '#10B981', padding: '0.75rem', borderRadius: '0.75rem' }}>
              <Shield size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Guaranteed Payment Protection</h3>
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.3rem' }}>
                All wholesale orders are backed by ChallengeRate Escrow. Get paid immediately upon dispatch confirmation.
              </p>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#EFF6FF', color: '#21A3FF', padding: '0.75rem', borderRadius: '0.75rem' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Rate Challenge Demand Engine</h3>
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.3rem' }}>
                Receive direct wholesale price challenge inquiries from verified bulk buyers looking for high-volume orders.
              </p>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: '#FEF3C7', color: '#D97706', padding: '0.75rem', borderRadius: '0.75rem' }}>
              <Truck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Integrated Logistics & GST Billing</h3>
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.3rem' }}>
                Hassle-free truckload transport partners and automated B2B e-way bill & GST invoice generation.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Onboarding Form */}
        <div style={{ background: 'white', borderRadius: '1.5rem', border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={48} style={{ color: '#10B981', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>Application Submitted!</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Our team will verify your GSTIN and contact you within 24 hours to set up your manufacturer catalog.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F3B9A', marginBottom: '0.25rem' }}>
                Register Your Manufacturing Unit
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Fill in your details to get verified as an official supplier.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>Company / Firm Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surat Textiles Mills Pvt Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>GSTIN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="24AAAAA0000A1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>Primary Product Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  >
                    <option value="Textiles">Textiles & Garments</option>
                    <option value="Supari & Agro">Supari, Spices & Agro</option>
                    <option value="Agro & Fertilizer">Organic Fertilizers</option>
                    <option value="Chemicals & Polymers">Chemicals & Plastic Resins</option>
                    <option value="Industrial Electronics">Solar & Electronics</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>City</label>
                    <input
                      type="text"
                      required
                      placeholder="Surat"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.35rem' }}>State</label>
                    <input
                      type="text"
                      required
                      placeholder="Gujarat"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '0.5rem', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{ width: '100%', background: '#00A3FF', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Submit Partner Application
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
