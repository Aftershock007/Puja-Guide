import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const fetchPandals = async (supabase: SupabaseClient<Database>) => {
	const { data, error } = await supabase.from('pandals').select('*')
	if (error) {
		throw error
	}
	return data
}
