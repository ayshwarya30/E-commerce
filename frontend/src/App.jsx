import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Books', 'Sports'];

const chatbotFaq = [
  {
    q: 'How can I find budget-friendly products?',
    a: 'Use category filter and search terms like budget, low price, and affordable.'
  },
  {
    q: 'How do I track my order?',
    a: 'Open Delivery Tracking and enter your order ID.'
  },
  {
    q: 'Can I pay with UPI?',
    a: 'Yes, UPI, Card, Net Banking and Cash on Delivery are available.'
  }
];

const hasWindow = globalThis.window !== undefined;
const voiceApiAvailable =
  hasWindow &&
  ('webkitSpeechRecognition' in globalThis.window || 'SpeechRecognition' in globalThis.window);

const getSessionId = () => {
  if (!hasWindow) return 'server-session';

  const key = 'ecommerce_session_id';
  const existing = globalThis.window.localStorage.getItem(key);
  if (existing) return existing;

  const generated =
    globalThis.window.crypto?.randomUUID?.() ||
    `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  globalThis.window.localStorage.setItem(key, generated);
  return generated;
};

const formatMoney = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function App() {
  const [mode, setMode] = useState('login');
  const [authType, setAuthType] = useState('registered');
  const [profile, setProfile] = useState({ name: '', email: '', password: '' });

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loadingProducts, setLoadingProducts] = useState(false);

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
      text: 'Namaste! I support only this e-commerce app and can recommend products from catalog.'
    }
  ]);
  const [chatOpen, setChatOpen] = useState(false);

  const [voiceMessage, setVoiceMessage] = useState('');
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);

  const sessionId = useMemo(() => getSessionId(), []);
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL || '', []);
  const budgetAlertedRef = useRef(false);

  const notify = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setNotifications((prev) => [...prev, { id, type, message }]);

    globalThis.setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const requestJson = useCallback(
    async (path, options = {}) => {
      const headers = { ...(options.headers || {}) };
      if (options.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || `Request failed: ${response.status}`);
      }
      return data;
    },
    [apiBaseUrl]
  );

  const loadProducts = useCallback(
    async (searchTerm = '', category = 'All') => {
      setLoadingProducts(true);
      try {
        const params = new URLSearchParams({ search: searchTerm, category });
        const data = await requestJson(`/api/products?${params.toString()}`);
        setProducts(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProducts(false);
      }
    },
    [requestJson]
  );

  const loadCart = useCallback(async () => {
    const data = await requestJson(`/api/cart?sessionId=${encodeURIComponent(sessionId)}`);
    setCart(Array.isArray(data) ? data : []);
  }, [requestJson, sessionId]);

  const loadWishlist = useCallback(async () => {
    const data = await requestJson(`/api/wishlist?sessionId=${encodeURIComponent(sessionId)}`);
    setWishlist(Array.isArray(data) ? data : []);
  }, [requestJson, sessionId]);

  const loadOrders = useCallback(async () => {
    const data = await requestJson(`/api/orders?sessionId=${encodeURIComponent(sessionId)}`);
    setOrders(Array.isArray(data) ? data : []);
  }, [requestJson, sessionId]);

  useEffect(() => {
    Promise.all([loadCart(), loadWishlist(), loadOrders()]).catch((err) => {
      setError(err.message);
      notify('error', err.message);
    });
  }, [loadCart, loadWishlist, loadOrders, notify]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(search, selectedCategory);
    }, 300);

    return () => clearTimeout(timer);
  }, [loadProducts, search, selectedCategory]);

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

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const budgetExceeded = cartTotal > budgetLimit;
  const budgetUsedPercent = Math.min(100, Math.round(((cartTotal || 0) / (budgetLimit || 1)) * 100));

  useEffect(() => {
    if (budgetExceeded && !budgetAlertedRef.current) {
      notify(
        'warning',
        `Budget exceeded. Cart total is ${formatMoney(cartTotal)} while your limit is ${formatMoney(
          budgetLimit
        )}.`
      );
      budgetAlertedRef.current = true;
      return;
    }

    if (!budgetExceeded) {
      budgetAlertedRef.current = false;
    }
  }, [budgetExceeded, cartTotal, budgetLimit, notify]);

  const validateLogin = () => {
    if (!profile.name.trim()) {
      notify('warning', 'Name is required.');
      return false;
    }
    if (!emailRegex.test(profile.email.trim())) {
      notify('warning', 'Enter a valid email address.');
      return false;
    }
    if (profile.password.length < 6) {
      notify('warning', 'Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const continueToShop = () => {
    if (!validateLogin()) return;
    setMode('shop');
    notify('success', authType === 'registered' ? 'Login successful.' : 'Account created successfully.');
  };

  const addToCart = async (product) => {
    const projectedTotal = cartTotal + Number(product.price || 0);
    if (projectedTotal > budgetLimit) {
      notify(
        'warning',
        `Cannot add ${product.name}. This would exceed your budget limit of ${formatMoney(budgetLimit)}.`
      );
      return;
    }

    try {
      await requestJson('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ sessionId, productId: product.id, qty: 1 })
      });
      await loadCart();
      setError('');
      notify('success', `${product.name} added to cart.`);
    } catch (err) {
      setError(err.message);
      notify('error', err.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await requestJson(`/api/cart/items/${productId}?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE'
      });
      await loadCart();
      setError('');
      notify('info', 'Item removed from cart.');
    } catch (err) {
      setError(err.message);
      notify('error', err.message);
    }
  };

  const addToWishlist = async (product) => {
    try {
      await requestJson('/api/wishlist/items', {
        method: 'POST',
        body: JSON.stringify({ sessionId, productId: product.id })
      });
      await loadWishlist();
      setError('');
      notify('success', `${product.name} added to wishlist.`);
    } catch (err) {
      setError(err.message);
      notify('error', err.message);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await requestJson(`/api/wishlist/items/${productId}?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'DELETE'
      });
      await loadWishlist();
      setError('');
      notify('info', 'Item removed from wishlist.');
    } catch (err) {
      setError(err.message);
      notify('error', err.message);
    }
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      notify('info', 'Your cart is empty. Add items before placing an order.');
      return;
    }

    if (budgetExceeded) {
      notify('warning', 'Order blocked because cart total exceeds your budget limit.');
      return;
    }

    try {
      const createdOrder = await requestJson('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ sessionId, paymentMethod })
      });
      setOrders((prev) => [createdOrder, ...prev]);
      setDeliveryId(createdOrder.id);
      setDeliveryStatus('Order Confirmed -> Packed -> Shipped -> Out for Delivery -> Delivered');
      setCart([]);
      setError('');
      notify('success', `Order ${createdOrder.id} placed successfully.`);
    } catch (err) {
      setError(err.message);
      notify('error', err.message);
    }
  };

  const trackOrder = async () => {
    if (!deliveryId.trim()) {
      notify('info', 'Enter an order ID to track delivery.');
      return;
    }

    try {
      const result = await requestJson(
        `/api/orders/track/${encodeURIComponent(deliveryId.trim())}?sessionId=${encodeURIComponent(sessionId)}`
      );
      setDeliveryStatus(result.message || 'No tracking info yet.');
      setError('');
      notify('info', result.message || 'Tracking updated.');
    } catch (err) {
      setError(err.message);
      notify('error', err.message);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();

    setChatLog((prev) => [...prev, { id: `user-${Date.now()}`, from: 'user', text: userText }]);
    setChatInput('');

    try {
      const data = await requestJson('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userText })
      });

      setChatLog((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, from: 'bot', text: data.reply || 'No response from assistant.' }
      ]);
      setError('');
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          from: 'bot',
          text: 'Chat service is unavailable right now. Please try again.'
        }
      ]);
      setError(err.message);
      notify('error', err.message);
    }
  };

  const startVoiceInput = () => {
    if (!voiceApiAvailable) {
      setVoiceMessage('Voice API not supported in this browser.');
      notify('info', 'Voice API is not supported in this browser.');
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
      notify('info', `Voice captured: ${transcript}`);
    };
    recognition.start();
  };

  const loginCard = (
    <div className="auth-wrapper">
      <div className="auth-card">
        <p className="eyebrow">E-commerce Control Room</p>
        <h1>Sign in to start shopping</h1>
        <p className="auth-copy">Manage budget, track orders, and use AI shopping support in one workspace.</p>

        <div className="auth-toggle">
          <button
            className={`toggle-btn ${authType === 'registered' ? 'active' : ''}`}
            onClick={() => setAuthType('registered')}
          >
            Registered
          </button>
          <button
            className={`toggle-btn ${authType === 'new' ? 'active' : ''}`}
            onClick={() => setAuthType('new')}
          >
            New User
          </button>
        </div>

        <input
          className="input"
          placeholder="Full Name"
          value={profile.name}
          onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={profile.email}
          onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={profile.password}
          onChange={(e) => setProfile((prev) => ({ ...prev, password: e.target.value }))}
        />

        <button className="primary-btn wide" onClick={continueToShop}>
          {authType === 'registered' ? 'Login' : 'Create Account'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-root">
      <div className="toast-stack">
        {notifications.map((item) => (
          <div key={item.id} className={`toast-item ${item.type}`}>
            {item.message}
          </div>
        ))}
      </div>

      {mode === 'login' ? (
        loginCard
      ) : (
        <div className="app-shell">
          <header className="topbar">
            <div>
              <p className="eyebrow">Smart Commerce Workspace</p>
              <h2>Welcome {profile.name || 'Shopper'}</h2>
            </div>
            <div className="topbar-actions">
              <span className="chip">Session: {sessionId.slice(0, 8)}</span>
              <button className="ghost-btn" onClick={() => setMode('login')}>
                Logout
              </button>
            </div>
          </header>

          {error && <div className="error-banner">{error}</div>}

          <div className="layout-grid">
            <section className="panel large-panel">
              <div className="panel-head">
                <h3>Product Discovery</h3>
                <span>{products.length} results</span>
              </div>

              <div className="control-grid">
                <div className="control-field">
                  <label>Search Products</label>
                  <input
                    className="input"
                    placeholder="Search by name or description"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="control-field">
                  <label>Category</label>
                  <select
                    className="input"
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
                </div>

                <div className="control-field push-end">
                  <button className="secondary-btn" onClick={startVoiceInput}>
                    Voice Search
                  </button>
                </div>
              </div>

              {voiceMessage && <p className="hint-text">Voice input: {voiceMessage}</p>}

              <div className="product-grid">
                {!loadingProducts &&
                  products.slice(0, 120).map((product) => (
                    <article className="product-card" key={product.id}>
                      <div className="card-top">
                        <span className="category-tag">{product.category}</span>
                        <span className="rating-tag">Rating {product.rating}</span>
                      </div>
                      <h4>{product.name}</h4>
                      <p>{product.description}</p>
                      <div className="price-row">
                        <strong>{formatMoney(product.price)}</strong>
                      </div>
                      <div className="card-actions">
                        <button className="primary-btn" onClick={() => addToCart(product)}>
                          Add Cart
                        </button>
                        <button className="ghost-btn" onClick={() => addToWishlist(product)}>
                          Wishlist
                        </button>
                      </div>
                    </article>
                  ))}

                {loadingProducts && <div className="loading-box">Loading products...</div>}
              </div>
            </section>

            <aside className="side-stack">
              <section className="panel">
                <div className="panel-head">
                  <h3>Budget Guard</h3>
                  <span>{budgetType}</span>
                </div>

                <select className="input" value={budgetType} onChange={(e) => setBudgetType(e.target.value)}>
                  <option value="monthly">Monthly Budget</option>
                  <option value="yearly">Yearly Budget</option>
                </select>

                <input
                  className="input"
                  type="number"
                  min="500"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(Number(e.target.value) || 0)}
                />

                <div className="meter-track">
                  <div
                    className={`meter-fill ${budgetExceeded ? 'danger' : ''}`}
                    style={{ width: `${budgetUsedPercent}%` }}
                  />
                </div>

                <p className={`budget-text ${budgetExceeded ? 'danger' : ''}`}>
                  Cart: {formatMoney(cartTotal)} / Limit: {formatMoney(budgetLimit)}
                </p>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <h3>Cart and Checkout</h3>
                  <span>{cart.length} items</span>
                </div>

                <ul className="compact-list">
                  {cart.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>
                          {item.qty} x {formatMoney(item.price)}
                        </span>
                      </div>
                      <button className="link-btn" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>

                {cart.length === 0 && <p className="hint-text">Your cart is empty.</p>}

                <div className="checkout-block">
                  <p className="total-line">Total: {formatMoney(cartTotal)}</p>
                  <select
                    className="input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Net Banking</option>
                    <option>Cash on Delivery</option>
                  </select>
                  <button
                    className="primary-btn wide"
                    onClick={placeOrder}
                    disabled={cart.length === 0 || budgetExceeded}
                  >
                    Place Order
                  </button>
                </div>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <h3>Wishlist</h3>
                  <span>{wishlist.length}</span>
                </div>

                <ul className="compact-list">
                  {wishlist.slice(0, 8).map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{formatMoney(item.price)}</span>
                      </div>
                      <button className="link-btn" onClick={() => removeFromWishlist(item.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>

                {wishlist.length === 0 && <p className="hint-text">No wishlist items yet.</p>}
              </section>

              <section className="panel">
                <div className="panel-head">
                  <h3>Delivery Tracking</h3>
                  <span>{orders.length > 0 ? orders[0].id : 'No orders'}</span>
                </div>

                <input
                  className="input"
                  placeholder="Enter Order ID"
                  value={deliveryId}
                  onChange={(e) => setDeliveryId(e.target.value)}
                />
                <button className="secondary-btn wide" onClick={trackOrder}>
                  Track Delivery
                </button>
                <p className="hint-text">{deliveryStatus || 'No tracking info yet.'}</p>
              </section>
            </aside>
          </div>

          <button className="chat-fab" onClick={() => setChatOpen((prev) => !prev)}>
            {chatOpen ? 'Close Assistant' : 'AI Assistant'}
          </button>

          {chatOpen && (
            <section className="chat-popup">
              <div className="panel-head chat-popup-head">
                <h3>AI Assistant</h3>
                <span>E-commerce only</span>
              </div>

              <div className="chatbox">
                {chatLog.map((msg) => (
                  <div key={msg.id} className={`chat-line ${msg.from === 'bot' ? 'bot' : 'user'}`}>
                    <strong>{msg.from === 'bot' ? 'Bot' : 'You'}:</strong> {msg.text}
                  </div>
                ))}
              </div>

              <div className="chat-row">
                <input
                  className="input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask product, budget, payment, order, delivery"
                />
                <button className="primary-btn" onClick={handleChat}>
                  Send
                </button>
              </div>

              <div className="faq-list">
                {chatbotFaq.map((item) => (
                  <div key={item.q} className="faq-item">
                    <p>
                      <strong>Q:</strong> {item.q}
                    </p>
                    <p>
                      <strong>A:</strong> {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
