import { useEffect, useMemo, useState } from 'react';

const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Books', 'Sports'];

const generateProducts = () =>
  Array.from({ length: 520 }, (_, index) => {
    const id = index + 1;
    const category = categories[index % categories.length];
    const price = 299 + (id % 18) * 175 + Math.floor(id / 8) * 12;
    const rating = (3 + (id % 3) + (id % 10) / 20).toFixed(1);
    return {
      id,
      name: `${category} Product ${id}`,
      category,
      description: `Premium ${category.toLowerCase()} item designed for daily use and value shopping.`,
      price,
      rating
    };
  });

const chatbotFaq = [
  {
    q: 'How can I find budget-friendly products?',
    a: 'Use the category filter and sort by low price. I can also recommend products below ₹1,000.'
  },
  {
    q: 'How do I track my order?',
    a: 'Open Delivery Tracking section and enter your order ID to view progress.'
  },
  {
    q: 'Can I pay with UPI?',
    a: 'Yes, demo checkout supports UPI, card, net banking and cash on delivery.'
  }
];

const hasWindow = globalThis.window !== undefined;
const voiceApiAvailable =
  hasWindow &&
  ('webkitSpeechRecognition' in globalThis.window || 'SpeechRecognition' in globalThis.window);

function App() {
  const [mode, setMode] = useState('login');
  const [authType, setAuthType] = useState('registered');
  const [profile, setProfile] = useState({ name: '', email: '' });

  const [products] = useState(generateProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);

  const [budgetType, setBudgetType] = useState('monthly');
  const [budgetLimit, setBudgetLimit] = useState(30000);

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [deliveryId, setDeliveryId] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      id: 'bot-welcome',
      from: 'bot',
      text: 'Namaste! I can recommend products, budgets, tracking and payment help.'
    }
  ]);

  const [voiceMessage, setVoiceMessage] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, search, selectedCategory]);

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const budgetExceeded = cartTotal > budgetLimit;

  useEffect(() => {
    if (!voiceMessage) return;

    const normalized = voiceMessage.toLowerCase();
    if (normalized.includes('search')) {
      setSearch(normalized.replace('search', '').trim());
    }
    if (normalized.includes('cart')) {
      setMode('shop');
    }
  }, [voiceMessage]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const placeOrder = () => {
    if (cart.length === 0) return;
    const newOrder = {
      id: `ORD${Date.now().toString().slice(-7)}`,
      items: cart,
      total: cartTotal,
      paymentMethod,
      status: 'Order Confirmed'
    };
    setOrders((prev) => [newOrder, ...prev]);
    setDeliveryId(newOrder.id);
    setDeliveryStatus('Order Confirmed → Packed → Shipped → Out for Delivery → Delivered');
    setCart([]);
  };

  const trackOrder = () => {
    const target = orders.find((o) => o.id.toLowerCase() === deliveryId.toLowerCase());
    if (target) {
      setDeliveryStatus(`Order ${target.id}: ${target.status} and currently in transit.`);
    } else {
      setDeliveryStatus('Order not found. Please check order ID from your recent orders.');
    }
  };

  const handleChat = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    const lowerText = userText.toLowerCase();
    let reply = 'I can help with product recommendations, payment, budget and order tracking.';

    if (lowerText.includes('recommend')) {
      const recommendations = products
        .filter((p) => p.price < 1500)
        .slice(0, 3)
        .map((p) => `${p.name} (₹${p.price})`)
        .join(', ');
      reply = `Top picks under ₹1,500: ${recommendations}`;
    } else if (lowerText.includes('budget')) {
      reply = `Your ${budgetType} budget is ₹${budgetLimit}. Current cart total is ₹${cartTotal}.`;
    } else if (lowerText.includes('payment')) {
      reply = 'Available payment modes: UPI, Card, Net Banking, Cash on Delivery.';
    } else if (lowerText.includes('delivery') || lowerText.includes('track')) {
      reply = 'Go to Delivery Tracking and enter your latest order ID.';
    }

    setChatLog((prev) => [
      ...prev,
      { id: `user-${Date.now()}-1`, from: 'user', text: userText },
      { id: `bot-${Date.now()}-2`, from: 'bot', text: reply }
    ]);
    setChatInput('');
  };

  const startVoiceInput = () => {
    if (!voiceApiAvailable) {
      setVoiceMessage('Voice API not supported in this browser.');
      return;
    }

    const SpeechRecognition =
      globalThis.window.SpeechRecognition || globalThis.window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceMessage(transcript);
      setChatInput(transcript);
    };
    recognition.start();
  };

  const loginCard = (
    <div className="card shadow-sm p-4 mx-auto mt-5" style={{ maxWidth: '520px' }}>
      <h2 className="mb-3">E-Commerce Login</h2>
      <p className="text-muted">Registered customer or new user onboarding</p>
      <div className="btn-group mb-3">
        <button
          className={`btn ${authType === 'registered' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setAuthType('registered')}
        >
          Registered Customer
        </button>
        <button
          className={`btn ${authType === 'new' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setAuthType('new')}
        >
          New User
        </button>
      </div>
      <input
        className="form-control mb-2"
        placeholder="Full Name"
        value={profile.name}
        onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
      />
      <input
        className="form-control mb-3"
        placeholder="Email"
        value={profile.email}
        onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
      />
      <button className="btn btn-success" onClick={() => setMode('shop')}>
        {authType === 'registered' ? 'Login' : 'Create Account & Continue'}
      </button>
    </div>
  );

  return (
    <div className="container-fluid py-3 bg-light min-vh-100">
      {mode === 'login' ? (
        loginCard
      ) : (
        <>
          <header className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <h1 className="h3 m-0">Welcome {profile.name || 'Shopper'} 👋</h1>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={() => setMode('login')}>
                Logout
              </button>
            </div>
          </header>

          <section className="row g-3 mb-3">
            <div className="col-lg-3">
              <div className="card p-3 h-100">
                <h5>Budget Tracker</h5>
                <select
                  className="form-select mb-2"
                  value={budgetType}
                  onChange={(e) => setBudgetType(e.target.value)}
                >
                  <option value="monthly">Monthly Budget</option>
                  <option value="yearly">Yearly Budget</option>
                </select>
                <input
                  className="form-control mb-2"
                  type="number"
                  min="1000"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value) || 0)}
                />
                <div className="small">Cart Total: ₹{cartTotal}</div>
                {budgetExceeded && (
                  <div className="alert alert-warning mt-2 py-2">
                    Warning: Cart exceeds your {budgetType} budget limit!
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card p-3 h-100">
                <h5>Search & Voice</h5>
                <input
                  className="form-control mb-2"
                  placeholder="Search products"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-select mb-2"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button className="btn btn-outline-dark" onClick={startVoiceInput}>
                  🎙️ Voice Command (e.g. "search books")
                </button>
                {voiceMessage && <div className="small mt-2">Heard: {voiceMessage}</div>}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card p-3 h-100">
                <h5>Cart & Checkout</h5>
                <div>Items: {cart.reduce((sum, item) => sum + item.qty, 0)}</div>
                <div className="mb-2">Total: ₹{cartTotal}</div>
                <select
                  className="form-select mb-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Net Banking</option>
                  <option>Cash on Delivery</option>
                </select>
                <button className="btn btn-primary" onClick={placeOrder}>
                  Place Order
                </button>
              </div>
            </div>
          </section>

          <section className="row g-3 mb-3">
            <div className="col-lg-8">
              <div className="card p-3">
                <h5>Products ({filteredProducts.length} shown / {products.length} total)</h5>
                <div className="product-grid mt-2">
                  {filteredProducts.slice(0, 120).map((product) => (
                    <div className="card p-2" key={product.id}>
                      <h6 className="mb-1">{product.name}</h6>
                      <div className="small text-muted">{product.category}</div>
                      <div className="small mb-1">⭐ {product.rating}</div>
                      <div className="fw-bold">₹{product.price}</div>
                      <p className="small flex-grow-1">{product.description}</p>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-success" onClick={() => addToCart(product)}>
                          Add Cart
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => addToWishlist(product)}
                        >
                          Wishlist
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="small mt-2 text-muted">
                  Showing first 120 cards for performance, but dataset includes 500+ products.
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card p-3 mb-3">
                <h5>Wishlist ({wishlist.length})</h5>
                <ul className="list-group list-group-flush small">
                  {wishlist.slice(0, 7).map((item) => (
                    <li className="list-group-item px-0" key={item.id}>
                      {item.name} - ₹{item.price}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card p-3 mb-3">
                <h5>Order & Delivery Tracking</h5>
                <input
                  className="form-control mb-2"
                  placeholder="Enter Order ID"
                  value={deliveryId}
                  onChange={(e) => setDeliveryId(e.target.value)}
                />
                <button className="btn btn-outline-primary mb-2" onClick={trackOrder}>
                  Track Delivery
                </button>
                <div className="small">{deliveryStatus || 'No tracking info yet.'}</div>
                {orders.length > 0 && (
                  <div className="small mt-2 text-muted">Latest order: {orders[0].id}</div>
                )}
              </div>

              <div className="card p-3">
                <h5>AI Chatbot Assistant</h5>
                <div className="chatbox mb-2">
                  {chatLog.map((msg) => (
                    <div key={msg.id} className={`small mb-1 ${msg.from === 'bot' ? 'text-primary' : 'text-dark'}`}>
                      <strong>{msg.from === 'bot' ? 'Bot' : 'You'}:</strong> {msg.text}
                    </div>
                  ))}
                </div>
                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask for recommendations, payment, tracking..."
                  />
                  <button className="btn btn-dark" onClick={handleChat}>
                    Send
                  </button>
                </div>
                <div className="mt-2 small">
                  {chatbotFaq.map((item) => (
                    <div key={item.q}>
                      <strong>Q:</strong> {item.q}
                      <br />
                      <span className="text-muted">A: {item.a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default App;
