import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';

const args = process.argv.slice(2);
const getArg = (flag, fallback = '') => {
  const idx = args.indexOf(flag);
  if (idx === -1) return fallback;
  return args[idx + 1] || fallback;
};

const emailInput = getArg('--email', process.env.ADMIN_EMAIL);
const roleInput = getArg('--role', process.env.ADMIN_ROLE || 'admin');
const firstNameInput = getArg('--first', process.env.ADMIN_FIRST_NAME || 'Admin');
const lastNameInput = getArg('--last', process.env.ADMIN_LAST_NAME || 'User');
const firebaseUidInput = getArg('--uid', process.env.ADMIN_FIREBASE_UID || '');

if (!emailInput) {
  console.error('Missing email. Provide --email or set ADMIN_EMAIL in .env.');
  process.exit(1);
}

const email = emailInput.toLowerCase();
const role = roleInput.toLowerCase();
const allowedRoles = ['user', 'student', 'parent', 'teacher', 'staff', 'admin', 'super_admin', 'moderator'];

if (!allowedRoles.includes(role)) {
  console.error(`Invalid role "${role}". Allowed: ${allowedRoles.join(', ')}`);
  process.exit(1);
}

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const update = {
    email,
    firstName: firstNameInput,
    lastName: lastNameInput,
    role,
    isActive: true,
    isEmailVerified: true
  };

  if (firebaseUidInput) {
    update.firebaseUid = firebaseUidInput;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    if (!existing.password) {
      update.password = 'firebase-auth';
    }
    await User.updateOne({ email }, { $set: update });
    console.log(`Updated user ${email} to role "${role}".`);
  } else {
    await User.create({
      ...update,
      password: 'firebase-auth'
    });
    console.log(`Created user ${email} with role "${role}".`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Failed to create/update admin user:', err.message);
  process.exit(1);
});
