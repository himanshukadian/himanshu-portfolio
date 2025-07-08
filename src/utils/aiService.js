import { resumeData } from '../data/resume.js'

class AIService {
  constructor() {
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'
    this.apiEndpoint = `${this.backendUrl}/api/ai/chat`
    this.healthEndpoint = `${this.backendUrl}/api/ai/health`
    this.isModelLoaded = true // Assume backend is available
    this.modelType = 'backend-ai'
    this.fallbackToRules = false
    this.isLoading = false
    
    // Check backend health on initialization
    this.checkBackendHealth()
    
    console.log('✅ AI Assistant ready with backend API')
    console.log(`🚀 Backend URL: ${this.backendUrl}`)
  }

  // Generate AI response with scheduling suggestions
  async generateResponse(userQuery, chatHistory = []) {
    try {
      this.isLoading = true
      
      let response
      
      // First get the AI response
      if (this.isModelLoaded && !this.fallbackToRules) {
        response = await this.generateAPIResponse(userQuery, chatHistory)
      } else {
        response = this.generateRuleBasedResponse(userQuery)
      }

      // Check if we should suggest a meeting
      const shouldCheckMeeting = this.shouldSuggestMeeting(userQuery, chatHistory, response)
      
      if (shouldCheckMeeting) {
        try {
          const meetingSuggestion = await this.checkMeetingSuggestion(userQuery, chatHistory)
          if (meetingSuggestion && meetingSuggestion.shouldSuggest) {
            response += `\n\n📅 ${meetingSuggestion.autoMessage}`
            
            // Store meeting suggestion for frontend to display
            this.lastMeetingSuggestion = meetingSuggestion
          }
        } catch (error) {
          console.error('Meeting suggestion failed:', error)
          // Don't fail the main response if meeting suggestion fails
        }
      }

      return response
    } catch (error) {
      console.error('AI response generation failed:', error)
      return this.generateRuleBasedResponse(userQuery)
    } finally {
      this.isLoading = false
    }
  }

  async generateAPIResponse(userQuery, chatHistory = []) {
    console.log('🔥 Sending request to backend AI API...')
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userQuery,
          chatHistory: chatHistory
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(`Backend API request failed: ${response.status} - ${errorData.message}`)
      }

      const data = await response.json()
      const aiResponse = data.data?.response
      
      if (!aiResponse) {
        throw new Error('No response received from backend')
      }
      
      console.log('🤖 Backend AI Response:', aiResponse.substring(0, 100) + '...')
      
      return aiResponse
      
    } catch (error) {
      console.error('Backend AI response generation failed:', error)
      console.log('🔄 Falling back to rule-based response')
      return this.generateRuleBasedResponse(userQuery)
    }
  }

  generateRuleBasedResponse(query) {
    console.log(`🔧 Rule-based processing: "${query}"`)
    const lowerQuery = query.toLowerCase().trim()

    // COMPREHENSIVE QUERY MATCHING - Handle ALL possible variations

    // 1. MOBEOLOGY/MOBELOGY QUERIES (any variation)
    if (lowerQuery.includes('mobeology') || lowerQuery.includes('mobelogy') || 
        (lowerQuery.includes('mobeo') || lowerQuery.includes('mobel'))) {
      const mobeologyExp = resumeData.experience.find(exp => exp.company === 'Mobeology Communications')
      return `My work at Mobeology Communications! 📱\n\n**Role:** ${mobeologyExp.role}\n**Duration:** ${mobeologyExp.duration}\n**Location:** ${mobeologyExp.location}\n\n**What I did:**\n${mobeologyExp.highlights.map(h => `• ${h}`).join('\n')}\n\nThis was where I worked on analytics and publisher dashboards!`
    }

    // 2. ALL PROJECTS QUERIES
    if (lowerQuery.includes('all') && lowerQuery.includes('project') ||
        lowerQuery.includes('your project') || 
        lowerQuery.includes('what project') ||
        lowerQuery.includes('list project') ||
        lowerQuery.match(/projects?\?*$/)) {
      
      let allProjects = `Here are ALL my projects! 🚀\n\n**🏢 WORK PROJECTS:**\n\n`
      
      // Add work projects from each company
      resumeData.experience.forEach(exp => {
        allProjects += `**At ${exp.company}:**\n${exp.highlights.map(h => `• ${h}`).join('\n')}\n\n`
      })
      
      allProjects += `**🛠️ PERSONAL PROJECTS:**\n\n`
      resumeData.projects.forEach(proj => {
        allProjects += `**${proj.name}:**\n• Technologies: ${proj.technologies.join(', ')}\n• ${proj.description}\n\n`
      })
      
      return allProjects.trim()
    }

    // 3. WAYFAIR QUERIES
    if (lowerQuery.includes('wayfair')) {
      const wayfairExp = resumeData.experience.find(exp => exp.company === 'Wayfair')
      return `My work at Wayfair! 🏠\n\n**Role:** ${wayfairExp.role}\n**Duration:** ${wayfairExp.duration}\n**Location:** ${wayfairExp.location}\n\n**Key Projects:**\n${wayfairExp.highlights.map(h => `• ${h}`).join('\n')}`
    }

    // 4. AMAZON QUERIES  
    if (lowerQuery.includes('amazon')) {
      const amazonExp = resumeData.experience.find(exp => exp.company === 'Amazon')
      return `My work at Amazon! 📦\n\n**Role:** ${amazonExp.role}\n**Duration:** ${amazonExp.duration}\n**Location:** ${amazonExp.location}\n\n**Key Projects:**\n${amazonExp.highlights.map(h => `• ${h}`).join('\n')}`
    }

    // 5. WORK/EXPERIENCE QUERIES
    if (lowerQuery.includes('work') || lowerQuery.includes('experience') || 
        lowerQuery.includes('job') || lowerQuery.includes('career')) {
      return `My work experience! 💼\n\n${resumeData.experience.map((exp, index) => 
        `**${index + 1}. ${exp.company}** (${exp.duration})\n🏷️ Role: ${exp.role}\n📍 Location: ${exp.location}\n\n**Key achievements:**\n${exp.highlights.map(h => `• ${h}`).join('\n')}\n`
      ).join('\n')}`
    }

    // 6. SKILLS/TECH QUERIES
    if (lowerQuery.includes('skill') || lowerQuery.includes('tech') || 
        lowerQuery.includes('language') || lowerQuery.includes('technology')) {
      return `My technical skills! 🛠️\n\n**Programming Languages:** ${resumeData.skills.languages.join(', ')}\n\n**Technologies:** ${resumeData.skills.technologies.join(', ')}\n\n**Developer Tools:** ${resumeData.skills.developerTools.join(', ')}\n\n**Databases:** ${resumeData.skills.databases.join(', ')}\n\n**Other Skills:** ${resumeData.skills.others.join(', ')}`
    }

    // 7. AI/ML QUERIES
    if (lowerQuery.includes('ai') || lowerQuery.includes('artificial') || 
        lowerQuery.includes('machine learning') || lowerQuery.includes('voyager')) {
      const aiWork = resumeData.experience[0].highlights.find(h => h.includes('AI') || h.includes('Voyager'))
      return `My AI experience! 🤖\n\n**AI Project at Wayfair:**\n• ${aiWork}\n\n**AI Technologies:** AI/GenAI (from my skills)\n\n**AI in Personal Projects:**\n• Used NLP in Grievance Portal\n\nI'm passionate about building practical AI solutions that solve real business problems!`
    }

    // 8. EDUCATION QUERIES
    if (lowerQuery.includes('education') || lowerQuery.includes('study') || 
        lowerQuery.includes('degree') || lowerQuery.includes('university') || 
        lowerQuery.includes('college') || lowerQuery.includes('school')) {
      return `My education! 🎓\n\n${resumeData.education.map((edu, index) => 
        `**${index + 1}. ${edu.institution}**\n📜 Degree: ${edu.degree}\n📅 Year: ${edu.year}\n${edu.achievements ? `🏆 Achievements: ${edu.achievements.join(', ')}\n` : ''}`
      ).join('\n')}\n**Additional Achievements:**\n${resumeData.achievements.filter(a => a.includes('School') || a.includes('Class')).map(a => `• ${a}`).join('\n')}`
    }

    // 9. CONTACT QUERIES
    if (lowerQuery.includes('contact') || lowerQuery.includes('email') || 
        lowerQuery.includes('reach') || lowerQuery.includes('phone') || 
        lowerQuery.includes('linkedin') || lowerQuery.includes('github')) {
      return `Contact me! 📞\n\n📧 **Email:** ${resumeData.email}\n📱 **Phone:** ${resumeData.phone}\n💼 **LinkedIn:** ${resumeData.linkedin}\n💻 **GitHub:** ${resumeData.github}\n📍 **Location:** ${resumeData.location}\n\nAlways happy to connect and discuss opportunities!`
    }

    // 10. PERSONAL PROJECTS ONLY
    if (lowerQuery.includes('personal project') || lowerQuery.includes('side project') ||
        (lowerQuery.includes('project') && !lowerQuery.includes('work') && !lowerQuery.includes('all'))) {
      return `My personal projects! 🛠️\n\n${resumeData.projects.map((proj, index) => 
        `**${index + 1}. ${proj.name}**\n🔧 Technologies: ${proj.technologies.join(', ')}\n📝 Description: ${proj.description}\n`
      ).join('\n')}`
    }

    // 11. ABOUT/SUMMARY QUERIES
    if (lowerQuery.includes('about') || lowerQuery.includes('summary') || 
        lowerQuery.includes('tell me') || lowerQuery.includes('who are') ||
        lowerQuery.includes('what do you do') || lowerQuery.includes('introduce')) {
      return `About me! 👋\n\n${resumeData.summary}\n\n**Current Role:** ${resumeData.title} at ${resumeData.experience[0].company}\n**Location:** Living in ${resumeData.location}, working in ${resumeData.experience[0].location}\n\n**Quick Facts:**\n• 3+ years of experience\n• Specializing in Java & Spring Boot\n• AI enthusiast\n• Love building scalable solutions!`
    }

    // 12. ACHIEVEMENTS QUERIES
    if (lowerQuery.includes('achievement') || lowerQuery.includes('award') || 
        lowerQuery.includes('recognition') || lowerQuery.includes('topper')) {
      return `My achievements! 🏆\n\n${resumeData.achievements.map(achievement => `• ${achievement}`).join('\n')}\n\nI've been consistent in academic excellence and leadership throughout my journey!`
    }

    // 13. CATCH-ALL FOR UNMATCHED QUERIES
    console.log(`⚠️ No specific pattern matched for: "${query}"`)
    return `Hi! I'm ${resumeData.name}, a ${resumeData.title} 👋\n\nI can tell you about:\n• **Work experience** (Wayfair, Amazon, Mobeology Communications)\n• **Technical skills** (${resumeData.skills.languages.slice(0,3).join(', ')}, etc.)\n• **All my projects** (work + personal)\n• **Education** (NIT Warangal, University of Delhi)\n• **Contact information**\n\nWhat specifically would you like to know? Try asking about any of these topics!`
  }

  // Check if conversation context suggests scheduling a meeting
  shouldSuggestMeeting(userQuery, chatHistory, aiResponse) {
    console.log('🔍 Checking meeting suggestion for query:', userQuery)
    
    // Don't suggest if we already suggested recently
    if (this.lastMeetingSuggestion && 
        Date.now() - this.lastMeetingSuggestion.timestamp < 300000) { // 5 minutes
      console.log('❌ Not suggesting - recently suggested')
      return false
    }
    
    // Let the LLM decide by always checking if conversation warrants a meeting
    // The backend AI will analyze context and determine if meeting is appropriate
    console.log('✅ Checking with LLM for meeting suggestion')
    return true
  }

  // Call the scheduling agent to get meeting suggestion
  async checkMeetingSuggestion(userQuery, chatHistory) {
    try {
      const response = await fetch(`${this.backendUrl}/api/scheduling/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentMessage: userQuery,
          conversationHistory: chatHistory,
          userContext: {
            timestamp: Date.now(),
            source: 'portfolio_chat'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Scheduling API failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status === 'success' && data.data.shouldSuggest) {
        data.data.timestamp = Date.now()
        return data.data
      }
      
      return null
    } catch (error) {
      console.error('Meeting suggestion API failed:', error)
      return null
    }
  }

  // Get available time slots
  async getAvailableSlots(meetingType = 'general') {
    try {
      const response = await fetch(`${this.backendUrl}/api/scheduling/slots?meetingType=${meetingType}`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`Slots API failed: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Get slots API failed:', error)
      return null
    }
  }

  // Schedule a meeting
  async scheduleMeeting(meetingData) {
    try {
      const response = await fetch(`${this.backendUrl}/api/scheduling/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(`Schedule API failed: ${response.status} - ${errorData.message}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Schedule meeting API failed:', error)
      throw error
    }
  }

  // Get the last meeting suggestion
  getLastMeetingSuggestion() {
    return this.lastMeetingSuggestion
  }

  // Clear meeting suggestion
  clearMeetingSuggestion() {
    this.lastMeetingSuggestion = null
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(this.healthEndpoint, { method: 'GET' });
      if (response.ok) {
        console.log('✅ Backend API is healthy.');
      } else {
        console.warn('⚠️ Backend API is not responding or unhealthy. Falling back to rule-based responses.');
        this.isModelLoaded = false;
        this.fallbackToRules = true;
      }
    } catch (error) {
      console.error('Error checking backend health:', error);
      console.warn('⚠️ Backend API is not responding or unhealthy. Falling back to rule-based responses.');
      this.isModelLoaded = false;
      this.fallbackToRules = true;
    }
  }

  getModelStatus() {
    return {
      isLoading: false,
      isModelLoaded: this.isModelLoaded,
      modelType: this.modelType,
      fallbackToRules: this.fallbackToRules,
      isReady: true
    }
  }

  setRuleBasedMode() {
    this.fallbackToRules = true
    this.modelType = 'rules'
  }

  setLocalAPIMode() {
    this.fallbackToRules = false
    this.modelType = 'mistral-api'
  }

  setMistralAPIMode() {
    this.fallbackToRules = false
    this.modelType = 'mistral-api'
  }
}

// Create singleton instance
export const aiService = new AIService()

// Legacy export for backward compatibility
export const generateResponse = (query) => {
  return aiService.generateResponse(query)
} 