import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from './db';

async function run() {
  const users = [
    { email: 'student@example.com', password: 'password', role: 'student', name: 'Student One', is_approved: true },
    { email: 'seller@example.com', password: 'password', role: 'seller', name: 'Seller One', is_approved: false },
    { email: 'admin@example.com', password: 'password', role: 'admin', name: 'Admin User', is_approved: true },
    { email: 'lecturer@example.com', password: 'password', role: 'lecturer', name: 'Dr Lecturer', is_approved: true }
  ];

  for (const u of users) {
    const exists = getUserByEmail(u.email);
    if (exists) continue;
    const hashed = await bcrypt.hash(u.password, 8);
    await createUser({ email: u.email, password: hashed, role: u.role, name: u.name, is_approved: u.is_approved, banned: false });
    console.log('Created user', u.email);
  }
  console.log('Seed complete');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
