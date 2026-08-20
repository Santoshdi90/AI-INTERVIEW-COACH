export function validateResumeHeuristics(text: string): { isValid: boolean; reason?: string } {
  if (!text || text.trim().length < 50) {
    return {
      isValid: false,
      reason: 'The uploaded file is empty or contains too little text to be a valid resume/CV.'
    };
  }

  const lowercaseText = text.toLowerCase();

  // 1. Check for basic resume keywords representing standard sections (must match at least 2)
  const sections = [
    ['experience', 'work', 'employment', 'history', 'professional', 'career', 'job', 'worked'],
    ['education', 'university', 'college', 'degree', 'school', 'academic', 'graduated'],
    ['skills', 'technologies', 'languages', 'tools', 'competencies', 'expertise', 'tech stack'],
    ['projects', 'portfolio', 'personal projects'],
    ['certifications', 'certificates', 'awards', 'organizations', 'courses']
  ];

  let matchedSectionsCount = 0;
  for (const group of sections) {
    if (group.some(keyword => lowercaseText.includes(keyword))) {
      matchedSectionsCount++;
    }
  }

  // 2. Check for contact information indicators (email or phone or linkedin/github links)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const hasEmail = emailRegex.test(lowercaseText);
  const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g.test(lowercaseText) || 
                   /\+\d{1,3}\s?\d{4,12}/g.test(lowercaseText) ||
                   /\b\d{10}\b/g.test(lowercaseText);
  const hasProfiles = lowercaseText.includes('linkedin.com') || 
                      lowercaseText.includes('github.com') ||
                      lowercaseText.includes('portfolio') ||
                      lowercaseText.includes('contact');

  const hasContactInfo = hasEmail || hasPhone || hasProfiles;

  if (matchedSectionsCount < 2) {
    return {
      isValid: false,
      reason: 'This document does not contain standard resume sections (such as Experience, Education, or Skills).'
    };
  }

  if (!hasContactInfo) {
    return {
      isValid: false,
      reason: 'This document does not contain valid contact information (email, phone, or LinkedIn/portfolio links).'
    };
  }

  return { isValid: true };
}
