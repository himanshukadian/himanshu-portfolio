import { useState, useEffect, useRef } from 'react'
import { resumeData } from '../../data/resume'
import ChatMessage from './ChatMessage'
import MessageInput from './MessageInput'
import { generateResponse } from '../../utils/chatResponses'

function ChatPortfolio() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Show welcome message after a brief delay
    const timer = setTimeout(() => {
      setMessages([{
        id: 1,
        type: 'assistant',
        content: `Hello! 👋 I'm Himanshu Chaudhary's portfolio assistant. I can tell you about his experience, skills, projects, and education. What would you like to know?`,
        timestamp: new Date()
      }])
      setShowWelcome(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(messageText.toLowerCase(), resumeData)
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000 + Math.random() * 1000) // Random delay between 1-2 seconds
  }

  return (
    <div className="chat-container" style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      paddingTop: '80px', // Account for fixed navbar
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', 'Poppins', Arial, sans-serif"
    }}>
      {/* Header */}
      <div className="chat-header" style={{
        borderBottom: '1px solid var(--card-border)',
        background: 'var(--bg-primary)',
        padding: '1rem 0'
      }}>
        <div className="max-w-4xl mx-auto px-4">
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'var(--primary-color)',
            margin: '0',
            fontFamily: "'Inter', 'Poppins', Arial, sans-serif"
          }}>
            ChatPortfolio
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            margin: '0.25rem 0 0 0'
          }}>
            Ask me anything about Himanshu's professional background
          </p>
        </div>
      </div>

      {/* Welcome Screen */}
      {showWelcome && (
        <div style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          background: 'var(--bg-primary)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              marginBottom: '1rem',
              background: 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ChatPortfolio
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.1rem'
            }}>
              Loading Himanshu's portfolio assistant...
            </p>
          </div>
        </div>
      )}

      {/* Chat Container */}
      {!showWelcome && (
        <>
          <div style={{
            flex: '1',
            overflowY: 'auto',
            padding: '1rem 0',
            minHeight: 'calc(100vh - 200px)',
            background: 'var(--bg-primary)'
          }} className="chat-scroll">
            <div className="max-w-4xl mx-auto px-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    maxWidth: '200px',
                    background: 'var(--card-bg)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid var(--card-border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <div className="chat-loading-dot"></div>
                        <div className="chat-loading-dot"></div>
                        <div className="chat-loading-dot"></div>
                      </div>
                      <span style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                      }}>
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="chat-input-sticky" style={{
            borderTop: '1px solid var(--card-border)',
            background: 'var(--bg-primary)',
            padding: '1rem 0',
            position: 'sticky',
            bottom: '0'
          }}>
            <div className="max-w-4xl mx-auto px-4">
              <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatPortfolio 