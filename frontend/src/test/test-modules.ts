import { TranslateTestingModule } from "ngx-translate-testing";
import * as de from "../translations/de-DE.json";
import { LanguageTranslations } from "ngx-translate-testing/lib/translations.model";

export const emptyTranslateTestingModule = (): TranslateTestingModule =>
  TranslateTestingModule.withTranslations("de-DE", {});

/**
 * Return the complete german translate testing module or just specific key set
 * @param selectedTranslateKeys
 */
export const germanTranslateTestingModule = (
  selectedTranslateKeys: string[] = [],
): TranslateTestingModule => {
  const translations: LanguageTranslations =
    selectedTranslateKeys.length > 0
      ? Object.entries(de)
          .filter(([key, value]) => selectedTranslateKeys.includes(key))
          .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {} as LanguageTranslations)
      : de;
  return TranslateTestingModule.withTranslations("de-DE", translations);
};
