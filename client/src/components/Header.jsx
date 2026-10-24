import React from 'react';
import { Search, Lock, User, Home, RotateCcw, Wallet, Handshake, ShoppingCart, Zap, Building } from 'lucide-react';

export default function Header({
  searchTerm,
  setSearchTerm,
  onOpenAuth,
  currentUser,
  currentView,
  onNavigate,
  cartCount,
  onOpenCart
}) {
  return (
    <header className="site-header">
      <div className="header-container" style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Brand Logo */}
        <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', flexShrink: 0 }}>
          <div className="logo-badge" style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #21A3FF, #0F3B9A)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            CR
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F2F6F' }}>ChallengeRate</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F3B9A' }}>.com</span>
        </a>

        {/* Search Bar */}
        <div className="search-wrapper" style={{ flex: 1, maxWidth: '420px', position: 'relative', display: 'flex', gap: '0.5rem' }}>
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

        {/* Navigation Links + Cart + User Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', fontSize: '0.85rem', fontWeight: 500 }}>
            {currentUser && currentUser.role === 'supplier' ? (
              /* Manufacturer / Supplier Navigation */
              <>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('seller'); }}
                  style={{ textDecoration: 'none', color: currentView === 'seller' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'seller' ? 700 : 500 }}
                >
                  <Building size={15} /> Seller Portal
                </a>

                <a
                  href="/"
                  onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }}
                  style={{ textDecoration: 'none', color: currentView === 'catalog' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'catalog' ? 700 : 500 }}
                >
                  <Home size={15} /> Wholesale Catalog
                </a>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('profile'); }}
                  style={{ textDecoration: 'none', color: currentView === 'profile' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'profile' ? 700 : 500 }}
                >
                  <User size={15} /> Profile
                </a>
              </>
            ) : (
              /* Wholesale Buyer Navigation - Seller Portal is strictly excluded */
              <>
                <a
                  href="/"
                  onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }}
                  style={{ textDecoration: 'none', color: currentView === 'catalog' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'catalog' ? 700 : 500 }}
                >
                  <Home size={15} /> Home
                </a>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('repeat'); }}
                  style={{ textDecoration: 'none', color: currentView === 'repeat' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'repeat' ? 700 : 500 }}
                >
                  <RotateCcw size={15} /> Repeat
                </a>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('wallet'); }}
                  style={{ textDecoration: 'none', color: currentView === 'wallet' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'wallet' ? 700 : 500 }}
                >
                  <Wallet size={15} /> Wallet
                </a>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('challenges'); }}
                  style={{ textDecoration: 'none', color: currentView === 'challenges' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'challenges' ? 700 : 500 }}
                >
                  <Zap size={15} /> Challenges
                </a>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('partner'); }}
                  style={{ textDecoration: 'none', color: currentView === 'partner' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'partner' ? 700 : 500 }}
                >
                  <Handshake size={15} /> Partner
                </a>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onNavigate('profile'); }}
                  style={{ textDecoration: 'none', color: currentView === 'profile' ? '#00A3FF' : '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: currentView === 'profile' ? 700 : 500 }}
                >
                  <User size={15} /> Profile
                </a>
              </>
            )}
          </nav>

          {/* Cart Trigger with Counter Badge (for buyers) */}
          {(!currentUser || currentUser.role !== 'supplier') && (
            <button
              onClick={onOpenCart}
              style={{
                position: 'relative',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                padding: '0.5rem 0.85rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                color: '#0F172A',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
              title="View Cart"
            >
              <ShoppingCart size={17} style={{ color: '#00A3FF' }} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span
                  style={{
                    background: '#00A3FF',
                    color: 'white',
                    borderRadius: '9999px',
                    padding: '0.1rem 0.45rem',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Button with Role Tag */}
          <button
            onClick={() => onNavigate('profile')}
            style={{
              background: currentUser && currentUser.role === 'supplier' ? '#0F3B9A' : '#00A3FF',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1.15rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <User size={15} />
            <span>
              {currentUser ? currentUser.name.toLowerCase() : 'aditi'}
              <span style={{ opacity: 0.85, fontWeight: 500, fontSize: '0.75rem', marginLeft: '0.25rem' }}>
                ({currentUser && currentUser.role === 'supplier' ? 'Manufacturer' : 'Buyer'})
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
