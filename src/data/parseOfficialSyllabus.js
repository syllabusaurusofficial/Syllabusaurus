function getOrCreate(items, name, create) {
  let item = items.find((candidate) => candidate.name === name);
  if (!item) {
    item = create(name);
    items.push(item);
  }
  return item;
}

const catalogCache = new WeakMap();

export function parseOfficialSyllabus(markdown) {
  const boards = [];
  let board = null;
  let grade = null;
  let subject = null;
  let section = null;
  let listStack = [];

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^(#{2,5})\s+(.+?)\s*$/);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2];

      if (level === 2 && title.startsWith("Board: ")) {
        board = getOrCreate(boards, title.slice("Board: ".length), (name) => ({
          name,
          grades: [],
        }));
        grade = null;
        subject = null;
        section = null;
        listStack = [];
      } else if (level === 3 && board && title.startsWith("Grade ")) {
        grade = getOrCreate(board.grades, title, (name) => ({
          name,
          subjects: [],
        }));
        subject = null;
        section = null;
        listStack = [];
      } else if (level === 4 && grade && title.startsWith("Subject: ")) {
        subject = getOrCreate(grade.subjects, title.slice("Subject: ".length), (name) => ({
          name,
          sections: [],
          chapters: [],
        }));
        section = null;
        listStack = [];
      } else if (level === 5 && subject) {
        section = getOrCreate(subject.sections, title, (name) => ({
          name,
          chapters: [],
        }));
        listStack = [];
      }
      continue;
    }

    const bullet = line.match(/^(\s*)-\s+(.+?)\s*$/);
    if (!bullet || !subject) continue;

    const root = section ? section.chapters : subject.chapters;
    const indent = bullet[1].replaceAll("\t", "  ").length;
    const level = Math.floor(indent / 2);
    while (listStack.length > level) listStack.pop();

    const node = { name: bullet[2], children: [] };
    const parent = level > 0 ? listStack[level - 1] : null;
    if (parent) parent.children.push(node);
    else root.push(node);

    listStack[level] = node;
    listStack.length = level + 1;
  }

  return { boards };
}

function encodeIdentifier(parts) {
  return parts.map((part) => encodeURIComponent(part || "")).join("::");
}

export function getSyllabusCatalog(syllabus) {
  const cachedCatalog = catalogCache.get(syllabus);
  if (cachedCatalog) return cachedCatalog;

  const catalog = [];

  const addChapter = (board, grade, subject, section, chapter) => {
    const chapterPath = [
      board.name,
      grade.name,
      subject.name,
      section?.name || "",
      chapter.name,
    ];
    const chapterId = encodeIdentifier(chapterPath);
    const base = {
      board: board.name,
      grade: grade.name,
      subject: subject.name,
      section: section?.name || "",
      chapter: chapter.name,
      chapterId,
    };

    const addConcept = (node, parentPath) => {
      const conceptPath = [...parentPath, node.name];
      const key = encodeIdentifier([...chapterPath, ...conceptPath.slice(1)]);
      catalog.push({
        ...base,
        concept: {
          name: node.name,
          path: conceptPath,
        },
        key,
        chapterOnly: false,
      });
      for (const child of node.children) addConcept(child, conceptPath);
    };

    if (chapter.children.length) {
      for (const concept of chapter.children) addConcept(concept, [chapter.name]);
      return;
    }

    const key = encodeIdentifier([...chapterPath, chapter.name]);
    catalog.push({
      ...base,
      concept: { name: chapter.name, path: [] },
      key,
      chapterOnly: true,
    });
  };

  for (const board of syllabus.boards) {
    for (const grade of board.grades) {
      for (const subject of grade.subjects) {
        for (const chapter of subject.chapters) {
          addChapter(board, grade, subject, null, chapter);
        }
        for (const section of subject.sections) {
          for (const chapter of section.chapters) {
            addChapter(board, grade, subject, section, chapter);
          }
        }
      }
    }
  }

  catalogCache.set(syllabus, catalog);
  return catalog;
}
