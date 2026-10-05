import officialSyllabusMarkdown from "./officialSyllabus.md?raw";
import { parseOfficialSyllabus } from "./parseOfficialSyllabus.js";

export const syllabus = parseOfficialSyllabus(officialSyllabusMarkdown);
export { getSyllabusCatalog, parseOfficialSyllabus } from "./parseOfficialSyllabus.js";
