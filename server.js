// Minimal Express server with MongoDB fetch endpoints

const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
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


