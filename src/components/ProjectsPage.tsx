import { useState } from "react";
import ProjectsList from "./ProjectsList";
import ProjectsGrid from "./ProjectsGrid";
import { SmoothScrollProvider } from "../context/ScrollProviderContext";
import DesktopSiteHeader from "./DesktopSiteHeader";
import MobileSiteMenu from "./MobileSiteMenu";

type View = "grid" | "list";

// Bascule grille / liste, centree en haut.
const ViewToggle = ({ view, onChange }: { view: View; onChange: (v: View) => void }) => (
  <div className="flex items-center justify-center gap-3 font-mono text-[12px] lowercase md:text-[13px]">
    <button
      type="button"
      onClick={() => onChange("grid")}
      className={`transition-opacity duration-300 ${view === "grid" ? "text-white" : "text-white/40 hover:text-white/70"}`}
    >
      grid
    </button>
    <span className="text-white/40" aria-hidden="true">&bull;</span>
    <button
      type="button"
      onClick={() => onChange("list")}
      className={`transition-opacity duration-300 ${view === "list" ? "text-white" : "text-white/40 hover:text-white/70"}`}
    >
      list
    </button>
  </div>
);

const ProjectsPage = () => {
  const [view, setView] = useState<View>("grid");

  // En vue ruban la page ne defile pas : <main> est fixed inset-0, la molette
  // alimente le scroll virtuel horizontal. La vue liste garde le scroll
  // vertical habituel, donc Locomotive n'est monte que pour elle.
  if (view === "grid") {
    return (
      <main className="theme-surface ribbon-stage fixed inset-0 overflow-hidden bg-black">
        {/* L'en-tete et la bascule flottent au-dessus du ruban : le <main> est
            en fixed sans padding, donc le gouttiere horizontale que l'en-tete
            attendait de la page est portee ici. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-5 md:px-8">
          <div className="pointer-events-auto">
            <MobileSiteMenu />
            <DesktopSiteHeader active="projects" />
            <div className="pt-4">
              <ViewToggle view={view} onChange={setView} />
            </div>
          </div>
        </div>
        <ProjectsGrid />
      </main>
    );
  }

  return (
    <SmoothScrollProvider>
      <main className="theme-surface main-container min-h-screen overflow-hidden bg-black px-5 md:px-8">
        <MobileSiteMenu />
        <DesktopSiteHeader active="projects" />
        <div className="-mx-5 md:-mx-8">
          {/* Le meme pt-4 que la vue grille : la bascule ne doit pas se
              deplacer quand on passe d'une vue a l'autre. */}
          <div className="pt-4">
            <ViewToggle view={view} onChange={setView} />
          </div>
          <ProjectsList />
        </div>
      </main>
    </SmoothScrollProvider>
  );
};

export default ProjectsPage;
