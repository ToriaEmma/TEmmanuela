import React, { useEffect, useState } from "react";
import BentoCard, { BentoTilt } from "./BentoCard";
import BrandingGalleryModal, { brandingImages } from "./BrandingGalleryModal";
import { LocalizedText } from "./LanguageToggle";
import { navigateTo } from "../utils/navigation";

const secureImages = Array.from({ length: 4 }, (_, index) => ({
  src: `/REVOLU/secure/${index + 1}.webp`,
  title: `Secure Tutor ${index + 1}`,
}));

const gummyImages = [
  "/REVOLU/GUMMY/0.83.webp",
  "/REVOLU/GUMMY/0.83 (2).webp",
  "/REVOLU/GUMMY/0.83 (3).webp",
  ...Array.from({ length: 6 }, (_, index) => `/REVOLU/Totaly/${index + 19}.webp`),
].map((src, index) => ({ src, title: `Gummy ${index + 1}` }));

const vennisImages = [
  ...Array.from({ length: 3 }, (_, index) => `/REVOLU/VENNIS/${index + 1}.webp`),
  ...Array.from({ length: 6 }, (_, index) => `/REVOLU/Totaly/${index + 13}.webp`),
].map((src, index) => ({ src, title: `Vennis Tenis Club ${index + 1}` }));

const siteSvgGroups = {
  meb: ["/site%20/meb1.svg", "/site%20/meb2.svg"].map((src, index) => ({ src, title: `MEB — écran ${index + 1}` })),
  zem: ["/site%20/zem1.svg", "/site%20/zem2.svg"].map((src, index) => ({ src, title: `ZEM — écran ${index + 1}` })),
};

const projectIndex: Array<{ name: string; expertise: string; team: string; year: string; href?: string; images?: { src: string; title: string }[] }> = [
  { name: "Vintage", expertise: "Marketplace & Brand Design", team: "Emmanuela", year: "2026", href: "/vintage" },
  { name: "Cats", expertise: "Brand Design", team: "Emmanuela", year: "2026", href: "/cats" },
  { name: "Score", expertise: "Site Web", team: "Emmanuela", year: "2026", href: "https://score-blond-six.vercel.app" },
  { name: "Secure Tutor", expertise: "Goodies & Brand Design", team: "Emmanuela", year: "2026", href: "/secure-tutor" },
  { name: "Gummy", expertise: "Brand Design", team: "Emmanuela", year: "2026", href: "/gummy" },
  { name: "Vennis Tenis Club", expertise: "Brand Design", team: "Emmanuela", year: "2026", href: "/vennis" },
  { name: "Rhode", expertise: "Direction artistique & digital", team: "Emmanuela", year: "2025", href: "/rhode" },
  { name: "MEB", expertise: "Site Web", team: "Emmanuela", year: "2026", href: "https://meb-beta.vercel.app" },
  { name: "Full Bridge", expertise: "Site Web", team: "Emmanuela", year: "2026", href: "https://fullbridgedigital.com" },
  { name: "Secure Tutor App", expertise: "UI/UX", team: "Emmanuela", year: "2026", href: "/secure-tutor-app" },
  { name: "ZEM", expertise: "Site Web", team: "Emmanuela", year: "2026", href: "https://zem2-0.vercel.app" },
  { name: "Tekbot", expertise: "UI/UX", team: "Emmanuela", year: "2025", href: "/tekbot" },
  { name: "Dogs", expertise: "Brand Design", team: "Emmanuela", year: "2026", href: "/dogs" },
  { name: "ArbitraChain", expertise: "UI/UX", team: "Emmanuela", year: "2025", href: "/arbitrachain" },
];

export type ProjectFilter = "all" | "brand" | "uiux" | "website";

const projectCategories: Record<string, ProjectFilter> = {
  Vintage: "brand", Cats: "brand", Dogs: "brand", Gummy: "brand", "Vennis Tenis Club": "brand", "Secure Tutor": "brand",
  ArbitraChain: "uiux", Tekbot: "uiux", "Secure Tutor App": "uiux",
  ZEM: "website", Score: "website", MEB: "website", "Full Bridge": "website",
};

const Features = ({ showAllSiteProjects = false, activeFilter = "all", showProjectsButton = !showAllSiteProjects, stopAfterVennis = false }: { showAllSiteProjects?: boolean; activeFilter?: ProjectFilter; showProjectsButton?: boolean; stopAfterVennis?: boolean }) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState(brandingImages);
  const [activePoster, setActivePoster] = useState<number | null>(null);
  const [projectView, setProjectView] = useState<"grid" | "index">("grid");
  const isVisible = (name: string) => activeFilter === "all" || projectCategories[name] === activeFilter;
  const displayOrder = ["Vintage", "Cats", "Score", "Dogs", "Gummy", "Vennis Tenis Club", "Full Bridge", "Secure Tutor", "Rhode", "MEB", "Tekbot", "Secure Tutor App", "ZEM", "ArbitraChain"];
  const cardSpan = (name: string, defaultSpan: string) => {
    if (activeFilter === "all") return defaultSpan;
    const visibleIndex = displayOrder.filter(isVisible).indexOf(name);
    return visibleIndex % 4 === 1 || visibleIndex % 4 === 2 ? "col-span-1 md:col-span-2" : "col-span-1";
  };

  const openGallery = (images: { src: string; title: string }[]) => {
    setGalleryImages(images);
    setIsGalleryOpen(true);
  };

  useEffect(() => {
    const openPostersGallery = () => openGallery(brandingImages);
    window.addEventListener("open-posters-gallery", openPostersGallery);
    return () => window.removeEventListener("open-posters-gallery", openPostersGallery);
  }, []);

  return (
    <section id="projects" className="theme-surface -mt-[3px] bg-black pb-16 pt-[3px]">
      <div className="w-full px-2 md:px-6">
        <div className="flex items-center justify-between px-6 py-5 font-mono text-[13px] uppercase tracking-[0.04em] text-[#c9c5ba] md:px-2 md:text-xs">
          <h2>// <LocalizedText fr="Mes travaux sélectionnés ©2026" en="Selected works ©2026" /></h2>
          <div aria-label="Affichage des projets">
            [
            <button
              type="button"
              onClick={() => setProjectView("grid")}
              className={projectView === "grid" ? "underline underline-offset-2" : ""}
            >
              <LocalizedText fr="Grille" en="Grid" />
            </button>
            ,&nbsp;
            <button
              type="button"
              onClick={() => setProjectView("index")}
              className={projectView === "index" ? "underline underline-offset-2" : ""}
            >
              Index
            </button>
            ]
          </div>
        </div>
        {projectView === "grid" ? (
        <div className="grid grid-cols-1 gap-5 px-6 md:grid-cols-3 md:gap-4 md:px-0">
          <BentoTilt className={`feature-card-frame ${cardSpan("Vintage", "col-span-1")} ${isVisible("Vintage") ? "" : "hidden"}`}>
            <BentoCard
              src="/optimized/vintage-card.webp"
              title="Vintage"
              onClick={() => {
                navigateTo("/vintage");
              }}
              previewImages={Array.from(
                { length: 23 },
                (_, index) => `/REVOLU/vintagefull/${index + 1}.webp`,
              )}
            />
          </BentoTilt>

          <BentoTilt className={`feature-card-frame ${cardSpan(showAllSiteProjects ? "Cats" : "Dogs", "col-span-1 md:col-span-2")} ${isVisible(showAllSiteProjects ? "Cats" : "Dogs") ? "" : "hidden"}`}>
            <BentoCard
              src={showAllSiteProjects ? "/optimized/cats-card.webp" : "/optimized/dogs-card.webp"}
              title={showAllSiteProjects ? "Cats" : "Dogs"}
              onClick={() => {
                navigateTo(showAllSiteProjects ? "/cats" : "/dogs");
              }}
              previewImages={showAllSiteProjects ? [
                ...Array.from(
                  { length: 4 },
                  (_, index) => `/REVOLU/CATS/${index + 1}.webp`,
                ),
                ...Array.from(
                  { length: 6 },
                  (_, index) => `/REVOLU/Totaly/${index + 7}.webp`,
                ),
              ] : [
                ...Array.from(
                  { length: 8 },
                  (_, index) => `/REVOLU/DOGS/${index + 1}.webp`,
                ),
                ...Array.from(
                  { length: 6 },
                  (_, index) => `/REVOLU/Totaly/${index + 1}.webp`,
                ),
              ]}
            />
          </BentoTilt>

          <BentoTilt className={`feature-card-frame ${cardSpan(showAllSiteProjects ? "Score" : "Cats", "col-span-1 md:col-span-2")} ${isVisible(showAllSiteProjects ? "Score" : "Cats") ? "" : "hidden"}`}>
            <BentoCard
              src={showAllSiteProjects ? "/site%20/score-preview.webp" : "/optimized/cats-card.webp"}
              mobileSrc={showAllSiteProjects ? "/site%20/tscore.webp" : undefined}
              title={showAllSiteProjects ? "Score" : "Cats"}
              hideTitle={showAllSiteProjects}
              onClick={() => {
                navigateTo(showAllSiteProjects ? "https://score-blond-six.vercel.app" : "/cats");
              }}
              previewImages={showAllSiteProjects ? undefined : [
                ...Array.from(
                  { length: 4 },
                  (_, index) => `/REVOLU/CATS/${index + 1}.webp`,
                ),
                ...Array.from(
                  { length: 6 },
                  (_, index) => `/REVOLU/Totaly/${index + 7}.webp`,
                ),
              ]}
            />
          </BentoTilt>

          {showAllSiteProjects && (
            <BentoTilt className={`feature-card-frame ${cardSpan("Dogs", "col-span-1")} ${isVisible("Dogs") ? "" : "hidden"}`}>
              <BentoCard src={activeFilter === "brand" ? "/optimized/dogs-card.webp" : "/REVOLU/DOGS/1.webp"} title="Dogs" forceBlackTitle={activeFilter === "all"} onClick={() => navigateTo("/dogs")} />
            </BentoTilt>
          )}

          {!showAllSiteProjects && (
            <BentoTilt className="feature-card-frame col-span-1">
              <BentoCard
                src="/REVOLU/secure/1.webp"
                title="Secure Tutor"
                onClick={() => {
                  navigateTo("/secure-tutor");
                }}
                previewImages={secureImages.map((image) => image.src)}
              />
            </BentoTilt>
          )}

          <BentoTilt className={`feature-card-frame ${cardSpan("Gummy", "col-span-1")} ${isVisible("Gummy") ? "" : "hidden"}`}>
            <BentoCard
              src="/REVOLU/GUMMY/0.83.webp"
              title="Gummy"
              onClick={() => {
                navigateTo("/gummy");
              }}
              previewImages={gummyImages.map((image) => image.src)}
            />
          </BentoTilt>

          <BentoTilt className={`feature-card-frame ${cardSpan("Vennis Tenis Club", "col-span-1 md:col-span-2")} ${isVisible("Vennis Tenis Club") ? "" : "hidden"}`}>
            <BentoCard
              src={showAllSiteProjects && activeFilter === "brand" ? "/REVOLU/VENNIS/2.webp" : "/optimized/vennis-card.webp"}
              title="Vennis Tenis Club"
              forceBlackTitle={showAllSiteProjects && activeFilter === "brand"}
              onClick={() => {
                navigateTo("/vennis");
              }}
              previewImages={vennisImages.map((image) => image.src)}
            />
          </BentoTilt>

          {showAllSiteProjects && !stopAfterVennis && (
            <>
              <BentoTilt className={`feature-card-frame ${cardSpan("Full Bridge", "col-span-1 md:col-span-2")} ${isVisible("Full Bridge") ? "" : "hidden"}`}>
                <BentoCard src="/site%20/full.webp" mobileSrc="/site%20/tfull.webp" imageClassName="object-top" backgroundClassName="bg-white" title="Full Bridge" hideTitle onClick={() => navigateTo("https://fullbridgedigital.com")} />
              </BentoTilt>
              <BentoTilt className={`feature-card-frame ${cardSpan("Secure Tutor", "col-span-1")} ${isVisible("Secure Tutor") ? "" : "hidden"}`}>
                <BentoCard
                  src="/REVOLU/secure/1.webp"
                  title="Secure Tutor"
                  onClick={() => {
                    navigateTo("/secure-tutor");
                  }}
                  previewImages={secureImages.map((image) => image.src)}
                />
              </BentoTilt>
            </>
          )}

          {!showAllSiteProjects && <BentoTilt className="feature-card-frame col-span-1 md:col-span-2"><BentoCard src={siteSvgGroups.meb[0].src} mobileSrc="/site%20/tmeb.webp" title="MEB" onClick={() => navigateTo("https://meb-beta.vercel.app")} /></BentoTilt>}
          {showAllSiteProjects && !stopAfterVennis && activeFilter === "all" && <BentoTilt className="feature-card-frame col-span-1"><BentoCard src="/site%20/rhode.webp" title="Rhode" onClick={() => navigateTo("/rhode")} /></BentoTilt>}
          {showAllSiteProjects && !stopAfterVennis && <BentoTilt className={`feature-card-frame ${cardSpan("MEB", "col-span-1 md:col-span-2")} ${isVisible("MEB") ? "" : "hidden"}`}><BentoCard src={siteSvgGroups.meb[0].src} mobileSrc="/site%20/tmeb.webp" title="MEB" onClick={() => navigateTo("https://meb-beta.vercel.app")} /></BentoTilt>}
          {showAllSiteProjects && !stopAfterVennis && <BentoTilt className={`feature-card-frame ${cardSpan("Secure Tutor App", "col-span-1 md:col-span-2")} ${activeFilter === "uiux" ? "order-2" : ""} ${isVisible("Secure Tutor App") ? "" : "hidden"}`}><BentoCard src="/REVOLU/big secure.webp" title="Secure Tutor App" onClick={() => navigateTo("/secure-tutor-app")} /></BentoTilt>}
          {showAllSiteProjects && !stopAfterVennis && <BentoTilt className={`feature-card-frame ${cardSpan("ZEM", "col-span-1")} ${isVisible("ZEM") ? "" : "hidden"}`}><BentoCard src="/site%20/Zem2.0.webp" imageClassName="!object-contain p-[14%]" backgroundClassName="bg-[#0D2F61]" title="ZEM" onClick={() => navigateTo("https://zem2-0.vercel.app")} /></BentoTilt>}
          {showAllSiteProjects && !stopAfterVennis && <BentoTilt className={`feature-card-frame ${cardSpan("Tekbot", "col-span-1")} ${activeFilter === "uiux" ? "order-1" : ""} ${isVisible("Tekbot") ? "" : "hidden"}`}><BentoCard src="/site%20/logo.webp" imageClassName="!object-contain p-[18%]" backgroundClassName="bg-[#0D2F61]" title="Tekbot" onClick={() => navigateTo("/tekbot")} /></BentoTilt>}
          {showAllSiteProjects && !stopAfterVennis && <BentoTilt className={`feature-card-frame ${cardSpan("ArbitraChain", "col-span-1 md:col-span-2")} ${activeFilter === "uiux" ? "order-3" : ""} ${isVisible("ArbitraChain") ? "" : "hidden"}`}><BentoCard src="/ArbitraChain/image_1.webp" imageClassName="object-top" title="ArbitraChain" onClick={() => navigateTo("/arbitrachain")} /></BentoTilt>}
        </div>
        ) : (
          <div className="overflow-x-auto px-5 pb-8 font-mono uppercase text-[#c9c5ba] md:px-2">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[1.25fr_0.9fr_1.25fr_0.45fr_0.75fr] border-b border-white/15 py-4 text-xs text-[#66645f] md:text-sm">
                <span><LocalizedText fr="Projet" en="Project" /></span>
                <span>Expertise</span>
                <span><LocalizedText fr="Membre" en="Team member" /></span>
                <span><LocalizedText fr="Année" en="Year" /></span>
                <span className="text-right">■</span>
              </div>
              {projectIndex.filter((project) => (!stopAfterVennis || ["Vintage", "Cats", "Score", "Dogs", "Gummy", "Vennis Tenis Club"].includes(project.name)) && (showAllSiteProjects || !["ZEM", "Rhode", "Full Bridge", "Secure Tutor App", "ArbitraChain", "Score", "Tekbot"].includes(project.name)) && isVisible(project.name)).map((project) => (
                <button
                  type="button"
                  key={project.name}
                  onClick={() => project.images ? openGallery(project.images) : project.href && window.setTimeout(() => navigateTo(project.href!), 35)}
                  className="grid w-full grid-cols-[1.25fr_0.9fr_1.25fr_0.45fr_0.75fr] border-b border-white/15 py-5 text-left text-sm transition-colors hover:text-white md:text-base"
                >
                  <span>{project.name}</span>
                  <span>{project.expertise}</span>
                  <span>{project.team}</span>
                  <span>{project.year}</span>
                  <span className="text-right"><LocalizedText fr="Voir plus[+]" en="View more[+]" /></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showProjectsButton && <div className="flex items-center border-b border-white/15 px-6 py-8 md:px-0 md:py-14">
          <button
            type="button"
            onClick={() => navigateTo("/projects")}
            className="rounded-md border border-white/70 px-3 py-2 font-circular-web text-[10px] uppercase text-white md:px-5 md:py-2.5 md:text-xs"
          >
            <LocalizedText fr="Voir tous mes projets" en="View all projects" />
          </button>
        </div>}

        <div id="posters" className="border-b border-white/15 px-6 py-14 md:hidden">
          <p className="mb-6 font-mono text-xs uppercase tracking-wide text-white/90">
            <LocalizedText fr="Affiches" en="Posters" /> [{String(brandingImages.length).padStart(2, "0")}]
          </p>

          <button
            type="button"
            data-project-card
            data-poster-card
            onClick={() => openGallery(brandingImages)}
            className="block aspect-[4/5] w-full overflow-hidden bg-[#171717]"
            aria-label="Ouvrir la galerie d’affiches"
          >
            <img loading="lazy" decoding="async"
              src={brandingImages[activePoster ?? 0].src}
              alt={brandingImages[activePoster ?? 0].title}
              className="size-full object-contain"
            />
          </button>

          <div className="mt-8 grid grid-cols-8 gap-1.5">
            {brandingImages.map((poster, index) => (
              <button
                type="button"
                data-project-card
                data-poster-card
                key={poster.src}
                onPointerEnter={() => setActivePoster(index)}
                onPointerDown={() => setActivePoster(index)}
                onClick={() => setActivePoster(index)}
                className={`aspect-[3/4] overflow-hidden transition-opacity ${activePoster === index || (activePoster === null && index === 0) ? "opacity-100" : "opacity-30"}`}
                aria-label={`Afficher ${poster.title}`}
              >
                <img src={poster.src} alt="" className="size-full object-cover object-top" loading="lazy" />
              </button>
            ))}
          </div>

          <button
            type="button"
            data-project-card
            onClick={() => openGallery(brandingImages)}
            className="mt-8 flex items-center gap-2 font-circular-web text-sm uppercase text-white"
          >
            <LocalizedText fr="Voir tout" en="View all" /> <span aria-hidden="true">→</span>
          </button>
        </div>

        <div
          className="relative hidden h-[55vh] min-h-[360px] items-center border-b border-white/15 md:flex md:h-[68vh]"
          onMouseLeave={() => setActivePoster(null)}
        >
          <p className="absolute left-0 z-10 text-[9px] uppercase tracking-wide text-white/75 md:text-xs">
            <LocalizedText fr="Affiches" en="Posters" /> [{String(brandingImages.length).padStart(2, "0")}]
          </p>

          <div className="absolute left-1/2 z-30 flex w-[40%] -translate-x-1/2 items-center justify-center gap-1 md:w-[46%] md:gap-1.5">
            {brandingImages.map((poster, index) => (
              <button
                type="button"
                data-project-card
                data-poster-card
                key={poster.src}
                onMouseEnter={() => setActivePoster(index)}
                onFocus={() => setActivePoster(index)}
                onBlur={() => setActivePoster(null)}
                onClick={() => setActivePoster(index)}
                className="aspect-[0.72] min-w-0 flex-1 overflow-hidden transition-transform duration-500 ease-out"
                style={activePoster === null ? undefined : {
                  transform: index < Math.ceil(brandingImages.length / 2)
                    ? "translateX(-17vw)"
                    : "translateX(17vw)",
                }}
                aria-label={`Agrandir ${poster.title}`}
              >
                <img
                  src={poster.src}
                  alt={poster.title}
                  className={`size-full object-cover ${
                    activePoster !== null && activePoster !== index ? "brightness-[0.25]" : ""
                  }`}
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {activePoster !== null && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[75%] max-h-[560px] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-black shadow-2xl">
              <img loading="lazy" decoding="async"
                src={brandingImages[activePoster].src}
                alt=""
                className="h-full w-auto max-w-none object-contain"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => openGallery(brandingImages)}
            className="absolute right-0 z-10 flex items-center gap-1 font-circular-web text-[9px] uppercase text-white/80 md:text-xs"
          >
            <LocalizedText fr="Voir tout" en="View all" /> <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {/* Branding Image Gallery Modal */}
      <BrandingGalleryModal 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)} 
        images={galleryImages}
      />
    </section>
  );
};

export default Features;
