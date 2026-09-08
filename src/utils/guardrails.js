import devLog from './devLog.js'

/**
 * Guardrails — pre-model input screening for the assistant.
 *
 * Defense in depth: the system prompt is NOT the only guardrail.
 * We strip/handle PII and suspicious content before it reaches the model,
 * and log events so classifiers can be tuned.
 */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
const PHONE_RE = /(?:\+?\d[\s-]?){10,13}/
const CARD_RE = /\b(?:\d[ -]?){13,16}\b/
const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/

const HIGH_RISK_CARD = /\b(?:\d[ -]?){16,19}\b/

// Prompt-injection fingerprints: attempts to override the assistant's rules.
const INJECTION_RE = [
  /ignore\s+(all\s+)?(your|previous|the|my)?\s*(instructions?|rules?|prompt|system|guidelines?)/i,
  /forget\s+(everything|all|instructions|the system prompt)/i,
  /you\s+(are|were)\s+(now|actually|really)\s+(a|the)?/i,
  /act\s+as\s+if\s+you(\s+are|\s+don't|\s+have)/i,
  /system\s+(prompt|message|instruction)/i,
  /reveal\s+(your|the)?\s*(p|system\s+p)?rompt/i,
  /disregard\s+(your|the|all|previous)/i,
]

export function maskPII(text) {
  const s = String(text == null ? '' : text)
  let masked = s
  masked = masked.replace(EMAIL_RE, '[email]')
    .replace(SSN_RE, '[ssn]')
    .replace(PHONE_RE, '[phone]')
    .replace(CARD_RE, '[number]')
  return masked
}

export function screenInput(text) {
  const s = String(text == null ? '' : text)
  const report = {
    hasPII: EMAIL_RE.test(s) || PHONE_RE.test(s) || SSN_RE.test(s),
    hasCardNumber: HIGH_RISK_CARD.test(s),
    injectionScore: 0,
    injections: [],
  }
  for (const re of INJECTION_RE) {
    if (re.test(s)) {
      report.injectionScore += 1
      report.injections.push(re.source)
    }
  }
  if (report.injectionScore >= 2 || report.hasCardNumber) {
    report.blocked = true
  }
  return report
}

export function redactForLog(text) {
  return maskPII(text).slice(0, 600)
}

export function logEval(eventName, data) {
  if (typeof window !== 'undefined' && window.__aiEvals) {
    try {
      window.__aiEvals.push({ ts: Date.now(), event: eventName, data })
    } catch (e) {
      void e
    }
  }
  devLog(`📊 eval:${eventName}`, data)
}

/**
 * Initialize the in-session eval buffer. Optionally expose it for a
 * devtools console dump (window.__aiEvalsDump) or a postMessage to a parent
 * frame (useful for embedding / telemetry).
 */
export function initEvals({ parent = false } = {}) {
  if (typeof window === 'undefined') return
  if (Array.isArray(window.__aiEvals)) return window.__aiEvals
  window.__aiEvals = []
  window.__aiEvalsDump = () => (window.__aiEvals || []).slice()
  if (parent) {
    const orig = Array.isArray(window.__aiEvals) ? window.__aiEvals : []
    const push = (entry) => {
      try {
        window.parent.postMessage({ type: 'ai-eval', entry }, '*')
      } catch (e) {
        void e
      }
    }
    window.__aiEvals.push = ((fn) => (entry) => { fn(entry); push(entry) })(orig.push.bind(orig))
  }
  return window.__aiEvals
}
