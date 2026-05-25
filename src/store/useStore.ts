import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

interface AppState {
  isAddWorkModalOpen: boolean
  setAddWorkModalOpen: (isOpen: boolean) => void
  isNavbarHidden: boolean
  setNavbarHidden: (isHidden: boolean) => void
  
  // Toast State
  toasts: Toast[]
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void
  removeToast: (id: string) => void

  // Confirm Modal State
  confirmState: {
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    danger: boolean
    resolve: ((value: boolean) => void) | null
  }
  showConfirm: (options: ConfirmOptions) => Promise<boolean>
  closeConfirm: (value: boolean) => void
}

export const useStore = create<AppState>((set, get) => ({
  isAddWorkModalOpen: false,
  setAddWorkModalOpen: (isOpen) => set({ isAddWorkModalOpen: isOpen }),
  isNavbarHidden: false,
  setNavbarHidden: (isHidden) => set({ isNavbarHidden: isHidden }),

  // Toast Implementation
  toasts: [],
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, message, type }
    set((state) => ({ toasts: [...state.toasts, newToast] }))
    
    setTimeout(() => {
      get().removeToast(id)
    }, duration)
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  // Confirm Modal Implementation
  confirmState: {
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    danger: false,
    resolve: null,
  },
  showConfirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        confirmState: {
          isOpen: true,
          title: options.title,
          message: options.message,
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          danger: options.danger || false,
          resolve,
        },
      })
    })
  },
  closeConfirm: (value) => {
    const { resolve } = get().confirmState
    if (resolve) resolve(value)
    set((state) => ({
      confirmState: {
        ...state.confirmState,
        isOpen: false,
        resolve: null,
      },
    }))
  },
}))
