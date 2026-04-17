const OpenAI = require("openai");
const Profile = require("../models/Profile");
const Job = require("../models/Job");
const pdfParse = require("pdf-parse"); // Reload module

// ✅ OpenRouter Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// 🔹 Resume Summary
const enhanceSummary = async (req, res) => {
  try {
    const { profileData } = req.body;

    const prompt = `
    Generate a professional ATS-friendly resume summary (3-4 sentences).

    Skills: ${profileData.skills.join(", ")}
    Experience: ${JSON.stringify(profileData.experience)}
    Education: ${JSON.stringify(profileData.education)}
    `;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ summary: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Match Score
const calculateMatchScore = async (req, res) => {
  try {
    const { jobId } = req.body;

    const profile = await Profile.findOne({ user: req.user.id });
    const job = await Job.findById(jobId);

    if (!profile || !job)
      return res.status(404).json({ message: "Profile or Job not found" });

    const prompt = `
    Evaluate job match.

    Job Title: ${job.title}
    Required Skills: ${job.requiredSkills.join(", ")}
    Description: ${job.description}

    Candidate Skills: ${profile.skills.join(", ")}
    Experience: ${JSON.stringify(profile.experience)}

    Return JSON:
    {
      "score": number (0-100),
      "gapAnalysis": "short explanation"
    }
    `;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Parse Resume
const parseResume = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    const prompt = `
    Extract details from resume.

    Return JSON:
    {
      "phone": "",
      "skills": [],
      "aiSummary": ""
    }

    Resume:
    ${text.substring(0, 5000)}
    `;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Cover Letter
const generateCoverLetter = async (req, res) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    const profile = await Profile.findOne({ user: req.user.id }).populate("user", "name email");

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const prompt = `
    Write a professional cover letter.

    Candidate:
    Name: ${profile.user.name}
    Email: ${profile.user.email}
    Skills: ${profile.skills.join(", ")}

    Job:
    Title: ${job.title}
    Company: ${job.company}
    Skills: ${job.requiredSkills.join(", ")}

    Keep under 300 words.
    Start with "Dear Hiring Manager,".
    `;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ coverLetter: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Recommend Courses
const recommendCourses = async (req, res) => {
  try {
    const { targetJob } = req.body;
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile)
      return res.status(404).json({ message: "Profile not found" });

    const prompt = `
    Recommend courses for becoming ${targetJob}.

    Skills: ${profile.skills ? profile.skills.join(", ") : "None specified"}

    You MUST return ONLY valid JSON and absolutely nothing else. Do not use markdown blocks.
    {
      "preparationGuide": "String with a short study guide",
      "courses": [
        {
          "title": "String",
          "platform": "String",
          "description": "String",
          "searchQuery": "String to search on google"
        }
      ]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    let content = response.choices[0].message.content;
    // Clean up potential markdown formatting that AI sometimes adds
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const result = JSON.parse(content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Chat Assistant
const chatAssistant = async (req, res) => {
  try {
    const { messages } = req.body;
    const profile = await Profile.findOne({ user: req.user.id }).populate('user');
    
    let contextMessage = { 
      role: "system", 
      content: "You are a helpful AI Career Coach for Talent Match AI."
    };

    if (profile) {
      contextMessage.content += ` You are talking to ${profile.user.name}, who is a candidate with skills: ${profile.skills.join(', ')}. Help them with career advice, interview prep, and resume building. Keep responses concise and encouraging.`;
    }

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [contextMessage, ...messages]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Mock Interview
const mockInterview = async (req, res) => {
  try {
    const { jobId, history, latestAnswer } = req.body;
    const job = await Job.findById(jobId);
    
    let systemPrompt = `You are a hiring manager interviewing a candidate for the role of ${job ? job.title : 'Software Engineer'} at ${job ? job.company : 'Tech Inc'}.
    Conduct a realistic interview. Ask exactly ONE question at a time.
    When the user provides an answer, grade it out of 10, provide brief constructive feedback, and then ask the NEXT question.
    Format your response in JSON:
    {
      "feedback": "Your evaluation of their last answer",
      "score": 8,
      "nextQuestion": "Your next interview question"
    }
    If this is the start of the interview (latestAnswer is empty), provide a welcome message in feedback, score as 0, and ask the first question.`;

    const msgs = [{ role: "system", content: systemPrompt }, ...history];
    if (latestAnswer) {
      msgs.push({ role: "user", content: latestAnswer });
    } else {
      msgs.push({ role: "user", content: "Hi, I am ready to start the interview." });
    }

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: msgs,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  enhanceSummary,
  calculateMatchScore,
  parseResume,
  generateCoverLetter,
  recommendCourses,
  chatAssistant,
  mockInterview
};