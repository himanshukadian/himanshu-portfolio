import { useState, useCallback, useRef, useEffect } from 'react'

const MONO = "'Fira Code', monospace"
const GREEN = '#00ff41'
const DIM = 'rgba(255,255,255,0.5)'
const BORDER = 'rgba(0,255,65,0.25)'
const BORDER_DIM = 'rgba(0,255,65,0.12)'

const MAX_MESSAGE_LENGTH = 4000

const MessageInput = ({ onSendMessage, disabled, colors }) => {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  const safeColors = colors || {
    textPrimary: '#ffffff',
    textSecondary: DIM,
    bgPrimary: '#000000',
    cardBg: 'rgba(0,255,65,0.04)',
    cardBorder: BORDER,
    primaryColor: GREEN,
    secondaryColor: GREEN
  }

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px'
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [message, adjustTextareaHeight])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          void e
        }
        recognitionRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (disabled && recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        void e
      }
      recognitionRef.current = null
      setIsRecording(false)
    }
  }, [disabled])

  const handleSubmit = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (message.trim() && !disabled) {
      try {
        onSendMessage(message.trim().slice(0, MAX_MESSAGE_LENGTH))
        setMessage('')
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }, [message, disabled, onSendMessage])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  const handleInputChange = useCallback((e) => {
    const value = e.target.value
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value)
    }
  }, [])

  const handleVoiceClick = useCallback(() => {
    if (disabled) return

    try {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser')
        return
      }

      if (isRecording) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop()
          } catch (e) {
            void e
          }
        }
        recognitionRef.current = null
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
        setMessage(prev => (prev + (prev ? ' ' : '') + transcript).slice(0, MAX_MESSAGE_LENGTH))
        setIsRecording(false)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        recognitionRef.current = null
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please enable microphone permissions.')
        }
      }

      recognition.onend = () => {
        setIsRecording(false)
        recognitionRef.current = null
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (error) {
      console.error('Voice recognition error:', error)
      setIsRecording(false)
      recognitionRef.current = null
    }
  }, [disabled, isRecording])

  const charCount = message.length
  const canSend = charCount > 0 && !disabled

  return (
    <div style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit} encType="application/x-www-form-urlencoded" style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px'
      }}>
        <div style={{ flex: '1', position: 'relative', minWidth: 0 }}>
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
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? 'recording...' : 'type message_'}
              disabled={disabled}
              maxLength={MAX_MESSAGE_LENGTH}
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
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '3px',
            paddingRight: '2px'
          }}>
            <span style={{
              fontSize: '9px',
              color: DIM,
              fontFamily: MONO,
              letterSpacing: '0.05em'
            }}>
              {charCount}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSend}
          style={{
            padding: '10px 14px',
            borderRadius: '4px',
            border: `1px solid ${canSend ? GREEN : BORDER_DIM}`,
            background: canSend ? 'rgba(0,255,65,0.08)' : 'transparent',
            color: canSend ? GREEN : safeColors.textSecondary,
            cursor: canSend ? 'pointer' : 'not-allowed',
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
            if (canSend) {
              e.target.style.background = 'rgba(0,255,65,0.14)'
              e.target.style.boxShadow = '0 0 10px rgba(0,255,65,0.2)'
            }
          }}
          onMouseLeave={(e) => {
            if (canSend) {
              e.target.style.background = 'rgba(0,255,65,0.08)'
              e.target.style.boxShadow = 'none'
            }
          }}
          title="Send message"
        >
          {'>>>'}
        </button>
      </form>

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