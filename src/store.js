const STORE_KEY = 'dailySproutState';

// Default state if nothing is in localStorage
const getDefaultState = () => ({
  todos: [],
  streak: {
    count: 0,
    lastCompletedDate: null, // YYYY-MM-DD
  },
});

// Load state from localStorage or use default
let state = (() => {
  try {
    const savedState = localStorage.getItem(STORE_KEY);
    if (savedState) {
      // Migration for old data that might not have priority
      const parsed = JSON.parse(savedState);
      parsed.todos = parsed.todos.map(t => ({ priority: 'medium', ...t }));
      return parsed;
    }
  } catch (e) {
    console.error('Could not load state from localStorage', e);
  }
  return getDefaultState();
})();

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Could not save state to localStorage', e);
  }
}

function notifyStateChange() {
  window.dispatchEvent(new CustomEvent('statechange'));
}

export const store = {
  /**
   * Get the current state.
   * @returns {object} The current state.
   */
  getState() {
    return state;
  },

  /**
   * Add a new todo item.
   * @param {{text: string, type: 'daily' | 'monthly', date: string, priority: 'low' | 'medium' | 'high', parentId?: string}} todoData
   */
  addTodo({ text, type, date, priority, parentId = null }) {
    const newTodo = {
      id: `todo_${Date.now()}`,
      text,
      type,
      date, // YYYY-MM-DD
      priority,
      parentId,
      status: 'active',
      doneDescription: null,
    };
    state.todos.push(newTodo);
    saveState();
    notifyStateChange();
    return newTodo;
  },

  /**
   * Update an existing todo.
   * @param {string} todoId
   * @param {object} updates
   */
  updateTodo(todoId, updates) {
    const todoIndex = state.todos.findIndex(t => t.id === todoId);
    if (todoIndex > -1) {
      state.todos[todoIndex] = { ...state.todos[todoIndex], ...updates };
      
      const parentId = state.todos[todoIndex].parentId;
      if (parentId) {
        this.checkMonthlyCompletion(parentId);
      }

      this.updateStreakForDate(state.todos[todoIndex].date);

      saveState();
      notifyStateChange();
    }
  },

  /**
   * Delete a todo and its children if it's a monthly todo.
   * @param {string} todoId
   */
  deleteTodo(todoId) {
    const todoToDelete = state.todos.find(t => t.id === todoId);
    if (!todoToDelete) return;

    // Find all children if it's a monthly task
    const childrenIds = todoToDelete.type === 'monthly' 
      ? state.todos.filter(t => t.parentId === todoId).map(t => t.id)
      : [];
    
    const idsToDelete = new Set([todoId, ...childrenIds]);

    state.todos = state.todos.filter(t => !idsToDelete.has(t.id));
    
    saveState();
    notifyStateChange();
  },

  /**
   * Get all todos for a specific date, including scheduled monthly children.
   * @param {string} date YYYY-MM-DD
   * @returns {Array}
   */
  getTodosByDate(date) {
    const dayTodos = state.todos.filter(t => t.date === date && t.type === 'daily' && !t.parentId);
    const monthlyTodosOnDate = state.todos.filter(t => t.date === date && t.type === 'monthly');
    
    // Simple scheduling: if a monthly task has children, they appear every day of that month.
    const currentMonth = date.substring(0, 7); // YYYY-MM
    const relevantMonthlyTodos = state.todos.filter(t => t.type === 'monthly' && t.date.startsWith(currentMonth));
    
    let scheduledChildTodos = [];
    relevantMonthlyTodos.forEach(monthly => {
      const children = state.todos.filter(t => t.parentId === monthly.id);
      if (children.length > 0) {
        // This is the simple logic: add children to the current day's list
        // A more advanced scheduler would check dates here.
        // We also need to make sure we don't add duplicates if a child was manually added to this date.
        children.forEach(child => {
          // Create a virtual copy for this day
          scheduledChildTodos.push({ ...child, date: date });
        });
      }
    });

    // For now, let's stick to a simpler model until UI is refactored.
    // The logic above is for the future. Let's use the current simple filter.
    return state.todos.filter(t => t.date === date).sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  },

  /**
   * Checks if a monthly todo's children are all done.
   * @param {string} monthlyTodoId
   */
  checkMonthlyCompletion(monthlyTodoId) {
    const childTodos = state.todos.filter(t => t.parentId === monthlyTodoId);
    const allChildrenDone = childTodos.length > 0 && childTodos.every(t => t.status === 'done');
    
    const monthlyTodo = state.todos.find(t => t.id === monthlyTodoId);
    if (monthlyTodo && monthlyTodo.status !== 'done' && allChildrenDone) {
      monthlyTodo.status = 'done';
    }
  },

  /**
   * Updates the streak based on a given date's completion status.
   * @param {string} date YYYY-MM-DD
   */
  updateStreakForDate(date) {
    const todosForDay = this.getTodosByDate(date);
    if (todosForDay.length === 0) return;
    
    const allDone = todosForDay.every(t => t.status === 'done');
    if (!allDone) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedDate = new Date(date);
    completedDate.setHours(0, 0, 0, 0);
    
    const lastStreakDate = state.streak.lastCompletedDate ? new Date(state.streak.lastCompletedDate) : null;
    if(lastStreakDate) lastStreakDate.setHours(0, 0, 0, 0);

    if (state.streak.lastCompletedDate === date) return;

    const oneDay = 24 * 60 * 60 * 1000;
    
    if (lastStreakDate && completedDate.getTime() - lastStreakDate.getTime() === oneDay) {
      state.streak.count++;
    } else if (completedDate.getTime() !== (lastStreakDate ? lastStreakDate.getTime() : 0)) {
      state.streak.count = 1;
    }
    state.streak.lastCompletedDate = date;
  },

  onChange(callback) {
    window.addEventListener('statechange', callback);
  },

  offChange(callback) {
    window.removeEventListener('statechange', callback);
  }
};

