export const generateResponse = (query, resumeData) => {
  const lowerQuery = query.toLowerCase()

  // Experience-related queries
  if (lowerQuery.includes('experience') || lowerQuery.includes('work') || lowerQuery.includes('job') || lowerQuery.includes('career')) {
    return `**Professional Experience:**\n\nHimanshu has ${resumeData.experience.length} years of professional experience across top tech companies:\n\n` +
      resumeData.experience.map(exp => {
        return `**${exp.role} at ${exp.company}** (${exp.duration})\n${exp.location}\n\n${exp.highlights.map(h => `• ${h}`).join('\n')}`
      }).join('\n\n') + 
      `\n\nHis experience spans backend development, full-stack solutions, AI-powered systems, and large-scale platform optimization.`
  }

  // Skills-related queries
  if (lowerQuery.includes('skill') || lowerQuery.includes('tech') || lowerQuery.includes('language') || lowerQuery.includes('tool')) {
    return `**Technical Skills:**\n\n` +
      `**Programming Languages:**\n${resumeData.skills.languages.map(lang => `• ${lang}`).join('\n')}\n\n` +
      `**Technologies & Frameworks:**\n${resumeData.skills.technologies.map(tech => `• ${tech}`).join('\n')}\n\n` +
      `**Developer Tools:**\n${resumeData.skills.developerTools.map(tool => `• ${tool}`).join('\n')}\n\n` +
      `**Databases:**\n${resumeData.skills.databases.map(db => `• ${db}`).join('\n')}\n\n` +
      `Himanshu specializes in backend development with Java and Spring Boot, along with cloud technologies and AI integration.`
  }

  // Education-related queries
  if (lowerQuery.includes('education') || lowerQuery.includes('study') || lowerQuery.includes('degree') || lowerQuery.includes('university') || lowerQuery.includes('college')) {
    return `**Education:**\n\n` +
      resumeData.education.map(edu => {
        let eduText = `**${edu.degree}**\n${edu.institution} (${edu.year})`
        if (edu.achievements) {
          eduText += `\n\n*Achievements:*\n${edu.achievements.map(ach => `• ${ach}`).join('\n')}`
        }
        return eduText
      }).join('\n\n') +
      `\n\nHimanshu has a strong academic background with a Master's in Computer Applications from NIT Warangal, where he was a class topper.`
  }

  // Projects-related queries
  if (lowerQuery.includes('project') || lowerQuery.includes('build') || lowerQuery.includes('created') || lowerQuery.includes('developed')) {
    return `**Notable Projects:**\n\n` +
      resumeData.projects.map(project => {
        return `**${project.name}**\n${project.description}\n\n*Technologies used:* ${project.technologies.join(', ')}`
      }).join('\n\n') +
      `\n\nThese projects showcase Himanshu's ability to build full-stack web applications using modern technologies and cloud platforms.`
  }

  // Achievements-related queries
  if (lowerQuery.includes('achievement') || lowerQuery.includes('award') || lowerQuery.includes('recognition') || lowerQuery.includes('accomplishment')) {
    return `**Key Achievements:**\n\n` +
      resumeData.achievements.map(ach => `• ${ach}`).join('\n') +
      `\n\nHimanshu has consistently excelled academically and professionally, demonstrating leadership and technical excellence throughout his career.`
  }

  // Contact-related queries
  if (lowerQuery.includes('contact') || lowerQuery.includes('email') || lowerQuery.includes('phone') || lowerQuery.includes('reach') || lowerQuery.includes('linkedin') || lowerQuery.includes('github')) {
    return `**Contact Information:**\n\n` +
      `📧 **Email:** ${resumeData.email}\n` +
      `📱 **Phone:** ${resumeData.phone}\n` +
      `📍 **Location:** ${resumeData.location}\n` +
      `💼 **LinkedIn:** ${resumeData.linkedin}\n` +
      `💻 **GitHub:** ${resumeData.github}\n\n` +
      `Feel free to reach out to Himanshu for opportunities, collaborations, or technical discussions!`
  }

  // Summary/About queries
  if (lowerQuery.includes('about') || lowerQuery.includes('summary') || lowerQuery.includes('who') || lowerQuery.includes('tell me') || lowerQuery.includes('introduce')) {
    return `**About Himanshu Chaudhary:**\n\n` +
      `${resumeData.summary}\n\n` +
      `**Current Role:** ${resumeData.title}\n` +
      `**Location:** ${resumeData.location}\n\n` +
      `Himanshu is passionate about building scalable solutions, AI integration, and optimizing system performance. He has successfully delivered projects that have significantly reduced operational costs and improved platform efficiency.`
  }

  // Wayfair-specific queries
  if (lowerQuery.includes('wayfair') || lowerQuery.includes('current') || lowerQuery.includes('present')) {
    const wayfairExp = resumeData.experience.find(exp => exp.company === 'Wayfair')
    return `**Current Role at Wayfair:**\n\n` +
      `${wayfairExp.role} (${wayfairExp.duration})\n${wayfairExp.location}\n\n` +
      `**Key Contributions:**\n${wayfairExp.highlights.map(h => `• ${h}`).join('\n')}\n\n` +
      `At Wayfair, Himanshu has been instrumental in building AI-powered tools and optimizing fulfillment systems that have resulted in significant cost savings and operational improvements.`
  }

  // Amazon-specific queries
  if (lowerQuery.includes('amazon')) {
    const amazonExp = resumeData.experience.find(exp => exp.company === 'Amazon')
    return `**Experience at Amazon:**\n\n` +
      `${amazonExp.role} (${amazonExp.duration})\n${amazonExp.location}\n\n` +
      `**Key Contributions:**\n${amazonExp.highlights.map(h => `• ${h}`).join('\n')}\n\n` +
      `During his time at Amazon, Himanshu worked on large-scale migration projects and backend optimizations that improved system performance and reduced costs.`
  }

  // AI/Machine Learning queries
  if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence') || lowerQuery.includes('machine learning') || lowerQuery.includes('ml')) {
    return `**AI & Machine Learning Experience:**\n\n` +
      `Himanshu has hands-on experience with Generative AI technologies including:\n` +
      `• OpenAI and Gemini AI integration\n` +
      `• Built Voyager - an AI-powered assistant that translates English to SQL queries\n` +
      `• Implemented Natural Language Processing (NLP) in the Grievance Portal project\n\n` +
      `He combines his software engineering expertise with cutting-edge AI technologies to build intelligent solutions that enhance business operations and user experiences.`
  }

  // Default response for unmatched queries
  return `Thanks for your question! I can help you learn about Himanshu's:\n\n` +
    `• **Experience** - His professional journey at Wayfair, Amazon, and other companies\n` +
    `• **Skills** - Technical expertise in Java, Spring Boot, Python, and cloud technologies\n` +
    `• **Projects** - Notable applications he has built\n` +
    `• **Education** - Academic background and achievements\n` +
    `• **Contact** - How to reach out to him\n\n` +
    `What would you like to know more about?`
} 