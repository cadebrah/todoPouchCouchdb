import { addDatabaseChangeListener, localDB } from '../db';

// Todo interface
export interface Todo {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  type: string;
  _rev?: string;
}

// Data validation utility
const validateTodo = (todo: Todo): boolean => {
  const errors: string[] = [];
  
  if (!todo.title || typeof todo.title !== 'string') {
    errors.push('Title is required and must be a string');
  }
  
  if (todo.description && typeof todo.description !== 'string') {
    errors.push('Description must be a string');
  }
  
  if (typeof todo.completed !== 'boolean') {
    errors.push('Completed status must be a boolean');
  }
  
  if (errors.length > 0) {
    throw new Error(`Todo validation failed: ${errors.join(', ')}`);
  }
  
  return true;
};

// HTML encoding for security
export const encodeHtml = (str: string): string => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Todo model constructor
export class TodoModel implements Todo {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  type: string;
  _rev?: string;

  constructor(title: string, description: string = '', completed: boolean = false) {
    this._id = `todo_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.title = title;
    this.description = description;
    this.completed = completed;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.type = 'todo';
    
    // Validate the todo
    validateTodo(this);
  }
}

// Todo repository - handles database operations
export const TodoRepository = {
  // Create a new todo
  async create(title: string, description: string = ''): Promise<Todo> {
    try {
      // Create and validate the todo
      const todo = new TodoModel(title, description);
      
      // Sanitize input
      todo.title = encodeHtml(todo.title);
      todo.description = encodeHtml(todo.description);
      
      const result = await localDB.put(todo);
      return { ...todo, _rev: result.rev };
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  // Get all todos
  async getAll(): Promise<Todo[]> {
    try {
      const result = await localDB.find({
        selector: {
          type: 'todo'
        },
        sort: [{ createdAt: 'desc' }]
      });
      
      return result.docs as Todo[];
    } catch (error) {
      console.error('Error getting todos:', error);
      throw error;
    }
  },

  // Get todos by completion status
  async getByStatus(completed: boolean): Promise<Todo[]> {
    try {
      const result = await localDB.find({
        selector: {
          type: 'todo',
          completed: completed
        },
        sort: [{ createdAt: 'desc' }]
      });
      
      return result.docs as Todo[];
    } catch (error) {
      console.error(`Error getting ${completed ? 'completed' : 'incomplete'} todos:`, error);
      throw error;
    }
  },

  // Get a todo by ID
  async getById(id: string): Promise<Todo> {
    try {
      return await localDB.get(id) as Todo;
    } catch (error) {
      console.error(`Error getting todo ${id}:`, error);
      throw error;
    }
  },

  // Update a todo
  async update(id: string, updates: Partial<Todo>): Promise<Todo> {
    try {
      const todo = await this.getById(id);
      
      // Sanitize inputs
      if (updates.title) {
        updates.title = encodeHtml(updates.title);
      }
      if (updates.description) {
        updates.description = encodeHtml(updates.description);
      }
      
      const updatedTodo = {
        ...todo,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      // Validate the updated todo
      validateTodo(updatedTodo);
      
      const result = await localDB.put(updatedTodo);
      return { ...updatedTodo, _rev: result.rev };
    } catch (error) {
      console.error(`Error updating todo ${id}:`, error);
      throw error;
    }
  },

  // Delete a todo
  async delete(id: string): Promise<any> {
    try {
      const todo = await this.getById(id);
      return await localDB.remove(todo);
    } catch (error) {
      console.error(`Error deleting todo ${id}:`, error);
      throw error;
    }
  },

  // Toggle todo completion status
  async toggleComplete(id: string): Promise<Todo> {
    try {
      const todo = await this.getById(id);
      return await this.update(id, { completed: !todo.completed });
    } catch (error) {
      console.error(`Error toggling todo ${id}:`, error);
      throw error;
    }
  },
  
  // Delete all completed todos
  async deleteCompleted(): Promise<number> {
    try {
      const completedTodos = await this.getByStatus(true);
      
      const deletePromises = completedTodos.map(todo => 
        localDB.remove(todo)
      );
      
      await Promise.all(deletePromises);
      return completedTodos.length;
    } catch (error) {
      console.error('Error deleting completed todos:', error);
      throw error;
    }
  },

   // Add new reactive methods
   subscribeTodos(callback: (todos: Todo[]) => void) {
    // Initial load
    this.getAll().then(todos => callback(todos));
    
    // Return a function to unsubscribe
    return addDatabaseChangeListener(() => {
      this.getAll().then(todos => callback(todos));
    });
  },
  
  subscribeTodosByStatus(completed: boolean, callback: (todos: Todo[]) => void) {
    // Initial load
    this.getByStatus(completed).then(todos => callback(todos));
    
    // Return a function to unsubscribe
    return addDatabaseChangeListener(() => {
      this.getByStatus(completed).then(todos => callback(todos));
    });
  }
};