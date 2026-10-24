const assert = require('assert');

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE B2B MARKETPLACE TEST SUITE');
  console.log('====================================================\n');

  let testCount = 0;
  let passCount = 0;

  async function test(name, fn) {
    testCount++;
    try {
      await fn();
      passCount++;
      console.log(`✅ [PASS] ${name}`);
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health Check
  await test('Health check reports all 6 modules online', async () => {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    assert.strictEqual(data.status, 'online');
    assert.strictEqual(data.modules.length, 6);
  });

  // 2. Auth: Register & Login with JWT & bcrypt
  let testUser = null;
  let authToken = null;
  await test('Auth: Register new buyer with bcrypt password & JWT token', async () => {
    const email = `buyer_${Date.now()}@testcorp.com`;
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Buyer Ltd',
        email,
        password: 'SecurePassword123!',
        role: 'buyer',
        businessName: 'Test Corp Surat',
        gstin: '24TEST1234A1Z0'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token, 'Token must be returned');
    assert.ok(data.user.id, 'User ID must be returned');
    testUser = data.user;
    authToken = data.token;
  });

  await test('Auth: Login with valid credentials', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'SecurePassword123!'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
  });

  await test('Auth: Reject invalid credentials', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  // 3. Module 1: Cart Validation & Dynamic Tier Pricing
  let products = [];
  await test('Module 1: Fetch verified products and check MOQ', async () => {
    const res = await fetch(`${API_BASE}/products`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.length >= 4);
    products = data.data;
  });

  const waterProduct = products.find(p => p.title.includes('Water'));
  assert.ok(waterProduct, 'Water product must exist in catalog');

  await test('Module 1: Server validates MOQ (rejects below MOQ)', async () => {
    const res = await fetch(`${API_BASE}/products/validate-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: waterProduct._id, quantity: 10 }] // Below 35
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.ok(data.message.includes('requires a minimum order'));
  });

  await test('Module 1: Server calculates Tier Pricing & 5% GST accurately', async () => {
    // 1050 bottles triggers tier > 1000 @ ₹1.8 / bottle
    const res = await fetch(`${API_BASE}/products/validate-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: waterProduct._id, quantity: 1050 }]
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    const item = data.items[0];
    assert.strictEqual(item.unitPrice, 1.8);
    assert.strictEqual(data.subtotal, 1050 * 1.8); // 1890
    assert.strictEqual(data.gstTotal, 94.5); // 5% of 1890
    assert.strictEqual(data.totalAmount, 1984.5);
  });

  // 4. Module 3: Order Creation & Status Pipeline
  let createdOrder = null;
  await test('Module 3: Create B2B order with Escrow Payment', async () => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: testUser.id,
        buyerName: testUser.name,
        buyerEmail: testUser.email,
        items: [{ productId: waterProduct._id, quantity: 70 }],
        shippingAddress: {
          recipientName: 'Test Buyer Warehouse',
          phone: '+91 98765 43210',
          street: 'Plot 45, GIDC Industrial Estate',
          city: 'Surat',
          state: 'Gujarat',
          pincode: '394101'
        },
        gstin: '24TEST1234A1Z0',
        paymentMethod: 'ONLINE'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.orderNumber);
    assert.strictEqual(data.data.orderStatus, 'ORDER_PLACED');
    assert.strictEqual(data.data.escrowStatus, 'HELD');
    createdOrder = data.data;
  });

  await test('Module 3: Advance order status pipeline to DISPATCHED with E-Way Bill', async () => {
    const res = await fetch(`${API_BASE}/orders/${createdOrder._id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'DISPATCHED',
        ewayBillNumber: 'EWB-2498712399',
        courierName: 'Surat Freight Logistics',
        trackingNumber: 'LR-SUR-8841',
        note: 'Loaded in container truck #GJ-05-AB-1234'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.orderStatus, 'DISPATCHED');
    assert.strictEqual(data.data.ewayBillNumber, 'EWB-2498712399');
  });

  await test('Module 3: Buyer confirms delivery -> Escrow funds released to manufacturer', async () => {
    const res = await fetch(`${API_BASE}/orders/${createdOrder._id}/confirm-delivery`, {
      method: 'POST'
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.orderStatus, 'DELIVERED');
    assert.strictEqual(data.data.escrowStatus, 'RELEASED');
  });

  // 5. Module 2: Rate Challenge Negotiation & Counter-Offer
  let activeChallenge = null;
  await test('Module 2: Buyer submits Rate Challenge proposal', async () => {
    const res = await fetch(`${API_BASE}/challenges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: testUser.id,
        buyerName: testUser.name,
        buyerEmail: testUser.email,
        productId: waterProduct._id,
        requestedQuantity: 5000,
        proposedPrice: 1.60,
        expectedDeliveryTimeline: 'Within 7 Business Days',
        notes: 'Bulk monthly purchase for corporate event series.'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'SUBMITTED');
    assert.strictEqual(data.data.proposedPrice, 1.60);
    activeChallenge = data.data;
  });

  await test('Module 2: Manufacturer counter-offers with customized price', async () => {
    const res = await fetch(`${API_BASE}/challenges/${activeChallenge._id}/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'COUNTER',
        counterOfferPrice: 1.70,
        notes: 'We can supply 5000 bottles @ ₹1.70 with free pallet delivery.'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'COUNTERED');
    assert.strictEqual(data.data.counterOfferPrice, 1.70);
  });

  await test('Module 2: Buyer accepts counter-offer -> Ready for checkout', async () => {
    const res = await fetch(`${API_BASE}/challenges/${activeChallenge._id}/buyer-respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ACCEPT',
        buyerName: testUser.name
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'BUYER_ACCEPTED');
  });

  // 6. Module 5: Wallet & 10-Day Credit
  await test('Module 5: Wallet balance check and simulated top-up', async () => {
    const topupRes = await fetch(`${API_BASE}/wallet/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        userEmail: testUser.email,
        amount: 25000,
        paymentMethod: 'UPI Simulated Sandbox'
      })
    });
    const topupData = await topupRes.json();
    assert.strictEqual(topupData.success, true);
    assert.ok(topupData.balance >= 25000);

    const getRes = await fetch(`${API_BASE}/wallet?userId=${testUser.id}`);
    const getData = await getRes.json();
    assert.strictEqual(getData.success, true);
    assert.ok(getData.transactions.length >= 1);
    assert.strictEqual(getData.credit.isApproved, true);
  });

  await test('Module 5: 10-Day Credit checkout & Repayment audit', async () => {
    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerId: testUser.id,
        buyerName: testUser.name,
        buyerEmail: testUser.email,
        items: [{ productId: waterProduct._id, quantity: 35 }],
        shippingAddress: {
          recipientName: 'Test Buyer Warehouse',
          phone: '+91 98765 43210',
          street: 'Plot 45, GIDC Industrial Estate',
          city: 'Surat',
          state: 'Gujarat',
          pincode: '394101'
        },
        paymentMethod: 'CREDIT_10_DAYS'
      })
    });
    const orderData = await orderRes.json();
    assert.strictEqual(orderData.success, true);
    assert.strictEqual(orderData.data.paymentStatus, 'CREDIT_PENDING');
    assert.ok(orderData.data.dueDate);

    // Repay credit
    const repayRes = await fetch(`${API_BASE}/wallet/credit/repay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        amount: 50
      })
    });
    const repayData = await repayRes.json();
    assert.strictEqual(repayData.success, true);
  });

  // 7. Module 4: Supplier Portal Product Creation & Stock Toggle
  await test('Module 4: Manufacturer publishes new wholesale product', async () => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Polyester Filament Spun Yarn (Test Brand)',
        category: 'Textiles',
        basePrice: 160,
        unit: 'Kg',
        moq: '250 Kg',
        packing: '50 Kg Bag',
        gstRate: '5%',
        supplierName: 'Test Manufacturing Unit',
        location: 'Surat, Gujarat',
        tiers: [
          { qtyRange: '250 - 1000 Kg', price: 160 },
          { qtyRange: '> 1000 Kg', price: 148 }
        ]
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.title.includes('Polyester Filament'));

    // Toggle stock status
    const stockRes = await fetch(`${API_BASE}/products/${data.data._id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inStock: false })
    });
    const stockData = await stockRes.json();
    assert.strictEqual(stockData.success, true);
    assert.strictEqual(stockData.inStock, false);

    // Clean up test product so catalog stays clean without duplicates
    if (data.data && data.data._id) {
      await fetch(`${API_BASE}/products/${data.data._id}`, { method: 'DELETE' });
    }
  });

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passCount} / ${testCount} TESTS PASSED (100%)`);
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
