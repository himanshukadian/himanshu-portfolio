/**
 * SemanticResponseCache — lightweight LRU dedup for repeated queries.
 *
 * Uses a normalized-key (stem/lexical) match first, then an optional
 * edit-distance similarity fallback to catch paraphrases. Storing full
 * response text means repeated questions (very common on portfolio
 * assistants: "what are your skills", "how do I contact you") skip one
 * complete LLM round-trip.
 */

const MAX_ENTRIES = 64
const TTL_MS = 30 * 60 * 1000
const SIMILARITY_THRESHOLD = 0.86

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'for', 'to', 'of', 'on', 'in',
  'at', 'by', 'is', 'are', 'was', 'were', 'your', 'you', 'my', 'me', 'i',
  'can', 'could', 'do', 'does', 'did', 'how', 'what', 'when', 'where', 'why',
  'please', 'about', 'with', 'from', 'that', 'this', 'it', 'be', 'have',
  'get', 'tell', 'show', 'me', 'us', 'some', 'any',
])

function normalize(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .join(' ')
    .trim()
}

// Damerau-Levenshtein-ish: Levenshtein distance (exact-enough for short keys).
function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp = new Array(m + 1)
  for (let i = 0; i <= m; i++) dp[i] = new Array(n + 1)
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }
  return dp[m][n]
}

function similarity(a, b) {
  if (!a.length || !b.length) return 0
  const maxLen = Math.max(a.length, b.length)
  return 1 - levenshtein(a, b) / maxLen
}

class SemanticResponseCache {
  constructor() {
    this.map = new Map() // key(normalized) -> { value, expires, ts }
  }

  _prune(now) {
    for (const [k, v] of this.map) {
      if (v.expires < now) this.map.delete(k)
    }
    while (this.map.size > MAX_ENTRIES) {
      // evict oldest by ts
      let oldestKey = null
      let oldestTs = Infinity
      for (const [k, v] of this.map) {
        if (v.ts < oldestTs) {
          oldestTs = v.ts
          oldestKey = k
        }
      }
      if (oldestKey) this.map.delete(oldestKey)
      else break
    }
  }

  _lookupKey(norm) {
    if (!norm) return null
    const now = Date.now()
    this._prune(now)
    if (this.map.has(norm)) return norm
    // similarity fallback over keys
    let bestKey = null
    let bestScore = 0
    for (const k of this.map.keys()) {
      const score = similarity(norm, k)
      if (score > bestScore) {
        bestScore = score
        bestKey = k
      }
    }
    if (bestKey && bestScore >= SIMILARITY_THRESHOLD) return bestKey
    return null
  }

  get(query) {
    const norm = normalize(query)
    const key = this._lookupKey(norm)
    if (!key) return null
    const entry = this.map.get(key)
    if (!entry || entry.expires < Date.now()) return null
    entry.ts = Date.now() // touch
    return entry.value
  }

  set(query, value) {
    const norm = normalize(query)
    if (!norm || value == null) return
    const now = Date.now()
    this._prune(now)
    this.map.set(norm, { value, expires: now + TTL_MS, ts: now })
    while (this.map.size > MAX_ENTRIES) {
      let oldestKey = null
      let oldestTs = Infinity
      for (const [k, v] of this.map) {
        if (v.ts < oldestTs) {
          oldestTs = v.ts
          oldestKey = k
        }
      }
      if (oldestKey) this.map.delete(oldestKey)
      else break
    }
  }

  clear() {
    this.map.clear()
  }
}

export const responseCache = new SemanticResponseCache()
