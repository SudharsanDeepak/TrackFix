import { create } from 'zustand'

export const useUIStore = create(set => ({
  // Loading states
  loadingStates: {},

  // Error states
  errors: {},

  // Toast messages
  toasts: [],

  // Modal state
  modals: {},

  // Set loading state for a specific key
  setLoading: (key, isLoading) =>
    set(state => ({
      loadingStates: { ...state.loadingStates, [key]: isLoading },
    })),

  // Set error for a specific key
  setError: (key, error) =>
    set(state => ({
      errors: { ...state.errors, [key]: error },
    })),

  // Clear error for a specific key
  clearError: key =>
    set(state => {
      const newErrors = { ...state.errors }
      delete newErrors[key]
      return { errors: newErrors }
    }),

  // Clear all errors
  clearAllErrors: () => set({ errors: {} }),

  // Add toast notification
  addToast: toast =>
    set(state => ({
      toasts: [...state.toasts, { ...toast, id: Date.now() }],
    })),

  // Remove toast by id
  removeToast: id =>
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    })),

  // Open modal
  openModal: (modalId, data = null) =>
    set(state => ({
      modals: { ...state.modals, [modalId]: { isOpen: true, data } },
    })),

  // Close modal
  closeModal: modalId =>
    set(state => ({
      modals: { ...state.modals, [modalId]: { isOpen: false, data: null } },
    })),

  // Check if loading
  isLoading: key => state => state.loadingStates[key] || false,

  // Get error
  getError: key => state => state.errors[key] || null,

  // Check if modal is open
  isModalOpen: modalId => state => state.modals[modalId]?.isOpen || false,
}))
