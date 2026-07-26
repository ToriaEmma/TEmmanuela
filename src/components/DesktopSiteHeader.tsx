import ColorThemeToggle from "./ColorThemeToggle";
import LanguageToggle, { LocalizedText } from "./LanguageToggle";

const DesktopSiteHeader = ({ active, showColor = true }: { active?: "projects" | "about" | "expertise" | "archive" | "vibe" | "contact"; showColor?: boolean }) => (
  <header className="theme-site-header hidden items-center justify-between border-b border-white/15 bg-inherit py-5 font-mono text-xs uppercase text-white md:flex">
    <a href="/" className="font-bold">Emmanuela©</a>
    <nav className="flex items-center gap-7 xl:gap-10">
      {active === "projects" ? <span className="line-through"><LocalizedText fr="Projets [14]" en="Projects [14]" /></span> : <a href="/projects"><LocalizedText fr="Projets [14]" en="Projects [14]" /></a>}
      {active === "about" ? <span className="line-through"><LocalizedText fr="À propos" en="About" /></span> : <a href="/about"><LocalizedText fr="À propos" en="About" /></a>}
      {active === "expertise" ? <span className="line-through"><LocalizedText fr="Expertises" en="Expertise" /></span> : <a href="/expertise"><LocalizedText fr="Expertises" en="Expertise" /></a>}
      {active === "archive" ? <span className="line-through">Archive</span> : <a href="/archive">Archive</a>}
      {active === "vibe" ? <span className="line-through">Vibe-check</span> : <a href="/vibe-check">Vibe-check</a>}
      {active === "contact" ? <span className="line-through">Contact</span> : <a href="/contact">Contact</a>}
    </nav>
    <div className="flex items-center gap-5">{showColor && <ColorThemeToggle />}<LanguageToggle /></div>
  </header>
);

export default DesktopSiteHeader;
