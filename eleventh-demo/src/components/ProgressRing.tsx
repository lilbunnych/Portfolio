import Svg, { Circle } from 'react-native-svg'
import { Text, View } from 'react-native'
import type { Palette } from '../lib/theme'

export function ProgressRing({ value, total, c }: { value: number; total: number; c: Palette }) {
  const size = 120, stroke = 12, r = (size - stroke) / 2, C = 2 * Math.PI * r
  const p = total ? value / total : 0
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Rotation lives on a View: react-native-svg's web build rejects style props on <Svg> in production. */}
      <View style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.card2} strokeWidth={stroke} fill="none" />
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.brand} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${C} ${C}`} strokeDashoffset={C * (1 - p)} />
        </Svg>
      </View>
      <Text style={{ color: c.text, fontSize: 28, fontWeight: '800' }}>{value}/{total}</Text>
      <Text style={{ color: c.muted, fontSize: 12 }}>done</Text>
    </View>
  )
}
