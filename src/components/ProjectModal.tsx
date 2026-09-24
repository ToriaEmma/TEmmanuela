import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { createPortal } from "react-dom";
import { ScrollTrigger } from "gsap/all";
import LineReveal from "./LineReveal";
import { LocalizedText } from "./LanguageToggle";
import projectMedia from "../data/projectMedia";
import projectDescriptions from "../data/projectDescriptions";

gsap.registerPlugin(ScrollTrigger);

// La modale projet de la reference (lorisbukvic.graphics) : un panneau qui
// s'ouvre en BALAYAGE -- sa largeur passe de 0 a 75vw -- par-dessus la liste,
// avec son propre defilement interieur. La page dessous ne bouge pas.
//
// Le detail qui compte : le panneau ayant son propre conteneur de scroll, tous
// les ScrollTrigger a l'interieur doivent viser CE conteneur et non la
// fenetre, sinon rien ne se declenche jamais.

// Les sites livres : pas de visuel d'ouverture separe, leurs captures se
// suffisent. Titre, description, puis les captures s'enchainent.
const WEB_PROJECTS = new Set(["Score", "MEB", "ZEM", "ArbitraChain", "Shella", "Tekbot", "Snaki"]);

export type ModalProject = {
  name: string;
  year: string;
  desc: string;
  descEn: string;
  image: string;
  categoryLabel?: { fr: string; en: string };
  images?: string[];
  href?: string;
};

type Props = {
  project: ModalProject | null;
  onClose: () => void;
};

const ProjectModal = ({ project, onClose }: Props) => {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const open = !!project;
  const media = project ? projectMedia[project.name] : undefined;

  // La planche, telle qu'elle est declaree. La couverture n'y est PAS
  // reinjectee : elle est deja affichee en haut du panneau comme visuel
  // d'ouverture, et l'ajouter ici la montrait deux fois de suite.
  // Les sites livres n'ont pas de visuel d'ouverture separe : leur couverture
  // rejoint la planche en PREMIERE capture, pour que titre, description et
  // captures s'enchainent sans repetition. Ailleurs la planche est prise
  // telle qu'elle est declaree.
  const blocks = (() => {
    const declared = media?.blocks ?? [];
    if (!media || !project || !WEB_PROJECTS.has(project.name) || media.skipCover) return declared;

    const cover = project.image;
    const decoded = decodeURIComponent(cover);
    const already = declared.some((b) =>
      b.images.some((src) => decodeURIComponent(src) === decoded),
    );
    if (already) return declared;

    return [{ grid: 1, mobileGrid: 1, images: [cover] }, ...declared];
  })();

  // Un site est "live" quand son lien sort du site : les projets UI/UX
  // pointent vers une page interne, qui n'est pas une mise en ligne a visiter.
  const isLive = Boolean(project && /^https?:\/\//.test(project.href));

  const [progress, setProgress] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  // La reference bascule ses grilles sous 724px, pas au breakpoint Tailwind.
  const [narrow, setNarrow] = useState(() => window.innerWidth < 724);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 724);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // La jauge : un seul declencheur sur tout le contenu, qui reporte sa
  // progression. Cree apres un temps mort et un rAF -- les images sont en
  // lazy et la hauteur du contenu n'est pas encore connue au montage.
  useEffect(() => {
    if (!open) return;
    setProgress(0);
    setAtEnd(false);

    let trigger: ScrollTrigger | null = null;
    const timer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        const scroller = scrollRef.current;
        const content = contentRef.current;
        if (!scroller || !content) return;
        ScrollTrigger.refresh();
        trigger = ScrollTrigger.create({
          trigger: content,
          scroller,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            setProgress(100 * self.progress);
            // La barre d'actions prend le relais de la jauge tout en bas.
            setAtEnd(self.progress > 0.985);
          },
        });
      });
    }, 100);

    return () => {
      window.clearTimeout(timer);
      trigger?.kill();
    };
  }, [open, project?.name]);

  // L'ouverture : le fond apparait vite, puis le panneau se deploie en
  // largeur. Le bouton de fermeture n'apparait qu'une fois le balayage fini --
  // il n'aurait rien a fermer avant.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const close = closeRef.current;
    if (!panel || !backdrop || !close) return;

    const wide = window.innerWidth >= 1024;

    if (open) {
      // Plus d'animation d'ouverture : le panneau, le fond et le bouton de
      // fermeture sont poses directement a leur etat final.
      gsap.set(backdrop, { opacity: 1 });
      gsap.set(panel, { width: wide ? "75vw" : "100vw", opacity: 1 });
      gsap.set(close, { opacity: 1 });
      // Le contenu est a sa largeur definitive : les lignes doivent etre
      // remesurees, comme le faisait la fin de l'animation.
      ScrollTrigger.refresh();
    }
  }, [open]);

  // Les images sont affichees directement : plus de fondu a l'entree ni de
  // ScrollTrigger par image.
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const images = Array.from(panel.querySelectorAll<HTMLElement>(".modal-image"));
    if (images.length) gsap.set(images, { opacity: 1 });
  }, [open, project?.name]);

  // Fermeture immediate, sans animation de rembobinage.
  const handleClose = () => onClose();

  // Echap ferme, et le fond de page ne defile plus tant que la modale est la.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Gele la bande derriere : la molette doit defiler dans le panneau, et la
    // camera du ruban rester ou elle est.
    document.documentElement.dataset.ribbonFrozen = "1";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      delete document.documentElement.dataset.ribbonFrozen;
      // La bande a ignore les remesures pendant tout le gel (voir
      // ProjectsRibbon) : elle porte encore la largeur d'avant l'ouverture.
      // On la reveille une fois, maintenant que la scrollbar est revenue.
      window.dispatchEvent(new Event("resize"));
      // Les declencheurs vises sur le conteneur de la modale n'ont plus de
      // conteneur : sans ce menage ils restent et faussent les mesures.
      ScrollTrigger.getAll()
        .filter((t) => t.vars.scroller === scrollRef.current)
        .forEach((t) => t.kill());
    };
  }, [open]);

  if (!project) return null;

  // Le panneau est ancre a DROITE, pas centre : sa largeur est ce qui s'anime,
  // donc un panneau centre s'ouvrirait des deux cotes a la fois et son contenu
  // glisserait pendant toute l'ouverture. Colle a droite, le bord droit ne
  // bouge jamais et seul le bord gauche avance.
  return createPortal(
    /* La reference centre son panneau verticalement (items-center) et le colle
       a droite sur grand ecran ; en dessous il monte du bas (items-end). */
    <div role="dialog" aria-modal="true" aria-label={project.name} className="project-viewer fixed inset-0 z-[230] flex items-end justify-center lg:items-center lg:justify-end lg:pr-[10px]">
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[5px]"
        aria-hidden="true"
      />

      <button
        ref={closeRef}
        type="button"
        onClick={handleClose}
        aria-label="Fermer"
        /* A GAUCHE du panneau, comme sur la reference : il sort du panneau,
           dans la marge ou la liste reste visible, donc il ne recouvre jamais
           le contenu du projet. */
        /* Les positions de la reference : dans le panneau en haut a droite sur
           mobile, puis A CHEVAL sur le bord gauche (left:-25px = la moitie de
           ses 50px) une fois le panneau detache du bord de l'ecran. */
        /* La reference le pose a cheval sur le bord gauche du panneau. Ce bord
           etant a 75vw du bord droit (+10px de marge), on l'ancre par la
           DROITE a cette distance moins sa demi-largeur -- l'ancrer a gauche
           le sortirait de l'ecran, le conteneur faisant toute la largeur. */
        /* Le cercle est inchange ; seule la croix s'adapte a ce qui defile
           dessous (voir .modal-close dans index.css). */
        className="modal-close absolute right-[10px] top-[30px] z-[210] flex size-[50px] items-center justify-center rounded-full text-xl transition-[filter] duration-300 hover:brightness-200 sm:right-[30px] sm:top-[calc(10dvh-25px)] lg:right-[calc(75vw-15px)] lg:top-[calc(1dvh+100px)]"
      >
        {/* Le disque, dans sa propre couche : c'est lui qui porte le fond, la
            bordure et le flou. Les porter sur le bouton isolerait le blend de
            la croix, qui ne verrait plus que le disque. */}
        <span aria-hidden="true" className="modal-close__disc" />
        <span aria-hidden="true" className="modal-close__x">✕</span>
      </button>

      {/* Le panneau : c'est sa LARGEUR qui est animee, d'ou le overflow-hidden
          -- le contenu garde sa taille et se decouvre par la droite. */}
      <div
        ref={panelRef}
        /* Un rectangle detache : une marge egale en haut, en bas et a droite,
           donc la page reste visible tout autour. La hauteur est calculee
           plutot que posee en dvh -- elle doit tomber pile entre les deux
           marges, sinon le cadre deborde et semble glisser. */
        /* Les hauteurs de la reference, relevees sur son DOM : plein ecran sur
           mobile, 90dvh des le petit palier, 98dvh sur grand ecran -- et les
           coins seulement en haut tant que le panneau touche le bas. */
        className="project-viewer-panel relative h-[100dvh] overflow-hidden bg-black sm:h-[90dvh] sm:rounded-t-[19px] lg:h-[98dvh] lg:rounded-[19px]"
        style={{ width: 0 }}
      >
        {/* La nappe d'eau : posee dans le panneau, sous le contenu (z-5) et
            sans pointer-events, donc elle passe sur le fond noir sans rien
            intercepter ni recouvrir les images. */}
        <div aria-hidden="true" className="modal-water" />

        {/* Ancre a DROITE dans le panneau : comme c'est la largeur du panneau
            qui s'anime, un contenu ancre a gauche serait pousse vers la droite
            pendant toute l'ouverture. Ancre a droite, il est des le depart a sa
            place finale et le panneau ne fait que le decouvrir. */}
        <div
          ref={scrollRef}
          data-modal-scroll
          className="absolute right-0 top-0 h-full w-[100vw] overflow-y-auto overscroll-contain sm:w-[100vw] lg:w-[75vw]"
        >
          {/* Assez de marge pour que la derniere image ne passe pas sous la
              barre flottante, pas plus : elle ne pousse rien. */}
          <div ref={contentRef} className="w-full pb-[150px]">
            {/* Le hero des pages projet dediees (voir ProjectShowcase) :
                le titre en grand a GAUCHE avec sa ligne de categories, le
                carre temoin a droite -- puis l'image pleine largeur posee sur
                blanc. Plus de titre centre par-dessus l'image. */}
            <section className="px-5 pb-10 pt-16 md:px-8 md:pt-24">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="modal-title work-title text-5xl font-semibold tracking-[-0.06em] md:text-7xl">
                    {project.name}
                  </h1>
                  <p className="modal-meta mt-4 font-mono text-xs uppercase tracking-[0.08em] md:text-sm">
                    &gt; {media?.categories.map((c) => c.label).join(" · ")} · {project.year}
                  </p>
                </div>
                <span className="mb-2 size-2 bg-[#d9d6cc]" />
              </div>
            </section>

            {/* Le visuel d'ouverture pleine largeur n'a de sens que pour les
                projets d'identite, ou la couverture est une image composee.
                Pour les sites livres, elle repete simplement la premiere
                capture : le titre, la description et les captures s'enchainent
                alors directement. */}
            {!WEB_PROJECTS.has(project.name) && (
              <section className="w-full overflow-hidden bg-white">
                <img
                  loading="lazy"
                  decoding="async"
                  src={project.image}
                  alt={project.name}
                  className="block h-auto w-full"
                />
              </section>
            )}

            {/* Le bloc de description des pages projet dediees, repris a
                l'identique (voir VintageProject) : l'intertitre en petites
                capitales sourdes (#66645f), le texte en text-sm
                leading-relaxed sur #c9c5ba, un filet, puis Role / Expertise /
                Annee. Seule la disposition change : en colonne laterale sur
                les pages dediees, en pleine largeur ici -- la modale n'a pas
                la largeur pour porter une colonne en plus des visuels. */}
            <div className="mx-auto w-full max-w-[760px] px-6 pb-[70px] pt-[48px] text-[#c9c5ba]">
              <div className="border-b border-white/15 pb-6">
                <p className="mb-3 font-mono text-xs uppercase text-[#66645f]">
                  <LocalizedText fr="Brief du projet" en="Project brief" />
                </p>
                <LineReveal
                  className="text-sm leading-relaxed text-[#c9c5ba]"
                  scroller="[data-modal-scroll]"
                >
                  {projectDescriptions[project.name] ?? project.desc}
                </LineReveal>
              </div>

              <dl className="mt-7 grid grid-cols-2 gap-6 text-sm md:grid-cols-3">
                <div>
                  <dt className="font-mono text-xs uppercase text-[#66645f]">
                    <LocalizedText fr="Rôle" en="Role" />
                  </dt>
                  <dd className="mt-1">
                    <LocalizedText fr="Direction artistique" en="Art direction" />
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase text-[#66645f]">Expertise</dt>
                  <dd className="mt-1">{media?.categories.map((c) => c.label).join(", ")}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs uppercase text-[#66645f]">
                    <LocalizedText fr="Année" en="Year" />
                  </dt>
                  <dd className="mt-1">{project.year}</dd>
                </div>
              </dl>

              {/* "Live Project" : pas un bouton plein, mais quatre equerres qui
                  dessinent un cadre ouvert autour du label -- les coins sont des
                  bords partiels (2px, #FBFBFB80) arrondis a 14px chacun de son
                  cote. Au survol la reference ecarte le padding horizontal, donc
                  les equerres s'ecartent du texte sans que rien ne bouge autour. */}
              {isLive && (
                <div className="mt-12 flex w-full justify-center">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-block px-6 py-4 text-white transition-all duration-150 hover:px-8"
                  >
                    <span className="absolute left-0 top-0 h-4 w-4 rounded-tl-[14px] border-l-2 border-t-2 border-[#FBFBFB80]" />
                    <span className="absolute right-0 top-0 h-4 w-4 rounded-tr-[14px] border-r-2 border-t-2 border-[#FBFBFB80]" />
                    <span className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-[14px] border-b-2 border-l-2 border-[#FBFBFB80]" />
                    <span className="absolute bottom-0 right-0 h-4 w-4 rounded-br-[14px] border-b-2 border-r-2 border-[#FBFBFB80]" />
                    <span className="text-[14px] leading-[21px] text-[#F3F3F3]">Live Project</span>
                  </a>
                </div>
              )}
            </div>

            {/* Les sections reprennent le design des pages projet dediees
                (voir ProjectShowcase) : un intertitre en petites capitales
                sourdes a GAUCHE sur 220px, son texte a droite, puis la grille
                de visuels -- chacun pose sur un fond blanc arrondi, avec le
                meme gap-3 et le meme space-y-20 entre sections. */}
            {blocks.length > 0 && (
              <div className="px-5 pb-20 md:px-8">
                <div className="space-y-20">
                  {blocks.map((block, i) => (
                    <section key={i}>
                      {/* L'intertitre est porte par le bloc (`title`/`titleEn`).
                          Un bloc sans titre n'affiche rien : certains projets
                          n'ont qu'une suite de captures, ou un libelle
                          "Concept & identite" n'aurait aucun sens. */}
                      {block.title && (
                        <div className="mb-8 grid gap-6 md:grid-cols-[220px_1fr]">
                          <p className="font-mono text-xs uppercase text-[#66645f]">
                            <LocalizedText fr={block.title} en={block.titleEn ?? block.title} />
                          </p>
                        </div>
                      )}
                      <div
                        className={`project-image-group grid w-full gap-3 ${block.presentation ? `project-image-group--${block.presentation}` : block.grid > 1 ? "project-image-group--paired" : ""}`}
                        style={{
                          gridTemplateColumns: `repeat(${narrow ? block.mobileGrid : block.grid}, 1fr)`,
                        }}
                      >
                        {block.images.map((src, imageIndex) => (
                          <div
                            key={`${src}-${imageIndex}`}
                            className={`modal-image project-image-frame overflow-hidden rounded-lg bg-white ${block.logoVariants ? "project-logo-variant" : ""}`}
                            style={{ ...(block.outlined ? { border: "1px solid white" } : {}), ...(block.logoVariants ? { backgroundColor: ["#f6f5f1", "#000", "#fff"][imageIndex], ...(imageIndex === 1 ? { border: "1px solid white" } : {}) } : {}) }}
                          >
                            <img
                              src={src}
                              alt={block.logoVariants ? `${project.name} — logo ${["original", "blanc", "noir"][imageIndex]}` : `${project.name} — visuel ${imageIndex + 1}`}
                              loading="lazy"
                              decoding="async"
                              className="block h-auto w-full"
                              onLoad={() => ScrollTrigger.refresh()}
                              style={block.logoVariants ? { filter: ["none", "brightness(0) invert(1)", "brightness(0)"][imageIndex] } : undefined}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Jauge et barre d'actions occupent le MEME emplacement et se
            relaient : la jauge pendant la lecture, la barre une fois le bas
            atteint. Les deux flottent au-dessus du contenu, donc la planche
            garde sa fin nette.

            La barre reprend le vocabulaire de la reference plutot que des
            pastilles colorees : un seul contenant translucide a liseré fin,
            comme les pastilles de categorie du hero. */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-[10] flex h-[82px] w-[170px] -translate-x-1/2 items-center justify-center">
          {/* La jauge se RETRACTE en meme temps qu'elle s'efface, pour que le
              passage aux actions se lise comme une seule forme qui change. */}
          <div
            className="flex h-[44px] items-center justify-center transition-[opacity,transform] duration-300 ease-out"
            style={{ opacity: atEnd ? 0 : 1, transform: `scaleX(${atEnd ? 0.3 : 1})` }}
          >
            <div className="project-progress-capsule">
            <div className="relative h-[4px] w-[94px] overflow-hidden rounded-full bg-[#343434]">
              <div
                className="absolute h-full w-[30px] rounded-full bg-[#858585]"
                style={{ left: `${64 * progress / 100}px` }}
              />
            </div>
            </div>
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-out"
            style={{
              opacity: atEnd ? 1 : 0,
              transform: `scaleX(${atEnd ? 1 : 0.6})`,
              pointerEvents: atEnd ? "auto" : "none",
            }}
          >
            {/* Deux touches carrees arrondies dans un meme boitier sombre,
                comme sur la reference : le retour reste discret, le partage
                est la touche pleine et claire -- c'est lui l'action mise en
                avant, pas une pastille coloree de plus. */}
            <div className="project-actions">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Retour"
                className="flex size-[52px] items-center justify-center rounded-[14px] bg-[#2A2A2A] text-white transition-colors hover:bg-[#333]"
              >
                {/* La fleche courbee de la reference, pas une fleche droite. */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 14L4 9l5-5" />
                  <path d="M4 9h10a6 6 0 0 1 6 6v4" />
                </svg>
              </button>

              <a
                href="/contact"
                aria-label="Discuter d’un projet"
                title="Discuter d’un projet"
                className="flex size-[52px] items-center justify-center rounded-[14px] bg-[#E8E8E8] text-black transition-opacity hover:opacity-85"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 3 3 10l8 3 3 8 7-18ZM11 13 21 3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectModal;
