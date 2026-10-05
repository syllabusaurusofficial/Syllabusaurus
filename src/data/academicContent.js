import { formulaData } from "./formulas.js";
import { class11ChemistryFormulas } from "./class11ChemistryFormulas.js";
import { class11MathematicsFormulas } from "./class11MathematicsFormulas.js";
import { class12MathematicsFormulas } from "./class12MathematicsFormulas.js";
import {
  class11PhysicsChapters,
  class11PhysicsContentRecords,
} from "./class11PhysicsContent.js";
import { getSyllabusCatalog } from "./parseOfficialSyllabus.js";

export const CONTENT_TYPES = [
  "definition",
  "formula",
  "law",
  "theorem",
  "principle",
  "reaction",
  "derivation",
  "proof",
  "fact",
  "rule",
  "exception",
  "unit",
  "example",
  "common_mistake",
  "shortcut",
  "diagram",
];

export const ACADEMIC_SOURCES = [
  "NCERT",
  "CBSE",
  "JEE",
  "official syllabus",
  "teacher_verified",
  "pending_verification",
];

export const VERIFICATION_STATUSES = [
  "verified",
  "pending",
  "draft",
  "VERIFIED",
  "DERIVED",
  "PENDING",
  "EXCLUDED",
];

const legacyFormulaScope = {
  board: "CBSE",
  grade: "Grade 11",
  subject: "Mathematics",
  chapter: "Introduction to Three-Dimensional Geometry",
};

function encodeId(parts) {
  return parts.map((part) => encodeURIComponent(part || "")).join("::");
}

function encodeIdentifier(parts) {
  return encodeId(parts);
}

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createAcademicContentRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new TypeError("Academic content must be a record.");
  }
  if (!record.id || !record.name || !CONTENT_TYPES.includes(record.type)) {
    throw new TypeError("Academic content requires an id, name, and supported type.");
  }
  if (!ACADEMIC_SOURCES.includes(record.source)) {
    throw new TypeError(`Academic content has an unsupported source: ${record.source || "missing"}.`);
  }
  if (!VERIFICATION_STATUSES.includes(record.verificationStatus)) {
    throw new TypeError(`Academic content has an unsupported verification status: ${record.verificationStatus || "missing"}.`);
  }
  if (record.type === "formula" && !record.expression) {
    throw new TypeError(`Formula "${record.id}" requires an expression.`);
  }
  return record;
}

function mapConcept(
  node,
  chapterPath,
  parentId = null,
  depth = 0,
  parentPath = [],
) {
  const conceptPath = [...parentPath, node.name];
  const id = encodeId([...chapterPath, ...conceptPath]);
  const concept = {
    id,
    name: node.name,
    type: depth === 0 ? "concept" : "sub_concept",
    parentId,
    content: [],
    conditions: [],
    practiceQuestions: [],
    revision: {},
    children: [],
  };
  concept.children = node.children.map((child) =>
    mapConcept(child, chapterPath, id, depth + 1, conceptPath),
  );
  return concept;
}

function buildLegacyFormulas(catalog) {
  const scopedChapter = catalog.find((entry) =>
    entry.board === legacyFormulaScope.board &&
    entry.grade === legacyFormulaScope.grade &&
    entry.subject === legacyFormulaScope.subject &&
    entry.chapter === legacyFormulaScope.chapter &&
    !entry.section &&
    entry.chapterOnly
  );
  if (!scopedChapter) {
    throw new Error(
      `Legacy formulas require ${legacyFormulaScope.grade} ${legacyFormulaScope.subject}: ${legacyFormulaScope.chapter}.`,
    );
  }

  const legacyFormulas = Object.entries(formulaData).map(([name, expression]) => {
    const conceptId = scopedChapter.key;
    return createAcademicContentRecord({
      id: [
        legacyFormulaScope.board,
        legacyFormulaScope.grade,
        legacyFormulaScope.subject,
        legacyFormulaScope.chapter,
        name,
      ].map(toSlug).join("-"),
      conceptId,
      chapterId: scopedChapter.chapterId,
      type: "formula",
      name,
      expression,
      board: legacyFormulaScope.board,
      grade: legacyFormulaScope.grade,
      subject: legacyFormulaScope.subject,
      chapter: legacyFormulaScope.chapter,
      concept: legacyFormulaScope.chapter,
      variables: {},
      variableMeanings: {},
      units: "Pending verification",
      conditions: "Pending verification",
      importance: "Not assessed",
      importantNote: "",
      category: "legacy",
      source: "pending_verification",
      verificationStatus: "pending",
      curriculumScope: ["Direction Ratios", "Direction Cosines"].includes(name)
        ? "scope_unverified"
        : "in_scope",
      relatedFormulas: [],
      relatedConcepts: [],
      commonMistakes: [],
      examples: [],
      keywords: [],
    });
  });

  const importedFormulas = class11MathematicsFormulas.map((formula) => {
    const chapter = catalog.find((entry) =>
      entry.board === formula.board &&
      entry.grade === formula.grade &&
      entry.subject === formula.subject &&
      entry.chapter === formula.chapter &&
      entry.chapterOnly
    );
    if (!chapter) {
      throw new Error(
        `Formula "${formula.id}" references a chapter not found in the CBSE Grade 11 Mathematics syllabus: ${formula.chapter}.`,
      );
    }
    return createAcademicContentRecord({
      ...formula,
      chapterId: chapter.chapterId,
      conceptId: formula.concept === formula.chapter
        ? chapter.key
        : `${chapter.chapterId}::${encodeURIComponent(formula.concept)}`,
    });
  });

  const formulaIds = new Set();
  for (const formula of importedFormulas) {
    if (formulaIds.has(formula.id)) {
      throw new Error(`Duplicate structured formula ID: ${formula.id}.`);
    }
    formulaIds.add(formula.id);
  }

  const combinedById = new Map(legacyFormulas.map((formula) => [formula.id, formula]));
  for (const formula of importedFormulas) {
    combinedById.set(formula.id, {
      ...combinedById.get(formula.id),
      ...formula,
    });
  }
  return [...combinedById.values()];
}

function buildPhysicsRecords() {
  return class11PhysicsContentRecords.map((record) => {
    const chapterPath = [
      record.board,
      record.grade,
      record.subject,
      "",
      record.chapter,
    ];
    return createAcademicContentRecord({
      ...record,
      chapterId: encodeId(chapterPath),
      conceptId: encodeId([...chapterPath, record.concept]),
    });
  });
}

function buildChemistryRecords(catalog) {
  const records = class11ChemistryFormulas.map((formula) => {
    const target = catalog.find((entry) =>
      entry.board === formula.board &&
      entry.grade === formula.grade &&
      entry.subject === formula.subject &&
      entry.section === formula.section &&
      entry.chapter === formula.chapter &&
      entry.concept.name === formula.concept
    );
    if (!target) {
      throw new Error(
        `Chemistry formula "${formula.id}" references a concept not found in the CBSE Grade 11 syllabus: ${formula.chapter} → ${formula.concept}.`,
      );
    }
    return createAcademicContentRecord({
      ...formula,
      chapterId: target.chapterId,
      conceptId: target.key,
    });
  });
  const ids = new Set();
  for (const record of records) {
    if (ids.has(record.id)) {
      throw new Error(`Duplicate Class XI Chemistry formula ID: ${record.id}.`);
    }
    ids.add(record.id);
  }
  return records;
}

function buildClass12MathematicsRecords(catalog) {
  const records = class12MathematicsFormulas.map((formula) => {
    const target = catalog.find((entry) =>
      entry.board === formula.board &&
      entry.grade === formula.grade &&
      entry.subject === formula.subject &&
      entry.section === "" &&
      entry.chapter === formula.chapter &&
      entry.chapterOnly
    );
    if (!target) {
      throw new Error(
        `Class XII Mathematics formula "${formula.id}" references a chapter not found in the loaded CBSE syllabus: ${formula.chapter}.`,
      );
    }
    return createAcademicContentRecord({
      ...formula,
      chapterId: target.chapterId,
      conceptId: target.key,
    });
  });
  const ids = new Set();
  for (const record of records) {
    if (ids.has(record.id)) {
      throw new Error(`Duplicate Class XII Mathematics formula ID: ${record.id}.`);
    }
    ids.add(record.id);
  }
  return records;
}

function buildPhysicsChapters(boardName, gradeName, subjectName, records) {
  return class11PhysicsChapters.map((name, index) => {
    const chapterNumber = index + 1;
    const chapterPath = [boardName, gradeName, subjectName, "", name];
    const chapterId = encodeId(chapterPath);
    const concepts = new Map();
    for (const record of records.filter((item) => item.chapterNumber === chapterNumber)) {
      let concept = concepts.get(record.conceptId);
      if (!concept) {
        concept = {
          id: record.conceptId,
          name: record.concept,
          type: "concept",
          parentId: null,
          content: [],
          conditions: [],
          practiceQuestions: [],
          revision: {},
          children: [],
        };
        concepts.set(record.conceptId, concept);
      }
      concept.content.push(record);
    }
    return {
      id: chapterId,
      name,
      section: "",
      concepts: [...concepts.values()],
      content: [],
    };
  });
}

function buildBoard(board, catalog, formulas) {
  return {
    id: encodeId([board.name]),
    name: board.name,
    grades: board.grades.map((grade) => ({
      id: encodeId([board.name, grade.name]),
      name: grade.name,
      subjects: grade.subjects.map((subject) => {
        const mapChapter = (chapter, section = "") => {
          const chapterPath = [
            board.name,
            grade.name,
            subject.name,
            section,
            chapter.name,
          ];
          const chapterId = encodeId(chapterPath);
          const scopedFormulas = formulas.filter((formula) =>
            formula.chapterId === chapterId &&
            formula.curriculumScope !== "scope_unverified"
          );
          let concepts = chapter.children.map((node) =>
            mapConcept(node, chapterPath)
          );
          if (scopedFormulas.length > 0 && chapter.children.length === 0) {
            const rootId = encodeIdentifier([...chapterPath, chapter.name]);
            const root = {
              id: rootId,
              name: chapter.name,
              type: "concept",
              parentId: null,
              content: [],
              conditions: [],
              practiceQuestions: [],
              revision: {},
              children: [],
            };
            const formulasByConcept = new Map();
            for (const formula of scopedFormulas) {
              const conceptsForFormula = formulasByConcept.get(formula.conceptId) || [];
              conceptsForFormula.push(formula);
              formulasByConcept.set(formula.conceptId, conceptsForFormula);
            }
            for (const [conceptId, formulasForConcept] of formulasByConcept) {
              if (conceptId === rootId) {
                root.content.push(...formulasForConcept);
                continue;
              }
              root.children.push({
                id: conceptId,
                name: formulasForConcept[0].concept,
                type: "concept",
                parentId: rootId,
                content: formulasForConcept,
                conditions: [],
                practiceQuestions: [],
                revision: {},
                children: [],
              });
            }
            concepts = [root, ...concepts];
          } else if (scopedFormulas.length > 0) {
            const conceptsById = new Map();
            const indexConcepts = (nodes) => {
              for (const concept of nodes) {
                conceptsById.set(concept.id, concept);
                indexConcepts(concept.children);
              }
            };
            indexConcepts(concepts);
            for (const formula of scopedFormulas) {
              const target = conceptsById.get(formula.conceptId);
              if (target) target.content.push(formula);
            }
          }

          return {
            id: chapterId,
            name: chapter.name,
            section,
            concepts,
            content: [],
          };
        };
        return {
          id: encodeId([board.name, grade.name, subject.name]),
          name: subject.name,
          chapters: subject.chapters.map((chapter) => mapChapter(chapter)),
          sections: subject.sections.map((section) => ({
            id: encodeId([board.name, grade.name, subject.name, section.name]),
            name: section.name,
            chapters: section.chapters.map((chapter) =>
              mapChapter(chapter, section.name)
            ),
          })),
        };
      }),
    })),
  };
}

export function createAcademicContent(syllabus) {
  const catalog = getSyllabusCatalog(syllabus);
  const formulas = [
    ...buildLegacyFormulas(catalog),
    ...buildPhysicsRecords(),
    ...buildChemistryRecords(catalog),
    ...buildClass12MathematicsRecords(catalog),
  ];
  const boards = syllabus.boards.map((board) => buildBoard(board, catalog, formulas));
  const physicsBoard = boards.find((board) => board.name === "CBSE");
  const physicsGrade = physicsBoard?.grades.find((grade) => grade.name === "Grade 11");
  const physicsSubject = physicsGrade?.subjects.find((subject) => subject.name === "Physics");
  if (!physicsSubject) {
    throw new Error("Class XI Physics content requires CBSE → Grade 11 → Physics in the syllabus catalog.");
  }
  physicsSubject.textbookChapters = buildPhysicsChapters(
    physicsBoard.name,
    physicsGrade.name,
    physicsSubject.name,
    formulas.filter((item) => item.subject === "Physics" && item.board === "CBSE" && item.grade === "Grade 11"),
  );
  const conceptsById = {};
  const indexConcepts = (concepts) => {
    for (const concept of concepts) {
      conceptsById[concept.id] = concept;
      indexConcepts(concept.children);
    }
  };
  for (const board of boards) {
    for (const grade of board.grades) {
      for (const subject of grade.subjects) {
        for (const chapter of subject.chapters) indexConcepts(chapter.concepts);
        for (const chapter of subject.textbookChapters || []) indexConcepts(chapter.concepts);
        for (const section of subject.sections) {
          for (const chapter of section.chapters) indexConcepts(chapter.concepts);
        }
      }
    }
  }
  return {
    boards,
    formulas,
    conceptsById,
  };
}

export function searchAcademicContent(items, { query = "", type = "" } = {}) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return items.filter((item) => {
    if (type && item.type !== type) return false;
    if (!normalizedQuery) return true;
    const variableText = Object.entries(item.variables || {})
      .flatMap(([symbol, meaning]) => [symbol, meaning])
      .join(" ");
    const searchableText = [
      item.name,
      item.expression,
      item.text,
      item.statement,
      item.explanation,
      item.subject,
      item.chapter,
      item.concept,
      item.conditions,
      item.source,
      item.category,
      variableText,
      ...(item.keywords || []),
      ...(item.relatedConcepts || []),
    ].join(" ").toLocaleLowerCase();
    return searchableText.includes(normalizedQuery);
  });
}
