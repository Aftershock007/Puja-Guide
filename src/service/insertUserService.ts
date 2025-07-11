import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { Users } from '@/types/types'

export const insertUsers = async (
	supabase: SupabaseClient<Database>,
	userData: Users
) => {
	const { data, error } = await supabase.from('users').insert(userData).select()
	if (error) {
		throw error
	}
	return data
}
