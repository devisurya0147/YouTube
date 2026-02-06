import React, { useEffect, useState, useRef } from 'react'
import styles from '../styles/Terminal.module.css'
import { runAIQuery, isTwistedQuestion, isWithinScope } from '../services/aiTerminalService'

const Terminal = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState([])
  const [typingInProgress, setTypingInProgress] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [commandHistory, setCommandHistory] = useState([])
  const [loadingState, setLoadingState] = useState(null) // { command, dots, isRed }
  const terminalRef = useRef(null)
  const hiddenInputRef = useRef(null)

  const commandList = [
    'help',
    'about',
    'projects',
    'skills',
    'experience',
    'contact',
    'education',
    'certifications',
    'leadership',
    'sudo',
    'clear'
  ]

  const commandOutputs = {
    help: `Available commands:
about       - Learn about me
projects    - View my projects
skills      - See my technical skills
experience  - My work experience
contact     - How to reach me
education   - My educational background
certifications - View my certifications
leadership  - Leadership and community involvement
sudo        - Special access command
clear       - Clear the terminal

Type any command to continue...`,
    about: `Hi, I'm Surya Teja Devi, a Developer & Cybersecurity Enthusiast.  

I specialize in:  
• Full-Stack Development (Java, React, Node.js)  
• Cybersecurity & Bug Bounty Hunting  
• Cloud Infrastructure & Automation  
• AI/ML Applications in Security  

I'm passionate about building secure, scalable systems and solving real-world problems through technology.`,

    projects: `Recent Projects:  

• NetMoat – Automated Network & Security Monitoring Tool built to analyze traffic patterns, detect anomalies, and identify potential security threats in real time.
• AI-Powered Ambulance Traffic System – Built with OpenCV & TensorFlow to detect ambulances and optimize traffic signals.  
• CyberRecon – Automated reconnaissance & dorking tool for bug bounty hunters with stylized reporting.  
• Automated Cyber Threat Detection – Hybrid OSSEC + Isolation Forest ML system for enterprise threat monitoring.  
• Tractor Rental Platform – End-to-end rental solution with authentication, booking, and real-time tracking using Flutter & Firebase.  
  

Each project highlights my focus on innovation, security, and scalability.

want to check out..? GitHub: github.com/SuryaTejaDevi`,

    skills: `Technical Skills:  

Languages:  
• Java, JavaScript, Python, C++  

Frameworks & Technologies:  
• React.js, Node.js, Express  
• Tailwind CSS, Material UI  
• Firebase, MySQL, MongoDB  

Cybersecurity Tools:  
• Burp Suite, Nmap, Wireshark, OSSEC  
• Recon & Dorking (Google, GitHub)  
• Vulnerability Assessment & Penetration Testing`,

    experience: `Professional Experience:  

Cybersecurity Intern – AICTE Palo Alto Networks (Jul 2024 – Sep 2024)  
• Hands-on with firewalls, IDS/IPS, and security policies.  
• Implemented real-world security best practices.  
• Learned cloud security, threat intelligence, and ethical hacking.  

Projects (2024–2025)  
• Built AI-powered security & full-stack systems.  
• Focused on bridging development with cybersecurity principles.`,

    education: `Educational Background:  

🎓 Bachelor of Engineering in Computer Science – CMR College of Engineering & Technology (2021–2025)  

📚 Continuous Learning:  
• Bug Bounty Hunting & Pentesting  
• Java Full-Stack Development  
• Cloud Security & AI/ML in Cybersecurity`,

    certifications: `Certifications:  

🏆 AICTE – Palo Alto Networks Cybersecurity Virtual Internship  
🏆 Ethical Hacking & Penetration Testing (self-learning)  `,

    leadership: `Leadership & Community:

🎯 Department Coordinator – Azura Event, CMRCET (2025)
• Organized & coordinated student activities.

🟢 GFG Campus Mantri – GeeksforGeeks, CMRCET (2024–Present)
• Served as campus ambassador, organizing coding events and technical sessions.
• Encouraged DSA, competitive programming, and placement-oriented preparation.

👥 Student Council Member – CMR College of Engineering (2022–Present)
• Led technical workshops & hackathons with 200+ participants.
• Represented students in academic decision-making.

🌍 Community Involvement:
• Contributor to security awareness initiatives.
• Active in bug bounty & open-source communities.`,

    contact: `📬 Get In Touch:

Email: devisuryateja823@gmail.com
LinkedIn: linkedin/suryatejadevi
GitHub: github.com/SuryaTejaDevi
Twitter (X): x.com/SuryaTeja_24

Feel free to reach out for collaborations, security consulting, or tech discussions!`,

    sudo: `Hi👋, I'm  Surya Teja Devi, a Software & Cyber Security Engineer.`

  }

  const prompt = "surya@portfolio:~$ "

  // Typing effect
  const typeEffect = (text, callback) => {
    setTypingInProgress(true)
    let i = 0
    let currentLine = ''

    const interval = setInterval(() => {
      currentLine += text.charAt(i)
      setOutput((prev) => {
        const lines = [...prev]
        lines[lines.length - 1] = currentLine
        return lines
      })
      i++
      if (i >= text.length) {
        clearInterval(interval)
        setTypingInProgress(false)
        if (callback) callback()
      }
    }, 20)
  }

  // Helper function to convert contact links to clickable format
  const convertContactLinks = (text) => {
    if (!text) return text

    // Convert email - opens mail client
    text = text.replace(
      /devisuryateja823@gmail\.com/g,
      '<a href="mailto:devisuryateja823@gmail.com" target="_blank" rel="noopener noreferrer" style="color: #00d4ff; text-decoration: underline; cursor: pointer;">devisuryateja823@gmail.com</a>'
    )

    // Convert LinkedIn - friendly label linking to full URL
    text = text.replace(
      /linkedin\/suryatejadevi/g,
      '<a href="https://www.linkedin.com/in/suryatejadevi" target="_blank" rel="noopener noreferrer" style="color: #00d4ff; text-decoration: underline; cursor: pointer;">linkedin/suryatejadevi</a>'
    )

    // Convert GitHub - friendly label linking to full URL
    text = text.replace(
      /github\.com\/SuryaTejaDevi/g,
      '<a href="https://github.com/SuryaTejaDevi" target="_blank" rel="noopener noreferrer" style="color: #00d4ff; text-decoration: underline; cursor: pointer;">github.com/SuryaTejaDevi</a>'
    )

    // Convert Twitter (X) - friendly label linking to full URL
    text = text.replace(
      /x\.com\/SuryaTeja_24/g,
      '<a href="https://x.com/SuryaTeja_24" target="_blank" rel="noopener noreferrer" style="color: #00d4ff; text-decoration: underline; cursor: pointer;">x.com/SuryaTeja_24</a>'
    )

    return text
  }

  // Print command and response
  const printCommandWithResponse = (cmd, response) => {
    setOutput((prev) => [...prev, `${prompt}${cmd}`])
    if (response) {
      setOutput((prev) => [...prev, ""])
      typeEffect(response, () => {
        setOutput((prev) => {
          const newOutput = [...prev]
          // Apply link conversion only to the last typed line to prevent recursive wrapping
          const lastIndex = newOutput.length - 1
          newOutput[lastIndex] = convertContactLinks(newOutput[lastIndex])
          return [...newOutput, " "]
        })
      })
    }
  }

  // Process command input
  const processCommand = (cmd) => {
    const originalCmd = cmd.trim()
    cmd = originalCmd.toLowerCase()

    if (cmd === "clear") {
      setOutput([])
      setFailedAttempts(0)
      setCommandHistory([])
      setLoadingState(null)
      setInput("") // Reset input state for display
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = "" // Manually clear hidden input
      }
      return
    }

    // Direct commands that don't need loading animation
    const directCommands = ['help', 'about', 'projects', 'skills', 'experience', 'contact', 'education', 'certifications', 'leadership', 'sudo', 'clear']

    // Check for exact command match first (direct commands - no loading animation)
    // Only exact matches skip loading - typos will go through loading animation
    if (commandOutputs[cmd] && directCommands.includes(cmd)) {
      printCommandWithResponse(cmd, commandOutputs[cmd])
      setFailedAttempts(0)
      setCommandHistory((prev) => [...prev, cmd])
      return
    }

    if (!originalCmd) return

    // All other inputs get loading animation (whether twisted or normal)
    // Step 1: Show command line once
    setOutput((prev) => [...prev, `${prompt}${originalCmd}`])

    // Step 2: Show error line in RED (for all non-direct commands)
    const errorLine = `bash: ${originalCmd}: command not found`
    setOutput((prev) => [...prev, errorLine])

    // Step 3: Show "Fetching information..." line with dots (white) - combined on same line
    const fetchingLinePrefix = 'Fetching information from AI assistant'
    setOutput((prev) => [...prev, `${fetchingLinePrefix}...`])

    // Start loading state
    setLoadingState({
      command: originalCmd,
      errorLine: errorLine,
      dots: '...',
      isRed: true
    })

    // Three-dot animation (Step C) - cycles: 3 -> 2 -> 1 -> 3
    let dotCount = 3
    const dotInterval = setInterval(() => {
      dotCount = dotCount === 1 ? 3 : dotCount - 1
      const dots = '.'.repeat(dotCount)
      setLoadingState(prev => prev ? {
        ...prev,
        dots: dots
      } : null)
      // Update the fetching line with animated dots
      setOutput((prev) => {
        const newOutput = [...prev]
        // Find the fetching line
        const fetchingIndex = newOutput.findIndex(line =>
          line.startsWith(fetchingLinePrefix)
        )
        if (fetchingIndex !== -1) {
          newOutput[fetchingIndex] = `${fetchingLinePrefix}${dots}`
        }
        return newOutput
      })
    }, 500)

    // After 2 seconds, process the response
    setTimeout(() => {
      clearInterval(dotInterval)

      // First, check for typo-corrected direct commands (fuzzy matching during loading)
      const findClosestCommand = (input, commands, maxDistance = 2) => {
        const inputLower = input.toLowerCase()
        let bestMatch = null
        let bestDistance = Infinity

        commands.forEach(command => {
          const distance = levenshteinDistance(inputLower, command.toLowerCase())
          if (distance <= maxDistance && distance < bestDistance) {
            bestDistance = distance
            bestMatch = command
          }
        })

        return bestMatch && bestDistance <= maxDistance ? bestMatch : null
      }

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

      // Try to find closest match for typos in direct commands (fuzzy matching)
      const correctedCmd = findClosestCommand(originalCmd, directCommands, 2)
      if (correctedCmd && commandOutputs[correctedCmd]) {
        // Found a typo-corrected direct command - show its output
        const response = commandOutputs[correctedCmd]

        // Remove loading line
        setOutput((prev) => {
          const newOutput = [...prev]
          const fetchingIndex = newOutput.findIndex(line =>
            line.startsWith('Fetching information from AI assistant')
          )
          if (fetchingIndex !== -1) {
            newOutput.splice(fetchingIndex, 1)
          }
          return newOutput
        })

        // Change error line from red to white
        setLoadingState(prev => prev ? {
          ...prev,
          isRed: false
        } : null)

        // Show the corrected command's response
        setTimeout(() => {
          setOutput((prev) => [...prev, ""])
          typeEffect(response, () => {
            setOutput((prev) => {
              const newOutput = [...prev]
              const lastIndex = newOutput.length - 1
              newOutput[lastIndex] = convertContactLinks(newOutput[lastIndex])
              return [...newOutput, " "]
            })
          })

          setLoadingState(null)
          setFailedAttempts(0)
          setCommandHistory((prev) => [...prev, originalCmd])
          if (hiddenInputRef.current) {
            hiddenInputRef.current.value = "" // Manually clear hidden input
          }
        }, 100)

        return
      }

      // Get AI response - pass isTwisted flag for custom outputs
      const isTwisted = isTwistedQuestion(originalCmd)
      const aiResponse = runAIQuery(originalCmd, commandOutputs, isTwisted)
      const isError = aiResponse.includes('⚠️') || !isWithinScope(originalCmd)

      // Step D: Remove "Fetching information..." line (with dots)
      setOutput((prev) => {
        const newOutput = [...prev]
        // Remove "Fetching information..." line (which includes dots)
        const fetchingIndex = newOutput.findIndex(line =>
          line.startsWith('Fetching information from AI assistant')
        )
        if (fetchingIndex !== -1) {
          newOutput.splice(fetchingIndex, 1)
        }
        return newOutput
      })

      // Change error line from red to white
      setLoadingState(prev => prev ? {
        ...prev,
        isRed: false
      } : null)

      // Small delay to show white error line before showing response
      setTimeout(() => {
        // Show final response
        if (isError) {
          // Show additional error message
          setOutput((prev) => [...prev, ""])
          typeEffect(
            `I can only provide information about Surya Teja Devi from his portfolio.`,
            () => {
              setOutput((prev) => {
                const newOutput = [...prev]
                const lastIndex = newOutput.length - 1
                newOutput[lastIndex] = convertContactLinks(newOutput[lastIndex])
                return [...newOutput, " "]
              })
            }
          )
        } else {
          // Show the AI response with typing effect
          setOutput((prev) => [...prev, ""])
          typeEffect(aiResponse, () => {
            setOutput((prev) => {
              const newOutput = [...prev]
              const lastIndex = newOutput.length - 1
              newOutput[lastIndex] = convertContactLinks(newOutput[lastIndex])
              return [...newOutput, " "]
            })
          })
        }

        setLoadingState(null)
        setFailedAttempts(0)
        setCommandHistory((prev) => [...prev, originalCmd])
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = "" // Manually clear hidden input
        }
      }, 100)
    }, 2000)
  }



  // Handle input focus
  const handleTerminalClick = (e) => {
    // Don't focus if user is clicking a link
    if (e.target.tagName === 'A') return;

    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus()
    }
  }

  // Handle key down on hidden input
  const handleKeyDown = (e) => {
    if (typingInProgress) {
      e.preventDefault()
      return
    }

    if (e.key === "Enter") {
      e.preventDefault()
      const val = input.trim()
      if (val !== "") {
        processCommand(val)
        setInput("")
        if (hiddenInputRef.current) {
          hiddenInputRef.current.value = "" // Manually clear hidden input
        }
      }
    }
  }

  // Handle input change
  const handleInputChange = (e) => {
    if (typingInProgress) return
    const value = e.target.value
    setInput(value)
  }

  // Welcome message on load
  useEffect(() => {
    setOutput([`${prompt}welcome`, ""])
    typeEffect(
      "Hi, I'm Surya Teja Devi, a Developer & Cyber Security Professional.\n\nWelcome to my interactive portfolio terminal!\nType 'help' to see available commands."
    )
  }, [])

  // Auto scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  return (
    <div className={styles.container} onClick={handleTerminalClick}>
      {/* Hidden input for mobile keyboard support */}
      <input
        ref={hiddenInputRef}
        type="text"
        className={styles.hiddenInput}
        defaultValue=""
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoFocus
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        inputMode="text"
        dir="ltr"
      />

      {/* Navigation Bar */}
      <div className={styles.navigation}>
        <div className={styles.navCommands}>
          {commandList.map((command, index) => (
            <React.Fragment key={command}>
              <span
                className={styles.navCommand}
              >
                {command}
              </span>
              {index < commandList.length - 1 && (
                <span className={styles.separator}> | </span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className={styles.navUnderline}></div>
      </div>

      {/* Terminal Output */}
      <div className={styles.output} ref={terminalRef}>
        {output.map((line, index) => {
          if (line.startsWith(prompt)) {
            const command = line.slice(prompt.length)
            return (
              <div key={index} className={styles.line}>
                <span className={styles.prompt}>{prompt}</span>
                <span className={styles.input}>
                  {command}
                </span>
              </div>
            )
          }

          // Check if this is the error line (bash: command not found)
          if (line.startsWith('bash:') && line.includes('command not found')) {
            const isErrorRed = loadingState && loadingState.isRed && loadingState.errorLine === line
            return (
              <div key={index} className={styles.line} style={{ color: isErrorRed ? '#ff4444' : '#ffffff' }}>
                {line}
              </div>
            )
          }

          // Check if this is the "Fetching information..." line (with dots on same line)
          if (line.startsWith('Fetching information from AI assistant')) {
            // Use current dots from loading state if available, otherwise use what's in the line
            const currentDots = loadingState?.dots || '...'
            const displayLine = loadingState
              ? `Fetching information from AI assistant${currentDots}`
              : line
            return (
              <div key={index} className={styles.line} style={{ color: '#ffffff' }}>
                {displayLine}
              </div>
            )
          }

          return (
            <div key={index} className={`${styles.line} ${styles.output_text}`} dangerouslySetInnerHTML={{ __html: line }}>
            </div>
          )
        })}


        {/* Input Line */}
        <div className={styles.line}>
          <span className={styles.prompt}>{prompt}</span>
          <span className={styles.input}>{input}</span>
          <span className={styles.cursor}>_</span>
        </div>
      </div>

      {/* Terminal Box */}
      <div className={styles.terminalBox}></div>
    </div>
  )
}

export default Terminal