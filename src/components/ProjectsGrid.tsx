import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { LocalizedText } from "./LanguageToggle";
import type { ProjectFilter } from "./Features";
import BrandingGalleryModal, { brandingImages } from "./BrandingGalleryModal";
// Le ruban traine tout le moteur WebGL. Charge a la demande, la page
// (en-tete, bascule, barre de chargement) s'affiche immediatement et le
// moteur arrive pendant que les visuels se telechargent en parallele.
const ProjectsRibbon = lazy(() => import("./ProjectsRibbon"));
import ProjectModal from "./ProjectModal";
import projectMedia from "../data/projectMedia";
import { PROJECT_COUNT } from "../data/projectCount";

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

export const projects: Project[] = [
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
  { name: "Dogs", year: "2026", desc: "Identité de marque illustrée", descEn: "Illustrated brand identity", href: "/dogs", image: "/optimized/dogs-card.webp", category: "brand" },
  { name: "Shella", year: "2026", desc: "App de couture sur mesure & paiement mobile", descEn: "Made-to-measure tailoring app & mobile payment", href: "/shella", image: "/shella/cover.webp", category: "uiux" },
  { name: "ArbitraChain", year: "2025", desc: "Plateforme d'arbitrage numérique", descEn: "Digital arbitration platform", href: "/arbitrachain", image: "/thumbs/arbitrachain.webp", category: "uiux" },
];

// Garde-fou : la navigation annonce "Projets [n]" depuis une constante, et
// c'est ce decalage qui avait laisse un "14" affiche pour 12 projets listes.
// Si les deux divergent a nouveau, on le voit en developpement.
if (import.meta.env.DEV && projects.length !== PROJECT_COUNT) {
  console.warn(
    `[projets] la navigation annonce ${PROJECT_COUNT} projets, la liste en contient ${projects.length}. ` +
      "Mettre a jour src/data/projectCount.ts.",
  );
}

const categoryLabels: Record<Exclude<ProjectFilter, "all">, { fr: string; en: string }> = {
  brand: { fr: "Brand Design", en: "Brand Design" },
  uiux: { fr: "UI/UX", en: "UI/UX" },
  website: { fr: "Site Web", en: "Website" },
};

type Card = {
  key: string;
  name: string;
  image: string;
  categoryLabel: { fr: string; en: string };
  onOpen: () => void;
  ratio: string;
};

// La galerie est rendue en WebGL par ProjectsRibbon : les cartes sont posees
// sur une meme surface en S -- proche a gauche, lointaine a droite -- et la
// molette fait defiler la bande horizontalement, en boucle infinie. Comme sur
// jesperlandberg.com, la page elle-meme ne defile pas.
const ProjectsGrid = ({ activeFilter = "all" }: { activeFilter?: ProjectFilter }) => {
  const rootRef = useRef<HTMLElement | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  // Le projet actuellement ouvert en modale, ou null.
  //
  // L'accueil n'ouvre plus de modale chez lui : il renvoie ici avec ?p=<nom>,
  // et la planche s'ouvre des l'arrivee. Un seul endroit sait donc afficher
  // un projet, et le lien reste partageable tel quel.
  const [active, setActive] = useState<Project | null>(() => {
    const wanted = new URLSearchParams(window.location.search).get("p");
    return (wanted && projects.find((project) => project.name === wanted)) || null;
  });

  // Fermer la planche doit aussi retirer le ?p= : sinon un rechargement, ou
  // un retour arriere, la rouvrirait alors qu'on vient de la fermer.
  const closeActive = () => {
    setActive(null);
    if (new URLSearchParams(window.location.search).has("p")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  // Un projet interne s'ouvre en modale par-dessus le ruban : le panneau se
  // deploie en largeur et porte son propre defilement, la bande dessous ne
  // bouge pas. Un lien externe part dans un onglet -- il n'y a rien a montrer.
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

  const visible = projects.filter((p) => activeFilter === "all" || p.category === activeFilter);

  // MEMOISE, et c'est essentiel : le ruban monte tout son GL dans un effet qui
  // depend de `cards`. Un tableau reconstruit a chaque rendu -- donc a chaque
  // ouverture ou fermeture de modale -- reliait cet effet, ce qui detruisait
  // (dispose) puis rechargeait TOUTES les textures : ~1s de thread bloque a
  // chaque fermeture. Seul le filtre change reellement la liste.
  const cards: Card[] = useMemo(() => {
    const list: Card[] = visible.map((project) => ({
      key: project.name,
      name: project.name,
      image: project.image,
      categoryLabel: categoryLabels[project.category as Exclude<ProjectFilter, "all">],
      onOpen: () => open(project),
      ratio: "",
    }));

    // L'archive reste accessible depuis la grille, en derniere vignette.
    if (activeFilter === "all") {
      list.push({
        key: "__archive",
        name: "Archive",
        image: "/ola/IMG_2356.webp",
        categoryLabel: { fr: `Affiches [${brandingImages.length}]`, en: `Posters [${brandingImages.length}]` },
        onOpen: () => setIsArchiveOpen(true),
        ratio: "",
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  // Le ruban ne peint une carte qu'une fois SA texture recue : sans cela les
  // images partaient a la file, decouvertes une par une par le moteur GL, et
  // la grille se remplissait lentement sous les yeux. On les demande ici des
  // le montage, en parallele du chargement du module WebGL, pour qu'elles
  // soient deja dans le cache HTTP quand le ruban les reclame.
  //
  // Plus de barre de chargement : on ne compte donc plus les arrivees, on
  // se contente de lancer les telechargements pour remplir le cache.
  useEffect(() => {
    const imgs = cards.map((card) => {
      const img = new Image();
      img.fetchPriority = "high";
      img.src = card.image;
      return img;
    });
    // Pas de cleanup qui remettrait src a "" : cela ANNULE le telechargement
    // en cours, le cache reste vide et le ruban n'a plus rien a peindre.
    // On laisse les requetes aller au bout, c'est tout leur interet ici.
    void imgs;
  }, [cards]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Plus de ScrollTrigger ici : la page ne defile pas (le ruban est en
    // fixed inset-0, la molette alimente le scroll virtuel). Le label monte
    // donc une fois, au montage.
    // Plus d'animation d'entree : le label est affiche directement.
    return;
  }, [activeFilter]);

  return (
    <section ref={rootRef} className="projects-grid font-mono text-white">
      {/* En bas : le haut du cadre est pris par l'en-tete, et le ruban occupe
          la bande centrale. */}
      <div className="pointer-events-none absolute bottom-6 left-0 z-10 overflow-hidden px-5 pb-[0.1em] md:px-8">
        <p className="projects-grid__label text-[12px] font-light md:text-[14px]">
          <LocalizedText fr="Projets sélectionnés" en="Selected projects" />
          <span className="ml-2">( {String(visible.length).padStart(2, "0")} )</span>
        </p>
      </div>


      <Suspense fallback={null}>
        <ProjectsRibbon
          cards={cards}
        />
      </Suspense>

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
        onClose={closeActive}
      />
    </section>
  );
};

export const heroStripImages = projects.map((p) => ({ name: p.name, image: p.image }));

export default ProjectsGrid;
