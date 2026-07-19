import express from "express";
import Groq from "groq-sdk";
import mongoose from "mongoose";
import TriageLog from "../models/TriageLog.js";

const router = express.Router();

const SYSTEM_PROMPT = `You are a first-line triage assistant, not a doctor. Given a person's described symptoms, you must:

1. Classify urgency into exactly one of: "self-care", "visit-facility", "emergency".
   - "self-care": mild, common, safely manageable at home (e.g. minor cold, small cut, mild headache).
   - "visit-facility": needs professional evaluation soon but is not immediately life-threatening (e.g. persistent fever, moderate pain, suspected fracture).
   - "emergency": needs immediate professional help (e.g. chest pain, difficulty breathing, severe bleeding, stroke symptoms, loss of consciousness).
   - When genuinely uncertain or symptoms could indicate something serious, err toward the more urgent tier.

2. Write a short (2-3 sentence) plain-language explanation of why you chose that tier.

3. Provide 3-6 concrete, safe first-aid / self-care steps that are appropriate for a layperson to follow right now, regardless of tier (for "emergency", steps should focus on what to do while waiting for help to arrive, e.g. keep the person still, call emergency services, do not give food or water, etc.)

Respond ONLY with valid JSON in this exact shape, nothing else, no markdown fences:
{
  "tier": "self-care" | "visit-facility" | "emergency",
  "summary": "string",
  "firstAidSteps": ["string", "string", ...]
}

Never provide a medical diagnosis. Never recommend specific drug dosages. Always err on the side of caution for anything ambiguous or potentially serious.`;

router.post("/", async (req, res) => {
  try {
    const { symptomText, inputMethod } = req.body;

    if (!symptomText || typeof symptomText !== "string" || !symptomText.trim()) {
      return res.status(400).json({ error: "symptomText is required" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({
        error: "GROQ_API_KEY is missing. Get a free key from https://console.groq.com and add it to backend/.env",
        isConfigError: true,
      });
    }

    let parsed;
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: symptomText.trim() },
        ],
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: "json_object" },
      });

      const rawText = completion.choices[0]?.message?.content?.trim();
      if (!rawText) throw new Error("Empty response from AI");

      const cleaned = rawText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch (aiErr) {
      console.error("Groq AI error:", aiErr.message || aiErr);
      return res.status(502).json({
        error: `AI request failed: ${aiErr.message || "Unknown error"}`,
      });
    }

    if (!parsed || !parsed.tier || !parsed.summary || !parsed.firstAidSteps) {
      return res.status(502).json({ error: "AI returned an unexpected response. Please try again." });
    }

    let logId = null;
    if (process.env.MONGODB_URI && mongoose.connection.readyState === 1) {
      try {
        const log = await TriageLog.create({
          symptomText,
          tier: parsed.tier,
          aiSummary: parsed.summary,
          firstAidSteps: parsed.firstAidSteps,
          inputMethod: inputMethod === "voice" ? "voice" : "text",
        });
        logId = log._id;
      } catch (dbErr) {
        console.error("MongoDB logging error (non-fatal):", dbErr);
      }
    }

    res.json({
      tier: parsed.tier,
      summary: parsed.summary,
      firstAidSteps: parsed.firstAidSteps,
      logId,
    });
  } catch (err) {
    console.error("Triage route error:", err);
    res.status(500).json({ error: "Something went wrong during triage" });
  }
});

// Fetch recent history for demo / dashboard view
router.get("/history", async (req, res) => {
  try {
    if (!process.env.MONGODB_URI || mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const logs = await TriageLog.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    console.error("Fetch history error:", err);
    res.json([]);
  }
});

export default router;
