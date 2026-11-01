export const FILTERS = {
  all: { label: 'All', test: () => true },
  active: { label: 'Active', test: (todo) => !todo.done },
  completed: { label: 'Completed', test: (todo) => todo.done },
};
