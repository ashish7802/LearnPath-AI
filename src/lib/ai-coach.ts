/**
 * AI Learning Coach & Socratic Teaching Gateway
 * Supports English, Hindi, and Hinglish with progressive hints,
 * learner-context grounding, explainable recommendations, and safety guardrails.
 */

export interface CoachMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CoachLearnerContext {
  careerGoal?: string;
  dailyStudyMinutes?: number;
  masteredTopicTitles?: string[];
  weakTopicTitles?: string[];
  nextRecommendedTopicTitle?: string;
  nextRecommendedTopicId?: string;
}

export interface CoachRequest {
  topicTitle?: string;
  language: 'english' | 'hindi' | 'hinglish';
  experienceLevel: string;
  mathComfort: string;
  userQuery: string;
  conversationHistory?: CoachMessage[];
  hintLevel?: number; // 1, 2, 3
  userCodeAttempt?: string;
  learnerContext?: CoachLearnerContext;
}

export function buildCoachSystemPrompt(params: {
  topicTitle?: string;
  language: 'english' | 'hindi' | 'hinglish';
  experienceLevel: string;
  mathComfort: string;
  learnerContext?: CoachLearnerContext;
}): string {
  const { topicTitle, language, experienceLevel, mathComfort, learnerContext } = params;

  let langInstruction = 'Respond in clear, accessible plain English.';
  if (language === 'hindi') {
    langInstruction = 'Respond in natural, simple Hindi (Devanagari script) with technical English terms in parentheses.';
  } else if (language === 'hinglish') {
    langInstruction =
      'Respond in friendly, natural Hinglish (conversational Hindi written in Latin script, e.g. "Variables ko ek dabbe ki tarah samjhein jisme data store hota hai").';
  }

  const ctx = learnerContext || {};
  const masteredList =
    ctx.masteredTopicTitles && ctx.masteredTopicTitles.length > 0
      ? ctx.masteredTopicTitles.join(', ')
      : 'None verified yet (starting from zero)';
  const weakList =
    ctx.weakTopicTitles && ctx.weakTopicTitles.length > 0
      ? ctx.weakTopicTitles.join(', ')
      : 'None flagged';

  return `You are the AI Personal Learning Coach on LearnPath AI.
Your purpose: Guide absolute beginners to demonstrable engineering skills while keeping the structured curriculum as the source of truth.

LEARNER PROFILE & EVIDENCE CONTEXT:
- Target Career Path: ${(ctx.careerGoal || 'software-engineer').replace(/-/g, ' ')}
- Daily Study Target: ${ctx.dailyStudyMinutes || 60} minutes/day
- Current Topic: "${topicTitle || ctx.nextRecommendedTopicTitle || 'Computer & Programming Fundamentals'}"
- Verified Mastered Skills: ${masteredList}
- Weak / Needs-Revision Skills: ${weakList}
- Next Recommended Curriculum Topic: ${ctx.nextRecommendedTopicTitle || 'How Computers Actually Work'}
- Experience Level: ${experienceLevel} (Assume absolute zero if not specified)
- Math Comfort: ${mathComfort}
- Language Preference: ${language.toUpperCase()} (${langInstruction})

PEDAGOGICAL & SAFETY RULES:
1. Explain every concept using a real-world, intuitive analogy (e.g. kitchen counter for RAM, recipe for algorithm).
2. Socratic progressive hinting: Never output the full answer or full solution code directly if the learner is asking for an assessment answer. Provide a conceptual nudge (Hint 1), then structural pseudocode (Hint 2), and only edge case guidance (Hint 3).
3. If they share an error message or buggy code, explain WHY the mistake happened in beginner-friendly terms, then show how to fix it step by step.
4. Distinguish verified curriculum facts from general advice, and never claim a topic is mastered without passing its verification assessment.
5. Keep answers encouraging, structured with bullet points, and concise (under 250 words per response).`;
}

function diagnoseCodeAttempt(code: string, lang: 'english' | 'hindi' | 'hinglish'): string {
  const findings: string[] = [];
  const hasDef = /\bdef\s+\w+\s*\(/.test(code);
  const hasReturn = /\breturn\b/.test(code);
  const hasPrint = /\bprint\s*\(/.test(code);
  const hasAssignmentInIf = /\bif\b[^=\n]*[^=!<>]=[^=][^\n]*/.test(code);
  const missingColon = /^\s*(def|if|elif|else|for|while)\b[^:\n]+$/m.test(code);
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;

  if (hasDef && hasPrint && !hasReturn) {
    findings.push(
      lang === 'hinglish'
        ? '**`print()` vs `return` mismatch**: Aapke function mein `print()` hai par `return` nahi hai. Automated tests function ki return value check karte hain—`return` use karein.'
        : '**`print()` instead of `return`**: Your function prints output to the console instead of returning it. Automated tests check the `return` value.'
    );
  }
  if (hasAssignmentInIf) {
    findings.push(
      lang === 'hinglish'
        ? '**`=` vs `==` in `if` condition**: Condition compare karne ke liye `==` lagayein (`=` sirf value assign karne ke liye hota hai).'
        : '**Assignment `=` inside `if`**: Use `==` for comparison instead of `=`, which assigns a value.'
    );
  }
  if (missingColon) {
    findings.push(
      lang === 'hinglish'
        ? '**Missing colon (`:`)**: Python mein `def`, `if`, `for`, aur `while` line ke end mein `:` lagana zaroori hota hai.'
        : '**Missing colon (`:`)**: In Python, `def`, `if`, `elif`, `else`, `for`, and `while` headers must end with `:`.'
    );
  }
  if (openParens !== closeParens) {
    findings.push(
      lang === 'hinglish'
        ? `**Unbalanced parentheses**: Aapke code mein ${openParens} opening \`(\` aur ${closeParens} closing \`)\` hain.`
        : `**Unbalanced parentheses**: Found ${openParens} opening \`(\` vs ${closeParens} closing \`)\`.`
    );
  }

  if (findings.length === 0) {
    findings.push(
      lang === 'hinglish'
        ? 'Syntax clean lag raha hai! Ab edge cases check karein: kya aapka function `0`, empty string `""`, ya negative numbers par sahi `return` value deta hai?'
        : 'Your syntax looks clean! Next, trace edge cases: what does your function `return` when given `0`, an empty string `""`, or an empty list `[]`?'
    );
  }

  const header =
    lang === 'hinglish'
      ? '### Aapke Code Ka Line-by-Line Diagnosis'
      : lang === 'hindi'
        ? '### आपके कोड की जाँच (Code Diagnosis)'
        : '### Line-by-Line Code Diagnosis';

  return `${header}\n\n${findings.map((f, idx) => `${idx + 1}. ${f}`).join('\n')}\n\n**Next Hint**: Fix one item above and re-run the sandbox test cases.`;
}

// Deterministic curriculum-grounded coach responses when AI API key is not configured
export function getDeterministicCoachResponse(req: CoachRequest): string {
  const query = req.userQuery.toLowerCase();
  const lang = req.language;
  const ctx = req.learnerContext || {};
  const currentTopic = req.topicTitle || ctx.nextRecommendedTopicTitle || 'Programming Fundamentals';
  const careerLabel = (ctx.careerGoal || 'software-engineer').replace(/-/g, ' ');

  if (req.userCodeAttempt && req.userCodeAttempt.trim().length > 0) {
    return diagnoseCodeAttempt(req.userCodeAttempt.trim(), lang);
  }

  // 1. Hindi (Devanagari) responses
  if (lang === 'hindi' || query.includes('simple hindi') || query.includes('हिंदी')) {
    if (query.includes('variable') || query.includes('वेरिएबल')) {
      return `### वेरिएबल (Variable) क्या होता है? — आसान उदाहरण

वेरिएबल को रसोई के एक **लेबल लगे डिब्बे (Storage Jar)** की तरह समझें:
- **डिब्बे का नाम**: Variable Name (जैसे \`age\` या \`score\`)
- **डिब्बे के अंदर रखी चीज़**: Value (जैसे \`25\` या \`"Maya"\`)
- **रसोई की अलमारी**: कंप्यूटर की RAM जहाँ डेटा सुरक्षित रहता है।

\`\`\`python
age = 20
\`\`\`
जब यह लाइन चलती है, तो कंप्यूटर RAM में एक जगह बनाता है, उसका नाम \`age\` रखता है और उसमें \`20\` रख देता है।

**अभ्यास प्रश्न**: यदि हम \`age = age + 5\` लिखें, तो अब डिब्बे में क्या मान (value) होगा?`;
    }

    return `### ${currentTopic} — सरल हिंदी में समझें

इस विषय को तीन आसान चरणों में समझें:
1. **इसका अर्थ (Meaning)**: कंप्यूटर या प्रोग्राम डेटा को इनपुट के रूप में लेता है और स्पष्ट नियमों (instructions) के अनुसार प्रोसेस करता है।
2. **दैनिक जीवन का उदाहरण (Analogy)**: जैसे खाना बनाने की रेसिपी में हर स्टेप क्रम से लिखा होता है, वैसे ही कोड में हर लाइन CPU के लिए एक निर्देश है।
3. **अगला कदम**: इस पाठ के माइक्रो-लेसन (Micro-Lesson) को चलाकर देखें और कोड सैंडबॉक्स में बदलाव करके परिणाम देखें।`;
  }

  // 2. Hinglish responses
  if (lang === 'hinglish') {
    if (query.includes('variable') || query.includes('what is a variable')) {
      return `### Variable Kya Hota Hai? (Simple Kitchen Analogy)

Variable ko aap **kitchen ke ek labeled dabbe (jar)** ki tarah samjhein:
- Dabba ka label: **Variable Name** (e.g., \`sugar\`, \`age\`)
- Dabbe ke andar ka saman: **Value** (e.g., \`25\`, \`"Maya"\`)

Jab aap likhte hain:
\`\`\`python
age = 20
\`\`\`
Iska matlab computer memory (RAM) mein ek slot reserve hua, uska naam \`age\` rakha, aur usme \`20\` store kar diya.

**Quick Question:** Agar hum likhein \`age = age + 1\`, toh dabbe mein ab kya value hogi?`;
    }

    if (query.includes('next') || query.includes('aage kya') || query.includes('what should i learn')) {
      const nextName = ctx.nextRecommendedTopicTitle || 'Mastering the Command Line (Terminal & Shell)';
      const weakNote =
        ctx.weakTopicTitles && ctx.weakTopicTitles.length > 0
          ? `Sabse pehle **${ctx.weakTopicTitles[0]}** ka short revision karein kyunki pichle quiz mein wahan score 80% se kam tha. `
          : '';
      return `### Aapka Next Recommended Step (${careerLabel})

${weakNote}Aapke verified progress ke hisaab se agla topic hai: **${nextName}**.
- **Kyun (Why Selected)**: Aapne foundational prerequisites clear kar liye hain, aur yeh skill aage ke coding projects ke liye zaroori hai.
- **Kya Karein**: 15-minute ka Micro-Lesson padhein aur interactive sandbox example run karein.`;
    }

    if (query.includes('shorter') || query.includes('chhota') || query.includes('plan')) {
      return `### Study Plan Ko Chhota Aur Focused Kaise Karein?

Agar aaj time kam hai (e.g. 20-30 minutes), toh pura module padhne ki zaroorat nahi hai:
1. **10 Min Spaced Revision**: Sirf 1 due flashcard review karein taaki streak aur retention bani rahe.
2. **15 Min Single Micro-Lesson**: **${currentTopic}** ka sirf pehla micro-lesson aur quick check complete karein (+15 XP).
Aap **Study Planner** ya **Onboarding Goals** mein jaakar apna daily target 30 mins par set kar sakte hain—bina kisi penalty ke!`;
    }

    if (query.includes('error') || query.includes('bug') || query.includes('mistake') || query.includes('help')) {
      return `### Koi Baat Nahi, Error Sabhi Engineers Ko Aata Hai!

Chaliye step by step debug karte hain:
1. **Line Number & Type Padhein**: Dekhein ki error \`SyntaxError\` hai, \`TypeError\` hai, ya galat output aa raha hai.
2. **Common Beginner Mistake**: Kya aapne function ke andar \`print()\` likha hai jabki test case \`return\` value expect kar raha hai?
3. **Edge Cases**: Zero (\`0\`) ya empty string (\`""\`) ke liye \`if\` check lagayein.

Apna code ya error message yahan paste kijiye, hum milkar fix karenge!`;
    }

    return `Bahut badhiya sawal! **"${currentTopic}"** (${careerLabel} track) ko samajhne ka sabse asaan tarika hai:
1. **Real-World Analogy**: Sochiye ki computer is step par memory (RAM) mein kya badal raha hai.
2. **Step-by-Step Execution**: Sandbox mein ek line badal kar **Run Example** dabayein.
3. **Progressive Hint**: Agar coding challenge mein atke hain, toh mujhse *Hint 1* maangein!`;
  }

  // 3. English responses covering all required learner prompts
  if (query.includes('variable') || query.includes('what is a variable')) {
    return `### What is a Variable? (Kitchen Jar Analogy)

Imagine a variable as a **labeled storage jar in your kitchen**:
- **Label on the jar**: Variable Name (e.g., \`user_name\` or \`score\`)
- **Contents inside**: Value (e.g., \`"Alice"\` or \`100\`)
- **Shelf in the pantry**: Computer RAM where it lives while your program runs.

\`\`\`python
score = 100
\`\`\`
The computer reserves a slot in RAM, labels it \`score\`, and stores \`100\` inside.

**Quick Check**: If you write \`score = score + 10\`, what value is inside the jar now?`;
  }

  if (query.includes('why am i learning') || query.includes('why this matters') || query.includes('purpose')) {
    return `### Why You Are Learning **${currentTopic}**

In your **${careerLabel}** pathway, every topic exists to solve a real engineering bottleneck:
- **Where It Is Used**: Production software, automated test suites, and technical interviews rely directly on this concept.
- **How It Connects**: Mastering **${currentTopic}** is a verified prerequisite that unlocks downstream modules and your career milestone portfolio project.
- **Practical Payoff**: Instead of memorizing syntax blindly, understanding *why* this works lets you debug unfamiliar errors in seconds.`;
  }

  if (query.includes('what should i learn next') || query.includes('recommend') || query.includes('next step')) {
    const nextTopic = ctx.nextRecommendedTopicTitle || 'Mastering the Command Line (Terminal & Shell)';
    const weakPart =
      ctx.weakTopicTitles && ctx.weakTopicTitles.length > 0
        ? `- **First Priority (Remediation)**: Review **${ctx.weakTopicTitles[0]}** (10 mins) because your recent assessment indicated a gap there.\n`
        : '';
    return `### Explainable Next-Step Recommendation

Based on your **${careerLabel}** roadmap and verified progress (${ctx.masteredTopicTitles?.length || 0} topic(s) mastered):
${weakPart}- **Recommended Lesson**: **${nextTopic}**
- **Why This Was Selected**: All its prerequisites are satisfied, and it directly builds toward your next portfolio project deliverable.
- **Suggested Action**: Complete the first 15-minute micro-lesson, run the interactive code example, and solve 1 sandbox test case.`;
  }

  if (query.includes('shorter') || query.includes('study plan') || query.includes('reschedule') || query.includes('less time')) {
    return `### Adapting Today's Study Plan to Fit Your Schedule

You never lose progress or get penalized for a busy day. Here is a compressed **20-minute micro-session** for today:
1. **5 mins — Active Recall**: Review 1 SuperMemo-2 flashcard in the Revision Queue to keep memory fresh.
2. **15 mins — Focused Micro-Lesson**: Complete just one micro-lesson inside **${currentTopic}** and run its interactive code snippet (+15 XP).

*Tip:* You can adjust your daily study target down to 20 or 30 minutes anytime in **Update Goals** or click **Recalculate Plan** in the Study Planner.`;
  }

  if (query.includes('mistake') || query.includes('error') || query.includes('bug') || query.includes('wrong')) {
    return `### Diagnosing the Mistake in Your Code

When code fails a verification test, check these three common root causes:
1. **\`print()\` vs \`return\`**: Automated test suites inspect the value your function *returns*. Make sure your function ends with \`return result\`, not just \`print(result)\`.
2. **Off-by-One or Boundary Inputs**: Test what your logic does when the input is \`0\`, an empty string \`""\`, or a negative number.
3. **Data Type Mismatch**: Check whether you are comparing a string \`"5"\` against a number \`5\`.

Paste your exact code snippet or error line here and I will walk through the fix line by line!`;
  }

  if (query.includes('real-world example') || query.includes('analogy')) {
    return `### Real-World Engineering Analogy for **${currentTopic}**

- **Everyday Analogy**: Think of a restaurant kitchen. The **SSD** is the locked pantry where ingredients stay overnight; **RAM** is the chef's active cutting board; the **CPU** is the chef's knife executing one recipe step at a time.
- **In Production Software**: When Spotify or Netflix loads your homepage, it caches active data in fast memory (RAM) and uses deterministic algorithms to filter recommendations in milliseconds.
- **Try It Live**: Open the interactive visualization or code sandbox on this topic page and change one input value to watch the output update in real time.`;
  }

  if (query.includes('do not understand') || query.includes("don't understand") || query.includes('explain this')) {
    return `### Step-by-Step Breakdown: **${currentTopic}**

Let's strip away all the jargon and look at what is actually happening under the hood:
1. **The Core Problem**: Computers only understand explicit, step-by-step instructions. They never guess what we mean.
2. **What Happens in Memory**: We give the computer a clear input, transform it one operation at a time, and return a predictable output.
3. **Try This 1-Minute Check**: Scroll to the interactive code box, click **Run Example**, and compare the first line of code with the first line of console output.`;
  }

  if (query.includes('hint') || req.hintLevel) {
    const level = req.hintLevel || 1;
    if (level === 1) {
      return `**Hint 1 (Conceptual Nudge — Verified Curriculum Rule)**: Check your function's inputs and return statement. Are you returning the computed value directly (not just printing it), and handling zero/empty inputs?`;
    }
    if (level === 2) {
      return `**Hint 2 (Structural Blueprint)**: Initialize your result variable at the top of the function, guard against invalid edge cases with an \`if\` check, and apply the transformation step before returning.`;
    }
    return `**Hint 3 (Edge-Case Precision)**: Verify loop boundaries (remember \`range(a, b)\` stops at \`b - 1\`) and round floating-point currency/math outputs with \`round(val, 2)\`.`;
  }

  return `### Guided Study Support: **${currentTopic}**

Here is how we can tackle **${currentTopic}** (${careerLabel} track) step by step:
1. **Inputs**: Identify what data enters the system or function.
2. **Transformation**: Trace how each line transforms that data in memory.
3. **Verification**: Run the interactive sandbox or step through the animated concept visualizer to confirm your intuition.

Ask me for a **Hindi/Hinglish analogy**, **Hint 1** for your coding exercise, or **"What should I learn next?"** anytime!`;
}
