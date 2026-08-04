const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===== DATA LOADING =====
function loadProducts() {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8');
    return JSON.parse(data);
}

function loadTestimonials() {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'testimonials.json'), 'utf8');
    return JSON.parse(data);
}

function loadOrders() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'orders.json'), 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveOrders(orders) {
    fs.writeFileSync(path.join(__dirname, 'data', 'orders.json'), JSON.stringify(orders, null, 2));
}

// ===== API ROUTES =====

// Get all products
app.get('/api/products', (req, res) => {
    const products = loadProducts();
    const { category, sort, minPrice, maxPrice, search } = req.query;
    let filtered = [...products];

    if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));
    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'high') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    res.json({ success: true, count: filtered.length, products: filtered });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
    const products = loadProducts();
    const product = products.find(p => p.id === Number(req.params.id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
});

// Get testimonials
app.get('/api/testimonials', (req, res) => {
    const testimonials = loadTestimonials();
    res.json({ success: true, testimonials });
});

// Submit contact form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const contactPath = path.join(__dirname, 'data', 'contacts.json');
    let contacts = [];
    try {
        contacts = JSON.parse(fs.readFileSync(contactPath, 'utf8'));
    } catch {}
    contacts.push({ id: Date.now(), name, email, message, date: new Date().toISOString() });
    fs.writeFileSync(contactPath, JSON.stringify(contacts, null, 2));
    res.json({ success: true, message: 'Message received! We will get back to you soon.' });
});

// Subscribe to newsletter
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    const subsPath = path.join(__dirname, 'data', 'subscribers.json');
    let subs = [];
    try {
        subs = JSON.parse(fs.readFileSync(subsPath, 'utf8'));
    } catch {}
    if (subs.find(s => s.email === email)) {
        return res.json({ success: true, message: 'You are already subscribed!' });
    }
    subs.push({ id: Date.now(), email, date: new Date().toISOString() });
    fs.writeFileSync(subsPath, JSON.stringify(subs, null, 2));
    res.json({ success: true, message: 'Thank you for subscribing! Check your email for 15% off.' });
});

// Place order
app.post('/api/orders', (req, res) => {
    const { items, total, customer } = req.body;
    if (!items || !items.length || !customer) {
        return res.status(400).json({ success: false, message: 'Invalid order data' });
    }
    const orders = loadOrders();
    const order = {
        id: Date.now(),
        items,
        total,
        customer,
        status: 'confirmed',
        date: new Date().toISOString()
    };
    orders.push(order);
    saveOrders(orders);
    res.json({ success: true, message: 'Order placed successfully!', order });
});

// Get site stats
app.get('/api/stats', (req, res) => {
    const products = loadProducts();
    const testimonials = loadTestimonials();
    const orders = loadOrders();
    res.json({
        success: true,
        stats: {
            products: products.length,
            testimonials: testimonials.length,
            orders: orders.length,
            revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
            averageRating: (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)
        }
    });
});

// ===== SERVE PRODUCTION BUILD (if exists) =====
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // SPA fallback - serve index.html for all non-API routes
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    // Fallback message for development
    app.get('/', (req, res) => {
        res.send('Bright Eyewear React app is running in development mode. Use `npm run dev` for the frontend (Vite on port 5173).');
    });
}

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`\n  🕶️  Bright Eyewear Server`);
    console.log(`  ─────────────────────────`);
    console.log(`  🌐  http://localhost:${PORT}`);
    console.log(`  📦  API: http://localhost:${PORT}/api/products`);
    console.log(`  📊  Stats: http://localhost:${PORT}/api/stats\n`);
});