import devLog from './devLog.js'

/**
 * ContextBudget — tiered conversation memory manager.
 *
 * Mirrors the 2025 production standard:
 *   working memory (last N turns verbatim)
 *   + episodic summary (compressed older turns)
 *   + system safety margin
 *
 * Keeps the raw (unlimited) message list for display, but exposes a
 * token-budgeted projection that is actually sent to the model so long
 * conversations never blow the context window.
 */

const KEEP_RECENT_TURNS = 8
const SUMMARIZE_AFTER_TURNS = 12
const MAX_HISTORY_CHARS = 4800
const MAX_SINGLE_MESSAGE_CHARS = 4000
const SUMMARY_PREFIX = '[Earlier conversation summary] '

export const clampMessage = (content) => {
  const s = String(content == null ? '' : content)
  return s.length > MAX_SINGLE_MESSAGE_CHARS ? s.slice(0, MAX_SINGLE_MESSAGE_CHARS) : s
}

/**
 * Build a bounded chat history for a model call.
 * @param {Array<{role:string, content:string}>} history raw exchange list
 * @param {string} [runningSummary] optional compressed summary of old turns
 * @param {object} [opts] {keepRecentTurns, maxChars}
 * @returns {{messages:Array<{role:string, content:string}>, summary, truncated, droppedTurns}}
 */
export function buildContextWindow(history, runningSummary = '', opts = {}) {
  const safe = Array.isArray(history) ? history.filter(
    (m) => m && typeof m.content === 'string' && m.content.trim()
  ) : []
  const keepRecent = opts.keepRecentTurns || KEEP_RECENT_TURNS
  const maxChars = opts.maxChars || MAX_HISTORY_CHARS

  let messages = safe.map((m) => ({ role: m.role, content: clampMessage(m.content) }))

  // Collapse any earlier turns into the running summary once history grows.
  let summary = runningSummary
  let droppedTurns = 0
  if (safe.length > keepRecent + SUMMARIZE_AFTER_TURNS) {
    const dropCount = safe.length - keepRecent
    droppedTurns = dropCount
    const oldContent = safe
      .slice(0, dropCount)
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')
    // Only materialize a summary if we don't already have one.
    if (!summary) {
      summary = oldContent.length > 2000 ? oldContent.slice(0, 2000) + ' …' : oldContent
    }
    messages = safe.slice(dropCount).map((m) => ({
      role: m.role,
      content: clampMessage(m.content)
    }))
  }

  const payload = [] // [system summary, ...working window, current user appended by caller]

  // Enforce a hard char budget across the working window (safety net + slide).
  if (summary) {
    payload.push({ role: 'system', content: SUMMARY_PREFIX + summary })
  }

  let used = 0
  const bounded = []
  for (let i = messages.length - 1; i >= 0; i--) {
    const size = messages[i].content.length
    if (used + size > maxChars && bounded.length) break
    bounded.unshift(messages[i])
    used += size
  }
  payload.push(...bounded)

  devLog(`🧠 Context window: kept ${bounded.length} turns (~${used} chars)${summary ? ' + summary' : ''}${droppedTurns ? `, collapsed ${droppedTurns} older` : ''}`)

  return { messages: payload, summary, truncated: droppedTurns > 0, droppedTurns }
}
