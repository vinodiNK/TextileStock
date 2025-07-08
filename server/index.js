const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // this file must exist

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Add a product
app.post('/api/products', async (req, res) => {
  try {
    const product = req.body;
    const docRef = await db.collection('products').add(product);
    res.status(201).json({ id: docRef.id, ...product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit (Update) a product by ID
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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a product by ID
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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
