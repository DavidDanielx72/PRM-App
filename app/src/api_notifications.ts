export async function postNotification(title: string, body: string, author: string, token?: string) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch('http://10.0.2.2:4000/api/notifications', {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, body, author })
  });
  return res.json();
}

export async function getNotifications() {
  const res = await fetch('http://10.0.2.2:4000/api/notifications');
  return res.json();
}
