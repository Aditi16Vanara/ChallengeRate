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
import ChallengesPage from './components/ChallengesPage';
import SellerPortal from './components/SellerPortal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import ChallengeModal from './components/ChallengeModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import AuthModal from './components/AuthModal';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Navigation State: 'catalog' | 'detail' | 'repeat' | 'wallet' | 'challenges' | 'seller' | 'partner' | 'profile'
  const [currentView, setCurrentView] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cr_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);

  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [challengeProduct, setChallengeProduct] = useState(null);

  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cr_user');
      return saved ? JSON.parse(saved) : { id: 'usr_demo', name: 'aditi', email: 'aditi@business.com', role: 'buyer' };
    } catch {
      return { id: 'usr_demo', name: 'aditi', email: 'aditi@business.com', role: 'buyer' };
    }
  });

  const [toastMessage, setToastMessage] = useState('');

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cr_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Persist user to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cr_user', JSON.stringify(currentUser));
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Fetch products from Express REST API
  const fetchProducts = () => {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (activeCategory && activeCategory !== 'All') queryParams.append('category', activeCategory);
    if (searchTerm) queryParams.append('q', searchTerm);

    fetch(`/api/products?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, searchTerm]);

  const extractNumber = (val, defaultVal = 1) => {
    if (typeof val === 'number') return val;
    if (!val) return defaultVal;
    const match = String(val).replace(/,/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : defaultVal;
  };

  // Add Product to Cart with MOQ validation
  const handleAddToCart = (product, customQty = null) => {
    const minQty = extractNumber(product.minOrder || product.moq, 1);
    const step = extractNumber(product.orderMultiple || product.moq, 1);
    const addQty = customQty ? Number(customQty) : minQty;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => it._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (customQty ? Number(customQty) : step)
        };
        return updated;
      } else {
        return [...prevItems, { ...product, quantity: addQty }];
      }
    });

    setIsCartOpen(true);
    setToastMessage(`Added "${product.title}" (${addQty} ${product.unit || 'units'}) to your Wholesale Cart!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item._id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleProceedToCheckout = (itemsToCheckout) => {
    setCheckoutItems(itemsToCheckout);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (newOrder) => {
    setCartItems([]);
    setTrackingOrder(newOrder);
    setIsOrderTrackingOpen(true);
    setToastMessage(`Order #${newOrder.orderNumber} confirmed! Escrow protection activated.`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleOpenChallenge = (product) => {
    setChallengeProduct(product);
    setIsChallengeModalOpen(true);
  };

  const handleChallengeSuccess = (challenge) => {
    setToastMessage(`Rate challenge #${challenge.challengeId} submitted! Manufacturer notified.`);
    setTimeout(() => setToastMessage(''), 4500);
    setCurrentView('challenges');
  };

  const handleOrderNegotiatedDeal = (deal) => {
    // Add negotiated custom deal item to cart
    const negotiatedItem = {
      _id: deal.product || deal._id,
      title: deal.productTitle,
      image: deal.productImage,
      basePrice: deal.counterOfferPrice || deal.proposedPrice,
      currentUnitPrice: deal.counterOfferPrice || deal.proposedPrice,
      quantity: deal.requestedQuantity,
      unit: deal.unit || 'Unit',
      minOrder: `${deal.requestedQuantity} ${deal.unit}`,
      orderMultiple: `${deal.requestedQuantity} ${deal.unit}`,
      supplier: { name: deal.supplierName },
      gstRate: '5%',
      packing: 'Negotiated Bulk Consignment',
      isNegotiated: true
    };

    setCheckoutItems([negotiatedItem]);
    setIsCheckoutOpen(true);
  };

  const handleReorderToCart = (pastOrder) => {
    if (!pastOrder.items || pastOrder.items.length === 0) return;
    const itemsToAdd = pastOrder.items.map((it) => ({
      _id: it.product || `reorder_${Date.now()}_${Math.random()}`,
      title: it.title,
      image: it.image,
      basePrice: it.unitPrice,
      unit: it.unit,
      quantity: it.quantity,
      supplier: { name: it.supplierName },
      packing: it.packing,
      gstRate: it.gstRate,
      minOrder: `${it.quantity} ${it.unit}`,
      orderMultiple: `${it.quantity} ${it.unit}`
    }));

    setCartItems(itemsToAdd);
    setIsCartOpen(true);
    setToastMessage(`Loaded ${itemsToAdd.length} items from Order #${pastOrder.orderNumber} into Cart!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

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

  const handleRoleSwitch = (newRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
      businessName: newRole === 'supplier' ? 'Clonex Manufacturing Surat' : 'Aditi Commercial Traders'
    }));
    setToastMessage(`Switched mode to ${newRole === 'supplier' ? 'Manufacturer' : 'Wholesale Buyer'}!`);
    setTimeout(() => setToastMessage(''), 3000);
    if (newRole === 'supplier') setCurrentView('seller');
    else setCurrentView('catalog');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cartItems.reduce((acc, it) => acc + (it.quantity > 0 ? 1 : 0), 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {/* Toast Notification */}
        {toastMessage && (
          <div style={{ maxWidth: '640px', margin: '1rem auto 0', background: '#D1FAE5', color: '#065F46', padding: '0.75rem 1.25rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            🎉 {toastMessage}
          </div>
        )}

        {/* View Router */}
        {currentView === 'detail' && selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onBack={() => handleNavigate('catalog')}
            onOrderClick={handleAddToCart}
            onChallengeRate={handleOpenChallenge}
          />
        ) : currentView === 'repeat' ? (
          <RepeatPage
            currentUser={currentUser}
            onReorderToCart={handleReorderToCart}
            onTrackOrder={(order) => {
              setTrackingOrder(order);
              setIsOrderTrackingOpen(true);
            }}
          />
        ) : currentView === 'wallet' ? (
          <WalletPage currentUser={currentUser} />
        ) : currentView === 'challenges' ? (
          <ChallengesPage
            currentUser={currentUser}
            onOrderNegotiatedDeal={handleOrderNegotiatedDeal}
          />
        ) : currentView === 'seller' ? (
          <SellerPortal
            currentUser={currentUser}
            onProductAdded={fetchProducts}
          />
        ) : currentView === 'partner' ? (
          <PartnerPage currentUser={currentUser} />
        ) : currentView === 'profile' ? (
          <ProfilePage
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onRoleSwitch={handleRoleSwitch}
          />
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
                  Direct Factory Prices • Pan-India Delivery
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
                      onChallengeRate={handleOpenChallenge}
                      onSelectProduct={handleSelectProduct}
                      onAddToCart={handleAddToCart}
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

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Challenge Rate Negotiation Modal */}
      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        product={challengeProduct}
        currentUser={currentUser}
        onChallengeSuccess={handleChallengeSuccess}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        order={trackingOrder}
        onDeliveryConfirmed={(updatedOrder) => {
          setTrackingOrder(updatedOrder);
          fetchProducts();
        }}
      />

      {/* Mobile Sticky Toolbar */}
      <MobileNav
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Login / Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setToastMessage(`Welcome back, ${user.name}!`);
          setTimeout(() => setToastMessage(''), 3000);
        }}
      />
    </div>
  );
}
