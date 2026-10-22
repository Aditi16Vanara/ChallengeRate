import React from 'react';
import { Search, Lock, User, Home, RotateCcw, Wallet, Handshake } from 'lucide-react';

export default function Header({ searchTerm, setSearchTerm, onOpenAuth, currentUser, currentView, onNavigate }) {
  return (
    <header className="site-header">
      <div className="header-container" style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Brand Logo */}
        <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
          <div className="logo-badge" style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #21A3FF, #0F3B9A)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', fontWeight: 'bold' }}>
            CR
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F2F6F' }}>ChallengeRate</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3B9A' }}>.com</span>
        </a>

        {/* Search Bar */}
        <div className="search-wrapper" style={{ flex: 1, maxWidth: '450px', position: 'relative', display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search className="search-icon" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B', width: '16px' }} />
            <input
              type="text"
              className="search-input"
              style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.4rem', borderRadius: '9999px', border: '1px solid #E2E8F0', background: '#F1F5F9', fontSize: '0.85rem' }}
              placeholder="Search products or manufacturers"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); if (currentView !== 'catalog') onNavigate('catalog'); }}
            />
          </div>
          <button style={{ background: '#00A3FF', color: 'white', border: 'none', padding: '0.5rem 1.1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.825rem', cursor: 'pointer' }}>
            Search
          </button>
        </div>

        {/* Navigation Links + User Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', fontWeight: 500 }}>
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }}
              style={{ textDecoration: 'none', color: currentView === 'catalog' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'catalog' ? 700 : 500 }}
            >
              <Home size={16} /> Home
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('repeat'); }}
              style={{ textDecoration: 'none', color: currentView === 'repeat' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'repeat' ? 700 : 500 }}
            >
              <RotateCcw size={16} /> Repeat
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('wallet'); }}
              style={{ textDecoration: 'none', color: currentView === 'wallet' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'wallet' ? 700 : 500 }}
            >
              <Wallet size={16} /> Wallet
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('partner'); }}
              style={{ textDecoration: 'none', color: currentView === 'partner' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'partner' ? 700 : 500 }}
            >
              <Handshake size={16} /> Partner
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('profile'); }}
              style={{ textDecoration: 'none', color: currentView === 'profile' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'profile' ? 700 : 500 }}
            >
              <User size={16} /> Profile
            </a>
          </nav>

          {/* Logged in User Pill Button matching user screenshot (e.g. aditi) */}
          <button
            onClick={() => onNavigate('profile')}
            style={{ background: '#00A3FF', color: 'white', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(0,163,255,0.25)' }}
          >
            <User size={16} />
            <span>{currentUser ? currentUser.name.toLowerCase() : 'aditi'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
