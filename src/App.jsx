import { useState } from "react";
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
          <h1>Syllabusaurus</h1>
          <p>Syllabus Decoded, Success Delivered.</p>

          <button
            className="primary-btn"
            onClick={() => setPage("subjects")}
          >
            Explore Syllabus
          </button>
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
