import { AIFeedbackResult, QuestionGenerationResult, ResumeAnalysis, InterviewType, Difficulty } from '../types';
import { logger } from '../config/logger';

const mockQuestionBanks: Record<string, string[]> = {
  HR: [
    'Tell me about yourself and your professional journey.',
    'Why are you interested in this position?',
    'What are your greatest strengths?',
    'What is your biggest weakness and how are you working on it?',
    'Where do you see yourself in 5 years?',
    'Describe a challenging situation and how you overcame it.',
    'Why are you leaving your current job?',
    'What motivates you in your work?',
    'How do you handle work-life balance?',
    'What salary are you expecting?',
  ],
  TECHNICAL: [
    'Explain the difference between REST and GraphQL.',
    'What is the CAP theorem in distributed systems?',
    'Explain Big O notation and give examples.',
    'What is the difference between SQL and NoSQL databases?',
    'Describe the SOLID principles of object-oriented programming.',
    'What is a microservices architecture?',
    'Explain how garbage collection works.',
    'What is the difference between authentication and authorization?',
    'Describe the HTTP request-response lifecycle.',
    'What are design patterns? Name and explain 3 commonly used ones.',
  ],
  BEHAVIORAL: [
    'Tell me about a time you had to work under pressure.',
    'Describe a situation where you had to collaborate with a difficult colleague.',
    'Give an example of when you showed leadership skills.',
    'Tell me about a project that failed and what you learned from it.',
    'Describe a time when you had to quickly learn a new technology.',
    'How have you handled receiving critical feedback?',
    'Tell me about your most significant professional achievement.',
    'Describe a time when you had to manage competing priorities.',
    'Give an example of when you went above and beyond for a customer.',
    'Tell me about a time you had to make a difficult decision with limited information.',
  ],
  SYSTEM_DESIGN: [
    'Design a URL shortening service like Bit.ly.',
    'How would you design Twitter?',
    'Design a distributed cache system.',
    'How would you design a ride-sharing application like Uber?',
    'Design a notification system that can send millions of notifications per day.',
    'How would you design a video streaming platform like YouTube?',
    'Design a real-time chat application.',
    'How would you scale a web application to handle 1 million users?',
    'Design a search engine.',
    'How would you design an API rate limiter?',
  ],
  REACT: [
    'What are React hooks and how do they differ from class components?',
    'Explain the Virtual DOM and how React\'s reconciliation algorithm works.',
    'What is the difference between useCallback and useMemo?',
    'How does React Context API work? When would you use it vs Redux?',
    'Explain code splitting and lazy loading in React.',
    'What are controlled vs uncontrolled components?',
    'How do you optimize performance in a React application?',
    'Explain React\'s component lifecycle (using hooks).',
    'What is server-side rendering (SSR) vs client-side rendering?',
    'How do you handle forms in React?',
  ],
  JAVASCRIPT: [
    'Explain event bubbling and event capturing in JavaScript.',
    'What is the event loop and how does JavaScript handle asynchronous code?',
    'What is closure and give a practical example?',
    'Explain prototypal inheritance in JavaScript.',
    'What are Promises and how do they differ from async/await?',
    'Explain "this" keyword in different contexts.',
    'What is the difference between == and ===?',
    'How do generators work in JavaScript?',
    'What is the difference between var, let, and const?',
    'Explain debouncing and throttling.',
  ],
  NODE: [
    'What is the Node.js event loop?',
    'How does Node.js handle concurrent requests being single-threaded?',
    'What are streams in Node.js and when would you use them?',
    'Explain clustering in Node.js.',
    'What is the difference between process.nextTick and setImmediate?',
    'How do you handle errors in Node.js?',
    'What is middleware in Express.js?',
    'How do you manage environment variables in a Node.js application?',
    'Explain the module system in Node.js (CommonJS vs ESM).',
    'How do you build a RESTful API with Node.js and Express?',
  ],
  DATABASE: [
    'What is database normalization and what are the normal forms?',
    'Explain ACID properties in database transactions.',
    'What is an index and how does it improve query performance?',
    'Explain the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN.',
    'What is database sharding?',
    'How does database connection pooling work?',
    'What is a stored procedure vs a function in SQL?',
    'Explain deadlocks and how to prevent them.',
    'What is a materialized view?',
    'How does PostgreSQL handle MVCC (Multi-Version Concurrency Control)?',
  ],
  FRONTEND: [
    'What is the Critical Rendering Path?',
    'How does browser caching work?',
    'Explain CSS Box Model.',
    'What is Flexbox and when would you use it vs CSS Grid?',
    'How does a browser render a web page?',
    'Explain Cross-Origin Resource Sharing (CORS).',
    'What are Web Workers?',
    'Explain the difference between localStorage, sessionStorage, and cookies.',
    'What is a Content Delivery Network (CDN) and why is it used?',
    'How would you improve website performance?',
  ],
  BACKEND: [
    'What is RESTful architecture?',
    'Explain the differences between PUT and PATCH HTTP methods.',
    'How does JWT authentication work?',
    'What is OAuth 2.0?',
    'Explain rate limiting and how you would implement it.',
    'What is a reverse proxy?',
    'How do you handle file uploads in a backend application?',
    'What are webhooks?',
    'How would you implement caching in a backend application?',
    'What is gRPC and how does it differ from REST?',
  ],
  JAVA: [
    'Explain the differences between abstract classes and interfaces in Java.',
    'What is the JVM and how does it work?',
    'Explain Java\'s memory management and garbage collection.',
    'What are generics in Java?',
    'Explain the Java Collections Framework.',
    'What is multithreading in Java?',
    'What are design patterns used in Java?',
    'Explain Spring Framework and dependency injection.',
    'What is the difference between checked and unchecked exceptions?',
    'How does Java handle synchronization?',
  ],
  OS: [
    'What is the difference between a process and a thread?',
    'Explain deadlock and the conditions for it.',
    'What is virtual memory?',
    'Explain different CPU scheduling algorithms.',
    'What is a semaphore vs a mutex?',
    'How does paging work in an operating system?',
    'What is a system call?',
    'Explain inter-process communication (IPC) mechanisms.',
    'What is thrashing in an operating system?',
    'How do file systems work?',
  ],
  COMPUTER_NETWORKS: [
    'Explain the OSI model and each layer.',
    'What is the difference between TCP and UDP?',
    'How does DNS work?',
    'Explain the three-way handshake in TCP.',
    'What is NAT (Network Address Translation)?',
    'Explain subnetting.',
    'What is HTTP/2 and how does it differ from HTTP/1.1?',
    'How do firewalls work?',
    'What is ARP (Address Resolution Protocol)?',
    'Explain BGP (Border Gateway Protocol).',
  ],
  DBMS: [
    'What is the difference between DBMS and RDBMS?',
    'Explain ER diagrams.',
    'What are triggers in SQL?',
    'Explain database transactions and isolation levels.',
    'What is a cursor in SQL?',
    'Explain different types of joins.',
    'What is a composite key?',
    'Explain referential integrity.',
    'What are aggregate functions in SQL?',
    'What is denormalization?',
  ],
  OOPS: [
    'Explain the four pillars of OOP.',
    'What is polymorphism and what are its types?',
    'Explain encapsulation with a real-world example.',
    'What is the difference between composition and inheritance?',
    'Explain method overloading vs method overriding.',
    'What is an abstract class?',
    'What is an interface?',
    'Explain the Liskov Substitution Principle.',
    'What is a design pattern? Give 3 examples.',
    'What is coupling and cohesion?',
  ],
  CUSTOM: [
    'Tell me about your experience with this topic.',
    'What challenges have you faced in this area?',
    'How would you approach solving a complex problem in this domain?',
    'Describe a project where you used this technology.',
    'What best practices do you follow in this area?',
  ],
};

function getQuestions(type: InterviewType, count: number): string[] {
  const bankKey = type as string;
  const bank = mockQuestionBanks[bankKey] || mockQuestionBanks['TECHNICAL'];
  const shuffled = [...bank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, bank.length));
}

export const mockAIService = {
  async generateInterviewQuestions(
    type: InterviewType,
    difficulty: Difficulty,
    count: number,
    customTopic?: string,
    context?: any
  ): Promise<QuestionGenerationResult> {
    logger.info(`[MockAI] Generating ${count} ${difficulty} ${type} questions`);
    await new Promise((r) => setTimeout(r, 500));

    let questionTexts = getQuestions(type, count);

    // Personalize questions using context
    if (context) {
      const role = context.targetRole || '';
      const company = context.targetCompany || '';
      
      questionTexts = questionTexts.map((text, idx) => {
        if (idx === 0 && role) {
          return `How would you apply your experience as a ${role} to: ${text.charAt(0).toLowerCase() + text.slice(1)}`;
        }
        if (idx === 1 && company) {
          return `At a company like ${company}, how would you approach: ${text.charAt(0).toLowerCase() + text.slice(1)}`;
        }
        return text;
      });
    }

    const questions = questionTexts.map((text, index) => ({
      text: customTopic && type === 'CUSTOM' ? `${customTopic}: ${text}` : text,
      category: type.toString(),
      hints: [`Think about a specific example`, `Use the STAR method if applicable`],
      expectedTime: difficulty === 'EASY' ? 90 : difficulty === 'MEDIUM' ? 150 : 240,
      orderIndex: index,
    }));

    return { questions };
  },

  async analyzeAnswer(
    question: string,
    answer: string,
    _type: InterviewType
  ): Promise<AIFeedbackResult> {
    logger.info(`[MockAI] Analyzing answer for question: "${question.substring(0, 50)}..."`);
    await new Promise((r) => setTimeout(r, 800));

    const cleanAnswer = answer.trim().toLowerCase();
    const isEvasive = cleanAnswer.length < 15 || 
                      cleanAnswer === "i don't know" || 
                      cleanAnswer.includes("don't know") || 
                      cleanAnswer.includes("do not know") || 
                      cleanAnswer.includes("no idea") ||
                      cleanAnswer === "pass" ||
                      cleanAnswer === "skip";

    if (isEvasive) {
      return {
        grammarScore: 80,
        confidenceScore: 10,
        communicationScore: 10,
        technicalScore: 0,
        overallScore: 25,
        starMethodScore: 0,
        keywordsFound: [],
        keywordsMissing: ['explanation', 'details', 'STAR methodology'],
        idealAnswer: `An ideal response to "${question}" should demonstrate your understanding of the concept, provide relevant technical definitions, outline practical use cases, and present an example using the Situation-Task-Action-Result (STAR) structure.`,
        suggestions: [
          'Please do not leave the question blank or say "I don\'t know". Try to explain whatever basic concepts you are familiar with.',
          'Review the study materials for this topic to understand core definitions.',
          'Always structure your answers by setting the context first, then describing your actions and results.'
        ],
        grammarIssues: [],
        strengths: [],
        weaknesses: [
          'Answer transcript was too short or indicated lack of knowledge.',
          'Failed to provide any technical or conceptual explanations.'
        ]
      };
    }

    // Normal answer processing
    const wordCount = answer.split(/\s+/).length;
    const lowercaseAnswer = answer.toLowerCase();

    // Check for STAR indicators
    const starIndicators = {
      situation: lowercaseAnswer.includes('situation') || lowercaseAnswer.includes('when i was') || lowercaseAnswer.includes('at my last'),
      task: lowercaseAnswer.includes('task') || lowercaseAnswer.includes('goal') || lowercaseAnswer.includes('target'),
      action: lowercaseAnswer.includes('action') || lowercaseAnswer.includes('i did') || lowercaseAnswer.includes('we resolved') || lowercaseAnswer.includes('implemented'),
      result: lowercaseAnswer.includes('result') || lowercaseAnswer.includes('outcome') || lowercaseAnswer.includes('impact') || lowercaseAnswer.includes('saved') || lowercaseAnswer.includes('%')
    };

    const starMatches = Object.values(starIndicators).filter(Boolean).length;
    const starMethodScore = Math.min(100, Math.round((starMatches / 4) * 100));

    // Keyword detection
    const candidates = ['performance', 'scaling', 'optimization', 'architecture', 'best practices', 'design', 'components', 'state', 'hooks', 'lifecycle', 'apis', 'security', 'database', 'rest', 'graphql'];
    const keywordsFound = candidates.filter(k => lowercaseAnswer.includes(k));
    const keywordsMissing = candidates.filter(k => !lowercaseAnswer.includes(k)).slice(0, 3);

    // Dynamic scoring calculations based on length & content
    const technicalScore = Math.min(98, Math.round(50 + (keywordsFound.length * 8) + (wordCount > 60 ? 15 : 5)));
    const confidenceScore = Math.min(95, Math.round(60 + (wordCount > 40 ? 20 : 5) - (lowercaseAnswer.includes('maybe') || lowercaseAnswer.includes('sorry') ? 15 : 0)));
    const communicationScore = Math.min(98, Math.round(55 + (starMethodScore * 0.3) + (wordCount > 50 ? 15 : 0)));
    const grammarScore = Math.min(98, Math.round(75 + (wordCount > 10 ? 15 : 0) - (lowercaseAnswer.includes('um') || lowercaseAnswer.includes('like') ? 10 : 0)));
    
    const overallScore = Math.round((technicalScore + confidenceScore + communicationScore + grammarScore) / 4);

    // Dynamic suggestions based on calculated scores
    const suggestions: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (technicalScore > 75) {
      strengths.push('Demonstrated solid technical depth and conceptual understanding.');
    } else {
      weaknesses.push('Technical explanation lacks depth or specific terminology.');
      suggestions.push('Incorporate more precise industry terms and explain underlying mechanics (e.g. how it functions under the hood).');
    }

    if (communicationScore > 75) {
      strengths.push('Clear expression, good structure and pacing.');
    } else {
      weaknesses.push('Explanation felt disjointed or brief.');
      suggestions.push('Structure your answer chronologically: context first, followed by your action and final metrics.');
    }

    if (starMethodScore < 50) {
      weaknesses.push('Did not follow the STAR method structure.');
      suggestions.push('Always frame your examples using the STAR method (Situation, Task, Action, Result) to clarify your specific contribution.');
    } else {
      strengths.push('Well-structured narrative that effectively details context and results.');
    }

    if (lowercaseAnswer.includes('um') || lowercaseAnswer.includes('uh') || lowercaseAnswer.includes('like')) {
      suggestions.push('Minimize verbal fillers such as "um", "uh", or "like" to sound more assertive.');
    }

    if (suggestions.length === 0) {
      suggestions.push('Maintain your current high standard; try practicing under tighter time limits.');
    }

    return {
      grammarScore,
      confidenceScore,
      communicationScore,
      technicalScore,
      overallScore,
      starMethodScore,
      keywordsFound,
      keywordsMissing,
      idealAnswer: `A strong answer should define the topic clearly (e.g. explaining specific trade-offs), then detail a real-world scenario outlining the Situation, the exact Task, the Actions you performed, and the quantitative Results (e.g., performance improvements or cost savings).`,
      suggestions,
      grammarIssues: lowercaseAnswer.includes('um') ? ['Spoken filler words ("um") detected.'] : [],
      strengths,
      weaknesses
    };
  },

  async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    logger.info('[MockAI] Analyzing resume...');
    await new Promise((r) => setTimeout(r, 1200));

    const lowercaseText = (resumeText || '').toLowerCase();

    const hasEducation = lowercaseText.includes('education') ||
      lowercaseText.includes('university') ||
      lowercaseText.includes('degree') ||
      lowercaseText.includes('bachelor') ||
      lowercaseText.includes('college');

    const hasExperience = lowercaseText.includes('experience') ||
      lowercaseText.includes('worked') ||
      lowercaseText.includes('employment') ||
      lowercaseText.includes('engineer') ||
      lowercaseText.includes('developer');

    // Extract skills dynamically
    const detectedSkills: string[] = [];
    const techKeywords = [
      'javascript', 'typescript', 'react', 'node', 'python', 'java', 'sql', 'docker', 
      'aws', 'git', 'html', 'css', 'mongodb', 'postgresql', 'redis', 'kubernetes', 
      'graphql', 'rest', 'vue', 'angular', 'c++', 'go', 'rust', 'next.js', 'express'
    ];
    for (const keyword of techKeywords) {
      if (lowercaseText.includes(keyword)) {
        detectedSkills.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }

    if (detectedSkills.length === 0) {
      detectedSkills.push('Communication', 'Problem Solving', 'Teamwork');
    }

    // Determine target role by scanning text (fallback to general software engineer)
    let role = 'Software Engineer';
    if (lowercaseText.includes('frontend') || lowercaseText.includes('react') || lowercaseText.includes('ui')) {
      role = 'Frontend Engineer';
    } else if (lowercaseText.includes('backend') || lowercaseText.includes('node') || lowercaseText.includes('database')) {
      role = 'Backend Engineer';
    } else if (lowercaseText.includes('data scientist') || lowercaseText.includes('machine learning')) {
      role = 'Data Scientist';
    } else if (lowercaseText.includes('devops') || lowercaseText.includes('cloud')) {
      role = 'DevOps Engineer';
    }

    // Define standard skill lists for role-based recommendations
    const roleSkills: Record<string, string[]> = {
      'Frontend Engineer': ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Redux', 'GraphQL', 'Webpack'],
      'Backend Engineer': ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'REST APIs', 'System Design', 'Microservices'],
      'Data Scientist': ['Python', 'Pandas', 'NumPy', 'TensorFlow', 'SQL', 'Scikit-Learn', 'Machine Learning'],
      'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'CI/CD Pipelines', 'Terraform', 'Linux', 'Ansible'],
      'Software Engineer': ['Git', 'SQL', 'Data Structures', 'Algorithms', 'Docker', 'REST APIs']
    };

    const targetSkills = roleSkills[role] || roleSkills['Software Engineer'];
    
    // Recommendations: skills that are in the target list but NOT in detected list
    const missingSkills = targetSkills.filter(s => !detectedSkills.some(ds => ds.toLowerCase() === s.toLowerCase())).slice(0, 4);

    const overallScore = Math.min(95, Math.round(55 + (hasEducation ? 15 : 0) + (hasExperience ? 15 : 0) + detectedSkills.length * 2));
    const atsScore = Math.min(95, Math.round(50 + detectedSkills.length * 3));

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (hasExperience) {
      strengths.push('Demonstrates relevant work experience and professional exposure.');
    } else {
      weaknesses.push('Lacks clear professional work history section.');
      suggestions.push('Add an "Experience" section detailing internships, freelance contracts, or academic team leadership roles.');
    }

    if (hasEducation) {
      strengths.push('Strong educational/academic credentials present.');
    } else {
      weaknesses.push('Education background is not clearly visible.');
      suggestions.push('Add a short "Education" section mentioning your degree, major, and graduation year.');
    }

    if (detectedSkills.length > 5) {
      strengths.push('Wide technical skill coverage matches industry requirements.');
    } else {
      weaknesses.push('Technical skill index is low; matches very few core keywords.');
      suggestions.push('List specific technical skills, libraries, and frameworks you know instead of general terms.');
    }

    suggestions.push('Add quantifiable, metric-driven achievements to bullet points (e.g. "optimized API response time by 30%").');
    suggestions.push('Add links to active professional profiles like GitHub or LinkedIn.');
    
    if (missingSkills.length > 0) {
      suggestions.push(`Consider acquiring and listing core skills for ${role} positions, such as: ${missingSkills.join(', ')}.`);
    }

    return {
      overallScore,
      atsScore,
      skills: detectedSkills,
      missingSkills,
      strengths,
      weaknesses,
      suggestions,
      experience: hasExperience ? 'Professional level detected' : 'Entry level / Academic',
      education: hasEducation ? 'Academic degrees detected' : 'Not found',
      summary: `The resume indicates technical proficiency in ${detectedSkills.slice(0, 3).join(', ')} targeting a ${role} position. Formatting and scanning suitability is graded at ${atsScore}%.`,
      keywordDensity: Math.round(40 + detectedSkills.length * 4),
      formattingScore: Math.round(70 + Math.random() * 20),
      readabilityScore: Math.round(75 + Math.random() * 15),
    };
  },
};
