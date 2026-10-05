import { getSyllabusCatalog } from "../data/index.js";

const ACTIVITY_KEY = "syllabusaurus:student-activity";
const PRACTICE_KEY = "syllabusaurus:practice-attempts";
const MISTAKE_KEYS = ["syllabusaurus:mistakes", "syllabusaurus-mistakes"];
const catalogIndexCache = new WeakMap();

function getCatalogIndex(catalog) {
  let index = catalogIndexCache.get(catalog);
  if (index) return index;

  const byKey = new Map();
  const byIdentity = new Map();
  for (const item of catalog) {
    byKey.set(item.key, item);
    const identity = JSON.stringify([item.subject, item.chapter, item.concept.name]);
    const matches = byIdentity.get(identity) || [];
    matches.push(item);
    byIdentity.set(identity, matches);
  }

  index = { byKey, byIdentity };
  catalogIndexCache.set(catalog, index);
  return index;
}

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function readObject(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

export function getConceptKey(subject, chapter, concept) {
  if (subject && typeof subject === "object") {
    return subject.key || subject.conceptId || "";
  }
  return `${subject}::${chapter}::${concept}`;
}

export function resolveSyllabusTargetKey(record, catalog) {
  const { byKey, byIdentity } = getCatalogIndex(catalog);
  const directKey = record?.conceptId || record?.syllabusId || record?.conceptKey;
  if (directKey && byKey.has(directKey)) return directKey;
  if (!record?.subject || !record?.chapter || !record?.concept) return null;

  const matches = (byIdentity.get(JSON.stringify([
    record.subject,
    record.chapter,
    record.concept,
  ])) || []).filter((item) =>
    (!record.board || item.board === record.board) &&
    (!record.grade || item.grade === record.grade) &&
    (!record.section || item.section === record.section)
  );
  return matches.length === 1 ? matches[0].key : null;
}

export function readStudentActivity() {
  return readObject(ACTIVITY_KEY, { concepts: {} });
}

export function saveStudentActivity(activity) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
}

export function readPracticeAttempts() {
  return readArray(PRACTICE_KEY);
}

export function savePracticeAttempts(attempts) {
  localStorage.setItem(PRACTICE_KEY, JSON.stringify(attempts));
}

export function readMistakes() {
  const seen = new Set();
  return MISTAKE_KEYS.flatMap(readArray)
    .map((mistake, index) => ({
      ...mistake,
      id: mistake.id ?? `${mistake.date || "legacy"}-${index}`,
      concept: mistake.concept || mistake.conceptName || "",
      userAnswer: mistake.userAnswer ?? mistake.yourAnswer ?? "",
      correctAnswer: mistake.correctAnswer ?? "",
      date: mistake.date || "",
    }))
    .filter((mistake) => {
      const signature = [
        mistake.subject,
        mistake.chapter,
        mistake.concept,
        mistake.question,
        mistake.userAnswer,
        mistake.date,
      ].join("|");
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
}

export function saveMistakes(mistakes) {
  localStorage.setItem(MISTAKE_KEYS[0], JSON.stringify(mistakes));
}

export function getDashboardData(syllabus, activity, mistakes, attempts) {
  const catalog = getSyllabusCatalog(syllabus);
  const catalogByKey = getCatalogIndex(catalog).byKey;
  const conceptProgress = {};
  for (const [storedKey, progress] of Object.entries(activity.concepts || {})) {
    const item = catalogByKey.get(storedKey) || resolveLegacyActivityItem(storedKey, catalog);
    if (item) conceptProgress[item.key] = { ...conceptProgress[item.key], ...progress };
  }
  const mistakesByKey = new Map();
  const attemptsByKey = new Map();

  for (const mistake of mistakes) {
    const key = resolveSyllabusTargetKey(mistake, catalog);
    if (!key) continue;
    mistakesByKey.set(key, (mistakesByKey.get(key) || 0) + 1);
  }

  for (const attempt of attempts) {
    const key = resolveSyllabusTargetKey(attempt, catalog);
    if (!key) continue;
    const current = attemptsByKey.get(key) || { total: 0, correct: 0 };
    current.total += 1;
    current.correct += attempt.correct ? 1 : 0;
    attemptsByKey.set(key, current);
  }

  const visited = Object.entries(conceptProgress)
    .map(([key, progress]) => ({ ...catalogByKey.get(key), ...progress, key }))
    .filter((item) => item.subject && item.lastOpenedAt)
    .sort((left, right) => right.lastOpenedAt.localeCompare(left.lastOpenedAt));
  const unfinishedVisit = visited.find((item) => !item.completedAt);
  const mistakePriority = [...mistakesByKey.entries()]
    .filter(([key]) => catalogByKey.has(key))
    .sort((left, right) => right[1] - left[1])
    .map(([key, count]) => ({ ...catalogByKey.get(key), mistakeCount: count }))[0];
  const nextUncompleted = catalog.find((item) => !conceptProgress[item.key]?.completedAt);
  const totalConcepts = catalog.length;
  const completedConcepts = catalog.filter((item) => conceptProgress[item.key]?.completedAt).length;
  const linkedAttempts = attempts.filter((attempt) => resolveSyllabusTargetKey(attempt, catalog));
  const totalAttempts = linkedAttempts.length;
  const correctAttempts = linkedAttempts.filter((attempt) => attempt.correct).length;

  const focus = mistakePriority
    ? { type: "review", item: mistakePriority, detail: `${mistakePriority.mistakeCount} missed answer${mistakePriority.mistakeCount === 1 ? "" : "s"} recorded` }
    : unfinishedVisit
      ? { type: "continue", item: unfinishedVisit, detail: "Pick up where you left off" }
      : nextUncompleted
        ? { type: "learn", item: nextUncompleted, detail: "Start with the next uncompleted concept" }
        : { type: "practice", item: visited[0] || catalog[0], detail: "Your listed concepts are marked complete" };

  const revisionItems = [...mistakesByKey.entries()]
    .filter(([key]) => catalogByKey.has(key))
    .sort((left, right) => right[1] - left[1])
    .map(([key, count]) => ({
      ...catalogByKey.get(key),
      mistakeCount: count,
      status: count >= 3 ? "Revise Now" : "Revise Soon",
    }));

  for (const item of catalog) {
    const result = attemptsByKey.get(item.key);
    if (!mistakesByKey.has(item.key) && result?.total >= 3 && result.correct / result.total >= 0.8) {
      revisionItems.push({ ...item, mistakeCount: 0, status: "Strong" });
    }
  }

  return {
    catalog,
    conceptProgress,
    visited,
    continueLearning: unfinishedVisit || visited[0] || null,
    focus,
    revisionItems: revisionItems.slice(0, 5),
    totalConcepts,
    completedConcepts,
    remainingConcepts: totalConcepts - completedConcepts,
    totalAttempts,
    accuracy: totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : null,
    mistakeCount: mistakes.length,
    completionPercent: totalConcepts ? Math.round((completedConcepts / totalConcepts) * 100) : 0,
  };
}

function resolveLegacyActivityItem(storedKey, catalog) {
  const parts = storedKey.split("::");
  if (parts.length !== 3) return null;
  const [subject, chapter, concept] = parts;
  const matches = getCatalogIndex(catalog).byIdentity.get(JSON.stringify([
    subject,
    chapter,
    concept,
  ])) || [];
  return matches.length === 1 ? matches[0] : null;
}