// Adds the default login so the app can be used straight after setup.
//   Email:    admin@todo.app
//   Password: Abc@123
// Change this password (or remove the user) before using the app anywhere public.
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'admin@todo.app';
const ADMIN_PASSWORD = 'Abc@123';

export const up = async (db) => {
  const now = new Date();

  // Upsert so the migration is safe to run on a database that already has this user.
  await db.collection('users').updateOne(
    { email: ADMIN_EMAIL },
    {
      $setOnInsert: {
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(ADMIN_PASSWORD, 10),
        role: 'admin',
        isActive: true,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
};

export const down = async (db) => {
  const admin = await db.collection('users').findOne({ email: ADMIN_EMAIL });
  if (!admin) return;

  await db.collection('todos').deleteMany({ user: admin._id });
  await db.collection('users').deleteOne({ _id: admin._id });
};
