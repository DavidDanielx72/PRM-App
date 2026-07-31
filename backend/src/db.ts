import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(__dirname, '..', 'data', 'db.json');

function load() {
  if (!fs.existsSync(DB_FILE)) return { users: [], nextId: 1 };
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return { users: [], nextId: 1 };
  }
}

function save(state: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
}

export function init() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_FILE)) save({ users: [], nextId: 1 });
}

export async function createUser(user: any) {
  const state = load();
  const exists = state.users.find((u: any) => u.email === user.email);
  if (exists) throw new Error('User exists');
  const id = state.nextId++;
  const record = { id, ...user };
  state.users.push(record);
  save(state);
  return record;
}

export function getUserByEmail(email: string) {
  const state = load();
  return state.users.find((u: any) => u.email === email) || null;
}

export function getUserById(id: number) {
  const state = load();
  return state.users.find((u: any) => u.id === id) || null;
}

export function getPendingSellers() {
  const state = load();
  return state.users.filter((u: any) => u.role === 'seller' && !u.is_approved);
}

export function updateUser(id: number, updates: any) {
  const state = load();
  const idx = state.users.findIndex((u: any) => u.id === id);
  if (idx === -1) return null;
  state.users[idx] = { ...state.users[idx], ...updates };
  save(state);
  return state.users[idx];
}

export default {};
