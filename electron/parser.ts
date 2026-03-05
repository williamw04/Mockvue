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
 * Parses resume text using Gemini 1.5 Flash
 */
export async function parseResumeWithGemini(text: string, apiKey: string): Promise<any> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
      "overallScore": 72
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const textResponse = response.text();

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
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
