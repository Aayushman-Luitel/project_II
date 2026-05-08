const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins for CORS (add your Netlify URL here)
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-quickeditz.netlify.app'  // ⚠️ REPLACE with your actual Netlify URL
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

// SQLite store configuration
const sessionStore = new SQLiteStore({
  db: 'sessions.db',
  table: 'sessions',
  dir: './',
  concurrentDB: true,
});
sessionStore.on('error', (err) => console.error('Store error:', err));

// Session middleware
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true on HTTPS (Render/Netlify)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // required for cross-origin
  }
}));

// Helper function to initialize session data
function initSession(req) {
  let changed = false;
  if (!req.session.tool) {
    req.session.tool = 'editor';
    changed = true;
  }
  if (!req.session.createdAt) {
    req.session.createdAt = new Date().toISOString();
    changed = true;
  }
  if (!req.session.history) {
    req.session.history = [];
    changed = true;
  }
  return changed;
}

// CREATE session
app.post('/api/sessions', (req, res) => {
  if (!req.session.id) {
    return res.status(500).json({ error: 'Session ID missing' });
  }
  const changed = initSession(req);
  if (changed) {
    req.session.save((err) => {
      if (err) {
        console.error('POST init save error:', err);
        return res.status(500).json({ error: 'Failed to initialize session' });
      }
      res.json({
        id: req.session.id,
        tool: req.session.tool,
        createdAt: req.session.createdAt,
        history: req.session.history,
      });
    });
  } else {
    res.json({
      id: req.session.id,
      tool: req.session.tool,
      createdAt: req.session.createdAt,
      history: req.session.history,
    });
  }
});

// READ session
app.get('/api/sessions', (req, res) => {
  if (!req.session || !req.session.id) {
    return res.status(404).json({ error: 'No active session' });
  }
  initSession(req);
  res.json({
    id: req.session.id,
    tool: req.session.tool,
    createdAt: req.session.createdAt,
    history: req.session.history,
  });
});

// UPDATE session
app.put('/api/sessions', (req, res) => {
  if (!req.session || !req.session.id) {
    return res.status(404).json({ error: 'No active session' });
  }
  initSession(req);
  if (req.body.history !== undefined) {
    req.session.history = req.body.history;
  }
  if (req.body.tool) {
    req.session.tool = req.body.tool;
  }
  req.session.lastModified = new Date().toISOString();
  req.session.save((err) => {
    if (err) {
      console.error('PUT save error:', err);
      return res.status(500).json({ error: 'Update failed', details: err.message });
    }
    res.json({
      id: req.session.id,
      tool: req.session.tool,
      history: req.session.history,
    });
  });
});

// DELETE session
app.delete('/api/sessions', (req, res) => {
  if (!req.session || !req.session.id) {
    return res.status(404).json({ error: 'No active session' });
  }
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Destroy failed' });
    res.status(204).send();
  });
});

// Health check endpoint (useful for Render)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));