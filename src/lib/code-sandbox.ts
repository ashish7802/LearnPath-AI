import vm from 'node:vm';
import type { CodingChallenge } from './curriculum';
import type { CodeChallengeResult, CodeExecutionTestCaseResult } from './assessment-engine';

/**
 * Safe, zero-shell deterministic code evaluation sandbox.
 * - Executes JavaScript challenges inside an isolated Node vm context with a strict timeout
 *   and zero access to process, require, fs, or network.
 * - Evaluates Python challenges safely by verifying function definitions, syntax structure,
 *   and executing supported beginner Python logic via a safe restricted transpiler to JS
 *   inside the same isolated VM (never invoking child_process / shell).
 */

function normalizeResult(val: unknown): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'None';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

function compareOutputs(actual: unknown, expected: string): boolean {
  const normActual = normalizeResult(actual).trim();
  const normExpected = expected.trim();
  if (normActual === normExpected) return true;
  if (normActual.toLowerCase() === normExpected.toLowerCase()) return true;

  // Compare numeric values within floating point tolerance
  const numA = Number(normActual);
  const numE = Number(normExpected);
  if (!Number.isNaN(numA) && !Number.isNaN(numE) && Math.abs(numA - numE) < 1e-6) {
    return true;
  }

  // Compare JSON structures (e.g., arrays / objects with spacing differences)
  try {
    const parsedA = JSON.parse(normActual);
    const parsedE = JSON.parse(normExpected.replace(/'/g, '"'));
    return JSON.stringify(parsedA) === JSON.stringify(parsedE);
  } catch {
    return false;
  }
}

const FORBIDDEN_PATTERNS = [
  /\bprocess\b/,
  /\brequire\b/,
  /\bimport\s+/,
  /\bchild_process\b/,
  /\bfs\b\./,
  /\beval\b/,
  /\bFunction\b/,
  /\bglobalThis\b/,
  /\b__proto__\b/,
  /\bconstructor\s*\[/,
  /\bwhile\s*\(\s*true\s*\)/,
];

function checkCodeSafety(code: string): string | null {
  if (code.length > 20000) return 'Code exceeds 20,000 character safety limit.';
  for (const pat of FORBIDDEN_PATTERNS) {
    if (pat.test(code)) {
      return 'Code uses a restricted runtime keyword not permitted in the learning sandbox.';
    }
  }
  return null;
}

/**
 * Translates straightforward beginner Python functions (def, if/elif/else, for/in range,
 * return, list/dict operations, arithmetic, len, sum, round, min, max, abs, sorted)
 * into sandboxed JS for real deterministic test execution without shell execution.
 */
export function transpileSimplePythonToJs(pyCode: string): string | null {
  const lines = pyCode.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  const indentStack: number[] = [0];

  const convertExpr = (expr: string): string => {
    return expr
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\s+/g, '!')
      .replace(/\/\/\s*/g, ' / ') // handled gently; integer floor below if needed
      .replace(/\*\*(\s*[\w()]+)/g, '**$1')
      .replace(/\blen\(([^)]+)\)/g, '($1).length')
      .replace(/\bstr\(([^)]+)\)/g, 'String($1)')
      .replace(/\bint\(([^)]+)\)/g, 'parseInt($1, 10)')
      .replace(/\bfloat\(([^)]+)\)/g, 'Number($1)')
      .replace(/\babs\(([^)]+)\)/g, 'Math.abs($1)')
      .replace(/\bround\(([^,]+),\s*([^)]+)\)/g, 'Number(($1).toFixed($2))')
      .replace(/\bround\(([^)]+)\)/g, 'Math.round($1)')
      .replace(/\bsum\(([^)]+)\)/g, '($1).reduce((a, b) => a + b, 0)')
      .replace(/\bmin\(([^)]+)\)/g, 'Math.min(...(Array.isArray($1) ? $1 : [$1]))')
      .replace(/\bmax\(([^)]+)\)/g, 'Math.max(...(Array.isArray($1) ? $1 : [$1]))')
      .replace(/\.append\(/g, '.push(')
      .replace(/\.lower\(\)/g, '.toLowerCase()')
      .replace(/\.upper\(\)/g, '.toUpperCase()')
      .replace(/\.strip\(\)/g, '.trim()');
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const strippedComment = raw.replace(/#.*$/, '');
    if (strippedComment.trim() === '') continue;

    const indent = strippedComment.search(/\S/);
    const trimmed = strippedComment.trim();

    while (indent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      out.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
    }

    if (trimmed === 'pass') {
      out.push(' '.repeat(indent) + '/* pass */');
      continue;
    }

    const defMatch = trimmed.match(/^def\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(?:->\s*[^:]+)?:\s*$/);
    if (defMatch) {
      const cleanParams = defMatch[2]
        .split(',')
        .map((p) => p.split(':')[0].trim())
        .filter(Boolean)
        .join(', ');
      out.push(`${' '.repeat(indent)}function ${defMatch[1]}(${cleanParams}) {`);
      indentStack.push(indent + 2);
      continue;
    }

    const inlineIfReturnMatch = trimmed.match(/^if\s+(.+?):\s*return\s+(.+)$/);
    if (inlineIfReturnMatch) {
      out.push(
        `${' '.repeat(indent)}if (${convertExpr(inlineIfReturnMatch[1])}) { return ${convertExpr(
          inlineIfReturnMatch[2]
        )}; }`
      );
      continue;
    }

    const ifMatch = trimmed.match(/^if\s+(.+):$/);
    if (ifMatch) {
      out.push(`${' '.repeat(indent)}if (${convertExpr(ifMatch[1])}) {`);
      indentStack.push(indent + 2);
      continue;
    }

    const elifMatch = trimmed.match(/^elif\s+(.+):$/);
    if (elifMatch) {
      out.push(`${' '.repeat(indent)}else if (${convertExpr(elifMatch[1])}) {`);
      indentStack.push(indent + 2);
      continue;
    }

    if (trimmed === 'else:') {
      out.push(`${' '.repeat(indent)}else {`);
      indentStack.push(indent + 2);
      continue;
    }

    const forRangeMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(([^)]+)\):$/);
    if (forRangeMatch) {
      const varName = forRangeMatch[1];
      const args = forRangeMatch[2].split(',').map((a) => convertExpr(a.trim()));
      const start = args.length === 1 ? '0' : args[0];
      const end = args.length === 1 ? args[0] : args[1];
      const step = args.length === 3 ? args[2] : '1';
      out.push(`${' '.repeat(indent)}for (let ${varName} = ${start}; ${varName} < ${end}; ${varName} += ${step}) {`);
      indentStack.push(indent + 2);
      continue;
    }

    const forInMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+(.+):$/);
    if (forInMatch) {
      out.push(`${' '.repeat(indent)}for (const ${forInMatch[1]} of ${convertExpr(forInMatch[2])}) {`);
      indentStack.push(indent + 2);
      continue;
    }

    const whileMatch = trimmed.match(/^while\s+(.+):$/);
    if (whileMatch) {
      out.push(`${' '.repeat(indent)}let __guard = 0; while (${convertExpr(whileMatch[1])}) { if (++__guard > 10000) throw new Error('Loop timeout');`);
      indentStack.push(indent + 2);
      continue;
    }

    if (trimmed.startsWith('return ')) {
      out.push(`${' '.repeat(indent)}return ${convertExpr(trimmed.slice(7))};`);
      continue;
    }
    if (trimmed === 'return') {
      out.push(`${' '.repeat(indent)}return null;`);
      continue;
    }

    // Assignment or expression
    const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
    if (assignMatch && !trimmed.includes('==')) {
      out.push(`${' '.repeat(indent)}var ${assignMatch[1]} = ${convertExpr(assignMatch[2])};`);
      continue;
    }

    out.push(`${' '.repeat(indent)}${convertExpr(trimmed)};`);
  }

  while (indentStack.length > 1) {
    indentStack.pop();
    out.push('}');
  }

  return out.join('\n');
}

function runJsInSandbox(jsSource: string, callExpression: string, timeoutMs = 400): { ok: boolean; value?: unknown; error?: string; logs: string[] } {
  const logs: string[] = [];
  const sandbox = {
    console: {
      log: (...args: unknown[]) => logs.push(args.map((a) => normalizeResult(a)).join(' ')),
    },
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    Date,
    RegExp,
    Set,
    Map,
  };

  try {
    const context = vm.createContext(sandbox);
    const wrapped = `"use strict";\n${jsSource}\n;\n(${callExpression});`;
    const script = new vm.Script(wrapped);
    const value = script.runInContext(context, { timeout: timeoutMs });
    return { ok: true, value, logs };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Execution error', logs };
  }
}

function buildCallExpression(fnName: string | null, rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!fnName) return trimmed;
  // If test input already invokes a function e.g. `buildCard('a', 'b')`
  if (/^[a-zA-Z_]\w*\s*\(/.test(trimmed)) {
    return trimmed
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null');
  }
  const normalizedArgs = trimmed
    .replace(/\bTrue\b/g, 'true')
    .replace(/\bFalse\b/g, 'false')
    .replace(/\bNone\b/g, 'null');
  return `${fnName}(${normalizedArgs})`;
}

export function executeCodeChallengeSafely(
  challenge: CodingChallenge,
  submittedCode: string
): CodeChallengeResult {
  const safetyError = checkCodeSafety(submittedCode);
  if (safetyError) {
    return {
      passed: false,
      testsPassed: 0,
      testsTotal: challenge.visibleTests.length + challenge.hiddenTests.length,
      visibleResults: challenge.visibleTests.map((t) => ({
        input: t.input,
        expected: t.expected,
        actual: 'Blocked by sandbox',
        passed: false,
        description: t.description,
        error: safetyError,
      })),
      hiddenResults: [],
      outputLog: `Security Sandbox Notice: ${safetyError}`,
    };
  }

  const trimmed = submittedCode.replace(/#.*$/gm, '').replace(/\/\/.*$/gm, '').trim();
  const isStub = !trimmed || (trimmed.endsWith('pass') && trimmed.split('\n').length <= 3);

  const isJs = challenge.language === 'javascript';
  let jsSource = submittedCode;
  let fnName: string | null = null;

  if (isJs) {
    const fnMatch = submittedCode.match(/function\s+([a-zA-Z_]\w*)\s*\(/);
    const arrowMatch = submittedCode.match(/(?:const|let|var)\s+([a-zA-Z_]\w*)\s*=/);
    fnName = fnMatch?.[1] || arrowMatch?.[1] || null;
  } else {
    const pyFnMatch = submittedCode.match(/def\s+([a-zA-Z_]\w*)\s*\(/);
    fnName = pyFnMatch?.[1] || null;
    const transpiled = transpileSimplePythonToJs(submittedCode);
    jsSource = transpiled || '';
  }

  const runCase = (t: { input: string; expected: string; description: string }): CodeExecutionTestCaseResult => {
    if (isStub) {
      return {
        input: t.input,
        expected: t.expected,
        actual: 'None (Incomplete implementation)',
        passed: false,
        description: t.description,
      };
    }

    const callExpr = buildCallExpression(fnName, t.input);
    const exec = runJsInSandbox(jsSource, callExpr, Math.min(challenge.timeLimitMs || 500, 1000));

    if (!exec.ok) {
      return {
        input: t.input,
        expected: t.expected,
        actual: `Error: ${exec.error}`,
        passed: false,
        description: t.description,
        error: exec.error,
      };
    }

    const passed = compareOutputs(exec.value, t.expected);
    return {
      input: t.input,
      expected: t.expected,
      actual: normalizeResult(exec.value),
      passed,
      description: t.description,
    };
  };

  const visibleResults = challenge.visibleTests.map(runCase);
  const hiddenResults = challenge.hiddenTests.map(runCase);
  const testsPassed =
    visibleResults.filter((r) => r.passed).length +
    hiddenResults.filter((r) => r.passed).length;
  const total = visibleResults.length + hiddenResults.length;
  const passedAll = total > 0 && testsPassed === total;

  return {
    passed: passedAll,
    testsPassed,
    testsTotal: total,
    visibleResults,
    hiddenResults: hiddenResults.map((h) => ({
      ...h,
      input: '(Hidden test case)',
    })),
    outputLog: passedAll
      ? `All ${total} test cases passed in isolated sandbox verification.`
      : `${testsPassed} of ${total} tests passed. Inspect the actual vs expected outputs above and refine your logic.`,
  };
}

/**
 * Interactive playground runner for live code examples on lessons & practice arena.
 */
export function runPlaygroundSnippet(
  language: 'javascript' | 'python',
  code: string
): { ok: boolean; output: string; error?: string } {
  const safetyError = checkCodeSafety(code);
  if (safetyError) {
    return { ok: false, output: '', error: safetyError };
  }

  const logs: string[] = [];
  const sandbox = {
    console: {
      log: (...args: unknown[]) => logs.push(args.map((a) => normalizeResult(a)).join(' ')),
    },
    print: (...args: unknown[]) => logs.push(args.map((a) => normalizeResult(a)).join(' ')),
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    parseInt,
    parseFloat,
    Set,
    Map,
  };

  try {
    const jsCode = language === 'python' ? (transpileSimplePythonToJs(code) || '') : code;
    const context = vm.createContext(sandbox);
    const script = new vm.Script(`"use strict";\n${jsCode}`);
    const lastVal = script.runInContext(context, { timeout: 500 });
    if (logs.length === 0 && lastVal !== undefined) {
      logs.push(normalizeResult(lastVal));
    }
    return { ok: true, output: logs.join('\n') || '(Executed with no console output)' };
  } catch (err: any) {
    return { ok: false, output: logs.join('\n'), error: err?.message || 'Runtime error' };
  }
}
