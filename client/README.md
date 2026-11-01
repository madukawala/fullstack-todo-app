# TODO App - Client

React front end for the TODO app. It has a login page and a todo page where you can add, edit, complete, filter and delete todos. All data comes from the Express API in `../server`.

This package is part of an npm workspaces monorepo. See the [root README](../README.md) for the overall picture.

## Contents

- [Requirements](#requirements)
- [Setup and running](#setup-and-running)
- [Environment variables](#environment-variables)
- [How to use the app](#how-to-use-the-app)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Assumptions and limitations](#assumptions-and-limitations)

## Requirements

- Node.js 22.12 or newer
- The API running on http://localhost:4000 (see [server/README.md](../server/README.md))

## Setup and running

Install from the project root so the shared package gets linked:

```bash
# from the project root
npm install

# make sure the database is ready (first time only)
npm run setup

# start API and client together
npm run dev

# or start only the client
npm run dev:client
```

Open http://localhost:5173 and log in with:

- Email: `admin@todo.app`
- Password: `Abc@123`

Other scripts (run from this folder, or from the root with `-w client`):

| Script               | What it does                            |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Starts the Vite dev server on port 5173 |
| `npm run build`      | Builds the app into `dist/`             |
| `npm run preview`    | Serves the built app locally            |
| `npm test`           | Runs the tests once                     |
| `npm run test:watch` | Runs the tests in watch mode            |

## Environment variables

Both are optional. Copy `.env.example` to `.env.local` if you need to change them.

| Variable                | Default                 | Notes                                                                                                                |
| ----------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_PROXY_TARGET` | `http://localhost:4000` | Where the dev server forwards `/api` requests                                                                        |
| `VITE_API_URL`          | empty                   | Full API URL for production builds when the API is on another domain. Leave empty to call `/api` on the same domain. |

In development the browser only talks to the Vite server, and Vite forwards `/api/*` to the API. This avoids CORS issues and means the client code never needs to know the API port.

## How to use the app

- **Add a todo**: type a title and press Enter or click Add. Clicking the title box also shows an optional description box. Ctrl/Cmd + Enter submits from the description box.
- **Mark as done**: click the round checkbox. Done todos get a strikethrough and faded text.
- **Edit**: click the pencil icon. Press Enter in the title (or Ctrl/Cmd + Enter in the description) to save, or Escape to cancel.
- **Delete**: click the bin icon, then confirm with Yes.
- **Filter**: switch between All, Active and Completed. Each tab shows a count.
- **Log out**: top right. You are also logged out automatically, with a message, if your session expires.

## How it works

### Authentication

- `AuthContext` holds the current user and a status of `checking`, `authenticated` or `guest`.
- After login the JWT is saved in `localStorage`. On page load, a saved token is checked with `GET /api/auth/me` before the todo page is shown.
- `ProtectedRoute` sends guests to `/login` and remembers where they were going, so they land back there after logging in.
- If any request returns `401`, the fetch wrapper calls a logout handler. The user is sent back to the login page with a toast like "Your session has expired. Please log in again."

### Talking to the API

- `src/api/client.js` is a small wrapper around `fetch`. It adds the token, sends and parses JSON, and turns failures into an `ApiError` with a message that is safe to show to users.
- Network failures become "Cannot reach the server. Please check your connection and try again."
- Server state is managed with TanStack Query. The todo list is cached, and failed loads are retried twice for network and server errors, but not for `4xx` errors.

### Optimistic updates

Every change (create, edit, toggle, delete) is shown in the list straight away, before the server replies. The logic lives in one helper in `src/hooks/useTodos.js`:

1. Cancel any list refetch that is running, so it can't overwrite the change.
2. Save a snapshot of the current list.
3. Apply the change to the cached list.
4. If the request fails, put the snapshot back and show a toast with the reason.
5. When the last running change finishes, refetch the list once to make sure it matches the server.

A new todo gets a temporary id and is shown slightly faded with "Saving..." until the server returns the real one. Edit, toggle and delete are disabled on it until then.

### Form validation

The forms use the same validation functions as the API, from `packages/shared`. So the limits (title required, max 120 characters, description max 1000) are defined once.

- Errors show after you leave a field or try to submit, not while you are still typing the first time.
- A character counter appears when you get close to a limit.
- On the login form, field errors returned by the server are shown on the matching inputs. For todo changes, a server error rolls the change back and shows a toast.
- Inputs use `aria-invalid` and `aria-describedby` so screen readers read out the error.

### Loading, empty and error states

- First load shows skeleton rows. Later background refreshes show a small spinner next to the heading.
- If loading fails, the list area shows the error message and a Try again button.
- Each filter has its own empty message, for example "All caught up" when there are no active todos.

### UX details

- List items animate in, slide out when deleted, and move smoothly when the list changes (Motion layout animations).
- The active filter has a sliding highlight.
- The checkbox pops when ticked and the strikethrough fades in.
- A progress bar shows how many todos are done.
- Dark mode follows the system setting.
- Animations are turned off for users who have "reduce motion" enabled.
- The layout works on small screens.

## Project structure

```
client/
├── index.html
├── vite.config.js           dev server, /api proxy and test config
├── public/
└── src/
    ├── main.jsx             entry point
    ├── App.jsx              providers and routes
    ├── queryClient.js       TanStack Query defaults
    ├── api/
    │   ├── client.js        fetch wrapper, token storage, ApiError
    │   ├── auth.js
    │   └── todos.js
    ├── context/
    │   └── AuthContext.jsx
    ├── hooks/
    │   ├── useTodos.js      list query and optimistic mutations
    │   └── useTodoForm.js   form state and validation for add/edit
    ├── components/
    │   ├── AppHeader.jsx
    │   ├── FormField.jsx    label + input + error + counter
    │   ├── Icons.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── Spinner.jsx
    │   ├── TodoEditForm.jsx
    │   ├── TodoFilters.jsx
    │   ├── TodoForm.jsx
    │   ├── TodoItem.jsx
    │   └── TodoList.jsx     list, skeleton, empty and error states
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── TodosPage.jsx
    │   └── NotFoundPage.jsx
    ├── styles/index.css
    ├── utils/
    └── test/                test setup and helpers
```

## Testing

```bash
# from the project root
npm test -w client

# or from this folder
npm test
```

Tests use Vitest, Testing Library and jsdom. `fetch` is mocked, so the API does not need to be running.

What is covered:

- Login form validation, a wrong password message, and a successful login redirect
- The todo list loads from the API
- A new todo appears before the server responds (optimistic create)
- An empty title is not submitted
- A todo comes back if deleting it fails (rollback)

## Assumptions and limitations

- The token is kept in `localStorage`. It is simple and works well for this task, but an `httpOnly` cookie with refresh tokens would be safer for production.
- The default login hint under the login form is only shown in development builds.
- Filtering is done on the client, since the API returns the whole list.
- There is no offline support. If the API is down, changes are rolled back and an error is shown.
- Built for current versions of modern browsers. Older browsers such as Internet Explorer are not supported.
