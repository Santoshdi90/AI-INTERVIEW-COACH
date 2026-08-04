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
    customTopic?: string
  ): Promise<QuestionGenerationResult> {
    logger.info(`[MockAI] Generating ${count} ${difficulty} ${type} questions`);
    await new Promise((r) => setTimeout(r, 500));

    const questionTexts = getQuestions(type, count);

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

    const wordCount = answer.split(' ').length;
    const hasSTAR = answer.toLowerCase().includes('situation') ||
      answer.toLowerCase().includes('task') ||
      answer.toLowerCase().includes('action') ||
      answer.toLowerCase().includes('result');

    const grammarScore = Math.min(95, 60 + wordCount * 0.3 + Math.random() * 20);
    const confidenceScore = Math.min(95, 55 + Math.random() * 40);
    const communicationScore = Math.min(95, 58 + (wordCount > 50 ? 20 : 5) + Math.random() * 20);
    const technicalScore = Math.min(95, 50 + Math.random() * 45);
    const starScore = hasSTAR ? Math.min(95, 70 + Math.random() * 25) : Math.min(60, 30 + Math.random() * 30);
    const overall = Math.round((grammarScore + confidenceScore + communicationScore + technicalScore) / 4);

    return {
      grammarScore: Math.round(grammarScore),
      confidenceScore: Math.round(confidenceScore),
      communicationScore: Math.round(communicationScore),
      technicalScore: Math.round(technicalScore),
      overallScore: overall,
      starMethodScore: Math.round(starScore),
      keywordsFound: ['problem-solving', 'teamwork', 'communication'].slice(0, 2),
      keywordsMissing: ['metrics', 'impact', 'leadership'].slice(0, 2),
      idealAnswer: `An ideal answer would clearly explain the concept with a structured approach, provide a concrete real-world example, discuss trade-offs, and demonstrate deep understanding of the subject matter. Use the STAR method when describing experiences and quantify your impact where possible.`,
      suggestions: [
        'Use more specific examples to illustrate your points.',
        'Quantify your achievements with numbers and metrics.',
        'Structure your answer using the STAR method (Situation, Task, Action, Result).',
        'Speak more confidently and avoid filler words like "um" and "uh".',
      ],
      grammarIssues: wordCount < 20 ? ['Answer is too brief - aim for at least 2-3 sentences.'] : [],
      strengths: ['Clear communication', 'Good structure'],
      weaknesses: wordCount < 30 ? ['Answer lacks detail'] : ['Could provide more specific examples'],
    };
  },

  async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
    logger.info('[MockAI] Analyzing resume...');
    await new Promise((r) => setTimeout(r, 1200));

    const hasEducation = resumeText.toLowerCase().includes('education') ||
      resumeText.toLowerCase().includes('university') ||
      resumeText.toLowerCase().includes('degree');

    const hasExperience = resumeText.toLowerCase().includes('experience') ||
      resumeText.toLowerCase().includes('worked') ||
      resumeText.toLowerCase().includes('employed');

    const detectedSkills: string[] = [];
    const techKeywords = ['javascript', 'typescript', 'react', 'node', 'python', 'java', 'sql', 'docker', 'aws', 'git', 'html', 'css', 'mongodb', 'postgresql', 'redis', 'kubernetes', 'graphql', 'rest'];
    for (const keyword of techKeywords) {
      if (resumeText.toLowerCase().includes(keyword)) {
        detectedSkills.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }

    if (detectedSkills.length === 0) {
      detectedSkills.push('Communication', 'Problem Solving', 'Teamwork');
    }

    const allSkills = ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'System Design', 'Microservices'];
    const missingSkills = allSkills.filter(s => !detectedSkills.includes(s)).slice(0, 4);

    const overallScore = Math.round(55 + (hasEducation ? 15 : 0) + (hasExperience ? 15 : 0) + detectedSkills.length * 2 + Math.random() * 10);
    const atsScore = Math.round(50 + detectedSkills.length * 3 + Math.random() * 20);

    return {
      overallScore: Math.min(overallScore, 95),
      atsScore: Math.min(atsScore, 95),
      skills: detectedSkills,
      missingSkills,
      strengths: [
        'Clear and concise writing style',
        'Relevant technical skills mentioned',
        hasExperience ? 'Demonstrates relevant work experience' : 'Fresh perspective and eagerness to learn',
        hasEducation ? 'Strong educational background' : 'Self-taught demonstrates initiative',
      ],
      weaknesses: [
        'Consider adding quantifiable achievements',
        'Missing a professional summary/objective section',
        missingSkills.length > 0 ? `Consider adding: ${missingSkills.slice(0, 2).join(', ')}` : 'Great skill coverage',
      ],
      suggestions: [
        'Add specific metrics and numbers to demonstrate impact (e.g., "Increased performance by 40%").',
        'Use strong action verbs at the beginning of each bullet point.',
        'Include a compelling professional summary at the top.',
        'Tailor your resume keywords to match job descriptions for better ATS scoring.',
        'Add links to your GitHub, LinkedIn, or portfolio.',
      ],
      experience: hasExperience ? '2-4 years (estimated from resume content)' : 'Entry level / Fresher',
      education: hasEducation ? 'Bachelor\'s or higher degree detected' : 'Education section not found',
      summary: `This resume demonstrates ${detectedSkills.length > 5 ? 'strong' : 'moderate'} technical proficiency with a focus on ${detectedSkills.slice(0, 3).join(', ')}. ${hasExperience ? 'Work experience is present and relevant.' : 'The candidate appears to be entry-level.'} Overall presentation is ${overallScore > 70 ? 'professional' : 'adequate but could be improved'}.`,
      keywordDensity: Math.round(30 + Math.random() * 40),
      formattingScore: Math.round(60 + Math.random() * 35),
      readabilityScore: Math.round(65 + Math.random() * 30),
    };
  },
};
