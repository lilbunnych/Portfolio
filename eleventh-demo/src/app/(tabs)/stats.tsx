import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { addDays, dayKey, streakOf, useHabits } from '../../lib/habits'
import { usePalette } from '../../lib/theme'

const WEEKS = 12

export default function Stats() {
  const c = usePalette()
  const { top } = useSafeAreaInsets()
  const { state, dispatch } = useHabits()
  const total = state.habits.length

  const grid = useMemo(() => {
    const end = new Date()
    const start = addDays(end, -(WEEKS * 7 - 1) - ((end.getDay() + 6) % 7 - 6))
    const cols: { key: string; ratio: number; future: boolean }[][] = []
    for (let w = 0; w < WEEKS; w++) {
      const col = []
      for (let d = 0; d < 7; d++) {
        const day = addDays(start, w * 7 + d)
        const k = dayKey(day)
        const n = (state.log[k] ?? []).filter(id => state.habits.some(h => h.id === id)).length
        col.push({ key: k, ratio: total ? n / total : 0, future: day > end })
      }
      cols.push(col)
    }
    return cols
  }, [state, total])

  const perHabit = useMemo(() => state.habits.map(h => {
    let hits = 0
    for (let i = 0; i < 30; i++) if ((state.log[dayKey(addDays(new Date(), -i))] ?? []).includes(h.id)) hits++
    return { h, rate: hits / 30, streak: streakOf(state.log, h.id) }
  }), [state])

  const avg = perHabit.length ? perHabit.reduce((s, x) => s + x.rate, 0) / perHabit.length : 0
  const best = perHabit.reduce((m, x) => Math.max(m, x.streak), 0)

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ paddingTop: top + 16, paddingHorizontal: 20, paddingBottom: 40 }}>
      <Text style={[styles.h1, { color: c.text }]}>Progress</Text>

      <View style={styles.kpis}>
        <View style={[styles.kpi, { backgroundColor: c.card }]}><Text style={[styles.big, { color: c.text }]}>{Math.round(avg * 100)}%</Text><Text style={{ color: c.muted }}>last 30 days</Text></View>
        <View style={[styles.kpi, { backgroundColor: c.card }]}><Text style={[styles.big, { color: c.text }]}>{best}</Text><Text style={{ color: c.muted }}>best current streak</Text></View>
      </View>

      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Text style={[styles.h2, { color: c.muted }]}>Last {WEEKS} weeks</Text>
        <View style={styles.grid} accessibilityLabel="Completion heatmap">
          {grid.map((col, i) => (
            <View key={i} style={{ gap: 4, flex: 1 }}>
              {col.map(cell => (
                <View key={cell.key} style={{ aspectRatio: 1, borderRadius: 4, backgroundColor: cell.future ? 'transparent' : cell.ratio === 0 ? c.card2 : c.brand, opacity: cell.future ? 0 : cell.ratio === 0 ? 1 : 0.25 + cell.ratio * 0.75 }} />
              ))}
            </View>
          ))}
        </View>
        <Text style={{ color: c.muted, fontSize: 12, marginTop: 10 }}>Darker squares mean more habits done that day.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Text style={[styles.h2, { color: c.muted }]}>By habit, last 30 days</Text>
        {perHabit.map(({ h, rate, streak }) => (
          <View key={h.id} style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: c.text, fontWeight: '600' }}>{h.name}</Text>
              <Text style={{ color: c.muted }}>{Math.round(rate * 100)}% · {streak}d</Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: c.card2, marginTop: 6, overflow: 'hidden' }}>
              <View style={{ width: `${rate * 100}%`, height: '100%', borderRadius: 4, backgroundColor: h.color }} />
            </View>
          </View>
        ))}
      </View>

      <Pressable onPress={() => dispatch({ type: 'reset' })} style={[styles.reset, { borderColor: c.line }]} accessibilityRole="button">
        <Text style={{ color: c.muted }}>Reset to sample data</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  h1: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 14, fontWeight: '600' },
  kpis: { flexDirection: 'row', gap: 10, marginTop: 18 },
  kpi: { flex: 1, padding: 16, borderRadius: 18 },
  big: { fontSize: 30, fontWeight: '800' },
  card: { padding: 18, borderRadius: 22, marginTop: 12 },
  grid: { flexDirection: 'row', gap: 4, marginTop: 14 },
  reset: { marginTop: 20, alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1 },
})
