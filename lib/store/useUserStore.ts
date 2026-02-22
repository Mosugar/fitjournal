import { create } from 'zustand'
import { Profile } from '@/lib/types'

type UserStore = {
  profile: Profile | null
  isLoaded: boolean
  setProfile: (profile: Profile | null) => void
  updateProfile: (updates: Partial<Profile>) => void
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  isLoaded: false,

  setProfile: (profile) => set({ profile, isLoaded: true }),

  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
}))