import { useState } from "react";
import "./App.css";
import { syllabus } from "./data";

export default function App() {
  const [page, setPage] = useState("home");
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [concept, setConcept] = useState(null);

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

  const goHome = () => {
    setPage("home");
    setSubject(null);
    setChapter(null);
    setConcept(null);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <button onClick={goHome} className="logo">
          Syllabusaurus
        </button>

        <div className="nav-links">
          <button onClick={goHome}>Home</button>
          <button onClick={() => setPage("subjects")}>Subjects</button>
          <button>About</button>
        </div>
      </nav>

      {page === "home" && (
        <section className="hero">
  <div className="hero-copy">
    <div className="hero-badge">THE SMART STUDY PLATFORM</div>

    <h1>Syllabus Decoded.<br /><span>Success Delivered.</span></h1>

    <p>
      Turn your syllabus into a clear learning path.
      Learn concepts, practise questions, track mistakes,
      and revise at the right time.
    </p>

    <div className="hero-actions">
      <button
        className="primary-btn"
        onClick={() => setPage("subjects")}
      >
        Explore Your Syllabus <span>→</span>
      </button>

      <button
        className="secondary-btn"
        onClick={() => setPage("subjects")}
      >
        Start Learning
      </button>
    </div>

    <div className="hero-trust">
      <div><strong>01</strong><span>Syllabus Decoder</span></div>
      <div><strong>02</strong><span>Practice Engine</span></div>
      <div><strong>03</strong><span>Mistake Tracker</span></div>
    </div>
  </div>

  <div className="hero-visual">
    <div className="dashboard-window">
      <div className="dashboard-top">
        <span className="window-dot"></span>
        <span className="window-dot"></span>
        <span className="window-dot"></span>
        <span className="dashboard-title">Syllabusaurus</span>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-label">YOUR LEARNING PATH</div>
        <h2>Physics</h2>

        <div className="progress-row">
          <span>Concept Progress</span>
          <strong>72%</strong>
        </div>

        <div className="progress-bar">
          <div></div>
        </div>

        <div className="dashboard-cards">
          <div>
            <small>CHAPTER</small>
            <strong>Units & Measurements</strong>
            <span>12 concepts</span>
          </div>

          <div>
            <small>NEXT UP</small>
            <strong>Motion in a Straight Line</strong>
            <span>Continue learning →</span>
          </div>
        </div>

        <div className="dashboard-bottom">
          <span>Revision status</span>
          <b>Ready to revise</b>
        </div>
      </div>
    </div>
  </div>
</section>
      )}

      {page === "subjects" && (
        <section className="content">
          <h1>Choose a Subject</h1>

          <div className="cards">
            {Object.keys(syllabus).map((name) => (
              <button
                className="card"
                key={name}
                onClick={() => openSubject(name)}
              >
                <h2>{name}</h2>
                <p>Explore chapters</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {page === "chapters" && subject && (
        <section className="content">
          <button onClick={() => setPage("subjects")}>← Subjects</button>

          <h1>{subject}</h1>
          <p>Select a chapter</p>

          <div className="cards">
            {Object.keys(syllabus[subject]).map((name) => (
              <button
                className="card"
                key={name}
                onClick={() => openChapter(name)}
              >
                <h2>{name}</h2>
              </button>
            ))}
          </div>
        </section>
      )}

      {page === "concepts" && subject && chapter && (
        <section className="content">
          <button onClick={() => setPage("chapters")}>← Chapters</button>

          <h1>{chapter}</h1>
          <p>Tap a concept to view its formula.</p>

          <div className="concept-list">
            {syllabus[subject][chapter].map((item, index) => (
              <div className="concept-card" key={index}>
                <button
                  className="concept-button"
                  onClick={() =>
                    setConcept(concept === index ? null : index)
                  }
                >
                  {item.name}
                  <span>{concept === index ? "−" : "+"}</span>
                </button>

                {concept === index && (
                  <div className="formula">
                    <strong>Formula:</strong>
                    <p>{item.formula}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
