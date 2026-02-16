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
    Extract the following information from the resume text below and return it as a valid JSON object.
    
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
