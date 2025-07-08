const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // 🔒 Make sure this file exists

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

/**
 * ADD a new product
 * POST /api/products
 */
app.post('/api/products', async (req, res) => {
  try {
    const product = req.body;
    const docRef = await db.collection('products').add(product);
    res.status(201).json({ id: docRef.id, ...product });
  } catch (err) {
    console.error('Add Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET all products
 * GET /api/products
 */
app.get('/api/products', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    console.error('Get All Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET single product by ID
 * GET /api/products/:id
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const doc = await db.collection('products').doc(productId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Get One Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * UPDATE product by ID
 * PUT /api/products/:id
 */
app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = req.body;

    const productRef = db.collection('products').doc(productId);
    const doc = await productRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await productRef.update(updatedProduct);
    const updatedDoc = await productRef.get();

    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE product by ID
 * DELETE /api/products/:id
 */
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const productRef = db.collection('products').doc(productId);
    const doc = await productRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await productRef.delete();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
