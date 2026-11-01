// Adds a few sample todos for the default admin user so the list isn't empty on first login.
// Safe to run more than once: it does nothing if the admin already has todos.
//
//   npm run db:seed            add samples if the list is empty
//   npm run db:seed:fresh      delete the admin's todos first, then add samples
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import Todo from '../src/models/Todo.js';
import User from '../src/models/User.js';

const ADMIN_EMAIL = 'admin@todo.app';

const samples = [
  {
    title: 'Read the project README',
    description: 'Setup steps, scripts and design notes are all in there.',
    done: true,
  },
  { title: 'Log in with the default admin account', description: 'admin@todo.app / Abc@123', done: true },
  { title: 'Add a new todo', description: 'Use the form at the top of the list. Description is optional.' },
  { title: 'Edit a todo', description: 'Click the pencil icon, change the text, then press Enter or Save.' },
  { title: 'Try the filters', description: 'Switch between All, Active and Completed.' },
];

async function seed() {
  const fresh = process.argv.includes('--fresh');
  await connectDatabase();

  const admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    console.error(`User ${ADMIN_EMAIL} not found. Run "npm run db:migrate" first.`);
    process.exitCode = 1;
    return;
  }

  if (fresh) {
    const { deletedCount } = await Todo.deleteMany({ user: admin._id });
    console.log(`Removed ${deletedCount} existing todo(s).`);
  } else if (await Todo.exists({ user: admin._id })) {
    console.log('Admin already has todos, skipping. Run "npm run db:seed:fresh" to reset them.');
    return;
  }

  // Insert oldest first and space the timestamps out, so the list shows them in a natural order.
  const base = Date.now() - samples.length * 60_000;
  const docs = [...samples].reverse().map((sample, index) => {
    const createdAt = new Date(base + index * 60_000);
    return { description: '', done: false, ...sample, user: admin._id, createdAt, updatedAt: createdAt };
  });

  await Todo.insertMany(docs, { timestamps: false });
  console.log(`Added ${docs.length} sample todos for ${ADMIN_EMAIL}.`);
}

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
