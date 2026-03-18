// Test setup file for Vitest
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Create a window object if it doesn't exist
if (typeof global.window === 'undefined') {
  global.window = global;
}

// Mock CustomEvent and event listeners
const eventListeners = {};

global.CustomEvent = class CustomEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.detail = eventInitDict.detail;
  }
};

global.addEventListener = vi.fn((event, callback) => {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }
  eventListeners[event].push(callback);
});

global.removeEventListener = vi.fn((event, callback) => {
  if (eventListeners[event]) {
    eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
  }
});

global.dispatchEvent = vi.fn((event) => {
  if (eventListeners[event.type]) {
    eventListeners[event.type].forEach(callback => callback(event));
  }
  return true;
});

// Also mock window.addEventListener and window.dispatchEvent
global.window.addEventListener = global.addEventListener;
global.window.removeEventListener = global.removeEventListener;
global.window.dispatchEvent = global.dispatchEvent;

// Helper to clear event listeners between tests
global.clearEventListeners = () => {
  Object.keys(eventListeners).forEach(key => {
    delete eventListeners[key];
  });
};
