# Full-Stack TODO App

A simple TODO app built with React, Node.js, Express and MongoDB. Users log in, then create, view, edit, complete and delete their own todos.

The project is set up as a monorepo using npm workspaces. The React app, the Express API and a small shared package all live in one repository and are installed with a single `npm install`.

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [API overview](#api-overview)
- [Design decisions](#design-decisions)
- [Testing](#testing)
- [Assumptions and limitations](#assumptions-and-limitations)
- [What I would add next](#what-i-would-add-next)

More detail is in the README of each package:

- [server/README.md](server/README.md) - API setup, MongoDB notes, migrations, endpoints
- [client/README.md](client/README.md) - front end setup, structure and UX details

## Features

Required features:

- View all todos
- Create a todo with a title and an optional description
- Edit the title and/or description
- Mark a todo as done or not done
- Delete a todo
- Completed todos are clearly shown (strikethrough and faded text)
- Loading and error states are handled on every screen

Extra features:

- Login page with JWT authentication. Each user only sees their own todos.
- Database migrations and seed scripts, including a default admin user
- Form validation on both the client and the server, using the same rules from a shared package
- User-friendly error messages (field level errors, toasts, and a retry option when loading fails)
- Optimistic UI updates. Changes show instantly and roll back if the server says no.
- Small UX touches: animated list items, an animated filter switch, a progress bar, skeleton loading, keyboard shortcuts, dark mode and support for "reduce motion"
- Filters for All, Active and Completed todos
- Automated tests for the shared package, the API and the main UI flows

## Tech stack

| Part         | Tools                                                                             |
| ------------ | --------------------------------------------------------------------------------- |
| Front end    | React 19, Vite, React Router, TanStack Query, Motion, react-hot-toast             |
| Styling      | Plain CSS with CSS variables (no UI component library or CSS framework)           |
| Back end     | Node.js, Express 5, Mongoose, JSON Web Tokens, bcrypt, Helmet, express-rate-limit |
| Database     | MongoDB (local) with migrate-mongo for migrations                                 |
| Monorepo     | npm workspaces, concurrently                                                      |
| Testing      | Node test runner + Supertest (API), Vitest + Testing Library (UI)                 |
| Code quality | ESLint, Prettier, EditorConfig                                                    |

### Tools and libraries, and why each one is here

The brief allows any UI libraries or tools that help productivity. I added a library only where it saves real effort or avoids writing something that is easy to get wrong.

| Tool                                               | What it does in this project                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------- |
| Vite                                               | Fast dev server with hot reload, `/api` proxy to the API, production build        |
| npm workspaces                                     | One install for the whole repo, shared validation package, root scripts           |
| concurrently                                       | Runs the API and the React app with a single `npm run dev`                        |
| TanStack Query                                     | Caching, loading and error states, retries and optimistic updates for server data |
| React Router                                       | Login page, protected todo page and a not found page                              |
| Motion                                             | List, filter and form animations (small, focused animation library)               |
| react-hot-toast                                    | Toast messages for errors such as a failed save (small, focused UI library)       |
| migrate-mongo                                      | Versioned database migrations with rollback                                       |
| bcryptjs, jsonwebtoken, Helmet, express-rate-limit | Password hashing, login tokens, security headers and login rate limiting          |
| Vitest, Testing Library, Supertest, node:test      | Client, API and shared package tests                                              |
| ESLint, Prettier, EditorConfig                     | Consistent code style and catching mistakes early                                 |

## Project structure

```
fullstack-todo-app/
├── client/                  React front end (Vite)
│   ├── src/
│   │   ├── api/             fetch wrapper and API calls
│   │   ├── components/      UI pieces (form, list, item, filters, ...)
│   │   ├── context/         auth state
│   │   ├── hooks/           data fetching and form hooks
│   │   ├── pages/           Login, Todos and Not Found pages
│   │   └── styles/          global CSS
│   └── README.md
├── server/                  Express API
│   ├── migrations/          database migrations (collections, indexes, admin user)
│   ├── seeders/             sample data
│   ├── src/
│   │   ├── config/          env and database connection
│   │   ├── controllers/     request handlers
│   │   ├── middleware/      auth, validation, error handling
│   │   ├── models/          Mongoose models
│   │   ├── routes/          route definitions
│   │   └── utils/
│   ├── tests/
│   └── README.md
├── packages/
│   └── shared/              validation rules and limits used by client and server
├── package.json             workspace config and root scripts
└── README.md
```

## Getting started

### Prerequisites

- Node.js 22.12 or newer (Node 24 LTS recommended). There is an `.nvmrc` file, so `nvm use` will pick the right version.
- npm 10 or newer
- MongoDB running locally on the default port `27017`. MongoDB Community Server 6 or newer is fine.

To check that MongoDB is running:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

If you don't have MongoDB installed, the quickest options are:

```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# or with Docker
docker run -d --name todo-mongo -p 27017:27017 mongo:7
```

### Setup

```bash
# 1. Clone the repo and move into it
git clone <repository-url>
cd fullstack-todo-app

# 2. Install everything (client, server and shared package) in one go
npm install

# 3. Optional: create the env files. The defaults already point to the
#    local database "fullstack-todo-app", so you can skip this step.
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# 4. Create the collections, indexes and default user, then add sample todos
npm run setup

# 5. Start the API and the React app together
npm run dev
```

Then open http://localhost:5173 and log in with the default account:

| Email          | Password |
| -------------- | -------- |
| admin@todo.app | Abc@123  |

The API runs on http://localhost:4000. In development the React app forwards all `/api` requests to it through the Vite proxy.

## Available scripts

Run these from the project root.

| Command                     | What it does                                                  |
| --------------------------- | ------------------------------------------------------------- |
| `npm run dev`               | Starts the API and the React app together                     |
| `npm run dev:server`        | Starts only the API (restarts on file changes)                |
| `npm run dev:client`        | Starts only the React app                                     |
| `npm run setup`             | Runs all migrations and adds sample todos                     |
| `npm run db:migrate`        | Runs pending migrations                                       |
| `npm run db:migrate:down`   | Rolls back the last migration                                 |
| `npm run db:migrate:status` | Shows which migrations have run                               |
| `npm run db:seed`           | Adds sample todos for the admin user (only if they have none) |
| `npm run db:seed:fresh`     | Deletes the admin's todos and adds the samples again          |
| `npm test`                  | Runs the tests for every package                              |
| `npm run lint`              | Runs ESLint on the whole repo                                 |
| `npm run format`            | Formats the code with Prettier                                |
| `npm run build`             | Builds the React app for production                           |
| `npm start`                 | Starts the API in production mode                             |

## API overview

All todo routes need an `Authorization: Bearer <token>` header. The token comes from the login endpoint.

| Method | Endpoint              | Description                          |
| ------ | --------------------- | ------------------------------------ |
| POST   | `/api/auth/login`     | Log in, returns a JWT and the user   |
| GET    | `/api/auth/me`        | Returns the logged in user           |
| GET    | `/api/todos`          | Get all todos for the logged in user |
| POST   | `/api/todos`          | Create a todo                        |
| PUT    | `/api/todos/:id`      | Update the title and/or description  |
| PATCH  | `/api/todos/:id/done` | Toggle the done status               |
| DELETE | `/api/todos/:id`      | Delete a todo                        |
| GET    | `/api/health`         | Health check (API and database)      |

Request and response examples are in [server/README.md](server/README.md#api-reference).

## Design decisions

**npm workspaces for the monorepo.** The project has three packages and no complex build pipeline, so npm workspaces is enough. It comes with npm, needs no extra tooling, and gives one install, one lock file and root scripts that run across packages. Tools like Turborepo or Nx would make sense once there are more packages or slow builds worth caching.

**A shared package for validation.** `packages/shared` holds the field limits and validation functions. The login and todo forms use them to show errors as you type, and the API uses the same functions to reject bad requests. This means the two sides can't drift apart, which is the main practical benefit of the monorepo here.

**Migrations instead of letting Mongoose create things.** Collections, JSON schema validators and indexes are created by migrate-mongo scripts, and Mongoose's auto index is turned off. This keeps database changes versioned, reviewable and reversible, the same way you would handle a SQL schema. The default admin user is also added by a migration so a fresh database is usable right away. Sample todos are kept in a separate seeder because they are demo data, not schema.

**JWT in the Authorization header.** The API is stateless and easy to test with curl or Postman. On every request the auth middleware also loads the user from the database, so a deleted or disabled user loses access straight away instead of when the token expires.

**Todos belong to a user.** Every todo query is filtered by the logged in user's id. Asking for someone else's todo returns 404, not 403, so the API doesn't reveal that the id exists.

**TanStack Query for server state.** It handles caching, loading and error states, retries and refetching. Optimistic updates are written once in a small helper and reused for create, update, toggle and delete. If a request fails, the list is restored from a snapshot and a toast explains what happened.

**The "done" endpoint accepts an optional value.** `PATCH /api/todos/:id/done` toggles the status as the spec asks. The client also sends `{ "done": true }` or `{ "done": false }` so the result is predictable even if the request is retried or the user clicks twice quickly.

**Consistent error format.** Every error response looks like `{ "message": "...", "details": { "field": "..." } }`. The message is always written for end users, so the client can show it directly, and `details` lets forms highlight the exact field.

**No UI component library or CSS framework.** I looked at Tailwind CSS and MUI. For an app with two screens the benefit was small, while the cost was real: a bigger bundle, more dependencies, and a look that is harder to make your own. So the styling is plain CSS, and I only added small, focused libraries where they save real effort (Motion for animations, react-hot-toast for toasts, TanStack Query for server data). To be clear, the app does use those two small UI libraries. What it does not use is a full component kit like MUI, Chakra or Bootstrap, or a CSS framework like Tailwind.

Even without a component library, everything the brief asks for in the UI is there:

- A clean list, an add form, inline editing, a checkbox to mark todos done, and a delete button with a confirm step
- Completed todos shown with a strikethrough and faded text
- Loading skeletons, empty states for each filter, an error state with a Try again button, and toast messages
- Dark mode that follows the system setting, a layout that works on small screens, and support for "reduce motion"
- Accessible forms: real labels, `aria-invalid` and `aria-describedby` for errors, visible focus outlines and keyboard shortcuts

The CSS is organised so it stays easy to maintain:

- All colours, radii and shadows are CSS variables (design tokens) in one place, at the top of `client/src/styles/index.css`. Dark mode is a single block that changes those variables.
- Class names follow a simple BEM style (`todo`, `todo__title`, `todo--done`), and the file is split into sections per feature.
- Small reusable components play the role a component library would: `FormField` (label, input, error message and character counter), `Spinner`, `Icons` (inline SVGs, so no icon library either) and `TodoList` with its loading, empty and error states.

The result is a small front end: the production build is around 150 KB of JavaScript and about 3 KB of CSS after gzip. Because the styles live in one file and the components are small, moving to Tailwind or MUI later would be a contained change if the team prefers one.

## Testing

```bash
npm test
```

This runs:

- `packages/shared` - unit tests for the validation rules
- `server` - API tests with Supertest against a separate database called `fullstack-todo-app-test`. That database is dropped after the tests, so your real data is never touched.
- `client` - Vitest + Testing Library tests for login, validation, optimistic create and rollback on failed delete

MongoDB must be running for the server tests.

## Assumptions and limitations

- There is no sign-up page. The task did not ask for one, so the default admin user is created by a migration. More users can be added straight into the `users` collection (the password must be a bcrypt hash).
- The JWT is stored in `localStorage` for simplicity. For a production app I would use a short-lived access token plus a refresh token in an `httpOnly` cookie.
- There is no "log out everywhere" or token revocation. Tokens expire after one day by default (`JWT_EXPIRES_IN`).
- Todos are not paginated. That is fine for a personal todo list but would need paging for very large lists.
- If two optimistic changes are running and one fails, the rollback restores the list from before that change. The list is then refetched from the server, so it always ends up correct.
- The npm scripts set `NODE_ENV` using Unix shell syntax. On Windows, run them from Git Bash or WSL.
- The default admin password is public in this README. Change it or remove the user before running the app anywhere public.

## What I would add next

- Sign-up, password reset and refresh tokens
- Due dates, priorities and drag and drop ordering
- Pagination or infinite scroll on the API and the list
- End to end tests with Playwright
- Docker Compose for the API and database, and a CI pipeline that runs lint and tests
