import { useEffect, useState } from "react";
import { LocalizedText } from "./LanguageToggle";

const ColorThemeToggle = () => {
  const [isLight, setIsLight] = useState(() => localStorage.getItem("color-theme") === "light");

  useEffect(() => {
    document.documentElement.classList.toggle("light-site", isLight);
  }, []);

  const toggleTheme = () => {
    setIsLight((current) => {
      const next = !current;
      document.documentElement.classList.toggle("light-site", next);
      localStorage.setItem("color-theme", next ? "light" : "dark");
      return next;
    });
  };

  return (
    <button data-theme-sound type="button" onClick={toggleTheme} className="whitespace-nowrap font-mono text-[10px] uppercase sm:text-xs">
      <LocalizedText fr="Couleur" en="Color" />: {isLight ? "#101010" : "#D3D0C5"}
    </button>
  );
};

export default ColorThemeToggle;
