import 'react-native-url-polyfill/auto'
import { useSession } from '@clerk/clerk-expo'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export default function useSupabase() {
	const { session } = useSession()
	const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

	if (!(supabaseUrl && supabaseAnonKey)) {
		throw new Error(
			'Supabase URL and Anon Key must be provided in the environment variables.'
		)
	}

	return createClient<Database>(supabaseUrl, supabaseAnonKey, {
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false
		},
		accessToken: async () => session?.getToken() ?? null
	})
}
