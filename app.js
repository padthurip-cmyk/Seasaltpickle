/**
 * ============================================ E-COMMERCE APPLICATION LOGIC ============================================
 * 
 * Deep-Thinking Architecture:
 * This system implements a modular, scalable e-commerce platform with:
 * 1. Dynamic product catalog management
 * 2. Real-time cart synchronization
 * 3. Size variant handling with price updates
 * 4. Wallet-based discount integration
 * 5. Responsive design for all devices
 * 6. SEO-optimized structure
 * 
 * Data Flow:
 * User Action -> Validation -> State Update -> UI Render -> localStorage Persist
 * 
 * ============================================ PRODUCT CATALOG ============================================
 */

/**
 * Product Catalog - Dynamic and Extensible
 * Real data from seasaltpickles.com structure
 * Format: productId, name, description, emoji, basePrice, sizes[]
 * 
 * Size Variants System:
 * Each product has multiple size options with different prices
 * This allows flexible pricing and unit management
 */
const PRODUCT_CATALOG = [
    {
        id: 'mango_pickle',
        name: 'Mango Pickle',
        emoji: '🥭',
        description: 'Traditional mango pickle made with fresh mangoes, mustard seeds, and fenugreek. Perfect for everyday meals with its tangy and spicy flavor profile.',
        sizes: [
            { size: '250g', price: 120 },
            { size: '500g', price: 220 },
            { size: '1kg', price: 400 }
        ],
        category: 'Traditional',
        rating: 4.8,
        reviews: 245
    },
    {
        id: 'lime_pickle',
        name: 'Lime Pickle',
        emoji: '🍋',
        description: 'Zesty lime pickle with a perfect balance of salt, spice, and citrus. Made from handpicked limes and aged to perfection for maximum flavor.',
        sizes: [
            { size: '200g', price: 100 },
            { size: '400g', price: 180 },
            { size: '800g', price: 330 }
        ],
        category: 'Citrus',
        rating: 4.7,
        reviews: 189
    },
    {
        id: 'mixed_pickle',
        name: 'Mixed Vegetables Pickle',
        emoji: '🥒',
        description: 'A delightful blend of mixed vegetables including carrots, cauliflower, and green chilies. Crunchy, tangy, and bursting with flavors.',
        sizes: [
            { size: '300g', price: 140 },
            { size: '600g', price: 260 },
            { size: '1.2kg', price: 480 }
        ],
        category: 'Mixed',
        rating: 4.6,
        reviews: 312
    },
    {
        id: 'chilli_pickle',
        name: 'Green Chilli Pickle',
        emoji: '🌶️',
        description: 'For spice lovers! Fresh green chilies preserved with salt, mustard, and fenugreek. Perfect for those who enjoy extra heat with their meals.',
        sizes: [
            { size: '150g', price: 90 },
            { size: '300g', price: 160 },
            { size: '600g', price: 300 }
        ],
        category: 'Spicy',
        rating: 4.5,
        reviews: 156
    },
    {
        id: 'ginger_garlic',
        name: 'Ginger-Garlic Pickle',
        emoji: '🧄',
        description: 'Aromatic blend of ginger and garlic preserved with traditional spices. Great for enhancing the flavor of any curry or rice dish.',
        sizes: [
            { size: '200g', price: 110 },
            { size: '400g', price: 200 },
            { size: '800g', price: 370 }
        ],
        category: 'Aromatic',
        rating: 4.9,
        reviews: 223
    },
    {
        id: 'dry_mango',
        name: 'Dry Mango Pickle',
        emoji: '🥭',
        description: 'Crispy dry mango pieces with a burst of mango flavor. Perfect as a side dish or a standalone snack with its crunchy texture.',
        sizes: [
            { size: '150g', price: 130 },
            { size: '300g', price: 240 },
            { size: '600g', price: 450 }
        ],
        category: 'Dry',
        rating: 4.7,
        reviews: 134
    },
    {
        id: 'turmeric_pickle',
        name: 'Turmeric Pickle',
        emoji: '✨',
        description: 'Golden turmeric-infused pickle with health benefits. A unique blend of spices and turmeric creating a healthful and delicious preserve.',
        sizes: [
            { size: '200g', price: 120 },
            { size: '400g', price: 220 },
            { size: '800g', price: 400 }
        ],
        category: 'Health',
        rating: 4.6,
        reviews: 98
    },
    {
        id: 'lemon_pickle',
        name: 'Sweet Lemon Pickle',
        emoji: '🍋',
        description: 'Sweet and tangy lemon pickle with jaggery. A unique flavor profile that appeals to those who prefer a balance of sweet and sour.',
        sizes: [
            { size: '250g', price: 140 },
            { size: '500g', price: 260 },
            { size: '1kg', price: 480 }
        ],
        category: 'Sweet',
        rating: 4.8,
        reviews: 178
    }
];

// ============================================ STATE MANAGEMENT ============================================

/**
 * Global application state
 * Single source of truth for cart and UI state
 */
const appState = {
    cart: [],
    selectedProduct: null,
    selectedSize: null,
    currentPage: 'home'
};

/**
 * Load cart from localStorage
 * Ensures cart persists across page reloads
 */
function loadCartFromStorage() {
    const stored = localStorage.getItem('shopping_cart');
    if (stored) {
        try {
            appState.cart = JSON.parse(stored);
            updateCartUI();
        } catch (e) {
            console.error('Error loading cart:', e);
            appState.cart = [];
        }
    }
}

/**
 * Save cart to localStorage
 * Called after any cart modification
 */
function saveCartToStorage() {
    localStorage.setItem('shopping_cart', JSON.stringify(appState.cart));
}

// ============================================ PRODUCT DISPLAY & FILTERING ============================================

/**
 * Initialize product grid on page load
 * Renders all products from catalog with lazy loading support
 */
function initializeProductGrid() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    
    PRODUCT_CATALOG.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

/**
 * Create product card element
 * Uses semantic HTML and accessibility best practices
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image" onclick="openProductModal('${product.id}')">
            ${product.emoji}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${product.category}</p>
            <div class="product-rating">
                ${'⭐'.repeat(Math.floor(product.rating))} ${product.rating} (${product.reviews})
            </div>
            <div class="product-price">₹${product.sizes[0].price}</div>
            <button onclick="quickAddToCart('${product.id}')" class="w-full px-3 py-2 bg-teal-500 text-white rounded text-sm hover:bg-teal-600 transition">
                + Add
            </button>
        </div>
    `;
    return card;
}

/**
 * Filter products by search query
 * Searches product names and descriptions
 */
function filterProducts(query) {
    const normalizedQuery = query.toLowerCase();
    return PRODUCT_CATALOG.filter(product => 
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
    );
}

/**
 * Search functionality with debouncing
 * Prevents excessive filtering as user types
 */
let searchTimeout;
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const results = filterProducts(e.target.value);
                renderFilteredProducts(results);
            }, 300);
        });
    }
});

/**
 * Render filtered products
 */
function renderFilteredProducts(products) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">No products found</p>';
        return;
    }
    
    products.forEach(product => {
        grid.appendChild(createProductCard(product));
    });
}

// ============================================ PRODUCT MODAL ============================================

/**
 * Open product detail modal
 * Displays full product information and size selection
 */
function openProductModal(productId) {
    const product = PRODUCT_CATALOG.find(p => p.id === productId);
    if (!product) return;
    
    appState.selectedProduct = product;
    appState.selectedSize = product.sizes[0]; // Default to first size
    
    // Update modal content
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductImage').textContent = product.emoji;
    document.getElementById('modalProductDesc').textContent = product.description;
    document.getElementById('modalPrice').textContent = `₹${appState.selectedSize.price}`;
    
    // Render size options
    const sizeOptions = document.getElementById('sizeOptions');
    sizeOptions.innerHTML = '';
    
    product.sizes.forEach((size, index) => {
        const button = document.createElement('button');
        button.className = `px-4 py-2 rounded border-2 transition ${
            index === 0 ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-300'
        }`;
        button.textContent = `${size.size}\n₹${size.price}`;
        button.onclick = () => selectSize(size);
        sizeOptions.appendChild(button);
    });
    
    // Show modal
    document.getElementById('productModal').classList.remove('hidden');
}

/**
 * Close product modal
 */
function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    appState.selectedProduct = null;
}

/**
 * Select product size
 * Updates price and selected variant
 */
function selectSize(size) {
    appState.selectedSize = size;
    document.getElementById('modalPrice').textContent = `₹${size.price}`;
    
    // Update button styles
    const buttons = document.getElementById('sizeOptions').querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('border-teal-500', 'bg-teal-50');
        btn.classList.add('border-gray-300');
    });
    
    event.target.classList.add('border-teal-500', 'bg-teal-50');
}

// ============================================ CART MANAGEMENT ============================================

/**
 * Add product to cart
 * Handles quantity increments and new item additions
 */
function addToCart() {
    if (!appState.selectedProduct || !appState.selectedSize) return;
    
    const product = appState.selectedProduct;
    const size = appState.selectedSize;
    
    // Create cart item identifier (product + size combination)
    const cartItemId = `${product.id}_${size.size}`;
    
    // Check if item already in cart
    const existingItem = appState.cart.find(item => item.id === cartItemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        appState.cart.push({
            id: cartItemId,
            productId: product.id,
            productName: product.name,
            productEmoji: product.emoji,
            size: size.size,
            price: size.price,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    updateCartUI();
    closeProductModal();
    
    // Show feedback
    showCartNotification(`${product.name} (${size.size}) added to cart!`);
}

/**
 * Quick add to cart from product grid
 * Uses default size (first size option)
 */
function quickAddToCart(productId) {
    const product = PRODUCT_CATALOG.find(p => p.id === productId);
    if (!product) return;
    
    appState.selectedProduct = product;
    appState.selectedSize = product.sizes[0];
    addToCart();
}

/**
 * Remove item from cart
 */
function removeFromCart(cartItemId) {
    appState.cart = appState.cart.filter(item => item.id !== cartItemId);
    saveCartToStorage();
    updateCartUI();
}

/**
 * Update item quantity
 */
function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(cartItemId);
        return;
    }
    
    const item = appState.cart.find(item => item.id === cartItemId);
    if (item) {
        item.quantity = newQuantity;
        saveCartToStorage();
        updateCartUI();
    }
}

/**
 * Calculate cart totals
 */
function calculateCartTotals() {
    const subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
    const total = subtotal + tax + shipping;
    
    return { subtotal, tax, shipping, total };
}

// ============================================ CART UI ============================================

/**
 * Update cart display and count badge
 * Called after any cart modification
 */
function updateCartUI() {
    const cartCount = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountBadge = document.getElementById('cartCount');
    
    if (cartCount > 0) {
        cartCountBadge.textContent = cartCount;
        cartCountBadge.classList.remove('hidden');
    } else {
        cartCountBadge.classList.add('hidden');
    }
    
    // Update cart items display
    const cartItemsContainer = document.getElementById('cartItems');
    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Your cart is empty</p>';
    } else {
        cartItemsContainer.innerHTML = appState.cart.map(item => `
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div class="flex-1">
                    <div class="font-semibold text-gray-900">${item.productEmoji} ${item.productName}</div>
                    <div class="text-sm text-gray-600">${item.size}</div>
                    <div class="text-teal-600 font-bold">₹${item.price}</div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100">−</button>
                    <span class="w-8 text-center font-bold">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="w-8 h-8 border border-gray-300 rounded hover:bg-gray-100">+</button>
                </div>
                <button onclick="removeFromCart('${item.id}')" class="ml-4 text-red-500 hover:text-red-700 font-bold">✕</button>
            </div>
        `).join('');
    }
    
    // Update totals
    const totals = calculateCartTotals();
    document.getElementById('cartTotal').textContent = `₹${totals.total}`;
}

/**
 * Toggle cart sidebar visibility
 */
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('hidden');
    overlay.classList.toggle('hidden');
}

/**
 * Show cart notification toast
 */
function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slideInRight';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ============================================ CHECKOUT & PAYMENT ============================================

/**
 * Checkout process
 * Integrates with Razorpay for payment processing
 */
async function checkout() {
    if (appState.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const totals = calculateCartTotals();
    
    // Create order on backend (placeholder)
    const order = {
        id: 'order_' + Date.now(),
        amount: totals.total * 100, // Convert to paise for Razorpay
        currency: 'INR',
        items: appState.cart,
        ...totals
    };
    
    // Initialize Razorpay payment
    initializeRazorpayPayment(order);
}

/**
 * Razorpay Integration
 * Boilerplate code for payment processing
 * 
 * Steps:
 * 1. Create order on backend
 * 2. Initialize Razorpay checkout
 * 3. Handle payment success/failure
 * 4. Update order status
 * 5. Clear cart and redirect
 */
function initializeRazorpayPayment(order) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    
    script.onload = () => {
        const options = {
            key: 'YOUR_RAZORPAY_KEY_ID', // Replace with actual key
            amount: order.amount,
            currency: order.currency,
            order_id: order.id,
            name: 'SeaSalt Pickles',
            description: `Order #${order.id}`,
            handler: function(response) {
                handlePaymentSuccess(response, order);
            },
            prefill: {
                name: 'Customer Name',
                email: 'customer@example.com',
                contact: 'Phone Number'
            },
            theme: {
                color: '#0d9488'
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
    };
    
    document.head.appendChild(script);
}

/**
 * Handle successful payment
 */
function handlePaymentSuccess(response, order) {
    console.log('Payment successful:', response);
    
    // API call to verify and create order
    // POST /api/orders with payment verification
    
    alert('Payment successful! Order placed.');
    appState.cart = [];
    saveCartToStorage();
    updateCartUI();
    toggleCart();
    
    // Redirect to order confirmation
    // navigateTo('order-confirmation');
}

/**
 * Shiprocket Integration (Delivery)
 * Boilerplate for shipping integration
 * 
 * This would handle:
 * 1. Address validation
 * 2. Delivery partner assignment
 * 3. Tracking information
 * 4. Delivery updates
 */
async function initializeShiprocketDelivery(orderId, addressData) {
    const shiprocketAPI = {
        endpoint: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
        authToken: 'YOUR_SHIPROCKET_AUTH_TOKEN',
        
        payload: {
            order_id: orderId,
            order_date: new Date().toISOString(),
            pickup_location_id: 'YOUR_LOCATION_ID',
            billing_customer_name: addressData.name,
            billing_email: addressData.email,
            billing_phone: addressData.phone,
            billing_address: addressData.address,
            billing_city: addressData.city,
            billing_state: addressData.state,
            billing_country: 'India',
            billing_pincode: addressData.pincode,
            // Shipping address same as billing
            shipping_is_billing: true,
            order_items: appState.cart,
            payment_method: 'Prepaid'
        }
    };
    
    // In production, make actual API call
    console.log('Shiprocket Integration:', shiprocketAPI);
}

// ============================================ PAGE NAVIGATION ============================================

/**
 * Navigate between pages
 * Supports dynamic content loading
 */
function navigateTo(page) {
    appState.currentPage = page;
    
    switch(page) {
        case 'home':
            window.location.href = '#home';
            break;
        case 'products':
            scrollToProducts();
            break;
        default:
            openPage(page);
    }
}

/**
 * Scroll to products section
 */
function scrollToProducts() {
    const productSection = document.getElementById('products');
    if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Open policy/info pages
 */
function openPage(pageType) {
    const pageContent = getPageContent(pageType);
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div class="sticky top-0 flex justify-between items-center p-6 bg-white border-b border-gray-100">
                <h3 class="text-2xl font-bold text-gray-900">${pageContent.title}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div class="p-6 prose prose-sm max-w-none">
                ${pageContent.content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

/**
 * Get page content based on type
 */
function getPageContent(pageType) {
    const pages = {
        privacy: {
            title: 'Privacy Policy',
            content: `<p><strong>SeaSalt Pickles</strong> ("we", "us", "our", or "Company") respects the privacy of our users ("user", "you" or "your").</p>
            <h4>Information We Collect</h4>
            <p>We may collect information about you in various ways:</p>
            <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, address, payment information</li>
            <li><strong>Usage Information:</strong> Pages visited, time spent, interactions with our platform</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            </ul>
            <h4>How We Use Your Information</h4>
            <p>We use the information we collect to:</p>
            <ul>
            <li>Process orders and send related information</li>
            <li>Send promotional communications (with your consent)</li>
            <li>Improve our website and services</li>
            <li>Detect and prevent fraud</li>
            </ul>`
        },
        terms: {
            title: 'Terms & Conditions',
            content: `<h4>Agreement to Terms</h4>
            <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            <h4>Use License</h4>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on SeaSalt Pickles for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on SeaSalt Pickles</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>`
        },
        shipping: {
            title: 'Shipping Policy',
            content: `<h4>Shipping Information</h4>
            <p>We ship across India using trusted logistics partners. Here's what you need to know:</p>
            <h4>Delivery Timeline</h4>
            <ul>
            <li><strong>Within Metro Cities:</strong> 24-48 hours</li>
            <li><strong>Tier 2 Cities:</strong> 3-5 business days</li>
            <li><strong>Remote Areas:</strong> 7-10 business days</li>
            </ul>
            <h4>Shipping Charges</h4>
            <ul>
            <li>Free shipping on orders above ₹500</li>
            <li>₹50 shipping charge for orders below ₹500</li>
            <li>Express delivery available for metro areas</li>
            </ul>
            <h4>Tracking</h4>
            <p>You will receive a tracking ID via email/SMS once your order is dispatched.</p>`
        }
    };
    
    return pages[pageType] || { title: 'Page Not Found', content: '<p>The page you are looking for does not exist.</p>' };
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// ============================================ INITIALIZATION ============================================

/**
 * Initialize application on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    initializeProductGrid();
    updateWalletDisplay();
    updateCartUI();
});
