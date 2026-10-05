# React + Vite

## Official syllabus source

`src/data/officialSyllabus.md` is the single academic source of truth. The app parses its Board → Grade → Subject → Unit/Section → Chapter → Concept outline through `src/data/index.js`; keep any syllabus updates in that Markdown file. Practice questions are not inferred from syllabus labels.

`src/data/academicContent.js` builds the structured academic model from that catalog. Its stable IDs follow the board, grade, subject, section, chapter, and concept path; chapter concepts can hold nested sub-concepts, typed content, and linked practice questions. Content records support definitions, formulas, laws, theorems, principles, reactions, derivations, proofs, facts, rules, exceptions, units, examples, common mistakes, shortcuts, and diagrams. Source and verification status are stored separately so an item is never considered verified just because it is present in the syllabus.

The Formula Sheet is generated from this model and filters by board/exam, grade, subject, and chapter. It separates verified formulas from entries requiring verification. Class 11 Mathematics records are maintained in `src/data/class11MathematicsFormulas.js` and cite the current NCERT Class XI Mathematics reprint or, for formative-only material, the latest available CBSE curriculum document. The verified set covers the 14 chapters in the 2026–27 NCERT reprint and the CBSE formative-only Principle of Mathematical Induction. Mathematical Reasoning is intentionally not included: it is absent from that NCERT table of contents and the latest available CBSE Class XI Mathematics syllabus. Existing formula expressions from `src/data/formulas.js` are retained; formulas without a current Class XI source remain pending. Legacy direction-ratio and direction-cosine entries remain pending and are excluded from Class 11 Formula Sheet results because the current Class XI syllabus does not establish their scope. Add new academic facts only with an explicit source and verification status. Reusable display components live in `src/components/AcademicContent.jsx`; search supports formula name, concept, chapter, subject, variables, and keywords, and accepts a content-type filter.

Practice attempts and mistakes use the syllabus concept ID as `conceptId` and can include a related `formulaId`, keeping student learning records linked to the structured content.

## Student profiles and onboarding

After Supabase sign-in, students without a completed profile are guided through the six-step setup. Profiles are stored per authenticated user in `public.student_profiles`; apply the migration with `supabase db push` from an authenticated Supabase CLI linked to the project. Row-level security limits profile reads and writes to the owning user. Board, grade, subject, goal, and learning preferences are used to initialise relevant syllabus, Formula Sheet, planner/practice, and AI study context. Students can update their profile from the main navigation.

## AI Study Partner setup

The partner is available from the main navigation and from an open syllabus concept. Its study actions use the selected syllabus focus and available saved progress or mistakes, and can continue as follow-up questions in the same conversation.

The AI Study Partner calls Gemini from the authenticated Supabase Edge Function in `supabase/functions/study-partner`. The Gemini API key is a server-side function secret; do not add it to a `VITE_` variable or commit it to the repository. Students use the existing Syllabusaurus Supabase sign-in to access the feature.

To deploy it to the Supabase project:

1. Create a Gemini API key in Google AI Studio.
2. Install the Supabase CLI using the instructions for your platform at [Supabase CLI](https://supabase.com/docs/guides/cli).
3. Sign in and link this checkout to the Supabase project:

   ```sh
   supabase login
   supabase link --project-ref <your-project-ref>
   ```

4. In the Supabase Dashboard, open the project's Edge Function secrets and add `GEMINI_API_KEY` with the key from Google AI Studio. Keep the value out of source files and terminal history.
5. Deploy the function:

   ```sh
   supabase functions deploy study-partner
   ```

The frontend continues to use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the existing Supabase client; neither contains the Gemini key.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
