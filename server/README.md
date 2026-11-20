# TODO App - Server

REST API for the TODO app, built with Node.js, Express 5 and MongoDB (Mongoose). It handles login with JWT and stores each user's todos.

This package is part of an npm workspaces monorepo. See the [root README](../README.md) for the overall picture.

## Contents

- [Requirements](#requirements)
- [Setup and running](#setup-and-running)
- [Environment variables](#environment-variables)
- [MongoDB connection notes](#mongodb-connection-notes)
- [Migrations and seed data](#migrations-and-seed-data)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Assumptions and limitations](#assumptions-and-limitations)

## Requirements

- Node.js 22.12 or newer
- MongoDB 6 or newer running locally (or a MongoDB Atlas cluster)

## Setup and running

Install dependencies from the project root, not from this folder. npm workspaces links the shared package for you.

```bash
# from the project root
npm install

# optional, the defaults work for a local MongoDB
cp server/.env.example server/.env

# create collections, indexes and the default admin user
npm run db:migrate

# optional: add sample todos for the admin user
npm run db:seed

# start the API on http://localhost:4000 (restarts when files change)
npm run dev:server
```

You can also run the scripts from inside `server/` with `npm run <script>`.

| Script                                | What it does                                     |
| ------------------------------------- | ------------------------------------------------ |
| `npm run dev`                         | Starts the API with `node --watch`               |
| `npm start`                           | Starts the API in production mode                |
| `npm run db:migrate`                  | Runs pending migrations                          |
| `npm run db:migrate:down`             | Rolls back the last migration                    |
| `npm run db:migrate:status`           | Lists migrations and when they ran               |
| `npm run db:migrate:create -- <name>` | Creates a new migration file                     |
| `npm run db:seed`                     | Adds sample todos if the admin has none          |
| `npm run db:seed:fresh`               | Deletes the admin's todos, then adds the samples |
| `npm test`                            | Runs the API tests                               |

To check the API is up:

```bash
curl http://localhost:4000/api/health
# {"status":"ok","database":"up"}
```

## Environment variables

The API reads `server/.env` if it exists. Every value has a default for local development, so the `.env` file is optional on your machine.

| Variable         | Default                                             | Notes                                                                   |
| ---------------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| `NODE_ENV`       | `development`                                       | `production` turns on stricter checks                                   |
| `PORT`           | `4000`                                              | Port 5000 is avoided because macOS uses it for AirPlay                  |
| `MONGO_URI`      | `mongodb://127.0.0.1:27017/fullstack-todo-app`      | The database name is taken from the URI                                 |
| `MONGO_URI_TEST` | `mongodb://127.0.0.1:27017/fullstack-todo-app-test` | Used only by the tests                                                  |
| `JWT_SECRET`     | a fixed dev value                                   | Required when `NODE_ENV=production`. The app will not start without it. |
| `JWT_EXPIRES_IN` | `1d`                                                | Any value that `jsonwebtoken` accepts, for example `2h` or `7d`         |
| `CLIENT_URL`     | `http://localhost:5173`                             | Allowed origin for CORS                                                 |

To create a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## MongoDB connection notes

### Local MongoDB (default)

The app uses a local database called `fullstack-todo-app`. You do not need to create it by hand. MongoDB creates it the first time the migrations run.

Make sure MongoDB is running on `127.0.0.1:27017`:

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux with systemd
sudo systemctl start mongod

# Docker
docker run -d --name todo-mongo -p 27017:27017 mongo:7
```

`127.0.0.1` is used instead of `localhost` on purpose. On some machines `localhost` resolves to the IPv6 address `::1` first, and MongoDB is often only listening on IPv4.

If your local MongoDB has authentication turned on, add the user and password to the URI:

```
MONGO_URI=mongodb://myUser:myPassword@127.0.0.1:27017/fullstack-todo-app?authSource=admin
```

### MongoDB Atlas

Atlas works too. Create a free cluster, add your IP address to the network access list, then set `MONGO_URI` to the connection string and put the database name in the path:

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fullstack-todo-app?retryWrites=true&w=majority
```

Then run `npm run db:migrate` as usual. The same migrations work on Atlas.

### What ends up in the database

| Collection  | Purpose                                                             |
| ----------- | ------------------------------------------------------------------- |
| `users`     | User accounts. Unique index on `email`, JSON schema validator.      |
| `todos`     | Todos. Each one has a `user` field. Index on `{ user, createdAt }`. |
| `changelog` | Created by migrate-mongo to remember which migrations have run      |

## Migrations and seed data

Migrations live in `migrations/` and run with [migrate-mongo](https://github.com/seppevs/migrate-mongo). Settings are in `migrate-mongo-config.js`, which reads the same `MONGO_URI` as the API.

| File                                        | What it does                                                                |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| `20261030090000-create-users-collection.js` | Creates `users` with a schema validator and a unique email index            |
| `20261030090500-create-todos-collection.js` | Creates `todos` with a schema validator and the `{ user, createdAt }` index |
| `20261030091000-seed-default-admin-user.js` | Adds the default admin user                                                 |

The default user added by the migration:

| Field    | Value                             |
| -------- | --------------------------------- |
| name     | Admin                             |
| email    | admin@todo.app                    |
| password | Abc@123 (stored as a bcrypt hash) |
| role     | admin                             |
| isActive | true                              |

A few notes:

- Migrations are safe to run on a database that already has the collections. The validator is applied to the existing collection instead of failing.
- Every migration has a `down` step, so `npm run db:migrate:down` undoes them one at a time.
- Mongoose auto index is turned off in the app. Indexes are only created by migrations, so any index change is versioned and reviewed like any other code.
- Sample todos are in `seeders/seed-sample-todos.js`, not in a migration, because they are demo data rather than schema. The seeder does nothing if the admin already has todos.

## API reference

Base URL: `http://localhost:4000/api`

All `/todos` routes need the header `Authorization: Bearer <token>`.

### Error format

Every error uses the same shape. `message` is written so the front end can show it to the user as is. `details` is only present for validation errors.

```json
{
  "message": "Please fix the highlighted fields.",
  "details": { "title": "Title is required." }
}
```

| Status | When                                                                 |
| ------ | -------------------------------------------------------------------- |
| 400    | Validation failed or the body is not valid JSON                      |
| 401    | Missing, invalid or expired token, or wrong login details            |
| 404    | Todo or route not found (also used for todos owned by another user)  |
| 429    | Too many login attempts (20 per 15 minutes per IP)                   |
| 500    | Unexpected server error. Details are logged, not sent to the client. |

### POST /auth/login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@todo.app","password":"Abc@123"}'
```

Response `200`:

```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "_id": "6721f0...",
    "name": "Admin",
    "email": "admin@todo.app",
    "role": "admin",
    "isActive": true,
    "lastLoginAt": "2026-10-30T10:15:00.000Z",
    "createdAt": "2026-10-30T10:00:00.000Z",
    "updatedAt": "2026-10-30T10:15:00.000Z"
  }
}
```

A wrong email or password both return `401` with `"Incorrect email or password."`, so the API doesn't reveal which emails exist.

### GET /auth/me

Returns `{ "user": { ... } }` for the current token. The front end uses it to check a saved token on page load.

### GET /todos

Returns all todos for the logged in user, newest first.

```json
[
  {
    "_id": "6721f1...",
    "title": "Buy milk",
    "description": "",
    "done": false,
    "user": "6721f0...",
    "createdAt": "2026-10-30T10:20:00.000Z",
    "updatedAt": "2026-10-30T10:20:00.000Z"
  }
]
```

### POST /todos

```json
{ "title": "Buy milk", "description": "Semi-skimmed" }
```

- `title` is required, 1 to 120 characters after trimming
- `description` is optional, up to 1000 characters

Returns `201` with the new todo.

### PUT /todos/:id

Updates the title and/or description. Send only the fields you want to change.

```json
{ "title": "Buy oat milk" }
```

Returns `200` with the updated todo.

### PATCH /todos/:id/done

Toggles the done status when called with no body. You can also send the value you want, which is safer if the request might be retried:

```json
{ "done": true }
```

Returns `200` with the updated todo.

### DELETE /todos/:id

Returns `204` with no body.

### GET /health

Returns `200` with `{ "status": "ok", "database": "up" }`, or `503` if the database connection is down.

## Project structure

```
server/
├── migrate-mongo-config.js
├── migrations/
│   ├── helpers/ensureCollection.js
│   └── *.js                       one file per migration, run in name order
├── seeders/
│   └── seed-sample-todos.js
├── src/
│   ├── app.js                     builds the Express app (used by server.js and the tests)
│   ├── server.js                  connects to MongoDB and starts listening
│   ├── config/
│   │   ├── env.js                 loads .env and sets defaults
│   │   └── db.js                  Mongoose connection
│   ├── models/                    User and Todo
│   ├── routes/                    URL to handler mapping
│   ├── controllers/               the actual request handlers
│   ├── middleware/
│   │   ├── auth.js                checks the Bearer token
│   │   ├── validate.js            runs the shared validators
│   │   └── errorHandler.js        turns errors into JSON responses
│   └── utils/                     ApiError class and JWT helpers
└── tests/                         API tests (node:test + Supertest)
```

How a request flows: `routes` → `middleware` (auth, validation) → `controllers` → `models`. Any error thrown along the way ends up in `errorHandler`. Express 5 passes errors from async handlers there automatically, so there are no try/catch blocks in the controllers.

## Testing

```bash
# from the project root
npm test -w server

# or from this folder
npm test
```

The tests use Node's built-in test runner and Supertest. They connect to a separate database (`fullstack-todo-app-test` by default) and refuse to run if the database name does not contain "test". The test database is dropped when the tests finish.

What is covered:

- Login success, wrong password, validation errors, and token checks
- Create, list, update, toggle and delete todos
- Validation errors and invalid ids
- One user cannot see or change another user's todos

## Assumptions and limitations

- There is no sign-up endpoint. Users are created by the migration or by hand.
- Tokens cannot be revoked before they expire. Disabling a user (`isActive: false`) or deleting them does block access straight away, because the auth middleware loads the user on every request.
- The login rate limit is kept in memory, so it resets when the server restarts and is not shared between multiple server instances.
- `GET /todos` returns the whole list with no pagination.
- `title` and `description` are stored as plain text. React escapes them when rendering, so they are safe to display, but HTML is not supported.
- npm scripts set `NODE_ENV` with Unix shell syntax. On Windows, use Git Bash or WSL.
