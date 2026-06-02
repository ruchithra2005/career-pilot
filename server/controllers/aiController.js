const InterviewImport = require("../models/Interview");
// Resilient fallback to resolve both default and named export structures
const Interview = InterviewImport && InterviewImport.create ? InterviewImport : (InterviewImport?.Interview || InterviewImport);

// Secure configuration block for the Google Gemini Developer API
const apiKey = process.env.GEMINI_API_KEY || ""; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

// Local static question bank as a safe offline fallback mechanism
const fallbackQuestionBank = {
  frontend: [
    {
      question: "What is the virtual DOM in React and how does it improve performance?",
      keywords: ["virtual dom", "reconciliation", "diffing", "render", "memory", "update"]
    },
    {
      question: "Explain the difference between local storage, session storage, and cookies.",
      keywords: ["localstorage", "sessionstorage", "cookies", "expiry", "size", "server", "http"]
    },
    {
      question: "What are React Hooks and why were they introduced?",
      keywords: ["hooks", "state", "functional", "reusability", "lifecycle", "class"]
    }
  ],
  backend: [
    {
      question: "What is middleware in Express.js and what is its purpose?",
      keywords: ["middleware", "req", "res", "next", "intercept", "request", "response"]
    },
    {
      question: "Explain the difference between SQL and NoSQL databases.",
      keywords: ["sql", "nosql", "relational", "document", "schema", "table", "scaling"]
    },
    {
      question: "How does JWT authentication work securely?",
      keywords: ["jwt", "token", "signature", "header", "payload", "secret", "verify"]
    }
  ]
};

/**
 * Helper function implementing robust Exponential Backoff (retries up to 5 times)
 * delays: 1s, 2s, 4s, 8s, 16s
 */
const fetchWithRetry = async (url, options, retries = 5, delay = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};

// @desc    Initialize a dynamic AI interview prep session using Gemini SDK
// @route   POST /api/ai/start
exports.startInterview = async (req, res) => {
  try {
    const { domain } = req.body;
    const chosenDomain = domain ? domain.toLowerCase() : "frontend";

    if (chosenDomain !== "frontend" && chosenDomain !== "backend") {
      return res.status(400).json({ message: "Invalid interview domain. Choose frontend or backend." });
    }

    const studentId = req.user._id || req.user.id;
    if (!studentId) {
      return res.status(401).json({ message: "User authentication identification failed." });
    }

    let questions = [];

    // Attempt dynamic question generation via Gemini API
    if (apiKey) {
      try {
        const payload = {
          contents: [
            {
              parts: [
                {
                  text: `Generate exactly 3 professional interview questions for a mid-level ${chosenDomain} developer position. Focus on core architectural principles, performance optimization, state management, security, and industry design patterns. Do not repeat questions.`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                questions: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                }
              },
              required: ["questions"]
            }
          }
        };

        const resultData = await fetchWithRetry(GEMINI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const rawText = resultData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            questions = parsed.questions;
          }
        }
      } catch (geminiError) {
        console.error("Gemini Question Gen Failed, engaging offline static question fallback:", geminiError);
      }
    }

    // Fallback to static list if Gemini API is empty, rate-limited, or failed
    if (questions.length === 0) {
      const bank = fallbackQuestionBank[chosenDomain] || fallbackQuestionBank.frontend;
      questions = bank.map(q => q.question);
    }

    // Create a new Interview record in MongoDB
    const interview = await Interview.create({
      student: studentId,
      domain: chosenDomain,
      questions: questions,
      answers: [],
      score: 0,
      feedback: "In Progress",
      status: "Started"
    });

    res.status(201).json({
      interviewId: interview._id,
      questions: questions,
      currentQuestionIndex: 0
    });
  } catch (error) {
    console.error("CRASH IN STARTINTERVIEW:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Grade individual answer and evaluate cumulative AI scorecard on completion
// @route   POST /api/ai/submit
exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    // Append and save the current answer
    const updatedAnswers = [...interview.answers];
    updatedAnswers[questionIndex] = answer;
    interview.answers = updatedAnswers;

    const isLastQuestion = questionIndex === interview.questions.length - 1;

    if (isLastQuestion) {
      let finalScore = 0;
      let finalFeedback = "";
      let gradedViaAI = false;

      // Attempt true Generative AI Evaluation via Gemini SDK
      if (apiKey) {
        try {
          const evaluationPrompt = interview.questions.map((q, idx) => {
            return `Question ${idx + 1}: "${q}"\nStudent Answer ${idx + 1}: "${updatedAnswers[idx] || "No answer provided."}"\n`;
          }).join("\n");

          const payload = {
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert technical interviewer assessing a ${interview.domain.toUpperCase()} developer candidate. Evaluate the following questions and candidate answers:\n\n${evaluationPrompt}\n\nProvide an overall cumulative performance score (integer from 0 to 100) based on conceptual correctness, depth, and terminology. Then, generate a detailed feedback report outlining candidate strengths, weaknesses, and actionable improvement recommendations for each question.`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  score: { type: "INTEGER" },
                  feedback: { type: "STRING" }
                },
                required: ["score", "feedback"]
              }
            }
          };

          const evalData = await fetchWithRetry(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          const rawText = evalData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            finalScore = parsed.score ?? 0;
            finalFeedback = parsed.feedback ?? "Assessment complete.";
            gradedViaAI = true;
          }
        } catch (evalError) {
          console.error("Gemini Evaluation Failed, engaging offline fallback grading:", evalError);
        }
      }

      // Offline Keyword-Matching Fallback Grader if AI evaluation encountered issues
      if (!gradedViaAI) {
        let totalScore = 0;
        const feedbackReport = [];
        const domainQs = fallbackQuestionBank[interview.domain] || fallbackQuestionBank.frontend;

        interview.questions.forEach((qText, index) => {
          const studentAns = (updatedAnswers[index] || "").toLowerCase();
          
          // Map to local keywords index if questions matched our fallback set
          let keywords = ["code", "optimization", "implementation", "architecture"];
          if (index < domainQs.length) {
            keywords = domainQs[index].keywords;
          }

          let matchedKeywords = 0;
          keywords.forEach(keyword => {
            if (studentAns.includes(keyword)) matchedKeywords++;
          });

          const matchRatio = matchedKeywords / keywords.length;
          let qScore = 3;
          let qFeedback = `Question ${index + 1}: Foundational review required. Incorporate keywords like: ${keywords.slice(0, 3).join(", ")}.`;

          if (matchRatio >= 0.6) {
            qScore = 10;
            qFeedback = `Question ${index + 1}: Strong understanding of core keywords and architecture.`;
          } else if (matchRatio >= 0.3) {
            qScore = 6;
            qFeedback = `Question ${index + 1}: Solid baseline. Expand on terms: ${keywords.filter(k => !studentAns.includes(k)).slice(0, 3).join(", ")}.`;
          }

          totalScore += qScore;
          feedbackReport.push(qFeedback);
        });

        finalScore = Math.round((totalScore / (interview.questions.length * 10)) * 100);
        finalFeedback = "Graded offline via local keyword matcher:\n\n" + feedbackReport.join("\n");
      }

      interview.score = finalScore;
      interview.feedback = finalFeedback;
      interview.status = "Completed";
    }

    await interview.save();

    res.json({
      success: true,
      isCompleted: isLastQuestion,
      score: interview.score,
      feedback: interview.feedback
    });
  } catch (error) {
    console.error("CRASH IN SUBMITANSWER:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch previous interview reports for student history tracking
// @route   GET /api/ai/history
exports.getHistory = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const history = await Interview.find({ student: studentId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 