import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { HabitsProvider } from '../lib/habits'
import { usePalette } from '../lib/theme'
import { DemoBanner } from '../components/DemoBanner'

export default function RootLayout() {
  const c = usePalette()
  return (
    <SafeAreaProvider>
      <HabitsProvider>
        <View style={{ flex: 1, backgroundColor: c.bg }}>
          <Stack screenOptions={{ contentStyle: { backgroundColor: c.bg }, headerStyle: { backgroundColor: c.bg }, headerTintColor: c.text, headerShadowVisible: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add" options={{ presentation: 'modal', title: 'New habit' }} />
          </Stack>
          <DemoBanner />
        </View>
        <StatusBar style="auto" />
      </HabitsProvider>
    </SafeAreaProvider>
  )
}
