/**
 * Knowledge Base for Surya Teja Devi's Portfolio Terminal
 * Contains all information about the portfolio owner
 */

export const knowledgeBase = {
  personal: {
    name: "Surya Teja Devi",
    identities: [
      "Developer",
      "Software Engineer",
      "Cybersecurity Enthusiast",
      "Cyber Security Professional",
      "Bug Bounty Hunter",
      "Full-Stack Developer",
      "AI/ML Security Enthusiast"
    ],
    summary: "A security-focused professional passionate about solving real-world problems through technology, with interests in AI, automation, and secure system design. Active in leadership and community roles."
  },

  skills: {
    languages: ["Java", "JavaScript", "Python", "C++"],
    frameworks: ["React.js", "Node.js", "Express", "Tailwind CSS", "Material UI"],
    databases: ["Firebase", "MySQL", "MongoDB"],
    cybersecurity: [
      "Burp Suite",
      "Nmap",
      "Wireshark",
      "OSSEC",
      "Recon & Google/GitHub Dorking",
      "VAPT (Vulnerability Assessment & Penetration Testing)"
    ],
    expertise: [
      "Full-Stack Development",
      "Cybersecurity & Bug Bounty",
      "Cloud Infrastructure & Automation",
      "AI/ML for Security",
      "Threat Detection",
      "Secure System Design"
    ]
  },

  projects: [
    {
      name: "AI-Powered Ambulance Traffic System",
      tech: ["OpenCV", "TensorFlow"],
      description: "Detects ambulances and adjusts traffic signals automatically"
    },
    {
      name: "Tractor Rental Platform",
      tech: ["Flutter", "Firebase"],
      description: "End-to-end rental solution with booking, authentication, and real-time tracking"
    },
    {
      name: "CyberRecon Tool",
      tech: ["Automated recon/dorking"],
      description: "Automated reconnaissance and dorking tool with reporting for bug bounty hunters"
    },
    {
      name: "Automated Cyber Threat Detection",
      tech: ["OSSEC", "Isolation Forest ML"],
      description: "Hybrid system for enterprise threat monitoring"
    },
    {
      name: "Network Performance Benchmarking",
      tech: ["React.js", "Node.js"],
      description: "Full-stack project with React.js frontend and Node.js backend"
    }
  ],

  education: {
    degree: "B.E. in Computer Science",
    period: "2021–2025",
    institution: "CMR College of Engineering & Technology",
    continuousLearning: [
      "Bug Bounty & Pentesting",
      "Java Full-Stack",
      "Cloud Security",
      "AI/ML in Cybersecurity"
    ]
  },

  certifications: [
    "AICTE – Palo Alto Networks Cybersecurity Virtual Internship",
    "Ethical Hacking & Penetration Testing (self-learning)"
  ],

  experience: [
    {
      role: "Cybersecurity Intern",
      company: "AICTE Palo Alto Networks",
      period: "Jul 2024 – Sep 2024",
      details: [
        "Worked with firewalls, IDS/IPS, and security policies",
        "Threat intelligence",
        "Cloud security",
        "Ethical hacking exposure"
      ]
    },
    {
      role: "Project Work",
      company: "Independent",
      period: "2024–2025",
      details: [
        "AI-powered security systems",
        "Full-stack applications",
        "Development + cybersecurity blend"
      ]
    }
  ],

  leadership: [
    {
      role: "Department Coordinator",
      organization: "Azura Event, CMRCET",
      period: "2025",
      description: "Organized and coordinated student activities"
    },
    {
      role: "Student Council Member",
      organization: "CMRCET",
      period: "2022–Present",
      description: "Conducted workshops & hackathons with 200+ participants, represented students in academic decision-making"
    },
    {
      role: "Community Involvement",
      description: "Active in cybersecurity communities, contributor to security awareness"
    }
  ],

  contact: {
    email: "devisuryateja823@gmail.com",
    linkedin: "linkedin.com/in/suryatejadevi",
    github: "github.com/SuryaTejaDevi",
    twitter: "@SuryaTeja_24"
  }
}

/**
 * Get all knowledge chunks as searchable text
 */
export const getKnowledgeChunks = () => {
  const chunks = []

  // Personal info
  chunks.push({
    category: "personal",
    text: `Name: ${knowledgeBase.personal.name}. Professional identities: ${knowledgeBase.personal.identities.join(", ")}. ${knowledgeBase.personal.summary}`,
    keywords: ["name", "who", "about", "identity", "professional", "developer", "engineer", "cybersecurity"]
  })

  // Skills
  chunks.push({
    category: "skills",
    text: `Languages: ${knowledgeBase.skills.languages.join(", ")}. Frameworks: ${knowledgeBase.skills.frameworks.join(", ")}. Databases: ${knowledgeBase.skills.databases.join(", ")}. Cybersecurity tools: ${knowledgeBase.skills.cybersecurity.join(", ")}. Expertise: ${knowledgeBase.skills.expertise.join(", ")}`,
    keywords: ["skills", "technologies", "languages", "frameworks", "tools", "expertise", "what can", "proficient"]
  })

  // Projects
  knowledgeBase.projects.forEach(project => {
    chunks.push({
      category: "projects",
      text: `${project.name}: ${project.description}. Technologies: ${Array.isArray(project.tech) ? project.tech.join(", ") : project.tech}`,
      keywords: ["project", "built", "created", "developed", project.name.toLowerCase(), ...project.tech.map(t => t.toLowerCase())]
    })
  })

  // Education
  chunks.push({
    category: "education",
    text: `Education: ${knowledgeBase.education.degree} (${knowledgeBase.education.period}) at ${knowledgeBase.education.institution}. Continuous learning: ${knowledgeBase.education.continuousLearning.join(", ")}`,
    keywords: ["education", "degree", "college", "university", "studied", "learning", "background"]
  })

  // Certifications
  chunks.push({
    category: "certifications",
    text: `Certifications: ${knowledgeBase.certifications.join(". ")}`,
    keywords: ["certification", "certified", "certificate", "award", "achievement"]
  })

  // Experience
  knowledgeBase.experience.forEach(exp => {
    chunks.push({
      category: "experience",
      text: `${exp.role} at ${exp.company} (${exp.period}): ${exp.details.join(". ")}`,
      keywords: ["experience", "work", "intern", "job", "career", "professional", exp.role.toLowerCase(), exp.company.toLowerCase()]
    })
  })

  // Leadership
  knowledgeBase.leadership.forEach(lead => {
    chunks.push({
      category: "leadership",
      text: `${lead.role}${lead.organization ? ` at ${lead.organization}` : ""}${lead.period ? ` (${lead.period})` : ""}: ${lead.description}`,
      keywords: ["leadership", "coordinator", "council", "community", "organize", "workshop", "hackathon"]
    })
  })

  // Contact
  chunks.push({
    category: "contact",
    text: `Contact: Email ${knowledgeBase.contact.email}, LinkedIn ${knowledgeBase.contact.linkedin}, GitHub ${knowledgeBase.contact.github}, Twitter ${knowledgeBase.contact.twitter}`,
    keywords: ["contact", "email", "linkedin", "github", "twitter", "reach", "connect", "social"]
  })

  return chunks
}

