import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, PanResponder, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS, SIZE, canPlaceAnywhere, emptyBoard, fits, linesAfter, newTray, place, type Board, type Piece } from '../lib/game'

const BEST_KEY = 'stackd-best'
const haptic = (kind: 'light' | 'heavy' | 'error') => {
  if (Platform.OS === 'web') return
  if (kind === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
  else Haptics.impactAsync(kind === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}

/** One bevelled block. */
function Block({ color, size, ghost = false, glow = false }: { color: number; size: number; ghost?: boolean; glow?: boolean }) {
  const base = COLORS[color]
  return (
    <View style={{
      width: size - 2, height: size - 2, margin: 1, borderRadius: size * 0.18, backgroundColor: base,
      borderTopWidth: size * 0.12, borderLeftWidth: size * 0.08, borderBottomWidth: size * 0.14, borderRightWidth: size * 0.08,
      borderTopColor: 'rgba(255,255,255,.45)', borderLeftColor: 'rgba(255,255,255,.2)', borderBottomColor: 'rgba(0,0,0,.28)', borderRightColor: 'rgba(0,0,0,.18)',
      opacity: ghost ? 0.4 : 1, shadowColor: base, shadowOpacity: glow ? 0.9 : 0, shadowRadius: 10,
    }} />
  )
}

function PieceView({ piece, cell }: { piece: Piece; cell: number }) {
  return (
    <View style={{ width: piece.w * cell, height: piece.h * cell }}>
      {piece.cells.map(([r, c], i) => (
        <View key={i} style={{ position: 'absolute', left: c * cell, top: r * cell }}><Block color={piece.color} size={cell} /></View>
      ))}
    </View>
  )
}

interface Drag { index: number; x: number; y: number }

export default function Game() {
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const boardPx = Math.min(width - 32, height * 0.5, 440)
  const cell = boardPx / SIZE
  const trayCell = Math.min(cell * 0.55, 26)
  const LIFT = Platform.OS === 'web' ? 40 : 90   // keep the piece above the finger

  const [board, setBoard] = useState<Board>(emptyBoard)
  const [tray, setTray] = useState<(Piece | null)[]>(() => newTray(emptyBoard()))
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [combo, setCombo] = useState(0)
  const [over, setOver] = useState(false)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [flashCells, setFlashCells] = useState<[number, number][]>([])
  const [popup, setPopup] = useState('')

  const flash = useRef(new Animated.Value(0)).current
  const pop = useRef(new Animated.Value(0)).current
  const scoreBump = useRef(new Animated.Value(1)).current

  const rootRef = useRef<View>(null), boardRef = useRef<View>(null)
  const rootPos = useRef({ x: 0, y: 0 }), boardPos = useRef({ x: 0, y: 0 })
  const measure = useCallback(() => {
    rootRef.current?.measureInWindow((x, y) => { rootPos.current = { x, y } })
    boardRef.current?.measureInWindow((x, y) => { boardPos.current = { x, y } })
  }, [])

  useEffect(() => { AsyncStorage.getItem(BEST_KEY).then(v => v && setBest(+v)).catch(() => {}) }, [])
  useEffect(() => { if (score > best) { setBest(score); AsyncStorage.setItem(BEST_KEY, String(score)).catch(() => {}) } }, [score])

  // Where a dragged piece would land (top-left cell), or null when outside
  const target = useCallback((d: Drag) => {
    const p = tray[d.index]; if (!p) return null
    const left = d.x - (p.w * cell) / 2, top = d.y - p.h * cell - LIFT
    const c = Math.round((left - boardPos.current.x - 8) / cell), r = Math.round((top - boardPos.current.y - 8) / cell)  // 6px padding + 2px border
    return { p, r, c, ok: fits(board, p, r, c) }
  }, [tray, board, cell, LIFT])

  const drop = useCallback((d: Drag) => {
    const t = target(d)
    if (!t || !t.ok) { if (t && t.r > -3 && t.r < SIZE + 1) haptic('error'); return }
    const res = place(board, t.p, t.r, t.c, combo)
    const nextCombo = res.lines ? combo + 1 : 0
    const left = tray.map((p, i) => (i === d.index ? null : p))
    const refill = left.every(p => !p) ? newTray(res.board) : left
    setBoard(res.board); setTray(refill); setCombo(nextCombo)
    setScore(s => s + res.gained)
    Animated.sequence([Animated.timing(scoreBump, { toValue: 1.25, duration: 90, useNativeDriver: true }), Animated.spring(scoreBump, { toValue: 1, useNativeDriver: true })]).start()
    if (res.lines) {
      haptic('heavy')
      setFlashCells(res.cleared)
      flash.setValue(1)
      Animated.timing(flash, { toValue: 0, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => setFlashCells([]))
      setPopup(nextCombo > 1 ? `Combo ×${nextCombo}  +${res.gained}` : res.lines > 1 ? `${res.lines} lines  +${res.gained}` : `+${res.gained}`)
      pop.setValue(0)
      Animated.timing(pop, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start()
    } else haptic('light')
    if (!refill.some(p => p && canPlaceAnywhere(res.board, p))) setTimeout(() => setOver(true), 450)
  }, [target, board, combo, tray])

  // One responder per tray slot
  const dragRef = useRef<Drag | null>(null)
  const dropRef = useRef(drop); dropRef.current = drop
  const responders = useMemo(() => [0, 1, 2].map(index => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: e => { measure(); const d = { index, x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }; dragRef.current = d; setDrag(d) },
    onPanResponderMove: e => { const d = { index, x: e.nativeEvent.pageX, y: e.nativeEvent.pageY }; dragRef.current = d; setDrag(d) },
    onPanResponderRelease: () => { if (dragRef.current) dropRef.current(dragRef.current); dragRef.current = null; setDrag(null) },
    onPanResponderTerminate: () => { dragRef.current = null; setDrag(null) },
  })), [measure])

  const t = drag ? target(drag) : null
  const ghost = new Set<string>(), willClear = new Set<string>()
  if (t?.ok) {
    t.p.cells.forEach(([dr, dc]) => ghost.add(`${t.r + dr},${t.c + dc}`))
    const { rows, cols } = linesAfter(board, t.p, t.r, t.c)
    rows.forEach(r => { for (let k = 0; k < SIZE; k++) willClear.add(`${r},${k}`) })
    cols.forEach(c => { for (let k = 0; k < SIZE; k++) willClear.add(`${k},${c}`) })
  }

  const restart = () => { const b = emptyBoard(); setBoard(b); setTray(newTray(b)); setScore(0); setCombo(0); setOver(false) }
  const dragged = drag ? tray[drag.index] : null

  return (
    <View ref={rootRef} onLayout={measure} style={[styles.root, { paddingTop: insets.top + 12 }, Platform.OS === 'web' && ({ touchAction: 'none', userSelect: 'none' } as any)]}>
      <View style={styles.header}>
        <Text style={styles.logo}>Stack<Text style={{ color: COLORS[2] }}>d</Text></Text>
        <View style={styles.bestBox}><Text style={styles.bestLabel}>BEST</Text><Text style={styles.bestVal}>{best}</Text></View>
      </View>

      <Animated.Text style={[styles.score, { transform: [{ scale: scoreBump }] }]}>{score}</Animated.Text>
      <Text style={styles.comboLine}>{combo > 1 ? `Combo streak ×${combo}` : ' '}</Text>

      <View ref={boardRef} onLayout={measure} style={[styles.board, { width: boardPx + 12, height: boardPx + 12 }]}>
        {board.map((row, r) => row.map((v, c) => {
          const key = `${r},${c}`
          return (
            <View key={key} style={[styles.slot, { left: 6 + c * cell, top: 6 + r * cell, width: cell, height: cell }]}>
              {v !== null ? <Block color={v} size={cell} glow={willClear.has(key)} />
                : ghost.has(key) && t ? <Block color={t.p.color} size={cell} ghost />
                : <View style={[styles.hole, { borderRadius: cell * 0.18 }]} />}
              {willClear.has(key) && v === null && t && <View style={StyleSheet.absoluteFill}><Block color={t.p.color} size={cell} ghost /></View>}
            </View>
          )
        }))}
        {flashCells.map(([r, c]) => (
          <Animated.View key={`f${r},${c}`} pointerEvents="none" style={{
            position: 'absolute', left: 6 + c * cell + 2, top: 6 + r * cell + 2, width: cell - 4, height: cell - 4, borderRadius: cell * 0.2,
            backgroundColor: '#fff', opacity: flash, transform: [{ scale: flash.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }],
          }} />
        ))}
        {!!popup && (
          <Animated.Text pointerEvents="none" style={[styles.popup, {
            opacity: pop.interpolate({ inputRange: [0, .15, .8, 1], outputRange: [0, 1, 1, 0] }),
            transform: [{ translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [20, -40] }) }, { scale: pop.interpolate({ inputRange: [0, .2, 1], outputRange: [.6, 1.1, 1] }) }],
          }]}>{popup}</Animated.Text>
        )}
      </View>

      <View style={[styles.tray, { height: trayCell * 5 + 24 }]}>
        {tray.map((p, i) => (
          <View key={p?.id ?? `empty${i}`} style={styles.slotTray} {...(p ? responders[i].panHandlers : {})}>
            {p && drag?.index !== i && <PieceView piece={p} cell={trayCell} />}
          </View>
        ))}
      </View>
      <Text style={styles.hint}>Drag blocks onto the board. Fill a row or column to clear it.</Text>

      {dragged && drag && (
        <View pointerEvents="none" style={{ position: 'absolute', left: drag.x - rootPos.current.x - (dragged.w * cell) / 2, top: drag.y - rootPos.current.y - dragged.h * cell - LIFT, opacity: t?.ok ? 0.95 : 0.8 }}>
          <PieceView piece={dragged} cell={cell} />
        </View>
      )}

      {over && (
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.overTitle}>No moves left</Text>
            <Text style={styles.overScore}>{score}</Text>
            <Text style={styles.overBest}>{score >= best && score > 0 ? 'New best score!' : `Best: ${best}`}</Text>
            <Pressable onPress={restart} style={styles.again} accessibilityRole="button"><Text style={styles.againTxt}>Play again</Text></Pressable>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', backgroundColor: '#150d2e', paddingHorizontal: 16 },
  header: { width: '100%', maxWidth: 452, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  bestBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  bestLabel: { color: COLORS[2], fontWeight: '900', fontSize: 12, letterSpacing: 1.5 },
  bestVal: { color: '#fff', fontWeight: '800', fontSize: 16 },
  score: { color: '#fff', fontSize: 56, fontWeight: '900', marginTop: 10, letterSpacing: -1 },
  comboLine: { color: COLORS[1], fontWeight: '800', fontSize: 14, height: 20, marginBottom: 10 },
  board: { backgroundColor: '#23174a', borderRadius: 18, borderWidth: 2, borderColor: '#34266b' },
  slot: { position: 'absolute' },
  hole: { flex: 1, margin: 2, backgroundColor: '#2d2060' },
  popup: { position: 'absolute', alignSelf: 'center', top: '42%', color: '#fff', fontSize: 28, fontWeight: '900', textShadowColor: 'rgba(0,0,0,.5)', textShadowRadius: 8 },
  tray: { width: '100%', maxWidth: 452, flexDirection: 'row', marginTop: 18 },
  slotTray: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: { color: 'rgba(255,255,255,.45)', fontSize: 13, textAlign: 'center', marginTop: 4 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,6,24,.75)', alignItems: 'center', justifyContent: 'center' },
  card: { width: 280, alignItems: 'center', padding: 28, borderRadius: 24, backgroundColor: '#23174a', borderWidth: 2, borderColor: '#3b2c7a' },
  overTitle: { color: 'rgba(255,255,255,.7)', fontWeight: '700', fontSize: 16 },
  overScore: { color: '#fff', fontSize: 64, fontWeight: '900', marginVertical: 6 },
  overBest: { color: COLORS[2], fontWeight: '800', marginBottom: 20 },
  again: { backgroundColor: COLORS[3], paddingHorizontal: 30, paddingVertical: 14, borderRadius: 999 },
  againTxt: { color: '#0d2b18', fontWeight: '900', fontSize: 16 },
})
