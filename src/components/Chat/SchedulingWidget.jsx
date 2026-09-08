import React, { useState, useEffect } from 'react'
import { FaCalendarAlt, FaCheck, FaEnvelope, FaQuestion } from 'react-icons/fa'

const MONO = "'Fira Code', monospace"
const GREEN = '#00ff41'
const DIM = 'rgba(255,255,255,0.5)'
const FAINT = 'rgba(255,255,255,0.3)'
const BORDER = 'rgba(0,255,65,0.25)'
const BORDER_DIM = 'rgba(0,255,65,0.12)'

const stepLabels = {
  slots: 'select_slot()',
  details: 'enter_details()',
  confirmation: 'confirmed()',
  question: 'input.required()'
}

const buttonStyle = {
  background: 'transparent',
  border: `1px solid ${BORDER}`,
  borderRadius: '4px',
  color: GREEN,
  cursor: 'pointer',
  padding: '8px 16px',
  fontSize: '12px',
  fontWeight: 400,
  fontFamily: MONO,
  letterSpacing: '0.08em',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px'
}

const buttonHover = (e, hover = true) => {
  e.currentTarget.style.background = hover ? 'rgba(0,255,65,0.08)' : 'transparent'
  e.currentTarget.style.borderColor = hover ? GREEN : BORDER
}

const inputStyle = {
  width: '100%',
  background: 'rgba(0,255,65,0.04)',
  border: `1px solid ${BORDER_DIM}`,
  borderRadius: '4px',
  padding: '8px 10px',
  color: '#ffffff',
  fontSize: '12px',
  fontFamily: MONO,
  outline: 'none',
  caretColor: GREEN,
  transition: 'all 0.2s ease'
}

const SchedulingWidget = ({ aiService, show, onHide, meetingSuggestion = null, onMeetingScheduled, mode = 'schedule', question = null, onAnswer = null, inline = false }) => {
  const [currentStep, setCurrentStep] = useState(mode === 'question' ? 'question' : 'slots')
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [scheduledMeeting, setScheduledMeeting] = useState(null)
  const [answered, setAnswered] = useState(false)

  const loadAvailableSlots = async () => {
    setLoading(true)
    setError('')
    try {
      const slotsData = await aiService.getAvailableSlots(meetingSuggestion?.meetingType || 'general')
      if (slotsData && Array.isArray(slotsData.availableSlots) && slotsData.availableSlots.length > 0) {
        setAvailableSlots(slotsData.availableSlots)
      } else {
        setAvailableSlots([])
        setError('No open slots right now — try the Calendly link or refresh.')
      }
    } catch (err) {
      setError('Failed to load available time slots.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (show) {
      setCurrentStep('slots')
      setSelectedSlot(null)
      setScheduledMeeting(null)
      setError('')
      loadAvailableSlots()
    }
  }, [show])

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot)
    setCurrentStep('details')
    setError('')
  }

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleScheduleMeeting = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !selectedSlot) return
    setScheduling(true)
    setError('')

    const meetingData = {
      name: formData.name,
      email: formData.email,
      message: formData.message,
      selectedSlot: selectedSlot.datetime,
      meetingType: meetingSuggestion?.meetingType || 'general',
      duration: meetingSuggestion?.duration || 30,
      agenda: meetingSuggestion?.agenda || ['General introduction call']
    }

    try {
      const result = await aiService.scheduleMeeting(meetingData)
      if (result.status === 'success') {
        setScheduledMeeting(result.data)
        setCurrentStep('confirmation')
        aiService.clearMeetingSuggestion()
        if (onMeetingScheduled) onMeetingScheduled(result.data)
      } else {
        setError(result.message || 'Failed to schedule meeting')
      }
    } catch (err) {
      setError('Failed to schedule meeting. Please try again.')
    } finally {
      setScheduling(false)
    }
  }

  const resetWidget = () => {
    setCurrentStep(mode === 'question' ? 'question' : 'slots')
    setSelectedSlot(null)
    setFormData({ name: '', email: '', message: '' })
    setScheduledMeeting(null)
    setAnswered(false)
    setError('')
  }

  const handleClose = () => {
    resetWidget()
    onHide()
  }

  const handleAnswer = (value) => {
    setAnswered(true)
    if (onAnswer) onAnswer(value)
    setTimeout(() => handleClose(), 800)
  }

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      })
    } catch (e) {
      return dateString
    }
  }

  const meetingIcon = (meetingSuggestion?.meetingType || 'general') === 'general' ? (
    <FaEnvelope style={{ color: GREEN, marginRight: '8px' }} />
  ) : (
    <FaCalendarAlt style={{ color: GREEN, marginRight: '8px' }} />
  )

  const modeIcon = mode === 'question' ? (
    <FaQuestion style={{ color: GREEN, marginRight: '8px' }} />
  ) : (
    (meetingSuggestion?.meetingType || 'general') === 'general' ? (
      <FaEnvelope style={{ color: GREEN, marginRight: '8px' }} />
    ) : (
      <FaCalendarAlt style={{ color: GREEN, marginRight: '8px' }} />
    )
  )

  if (!show) return null

  const cardStyle = {
    width: inline ? '100%' : 'min(480px, 100%)',
    maxHeight: inline ? '360px' : '620px',
    background: '#000000',
    borderRadius: '4px',
    boxShadow: inline ? 'none' : '0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,255,65,0.15)',
    border: `1px solid ${inline ? BORDER_DIM : BORDER}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: MONO
  }

  const cardContent = (
    <div style={cardStyle}>
        {/* header */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${BORDER}`,
            flexShrink: 0,
            background: '#000000'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'rgba(0,255,65,0.5)' }} />
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'rgba(0,255,65,0.25)' }} />
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'rgba(0,255,65,0.12)' }} />
          </div>
          <div style={{ color: GREEN, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {modeIcon} {'>'} {stepLabels[currentStep] || 'schedule()'}
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: `1px solid ${BORDER_DIM}`,
              borderRadius: '4px',
              color: DIM,
              fontSize: '12px',
              cursor: 'pointer',
              padding: '2px 8px',
              fontFamily: MONO
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ff5f56'; e.currentTarget.style.borderColor = 'rgba(255,95,86,0.4)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = DIM; e.currentTarget.style.borderColor = BORDER_DIM }}
            aria-label="Close scheduling widget"
          >
            [x]
          </button>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '18px 16px' }}>
          {error && (
            <div style={{
              background: 'rgba(255,0,0,0.08)',
              color: '#ff5f56',
              borderRadius: '4px',
              border: '1px solid rgba(255,0,0,0.25)',
              padding: '8px 10px',
              fontSize: '11px',
              marginBottom: '14px',
              fontFamily: MONO
            }}>
              {'>'} error: {error}
            </div>
          )}

          {/* Question mode */}
          {mode === 'question' && question && currentStep === 'question' && (
            <div>
              <p style={{ color: GREEN, fontSize: '12px', margin: '0 0 14px 0', fontFamily: MONO, lineHeight: 1.5 }}>
                {'>'} {question.prompt}
              </p>
              {question.options && question.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => handleAnswer(opt.value)}
                  style={{
                    ...buttonStyle,
                    width: '100%',
                    textAlign: 'left',
                    marginBottom: '6px',
                    opacity: answered ? 0.4 : 1,
                    cursor: answered ? 'not-allowed' : 'pointer',
                    color: answered ? DIM : GREEN
                  }}
                  onMouseEnter={(e) => !answered && buttonHover(e, true)}
                  onMouseLeave={(e) => !answered && buttonHover(e, false)}
                >
                  <span style={{ color: FAINT, fontSize: '11px' }}>[{String.fromCharCode(65 + i)}]</span> {opt.label}
                </button>
              ))}
              {answered && (
                <p style={{ color: GREEN, fontSize: '11px', margin: '12px 0 0 0', fontFamily: MONO }}>
                  {'>'} received.
                </p>
              )}
            </div>
          )}

          {/* Step: slots */}
          {currentStep === 'slots' && (
            <div>
              <p style={{ color: DIM, fontSize: '11px', margin: '0 0 12px 0', fontFamily: MONO }}>
                {'>'} pick an open slot (IST)
              </p>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                    <div className="chat-loading-dot" />
                    <div className="chat-loading-dot" />
                    <div className="chat-loading-dot" />
                  </div>
                  <p style={{ color: DIM, fontSize: '11px', marginTop: '10px', fontFamily: MONO }}>
                    loading.calendar()
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {availableSlots.slice(0, 8).map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      style={{
                        background: 'rgba(0,255,65,0.03)',
                        border: `1px solid ${BORDER_DIM}`,
                        borderRadius: '4px',
                        padding: '10px 8px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        fontFamily: MONO
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = GREEN
                        e.currentTarget.style.background = 'rgba(0,255,65,0.07)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = BORDER_DIM
                        e.currentTarget.style.background = 'rgba(0,255,65,0.03)'
                      }}
                    >
                      <div style={{ color: GREEN, fontSize: '10px', marginBottom: '4px' }}>
                        {'>>'}
                      </div>
                      <div style={{ fontSize: '11px', lineHeight: '1.4' }}>{slot.display}</div>
                      <div style={{ color: FAINT, fontSize: '9px', marginTop: '4px' }}>
                        {slot.timezone || 'IST'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!loading && availableSlots.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <button style={buttonStyle} onMouseEnter={(e) => buttonHover(e, true)} onMouseLeave={(e) => buttonHover(e, false)} onClick={loadAvailableSlots}>
                    {'>>'} refresh
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step: details */}
          {currentStep === 'details' && selectedSlot && (
            <div>
              <div style={{
                background: 'rgba(0,255,65,0.04)',
                border: `1px solid ${BORDER_DIM}`,
                borderRadius: '4px',
                padding: '10px 12px',
                marginBottom: '14px',
                fontFamily: MONO
              }}>
                <div style={{ color: DIM, fontSize: '10px', marginBottom: '4px' }}>selected_time:</div>
                <div style={{ color: GREEN, fontSize: '12px' }}>
                  {'>'} {formatDateTime(selectedSlot.datetime)}
                </div>
              </div>

              <form onSubmit={handleScheduleMeeting}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ color: DIM, fontSize: '11px', marginBottom: '6px', display: 'block', fontFamily: MONO }}>
                    {'>'} name:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    placeholder="your name"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ color: DIM, fontSize: '11px', marginBottom: '6px', display: 'block', fontFamily: MONO }}>
                    {'>'} email:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="you@example.com"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ color: DIM, fontSize: '11px', marginBottom: '6px', display: 'block', fontFamily: MONO }}>
                    {'>'} notes: (optional)
                  </label>
                  <textarea
                    rows={3}
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    placeholder="topics you'd like to cover..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    style={buttonStyle}
                    onMouseEnter={(e) => buttonHover(e, true)}
                    onMouseLeave={(e) => buttonHover(e, false)}
                    onClick={() => setCurrentStep('slots')}
                  >
                    {'<'}- back
                  </button>
                  <button
                    type="submit"
                    disabled={scheduling}
                    style={{ ...buttonStyle, opacity: scheduling ? 0.6 : 1, cursor: scheduling ? 'not-allowed' : 'pointer' }}
                    onMouseEnter={(e) => buttonHover(e, true)}
                    onMouseLeave={(e) => buttonHover(e, false)}
                  >
                    {scheduling ? (
                      <>
                        <span className="chat-loading-dot" /> scheduling...
                      </>
                    ) : (
                      <>
                        <FaCheck style={{ fontSize: '12px' }} /> {'>>'} confirm booking
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step: confirmation */}
          {currentStep === 'confirmation' && scheduledMeeting && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: scheduledMeeting.strategy === 'calendly' ? GREEN : '#ffb020', fontSize: '28px' }}>
                {scheduledMeeting.strategy === 'calendly' ? <FaCheck /> : <FaCalendarAlt />}
              </div>
              <h4 style={{ color: scheduledMeeting.strategy === 'calendly' ? GREEN : '#ffb020', fontSize: '14px', margin: '12px 0 16px 0', fontFamily: MONO }}>
                {'>'} {scheduledMeeting.strategy === 'calendly' ? 'meeting.scheduled()' : 'book.now()'}
              </h4>

              <div style={{
                background: 'rgba(0,255,65,0.04)',
                border: `1px solid ${BORDER_DIM}`,
                borderRadius: '4px',
                padding: '12px',
                textAlign: 'left',
                marginBottom: '12px',
                fontFamily: MONO
              }}>
                {scheduledMeeting.strategy === 'calendly' && (
                  <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: FAINT }}>id:</span> <span style={{ color: DIM }}>{scheduledMeeting.meetingId || 'pending'}</span>
                  </div>
                )}
                <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: FAINT }}>time:</span> <span style={{ color: DIM }}>{formatDateTime(scheduledMeeting.scheduledTime)}</span>
                </div>
                {scheduledMeeting.meetingLink && (
                  <div style={{ fontSize: '11px' }}>
                    <span style={{ color: FAINT }}>{scheduledMeeting.strategy === 'calendly' ? 'link:' : 'open:'}</span>{' '}
                    <a
                      href={scheduledMeeting.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: GREEN, wordBreak: 'break-all' }}
                    >
                      {scheduledMeeting.strategy === 'calendly' ? scheduledMeeting.meetingLink : 'calendly.com/himanshu-c-official/30min'}
                    </a>
                  </div>
                )}
                {scheduledMeeting.strategy !== 'calendly' && (
                  <div style={{ fontSize: '11px', marginTop: '4px' }}>
                    <span style={{ color: FAINT }}>status:</span>{' '}
                    <span style={{ color: '#ffb020' }}>Calendly busy — pick your slot at the link above</span>
                  </div>
                )}
              </div>

              <p style={{ color: DIM, fontSize: '11px', margin: '0 0 14px 0', fontFamily: MONO }}>
                {'>'} {scheduledMeeting.strategy === 'calendly' ? 'confirmation email on its way' : 'direct booking — confirmation arrives by email'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <button style={buttonStyle} onMouseEnter={(e) => buttonHover(e, true)} onMouseLeave={(e) => buttonHover(e, false)} onClick={handleClose}>
                  done
                </button>
                <button
                  style={{ ...buttonStyle, color: DIM, borderColor: BORDER_DIM }}
                  onMouseEnter={(e) => buttonHover(e, true)}
                  onMouseLeave={(e) => buttonHover(e, false)}
                  onClick={resetWidget}
                >
                  schedule another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )

    if (inline) {
      return (
        <div style={{
          width: '100%',
          marginBottom: '14px',
          fontFamily: MONO
        }}>
          {cardContent}
        </div>
      )
    }

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.78)',
          backdropFilter: 'blur(2px)',
          zIndex: 10020,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) handleClose()
        }}
      >
{cardContent}
      </div>
    )
}

export default SchedulingWidget