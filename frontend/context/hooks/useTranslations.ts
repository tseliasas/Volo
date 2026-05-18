import { translations } from "@/context/translations";
import { useLanguage } from "@/context/LanguageContext";

export function useTranslation() {
  const { language } = useLanguage();

  return translations[language];
}