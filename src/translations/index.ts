import { en } from "./en";
import { hi } from "./hi";
import { fr } from "./fr";
import { it } from "./it";
import { de } from "./de";

export type TranslationKey =
  | `card.${keyof typeof en.card}`
  | `objects.${keyof typeof en.objects}`
  | `moonPhases.${keyof typeof en.moonPhases}`
  | `types.${keyof typeof en.types}`
  | `time.${keyof typeof en.time}`
  | `editor.${keyof typeof en.editor}`
  | `languages.${keyof typeof en.languages}`;

export const translations = {
  en,
  hi,
  fr,
  it,
  de,
} as const;

export type LanguageCode = keyof typeof translations;
