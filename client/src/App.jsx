import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import RepeatPage from './components/RepeatPage';
import WalletPage from './components/WalletPage';
import PartnerPage from './components/PartnerPage';
import ProfilePage from './components/ProfilePage';
import AuthModal from './components/AuthModal';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Navigation State: 'catalog' | 'detail' | 'repeat' | 'wallet' | 'partner' | 'profile'
  const [currentView, setCurrentView] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: 'aditi', email: 'aditi@business.com', role: 'buyer' });
  const [toastMessage, setToastMessage] = useState('');

  // Fetch products from Express REST API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const queryParams = new URLSearchParams();
    if (activeCategory && activeCategory !== 'All') queryParams.append('category', activeCategory);
    if (searchTerm) queryParams.append('q', searchTerm);

    fetch(`/api/products?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setProducts(data.data);
        }
        if (isMounted) setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [activeCategory, searchTerm]);

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view !== 'detail') setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChallengeRate = (product) => {
    setToastMessage(`Rate challenge submitted for "${product.title}"! Supplier notified.`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleOrder = (product) => {
    setToastMessage(`Order placed for "${product.title}" (${product.minOrder || product.moq})!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header matching user screenshot */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {/* Toast Notification */}
        {toastMessage && (
          <div style={{ maxWidth: '600px', margin: '1rem auto 0', background: '#D1FAE5', color: '#065F46', padding: '0.75rem 1.25rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            🎉 {toastMessage}
          </div>
        )}

        {/* View Router */}
        {currentView === 'detail' && selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => handleNavigate('catalog')}
            onOrderClick={handleOrder}
          />
        ) : currentView === 'repeat' ? (
          <RepeatPage
            onReorderClick={(order) => {
              setToastMessage(`Re-order initiated for "${order.title}"!`);
              setTimeout(() => setToastMessage(''), 4000);
            }}
          />
        ) : currentView === 'wallet' ? (
          <WalletPage currentUser={currentUser} />
        ) : currentView === 'partner' ? (
          <PartnerPage />
        ) : currentView === 'profile' ? (
          <ProfilePage currentUser={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />
        ) : (
          /* Catalog View */
          <>
            <HeroBanner />

            <CategoryBar
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            <section className="products-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
                  Verified Wholesale Catalog ({products.length} Items)
                </h2>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Click any product to view detailed specifications
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading B2B Marketplace Products...</div>
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '1.25rem', border: '1px solid #E2E8F0' }}>
                  <h3>No products matched your search.</h3>
                  <p style={{ color: '#64748B', marginTop: '0.5rem' }}>Try searching for "Water", "Supari", "Textile", or "Fertilizer".</p>
                </div>
              ) : (
                <div className="product-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onChallengeRate={handleChallengeRate}
                      onSelectProduct={handleSelectProduct}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Toolbar */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Login / Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
