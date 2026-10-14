import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import type { SupportedLanguage } from '@/i18n/locales';

/**
 * dayjs has no `pt-pt` locale — `pt` IS European Portuguese there, and Brazilian Portuguese is
 * the separate `pt-br` locale. This mapping must stay in sync with that dayjs convention.
 */
const dayjsLocaleNames: Record<SupportedLanguage, string> = {
  ar: 'ar',
  da: 'da',
  de: 'de',
  en: 'en',
  es: 'es',
  fi: 'fi',
  fr: 'fr',
  he: 'he',
  id: 'id',
  it: 'it',
  ja: 'ja',
  nl: 'nl',
  'pt-BR': 'pt-br',
  'pt-PT': 'pt',
  ro: 'ro',
  sv: 'sv',
  tr: 'tr',
  vi: 'vi',
  'zh-CN': 'zh-cn',
  'zh-TW': 'zh-tw',
};

// Metro (unlike webpack) needs a STATIC, literal string argument to `require()` to resolve and
// bundle a module — a template-literal path like `require(\`dayjs/locale/${name}\`)` can't be
// analyzed at bundle time, so each locale needs its own literal `require()` call here rather than
// a single dynamically-built one. Still lazy: nothing runs until `setDayjsLocale` actually picks
// this branch, so a session only pays for the locale(s) it uses instead of importing all 20 at
// module load.
/* eslint-disable @typescript-eslint/no-require-imports -- intentionally lazy per-locale requires, see above */
const dayjsLocaleLoaders: Record<string, () => void> = {
  ar: () => require('dayjs/locale/ar'),
  da: () => require('dayjs/locale/da'),
  de: () => require('dayjs/locale/de'),
  en: () => require('dayjs/locale/en'),
  es: () => require('dayjs/locale/es'),
  fi: () => require('dayjs/locale/fi'),
  fr: () => require('dayjs/locale/fr'),
  he: () => require('dayjs/locale/he'),
  id: () => require('dayjs/locale/id'),
  it: () => require('dayjs/locale/it'),
  ja: () => require('dayjs/locale/ja'),
  nl: () => require('dayjs/locale/nl'),
  'pt-br': () => require('dayjs/locale/pt-br'),
  pt: () => require('dayjs/locale/pt'),
  ro: () => require('dayjs/locale/ro'),
  sv: () => require('dayjs/locale/sv'),
  tr: () => require('dayjs/locale/tr'),
  vi: () => require('dayjs/locale/vi'),
  'zh-cn': () => require('dayjs/locale/zh-cn'),
  'zh-tw': () => require('dayjs/locale/zh-tw'),
};
/* eslint-enable @typescript-eslint/no-require-imports */

// Tracks which locale modules have already been loaded — dayjs locale side-effect modules are
// idempotent to re-require, but there's no reason to re-run the loader for a locale already
// loaded this session.
const loadedLocales = new Set<string>();

function ensureDayjsLocaleLoaded(dayjsLocaleName: string): void {
  if (loadedLocales.has(dayjsLocaleName)) return;
  loadedLocales.add(dayjsLocaleName);
  dayjsLocaleLoaders[dayjsLocaleName]?.();
}

// Enables the locale-aware `L`/`LL`/`LT`/`LLL` tokens. Idempotent — dayjs skips a plugin that's
// already installed.
dayjs.extend(localizedFormat);

/** Removes the year (and the separators/literals glued to it) from a locale's `LL` format, so a
 * same-year date keeps that locale's own word order: `MMMM D, YYYY` → `MMMM D` (en),
 * `D MMMM [năm] YYYY` → `D MMMM` (vi), `YYYY年M月D日` → `M月D日` (ja/zh). A bracketed literal is
 * only dropped when it's a separate word before the year (vi `[năm]`), not when it's a suffix
 * glued to the month (fi `MMMM[ta]`). */
const YEAR_TOKEN_PATTERN = /(\s+\[[^\]]*\])?[\s,]*YYYY(年|년)?\.?/;

/** Localized calendar date for the active dayjs locale — "5 tháng 3" / "March 5" within the
 * current year, "5 tháng 3 năm 2025" / "March 5, 2025" otherwise. Hard-coding an English token
 * order like `MMMM D` renders "tháng 3 5" in Vietnamese. */
export function formatCalendarDate(date: dayjs.ConfigType, options: { withYear: boolean }): string {
  const target = dayjs(date);
  if (options.withYear) return target.format('LL');
  const longDateFormat = dayjs.Ls[dayjs.locale()]?.formats?.LL ?? 'MMMM D, YYYY';
  return target.format(longDateFormat.replace(YEAR_TOKEN_PATTERN, '').trim());
}

/** Localized clock time for the active dayjs locale ("14:07" in vi, "2:07 PM" in en). Follows the
 * in-app language, unlike `Date#toLocaleTimeString()`, which follows the device locale. */
export function formatClockTime(date: dayjs.ConfigType): string {
  return dayjs(date).format('LT');
}

/** Localized date + time for the active dayjs locale ("5 tháng 3 năm 2026 14:07" in vi). */
export function formatDateTime(date: dayjs.ConfigType): string {
  return dayjs(date).format('LLL');
}

export function setDayjsLocale(language: SupportedLanguage): void {
  const dayjsLocaleName = dayjsLocaleNames[language];
  ensureDayjsLocaleLoaded(dayjsLocaleName);
  dayjs.locale(dayjsLocaleName);
}
