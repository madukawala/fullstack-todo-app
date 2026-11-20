import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { todosApi } from '../api/todos.js';

export const TODOS_KEY = ['todos'];

export function useTodosQuery() {
  return useQuery({
    queryKey: TODOS_KEY,
    queryFn: ({ signal }) => todosApi.list(signal),
  });
}

// Shared setup for every todo mutation, so the optimistic update logic lives in one place:
//   1. onMutate  - stop any refetch in flight, save the current list, apply the change locally
//   2. onError   - put the saved list back and tell the user what went wrong
//   3. onSuccess - optional, e.g. swap a temporary item for the saved one
//   4. onSettled - refetch once the last running mutation finishes, so we end up in sync with the server
function useOptimisticTodoMutation({ mutationFn, applyChange, onSuccess, errorMessage }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: TODOS_KEY,
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: TODOS_KEY });
      const previous = queryClient.getQueryData(TODOS_KEY);
      queryClient.setQueryData(TODOS_KEY, (todos = []) => applyChange(todos, variables));
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TODOS_KEY, context.previous);
      }
      // 401s are handled globally (the user is sent back to login), so no extra toast for those.
      if (error.status !== 401) {
        toast.error(`${errorMessage} ${error.message}`);
      }
    },
    onSuccess: (data, variables) => {
      if (onSuccess) {
        queryClient.setQueryData(TODOS_KEY, (todos = []) => onSuccess(todos, data, variables));
      }
    },
    onSettled: () => {
      // isMutating still counts this mutation, so 1 means "this was the last one".
      if (queryClient.isMutating({ mutationKey: TODOS_KEY }) === 1) {
        queryClient.invalidateQueries({ queryKey: TODOS_KEY });
      }
    },
  });
}

const replaceTodo = (todos, id, next) => todos.map((todo) => (todo._id === id ? next : todo));

export function useCreateTodo() {
  return useOptimisticTodoMutation({
    mutationFn: ({ title, description }) => todosApi.create({ title, description }),
    applyChange: (todos, { tempId, title, description }) => {
      const now = new Date().toISOString();
      const draft = {
        _id: tempId,
        title: title.trim(),
        description: description.trim(),
        done: false,
        createdAt: now,
        updatedAt: now,
        isPending: true,
      };
      return [draft, ...todos];
    },
    // Swap the temporary item for the real one from the server.
    onSuccess: (todos, created, { tempId }) => replaceTodo(todos, tempId, created),
    errorMessage: 'Could not add the todo.',
  });
}

export function useUpdateTodo() {
  return useOptimisticTodoMutation({
    mutationFn: ({ id, title, description }) => todosApi.update(id, { title, description }),
    applyChange: (todos, { id, title, description }) =>
      todos.map((todo) =>
        todo._id === id
          ? { ...todo, title: title.trim(), description: description.trim(), updatedAt: new Date().toISOString() }
          : todo,
      ),
    errorMessage: 'Could not save your changes.',
  });
}

export function useToggleTodo() {
  return useOptimisticTodoMutation({
    mutationFn: ({ id, done }) => todosApi.setDone(id, done),
    applyChange: (todos, { id, done }) => todos.map((todo) => (todo._id === id ? { ...todo, done } : todo)),
    errorMessage: 'Could not update the todo.',
  });
}

export function useDeleteTodo() {
  return useOptimisticTodoMutation({
    mutationFn: ({ id }) => todosApi.remove(id),
    applyChange: (todos, { id }) => todos.filter((todo) => todo._id !== id),
    errorMessage: 'Could not delete the todo.',
  });
}
