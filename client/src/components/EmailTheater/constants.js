export const CATEGORY_TABS = [
  { id: "primary", label: "Primary" },
  { id: "social", label: "Social" },
  { id: "updates", label: "Updates" },
  { id: "promotions", label: "Promotions" },
  { id: "spam", label: "Spam" },
];

export const VOICE_OPTIONS = [
  { id: "narrator_warm", label: "Narrator • Warm" },
  { id: "narrator_crisp", label: "Narrator • Crisp" },
  { id: "sender_playful", label: "Sender • Playful" },
  { id: "sender_serious", label: "Sender • Serious" },
  { id: "assistant_neutral", label: "Assistant • Neutral" },
];

export const STYLE_PRESETS = [
  { id: "focused", label: "Focused (work mode)" },
  { id: "party", label: "Party (energetic)" },
  { id: "chill", label: "Chill (casual)" },
  { id: "dramatic", label: "Dramatic (theater)" },
  { id: "news", label: "News Anchor" },
  { id: "story", label: "Storytelling" },
];

export const LANG_OPTIONS = [
  { id: "en-US", label: "English (US)" },
  { id: "en-GB", label: "English (UK)" },
  { id: "hi-IN", label: "Hindi (India)" },
  { id: "es-ES", label: "Spanish (Spain)" },
  { id: "es-MX", label: "Spanish (Mexico)" },
  { id: "fr-FR", label: "French (France)" },
  { id: "de-DE", label: "German" },
  { id: "it-IT", label: "Italian" },
  { id: "ja-JP", label: "Japanese" },
  { id: "pt-BR", label: "Portuguese (Brazil)" },
];

export const LANG_LABEL_BY_CODE = Object.fromEntries(
  LANG_OPTIONS.map((l) => [l.id, l.label])
);
