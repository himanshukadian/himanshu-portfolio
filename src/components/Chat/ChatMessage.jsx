import { useState, useEffect, useRef } from 'react'

const MONO = "'Fira Code', monospace"
const GREEN = '#00ff41'
const DIM = 'rgba(255,255,255,0.5)'
const FAINT = 'rgba(255,255,255,0.3)'
const BORDER = 'rgba(0,255,65,0.25)'
const BORDER_DIM = 'rgba(0,255,65,0.12)'

const escapeHtml = (str) => {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const sanitizeHtml = (html) => {
  return String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/?>/gi, '')
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, ' ')
    .replace(/javascript\s*:/gi, '')
}

const safeUrl = (url) => {
  if (/^(https?:\/\/|\/)/i.test(url)) return escapeHtml(url)
  return ''
}

const truncate = (text, max) => {
  const value = String(text || '').trim()
  return value.length > max ? `${value.slice(0, max)}…` : value
}

const ChatMessage = ({ message, colors, instantMode = false, onSuggestionClick, suggestionsDisabled = false }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const messageRef = useRef(null)

  const safeColors = colors || {
    textPrimary: '#ffffff',
    textSecondary: DIM,
    bgPrimary: '#000000',
    cardBg: 'rgba(0,255,65,0.04)',
    cardBorder: BORDER,
    primaryColor: GREEN,
    secondaryColor: GREEN
  }

  useEffect(() => {
    if (message.type === 'assistant') {
      if (instantMode) {
        setDisplayedText(message.content)
        setIsTyping(false)
        return
      }

      setDisplayedText('')
      setIsTyping(true)

      const text = message.content
      let currentIndex = 0

      const typingInterval = setInterval(() => {
        if (currentIndex < text.length) {
          const charsToAdd = text.length > 200 ? 3 : text.length > 100 ? 2 : 1
          const nextIndex = Math.min(currentIndex + charsToAdd, text.length)
          setDisplayedText(text.slice(0, nextIndex))
          currentIndex = nextIndex
        } else {
          setIsTyping(false)
          clearInterval(typingInterval)
        }
      }, 5)

      return () => clearInterval(typingInterval)
    } else {
      setDisplayedText(message.content)
      setIsTyping(false)
    }
  }, [message.content, message.type, instantMode])

  const buildDownloadHtml = (name, url) => {
    const safeUrlValue = safeUrl(url)
    if (!safeUrlValue) return escapeHtml(`[📄 ${name}](${url})`)
    return `<a href="${safeUrlValue}" download="${escapeHtml(name)}" title="Download ${escapeHtml(name)}" style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:rgba(0,255,65,0.06);color:${GREEN};text-decoration:none;border:1px solid ${BORDER};border-radius:4px;font-size:11px;font-family:${MONO};">⬇ download --resume</a>`
  }

  const buildLineHtml = (line) => {
    let html = escapeHtml(line)
    html = html.replace(/\[📄\s+([^\]]+)\]\(([^)]+)\)/g, (match, name, url) => buildDownloadHtml(name, url))
    html = html.replace(/`([^`]+)`/g, (match, code) => `<span style="background:rgba(0,255,65,0.10);color:#9dffb0;padding:0 4px;border-radius:2px;">${code}</span>`)
    html = html.replace(/\*\*(.*?)\*\*/g, (match, bold) => `<strong style="color:${GREEN};font-weight:600;">${bold}</strong>`)
    return sanitizeHtml(html)
  }

  const formatText = (text) => {
    if (!text) return null

    const paragraphs = text.split('\n\n')

    return paragraphs.map((paragraph, pIndex) => {
      const lines = paragraph.split('\n')

      return (
        <div key={pIndex} style={{ marginBottom: pIndex < paragraphs.length - 1 ? '14px' : '0' }}>
          {lines.map((line, lIndex) => {
            const trimmed = line.trim()

            if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
              const contentHtml = buildLineHtml(trimmed.replace(/^[•-]\s*/, ''))
              return (
                <div key={lIndex} style={{
                  marginLeft: '14px',
                  marginBottom: '4px',
                  color: safeColors.textPrimary,
                  fontSize: '13px',
                  lineHeight: '1.5',
                  fontFamily: MONO
                }}>
                  <span style={{ color: GREEN }}>{'>'}</span>{' '}
                  <span dangerouslySetInnerHTML={{ __html: contentHtml }} />
                </div>
              )
            }

            const lineHtml = buildLineHtml(line)
            return (
              <div
                key={lIndex}
                style={{
                  marginBottom: lIndex < lines.length - 1 ? '4px' : '0',
                  color: safeColors.textPrimary,
                  fontSize: '13px',
                  lineHeight: '1.6',
                  fontFamily: MONO
                }}
                dangerouslySetInnerHTML={{ __html: lineHtml }}
              />
            )
          })}
        </div>
      )
    })
  }

  const isUser = message.type === 'user'
  const hasSuggestions = !isUser && Array.isArray(message.suggestions) && message.suggestions.length > 0 && !message.streaming
  const hasSources = !isUser && Array.isArray(message.sources) && message.sources.length > 0

  return (
    <div
      ref={messageRef}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '14px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div style={{
        maxWidth: '88%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: '4px'
      }}>
        <div style={{
          fontSize: '10px',
          color: isUser ? GREEN : FAINT,
          fontFamily: MONO,
          letterSpacing: '0.06em'
        }}>
          {isUser ? 'user@hc' : 'ai@hc'}
        </div>

        <div style={{
          background: isUser ? 'rgba(0,255,65,0.08)' : 'rgba(0,255,65,0.02)',
          color: isUser ? '#ffffff' : safeColors.textPrimary,
          padding: '10px 14px',
          borderRadius: '4px',
          border: `1px solid ${isUser ? BORDER : BORDER_DIM}`,
          boxShadow: 'none',
          position: 'relative',
          wordWrap: 'break-word',
          fontFamily: MONO,
          textAlign: 'left'
        }}>
          {isUser ? (
            <div style={{
              fontSize: '13px',
              lineHeight: '1.5',
              color: 'inherit',
              fontFamily: MONO
            }}>
              <span style={{ color: GREEN, marginRight: '6px' }}>{'>'}</span>
              {message.content}
            </div>
          ) : (
            <div style={{
              fontSize: '13px',
              lineHeight: '1.6',
              color: safeColors.textPrimary,
              fontFamily: MONO
            }}>
              {formatText(displayedText)}
              {message.streaming && (
                <span style={{
                  display: 'inline-block',
                  color: GREEN,
                  marginLeft: '2px',
                  animation: 'cursorBlink 1s infinite'
                }}>
                  {'▌'}
                </span>
              )}
              {!message.streaming && isTyping && (
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '14px',
                  background: GREEN,
                  marginLeft: '3px',
                  verticalAlign: 'text-bottom',
                  animation: 'cursorBlink 1s infinite'
                }} />
              )}
            </div>
          )}
          {hasSources && (
            <div style={{
              marginTop: '10px',
              borderTop: `1px solid ${BORDER_DIM}`,
              paddingTop: '8px'
            }}>
              <div style={{
                fontSize: '10px',
                color: FAINT,
                fontFamily: MONO,
                letterSpacing: '0.06em',
                marginBottom: '6px'
              }}>
                ◎ sources
              </div>
              {message.sources.map((source, index) => {
                const snippet = typeof source.snippet === 'string' && source.snippet.trim()
                  ? truncate(source.snippet, 120)
                  : ''
                return (
                  <div key={index} style={{
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontFamily: MONO,
                    lineHeight: '1.5'
                  }}>
                    <div>
                      <span style={{ color: GREEN }}>▸ </span>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: GREEN,
                          fontFamily: MONO,
                          fontSize: '12px',
                          textDecoration: 'none',
                          wordWrap: 'break-word'
                        }}
                      >
                        {source.title}
                      </a>
                    </div>
                    {snippet && (
                      <div style={{
                        color: FAINT,
                        fontSize: '11px',
                        marginTop: '2px',
                        marginLeft: '14px',
                        wordWrap: 'break-word',
                        lineHeight: '1.4'
                      }}>
                        {snippet}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {hasSuggestions && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', maxWidth: '100%' }}>
            {message.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
                disabled={suggestionsDisabled}
                style={{
                  background: 'rgba(0,255,65,0.03)',
                  border: `1px solid ${BORDER_DIM}`,
                  borderRadius: '4px',
                  padding: '5px 10px',
                  color: 'rgba(255,255,255,0.85)',
                  cursor: suggestionsDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: MONO,
                  opacity: suggestionsDisabled ? 0.45 : 1
                }}
                onMouseEnter={(e) => {
                  if (!suggestionsDisabled) {
                    e.target.style.borderColor = GREEN
                    e.target.style.background = 'rgba(0,255,65,0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = BORDER_DIM
                  e.target.style.background = 'rgba(0,255,65,0.03)'
                }}
              >
                <span style={{ fontSize: '11px', color: GREEN, flexShrink: 0 }}>{'+'}</span>
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage