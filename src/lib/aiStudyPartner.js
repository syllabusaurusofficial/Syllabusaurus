import { supabase } from "./supabase";
import { normalizeStudyAnswer } from "./aiStudyResponse";

const MAX_HISTORY_TURNS = 4;
const MAX_HISTORY_CHARACTERS = 6000;
const MAX_HISTORY_QUESTION_CHARACTERS = 1000;
const MAX_HISTORY_ANSWER_CHARACTERS = 2000;
export { normalizeStudyAnswer } from "./aiStudyResponse";

export function getRecentConversationHistory(conversation) {
  const history = [];
  let characterCount = 0;
  const recentTurns = conversation.slice(-MAX_HISTORY_TURNS);

  for (let index = recentTurns.length - 1; index >= 0; index -= 1) {
    const turn = recentTurns[index];
    const answer = typeof turn.answer === "string" ? turn.answer : turn.answer?.response;
    if (typeof turn.question !== "string" || typeof answer !== "string") continue;
    const turnMessages = [
      { role: "user", text: turn.question.slice(0, MAX_HISTORY_QUESTION_CHARACTERS) },
      { role: "model", text: answer.slice(0, MAX_HISTORY_ANSWER_CHARACTERS) },
    ];
    const turnLength = turnMessages.reduce((total, message) => total + message.text.length, 0);
    if (characterCount + turnLength > MAX_HISTORY_CHARACTERS) break;
    history.unshift(...turnMessages);
    characterCount += turnLength;
  }

  return history;
}

function requestFailureMessage(errorType, fallback) {
  switch (errorType) {
    case "context_too_large":
      return "The study context is still too large to send. Try a more specific question or start a new chat.";
    case "provider_failure":
      return "The AI provider is temporarily unavailable. Please try again shortly.";
    case "quota_exhausted":
      return "The AI Study Partner has reached its current usage limit. Please try again later.";
    case "network_failure":
      return "A network connection issue prevented the Study Partner request. Check your connection and try again.";
    case "malformed_response":
      return "The AI provider returned an unreadable answer. Please try again.";
    default:
      return fallback;
  }
}

export async function askStudyPartner(question, conversationHistory = [], options = {}) {
  let invocation;
  try {
    invocation = await supabase.functions.invoke("study-partner", {
      body: {
        question,
        conversationHistory,
        learningContext: options.learningContext,
        teachingStyle: options.teachingStyle,
        personality: options.personality,
        mode: options.mode,
        responseLanguage: options.responseLanguage,
        voiceLanguage: options.voiceLanguage,
        lectureMode: options.lectureMode,
        image: options.image,
        debugErrors: import.meta.env.DEV,
      },
    });
  } catch {
    throw new Error(requestFailureMessage("network_failure"));
  }

  const { data, error } = invocation;
  if (error) {
    let message = error.message;
    let errorType = "";
    if (error.context instanceof Response) {
      let responseBodyParsed = false;
      try {
        const responseBody = await error.context.json();
        responseBodyParsed = true;
        errorType = responseBody?.errorType || "";
        if (typeof responseBody?.error === "string") {
          message = responseBody.error;
        }
        if (import.meta.env.DEV && responseBody?.debug) {
          console.error("AI Study Partner request failed.", responseBody.debug);
        }
      } catch {
        // Keep the Functions client error if the response body is not JSON.
      }
      if (!errorType && /student learning context is too large/i.test(message)) {
        errorType = "context_too_large";
      } else if (!responseBodyParsed) {
        errorType = "malformed_response";
      } else if (!errorType && error.context.status >= 500) {
        errorType = "provider_failure";
      }
    } else {
      errorType = "network_failure";
    }
    throw new Error(requestFailureMessage(
      errorType,
      message || "The study partner could not answer right now.",
    ));
  }

  const answer = normalizeStudyAnswer(data);
  if (!answer) {
    throw new Error(requestFailureMessage(
      "malformed_response",
      "The study partner returned an invalid answer. Please try again.",
    ));
  }

  return answer;
}
