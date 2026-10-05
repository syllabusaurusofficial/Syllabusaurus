import katex from "katex";
import "katex/dist/katex.min.css";

const MATH_DELIMITERS =
  /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\]|(?<!\\)\$(?!\$)[^\n$]+(?<!\\)\$)/g;

function getMathExpression(token) {
  if (token.startsWith("$$")) {
    return { expression: token.slice(2, -2), display: true };
  }
  if (token.startsWith("\\[") || token.startsWith("\\(")) {
    return {
      expression: token.slice(2, -2),
      display: token.startsWith("\\["),
    };
  }
  return { expression: token.slice(1, -1), display: false };
}

function findClosingParenthesis(text, openingIndex) {
  let depth = 0;
  for (let index = openingIndex; index < text.length; index += 1) {
    if (text[index] === "(") depth += 1;
    if (text[index] === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function toPlainMath(expression) {
  const openingIndex = expression.indexOf("(");
  const inner = expression.slice(openingIndex + 1, -1).trim();
  if (!inner || !/^[A-Za-z0-9\s.+\-*/^()_=,]+$/.test(inner)) return null;

  return `\\sqrt{${inner}}`
    .replace(/\b([A-Za-z])(\d+)\b/g, "$1_{$2}")
    .replace(/\^([+-]?\d+)\b/g, "^{$1}");
}

function renderMath(expression, display, key) {
  return (
    <span
      className={display ? "study-math-display" : "study-math-inline"}
      key={key}
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(expression, {
          displayMode: display,
          output: "htmlAndMathml",
          throwOnError: false,
          trust: false,
        }),
      }}
    />
  );
}

function renderPlainMath(text, keyPrefix) {
  const pieces = [];
  const sqrtPattern = /\bsqrt\s*\(/g;
  let cursor = 0;
  let match;

  while ((match = sqrtPattern.exec(text)) !== null) {
    const openingIndex = sqrtPattern.lastIndex - 1;
    const closingIndex = findClosingParenthesis(text, openingIndex);
    if (closingIndex < 0) break;

    const expression = text.slice(match.index, closingIndex + 1);
    const latex = toPlainMath(expression);
    if (!latex) continue;

    if (match.index > cursor) {
      pieces.push(text.slice(cursor, match.index));
    }
    const isStandalone = !text.slice(0, match.index).trim() &&
      !text.slice(closingIndex + 1).trim();
    pieces.push(renderMath(latex, isStandalone, `${keyPrefix}-${match.index}`));
    cursor = closingIndex + 1;
    sqrtPattern.lastIndex = cursor;
  }

  if (cursor === 0) return text;
  if (cursor < text.length) pieces.push(text.slice(cursor));
  return pieces;
}

export default function MathText({ text }) {
  return text.split(MATH_DELIMITERS).map((part, index) => {
    if (!part) return null;
    const isMath = part.startsWith("$$") || part.startsWith("\\[") ||
      part.startsWith("\\(") || (/^\$(?!\$)/.test(part) && part.endsWith("$"));

    if (!isMath) return renderPlainMath(part, index);

    const { expression, display } = getMathExpression(part);
    return renderMath(expression, display, `${index}-${part}`);
  });
}
