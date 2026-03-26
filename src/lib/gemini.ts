import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type AnalysisType = 'pros-cons' | 'comparison' | 'swot';

export async function analyzeDecision(decision: string, type: AnalysisType) {
  const model = "gemini-3-flash-preview";
  
  let prompt = "";
  switch (type) {
    case 'pros-cons':
      prompt = `Analyze the following decision: "${decision}". 
      Provide a professional breakdown. 
      Start with a brief intro.
      Then, provide a side-by-side comparison of "The Pros" and "The Cons" using a Markdown table with exactly two columns.
      The first column header must be "The Pros" and the second must be "The Cons".
      Inside each column, use bullet points for the points.
      Follow the table with a "The Tiebreaker Verdict" section.`;
      break;
    case 'comparison':
      prompt = `Analyze the following decision or options: "${decision}". Provide a comparison table showing different factors, benefits, and drawbacks. Use Markdown table formatting.`;
      break;
    case 'swot':
      prompt = `Perform a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the following decision: "${decision}". Use Markdown formatting with clear sections for each category.`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are 'The Tiebreaker', a professional decision-making assistant. Your goal is to provide objective, balanced, and insightful analysis to help users make better choices. Be concise but thorough. Use Markdown for all responses.",
      }
    });

    return response.text || "I couldn't generate an analysis. Please try again.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze decision. Please check your connection or try a different prompt.");
  }
}
