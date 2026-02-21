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
    1. Extract the following information from the resume text below.
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

  // Clean up code blocks if present
  const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON", textResponse);
    throw new Error("Failed to parse resume data");
  }
}
