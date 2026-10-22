import React from 'react';
import { Home, RotateCcw, Wallet, Zap, Building, User } from 'lucide-react';

export default function MobileNav({ currentView, onNavigate }) {
  return (
    <nav className="mobile-nav">
      <a
        href="#"
        className={`nav-item ${currentView === 'catalog' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }}
      >
        <Home size={19} />
        <span>Home</span>
      </a>

      <a
        href="#"
        className={`nav-item ${currentView === 'repeat' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('repeat'); }}
      >
        <RotateCcw size={19} />
        <span>Repeat</span>
      </a>

      <a
        href="#"
        className={`nav-item ${currentView === 'wallet' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('wallet'); }}
      >
        <Wallet size={19} />
        <span>Wallet</span>
      </a>

      <a
        href="#"
        className={`nav-item ${currentView === 'challenges' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('challenges'); }}
      >
        <Zap size={19} />
        <span>Deals</span>
      </a>

      <a
        href="#"
        className={`nav-item ${currentView === 'seller' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('seller'); }}
      >
        <Building size={19} />
        <span>Seller</span>
      </a>

      <a
        href="#"
        className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); onNavigate('profile'); }}
      >
        <User size={19} />
        <span>Profile</span>
      </a>
    </nav>
  );
}
