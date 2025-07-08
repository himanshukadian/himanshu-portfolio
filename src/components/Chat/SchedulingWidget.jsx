import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Alert, Card, Badge, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaCheck } from 'react-icons/fa';

const SchedulingWidget = ({ 
  aiService, 
  show, 
  onHide, 
  meetingSuggestion = null,
  onMeetingScheduled 
}) => {
  const [currentStep, setCurrentStep] = useState('suggestion'); // suggestion, slots, details, confirmation
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [scheduledMeeting, setScheduledMeeting] = useState(null);

  // Load available slots when component mounts or meeting type changes
  useEffect(() => {
    if (show && meetingSuggestion && currentStep === 'slots') {
      loadAvailableSlots(meetingSuggestion.meetingType);
    }
  }, [show, meetingSuggestion, currentStep]); // loadAvailableSlots is defined inside component, stable reference

  const loadAvailableSlots = async (meetingType) => {
    setLoading(true);
    setError('');
    
    try {
      const slotsData = await aiService.getAvailableSlots(meetingType);
      if (slotsData && slotsData.availableSlots) {
        setAvailableSlots(slotsData.availableSlots);
      } else {
        setError('No available slots found. Please try again later.');
      }
    } catch (err) {
      setError('Failed to load available time slots.');
      console.error('Failed to load slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setCurrentStep('details');
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const meetingData = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        selectedSlot: selectedSlot.datetime,
        meetingType: meetingSuggestion.meetingType,
        duration: meetingSuggestion.duration,
        agenda: meetingSuggestion.agenda
      };

      const result = await aiService.scheduleMeeting(meetingData);
      
      if (result.status === 'success') {
        setScheduledMeeting(result.data);
        setCurrentStep('confirmation');
        
        // Clear the meeting suggestion from AI service
        aiService.clearMeetingSuggestion();
        
        // Notify parent component
        if (onMeetingScheduled) {
          onMeetingScheduled(result.data);
        }
      } else {
        setError(result.message || 'Failed to schedule meeting');
      }
    } catch (err) {
      setError('Failed to schedule meeting. Please try again.');
      console.error('Failed to schedule meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetWidget = () => {
    setCurrentStep('suggestion');
    setSelectedSlot(null);
    setFormData({ name: '', email: '', message: '' });
    setScheduledMeeting(null);
    setError('');
  };

  const handleClose = () => {
    resetWidget();
    onHide();
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const getMeetingTypeIcon = (type) => {
    const icons = {
      'technical_discussion': '⚡',
      'collaboration': '🤝',
      'interview': '💼',
      'mentoring': '🎓',
      'general': '💬'
    };
    return icons[type] || '📅';
  };

  const getMeetingTypeBadgeColor = (type) => {
    const colors = {
      'technical_discussion': 'primary',
      'collaboration': 'success',
      'interview': 'warning',
      'mentoring': 'info',
      'general': 'secondary'
    };
    return colors[type] || 'secondary';
  };

  if (!meetingSuggestion) {
    return null;
  }

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg" 
      centered
      className="scheduling-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {getMeetingTypeIcon(meetingSuggestion.meetingType)} Schedule a Meeting
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Step 1: Meeting Suggestion */}
        {currentStep === 'suggestion' && (
          <div>
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="mb-0">{meetingSuggestion.description}</h5>
                  <Badge bg={getMeetingTypeBadgeColor(meetingSuggestion.meetingType)}>
                    {meetingSuggestion.meetingType.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <FaClock className="me-2" />
                  <strong>Duration:</strong> {meetingSuggestion.duration} minutes
                </div>

                <div className="mb-3">
                  <strong>Suggested Agenda:</strong>
                  <ul className="mt-2">
                    {meetingSuggestion.agenda.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <p className="text-muted mb-0">
                  {meetingSuggestion.autoMessage}
                </p>
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-between">
              <Button variant="outline-secondary" onClick={handleClose}>
                Maybe Later
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setCurrentStep('slots')}
              >
                <FaCalendarAlt className="me-2" />
                View Available Times
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Time Slot Selection */}
        {currentStep === 'slots' && (
          <div>
            <h5 className="mb-3">Select a Time Slot</h5>
            
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading available time slots...</p>
              </div>
            ) : (
              <div className="row">
                {availableSlots.slice(0, 8).map((slot, index) => (
                  <div key={index} className="col-md-6 mb-3">
                    <Card 
                      className="h-100 slot-card" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <Card.Body className="text-center">
                        <FaCalendarAlt className="mb-2 text-primary" size={20} />
                        <div className="fw-bold">{slot.display}</div>
                        <small className="text-muted">IST</small>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            )}

            <div className="d-flex justify-content-between mt-3">
              <Button 
                variant="outline-secondary" 
                onClick={() => setCurrentStep('suggestion')}
              >
                Back
              </Button>
              {availableSlots.length === 0 && !loading && (
                <Button 
                  variant="primary" 
                  onClick={() => loadAvailableSlots(meetingSuggestion.meetingType)}
                >
                  Refresh Slots
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Contact Details */}
        {currentStep === 'details' && selectedSlot && (
          <div>
            <h5 className="mb-3">Meeting Details</h5>
            
            <Card className="mb-3">
              <Card.Body>
                <div className="row">
                  <div className="col-sm-6">
                    <strong>Meeting Type:</strong><br />
                    {meetingSuggestion.description}
                  </div>
                  <div className="col-sm-6">
                    <strong>Selected Time:</strong><br />
                    {formatDateTime(selectedSlot.datetime)}
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Form onSubmit={handleScheduleMeeting}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Your full name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  placeholder="your.email@example.com"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Additional Message (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Any specific topics you'd like to discuss..."
                />
              </Form.Group>

              <div className="d-flex justify-content-between">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setCurrentStep('slots')}
                >
                  Back
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <FaCheck className="me-2" />
                      Schedule Meeting
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 'confirmation' && scheduledMeeting && (
          <div className="text-center">
            <div className="mb-4">
              <FaCheck className="text-success" size={48} />
            </div>
            
            <h4 className="text-success mb-3">Meeting Scheduled Successfully!</h4>
            
            <Card className="mb-3">
              <Card.Body>
                <div className="row">
                  <div className="col-sm-6">
                    <strong>Meeting ID:</strong><br />
                    <code>{scheduledMeeting.meetingId}</code>
                  </div>
                  <div className="col-sm-6">
                    <strong>Scheduled Time:</strong><br />
                    {formatDateTime(scheduledMeeting.scheduledTime)}
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Alert variant="info">
              📧 You'll receive a confirmation email with meeting details and calendar invite shortly.
            </Alert>

            <Button variant="primary" onClick={handleClose} className="me-2">
              Done
            </Button>
            <Button variant="outline-secondary" onClick={resetWidget}>
              Schedule Another
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SchedulingWidget; 