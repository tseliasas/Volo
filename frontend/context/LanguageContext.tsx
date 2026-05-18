"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Language = "en" | "tr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext =
  createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] =
    useState<Language>("tr");

  useEffect(() => {
    const saved =
      localStorage.getItem("volo_language");

    if (saved) {
      setLanguage(saved as Language);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "volo_language",
      language
    );
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be inside LanguageProvider"
    );
  }

  return context;
}