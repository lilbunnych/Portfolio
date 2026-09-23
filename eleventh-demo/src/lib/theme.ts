import { useColorScheme } from 'react-native'

const light = {
  bg: '#f4f6f3', card: '#ffffff', card2: '#eaeee8', text: '#11201a', muted: '#5f6d66', line: '#dfe5de',
  brand: '#1f7a55', brandText: '#ffffff', danger: '#c0392b',
}
const dark: typeof light = {
  bg: '#0b1511', card: '#132019', card2: '#1b2b22', text: '#e9f1ec', muted: '#8fa399', line: '#22342a',
  brand: '#43c28b', brandText: '#06140e', danger: '#ff7b6b',
}
export type Palette = typeof light
export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light
}

export const HABIT_COLORS = ['#1f7a55', '#2f80ed', '#f2994a', '#eb5757', '#9b51e0', '#00a3a3', '#d4a017'] as const
export const HABIT_ICONS = ['water', 'book', 'walk', 'leaf', 'moon', 'barbell', 'bicycle', 'musical-notes', 'pencil', 'nutrition', 'bed', 'language'] as const
