import { resumeData } from '../data/resume.js'

class AIService {
  constructor() {
    this.model = null
    this.isModelLoaded = false
    this.modelType = 'rules' // Start with rules immediately
    this.isLoading = false
    this.fallbackToRules = false
    
    // Start with rule-based system, load AI in background
    console.log('✅ AI Assistant ready (enhanced rule-based mode)')
    console.log('🚀 Loading optimized WebLLM AI model in background...')
    
    // Load AI models in background without blocking
    this.initializeModelInBackground()
  }

  async initializeModelInBackground() {
    // Don't block user experience - load AI model in background
    setTimeout(async () => {
      try {
        console.log('🤖 Loading WebLLM AI model in background...')
        await this.loadWebLLM()
        console.log('✨ Upgraded to AI-powered responses!')
        
      } catch (webllmError) {
        console.log('AI model not available, continuing with enhanced rule-based responses...', webllmError)
      }
    }, 1000) // Small delay to ensure UI is ready
  }

  async loadWebLLM() {
    // Dynamic import for WebLLM
    const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
    
    console.log('Loading Qwen2.5-0.5B with WebLLM...')
    
    // Use the working WebLLM model
    this.model = await CreateMLCEngine('Qwen2.5-0.5B-Instruct-q4f16_1-MLC', {
      initProgressCallback: (progress) => {
        console.log(`AI Model loading: ${Math.round(progress.progress * 100)}%`)
      }
    })
    
    this.isModelLoaded = true
    this.modelType = 'webllm'
    console.log('✅ WebLLM AI model loaded successfully')
  }

  createPrompt(userQuery) {
    // Provide targeted context based on the query to avoid confusion
    const context = this.getTargetedContext(userQuery)
    
    return `You are Himanshu Chaudhary. Answer this question using ONLY the specific information provided below. Do NOT mix information between different companies or sections.

IMPORTANT: Each company section below is SEPARATE. Do NOT combine or mix information between companies.

${context}

QUESTION: ${userQuery}

ANSWER (using only the information above, do not mix between companies):`
  }

  getTargetedContext(query) {
    const lowerQuery = query.toLowerCase()
    let context = `PERSONAL INFO:\nName: ${resumeData.name}\nCurrent Title: ${resumeData.title}\nLocation: ${resumeData.location}\n\n`
    
    // Check for specific company mentions and provide ONLY that company's info
    if (lowerQuery.includes('mobeology') || lowerQuery.includes('mobelogy')) {
      const mobeologyExp = resumeData.experience.find(exp => exp.company === 'Mobeology Communications')
      context += `MOBEOLOGY COMMUNICATIONS WORK (ONLY):\nRole: ${mobeologyExp.role}\nDuration: ${mobeologyExp.duration}\nLocation: ${mobeologyExp.location}\nWhat I did at Mobeology Communications:\n${mobeologyExp.highlights.map(h => `• ${h}`).join('\n')}\n\n`
      return context
    }
    
    if (lowerQuery.includes('wayfair')) {
      const wayfairExp = resumeData.experience.find(exp => exp.company === 'Wayfair')
      context += `WAYFAIR WORK (ONLY):\nRole: ${wayfairExp.role}\nDuration: ${wayfairExp.duration}\nLocation: ${wayfairExp.location}\nWhat I did at Wayfair:\n${wayfairExp.highlights.map(h => `• ${h}`).join('\n')}\n\n`
      return context
    }
    
    if (lowerQuery.includes('amazon')) {
      const amazonExp = resumeData.experience.find(exp => exp.company === 'Amazon')
      context += `AMAZON WORK (ONLY):\nRole: ${amazonExp.role}\nDuration: ${amazonExp.duration}\nLocation: ${amazonExp.location}\nWhat I did at Amazon:\n${amazonExp.highlights.map(h => `• ${h}`).join('\n')}\n\n`
      return context
    }
    
    // For general queries, provide complete but clearly separated context
    context += `WORK EXPERIENCE (DO NOT MIX BETWEEN COMPANIES):\n\n`
    resumeData.experience.forEach(exp => {
      context += `=== ${exp.company.toUpperCase()} (SEPARATE COMPANY) ===\nRole: ${exp.role}\nDuration: ${exp.duration}\nLocation: ${exp.location}\nWork done SPECIFICALLY at ${exp.company}:\n${exp.highlights.map(h => `• ${h}`).join('\n')}\n\n`
    })
    
    // Add other sections as needed
    if (lowerQuery.includes('skill') || lowerQuery.includes('tech')) {
      context += `TECHNICAL SKILLS:\nLanguages: ${resumeData.skills.languages.join(', ')}\nTechnologies: ${resumeData.skills.technologies.join(', ')}\n\n`
    }
    
    if (lowerQuery.includes('education')) {
      context += `EDUCATION:\n${resumeData.education.map(edu => `${edu.degree} from ${edu.institution} (${edu.year})`).join('\n')}\n\n`
    }
    
    if (lowerQuery.includes('project') && !lowerQuery.includes('amazon') && !lowerQuery.includes('wayfair') && !lowerQuery.includes('mobeology')) {
      context += `PERSONAL PROJECTS:\n${resumeData.projects.map(proj => `${proj.name}: ${proj.description}\nTechnologies: ${proj.technologies.join(', ')}`).join('\n\n')}\n\n`
    }
    
    return context
  }

  extractRelevantContext(query) {
    // This method is now replaced by getTargetedContext
    return this.getTargetedContext(query)
  }

  async generateResponse(userQuery) {
    try {
      console.log(`🔍 Query: "${userQuery}"`)
      console.log(`🤖 AI Model Status: loaded=${this.isModelLoaded}, type=${this.modelType}`)
      
      // Use AI model if available, with better context filtering
      if (this.isModelLoaded && !this.fallbackToRules) {
        console.log('📡 Using AI model response (with improved context)')
        return await this.generateAIResponse(userQuery)
      }
      
      console.log('📋 Using rule-based response')
      return this.generateRuleBasedResponse(userQuery)
      
    } catch (error) {
      console.error('Response generation failed:', error)
      return this.generateRuleBasedResponse(userQuery)
    }
  }

  async generateAIResponse(userQuery) {
    const prompt = this.createPrompt(userQuery)
    console.log('🔥 AI Prompt length:', prompt.length)
    console.log('📝 Context preview:', prompt.substring(0, 200) + '...')
    
    try {
      // Use WebLLM for AI responses with targeted context
      const response = await this.model.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3, // Slightly higher for more natural responses
        max_tokens: 200,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      })
      
      const aiResponse = response.choices[0]?.message?.content
      console.log('🤖 AI Response:', aiResponse?.substring(0, 100) + '...')
      
      return aiResponse || this.generateRuleBasedResponse(userQuery)
      
    } catch (error) {
      console.error('AI response generation failed:', error)
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

  getModelStatus() {
    return {
      isLoading: false, // Never loading from user perspective - starts with rules
      isModelLoaded: this.isModelLoaded,
      modelType: this.modelType,
      fallbackToRules: this.fallbackToRules,
      isReady: true // Always ready with rule-based responses
    }
  }

  setRuleBasedMode() {
    this.fallbackToRules = true
    this.modelType = 'rules'
  }

  setWebLLMMode() {
    if (this.isModelLoaded) {
      this.fallbackToRules = false
      this.modelType = 'webllm'
    }
  }
}

// Create singleton instance
export const aiService = new AIService()

// Legacy export for backward compatibility
export const generateResponse = (query) => {
  return aiService.generateResponse(query)
} 