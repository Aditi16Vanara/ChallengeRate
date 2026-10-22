import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="brand-logo" style={{ marginBottom: '1rem' }}>
            <div className="logo-badge">CR</div>
            <span style={{ color: 'white' }}>ChallengeRate</span>
            <span style={{ color: '#21A3FF' }}>.com</span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.6' }}>
            G-30,31, Meridian Business Center, Lajamni Chowk,<br />
            Mota Varachha, Surat, Gujarat 394101<br />
            India's Premier B2B Wholesale Marketplace.
          </p>
        </div>

        <div>
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Verified Partners</a></li>
            <li><a href="#">Our Team</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Contact Support</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Legal & Security</h4>
          <ul className="footer-links">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Preferences</a></li>
            <li><a href="#">Escrow & Payments</a></li>
          </ul>
        </div>
      </div>

      <div style={{ maxW: '1280px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748B' }}>
        <p>© 2026 Challenge Rate. All rights reserved.</p>
        <p>Built with MERN Stack</p>
      </div>
    </footer>
  );
}
