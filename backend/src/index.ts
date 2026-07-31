import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { init, createUser, getUserByEmail, getUserById, getPendingSellers, updateUser, createNotification, getNotifications, createItem, listItems, getItemById, createOrder, getOrdersByUser, getItemsBySeller } from './db';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DATA_DIR = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
init();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid auth' });
  try {
    const payload: any = jwt.verify(parts[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  let { role = 'student', name } = req.body;
  // Prevent public creation of admin accounts via registration
  const allowedRoles = ['student', 'seller', 'lecturer'];
  if (!allowedRoles.includes(role)) role = 'student';
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const hashed = await bcrypt.hash(password, 8);
  try {
    const rec = await createUser({ email, password: hashed, role, name: name || null, is_approved: role === 'seller' ? false : true, banned: false });
    const user = { id: rec.id, email: rec.email, role: rec.role, name: rec.name, is_approved: rec.is_approved, banned: rec.banned };
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ user, token });
  } catch (err: any) {
    return res.status(400).json({ error: 'User exists or DB error', details: err.message });
  }
});

// Admin-only: create a new admin user
app.post('/api/admin/create-admin', authMiddleware, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing' });
  const hashed = await bcrypt.hash(password, 8);
  try {
    const rec = await createUser({ email, password: hashed, role: 'admin', name: name || null, is_approved: true, banned: false });
    res.json({ ok: true, user: { id: rec.id, email: rec.email } });
  } catch (err: any) {
    res.status(400).json({ error: 'Could not create admin', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const row = getUserByEmail(email);
  if (!row) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, row.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const user = { id: row.id, email: row.email, role: row.role, name: row.name, is_approved: row.is_approved, banned: row.banned };
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
});

app.get('/api/admin/pending-sellers', (req, res) => {
  const rows = getPendingSellers();
  res.json({ pending: rows.map((r: any) => ({ id: r.id, email: r.email, name: r.name })) });
});

app.post('/api/admin/approve', (req, res) => {
  const { id, approve } = req.body;
  updateUser(id, { is_approved: approve ? true : false });
  res.json({ ok: true });
});

app.post('/api/admin/ban', (req, res) => {
  const { id, ban } = req.body;
  updateUser(id, { banned: ban ? true : false });
  res.json({ ok: true });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const row = getUserById(req.user.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({ user: row });
});

// Notifications (lecturer/admin)
app.post('/api/notifications', (req, res) => {
  const { title, body, author } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Missing' });
  // simple auth omitted for brevity in demo: in prod require auth and role check
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const db = require('./db');
  const n = db.createNotification({ title, body, author });
  res.json({ ok: true, notification: n });
});

app.get('/api/notifications', (req, res) => {
  // public notifications
  const list = getNotifications();
  res.json({ notifications: list });
});

// Items endpoints
app.post('/api/items', authMiddleware, (req, res) => {
  const { title, description, price } = req.body;
  if (!title || !price) return res.status(400).json({ error: 'Missing' });
  if (req.user.role !== 'seller' && req.user.role !== 'admin') return res.status(403).json({ error: 'Not seller' });
  const item = createItem({ title, description, price, sellerId: req.user.id });
  res.json(item);
});

app.get('/api/items', (req, res) => {
  const list = listItems();
  res.json({ items: list });
});

app.get('/api/items/:id', (req, res) => {
  const item = getItemById(parseInt(req.params.id, 10));
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// Orders
app.post('/api/orders', authMiddleware, (req, res) => {
  const { itemId, qty } = req.body;
  const item = getItemById(parseInt(itemId, 10));
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const total = (item.price || 0) * (qty || 1);
  const order = createOrder({ itemId: item.id, buyerId: req.user.id, qty: qty || 1, total });
  res.json(order);
});

app.get('/api/orders', authMiddleware, (req, res) => {
  const orders = getOrdersByUser(req.user.id);
  res.json({ orders });
});

// User requests to become a seller
app.post('/api/user/request-seller', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const user = getUserById(userId);
  if (!user) return res.status(404).json({ error: 'Not found' });
  // update to seller and mark not approved
  updateUser(userId, { role: 'seller', is_approved: false });
  res.json({ ok: true });
});

// Optionally seed demo users when run with SEED=true
if (process.env.SEED === 'true') {
  try {
    // run seed script if present
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('./seed');
  } catch (err) {
    console.error('Seed failed', err);
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
