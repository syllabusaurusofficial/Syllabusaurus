function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function LearningPoint({ item }) {
  return (
    <>
      <span className="learning-point-subject">{item.board} · {item.grade} · {item.subject}</span>
      <h3>{item.concept.name}</h3>
      <p>{[item.section, item.chapter].filter(Boolean).join(" · ")}</p>
    </>
  );
}

export default function HomeDashboard({
  dashboard,
  fullName,
  onNavigate,
  onContinue,
  onFocus,
  onReviewMistakes,
}) {
  const focus = dashboard.focus;
  const focusLabel = focus.type === "review"
    ? "Practise this concept"
    : focus.type === "practice"
      ? "Start a practice question"
      : "Open this concept";

  return (
    <main className="home-page">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">YOUR STUDY DESK</p>
          <h1>Welcome back{fullName ? `, ${fullName.split(/\s+/)[0]}` : ""}</h1>
          <p className="welcome-date">{formatDate(new Date())}</p>
        </div>
        <p className="brand-slogan">Syllabus Decoded, Success Delivered.</p>
      </section>

      <section className="home-columns" aria-label="Study dashboard">
        <div className="home-primary-column">
          <article className="continue-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">PICK UP WHERE YOU LEFT OFF</p>
                <h2>Continue learning</h2>
              </div>
              <span className="panel-index">01</span>
            </div>
            {dashboard.continueLearning ? (
              <>
                <LearningPoint item={dashboard.continueLearning} />
                <button
                  className="action-button action-button-light"
                  onClick={() => onContinue(dashboard.continueLearning)}
                >
                  Continue concept <span aria-hidden="true">→</span>
                </button>
              </>
            ) : (
              <>
                <h3>Your first concept is ready</h3>
                <p className="panel-copy">Choose a subject to start building your own learning trail.</p>
                <button className="action-button action-button-light" onClick={() => onNavigate("subjects")}>
                  Explore syllabus <span aria-hidden="true">→</span>
                </button>
              </>
            )}
          </article>

          <article className="focus-panel">
            <div className="focus-marker" aria-hidden="true">◎</div>
            <div className="focus-content">
              <p className="eyebrow">TODAY'S FOCUS</p>
              <h2>{focus.type === "review" ? "Give this one another look" : focus.type === "continue" ? "Keep your momentum" : focus.type === "practice" ? "Put your progress to work" : "Start with one concept"}</h2>
              {focus.item ? (
                <>
                  <p className="focus-location">{focus.item.board} <span>·</span> {focus.item.grade} <span>·</span> {focus.item.subject}{focus.item.section ? ` · ${focus.item.section}` : ""} <span>·</span> {focus.item.chapter}</p>
                  <p className="focus-concept">{focus.item.concept.name}</p>
                </>
              ) : null}
              <p className="focus-detail">{focus.detail}</p>
              <button className="action-button action-button-dark" onClick={() => onFocus(focus)}>
                {focusLabel} <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        </div>

        <aside className="progress-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">YOUR MOMENTUM</p>
              <h2>Progress overview</h2>
            </div>
          </div>
          <div className="completion-summary">
            <strong>{dashboard.completionPercent}%</strong>
            <span>concepts completed</span>
          </div>
          <div className="completion-track" role="progressbar" aria-label="Concepts completed" aria-valuemin="0" aria-valuemax="100" aria-valuenow={dashboard.completionPercent}>
            <span style={{ width: `${dashboard.completionPercent}%` }} />
          </div>
          <div className="metric-list">
            <div><span>Concepts learned</span><strong>{dashboard.completedConcepts}<small> / {dashboard.totalConcepts}</small></strong></div>
            <div><span>Still to explore</span><strong>{dashboard.remainingConcepts}</strong></div>
            <div><span>Practice attempted</span><strong>{dashboard.totalAttempts}</strong></div>
            <div><span>Practice accuracy</span><strong>{dashboard.accuracy === null ? "—" : `${dashboard.accuracy}%`}</strong></div>
            <div><span>Mistakes to review</span><strong>{dashboard.mistakeCount}</strong></div>
          </div>
        </aside>
      </section>

      <section className="quick-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">YOUR NEXT DESTINATION</p>
            <h2>Quick actions</h2>
          </div>
        </div>
        <div className="quick-actions">
          <button onClick={() => onNavigate("subjects")}><span className="quick-number">01</span><strong>Syllabus</strong><span className="quick-arrow" aria-hidden="true">↗</span></button>
          <button onClick={() => onNavigate("planner")}><span className="quick-number">02</span><strong>Planner</strong><span className="quick-arrow" aria-hidden="true">↗</span></button>
          <button onClick={() => onNavigate("practice")}><span className="quick-number">03</span><strong>Practice</strong><span className="quick-arrow" aria-hidden="true">↗</span></button>
          <button onClick={() => onNavigate("mistakes")}><span className="quick-number">04</span><strong>Mistakes</strong><span className="quick-arrow" aria-hidden="true">↗</span></button>
        </div>
      </section>

      <section className="revision-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">BASED ON YOUR ACTIVITY</p>
            <h2>Revision and strengths</h2>
          </div>
          {dashboard.mistakeCount > 0 && (
            <button className="text-action" onClick={onReviewMistakes}>Open mistake tracker <span aria-hidden="true">→</span></button>
          )}
        </div>
        {dashboard.revisionItems.length > 0 ? (
          <div className="revision-list">
            {dashboard.revisionItems.map((item) => (
              <button className="revision-item" key={`${item.key}-${item.status}`} onClick={() => onContinue(item)}>
                <span className={`status-dot status-${item.status.toLowerCase().replaceAll(" ", "-")}`} aria-hidden="true" />
                <span className="revision-name"><strong>{item.concept.name}</strong><small>{item.board} · {item.grade} · {item.subject}{item.section ? ` · ${item.section}` : ""} · {item.chapter}</small></span>
                <span className={`revision-status status-text-${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</span>
                <span className="revision-chevron" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        ) : dashboard.mistakeCount > 0 ? (
          <div className="revision-empty">
            <p>{dashboard.mistakeCount} saved mistake{dashboard.mistakeCount === 1 ? "" : "s"} need a look.</p>
            <button className="text-action" onClick={onReviewMistakes}>Review mistakes <span aria-hidden="true">→</span></button>
          </div>
        ) : (
          <div className="revision-empty">
            <p>Revision priorities will appear here as you practise and record results.</p>
            <button className="text-action" onClick={() => onNavigate("practice")}>Go to practice <span aria-hidden="true">→</span></button>
          </div>
        )}
      </section>
    </main>
  );
}