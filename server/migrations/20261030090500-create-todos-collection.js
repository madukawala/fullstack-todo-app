// Creates the todos collection. The compound index matches the main query:
// "all todos for this user, newest first".

import { ensureCollection } from './helpers/ensureCollection.js';

export const up = async (db) => {
  await ensureCollection(db, 'todos', {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'done', 'user'],
      properties: {
        title: { bsonType: 'string', minLength: 1, maxLength: 120 },
        description: { bsonType: 'string', maxLength: 1000 },
        done: { bsonType: 'bool' },
        user: { bsonType: 'objectId' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  });

  await db.collection('todos').createIndex({ user: 1, createdAt: -1 }, { name: 'user_createdAt' });
};

export const down = async (db) => {
  await db.collection('todos').drop();
};
