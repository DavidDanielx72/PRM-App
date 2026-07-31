const BASE = 'http://10.0.2.2:4000'; // use emulator localhost mapping; change to http://localhost:4000 for other setups

async function handleJSON(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { text }; }
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleJSON(res);
}

export async function register(email: string, password: string, role = 'student', name?: string) {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, name })
  });
  return handleJSON(res);
}

export async function me(token: string) {
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleJSON(res);
}

export async function getPendingSellers(token: string) {
  const res = await fetch(`${BASE}/api/admin/pending-sellers`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return handleJSON(res);
}

export async function approveSeller(token: string, id: number, approve = true) {
  const res = await fetch(`${BASE}/api/admin/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id, approve })
  });
  return handleJSON(res);
}

export async function banUser(token: string, id: number, ban = true) {
  const res = await fetch(`${BASE}/api/admin/ban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ id, ban })
  });
  return handleJSON(res);
}

export async function requestSeller(token: string) {
  const res = await fetch(`${BASE}/api/user/request-seller`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  return handleJSON(res);
}

export async function listItems() {
  const res = await fetch(`${BASE}/api/items`);
  return handleJSON(res);
}

export async function createItem(token: string, title: string, description: string, price: number) {
  const res = await fetch(`${BASE}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, description, price })
  });
  return handleJSON(res);
}

export async function getItem(id: number) {
  const res = await fetch(`${BASE}/api/items/${id}`);
  return handleJSON(res);
}

export async function createOrder(token: string, itemId: number, qty = 1) {
  const res = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ itemId, qty })
  });
  return handleJSON(res);
}

export async function getMyOrders(token: string) {
  const res = await fetch(`${BASE}/api/orders`, { headers: { Authorization: `Bearer ${token}` } });
  return handleJSON(res);
}
