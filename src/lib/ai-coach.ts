/**
 * AI Learning Coach & Socratic Teaching Gateway
 * Supports English, Hindi, and Hinglish with progressive hints,
 * grounded explanations, and safety guardrails.
 */

export interface CoachMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CoachRequest {
  topicTitle?: string;
  language: 'english' | 'hindi' | 'hinglish';
  experienceLevel: string;
  mathComfort: string;
  userQuery: string;
  conversationHistory?: CoachMessage[];
  hintLevel?: number; // 1, 2, 3
}

export function buildCoachSystemPrompt(params: {
  topicTitle?: string;
  language: 'english' | 'hindi' | 'hinglish';
  experienceLevel: string;
  mathComfort: string;
}): string {
  const { topicTitle, language, experienceLevel, mathComfort } = params;

  let langInstruction = 'Respond in clear, accessible plain English.';
  if (language === 'hindi') {
    langInstruction = 'Respond in natural, simple Hindi (Devanagari script) with technical English terms in parentheses.';
  } else if (language === 'hinglish') {
    langInstruction = 'Respond in friendly, natural Hinglish (conversational Hindi written in Latin script, e.g. "Variables ko ek dabbe ki tarah samjhein jisme data store hota hai").';
  }

  return `You are the AI Personal Learning Coach on LearnPath AI.
Your purpose: Guide absolute beginners to demonstrable engineering skills.

LEARNER PROFILE:
- Current Topic: "${topicTitle || 'General Programming Fundamentals'}"
- Experience Level: ${experienceLevel} (Assume absolute zero if not specified)
- Math Comfort: ${mathComfort}
- Language Preference: ${language.toUpperCase()} (${langInstruction})

PEDAGOGICAL RULES:
1. Explain every concept using a real-world, intuitive analogy (e.g. kitchen counter for RAM, recipe for algorithm).
2. Socratic progressive hinting: Never output the full answer or full solution code directly if the learner is asking for an assessment answer. Provide a conceptual nudge (Hint 1), then structural pseudocode (Hint 2), and only edge case guidance (Hint 3).
3. If they share an error message, explain WHY the error happened in beginner-friendly terms, then guide them to fix it themselves.
4. Keep answers encouraging, structured with bullet points, and concise (under 250 words per response).`;
}

// Deterministic intelligent coach responses when AI API key is not configured
export function getDeterministicCoachResponse(req: CoachRequest): string {
  const query = req.userQuery.toLowerCase();
  const lang = req.language;

  if (lang === 'hinglish') {
    if (query.includes('variable') || query.includes('what is a variable')) {
      return `### Variable Kya Hota Hai? (Simple Analogy)

Variable ko aap **kitchen ke ek labeled dabbe (jar)** ki tarah samjhein:
- Dabba ka label: **Variable Name** (e.g., \`sugar\`, \`age\`)
- Dabbe ke andar ka saman: **Value** (e.g., \`25\`, \`"Maya"\`)

Jab aap likhte hain:
\`\`\`python
age = 20
\`\`\`
Iska matlab computer memory (RAM) mein ek slot reserve hua, uska naam 'age' rakha, aur usme 20 store kar diya.

**Quick Question:** Agar hum likhein \`age = age + 1\`, toh dabbe mein ab kya value hogi?`;
    }

    if (query.includes('error') || query.includes('bug') || query.includes('help')) {
      return `### Koi Baat Nahi, Error Sabhi Engineers Ko Aata Hai!

Chaliye step by step dekhte hain:
1. **Error Message Padhein**: Python hamesha batata hai ki problem kaunsi line par hai.
2. **Common Mistake**: Kya aapne single \`=\` (assignment) ko double \`==\` (comparison) ki jagah use kiya hai?
3. **Data Type Check**: Kya aap string aur number ko bina cast kiye add kar rahe hain?

Apna code ya error message yahan paste kijiye, hum milkar solve karenge!`;
    }

    return `Bahut badhiya sawal! "${req.topicTitle || 'Programming'}" sikhna shuruat mein thoda naya lag sakta hai, lekin har concept practice se clear ho jata hai.

**Pro-Tip**: Hamesha code ko line-by-line chala kar sochein ki CPU is waqt kya kar raha hai. 

Kya aap chahenge ki main is topic ka ek chhota sa practical example doon?`;
  }

  // English fallback
  if (query.includes('variable') || query.includes('what is a variable')) {
    return `### What is a Variable? (Kitchen Jar Analogy)

Imagine a variable as a **labeled storage jar in your kitchen**:
- **Label on the jar**: Variable Name (e.g., \`user_name\` or \`score\`)
- **Contents inside**: Value (e.g., \`"Alice"\` or \`100\`)
- **Shelf in the pantry**: Computer RAM where it lives.

\`\`\`python
score = 100
\`\`\`
The computer reserves a tiny spot in memory, names it \`score\`, and puts \`100\` inside.

**Quick Check**: If you write \`score = score + 10\`, what is inside the jar now?`;
  }

  if (query.includes('hint') || req.hintLevel) {
    const level = req.hintLevel || 1;
    if (level === 1) {
      return `**Hint 1 (Concept Reminder)**: Look closely at your input types. Are you receiving a string when you expect a number, or returning None instead of returning a value?`;
    }
    if (level === 2) {
      return `**Hint 2 (Structure)**: Start by initializing an empty result or counter. Use an \`if\` condition to check edge cases (like zero or negative values) right at the top.`;
    }
    return `**Hint 3 (Edge Cases)**: Remember that Python index ranges are exclusive at the end (\`range(0, n)\` stops at \`n-1\`). Round your decimal results using \`round(val, 2)\`.`;
  }

  return `Great question about **${req.topicTitle || 'this concept'}**!

The key to mastering software engineering is breaking every complex problem into three simple steps:
1. **Inputs**: What data is coming in?
2. **Transformation**: What rules or math do we apply step by step?
3. **Outputs**: What must be returned to the caller?

Feel free to paste your code or ask for a progressive hint!`;
}
