/**
 * .0n Standard — Template Resolution Engine
 *
 * Resolves {{expression}} templates against a context object.
 *
 * Supported expressions:
 *   {{inputs.x}}              — input values
 *   {{step_id.nested.field}}  — step output references
 *   {{env.VAR}}               — environment variables
 *   {{now}}                   — ISO timestamp
 *   {{uuid}}                  — UUID v4
 *   {{amount * 100}}          — safe math
 *   {{grade == 'A'}}          — condition evaluation
 *
 * Context shape: { inputs: {}, steps: { step_id: { ...output } }, env: process.env }
 */

const { randomUUID } = require('crypto');

// ── Deep path access: "a.b[0].c" → obj.a.b[0].c ─────────

function deepGet(obj, path) {
  if (!obj || !path) return undefined;

  const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;

  for (const seg of segments) {
    if (current == null) return undefined;
    current = current[seg];
  }

  return current;
}

// ── Safe math/condition tokenizer (no eval) ──────────────

const OPERATORS = {
  '+':  (a, b) => a + b,
  '-':  (a, b) => a - b,
  '*':  (a, b) => a * b,
  '/':  (a, b) => b !== 0 ? a / b : 0,
  '%':  (a, b) => b !== 0 ? a % b : 0,
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '>':  (a, b) => a > b,
  '<':  (a, b) => a < b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
};

// Operator precedence groups (higher = binds tighter)
const PRECEDENCE = {
  '==': 1, '!=': 1, '>': 1, '<': 1, '>=': 1, '<=': 1,
  '+': 2, '-': 2,
  '*': 3, '/': 3, '%': 3,
};

function tokenize(expr) {
  const tokens = [];
  let i = 0;

  while (i < expr.length) {
    // Skip whitespace
    if (/\s/.test(expr[i])) { i++; continue; }

    // String literal
    if (expr[i] === "'" || expr[i] === '"') {
      const quote = expr[i];
      let str = '';
      i++;
      while (i < expr.length && expr[i] !== quote) {
        str += expr[i];
        i++;
      }
      i++; // closing quote
      tokens.push({ type: 'value', value: str });
      continue;
    }

    // Two-char operators
    if (i + 1 < expr.length) {
      const two = expr[i] + expr[i + 1];
      if (OPERATORS[two]) {
        tokens.push({ type: 'op', value: two });
        i += 2;
        continue;
      }
    }

    // Single-char operators
    if (OPERATORS[expr[i]]) {
      tokens.push({ type: 'op', value: expr[i] });
      i++;
      continue;
    }

    // Number
    if (/[\d.]/.test(expr[i])) {
      let num = '';
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push({ type: 'value', value: parseFloat(num) });
      continue;
    }

    // Identifier (variable reference)
    if (/[a-zA-Z_$]/.test(expr[i])) {
      let ident = '';
      while (i < expr.length && /[a-zA-Z0-9_.$\[\]]/.test(expr[i])) {
        ident += expr[i];
        i++;
      }
      // Boolean literals
      if (ident === 'true') {
        tokens.push({ type: 'value', value: true });
      } else if (ident === 'false') {
        tokens.push({ type: 'value', value: false });
      } else if (ident === 'null') {
        tokens.push({ type: 'value', value: null });
      } else {
        tokens.push({ type: 'ref', value: ident });
      }
      continue;
    }

    // Skip unknown chars
    i++;
  }

  return tokens;
}

function evaluateTokens(tokens, context) {
  // Resolve all references to values
  const resolved = tokens.map(t => {
    if (t.type === 'ref') {
      return { type: 'value', value: resolveRef(t.value, context) };
    }
    return t;
  });

  // If single value, return it
  if (resolved.length === 1 && resolved[0].type === 'value') {
    return resolved[0].value;
  }

  // Shunting-yard evaluation with precedence
  const values = [];
  const ops = [];

  function applyOp() {
    const op = ops.pop();
    const b = values.pop();
    const a = values.pop();
    const fn = OPERATORS[op];
    values.push(fn != null ? fn(a, b) : undefined);
  }

  for (const token of resolved) {
    if (token.type === 'value') {
      values.push(token.value);
    } else if (token.type === 'op') {
      while (
        ops.length > 0 &&
        (PRECEDENCE[ops[ops.length - 1]] || 0) >= (PRECEDENCE[token.value] || 0)
      ) {
        applyOp();
      }
      ops.push(token.value);
    }
  }

  while (ops.length > 0) {
    applyOp();
  }

  return values[0];
}

// ── Reference resolution ─────────────────────────────────

function resolveRef(ref, context) {
  // Built-ins
  if (ref === 'now') return new Date().toISOString();
  if (ref === 'uuid') return randomUUID();

  // env.VAR
  if (ref.startsWith('env.')) {
    return deepGet(context.env || process.env, ref.slice(4));
  }

  // inputs.x
  if (ref.startsWith('inputs.')) {
    return deepGet(context.inputs, ref.slice(7));
  }

  // step references — try context.steps first, then top-level context
  const val = deepGet(context.steps, ref);
  if (val !== undefined) return val;

  // Fallback: try direct context lookup
  return deepGet(context, ref);
}

// ── Expression evaluation ────────────────────────────────

function evaluateExpression(expr, context) {
  const trimmed = expr.trim();

  // Fast-path: simple built-ins
  if (trimmed === 'now') return new Date().toISOString();
  if (trimmed === 'uuid') return randomUUID();

  // Fast-path: simple reference (no operators)
  if (/^[a-zA-Z_$][a-zA-Z0-9_.$\[\]]*$/.test(trimmed)) {
    return resolveRef(trimmed, context);
  }

  // Tokenize and evaluate (handles math + conditions)
  const tokens = tokenize(trimmed);
  if (tokens.length === 0) return trimmed;

  return evaluateTokens(tokens, context);
}

// ── Main resolve function ────────────────────────────────

const TEMPLATE_RE = /\{\{(.+?)\}\}/g;

/**
 * Resolve a template value against a context.
 *
 * @param {*} template - String, object, or array containing {{}} expressions
 * @param {object} context - { inputs: {}, steps: {}, env: {} }
 * @returns {*} Resolved value with native types preserved
 */
function resolve(template, context) {
  if (template == null) return template;

  // Recurse into arrays
  if (Array.isArray(template)) {
    return template.map(item => resolve(item, context));
  }

  // Recurse into objects
  if (typeof template === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(template)) {
      result[resolve(key, context)] = resolve(value, context);
    }
    return result;
  }

  // Only process strings
  if (typeof template !== 'string') return template;

  // Check if the entire string is a single expression → return native type
  const singleMatch = template.match(/^\{\{(.+?)\}\}$/);
  if (singleMatch) {
    return evaluateExpression(singleMatch[1], context);
  }

  // Mixed template: "Hello {{inputs.name}}, total: {{inputs.amount * 100}}"
  // → always returns string
  if (!TEMPLATE_RE.test(template)) return template;

  // Reset lastIndex since we tested above
  TEMPLATE_RE.lastIndex = 0;

  return template.replace(TEMPLATE_RE, (_, expr) => {
    const val = evaluateExpression(expr, context);
    if (val === undefined || val === null) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  });
}

module.exports = { resolve, deepGet, evaluateExpression };
