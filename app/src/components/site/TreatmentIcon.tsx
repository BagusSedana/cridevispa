/** Line icons from the legacy site, keyed by treatments.icon (name or legacy emoji). Unknown/empty → leaf. */
const PATHS: Record<string, string[]> = {
  leaf: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],
  hands: ['M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v3', 'M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7', 'M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8', 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'],
  flower: ['M12 22v-6', 'M12 16a5 5 0 0 0 5-5c0-4-5-8-5-8s-5 4-5 8a5 5 0 0 0 5 5Z', 'M7.5 13.5C5 13 2 11 2 8c3 0 5.5 1.5 6.5 3.5', 'M16.5 13.5C19 13 22 11 22 8c-3 0-5.5 1.5-6.5 3.5'],
  muscle: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  foot: ['M4 16v-2.38C4 11.5 5.5 9 8 9c1.8 0 3 .8 4 2 1-1.2 2.2-2 4-2 2.5 0 4 2.5 4 4.62V16c0 3.31-2.69 6-6 6h-4c-3.31 0-6-2.69-6-6Z', 'M14 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z'],
  facial: ['m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z'],
  candle: ['M9 21h6v-8H9v8Z', 'M12 13V9', 'M12 9c-1.5-1-1.5-3 0-4.5 1.5 1.5 1.5 3.5 0 4.5Z'],
  body: ['M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'],
  crown: ['M3 18h18M4 14l3-7 5 5 5-5 3 7H4Z'],
}
const EMOJI: Record<string, string> = { '🌿': 'leaf', '🤲': 'hands', '🌸': 'flower', '🪨': 'stones', '💪': 'muscle', '🦶': 'foot', '✨': 'facial', '🕯️': 'candle', '🧖': 'body', '👑': 'crown', '🌺': 'crown' }

export function TreatmentIcon({ icon }: { icon: string | null }) {
  const key = icon ? (EMOJI[icon] ?? icon) : 'leaf'
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (key === 'stones') {
    return <svg {...common}><ellipse cx="12" cy="18" rx="8" ry="4" /><ellipse cx="12" cy="12" rx="6" ry="3" /><ellipse cx="12" cy="7" rx="4" ry="2" /></svg>
  }
  return <svg {...common}>{(PATHS[key] ?? PATHS.leaf).map(d => <path key={d} d={d} />)}</svg>
}
