import Groq from 'groq-sdk';
import { z } from 'zod';

// Ensure the API key exists
const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// AI Output Schema
export const ExamSchema = z.object({
  title: z.string(),
  language: z.enum(['ar', 'en', 'mixed']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(['mcq', 'tf', 'solve', 'complete', 'word', 'mixed']),
      text: z.string(),
      options: z.array(z.string()).optional(),
      correctAnswer: z.string(),
      explanation: z.string(),
      topic: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    })
  )
});

export type GeneratedExam = z.infer<typeof ExamSchema>;

export async function generateMathematicsExam(params: {
  topics: string[];
  pdfContext?: string;
  language: 'ar' | 'en' | 'mixed';
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionDistribution: string; // e.g., "5 MCQ, 2 Solve"
}): Promise<GeneratedExam> {
  
  if (!groq) {
    console.warn("GROQ_API_KEY is not set. Returning mock data.");
    return generateMockExam(params);
  }

  const systemPrompt = `You are an expert Mathematics teacher and examiner. 
Your task is to generate a high-quality mathematics exam strictly following the requested parameters.
Return ONLY valid JSON matching the exact schema required. Do not include markdown formatting like \`\`\`json outside the JSON object.

Requirements:
- Target Language: ${params.language}
- If Arabic, use Arabic terms, explanations, and RTL flow. If requested, use Arabic numerals.
- If English, use standard mathematical notation.
- USE KaTeX FORMAT FOR ALL MATH EQUATIONS. Enclose inline math in single dollar signs $...$ and display math in double dollar signs $$...$$.
- Ensure KaTeX syntax is perfectly valid.
- Difficulty: ${params.difficulty}
- Exam Type: ${params.type}

Context:
- Lesson Topics: ${params.topics.join(', ')}
${params.pdfContext ? `- Uploaded PDF Material Context:\n${params.pdfContext.substring(0, 3000)}` : ''}

You must return a JSON object with this exact structure:
{
  "title": "Exam Title",
  "language": "ar|en|mixed",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "id": "q1",
      "type": "mcq|tf|solve|complete|word",
      "text": "Question text with $math$",
      "options": ["A", "B", "C", "D"], // Only if type is mcq
      "correctAnswer": "Correct answer exactly as written",
      "explanation": "Step-by-step explanation using $math$",
      "topic": "Specific topic",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Ensure the generated questions perfectly match the distribution requested:
${params.questionDistribution}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Generate the mathematics exam now.",
        },
      ],
      model: "llama3-8b-8192", // Fast and robust model
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("No content generated");

    const parsed = JSON.parse(content);
    return ExamSchema.parse(parsed);

  } catch (error) {
    console.error("Error generating exam with Groq:", error);
    throw error;
  }
}

// Fallback Mock Generator
function generateMockExam(params: any): GeneratedExam {
  return {
    title: "Mock Mathematics Exam",
    language: params.language,
    difficulty: params.difficulty,
    questions: [
      {
        id: "mock1",
        type: "solve",
        text: "Solve for $x$: $2x + 5 = 15$",
        correctAnswer: "x = 5",
        explanation: "Subtract 5 from both sides to get $2x = 10$, then divide by 2 to get $x = 5$.",
        topic: params.topics[0] || "Algebra",
        difficulty: params.difficulty,
      },
      {
        id: "mock2",
        type: "mcq",
        text: "What is the derivative of $f(x) = x^2$?",
        options: ["$x$", "$2x$", "$x^2$", "$2$"],
        correctAnswer: "$2x$",
        explanation: "Using the power rule, the derivative of $x^n$ is $nx^{n-1}$. For $n=2$, it's $2x$.",
        topic: params.topics[0] || "Calculus",
        difficulty: params.difficulty,
      }
    ]
  };
}
