import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Portfolio notice shown at the bottom of every demo.
export function DemoBanner() {
  const { bottom } = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { paddingBottom: bottom, height: 46 + bottom }]} accessibilityRole="text" accessibilityLabel="Demo app notice">
      <Text style={styles.tag}>DEMO</Text>
      <Text style={styles.txt} numberOfLines={1}>Portfolio demo · fictional app</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#ffd400', borderTopWidth: 3, borderTopColor: '#111', paddingHorizontal: 14 },
  tag: { backgroundColor: '#111', color: '#ffd400', fontWeight: '900', fontSize: 20, letterSpacing: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4, overflow: 'hidden' },
  txt: { color: '#111', fontWeight: '800', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', flexShrink: 1 },
})
