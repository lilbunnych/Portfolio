import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

// Portfolio notice: slim "DEMO" tab on the right edge. Tap to read what it means.
export function DemoBanner() {
  const [open, setOpen] = useState(false)
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {open && (
        <View style={styles.panel} accessibilityRole="text">
          <Text style={styles.panelTitle}>DEMO</Text>
          <Text style={styles.panelText}>Portfolio project. The app and its content are fictional. Not a real product.</Text>
        </View>
      )}
      <Pressable onPress={() => setOpen(o => !o)} style={styles.tab} accessibilityRole="button" accessibilityLabel="Demo app: show details" accessibilityState={{ expanded: open }}>
        {'DEMO'.split('').map((ch, i) => <Text key={i} style={styles.letter}>{ch}</Text>)}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 0, top: '30%', flexDirection: 'row', alignItems: 'flex-start', zIndex: 1000 },
  tab: { width: 24, paddingVertical: 8, alignItems: 'center', backgroundColor: '#ffd400', borderWidth: 2, borderRightWidth: 0, borderColor: '#111', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: -3, height: 3 }, elevation: 8 },
  letter: { color: '#111', fontWeight: '900', fontSize: 13, lineHeight: 15 },
  panel: { width: 200, padding: 12, backgroundColor: '#111', borderTopLeftRadius: 10, borderBottomLeftRadius: 10 },
  panelTitle: { color: '#ffd400', fontWeight: '900', letterSpacing: 2 },
  panelText: { color: '#fff', fontSize: 13, lineHeight: 18, marginTop: 4 },
})
