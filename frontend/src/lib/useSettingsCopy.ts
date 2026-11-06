import { useCallback } from "react";
import { useAqryoLocale } from "./i18n";
import { settingsFeedback, settingsText } from "./settingsCopy";

export function useSettingsCopy() {
  const { locale } = useAqryoLocale();
  const sc = useCallback((text: string) => settingsText(locale, text), [locale]);
  const feedback = useCallback((text: string) => settingsFeedback(locale, text), [locale]);
  return { locale, sc, feedback };
}
