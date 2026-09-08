import { useState, useEffect, useRef, useCallback } from 'react'
import ChatMessage from './ChatMessage'
import MessageInput from './MessageInput'
import SchedulingWidget from './SchedulingWidget'
import { aiService } from '../../utils/aiService'

const MONO = "'Fira Code', monospace"
const GREEN = '#00ff41'
const DIM = 'rgba(255,255,255,0.5)'
const FAINT = 'rgba(255,255,255,0.3)'
const BORDER = 'rgba(0,255,65,0.25)'
const BORDER_DIM = 'rgba(0,255,65,0.12)'

// Session management keys
const SESSION_KEYS = {
  AUTO_OPENED: 'chatWidget_autoOpened',
  LAST_SESSION: 'chatWidget_lastSession',
  USER_CLOSED: 'chatWidget_userClosed',
  CHAT_HISTORY: 'chatWidget_chatHistory'
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [expandedSection, setExpandedSection] = useState(null)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)
  const [userHasClosed, setUserHasClosed] = useState(false)
  const [error, setError] = useState(null)
  const [modelStatus, setModelStatus] = useState(aiService.getModelStatus())
  const [showScheduling, setShowScheduling] = useState(false)
  const [meetingSuggestion, setMeetingSuggestion] = useState(null)
  const messagesEndRef = useRef(null)
  const autoOpenTimerRef = useRef(null)
  const responseTimerRef = useRef(null)

  // Terminal color scheme
  const getColors = () => {
    return {
      textPrimary: '#ffffff',
      textSecondary: DIM,
      bgPrimary: '#000000',
      bgSecondary: '#0a0a0a',
      cardBg: 'rgba(0,255,65,0.04)',
      cardBorder: BORDER,
      primaryColor: GREEN,
      secondaryColor: GREEN
    }
  }

  const colors = getColors()

  // Monitor AI model status
  useEffect(() => {
    const updateModelStatus = () => {
      setModelStatus(aiService.getModelStatus())
    }

    const statusInterval = setInterval(updateModelStatus, 2000)

    if (modelStatus.isModelLoaded || modelStatus.fallbackToRules) {
      clearInterval(statusInterval)
    }

    return () => clearInterval(statusInterval)
  }, [modelStatus.isLoading])

  // Load chat history from sessionStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = sessionStorage.getItem(SESSION_KEYS.CHAT_HISTORY)
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        setMessages(parsedHistory)
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }, [])

  // Save chat history to sessionStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(SESSION_KEYS.CHAT_HISTORY, JSON.stringify(messages))
      } catch (error) {
        console.error('Error saving chat history:', error)
      }
    }
  }, [messages])

  // Smooth scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Session management for auto-open
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.resetChatWidget = () => {
        localStorage.removeItem(SESSION_KEYS.AUTO_OPENED)
        localStorage.removeItem(SESSION_KEYS.LAST_SESSION)
        localStorage.removeItem(SESSION_KEYS.USER_CLOSED)
        sessionStorage.removeItem(SESSION_KEYS.CHAT_HISTORY)
        setHasAutoOpened(false)
        setUserHasClosed(false)
        setIsOpen(false)
        setMessages([])
        console.log('Chat widget reset! Chat history cleared. Refresh the page to test auto-open.')
      }

      window.clearChatHistory = () => {
        sessionStorage.removeItem(SESSION_KEYS.CHAT_HISTORY)
        setMessages([])
        console.log('Chat history cleared!')
      }
    }

    try {
      // Auto-open is disabled - let users discover the chat organically
      setHasAutoOpened(true)
    } catch (error) {
      console.error('Session management error:', error)
      setHasAutoOpened(true)
    }

    // Cleanup
    return () => {
      if (autoOpenTimerRef.current) {
        clearTimeout(autoOpenTimerRef.current)
      }
    }
  }, [hasAutoOpened, userHasClosed])

  // Cleanup response timer on unmount
  useEffect(() => {
    return () => {
      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current)
      }
    }
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Morning'
    if (hour < 17) return 'Afternoon'
    return 'Evening'
  }

  const handleSendMessage = useCallback(async (messageText) => {
    if (!messageText?.trim()) return

    try {
      setError(null)

      // If this is the first interaction, just hide the welcome screen
      if (showWelcome) {
        setShowWelcome(false)
      }

      const userMessage = {
        id: Date.now(),
        type: 'user',
        content: messageText,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)
      setExpandedSection(null) // Close any expanded sections

      // Clear any existing timer
      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current)
      }

      // Use AI service for response generation
      try {
        // Get current messages for context (excluding the user message we just added)
        const currentMessages = [...messages, userMessage]
        const response = await aiService.generateResponse(messageText, currentMessages)

        // Check if there's a meeting suggestion
        const suggestion = aiService.getLastMeetingSuggestion()
        if (suggestion && suggestion.shouldSuggest) {
          setMeetingSuggestion(suggestion)
          // Show scheduling widget after a short delay
          setTimeout(() => {
            setShowScheduling(true)
          }, 1000)
        }

        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response,
          timestamp: new Date()
        }

        const writingSources = aiService.getLastWritingSources()
        if (Array.isArray(writingSources) && writingSources.length > 0) {
          assistantMessage.sources = writingSources
        }

        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
      } catch (responseError) {
        console.error('AI response generation error:', responseError)
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: "I apologize, but I'm having trouble processing your request. Could you please try asking in a different way?",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        setIsLoading(false)
        setError('Failed to generate response')
      }
    } catch (error) {
      console.error('Message handling error:', error)
      setIsLoading(false)
      setError('Failed to send message')
    }
  }, [showWelcome])

  const handleQuickAction = useCallback((query) => {
    handleSendMessage(query)
  }, [handleSendMessage])

  const handleToggleSection = useCallback((section) => {
    setExpandedSection(prev => prev === section ? null : section)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setError(null)
    setUserHasClosed(true)

    if (process.env.NODE_ENV !== 'development') {
      localStorage.setItem(SESSION_KEYS.USER_CLOSED, 'true')
    }
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setError(null)
    setUserHasClosed(false)

    if (process.env.NODE_ENV !== 'development') {
      localStorage.removeItem(SESSION_KEYS.USER_CLOSED)
    }
  }, [])

  // Quick suggestion sections - organized by query categories
  const quickSuggestions = [
    { text: "Tell me about your work experience", emoji: "" },
    { text: "What are your technical skills?", emoji: "" },
    { text: "I want to customize my resume for a job", emoji: "" },
    { text: "Let's schedule a meeting to discuss opportunities", emoji: "" },
    { text: "Show me your AI and technical projects", emoji: "" },
    { text: "How can I get in touch with you?", emoji: "" },
    { text: "Summarize your latest blog article", emoji: "" },
    { text: "What are your writing and articles about?", emoji: "" }
  ]

  // Portfolio sections for expandable cards - enhanced with smart categorization
  const portfolioSections = [
    {
      title: "Work Experience",
      icon: "[]",
      description: "Wayfair, Amazon, Mobeology",
      action: "Tell me about your professional experience"
    },
    {
      title: "AI Resume Service",
      icon: "#",
      description: "Smart resume customization",
      action: "I need help customizing my resume for a job"
    },
    {
      title: "Schedule Meeting",
      icon: "&",
      description: "Career opportunities & tech talks",
      action: "I'd like to schedule a meeting with you"
    },
    {
      title: "Technical Skills",
      icon: "{}",
      description: "Java, AI/ML, Cloud, Full-stack",
      action: "What are your technical skills and expertise?"
    },
    {
      title: "AI Projects",
      icon: "$",
      description: "AI assistants, ML systems",
      action: "Show me your AI and machine learning projects"
    },
    {
      title: "Contact Info",
      icon: "@",
      description: "Email, LinkedIn, GitHub",
      action: "How can I get in touch with you?"
    }
  ]

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 10002
      }}>
        <button
          onClick={handleOpen}
          className="chat-widget-fab"
          style={{
            borderRadius: '4px',
            background: 'rgba(0,0,0,0.9)',
            border: `1px solid ${BORDER}`,
            boxShadow: '0 0 16px rgba(0,255,65,0.12)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            transition: 'all 0.2s ease',
            color: GREEN,
            fontSize: '13px',
            fontWeight: 400,
            fontFamily: MONO,
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,255,65,0.08)'
            e.currentTarget.style.borderColor = GREEN
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,65,0.25)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.9)'
            e.currentTarget.style.borderColor = BORDER
            e.currentTarget.style.boxShadow = '0 0 16px rgba(0,255,65,0.12)'
          }}
          title="Open H.A.L.O."
          aria-label="Open H.A.L.O."
        >
          <span style={{ fontSize: '13px', lineHeight: 1, color: GREEN }}>{'>'}</span>
          Ask H.A.L.O.
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '12px',
            background: GREEN,
            animation: 'cursorBlink 1s infinite'
          }} />
        </button>
      </div>
    )
  }

  return (
    <div className="chat-widget" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '380px',
      height: '600px',
      background: '#000000',
      borderRadius: '4px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,65,0.15)',
      border: `1px solid ${BORDER}`,
      zIndex: 10002,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: MONO
    }}>
      {/* Header */}
      <div className="chat-widget-header" style={{
        background: '#000000',
        color: '#fff',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderBottom: `1px solid ${BORDER}`
      }}>
        {/* Title dots */}
        <div style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          paddingRight: '12px'
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'rgba(0,255,65,0.5)' }} />
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'rgba(0,255,65,0.25)' }} />
          <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'rgba(0,255,65,0.12)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '30px',
            height: '30px',
            border: `1px solid ${BORDER}`,
            borderRadius: '4px',
            background: 'rgba(0,255,65,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            color: GREEN,
            flexShrink: 0
          }}>
            {'~'}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              margin: '0',
              fontSize: '13px',
              fontWeight: 400,
              color: GREEN,
              fontFamily: MONO,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {'>'} assistant.ask()
            </h3>
            <p style={{
              margin: '0',
              fontSize: '11px',
              color: modelStatus.isModelLoaded && !modelStatus.fallbackToRules ? GREEN : DIM,
              fontFamily: MONO,
              whiteSpace: 'nowrap'
            }}>
              {modelStatus.isLoading
                ? 'loading model...'
                : modelStatus.isModelLoaded && !modelStatus.fallbackToRules
                  ? '● ai.online'
                  : '● ai.ready (rules mode)'}
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: `1px solid ${BORDER_DIM}`,
            borderRadius: '4px',
            color: DIM,
            fontSize: '14px',
            cursor: 'pointer',
            padding: '2px 8px',
            transition: 'all 0.2s ease',
            fontFamily: MONO
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#ff5f56'
            e.target.style.borderColor = 'rgba(255,95,86,0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.color = DIM
            e.target.style.borderColor = BORDER_DIM
          }}
          title="Close Chat"
          aria-label="Close Chat"
        >
          [x]
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: 'rgba(255,0,0,0.08)',
          color: '#ff5f56',
          padding: '8px 16px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,0,0,0.25)',
          fontFamily: MONO
        }}>
          <span>{'>'} error: {error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ff5f56',
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: MONO
            }}
          >
            [x]
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0
      }}>
        {showWelcome ? (
          /* Welcome Screen */
          <div className="chat-widget-content" style={{
            flex: '1',
            padding: '18px 16px',
            overflowY: 'auto',
            background: '#000000',
            WebkitOverflowScrolling: 'touch'
          }}>
            <div style={{ marginBottom: '18px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 400,
                color: GREEN,
                margin: '0 0 8px 0',
                fontFamily: MONO
              }}>
                {'>'} Good {getGreeting()}._
              </h2>
              <p style={{
                color: DIM,
                margin: '0',
                fontSize: '12px',
                lineHeight: '1.6',
                fontFamily: MONO
              }}>
                {'>'} I can help with portfolio info, schedule meetings, and customize resumes with AI.
                {!modelStatus.isModelLoaded && (
                  <span style={{
                    display: 'block',
                    marginTop: '6px',
                    color: GREEN,
                    fontSize: '11px'
                  }}>
                    {'>'} loading advanced AI model in background...
                  </span>
                )}
                {modelStatus.isModelLoaded && !modelStatus.fallbackToRules && (
                  <span style={{
                    display: 'block',
                    marginTop: '6px',
                    color: GREEN,
                    fontSize: '11px'
                  }}>
                    {'>'} ai model loaded — responses active
                  </span>
                )}
              </p>
            </div>

            {/* Quick Suggestions */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '11px',
                fontWeight: 400,
                color: FAINT,
                margin: '0 0 10px 0',
                fontFamily: MONO,
                letterSpacing: '0.08em'
              }}>
                {'//'} quick actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(suggestion.text)}
                    style={{
                      background: 'rgba(0,255,65,0.03)',
                      border: `1px solid ${BORDER_DIM}`,
                      borderRadius: '4px',
                      padding: '8px 12px',
                      color: 'rgba(255,255,255,0.8)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: MONO
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = GREEN
                      e.target.style.background = 'rgba(0,255,65,0.07)'
                      e.target.style.color = '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = BORDER_DIM
                      e.target.style.background = 'rgba(0,255,65,0.03)'
                      e.target.style.color = 'rgba(255,255,255,0.8)'
                    }}
                  >
                    <span style={{ fontSize: '12px', color: GREEN, flexShrink: 0 }}>{'>'}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Portfolio Sections */}
            <div>
              <h3 style={{
                fontSize: '11px',
                fontWeight: 400,
                color: FAINT,
                margin: '0 0 10px 0',
                fontFamily: MONO,
                letterSpacing: '0.08em'
              }}>
                {'//'} categories
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {portfolioSections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (expandedSection === section.title) {
                        handleQuickAction(section.action)
                      } else {
                        handleToggleSection(section.title)
                      }
                    }}
                    style={{
                      background: expandedSection === section.title ? 'rgba(0,255,65,0.08)' : 'rgba(0,255,65,0.03)',
                      border: `1px solid ${expandedSection === section.title ? BORDER : BORDER_DIM}`,
                      borderRadius: '4px',
                      padding: '10px 8px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      fontSize: '11px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      minHeight: expandedSection === section.title ? 'auto' : '72px',
                      fontFamily: MONO
                    }}
                    onMouseEnter={(e) => {
                      if (expandedSection !== section.title) {
                        e.target.style.borderColor = GREEN
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (expandedSection !== section.title) {
                        e.target.style.borderColor = BORDER_DIM
                      }
                    }}
                  >
                    <span style={{ fontSize: '14px', color: GREEN }}>{section.icon}</span>
                    <span style={{ fontWeight: 400 }}>{section.title}</span>
                    {expandedSection === section.title && (
                      <span style={{
                        fontSize: '10px',
                        opacity: '0.8',
                        marginTop: '2px',
                        lineHeight: '1.3',
                        color: DIM
                      }}>
                        {section.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div style={{
            flex: '1',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '16px',
            background: '#000000',
            WebkitOverflowScrolling: 'touch',
            minHeight: 0
          }} className="chat-scroll">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} colors={colors} instantMode />
            ))}
            {isLoading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{
                  background: 'rgba(0,255,65,0.03)',
                  border: `1px solid ${BORDER_DIM}`,
                  borderRadius: '4px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: MONO
                }}>
                  <span style={{ color: GREEN, fontSize: '12px' }}>{'>'}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div className="chat-loading-dot"></div>
                    <div className="chat-loading-dot"></div>
                    <div className="chat-loading-dot"></div>
                  </div>
                  <span style={{ color: DIM, fontSize: '11px' }}>
                    {modelStatus.isModelLoaded && !modelStatus.fallbackToRules
                      ? 'processing...'
                      : modelStatus.isLoading
                        ? 'initializing...'
                        : 'thinking...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="chat-widget-input" style={{
          borderTop: `1px solid ${BORDER_DIM}`,
          background: '#000000',
          padding: '10px 12px',
          flexShrink: 0
        }}>
          <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} colors={colors} />
        </div>
      </div>

      {/* Scheduling Widget */}
      <SchedulingWidget
        aiService={aiService}
        show={showScheduling}
        onHide={() => setShowScheduling(false)}
        meetingSuggestion={meetingSuggestion}
        onMeetingScheduled={(meetingData) => {
          const successMessage = {
            id: Date.now(),
            type: 'assistant',
            content: `> meeting.scheduled()\n${meetingData.meetingType.replace('_', ' ')} on ${new Date(meetingData.scheduledTime).toLocaleDateString('en-IN', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}. A confirmation email is on the way.`,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, successMessage])
          setShowScheduling(false)
          setMeetingSuggestion(null)
        }}
      />
    </div>
  )
}

export default ChatWidget