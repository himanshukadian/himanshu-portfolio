import { useState, useCallback, useRef, useEffect } from 'react'

const MessageInput = ({ onSendMessage, disabled, colors }) => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef(null)

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

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px'
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [message, adjustTextareaHeight])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      try {
        onSendMessage(message.trim())
        setMessage('')
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }, [message, disabled, onSendMessage])

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  const handleInputChange = useCallback((e) => {
    setMessage(e.target.value)
  }, [])

  const handleVoiceClick = useCallback(() => {
    if (disabled) return
    
    try {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser')
        return
      }

      if (isRecording) {
        setIsRecording(false)
        return
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsRecording(true)
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setMessage(prev => prev + (prev ? ' ' : '') + transcript)
        setIsRecording(false)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please enable microphone permissions.')
        }
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognition.start()
    } catch (error) {
      console.error('Voice recognition error:', error)
      setIsRecording(false)
    }
  }, [disabled, isRecording])

  return (
    <div style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px'
      }}>
        {/* Main Input Container */}
        <div style={{ flex: '1', position: 'relative' }}>
          <div style={{
            position: 'relative',
            border: `1px solid ${safeColors.cardBorder}`,
            borderRadius: '20px',
            background: safeColors.cardBg,
            transition: 'border-color 0.2s ease'
          }}>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type here or use the mic"
              disabled={disabled}
              style={{
                width: '100%',
                background: 'transparent',
                color: safeColors.textPrimary,
                border: 'none',
                resize: 'none',
                outline: 'none',
                padding: '10px 40px 10px 12px',
                minHeight: '40px',
                maxHeight: '80px',
                fontSize: '14px',
                fontFamily: "'Inter', 'Poppins', Arial, sans-serif",
                lineHeight: '1.4'
              }}
              rows="1"
              onFocus={(e) => e.target.parentElement.style.borderColor = safeColors.primaryColor}
              onBlur={(e) => e.target.parentElement.style.borderColor = safeColors.cardBorder}
            />
            
            {/* Voice Icon */}
            <button
              type="button"
              disabled={disabled}
              onClick={handleVoiceClick}
              style={{
                position: 'absolute',
                right: '8px',
                bottom: '8px',
                padding: '6px',
                background: isRecording ? safeColors.primaryColor : 'transparent',
                border: 'none',
                color: isRecording ? '#fff' : safeColors.textSecondary,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                opacity: isRecording ? 1 : 0.7
              }}
              onMouseEnter={(e) => !disabled && !isRecording && (e.target.style.color = safeColors.primaryColor)}
              onMouseLeave={(e) => !isRecording && (e.target.style.color = safeColors.textSecondary)}
              title={isRecording ? 'Recording... Click to stop' : 'Start voice input'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          style={{
            padding: '8px',
            borderRadius: '50%',
            border: 'none',
            background: message.trim() && !disabled
              ? `linear-gradient(90deg, ${safeColors.primaryColor}, ${safeColors.secondaryColor})`
              : safeColors.cardBorder,
            color: message.trim() && !disabled ? '#fff' : safeColors.textSecondary,
            cursor: message.trim() && !disabled ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '36px',
            minHeight: '36px'
          }}
          onMouseEnter={(e) => {
            if (message.trim() && !disabled) {
              e.target.style.transform = 'scale(1.05)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
          }}
          title="Send message"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
          </svg>
        </button>
      </form>
      
      {/* Recording indicator */}
      {isRecording && (
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: safeColors.primaryColor,
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          animation: 'pulse 1s infinite'
        }}>
          🎤 Recording...
        </div>
      )}
    </div>
  )
}

export default MessageInput 