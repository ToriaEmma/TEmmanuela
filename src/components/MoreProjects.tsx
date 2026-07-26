import { useMemo, useState, type CSSProperties } from "react";
import { LocalizedText } from "./LanguageToggle";
import { navigateTo } from "../utils/navigation";

const projects = [
  { name: "Vintage", expertise: "Marketplace & Brand Design", team: "Emmanuela", year: "2026", href: "/vintage", image: "/REVOLU/big vintagd.webp" },
  { name: "Cats", expertise: "Brand Design", team: "Emmanuela", year: "2026", href: "/cats", image: "/optimized/cats-card.webp" },
  { name: "Score", expertise: "Site Web", team: "Emmanuela", year: "2026", href: "https://score-blond-six.vercel.app", image: "/site%20/score-preview.webp" },
  { name: "Secure Tutor", expertise: "Goodies & Brand Design", team: "Emmanuela", year: "2026", href: "/secure-tutor", image: "/REVOLU/big secure.webp" },
  { name: "Gummy", expertise: "Brand Design", team: "Emmanuela", year: "2026", href: "/gummy", image: "/REVOLU/big gummy.webp" },
  { name: "Vennis Tenis Club", expertise: "Brand Design", team: "Emmanuela", year: "2026", href: "/vennis", image: "/optimized/vennis-card.webp" },
  { name: "Rhode", expertise: "Direction artistique & digital", team: "Emmanuela", year: "2025", href: "/rhode", image: "/site%20/rhode.webp" },
  { name: "MEB", expertise: "Site Web", team: "Emmanuela", year: "2026", href: "https://meb-beta.vercel.app", image: "/site%20/meb1.svg" },
  { name: "Full Bridge", expertise: "Site Web", team: "Emmanuela", year: "2026", href: "https://fullbridgedigital.com", image: "/site%20/full.webp" },
  { name: "Secure Tutor App", expertise: "UI/UX", team: "Emmanuela", year: "2026", href: "/secure-tutor-app", image: "/REVOLU/big secure.webp" },
  { name: "ZEM", expertise: "Site Web", team: "Emmanuela", year: "2026", href: "https://zem2-0.vercel.app", image: "/site%20/Zem2.0.webp" },
  { name: "Tekbot", expertise: "UI/UX", team: "Emmanuela", year: "2025", href: "/tekbot", image: "/site%20/logo.webp" },
  { name: "Dogs", expertise: "Brand Design", team: "Emmanuela", year: "2026", href: "/dogs", image: "/optimized/dogs-card.webp" },
  { name: "ArbitraChain", expertise: "UI/UX", team: "Emmanuela", year: "2025", href: "/arbitrachain", image: "/ArbitraChain/image_1.webp" },
];

const MoreProjects = ({ current }: { current: string }) => {
  const available = useMemo(() => projects.filter((project) => project.name !== current), [current]);
  const [active, setActive] = useState(0);
  const preview = available[active] || available[0];
  const previewProgress = available.length > 1 ? (active / (available.length - 1)) * 100 : 0;
  const mobilePreview = preview && ({ "Full Bridge": "/site%20/tfull.webp", Score: "/site%20/tscore.webp", MEB: "/site%20/tmeb.webp" } as Record<string, string>)[preview.name];

  return (
    <footer className="bg-[#101010] px-5 py-14 font-mono text-[#d9d6cc] md:px-8 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,2.28fr)] lg:gap-12">
        <div className="relative lg:min-h-full">
          <p className="mb-5 text-[11px] uppercase md:text-sm"><LocalizedText fr="Autres projets" en="More projects" /></p>
          <div className="relative lg:absolute lg:inset-x-0 lg:bottom-0 lg:top-10">
            {preview && (
              <button
                type="button"
                data-project-card
                onClick={() => window.setTimeout(() => navigateTo(preview.href), 35)}
                style={{ "--more-projects-preview-position": `${previewProgress}%` } as CSSProperties}
                className={`more-projects-preview block aspect-square w-full overflow-hidden rounded-sm transition-[top,transform] duration-300 ease-out ${preview.name === "ZEM" || preview.name === "Tekbot" ? "bg-[#0D2F61]" : "bg-[#171717]"}`}
              >
                <picture className="block size-full">
                  {mobilePreview && <source media="(max-width: 767px)" srcSet={mobilePreview} />}
                  <img loading="lazy" decoding="async"
                    src={preview.image}
                    alt={preview.name}
                    className={`size-full transition-transform duration-700 hover:scale-105 ${preview.name === "ZEM" ? "object-contain p-[14%]" : preview.name === "Tekbot" ? "object-contain p-[18%]" : "object-cover"} ${preview.name === "ArbitraChain" ? "object-top" : ""} ${mobilePreview ? "max-md:ml-[3%] max-md:h-[96%] max-md:w-[94%] max-md:object-cover max-md:object-top" : ""}`}
                  />
                </picture>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.15fr_1fr_1.25fr_0.35fr] border-b border-white/20 pb-3 text-[10px] uppercase text-white/40 md:text-xs">
              <span><LocalizedText fr="Nom du projet" en="Project name" /></span>
              <span>Expertise</span>
              <span><LocalizedText fr="Membre" en="Team member" /></span>
              <span className="text-right"><LocalizedText fr="Année" en="Year" /></span>
            </div>
            {available.map((project, index) => (
              <button
                type="button"
                data-project-card
                key={project.href}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => window.setTimeout(() => navigateTo(project.href), 35)}
                className={`grid w-full grid-cols-[1.15fr_1fr_1.25fr_0.35fr] border-b border-white/20 py-5 text-left text-[11px] uppercase transition-all duration-300 hover:pl-2 md:text-sm ${active === index ? "text-white" : "text-white/60"}`}
              >
                <span>{project.name}</span>
                <span>{project.expertise}</span>
                <span>{project.team}</span>
                <span className="text-right">{project.year}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MoreProjects;
