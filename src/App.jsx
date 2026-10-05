import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import HomeDashboard from "./components/HomeDashboard";
import CopyButton from "./components/CopyButton";
import {
  AcademicContentCard,
  ChemistryFormulaGroups,
  FormulaCard,
} from "./components/AcademicContent";
import StudentProfileSetup from "./components/StudentProfileSetup";
import Auth from "./Auth";
import "./App.css";
import { syllabus } from "./data/index.js";
import {
  CONTENT_TYPES,
  createAcademicContent,
  searchAcademicContent,
} from "./data/academicContent.js";
import { supabase } from "./lib/supabase";
import {
  getConceptKey,
  getDashboardData,
  readMistakes,
  readPracticeAttempts,
  readStudentActivity,
  resolveSyllabusTargetKey,
  saveMistakes,
  savePracticeAttempts,
  saveStudentActivity,
} from "./lib/studentActivity";
import { buildLearningContext } from "./lib/aiLearningEngine";
import {
  getStudentProfileErrorInfo,
  loadStudentProfile,
  saveStudentProfile,
  STUDENT_PROFILE_TABLE,
} from "./lib/studentProfile";

const AIStudyPartner = lazy(() => import("./components/AIStudyPartner"));
const academicContent = createAcademicContent(syllabus);

function getProfileBoardName(profile) {
  if (!profile) return "";
  if (profile.board !== "State Board") return profile.board;
  return syllabus.boards.find((item) =>
    item.name.toLowerCase().includes(profile.state?.toLowerCase() || "") &&
    item.name.toLowerCase().includes("state board")
  )?.name || "";
}

function getProfileSubject(profile) {
  if (!profile?.subjects?.length) return "";
  const boardName = getProfileBoardName(profile);
  const board = academicContent.boards.find((item) => item.name === boardName);
  const grade = board?.grades.find((item) => item.name === profile.grade);
  return grade?.subjects.some((item) => item.name === profile.subjects[0])
    ? profile.subjects[0]
    : "";
}
function getVerifiedConceptContent(concept) {
  return [
    ...concept.content.filter((item) =>
      ["verified", "VERIFIED", "DERIVED"].includes(item.verificationStatus)
    ),
    ...concept.children.flatMap(getVerifiedConceptContent),
  ];
}
const verifiedContentByConceptId = Object.fromEntries(
  Object.entries(academicContent.conceptsById).map(([id, concept]) => [
    id,
    getVerifiedConceptContent(concept),
  ]),
);

function getLearningRecordContext(item) {
  return {
    conceptId: item.conceptId || item.key,
    chapterId: item.chapterId,
    formulaId: item.formulaId || null,
    board: item.board,
    grade: item.grade,
    subject: item.subject,
    section: item.section,
    chapter: item.chapter,
    concept: typeof item.concept === "string" ? item.concept : item.concept.name,
  };
}

function countConceptNodes(chapter) {
  return chapter.children.reduce(
    (total, concept) => total + 1 + countConceptNodes(concept),
    0,
  );
}

function flattenAcademicConcepts(concepts, base, parentPath = []) {
  return concepts.flatMap((concept) => {
    const path = [...parentPath, concept.name];
    return [
      {
        ...base,
        concept: { name: concept.name, path },
        key: concept.id,
        chapterOnly: false,
      },
      ...flattenAcademicConcepts(concept.children, base, path),
    ];
  });
}

function collectConceptContent(concept) {
  if (!concept) return [];
  return [
    ...concept.content,
    ...concept.children.flatMap(collectConceptContent),
  ];
}

function SyllabusBreadcrumbs({ items }) {
  return (
    <nav className="syllabus-breadcrumbs" aria-label="Syllabus path">
      {items.map((item, index) => (
        <span className="syllabus-crumb" key={`${item.label}-${index}`}>
          {index > 0 && <span className="syllabus-crumb-separator" aria-hidden="true">/</span>}
          {item.onClick ? (
            <button onClick={item.onClick}>{item.label}</button>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function SyllabusPageHeader({ breadcrumbs, eyebrow, title, description }) {
  return (
    <>
      <SyllabusBreadcrumbs items={breadcrumbs} />
      <header className="syllabus-page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        {description && <p className="syllabus-page-description">{description}</p>}
      </header>
    </>
  );
}

function SyllabusaurusApp({ onSignOut, authError, profile, onProfileChange }) {
  const [page, setPage] = useState("home");
  const profileBoard = getProfileBoardName(profile);
  const profileSubject = getProfileSubject(profile);
  const profileCurriculumAvailable = academicContent.boards
    .find((item) => item.name === profileBoard)?.grades
    .some((item) => item.name === profile.grade);
  const [board, setBoard] = useState(profileCurriculumAvailable ? profileBoard : null);
  const [grade, setGrade] = useState(profileCurriculumAvailable ? profile.grade : null);
  const [subject, setSubject] = useState(null);
  const [section, setSection] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [selectedTargetKey, setSelectedTargetKey] = useState("");
  const [activity, setActivity] = useState(readStudentActivity);
  const [mistakes, setMistakes] = useState(readMistakes);
  const [attempts, setAttempts] = useState(readPracticeAttempts);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceTargetKey, setPracticeTargetKey] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [formulaScope, setFormulaScope] = useState({
    board: profileCurriculumAvailable ? profileBoard : "",
    grade: profileCurriculumAvailable ? profile.grade : "",
    subject: profileSubject,
    chapter: "",
  });
  const [formulaSearch, setFormulaSearch] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("");

  const dashboard = useMemo(() => {
    const data = getDashboardData(syllabus, activity, mistakes, attempts);
    if (data.focus.type !== "learn" || !profileCurriculumAvailable) return data;
    const preferred = data.catalog.find((item) =>
      item.board === profileBoard &&
      item.grade === profile.grade &&
      (!profile.subjects.length || profile.subjects.includes(item.subject)) &&
      !data.conceptProgress[item.key]?.completedAt
    );
    return preferred ? { ...data, focus: { ...data.focus, item: preferred } } : data;
  }, [activity, mistakes, attempts, profile, profileBoard, profileCurriculumAvailable]);
  const aiLearningContext = useMemo(
    () => page === "ai" ? buildLearningContext({ dashboard, activity, mistakes, attempts }) : null,
    [page, dashboard, activity, mistakes, attempts],
  );
  const selectedBoard = syllabus.boards.find((item) => item.name === board);
  const selectedGrade = selectedBoard?.grades.find((item) => item.name === grade);
  const selectedSubject = selectedGrade?.subjects.find((item) => item.name === subject);
  const selectedSection = selectedSubject?.sections.find((item) => item.name === section);
  const availableChapters = selectedSection?.chapters || selectedSubject?.chapters || [];
  const selectedChapter = availableChapters.find((item) => item.name === chapter);
  const academicSubject = academicContent.boards
    .find((item) => item.name === board)?.grades
    .find((item) => item.name === grade)?.subjects
    .find((item) => item.name === subject);
  const academicChapters = section
    ? academicSubject?.sections.find((item) => item.name === section)?.chapters || []
    : academicSubject?.chapters || [];
  const academicChapter = academicChapters.find((item) =>
    item.name === chapter && item.section === (section || "")
  );
  const chapterTargets = useMemo(() => dashboard.catalog.filter((item) =>
    item.board === board &&
    item.grade === grade &&
    item.subject === subject &&
    item.section === (section || "") &&
    item.chapter === chapter
  ), [dashboard.catalog, board, grade, subject, section, chapter]);
  const structuredChapterTargets = (() => {
    if (!selectedChapter || selectedChapter.children.length > 0 || !academicChapter) return [];
    const base = {
      board,
      grade,
      subject,
      section: section || "",
      chapter,
      chapterId: academicChapter.id,
    };
    const concepts = academicChapter.concepts;
    const chapterRoot = concepts.length === 1 &&
      concepts[0].name === chapter &&
      concepts[0].id === `${academicChapter.id}::${encodeURIComponent(chapter)}`;
    const childConcepts = chapterRoot ? concepts[0].children : concepts;
    return [
      ...(chapterRoot
        ? [{ ...base, concept: { name: chapter, path: [] }, key: concepts[0].id, chapterOnly: true }]
        : []),
      ...flattenAcademicConcepts(childConcepts, base, chapterRoot ? [chapter] : []),
    ];
  })();
  const chapterTopicTargets = structuredChapterTargets.length
    ? structuredChapterTargets
    : chapterTargets;
  const chapterHasSubtopics = chapterTopicTargets.some((item) => !item.chapterOnly);
  const chapterHasVerifiedContent = chapterTopicTargets.some((item) =>
    collectConceptContent(academicContent.conceptsById[item.key])
      .some((content) => ["verified", "VERIFIED", "DERIVED"].includes(content.verificationStatus))
  );
  const currentTarget = chapterTopicTargets.find((item) => item.key === selectedTargetKey);
  const selectedAcademicConcept = currentTarget
    ? academicContent.conceptsById[currentTarget.key]
    : null;
  const selectedConceptContent = collectConceptContent(selectedAcademicConcept);
  const verifiedSelectedContent = selectedConceptContent.filter((item) =>
    ["verified", "VERIFIED", "DERIVED"].includes(item.verificationStatus)
  );
  const unverifiedSelectedContent = selectedConceptContent.filter((item) =>
    !["verified", "VERIFIED", "DERIVED"].includes(item.verificationStatus)
  );
  const verifiedSelectedFormulas = verifiedSelectedContent.filter((item) => item.type === "formula");
  const verifiedSelectedAcademicContent = verifiedSelectedContent.filter((item) => item.type !== "formula");
  const scopedConcept = useMemo(() => aiLearningContext?.availableConcepts.find((item) =>
    (!board || item.board === board) &&
    (!grade || item.grade === grade) &&
    (!subject || item.subject === subject) &&
    (!profileCurriculumAvailable || (
      item.board === profileBoard &&
      item.grade === profile.grade &&
      (!profile.subjects.length || profile.subjects.includes(item.subject))
    )) &&
    (!section || item.section === section) &&
    (!chapter || item.chapter === chapter)
  ), [aiLearningContext, board, grade, subject, profileCurriculumAvailable, profileBoard, profile, section, chapter]);
  const preferredConceptKey = currentTarget?.key ||
    chapterTargets[0]?.key ||
    scopedConcept?.key ||
    (!board ? aiLearningContext?.weakConcepts[0]?.key : "") ||
    (!board ? aiLearningContext?.availableConcepts[0]?.key : "") ||
    "";
  const currentSelection = board
    ? {
        board,
        grade,
        subject,
        section,
        chapter,
        chapterId: currentTarget?.chapterId || null,
        concept: currentTarget?.concept.name || null,
        conceptId: currentTarget?.key || null,
        academicContent: verifiedContentByConceptId[currentTarget?.key] || [],
      }
    : null;
  const practiceBank = useMemo(() => dashboard.catalog.flatMap((item) => {
    const academicConcept = academicContent.conceptsById[item.key];
    const questions = [
      ...(item.concept.questions || []),
      ...(academicConcept?.practiceQuestions || []),
    ];
    return questions.map((question) => {
      const formulaId = question.formulaId || question.formula?.id || null;
      return {
        ...item,
        conceptId: item.key,
        formulaId,
        question: {
          ...question,
          reference: {
            board: item.board,
            grade: item.grade,
            subject: item.subject,
            chapter: item.chapter,
            concept: item.concept.name,
            chapterId: item.chapterId,
            conceptId: item.key,
            formulaId,
          },
        },
      };
    });
  }).sort((left, right) => {
    const rank = (item) => item.board === profileBoard && item.grade === profile.grade &&
      (!profile.subjects.length || profile.subjects.includes(item.subject)) ? 0 : 1;
    return rank(left) - rank(right);
  }), [dashboard.catalog, profile, profileBoard]);
  const practiceItem = practiceBank[practiceIndex] || null;
  const practiceTarget = useMemo(
    () => dashboard.catalog.find((item) => item.key === practiceTargetKey),
    [dashboard.catalog, practiceTargetKey],
  );
  const formulaSelectedBoard = academicContent.boards.find(
    (item) => item.name === formulaScope.board,
  );
  const formulaSelectedGrade = formulaSelectedBoard?.grades.find(
    (item) => item.name === formulaScope.grade,
  );
  const formulaSelectedSubject = formulaSelectedGrade?.subjects.find(
    (item) => item.name === formulaScope.subject,
  );
  const formulaChapters = formulaSelectedSubject
    ? formulaSelectedSubject.textbookChapters || [
        ...formulaSelectedSubject.chapters,
        ...formulaSelectedSubject.sections.flatMap((item) => item.chapters),
      ]
    : [];
  const scopedFormulas = academicContent.formulas.filter((formula) =>
    formula.curriculumScope !== "scope_unverified" &&
    formula.curriculumScope !== "excluded" &&
    formula.verificationStatus !== "EXCLUDED" &&
    (!formulaScope.board || formula.board === formulaScope.board) &&
    (!formulaScope.grade || formula.grade === formulaScope.grade) &&
    (!formulaScope.subject || formula.subject === formulaScope.subject) &&
    (!formulaScope.chapter || formula.chapterId === formulaScope.chapter)
  );
  const displayedContent = searchAcademicContent(scopedFormulas, {
    query: formulaSearch,
    type: contentTypeFilter,
  });
  const verifiedContent = displayedContent.filter(
    (item) => ["verified", "VERIFIED", "DERIVED"].includes(item.verificationStatus),
  );
  const unverifiedContent = displayedContent.filter(
    (item) => !["verified", "VERIFIED", "DERIVED"].includes(item.verificationStatus),
  );
  const syllabusProgress = useMemo(() => {
    const result = new Map();
    const add = (parts, completed) => {
      const key = JSON.stringify(parts);
      const count = result.get(key) || { total: 0, completed: 0 };
      count.total += 1;
      count.completed += completed ? 1 : 0;
      result.set(key, count);
    };
    for (const item of dashboard.catalog) {
      const completed = Boolean(dashboard.conceptProgress[item.key]?.completedAt);
      add(["board", item.board], completed);
      add(["grade", item.board, item.grade], completed);
      add(["subject", item.board, item.grade, item.subject], completed);
      add(["section", item.board, item.grade, item.subject, item.section], completed);
      add(["chapter", item.board, item.grade, item.subject, item.section, item.chapter], completed);
    }
    return result;
  }, [dashboard.catalog, dashboard.conceptProgress]);
  const getProgressLabel = (...parts) => {
    const progress = syllabusProgress.get(JSON.stringify(parts));
    return progress ? `${progress.completed} of ${progress.total} topics learned` : "";
  };
  const syllabusBreadcrumbs = [{
    label: "Boards",
    ...(page !== "boards" && { onClick: () => openSyllabus() }),
  }];
  if (board) syllabusBreadcrumbs.push({
    label: board,
    ...(page !== "grades" && { onClick: () => openBoard(board) }),
  });
  if (grade) syllabusBreadcrumbs.push({
    label: grade,
    ...(page !== "subjects" && { onClick: () => openGrade(grade) }),
  });
  if (subject) syllabusBreadcrumbs.push({
    label: subject,
    ...(page === "sections"
      ? {}
      : page === "chapters"
        ? { onClick: section ? () => openSubject(subject) : () => setPage("subjects") }
        : { onClick: () => openSubject(subject) }),
  });
  if (section) syllabusBreadcrumbs.push({
    label: section,
    ...(page === "chapters"
      ? { onClick: () => setPage("sections") }
      : page === "concepts"
        ? { onClick: () => setPage("chapters") }
        : { onClick: () => openSection(section) }),
  });
  if (chapter) syllabusBreadcrumbs.push({
    label: chapter,
    ...(["concepts", "content"].includes(page) && { onClick: () => setPage("chapters") }),
  });
  if (page === "content" && currentTarget) {
    if (!currentTarget.chapterOnly) {
      syllabusBreadcrumbs.push({
        label: currentTarget.concept.name,
        onClick: () => setPage("concepts"),
      });
    }
    syllabusBreadcrumbs.push({ label: "Content" });
  }

  const recordConceptVisit = (item) => {
    if (!item) return;
    const key = getConceptKey(item);
    setActivity((previous) => {
      const next = {
        ...previous,
        concepts: {
          ...previous.concepts,
          [key]: {
            ...previous.concepts?.[key],
            lastOpenedAt: new Date().toISOString(),
            visits: (previous.concepts?.[key]?.visits || dashboard.conceptProgress[key]?.visits || 0) + 1,
          },
        },
      };
      saveStudentActivity(next);
      return next;
    });
  };

  const openSyllabus = () => {
    if (profileCurriculumAvailable) {
      setBoard(profileBoard);
      setGrade(profile.grade);
      setSubject(null);
      setSection(null);
      setChapter(null);
      setSelectedTargetKey("");
      setPage("subjects");
      return;
    }
    setBoard(null);
    setGrade(null);
    setSubject(null);
    setSection(null);
    setChapter(null);
    setSelectedTargetKey("");
    setPage("boards");
  };

  const openBoard = (name) => {
    setBoard(name);
    setGrade(null);
    setSubject(null);
    setSection(null);
    setChapter(null);
    setSelectedTargetKey("");
    setPage("grades");
  };

  const openGrade = (name) => {
    setGrade(name);
    setSubject(null);
    setSection(null);
    setChapter(null);
    setSelectedTargetKey("");
    setPage("subjects");
  };

  const openSubject = (name) => {
    setSubject(name);
    setSection(null);
    setChapter(null);
    setSelectedTargetKey("");
    const subjectData = selectedGrade?.subjects.find((item) => item.name === name);
    setPage(subjectData?.sections.length ? "sections" : "chapters");
  };

  const openSection = (name) => {
    setSection(name);
    setChapter(null);
    setSelectedTargetKey("");
    setPage("chapters");
  };

  const openChapter = (chapterItem) => {
    setChapter(chapterItem.name);
    setSelectedTargetKey("");
    setPage("concepts");
  };

  const openLearningPoint = (item) => {
    if (!item) {
      openSyllabus();
      return;
    }
    setBoard(item.board);
    setGrade(item.grade);
    setSubject(item.subject);
    setSection(item.section || null);
    setChapter(item.chapter);
    setSelectedTargetKey(item.key);
    setPage("concepts");
    recordConceptVisit(item);
  };

  const startPractice = (item) => {
    const target = item || dashboard.focus.item || dashboard.catalog.find((candidate) =>
      candidate.board === profileBoard &&
      candidate.grade === profile.grade &&
      (!profile.subjects.length || profile.subjects.includes(candidate.subject))
    ) || dashboard.catalog[0];
    setPracticeTargetKey(target?.key || "");
    const index = practiceBank.findIndex((entry) => entry.key === target?.key);
    setPracticeIndex(index >= 0 ? index : 0);
    setSelectedAnswer(null);
    setPage("practice");
  };

  const navigate = (destination) => {
    if (destination === "subjects") {
      openSyllabus();
      return;
    }
    if (destination === "practice") {
      startPractice(dashboard.focus.item);
      return;
    }
    setPage(destination);
  };

  const handleFocus = (focus) => {
    if (focus.type === "review" || focus.type === "practice") {
      startPractice(focus.item);
    } else {
      openLearningPoint(focus.item);
    }
  };

  const markConceptComplete = (item) => {
    const key = getConceptKey(item);
    setActivity((previous) => {
      const next = {
        ...previous,
        concepts: {
          ...previous.concepts,
          [key]: {
            ...previous.concepts?.[key],
            lastOpenedAt: previous.concepts?.[key]?.lastOpenedAt || dashboard.conceptProgress[key]?.lastOpenedAt || new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
        },
      };
      saveStudentActivity(next);
      return next;
    });
  };

  const answerQuestion = (answer) => {
    if (!practiceItem || selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    const correct = answer === practiceItem.question.answer;
    const attempt = {
      ...getLearningRecordContext(practiceItem),
      correct,
      date: new Date().toISOString(),
    };

    setAttempts((previous) => {
      const next = [...previous, attempt];
      savePracticeAttempts(next);
      return next;
    });
    if (!correct) {
      const mistake = {
        ...getLearningRecordContext(practiceItem),
        question: practiceItem.question.question,
        userAnswer: answer,
        correctAnswer: practiceItem.question.answer,
        date: attempt.date,
      };
      setMistakes((previous) => {
        const next = [...previous, mistake];
        saveMistakes(next);
        return next;
      });
    }
  };

  const recordAiMistake = ({ question, answer, correction, category, conceptContext }) => {
    const timestamp = new Date().toISOString();
    const mistake = {
      id: `ai-${timestamp}-${mistakes.length}`,
      ...(conceptContext
        ? getLearningRecordContext(conceptContext)
        : { subject: "AI Study Partner", chapter: "Conversation", concept: "" }),
      question,
      userAnswer: answer,
      correctAnswer: correction || "",
      category,
      date: timestamp,
    };
    setMistakes((previous) => {
      const next = [...previous, mistake];
      saveMistakes(next);
      return next;
    });
  };

  const recordAiAssessment = ({ concept, assessment }) => {
    if (!concept) return;
    const attempt = {
      conceptId: concept.key,
      board: concept.board,
      grade: concept.grade,
      subject: concept.subject,
      section: concept.section,
      chapter: concept.chapter,
      chapterId: concept.chapterId,
      concept: concept.concept,
      correct: assessment === "correct",
      assessment,
      date: new Date().toISOString(),
    };
    setAttempts((previous) => {
      const next = [...previous, attempt];
      savePracticeAttempts(next);
      return next;
    });
  };

  const goHome = () => {
    setPage("home");
    setBoard(null);
    setGrade(null);
    setSubject(null);
    setSection(null);
    setChapter(null);
    setSelectedTargetKey("");
  };

  return (
    <div className="app">
      <nav className="navbar" aria-label="Main navigation">
        <button onClick={goHome} className="logo">Syllabusaurus</button>
        <div className="nav-links">
          <button className={page === "home" ? "is-active" : ""} onClick={goHome}>Home</button>
          <button className={["boards", "grades", "subjects", "sections", "chapters", "concepts", "content"].includes(page) ? "is-active" : ""} onClick={() => navigate("subjects")}>Syllabus</button>
          <button className={page === "planner" ? "is-active" : ""} onClick={() => navigate("planner")}>Planner</button>
          <button className={page === "practice" ? "is-active" : ""} onClick={() => navigate("practice")}>Practice</button>
          <button className={page === "formulas" ? "is-active" : ""} onClick={() => navigate("formulas")}>Formula sheet</button>
          <button className={page === "mistakes" ? "is-active" : ""} onClick={() => navigate("mistakes")}>Mistakes{mistakes.length > 0 ? ` · ${mistakes.length}` : ""}</button>
          <button className={page === "ai" ? "is-active" : ""} onClick={() => navigate("ai")}>AI study partner</button>
          <button className={page === "profile" ? "is-active" : ""} onClick={() => setPage("profile")}>Profile / settings</button>
          <button className="sign-out-button" onClick={onSignOut}>Sign Out</button>
        </div>
      </nav>
      {authError && <p className="auth-session-error" role="alert">{authError}</p>}

      {page === "home" && (
        <HomeDashboard
          dashboard={dashboard}
          fullName={profile.full_name}
          onNavigate={navigate}
          onContinue={openLearningPoint}
          onFocus={handleFocus}
          onReviewMistakes={() => setPage("mistakes")}
        />
      )}

      {page === "boards" && (
        <main className="content content-page syllabus-page">
          <SyllabusPageHeader
            breadcrumbs={syllabusBreadcrumbs}
            eyebrow="SYLLABUS DECODER"
            title="Choose your board"
            description="Select the curriculum you are studying to explore its grades, subjects, and topics."
          />
          <div className="cards syllabus-grid">
            {syllabus.boards.map((item) => (
              <button className="card syllabus-card" key={item.name} onClick={() => openBoard(item.name)}>
                <span className="syllabus-card-label">BOARD</span>
                <h2>{item.name}</h2>
                <p>{item.grades.length} grades <span aria-hidden="true">·</span> {getProgressLabel("board", item.name)}</p>
                <span className="syllabus-card-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </main>
      )}

      {page === "grades" && selectedBoard && (
        <main className="content content-page syllabus-page">
          <SyllabusPageHeader
            breadcrumbs={syllabusBreadcrumbs}
            eyebrow={`${board} SYLLABUS`}
            title="Choose a grade"
            description="Pick your current grade. Your learning progress is kept separate by board and grade."
          />
          <div className="cards syllabus-grid">
            {selectedBoard.grades.map((item) => (
              <button className="card syllabus-card" key={item.name} onClick={() => openGrade(item.name)}>
                <span className="syllabus-card-label">GRADE</span>
                <h2>{item.name}</h2>
                <p>{item.subjects.length} subjects <span aria-hidden="true">·</span> {getProgressLabel("grade", board, item.name)}</p>
                <span className="syllabus-card-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </main>
      )}

      {page === "subjects" && selectedGrade && (
        <main className="content content-page syllabus-page">
          <SyllabusPageHeader
            breadcrumbs={syllabusBreadcrumbs}
            eyebrow={`${board} · ${grade}`}
            title="Choose a subject"
            description="Start with a subject to view its official units and chapters."
          />
          {profileCurriculumAvailable && (
            <button className="text-action syllabus-browse-all" onClick={() => {
              setBoard(null);
              setGrade(null);
              setSubject(null);
              setSection(null);
              setChapter(null);
              setPage("boards");
            }}>Browse other curricula <span aria-hidden="true">→</span></button>
          )}
          <div className="cards syllabus-grid">
            {selectedGrade.subjects
              .filter((item) => !profileCurriculumAvailable || board !== profileBoard ||
                !profile.subjects.length || profile.subjects.includes(item.name))
              .map((item) => (
              <button className="card syllabus-card" key={item.name} onClick={() => openSubject(item.name)}>
                <span className="syllabus-card-label">SUBJECT</span>
                <h2>{item.name}</h2>
                <p>{item.sections.length
                  ? `${item.sections.length} units / sections`
                  : `${item.chapters.length} chapters`} <span aria-hidden="true">·</span> {getProgressLabel("subject", board, grade, item.name)}</p>
                <span className="syllabus-card-arrow" aria-hidden="true">→</span>
              </button>
              ))}
          </div>
        </main>
      )}

      {page === "sections" && selectedSubject && (
        <main className="content content-page syllabus-page">
          <SyllabusPageHeader
            breadcrumbs={syllabusBreadcrumbs}
            eyebrow={`${board} · ${grade} · ${subject}`}
            title="Choose a unit or section"
            description="Units and sections keep the original syllabus hierarchy intact."
          />
          <div className="cards syllabus-grid">
            {selectedSubject.sections.map((item) => (
              <button className="card syllabus-card" key={item.name} onClick={() => openSection(item.name)}>
                <span className="syllabus-card-label">UNIT / SECTION</span>
                <h2>{item.name}</h2>
                <p>{item.chapters.length} chapters <span aria-hidden="true">·</span> {getProgressLabel("section", board, grade, subject, item.name)}</p>
                <span className="syllabus-card-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </main>
      )}

      {page === "chapters" && selectedSubject && (
        <main className="content content-page syllabus-page">
          <SyllabusPageHeader
            breadcrumbs={syllabusBreadcrumbs}
            eyebrow={`${board} · ${grade} · ${subject}`}
            title={section || subject}
            description="Choose a chapter to see the learning topics listed in the syllabus."
          />
          <div className="cards syllabus-grid">
            {availableChapters.map((item) => {
              const topicCount = countConceptNodes(item);
              return (
                <button className="card syllabus-card" key={item.name} onClick={() => openChapter(item)}>
                  <span className="syllabus-card-label">CHAPTER</span>
                  <h2>{item.name}</h2>
                  <p>{topicCount ? `${topicCount} listed topics` : "Chapter focus only"} <span aria-hidden="true">·</span> {getProgressLabel("chapter", board, grade, subject, section || "", item.name)}</p>
                  <span className="syllabus-card-arrow" aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
        </main>
      )}

      {page === "concepts" && selectedChapter && (
        <main className="content content-page syllabus-page">
          <SyllabusPageHeader
            breadcrumbs={syllabusBreadcrumbs}
            eyebrow={`${board} · ${grade} · ${subject}${section ? ` · ${section}` : ""}`}
            title="Listed learning topics"
            description={`${chapter} · ${getProgressLabel("chapter", board, grade, subject, section || "", chapter)}. Select a topic to continue learning, practice, and revision.`}
          />
          {chapterHasSubtopics || chapterHasVerifiedContent ? (
          <div className="concept-list">
            {chapterTopicTargets.map((item) => {
              const progress = dashboard.conceptProgress[item.key];
              const topicContent = collectConceptContent(academicContent.conceptsById[item.key]);
              const hasVerifiedContent = topicContent.some((content) =>
                ["verified", "VERIFIED", "DERIVED"].includes(content.verificationStatus)
              );
              return (
                <article className="concept-card syllabus-topic-card" key={item.key}>
                  <button
                    className="concept-button"
                    onClick={() => {
                      setSelectedTargetKey(item.key);
                      recordConceptVisit(item);
                      setPage("content");
                    }}
                  >
                    <span>
                      {item.concept.name}
                      {item.concept.path.length > 0 && (
                        <small className="concept-path">{item.concept.path.join(" › ")}</small>
                      )}
                    </span>
                    <span className="concept-status">
                      {progress?.completedAt ? "Learned" : hasVerifiedContent ? "Content available" : "Being prepared"}
                    </span>
                  </button>
                </article>
              );
            })}
          </div>
          ) : (
            <div className="empty-panel syllabus-content-preparing" role="status">
              <h2>Content being prepared</h2>
              <p>This chapter has no subtopics or concept-level academic content available yet.</p>
            </div>
          )}
        </main>
      )}

      {page === "content" && selectedChapter && currentTarget && (
        <main className="content content-page syllabus-page">
          <SyllabusPageHeader
            breadcrumbs={syllabusBreadcrumbs}
            eyebrow={`${board} · ${grade} · ${subject}${section ? ` · ${section}` : ""} · ${chapter}`}
            title={currentTarget.concept.name}
            description={currentTarget.concept.path.length
              ? currentTarget.concept.path.join(" › ")
              : "Chapter-level content"}
          />
          {verifiedSelectedFormulas.length > 0 && (
            <section className="formula-results syllabus-academic-content" aria-label="Formula Sheet">
              <h2>Formula Sheet <span>{verifiedSelectedFormulas.length}</span></h2>
              {verifiedSelectedFormulas.map((formula) => (
                <FormulaCard key={formula.id} formula={formula} />
              ))}
            </section>
          )}
          {verifiedSelectedAcademicContent.length > 0 && (
            <section className="formula-results syllabus-academic-content" aria-label="Verified academic content">
              <h2>Verified academic content <span>{verifiedSelectedAcademicContent.length}</span></h2>
              {verifiedSelectedAcademicContent.map((item) => (
                <AcademicContentCard key={item.id} item={item} />
              ))}
            </section>
          )}
          {verifiedSelectedContent.length === 0 && (
            <div className="empty-panel syllabus-content-preparing" role="status">
              <h2>Content being prepared</h2>
              <p>Verified academic content for this subtopic is not available yet.</p>
            </div>
          )}
          {unverifiedSelectedContent.length > 0 && (
            <section className="formula-results syllabus-academic-content">
              <h2>Pending verification <span>{unverifiedSelectedContent.length}</span></h2>
              <p className="formula-verification-note">These existing records are not treated as verified.</p>
              {unverifiedSelectedContent.map((item) => (
                <AcademicContentCard key={item.id} item={item} />
              ))}
            </section>
          )}
          <div className="concept-actions">
            <button className="text-action" onClick={() => setPage("ai")}>Study with AI <span aria-hidden="true">→</span></button>
            <button className="action-button action-button-dark" onClick={() => startPractice(currentTarget)}>Practise this concept <span aria-hidden="true">→</span></button>
            <button className="text-action" onClick={() => markConceptComplete(currentTarget)}>
              {dashboard.conceptProgress[currentTarget.key]?.completedAt ? "Marked learned" : "Mark as learned"}
            </button>
          </div>
        </main>
      )}

      {page === "formulas" && (
        <main className="content content-page formula-sheet-page">
          <p className="eyebrow">STRUCTURED ACADEMIC CONTENT</p>
          <h1>Formula sheet</h1>
          <p className="page-intro">Formulas and supporting academic content are collected from the shared academic-content model. Pending items are kept separate from verified and derived content.</p>
          <div className="formula-filters" aria-label="Formula filters">
            <label>
              Board / exam
              <select value={formulaScope.board} onChange={(event) => setFormulaScope({
                board: event.target.value,
                grade: "",
                subject: "",
                chapter: "",
              })}>
                <option value="">All boards / exams</option>
                {academicContent.boards.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </label>
            <label>
              Class / grade
              <select value={formulaScope.grade} disabled={!formulaSelectedBoard} onChange={(event) => setFormulaScope((previous) => ({
                ...previous,
                grade: event.target.value,
                subject: "",
                chapter: "",
              }))}>
                <option value="">All classes</option>
                {formulaSelectedBoard?.grades.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </label>
            <label>
              Subject
              <select value={formulaScope.subject} disabled={!formulaSelectedGrade} onChange={(event) => setFormulaScope((previous) => ({
                ...previous,
                subject: event.target.value,
                chapter: "",
              }))}>
                <option value="">All subjects</option>
                {formulaSelectedGrade?.subjects.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
            </label>
            <label>
              Chapter
              <select value={formulaScope.chapter} disabled={!formulaSelectedSubject} onChange={(event) => setFormulaScope((previous) => ({
                ...previous,
                chapter: event.target.value,
              }))}>
                <option value="">All chapters</option>
                {formulaChapters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="formula-search">
              Search content
              <input
                type="search"
                value={formulaSearch}
                onChange={(event) => setFormulaSearch(event.target.value)}
                placeholder="Name, concept, variable, or keyword"
              />
            </label>
            <label>
              Content type
              <select value={contentTypeFilter} onChange={(event) => setContentTypeFilter(event.target.value)}>
                <option value="">All content types</option>
                {CONTENT_TYPES.map((type) => <option value={type} key={type}>{type.replaceAll("_", " ")}</option>)}
              </select>
            </label>
          </div>
          <section className="formula-results" aria-live="polite">
            <h2>Verified and derived content <span>{verifiedContent.length}</span></h2>
            {verifiedContent.length
              ? <>
                {verifiedContent
                  .filter((item) => item.type !== "formula" || item.subject !== "Chemistry")
                  .map((item) => item.type === "formula"
                    ? <FormulaCard key={item.id} formula={item} />
                    : <AcademicContentCard key={item.id} item={item} />)}
                <ChemistryFormulaGroups
                  formulas={verifiedContent.filter((item) => item.type === "formula" && item.subject === "Chemistry")}
                />
              </>
              : <div className="empty-panel"><p>No verified or derived content matches this selection yet. Pending content is kept separate until a source is checked.</p></div>}
          </section>
          {unverifiedContent.length > 0 && (
            <section className="formula-results">
              <h2>Pending verification <span>{unverifiedContent.length}</span></h2>
              <p className="formula-verification-note">These records are shown separately and are not treated as verified.</p>
              {unverifiedContent
                .filter((item) => item.type !== "formula" || item.subject !== "Chemistry")
                .map((item) => item.type === "formula"
                  ? <FormulaCard key={item.id} formula={item} />
                  : <AcademicContentCard key={item.id} item={item} />)}
              <ChemistryFormulaGroups
                formulas={unverifiedContent.filter((item) => item.type === "formula" && item.subject === "Chemistry")}
              />
            </section>
          )}
        </main>
      )}

      {page === "planner" && (
        <main className="content content-page">
          <p className="eyebrow">STUDY PLANNER</p>
          <h1>Today's focus</h1>
          <p className="page-intro">Your next step is based on your learning and practice activity.</p>
          <div className="planner-focus">
            <span className="eyebrow">{dashboard.focus.type === "review" ? "REVISION PRIORITY" : "RECOMMENDED NEXT"}</span>
            <h2>{dashboard.focus.item?.concept.name || "Explore your syllabus"}</h2>
            <p>{dashboard.focus.item
              ? `${dashboard.focus.item.board} · ${dashboard.focus.item.grade} · ${dashboard.focus.item.subject}${dashboard.focus.item.section ? ` · ${dashboard.focus.item.section}` : ""} · ${dashboard.focus.item.chapter}`
              : "Choose a subject to get started."}</p>
            <button className="action-button action-button-dark" onClick={() => handleFocus(dashboard.focus)}>{dashboard.focus.type === "review" ? "Practise this concept" : "Open this concept"} <span aria-hidden="true">→</span></button>
          </div>
          <h2 className="subheading">Study activity</h2>
          <div className="activity-summary">
            <p><strong>{dashboard.completedConcepts}</strong><span>concepts learned</span></p>
            <p><strong>{dashboard.totalAttempts}</strong><span>practice attempts</span></p>
            <p><strong>{dashboard.mistakeCount}</strong><span>mistakes to review</span></p>
          </div>
        </main>
      )}

      {page === "practice" && (
        <main className="content content-page">
          <p className="eyebrow">PRACTICE</p>
          <h1>Check your understanding</h1>
          {practiceItem ? (
            <article className="practice-panel">
              <p className="question-context">{practiceItem.board} · {practiceItem.grade} · {practiceItem.subject}{practiceItem.section ? ` · ${practiceItem.section}` : ""} · {practiceItem.chapter} · {practiceItem.concept.name}</p>
              <p className="question-count">Question {practiceIndex + 1} of {practiceBank.length}</p>
              <div className="practice-prompt-row">
                <h2>{practiceItem.question.question}</h2>
                <CopyButton text={practiceItem.question.question} />
              </div>
              <div className="answer-list">
                {practiceItem.question.options.map((answer) => {
                  const isCorrect = answer === practiceItem.question.answer;
                  const isSelected = answer === selectedAnswer;
                  return (
                    <button
                      key={answer}
                      className={`answer-option${selectedAnswer !== null && isCorrect ? " answer-correct" : ""}${isSelected && !isCorrect ? " answer-incorrect" : ""}`}
                      disabled={selectedAnswer !== null}
                      onClick={() => answerQuestion(answer)}
                    >
                      {answer}
                      {selectedAnswer !== null && isCorrect && <span>Correct answer</span>}
                    </button>
                  );
                })}
              </div>
              {selectedAnswer !== null && (
                <div className={`answer-feedback${selectedAnswer === practiceItem.question.answer ? " feedback-correct" : " feedback-incorrect"}`} role="status">
                  {selectedAnswer === practiceItem.question.answer ? "Correct. Answer recorded." : "Not quite. This concept has been added to your revision priorities."}
                </div>
              )}
              <button
                className="action-button action-button-dark"
                disabled={selectedAnswer === null}
                onClick={() => {
                  setPracticeIndex((practiceIndex + 1) % practiceBank.length);
                  setSelectedAnswer(null);
                }}
              >
                Next question <span aria-hidden="true">→</span>
              </button>
            </article>
          ) : (
            <div className="empty-panel">
              <h2>{practiceTarget ? "No authored practice questions for this topic" : "No practice questions available"}</h2>
              <p>The authoritative syllabus provides topic structure, not practice questions. Syllabusaurus won’t invent questions here.</p>
              {practiceTarget && (
                <button
                  className="action-button action-button-dark"
                  onClick={() => {
                    openLearningPoint(practiceTarget);
                    setPage("ai");
                  }}
                >
                  Continue with AI Study Partner <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          )}
        </main>
      )}

      {page === "mistakes" && (
        <main className="content content-page">
          <p className="eyebrow">MISTAKE TRACKER</p>
          <h1>Review your mistakes</h1>
          <p className="page-intro">Missed answers are saved on this device and grouped into your revision priorities.</p>
          {mistakes.length > 0 ? (
            <div className="mistake-list">
              {[...mistakes].reverse().map((mistake) => (
                <article className="mistake-item" key={mistake.id}>
                  <p className="question-context">{[mistake.board, mistake.grade, mistake.subject, mistake.section, mistake.chapter, mistake.concept].filter(Boolean).join(" · ")}</p>
                  <h2>{mistake.question || "Saved practice mistake"}</h2>
                  <p><span>Your answer</span><strong>{mistake.userAnswer || "Not recorded"}</strong></p>
                  <p><span>Correct answer</span><strong>{mistake.correctAnswer || "Not recorded"}</strong></p>
                  {mistake.category && <p><span>AI classification</span><strong>{mistake.category}</strong></p>}
                  {resolveSyllabusTargetKey(mistake, dashboard.catalog) && (
                    <button className="text-action" onClick={() => startPractice(dashboard.catalog.find((item) => item.key === resolveSyllabusTargetKey(mistake, dashboard.catalog)))}>Practise this concept <span aria-hidden="true">→</span></button>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-panel"><h2>No mistakes recorded</h2><p>Practice results will appear here when an answer needs another look.</p><button className="action-button action-button-dark" onClick={() => navigate("practice")}>Start practice <span aria-hidden="true">→</span></button></div>
          )}
        </main>
      )}

      {page === "ai" && (
        <Suspense fallback={<main className="content content-page"><p role="status">Loading AI study partner…</p></main>}>
          <AIStudyPartner
            learningContext={aiLearningContext}
            studentProfile={profile}
            currentSelection={currentSelection}
            preferredConceptKey={preferredConceptKey}
            academicContentByConceptId={verifiedContentByConceptId}
            onRecordMistake={recordAiMistake}
            onRecordAssessment={recordAiAssessment}
            onPracticeConcept={(concept) => {
              const item = dashboard.catalog.find((candidate) => candidate.key === concept.key);
              if (!item || !practiceBank.some((entry) => entry.key === item.key)) return false;
              startPractice(item);
              return true;
            }}
          />
        </Suspense>
      )}
      {page === "profile" && (
        <StudentProfileSetup
          initialProfile={profile}
          syllabus={syllabus}
          isEditing
          onCancel={() => setPage("home")}
          onSave={async (nextProfile) => {
            const savedProfile = await onProfileChange(nextProfile);
            const savedBoard = getProfileBoardName(savedProfile);
            const hasSavedCurriculum = academicContent.boards
              .find((item) => item.name === savedBoard)?.grades
              .some((item) => item.name === savedProfile.grade);
            setBoard(hasSavedCurriculum ? savedBoard : null);
            setGrade(hasSavedCurriculum ? savedProfile.grade : null);
            setSubject(null);
            setSection(null);
            setChapter(null);
            setFormulaScope({
              board: hasSavedCurriculum ? savedBoard : "",
              grade: hasSavedCurriculum ? savedProfile.grade : "",
              subject: getProfileSubject(savedProfile),
              chapter: "",
            });
            setPage("home");
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [sessionCheckAttempt, setSessionCheckAttempt] = useState(0);
  const [profile, setProfile] = useState(null);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [profileUserId, setProfileUserId] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileErrorUserId, setProfileErrorUserId] = useState("");
  const [profileCheckAttempt, setProfileCheckAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let authEventReceived = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      authEventReceived = true;
      if (!active) return;
      setSession(nextSession);
      setSessionError("");
      setSessionReady(true);
    });

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active || authEventReceived) return;
        if (error) throw error;
        setSession(data.session);
        setSessionReady(true);
      })
      .catch((error) => {
        if (!active) return;
        setSessionError(error instanceof Error ? error.message : "Could not check your sign-in.");
        setSessionReady(true);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [sessionCheckAttempt]);

  useEffect(() => {
    let active = true;
    if (!session?.user?.id) return () => { active = false; };
    const userId = session.user.id;
    loadStudentProfile(session.user.id)
      .then((loadedProfile) => {
        if (!active) return;
        setProfile(loadedProfile);
        setOnboardingRequired(!loadedProfile?.onboarding_completed);
        setProfileUserId(userId);
        setProfileError("");
        setProfileErrorUserId("");
      })
      .catch((error) => {
        if (!active) return;
        const errorInfo = getStudentProfileErrorInfo(error, [
          session.access_token,
          session.refresh_token,
        ]);
        if (import.meta.env.DEV) {
          console.error("Student profile query failed.", {
            ...errorInfo,
            sessionExists: Boolean(session),
            authenticatedUserId: userId,
            tableName: STUDENT_PROFILE_TABLE,
          });
        }
        setProfileError(`Profile database error: ${errorInfo.message}${errorInfo.code ? ` (${errorInfo.code})` : ""}${errorInfo.status ? ` — HTTP ${errorInfo.status}` : ""}`);
        setProfileErrorUserId(userId);
      });

    return () => { active = false; };
  }, [session, profileCheckAttempt]);

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSessionError("");
    } catch (error) {
      setSessionError(`Could not sign out: ${error instanceof Error ? error.message : "Please try again."}`);
    }
  }

  if (!sessionReady) {
    return (
      <main className="auth-loading" role="status">
        <span className="auth-loading-mark" aria-hidden="true">S</span>
        <p>Checking your secure session…</p>
      </main>
    );
  }

  if (sessionError && !session) {
    return (
      <main className="auth-loading auth-loading-error" role="alert">
        <span className="auth-loading-mark" aria-hidden="true">S</span>
        <p>We couldn’t check your sign-in: {sessionError}</p>
        <button onClick={() => {
          setSessionReady(false);
          setSessionError("");
          setSessionCheckAttempt((attempt) => attempt + 1);
        }}>Try again</button>
      </main>
    );
  }

  if (!session) return <Auth />;
  if (profileUserId !== session.user.id && profileErrorUserId !== session.user.id) {
    return (
      <main className="auth-loading" role="status">
        <span className="auth-loading-mark" aria-hidden="true">S</span>
        <p>Loading your student profile…</p>
      </main>
    );
  }
  if (profileErrorUserId === session.user.id) {
    return (
      <main className="auth-loading auth-loading-error" role="alert">
        <span className="auth-loading-mark" aria-hidden="true">S</span>
        <p>We couldn’t load your student profile: {profileError}</p>
        <div className="profile-load-actions">
          <button onClick={() => {
            setProfileUserId("");
            setProfileErrorUserId("");
            setProfileCheckAttempt((attempt) => attempt + 1);
          }}>Try again</button>
          <button onClick={signOut}>Sign out</button>
        </div>
      </main>
    );
  }
  if (onboardingRequired || !profile?.onboarding_completed) {
    const userName = session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.email?.split("@")[0] ||
      "";
    return (
      <StudentProfileSetup
        initialProfile={profile}
        syllabus={syllabus}
        userName={userName}
        onSave={async (nextProfile) => {
          try {
            const savedProfile = await saveStudentProfile(session.user.id, nextProfile);
            setProfile(savedProfile);
            setOnboardingRequired(false);
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error("Student profile save failed.", error);
            }
            throw error;
          }
        }}
      />
    );
  }
  return (
    <SyllabusaurusApp
      onSignOut={signOut}
      authError={sessionError}
      profile={profile}
      onProfileChange={async (nextProfile) => {
        try {
          const savedProfile = await saveStudentProfile(session.user.id, nextProfile);
          setProfile(savedProfile);
          return savedProfile;
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Student profile update failed.", error);
          }
          throw error;
        }
      }}
    />
  );
}