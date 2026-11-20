// Creates the users collection with a basic schema check and a unique email index.

import { ensureCollection } from './helpers/ensureCollection.js';

export const up = async (db) => {
  await ensureCollection(db, 'users', {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password', 'role', 'isActive'],
      properties: {
        name: { bsonType: 'string', maxLength: 100 },
        email: { bsonType: 'string' },
        password: { bsonType: 'string', description: 'bcrypt hash, never plain text' },
        role: { enum: ['admin', 'user'] },
        isActive: { bsonType: 'bool' },
        lastLoginAt: { bsonType: ['date', 'null'] },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  });

  await db.collection('users').createIndex({ email: 1 }, { unique: true, name: 'email_unique' });
};

export const down = async (db) => {
  await db.collection('users').drop();
};
