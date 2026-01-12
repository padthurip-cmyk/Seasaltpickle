# SeaSalt Pickles - Premium E-Commerce Platform 🥒

A high-performance, mobile-responsive e-commerce website built with HTML5, Tailwind CSS, and vanilla JavaScript. Features a gamified spin wheel for customer engagement and complete payment/delivery integration.

## 🎯 Features

### 🎡 Gamification System
- **Lucky Spin Wheel**: Maximum 2 spins per user with OTP verification
- **Prize Configuration**: Weighted probability system (Prize A: ₹100, Prize B: ₹300, Prize C: ₹500)
- **Wallet Integration**: Accumulated rewards stored in localStorage
- **Deep-Thinking Algorithm**: Fair odds calculation using cumulative probability distribution

### 🛒 E-Commerce Platform
- **Product Catalog**: 8 premium pickle varieties with multiple size variants
- **Dynamic Pricing**: Price updates based on selected size
- **Shopping Cart**: Real-time cart synchronization with localStorage persistence
- **Responsive Design**: Mobile-first, optimized for all devices
- **SEO Optimized**: Schema.org markup, meta tags, OpenGraph integration

### 💳 Payment Integration
- **Razorpay Gateway**: Complete payment processing boilerplate
- **Multiple Payment Methods**: Cards, NetBanking, UPI, Wallets
- **Payment Verification**: Signature-based security
- **Order Management**: Database integration ready

### 🚚 Delivery Integration
- **Shiprocket API**: Multi-carrier shipping
- **Real-time Tracking**: Track shipments with carrier updates
- **Automated Fulfillment**: Order to delivery pipeline

## 📁 Project Structure

```
seasalt-pickles/
├── index.html              # Main HTML file (SEO-optimized)
├── styles.css              # Custom CSS with animations
├── app.js                  # Main e-commerce logic
├── spin-wheel.js           # Gamification system
├── seo-schema.js           # SEO & structured data
├── payment-delivery-api.js # Payment & delivery integration
├── .gitignore              # Git configuration
├── .netlify.toml           # Netlify deployment config
├── package.json            # Dependencies (minimal)
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ (for local development)
- Git
- GitHub account
- Netlify account (for deployment)

### Local Installation

```bash
# Clone repository
git clone https://github.com/yourusername/seasalt-pickles.git
cd seasalt-pickles

# Install dependencies (optional, minimal setup)
npm install

# Start local development server
npm start
# Open http://localhost:3000 in browser
```

### Using Live Server (VS Code)
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Server runs on http://localhost:5500

## 🔧 Configuration

### Spin Wheel Settings
```javascript
// In spin-wheel.js
const OFFER_ACTIVE = true; // Set to false to disable

const PRIZES = [
    { id: 'prize_a', amount: 100, odds: 1/30, ... },
    { id: 'prize_b', amount: 300, odds: 1/100, ... },
    { id: 'prize_c', amount: 500, odds: 1/300, ... }
];

const SPIN_CONFIG = {
    maxSpinsPerUser: 2,
    spinDurationMs: 3000,
    ...
};
```

### Payment Integration
```javascript
// In payment-delivery-api.js
const RAZORPAY_CONFIG = {
    keyId: 'YOUR_RAZORPAY_KEY_ID',
    // Replace with your actual API keys
};
```

### Delivery Integration
```javascript
const SHIPROCKET_CONFIG = {
    apiEndpoint: 'https://apiv2.shiprocket.in/v1/external',
    authToken: 'YOUR_SHIPROCKET_AUTH_TOKEN',
    pickupLocationId: 'YOUR_PICKUP_LOCATION_ID'
};
```

## 📦 Dependencies

Minimal dependencies - uses CDN for production:
- **Tailwind CSS**: Via CDN
- **Google Fonts**: Via CDN
- **Razorpay SDK**: Loaded dynamically
- **No npm packages required** for frontend

Optional backend (Node.js):
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "razorpay": "^2.9.0",
    "axios": "^1.4.0"
  }
}
```

## 🌐 Deployment

### Option 1: Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Or via Web UI:**
1. Go to https://app.netlify.com
2. Click "New site from Git"
3. Connect GitHub repository
4. Deploy main branch

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "echo 'No build required'"
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  RAZORPAY_KEY = "your_key"
  SHIPROCKET_TOKEN = "your_token"
```

### Option 2: GitHub Pages

```bash
# Create gh-pages branch
git checkout --orphan gh-pages

# Push to GitHub
git push origin gh-pages

# Enable GitHub Pages in Settings
# Repository > Settings > Pages > Select main branch
```

### Option 3: Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .

EXPOSE 3000

CMD ["npx", "http-server", "-p", "3000"]
```

Build and run:
```bash
docker build -t seasalt-pickles .
docker run -p 3000:3000 seasalt-pickles
```

## 🔐 Environment Variables

Create `.env` file in root (for backend):
```
RAZORPAY_KEY_ID=your_key
RAZORPAY_SECRET=your_secret
SHIPROCKET_AUTH_TOKEN=your_token
SHIPROCKET_PICKUP_LOCATION_ID=your_location
DATABASE_URL=your_database_url
```

**Never commit `.env` file to Git!**

## 📊 Architecture Deep Dive

### Spin Wheel System
The system uses a **weighted probability algorithm** for fair prize distribution:

1. **Odds Configuration**: Each prize has defined odds (1/30, 1/100, 1/300)
2. **Cumulative Probability**: Array of cumulative probabilities is created
3. **Random Selection**: Random number between 0-1 maps to prize
4. **Session Tracking**: Phone number + OTP ensures 1 spin set per user per day
5. **Wallet Integration**: Rewards accumulate in localStorage

### E-Commerce Logic
```
User → Product Selection → Modal (Size Options) → Cart → Checkout → Payment → Order
                                ↓
                        Real-time Price Update
```

### State Management
```javascript
appState = {
    cart: [],           // Array of cart items
    selectedProduct: null,
    selectedSize: null,
    currentPage: 'home'
};
```

## 🎨 Customization

### Product Catalog
Edit `PRODUCT_CATALOG` in `app.js`:
```javascript
{
    id: 'product_id',
    name: 'Product Name',
    emoji: '🥒',
    description: 'Product description',
    sizes: [
        { size: '250g', price: 120 },
        { size: '500g', price: 220 }
    ],
    category: 'Category',
    rating: 4.8,
    reviews: 245
}
```

### Color Scheme
Edit CSS variables in `styles.css`:
```css
:root {
    --color-primary: #0d9488;      /* Teal */
    --color-secondary: #059669;    /* Emerald */
    --color-accent: #f59e0b;       /* Amber */
}
```

### Fonts
Update in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT:wght@400;700" rel="stylesheet">
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Spin wheel with 2 spins limit
- [ ] OTP verification (Demo: 1234)
- [ ] Product modal display and size selection
- [ ] Cart add/update/remove items
- [ ] Cart persistence (reload page)
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Search functionality
- [ ] Wallet balance update
- [ ] Checkout flow

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Mobile Optimization

- **Viewport**: `width=device-width, initial-scale=1.0`
- **Touch-friendly**: 48px minimum touch targets
- **Responsive Grid**: CSS Grid with mobile-first approach
- **Performance**: < 3MB total size
- **Lighthouse**: Target 90+ score

## 🔍 SEO Features

- **Meta Tags**: Title, description, keywords
- **OpenGraph**: Social sharing optimization
- **Schema.org**: Product, Organization, LocalBusiness markup
- **Sitemap**: Dynamically generated
- **robots.txt**: Search engine instructions
- **Canonical URLs**: Duplicate prevention
- **Performance**: Core Web Vitals tracking

## 🐛 Troubleshooting

### Spin Wheel Not Working
1. Check `OFFER_ACTIVE = true` in spin-wheel.js
2. Verify browser console for errors (F12)
3. Clear localStorage: `localStorage.clear()`
4. Check phone number format (10 digits)

### Cart Not Persisting
1. Check browser allows localStorage
2. Private browsing disabled (disables storage)
3. Check browser storage limit
4. Clear browser cache and reload

### Payment Not Processing
1. Verify Razorpay credentials in payment-delivery-api.js
2. Check backend endpoints are accessible
3. Verify CORS settings if using separate backend
4. Check payment amount > 0

## 📚 Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Shiprocket API Guide](https://shiprocket.in/developer/apiv2/)
- [Schema.org Markup](https://schema.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Web.dev Performance](https://web.dev/)

## 🤝 Contributing

Contributions welcome! Process:

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under MIT License - see LICENSE file for details.

## 👤 Author

SeaSalt Pickles Development Team

## 📞 Support

- Email: hello@seasaltpickles.com
- GitHub Issues: [Report Bugs](https://github.com/yourusername/seasalt-pickles/issues)
- Live Chat: Available on website

## 🎯 Roadmap

- [ ] Admin dashboard
- [ ] User accounts & order history
- [ ] Product reviews & ratings
- [ ] Subscription service
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Inventory management
- [ ] Multi-currency support

## 🙏 Acknowledgments

- Tailwind CSS for styling
- Razorpay for payments
- Shiprocket for delivery
- Google for fonts and analytics

---

**Made with ❤️ for pickle lovers worldwide 🥒**
