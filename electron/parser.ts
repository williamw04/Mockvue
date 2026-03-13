// @ts-ignore
import pdf = require('pdf-parse');
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

/**
 * Extracts raw text from a PDF file
 */
export async function extractText(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

/**
 * Parses resume text using Gemini 3.0 Flash Preview
 */
export async function parseResumeWithGemini(text: string, apiKey: string): Promise<any> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
    You are a resume parsing assistant. 
    1. Extract the information from the resume text below. 
       CRITICAL: For work experiences, do NOT dump the bullet points into the "description" field. You MUST extract the specific accomplishments and bullet points into the "achievements" array as individual strings. Keep "description" to a very brief 1-sentence summary or leave it empty.
    2. Analyze the candidate's work experiences and projects to suggest one strong match for each of the 10 "Behavioral Core Stories". 

    The 10 Behavioral Core Stories are:
    - "conflict": A time they disagreed with a peer or supervisor and resolved it.
    - "failure": A genuine mistake they made and what they learned.
    - "leadership": A time they took the lead to mobilize others, formal title or not.
    - "adaptability": A time priorities shifted rapidly and they had to adapt.
    - "tight-deadline": A time they were overwhelmed and had to prioritize.
    - "difficult-customer": A time they handled a difficult stakeholder or customer.
    - "data-driven-decision": A time they made a choice with incomplete or complex data.
    - "above-and-beyond": A time they exceeded expectations intrinsically.
    - "persuasion": A time they used logic, data, or rapport to convince a skeptic.
    - "proudest-accomplishment": Their hero story highlighting their best work.

    Return the result as a valid JSON object strictly matching this structure:
    
    Structure:
    {
      "firstName": string,
      "lastName": string,
      "email": string,
      "phone": string,
      "summary": string,
      "workExperience": [
        {
          "company": string,
          "position": string,
          "startDate": string (YYYY-MM or "Present"),
          "endDate": stringOrNull (YYYY-MM or null),
          "description": string,
          "achievements": string[]
        }
      ],
      "education": [
        {
          "school": string,
          "degree": string,
          "field": string,
          "startDate": string,
          "endDate": string
        }
      ],
      "skills": string[],
      "projects": [
        {
          "title": string,
          "description": string,
          "role": string,
          "technologies": string[],
          "url": stringOrNull
        }
      ],
      "coreStoryMatches": [
        {
          "category": string (must be one of: "conflict", "failure", "leadership", "adaptability", "tight-deadline", "difficult-customer", "data-driven-decision", "above-and-beyond", "persuasion", "proudest-accomplishment"),
          "relatedExperienceId": string (The company name or project title that best matches),
          "reasoning": string (1-2 sentences explaining why this experience is a good fit for the category)
        }
      ]
    }

    Resume Text:
    ${text}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const textResponse = response.text();

  console.log("====== GEMINI PARSER PROMPT ======");
  console.log(prompt);
  console.log("==================================");

  console.log("====== GEMINI RAW RESPONSE ======");
  console.log(textResponse);
  console.log("=================================");

  // Clean up code blocks if present
  const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON", textResponse);
    throw new Error("Failed to parse resume data");
  }
}

/**
 * Analyzes resume bullets for quality issues and identifies trigger points
 */
export async function analyzeResumeBullets(resumeData: any, apiKey: string): Promise<any> {
  console.log("[analyzeResumeBullets] API Key present:", !!apiKey, "Length:", apiKey?.length);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  // Build a compact representation of the resume for the prompt
  const experienceSummary = (resumeData.workExperiences || []).map((exp: any) => ({
    id: exp.id,
    company: exp.company,
    position: exp.position,
    achievements: exp.achievements || [],
  }));

  const prompt = `
    You are a senior resume consultant and interview strategist. Analyze the following resume data in two passes:

    **PASS 1: BULLET ANALYSIS**
    For EACH achievement bullet in EACH work experience, evaluate:
    1. **Weak Verb**: Does it start with a weak or passive verb? (e.g., "managed", "helped", "was responsible for", "assisted", "worked on")
    2. **No Metrics**: Does it lack quantification? (numbers, percentages, dollar amounts, time saved)
    3. **Too Brief**: Is it under 8 words or lacking substance?
    4. **Bad Structure**: Does it fail to follow the XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]") or PSR/CAR frameworks?
    5. **Passive Voice**: Is it written in passive voice?

    For each bullet, suggest a rewrite that fixes ALL identified issues. Use strong impact verbs (orchestrated, spearheaded, engineered, negotiated, accelerated, remediated, etc.).
    Rate each bullet's impact on a scale of 1-10.

    **PASS 2: TRIGGER POINT ANALYSIS**
    Identify 5-8 "trigger points" — things a recruiter would DEFINITELY ask about in an interview. These include:
    - Impressive claims that beg follow-up ("reduced latency by 40%" → "How did you measure that?")
    - Interesting transitions (role changes, company changes)
    - Technical depth claims
    - Leadership or cross-functional work
    - Gaps or unusual patterns

    For each trigger point, explain WHY a recruiter would probe it and what story the candidate should have ready.

    Also calculate an overall resume score from 0-100 based on:
    - Bullet quality (40%): Average impact score across all bullets
    - Quantification coverage (30%): % of bullets with metrics
    - Structure consistency (30%): % of bullets following a framework

    **Resume Data:**
    ${JSON.stringify(experienceSummary, null, 2)}

    **Return valid JSON matching this exact structure:**
    {
      "bulletAnalyses": [
        {
          "experienceId": "string (the experience id)",
          "bulletIndex": 0,
          "originalBullet": "string",
          "issues": [
            {
              "type": "weak_verb" | "no_metrics" | "too_brief" | "bad_structure" | "passive_voice",
              "message": "string (brief explanation)",
              "suggestion": "string (how to fix)"
            }
          ],
          "suggestedRewrite": "string (full rewrite of the bullet)",
          "impactScore": 7
        }
      ],
      "triggerPoints": [
        {
          "id": "tp-1",
          "experienceId": "string (related experience id)",
          "description": "string (what the recruiter would ask about)",
          "whyItMatters": "string (why this stands out)"
        }
      ],
      "overallScore": SCORE_GOES_HERE
    }
  `;

  console.log("[analyzeResumeBullets] Sending request to Gemini...");
  
  let textResponse: string;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    textResponse = response.text();
    console.log("[analyzeResumeBullets] Received response, length:", textResponse.length);
  } catch (err: any) {
    console.error("[analyzeResumeBullets] Gemini API error:", err.message);
    console.error("[analyzeResumeBullets] Error details:", err);
    throw new Error(`Gemini API failed: ${err.message}`);
  }

  console.log("====== GEMINI ANALYSIS PROMPT ======");
  console.log(prompt);
  console.log("====================================");

  console.log("====== GEMINI ANALYSIS RESPONSE ======");
  console.log(textResponse);
  console.log("======================================");

  const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse Gemini analysis response as JSON", textResponse);
    throw new Error("Failed to parse resume analysis");
  }
}

/**
 * Chat with Gemini using resume analysis as context
 */
export async function chatWithResumeContext(
  messages: Array<{ role: string; content: string }>,
  analysisContext: any,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const systemPrompt = `
    You are a senior resume consultant and interview strategist helping a candidate improve their resume and prepare for interviews.

    Here is the candidate's resume analysis data for context:
    ${JSON.stringify(analysisContext, null, 2)}

    Use this context to provide specific, actionable advice. Reference specific bullets, trigger points, and scores when relevant.
    Be concise but helpful. If the user asks about rewrites, provide concrete examples.
    If they ask about interview prep, tie it back to their specific experiences and trigger points.
  `;

  // Build conversation history for Gemini
  const conversationParts = messages.map(msg => ({
    role: msg.role === 'user' ? 'user' as const : 'model' as const,
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I have your resume analysis loaded. How can I help you improve your resume and prepare for interviews?' }] },
      ...conversationParts.slice(0, -1),
    ],
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  const response = await result.response;
  return response.text();
}

export interface ATSCheckResult {
  checkName: string;
  status: 'pass' | 'warning' | 'fail';
  score: number;
  details: string;
  recommendation?: string;
}

export interface ATSAnalysisResult {
  overallScore: number;
  checks: ATSCheckResult[];
  analyzedAt: string;
}

const STANDARD_HEADERS = {
  experience: /professional\s*experience|work\s*experience|employment\s*history|work\s*history/i,
  education: /education|academic\s*background|qualifications/i,
  skills: /skills|technical\s*skills|competencies|technologies/i
};

function extractDatesFromText(text: string): number[] {
  const datePatterns = [
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/gi,
    /(\d{4})\s*[-–—to]+\s*(?:present|\d{4})/gi,
    /(\d{4})/g
  ];
  
  const dates: number[] = [];
  for (const pattern of datePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const year = parseInt(match[1], 10);
      if (year >= 1970 && year <= new Date().getFullYear() + 1) {
        dates.push(year);
      }
    }
  }
  return [...new Set(dates)].sort((a, b) => b - a);
}

async function checkSingleColumn(text: string): Promise<ATSCheckResult> {
  try {
    const lines = text.split('\n');
    const nonEmptyLines = lines.filter((l, i) => l.trim().length > 0);
    
    // Track line numbers for issues
    const issues: { type: string; line: number; content: string }[] = [];
    
    // Check for multiple indentation levels (suggests columns or complex formatting)
    lines.forEach((line, i) => {
      if (line.trim().length === 0) return;
      const match = line.match(/^(\s*)/);
      const indent = match ? match[1].length : 0;
      if (indent > 20) {
        issues.push({ type: 'deep indent', line: i + 1, content: line.trim().substring(0, 40) });
      }
    });
    
    const uniqueIndents = new Set(lines.map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    }).filter(i => i > 0));
    
    // Check for text in far right side of lines (suggesting right column)
    const rightAligned: { line: number; content: string }[] = [];
    lines.forEach((line, i) => {
      if (line.length > 50 && /^\s{30,}/.test(line)) {
        rightAligned.push({ line: i + 1, content: line.trim().substring(0, 40) });
      }
    });
    
    if (uniqueIndents.size <= 2 && rightAligned.length < 3) {
      return {
        checkName: 'Single-Column Layout',
        status: 'pass',
        score: 20,
        details: 'Document uses clean single-column layout with proper indentation.'
      };
    } else if (uniqueIndents.size <= 4 || rightAligned.length < 5) {
      const issueDetails: string[] = [];
      if (uniqueIndents.size > 2) issueDetails.push(`${uniqueIndents.size} indentation levels`);
      if (rightAligned.length > 0) {
        issueDetails.push(`${rightAligned.length} right-aligned line(s): line ${rightAligned.slice(0, 2).map(r => r.line).join(', ')}`);
      }
      return {
        checkName: 'Single-Column Layout',
        status: 'warning',
        score: 10,
        details: `Found: ${issueDetails.join(', ')}. This may indicate multi-column layout.`,
        recommendation: 'Use a single-column layout. Check lines with unusual indentation or right-aligned text.'
      };
    } else {
      const rightLines = rightAligned.slice(0, 3).map(r => `line ${r.line}: "${r.content}..."`).join('; ');
      return {
        checkName: 'Single-Column Layout',
        status: 'fail',
        score: 0,
        details: `Found ${uniqueIndents.size} indentation levels and ${rightAligned.length} right-aligned lines. Examples: ${rightLines}`,
        recommendation: 'Reformat to single-column. Multi-column resumes cause ATS to read top-to-bottom then left-to-right, scrambling your data.'
      };
    }
  } catch (error) {
    return {
      checkName: 'Single-Column Layout',
      status: 'warning',
      score: 10,
      details: 'Could not analyze column layout.',
      recommendation: 'Ensure your resume uses a clean single-column format.'
    };
  }
}

async function checkStandardFonts(text: string): Promise<ATSCheckResult> {
  try {
    // Note: True font detection from PDF text extraction is not reliable.
    // This check looks for encoding artifacts that MIGHT indicate font issues.
    // Most modern ATS handles fonts well - this is a minor concern.
    
    const nonAsciiChars = text.match(/[^\x00-\x7F]/g) || [];
    const totalChars = text.length;
    const specialCharRatio = nonAsciiChars.length / totalChars;
    
    // Get sample of problematic characters (filter out common valid chars)
    const commonChars = ['©', '®', '™', '°', '–', '—'];
    const uniqueNonAscii = [...new Set(nonAsciiChars)]
      .filter(c => !commonChars.includes(c))
      .slice(0, 5);
    const samples = uniqueNonAscii.map(c => `"${c}"`).join(', ');
    
    // Most modern ATS handles various fonts well - this is a minor issue
    if (specialCharRatio < 0.02 && uniqueNonAscii.length === 0) {
      return {
        checkName: 'Standard Fonts',
        status: 'pass',
        score: 20,
        details: 'Text appears clean with standard character encoding. Most ATS systems will parse this correctly.'
      };
    } else if (specialCharRatio < 0.05) {
      return {
        checkName: 'Standard Fonts',
        status: 'pass',
        score: 20,
        details: `Found some special characters (${(specialCharRatio * 100).toFixed(1)}% of text), but this is unlikely to cause ATS issues. ${samples ? `Detected: ${samples}.` : ''} Modern ATS handles most fonts well.`,
        recommendation: 'Optional: If you want maximum compatibility, use standard fonts (Arial, Calibri, Times New Roman) and save as PDF with embedded fonts.'
      };
    } else {
      return {
        checkName: 'Standard Fonts',
        status: 'warning',
        score: 15,
        details: `Found unusual characters (${(specialCharRatio * 100).toFixed(1)}% of text): ${samples || 'various'}. This might indicate font encoding issues.`,
        recommendation: 'Consider resaving your PDF with embedded fonts or converting to plain text first. Use standard fonts: Arial, Calibri, or Times New Roman.'
      };
    }
  } catch (error) {
    return {
      checkName: 'Standard Fonts',
      status: 'pass',
      score: 20,
      details: 'Could not analyze fonts. Most modern ATS handles fonts well.',
      recommendation: 'Use standard fonts (Arial, Calibri, Times New Roman) for best compatibility.'
    };
  }
}

async function checkStandardizedHeadings(text: string): Promise<ATSCheckResult> {
  try {
    // Based on research: ATS accepts many variations of section headings
    // The key is containing the core keywords, not exact matches
    const headingPatterns = [
      { 
        key: 'experience', 
        // Accepts: Professional Experience, Work Experience, Experience, Employment History, Work History, Relevant Experience
        pattern: /professional\s*experience|work\s*experience|(?:employment|work)\s*history|experience(?!\s*section)|relevant\s*experience|professional\s*background|career\s*history/i, 
        label: 'Experience',
        variations: 'Professional Experience, Work Experience, Experience, Employment History'
      },
      { 
        key: 'education', 
        // Accepts: Education, Academic Background, Qualifications, Academic History
        pattern: /education|academic\s*(background|history)|qualifications|academic\s*qualifications/i, 
        label: 'Education',
        variations: 'Education, Academic Background, Qualifications'
      },
      { 
        key: 'skills', 
        // Accepts: Skills, Technical Skills, Core Competencies, Competencies, Technologies
        pattern: /skills|technical\s*skills|core\s*competencies|competencies|technologies|technical\s*proficiencies/i, 
        label: 'Skills',
        variations: 'Skills, Technical Skills, Core Competencies'
      }
    ];
    
    const lines = text.split('\n');
    const foundHeaders: { key: string; label: string; match: string; variations: string; line: number }[] = [];
    
    for (const { key, pattern, label, variations } of headingPatterns) {
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(pattern);
        if (match && lines[i].trim().length < 50) { // Headings are typically short
          foundHeaders.push({ key, label, match: match[0], variations, line: i + 1 });
          break; // Only find first occurrence
        }
      }
    }
    
    const missing = headingPatterns.filter(h => !foundHeaders.find(f => f.key === h.key));
    
    if (foundHeaders.length >= 3) {
      return {
        checkName: 'Standardized Headings',
        status: 'pass',
        score: 20,
        details: `Found headings: ${foundHeaders.map(h => `"${h.match}" (line ${h.line})`).join(', ')}. All major sections detected.`
      };
    } else if (foundHeaders.length >= 2) {
      return {
        checkName: 'Standardized Headings',
        status: 'pass',
        score: 20,
        details: `Found: ${foundHeaders.map(h => `"${h.match}"`).join(', ')}. ${missing.length === 1 ? `Consider adding "${missing[0].variations}" for better ATS parsing.` : ''} Most ATS systems will parse this correctly.`,
        recommendation: missing.length === 1 ? `Optional: Add "${missing[0].variations}" heading to ensure maximum compatibility with all ATS systems.` : undefined
      };
    } else if (foundHeaders.length >= 1) {
      return {
        checkName: 'Standardized Headings',
        status: 'warning',
        score: 10,
        details: `Found: "${foundHeaders[0].match}" at line ${foundHeaders[0].line}. Missing: ${missing.map(m => m.variations).join(', ')}.`,
        recommendation: `Add section headings for: ${missing.map(m => m.label).join(', ')}. Examples: "${missing[0]?.variations || 'Experience'}" for experience section.`
      };
    } else {
      return {
        checkName: 'Standardized Headings',
        status: 'fail',
        score: 0,
        details: 'No recognizable section headings found. ATS cannot identify your work experience, education, or skills sections.',
        recommendation: 'Add clear section headings like: "Experience", "Education", and "Skills". Avoid creative headings like "My Career Journey" or "What I\'ve Done".'
      };
    }
  } catch (error) {
    return {
      checkName: 'Standardized Headings',
      status: 'warning',
      score: 10,
      details: 'Could not analyze section headings.',
      recommendation: 'Use standard headings like "Professional Experience", "Education", and "Skills".'
    };
  }
}

async function checkGraphicsAndTables(text: string): Promise<ATSCheckResult> {
  try {
    const lines = text.split('\n');
    const emptyLines = lines.filter(l => l.trim().length === 0).length;
    
    // Track specific locations
    const tableRows: { line: number; content: string }[] = [];
    const separatorLines: { line: number; content: string }[] = [];
    
    // Check for actual table structures (multiple pipes with similar spacing on a line)
    lines.forEach((line, i) => {
      const pipes = (line.match(/\|/g) || []).length;
      if (pipes >= 2 && pipes <= 6) {
        tableRows.push({ line: i + 1, content: line.trim().substring(0, 50) });
      }
    });
    
    // Check for box-drawing characters or ASCII art
    const boxDrawingMatches = [...text.matchAll(/[┌┐└┘├┤┼═║╔╗╚╝╠╣╦╩╬■◆●]/g)];
    
    // Check for repeated dashes/underscores (common in ASCII separators)
    lines.forEach((line, i) => {
      if (/[-_=]{10,}/.test(line)) {
        separatorLines.push({ line: i + 1, content: line.trim().substring(0, 50) });
      }
    });
    
    // Check for text alignment patterns (tables in text form)
    const alignmentPatterns: { line: number; content: string }[] = [];
    lines.forEach((line, i) => {
      const words = line.trim().split(/\s{2,}/);
      if (words.length >= 3 && line.trim().length > 20) {
        alignmentPatterns.push({ line: i + 1, content: line.trim().substring(0, 40) });
      }
    });
    
    const graphicsIndicators: string[] = [];
    if (tableRows.length > 0) {
      graphicsIndicators.push(`${tableRows.length} table row(s): lines ${tableRows.slice(0, 3).map(r => r.line).join(', ')}`);
    }
    if (boxDrawingMatches.length > 0) {
      graphicsIndicators.push(`${boxDrawingMatches.length} box-drawing character(s)`);
    }
    if (separatorLines.length > 0) {
      graphicsIndicators.push(`${separatorLines.length} separator line(s): lines ${separatorLines.slice(0, 3).map(s => s.line).join(', ')}`);
    }
    if (alignmentPatterns.length > 3) {
      graphicsIndicators.push(`${alignmentPatterns.length} column-like lines: ${alignmentPatterns.slice(0, 2).map(a => `line ${a.line}`).join(', ')}`);
    }
    
    const graphicsScore = tableRows.length + boxDrawingMatches.length + separatorLines.length + Math.floor(alignmentPatterns.length / 3);
    
    if (graphicsScore === 0 && emptyLines < lines.length * 0.3) {
      return {
        checkName: 'No Graphics/Tables',
        status: 'pass',
        score: 20,
        details: 'Document appears clean - no tables, graphics, or complex formatting detected.'
      };
    } else if (graphicsScore <= 3) {
      return {
        checkName: 'No Graphics/Tables',
        status: 'warning',
        score: 10,
        details: `Found: ${graphicsIndicators.join('; ')}. These may cause parsing issues.`,
        recommendation: 'Convert any tables to plain text with line breaks. Remove decorative elements.'
      };
    } else {
      return {
        checkName: 'No Graphics/Tables',
        status: 'fail',
        score: 0,
        details: `Found: ${graphicsIndicators.join(', ')}. These will corrupt text extraction.`,
        recommendation: 'Remove all tables, graphics, and complex formatting. Use plain text with simple line breaks instead.'
      };
    }
  } catch (error) {
    return {
      checkName: 'No Graphics/Tables',
      status: 'warning',
      score: 10,
      details: 'Could not analyze graphics and tables.'
    };
  }
}

async function checkReverseChronology(text: string): Promise<ATSCheckResult> {
  try {
    // Extract dates with line numbers
    const lines = text.split('\n');
    const dateEntries: { year: number; line: number; context: string }[] = [];
    
    // Find dates with line numbers
    lines.forEach((line, lineIdx) => {
      const yearMatches = line.matchAll(/(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+)?(\d{4})/gi);
      for (const match of yearMatches) {
        const year = parseInt(match[1], 10);
        if (year >= 1970 && year <= new Date().getFullYear() + 1) {
          dateEntries.push({ 
            year, 
            line: lineIdx + 1, 
            context: line.trim().substring(0, 40) 
          });
        }
      }
    });
    
    // Sort by appearance order (not year order)
    const appearanceOrder = dateEntries.map(d => d.year);
    // Get unique years in the order they first appear
    const seen = new Set<number>();
    const datesInOrder: number[] = [];
    appearanceOrder.forEach(year => {
      if (!seen.has(year)) {
        seen.add(year);
        datesInOrder.push(year);
      }
    });
    
    // Also get sorted descending for comparison
    const datesSorted = [...new Set(dateEntries.map(d => d.year))].sort((a, b) => b - a);
    
    if (dateEntries.length < 2) {
      return {
        checkName: 'Reverse Chronological Order',
        status: 'warning',
        score: 10,
        details: 'Could not find enough date information. Make sure dates are in a standard format like "2020-2023" or "Jan 2020 - Present".',
        recommendation: 'Use consistent date format: "Month Year" or "Year". Example: "January 2020 - Present" or "2020 - 2023"'
      };
    }
    
    // Check if dates appear in descending order
    let isReverseChronological = true;
    for (let i = 1; i < datesInOrder.length; i++) {
      if (datesInOrder[i] > datesInOrder[i - 1]) {
        isReverseChronological = false;
        break;
      }
    }
    
    if (isReverseChronological) {
      return {
        checkName: 'Reverse Chronological Order',
        status: 'pass',
        score: 20,
        details: `Dates in order: ${datesSorted.slice(0, 6).join(' → ')}${datesSorted.length > 6 ? ' → ...' : ''}. Found at lines: ${[...new Set(dateEntries.map(d => d.line))].slice(0, 5).join(', ')}`
      };
    } else {
      // Find out-of-order dates and their locations
      const outOfOrder: { year: number; lines: number[] }[] = [];
      for (let i = 1; i < datesInOrder.length; i++) {
        if (datesInOrder[i] > datesInOrder[i - 1]) {
          const year = datesInOrder[i];
          const linesForYear = dateEntries.filter(d => d.year === year).map(d => d.line);
          const existing = outOfOrder.find(o => o.year === year);
          if (existing) {
            existing.lines.push(...linesForYear);
          } else {
            outOfOrder.push({ year, lines: linesForYear });
          }
        }
      }
      
      const issueText = outOfOrder.map(o => `year ${o.year} at line(s) ${o.lines.join(', ')}`).join('; ');
      return {
        checkName: 'Reverse Chronological Order',
        status: 'warning',
        score: 10,
        details: `Dates out of order: ${issueText}. ATS expects most recent position first.`,
        recommendation: 'Reorder your experience so the newest job is at the top. ATS reads top-to-bottom and expects your current/recent role first.'
      };
    }
  } catch (error) {
    return {
      checkName: 'Reverse Chronological Order',
      status: 'warning',
      score: 10,
      details: 'Could not analyze date ordering.'
    };
  }
}

export async function analyzeAtsCompatibility(filePath: string): Promise<ATSAnalysisResult> {
  try {
    const text = await extractText(filePath);
    
    const [
      columnCheck,
      fontCheck,
      headingCheck,
      graphicsCheck,
      chronologyCheck
    ] = await Promise.all([
      checkSingleColumn(text),
      checkStandardFonts(text),
      checkStandardizedHeadings(text),
      checkGraphicsAndTables(text),
      checkReverseChronology(text)
    ]);
    
    const checks = [columnCheck, fontCheck, headingCheck, graphicsCheck, chronologyCheck];
    const overallScore = checks.reduce((sum, check) => sum + check.score, 0);
    
    return {
      overallScore,
      checks,
      analyzedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('ATS Analysis Error:', error);
    throw new Error(`Failed to analyze ATS compatibility: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
