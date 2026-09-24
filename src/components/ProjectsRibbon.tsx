import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { VERTEX_SHADER, FRAGMENT_SHADER } from "./ribbon/sheet.glsl";
import useVirtualScroll from "./ribbon/useVirtualScroll";
import drawLabel from "./ribbon/drawLabel";
import BallTrail from "./ribbon/ballTrail";
import Floor, { REFLECT_LAYER } from "./ribbon/floor";

// La bande de projets, rendue comme sur la reference : le DOM sert de couche
// de MESURE et de clic, et tous les pixels visibles sont dessines dans un
// unique canvas WebGL. Les <article> ne sont jamais peints -- ils portent la
// mise en page (flex, aspect-ratio, gap) pour que le GL ait des rects a
// refleter, et ils restent la pour l'accessibilite et le hit-test.

export type RibbonCard = {
  key: string;
  name: string;
  image: string;
  categoryLabel: { fr: string; en: string };
  onOpen: () => void;
};

// Camera relevee dans le bundle : c'est ce fov a cette distance qui donne a z
// autant a dire, et donc qui fait que la courbe en profondeur se LIT.
const CAM_FOV = 53.4;
const CAM_Z = 41.18;

// Le ruban lui-meme.
const SHEET_SPAN = 1.15;    // u_sheetT desktop
const SHEET_DEPTH = 0.2;    // -> u_sheetD
const SHEET_DOOR = -0.12;   // -> u_leanA
const SHEET_SPREAD = 1;     // u_shadeS
const VEL_NORM = 550;       // normalisation de la velocite (desktop)
const VEL_BULGE = 1.1;      // le renflement supplementaire a pleine vitesse
const CARD_DENT = 0.1;      // profondeur du creux au survol

// Version mobile : pas de place pour qu'un balayage aille du proche au
// lointain et se lise comme un trajet -- ca a juste l'air bancal. Cuvette
// symetrique, moins profonde, sans porte.
const MOBILE = { span: 1, depth: 0.18, door: 0, spread: 0.6, velNorm: 245 };

// Le renflement mobile : la colonne se bombe selon la vitesse de defilement.
// C'est tout ce qui donne de la matiere au mobile, puisque la courbe du ruban
// y est eteinte.
const MOBILE_SCROLL_NORM = 500; // normalisation du defilement en colonne
const BULGE_GAIN = 0.22;        // part de la demi-hauteur, a pleine vitesse
const MOBILE_BULGE = 1.3;       // multiplicateur applique aux cartes en mobile

const WRAP_MARGIN = 0.5;    // marge de wrap, x largeur de viewport
const CARD_RADIUS = 19.2;   // px, le rounded-20 de la reference

type Item = {
  el: HTMLElement;
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  title: string;
  label: THREE.CanvasTexture | null;
  // La taille a laquelle le pied a ete dessine : il n'est refait que si la
  // carte change reellement de dimensions.
  labelKey: string;
  start: number;
  end: number;
  base: { left: number; top: number; width: number; height: number };
  rect: { left: number; top: number; width: number; height: number };
  out: boolean;
};

const ProjectsRibbon = ({ cards }: { cards: RibbonCard[] }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<Item[]>([]);
  const loopRef = useRef(0);
  const trailRef = useRef<BallTrail | null>(null);
  const floorRef = useRef<Floor | null>(null);

  // Toutes les cartes au MEME format. La reference donne a chaque article le
  // ratio de son image, ce qui fait une bande de largeurs inegales -- ici on
  // garde un 16/9 uniforme : la bande reste reguliere et l'image est recadree
  // par uvCover dans le shader plutot que de deformer la carte.
  const RATIO = 16 / 9;

  const scroll = useVirtualScroll({
    onTick: (state) => {
      const items = itemsRef.current;
      if (!items.length) return;

      place(items, loopRef.current, state.a);
      syncGL(state.t - state.a);
    },
  });

  // Place chaque carte : wrap infini autour de la longueur de boucle, puis
  // parking de ce qui sort du cadre elargi.
  //
  // L'AXE change avec le format. En desktop la bande est une ligne qui defile
  // horizontalement ; en mobile il n'y a pas la largeur pour qu'un balayage du
  // proche au lointain se lise comme un trajet, donc la bande devient une
  // colonne qui defile verticalement. Le wrap, l'elastique et le parking sont
  // les memes des deux cotes -- seul l'axe qu'ils mesurent differe.
  const place = (items: Item[], loop: number, a: number, force = false) => {
    const vertical = window.matchMedia("(max-width: 649px)").matches;
    const margin = (vertical ? window.innerHeight : window.innerWidth) * WRAP_MARGIN;

    for (const item of items) {
      const s = gsap.utils.wrap(-(loop - item.end), item.end, a);

      if ((s > item.start - margin && s < item.end + margin) || force) {
        item.out = false;
      } else if (item.out) {
        // Deja parkee : on laisse le transform perime et on saute la sync GL.
        item.mesh.visible = false;
        continue;
      } else {
        item.out = true;
      }

      item.mesh.visible = true;
      item.rect.left = vertical ? item.base.left : item.base.left - s;
      item.rect.top = vertical ? item.base.top - s : item.base.top;
      item.rect.width = item.base.width;
      item.rect.height = item.base.height;
      item.el.style.transform = vertical
        ? `translate3d(0px, ${-s}px, 0px)`
        : `translate3d(${-s}px, 0px, 0px)`;
    }
  };

  // Le GL est monte une fois et pilote a la main : React ne re-rend rien par
  // frame, il ne fait que fournir le DOM a refleter.
  const glRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    render: () => void;
  } | null>(null);

  const syncGL = (lead: number) => {
    const gl = glRef.current;
    if (!gl) return;

    const small = window.matchMedia("(max-width: 649px)").matches;
    const cfg = small ? MOBILE : { span: SHEET_SPAN, depth: SHEET_DEPTH, door: SHEET_DOOR, spread: SHEET_SPREAD, velNorm: VEL_NORM };

    // La velocite : tanh normalise puis CARRE SIGNE, ce qui donne une amorce
    // douce -- les petits mouvements ne declenchent presque rien, et la
    // reponse monte franchement une fois le geste engage.
    const tv = Math.tanh(lead / cfg.velNorm);
    const vel = tv * Math.abs(tv);
    const V = Math.min(1, Math.abs(vel));

    const vFOV = (gl.camera.fov * Math.PI) / 180;
    const H = Math.tan(vFOV / 2) * gl.camera.position.z;
    const W = H * gl.camera.aspect;

    // En mobile la courbe du ruban est ETEINTE, pas adoucie : u_sheetW a 0
    // coupe chaque terme a la racine. Il n'y a pas la largeur pour qu'un
    // balayage du proche au lointain se lise comme un trajet -- ca a juste
    // l'air bancal. A la place, la colonne se bombe avec la vitesse.
    const sheetW = small ? 0 : W;
    const sheetD = small ? 0 : W * cfg.depth * (1 + VEL_BULGE * V);
    const leanA = small ? 0 : W * cfg.door;

    // Le renflement mobile, sur sa propre normalisation (500, pas 245 : le
    // defilement d'une colonne se mesure autrement qu'un lancer de carrousel).
    const bulgeT = small ? Math.tanh(lead / MOBILE_SCROLL_NORM) : 0;
    const bulgeA = small ? bulgeT * Math.abs(bulgeT) * BULGE_GAIN * MOBILE_BULGE * H : 0;

    const { innerWidth: ww, innerHeight: wh } = window;

    for (const item of itemsRef.current) {
      if (!item.mesh.visible) continue;

      // rect DOM -> espace monde : la taille du frustum a z=0 est connue, donc
      // un rect en px s'y projette lineairement.
      const r = item.rect;
      const sx = W * 2 * (r.width / ww);
      const sy = H * 2 * (r.height / wh);

      item.mesh.position.set(
        -W + sx / 2 + (r.left / ww) * W * 2,
        H - sy / 2 - (r.top / wh) * H * 2,
        0,
      );
      item.mesh.scale.set(sx, sy, 1);

      const u = item.material.uniforms;
      u.u_res.value.set(sx, sy);
      u.u_sheetW.value = sheetW;
      u.u_sheetD.value = sheetD;
      u.u_sheetT.value = cfg.span;
      u.u_sheetC.value = small ? 0 : 1;
      u.u_sheetV.value = V;
      u.u_shadeS.value = cfg.spread;
      u.u_leanA.value = leanA;
      u.u_leanW.value = small ? 0 : W;
      u.u_bulgeA.value = bulgeA;
      u.u_bulgeH.value = small ? H : 0;
      // Le rayon est normalise a la HAUTEUR du plan, pour qu'il survive a une
      // mise a l'echelle non uniforme.
      u.u_corner.value = CARD_RADIUS / Math.max(r.height, 1);
    }

    // Le sol se cale sur le bas des cartes : toutes ont la meme hauteur et la
    // meme ligne de base, donc n'importe quelle carte visible fait l'affaire.
    const floor = floorRef.current;
    if (floor) {
      const first = itemsRef.current.find((i) => i.mesh.visible);
      if (first) {
        const bottom = first.mesh.position.y - first.mesh.scale.y / 2;
        floor.sync(gl.camera, H, W, bottom, cfg.door);
      }
    }

    gl.render();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.autoClear = false;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAM_FOV, 1, 0.1, 2000);
    camera.position.z = CAM_Z;

    // Une seule geometrie partagee. 24x24 subdivisions : c'est ce qui permet
    // au deplacement par vertex de courber la silhouette -- un quad a 2
    // triangles resterait rigide.
    const geometry = new THREE.PlaneGeometry(1, 1, 24, 24);

    const loader = new THREE.TextureLoader();
    const items: Item[] = [];

    const articles = Array.from(track.children) as HTMLElement[];

    articles.forEach((el) => {
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        // Toutes ces surfaces se chevauchent en profondeur par construction :
        // c'est l'ordre de dessin qui decide, pas le depth buffer.
        depthTest: false,
        depthWrite: false,
        uniforms: {
          u_texture: { value: null },
          u_label: { value: null },
          u_hasLabel: { value: 0 },
          u_size: { value: new THREE.Vector2(1, 1) },
          u_res: { value: new THREE.Vector2(1, 1) },
          u_alpha: { value: 0 },
          u_hasTexture: { value: 0 },
          u_shade: { value: 1 },
          // Pas de brume de profondeur : les cartes lointaines gardent leurs
          // couleurs. Seul le relief de la surface reste eclaire.
          u_haze: { value: 0 },
          u_shadeS: { value: SHEET_SPREAD },
          u_corner: { value: 0 },
          // Pas de voile : le titre a deja son ombre portee dans la texture
          // du pied, et le degrade assombrissait toute la moitie basse de
          // l'image pour rien.
          u_scrim: { value: 0 },
          u_sheetW: { value: 0 },
          u_sheetD: { value: 0 },
          u_sheetT: { value: SHEET_SPAN },
          u_sheetC: { value: 1 },
          u_sheetP: { value: 1 },
          u_sheetV: { value: 0 },
          u_hover: { value: 0 },
          u_dent: { value: CARD_DENT },
          u_leanA: { value: 0 },
          u_leanW: { value: 0 },
          u_bulgeA: { value: 0 },
          u_bulgeH: { value: 0 },
        },
      });

      // La plaque est deja peignable : la carte monte a pleine opacite des
      // le montage, sans attendre le reseau. Seule la photo se fond ensuite.
      gsap.to(material.uniforms.u_alpha, { value: 1, duration: 0.4, ease: "power1.out" });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      mesh.visible = false;
      // Les cartes sont les seules choses que le sol reflete.
      mesh.layers.enable(REFLECT_LAYER);
      scene.add(mesh);

      const src = el.dataset.image;
      if (src) {
        loader.load(src, (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          material.uniforms.u_texture.value = texture;
          const { width, height } = texture.image as HTMLImageElement;
          // u_size sert a uvCover : c'est la taille de l'IMAGE, pas celle de
          // la carte. Le shader recadre dedans sans la deformer.
          material.uniforms.u_size.value.set(width, height);
          // La plaque cede la place a la photo. La carte, elle, est deja
          // opaque : ce fondu-ci ne porte donc plus l'apparition de la
          // grille, seulement le remplacement du gris par l'image.
          // u_alpha est deja anime au montage : la carte est opaque, il n'y a
          // plus rien a fondre ici.
          material.uniforms.u_hasTexture.value = 1;
        });
      }

      items.push({
        el,
        mesh,
        material,
        title: el.dataset.title ?? "",
        label: null,
        labelKey: "",
        start: 0,
        end: 0,
        base: { left: 0, top: 0, width: 0, height: 0 },
        rect: { left: 0, top: 0, width: 0, height: 0 },
        out: true,
      });
    });

    itemsRef.current = items;

    // Le curseur balle-sous-toile enveloppe le rendu : il dessine la scene
    // dans une cible puis la re-echantillonne selon les pentes du champ. Tant
    // que la balle n'est pas vivante il rend la scene directement, donc une
    // page au repos ne paie rien.
    const trail = new BallTrail(renderer);
    trailRef.current = trail;

    const floor = new Floor();
    floorRef.current = floor;
    scene.add(floor.mesh);
    // Il monte une fois la bande posee, comme sur la reference.
    floor.show(true, 0.6);

    let last = performance.now();
    const render = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      // Le reflet se capture AVANT le rendu principal : il lui faut la scene
      // telle qu'elle est cette frame, vue par l'oeil miroir.
      floor.renderReflection(renderer, scene);
      trail.render(scene, camera, dt);
    };
    glRef.current = { renderer, scene, camera, render };

    // La mesure : les transforms sont remis a zero d'abord, sinon on mesure
    // la position deplacee de la frame precedente et la boucle derive.
    //
    // Ce reset change la taille de la piste, donc il reveille le
    // ResizeObserver qui appelle measure -- un cycle. Le drapeau coupe la
    // reentrance : l'observer n'a a reagir qu'aux changements venus d'ailleurs
    // (loader qui part, image qui arrive, fenetre redimensionnee).
    let measuring = false;
    // Les dimensions de la derniere mesure : une remesure a taille identique
    // ne changerait rien mais reallouerait quand meme les buffers GL
    // (setSize, floor.resize) -- ~1s de blocage a la fermeture d'une modale,
    // ou seule la scrollbar avait bouge.
    let lastSize = "";

    const measure = (force = false) => {
      if (measuring) return;
      // Modale ouverte : la bande est derriere le panneau, invisible. Or
      // ouvrir la modale masque la scrollbar, donc la piste change de largeur
      // et l'observer appelle measure -- qui redessine le pied de CHAQUE
      // carte et reuploade autant de textures. Ce sont ~1,3s de thread bloque
      // pile pendant le balayage d'ouverture, pour un rendu que personne ne
      // voit. On remesurera a la fermeture, quand la largeur sera revenue.
      if (document.documentElement.dataset.ribbonFrozen === "1") return;

      const size = `${window.innerWidth}x${window.innerHeight}@${Math.min(2, window.devicePixelRatio || 1)}`;
      if (!force && size === lastSize) return;
      lastSize = size;

      measuring = true;

      const ww = window.innerWidth;
      const wh = window.innerHeight;

      for (const item of items) item.el.style.transform = "";

      const dpr = Math.min(2, window.devicePixelRatio || 1);

      const vertical = window.matchMedia("(max-width: 649px)").matches;

      for (const item of items) {
        const r = item.el.getBoundingClientRect();
        // start/end sont mesures sur l'axe qui defile : en colonne c'est la
        // hauteur qui fait la boucle, pas la largeur.
        item.start = vertical ? r.top - wh : r.left - ww;
        item.end = vertical ? r.bottom : r.right;
        item.base = { left: r.left, top: r.top, width: r.width, height: r.height };
        item.out = true;

        // Le pied est dessine a la taille reelle de la carte, donc il est
        // refait quand celle-ci change -- mais seulement alors : c'est un
        // canvas et un upload de texture, pas quelque chose a refaire a
        // chaque frame.
        // La cle est arrondie a 8px : la scrollbar qui part et revient (a
        // l'ouverture puis a la fermeture d'une modale) decale la carte de
        // quelques pixels, un ecart invisible qui suffisait a invalider le
        // cache et a reuploader TOUTES les textures -- ~1s de blocage pour
        // rien. Un pied redessine a 8px pres est indistinguable.
        const q = (v: number) => Math.round(v / 8) * 8;
        const key = `${q(r.width)}x${q(r.height)}@${dpr}`;
        if (item.title && r.width > 1 && r.height > 1 && item.labelKey !== key) {
          item.labelKey = key;
          item.label?.dispose();

          const canvas = drawLabel({ width: r.width, height: r.height, title: item.title, dpr });
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;

          item.label = texture;
          item.material.uniforms.u_label.value = texture;
          item.material.uniforms.u_hasLabel.value = 1;
        }
      }

      const cs = getComputedStyle(track);
      const gap = parseFloat(vertical ? cs.rowGap : cs.columnGap) || 0;
      // La longueur de boucle : du debut de la premiere au bout de la
      // derniere, plus un gap pour que la jonction ait le meme ecart que
      // partout ailleurs.
      const span = vertical ? wh : ww;
      loopRef.current = items.length
        ? items[items.length - 1].end + gap - (items[0].start + span)
        : 0;

      renderer.setSize(ww, wh, false);
      camera.aspect = ww / wh;
      camera.updateProjectionMatrix();
      trail.setSize(ww, wh, Math.min(2, window.devicePixelRatio || 1));
      floor.resize();

      place(items, loopRef.current, scroll.current.a, true);
      syncGL(0);

      // Relache apres que l'observer ait vu les transforms reecrits par
      // place(), sinon le cycle repart a la frame suivante.
      requestAnimationFrame(() => {
        measuring = false;
      });
    };

    measure(true);

    // La piste peut etre mesuree a zero au montage : un loader la couvre
    // encore, ou les images ne sont pas arrivees. Un timeout fixe se trompe
    // dans un sens ou dans l'autre -- l'observer remesure exactement quand la
    // piste prend sa vraie largeur, et une seule fois de plus ensuite.
    const observer = new ResizeObserver(() => measure(true));
    observer.observe(track);

    // Enveloppe : passer `measure` directement lui refilerait l'Event comme
    // argument `force`, donc chaque resize forcerait la remesure.
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      for (const item of items) {
        item.material.dispose();
        const tex = item.material.uniforms.u_texture.value as THREE.Texture | null;
        tex?.dispose();
        item.label?.dispose();
      }
      geometry.dispose();
      trail.dispose();
      trailRef.current = null;
      floor.dispose();
      floorRef.current = null;
      renderer.dispose();
      glRef.current = null;
      itemsRef.current = [];
    };
  }, [cards, scroll]);

  // Le survol : une pose, pas une recoloration. La carte se creuse en dome et
  // repart a la meme vitesse -- expo 0.5s dans les deux sens.
  const hover = (index: number, on: boolean) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const item = itemsRef.current[index];
    if (!item) return;
    gsap.to(item.material.uniforms.u_hover, {
      value: on ? 1 : 0,
      duration: 0.5,
      ease: "expo",
      overwrite: "auto",
    });
  };

  return (
    <div className="ribbon fixed inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Le voile, mobile uniquement : un fondu noir en haut et en bas, sur le
          quart exterieur de la hauteur, avec une chute au carre. C'est ce qui
          fait lire la colonne comme defilant dans et hors de l'obscurite au
          lieu d'etre coupee net sur le bord de l'ecran. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] s:hidden"
        style={{
          background:
            "linear-gradient(to bottom, #000 0%, transparent 26%, transparent 74%, #000 100%)",
        }}
      />

      <div
        ref={trackRef}
        /* Mobile : colonne pleine largeur, gouttiere et ecart de 20px comme la
           reference (son echelle rem vaut 10px a 390 de large, donc ses
           px-20/gap-y-20 font 20px -- pas les 80px de l'echelle Tailwind). */
        className="absolute left-0 top-0 flex w-full flex-col gap-y-[20px] px-[20px] s:top-1/2 s:w-auto s:-translate-y-1/2 s:flex-row s:gap-x-[9.6px] s:px-0"
      >
        {cards.map((card, i) => (
          <article
            key={card.key}
            data-image={card.image}
            data-title={card.name}
            style={{ aspectRatio: String(RATIO) }}
            onClick={card.onOpen}
            onPointerEnter={() => hover(i, true)}
            onPointerLeave={() => hover(i, false)}
            className="group relative w-full flex-none cursor-pointer rounded-[15px] s:h-[43.5svh] s:max-h-[55rem] s:w-auto s:rounded-[20px]"
          >
            {/* Le titre et la pastille ne sont PAS ici : ils sont dessines
                dans la texture de la carte (voir drawLabel), pour qu'ils
                prennent la meme courbure qu'elle et fassent corps avec elle.
                Le DOM n'en garde que la version lisible par un lecteur
                d'ecran. */}
            <span className="sr-only">
              {card.name}, {card.categoryLabel.fr}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ProjectsRibbon;
