/**
 * ============================================ BACKEND API BOILERPLATE ============================================
 * 
 * Node.js + Express Backend for SeaSalt Pickles E-Commerce Platform
 * 
 * This is a complete implementation guide for:
 * 1. Razorpay payment processing
 * 2. Shiprocket delivery integration
 * 3. Order management
 * 4. Customer data handling
 * 
 * Installation:
 * npm install express razorpay axios dotenv mongoose cors
 * 
 * ============================================ SETUP & DEPENDENCIES ============================================
 */

// server.js (Backend Implementation Example)
/*
const express = require('express');
const razorpay = require('razorpay');
const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        'https://www.seasaltpickles.com',
        'http://localhost:3000',
        'http://localhost:5500'
    ]
}));

// ============================================ RAZORPAY CONFIGURATION ============================================

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ============================================ ORDER ENDPOINTS ============================================

/**
 * POST /api/orders/create
 * Create Razorpay order
 */
app.post('/api/orders/create', async (req, res) => {
    try {
        const { amount, currency, receipt, notes } = req.body;
        
        // Validate input
        if (!amount || !currency) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create order in Razorpay
        const order = await razorpayInstance.orders.create({
            amount: amount, // In paise
            currency: currency || 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || {},
            partial_payment: false,
            first_payment_amount: amount
        });
        
        // Log order creation
        console.log(`Order created: ${order.id}`);
        
        res.json({
            success: true,
            order: order
        });
        
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/payments/verify
 * Verify Razorpay payment signature
 */
app.post('/api/payments/verify', (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;
        
        // Reconstruct signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');
        
        const isValid = expectedSignature === razorpay_signature;
        
        if (isValid) {
            console.log(`Payment verified: ${razorpay_payment_id}`);
            res.json({ 
                success: true, 
                isValid: true,
                message: 'Payment verified successfully'
            });
        } else {
            console.warn(`Payment verification failed: ${razorpay_payment_id}`);
            res.status(400).json({ 
                success: false, 
                isValid: false,
                error: 'Payment signature verification failed'
            });
        }
        
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/orders
 * Create order in database after payment success
 */
app.post('/api/orders', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            status,
            items,
            total,
            customer_info,
            delivery_address
        } = req.body;
        
        // Create order object
        const order = {
            id: `ORD_${Date.now()}`,
            razorpay_order_id,
            razorpay_payment_id,
            status: status || 'confirmed',
            items: items || [],
            total: total || 0,
            customer_info: customer_info || {},
            delivery_address: delivery_address || {},
            created_at: new Date(),
            updated_at: new Date(),
            payment_status: 'completed',
            shipment_status: 'pending'
        };
        
        // In production, save to database
        // await Order.create(order);
        
        console.log('Order created:', order.id);
        
        res.json({
            success: true,
            order: order
        });
        
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/orders/tracking
 * Save shipment tracking information
 */
app.post('/api/orders/tracking', async (req, res) => {
    try {
        const {
            order_id,
            shipment_id,
            tracking_id,
            carrier,
            status
        } = req.body;
        
        const tracking = {
            order_id,
            shipment_id,
            tracking_id,
            carrier,
            status,
            updated_at: new Date()
        };
        
        // Save to database
        // await Tracking.create(tracking);
        
        res.json({
            success: true,
            tracking: tracking
        });
        
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/orders/:orderId
 * Retrieve order details
 */
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Fetch from database
        // const order = await Order.findById(orderId);
        
        // Mock response
        const order = {
            id: orderId,
            status: 'confirmed',
            items: [],
            total: 0,
            created_at: new Date()
        };
        
        res.json({
            success: true,
            order: order
        });
        
    } catch (error) {
        console.error('Order retrieval error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================ SHIPROCKET DELIVERY ENDPOINTS ============================================

/**
 * POST /api/shipments/create
 * Create shipment on Shiprocket
 */
app.post('/api/shipments/create', async (req, res) => {
    try {
        const shipmentData = req.body;
        
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
            shipmentData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.SHIPROCKET_AUTH_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log(`Shipment created: ${response.data.shipment_id}`);
        
        res.json({
            success: true,
            shipment: response.data
        });
        
    } catch (error) {
        console.error('Shipment creation error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/shipments/:shipmentId/track
 * Get shipment tracking status
 */
app.get('/api/shipments/:shipmentId/track', async (req, res) => {
    try {
        const { shipmentId } = req.params;
        
        const response = await axios.get(
            `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.SHIPROCKET_AUTH_TOKEN}`
                }
            }
        );
        
        res.json({
            success: true,
            tracking: response.data
        });
        
    } catch (error) {
        console.error('Tracking error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ============================================ WEBHOOK HANDLERS ============================================

/**
 * POST /api/webhooks/razorpay
 * Razorpay webhook for payment updates
 */
app.post('/api/webhooks/razorpay', (req, res) => {
    try {
        const { event, payload } = req.body;
        
        // Verify webhook signature
        const signature = req.headers['x-razorpay-signature'];
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        
        const body = JSON.stringify(payload);
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');
        
        if (expectedSignature !== signature) {
            return res.status(400).json({ error: 'Invalid signature' });
        }
        
        // Handle different event types
        switch (event) {
            case 'payment.authorized':
                handlePaymentAuthorized(payload);
                break;
            case 'payment.failed':
                handlePaymentFailed(payload);
                break;
            case 'order.paid':
                handleOrderPaid(payload);
                break;
            default:
                console.log(`Unhandled event: ${event}`);
        }
        
        res.json({ status: 'ok' });
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/webhooks/shiprocket
 * Shiprocket webhook for delivery updates
 */
app.post('/api/webhooks/shiprocket', (req, res) => {
    try {
        const { event, data } = req.body;
        
        // Handle delivery updates
        switch (event) {
            case 'shipment.created':
                handleShipmentCreated(data);
                break;
            case 'shipment.dispatched':
                handleShipmentDispatched(data);
                break;
            case 'shipment.delivered':
                handleShipmentDelivered(data);
                break;
            case 'shipment.failed':
                handleShipmentFailed(data);
                break;
            default:
                console.log(`Unhandled Shiprocket event: ${event}`);
        }
        
        res.json({ status: 'ok' });
        
    } catch (error) {
        console.error('Shiprocket webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================ WEBHOOK HANDLERS IMPLEMENTATION ============================================

function handlePaymentAuthorized(payload) {
    console.log('Payment authorized:', payload.payment.id);
    // Update payment status in database
}

function handlePaymentFailed(payload) {
    console.log('Payment failed:', payload.payment.id);
    // Send notification to customer
    // Update order status
}

function handleOrderPaid(payload) {
    console.log('Order paid:', payload.order.id);
    // Trigger shipment creation
}

function handleShipmentCreated(data) {
    console.log('Shipment created:', data.shipment_id);
    // Update order status
}

function handleShipmentDispatched(data) {
    console.log('Shipment dispatched:', data.shipment_id);
    // Send tracking link to customer
}

function handleShipmentDelivered(data) {
    console.log('Shipment delivered:', data.shipment_id);
    // Send delivery confirmation
    // Request review
}

function handleShipmentFailed(data) {
    console.log('Shipment failed:', data.shipment_id);
    // Notify customer
    // Handle return/retry
}

// ============================================ ERROR HANDLING & MIDDLEWARE ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================ SERVER START ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`SeaSalt Pickles Backend Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ============================================ DATABASE MODELS (MongoDB Example) ============================================

/*
// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    razorpay_order_id: String,
    razorpay_payment_id: String,
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
    items: Array,
    total: Number,
    customer_info: Object,
    delivery_address: Object,
    payment_status: String,
    shipment_status: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

// models/Tracking.js
const trackingSchema = new mongoose.Schema({
    order_id: String,
    shipment_id: String,
    tracking_id: String,
    carrier: String,
    status: String,
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tracking', trackingSchema);
*/
*/

/**
 * ============================================ MANUAL TESTING ============================================
 * 
 * Test the backend using cURL or Postman:
 * 
 * 1. Create Order:
 * curl -X POST http://localhost:3001/api/orders/create \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "amount": 10000,
 *     "currency": "INR",
 *     "receipt": "test_receipt"
 *   }'
 * 
 * 2. Verify Payment:
 * curl -X POST http://localhost:3001/api/payments/verify \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "razorpay_order_id": "order_xyz",
 *     "razorpay_payment_id": "pay_xyz",
 *     "razorpay_signature": "signature_xyz"
 *   }'
 * 
 * 3. Check Health:
 * curl http://localhost:3001/api/health
 */

/**
 * ============================================ PRODUCTION DEPLOYMENT CHECKLIST ============================================
 * 
 * Before deploying to production:
 * 
 * [ ] All environment variables configured
 * [ ] Database migrations completed
 * [ ] API keys secured (not in code)
 * [ ] Webhook URLs configured
 * [ ] Rate limiting implemented
 * [ ] CORS properly configured
 * [ ] SSL/HTTPS enabled
 * [ ] Logging configured
 * [ ] Error handling comprehensive
 * [ ] Database backups scheduled
 * [ ] Security headers added
 * [ ] Payment credentials verified
 * [ ] Testing completed
 */

module.exports = { razorpayInstance };
