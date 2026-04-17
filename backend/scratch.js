require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const prompt = `
    You are an expert career coach and technical mentor. 
    The user is currently seeking a job as a "Data Scientist".
    Their current skills are: Python, Machine Learning.

    Provide a JSON response with:
    1. A short "preparationGuide" (3-4 sentences on how they should bridge the gap to their target role).
    2. An array of "courses" (recommend 3 specific topics or online courses they should study). Each course should have:
       - "title"
       - "platform" (e.g., Coursera, Udemy, YouTube, or general)
       - "description" (why they should learn it)
       - "searchQuery" (a good google or youtube search query to find this course)

    Return ONLY JSON:
    {
      "preparationGuide": "...",
      "courses": [
        { "title": "...", "platform": "...", "description": "...", "searchQuery": "..." }
      ]
    }
    `;

    const modelObj = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await modelObj.generateContent(prompt);
    const response = await result.response;
    console.log("SUCCESS:", response.text());
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
