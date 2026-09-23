import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { dayKey, useHabits } from '../lib/habits'
import { HABIT_COLORS, HABIT_ICONS, usePalette } from '../lib/theme'

export default function AddHabit() {
  const c = usePalette()
  const { dispatch } = useHabits()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState<string>(HABIT_ICONS[0])
  const [color, setColor] = useState<string>(HABIT_COLORS[0])
  const [error, setError] = useState('')

  const save = () => {
    const n = name.trim()
    if (n.length < 2) { setError('Give your habit a name of at least two letters.'); return }
    dispatch({ type: 'add', habit: { id: Math.random().toString(36).slice(2, 9), name: n, icon, color, createdAt: dayKey(new Date()) } })
    router.back()
  }

  return (
    <ScrollView style={{ backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, gap: 22 }} keyboardShouldPersistTaps="handled">
      <View style={[styles.preview, { backgroundColor: c.card }]}>
        <View style={[styles.icon, { backgroundColor: color + '22' }]}><Ionicons name={icon as any} size={26} color={color} /></View>
        <Text style={{ color: name ? c.text : c.muted, fontSize: 17, fontWeight: '600', flex: 1 }}>{name || 'Your new habit'}</Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={[styles.label, { color: c.text }]}>Name</Text>
        <TextInput value={name} onChangeText={t => { setName(t); setError('') }} placeholder="Stretch for five minutes" placeholderTextColor={c.muted}
          maxLength={40} autoFocus returnKeyType="done" onSubmitEditing={save}
          style={[styles.input, { backgroundColor: c.card, color: c.text, borderColor: error ? c.danger : c.line }]} />
        {!!error && <Text style={{ color: c.danger, fontSize: 13 }}>{error}</Text>}
      </View>

      <View style={{ gap: 8 }}>
        <Text style={[styles.label, { color: c.text }]}>Icon</Text>
        <View style={styles.wrap}>
          {HABIT_ICONS.map(i => (
            <Pressable key={i} onPress={() => setIcon(i)} accessibilityRole="radio" accessibilityState={{ checked: icon === i }} accessibilityLabel={i}
              style={[styles.choice, { backgroundColor: icon === i ? color + '33' : c.card, borderColor: icon === i ? color : 'transparent' }]}>
              <Ionicons name={i as any} size={22} color={icon === i ? color : c.muted} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={[styles.label, { color: c.text }]}>Colour</Text>
        <View style={styles.wrap}>
          {HABIT_COLORS.map(col => (
            <Pressable key={col} onPress={() => setColor(col)} accessibilityRole="radio" accessibilityState={{ checked: color === col }} accessibilityLabel={col}
              style={[styles.swatch, { backgroundColor: col, borderColor: color === col ? c.text : 'transparent' }]} />
          ))}
        </View>
      </View>

      <Pressable onPress={save} style={[styles.save, { backgroundColor: c.brand }]} accessibilityRole="button">
        <Text style={{ color: c.brandText, fontWeight: '700', fontSize: 16 }}>Save habit</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  preview: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18 },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '700', fontSize: 15 },
  input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choice: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 3 },
  save: { alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
})
