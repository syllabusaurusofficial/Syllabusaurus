export const AI_LECTURE_MODES = [
  { id: "one-shot", label: "One-Shot" },
  { id: "problem-solving", label: "Problem Solving" },
  { id: "detailed", label: "Detailed Lecture" },
  { id: "fast-revision", label: "Fast Revision" },
];

export const PROBLEM_DIFFICULTIES = ["Easy", "Medium", "JEE Main", "JEE Advanced"];

export function getRecommendedLectureModes(concept) {
  if (!concept || concept.state === "Unknown" || concept.state === "Learning") {
    return ["one-shot"];
  }
  if (concept.state === "Needs Revision") return ["detailed"];
  if (concept.state === "Developing") return ["problem-solving"];
  if (concept.state === "Strong" || concept.state === "Mastered") {
    return ["fast-revision", "problem-solving"];
  }
  return ["one-shot"];
}

export function createLecturePrompt(concept, mode, difficulty, socratic) {
  const topic = concept
    ? [
        concept.board,
        concept.grade,
        concept.subject,
        concept.section,
        concept.chapter,
        concept.concept,
      ].filter(Boolean).join(" · ")
    : "the currently selected syllabus concept";
  const difficultyInstruction = `Use ${difficulty} difficulty for problem practice.`;
  const socraticInstruction = socratic
    ? "Socratic teaching is enabled: do not reveal a complete worked solution initially. Give a prompt, one progressive hint, and wait for the student's attempt before revealing the solution."
    : "Show worked solutions where they support learning.";

  const modeInstructions = {
    "one-shot": "Create an efficient, complete interactive one-shot lesson for this syllabus concept. Cover essential prerequisite ideas, definitions, core concepts, exact formulas and conditions, one useful example, common mistakes, exam-relevant points, and one short understanding check. Avoid filler.",
    "problem-solving": `Teach through a problem-solving session: briefly state the concept, give a worked example, explain the reasoning step by step, point out a common trap, then give the student a question to try, a hint, and (only when appropriate under the Socratic instruction) the solution and a similar practice question. ${difficultyInstruction} ${socraticInstruction}`,
    detailed: "Create an interactive detailed lecture grounded in the actual selected syllabus concept. Build prerequisites and intuition, then explain definitions, concepts, relevant exact formulas and conditions, derivations where appropriate, examples, applications, misconceptions, exam perspective, and understanding checks. Structure naturally, not as repetitive fixed headings.",
    "fast-revision": "Create a concise 5–15 minute revision session for this concept. Prioritise exact formulas, definitions, key ideas, valid shortcuts, common mistakes, frequently tested ideas, and a few quick recall questions. Do not turn it into a long lecture.",
  };

  return `Start an AI LECTURES ${mode} interactive lesson for the Syllabusaurus syllabus focus: ${topic}. ${modeInstructions[mode] || modeInstructions["one-shot"]} Match the selected board and grade where supplied. The syllabus context may contain only broad topic labels; do not claim unsupplied subtopics are explicitly in the syllabus or invent source-specific material. Keep academic accuracy, exact mathematical notation, correct scientific terminology, and units. Lecture content is generated text, not a video.`;
}
