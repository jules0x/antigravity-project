/**
 * A seeded Fisher-Yates shuffle to ensure deterministic randomness based on a string seed.
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  const shuffled = [...array]
  let m = shuffled.length
  let t: T
  let i: number

  // Generate a numeric seed from the string
  let s = 0
  for (let k = 0; k < seed.length; k++) {
    s = (s << 5) - s + seed.charCodeAt(k)
    s |= 0 // Convert to 32bit integer
  }

  // Linear Congruential Generator
  const random = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }

  while (m) {
    i = Math.floor(random() * m--)
    t = shuffled[m]
    shuffled[m] = shuffled[i]
    shuffled[i] = t
  }

  return shuffled
}
