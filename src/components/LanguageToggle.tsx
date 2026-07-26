import { useEffect, useState, type ReactNode } from "react";

export const LocalizedText = ({ fr, en }: { fr: ReactNode; en: ReactNode }) => (
  <><span className="lang-fr">{fr}</span><span className="lang-en">{en}</span></>
);

const LanguageToggle = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem("site-language") || "fr");

  useEffect(() => {
    document.documentElement.dataset.language = language;
  }, [language]);

  const toggleLanguage = () => {
    const next = language === "fr" ? "en" : "fr";
    setLanguage(next);
    localStorage.setItem("site-language", next);
    window.dispatchEvent(new CustomEvent("language-change", { detail: next }));
  };

  return <button type="button" onClick={toggleLanguage} className="font-mono text-[10px] uppercase md:text-xs">{language === "fr" ? "EN" : "FR"}</button>;
};

export default LanguageToggle;
