import React from 'react';
import { Home, RotateCcw, Wallet, Handshake, User } from 'lucide-react';

export default function MobileNav({ currentView, onNavigate }) {
  return (
    <nav className="mobile-nav">
      <a
        href="#"
        className={`nav-item ${currentView === 'catalog' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }}
      >
        <Home size={20} />
        <span>Home</span>
      </a>

      <a
        href="#"
        className={`nav-item ${currentView === 'repeat' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('repeat'); }}
      >
        <RotateCcw size={20} />
        <span>Repeat</span>
      </a>

      <a
        href="#"
        className={`nav-item ${currentView === 'wallet' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('wallet'); }}
      >
        <div style={{ position: 'relative' }}>
          <Wallet size={20} />
          <span style={{ position: 'absolute', top: '-6px', right: '-12px', background: '#E2E8F0', fontSize: '9px', padding: '1px 3px', borderRadius: '4px', fontWeight: 'bold', color: '#0F172A' }}>₹0</span>
        </div>
        <span>Wallet</span>
      </a>

      <a
        href="#"
        className={`nav-item ${currentView === 'partner' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('partner'); }}
      >
        <Handshake size={20} />
        <span>Partner</span>
      </a>

      <a
        href="#"
        className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('profile'); }}
      >
        <User size={20} />
        <span>Profile</span>
      </a>
    </nav>
  );
}
