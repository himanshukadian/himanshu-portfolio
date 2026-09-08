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

const CHAT_HISTORY_KEY = 'chatWidget_chatHistory'
const RATE_LIMIT_MESSAGE = "You're sending messages too quickly — give me a moment 😉"

let messageCounter = 0

const makeMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  messageCounter += 1
  return `msg-${messageCounter}`
}

const ChatWidget = () => {
  const messagesRef = useRef([])
  const abortRef = useRef(null)
  const busyRef = useRef(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const savedHistory = sessionStorage.getItem(CHAT_HISTORY_KEY)
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        if (Array.isArray(parsedHistory)) {
          messagesRef.current = parsedHistory
          return parsedHistory
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
    return []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [expandedSection, setExpandedSection] = useState(null)
  const [error, setError] = useState(null)
  const [aiOnline, setAiOnline] = useState(() => aiService.getOnline())
  const messagesEndRef = useRef(null)

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

  const commitMessages = useCallback((next) => {
    messagesRef.current = next
    setMessages(next)
  }, [])

  useEffect(() => {
    const cleaned = messages.map((message) => {
      if (message.streaming) {
        const copy = Object.assign({}, message)
        delete copy.streaming
        return copy
      }
      return message
    })
    if (cleaned.length > 0) {
      try {
        sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(cleaned))
      } catch (error) {
        console.error('Error saving chat history:', error)
      }
    } else {
      try {
        sessionStorage.removeItem(CHAT_HISTORY_KEY)
      } catch (error) {
        console.error('Error saving chat history:', error)
      }
    }
  }, [messages])

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
  }, [messages, isLoading, scrollToBottom])

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
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
    const text = String(messageText || '').trim()
    if (!text || busyRef.current) return

    const meetingIntent = aiService.categorizeQuery(text).category === 'meeting_scheduling'

    busyRef.current = true
    setShowWelcome(false)
    setIsLoading(true)
    setError(null)
    setAiOnline(aiService.getOnline())

    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller

    const chatHistory = messagesRef.current
      .filter((message) => message.type === 'user' || message.type === 'assistant')
      .map((message) => ({
        role: message.type === 'user' ? 'user' : 'assistant',
        content: message.content
      }))

    const userMessage = {
      id: makeMessageId(),
      type: 'user',
      content: text,
      timestamp: new Date()
    }
    commitMessages([...messagesRef.current, userMessage])

    const assistantMessage = {
      id: makeMessageId(),
      type: 'assistant',
      content: '',
      streaming: true,
      timestamp: new Date()
    }
    commitMessages([...messagesRef.current, assistantMessage])

    const patchAssistant = (patch) => {
      commitMessages(
        messagesRef.current.map((message) =>
          message.id === assistantMessage.id ? { ...message, ...patch } : message
        )
      )
    }

    const applyResult = (result) => {
      patchAssistant({
        content: typeof result.text === 'string' ? result.text : '',
        streaming: false,
        sources: Array.isArray(result.sources) ? result.sources : [],
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        model: result.model || '',
        contextUsed: Boolean(result.contextUsed),
        fellback: Boolean(result.fellback)
      })
    }

    const settle = (banner) => {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
      busyRef.current = false
      setIsLoading(false)
      setAiOnline(aiService.getOnline())
      if (banner) setError(banner)
    }

    const handleRateLimit = () => {
      settle(RATE_LIMIT_MESSAGE)
      patchAssistant({
        content: RATE_LIMIT_MESSAGE,
        streaming: false,
        sources: [],
        suggestions: []
      })
    }

    let result = null
    try {
      result = await aiService.streamResponse(text, chatHistory, {
        onDelta: (accumulated) => {
          if (abortRef.current !== controller) return
          patchAssistant({ content: accumulated })
        },
        signal: controller.signal
      })
    } catch (streamError) {
      if (abortRef.current !== controller) return

      if (streamError && streamError.kind === 'rate_limit') {
        handleRateLimit()
        return
      }

      try {
        result = await aiService.generateResponse(text, chatHistory, { signal: controller.signal })
      } catch (jsonError) {
        if (abortRef.current !== controller) return
        if (jsonError && jsonError.kind === 'rate_limit') {
          handleRateLimit()
          return
        }
        const fallback = aiService.getOfflineFallback()
        settle()
        patchAssistant({
          content: fallback.text || '',
          streaming: false,
          sources: [],
          suggestions: Array.isArray(fallback.suggestions) ? fallback.suggestions : [],
          model: fallback.model || '',
          fellback: true
        })
        return
      }
    }

    if (abortRef.current !== controller) return
    if (result) {
      applyResult(result)
    }
    settle()

    if (meetingIntent) {
      commitMessages([...messagesRef.current, {
        id: makeMessageId(),
        type: 'question',
        question: {
          prompt: 'Pick a topic so I can set up the call:',
          label: 'meeting.purpose()',
          options: [
            { label: 'Career opportunities', value: 'Career opportunities' },
            { label: 'Tech / AI discussion', value: 'Tech / AI discussion' },
            { label: 'Collaboration project', value: 'Collaboration project' },
            { label: 'Just a quick chat', value: 'Just a quick chat' }
          ]
        },
        meta: { kind: 'meeting-purpose' },
        answered: false,
        answer: '',
        timestamp: new Date()
      }])
    }
  }, [commitMessages])

  const handleQuickAction = useCallback((query) => {
    if (isLoading || busyRef.current) return
    handleSendMessage(query)
  }, [isLoading, handleSendMessage])

  const handleToggleSection = useCallback((section) => {
    setExpandedSection(prev => prev === section ? null : section)
  }, [])

  const handleClearChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = null
    busyRef.current = false
    setIsLoading(false)
    setError(null)
    commitMessages([])
  }, [commitMessages])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setError(null)
  }, [])

  const handleMeetingScheduled = useCallback((meetingData) => {
    const isReal = meetingData && meetingData.strategy === 'calendly'
    const link = meetingData && meetingData.meetingLink
    const content = isReal
      ? `📅 **Meeting scheduled!** ${meetingData.meetingId} — ${new Date(meetingData.scheduledTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}${link ? `\n\n🔗 ${link}` : ''}`
      : `📅 **Book your slot directly!** Calendly is busy right now — pick your time here: ${link || 'https://calendly.com/himanshu-c-official/30min'}\n\nConfirmation arrives by email.`
    const summary = {
      id: makeMessageId(),
      type: 'assistant',
      content,
      streaming: false,
      sources: [],
      suggestions: [],
      model: 'scheduling',
      contextUsed: false,
      timestamp: new Date()
    }
    commitMessages([...messagesRef.current, summary])
  }, [commitMessages])

  const appendQuestion = useCallback((questionSpec) => {
    const q = questionSpec && questionSpec.question ? questionSpec.question : questionSpec
    setShowWelcome(false)
    commitMessages([...messagesRef.current, {
      id: makeMessageId(),
      type: 'question',
      question: {
        prompt: q.prompt,
        options: q.options,
        label: q.label
      },
      answered: false,
      answer: '',
      timestamp: new Date()
    }])
  }, [commitMessages])

  const startMeetingScheduler = useCallback((purpose) => {
    commitMessages([...messagesRef.current, {
      id: makeMessageId(),
      type: 'scheduler',
      meetingSuggestion: {
        meetingType: 'general',
        duration: 30,
        description: purpose || 'General intro call — career, collaboration, or tech talk',
        agenda: ['Introduction', purpose || 'General discussion', 'Next steps'],
        autoMessage: 'Pick a time that works for you; you\'ll get a confirmation email.'
      },
      timestamp: new Date()
    }])
  }, [commitMessages])

  const handleQuestionAnswer = useCallback((question, value, messageId, meta) => {
    commitMessages(messagesRef.current.map((m) =>
      m.id === messageId ? { ...m, answered: true, answer: String(value) } : m
    ))
    commitMessages([...messagesRef.current, {
      id: makeMessageId(),
      type: 'user',
      content: String(value),
      timestamp: new Date()
    }])
    if (meta && meta.kind === 'meeting-purpose') {
      startMeetingScheduler(String(value))
    } else {
      aiService.resolveAsk(value)
    }
  }, [commitMessages, startMeetingScheduler])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setError(null)
  }, [])

  const askPopupQuestion = useCallback((question) => {
    setIsOpen(true)
    appendQuestion(question)
  }, [appendQuestion])

  useEffect(() => {
    window.__haloAsk = askPopupQuestion
    window.__haloAskSpec = (spec) => aiService.ask(spec)
    return () => { delete window.__haloAsk; delete window.__haloAskSpec }
  }, [askPopupQuestion])

  useEffect(() => {
    const unsub = aiService.subscribe((spec) => {
      if (spec && spec.mode === 'question' && spec.question) {
        askPopupQuestion(spec.question)
      }
    })
    return unsub
  }, [askPopupQuestion])

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

  const streamingActive = messages.some((message) => message.streaming)

  if (!isOpen) {
    return (
      <>
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
      </>
    )
  }

  return (
    <>
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
              color: aiOnline ? GREEN : '#ff5f56',
              fontFamily: MONO,
              whiteSpace: 'nowrap'
            }}>
              {'●'} {aiOnline ? 'ai.online' : 'ai.offline'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleClearChat}
            style={{
              background: 'transparent',
              border: `1px solid ${BORDER_DIM}`,
              borderRadius: '4px',
              color: DIM,
              fontSize: '11px',
              cursor: 'pointer',
              padding: '2px 8px',
              transition: 'all 0.2s ease',
              fontFamily: MONO
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = GREEN
              e.currentTarget.style.borderColor = BORDER
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = DIM
              e.currentTarget.style.borderColor = BORDER_DIM
            }}
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            clear
          </button>
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
              e.currentTarget.style.color = '#ff5f56'
              e.currentTarget.style.borderColor = 'rgba(255,95,86,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = DIM
              e.currentTarget.style.borderColor = BORDER_DIM
            }}
            title="Close Chat"
            aria-label="Close Chat"
          >
            [x]
          </button>
        </div>
      </div>

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

      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0
      }}>
        {showWelcome ? (
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
                <span style={{
                  display: 'block',
                  marginTop: '6px',
                  color: aiOnline ? GREEN : '#ff5f56',
                  fontSize: '11px'
                }}>
                  {'>'} ai.status: {aiOnline ? 'online' : 'offline'}
                </span>
              </p>
            </div>

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
                    disabled={isLoading}
                    style={{
                      background: 'rgba(0,255,65,0.03)',
                      border: `1px solid ${BORDER_DIM}`,
                      borderRadius: '4px',
                      padding: '8px 12px',
                      color: 'rgba(255,255,255,0.8)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: MONO,
                      opacity: isLoading ? 0.45 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.borderColor = GREEN
                        e.target.style.background = 'rgba(0,255,65,0.07)'
                        e.target.style.color = '#ffffff'
                      }
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
          <div
            className="chat-scroll"
            aria-live="polite"
            style={{
              flex: '1',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '16px',
              background: '#000000',
              WebkitOverflowScrolling: 'touch',
              minHeight: 0
            }}
          >
            {messages.map((message) => {
              if (message.type === 'question') {
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    colors={colors}
                    instantMode
                    onQuestionAnswer={handleQuestionAnswer}
                  />
                )
              }
              if (message.type === 'scheduler') {
                return (
                  <SchedulingWidget
                    key={message.id}
                    inline
                    aiService={aiService}
                    show
                    onHide={() => commitMessages(messagesRef.current.filter((m) => m.id !== message.id))}
                    meetingSuggestion={message.meetingSuggestion}
                    onMeetingScheduled={handleMeetingScheduled}
                    mode="schedule"
                  />
                )
              }
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  colors={colors}
                  instantMode
                  onSuggestionClick={handleQuickAction}
                  suggestionsDisabled={isLoading}
                />
              )
            })}
            {isLoading && !streamingActive && (
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
                    thinking...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="chat-widget-input" style={{
          borderTop: `1px solid ${BORDER_DIM}`,
          background: '#000000',
          padding: '10px 12px',
          flexShrink: 0
        }}>
<MessageInput onSendMessage={handleSendMessage} disabled={isLoading} colors={colors} />
        </div>
      </div>
    </div>
    </>
    )
}
 
export default ChatWidget