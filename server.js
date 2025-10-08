// Minimal Express server with MongoDB fetch endpoints

const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Load environment variables from .env (if present)
try {
  require('dotenv').config();
} catch (_) {}

const app = express();
app.use(express.json({ limit: '2mb' }));

// MongoDB setup
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB || 'bogsila';
let mongoClient;

// Known collection names
const COLLECTIONS = {
  all: process.env.MONGODB_PRODUCTS_COLLECTION || 'All_products',
  bottoms: 'Bottoms',
  coord: 'coord',
  shirts: 'Shirts',
  tshirts: 'tshirts',
};

if (!mongoUri) {
  // eslint-disable-next-line no-console
  console.warn('MONGODB_URI is not set. Database routes will fail until configured.');
}

function getMongoClient() {
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
  }
  return mongoClient;
}

async function getDb() {
  const client = getMongoClient();
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db(mongoDbName);
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ===== Auth helpers =====
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me';
const ACCESS_TTL = process.env.TOKEN_EXP || '15m';
const REFRESH_TTL = process.env.REFRESH_EXP || '7d';

function signTokens(user) {
  const payload = { uid: String(user._id), email: user.email };
  const access = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
  const refresh = jwt.sign({ ...payload, tv: user.tokenVersion || 0 }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
  return { access, refresh };
}

async function authMiddleware(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// ===== Auth routes =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const db = await getDb();
    const users = db.collection('users');
    const existing = await users.findOne({ email: String(email).toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(String(password), 10);
    const now = new Date();
    const userDoc = { email: String(email).toLowerCase(), passwordHash, name: name || '', phone: phone || '', addresses: [], favorites: [], createdAt: now, updatedAt: now, tokenVersion: 0 };
    const { insertedId } = await users.insertOne(userDoc);
    const user = { ...userDoc, _id: insertedId };
    const tokens = signTokens(user);
    res.status(201).json({ user: { _id: insertedId, email: user.email, name: user.name, phone: user.phone }, tokens });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Register failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: String(email).toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(String(password), user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const tokens = signTokens(user);
    await users.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
    res.json({ user: { _id: user._id, email: user.email, name: user.name, phone: user.phone }, tokens });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Login failed' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refresh } = req.body || {};
    if (!refresh) return res.status(400).json({ error: 'Missing refresh' });
    const payload = jwt.verify(refresh, REFRESH_SECRET);
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new (require('mongodb').ObjectId)(payload.uid) });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if ((user.tokenVersion || 0) !== (payload.tv || 0)) return res.status(401).json({ error: 'Unauthorized' });
    const tokens = signTokens(user);
    res.json({ tokens });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    await db.collection('users').updateOne({ _id: new (require('mongodb').ObjectId)(req.user.uid) }, { $inc: { tokenVersion: 1 } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Logout failed' });
  }
});

// Profile routes
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const user = await db.collection('users').findOne({ _id: new (require('mongodb').ObjectId)(req.user.uid) }, { projection: { passwordHash: 0, tokenVersion: 0 } });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch profile' });
  }
});

app.patch('/api/me', authMiddleware, async (req, res) => {
  try {
    const { name, phone, avatarUrl, addresses, favorites } = req.body || {};
    const db = await getDb();
    await db.collection('users').updateOne(
      { _id: new (require('mongodb').ObjectId)(req.user.uid) },
      { $set: { name, phone, avatarUrl, addresses, favorites, updatedAt: new Date() } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to update profile' });
  }
});

// DB ping
app.get('/db-ping', async (_req, res) => {
  try {
    const client = getMongoClient();
    await client.db('admin').command({ ping: 1 });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || 'Ping failed' });
  }
});

// Fetch products (GET /api/products?limit=20) — defaults to DB 'bogsila' and collection 'All_products'
app.get('/api/products', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const db = await getDb();
    const products = await db
      .collection(COLLECTIONS.all)
      .find({})
      .limit(limit)
      .toArray();
    res.json({ items: products });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch products' });
  }
});

// Alias route using collection name explicitly
app.get('/api/all-products', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const db = await getDb();
    const products = await db
      .collection(COLLECTIONS.all)
      .find({})
      .limit(limit)
      .toArray();
    res.json({ items: products });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch products' });
  }
});

// Shared fetcher for a given collection name
async function fetchCollection(collectionName, limit) {
  const db = await getDb();
  const items = await db
    .collection(collectionName)
    .find({})
    .limit(limit)
    .toArray();
  return items;
}

// Generic collection fetch: GET /api/collection/:key?limit=20
app.get('/api/collection/:key', async (req, res) => {
  try {
    const key = String(req.params.key || '').toLowerCase();
    const collectionName = COLLECTIONS[key];
    if (!collectionName) {
      return res.status(400).json({ error: 'Unknown collection key' });
    }
    const limit = Number(req.query.limit) || 20;
    const items = await fetchCollection(collectionName, limit);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch collection' });
  }
});

// Get single product by ID: GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const db = await getDb();
    const product = await db.collection(COLLECTIONS.all).findOne({ _id: new ObjectId(productId) });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch product' });
  }
});

// Explicit routes (avoid internal _router usage)
app.get('/api/bottoms', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const items = await fetchCollection(COLLECTIONS.bottoms, limit);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch Bottoms' });
  }
});

app.get('/api/coord', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const items = await fetchCollection(COLLECTIONS.coord, limit);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch Co-ord' });
  }
});

app.get('/api/shirts', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const items = await fetchCollection(COLLECTIONS.shirts, limit);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch Shirts' });
  }
});

app.get('/api/tshirts', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const items = await fetchCollection(COLLECTIONS.tshirts, limit);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Failed to fetch T-Shirts' });
  }
});

// Text search across products (name/title/productName)
app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Number(req.query.limit) || 20;
    if (!q) return res.json({ items: [] });
    const db = await getDb();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const items = await db
      .collection(COLLECTIONS.all)
      .find({
        $or: [
          { name: regex },
          { title: regex },
          { productName: regex },
          { category: regex },
          { description: regex },
        ],
      })
      .limit(limit)
      .toArray();

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Search failed' });
  }
});

// Graceful shutdown
async function closeMongo() {
  try {
    if (mongoClient) {
      await mongoClient.close();
    }
  } catch (_) {}
}

process.on('SIGINT', async () => {
  await closeMongo();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await closeMongo();
  process.exit(0);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;


