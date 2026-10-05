import { resolveSyllabusTargetKey } from "./studentActivity";

const REVISION_KEY = "syllabusaurus:concept-reviews";

export const TEACHING_STYLES = [
  "Beginner",
  "NCERT",
  "JEE",
  "Deep Dive",
  "Fast Revision",
  "Socratic",
  "Exam Mode",
];

export const TUTOR_PERSONALITIES = [
  "Professor",
  "Coach",
  "Examiner",
  "Socratic Tutor",
  "Revision Coach",
];

export const NOTE_ACTIONS = [
  ["explain", "Explain this"],
  ["summarise", "Summarise"],
  ["questions", "Ask questions"],
  ["test", "Test me"],
  ["concepts", "Find important concepts"],
  ["weaknesses", "Find weak understanding"],
  ["revision", "Make revision points"],
];

export const MISTAKE_CATEGORIES = [
  "Conceptual",
  "Formula",
  "Calculation",
  "Sign",
  "Units",
  "Reading",
  "Algebra",
  "Careless error",
];

function readReviewEvents() {
  try {
    const events = JSON.parse(localStorage.getItem(REVISION_KEY) || "[]");
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
}

function getMasteryFromRecords(conceptAttempts, errorCount, visits) {
  if (!conceptAttempts.length) return visits ? "Learning" : "Unknown";
  const recentAttempts = conceptAttempts.slice(-8);
  const accuracy = recentAttempts.filter((attempt) => attempt.correct).length /
    recentAttempts.length;
  if (errorCount >= 2 || accuracy < 0.6) return "Needs Revision";
  if (recentAttempts.length >= 5 && accuracy >= 0.9) return "Mastered";
  if (recentAttempts.length >= 3 && accuracy >= 0.8) return "Strong";
  return accuracy >= 0.6 ? "Developing" : "Needs Revision";
}

function groupByTarget(records, catalog) {
  const grouped = new Map();
  for (const record of records) {
    const key = resolveSyllabusTargetKey(record, catalog);
    if (!key) continue;
    const group = grouped.get(key) || [];
    group.push(record);
    grouped.set(key, group);
  }
  return grouped;
}

function createRevisionSchedule(conceptAttempts, conceptMistakes, reviewEvents, now) {
  const lastReview = reviewEvents.at(-1);
  const intervals = [1, 3, 7, 14, 30];
  const intervalDays = intervals[Math.min(Math.max(0, reviewEvents.length - 1), intervals.length - 1)];
  const lastReviewedAt = lastReview?.reviewedAt ||
    conceptAttempts.at(-1)?.date ||
    conceptMistakes.at(-1)?.date;
  if (!lastReviewedAt) return null;
  const timestamp = new Date(lastReviewedAt).getTime();
  if (!Number.isFinite(timestamp)) return null;
  const dueAt = new Date(timestamp + intervalDays * 86400000);
  return { dueAt: dueAt.toISOString(), due: dueAt <= now, intervalDays };
}

export function getConceptMastery(item, attempts, mistakes, visits = 0, catalog = [item]) {
  const conceptAttempts = attempts.filter((attempt) =>
    resolveSyllabusTargetKey(attempt, catalog) === item.key
  );
  const errorCount = mistakes.filter((mistake) =>
    resolveSyllabusTargetKey(mistake, catalog) === item.key
  ).length;
  return getMasteryFromRecords(conceptAttempts, errorCount, visits);
}

export function getAdaptiveDifficulty(item, attempts, catalog = [item]) {
  const recent = attempts.filter((attempt) =>
    resolveSyllabusTargetKey(attempt, catalog) === item.key
  ).slice(-5);
  if (recent.length < 2) return "Easy";
  const accuracy = recent.filter((attempt) => attempt.correct).length / recent.length;
  if (accuracy >= 0.8) return recent.length >= 4 ? "JEE Main" : "Medium";
  if (accuracy < 0.4) return "Easy";
  return "Medium";
}

export function getRevisionSchedule(item, attempts, mistakes, allReviewEvents = readReviewEvents(), catalog = [item]) {
  const events = allReviewEvents.filter((event) => event.conceptKey === item.key);
  const conceptAttempts = attempts.filter((attempt) =>
    resolveSyllabusTargetKey(attempt, catalog) === item.key
  );
  const conceptMistakes = mistakes.filter((mistake) =>
    resolveSyllabusTargetKey(mistake, catalog) === item.key
  );
  return createRevisionSchedule(conceptAttempts, conceptMistakes, events, new Date());
}

export function recordConceptReview(item) {
  const events = readReviewEvents();
  events.push({ conceptKey: item.key, reviewedAt: new Date().toISOString() });
  localStorage.setItem(REVISION_KEY, JSON.stringify(events.slice(-500)));
}

export function buildLearningContext({ dashboard, activity, mistakes, attempts }) {
  const catalog = dashboard.catalog;
  const conceptProgress = dashboard.conceptProgress || activity.concepts || {};
  const reviewEvents = readReviewEvents();
  const attemptsByTarget = groupByTarget(attempts, catalog);
  const mistakesByTarget = groupByTarget(mistakes, catalog);
  const reviewsByTarget = new Map();
  for (const event of reviewEvents) {
    const events = reviewsByTarget.get(event.conceptKey) || [];
    events.push(event);
    reviewsByTarget.set(event.conceptKey, events);
  }
  const now = new Date();
  const masteryByKey = new Map();
  const mastery = catalog.map((item) => ({
    key: item.key,
    conceptId: item.key,
    board: item.board,
    grade: item.grade,
    subject: item.subject,
    section: item.section,
    chapter: item.chapter,
    chapterId: item.chapterId,
    concept: item.concept.name,
    conceptPath: item.concept.path,
    chapterOnly: item.chapterOnly,
    state: getMasteryFromRecords(
      attemptsByTarget.get(item.key) || [],
      (mistakesByTarget.get(item.key) || []).length,
      conceptProgress[item.key]?.visits || 0,
    ),
    prerequisites: [],
  })).map((item) => {
    masteryByKey.set(item.key, item);
    return item;
  });
  const weakConcepts = mastery.filter((item) => item.state === "Needs Revision").slice(0, 8);
  const dueRevisions = catalog
    .map((item) => ({
      board: item.board,
      grade: item.grade,
      subject: item.subject,
      section: item.section,
      chapter: item.chapter,
      chapterId: item.chapterId,
      concept: item.concept.name,
      conceptId: item.key,
      schedule: createRevisionSchedule(
        attemptsByTarget.get(item.key) || [],
        mistakesByTarget.get(item.key) || [],
        reviewsByTarget.get(item.key) || [],
        now,
      ),
    }))
    .filter((item) => item.schedule?.due)
    .slice(0, 8);

  return {
    progress: {
      completedConcepts: dashboard.completedConcepts,
      totalConcepts: dashboard.totalConcepts,
      practiceAttempts: dashboard.totalAttempts,
      practiceAccuracy: dashboard.accuracy,
      recordedMistakes: dashboard.mistakeCount,
    },
    plannerFocus: dashboard.focus.item
      ? {
          board: dashboard.focus.item.board,
          grade: dashboard.focus.item.grade,
          subject: dashboard.focus.item.subject,
          section: dashboard.focus.item.section,
          chapter: dashboard.focus.item.chapter,
          chapterId: dashboard.focus.item.chapterId,
          concept: dashboard.focus.item.concept.name,
          conceptId: dashboard.focus.item.key,
          reason: dashboard.focus.detail,
        }
      : null,
    weakConcepts,
    dueRevisions,
    recentMistakes: mistakes.slice(-8).map((mistake) => ({
      subject: mistake.subject,
      board: mistake.board || "",
      grade: mistake.grade || "",
      section: mistake.section || "",
      chapter: mistake.chapter,
      chapterId: mistake.chapterId || "",
      concept: mistake.concept,
      conceptId: mistake.conceptId || "",
      formulaId: mistake.formulaId || "",
      question: mistake.question,
      studentAnswer: mistake.userAnswer,
      correctAnswer: mistake.correctAnswer,
      category: mistake.category || "",
    })),
    recentPractice: attempts.slice(-12).map((attempt) => ({
      subject: attempt.subject,
      board: attempt.board || "",
      grade: attempt.grade || "",
      section: attempt.section || "",
      chapter: attempt.chapter,
      chapterId: attempt.chapterId || "",
      concept: attempt.concept,
      conceptId: attempt.conceptId || "",
      formulaId: attempt.formulaId || "",
      correct: attempt.correct,
      date: attempt.date,
    })),
    mastery: mastery.filter((item) => item.state !== "Unknown").slice(0, 24),
    availableConcepts: catalog.map((item) => ({
      key: item.key,
      conceptId: item.key,
      board: item.board,
      grade: item.grade,
      subject: item.subject,
      section: item.section,
      chapter: item.chapter,
      chapterId: item.chapterId,
      concept: item.concept.name,
      conceptPath: item.concept.path,
      chapterOnly: item.chapterOnly,
      state: masteryByKey.get(item.key)?.state || "Unknown",
      prerequisites: [],
      revision: createRevisionSchedule(
        attemptsByTarget.get(item.key) || [],
        mistakesByTarget.get(item.key) || [],
        reviewsByTarget.get(item.key) || [],
        now,
      ),
    })),
  };
}

function compactText(value, limit) {
  return typeof value === "string" ? value.slice(0, limit) : "";
}

function compactConcept(item) {
  if (!item) return null;
  return {
    board: compactText(item.board, 80),
    grade: compactText(item.grade, 40),
    subject: compactText(item.subject, 80),
    section: compactText(item.section, 100),
    chapter: compactText(item.chapter, 120),
    concept: compactText(typeof item.concept === "string" ? item.concept : item.concept?.name, 120),
  };
}

function matchesTarget(item, target) {
  if (!target) return false;
  if (target.conceptId && item.conceptId) return item.conceptId === target.conceptId;
  return item.subject === target.subject &&
    item.chapter === target.chapter &&
    (!target.concept || item.concept === target.concept);
}

function compactAcademicRecord(record) {
  const variables = Object.fromEntries(
    Object.entries(record.variables || {}).slice(0, 5).map(([symbol, meaning]) => [
      compactText(symbol, 40),
      compactText(typeof meaning === "string" ? meaning : meaning?.meaning, 100),
    ]),
  );
  return {
    type: record.type,
    name: compactText(record.name, 120),
    verificationStatus: record.verificationStatus,
    sourceReference: compactText(record.sourceReference, 180),
    ...(record.expression && { expression: compactText(record.expression, 700) }),
    ...(record.text && { text: compactText(record.text, 500) }),
    ...(record.statement && { statement: compactText(record.statement, 500) }),
    ...(record.conditions && { conditions: compactText(record.conditions, 240) }),
    ...(record.units && { units: compactText(record.units, 100) }),
    ...(Object.keys(variables).length > 0 && { variables }),
  };
}

function compactAcademicSelection(selection) {
  if (!selection) return null;
  return {
    ...compactConcept(selection),
    academicContent: (selection.academicContent || [])
      .slice(0, 6)
      .map(compactAcademicRecord),
  };
}

function compactProfile(profile) {
  if (!profile) return null;
  return {
    grade: compactText(profile.grade, 40),
    board: compactText(profile.board, 80),
    state: compactText(profile.state, 80),
    medium: compactText(profile.medium, 60),
    targetExam: compactText(profile.target_exam, 80),
    subjects: Array.isArray(profile.subjects)
      ? profile.subjects.slice(0, 8).map((subject) => compactText(subject, 60))
      : [],
    learningStyle: Array.isArray(profile.learning_style)
      ? profile.learning_style.slice(0, 3).map((style) => compactText(style, 60))
      : compactText(profile.learning_style, 100),
    academicChallenges: Array.isArray(profile.academic_challenges)
      ? profile.academic_challenges.slice(0, 8).map((challenge) => compactText(challenge, 80))
      : [],
    studyGoal: compactText(profile.study_goal, 300),
  };
}

export function buildAIRequestContext(
  context,
  selectedConcept,
  { currentSelection, studentProfile, mode } = {},
) {
  const target = selectedConcept || currentSelection;
  const relevantRecords = (records = [], globalLimit = 0) => {
    const relevant = records.filter((item) => matchesTarget(item, target));
    return (relevant.length ? relevant : mode === "recommend" ? records.slice(0, globalLimit) : [])
      .slice(0, globalLimit)
      .map(compactConcept);
  };
  const recentMistakes = (context?.recentMistakes || [])
    .filter((item) => matchesTarget(item, target))
    .slice(-3)
    .map((mistake) => ({
      subject: compactText(mistake.subject, 80),
      chapter: compactText(mistake.chapter, 120),
      concept: compactText(mistake.concept, 120),
      question: compactText(mistake.question, 240),
      studentAnswer: compactText(mistake.studentAnswer, 160),
      correctAnswer: compactText(mistake.correctAnswer, 160),
      category: compactText(mistake.category, 60),
    }));
  const recentPractice = (context?.recentPractice || [])
    .filter((item) => matchesTarget(item, target))
    .slice(-4)
    .map((attempt) => ({
      subject: compactText(attempt.subject, 80),
      chapter: compactText(attempt.chapter, 120),
      concept: compactText(attempt.concept, 120),
      correct: Boolean(attempt.correct),
    }));
  const selectedPractice = recentPractice;
  const selected = selectedConcept
    ? {
      ...compactConcept(selectedConcept),
      state: selectedConcept.state,
      recommendedDifficulty: getAdaptiveDifficulty(
        selectedConcept,
        selectedPractice,
        [selectedConcept],
      ),
      revision: selectedConcept.revision
        ? {
          due: Boolean(selectedConcept.revision.due),
          intervalDays: selectedConcept.revision.intervalDays,
        }
        : null,
    }
    : null;
  const plannerFocus = context?.plannerFocus &&
    (matchesTarget(context.plannerFocus, target) || mode === "recommend")
    ? {
      ...compactConcept(context.plannerFocus),
      reason: compactText(context.plannerFocus.reason, 180),
    }
    : null;

  return {
    progress: mode === "recommend" && context?.progress
      ? {
        completedConcepts: context.progress.completedConcepts,
        totalConcepts: context.progress.totalConcepts,
        practiceAttempts: context.progress.practiceAttempts,
        practiceAccuracy: context.progress.practiceAccuracy,
        recordedMistakes: context.progress.recordedMistakes,
      }
      : null,
    plannerFocus,
    weakConcepts: relevantRecords(context?.weakConcepts, 3),
    dueRevisions: relevantRecords(context?.dueRevisions, 3),
    recentMistakes,
    recentPractice,
    mastery: relevantRecords(context?.mastery, mode === "recommend" ? 3 : 1),
    selectedConcept: selected,
    currentSelection: compactAcademicSelection(currentSelection),
    studentProfile: compactProfile(studentProfile),
  };
}

export function imageFileToPayload(file) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("Images must be 4 MB or smaller.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The image could not be read. Please try again."));
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("The image could not be read. Please try again."));
        return;
      }
      resolve({
        mimeType: file.type,
        data: reader.result.slice(reader.result.indexOf(",") + 1),
      });
    };
    reader.readAsDataURL(file);
  });
}
