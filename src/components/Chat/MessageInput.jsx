import { useState, useCallback, useRef, useEffect } from 'react'

const MONO = "'Fira Code', monospace"
const GREEN = '#00ff41'
const DIM = 'rgba(255,255,255,0.5)'
const BORDER = 'rgba(0,255,65,0.25)'
const BORDER_DIM = 'rgba(0,255,65,0.12)'

const MessageInput = ({ onSendMessage, disabled, colors }) => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef(null)

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
            border: `1px solid ${isRecording ? GREEN : BORDER_DIM}`,
            borderRadius: '4px',
            background: 'rgba(0,255,65,0.03)',
            transition: 'border-color 0.2s ease',
            display: 'flex',
            alignItems: 'flex-end'
          }}>
            <span style={{
              color: GREEN,
              fontSize: '13px',
              padding: '10px 0 10px 12px',
              fontFamily: MONO,
              lineHeight: '1.4',
              flexShrink: 0
            }}>{'>'}</span>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? 'recording...' : 'type message_'}
              disabled={disabled}
              style={{
                width: '100%',
                background: 'transparent',
                color: safeColors.textPrimary,
                border: 'none',
                resize: 'none',
                outline: 'none',
                padding: '10px 12px',
                minHeight: '40px',
                maxHeight: '80px',
                fontSize: '13px',
                fontFamily: MONO,
                lineHeight: '1.4'
              }}
              rows="1"
              onFocus={(e) => e.target.parentElement.style.borderColor = GREEN}
              onBlur={(e) => e.target.parentElement.style.borderColor = isRecording ? GREEN : BORDER_DIM}
            />

            {/* Voice Icon */}
            <button
              type="button"
              className="chat-mic-btn"
              disabled={disabled}
              onClick={handleVoiceClick}
              style={{
                padding: '6px',
                background: 'transparent',
                border: 'none',
                color: isRecording ? '#ff5f56' : safeColors.textSecondary,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                opacity: isRecording ? 1 : 0.6,
                width: '30px',
                height: '30px',
                flexShrink: 0,
                margin: '0 0 5px 0'
              }}
              onMouseEnter={(e) => !disabled && !isRecording && (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => !isRecording && (e.currentTarget.style.opacity = '0.6')}
              title={isRecording ? 'Recording... Click to stop' : 'Start voice input'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            padding: '10px 14px',
            borderRadius: '4px',
            border: `1px solid ${message.trim() && !disabled ? GREEN : BORDER_DIM}`,
            background: message.trim() && !disabled ? 'rgba(0,255,65,0.08)' : 'transparent',
            color: message.trim() && !disabled ? GREEN : safeColors.textSecondary,
            cursor: message.trim() && !disabled ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: MONO,
            fontSize: '12px',
            letterSpacing: '0.05em',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (message.trim() && !disabled) {
              e.target.style.background = 'rgba(0,255,65,0.14)'
              e.target.style.boxShadow = '0 0 10px rgba(0,255,65,0.2)'
            }
          }}
          onMouseLeave={(e) => {
            if (message.trim() && !disabled) {
              e.target.style.background = 'rgba(0,255,65,0.08)'
              e.target.style.boxShadow = 'none'
            }
          }}
          title="Send message"
        >
          {'>>>'}
        </button>
      </form>

      {/* Recording indicator */}
      {isRecording && (
        <div style={{
          position: 'absolute',
          top: '-28px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.95)',
          color: '#ff5f56',
          padding: '4px 10px',
          border: '1px solid rgba(255,95,86,0.4)',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 400,
          fontFamily: MONO,
          whiteSpace: 'nowrap'
        }}>
          {'●'} recording... <span style={{ animation: 'cursorBlink 1s infinite' }}>_</span>
        </div>
      )}
    </div>
  )
}

export default MessageInput