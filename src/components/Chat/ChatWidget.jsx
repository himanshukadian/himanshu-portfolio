import { useState, useEffect, useRef, useCallback } from 'react'
import ChatMessage from './ChatMessage'
import MessageInput from './MessageInput'
import SchedulingWidget from './SchedulingWidget'
import { aiService } from '../../utils/aiService'

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [expandedSection, setExpandedSection] = useState(null)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)
  const [isAutoOpening, setIsAutoOpening] = useState(false)
  const [userHasClosed, setUserHasClosed] = useState(false)
  const [error, setError] = useState(null)
  const [modelStatus, setModelStatus] = useState(aiService.getModelStatus())
  const [instantMode] = useState(true) // Always use instant mode
  const [showScheduling, setShowScheduling] = useState(false)
  const [meetingSuggestion, setMeetingSuggestion] = useState(null)
  const messagesEndRef = useRef(null)
  const autoOpenTimerRef = useRef(null)
  const responseTimerRef = useRef(null)

  // Use the same color scheme as the main portfolio (CSS variables)
  const getColors = () => {
    const computedStyle = getComputedStyle(document.documentElement)
    return {
      textPrimary: computedStyle.getPropertyValue('--text-primary').trim() || '#232946',
      textSecondary: computedStyle.getPropertyValue('--text-secondary').trim() || '#666',
      bgPrimary: computedStyle.getPropertyValue('--bg-primary').trim() || '#f8f9fa',
      bgSecondary: computedStyle.getPropertyValue('--bg-secondary').trim() || '#fff',
      cardBg: computedStyle.getPropertyValue('--card-bg').trim() || '#fff',
      cardBorder: computedStyle.getPropertyValue('--card-border').trim() || '#e0e0e0',
      primaryColor: computedStyle.getPropertyValue('--primary-color').trim() || '#00e6fe',
      secondaryColor: computedStyle.getPropertyValue('--secondary-color').trim() || '#2563ff'
    }
  }

  const [colors, setColors] = useState(getColors())

  // Update colors when theme changes
  useEffect(() => {
    const updateColors = () => {
      setColors(getColors())
    }

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateColors()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    // Also listen for CSS custom property changes
    window.addEventListener('themechange', updateColors)

    return () => {
      observer.disconnect()
      window.removeEventListener('themechange', updateColors)
    }
  }, [])

  // Monitor AI model status
  useEffect(() => {
    const updateModelStatus = () => {
      setModelStatus(aiService.getModelStatus())
    }

    // Update status every 2 seconds while model is loading
    const statusInterval = setInterval(updateModelStatus, 2000)

    // Stop checking once model is loaded
    if (modelStatus.isModelLoaded || modelStatus.fallbackToRules) {
      clearInterval(statusInterval)
    }

    return () => clearInterval(statusInterval)
  }, [modelStatus.isLoading])

  // Session management keys
  const SESSION_KEYS = {
    AUTO_OPENED: 'chatWidget_autoOpened',
    LAST_SESSION: 'chatWidget_lastSession',
    USER_CLOSED: 'chatWidget_userClosed', // Track if user closed in current session
    CHAT_HISTORY: 'chatWidget_chatHistory' // Store chat messages
  }

  // Load chat history from sessionStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = sessionStorage.getItem(SESSION_KEYS.CHAT_HISTORY)
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        setMessages(parsedHistory)
        console.log('💾 Loaded chat history:', parsedHistory.length, 'messages')
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
        console.log('💾 Saved chat history:', messages.length, 'messages')
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
    // Add global function for testing (only in development)
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
      const lastSession = localStorage.getItem(SESSION_KEYS.LAST_SESSION)
      const autoOpened = localStorage.getItem(SESSION_KEYS.AUTO_OPENED)
      const userClosed = localStorage.getItem(SESSION_KEYS.USER_CLOSED)
      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000 // 24 hours
      
      // Development mode - always auto-open for testing
      const isDevelopment = process.env.NODE_ENV === 'development'
      
      console.log('Chat Widget Auto-Open Debug:', {
        lastSession,
        autoOpened,
        userClosed,
        hasAutoOpened,
        userHasClosed,
        isDevelopment
      })

      // Reset flags if it's been more than 24 hours OR in development mode
      if (lastSession && (now - parseInt(lastSession)) > oneDay || isDevelopment) {
        localStorage.removeItem(SESSION_KEYS.AUTO_OPENED)
        localStorage.removeItem(SESSION_KEYS.USER_CLOSED)
        localStorage.setItem(SESSION_KEYS.LAST_SESSION, now.toString())
        console.log('Auto-open flags reset')
      } else if (!lastSession) {
        localStorage.setItem(SESSION_KEYS.LAST_SESSION, now.toString())
      }

      // Set userHasClosed state from localStorage
      if (userClosed === 'true' && !isDevelopment) {
        setUserHasClosed(true)
      }

      // Check if we should auto-open
      // Don't auto-open if: user has closed it, already auto-opened (and not in dev mode)
      const shouldAutoOpen = !userHasClosed && 
                             !userClosed && 
                             (isDevelopment || (!autoOpened && !hasAutoOpened))
      
      if (shouldAutoOpen) {
        console.log('Starting auto-open timer (3 seconds)...')
        autoOpenTimerRef.current = setTimeout(() => {
          console.log('Auto-opening chat widget...')
          setIsAutoOpening(true)
          setTimeout(() => {
            setIsOpen(true)
            setHasAutoOpened(true)
            setIsAutoOpening(false)
            if (!isDevelopment) {
              localStorage.setItem(SESSION_KEYS.AUTO_OPENED, 'true')
            }
            console.log('Chat widget auto-opened successfully')
          }, 200)
        }, 3000) // 3 seconds
      } else {
        const reason = userHasClosed || userClosed ? 'user manually closed it' : 'already opened in this session'
        console.log(`Auto-open skipped - ${reason}`)
        setHasAutoOpened(true)
      }
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
    
    // Save to localStorage so it persists across page refreshes
    // Only save in non-development mode
    if (process.env.NODE_ENV !== 'development') {
      localStorage.setItem(SESSION_KEYS.USER_CLOSED, 'true')
    }
    
    console.log('User manually closed chat widget - will not auto-open again today')
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setError(null)
    setUserHasClosed(false) // Reset the closed flag since user is opening it manually
    
    // Clear the userClosed flag from localStorage
    if (process.env.NODE_ENV !== 'development') {
      localStorage.removeItem(SESSION_KEYS.USER_CLOSED)
    }
    
    console.log('User manually opened chat widget')
  }, [])

  // Quick suggestion sections
  const quickSuggestions = [
    { text: "Tell me about your experience at Wayfair", emoji: "💼" },
    { text: "What AI projects have you worked on?", emoji: "🤖" },
    { text: "Show me your technical skills", emoji: "🛠️" },
    { text: "What did you build at Amazon?", emoji: "📦" },
    { text: "Tell me about your education", emoji: "🎓" },
    { text: "How can I get in touch with you?", emoji: "📧" }
  ]

  // Portfolio sections for expandable cards
  const portfolioSections = [
    { 
      title: "Work Experience", 
      icon: "💼", 
      description: "Wayfair, Amazon, and more",
      action: "Tell me about your work experience"
    },
    { 
      title: "AI & Tech Skills", 
      icon: "🤖", 
      description: "AI/ML, Java, Python, Cloud",
      action: "What technologies do you work with?"
    },
    { 
      title: "Cool Projects", 
      icon: "🚀", 
      description: "AI assistants, web apps, systems",
      action: "Show me some projects you've built"
    },
    { 
      title: "Education", 
      icon: "🎓", 
      description: "NIT Warangal, class topper",
      action: "Tell me about your educational background"
    },
    { 
      title: "Get in Touch", 
      icon: "📧", 
      description: "Email, LinkedIn, GitHub",
      action: "How can I contact you?"
    },
    { 
      title: "AI Expertise", 
      icon: "✨", 
      description: "Generative AI, LLMs, ML",
      action: "What's your experience with AI and machine learning?"
    }
  ]

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={handleOpen}
          className="chat-widget-fab"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
            border: 'none',
            boxShadow: isAutoOpening 
              ? `0 0 20px ${colors.primaryColor}66, 0 0 40px ${colors.secondaryColor}66` 
              : '0 4px 20px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            color: '#fff',
            fontSize: '24px',
            animation: isAutoOpening ? 'chatPulse 1s ease-in-out infinite' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!isAutoOpening) {
              e.target.style.transform = 'scale(1.1)'
              e.target.style.boxShadow = '0 6px 25px rgba(0,0,0,0.2)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isAutoOpening) {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'
            }
          }}
          title="Open Chat Assistant"
          aria-label="Open Chat Assistant"
        >
          💬
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
      background: colors.cardBg,
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
      border: `1px solid ${colors.cardBorder}`,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Inter', 'Poppins', Arial, sans-serif"
    }}>
      {/* Header */}
      <div className="chat-widget-header" style={{
        background: `linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor})`,
        color: '#fff',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background overlay for better text contrast */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.1)',
          zIndex: 0
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            🤖
          </div>
          <div>
            <h3 style={{ 
              margin: '0', 
              fontSize: '16px', 
              fontWeight: '700', 
              color: '#fff',
              fontFamily: "'Inter', 'Poppins', Arial, sans-serif",
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.9))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {modelStatus.isLoading ? 'AI Loading...' : 'Ask Portfolio'}
              {modelStatus.isModelLoaded && !modelStatus.fallbackToRules && (
                <span style={{ fontSize: '10px', marginLeft: '4px' }}>✨</span>
              )}
            </h3>
            <p style={{ 
              margin: '0', 
              fontSize: '12px', 
              opacity: '0.95',
              color: 'rgba(255,255,255,0.9)',
              fontFamily: "'Inter', 'Poppins', Arial, sans-serif",
              fontWeight: '500',
              letterSpacing: '0.3px',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              {modelStatus.isModelLoaded && !modelStatus.fallbackToRules
                ? `✨ AI-Powered`
                : 'Himanshu\'s Assistant'
              }
            </p>
          </div>
        </div>
        {/* AI Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1 }}>
          <label style={{ color: '#fff', fontSize: '12px', fontWeight: 500, marginRight: '4px' }}>Mode:</label>
          <button
            onClick={() => {
              aiService.setRuleBasedMode();
              setModelStatus({ ...aiService.getModelStatus() });
            }}
            style={{
              background: modelStatus.fallbackToRules ? colors.primaryColor : 'rgba(255,255,255,0.15)',
              color: modelStatus.fallbackToRules ? '#fff' : '#eee',
              border: 'none',
              borderRadius: '6px 0 0 6px',
              padding: '4px 10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
              outline: 'none',
              transition: 'all 0.2s',
              opacity: 1
            }}
            disabled={modelStatus.fallbackToRules}
            title="Use rule-based responses only"
          >
            Rules
          </button>
          <button
            onClick={() => {
              aiService.setMistralAPIMode();
              setModelStatus({ ...aiService.getModelStatus() });
            }}
            style={{
              background: !modelStatus.fallbackToRules ? colors.primaryColor : 'rgba(255,255,255,0.15)',
              color: !modelStatus.fallbackToRules ? '#fff' : '#eee',
              border: 'none',
              borderRadius: '0 6px 6px 0',
              padding: '4px 10px',
              cursor: modelStatus.isModelLoaded ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '12px',
              outline: 'none',
              transition: 'all 0.2s',
              opacity: modelStatus.isModelLoaded ? 1 : 0.5
            }}
            disabled={!modelStatus.isModelLoaded || !modelStatus.fallbackToRules}
            title={modelStatus.isModelLoaded ? "Use AI responses" : "AI not available (missing API key)"}
          >
            AI
          </button>
        </div>
        
        <button
          onClick={handleClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            opacity: '0.9',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '32px',
            minHeight: '32px',
            position: 'relative',
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '1'
            e.target.style.background = 'rgba(255,255,255,0.3)'
            e.target.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '0.9'
            e.target.style.background = 'rgba(255,255,255,0.2)'
            e.target.style.transform = 'scale(1)'
          }}
          title="Close Chat"
          aria-label="Close Chat"
        >
          ✕
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#ff4444',
          color: '#fff',
          padding: '8px 16px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✕
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
            padding: '20px',
            overflowY: 'auto',
            background: colors.bgPrimary,
            WebkitOverflowScrolling: 'touch'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: colors.textPrimary, 
                margin: '0 0 8px 0' 
              }}>
                Good {getGreeting()}
              </h2>
              <p style={{ 
                color: colors.textSecondary, 
                margin: '0', 
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                I'm your personal AI assistant for Himanshu's portfolio. 
                {!modelStatus.isModelLoaded && (
                  <span style={{ 
                    display: 'block', 
                    marginTop: '4px', 
                    color: colors.primaryColor,
                    fontSize: '12px'
                  }}>
                    🤖 Loading advanced AI models in background...
                  </span>
                )}
                {modelStatus.isModelLoaded && !modelStatus.fallbackToRules && (
                  <span style={{ 
                    display: 'block', 
                    marginTop: '4px', 
                    color: colors.primaryColor,
                    fontSize: '12px'
                  }}>
                    ✨ AI-powered responses active!
                  </span>
                )}
              </p>
            </div>

            {/* Quick Suggestions */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: colors.textSecondary, 
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                You may like
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(suggestion.text)}
                    style={{
                      background: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: '8px',
                      padding: '12px',
                      color: colors.textPrimary,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = colors.primaryColor
                      e.target.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = colors.cardBorder
                      e.target.style.transform = 'translateY(0)'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{suggestion.emoji}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Portfolio Sections */}
            <div>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: colors.textSecondary, 
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Portfolio Sections
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                      background: expandedSection === section.title ? colors.primaryColor : colors.cardBg,
                      border: `1px solid ${expandedSection === section.title ? colors.primaryColor : colors.cardBorder}`,
                      borderRadius: '8px',
                      padding: '12px 8px',
                      color: expandedSection === section.title ? '#fff' : colors.textPrimary,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      fontSize: '11px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      minHeight: expandedSection === section.title ? 'auto' : '80px'
                    }}
                    onMouseEnter={(e) => {
                      if (expandedSection !== section.title) {
                        e.target.style.borderColor = colors.primaryColor
                        e.target.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (expandedSection !== section.title) {
                        e.target.style.borderColor = colors.cardBorder
                        e.target.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{section.icon}</span>
                    <span style={{ fontWeight: '600' }}>{section.title}</span>
                    {expandedSection === section.title && (
                      <span style={{ 
                        fontSize: '10px', 
                        opacity: '0.9',
                        marginTop: '4px',
                        lineHeight: '1.2'
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
            background: colors.bgPrimary,
            WebkitOverflowScrolling: 'touch',
            minHeight: 0
          }} className="chat-scroll">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} colors={colors} instantMode={instantMode} />
            ))}
            {isLoading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: colors.cardBg,
                  borderRadius: '12px',
                  padding: '12px',
                  border: `1px solid ${colors.cardBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div className="chat-loading-dot"></div>
                    <div className="chat-loading-dot"></div>
                    <div className="chat-loading-dot"></div>
                  </div>
                  <span style={{ color: colors.textSecondary, fontSize: '12px' }}>
                    {modelStatus.isModelLoaded && !modelStatus.fallbackToRules 
                      ? '🤖 AI thinking...' 
                      : modelStatus.isLoading 
                        ? '⚡ Initializing...'
                        : '💭 Thinking...'
                    }
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="chat-widget-input" style={{
          borderTop: `1px solid ${colors.cardBorder}`,
          background: colors.cardBg,
          padding: '12px',
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
          console.log('Meeting scheduled:', meetingData)
          // Add a success message to chat
          const successMessage = {
            id: Date.now(),
            type: 'assistant',
            content: `🎉 Great! Your ${meetingData.meetingType.replace('_', ' ')} is scheduled for ${new Date(meetingData.scheduledTime).toLocaleDateString('en-IN', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}. You'll receive a confirmation email shortly!`,
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