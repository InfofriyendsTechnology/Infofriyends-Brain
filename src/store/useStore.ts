import { create } from 'zustand'

interface AppState {
  isAddWorkModalOpen: boolean
  setAddWorkModalOpen: (isOpen: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  isAddWorkModalOpen: false,
  setAddWorkModalOpen: (isOpen) => set({ isAddWorkModalOpen: isOpen }),
}))
