import type { SupabaseClient } from '@supabase/supabase-js'
import { create } from 'zustand'

interface SupabaseState {
	supabase: SupabaseClient | null
	setSupabase: (client: SupabaseClient) => void
}

export const useSupabaseStore = create<SupabaseState>((set) => ({
	supabase: null,
	setSupabase: (client) => set({ supabase: client })
}))
