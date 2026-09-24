// Le corps des modales projet : les blocs d'images et les categories.
//
// Structure reprise de la reference : chaque bloc dit sur combien de COLONNES
// ses images se posent (`grid`), combien en mobile (`mobileGrid`), et son
// rayon. Le rendu n'a plus qu'a poser un
// `gridTemplateColumns: repeat(n, 1fr)`. C'est ce qui donne l'alternance
// pleine largeur / cote a cote des planches.

export type ImageBlock = {
  presentation?: "logos" | "natural";
  logoVariants?: boolean;
  grid: number;
  mobileGrid: number;
  images: string[];
  round?: number;
  /** Cerne les cadres du bloc d'un filet blanc, pour des captures dont le
   *  bord se confond avec le fond sombre du cadre. */
  outlined?: boolean;
  /** Comme `outlined`, mais seulement a partir de cet index : un bloc peut
   *  ainsi reunir des captures claires et sombres sans etre coupe en deux
   *  (une coupure vaudrait space-y-20 entre elles au lieu du gap-3 habituel). */
  outlinedFrom?: number;
  /** Intertitre optionnel, pose au-dessus du bloc. */
  title?: string;
  titleEn?: string;
  subtitle?: string;
};

// L'icone est un nom, pas un fichier : les glyphes sont traces en SVG inline
// dans la pastille, donc ils suivent la couleur du texte sans requete.
export type CategoryIcon = "brand" | "uiux" | "web";

export type ProjectCategory = { icon: CategoryIcon; label: string };

export type ProjectMedia = {
  categories: ProjectCategory[];
  blocks: ImageBlock[];
  /** Empeche la couverture d'etre ajoutee en tete de planche (projets web).
   *  Utile quand elle fait doublon avec un visuel deja present. */
  skipCover?: boolean;
};

const range = (n: number, start: number, path: (i: number) => string) =>
  Array.from({ length: n }, (_, i) => path(i + start));

const ICON = {
  brand: "brand" as const,
  uiux: "uiux" as const,
  web: "web" as const,
};

// Chaque projet reprend les images que sa page dediee utilise deja : la
// modale raconte la meme chose, en plus ramasse.
export const projectMedia: Record<string, ProjectMedia> = {
  Vintage: {
    categories: [{ icon: ICON.brand, label: "Brand Design" }],
    blocks: [
      { presentation: "logos", title: "Concept & identité", titleEn: "Concept & identity", logoVariants: true, grid: 3, mobileGrid: 1, images: Array(3).fill("/REVOLU/vintage-logo-transparent.webp") },
      // Les visuels se separent en trois familles : les pieces portees, les
      // goodies, puis les supports imprimes. Trois intertitres valent mieux
      // qu'un seul bloc ou les tee-shirts se perdent entre les tote bags.
      { presentation: "logos", title: "Vêtements", titleEn: "Apparel", grid: 3, mobileGrid: 1, images: ["/REVOLU/vintagefull/1.webp", "/REVOLU/vintagefull/2.webp", "/REVOLU/vintagefull/5.webp", "/REVOLU/vintagefull/6.webp", "/REVOLU/vintagefull/7.webp", "/REVOLU/vintagefull/8.webp", "/REVOLU/vintagefull/9.webp", "/REVOLU/vintagefull/10.webp", "/REVOLU/vintagefull/11.webp", "/REVOLU/vintagefull/18.webp", "/REVOLU/vintagefull/19.webp", "/REVOLU/vintagefull/21.webp", "/REVOLU/vintagefull/22.webp"] },
      { presentation: "logos", title: "Goodies", titleEn: "Goodies", grid: 3, mobileGrid: 1, images: ["/REVOLU/vintagefull/13.webp", "/REVOLU/vintagefull/15.webp", "/REVOLU/vintagefull/16.webp", "/REVOLU/vintagefull/17.webp", "/REVOLU/vintagefull/23.webp"] },
      { presentation: "logos", title: "Supports", titleEn: "Assets", grid: 3, mobileGrid: 1, images: ["/REVOLU/vintagefull/3.webp", "/REVOLU/vintagefull/4.webp", "/REVOLU/vintagefull/12.webp", "/REVOLU/vintagefull/14.webp", "/REVOLU/vintagefull/20.webp"] },
    ],
  },

  Cats: {
    categories: [{ icon: ICON.brand, label: "Brand Design" }],
    blocks: [
      { presentation: "logos", title: "Concept & identité", titleEn: "Concept & identity", grid: 3, mobileGrid: 1, images: [2, 3, 4].map((i) => `/REVOLU/CATS/${i}.webp`) },
      { title: "Déclinaisons & supports", titleEn: "Applications & assets", grid: 1, mobileGrid: 1, images: ["/REVOLU/Totaly/9.webp", "/REVOLU/Totaly/10.webp", "/REVOLU/Totaly/11.webp", "/REVOLU/CATS/5.webp", "/REVOLU/Totaly/12.webp"] },
    ],
  },

  Dogs: {
    categories: [{ icon: ICON.brand, label: "Brand Design" }],
    blocks: [
      { presentation: "logos", title: "Concept & identité", titleEn: "Concept & identity", grid: 3, mobileGrid: 1, images: [1, 2, 3].map((i) => `/REVOLU/DOGS/${i}.webp`) },
      { title: "Déclinaisons & supports", titleEn: "Applications & assets", grid: 1, mobileGrid: 1, images: range(6, 1, (i) => `/REVOLU/Totaly/${i}.webp`) },
    ],
  },

  Gummy: {
    categories: [{ icon: ICON.brand, label: "Brand Design" }],
    blocks: [
      {
        presentation: "logos",
        title: "Concept & identité",
        titleEn: "Concept & identity",
        grid: 3,
        mobileGrid: 1,
        images: ["/REVOLU/GUMMY/0.83.webp", "/REVOLU/GUMMY/0.83 (2).webp", "/REVOLU/GUMMY/0.83 (3).webp"],
      },
      { title: "Déclinaisons & supports", titleEn: "Applications & assets", grid: 1, mobileGrid: 1, images: range(5, 19, (i) => `/REVOLU/Totaly/${i}.webp`) },
    ],
  },

  "Vennis Tenis Club": {
    categories: [{ icon: ICON.brand, label: "Brand Design" }],
    blocks: [
      { presentation: "logos", title: "Concept & identité", titleEn: "Concept & identity", grid: 3, mobileGrid: 1, images: range(3, 1, (i) => `/REVOLU/VENNIS/${i}.webp`) },
      { title: "Déclinaisons & supports", titleEn: "Applications & assets", grid: 1, mobileGrid: 1, images: ["13", "14", "15", "17", "18"].map((n) => `/REVOLU/Totaly/${n}.webp`) },
    ],
  },

  "Secure Tutor": {
    categories: [{ icon: ICON.brand, label: "Brand Design" }],
    blocks: [
      { presentation: "logos", title: "Concept & identité", titleEn: "Concept & identity", grid: 3, mobileGrid: 1, images: [1, 2, 3].map((i) => `/REVOLU/secure/${i}.webp`) },
      // Ce bloc montre les declinaisons, pas des logos : l'etiqueter "logos"
      // renvoyait la couverture tout en bas de la planche.
      { title: "Déclinaisons & supports", titleEn: "Applications & assets", grid: 3, mobileGrid: 1, images: [1, 2, 3, 4, 5, 7].map((i) => `/SITEE_optimized/frame_${i}.webp`) },
    ],
  },

  Tekbot: {
    categories: [{ icon: ICON.uiux, label: "UI/UX" }],
    // La vignette de la carte est un recadrage de la 1re capture : la
    // remettre en tete de planche montrerait deux fois la meme image.
    skipCover: true,
    blocks: [
      { presentation: "natural", round: 0, grid: 1, mobileGrid: 1, images: ["/Tekbot/Accueil.webp", "/Tekbot/Dashboard.webp", "/Tekbot/Modules_inter.webp", "/Tekbot/mod1_exo1_step1-1.webp", "/Tekbot/mod1_exo1_step1_valided-2.webp"] },
    ],
  },

  ArbitraChain: {
    categories: [{ icon: ICON.uiux, label: "UI/UX" }],
    // La vignette de la carte est un recadrage de la 1re capture : la
    // remettre en tete de planche montrerait deux fois la meme image.
    skipCover: true,
    blocks: [
      { presentation: "natural", round: 0, grid: 1, mobileGrid: 1, images: range(8, 1, (i) => `/ArbitraChain/image_${i}.webp`) },
    ],
  },

  Shella: {
    categories: [{ icon: ICON.uiux, label: "UI/UX" }],
    // La couverture est une planche des trois memes ecrans : elle ferait
    // doublon juste apres la description, ou la planche reprend deja.
    skipCover: true,
    blocks: [
      // Les 14 ecrans dans UN SEUL bloc : la grille les repartit d'elle-meme
      // par rangees de trois. Les couper en cinq blocs inserait le
      // space-y-20 des sections toutes les trois images -- un grand vide
      // tous les trois ecrans en mobile, ou mobileGrid vaut 1.
      { grid: 3, mobileGrid: 1, images: Array.from({ length: 14 }, (_, i) => `/shella/${i + 1}.webp`) },
    ],
  },
  "Secure Tutor App": {
    categories: [{ icon: ICON.uiux, label: "UI/UX" }],
    blocks: [
      {
        grid: 2,
        mobileGrid: 1,
        images: [
          "/securtutorapp/Bienvenue-1.webp",
          "/securtutorapp/Page d'acceuil.webp",
          "/securtutorapp/choix.webp",
          "/securtutorapp/enfant.webp",
        ].map((s) => s.replace(/ /g, "%20")),
      },
      {
        grid: 1,
        mobileGrid: 1,
        images: ["/securtutorapp/Reaction.webp", "/securtutorapp/Reaction-1.webp"],
      },
    ],
  },

  // Les trois sites livres : leurs captures sont des pages entieres, donc
  // elles se posent sur une seule colonne -- cote a cote elles seraient
  // illisibles. Le lien "Live Project" de la modale pointe vers la mise en
  // ligne, porte par le `href` que la liste declare deja.
  Score: {
    categories: [{ icon: ICON.web, label: "Site Web" }],
    blocks: [
      // La 4e capture passe en 3e : l'ordre du dossier n'est pas celui de
      // lecture du site. Les deux dernieres sont cernees d'un filet blanc --
      // leur bord sombre se perdrait sinon dans le fond du cadre.
      //
      // UN SEUL bloc : en deux blocs, les captures etaient separees par le
      // space-y-20 des sections au lieu du gap-3 des images, ce qui creusait
      // un trou visible -- surtout en mobile. outlinedFrom laisse le filet
      // aux deux dernieres sans couper la suite.
      { grid: 1, mobileGrid: 1, outlinedFrom: 1, images: [2, 4, 3].map((i) => `/works-modal/score/${i}.webp`) },
    ],
  },

  // Snaki : un site livre de plus. Comme les autres, ses captures sont des
  // pages entieres -- une seule colonne, sinon elles seraient illisibles.
  Snaki: {
    categories: [{ icon: ICON.web, label: "Site Web" }],
    // La couverture est deja la premiere capture : l'ajouter en tete la
    // montrerait deux fois de suite.
    skipCover: true,
    blocks: [
      { grid: 1, mobileGrid: 1, images: [1, 2, 3, 4, 5].map((i) => `/works-modal/snaki/${i}.webp`) },
    ],
  },

  MEB: {
    categories: [{ icon: ICON.web, label: "Site Web" }],
    // La couverture ouvrait la planche en doublon : on la laisse de cote.
    skipCover: true,
    blocks: [
      // La planche longue puis la capture aux nuages, l'une SOUS l'autre
      // dans un meme bloc : en deux blocs elles etaient separees par le
      // space-y-20 des sections. Ici elles ne sont plus distantes que du
      // gap-3 de la grille.
      { grid: 1, mobileGrid: 1, images: ["/site%20/meb1.svg", "/works-modal/meb/1.webp"] },
    ],
  },

  ZEM: {
    categories: [{ icon: ICON.web, label: "Site Web" }],
    blocks: [
      // La 1re capture sert aussi de banniere : elle reste dans la planche,
      // la couverture ne la remplace pas.
      { grid: 1, mobileGrid: 1, images: [2, 3, 4].map((i) => `/works-modal/zem2.0/${i}.webp`) },
    ],
  },
};

export default projectMedia;
