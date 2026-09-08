import { useState, useEffect, useRef } from 'react'

const MONO = "'Fira Code', monospace"
const GREEN = '#00ff41'
const DIM = 'rgba(255,255,255,0.5)'
const FAINT = 'rgba(255,255,255,0.3)'
const BORDER = 'rgba(0,255,65,0.25)'
const BORDER_DIM = 'rgba(0,255,65,0.12)'

const ChatMessage = ({ message, colors, instantMode = false }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const messageRef = useRef(null)

  // Terminal color scheme
  const safeColors = colors || {
    textPrimary: '#ffffff',
    textSecondary: DIM,
    bgPrimary: '#000000',
    cardBg: 'rgba(0,255,65,0.04)',
    cardBorder: BORDER,
    primaryColor: GREEN,
    secondaryColor: GREEN
  }

  // Realistic typing animation for assistant messages
  useEffect(() => {
    if (message.type === 'assistant') {
      // If instant mode is enabled, show text immediately
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
          // Display 2-3 characters at once for faster rendering on long text
          const charsToAdd = text.length > 200 ? 3 : text.length > 100 ? 2 : 1
          const nextIndex = Math.min(currentIndex + charsToAdd, text.length)
          setDisplayedText(text.slice(0, nextIndex))
          currentIndex = nextIndex
        } else {
          setIsTyping(false)
          clearInterval(typingInterval)
        }
      }, 5) // Much faster typing speed

      return () => clearInterval(typingInterval)
    } else {
      setDisplayedText(message.content)
      setIsTyping(false)
    }
  }, [message.content, message.type, instantMode])

  // Format text with line breaks and basic markdown
  const formatText = (text) => {
    if (!text) return null

    // Split by double newlines for paragraphs
    const paragraphs = text.split('\n\n')

    return paragraphs.map((paragraph, pIndex) => {
      // Split by single newlines for line breaks within paragraphs
      const lines = paragraph.split('\n')

      return (
        <div key={pIndex} style={{ marginBottom: pIndex < paragraphs.length - 1 ? '14px' : '0' }}>
          {lines.map((line, lIndex) => {
            // Handle download links - convert to buttons
            const downloadMatch = line.match(/\[📄 ([^\]]+)\]\(([^)]+)\)/)
            if (downloadMatch) {
              const fileName = downloadMatch[1]
              const downloadUrl = downloadMatch[2]

              return (
                <div key={lIndex} style={{
                  marginTop: '8px',
                  marginBottom: '8px',
                  textAlign: 'center'
                }}>
                  <a
                    href={downloadUrl}
                    download={fileName}
                    title={`Download ${fileName}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 14px',
                      background: 'rgba(0,255,65,0.06)',
                      color: GREEN,
                      textDecoration: 'none',
                      border: `1px solid ${BORDER}`,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 400,
                      fontFamily: MONO,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(0,255,65,0.12)'
                      e.target.style.boxShadow = '0 0 12px rgba(0,255,65,0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(0,255,65,0.06)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <span style={{ fontSize: '11px' }}>⬇</span>
                    <span style={{ letterSpacing: '0.4px', fontSize: '11px' }}>
                      download --resume
                    </span>
                  </a>
                </div>
              )
            }

            // Handle bullet points
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
              return (
                <div key={lIndex} style={{
                  marginLeft: '14px',
                  marginBottom: '4px',
                  color: safeColors.textPrimary,
                  fontSize: '13px',
                  lineHeight: '1.5',
                  fontFamily: MONO
                }}>
                  <span style={{ color: GREEN }}>{'>'}</span> {line.trim()}
                </div>
              )
            }

            // Handle bold text with **text**
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, (match, text) => {
              return `<strong style="color: ${GREEN}; font-weight: 600;">${text}</strong>`
            })

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
                dangerouslySetInnerHTML={{ __html: formattedLine }}
              />
            )
          })}
        </div>
      )
    })
  }

  const isUser = message.type === 'user'

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
        {/* Label */}
        <div style={{
          fontSize: '10px',
          color: isUser ? GREEN : FAINT,
          fontFamily: MONO,
          letterSpacing: '0.06em'
        }}>
          {isUser ? 'user@hc' : 'ai@hc'}
        </div>

        {/* Message block */}
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
              {isTyping && (
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
          {!isUser && Array.isArray(message.sources) && message.sources.length > 0 && (
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
                marginBottom: '4px'
              }}>
                ◎ sources
              </div>
              {message.sources.map((source, index) => (
                <div key={index} style={{
                  marginBottom: '4px',
                  fontSize: '12px',
                  fontFamily: MONO,
                  lineHeight: '1.5'
                }}>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage