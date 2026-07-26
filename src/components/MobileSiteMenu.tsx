import { useEffect, useState } from "react";
import ColorThemeToggle from "./ColorThemeToggle";
import { useSoundEffects } from "../hooks/useSoundEffects";
import LanguageToggle, { LocalizedText } from "./LanguageToggle";

const MobileSiteMenu = () => {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundEffects();
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "Africa/Porto-Novo" }).format(new Date()).toUpperCase());
    update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer);
  }, []);
  return <>
    <button onClick={() => setOpen(true)} className="mobile-nav-trigger fixed left-5 top-5 z-[210] flex items-center gap-2 rounded-full px-2.5 py-2 font-mono text-[11px] uppercase shadow-xl md:hidden">
      <span className="mobile-nav-trigger__mark grid size-7 place-items-center rounded-full text-[10px] font-bold shadow-sm">E©</span><span>Menu</span>
    </button>
    <div className={`mobile-menu-panel fixed inset-0 z-[220] font-mono transition-colors duration-300 md:hidden ${open ? "translate-x-0" : "translate-x-full"}`}>
      <div className="flex h-[74px] items-center justify-between border-b border-current/20 px-5 text-xs uppercase leading-relaxed"><div><a href="/" className="block font-bold">Emmanuela©</a>{time} GMT+1</div><button onClick={() => setOpen(false)} className="rotate-[-90deg] text-sm"><LocalizedText fr="Sortir" en="Exit" /></button></div>
      <nav className="absolute left-5 top-[41%] flex -translate-y-1/2 flex-col items-start gap-4 text-[18px] uppercase leading-none">
        <a href="/projects" className="mobile-menu-link"><LocalizedText fr="Projets [14]" en="Projects [14]" /></a><a href="/about" className="mobile-menu-link"><LocalizedText fr="À propos" en="About" /></a><a href="/expertise" className="mobile-menu-link"><LocalizedText fr="Expertises" en="Expertise" /></a><a href="/archive" className="mobile-menu-link">Archive</a><a href="/vibe-check" className="mobile-menu-link">Vibe-check</a><a href="/contact" className="mobile-menu-link">Contact</a><a href="https://www.linkedin.com" className="mobile-menu-link">LinkedIn</a>
      </nav>
      <div className="absolute bottom-10 left-5 flex flex-col items-start text-sm uppercase leading-relaxed">
        <button type="button" onClick={toggleSound}>▦ <LocalizedText fr={`Son [${soundEnabled ? "Actif" : "Coupé"}]`} en={`Sound [${soundEnabled ? "On" : "Off"}]`} /></button>
        <ColorThemeToggle />
        <LanguageToggle />
      </div>
      <div className="mobile-menu-barcode absolute bottom-10 right-10 h-14 w-24" />
    </div>
  </>;
};
export default MobileSiteMenu;
