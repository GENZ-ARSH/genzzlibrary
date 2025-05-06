const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const shortenUrl = require('./utils/linkcents');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        console.log('CORS Origin:', origin);
        console.log('Expected FRONTEND_URL:', process.env.FRONTEND_URL);
        callback(null, true);
    },
    credentials: true
}));
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use(limiter);

// Session Middleware
const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
});

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    },
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Models
const BookSchema = new mongoose.Schema({
    name: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: String,
    downloadLink: { type: String, required: true },
    tag: String,
    badges: [String],
});
const Book = mongoose.model('Book', BookSchema);

const ReviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    message: { type: String, required: true },
});
const Review = mongoose.model('Review', ReviewSchema);

// Middleware to Verify Access Token
const verifyToken = (req, res, next) => {
    const token = req.cookies.accessKey;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// CSRF Token Middleware
const csrfMiddleware = (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        const csrfToken = req.headers['x-csrf-token'];
        const storedCsrfToken = req.cookies.csrfToken;
        if (!csrfToken || csrfToken !== storedCsrfToken) {
            console.log('CSRF token validation failed:', csrfToken, storedCsrfToken);
            return res.status(403).json({ error: 'CSRF token validation failed' });
        }
    }
    next();
};

// API Routes
app.get('/api/csrf-token', (req, res) => {
    try {
        console.log('Received request for /api/csrf-token');
        const csrfToken = uuidv4();
        res.cookie('csrfToken', csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });
        console.log('Generated CSRF token:', csrfToken);
        res.json({ csrfToken });
    } catch (error) {
        console.error('Error in /api/csrf-token:', error);
        res.status(500).json({ error: 'Failed to generate CSRF token' });
    }
});

app.get('/api/verify-token', (req, res) => {
    const token = req.cookies.accessKey;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ valid: true });
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
});

app.get('/api/shorten', async (req, res) => {
    const homeUrl = 'https://genzzlibrary.vercel.app/home.html';
    console.log('Shortening URL:', homeUrl);

    try {
        const shortenedUrl = await shortenUrl(homeUrl);
        console.log('Shortened URL:', shortenedUrl);

        const token = jwt.sign({ access: true }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.cookie('accessKey', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Set keyTimestamp in localStorage via a script in the response
        res.send(`
            <script>
                localStorage.setItem('keyTimestamp', ${new Date().getTime()});
                window.location.href = '${shortenedUrl}';
            </script>
        `);
    } catch (error) {
        console.error('Error in /api/shorten:', error.message);
        res.status(500).send(`
            <script>
                alert('Failed to generate key. Please try again.');
                window.location.href = '/index.html';
            </script>
        `);
    }
});

app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

app.post('/api/books', csrfMiddleware, async (req, res) => {
    const { name, author, coverImage, downloadLink, tag } = req.body;
    if (!name || !author || !downloadLink) {
        return res.status(400).json({ error: 'Name, author, and download link are required' });
    }
    try {
        const book = new Book({ name, author, coverImage, downloadLink, tag, badges: [] });
        await book.save();
        res.json({ message: 'Book added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add book' });
    }
});

app.post('/api/reviews', csrfMiddleware, async (req, res) => {
    const { name, message } = req.body;
    if (!name || !message) {
        return res.status(400).json({ error: 'Name and message are required' });
    }
    try {
        const review = new Review({ name, message });
        await review.save();
        const reviewUrl = `${process.env.FRONTEND_URL}/reviews/${review._id}`;
        let shortenedUrl = reviewUrl;
        try {
            shortenedUrl = await shortenUrl(reviewUrl);
        } catch (error) {
            console.error('Failed to shorten review URL:', error.message);
        }
        res.json({ message: 'Review submitted successfully', shortenedUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

app.post('/api/auth/verify-admin', csrfMiddleware, (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
});

app.post('/api/auth/add-badge', csrfMiddleware, (req, res) => {
    const { badgeName, emoji } = req.body;
    if (!badgeName || !emoji) {
        return res.status(400).json({ error: 'Badge name and emoji are required' });
    }
    res.json({ message: 'Badge added successfully' });
});

// Export the app for Vercel
module.exports = app;
