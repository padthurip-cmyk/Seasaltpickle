/**
 * ============================================ PAYMENT & DELIVERY API INTEGRATION GUIDE ============================================
 * 
 * This module provides production-ready boilerplate for integrating:
 * 1. Razorpay Payment Gateway
 * 2. Shiprocket Delivery Platform
 * 3. Backup delivery service integration
 * 
 * Each section includes detailed comments on implementation steps
 * and API endpoints required for full integration.
 * 
 * ============================================ RAZORPAY PAYMENT INTEGRATION ============================================
 */

/**
 * Razorpay Configuration
 * 
 * Steps to integrate:
 * 1. Sign up at https://razorpay.com
 * 2. Get API keys from dashboard
 * 3. Replace YOUR_RAZORPAY_KEY_ID with actual key
 * 4. Implement backend endpoint: POST /api/orders/create
 */
const RAZORPAY_CONFIG = {
    keyId: 'YOUR_RAZORPAY_KEY_ID', // Replace with actual key
    // Key Secret should NEVER be in frontend code
    // Store in backend environment variables
    
    // Webhook secret for payment verification
    webhookSecret: 'YOUR_RAZORPAY_WEBHOOK_SECRET',
    
    // Base URL for payment processing
    apiEndpoint: 'https://api.razorpay.com/v1'
};

/**
 * Razorpay Payment Handler
 * 
 * Full implementation flow:
 * 1. Create order on backend
 * 2. Display payment form
 * 3. Verify payment signature
 * 4. Update database with payment status
 */
class RazorpayPaymentHandler {
    
    /**
     * Initialize Razorpay checkout
     * 
     * @param {Object} orderData - Order information
     * @param {number} orderData.amount - Order amount in paise (₹100 = 10000 paise)
     * @param {string} orderData.currency - Currency code (INR)
     * @param {Object} orderData.customer - Customer details
     * @param {Array} orderData.items - Cart items
     * @returns {Promise<Object>} Payment response
     */
    static async initiatePayment(orderData) {
        try {
            // Step 1: Create order on backend
            const orderResponse = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: orderData.amount,
                    currency: orderData.currency,
                    receipt: `receipt_${Date.now()}`,
                    notes: {
                        customer_name: orderData.customer.name,
                        order_items: JSON.stringify(orderData.items)
                    }
                })
            });
            
            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }
            
            const order = await orderResponse.json();
            
            // Step 2: Initialize Razorpay checkout
            const options = {
                key: RAZORPAY_CONFIG.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: order.id,
                name: 'SeaSalt Pickles',
                description: `Order for ${orderData.customer.name}`,
                image: 'https://www.seasaltpickles.com/logo.png',
                
                // Prefill customer information
                prefill: {
                    name: orderData.customer.name,
                    email: orderData.customer.email,
                    contact: orderData.customer.phone
                },
                
                // Theme customization
                theme: {
                    color: '#0d9488'
                },
                
                // Callback handlers
                handler: RazorpayPaymentHandler.handlePaymentSuccess,
                modal: {
                    ondismiss: RazorpayPaymentHandler.handlePaymentCancel
                },
                
                // Accepted payment methods
                method: {
                    netbanking: true,
                    card: true,
                    wallet: true,
                    emi: false,
                    upi: true
                }
            };
            
            // Step 3: Load Razorpay script and open checkout
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                
                script.onload = () => {
                    const rzp = new Razorpay(options);
                    
                    // Store order reference for verification
                    window.currentOrder = order;
                    
                    rzp.open();
                    resolve();
                };
                
                script.onerror = () => {
                    reject(new Error('Failed to load Razorpay'));
                };
                
                document.head.appendChild(script);
            });
            
        } catch (error) {
            console.error('Payment initialization error:', error);
            throw error;
        }
    }
    
    /**
     * Handle successful payment
     * 
     * Called after user completes payment successfully
     * Verifies payment signature with backend
     */
    static async handlePaymentSuccess(response) {
        try {
            // Step 4: Verify payment signature
            const verificationResponse = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                })
            });
            
            if (!verificationResponse.ok) {
                throw new Error('Payment verification failed');
            }
            
            const verification = await verificationResponse.json();
            
            if (!verification.isValid) {
                alert('Payment verification failed. Contact support.');
                return;
            }
            
            // Step 5: Create order record in database
            const orderCreationResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    status: 'paid',
                    items: window.appState.cart,
                    total: RazorpayPaymentHandler.calculateTotal()
                })
            });
            
            if (orderCreationResponse.ok) {
                const order = await orderCreationResponse.json();
                
                // Step 6: Trigger delivery integration
                await initializeShiprocketDelivery(order.id);
                
                // Clear cart and redirect
                appState.cart = [];
                saveCartToStorage();
                updateCartUI();
                
                alert(`Payment successful! Order #${order.id} confirmed.`);
                // Redirect to order confirmation page
                // window.location.href = `/order/${order.id}`;
            }
            
        } catch (error) {
            console.error('Payment success handler error:', error);
            alert('An error occurred. Please contact support.');
        }
    }
    
    /**
     * Handle payment cancellation
     */
    static handlePaymentCancel(error) {
        console.log('Payment cancelled:', error);
        alert('Payment was cancelled. Please try again.');
    }
    
    /**
     * Calculate total from cart
     */
    static calculateTotal() {
        return appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
}

/**
 * ============================================ SHIPROCKET DELIVERY INTEGRATION ============================================
 * 
 * Shiprocket handles multi-carrier shipping and tracking
 * 
 * Integration Steps:
 * 1. Create account at https://shiprocket.in
 * 2. Get API credentials
 * 3. Set up pickup locations
 * 4. Implement webhook for tracking updates
 */

const SHIPROCKET_CONFIG = {
    apiEndpoint: 'https://apiv2.shiprocket.in/v1/external',
    authToken: 'YOUR_SHIPROCKET_AUTH_TOKEN', // Replace with actual token
    
    // Default pickup location
    pickupLocationId: 'YOUR_PICKUP_LOCATION_ID',
    
    // Carrier preferences
    carriers: ['Delhivery', 'Ekart', 'Ecom Express', 'FedEx'],
    
    // Webhook endpoint for delivery updates
    webhookUrl: 'https://www.seasaltpickles.com/api/webhooks/shiprocket'
};

/**
 * Shiprocket Delivery Handler
 * 
 * Manages order shipment and tracking
 */
class ShiprocketDeliveryHandler {
    
    /**
     * Create shipment on Shiprocket
     * 
     * @param {Object} order - Order object from database
     * @param {Object} address - Delivery address
     * @returns {Promise<Object>} Shipment response
     */
    static async createShipment(order, address) {
        try {
            // Prepare shipment payload
            const shipmentPayload = {
                order_id: order.id,
                order_date: order.createdAt,
                
                // Pickup details
                pickup_location_id: SHIPROCKET_CONFIG.pickupLocationId,
                
                // Billing address (matches shipping)
                billing_customer_name: address.name,
                billing_email: address.email,
                billing_phone: address.phone,
                billing_address: address.street,
                billing_address_2: address.apartment || '',
                billing_city: address.city,
                billing_state: address.state,
                billing_country: 'India',
                billing_pincode: address.pincode,
                
                // Shipping address (same as billing for simplicity)
                shipping_is_billing: true,
                
                // Order items
                order_items: order.items.map(item => ({
                    name: item.productName,
                    sku: item.id,
                    units: item.quantity,
                    selling_price: item.price,
                    discount: 0,
                    tax: Math.round(item.price * item.quantity * 0.05), // 5% GST
                    hsn_code: '2103.90', // Pickle HSN code
                    sac_code: '',
                    description: `${item.productName} - ${item.size}`
                })),
                
                // Payment method
                payment_method: 'Prepaid',
                sub_total: order.subtotal,
                length: 30,
                breadth: 20,
                height: 15,
                weight: 2.5 // Estimated weight in kg
            };
            
            // API call to create shipment
            const response = await fetch(`${SHIPROCKET_CONFIG.apiEndpoint}/orders/create/adhoc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SHIPROCKET_CONFIG.authToken}`
                },
                body: JSON.stringify(shipmentPayload)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Shiprocket API error: ${error.message}`);
            }
            
            const shipment = await response.json();
            
            // Save shipment tracking info
            await ShiprocketDeliveryHandler.saveTrackingInfo(order.id, shipment);
            
            return shipment;
            
        } catch (error) {
            console.error('Shipment creation error:', error);
            throw error;
        }
    }
    
    /**
     * Get shipment tracking details
     * 
     * @param {string} shipmentId - Shiprocket shipment ID
     * @returns {Promise<Object>} Tracking information
     */
    static async getTrackingStatus(shipmentId) {
        try {
            const response = await fetch(
                `${SHIPROCKET_CONFIG.apiEndpoint}/courier/track/shipment/${shipmentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${SHIPROCKET_CONFIG.authToken}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch tracking status');
            }
            
            const tracking = await response.json();
            return tracking;
            
        } catch (error) {
            console.error('Tracking error:', error);
            throw error;
        }
    }
    
    /**
     * Save tracking information to database
     * 
     * @param {string} orderId - Order ID
     * @param {Object} shipment - Shipment object from Shiprocket
     */
    static async saveTrackingInfo(orderId, shipment) {
        const response = await fetch('/api/orders/tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order_id: orderId,
                shipment_id: shipment.shipment_id,
                tracking_id: shipment.tracking_id,
                carrier: shipment.courier_name,
                status: 'created'
            })
        });
        
        return response.json();
    }
    
    /**
     * Cancel shipment
     * 
     * @param {string} shipmentId - Shiprocket shipment ID
     */
    static async cancelShipment(shipmentId) {
        const response = await fetch(
            `${SHIPROCKET_CONFIG.apiEndpoint}/orders/cancel/adhoc/${shipmentId}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SHIPROCKET_CONFIG.authToken}`
                }
            }
        );
        
        return response.json();
    }
}

/**
 * ============================================ BACKEND API ENDPOINTS (NODE.JS EXAMPLE) ============================================
 * 
 * The following are example backend implementations you should create:
 * 
 * ```javascript
 * // POST /api/orders/create - Create Razorpay order
 * app.post('/api/orders/create', async (req, res) => {
 *   try {
 *     const { amount, currency, receipt, notes } = req.body;
 *     
 *     const order = await razorpayInstance.orders.create({
 *       amount,
 *       currency,
 *       receipt,
 *       notes
 *     });
 *     
 *     res.json(order);
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * 
 * // POST /api/payments/verify - Verify Razorpay signature
 * app.post('/api/payments/verify', (req, res) => {
 *   try {
 *     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
 *     
 *     const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
 *     shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
 *     const digest = shasum.digest('hex');
 *     
 *     const isValid = digest === razorpay_signature;
 *     
 *     res.json({ isValid });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * 
 * // POST /api/orders - Create order in database
 * app.post('/api/orders', async (req, res) => {
 *   try {
 *     const order = await Order.create({
 *       razorpay_order_id: req.body.razorpay_order_id,
 *       razorpay_payment_id: req.body.razorpay_payment_id,
 *       status: 'paid',
 *       items: req.body.items,
 *       total: req.body.total,
 *       createdAt: new Date()
 *     });
 *     
 *     res.json(order);
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * });
 * ```
 */

/**
 * Complete integration example (Frontend)
 * 
 * Usage:
 * 1. Collect user address via form
 * 2. Call RazorpayPaymentHandler.initiatePayment()
 * 3. After successful payment, ShiprocketDeliveryHandler.createShipment() is called
 * 4. Customer receives tracking info
 */
async function completeCheckoutFlow(cartItems, customerInfo, deliveryAddress) {
    try {
        // Calculate totals
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = Math.round(subtotal * 0.05);
        const shipping = subtotal > 500 ? 0 : 50;
        const total = subtotal + tax + shipping;
        
        // Initiate payment
        await RazorpayPaymentHandler.initiatePayment({
            amount: total * 100, // Convert to paise
            currency: 'INR',
            customer: customerInfo,
            items: cartItems
        });
        
        // ShiprocketDeliveryHandler.createShipment() will be called after payment success
        
    } catch (error) {
        console.error('Checkout error:', error);
        alert('An error occurred. Please try again.');
    }
}

/**
 * Export functions for use in main app
 */
window.RazorpayPaymentHandler = RazorpayPaymentHandler;
window.ShiprocketDeliveryHandler = ShiprocketDeliveryHandler;
window.completeCheckoutFlow = completeCheckoutFlow;
