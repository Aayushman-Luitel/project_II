const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

const sessionStore = new SQLiteStore({
  db: 'sessions.db',
  table: 'sessions',
  dir: './',
  concurrentDB: true,
});
sessionStore.on('error', (err) => console.error('Store error:', err));

app.use(session({
  store: sessionStore,
  secret: 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: false }
}));

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

app.post('/api/sessions', (req, res) => {
  // Ensure session exists (if new, it will have an id)
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

app.delete('/api/sessions', (req, res) => {
  if (!req.session || !req.session.id) {
    return res.status(404).json({ error: 'No active session' });
  }
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Destroy failed' });
    res.status(204).send();
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));