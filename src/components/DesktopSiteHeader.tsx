import LanguageToggle, { LocalizedText } from "./LanguageToggle";
import { PROJECT_COUNT } from "../data/projectCount";

const DesktopSiteHeader = ({ active, showColor = true }: { active?: "projects" | "about" | "expertise" | "archive" | "vibe" | "contact"; showColor?: boolean }) => (
  <header className="theme-site-header hidden items-center justify-between border-b border-white/15 bg-inherit py-5 font-mono text-xs uppercase text-white md:flex">
    <a href="/" className="font-bold">Emmanuela©</a>
    <nav className="flex items-center gap-7 xl:gap-10">
      {active === "projects" ? <span className="line-through"><LocalizedText fr={`Projets [${PROJECT_COUNT}]`} en={`Projects [${PROJECT_COUNT}]`} /></span> : <a href="/projects"><LocalizedText fr={`Projets [${PROJECT_COUNT}]`} en={`Projects [${PROJECT_COUNT}]`} /></a>}
      {active === "about" ? <span className="line-through"><LocalizedText fr="À propos" en="About" /></span> : <a href="/about"><LocalizedText fr="À propos" en="About" /></a>}
      {active === "vibe" ? <span className="line-through">Vibe-check</span> : <a href="/vibe-check">Vibe-check</a>}
      {active === "contact" ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="line-through">Contact</span>
          <img src="/runner.gif" alt="" aria-hidden="true" className="h-4 w-4 object-contain [image-rendering:pixelated]" />
        </span>
      ) : (
        <a href="/contact" className="inline-flex items-center gap-1.5">
          Contact
          <img src="/runner.gif" alt="" aria-hidden="true" className="h-4 w-4 object-contain [image-rendering:pixelated]" />
        </a>
      )}
    </nav>
    <div className="flex items-center gap-5"><LanguageToggle /></div>
  </header>
);

export default DesktopSiteHeader;
