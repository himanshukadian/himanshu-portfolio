# Scheduling Agent - Automatic Follow-up Call Scheduling

## Overview

The Scheduling Agent is an intelligent AI system that automatically detects when visitors might be interested in scheduling a meeting and provides seamless scheduling capabilities directly within the portfolio chat interface.

## Features

### 🤖 AI-Powered Intent Detection
- **Conversation Analysis**: Analyzes chat context to detect meeting interest
- **Intent Classification**: Categorizes meetings into different types
- **Smart Triggers**: Identifies optimal moments to suggest scheduling
- **Confidence Scoring**: Only suggests when confident about user intent

### 📅 Meeting Types
1. **Technical Discussion** (45 min)
   - Code review, architecture discussions
   - Tech stack conversations
   - System design sessions

2. **Collaboration** (30 min)
   - Project partnerships
   - Startup discussions
   - Team collaboration

3. **Interview** (60 min)
   - Job opportunities
   - Role discussions
   - Technical interviews

4. **Mentoring** (30 min)
   - Career guidance
   - Learning path advice
   - Skill development

5. **General** (30 min)
   - General discussions
   - Getting to know each other

### ⚡ Smart Scheduling Features
- **Available Slots**: Next 14 days, working hours (9 AM - 6 PM IST)
- **Urgency Detection**: Prioritizes slots based on urgency keywords
- **Auto-Agenda**: Generates meeting agendas based on conversation context
- **Time Zone Handling**: All times in Asia/Kolkata timezone
- **Conflict Prevention**: Checks availability (expandable to calendar integration)

## Technical Architecture

### Backend Components

#### 1. SchedulingAgent Class
```javascript
// Core scheduling intelligence
class SchedulingAgent {
  // Intent analysis with keyword matching
  analyzeMeetingIntent(conversationHistory, currentMessage)
  
  // Smart slot generation and recommendation
  generateAvailableSlots()
  recommendSlots(intent, urgency)
  
  // Dynamic agenda creation
  generateMeetingAgenda(intent, conversationContext)
}
```

#### 2. API Endpoints
```
POST /api/scheduling/suggest
- Analyzes conversation for meeting suggestions
- Returns meeting type, confidence, slots, agenda

POST /api/scheduling/schedule  
- Books a meeting with user details
- Sends confirmation emails
- Creates calendar events

GET /api/scheduling/slots
- Returns available time slots
- Filtered by meeting type and days

GET /api/scheduling/health
- Health check for scheduling service
```

#### 3. Rate Limiting
- **Suggestions**: 10 requests per 5 minutes
- **Scheduling**: 5 requests per 15 minutes
- **Slot Queries**: Unlimited (cached)

### Frontend Components

#### 1. Enhanced AI Service
```javascript
// New scheduling methods in aiService
checkMeetingSuggestion(userQuery, chatHistory)
getAvailableSlots(meetingType)
scheduleMeeting(meetingData)
shouldSuggestMeeting(query, history, response)
```

#### 2. SchedulingWidget Component
- **Multi-step Interface**: Suggestion → Slots → Details → Confirmation
- **Responsive Design**: Works on mobile and desktop
- **Real-time Validation**: Form validation and error handling
- **Smooth Animations**: Enhanced user experience

#### 3. ChatWidget Integration
- **Automatic Triggers**: Shows scheduling widget based on AI suggestions
- **Contextual Awareness**: Integrates seamlessly with chat flow
- **Success Feedback**: Adds confirmation messages to chat

## Usage Workflow

### 1. Conversation Monitoring
```
User: "I'd love to discuss your AI projects in detail"
AI: "I'd be happy to share more about my AI work..."
→ Agent detects technical discussion interest
```

### 2. Intent Analysis
```javascript
{
  intent: "technical_discussion",
  confidence: 0.8,
  suggestedDuration: 45,
  description: "Technical Discussion & Code Review",
  urgency: "normal"
}
```

### 3. Automatic Suggestion
```
AI Response: "...📅 Based on our conversation, I'd love to 
schedule a Technical Discussion & Code Review to dive 
deeper into this topic. I have some time slots available - 
would any of these work for you?"

→ Scheduling widget appears
```

### 4. Slot Selection & Booking
- User selects preferred time slot
- Fills contact details and optional message
- Confirms booking
- Receives email confirmation

## Trigger Conditions

### Meeting Keywords
- `discuss`, `call`, `meeting`, `interview`, `talk`
- `collaboration`, `project`, `work together`
- `hire`, `job`, `opportunity`, `position`
- `technical discussion`, `code review`
- `mentoring`, `guidance`, `help`

### Context Requirements
- **Conversation Depth**: At least 3 back-and-forth exchanges
- **Interest Indicators**: "interested", "tell me more", "learn about"
- **Professional Context**: Work, experience, skills, projects
- **Time Limits**: Won't suggest again for 5 minutes

### Confidence Thresholds
- **High Confidence (>0.7)**: Direct meeting requests
- **Medium Confidence (>0.3)**: Context-based suggestions
- **Low Confidence (<0.3)**: No suggestion triggered

## Configuration

### Environment Variables
```bash
# Backend .env
MISTRAL_API_KEY=your_mistral_key
MEETING_PLATFORM_URL=https://meet.google.com
FRONTEND_URL=http://localhost:3000

# Frontend .env
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Customizable Settings
```javascript
// Meeting types and durations
this.meetingTypes = {
  'technical_discussion': { duration: 45, ... },
  'collaboration': { duration: 30, ... },
  // ... customizable
}

// Available time slots
generateAvailableSlots() {
  // Working hours: 9 AM to 6 PM IST
  // Next 14 days
  // Skip weekends
}
```

## Integration Points

### Calendar Services (Future)
- Google Calendar API
- Calendly integration
- Outlook calendar
- Apple Calendar

### Email Services
- Currently: Console logging + basic confirmation
- Future: Real calendar invites, reminders

### CRM Integration (Future)
- Contact management
- Meeting history tracking
- Follow-up automation

## Security Features

- **Input Validation**: All user inputs sanitized
- **Rate Limiting**: Prevents abuse and spam
- **CORS Protection**: Restricted origins
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input escaping

## Testing

### Manual Testing
```javascript
// Development helpers (console)
window.resetChatWidget() // Clear chat state
window.clearChatHistory() // Clear messages only

// Test conversation flows
"I'm interested in your AI projects" → Should suggest technical discussion
"I'd like to collaborate on a project" → Should suggest collaboration meeting
"Are you available for an interview?" → Should suggest interview meeting
```

### API Testing
```bash
# Test suggestion endpoint
curl -X POST http://localhost:5000/api/scheduling/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "currentMessage": "I want to discuss your projects",
    "conversationHistory": [...]
  }'

# Test available slots
curl http://localhost:5000/api/scheduling/slots?meetingType=technical_discussion
```

## Performance Optimizations

### Backend
- **Slot Caching**: Available slots cached for 1 hour
- **Rate Limiting**: Prevents server overload
- **Async Processing**: Non-blocking operations
- **Error Handling**: Graceful fallbacks

### Frontend
- **Lazy Loading**: Scheduling widget loads on demand
- **Debounced Requests**: Prevents excessive API calls
- **Progressive Enhancement**: Works without JavaScript
- **Responsive Design**: Mobile-optimized

## Analytics & Insights

### Metrics Tracked
- Meeting suggestion frequency
- Conversion rates by meeting type
- Popular time slots
- User engagement patterns
- Bounce rates after suggestions

### Future Enhancements
- A/B testing for suggestion timing
- Machine learning for better intent detection
- Personalized slot recommendations
- Historical conversation analysis

## Best Practices

### For Developers
1. **Test Thoroughly**: Use development helpers
2. **Monitor Logs**: Check console for debugging
3. **Handle Errors**: Always have fallbacks
4. **Validate Inputs**: Sanitize all user data
5. **Respect Rate Limits**: Don't exceed API quotas

### For Users
1. **Clear Communication**: Be specific about meeting needs
2. **Provide Context**: Share relevant background
3. **Confirm Details**: Double-check time zones
4. **Be Responsive**: Check email for confirmations

## Troubleshooting

### Common Issues
1. **No Suggestions Appearing**
   - Check conversation depth (3+ exchanges)
   - Verify meeting keywords in context
   - Check rate limiting status
   - Ensure backend is running

2. **Scheduling Fails**
   - Validate form inputs
   - Check network connectivity
   - Verify backend API status
   - Check console for errors

3. **Wrong Time Zone**
   - All times are IST (Asia/Kolkata)
   - User can see timezone in slot display
   - Confirmation email includes timezone

### Debug Commands
```javascript
// Check AI service status
aiService.getModelStatus()

// Check last meeting suggestion
aiService.getLastMeetingSuggestion()

// Clear suggestion state
aiService.clearMeetingSuggestion()
```

## Future Roadmap

### Phase 1 (Current)
- ✅ Basic scheduling agent
- ✅ Intent detection
- ✅ Frontend integration
- ✅ Email confirmations

### Phase 2 (Next)
- [ ] Calendar API integration
- [ ] Real meeting links (Zoom/Meet)
- [ ] SMS confirmations
- [ ] Meeting reminders

### Phase 3 (Future)
- [ ] Video call integration
- [ ] Meeting recordings
- [ ] Follow-up automation
- [ ] Analytics dashboard

### Phase 4 (Advanced)
- [ ] AI-powered rescheduling
- [ ] Multi-language support
- [ ] Team scheduling
- [ ] Integration marketplace

## Support

For issues or questions:
1. Check console logs for errors
2. Verify environment configuration
3. Test with development helpers
4. Contact: himanshu.c.official@gmail.com

---

**Built with** ❤️ **by Himanshu Chaudhary**
**Part of the AI-powered portfolio ecosystem** 