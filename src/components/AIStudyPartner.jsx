import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Auth from "../Auth";
import CopyButton from "./CopyButton";
import { supabase } from "../lib/supabase";
import { askStudyPartner, getRecentConversationHistory } from "../lib/aiStudyPartner";
import {
  MISTAKE_CATEGORIES,
  NOTE_ACTIONS,
  TUTOR_PERSONALITIES,
  TEACHING_STYLES,
  buildAIRequestContext,
  getAdaptiveDifficulty,
  imageFileToPayload,
  recordConceptReview,
} from "../lib/aiLearningEngine";
import { getLearningVisual } from "../lib/learningVisuals";
import { AI_LANGUAGES, getLanguage, hasNativeSpeechVoice } from "../lib/aiLanguages";
import {
  AI_LECTURE_MODES,
  PROBLEM_DIFFICULTIES,
  createLecturePrompt,
  getRecommendedLectureModes,
} from "../lib/aiLectures";

const MAX_QUESTION_LENGTH = 4000;
const MathText = lazy(() => import("./MathText"));
let turnSequence = 0;
const getCurrentTime = () => new Date().getTime();

function createTurnId() {
  turnSequence += 1;
  return `study-turn-${turnSequence}`;
}

function AnswerText({ text }) {
  return (
    <Suspense fallback={<span className="study-math-loading">Formatting answer…</span>}>
      <MathText text={text} />
    </Suspense>
  );
}

function VoiceIcon({ speaking = false }) {
  return speaking ? (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="6" y="4" width="3" height="12" rx="1" />
      <rect x="11" y="4" width="3" height="12" rx="1" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M3 8v4h3l4 3V5L6 8H3Z" />
      <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5a7 7 0 0 1 0 10" />
    </svg>
  );
}

function MicrophoneIcon({ listening = false }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="8" y="3" width="4" height="9" rx="2" />
      <path d="M5.5 9.5a4.5 4.5 0 0 0 9 0M10 14v3M7.5 17h5" />
      {listening && <path d="m3 3 14 14" />}
    </svg>
  );
}

function toSpeakableText(text) {
  return text
    .replace(/\$\$?([^$]+)\$\$?/g, "$1")
    .replace(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g, "$1$2")
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, "square root of $1")
    .replace(/\\sqrt\s*\(([^()]*)\)/g, "square root of $1")
    .replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$1 divided by $2")
    .replace(/\\Delta/g, "delta ")
    .replace(/\\pi/g, "pi")
    .replace(/\\times|\\cdot/g, " times ")
    .replace(/\\(?:mathrm|text)\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/\^([+-]?\w+)/g, " to the power of $1")
    .replace(/_([A-Za-z0-9]+)/g, " sub $1")
    .replace(/\s+/g, " ")
    .trim();
}

function describeLearningTarget(target) {
  return [
    target.board,
    target.grade,
    target.subject,
    target.section,
    target.chapter,
    target.concept,
  ].filter(Boolean).join(" · ");
}

function StudyAnswer({ answer, turnId, speakingTurnId, onSpeak, onFeedback }) {
  const isSpeaking = speakingTurnId === turnId;

  return (
    <article className="study-answer" aria-label="Study partner response">
      <div className="study-answer-voice">
        <button
          className={`study-voice-button${isSpeaking ? " is-speaking" : ""}`}
          type="button"
          onClick={() => onSpeak(turnId, answer)}
          aria-label={isSpeaking ? "Stop reading this response aloud" : "Read this response aloud"}
          title={isSpeaking ? "Stop reading aloud" : "Read response aloud"}
          aria-pressed={isSpeaking}
        >
          <VoiceIcon speaking={isSpeaking} />
          <span>{isSpeaking ? "Stop" : "Listen"}</span>
        </button>
      </div>
      <div className="study-answer-content"><AnswerText text={answer.response} /></div>
      <div className="study-answer-actions">
        <CopyButton text={answer.response} />
        <div className="study-feedback" aria-label="Rate this response">
          <button type="button" onClick={() => onFeedback(turnId, "up")} aria-label="This was helpful" aria-pressed={answer.feedback === "up"}>👍</button>
          <button type="button" onClick={() => onFeedback(turnId, "down")} aria-label="This was not helpful" aria-pressed={answer.feedback === "down"}>👎</button>
        </div>
      </div>
    </article>
  );
}

const weaknessSteps = [
  "Explain the concept simply and identify the prerequisite idea I should know.",
  "Give me one easy question without its answer.",
  "Give me one medium question without its answer.",
  "Give me an application question without its answer.",
  "Give me a difficult JEE-level question without its answer.",
  "Give me a final mastery check and explain any remaining gap.",
];

const STUDY_MODES = [
  { id: "explain", label: "Explain this", prompt: "Explain this concept clearly. Start with the basic idea, then add the exam-level understanding." },
  { id: "teach", label: "Teach me", prompt: "Teach me this concept step by step, checking the intuition before adding exam-level detail." },
  { id: "examples", label: "Give an example", prompt: "Give a grade-appropriate example based on the selected syllabus focus and explain the reasoning step by step. Do not claim it is from a past paper or textbook." },
  { id: "questions", label: "Test me", prompt: "Ask me one question about this concept and wait for my attempt. Do not show the answer yet." },
  { id: "summarise", label: "Summarise", prompt: "Summarise the key ideas and formulas for this concept using only reliable, relevant information. Define symbols and conditions when needed." },
  { id: "revise", label: "Help me revise", prompt: "Help me revise this concept with a concise recall plan, a common-error check grounded in my saved mistakes if available, and one question to try." },
];

export default function AIStudyPartner({
  learningContext,
  studentProfile,
  currentSelection,
  preferredConceptKey,
  academicContentByConceptId,
  onRecordMistake,
  onRecordAssessment,
  onPracticeConcept,
}) {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState([]);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [voiceNotice, setVoiceNotice] = useState("");
  const [listening, setListening] = useState(false);
  const [speakingTurnId, setSpeakingTurnId] = useState(null);
  const [teachingStyle, setTeachingStyle] = useState("NCERT");
  const [personality, setPersonality] = useState("Professor");
  const [responseLanguage, setResponseLanguage] = useState("en");
  const [voiceLanguage, setVoiceLanguage] = useState("en");
  const [lectureMode, setLectureMode] = useState("one-shot");
  const [problemDifficulty, setProblemDifficulty] = useState("Medium");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [recognitionDenied, setRecognitionDenied] = useState(false);
  const [unsupportedRecognitionLanguages, setUnsupportedRecognitionLanguages] = useState([]);
  const [interactionMode, setInteractionMode] = useState("chat");
  const [selectedConceptKey, setSelectedConceptKey] = useState(
    () => preferredConceptKey || learningContext?.weakConcepts?.[0]?.key || learningContext?.availableConcepts?.[0]?.key || "",
  );
  const [studyMode, setStudyMode] = useState("explain");
  const [noteText, setNoteText] = useState("");
  const [noteAction, setNoteAction] = useState("explain");
  const [image, setImage] = useState(null);
  const [imageName, setImageName] = useState("");
  const [weaknessStep, setWeaknessStep] = useState(-1);
  const [examSession, setExamSession] = useState(null);
  const [examSummary, setExamSummary] = useState(null);
  const [examQuestionCount, setExamQuestionCount] = useState(5);
  const [examDuration, setExamDuration] = useState(15);
  const [examDifficulty, setExamDifficulty] = useState("Adaptive");
  const [examScope, setExamScope] = useState("selected");
  const [examSecondsLeft, setExamSecondsLeft] = useState(0);
  const conversationEndRef = useRef(null);
  const lectureDetailsRef = useRef(null);
  const questionRef = useRef("");
  const imageInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognitionBaseRef = useRef("");
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;
    const updateVoices = () => setAvailableVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation, pendingQuestion]);

  useEffect(() => {
    if (!examSession) return undefined;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((examSession.endsAt - Date.now()) / 1000));
      setExamSecondsLeft(remaining);
      if (!remaining) {
        setExamSummary(examSession);
        setExamSession(null);
        setInteractionMode("chat");
      }
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [examSession]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    speechSynthesisRef.current = null;
    window.speechSynthesis?.cancel();
  }, []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceNotice("Voice input is not supported in this browser. You can still type your question.");
      return;
    }
    if (recognitionDenied) {
      setVoiceNotice("Microphone access was previously denied. Change the browser permission to retry, or type your question.");
      return;
    }
    if (unsupportedRecognitionLanguages.includes(voiceLanguage)) {
      setVoiceNotice(`Voice input for ${getLanguage(voiceLanguage).nativeLabel} is not supported by this browser. You can still type.`);
      return;
    }

    setVoiceNotice("");
    recognitionBaseRef.current = questionRef.current.trim();
    const recognition = new Recognition();
    recognition.lang = getLanguage(voiceLanguage).locale;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
        if (event.results[index].isFinal) transcript += " ";
      }
      const base = recognitionBaseRef.current;
      const separator = base && transcript ? " " : "";
      const transcribedQuestion = `${base}${separator}${transcript}`.trimStart();
      questionRef.current = transcribedQuestion;
      setQuestion(transcribedQuestion);
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setRecognitionDenied(true);
      }
      if (event.error === "language-not-supported") {
        setUnsupportedRecognitionLanguages((previous) => [...new Set([...previous, voiceLanguage])]);
      }
      setVoiceNotice(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Microphone access was denied. Change the browser permission to retry, or type your question."
          : event.error === "language-not-supported"
            ? `Voice input for ${getLanguage(voiceLanguage).nativeLabel} is not supported by this browser. You can still type.`
          : event.error === "no-speech"
            ? "No speech was detected. Tap the microphone to try again."
            : "Voice input stopped. Please try again or type your question.",
      );
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setVoiceNotice("Voice input could not start. Please try again or type your question.");
    }
  };

  const speakResponse = (turnId, answer) => {
    if (!("speechSynthesis" in window) || typeof window.SpeechSynthesisUtterance !== "function") {
      setVoiceNotice("Read aloud is not supported in this browser.");
      return;
    }

    if (speakingTurnId === turnId) {
      speechSynthesisRef.current = null;
      setSpeakingTurnId(null);
      window.speechSynthesis.cancel();
      return;
    }

    setVoiceNotice("");
    speechSynthesisRef.current = null;
    window.speechSynthesis.cancel();
    const selectedVoice = availableVoices.find((voice) =>
      voice.lang?.toLowerCase().startsWith(getLanguage(voiceLanguage).speechPrefix)
    );
    if (!selectedVoice) {
      setVoiceNotice(`Speech synthesis for ${getLanguage(voiceLanguage).nativeLabel} is unavailable on this device.`);
      return;
    }
    const utterance = new window.SpeechSynthesisUtterance(
      toSpeakableText(answer.spokenResponse || answer.response),
    );
    utterance.lang = getLanguage(voiceLanguage).locale;
    utterance.voice = selectedVoice;
    speechSynthesisRef.current = utterance;
    utterance.onend = () => {
      if (speechSynthesisRef.current !== utterance) return;
      speechSynthesisRef.current = null;
      setSpeakingTurnId(null);
    };
    utterance.onerror = () => {
      if (speechSynthesisRef.current !== utterance) return;
      speechSynthesisRef.current = null;
      setSpeakingTurnId(null);
      setVoiceNotice("Read aloud stopped. Please try again.");
    };
    setSpeakingTurnId(turnId);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionError("");
      setCheckingSession(false);
    });

    supabase.auth.getSession().then(({ data, error: authError }) => {
      if (!active) return;
      setSession(data.session);
      setSessionError(authError?.message || "");
      setCheckingSession(false);
    }).catch((authError) => {
      if (!active) return;
      setSessionError(authError instanceof Error ? authError.message : "Could not check your sign-in.");
      setCheckingSession(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const sendStudyQuestion = async (inputQuestion, options = {}) => {
    const trimmedQuestion = inputQuestion.trim() || (image ? "Please analyse this image and help me understand it." : "");
    if (!trimmedQuestion) {
      setError("Enter a question to get started.");
      return false;
    }
    if (trimmedQuestion.length > MAX_QUESTION_LENGTH) {
      setError(`Keep your question under ${MAX_QUESTION_LENGTH} characters.`);
      return false;
    }

    setLoading(true);
    setError("");
    setVoiceNotice("");
    setPendingQuestion(trimmedQuestion);
    try {
      const history = getRecentConversationHistory(conversation);
      const mode = options.mode || interactionMode;
      const concept = Object.hasOwn(options, "concept")
        ? options.concept
        : examSession?.scope === "mixed" ? null : selectConcept;
      const contextSelection = concept
        ? {
            board: concept.board,
            grade: concept.grade,
            subject: concept.subject,
            section: concept.section,
            chapter: concept.chapter,
            concept: concept.concept,
            conceptId: concept.key,
            conceptPath: concept.conceptPath,
            academicContent: academicContentByConceptId?.[concept.key] || [],
          }
        : mode === "exam" && examScope === "mixed"
        ? null
        : currentSelection;
      const result = await askStudyPartner(trimmedQuestion, history, {
        learningContext: {
        ...buildAIRequestContext(learningContext, concept, {
          currentSelection: contextSelection,
          studentProfile,
          mode,
        }),
        },
        teachingStyle,
        personality,
        mode,
        responseLanguage,
        voiceLanguage,
        lectureMode: options.lectureMode || "",
        image: options.image || image || undefined,
      });
      const turnId = createTurnId();
      setConversation((previous) => [
        ...previous,
        {
          id: turnId,
          question: trimmedQuestion,
          answer: result,
          imageName: options.image || image ? (options.imageName || imageName) : "",
        },
      ]);
      if (result.mistakeCategory !== "None") {
        onRecordMistake?.({
          question: trimmedQuestion,
          answer: trimmedQuestion,
          correction: result.response,
          category: MISTAKE_CATEGORIES.includes(result.mistakeCategory) ? result.mistakeCategory : "Careless error",
          conceptContext: concept || null,
        });
      }
      if (
        result.assessment !== "not-assessed" &&
        concept &&
        ["exam", "diagnostic", "weakness", "questions"].includes(mode)
      ) {
        onRecordAssessment?.({
          concept,
          question: trimmedQuestion,
          assessment: result.assessment,
        });
      }
      if (examSession && examSession.endsAt > getCurrentTime() && result.assessment !== "not-assessed") {
        const nextExam = {
          ...examSession,
          answered: examSession.answered + 1,
          correct: examSession.correct + (result.assessment === "correct" ? 1 : 0),
        };
        if (nextExam.answered >= nextExam.questionCount) {
          setExamSummary(nextExam);
          setExamSession(null);
          setInteractionMode("chat");
        } else {
          setExamSession(nextExam);
        }
      }
      questionRef.current = "";
      setQuestion("");
      setImage(null);
      setImageName("");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The study partner could not answer right now.");
      return false;
    } finally {
      setLoading(false);
      setPendingQuestion("");
    }
  };

  const submitQuestion = async (event) => {
    event.preventDefault();
    await sendStudyQuestion(question, { mode: studyMode });
  };

  const runStudyMode = async (mode) => {
    setStudyMode(mode.id);
    const focus = selectConcept
     ? describeLearningTarget(selectConcept)
      : "";
    const prompt = focus ? `${mode.prompt}\n\nSelected study focus: ${focus}.` : mode.prompt;
    await sendStudyQuestion(prompt, { mode: mode.id, concept: selectConcept || null });
  };

  const selectConcept = learningContext?.availableConcepts?.find((concept) => concept.key === selectedConceptKey);
  const selectedVisual = selectConcept ? getLearningVisual(selectConcept) : null;
  const recommendedLectureModes = getRecommendedLectureModes(selectConcept);
  const selectedDifficulty = selectConcept
    ? getAdaptiveDifficulty(selectConcept, learningContext.recentPractice || [])
    : "Easy";

  const startLecture = async (mode) => {
    if (!selectConcept) {
      setError("Choose a syllabus concept before starting an AI lecture.");
      return;
    }
    setLectureMode(mode);
    setInteractionMode("lecture");
    lectureDetailsRef.current?.removeAttribute("open");
    await sendStudyQuestion(
      createLecturePrompt(
        selectConcept,
        mode,
        problemDifficulty,
        teachingStyle === "Socratic" || personality === "Socratic Tutor",
      ),
      { mode: "lecture", lectureMode: mode, concept: selectConcept },
    );
  };

  const explainSelectedAgain = async () => {
    if (!selectConcept) {
      setError("Choose a syllabus concept before asking for another explanation.");
      return;
    }
    await sendStudyQuestion(
      `Explain ${selectConcept.concept} again in the selected language, using a simpler explanation and preserving exact formulas.`,
      { concept: selectConcept },
    );
  };

  const practiceSelectedConcept = () => {
    if (!selectConcept) {
      setError("Choose a syllabus concept before practising.");
      return;
    }
    const launchedAuthoredPractice = onPracticeConcept?.(selectConcept);
    if (!launchedAuthoredPractice) {
      sendStudyQuestion(
        `Ask me one practice question about ${describeLearningTarget(selectConcept)} and wait for my answer.`,
        { mode: "questions", concept: selectConcept },
      );
    }
  };

  const startWeaknessSequence = async () => {
    if (!selectConcept) {
      setError("Choose a concept before starting a targeted learning sequence.");
      return;
    }
    setWeaknessStep(0);
    setInteractionMode("weakness");
    await sendStudyQuestion(
      `Start a targeted weakness sequence for ${describeLearningTarget(selectConcept)}. Step 1 of 6: ${weaknessSteps[0]}`,
      { mode: "weakness", concept: selectConcept },
    );
  };

  const advanceWeaknessSequence = async () => {
    const nextStep = weaknessStep + 1;
    if (!selectConcept || nextStep >= weaknessSteps.length) {
      setWeaknessStep(-1);
      return;
    }
    const sent = await sendStudyQuestion(
      `Continue my targeted weakness sequence for ${selectConcept.concept}. Step ${nextStep + 1} of 6: ${weaknessSteps[nextStep]}`,
      { mode: "weakness", concept: selectConcept },
    );
    if (sent) setWeaknessStep(nextStep);
  };

  const startExam = async () => {
    setExamSummary(null);
    const durationSeconds = examDuration * 60;
    const focusDescription = examScope === "mixed"
      ? "mixed chapters from my saved weak concepts and practice history"
      : selectConcept
        ? describeLearningTarget(selectConcept)
        : "my current weak concepts and planner priority";
    const targetDifficulty = examDifficulty === "Adaptive" ? selectedDifficulty : examDifficulty;
    setExamSession({
      endsAt: getCurrentTime() + durationSeconds * 1000,
      answered: 0,
      correct: 0,
      questionCount: examQuestionCount,
      scope: examScope,
    });
    setExamSecondsLeft(durationSeconds);
    setInteractionMode("exam");
    const started = await sendStudyQuestion(
      `Start a ${examDuration}-minute, ${examQuestionCount}-question practice exam. Scope: ${focusDescription}. Target difficulty: ${targetDifficulty}. Ask one question at a time, wait for each answer, assess it, then give the next question. This is practice, not a prediction of exam results.`,
      { mode: "exam", concept: examScope === "mixed" ? null : selectConcept },
    );
    if (!started) {
      setExamSession(null);
      setInteractionMode("chat");
    }
  };

  const startDiagnostic = async () => {
    if (!selectConcept) {
      setError("Choose a concept before starting a diagnostic.");
      return;
    }
    setInteractionMode("diagnostic");
    await sendStudyQuestion(
      `Start a short diagnostic on ${describeLearningTarget(selectConcept)}. Ask one question at a time, use my answers to estimate strengths and gaps for this concept, and do not claim statistical certainty or predict exam results.`,
      { mode: "diagnostic", concept: selectConcept },
    );
  };

  const startTopicTest = async () => {
    if (!selectConcept) {
      setError("Choose a concept before starting a knowledge check.");
      return;
    }
    setInteractionMode("weakness");
    await sendStudyQuestion(
      `Test me on ${describeLearningTarget(selectConcept)}. Ask one question and wait for my answer.`,
      { mode: "weakness", concept: selectConcept },
    );
  };

  const runNotesAction = async () => {
    if (!noteText.trim()) {
      setError("Add some notes or textbook text first.");
      return;
    }
    const action = NOTE_ACTIONS.find(([key]) => key === noteAction)?.[1] || "Explain this";
    await sendStudyQuestion(`${action} using only the following study material:\n\n${noteText}`, { mode: "notes" });
  };

  const handleImageSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setImage(await imageFileToPayload(file));
      setImageName(file.name);
      setError("");
    } catch (imageError) {
      setImage(null);
      setImageName("");
      setError(imageError instanceof Error ? imageError.message : "The image could not be read.");
      event.target.value = "";
    }
  };

  const setTurnFeedback = (turnId, feedback) => {
    setConversation((previous) => previous.map((turn) =>
      turn.id === turnId
        ? { ...turn, answer: { ...turn.answer, feedback: turn.answer.feedback === feedback ? null : feedback } }
        : turn
    ));
  };

  const markSelectedConceptReviewed = () => {
    if (!selectConcept) {
      setError("Choose a concept before scheduling a review.");
      return;
    }
    try {
      recordConceptReview(selectConcept);
      setVoiceNotice(`Review recorded for ${selectConcept.concept}. A reminder is due in about one day.`);
    } catch {
      setError("This browser could not save the review reminder.");
    }
  };

  const endExam = () => {
    if (examSession) setExamSummary(examSession);
    setExamSession(null);
    setInteractionMode("chat");
  };

  const startNewChat = () => {
    if (loading) return;
    recognitionRef.current?.stop();
    speechSynthesisRef.current = null;
    window.speechSynthesis?.cancel();
    setListening(false);
    setSpeakingTurnId(null);
    setConversation([]);
    questionRef.current = "";
    setQuestion("");
    setError("");
    setVoiceNotice("");
    setImage(null);
    setImageName("");
    setWeaknessStep(-1);
    setExamSession(null);
    setExamSummary(null);
    setInteractionMode("chat");
    setNoteText("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  if (checkingSession) {
    return (
      <main className="content content-page">
        <section className="study-partner">
          <p className="eyebrow">SYLLABUSAURUS · AI STUDY PARTNER</p>
          <p className="study-status" role="status">Checking your sign-in…</p>
        </section>
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="content content-page">
        <section className="study-partner">
          <p className="eyebrow">SYLLABUSAURUS · AI STUDY PARTNER</p>
          <div className="study-error" role="alert">{sessionError}</div>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="content content-page">
        <section className="study-partner study-auth">
          <p className="eyebrow">SYLLABUSAURUS · AI STUDY PARTNER</p>
          <h1>Sign in to study with AI</h1>
          <p className="study-intro">Your existing Syllabusaurus account keeps the study partner available to you securely.</p>
          <Auth onAuthenticated={setSession} />
        </section>
      </main>
    );
  }

  return (
    <main className="content content-page">
      <section className="study-partner">
        <header className="study-heading">
          <div>
            <p className="eyebrow">SYLLABUSAURUS · AI STUDY PARTNER</p>
            <h1>Let’s make this click.</h1>
            <p className="study-intro">Ask a question, explore follow-ups, and build your understanding one step at a time.</p>
          </div>
          <div className="study-heading-actions">
            <span className="study-badge">GEMINI-POWERED</span>
            <button className="study-new-chat" type="button" onClick={startNewChat} disabled={loading}>New chat</button>
          </div>
        </header>

        <div className="study-language-bar">
          <div className="study-language-group" role="group" aria-label="AI response language">
            <span>Response language</span>
            {AI_LANGUAGES.map((language) => (
              <button
                type="button"
                key={language.code}
                aria-pressed={responseLanguage === language.code}
                onClick={() => setResponseLanguage(language.code)}
              >
                {language.label}
              </button>
            ))}
          </div>
          <label className="study-voice-language">
            Voice language
            <select value={voiceLanguage} onChange={(event) => {
              recognitionRef.current?.stop();
              setListening(false);
              speechSynthesisRef.current = null;
              window.speechSynthesis?.cancel();
              setSpeakingTurnId(null);
              setVoiceLanguage(event.target.value);
            }}>
              {AI_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.nativeLabel}{hasNativeSpeechVoice(availableVoices, language.code) ? "" : " · spoken output unavailable"}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="study-focus-panel" aria-label="Current study focus">
          <label className="study-focus-select">
            Study focus
            <select value={selectedConceptKey} onChange={(event) => setSelectedConceptKey(event.target.value)}>
              <option value="">Choose a syllabus concept</option>
              {(learningContext?.availableConcepts || []).map((concept) => (
                <option key={concept.key} value={concept.key}>
                  {concept.board} · {concept.grade} · {concept.subject}{concept.section ? ` · ${concept.section}` : ""} · {concept.chapter} · {concept.concept}
                </option>
              ))}
            </select>
          </label>
          <p className="study-focus-evidence">
            {selectConcept
              ? `${selectConcept.board} · ${selectConcept.grade} · ${selectConcept.subject}${selectConcept.section ? ` · ${selectConcept.section}` : ""} · ${selectConcept.chapter} · ${selectConcept.concept} — ${selectConcept.state} mastery evidence.`
              : currentSelection
                ? `Selected syllabus area: ${[currentSelection.subject, currentSelection.chapter].filter(Boolean).join(" · ")}. No concept is selected.`
                : "No syllabus concept selected. Choose one above or ask about any topic."}
            {selectConcept?.prerequisites?.length > 0 && ` Prerequisites: ${selectConcept.prerequisites.join(", ")}.`}
          </p>
          {learningContext?.progress && (
            <p className="study-focus-progress">
              Saved progress: {learningContext.progress.completedConcepts}/{learningContext.progress.totalConcepts} concepts learned
              {learningContext.progress.practiceAccuracy === null
                ? " · no practice accuracy yet"
                : ` · ${learningContext.progress.practiceAccuracy}% practice accuracy`}
              {learningContext.progress.recordedMistakes > 0
                ? ` · ${learningContext.progress.recordedMistakes} recorded ${learningContext.progress.recordedMistakes === 1 ? "mistake" : "mistakes"}`
                : ""}
            </p>
          )}
        </section>

        <section className="study-mode-panel" aria-label="Study modes">
          <div className="study-mode-heading">
            <strong>What would help right now?</strong>
            <span>Each action uses the selected focus and available progress.</span>
          </div>
          <div className="study-mode-actions" role="group" aria-label="Choose a study mode">
            {STUDY_MODES.map((mode) => (
              <button
                type="button"
                key={mode.id}
                aria-pressed={studyMode === mode.id}
                disabled={loading}
                onClick={() => runStudyMode(mode)}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </section>

        <details className="study-lectures" ref={lectureDetailsRef}>
          <summary>AI LECTURES <span>{selectConcept ? `${selectConcept.chapter} · ${selectConcept.concept}` : "Choose a syllabus concept"}</span></summary>
          <div className="study-lectures-content">
            {selectConcept && (
              <>
                <p className="study-context-summary">
                  {describeLearningTarget(selectConcept)}
                  {" — "}{selectConcept.state} mastery evidence.
                  {selectConcept.prerequisites.length > 0 && ` Prerequisites: ${selectConcept.prerequisites.join(", ")}.`}
                </p>
                <p className="study-lecture-recommendation">
                  Suggested next: {recommendedLectureModes.map((id) =>
                    AI_LECTURE_MODES.find((mode) => mode.id === id)?.label
                  ).filter(Boolean).join(" + ")}.
                </p>
              </>
            )}
            <div className="study-lecture-languages" role="group" aria-label="Lecture language">
              {AI_LANGUAGES.map((language) => (
                <button
                  type="button"
                  key={language.code}
                  aria-pressed={responseLanguage === language.code}
                  onClick={() => setResponseLanguage(language.code)}
                >
                  {language.label}
                </button>
              ))}
            </div>
            <div className="study-lecture-modes" role="group" aria-label="AI lecture mode">
              {AI_LECTURE_MODES.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  className={lectureMode === mode.id ? "is-selected" : ""}
                  aria-pressed={lectureMode === mode.id}
                  disabled={loading || !selectConcept}
                  onClick={() => startLecture(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {lectureMode === "problem-solving" && (
              <label className="study-lecture-difficulty">
                Problem difficulty
                <select value={problemDifficulty} onChange={(event) => setProblemDifficulty(event.target.value)}>
                  {PROBLEM_DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
                </select>
              </label>
            )}
            <div className="study-lecture-actions">
              <button type="button" onClick={() => sendStudyQuestion("Ask me one question about the selected lecture concept and wait for my answer.", { mode: "lecture", lectureMode, concept: selectConcept })} disabled={loading || !selectConcept}>Ask AI</button>
              <button type="button" onClick={practiceSelectedConcept} disabled={!selectConcept}>Practice</button>
              <button type="button" onClick={startTopicTest} disabled={loading || !selectConcept}>Test Me</button>
              <button type="button" onClick={explainSelectedAgain} disabled={loading || !selectConcept}>Explain Again</button>
              <button type="button" onClick={() => startLecture("problem-solving")} disabled={loading || !selectConcept}>Problem Solving</button>
              <button type="button" onClick={() => startLecture("fast-revision")} disabled={loading || !selectConcept}>Fast Revision</button>
            </div>
            <p className="study-lecture-note">Interactive AI lesson generated from the selected Syllabusaurus syllabus concept. No video is generated.</p>
          </div>
        </details>

        <details className="study-toolkit">
          <summary>Learning tools and preferences</summary>
          <div className="study-toolkit-content">
            <div className="study-setting-grid">
              <label>
                Teaching style
                <select value={teachingStyle} onChange={(event) => setTeachingStyle(event.target.value)}>
                  {TEACHING_STYLES.map((style) => <option key={style}>{style}</option>)}
                </select>
              </label>
              <label>
                Tutor personality
                <select value={personality} onChange={(event) => setPersonality(event.target.value)}>
                  {TUTOR_PERSONALITIES.map((choice) => <option key={choice}>{choice}</option>)}
                </select>
              </label>
            </div>
            {selectConcept && !selectedVisual && (
              <p className="study-context-summary">Interactive visual unavailable for this concept; no diagram is generated unless an authored visual is supported.</p>
            )}
            {selectConcept && (
              <p className="study-context-summary">
                Current evidence: {selectConcept.state}. Adaptive practice starts at <strong>{selectedDifficulty}</strong>.
                {selectConcept.prerequisites.length > 0 && ` Prerequisites: ${selectConcept.prerequisites.join(", ")}.`}
                {selectConcept.revision && ` Revision ${selectConcept.revision.due ? "is due" : "is next due"} ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(selectConcept.revision.dueAt))}.`}
              </p>
            )}

            <div className="study-tool-actions" aria-label="Tutor actions">
              <button type="button" onClick={() => sendStudyQuestion("Give me only Hint 1 for the problem or concept we are discussing. Do not reveal the solution.", { mode: "hint-1" })} disabled={loading}>Hint 1</button>
              <button type="button" onClick={() => sendStudyQuestion("Give me only the next, slightly more helpful hint. Do not reveal the full solution.", { mode: "hint-2" })} disabled={loading}>Hint 2</button>
              <button type="button" onClick={() => sendStudyQuestion("Give me one final hint, but do not reveal the full solution.", { mode: "hint-3" })} disabled={loading}>Hint 3</button>
              <button type="button" onClick={() => sendStudyQuestion("Show the full worked solution to the problem we are discussing.", { mode: "full-solution", concept: selectConcept })} disabled={loading}>Full solution</button>
              <button type="button" onClick={() => sendStudyQuestion("Based on my saved syllabus, practice, mistakes, planner, and revision context, what should I study now? Give one actionable next step and explain why briefly.", { mode: "recommend", concept: selectConcept })} disabled={loading}>What should I study?</button>
              <button type="button" onClick={startTopicTest} disabled={loading}>Test me</button>
              <button type="button" onClick={startWeaknessSequence} disabled={loading}>Build my weakness</button>
              <button type="button" onClick={startDiagnostic} disabled={loading}>Diagnostic</button>
              <button type="button" onClick={startExam} disabled={loading || Boolean(examSession)}>{examDuration}-minute practice exam</button>
              <button type="button" onClick={() => sendStudyQuestion("Explain why the key idea or formula we just discussed is true. Start with intuition, then derive it if appropriate.", { mode: "chat", concept: selectConcept })} disabled={loading}>Why is this true?</button>
            </div>
            <div className="study-setting-grid study-exam-settings">
              <label>
                Exam scope
                <select value={examScope} onChange={(event) => setExamScope(event.target.value)}>
                  <option value="selected">Selected concept/chapter</option>
                  <option value="mixed">Mixed weak concepts</option>
                </select>
              </label>
              <label>
                Difficulty
                <select value={examDifficulty} onChange={(event) => setExamDifficulty(event.target.value)}>
                  {["Adaptive", "Easy", "Medium", "JEE Main", "JEE Advanced"].map((level) => <option key={level}>{level}</option>)}
                </select>
              </label>
              <label>
                Questions
                <select value={examQuestionCount} onChange={(event) => setExamQuestionCount(Number(event.target.value))}>
                  {[5, 10].map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
              <label>
                Time limit
                <select value={examDuration} onChange={(event) => setExamDuration(Number(event.target.value))}>
                  {[15, 30].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                </select>
              </label>
            </div>
            {weaknessStep >= 0 && (
              <div className="study-sequence">
                <span>Targeted sequence · Step {weaknessStep + 1} of 6</span>
                <button type="button" onClick={advanceWeaknessSequence} disabled={loading}>
                  {weaknessStep === weaknessSteps.length - 1 ? "Finish sequence" : "Continue to next step"}
                </button>
              </div>
            )}
            {selectConcept && (
              <button className="study-review-action" type="button" onClick={markSelectedConceptReviewed}>
                Mark {selectConcept.concept} reviewed today
              </button>
            )}
            <details className="study-material-tools">
              <summary>Ask my notes or a question image</summary>
              <label>
                Paste notes or textbook text
                <textarea value={noteText} maxLength={2500} rows={4} onChange={(event) => setNoteText(event.target.value)} placeholder="Paste a short passage, your working, or a question…" />
              </label>
              <div className="study-material-actions">
                <select value={noteAction} onChange={(event) => setNoteAction(event.target.value)} aria-label="Choose an action for these notes">
                  {NOTE_ACTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
                <button type="button" onClick={runNotesAction} disabled={loading || !noteText.trim()}>Use these notes</button>
              </div>
              <div className="study-material-actions">
                <input
                  ref={imageInputRef}
                  className="study-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={handleImageSelection}
                  aria-label="Choose or take a question image"
                />
                <span>Image is sent for this question only; it is not saved.</span>
              </div>
            </details>
            <details className="study-availability">
              <summary>Feature availability</summary>
              <p>Available now: contextual tutoring, progressive hints, browser-dependent voice, Gemini image questions, mistake classification, syllabus-based mastery estimates, adaptive difficulty guidance, diagnostic prompts, weakness sequences, study recommendations, teaching styles, pasted notes, browser read-aloud, review reminders, configurable timed practice, and AI-assisted performance review.</p>
              <p>Limited: mastery relationships cover selected explicit prerequisites; practice evidence exists only where the current syllabus has recorded attempts.</p>
              <p>Unavailable: interactive diagrams and graphs have no authored visual library yet; external document uploads, persistent AI profiles, and stored test histories are not configured.</p>
            </details>
          </div>
        </details>

        {examSession && (
          <div className="study-exam-status" aria-label="Practice exam status">
            <span>Practice exam · {Math.floor(examSecondsLeft / 60)}:{String(examSecondsLeft % 60).padStart(2, "0")} remaining</span>
            <span>{examSession.answered}/{examSession.questionCount} assessed · {examSession.correct} correct</span>
            <button type="button" onClick={endExam} disabled={loading}>End exam</button>
          </div>
        )}
        {examSummary && (
          <div className="study-exam-status" aria-label="Practice exam results">
            <span>AI-assessed practice: {examSummary.correct}/{examSummary.answered} correct. This is practice feedback, not an exam prediction.</span>
            <button type="button" onClick={() => sendStudyQuestion(`Analyse my completed practice session: ${examSummary.correct} correct out of ${examSummary.answered} AI-assessed answers. Use the conversation to identify one strength, one improvement area, and a next action. Do not claim statistical certainty.`, { mode: "diagnostic" })} disabled={loading}>Analyse results</button>
          </div>
        )}

        <div className="study-conversation" aria-live="polite" aria-label="Study conversation">
          {conversation.length === 0 && !pendingQuestion && (
            <div className="study-empty-chat">
              <span className="study-empty-chat-mark" aria-hidden="true">◎</span>
              <h2>Your study conversation starts here</h2>
              <p>Ask a question, then follow up naturally. I’ll keep the recent context during this chat.</p>
            </div>
          )}
          {conversation.map((turn) => (
            <div className="study-turn" key={turn.id}>
              <div className="study-student-message">
                <p>{turn.question}</p>
              </div>
              <div className="study-tutor-message">
                <StudyAnswer
                  answer={turn.answer}
                  turnId={turn.id}
                  speakingTurnId={speakingTurnId}
                  onSpeak={speakResponse}
                  onFeedback={setTurnFeedback}
                />
                {turn.imageName && <p className="study-image-attachment">Image analysed: {turn.imageName}</p>}
              </div>
            </div>
          ))}
          {pendingQuestion && (
            <div className="study-pending-turn">
              <div className="study-student-message">
                <p>{pendingQuestion}</p>
              </div>
              <div className="study-loading" role="status">
                <span className="study-spinner" aria-hidden="true" />
                <span>{conversation.length ? "Thinking about your follow-up…" : "Putting together a clear explanation…"}</span>
              </div>
            </div>
          )}
          <div ref={conversationEndRef} />
        </div>

        <form className="study-question-form" onSubmit={submitQuestion}>
          <label htmlFor="study-question">{conversation.length ? "What would you like to explore next?" : "What are you working through?"}</label>
          <textarea
            id="study-question"
            value={question}
            maxLength={MAX_QUESTION_LENGTH}
            onChange={(event) => {
              questionRef.current = event.target.value;
              setQuestion(event.target.value);
            }}
            placeholder={conversation.length ? "Ask a follow-up, such as “Why?” or “Give me another example.”" : "For example: Why does a heavier object not fall faster than a lighter one?"}
            rows={3}
            disabled={loading}
            aria-describedby="study-question-hint"
          />
          {image && (
            <p className="study-image-selected">
              Image ready: {imageName}
              <button type="button" onClick={() => { setImage(null); setImageName(""); if (imageInputRef.current) imageInputRef.current.value = ""; }}>Remove image</button>
            </p>
          )}
          <div className="study-form-footer">
            <div className="study-voice-controls">
              <button
                className={`study-voice-button study-microphone-button${listening ? " is-listening" : ""}`}
                type="button"
                onClick={toggleListening}
                disabled={loading}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
                title={listening ? "Stop listening" : "Use voice input"}
                aria-pressed={listening}
              >
                <MicrophoneIcon listening={listening} />
                <span>{listening ? "Listening… Stop" : "Use voice"}</span>
              </button>
              {listening && <span className="study-listening-status" role="status">Listening. Review the transcript before sending.</span>}
              {!listening && (
                (typeof window === "undefined" || !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) ||
                recognitionDenied ||
                unsupportedRecognitionLanguages.includes(voiceLanguage)
              ) && (
                <span className="study-listening-status" role="status">
                  {recognitionDenied
                    ? "Microphone permission denied; typing remains available."
                    : unsupportedRecognitionLanguages.includes(voiceLanguage)
                      ? `${getLanguage(voiceLanguage).nativeLabel} voice input unavailable; typing remains available.`
                      : "Voice input unavailable in this browser; typing remains available."}
                </span>
              )}
            </div>
            <span id="study-question-hint">{question.length}/{MAX_QUESTION_LENGTH} characters</span>
            <button className="action-button action-button-light" type="submit" disabled={loading || (!question.trim() && !image)}>
              {loading ? "Thinking…" : conversation.length ? "Send follow-up" : "Explain this"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </div>
        </form>

        {error && <div className="study-error" role="alert">{error}</div>}
        {voiceNotice && <div className="study-voice-notice" role="status">{voiceNotice}</div>}
      </section>
    </main>
  );
}
