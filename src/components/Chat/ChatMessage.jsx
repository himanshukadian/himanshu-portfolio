import { useState, useEffect, useRef } from 'react'

const ChatMessage = ({ message, colors, instantMode = false }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const messageRef = useRef(null)

  // Use portfolio colors with fallbacks
  const safeColors = colors || {
    textPrimary: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#232946',
    textSecondary: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#666',
    bgPrimary: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#f8f9fa',
    cardBg: getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim() || '#fff',
    cardBorder: getComputedStyle(document.documentElement).getPropertyValue('--card-border').trim() || '#e0e0e0',
    primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#00e6fe',
    secondaryColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim() || '#2563ff'
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
        <div key={pIndex} style={{ marginBottom: pIndex < paragraphs.length - 1 ? '16px' : '0' }}>
          {lines.map((line, lIndex) => {
            // Handle bullet points
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
              return (
                <div key={lIndex} style={{ 
                  marginLeft: '12px', 
                  marginBottom: '4px',
                  color: safeColors.textPrimary,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {line.trim()}
                </div>
              )
            }
            
            // Handle bold text with **text**
            const formattedLine = line.replace(/\*\*(.*?)\*\*/g, (match, text) => {
              return `<strong style="color: ${safeColors.primaryColor}; font-weight: 600;">${text}</strong>`
            })
            
            return (
              <div 
                key={lIndex} 
                style={{ 
                  marginBottom: lIndex < lines.length - 1 ? '4px' : '0',
                  color: safeColors.textPrimary,
                  fontSize: '14px',
                  lineHeight: '1.5'
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
        marginBottom: '16px',
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div style={{
        maxWidth: '85%',
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '8px'
      }}>
        {/* Avatar */}
        {!isUser && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${safeColors.primaryColor}, ${safeColors.secondaryColor})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            🤖
          </div>
        )}
        
        {/* Message bubble */}
        <div style={{
          background: isUser 
            ? `linear-gradient(135deg, ${safeColors.primaryColor}, ${safeColors.secondaryColor})`
            : safeColors.cardBg,
          color: isUser ? '#fff' : safeColors.textPrimary,
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
          border: isUser ? 'none' : `1px solid ${safeColors.cardBorder}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          position: 'relative',
          wordWrap: 'break-word',
          fontFamily: "'Inter', 'Poppins', Arial, sans-serif"
        }}>
          {isUser ? (
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.4',
              color: 'inherit'
            }}>
              {message.content}
            </div>
          ) : (
            <div style={{ 
              fontSize: '14px', 
              lineHeight: '1.5',
              color: safeColors.textPrimary
            }}>
              {formatText(displayedText)}
              {isTyping && (
                <span style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '16px',
                  background: safeColors.primaryColor,
                  marginLeft: '2px',
                  animation: 'cursorBlink 1s infinite'
                }} />
              )}
            </div>
          )}
        </div>
        
        {/* User avatar */}
        {isUser && (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: safeColors.cardBorder,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            flexShrink: 0,
            marginTop: '2px',
            color: safeColors.textSecondary
          }}>
            👤
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage 