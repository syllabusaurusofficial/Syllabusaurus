const assessmentValues = new Set(["not-assessed", "correct", "incorrect", "partial"]);
const mistakeCategories = new Set([
  "None",
  "Conceptual",
  "Formula",
  "Calculation",
  "Sign",
  "Units",
  "Reading",
  "Algebra",
  "Careless error",
]);

function getResponseText(value) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  if (typeof value.response === "string" && value.response.trim()) {
    return value.response.trim();
  }

  if (typeof value.directAnswer === "string" && value.directAnswer.trim()) {
    return [
      value.directAnswer,
      typeof value.simpleExplanation === "string" && value.simpleExplanation.trim()
        ? value.simpleExplanation
        : "",
      typeof value.keyPoint === "string" && value.keyPoint.trim()
        ? `Key point: ${value.keyPoint}`
        : "",
      typeof value.example === "string" && value.example.trim()
        ? `Example: ${value.example}`
        : "",
      typeof value.checkQuestion === "string" && value.checkQuestion.trim()
        ? `Check: ${value.checkQuestion}`
        : "",
    ].filter(Boolean).join("\n\n");
  }
  return "";
}

export function normalizeStudyAnswer(value) {
  const response = getResponseText(value);
  if (!response) return null;

  const metadata = value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
  return {
    response,
    spokenResponse: typeof metadata.spokenResponse === "string" && metadata.spokenResponse.trim()
      ? metadata.spokenResponse.trim()
      : response,
    assessment: assessmentValues.has(metadata.assessment) ? metadata.assessment : "not-assessed",
    mistakeCategory: mistakeCategories.has(metadata.mistakeCategory)
      ? metadata.mistakeCategory
      : "None",
    mistakeConcept: typeof metadata.mistakeConcept === "string" && metadata.mistakeConcept.trim()
      ? metadata.mistakeConcept.trim()
      : "None",
  };
}
