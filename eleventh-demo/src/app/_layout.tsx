import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DemoBanner } from '../components/DemoBanner'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#150d2e' }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#150d2e' } }} />
        <DemoBanner />
      </View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  )
}
