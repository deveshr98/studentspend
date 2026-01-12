import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Gemini initialization (AI Studio API key)
const ai = new GoogleGenAI({
  apiKey: "AIzaSyCwaeytsTu8SvBkVuyef7NLWzGgA436IV0",
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("✅ StudentSpend backend is running");
});

// 🤖 Gemini AI endpoint
app.post("/gemini", async (req, res) => {
  try {
    const userPrompt = req.body.prompt;

const prompt = `
You are a personal finance advisor for a student.

Based on the expense data below, reply STRICTLY in this format:

NEXT:
(one short actionable sentence)

MISTAKES:
(one short sentence)

ATTENTION:
(one short sentence)

Expense data:
${userPrompt}
`;


    const response = await ai.models.generateContent({
      model: "models/gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No AI response.";

    res.json({ text });

  } catch (err) {
  console.error("Gemini Error:", err);

  // 🛑 QUOTA / RATE LIMIT HANDLING
  if (err.status === 429) {
    return res.json({
      text: `
NEXT:
Review recent expenses and set a samll daily budget

MISTAKES:
Unplanned spending without tracking.

ATTENTION:
Food, subscriptions, and online shopping.
      `,
    });
  }

  res.status(500).json({
    text: `
NEXT:
Focus on tracking expenses regularly.

MISTAKES:
Inconsistent budgeting.

ATTENTION:
Daily spending habits.
    `,
  });
}

});

app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});
