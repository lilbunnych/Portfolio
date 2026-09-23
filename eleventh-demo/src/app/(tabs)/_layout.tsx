import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import { usePalette } from '../../lib/theme'

export default function TabLayout() {
  const c = usePalette()
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: c.brand,
      tabBarInactiveTintColor: c.muted,
      tabBarStyle: { backgroundColor: c.card, borderTopColor: c.line, height: 62, paddingTop: 6, paddingBottom: 8 },
      sceneStyle: { backgroundColor: c.bg },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color, size }) => <Ionicons name="today" size={size} color={color} /> }} />
      <Tabs.Screen name="stats" options={{ title: 'Progress', tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} /> }} />
    </Tabs>
  )
}
