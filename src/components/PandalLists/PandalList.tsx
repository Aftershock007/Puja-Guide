import { memo } from 'react'
import {
	ActivityIndicator,
	FlatList,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { usePandals } from '@/hooks/usePandals'
import type { Pandals } from '@/types/dbTypes'

interface PandalListProps {
	onPandalPress?: (pandal: Pandals) => void
}

const PandalList = memo<PandalListProps>(({ onPandalPress }) => {
	const { pandals, isLoading, hasError, error, refreshData, isEmpty } =
		usePandals()

	const renderPandal = ({ item }: { item: Pandals }) => (
		<TouchableOpacity
			onPress={() => onPandalPress?.(item)}
			style={{
				padding: 16,
				borderBottomWidth: 1,
				borderBottomColor: '#eee'
			}}
		>
			<Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.clubname}</Text>
			<Text style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
				{item.address}
			</Text>
			{item.rating && item.rating > 0 && (
				<Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
					⭐ {item.rating.toFixed(1)} ({item.number_of_ratings} ratings)
				</Text>
			)}
		</TouchableOpacity>
	)

	if (isLoading && isEmpty) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 10 }}>Loading pandals...</Text>
			</View>
		)
	}

	if (hasError && isEmpty) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					padding: 20
				}}
			>
				<Text style={{ textAlign: 'center', marginBottom: 20 }}>{error}</Text>
				<TouchableOpacity
					onPress={refreshData}
					style={{
						backgroundColor: '#007AFF',
						paddingHorizontal: 20,
						paddingVertical: 10,
						borderRadius: 8
					}}
				>
					<Text style={{ color: 'white', fontWeight: 'bold' }}>Retry</Text>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<FlatList
			data={pandals}
			keyExtractor={(item) => item.id}
			ListEmptyComponent={
				<View style={{ padding: 20, alignItems: 'center' }}>
					<Text>No pandals found</Text>
				</View>
			}
			onRefresh={refreshData}
			refreshing={isLoading}
			renderItem={renderPandal}
		/>
	)
})

PandalList.displayName = 'PandalList'

export default PandalList
