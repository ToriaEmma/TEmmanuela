import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { LocalizedText } from "./LanguageToggle";
import type { ProjectFilter } from "./Features";
import BrandingGalleryModal, { brandingImages } from "./BrandingGalleryModal";
import ProjectModal from "./ProjectModal";
import projectMedia from "../data/projectMedia";

gsap.registerPlugin(ScrollTrigger);

type Project = {
  name: string;
  year: string;
  desc: string;
  descEn: string;
  href: string;
  image: string;
  category: ProjectFilter;
};

const projects: Project[] = [
  { name: "Vintage", year: "2026", desc: "Marketplace vintage & identité de marque", descEn: "Vintage marketplace & brand identity", href: "/vintage", image: "/REVOLU/big vintagd.webp", category: "brand" },
  { name: "Cats", year: "2026", desc: "Identité de marque illustrée", descEn: "Illustrated brand identity", href: "/cats", image: "/optimized/cats-card.webp", category: "brand" },
  { name: "Score", year: "2026", desc: "Site web événementiel", descEn: "Event website", href: "https://score-blond-six.vercel.app", image: "/site%20/score-preview.webp", category: "website" },
  { name: "Secure Tutor", year: "2026", desc: "Identité, goodies & textile", descEn: "Identity, merchandise & apparel", href: "/secure-tutor", image: "/REVOLU/big secure.webp", category: "brand" },
  { name: "Gummy", year: "2026", desc: "Univers de marque gourmand", descEn: "Playful candy brand world", href: "/gummy", image: "/newbig.webp", category: "brand" },
  { name: "Vennis Tenis Club", year: "2026", desc: "Identité de club sportif", descEn: "Sports club identity", href: "/vennis", image: "/REVOLU/big venis.webp", category: "brand" },
  { name: "MEB", year: "2026", desc: "Plateforme web complète", descEn: "Complete web platform", href: "https://meb-beta.vercel.app", image: "/works-modal/meb/2.webp", category: "website" },
  { name: "ZEM", year: "2026", desc: "Expérience digitale à fort contraste", descEn: "High-contrast digital experience", href: "https://zem2-0.vercel.app", image: "/works-modal/zem2.0/1.webp", category: "website" },
  { name: "Snaki", year: "2026", desc: "Bubble tea : identité & boutique en ligne", descEn: "Bubble tea: brand & online store", href: "https://snaki-theta.vercel.app", image: "/works-modal/snaki/2.webp", category: "website" },
  { name: "Tekbot", year: "2025", desc: "Plateforme d'apprentissage robotique", descEn: "Robotics learning platform", href: "/tekbot", image: "/thumbs/tekbot.webp", category: "uiux" },
  { name: "Shella", year: "2026", desc: "App de couture sur mesure & paiement mobile", descEn: "Made-to-measure tailoring app & mobile payment", href: "/shella", image: "/shella/cover.webp", category: "uiux" },
  { name: "Dogs", year: "2026", desc: "Identité de marque illustrée", descEn: "Illustrated brand identity", href: "/dogs", image: "/optimized/dogs-card.webp", category: "brand" },
  { name: "ArbitraChain", year: "2025", desc: "Plateforme d'arbitrage numérique", descEn: "Digital arbitration platform", href: "/arbitrachain", image: "/thumbs/arbitrachain.webp", category: "uiux" },
];

const ProjectsList = ({ activeFilter = "all" }: { activeFilter?: ProjectFilter }) => {
  const rootRef = useRef<HTMLElement | null>(null);
  // L'archive n'a plus de page dediee : la galerie s'ouvre par-dessus la liste.
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  // Le projet actuellement ouvert en modale, ou null.
  const [active, setActive] = useState<Project | null>(null);

  const visible = projects.filter((p) => activeFilter === "all" || p.category === activeFilter);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entree en cascade : chaque texte monte depuis son masque, et les
      // filets se deploient — memes valeurs que la reference.
      gsap.fromTo(
        ".projects-list__label",
        { yPercent: 118 },
        { yPercent: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: rootRef.current, start: "top 85%" } },
      );

      gsap.fromTo(
        ".projects-list__text",
        { yPercent: 110 },
        { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.03, scrollTrigger: { trigger: rootRef.current, start: "top 80%" } },
      );

      gsap.fromTo(
        ".projects-list__rule",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: "expo.inOut", stagger: 0.04, scrollTrigger: { trigger: rootRef.current, start: "top 85%" } },
      );
    }, rootRef);

    return () => ctx.revert();
  }, [activeFilter]);

  // Un projet s'ouvre en modale par-dessus la liste, comme sur la reference :
  // la page dessous ne bouge pas, le panneau se deploie en largeur et porte
  // son propre defilement. Ce qui decide n'est PAS la forme du lien mais le
  // fait d'avoir une planche a montrer : les sites livres ont une adresse
  // externe et des captures, et c'est le lien "Live Project" de la modale qui
  // mene au site. Sans planche, on part directement sur le lien.
  const open = (project: Project) => {
    if (projectMedia[project.name]) setActive(project);
    else if (project.href.startsWith("/")) window.location.href = project.href;
    else window.open(project.href, "_blank", "noopener,noreferrer");
  };

  return (
    <section ref={rootRef} className="projects-list bg-black pb-24 pt-16 font-mono text-white md:pb-32 md:pt-24">
      <div className="overflow-hidden px-3 pb-[0.1em] md:px-6">
        <p className="projects-list__label text-[12px] font-light md:text-[14px]">
          <LocalizedText fr="Projets sélectionnés" en="Selected projects" />
          <span className="ml-2">( {String(visible.length).padStart(2, "0")} )</span>
        </p>
      </div>

      <div className="mt-5">
        {visible.map((project) => (
          <div key={project.name}>
            <span className="projects-list__rule block h-px w-full origin-center bg-white/25" />

            <div className="projects-list__item relative">
              {/* Apercu ancre sur la ligne survolee : pose hors du bouton pour
                  pouvoir deborder sur les lignes voisines. */}
              <img
                src={project.image}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="projects-list__preview pointer-events-none absolute right-[14%] top-1/2 z-[60] hidden h-[230px] w-[320px] -translate-y-1/2 scale-95 object-cover opacity-0 transition-all duration-300 md:block rounded-[10px] border border-[#808080]"
              />

              <button
                type="button"
                onClick={() => open(project)}
                className="projects-list__row relative block h-[80px] w-full overflow-hidden text-left"
              >
                {/* Trois bandes de 80px empilees dans une fenetre de 80px : au
                    survol le wrapper glisse pour amener la bande inversee. */}
                <div className="projects-list__wrapper relative h-[240px] -translate-y-[160px] will-change-transform">
                  <div className="flex h-[80px] w-full items-center justify-between bg-white px-3 pb-[2px] pt-2 text-[#212121] md:px-6 md:pt-4">
                    <span className="overflow-hidden pb-[0.05em]">
                      <span className="projects-list__text block font-sans text-[1.75rem] font-extrabold uppercase leading-none md:text-[2.8vw]">
                        {project.name}
                      </span>
                    </span>
                    <span className="overflow-hidden pb-[0.05em]">
                      <span className="projects-list__text block font-sans text-[1.125rem] font-extrabold uppercase leading-none md:text-[1.75rem]">
                        {project.year}
                      </span>
                    </span>
                  </div>

                  <div className="flex h-[80px] w-full items-center justify-between bg-[#212121] px-3 pb-[2px] pt-2 text-white md:px-6 md:pt-4">
                    <span className="overflow-hidden pb-[0.05em]">
                      <span className="block text-[11px] uppercase md:text-[14px]">
                        <LocalizedText fr={project.desc} en={project.descEn} />
                      </span>
                    </span>
                    <span className="overflow-hidden pb-[0.05em]">
                      <span className="block text-[11px] uppercase md:text-[14px]">
                        <LocalizedText fr="Voir le projet" en="See project" />
                      </span>
                    </span>
                  </div>

                  <div className="flex h-[80px] w-full items-center justify-between bg-white px-3 pb-[2px] pt-2 text-[#212121] md:px-6 md:pt-4">
                    <span className="font-sans text-[1.75rem] font-extrabold uppercase leading-none md:text-[2.8vw]">{project.name}</span>
                    <span className="font-sans text-[1.125rem] font-extrabold uppercase leading-none md:text-[1.75rem]">{project.year}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        ))}
        {/* Archive : meme ligne que les projets, mais elle ouvre la galerie
            au lieu de naviguer. Visible seulement sans filtre actif. */}
        {activeFilter === "all" && (
          <div>
            <span className="projects-list__rule block h-px w-full origin-center bg-white/25" />

            <div className="projects-list__item relative">
              <img
                src="/ola/IMG_2356.webp"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="projects-list__preview pointer-events-none absolute right-[14%] top-1/2 z-[60] hidden h-[230px] w-[320px] -translate-y-1/2 scale-95 object-cover opacity-0 transition-all duration-300 md:block rounded-[10px] border border-[#808080]"
              />

              <button
                type="button"
                onClick={() => setIsArchiveOpen(true)}
                className="projects-list__row relative block h-[80px] w-full overflow-hidden text-left"
              >
                <div className="projects-list__wrapper relative h-[240px] -translate-y-[160px] will-change-transform">
                  <div className="flex h-[80px] w-full items-center justify-between bg-white px-3 pb-[2px] pt-2 text-[#212121] md:px-6 md:pt-4">
                    <span className="overflow-hidden pb-[0.05em]">
                      <span className="projects-list__text block font-sans text-[1.75rem] font-extrabold uppercase leading-none md:text-[2.8vw]">
                        Archive
                      </span>
                    </span>
                    <span className="overflow-hidden pb-[0.05em]">
                      <span className="projects-list__text block font-sans text-[1.125rem] font-extrabold uppercase leading-none md:text-[1.75rem]">
                        {brandingImages.length}
                      </span>
                    </span>
                  </div>

                  <div className="flex h-[80px] w-full items-center justify-between bg-[#212121] px-3 pb-[2px] pt-2 text-white md:px-6 md:pt-4">
                    <span className="overflow-hidden pb-[0.05em]">
                      <span className="block text-[11px] uppercase md:text-[14px]">
                        <LocalizedText fr="Affiches & recherches graphiques" en="Posters & graphic explorations" />
                      </span>
                    </span>
                    <span className="overflow-hidden pb-[0.05em]">
                      <span className="block text-[11px] uppercase md:text-[14px]">
                        <LocalizedText fr="Parcourir" en="Browse" />
                      </span>
                    </span>
                  </div>

                  <div className="flex h-[80px] w-full items-center justify-between bg-white px-3 pb-[2px] pt-2 text-[#212121] md:px-6 md:pt-4">
                    <span className="font-sans text-[1.75rem] font-extrabold uppercase leading-none md:text-[2.8vw]">Archive</span>
                    <span className="font-sans text-[1.125rem] font-extrabold uppercase leading-none md:text-[1.75rem]">{brandingImages.length}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        <span className="projects-list__rule block h-px w-full origin-center bg-white/25" />
      </div>

      <BrandingGalleryModal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} openFirst />

      <ProjectModal
        project={
          active && {
            name: active.name,
            year: active.year,
            desc: active.desc,
            descEn: active.descEn,
            image: active.image,
            href: active.href,
          }
        }
        onClose={() => setActive(null)}
      />
    </section>
  );
};

export default ProjectsList;
