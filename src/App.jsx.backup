import { useState } from "react";
import { syllabus } from "./data";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [concept, setConcept] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);

  const openSubject = (name) => {
    setSubject(name);
    setChapter(null);
    setConcept(null);
    setPage("chapters");
  };

  const openChapter = (name) => {
    setChapter(name);
    setConcept(null);
    setPage("concepts");
  };

  const openConcept = (item) => {
    setConcept(item);
    setAnswer(null);
    setPage("learn");
  };

  return (
    <div className="app">

      <header className="header">
        <div className="logo" onClick={() => setPage("home")}>
          🦖 Syllabusaurus
        </div>

        <nav>
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("subjects")}>Syllabus</button>
          <button onClick={() => setPage("planner")}>Planner</button>
          <button onClick={() => setPage("practice")}>Practice</button>
          <button onClick={() => setPage("mistakes")}>Mistakes</button>
        </nav>
      </header>

      <main>

        {page === "home" && (
          <section className="hero">
            <p className="badge">SYLLABUS INTELLIGENCE PLATFORM</p>

            <h1>
              Syllabus Decoded,
              <br />
              Success Delivered.
            </h1>

            <p>
              Turn your syllabus into a structured learning system —
              concepts, learning, practice, mistakes, revision and progress.
            </p>

            <button
              className="primary"
              onClick={() => setPage("subjects")}
            >
              Decode My Syllabus →
            </button>

            <div className="feature-grid">

              <div>
                <strong>01 — Syllabus Decoder</strong>
                <span>
                  Break every chapter into clear, manageable concepts.
                </span>
              </div>

              <div>
                <strong>02 — Learn</strong>
                <span>
                  Understand concepts through explanations, formulas and examples.
                </span>
              </div>

              <div>
                <strong>03 — Practice</strong>
                <span>
                  Test your understanding with concept-based questions.
                </span>
              </div>

              <div>
                <strong>04 — Adaptive Revision</strong>
                <span>
                  Focus your revision where it matters most.
                </span>
              </div>

            </div>
          </section>
        )}

        {page === "subjects" && (
          <section className="section">

            <p className="badge">SYLLABUS DECODER</p>

            <h1>Choose a Subject</h1>

            <p>
              Select a subject to decode its chapters and learning concepts.
            </p>

            <div className="cards">

              {Object.keys(syllabus).map((name) => (

                <button
                  className="subject-card"
                  key={name}
                  onClick={() => openSubject(name)}
                >

                  <span>
                    {name === "Physics"
                      ? "⚛️"
                      : name === "Chemistry"
                      ? "🧪"
                      : "📐"}
                  </span>

                  <h2>{name}</h2>

                  <p>
                    {Object.keys(syllabus[name]).length} chapters
                  </p>

                </button>

              ))}

            </div>

          </section>
        )}

        {page === "chapters" && subject && (
          <section className="section">

            <button
              className="back"
              onClick={() => setPage("subjects")}
            >
              ← Subjects
            </button>

            <p className="badge">
              {subject.toUpperCase()}
            </p>

            <h1>Chapters</h1>

            <p>
              Select a chapter to see its decoded learning concepts.
            </p>

            <div className="cards">

              {Object.keys(syllabus[subject]).map((name) => (

                <button
                  className="chapter-card"
                  key={name}
                  onClick={() => openChapter(name)}
                >

                  <h2>{name}</h2>

                  <p>
                    {syllabus[subject][name].length} concepts →
                  </p>

                </button>

              ))}

            </div>

          </section>
        )}

        {page === "concepts" && subject && chapter && (
          <section className="section">

            <button
              className="back"
              onClick={() => setPage("chapters")}
            >
              ← Chapters
            </button>

            <p className="badge">
              {subject} / {chapter}
            </p>

            <h1>Decoded Concepts</h1>

            <p>
              Your chapter has been broken into focused learning units.
            </p>

            <div className="concept-list">

              {syllabus[subject][chapter].map((item, index) => (

                <button
                  className="concept"
                  key={item.id}
                  onClick={() => openConcept(item)}
                >

                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <strong>{item.name}</strong>

                  <small>
                    {item.difficulty} · Learn →
                  </small>

                </button>

              ))}

            </div>

          </section>
        )}

        {page === "learn" && concept && (
          <section className="section">

            <button
              className="back"
              onClick={() => setPage("concepts")}
            >
              ← Concepts
            </button>

            <p className="badge">
              {concept.difficulty.toUpperCase()} CONCEPT
            </p>

            <h1>{concept.name}</h1>

            <div className="learning-card">

              <h2>Concept Overview</h2>

              <p>
                {concept.explanation}
              </p>

            </div>

            <div className="learning-grid">

              <div className="info-card">
                <h3>Key Points</h3>

                {concept.keyPoints.map((point) => (
                  <p key={point}>• {point}</p>
                ))}
              </div>

              <div className="info-card">

                <h3>Formula / Facts</h3>

                <p>
                  {concept.formula}
                </p>

              </div>

              <div className="info-card">

                <h3>Common Mistakes</h3>

                {concept.mistakes.map((mistake) => (
                  <p key={mistake}>• {mistake}</p>
                ))}

              </div>

              <div className="info-card">

                <h3>Practice</h3>

                <p>
                  {concept.questions.length} concept-based question
                  available.
                </p>

              </div>

            </div>

            <button
              className="primary"
              onClick={() => { setAnswer(null); setPage("practice"); }}
            >
              Practice This Concept →
            </button>

          </section>
        )}

        {page === "practice" && (
          <section className="section">

            <p className="badge">PRACTICE ENGINE</p>

            <h1>Test Your Understanding</h1>\n\n            {concept && <p>Score: <strong>{score}</strong></p>}
            {answer && <div className="learning-card"><h3>{answer === concept.questions[0].answer ? "Correct!" : "Not quite"}</h3><p>{answer === concept.questions[0].answer ? "Excellent. Your answer is correct." : "Review the concept and try again."}</p></div>}

            <div className="question-card">

              <span>Concept Practice</span>

              <h2>
                {concept
                  ? concept.questions[0].question
                  : "Choose a concept from the Syllabus Decoder to begin practice."}
              </h2>

              {concept &&
                concept.questions[0].options.map((answer) => (

                  <button
                    className="answer"
                    key={answer}
                    onClick={() => { setAnswer(answer); if(answer === concept.questions[0].answer) setScore(x => x + 1); else localStorage.setItem("syllabusaurus:mistakes", JSON.stringify([...JSON.parse(localStorage.getItem("syllabusaurus:mistakes") || "[]"), {subject, chapter, concept: concept.name, question: concept.questions[0].question, yourAnswer: answer, correctAnswer: concept.questions[0].answer, date: new Date().toISOString()}])); }}
                  >
                    {answer}
                  </button>

                ))}

            </div>

          </section>
        )}

        {page === "mistakes" && (
          <section className="section">
            <p className="badge">MISTAKE TRACKER</p>
            <h1>Your Mistakes</h1>
            <p>Review questions you answered incorrectly and strengthen weak concepts.</p>
            <div className="cards">
              {JSON.parse(localStorage.getItem("syllabusaurus:mistakes") || "[]").map((m, i) => (
                <div className="info-card" key={i}>
                  <h3>{m.concept}</h3>
                  <p>{m.subject} · {m.chapter}</p>
                  <p><strong>Your answer:</strong> {m.yourAnswer}</p>
                  <p><strong>Correct answer:</strong> {m.correctAnswer}</p>
                  <p><strong>Needs Revision</strong></p>
                </div>
              ))}
            </div>
          </section>
        )}

        {page === "planner" && (
          <section className="section">

            <p className="badge">SMART STUDY PLANNER</p>

            <h1>Your Study Plan</h1>

            <p>
              Your planner will eventually use your weak concepts,
              revision status and available study time.
            </p>

            <div className="planner">

              <div>
                <strong>4:00 – 4:45</strong>
                <span>Physics — Units & Measurements</span>
              </div>

              <div>
                <strong>4:45 – 5:00</strong>
                <span>Break</span>
              </div>

              <div>
                <strong>5:00 – 5:45</strong>
                <span>Chemistry — Mole Concept</span>
              </div>

              <div>
                <strong>5:45 – 6:15</strong>
                <span>Practice Questions</span>
              </div>

              <div>
                <strong>6:15 – 6:30</strong>
                <span>Adaptive Revision</span>
              </div>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default App;
