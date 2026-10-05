import { useMemo, useState } from "react";
import "./StudentProfileSetup.css";

const STEP_TITLES = [
  "Welcome",
  "Basic information",
  "Academic goal",
  "Your subjects",
  "Learning preferences",
  "Profile summary",
];
const EXAM_OPTIONS = ["School / Board Exams", "JEE", "NEET", "CUET", "Other"];
const MEDIUM_OPTIONS = ["English", "Hindi", "Other"];
const LEARNING_STYLES = [
  "Visual explanations",
  "Step-by-step explanations",
  "Practice-first",
  "Concept-first",
  "Quick revision",
];
const CHALLENGE_OPTIONS = [
  "Understanding concepts",
  "Remembering formulas",
  "Problem solving",
  "Time management",
  "Revision",
  "Exam confidence",
];

function gradeLabel(value) {
  return value.replace(/^Grade\s+/i, "Class ");
}

function getCurriculumBoard(profile, syllabus) {
  if (profile.board === "CBSE" || profile.board === "ICSE" || profile.board === "Other") {
    return syllabus.boards.find((board) => board.name === profile.board) || null;
  }
  if (profile.board === "State Board") {
    return syllabus.boards.find((board) =>
      board.name.toLowerCase().includes(profile.state?.toLowerCase() || "") &&
      board.name.toLowerCase().includes("state board")
    ) || null;
  }
  return syllabus.boards.find((board) => board.name === profile.board) || null;
}

function SelectionCards({ label, options, value, onChange, columns = 2 }) {
  return (
    <fieldset className="profile-choice-field">
      <legend>{label}</legend>
      <div className={`profile-choice-grid profile-choice-columns-${columns}`}>
        {options.map((option) => (
          <button
            key={option}
            className={`profile-choice${value === option ? " is-selected" : ""}`}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            <span className="profile-choice-indicator" aria-hidden="true" />
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ToggleCards({ label, options, values, onChange }) {
  return (
    <fieldset className="profile-choice-field">
      <legend>{label}</legend>
      <div className="profile-choice-grid profile-choice-columns-2">
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              key={option}
              className={`profile-choice${selected ? " is-selected" : ""}`}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected
                ? values.filter((value) => value !== option)
                : [...values, option])}
            >
              <span className="profile-choice-indicator" aria-hidden="true" />
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function StudentProfileSetup({
  initialProfile,
  syllabus,
  userName = "",
  isEditing = false,
  onSave,
  onCancel,
}) {
  const [step, setStep] = useState(isEditing ? 1 : 0);
  const [profile, setProfile] = useState(() => ({
    full_name: initialProfile?.full_name || userName,
    grade: initialProfile?.grade || "",
    board: initialProfile?.board || "",
    state: initialProfile?.state || "",
    medium: initialProfile?.medium || "",
    target_exam: initialProfile?.target_exam || "",
    study_goal: initialProfile?.study_goal || "",
    subjects: initialProfile?.subjects || [],
    learning_style: initialProfile?.learning_style || "",
    academic_challenges: initialProfile?.academic_challenges || [],
  }));
  const [customGrade, setCustomGrade] = useState("");
  const [customState, setCustomState] = useState("");
  const [customExam, setCustomExam] = useState("");
  const [customSubjects, setCustomSubjects] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const syllabusBoard = getCurriculumBoard(profile, syllabus);
  const availableGrades = useMemo(() => {
    const grades = syllabusBoard?.grades.map((grade) => grade.name) || [];
    return grades.includes(profile.grade) ? grades : [...grades, ...(profile.grade ? [profile.grade] : [])];
  }, [syllabusBoard, profile.grade]);
  const availableSubjects = syllabusBoard?.grades
    .find((grade) => grade.name === profile.grade)?.subjects.map((subject) => subject.name) || [];
  const stateOptions = [...new Set(syllabus.boards
    .filter((board) => board.name !== "CBSE" && board.name.toLowerCase().includes("state board"))
    .map((board) => board.name.replace(/\s*State Board$/i, "")))];

  const updateProfile = (field, value) => {
    setProfile((previous) => ({ ...previous, [field]: value }));
    setError("");
  };

  const isStepValid = [
    true,
    Boolean(profile.full_name.trim() && profile.grade && profile.board && profile.board !== "Other" && profile.medium &&
      (profile.board !== "State Board" || (profile.state.trim() && profile.state !== "__custom"))),
    Boolean(profile.target_exam && profile.study_goal.trim()),
    profile.subjects.length > 0,
    Boolean(profile.learning_style),
    true,
  ][step];

  const continueStep = async () => {
    if (!isStepValid || saving) return;
    if (step < STEP_TITLES.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(profile);
    } catch {
      setError("Your profile could not be saved. Please try again in a moment.");
    } finally {
      setSaving(false);
    }
  };

  const selectGrade = (value) => {
    if (value === "__custom") {
      updateProfile("grade", "");
      return;
    }
    setCustomGrade("");
    updateProfile("grade", value);
  };

  const addCustomSubjects = () => {
    const additions = customSubjects.split(",").map((subject) => subject.trim()).filter(Boolean);
    if (!additions.length) return;
    updateProfile("subjects", [...new Set([...profile.subjects, ...additions])]);
    setCustomSubjects("");
  };

  const selectedExam = EXAM_OPTIONS.includes(profile.target_exam) ? profile.target_exam : "Other";
  const selectedMedium = MEDIUM_OPTIONS.includes(profile.medium) ? profile.medium : "Other";
  const standardBoards = ["CBSE", "ICSE", "State Board", "Other"];
  const selectedBoard = profile.board
    ? standardBoards.includes(profile.board) ? profile.board : "Other"
    : "";

  return (
    <main className="profile-setup-page">
      <section className="profile-setup-shell" aria-labelledby="profile-step-title">
        <header className="profile-setup-header">
          <div className="profile-setup-brand">
            <span className="auth-brand-mark" aria-hidden="true">S</span>
            <span>Syllabusaurus</span>
          </div>
          <div className="profile-progress-copy">
            <span>PROFILE SETUP</span>
            <strong>{step + 1} / {STEP_TITLES.length}</strong>
          </div>
          <div
            className="profile-progress-track"
            role="progressbar"
            aria-label="Profile setup progress"
            aria-valuemin="1"
            aria-valuemax={STEP_TITLES.length}
            aria-valuenow={step + 1}
          >
            <span style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }} />
          </div>
        </header>

        <div className="profile-setup-content" key={step}>
          {step === 0 && (
            <section className="profile-welcome-step">
              <div className="profile-welcome-glow" aria-hidden="true"><span>S</span></div>
              <p className="eyebrow">A STUDY SPACE THAT FITS YOU</p>
              <h1 id="profile-step-title">Welcome to Syllabusaurus</h1>
              <p className="profile-step-subtitle">Let&apos;s personalise your learning experience.</p>
              <p className="profile-welcome-detail">A few quick details will help shape your syllabus, study plan, and learning support around you.</p>
            </section>
          )}

          {step === 1 && (
            <section>
              <p className="eyebrow">ABOUT YOU</p>
              <h1 id="profile-step-title">Basic information</h1>
              <p className="profile-step-subtitle">We&apos;ll use this to show the right curriculum and subjects.</p>
              <div className="profile-form-grid">
                <label className="profile-input-field profile-field-wide">
                  Full name
                  <input autoComplete="name" value={profile.full_name} onChange={(event) => updateProfile("full_name", event.target.value)} placeholder="Your name" />
                </label>
                <label className="profile-input-field">
                  Class / grade
                  <select value={profile.grade ? availableGrades.includes(profile.grade) ? profile.grade : "__custom" : ""} onChange={(event) => selectGrade(event.target.value)}>
                    <option value="">Select class / grade</option>
                    {availableGrades.map((grade) => <option key={grade} value={grade}>{gradeLabel(grade)}</option>)}
                    <option value="__custom">Other / future grade</option>
                  </select>
                  {(!profile.grade || !availableGrades.includes(profile.grade)) && (
                    <input className="profile-secondary-input" value={customGrade || profile.grade} onChange={(event) => {
                      setCustomGrade(event.target.value);
                      updateProfile("grade", event.target.value.trim());
                    }} placeholder="Enter class / grade" aria-label="Enter class or grade" />
                  )}
                </label>
                <label className="profile-input-field">
                  Board / curriculum
                  <select value={selectedBoard} onChange={(event) => {
                    updateProfile("board", event.target.value);
                    updateProfile("state", "");
                    updateProfile("subjects", []);
                  }}>
                    <option value="">Select board / curriculum</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Boards</option>
                    <option value="Other">Other</option>
                  </select>
                  {selectedBoard === "Other" && (
                    <input className="profile-secondary-input" value={profile.board === "Other" ? "" : profile.board} onChange={(event) => {
                      updateProfile("board", event.target.value.trim() || "Other");
                      updateProfile("grade", "");
                      updateProfile("subjects", []);
                    }} placeholder="Enter your board / curriculum" aria-label="Enter your board or curriculum" />
                  )}
                </label>
                {profile.board === "State Board" && (
                  <label className="profile-input-field">
                State
                <select value={stateOptions.includes(profile.state) ? profile.state : profile.state ? "__custom" : ""} onChange={(event) => {
                  setCustomState("");
                  updateProfile("state", event.target.value);
                  updateProfile("subjects", []);
                }}>
                  <option value="">Select a state</option>
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                  <option value="__custom">Other state</option>
                </select>
                {!stateOptions.includes(profile.state) && profile.state && (
                  <input className="profile-secondary-input" value={customState || (profile.state === "__custom" ? "" : profile.state)} onChange={(event) => {
                    setCustomState(event.target.value);
                    updateProfile("state", event.target.value.trim());
                  }} placeholder="Enter your state" aria-label="Enter your state" />
                )}
                  </label>
                )}
                <label className="profile-input-field">
                  Medium of study
                  <select value={selectedMedium} onChange={(event) => updateProfile("medium", event.target.value === "Other" ? "" : event.target.value)}>
                    <option value="">Select medium</option>
                    {MEDIUM_OPTIONS.map((medium) => <option key={medium} value={medium}>{medium}</option>)}
                  </select>
                  {selectedMedium === "Other" && (
                    <input className="profile-secondary-input" value={profile.medium} onChange={(event) => updateProfile("medium", event.target.value)} placeholder="Enter your medium" aria-label="Enter your medium" />
                  )}
                </label>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <p className="eyebrow">YOUR DIRECTION</p>
              <h1 id="profile-step-title">What are you working towards?</h1>
              <p className="profile-step-subtitle">Your goals help us make recommendations that feel relevant.</p>
              <div className="profile-step-fields">
                <SelectionCards label="Target exam" options={EXAM_OPTIONS} value={selectedExam} onChange={(value) => updateProfile("target_exam", value === "Other" ? "" : value)} />
                {selectedExam === "Other" && (
                  <label className="profile-input-field">
                    Your target exam
                    <input value={customExam || (EXAM_OPTIONS.includes(profile.target_exam) ? "" : profile.target_exam)} onChange={(event) => {
                      setCustomExam(event.target.value);
                      updateProfile("target_exam", event.target.value);
                    }} placeholder="Enter your target exam" />
                  </label>
                )}
                <label className="profile-input-field">
                  Main study goal
                  <textarea value={profile.study_goal} onChange={(event) => updateProfile("study_goal", event.target.value)} placeholder="For example: build strong fundamentals and feel prepared for exams" rows={3} />
                </label>
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <p className="eyebrow">YOUR CURRICULUM</p>
              <h1 id="profile-step-title">Choose your subjects</h1>
              <p className="profile-step-subtitle">
                {availableSubjects.length
                  ? `Subjects are based on ${profile.state ? `${profile.state} State Board` : profile.board} ${gradeLabel(profile.grade)} where available.`
                  : "Add the subjects you are studying. You can update these whenever you need."}
              </p>
              {availableSubjects.length > 0 && (
                <ToggleCards
                  label="Available subjects"
                  options={availableSubjects}
                  values={profile.subjects}
                  onChange={(subjects) => updateProfile("subjects", subjects)}
                />
              )}
              <div className="profile-custom-subjects">
                <label className="profile-input-field">
                  {availableSubjects.length ? "Add another subject (optional)" : "Your subjects"}
                  <input value={customSubjects} onChange={(event) => setCustomSubjects(event.target.value)} onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomSubjects();
                    }
                  }} placeholder="Add one or more, separated by commas" />
                </label>
                <button className="profile-add-subject" type="button" onClick={addCustomSubjects}>Add subjects</button>
              </div>
              {profile.subjects.filter((subject) => !availableSubjects.includes(subject)).length > 0 && (
                <div className="profile-subject-tags" aria-label="Additional selected subjects">
                  {profile.subjects.filter((subject) => !availableSubjects.includes(subject)).map((subject) => (
                    <button key={subject} type="button" onClick={() => updateProfile("subjects", profile.subjects.filter((item) => item !== subject))} aria-label={`Remove ${subject}`}>{subject} <span aria-hidden="true">×</span></button>
                  ))}
                </div>
              )}
            </section>
          )}

          {step === 4 && (
            <section>
              <p className="eyebrow">HOW YOU LEARN</p>
              <h1 id="profile-step-title">Make learning work for you</h1>
              <p className="profile-step-subtitle">Choose a style that suits you and any areas where extra support would help.</p>
              <div className="profile-step-fields">
                <SelectionCards label="Preferred learning style" options={LEARNING_STYLES} value={profile.learning_style} onChange={(value) => updateProfile("learning_style", value)} />
                <ToggleCards
                  label="Academic challenges (optional)"
                  options={CHALLENGE_OPTIONS}
                  values={profile.academic_challenges}
                  onChange={(academic_challenges) => updateProfile("academic_challenges", academic_challenges)}
                />
              </div>
            </section>
          )}

          {step === 5 && (
            <section>
              <p className="eyebrow">READY WHEN YOU ARE</p>
              <h1 id="profile-step-title">Your Syllabusaurus Profile</h1>
              <p className="profile-step-subtitle">Your learning space is ready to make your own.</p>
              <article className="profile-summary-card">
                <div className="profile-summary-top">
                  <span className="profile-summary-avatar" aria-hidden="true">{profile.full_name.trim().charAt(0).toUpperCase() || "S"}</span>
                  <div><span>YOUR LEARNING PROFILE</span><h2>{profile.full_name}</h2></div>
                </div>
                <dl className="profile-summary-grid">
                  <div><dt>Class</dt><dd>{gradeLabel(profile.grade)}</dd></div>
                  <div><dt>Board</dt><dd>{profile.board === "State Board" ? `${profile.state} State Board` : profile.board}</dd></div>
                  <div><dt>Medium</dt><dd>{profile.medium}</dd></div>
                  <div><dt>Target exam</dt><dd>{profile.target_exam}</dd></div>
                  <div className="profile-summary-wide"><dt>Subjects</dt><dd>{profile.subjects.join(", ")}</dd></div>
                  <div className="profile-summary-wide"><dt>Learning preferences</dt><dd>{[profile.learning_style, ...profile.academic_challenges].join(" · ")}</dd></div>
                  <div className="profile-summary-wide"><dt>Goals</dt><dd>{profile.study_goal}</dd></div>
                </dl>
              </article>
            </section>
          )}
        </div>

        <footer className="profile-setup-footer">
          <div className="profile-setup-error" role="alert">{error}</div>
          <div className="profile-setup-actions">
            {isEditing && step === 1 && onCancel ? (
              <button className="profile-back-button" type="button" onClick={onCancel}>Cancel</button>
            ) : step > (isEditing ? 1 : 0) ? (
              <button className="profile-back-button" type="button" onClick={() => setStep((current) => current - 1)}>Back</button>
            ) : <span />}
            <button className="profile-continue-button" type="button" onClick={continueStep} disabled={!isStepValid || saving}>
              {saving ? "Saving profile…" : step === 5 ? (isEditing ? "Save profile" : "Enter Syllabusaurus") : "Continue"}
              {!saving && step < 5 && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
