import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ProgressRing } from '../../components/ProgressRing'
import { addDays, dayKey, streakOf, useHabits } from '../../lib/habits'
import { usePalette } from '../../lib/theme'

export default function Today() {
  const c = usePalette()
  const { top } = useSafeAreaInsets()
  const { state, dispatch } = useHabits()
  const today = new Date()
  const [selected, setSelected] = useState(dayKey(today))
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)), [selected])
  const done = state.log[selected] ?? []
  const isToday = selected === dayKey(today)

  const toggle = (id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    dispatch({ type: 'toggle', day: selected, id })
  }
  const confirmRemove = (id: string, name: string) => {
    const go = () => dispatch({ type: 'remove', id })
    if (Platform.OS === 'web') { if (confirm(`Delete “${name}” and its history?`)) go() }
    else Alert.alert('Delete habit', `Delete “${name}” and its history?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: go }])
  }

  if (!state.ready) return <View style={{ flex: 1, backgroundColor: c.bg }} />

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: top + 16, paddingHorizontal: 20, paddingBottom: 110 }}>
        <Text style={[styles.date, { color: c.muted }]}>{new Date(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        <Text style={[styles.h1, { color: c.text }]}>{isToday ? 'Today' : 'Looking back'}</Text>

        <View style={styles.week}>
          {week.map(d => {
            const k = dayKey(d), on = k === selected
            const count = (state.log[k] ?? []).length, full = state.habits.length > 0 && count >= state.habits.length
            return (
              <Pressable key={k} onPress={() => setSelected(k)} accessibilityRole="button" accessibilityState={{ selected: on }}
                style={[styles.day, { backgroundColor: on ? c.brand : c.card }]}>
                <Text style={{ color: on ? c.brandText : c.muted, fontSize: 12 }}>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</Text>
                <Text style={{ color: on ? c.brandText : c.text, fontSize: 17, fontWeight: '700' }}>{d.getDate()}</Text>
                <View style={[styles.dot, { backgroundColor: full ? (on ? c.brandText : c.brand) : 'transparent' }]} />
              </Pressable>
            )
          })}
        </View>

        <View style={[styles.summary, { backgroundColor: c.card }]}>
          <ProgressRing value={done.filter(id => state.habits.some(h => h.id === id)).length} total={state.habits.length} c={c} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '700' }}>
              {done.length >= state.habits.length && state.habits.length ? 'All done. Nice.' : 'Small steps count.'}
            </Text>
            <Text style={{ color: c.muted }}>Tap a habit to check it off. Long press to delete.</Text>
          </View>
        </View>

        {state.habits.length === 0 && (
          <Text style={{ color: c.muted, textAlign: 'center', marginTop: 32 }}>No habits yet. Tap + to plant your first one.</Text>
        )}

        <View style={{ gap: 10, marginTop: 8 }}>
          {state.habits.map(h => {
            const checked = done.includes(h.id)
            const streak = streakOf(state.log, h.id)
            return (
              <Pressable key={h.id} onPress={() => toggle(h.id)} onLongPress={() => confirmRemove(h.id, h.name)}
                accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={h.name}
                style={({ pressed }) => [styles.row, { backgroundColor: c.card, opacity: pressed ? 0.85 : 1 }]}>
                <View style={[styles.icon, { backgroundColor: h.color + '22' }]}>
                  <Ionicons name={h.icon as any} size={22} color={h.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 16, fontWeight: '600', textDecorationLine: checked ? 'line-through' : 'none' }}>{h.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>{streak > 0 ? `${streak} day streak` : 'Start a streak today'}</Text>
                </View>
                <View style={[styles.check, { borderColor: checked ? h.color : c.line, backgroundColor: checked ? h.color : 'transparent' }]}>
                  {checked && <Ionicons name="checkmark" size={18} color="#fff" />}
                </View>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>

      {/* Plain Pressable: Link asChild spreads a style array into an object on web production builds. */}
      <Pressable onPress={() => router.push('/add')} accessibilityRole="button" accessibilityLabel="Add habit" style={[styles.fab, { backgroundColor: c.brand }]}>
        <Ionicons name="add" size={30} color={c.brandText} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  date: { fontSize: 14 },
  h1: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  week: { flexDirection: 'row', gap: 6, marginTop: 20 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14, gap: 2 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 18, padding: 18, borderRadius: 22, marginTop: 18, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 18 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  check: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
})
