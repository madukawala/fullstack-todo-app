import mongoose from 'mongoose';
import { TODO_DESCRIPTION_MAX, TODO_TITLE_MAX } from '@todo-app/shared';

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: TODO_TITLE_MAX },
    description: { type: String, trim: true, maxlength: TODO_DESCRIPTION_MAX, default: '' },
    done: { type: Boolean, default: false },
    // Every todo belongs to the user who created it.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
);

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
