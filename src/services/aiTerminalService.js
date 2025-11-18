/**
 * AI-Powered Terminal Service
 * Lightweight LLM-like system for answering questions about the portfolio
 */

import { knowledgeBase, getKnowledgeChunks } from './knowledgeBase'

/**
 * Detect if a question is "twisted" (unclear, indirect, trick question)
 */
export const isTwistedQuestion = (question) => {
  if (!question || question.trim().length === 0) return false
  
  const q = question.toLowerCase().trim()
  
  // Indicators of twisted questions
  const twistedIndicators = [
    // Unclear phrasing
    q.length < 3, // Very short
    q.split(' ').length === 1 && !['help', 'about', 'projects', 'skills', 'contact', 'clear'].includes(q), // Single word that's not a command
    q.match(/^[^a-z]*$/), // Only special characters
    
    // Indirect questions
    q.startsWith('can you') && !q.includes('tell') && !q.includes('show'),
    q.startsWith('do you') && !q.includes('know') && !q.includes('have'),
    q.includes('??') || q.includes('???'), // Multiple question marks
    q.match(/\?{2,}/), // Multiple consecutive question marks
    
    // Trick questions
    q.includes('what is') && (q.includes('meaning of life') || q.includes('purpose')),
    q.includes('who am i'),
    q.includes('what time') || q.includes('what date') || q.includes('what day'),
    q.includes('weather') || q.includes('temperature'),
    
    // Unusual patterns
    q.match(/^[a-z]\s+[a-z]/), // Single letters separated
    q.split('').filter(c => c === '?').length > 2, // Too many question marks
    q.match(/[a-z]{20,}/), // Very long word (likely gibberish)
    
    // Confusing input
    q.includes('???') || q.includes('!!!!'),
    q.match(/^[^a-z0-9\s]+$/), // Only special characters
  ]
  
  return twistedIndicators.some(indicator => {
    if (typeof indicator === 'boolean') return indicator
    if (typeof indicator === 'function') return indicator()
    return false
  })
}

/**
 * Calculate Levenshtein distance for fuzzy matching (typo tolerance)
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = []
  const len1 = str1.length
  const len2 = str2.length

  if (len1 === 0) return len2
  if (len2 === 0) return len1

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[len2][len1]
}

/**
 * Find closest match with typo tolerance
 */
const findClosestMatch = (input, options, maxDistance = 2) => {
  const inputLower = input.toLowerCase()
  let bestMatch = null
  let bestDistance = Infinity
  let bestSimilarity = 0

  options.forEach(option => {
    const optionLower = option.toLowerCase()
    const distance = levenshteinDistance(inputLower, optionLower)
    const similarity = 1 - (distance / Math.max(inputLower.length, optionLower.length))
    
    if (distance <= maxDistance && similarity > bestSimilarity) {
      bestDistance = distance
      bestSimilarity = similarity
      bestMatch = option
    }
  })

  return bestMatch ? { match: bestMatch, distance: bestDistance, similarity: bestSimilarity } : null
}

/**
 * Enhanced text preprocessing with stemming-like behavior and typo correction
 */
const preprocessText = (text) => {
  if (!text) return ''
  
  // Common word variations mapping
  const variations = {
    'what': ['what', 'which', 'tell me about'],
    'who': ['who', 'whom'],
    'where': ['where'],
    'when': ['when'],
    'how': ['how'],
    'why': ['why'],
    'skills': ['skills', 'skill', 'technologies', 'tech', 'tools', 'languages', 'frameworks'],
    'projects': ['projects', 'project', 'built', 'created', 'developed', 'work'],
    'experience': ['experience', 'work', 'job', 'career', 'intern', 'internship'],
    'education': ['education', 'degree', 'college', 'university', 'studied', 'learning'],
    'contact': ['contact', 'email', 'linkedin', 'github', 'twitter', 'reach', 'connect'],
    'about': ['about', 'who are you', 'introduce', 'tell me']
  }
  
  let processed = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  // Try to correct common typos in direct commands
  const directCommands = ['help', 'about', 'projects', 'skills', 'experience', 'contact', 'education', 'certifications', 'leadership', 'sudo', 'clear']
  const correctedCommand = findClosestMatch(processed, directCommands, 2)
  if (correctedCommand && correctedCommand.similarity > 0.7) {
    processed = correctedCommand.match
  }
  
  // Expand variations
  Object.keys(variations).forEach(key => {
    variations[key].forEach(variant => {
      if (processed.includes(variant)) {
        processed += ' ' + key
      }
    })
  })
  
  return processed
}

/**
 * Convert text to enhanced vector representation
 */
const textToVector = (text) => {
  const processed = preprocessText(text)
  const words = processed.split(/\s+/).filter(word => word.length > 2) // Filter short words
  
  // Weight important words higher
  const importantWords = ['project', 'skill', 'experience', 'education', 'contact', 'about', 'who', 'what', 'how']
  
  const vector = {}
  words.forEach(word => {
    const weight = importantWords.includes(word) ? 2 : 1
    vector[word] = (vector[word] || 0) + weight
  })
  
  return vector
}

/**
 * Calculate cosine similarity between two vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  const allWords = new Set([...Object.keys(vecA), ...Object.keys(vecB)])
  
  let dotProduct = 0
  let magnitudeA = 0
  let magnitudeB = 0
  
  allWords.forEach(word => {
    const a = vecA[word] || 0
    const b = vecB[word] || 0
    dotProduct += a * b
    magnitudeA += a * a
    magnitudeB += b * b
  })
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0
  }
  
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
}

/**
 * Generate natural language response from knowledge
 */
const generateResponse = (question, matchedChunks) => {
  const questionLower = question.toLowerCase()
  const category = matchedChunks[0]?.category || 'general'
  
  // Personal/About questions
  if (category === 'personal' || questionLower.includes('who') || questionLower.includes('about') || questionLower.includes('introduce')) {
    return `Hi, I'm ${knowledgeBase.personal.name}, a ${knowledgeBase.personal.identities[0]} and ${knowledgeBase.personal.identities[1]}. ${knowledgeBase.personal.summary}`
  }
  
  // Skills questions
  if (category === 'skills' || questionLower.includes('skill') || questionLower.includes('technology') || questionLower.includes('what can')) {
    return `Technical Skills:

Languages: ${knowledgeBase.skills.languages.join(", ")}

Frameworks & Technologies: ${knowledgeBase.skills.frameworks.join(", ")}

Databases: ${knowledgeBase.skills.databases.join(", ")}

Cybersecurity Tools: ${knowledgeBase.skills.cybersecurity.join(", ")}

Expertise Areas: ${knowledgeBase.skills.expertise.join(", ")}`
  }
  
  // Projects questions
  if (category === 'projects' || questionLower.includes('project') || questionLower.includes('built') || questionLower.includes('created')) {
    let response = `Recent Projects:\n\n`
    knowledgeBase.projects.forEach((project, idx) => {
      response += `${idx + 1}. ${project.name}\n`
      response += `   Technologies: ${Array.isArray(project.tech) ? project.tech.join(", ") : project.tech}\n`
      response += `   Description: ${project.description}\n\n`
    })
    return response.trim()
  }
  
  // Education questions
  if (category === 'education' || questionLower.includes('education') || questionLower.includes('degree') || questionLower.includes('college')) {
    return `Educational Background:

🎓 ${knowledgeBase.education.degree} (${knowledgeBase.education.period})
   ${knowledgeBase.education.institution}

📚 Continuous Learning:
${knowledgeBase.education.continuousLearning.map(item => `   • ${item}`).join('\n')}`
  }
  
  // Experience questions
  if (category === 'experience' || questionLower.includes('experience') || questionLower.includes('work') || questionLower.includes('intern')) {
    let response = `Professional Experience:\n\n`
    knowledgeBase.experience.forEach(exp => {
      response += `${exp.role} – ${exp.company} (${exp.period})\n`
      exp.details.forEach(detail => {
        response += `   • ${detail}\n`
      })
      response += `\n`
    })
    return response.trim()
  }
  
  // Certifications questions
  if (category === 'certifications' || questionLower.includes('certification') || questionLower.includes('certified')) {
    return `Certifications:\n\n${knowledgeBase.certifications.map(cert => `🏆 ${cert}`).join('\n')}`
  }
  
  // Leadership questions
  if (category === 'leadership' || questionLower.includes('leadership') || questionLower.includes('coordinator') || questionLower.includes('council')) {
    let response = `Leadership & Community:\n\n`
    knowledgeBase.leadership.forEach(lead => {
      response += `🎯 ${lead.role}`
      if (lead.organization) response += ` – ${lead.organization}`
      if (lead.period) response += ` (${lead.period})`
      response += `\n   • ${lead.description}\n\n`
    })
    return response.trim()
  }
  
  // Contact questions
  if (category === 'contact' || questionLower.includes('contact') || questionLower.includes('email') || questionLower.includes('reach')) {
    return `📬 Get In Touch:

Email: ${knowledgeBase.contact.email}
LinkedIn: ${knowledgeBase.contact.linkedin}
GitHub: ${knowledgeBase.contact.github}
Twitter (X): ${knowledgeBase.contact.twitter}

Feel free to reach out for collaborations, security consulting, or tech discussions!`
  }
  
  // Default: return matched chunk text
  return matchedChunks[0]?.text || "I'm not sure how to answer that. Try asking about my skills, projects, experience, education, or contact information."
}

/**
 * Check if question is within scope
 */
export const isWithinScope = (question) => {
  if (!question) return false
  
  const questionLower = question.toLowerCase()
  const scopeKeywords = [
    'surya', 'teja', 'devi', 'portfolio', 'you', 'your',
    'skill', 'project', 'experience', 'education', 'contact',
    'certification', 'leadership', 'about', 'who', 'what',
    'cybersecurity', 'developer', 'engineer', 'bug bounty',
    'java', 'javascript', 'python', 'react', 'node',
    'firebase', 'mysql', 'mongodb', 'burp', 'nmap',
    'ambulance', 'tractor', 'cyberrecon', 'threat detection',
    'cmrcet', 'palo alto', 'intern', 'workshop', 'hackathon',
    'tell me', 'show me', 'can you tell', 'do you know',
    'what can', 'how can', 'where did', 'when did'
  ]
  
  return scopeKeywords.some(keyword => questionLower.includes(keyword))
}

/**
 * Generate custom output for twisted questions using intelligent matching
 */
const generateCustomTwistedResponse = (question) => {
  const q = question.toLowerCase().trim()
  
  // Use knowledge base matching to understand what the question is about
  const knowledgeChunks = getKnowledgeChunks()
  const questionVector = textToVector(q)
  
  // Find best matching chunks even for twisted questions
  const matches = knowledgeChunks.map(chunk => {
    const chunkVector = textToVector(chunk.text + ' ' + chunk.keywords.join(' '))
    const similarity = cosineSimilarity(questionVector, chunkVector)
    return { ...chunk, similarity }
  })
  
  // Sort by similarity
  matches.sort((a, b) => b.similarity - a.similarity)
  
  // Get top matches (lower threshold for twisted questions to be more flexible)
  const topMatches = matches.filter(m => m.similarity >= 0.1)
  
  // If we have good matches, generate custom response based on the category
  if (topMatches.length > 0) {
    const category = topMatches[0].category
    const similarity = topMatches[0].similarity
    
    // Generate custom responses based on detected category
    switch(category) {
      case 'projects':
        const projectResponses = [
          `Ah, curious about my work! I've built ${knowledgeBase.projects.length} projects:\n\n${knowledgeBase.projects.map((p, i) => `${i + 1}. ${p.name}\n   Built with: ${Array.isArray(p.tech) ? p.tech.join(', ') : p.tech}\n   ${p.description}`).join('\n\n')}`,
          `Great question! My projects include ${knowledgeBase.projects[0].name} (using ${Array.isArray(knowledgeBase.projects[0].tech) ? knowledgeBase.projects[0].tech.join(' and ') : knowledgeBase.projects[0].tech}) and ${knowledgeBase.projects[1].name}. Each showcases different aspects of my development and security skills.`,
          `I've worked on several projects: ${knowledgeBase.projects.map(p => p.name).join(', ')}. The ${knowledgeBase.projects[0].name} demonstrates my AI/ML skills, while ${knowledgeBase.projects[1].name} shows my full-stack capabilities.`
        ]
        return projectResponses[Math.floor(Math.random() * projectResponses.length)]
        
      case 'skills':
        const skillResponses = [
          `I work with ${knowledgeBase.skills.languages.join(', ')}, and frameworks like ${knowledgeBase.skills.frameworks.join(', ')}. For databases, I use ${knowledgeBase.skills.databases.join(', ')}. My cybersecurity toolkit includes ${knowledgeBase.skills.cybersecurity.slice(0, 4).join(', ')}.`,
          `My technical skills span ${knowledgeBase.skills.languages.join(', ')}, with expertise in ${knowledgeBase.skills.frameworks.join(' and ')}. I'm also proficient in security tools like ${knowledgeBase.skills.cybersecurity[0]}, ${knowledgeBase.skills.cybersecurity[1]}, and ${knowledgeBase.skills.cybersecurity[2]}.`,
          `I code in ${knowledgeBase.skills.languages.join(', ')}, build with ${knowledgeBase.skills.frameworks.join(', ')}, and secure systems using ${knowledgeBase.skills.cybersecurity.slice(0, 3).join(', ')}. My expertise areas include ${knowledgeBase.skills.expertise.slice(0, 3).join(', ')}.`
        ]
        return skillResponses[Math.floor(Math.random() * skillResponses.length)]
        
      case 'experience':
        const exp = knowledgeBase.experience[0]
        const expResponses = [
          `I worked as a ${exp.role} at ${exp.company} (${exp.period}). During this time, I ${exp.details[0].toLowerCase()}, ${exp.details[1] ? exp.details[1].toLowerCase() : 'and gained hands-on security experience'}. This role gave me practical exposure to enterprise security.`,
          `My professional experience includes a ${exp.role} position at ${exp.company}. I ${exp.details[0].toLowerCase()} and learned about ${exp.details.slice(1, 3).map(d => d.toLowerCase()).join(' and ')}.`,
          `I interned at ${exp.company} as a ${exp.role}, where I ${exp.details[0].toLowerCase()}. This experience helped me understand ${exp.details[1] ? exp.details[1].toLowerCase() : 'real-world security challenges'}.`
        ]
        return expResponses[Math.floor(Math.random() * expResponses.length)]
        
      case 'education':
        const eduResponses = [
          `I'm pursuing a ${knowledgeBase.education.degree} (${knowledgeBase.education.period}) at ${knowledgeBase.education.institution}. I'm continuously learning about ${knowledgeBase.education.continuousLearning.join(', ')}.`,
          `Currently studying ${knowledgeBase.education.degree} at ${knowledgeBase.education.institution}. My learning focuses on ${knowledgeBase.education.continuousLearning[0]}, ${knowledgeBase.education.continuousLearning[1]}, and ${knowledgeBase.education.continuousLearning[2]}.`,
          `I'm working towards my ${knowledgeBase.education.degree} while actively learning ${knowledgeBase.education.continuousLearning.join(', ')}. My education combines formal coursework with hands-on security practice.`
        ]
        return eduResponses[Math.floor(Math.random() * eduResponses.length)]
        
      case 'contact':
        const contactResponses = [
          `You can reach me at ${knowledgeBase.contact.email}. I'm also on LinkedIn (${knowledgeBase.contact.linkedin}), GitHub (${knowledgeBase.contact.github}), and Twitter (${knowledgeBase.contact.twitter}). Feel free to connect!`,
          `Get in touch! Email me at ${knowledgeBase.contact.email}, or find me on ${knowledgeBase.contact.linkedin} and ${knowledgeBase.contact.github}. I'm always open to collaborations and tech discussions.`,
          `Contact me via ${knowledgeBase.contact.email}. You can also connect on LinkedIn, GitHub, or Twitter. I'm interested in security consulting, collaborations, and tech discussions!`
        ]
        return contactResponses[Math.floor(Math.random() * contactResponses.length)]
        
      case 'certifications':
        const certResponses = [
          `I hold certifications including ${knowledgeBase.certifications[0]} and ${knowledgeBase.certifications[1]}. These validate my expertise in cybersecurity and ethical hacking.`,
          `My certifications include ${knowledgeBase.certifications.join(' and ')}. These demonstrate my commitment to continuous learning in cybersecurity.`,
          `I'm certified in ${knowledgeBase.certifications[0]} and have completed ${knowledgeBase.certifications[1]}. These credentials reflect my dedication to security best practices.`
        ]
        return certResponses[Math.floor(Math.random() * certResponses.length)]
        
      case 'leadership':
        const lead = knowledgeBase.leadership[0]
        const leadResponses = [
          `I serve as ${lead.role} at ${lead.organization} (${lead.period}). I ${lead.description.toLowerCase()}. I'm also a ${knowledgeBase.leadership[1].role} at ${knowledgeBase.leadership[1].organization}, where I ${knowledgeBase.leadership[1].description.toLowerCase()}.`,
          `My leadership roles include ${lead.role} and ${knowledgeBase.leadership[1].role}. I've ${lead.description.toLowerCase()} and ${knowledgeBase.leadership[1].description.toLowerCase()}.`,
          `I'm actively involved as ${lead.role} and ${knowledgeBase.leadership[1].role}. These roles allow me to ${lead.description.toLowerCase()} and contribute to the tech community.`
        ]
        return leadResponses[Math.floor(Math.random() * leadResponses.length)]
        
      case 'personal':
        const personalResponses = [
          `I'm ${knowledgeBase.personal.name}, a ${knowledgeBase.personal.identities[0]} and ${knowledgeBase.personal.identities[1]}. ${knowledgeBase.personal.summary}`,
          `Hi! I'm ${knowledgeBase.personal.name}. I work as a ${knowledgeBase.personal.identities[0]} with a passion for ${knowledgeBase.personal.identities[2]}. ${knowledgeBase.personal.summary}`,
          `${knowledgeBase.personal.name} here! I'm a ${knowledgeBase.personal.identities[0]} specializing in ${knowledgeBase.skills.expertise[0]} and ${knowledgeBase.skills.expertise[1]}. ${knowledgeBase.personal.summary}`
        ]
        return personalResponses[Math.floor(Math.random() * personalResponses.length)]
        
      default:
        // Use the matched chunk but format it nicely
        return generateResponse(question, topMatches)
    }
  }
  
  // Fallback: try to extract any keywords and provide a helpful response
  const words = q.split(/\s+/).filter(w => w.length > 2)
  const allKeywords = [
    ...knowledgeBase.skills.languages.map(l => l.toLowerCase()),
    ...knowledgeBase.skills.frameworks.map(f => f.toLowerCase().replace('.', '')),
    ...knowledgeBase.projects.map(p => p.name.toLowerCase().split(' ')),
    'project', 'skill', 'experience', 'contact', 'education', 'certification'
  ].flat()
  
  const foundKeywords = words.filter(w => allKeywords.some(k => k.includes(w) || w.includes(k)))
  
  if (foundKeywords.length > 0) {
    return `I'm ${knowledgeBase.personal.name}, a ${knowledgeBase.personal.identities[0]}. I work with ${knowledgeBase.skills.languages.join(', ')}, have built projects like ${knowledgeBase.projects[0].name}, and specialize in ${knowledgeBase.skills.expertise[0]}. Feel free to ask about my skills, projects, experience, or contact information!`
  }
  
  // Generic custom response
  const genericResponses = [
    `I'm ${knowledgeBase.personal.name}, a ${knowledgeBase.personal.identities[0]} and ${knowledgeBase.personal.identities[1]}. I specialize in ${knowledgeBase.skills.expertise[0]} and ${knowledgeBase.skills.expertise[1]}. Ask me about my projects, skills, experience, education, or how to contact me!`,
    `Hi! I'm ${knowledgeBase.personal.name}. I work on ${knowledgeBase.projects.length} projects using ${knowledgeBase.skills.languages.join(', ')}. I'm interested in ${knowledgeBase.skills.expertise[2]}. What would you like to know?`,
    `${knowledgeBase.personal.name} here! I'm a ${knowledgeBase.personal.identities[0]} with expertise in ${knowledgeBase.skills.languages[0]}, ${knowledgeBase.skills.languages[1]}, and ${knowledgeBase.skills.languages[2]}. I've built ${knowledgeBase.projects[0].name} and ${knowledgeBase.projects[1].name}. Feel free to ask anything about my portfolio!`
  ]
  return genericResponses[Math.floor(Math.random() * genericResponses.length)]
}

/**
 * Main AI Query function - handles any question about the portfolio
 */
export const runAIQuery = (userMessage, commandOutputs = null, isTwisted = false) => {
  if (!userMessage || userMessage.trim().length === 0) {
    return "⚠️ This question is outside the scope of this system."
  }
  
  const question = userMessage.trim()
  
  // Check if question is within scope
  if (!isWithinScope(question)) {
    return "⚠️ This question is outside the scope of this system. I can only answer questions about Surya Teja Devi's portfolio, skills, projects, experience, education, and contact information."
  }
  
  // For twisted questions, generate custom output
  if (isTwisted) {
    return generateCustomTwistedResponse(question)
  }
  
  // Get knowledge chunks
  const knowledgeChunks = getKnowledgeChunks()
  
  // Convert question to vector
  const questionVector = textToVector(question)
  
  // Find best matching chunks
  const matches = knowledgeChunks.map(chunk => {
    const chunkVector = textToVector(chunk.text + ' ' + chunk.keywords.join(' '))
    const similarity = cosineSimilarity(questionVector, chunkVector)
    return { ...chunk, similarity }
  })
  
  // Sort by similarity
  matches.sort((a, b) => b.similarity - a.similarity)
  
  // Get top matches (similarity >= 0.12 for more flexible matching, including typos)
  const topMatches = matches.filter(m => m.similarity >= 0.12)
  
  // If no good matches in knowledge base, try commandOutputs as fallback
  if (topMatches.length === 0 && commandOutputs) {
    let bestMatch = null
    let bestSimilarity = 0
    
    Object.entries(commandOutputs).forEach(([key, value]) => {
      const outputVector = textToVector(value)
      const similarity = cosineSimilarity(questionVector, outputVector)
      
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity
        bestMatch = { key, value }
      }
    })
    
    if (bestSimilarity >= 0.35 && bestMatch) {
      return bestMatch.value
    }
  }
  
  if (topMatches.length === 0) {
    return "⚠️ I couldn't find relevant information to answer that question. Try asking about my skills, projects, experience, education, certifications, leadership, or contact information."
  }
  
  // Generate natural language response
  const response = generateResponse(question, topMatches)
  
  return response
}

/**
 * Legacy function for backward compatibility with command outputs
 */
export const runAIQueryLegacy = (userMessage, commandOutputs) => {
  if (!userMessage || !commandOutputs) {
    return runAIQuery(userMessage)
  }
  
  // Try knowledge base first
  const kbResponse = runAIQuery(userMessage)
  if (!kbResponse.includes('⚠️')) {
    return kbResponse
  }
  
  // Fallback to command outputs
  const userVector = textToVector(userMessage)
  let bestMatch = null
  let bestSimilarity = 0
  
  Object.entries(commandOutputs).forEach(([key, value]) => {
    const outputVector = textToVector(value)
    const similarity = cosineSimilarity(userVector, outputVector)
    
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity
      bestMatch = { key, value }
    }
  })
  
  if (bestSimilarity >= 0.55 && bestMatch) {
    return bestMatch.value
  }
  
  return kbResponse
}
