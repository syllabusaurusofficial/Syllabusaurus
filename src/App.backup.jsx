import { supabase } from "./lib/supabase";
import React, { useState } from "react";

const data = {
  Physics: {
    "Units & Measurements": {
      concepts: ["Dimensions", "Errors", "Significant Figures"],
      formulas: ["v = s/t", "[v] = LT⁻¹", "[a] = LT⁻²"]
    },
    "Motion in a Straight Line": {
      concepts: ["Distance & Displacement", "Velocity", "Acceleration"],
      formulas: ["v = u + at", "s = ut + ½at²", "v² = u² + 2as"]
    }
  },
  Chemistry: {
    "Some Basic Concepts of Chemistry": {
      concepts: ["Mole Concept", "Molar Mass", "Stoichiometry"],
      formulas: ["n = m/M", "N = nNₐ"]
    },
    "Structure of Atom": {
      concepts: ["Atomic Models", "Bohr Model", "Quantum Numbers"],
      formulas: ["E = hν", "c = νλ"]
    }
  },
  Mathematics: {
    "Sets": {
      concepts: ["Types of Sets", "Subsets", "Operations"],
      formulas: ["n(A ∪ B) = n(A) + n(B) − n(A ∩ B)"]
    },
    "Quadratic Equations": {
      concepts: ["Roots", "Discriminant", "Nature of Roots"],
      formulas: ["x = (-b ± √(b²−4ac))/2a", "D = b² − 4ac"]
    }
  }
};

const questions = [
  {
    subject: "Physics",
    chapter: "Units & Measurements",
    question: "What is the dimensional formula of velocity?",
    options: ["MLT⁻¹", "LT⁻¹", "ML⁻¹T⁻¹", "LT⁻²"],
    answer: "LT⁻¹"
  },
  {
    subject: "Physics",
    chapter: "Motion in a Straight Line",
    question: "Which equation represents velocity after time t?",
    options: ["v = u + at", "s = ut", "F = ma", "P = mv"],
    answer: "v = u + at"
  },
  {
    subject: "Chemistry",
    chapter: "Some Basic Concepts of Chemistry",
    question: "The number of moles is calculated using:",
    options: ["n = m/M", "n = M/m", "n = mM", "n = m+M"],
    answer: "n = m/M"
  },
  {
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    question: "What is the discriminant of ax² + bx + c = 0?",
    options: ["b² − 4ac", "b² + 4ac", "4ac − b²", "a² − 4bc"],
    answer: "b² − 4ac"
  }
];

export default function App() {
  const [page, setPage] = useState("home");
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [section, setSection] = useState(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(
    JSON.parse(localStorage.getItem("syllabusaurus-mistakes") || "[]")
  );

  const openSubject = (name) => {
    setSubject(name);
    setChapter(null);
    setSection(null);
  };

  const openChapter = (name) => {
    setChapter(name);
    setSection(null);
  };

  const saveMistake = (q, answer) => {
    const updated = [
      ...mistakes,
      {
        ...q,
        userAnswer: answer,
        correctAnswer: q.answer,
        id: Date.now()
      }
    ];
    setMistakes(updated);
    localStorage.setItem(
      "syllabusaurus-mistakes",
      JSON.stringify(updated)
    );
  };

  const answerQuestion = (option) => {
    if (selected) return;

    setSelected(option);

    const q = questions[questionIndex];

    if (option === q.answer) {
      setScore((s) => s + 1);
    } else {
      saveMistake(q, option);
    }
  };

  const nextQuestion = () => {
    setSelected(null);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      setPage("result");
    }
  };

  const resetPractice = () => {
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setPage("practice");
  };

  const goHome = () => {
    setPage("home");
    setSubject(null);
    setChapter(null);
    setSection(null);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo} onClick={goHome}>
          Syllabusaurus
        </div>

        <nav style={styles.nav}>
          <button onClick={goHome}>Home</button>
          <button onClick={() => setPage("syllabus")}>Syllabus</button>
          <button onClick={() => setPage("planner")}>Planner</button>
          <button onClick={() => setPage("resources")}>Resources</button>
          <button onClick={() => setPage("practice")}>Practice</button>
          <button onClick={() => setPage("revision")}>Revision</button>
          <button onClick={() => setPage("mistakes")}>
            Mistakes {mistakes.length > 0 && `(${mistakes.length})`}
          </button>
        </nav>
      </header>

      <main style={styles.main}>

        {page === "home" && (
          <section style={styles.hero}>
            <h1>Syllabus Decoded.</h1>
            <h1 style={styles.gradient}>Success Delivered.</h1>

            <p style={styles.subtitle}>
              Turn your syllabus into concepts, formulas, practice and progress.
            </p>

            <div style={styles.cards}>
              <Feature
                title="Syllabus Decoder"
                text="Break every chapter into clear concepts."
                onClick={() => setPage("syllabus")}
              />
              <Feature
                title="Formula Bank"
                text="Access important formulas chapter-wise."
                onClick={() => setPage("syllabus")}
              />
              <Feature
                title="Practice Engine"
                text="Practice questions and track mistakes."
                onClick={() => setPage("practice")}
              />
              <Feature
                title="Mistake Tracker"
                text="Review questions you answered incorrectly."
                onClick={() => setPage("mistakes")}
              />
            </div>
          </section>
        )}

        {page === "syllabus" && (
          <section>
            <h1>Syllabus Decoder</h1>

            {!subject && (
              <>
                <p>Select a subject.</p>
                <div style={styles.grid}>
                  {Object.keys(data).map((name) => (
                    <button
                      key={name}
                      style={styles.bigCard}
                      onClick={() => openSubject(name)}
                    >
                      <strong>{name}</strong>
                      <span>
                        {Object.keys(data[name]).length} chapters
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {subject && !chapter && (
              <>
                <button style={styles.back} onClick={() => setSubject(null)}>
                  ← Subjects
                </button>

                <h2>{subject}</h2>

                <div style={styles.grid}>
                  {Object.keys(data[subject]).map((name) => (
                    <button
                      key={name}
                      style={styles.bigCard}
                      onClick={() => openChapter(name)}
                    >
                      <strong>{name}</strong>
                      <span>Open chapter →</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {subject && chapter && (
              <>
                <button
                  style={styles.back}
                  onClick={() => setChapter(null)}
                >
                  ← Chapters
                </button>

                <h2>{chapter}</h2>

                <div style={styles.tabs}>
                  <button onClick={() => setSection("concepts")}>
                    Concepts
                  </button>

                  <button onClick={() => setSection("formulas")}>
                    Formulas
                  </button>
                </div>

                {!section && (
                  <div style={styles.infoBox}>
                    Select Concepts or Formulas.
                  </div>
                )}

                {section === "concepts" && (
                  <div style={styles.list}>
                    {data[subject][chapter].concepts.map((item, index) => (
                      <div style={styles.listItem} key={item}>
                        <span>{index + 1}</span>
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {section === "formulas" && (
                  <div style={styles.formulas}>
                    {data[subject][chapter].formulas.map((formula) => (
                      <div style={styles.formula} key={formula}>
                        {formula}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {page === "practice" && (
          <section>
            <h1>Practice Engine</h1>

            <div style={styles.questionCard}>
              <div style={styles.questionMeta}>
                Question {questionIndex + 1} / {questions.length}
              </div>

              <h2>{questions[questionIndex].question}</h2>

              <div>
                {questions[questionIndex].options.map((option) => {
                  const q = questions[questionIndex];

                  let background = "#171b25";

                  if (selected) {
                    if (option === q.answer) background = "#14532d";
                    else if (option === selected) background = "#7f1d1d";
                  }

                  return (
                    <button
                      key={option}
                      disabled={!!selected}
                      onClick={() => answerQuestion(option)}
                      style={{
                        ...styles.option,
                        background
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {selected && (
                <div style={styles.feedback}>
                  {selected === questions[questionIndex].answer
                    ? "✓ Correct!"
                    : `✗ Correct answer: ${questions[questionIndex].answer}`}
                </div>
              )}

              {selected && (
                <button style={styles.primary} onClick={nextQuestion}>
                  {questionIndex === questions.length - 1
                    ? "Finish Practice"
                    : "Next Question →"}
                </button>
              )}
            </div>
          </section>
        )}

        {page === "result" && (
          <section style={styles.center}>
            <h1>Practice Complete</h1>
            <div style={styles.score}>{score}/{questions.length}</div>
            <p>
              You got {score} correct and made{" "}
              {questions.length - score} mistakes.
            </p>

            <button style={styles.primary} onClick={resetPractice}>
              Practice Again
            </button>

            <button
              style={styles.secondary}
              onClick={() => setPage("mistakes")}
            >
              Review Mistakes
            </button>
          </section>
        )}

        {page === "mistakes" && (
          <section>
            <h1>Mistake Tracker</h1>
            <p>Your Mistakes</p>

            {mistakes.length === 0 ? (
              <div style={styles.infoBox}>
                No mistakes yet. Complete some practice questions.
              </div>
            ) : (
              mistakes.map((mistake) => (
                <div style={styles.mistake} key={mistake.id}>
                  <div style={styles.tag}>
                    {mistake.subject} · {mistake.chapter}
                  </div>

                  <h3>{mistake.question}</h3>

                  <p>
                    Your answer:{" "}
                    <strong>{mistake.userAnswer}</strong>
                  </p>

                  <p>
                    Correct answer:{" "}
                    <strong>{mistake.correctAnswer}</strong>
                  </p>

                  <span style={styles.revision}>Needs Revision</span>
                </div>
              ))
            )}
          </section>
        )}

        {page === "revision" && (
          <section>
            <h1>Adaptive Revision</h1>
            <p>Focus your time where you need it most.</p>

            {mistakes.length === 0 ? (
              <div style={styles.infoBox}>
                Complete practice questions to generate your personalized revision plan.
              </div>
            ) : (
              <div>
                {Object.entries(
                  mistakes.reduce((groups, item) => {
                    const key = `${item.subject} · ${item.chapter}`;
                    groups[key] = (groups[key] || 0) + 1;
                    return groups;
                  }, {})
                )
                .sort((a, b) => b[1] - a[1])
                .map(([topic, count]) => {
                  const status =
                    count >= 3 ? "Revise Now" :
                    count >= 2 ? "Revise Soon" :
                    "Strong";

                  return (
                    <div style={styles.revisionCard} key={topic}>
                      <div>
                        <strong>{topic}</strong>
                        <p>{count} mistake{count > 1 ? "s" : ""} recorded</p>
                      </div>
                      <span
                        style={{
                          ...styles.revisionStatus,
                          background:
                            status === "Revise Now"
                              ? "#7f1d1d"
                              : status === "Revise Soon"
                              ? "#78350f"
                              : "#14532d"
                        }}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {page === "resources" && (
          <section>
            <h1>Learning Resources</h1>
            <p>Use these resources to strengthen your concepts.</p>

            <div style={styles.resourceGrid}>
              <a
                href="https://www.youtube.com/results?search_query=JEE+physics+units+measurements"
                target="_blank"
                rel="noreferrer"
                style={styles.resource}
              >
                <strong>▶ Video Lessons</strong>
                <span>Find concept explanations on YouTube</span>
              </a>

              <a
                href="https://ncert.nic.in/textbook.php"
                target="_blank"
                rel="noreferrer"
                style={styles.resource}
              >
                <strong>📖 NCERT Textbooks</strong>
                <span>Read the official NCERT chapters</span>
              </a>

              <div style={styles.resource}>
                <strong>🧠 Active Recall</strong>
                <span>Explain the concept without looking at your notes.</span>
              </div>

              <div style={styles.resource}>
                <strong>✍️ Practice</strong>
                <span>Practice questions immediately after learning.</span>
              </div>
            </div>
          </section>
        )}

        {page === "planner" && (
          <section>
            <h1>Study Planner</h1>

            <div style={styles.planner}>
              <h2>Today's Focus</h2>
              <div>📘 Learn one new concept</div>
              <div>🧠 Practice 10 questions</div>
              <div>🔁 Review mistakes</div>
              <div>📐 Revise formulas</div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

function Feature({ title, text, onClick }) {
  return (
    <button style={styles.feature} onClick={onClick}>
      <h3>{title}</h3>
      <p>{text}</p>
      <span>Explore →</span>
    </button>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    background: "#090b10",
    color: "#f5f7fb",
    fontFamily: "Inter, Arial, sans-serif"
  },

  header: {
    height: "70px",
    padding: "0 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #20242e",
    position: "sticky",
    top: 0,
    background: "#090b10",
    zIndex: 10
  },

  logo: {
    fontSize: "22px",
    fontWeight: 800,
    cursor: "pointer"
  },

  nav: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },

  navButton: {},

  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "55px 20px"
  },

  hero: {
    textAlign: "center",
    paddingTop: "40px"
  },

  heroTitle: {},

  gradient: {
    background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: "18px",
    maxWidth: "650px",
    margin: "20px auto 45px"
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px"
  },

  feature: {
    textAlign: "left",
    padding: "25px",
    borderRadius: "18px",
    border: "1px solid #252a35",
    background: "#11141b",
    color: "white",
    cursor: "pointer"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "16px",
    marginTop: "25px"
  },

  bigCard: {
    padding: "25px",
    textAlign: "left",
    borderRadius: "16px",
    border: "1px solid #292f3a",
    background: "#12161e",
    color: "white",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  back: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    marginBottom: "20px"
  },

  tabs: {
    display: "flex",
    gap: "10px",
    margin: "25px 0"
  },

  infoBox: {
    padding: "25px",
    background: "#11141b",
    border: "1px solid #272c36",
    borderRadius: "14px",
    color: "#9ca3af"
  },

  list: {
    display: "grid",
    gap: "10px"
  },

  listItem: {
    padding: "18px",
    background: "#11141b",
    border: "1px solid #272c36",
    borderRadius: "12px"
  },

  formulas: {
    display: "grid",
    gap: "14px"
  },

  formula: {
    padding: "22px",
    background: "#11141b",
    border: "1px solid #303746",
    borderRadius: "14px",
    fontSize: "20px",
    fontFamily: "serif"
  },

  questionCard: {
    maxWidth: "750px",
    margin: "30px auto",
    padding: "30px",
    borderRadius: "20px",
    background: "#11141b",
    border: "1px solid #272c36"
  },

  questionMeta: {
    color: "#8b93a3",
    marginBottom: "15px"
  },

  option: {
    width: "100%",
    padding: "17px",
    margin: "7px 0",
    borderRadius: "12px",
    border: "1px solid #303746",
    color: "white",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "16px"
  },

  primary: {
    marginTop: "20px",
    padding: "14px 22px",
    borderRadius: "10px",
    border: "none",
    background: "#7c3aed",
    color: "white",
    cursor: "pointer",
    fontWeight: 700
  },

  secondary: {
    marginTop: "20px",
    marginLeft: "10px",
    padding: "14px 22px",
    borderRadius: "10px",
    border: "1px solid #343b49",
    background: "transparent",
    color: "white",
    cursor: "pointer"
  },

  feedback: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "10px",
    background: "#171b25"
  },

  mistake: {
    marginTop: "18px",
    padding: "22px",
    borderRadius: "16px",
    background: "#11141b",
    border: "1px solid #292f3a"
  },

  tag: {
    color: "#9ca3af",
    fontSize: "14px"
  },

  revision: {
    display: "inline-block",
    marginTop: "10px",
    padding: "6px 10px",
    borderRadius: "8px",
    background: "#3f2a10",
    color: "#fbbf24",
    fontSize: "13px"
  },

  center: {
    textAlign: "center",
    paddingTop: "60px"
  },

  score: {
    fontSize: "70px",
    fontWeight: 800,
    margin: "30px"
  },

  revisionCard: {
    marginTop: "15px",
    padding: "20px",
    borderRadius: "16px",
    background: "#11141b",
    border: "1px solid #292f3a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px"
  },

  revisionStatus: {
    padding: "8px 12px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap"
  },

  resourceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "16px",
    marginTop: "25px"
  },

  resource: {
    padding: "22px",
    borderRadius: "16px",
    background: "#11141b",
    border: "1px solid #292f3a",
    color: "white",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  planner: {
    marginTop: "25px",
    padding: "25px",
    borderRadius: "18px",
    background: "#11141b",
    border: "1px solid #292f3a",
    display: "grid",
    gap: "18px"
  }
};

console.log("Supabase connected:", !!supabase);
console.log("Testing student_progress table...");
