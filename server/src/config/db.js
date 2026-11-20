import mongoose from 'mongoose';
import env from './env.js';

export async function connectDatabase(uri = env.mongoUri) {
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    // Collections and indexes are managed by migrations, not by Mongoose.
    autoIndex: false,
    autoCreate: false,
  });

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
