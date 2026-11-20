# @todo-app/shared

Validation rules and field limits used by both the client and the server.

Keeping them in one place means the form and the API always agree. For example, if the title limit changes from 120 to 200 characters, it only changes here.

## What is in it

| Export                                          | Description                                                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `TODO_TITLE_MAX`, `TODO_DESCRIPTION_MAX`        | Length limits for todo fields                                                                                 |
| `PASSWORD_MIN`, `PASSWORD_MAX`, `EMAIL_PATTERN` | Login field rules                                                                                             |
| `validateTodo(input, { partial })`              | Returns `{ field: message }` for a todo. With `partial: true`, missing fields are skipped (used for updates). |
| `validateLogin(input)`                          | Returns `{ field: message }` for the login form                                                               |
| `hasErrors(errors)`                             | `true` if the errors object has any keys                                                                      |

An empty object from a validator means the input is valid.

## Usage

```js
import { hasErrors, validateTodo } from '@todo-app/shared';

const errors = validateTodo({ title: '' });
// { title: 'Title is required.' }

if (hasErrors(errors)) {
  // show errors or return 400
}
```

The package is plain JavaScript (ES modules) with no build step. npm workspaces links it into `client` and `server`, and both Vite and Node import the source directly.

## Tests

```bash
npm test -w @todo-app/shared
```
