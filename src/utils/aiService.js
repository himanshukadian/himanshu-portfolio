import resumeService from './resumeService.js'
import devLog from './devLog.js'

const REQUEST_TIMEOUT_MS = 60000
const RATE_LIMIT_MESSAGE = "You're sending messages too quickly — give me a moment 😉"

class AIService {
  constructor() {
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://himanshu-portfolio-api-e10b4543a453.herokuapp.com'
    this.chatEndpoint = `${this.backendUrl}/api/ai/chat`
    this.streamEndpoint = `${this.backendUrl}/api/ai/stream`
    this.online = true
    this.lastMeetingSuggestion = null

    devLog('✅ AI Assistant ready with backend API')
    devLog(`🚀 Backend URL: ${this.backendUrl}`)
  }

  getOnline() {
    return this.online
  }

  getOfflineFallback() {
    return this.generateRuleBasedResponse()
  }

  async generateResponse(userQuery, chatHistory = [], opts = {}) {
    try {
      const analysis = this.categorizeQuery(userQuery)

      let result
      switch (analysis.category) {
        case 'resume_customization':
          result = await this.handleResumeQuery(userQuery, chatHistory, analysis, opts)
          break
        case 'meeting_scheduling':
          result = await this.handleMeetingQuery(userQuery, chatHistory, analysis, opts)
          break
        case 'writing':
          result = await this.generateWritingResponse(userQuery, chatHistory, opts)
          break
        case 'portfolio_info':
        default:
          result = await this.handlePortfolioQuery(userQuery, chatHistory, analysis, opts)
          break
      }

      return this.normalizeResult(Object.assign({}, result, {
        suggestions: Array.isArray(result.suggestions) && result.suggestions.length
          ? result.suggestions
          : this.getSuggestions(analysis.category, userQuery)
      }))
    } catch (error) {
      console.error('❌ AI response generation failed:', error)
      if (error && error.name === 'AbortError') throw error
      if (error && error.kind === 'rate_limit') throw error
      if (error && (error.kind === 'offline' || error.kind === 'stream')) {
        return this.normalizeResult(this.getOfflineFallback())
      }
      const fallback = this.generateRuleBasedResponse()
      if (error && error.kind === 'backend' && error.message) {
        fallback.text = error.message
      }
      return this.normalizeResult(fallback)
    }
  }

  async streamResponse(userQuery, chatHistory = [], { onDelta, signal } = {}) {
    const req = this.prepareRequest(signal)
    let startPayload = null
    let accumulated = ''
    let deltaCount = 0
    let streamFailed = false
    let failureMessage = ''

    try {
      const response = await fetch(this.streamEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userQuery,
          chatHistory: chatHistory
        }),
        signal: req.controller.signal
      })

      if (response.status === 429) {
        const rateErr = new Error(RATE_LIMIT_MESSAGE)
        rateErr.kind = 'rate_limit'
        throw rateErr
      }

      if (!response.ok) {
        const err = new Error(await this.readErrorMessage(response) || `Backend stream request failed: ${response.status}`)
        err.kind = 'backend'
        throw err
      }

      if (!response.body) throw new Error('Streaming not supported by response')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        let newlineIndex
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const rawLine = buffer.slice(0, newlineIndex).trim()
          buffer = buffer.slice(newlineIndex + 1)
          if (!rawLine.startsWith('data:')) continue

          const payload = rawLine.replace(/^data:\s*/, '').trim()
          if (!payload) continue

          let event
          try {
            event = JSON.parse(payload)
          } catch (e) {
            continue
          }

          if (event.type === 'start') {
            startPayload = {
              model: typeof event.model === 'string' ? event.model : '',
              sources: Array.isArray(event.sources) ? event.sources : []
            }
          } else if (event.type === 'delta') {
            accumulated += typeof event.text === 'string' ? event.text : ''
            deltaCount += 1
            if (typeof onDelta === 'function') onDelta(accumulated)
          } else if (event.type === 'done') {
            if (!startPayload) {
              startPayload = {
                model: typeof event.model === 'string' ? event.model : '',
                sources: Array.isArray(event.sources) ? event.sources : []
              }
            }
          } else if (event.type === 'error') {
            streamFailed = true
            failureMessage = typeof event.message === 'string' && event.message ? event.message : 'Backend stream failed'
            break
          }
        }

        if (streamFailed) break
      }

      buffer += decoder.decode()

      if (streamFailed) {
        const err = new Error(failureMessage)
        err.kind = 'stream'
        throw err
      }

      if (deltaCount === 0) throw new Error('No text received from backend stream')

      this.online = true
      const category = this.categorizeQuery(userQuery).category
      return {
        text: accumulated,
        sources: (startPayload && startPayload.sources) || [],
        contextUsed: true,
        suggestions: this.getSuggestions(category, userQuery),
        model: (startPayload && startPayload.model) || '',
        fellback: false
      }
    } catch (error) {
      if (req.isExternalAbort()) throw error
      this.online = false
      if (error && error.kind) throw error
      if (error && error.name === 'AbortError') {
        const offlineErr = new Error('Stream request timed out')
        offlineErr.kind = 'offline'
        throw offlineErr
      }
      const wrapped = new Error(error && error.message ? error.message : 'Stream request failed')
      wrapped.kind = 'offline'
      throw wrapped
    } finally {
      req.cleanup()
    }
  }

  categorizeQuery(userQuery) {
    const queryLength = userQuery.length

    const isLikelyJobDescription = queryLength > 100 &&
      (/job|position|role|requirements|responsibilities|candidate|hiring/i.test(userQuery) ||
       /senior|junior|lead|principal.*engineer/i.test(userQuery))

    const hasResumeIntent = /resume|cv|customize|tailor|apply/i.test(userQuery)
    const hasMeetingIntent = /meet|schedule|call|discuss|talk|connect|appointment/i.test(userQuery)
    const hasWritingIntent = /writing|writings|articles|article|blog|latest post|published|tutorials|tutorial|what have you written|your articles|your blog|mcp|rag|distributed systems|price ?iq|cli automation|ai agents|use tools/i.test(userQuery)

    let category = 'portfolio_info'
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

  getSuggestions(category, query) {
    const mentionsMeeting = this.shouldSuggestMeeting(query)
    if (category === 'writing') {
      return mentionsMeeting
        ? ["let's set up a meeting", 'all posts', 'summarize the AI agents article']
        : ['all posts', 'summarize the AI agents article']
    }
    const base = ['show me all your projects', 'customize my resume']
    return mentionsMeeting
      ? ["let's set up a meeting", ...base]
      : [...base, "let's set up a meeting"]
  }

  shouldSuggestMeeting(query) {
    return /meet|call|chat|connect|schedule|setup/i.test(query)
  }

  async handleResumeQuery(userQuery, chatHistory, analysis, opts) {
    try {
      if (analysis.queryLength > 50) {
        return await this.processResumeCustomization(userQuery)
      }
      try {
        return await this.generateAPIResponse(userQuery, chatHistory, opts)
      } catch (error) {
        devLog('🔄 AI failed for short resume query, using resume fallback')
        return this.requestJobDescription()
      }
    } catch (error) {
      console.error('❌ Resume handler error:', error)
      return this.generateRuleBasedResponse()
    }
  }

  requestJobDescription() {
    return {
      text: '🎯 **Resume Customization Service**\n\n' +
            'I can create a customized resume for any job! To get started:\n\n' +
            '📋 **Just paste the full job description** and I\'ll:\n' +
            '• Extract company and position details using AI\n' +
            '• Analyze job requirements intelligently\n' +
            '• Customize the resume content accordingly\n' +
            '• Generate a professional PDF download\n\n' +
            '**Example:** Simply paste the entire job posting text here!',
      fellback: true,
      suggestions: ['customize my resume'],
      model: 'resume-fallback'
    }
  }

  async processResumeCustomization(jobDescription) {
    try {
      devLog('🚀 Processing AI-powered resume customization')
      const result = await resumeService.customizeAndGeneratePDF({
        jobDescription: jobDescription,
        companyName: '',
        jobTitle: ''
      })

      const atsScore = result.customization?.data?.atsScore
      const matchPercentage = result.customization?.data?.matchPercentage
      const fileSize = result.pdf?.data?.fileSize
      const sizeLabel = typeof fileSize === 'number' ? ` (${(fileSize / 1024).toFixed(1)}KB)` : ''

      const text =
        `✅ **AI Resume Customization Complete!**\n\n` +
        `**ATS Score:** ${atsScore ?? 'N/A'}%\n` +
        `**Match Percentage:** ${matchPercentage ?? 'N/A'}%\n` +
        `**Download:** [📄 ${result.fileName}](${result.downloadUrl})${sizeLabel}\n\n` +
        `**Optimized with:** AI-powered content analysis, smart skill highlighting, ATS-compatible formatting, professional typography, and intelligent customization tailored to the role.`

      return {
        text,
        fellback: false,
        suggestions: [],
        model: 'resume-service'
      }
    } catch (error) {
      console.error('Resume customization failed:', error)
      return {
        text: `❌ **Resume customization failed:** ${error && error.message ? error.message : 'Please try again later.'}`,
        fellback: true,
        suggestions: ['customize my resume'],
        model: 'resume-fallback'
      }
    }
  }

  async handleMeetingQuery(userQuery, chatHistory, analysis, opts) {
    try {
      devLog('📅 Processing meeting request with AI')

      let query = userQuery
      try {
        const slotPromise = this.getAvailableSlots('general')
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('slots timeout')), 8000))
        const slotsData = await Promise.race([slotPromise, timeoutPromise])
        if (slotsData && slotsData.configured && Array.isArray(slotsData.availableSlots) && slotsData.availableSlots.length > 0) {
          const slotLines = slotsData.availableSlots
            .slice(0, 5)
            .map((slot, index) => `${index + 1}. ${slot.display} (${slot.timezone || 'IST'})`)
            .join('\n')
          query = `Himanshu's REAL currently available meeting slots (IST):\n${slotLines}\n\nIf the user wants to book, suggest one of these exact times.\n\nUser: ${userQuery}`
          devLog(`📅 Injected ${slotsData.availableSlots.length} real Calendly slots into meeting query`)
        }
      } catch (slotError) {
        devLog('📅 Slot fetch failed, using plain meeting query')
      }

      return await this.generateAPIResponse(query, chatHistory, opts)
    } catch (error) {
      devLog('🔄 AI failed for meeting query, using meeting fallback')
      return {
        text: '📅 **Let\'s Schedule a Meeting!**\n\n' +
              'I\'d love to connect! You can reach me at:\n' +
              '• Email: himanshu.c.official@gmail.com\n' +
              '• LinkedIn: https://www.linkedin.com/in/himanshucofficial/\n\n' +
              '💬 Or continue chatting here and I\'ll help coordinate a time!',
        fellback: true,
        suggestions: ["let's set up a meeting"],
        model: 'meeting-fallback'
      }
    }
  }

  async handlePortfolioQuery(userQuery, chatHistory, analysis, opts) {
    try {
      devLog('💼 Processing portfolio information request with AI')
      return await this.generateAPIResponse(userQuery, chatHistory, opts)
    } catch (error) {
      devLog('🔄 AI failed for portfolio query, using fallback')
      return this.generateRuleBasedResponse()
    }
  }

  async generateWritingResponse(query, chatHistory, opts) {
    try {
      devLog('✍️ Processing writing request with AI')
      return await this.generateAPIResponse(query, chatHistory, opts)
    } catch (error) {
      devLog('🔄 AI failed for writing, using article list fallback')
    }

    const req = this.prepareRequest(opts && opts.signal)
    try {
      const articlesResponse = await fetch(`${this.backendUrl}/api/articles`, {
        method: 'GET',
        signal: req.controller.signal
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

      const lines = articles.map((article) => {
        const monthYear = new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        return `▪ ${article.title} — https://blog.buildwithhimanshu.com/${article.slug} (${monthYear})`
      })

      return {
        text: `I could not reach the AI, but here are Himanshu's latest writing:\n\n${lines.join('\n')}`,
        sources: [],
        contextUsed: false,
        suggestions: ['all posts', 'summarize the AI agents article'],
        model: 'articles-fallback',
        fellback: true
      }
    } catch (error) {
      devLog('🔄 Article fetch failed, using simple fallback')
      return this.generateRuleBasedResponse()
    } finally {
      req.cleanup()
    }
  }

  generateRuleBasedResponse() {
    return {
      text: "⚠️ My AI service is temporarily unreachable. Try again in a moment.",
      sources: [],
      contextUsed: false,
      suggestions: ['show me all your projects', 'customize my resume', "let's set up a meeting"],
      model: 'local-fallback',
      fellback: true
    }
  }

  async generateAPIResponse(userQuery, chatHistory = [], opts = {}) {
    const req = this.prepareRequest(opts.signal)
    try {
      const response = await fetch(this.chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userQuery,
          chatHistory: chatHistory
        }),
        signal: req.controller.signal
      })

      if (response.status === 429) {
        const rateErr = new Error(RATE_LIMIT_MESSAGE)
        rateErr.kind = 'rate_limit'
        throw rateErr
      }

      if (!response.ok) {
        const err = new Error(await this.readErrorMessage(response) || `Backend API request failed: ${response.status}`)
        err.kind = 'backend'
        throw err
      }

      const data = await response.json()

      if (data && data.status === 'error') {
        const err = new Error(data.message || 'Backend returned an error')
        err.kind = 'backend'
        throw err
      }

      const text = data && data.data && data.data.response
      if (typeof text !== 'string' || !text.trim()) {
        throw new Error('No response received from backend')
      }

      this.online = true
      const category = this.categorizeQuery(userQuery).category
      return {
        text,
        sources: (data.data && data.data.writingSources) || [],
        contextUsed: Boolean(data.data && data.data.contextUsed),
        suggestions: this.getSuggestions(category, userQuery),
        model: (data.data && data.data.model) || '',
        fellback: false
      }
    } catch (error) {
      if (req.isExternalAbort()) throw error
      this.online = false
      if (error && error.kind) throw error
      if (error && error.name === 'AbortError') {
        const offlineErr = new Error('Request timed out')
        offlineErr.kind = 'offline'
        throw offlineErr
      }
      const wrapped = new Error(error && error.message ? error.message : 'Backend request failed')
      wrapped.kind = 'offline'
      throw wrapped
    } finally {
      req.cleanup()
    }
  }

  prepareRequest(externalSignal) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    const state = { externalAborted: false }
    let removeListener = null

    if (externalSignal) {
      if (externalSignal.aborted) {
        state.externalAborted = true
        controller.abort()
      } else {
        const onAbort = () => {
          state.externalAborted = true
          controller.abort()
        }
        externalSignal.addEventListener('abort', onAbort)
        removeListener = () => externalSignal.removeEventListener('abort', onAbort)
      }
    }

    return {
      controller,
      cleanup: () => {
        clearTimeout(timer)
        if (removeListener) removeListener()
      },
      isExternalAbort: () => state.externalAborted
    }
  }

  async readErrorMessage(response) {
    try {
      const body = await response.json()
      if (body && body.status === 'error' && typeof body.message === 'string' && body.message) return body.message
      if (body && typeof body.message === 'string' && body.message) return body.message
    } catch (e) {
      void e
    }
    return ''
  }

  normalizeResult(result) {
    if (!result || typeof result !== 'object') {
      return this.normalizeResult(this.generateRuleBasedResponse())
    }
    const base = this.generateRuleBasedResponse()
    const text = typeof result.text === 'string' ? result.text : ''
    return {
      text: text || base.text,
      sources: Array.isArray(result.sources) ? result.sources : [],
      contextUsed: Boolean(result.contextUsed),
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 6) : [],
      model: typeof result.model === 'string' && result.model ? result.model : '',
      fellback: text ? Boolean(result.fellback) : true
    }
  }

  async getAvailableSlots(meetingType = 'general') {
    const req = this.prepareRequest()
    try {
      const response = await fetch(`${this.backendUrl}/api/scheduling/slots?meetingType=${meetingType}`, {
        method: 'GET',
        signal: req.controller.signal
      })

      if (!response.ok) {
        throw new Error(`Slots API failed: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Get slots API failed:', error)
      return null
    } finally {
      req.cleanup()
    }
  }

  async scheduleMeeting(meetingData) {
    const req = this.prepareRequest()
    try {
      const response = await fetch(`${this.backendUrl}/api/scheduling/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData),
        signal: req.controller.signal
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
    } finally {
      req.cleanup()
    }
  }

  clearMeetingSuggestion() {
    this.lastMeetingSuggestion = null
  }
}

export const aiService = new AIService()

export const generateResponse = (query, chatHistory = [], opts = {}) => {
  return aiService.generateResponse(query, chatHistory, opts)
}