import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { curriculumContext } from "@/lib/curriculumContext";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const formData = await req.formData();

    const mode = String(formData.get("mode") || "Explain");
    const question = String(formData.get("question") || "");
    const history = String(formData.get("history") || "");
    const file = formData.get("file") as File | null;

    if (!question && !file) {
      return NextResponse.json(
        { error: "Please type a question or upload a file." },
        { status: 400 }
      );
    }

    let modeInstruction = "";

    if (mode === "Explain") {
      modeInstruction = `
Mode: Explain
Explain the student's question clearly and step by step.
Use simple Thai language.
Use a practical BBA/business example if helpful.
`;
    }

    if (mode === "Summarize") {
      modeInstruction = `
Mode: Summarize
Summarize the provided text, PDF, or image into:
- Main idea
- Important points
- Key terms
- Exam points to remember
`;
    }

    if (mode === "Quiz me") {
      modeInstruction = `
Mode: Quiz me
Create 5 multiple-choice quiz questions from the student's topic or uploaded file.
Each question must include:
- Question
- 4 choices
- Correct answer
- Short explanation
- Topic tag
`;
    }

    const parts: any[] = [
      {
        text: `
${curriculumContext}

${modeInstruction}

Conversation history:
${history || "No previous conversation."}

Student's latest message:
${question || "The student uploaded a file without typing a question."}

Response rules:
- Answer like a friendly AI tutor in a chat conversation.
- Do not use heavy markdown formatting such as ###, **, or long separators.
- Keep the answer readable and not too long.
- Answer in Thai unless the student asks for English.
`,
      },
    ];

    if (file && file.size > 0) {
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Only PDF, JPG, PNG, or WEBP files are allowed." },
          { status: 400 }
        );
      }

      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File is too large. Please upload a file under 10MB." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      parts.push({
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    });

    return NextResponse.json({
      answer: response.text || "No answer generated.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "AI Tutor failed to generate a response." },
      { status: 500 }
    );
  }
}