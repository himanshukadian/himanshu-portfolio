import { resumeData } from '../data/resume.js'
import resumeService from './resumeService.js'
import devLog from './devLog.js'

class AIService {
  constructor() {
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://himanshu-portfolio-api-e10b4543a453.herokuapp.com'
    this.apiEndpoint = `${this.backendUrl}/api/ai/chat`
    this.healthEndpoint = `${this.backendUrl}/api/ai/health`
    this.isModelLoaded = true // Assume backend is available
    this.modelType = 'backend-ai'
    this.fallbackToRules = false
    this.isLoading = false
    this.lastWritingSources = []
    
    // Check backend health on initialization
    this.checkBackendHealth()
    
    devLog('✅ AI Assistant ready with backend API')
    devLog(`🚀 Backend URL: ${this.backendUrl}`)
  }

  // Enhanced AI response with smart query categorization and routing
  async generateResponse(userQuery, chatHistory = []) {
    try {
      this.isLoading = true
      
      devLog('🎯 Smart Query Analysis:', userQuery.substring(0, 100) + '...')
      
      // Step 1: Analyze query intent and categorize
      const queryAnalysis = this.categorizeQuery(userQuery, chatHistory)
      devLog('📊 Query Category:', queryAnalysis.category, 'Confidence:', queryAnalysis.confidence)
      
      let response
      
      // Step 2: Route to appropriate specialized handler
      switch (queryAnalysis.category) {
        case 'resume_customization':
          devLog('🎯 Routing to Resume Customization Handler')
          response = await this.handleResumeQuery(userQuery, chatHistory, queryAnalysis)
          break
          
        case 'meeting_scheduling':
          devLog('📅 Routing to Meeting Scheduling Handler') 
          response = await this.handleMeetingQuery(userQuery, chatHistory, queryAnalysis)
          break
          
        case 'writing':
          devLog('✍️ Routing to Writing Handler')
          response = await this.generateWritingResponse(userQuery)
          break
          
        case 'portfolio_info':
        default:
          devLog('💼 Routing to Portfolio Information Handler')
          response = await this.handlePortfolioQuery(userQuery, chatHistory, queryAnalysis)
          break
      }
      
      // Step 3: Post-process for additional suggestions (only for portfolio queries)
      if (queryAnalysis.category === 'portfolio_info') {
        response = await this.addContextualSuggestions(response, userQuery, chatHistory)
      }

      return response
    } catch (error) {
      console.error('❌ AI response generation failed:', error)
      return this.generateFallbackResponse(userQuery, error)
    } finally {
      this.isLoading = false
    }
  }

  // Simplified query categorization - minimal pattern matching for routing only
  categorizeQuery(userQuery, chatHistory = []) {
    const query = userQuery.toLowerCase().trim()
    const queryLength = userQuery.length
    
    // Very simple routing logic - let AI handle the detailed understanding
    
    // Resume: Long queries with job-related keywords likely job descriptions
    const isLikelyJobDescription = queryLength > 100 && 
      (/job|position|role|requirements|responsibilities|candidate|hiring/i.test(userQuery) ||
       /senior|junior|lead|principal.*engineer/i.test(userQuery))
    
    const hasResumeIntent = /resume|cv|customize|tailor|apply/i.test(userQuery)
    
    // Meeting: Direct meeting/scheduling keywords  
    const hasMeetingIntent = /meet|schedule|call|discuss|talk|connect|appointment/i.test(userQuery)
    
    // Writing: Queries about articles/blog/posts/tutorials/content he has published
    const hasWritingIntent = /writing|writings|articles|article|blog|latest post|published|tutorials|tutorial|what have you written|your articles|your blog|mcp|rag|distributed systems|price ?iq|cli automation|ai agents|use tools/i.test(userQuery)
    
    // Simple scoring
    let category = 'portfolio_info' // Default
    let confidence = 0.6
    
    if (isLikelyJobDescription || hasResumeIntent) {
      category = 'resume_customization'
      confidence = 0.9
    } else if (hasMeetingIntent) {
      category = 'meeting_scheduling'  
      confidence = 0.8
    } else if (hasWritingIntent) {
      category = 'writing'
      confidence = 0.85
    }
    
    return {
      category,
      confidence,
      queryLength,
      indicators: {
        isLongQuery: queryLength > 100,
        hasJobKeywords: /job|position|role|hiring|candidate/i.test(userQuery),
        hasMeetingKeywords: /meet|call|schedule|discuss|talk/i.test(userQuery),
        hasResumeKeywords: /resume|cv|customize|tailor|apply/i.test(userQuery),
        hasWritingKeywords: /writing|articles|blog|latest post|published|tutorials|mcp|rag|distributed systems|price ?iq|cli automation|ai agents|use tools/i.test(userQuery)
      }
    }
  }

  // Specialized handler for resume customization queries - AI-powered
  async handleResumeQuery(userQuery, chatHistory, analysis) {
    try {
      devLog('🎯 Processing resume customization request with AI')
      
      // Let AI determine if this is a job description or just asking about resume services
      if (analysis.queryLength > 50) {
        // Likely a job description - process directly
        const jobDetails = {
          jobDescription: userQuery,
          companyName: '',  // Let AI extract
          jobTitle: '',     // Let AI extract  
          hasRequiredInfo: true
        }
        
        return await this.processResumeCustomization(jobDetails)
      } else {
        // Short query - use AI to generate helpful resume information
        try {
          const response = await this.generateAPIResponse(userQuery, chatHistory)
          return response
        } catch (error) {
          devLog('🔄 AI failed, using simple resume fallback')
          return this.requestJobDescription()
        }
      }
      
    } catch (error) {
      console.error('❌ Resume handler error:', error)
      return this.generateSimpleFallback(userQuery)
    }
  }

  // Specialized handler for meeting/scheduling queries - AI-powered
  async handleMeetingQuery(userQuery, chatHistory, analysis) {
    try {
      devLog('📅 Processing meeting request with AI')
      
      // First try to get AI-powered meeting suggestion
      try {
        const meetingSuggestion = await this.checkMeetingSuggestion(userQuery, chatHistory)
        if (meetingSuggestion && meetingSuggestion.shouldSuggest) {
          this.lastMeetingSuggestion = meetingSuggestion
          
          // Let AI generate the response with meeting context
          const aiResponse = await this.generateAPIResponse(userQuery, chatHistory)
          return aiResponse + `\n\n📞 ${meetingSuggestion.autoMessage}`
        }
      } catch (error) {
        devLog('🔄 Meeting API failed, using AI response only')
      }
      
      // Use AI to generate meeting response
      try {
        const response = await this.generateAPIResponse(userQuery, chatHistory)
        return response
      } catch (error) {
        devLog('🔄 AI failed, using simple meeting fallback')
        return '📅 **Let\'s Schedule a Meeting!**\n\n' +
               'I\'d love to connect! You can reach me at:\n' +
               '• Email: himanshu.c.official@gmail.com\n' +
               '• LinkedIn: https://www.linkedin.com/in/himanshucofficial/\n\n' +
               '💬 Or continue chatting here and I\'ll help coordinate a time!'
      }
      
    } catch (error) {
      console.error('❌ Meeting handler error:', error)
      return this.generateSimpleFallback(userQuery)
    }
  }

  // Specialized handler for portfolio information queries
  async handlePortfolioQuery(userQuery, chatHistory, analysis) {
    try {
      devLog('💼 Processing portfolio information request with AI')
      
      // Always try AI first - this is the primary method
      try {
        const response = await this.generateAPIResponse(userQuery, chatHistory)
        return response
      } catch (error) {
        devLog('🔄 AI failed, trying simple fallback')
        return this.generateSimpleFallback(userQuery)
      }
      
    } catch (error) {
      console.error('❌ Portfolio handler error:', error)
      return this.generateSimpleFallback(userQuery)
    }
  }

  // Specialized handler for writing/articles queries
  async generateWritingResponse(query) {
    try {
      devLog('✍️ Processing writing request with AI')
      const response = await this.generateAPIResponse(query, [])
      return response
    } catch (error) {
      devLog('🔄 AI failed for writing, using article list fallback')
    }

    try {
      const articlesResponse = await fetch(`${this.backendUrl}/api/articles`, {
        method: 'GET'
      })

      if (!articlesResponse.ok) {
        throw new Error(`Articles API failed: ${articlesResponse.status}`)
      }

      const articlesData = await articlesResponse.json()
      let articles = Array.isArray(articlesData) ? articlesData : articlesData.payload?.articles

      if (!Array.isArray(articles) || articles.length === 0) {
        throw new Error('No articles found')
      }

      articles = articles
        .filter(article => article.publishedAt)
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 5)

      let response = "I could not reach the AI, but here are Himanshu's latest writing:"
      articles.forEach((article, index) => {
        const monthYear = new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        response += `\n▪ ${article.title} — https://blog.buildwithhimanshu.com/${article.slug} (${monthYear})`
      })

      return response
    } catch (error) {
      devLog('🔄 Article fetch failed, using simple fallback')
      return this.generateSimpleFallback(query)
    }
  }

  // Add contextual suggestions based on the conversation
  async addContextualSuggestions(response, userQuery, chatHistory) {
    try {
      // Check if we should suggest a meeting (only for portfolio queries)
      const shouldCheckMeeting = this.shouldSuggestMeeting(userQuery, chatHistory, response)
      
      if (shouldCheckMeeting) {
        try {
          const meetingSuggestion = await this.checkMeetingSuggestion(userQuery, chatHistory)
          if (meetingSuggestion && meetingSuggestion.shouldSuggest) {
            response += `\n\n📅 ${meetingSuggestion.autoMessage}`
            this.lastMeetingSuggestion = meetingSuggestion
          }
        } catch (error) {
          console.error('Meeting suggestion failed:', error)
        }
      }
      
      // Add helpful suggestions based on query content
      const query = userQuery.toLowerCase()
      if (query.includes('project') && !query.includes('all')) {
        response += '\n\n💡 **Tip:** Ask "show me all your projects" to see both work and personal projects!'
      } else if (query.includes('skill') && !query.includes('tech')) {
        response += '\n\n💡 **Also available:** Resume customization service for job applications!'
      }
      
      return response
      
    } catch (error) {
      console.error('Failed to add contextual suggestions:', error)
      return response
    }
  }

  // Simple fallback response without keyword matching - AI-first approach
  generateFallbackResponse(userQuery, error) {
    console.error('AI service unavailable, providing simple fallback:', error.message)
    return this.generateSimpleFallback(userQuery)
  }

  // Simple fallback when AI is completely unavailable
  generateSimpleFallback(userQuery) {
    return `🤖 **AI Assistant Temporarily Unavailable**\n\n` +
           `I'm currently having trouble connecting to my AI backend. ` +
           `I can help you with:\n\n` +
           `📄 **Resume Customization** - Paste job descriptions for AI-powered resume tailoring\n` +
           `📅 **Meeting Scheduling** - Discuss opportunities and technical topics\n` +
           `💼 **Portfolio Information** - Experience, skills, projects, and education\n\n` +
           `**📧 Direct Contact:**\n` +
           `• Email: himanshu.c.official@gmail.com\n` +
           `• LinkedIn: https://www.linkedin.com/in/himanshucofficial/\n\n` +
           `Please try your question again in a moment when AI service is restored! 🚀`
  }

  // Helper method for requesting job description
  requestJobDescription() {
    return '🎯 **Resume Customization Service**\n\n' +
           'I can create a customized resume for any job! To get started:\n\n' +
           '📋 **Just paste the full job description** and I\'ll:\n' +
           '• Extract company and position details using AI\n' +
           '• Analyze job requirements intelligently\n' +
           '• Customize the resume content accordingly\n' +
           '• Generate a professional PDF download\n\n' +
           '**Example:** Simply paste the entire job posting text here!\n\n' +
           '**✨ Features:**\n' +
           '• AI-powered analysis\n' +
           '• ATS optimization\n' +
           '• Professional formatting\n' +
           '• Instant PDF generation'
  }

  async generateAPIResponse(userQuery, chatHistory = []) {
    devLog('🔥 Sending request to backend AI API...')
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userQuery,
          chatHistory: chatHistory,
          resumeData: resumeData
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(`Backend API request failed: ${response.status} - ${errorData.message}`)
      }

      const data = await response.json()
      this.lastWritingSources = data.data?.writingSources || []
      const aiResponse = data.data?.response
      
      if (!aiResponse) {
        throw new Error('No response received from backend')
      }
      
      devLog('🤖 Backend AI Response:', aiResponse.substring(0, 100) + '...')
      
      return aiResponse
      
    } catch (error) {
      console.error('Backend AI response generation failed:', error)
      devLog('🔄 Falling back to rule-based response')
      return this.generateRuleBasedResponse(userQuery)
    }
  }

  // AI-ONLY approach - no keyword matching
  generateRuleBasedResponse(query) {
    devLog(`🤖 AI-first approach - forwarding to backend: "${query}"`)
    
    // Always try to use AI backend first
    return this.generateAPIResponse(query, []).catch(error => {
      devLog('🔄 AI backend unavailable, using simple fallback')
      return this.generateSimpleFallback(query)
    })
  }

  // Check if conversation context suggests scheduling a meeting
  shouldSuggestMeeting(userQuery, chatHistory, aiResponse) {
    devLog('🔍 Checking meeting suggestion for query:', userQuery)
    
    // Don't suggest if we already suggested recently
    if (this.lastMeetingSuggestion && 
        Date.now() - this.lastMeetingSuggestion.timestamp < 300000) { // 5 minutes
      devLog('❌ Not suggesting - recently suggested')
      return false
    }
    
    // Let the LLM decide by always checking if conversation warrants a meeting
    // The backend AI will analyze context and determine if meeting is appropriate
    devLog('✅ Checking with LLM for meeting suggestion')
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

  // Get writing sources from the last AI response
  getLastWritingSources() {
    return this.lastWritingSources
  }

  // Retrieve writing sources via RAG for a query
  async getWritingSources(query, k = 8) {
    try {
      const response = await fetch(this.backendUrl + '/api/ai/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      })

      if (!response.ok) {
        throw new Error(`RAG API failed: ${response.status}`)
      }

      const data = await response.json()
      const results = data?.data?.results || []
      devLog(`🔍 Retrieved ${results.length} writing sources for query`)
      return results
    } catch (error) {
      console.error('RAG sources retrieval failed:', error)
      devLog('🔄 RAG unavailable, returning empty sources')
      return []
    }
  }

  // Clear meeting suggestion
  clearMeetingSuggestion() {
    this.lastMeetingSuggestion = null
  }



  async processResumeCustomization(jobDetails) {
    try {
      devLog('🚀 Processing AI-powered resume customization')
      
      // Show immediate feedback
      let response = `🔄 **Processing AI-Powered Resume Customization...**\n\n`
      response += `**Job Description:** ${jobDetails.jobDescription.length} characters\n\n`
      response += `⏳ AI is analyzing job requirements and customizing your resume...\n\n`

      // Call the resume service - let AI extract company/title from description
      const result = await resumeService.customizeAndGeneratePDF({
        jobDescription: jobDetails.jobDescription,
        companyName: '',  // Let AI extract this
        jobTitle: ''      // Let AI extract this
      })

      // Success response with download link
      response += `✅ **AI Resume Customization Complete!**\n\n`
      response += `🤖 **Powered by:** AI\n`
      response += `📊 **ATS Score:** ${result.customization.data?.atsScore || 'N/A'}%\n`
      response += `🎯 **Match Percentage:** ${result.customization.data?.matchPercentage || 'N/A'}%\n`
      response += `📄 **File Size:** ${(result.pdf.data?.fileSize / 1024).toFixed(1)}KB\n\n`

      response += `📥 **Download Your Customized Resume:**\n[📄 ${result.fileName}](${result.downloadUrl})\n\n`
      response += `🎯 **This resume has been intelligently optimized with:**\n`
      response += `• **AI-powered content analysis** - Deep understanding of job requirements\n`
      response += `• **Smart skill highlighting** - Relevant experience emphasized\n`
      response += `• **ATS-compatible formatting** - Passes automated screening\n`
      response += `• **Professional typography** - Modern, clean design\n`
      response += `• **Intelligent customization** - Tailored for this specific role\n\n`
      response += `**Ready to apply with confidence!** 🚀`

      return response

    } catch (error) {
      console.error('Resume customization failed:', error)
      return `❌ **Resume customization failed:** ${error.message}\n\nPlease try again or check if the backend service is running.`
    }
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(this.healthEndpoint, { method: 'GET' });
      if (response.ok) {
        devLog('✅ Backend API is healthy.');
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