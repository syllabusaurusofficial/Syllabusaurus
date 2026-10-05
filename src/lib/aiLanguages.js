export const AI_LANGUAGES = [
  { code: "en", label: "ENGLISH", nativeLabel: "English", locale: "en-IN", speechPrefix: "en" },
  { code: "ta", label: "தமிழ்", nativeLabel: "Tamil", locale: "ta-IN", speechPrefix: "ta" },
  { code: "hi", label: "हिन्दी", nativeLabel: "Hindi", locale: "hi-IN", speechPrefix: "hi" },
];

export function getLanguage(code) {
  return AI_LANGUAGES.find((language) => language.code === code) || AI_LANGUAGES[0];
}

export function hasNativeSpeechVoice(voices, languageCode) {
  const language = getLanguage(languageCode);
  return voices.some((voice) =>
    voice.lang?.toLowerCase().startsWith(language.speechPrefix)
  );
}
