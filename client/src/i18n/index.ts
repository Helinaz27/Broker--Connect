import { am } from "./locales/am";
import { en, type TranslationDictionary } from "./locales/en";

export type Locale = "en" | "am";

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "am", label: "አማርኛ" },
];

export const dictionaries: Record<Locale, TranslationDictionary> = {
  en: en as TranslationDictionary,
  am,
};

export const LOCALE_STORAGE_KEY = "broker-connect-locale";

export const defaultLocale: Locale = "en";

type NestedKeyOf<T, P extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], P extends "" ? K : `${P}.${K}`>
        : P extends ""
          ? K
          : `${P}.${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<TranslationDictionary>;

function getByPath(
  dict: TranslationDictionary,
  path: string,
): string | undefined {
  const parts = path.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export { helpContent } from "./content/help";
export { termsContent, privacyContent } from "./content/legal";

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const raw =
    getByPath(dictionaries[locale], key) ??
    getByPath(dictionaries.en, key) ??
    key;

  if (!params) return raw;

  return Object.entries(params).reduce(
    (text, [param, value]) => text.replace(`{${param}}`, String(value)),
    raw,
  );
}
