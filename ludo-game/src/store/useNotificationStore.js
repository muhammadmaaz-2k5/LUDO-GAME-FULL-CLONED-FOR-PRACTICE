import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast = {
      id,
      type: toast.type || 'info', // 'success' | 'error' | 'info' | 'warning'
      message: toast.message || '',
      duration: toast.duration || 4000,
    };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, newToast.duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
