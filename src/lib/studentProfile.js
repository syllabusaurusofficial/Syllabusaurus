import { supabase } from "./supabase";

export const STUDENT_PROFILE_TABLE = "student_profiles";

export async function loadStudentProfile(userId) {
  const { data, error } = await supabase
    .from(STUDENT_PROFILE_TABLE)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export function getStudentProfileErrorInfo(error, sensitiveValues = []) {
  const redact = (value) => {
    if (typeof value !== "string") return value ?? null;
    let safeValue = value
      .replace(/Bearer\s+\S+/gi, "Bearer [REDACTED]")
      .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[REDACTED]");
    for (const sensitiveValue of sensitiveValues) {
      if (typeof sensitiveValue === "string" && sensitiveValue.length > 0) {
        safeValue = safeValue.replaceAll(sensitiveValue, "[REDACTED]");
      }
    }
    return safeValue;
  };
  const source = error && typeof error === "object" ? error : {};
  const response = source.context instanceof Response ? source.context : null;
  const status = source.status ?? source.statusCode ?? response?.status ?? null;

  return {
    message: redact(source.message || (typeof error === "string" ? error : "Unknown profile query error")),
    code: redact(source.code),
    details: redact(source.details),
    hint: redact(source.hint),
    status,
  };
}

export async function saveStudentProfile(userId, profile) {
  const { data, error } = await supabase
    .from(STUDENT_PROFILE_TABLE)
    .upsert({
      user_id: userId,
      full_name: profile.full_name.trim(),
      grade: profile.grade,
      board: profile.board,
      state: profile.state || null,
      medium: profile.medium,
      target_exam: profile.target_exam,
      study_goal: profile.study_goal.trim(),
      subjects: profile.subjects,
      learning_style: profile.learning_style,
      academic_challenges: profile.academic_challenges,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}
