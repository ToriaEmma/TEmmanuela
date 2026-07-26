import { useState } from "react";
import Features from "./Features";
import type { ProjectFilter } from "./Features";
import NavBar from "./NavBar";
import { SmoothScrollProvider } from "../context/ScrollProviderContext";
import Footer from "./Footer";
import { LocalizedText } from "./LanguageToggle";
import DesktopSiteHeader from "./DesktopSiteHeader";
import MobileSiteMenu from "./MobileSiteMenu";

const ProjectsIntro = ({ activeFilter, onFilterChange }: { activeFilter: ProjectFilter; onFilterChange: (filter: ProjectFilter) => void }) => (
  <section className="theme-surface border-b border-white/15 bg-black px-5 pb-14 pt-10 font-mono text-white md:px-8 md:pb-20 md:pt-16">
    <div className="flex items-start justify-between">
      <h1 className="font-sans text-[22vw] font-medium uppercase leading-[0.78] tracking-[-0.09em] md:text-[13vw]">
        S/Work<sup className="ml-3 align-top font-mono text-[4vw] tracking-normal md:text-[2.5vw]">[14]</sup>
      </h1>
      <span className="mt-5 size-3 bg-[#fb6f92] md:mr-[14%] md:mt-8 md:size-4" aria-hidden="true" />
    </div>
    <div className="mt-14 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase md:mt-20 md:text-xl">
      <span className="opacity-60">&gt;&nbsp; <LocalizedText fr="Filtrer par" en="Filter by" /></span>
      <button type="button" onClick={() => onFilterChange("all")} className={activeFilter === "all" ? "underline underline-offset-4" : ""}><LocalizedText fr="Tout [14]" en="All [14]" /></button>
      <span>,</span><button type="button" onClick={() => onFilterChange("brand")} className={activeFilter === "brand" ? "underline underline-offset-4" : ""}>Brand Design</button>
      <span>,</span><button type="button" onClick={() => onFilterChange("uiux")} className={activeFilter === "uiux" ? "underline underline-offset-4" : ""}>UI/UX</button>
      <span>,</span><button type="button" onClick={() => onFilterChange("website")} className={activeFilter === "website" ? "underline underline-offset-4" : ""}><LocalizedText fr="Site Web" en="Website" /></button>
    </div>
  </section>
);

const ProjectsPage = () => {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("all");
  return (
  <SmoothScrollProvider>
    <main className="theme-surface main-container min-h-screen overflow-hidden bg-black px-5 md:px-8">
      <MobileSiteMenu />
      <DesktopSiteHeader active="projects" />
      <div className="-mx-5 md:-mx-8">
      <ProjectsIntro activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <Features showAllSiteProjects activeFilter={activeFilter} />
      <Footer />
      </div>
    </main>
  </SmoothScrollProvider>
  );
};

export default ProjectsPage;
