/**
 * ============================================ SEO & STRUCTURED DATA ============================================
 * 
 * Schema.org Implementation for Enhanced Search Visibility
 * This module injects structured data that helps search engines understand
 * your content, products, and organization better.
 * 
 * Supported Schema Types:
 * 1. Organization Schema - Company information
 * 2. LocalBusiness Schema - Physical location and contact
 * 3. Product Schema - Individual product details
 * 4. AggregateRating Schema - Product ratings
 * 5. BreadcrumbList Schema - Navigation structure
 * 
 * ============================================ STRUCTURED DATA GENERATORS ============================================
 */

/**
 * Generate Organization Schema
 * Helps Google understand your business identity
 */
function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "SeaSalt Pickles",
        "url": "https://www.seasaltpickles.com",
        "logo": "https://www.seasaltpickles.com/logo.png",
        "description": "Premium handcrafted pickles made with organic ingredients",
        "sameAs": [
            "https://www.facebook.com/seasaltpickles",
            "https://www.instagram.com/seasaltpickles",
            "https://www.twitter.com/seasaltpickles"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "telephone": "+91-9876543210",
            "email": "hello@seasaltpickles.com"
        }
    };
}

/**
 * Generate LocalBusiness Schema
 * Helps with local search visibility
 */
function generateLocalBusinessSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "SeaSalt Pickles",
        "image": "https://www.seasaltpickles.com/cover.jpg",
        "description": "Premium handcrafted pickles delivered fresh to your home",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Food Street",
            "addressLocality": "Bangalore",
            "addressRegion": "Karnataka",
            "postalCode": "560001",
            "addressCountry": "IN"
        },
        "telephone": "+91-9876543210",
        "email": "hello@seasaltpickles.com",
        "url": "https://www.seasaltpickles.com",
        "priceRange": "₹100-₹500",
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "18:00"
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Saturday"],
                "opens": "10:00",
                "closes": "16:00"
            }
        ]
    };
}

/**
 * Generate Product Schema
 * Enables rich product snippets in search results
 * 
 * @param {Object} product - Product object from catalog
 * @returns {Object} Schema.org Product structured data
 */
function generateProductSchema(product) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": `https://www.seasaltpickles.com/images/${product.id}.jpg`,
        "brand": {
            "@type": "Brand",
            "name": "SeaSalt Pickles"
        },
        "category": product.category,
        "offers": product.sizes.map((size, index) => ({
            "@type": "Offer",
            "url": "https://www.seasaltpickles.com",
            "priceCurrency": "INR",
            "price": size.price.toString(),
            "priceValidUntil": new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
            "availability": "https://schema.org/InStock",
            "description": `${product.name} - ${size.size}`
        })),
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating.toString(),
            "ratingCount": product.reviews.toString(),
            "bestRating": "5",
            "worstRating": "1"
        }
    };
}

/**
 * Generate Breadcrumb Schema
 * Helps with navigation visibility in search results
 */
function generateBreadcrumbSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.seasaltpickles.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Products",
                "item": "https://www.seasaltpickles.com#products"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "Pickles",
                "item": "https://www.seasaltpickles.com/category/pickles"
            }
        ]
    };
}

/**
 * Generate FAQ Schema
 * Enables FAQ rich snippets
 */
function generateFAQSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Are your pickles organic?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, all our pickles are made with 100% organic ingredients with no artificial preservatives or colors."
                }
            },
            {
                "@type": "Question",
                "name": "How long do the pickles stay fresh?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our pickles maintain freshness for 6-8 months when stored in a cool, dry place. Once opened, keep refrigerated."
                }
            },
            {
                "@type": "Question",
                "name": "Do you offer free shipping?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we offer free shipping on orders above ₹500. For orders below ₹500, shipping charges are ₹50."
                }
            },
            {
                "@type": "Question",
                "name": "What is your return policy?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We offer 7-day returns for unopened products. Damaged items can be returned or replaced within 24 hours of delivery."
                }
            }
        ]
    };
}

/**
 * Inject Schema.org markup into page head
 * Creates script tags with JSON-LD structured data
 */
function injectStructuredData() {
    // Organization Schema
    const orgScript = document.createElement('script');
    orgScript.type = 'application/ld+json';
    orgScript.textContent = JSON.stringify(generateOrganizationSchema(), null, 2);
    document.head.appendChild(orgScript);
    
    // LocalBusiness Schema
    const localScript = document.createElement('script');
    localScript.type = 'application/ld+json';
    localScript.textContent = JSON.stringify(generateLocalBusinessSchema(), null, 2);
    document.head.appendChild(localScript);
    
    // Breadcrumb Schema
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.textContent = JSON.stringify(generateBreadcrumbSchema(), null, 2);
    document.head.appendChild(breadcrumbScript);
    
    // FAQ Schema
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.textContent = JSON.stringify(generateFAQSchema(), null, 2);
    document.head.appendChild(faqScript);
    
    // Product Collection Schema (all products)
    const productCollectionScript = document.createElement('script');
    productCollectionScript.type = 'application/ld+json';
    productCollectionScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "SeaSalt Pickles - Premium Handcrafted Pickles",
        "description": "Browse our complete collection of premium handcrafted pickles",
        "mainEntity": PRODUCT_CATALOG.map(product => generateProductSchema(product))
    }, null, 2);
    document.head.appendChild(productCollectionScript);
}

/**
 * ============================================ META TAGS OPTIMIZATION ============================================
 * 
 * Dynamic meta tag management for improved SEO
 * Helps search engines and social platforms understand page content
 */

/**
 * Update page meta tags dynamically
 * 
 * @param {Object} options - Meta tag configuration
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} options.keywords - Meta keywords
 * @param {string} options.ogImage - OpenGraph image URL
 * @param {string} options.ogType - OpenGraph type
 * @param {string} options.url - Canonical URL
 */
function updateMetaTags(options = {}) {
    const {
        title = 'SeaSalt Pickles - Premium Handcrafted Pickles',
        description = 'Premium handcrafted pickles made with organic ingredients',
        keywords = 'pickles, fermented foods, organic, homemade, seasalt',
        ogImage = 'https://www.seasaltpickles.com/og-image.jpg',
        ogType = 'website',
        url = 'https://www.seasaltpickles.com'
    } = options;
    
    // Update title
    document.title = title;
    
    // Update or create meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:url', url, 'property');
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', ogImage, 'name');
    
    // Update canonical
    updateCanonical(url);
}

/**
 * Helper function to update or create meta tag
 */
function updateMetaTag(name, content, type = 'name') {
    let tag = document.querySelector(`meta[${type}="${name}"]`);
    
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(type, name);
        document.head.appendChild(tag);
    }
    
    tag.content = content;
}

/**
 * Update canonical URL
 */
function updateCanonical(url) {
    let canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
    }
    
    canonical.href = url;
}

/**
 * ============================================ PERFORMANCE & SEO OPTIMIZATION ============================================
 */

/**
 * Generate XML Sitemap
 * Returns sitemap structure for search engines
 * Deploy to /sitemap.xml
 */
function generateSitemap() {
    const baseUrl = 'https://www.seasaltpickles.com';
    
    const urls = [
        { loc: '/', priority: '1.0', changefreq: 'daily' },
        { loc: '/about', priority: '0.8', changefreq: 'monthly' },
        { loc: '/products', priority: '0.9', changefreq: 'weekly' },
        { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
        { loc: '/privacy', priority: '0.5', changefreq: 'yearly' },
        { loc: '/terms', priority: '0.5', changefreq: 'yearly' },
        ...PRODUCT_CATALOG.map(product => ({
            loc: `/product/${product.id}`,
            priority: '0.8',
            changefreq: 'weekly'
        }))
    ];
    
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `
    <url>
        <loc>${baseUrl}${url.loc}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>
`).join('')}
</urlset>`;
    
    return sitemapXml;
}

/**
 * Generate robots.txt
 * Controls search engine crawler behavior
 */
function generateRobotsTxt() {
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

# Specify sitemap
Sitemap: https://www.seasaltpickles.com/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# User-agents to block
User-agent: AhrefsBot
User-agent: SemrushBot
Disallow: /`;
}

/**
 * ============================================ PERFORMANCE METRICS ============================================
 * 
 * Tracking for Core Web Vitals
 * Helps identify performance issues
 */

/**
 * Track Core Web Vitals
 * Measures: LCP, FID, CLS
 */
function trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
        try {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.log('LCP not supported');
        }
    }
    
    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
        try {
            let cls = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                        console.log('CLS:', cls);
                    }
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.log('CLS not supported');
        }
    }
}

/**
 * ============================================ INITIALIZATION ============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inject all structured data
    injectStructuredData();
    
    // Update initial meta tags
    updateMetaTags();
    
    // Track performance
    trackCoreWebVitals();
    
    // Log sitemap for reference (in production, deploy to /sitemap.xml)
    console.log('Sitemap generated:', generateSitemap().substring(0, 100) + '...');
    console.log('robots.txt generated:', generateRobotsTxt().substring(0, 100) + '...');
});
