const fs = require('fs');
const path = require('path');

const DB_FILE = path.resolve(__dirname, '..', 'data', 'db.json');

function load() {
  if (!fs.existsSync(DB_FILE)) return { users: [], nextId: 1 };
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return { users: [], nextId: 1 };
  }
}

function save(state) {
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
}

function init() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) save({ users: [], nextId: 1 });
}

async function createUser(user) {
  const state = load();
  const exists = state.users.find(u => u.email === user.email);
  if (exists) throw new Error('User exists');
  const id = state.nextId++;
  const record = Object.assign({ id }, user);
  state.users.push(record);
  save(state);
  return record;
}

function getUserByEmail(email) {
  const state = load();
  return state.users.find(u => u.email === email) || null;
}

function getUserById(id) {
  const state = load();
  return state.users.find(u => u.id === id) || null;
}

function getPendingSellers() {
  const state = load();
  return state.users.filter(u => u.role === 'seller' && !u.is_approved);
}

function updateUser(id, updates) {
  const state = load();
  const idx = state.users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  state.users[idx] = Object.assign({}, state.users[idx], updates);
  save(state);
  return state.users[idx];
}

function createNotification(n) {
  const state = load();
  if (!state.notifications) state.notifications = [];
  const id = (state.nextNotifId || 1);
  state.nextNotifId = id + 1;
  const rec = { id, title: n.title, body: n.body, author: n.author, date: new Date().toISOString() };
  state.notifications.unshift(rec);
  save(state);
  return rec;
}

function getNotifications() {
  const state = load();
  return state.notifications || [];
}

function createItem(item) {
  const state = load();
  if (!state.items) state.items = [];
  const id = (state.nextItemId || 1);
  state.nextItemId = id + 1;
  const rec = { id, title: item.title, description: item.description, price: item.price, sellerId: item.sellerId, createdAt: new Date().toISOString() };
  state.items.unshift(rec);
  save(state);
  return rec;
}

function listItems() {
  const state = load();
  return state.items || [];
}

function getItemById(id) {
  const state = load();
  return (state.items || []).find(i => i.id === id) || null;
}

function getItemsBySeller(sellerId) {
  const state = load();
  return (state.items || []).filter(i => i.sellerId === sellerId);
}

function createOrder(order) {
  const state = load();
  if (!state.orders) state.orders = [];
  const id = (state.nextOrderId || 1);
  state.nextOrderId = id + 1;
  const rec = { id, itemId: order.itemId, buyerId: order.buyerId, qty: order.qty || 1, total: order.total || 0, createdAt: new Date().toISOString() };
  state.orders.unshift(rec);
  save(state);
  return rec;
}

function getOrdersByUser(userId) {
  const state = load();
  return (state.orders || []).filter(o => o.buyerId === userId);
}

module.exports = { init, createUser, getUserByEmail, getUserById, getPendingSellers, updateUser, createNotification, getNotifications, createItem, listItems, getItemById, getItemsBySeller, createOrder, getOrdersByUser };
