import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type CylinderCard = {
  key: string;
  name: string;
  image: string;
  categoryLabel: { fr: string; en: string };
  onOpen: () => void;
};

// ---------------------------------------------------------------------------
// Modele repris du bundle de jesperlandberg.com (le "sheet").
//
// Les cartes ne sont PAS sur un cylindre : elles sont alignees sur une rangee
// plate, et c'est la PROFONDEUR (z) qui ondule le long de x. Le code d'origine
// le dit explicitement : "DEPTH, not screen y, and the distinction is the whole
// shape" -- une vague verticale courberait la silhouette de chaque carte
// (bords ondules, milieu pince), alors qu'en passant par z c'est la PERSPECTIVE
// qui courbe le contour. La camera fait le travail, pas la geometrie.
//
// Profil : sin(pi q) amorti par une gaussienne. Nul au centre et aux deux
// bords, extremums aux quarts -- d'ou le balancement "rond" : la moitie gauche
// vient vers l'avant, la droite s'enfonce.
// ---------------------------------------------------------------------------

const SHEET_PI = Math.PI;
const SHEET_TAIL = 1.0; // amortissement gaussien : ramene le profil a plat hors champ
const SHEET_SHIFT = 0.0; // decale le sommet proche a gauche du centre
const SHEET_BANK = -0.03; // inclinaison tres legere : sur la reference les
// cartes restent quasi verticales, c'est la perspective qui les fait pencher
const SHEET_DIAG = 0.0; // diagonale a peine perceptible

// Amplitudes de la nappe : SHEET_W la demi-largeur utile, SHEET_D la
// profondeur du balancement, SHEET_C le melange parabole (etroit) / S (large).
const SHEET_W = 70;
const SHEET_D = 5.0; // balancement doux : la reference ondule peu
const SHEET_C = 1;

const CARD_HEIGHT = 19;
const CARD_ASPECT = 1.95; // cartes larges (paysage), comme la reference
const CARD_WIDTH = CARD_HEIGHT * CARD_ASPECT;
const GAP = 0.9; // ecart net et regulier entre les cartes, comme la reference // cartes quasi jointives : elles forment un ruban continu
const STEP = CARD_WIDTH + GAP;

// Subdivisions : la carte doit suivre la courbe de la nappe. Sans segments en
// x elle resterait un quadrilatere rigide qui s'incline au lieu de se courber
// -- le code d'origine insiste : "a card spanning a bend takes a different y
// at each vertex: it curves along the wave rather than tilting rigidly".
// Survol : la carte se creuse legerement vers l'arriere au centre et grandit.
// La reference applique z -= hover * dent * sheetDome(uv), ou sheetDome vaut 1
// au centre et exactement 0 sur chaque bord -- la silhouette reste intacte.
// Valeur exacte du bundle de la reference (u_dent = DB = 0.1) : le creux vaut
// 10% de la HAUTEUR de la carte, et non une constante monde. Une carte plus
// grande se creuse donc proportionnellement plus.
const HOVER_DENT = 0.1;
const HOVER_SCALE = 1.06;
const HOVER_EASE = 0.12;

// Ombrage du creux. C'est lui qui donne l'aspect "eau" : la reference
// assombrit le renfoncement exactement comme un creux de la vague, via
// sheetShade() -- d += hover * dent * resY * sheetDome(uv) / (2 * sheetD).
// Sans cet ombrage le creux ne se voit presque pas : c'est la variation de
// lumiere qui fait lire la surface comme un liquide qui se deforme.
const HOVER_SHADE = 0.55;

const CARD_BOW = 0.055; // bombe vertical : bords haut/bas en arc, pas droits

const SEGMENTS_X = 40;
const SEGMENTS_Y = 24;

const sheetQ = (wx: number) => wx / SHEET_W + SHEET_SHIFT;

const sheetShape = (q: number) =>
  THREE.MathUtils.lerp(1 - q * q, Math.sin(SHEET_PI * q), SHEET_C) *
  Math.exp(-SHEET_TAIL * q * q);

const sheetShapeSlope = (q: number) => {
  const g = Math.exp(-SHEET_TAIL * q * q);
  const bowl = -2 * q * (1 + SHEET_TAIL * (1 - q * q));
  const ess =
    SHEET_PI * Math.cos(SHEET_PI * q) - 2 * SHEET_TAIL * q * Math.sin(SHEET_PI * q);
  return THREE.MathUtils.lerp(bowl, ess, SHEET_C) * g;
};

/** 1 au centre, 0 sur chaque bord : le creux du survol. */
const sheetDome = (u: number, v: number) => {
  const qx = u * 2 - 1;
  const qy = v * 2 - 1;
  return (1 - qx * qx) * (1 - qy * qy);
};

/** Profondeur de la nappe a l'abscisse wx. */
const sheetZ = (wx: number) => -SHEET_D * sheetShape(sheetQ(wx));

/** Inclinaison locale : la derivee du balancement, convertie en radians. */
const sheetBank = (wx: number) =>
  ((SHEET_BANK * sheetShapeSlope(sheetQ(wx))) / SHEET_PI) * SHEET_C;

/**
 * Une carte posee sur la nappe. Chaque sommet est deplace individuellement
 * selon sa position monde, si bien qu'une carte a cheval sur une courbure se
 * plie au lieu de basculer en bloc -- le comportement decrit par la reference.
 */
const Card = ({
  card,
  index,
  offsetRef,
  onHover,
  onSelect,
  onProject,
  total,
  isHovered,
}: {
  card: CylinderCard;
  index: number;
  offsetRef: React.MutableRefObject<number>;
  onHover: (name: string | null) => void;
  onSelect: (card: CylinderCard) => void;
  onProject: (key: string, screen: { x: number; y: number; visible: boolean } | null) => void;
  total: number;
  isHovered: boolean;
}) => {
  const texture = useLoader(THREE.TextureLoader, card.image);
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();
  const corner = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    // Recadrage facon `object-cover` : nos sources ont des ratios tres varies.
    const img = texture.image as { width: number; height: number } | undefined;
    if (img?.width && img.height) {
      const imgAspect = img.width / img.height;
      if (imgAspect > CARD_ASPECT) {
        texture.repeat.set(CARD_ASPECT / imgAspect, 1);
        texture.offset.set((1 - CARD_ASPECT / imgAspect) / 2, 0);
      } else {
        texture.repeat.set(1, imgAspect / CARD_ASPECT);
        texture.offset.set(0, (1 - imgAspect / CARD_ASPECT) / 2);
      }
    }
    texture.needsUpdate = true;
  }, [texture]);

  // Plan plat subdivise ; la deformation est appliquee a chaque frame.
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT, SEGMENTS_X, SEGMENTS_Y),
    [],
  );

  // Copie des x d'origine : la deformation repart du plan plat a chaque frame,
  // sinon elle se cumule et la carte part en vrille.
  const baseX = useMemo(() => {
    const pos = geometry.attributes.position;
    const arr = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i += 1) arr[i] = pos.getX(i);
    return arr;
  }, [geometry]);

  // Copie des y d'origine : le bombe vertical repart lui aussi du plan plat.
  const baseY = useMemo(() => {
    const pos = geometry.attributes.position;
    const arr = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i += 1) arr[i] = pos.getY(i);
    return arr;
  }, [geometry]);

  // uv de chaque sommet, pour appliquer le creux du survol.
  const baseUv = useMemo(() => {
    const uv = geometry.attributes.uv;
    const arr = new Float32Array(uv.count * 2);
    for (let i = 0; i < uv.count; i += 1) {
      arr[i * 2] = uv.getX(i);
      arr[i * 2 + 1] = uv.getY(i);
    }
    return arr;
  }, [geometry]);

  // Valeur de survol lissee : 0 au repos, 1 survole.
  const hoverRef = useRef(0);
  // Le shader compile, recupere dans onBeforeCompile : useFrame y pousse
  // uHover a chaque image.
  const shaderRef = useRef<{ uniforms: Record<string, { value: number }> } | null>(null);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Position de la carte le long de la rangee, apres defilement.
    // Defilement infini : la rangee boucle. On ramene chaque carte dans la
    // fenetre [-span/2, +span/2] autour de la camera, si bien qu'une carte qui
    // sort par la droite revient par la gauche -- sans fin, dans les deux sens.
    const span = total * STEP;
    let centerX = index * STEP - offsetRef.current;
    centerX = ((centerX % span) + span) % span;
    if (centerX > span / 2) centerX -= span;

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      // Chaque sommet prend la profondeur de la nappe a SA propre abscisse :
      // c'est ce qui plie la carte au lieu de l'incliner en bloc.
      const wx = centerX + baseX[i];
      let z = sheetZ(wx) - sheetZ(centerX);

      // Bombe vertical : la carte est pincee au centre et evasee sur les cotes.
      // u vaut 0 au milieu de la carte et +-1 sur ses bords lateraux ; on
      // ecarte y proportionnellement a u^2, ce qui arque les aretes haut et bas.
      const u = baseX[i] / (CARD_WIDTH / 2);
      pos.setY(i, baseY[i] * (1 + CARD_BOW * u * u));
      // Le creux du survol : maximal au centre, nul sur les bords.
      if (hoverRef.current > 0.0001) {
        z -= hoverRef.current * HOVER_DENT * CARD_HEIGHT * sheetDome(baseUv[i * 2], baseUv[i * 2 + 1]);
      }
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    geometry.computeBoundingSphere();

    // Le survol rapproche et agrandit la carte, en douceur.
    hoverRef.current += ((isHovered ? 1 : 0) - hoverRef.current) * HOVER_EASE;
    const scale = 1 + (HOVER_SCALE - 1) * hoverRef.current;

    mesh.position.set(centerX, SHEET_DIAG * centerX, sheetZ(centerX));
    mesh.rotation.z = sheetBank(centerX);
    mesh.scale.setScalar(scale);

    // Fondu aux extremites : les cartes entrent et sortent sans coupure nette.
    const mat = mesh.material as THREE.MeshBasicMaterial;

    // Le survol est transmis au shader : c'est lui qui calcule la normale du
    // creux et y fait glisser un reflet. Voir l'eclairage dans le fragment.
    const sh = shaderRef.current;
    if (sh) sh.uniforms.uHover.value = hoverRef.current;
    const fade =
      1 - THREE.MathUtils.smoothstep(Math.abs(centerX), SHEET_W * 0.35, SHEET_W * 0.95);
    mat.opacity = fade;
    mesh.visible = fade > 0.01;

    // Projette le coin bas-gauche : le titre DOM se pose dessus, comme sur la
    // reference ou chaque carte porte son propre label.
    corner.set(-CARD_WIDTH / 2 + 0.6, -CARD_HEIGHT / 2 + 0.9, 0);
    mesh.localToWorld(corner);
    corner.project(camera);
    onProject(card.key, {
      x: (corner.x * 0.5 + 0.5) * size.width,
      y: (-corner.y * 0.5 + 0.5) * size.height,
      visible: fade > 0.35,
    });
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(card.name);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(card);
      }}
    >
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        toneMapped={false}
        onBeforeCompile={(shader) => {
          // Coins arrondis : la reference projette des elements DOM qui
          // portent un border-radius. On decoupe l'equivalent dans le
          // fragment, en distance signee sur les uv.
          shader.uniforms.uRadius = { value: 0.045 };
          shader.uniforms.uAspect = { value: CARD_ASPECT };
          // 0 au repos, 1 survolee : pilote le creux ET son eclairage.
          shader.uniforms.uHover = { value: 0 };
          shader.uniforms.uDent = { value: HOVER_DENT };
          shader.uniforms.uResY = { value: CARD_HEIGHT };
          // Expose le shader pour que useFrame puisse pousser uHover.
          shaderRef.current = shader as unknown as {
            uniforms: Record<string, { value: number }>;
          };
          shader.fragmentShader = shader.fragmentShader
            .replace(
              "void main() {",
              `uniform float uRadius;
               uniform float uAspect;
               uniform float uHover;
               uniform float uDent;
               varying vec2 vCardUv;

               // Modele d'eclairage repris du bundle de la reference.
               // Un reflet TRES serre (gloss 48) : un reflet large sur une
               // photo se confondrait avec un simple eclaircissement, alors
               // qu'un reflet serre glisse sur la surface et la fait lire
               // comme un liquide qui se creuse.
               const vec3 LIGHT_DIR = normalize(vec3(-0.4, 0.5, 1.0));
               const float LIGHT_GLOSS = 48.0;
               const float LIGHT_SPEC = 0.35;
               const float LIGHT_DIFF = 0.12;
               // La reference calcule la pente avec res.y (hauteur de la
               // carte en unites monde), pas sur des uv normalises : c'est ce
               // facteur qui donne a la normale son amplitude reelle.
               uniform float uResY;

               void main() {`,
            )
            .replace(
              "#include <dithering_fragment>",
              `#include <dithering_fragment>

               // ── Le creux du survol, eclaire ──
               // Normale analytique du dome, exactement comme sheetNormal() :
               // le dome vaut (1-qx^2)(1-qy^2), ses derivees sont donc
               // -2qx(1-qy^2) et -2qy(1-qx^2), a l'echelle du creux.
               if (uHover > 0.0001) {
                 vec2 q = vCardUv * 2.0 - 1.0;
                 float a = uHover * uDent;

                 float dzdx = 4.0 * a * uResY * q.x * (1.0 - q.y * q.y) / max(uResY * uAspect, 0.0001);
                 float dzdy = 4.0 * a * uResY * q.y * (1.0 - q.x * q.x);

                 vec3 n = normalize(vec3(-dzdx, -dzdy, 1.0));
                 vec3 v = vec3(0.0, 0.0, 1.0);

                 // Diffus "enveloppe" plutot que coupe : une coupure nette sur
                 // une surface aussi plate tracerait une ligne sur la carte.
                 float d = dot(n, LIGHT_DIR) * 0.5 + 0.5;
                 gl_FragColor.rgb *= 1.0 - LIGHT_DIFF * uHover * (1.0 - d);

                 vec3 h = normalize(LIGHT_DIR + v);
                 gl_FragColor.rgb += pow(max(dot(n, h), 0.0), LIGHT_GLOSS) * LIGHT_SPEC * uHover;
               }

               vec2 p = abs(vCardUv - 0.5) * 2.0;
               p.x *= uAspect;
               vec2 corner = vec2(uAspect, 1.0) - uRadius * 2.0;
               vec2 d = max(p - corner, 0.0);
               float dist = length(d) - uRadius * 2.0 + uRadius * 2.0;
               float alpha = 1.0 - smoothstep(0.0, 0.02, length(d) - uRadius * 2.0);
               gl_FragColor.a *= alpha;`,
            );
          shader.vertexShader = shader.vertexShader
            .replace("void main() {", "varying vec2 vCardUv;\n void main() {\n vCardUv = uv;");
        }}
      />
    </mesh>
  );
};

/** Sol en grille, comme sur la reference. */
const GridFloor = () => (
  <gridHelper args={[400, 160, "#5c5c5c", "#3d3d3d"]} position={[0, -CARD_HEIGHT / 2 - 1.2, 0]} />
);

/**
 * Defilement : la molette verticale et le drag alimentent une cible que la
 * position courante rattrape par interpolation -- d'ou le glissement amorti.
 */
const Rig = ({
  offsetRef,
  draggedRef,
}: {
  offsetRef: React.MutableRefObject<number>;
  draggedRef: React.MutableRefObject<boolean>;
}) => {
  const { gl } = useThree();
  const target = useRef(0);

  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let startX = 0;
    let startTarget = 0;

    const onWheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (delta === 0) return;
      // Defilement infini : aucune butee, la rangee boucle dans les deux sens.
      event.preventDefault();
      target.current += delta * 0.022;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      draggedRef.current = false;
      startX = event.clientX;
      startTarget = target.current;
      el.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const travel = event.clientX - startX;
      if (Math.abs(travel) > 4) draggedRef.current = true;
      target.current = startTarget - travel * 0.055;
    };

    const endDrag = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
    };
  }, [gl, draggedRef]);

  useFrame(() => {
    offsetRef.current += (target.current - offsetRef.current) * 0.085;
  });

  return null;
};

const ProjectsCylinder = ({ cards }: { cards: CylinderCard[] }) => {
  const offsetRef = useRef(0);
  const draggedRef = useRef(false);
  const [hovered, setHovered] = useState<string | null>(null);
  // Position ecran du coin bas-gauche de chaque carte, pour y poser son label.
  const labelsRef = useRef<Record<string, { x: number; y: number; visible: boolean }>>({});
  const [, forceRender] = useState(0);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      forceRender((n) => (n + 1) % 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const select = (card: CylinderCard) => {
    if (draggedRef.current) return;
    card.onOpen();
  };

  return (
    <div className="projects-cylinder relative h-[78svh] max-h-[56rem] w-full cursor-grab active:cursor-grabbing">
      {/* fov 75 a camZ 27 : les valeurs citees dans le code de la reference.
          C'est ce champ tres large qui donne a la profondeur assez d'effet
          pour que la perspective courbe les silhouettes. */}
      <Canvas
        camera={{ position: [0, -1.4, 30], fov: 62 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {cards.map((card, index) => (
            <Card
              key={card.key}
              card={card}
              index={index}
              offsetRef={offsetRef}
              onHover={setHovered}
              onSelect={select}
              onProject={(key, screen) => {
                if (screen) labelsRef.current[key] = screen;
              }}
              total={cards.length}
              isHovered={hovered === card.name}
            />
          ))}
          <GridFloor />
        </Suspense>
        <Rig offsetRef={offsetRef} draggedRef={draggedRef} />
      </Canvas>

      {/* Un label par carte, pose sur son coin bas-gauche : la reference
          affiche le titre sur chaque vignette, pas un seul sous la scene. */}
      {cards.map((card) => {
        const at = labelsRef.current[card.key];
        if (!at || !at.visible) return null;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => select(card)}
            className="absolute z-10 flex -translate-y-full items-center gap-3 font-sans text-white"
            style={{ left: at.x, top: at.y }}
          >
            <span
              className={`whitespace-nowrap text-[17px] tracking-[-0.02em] drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)] transition-opacity duration-300 md:text-[20px] ${
                hovered && hovered !== card.name ? "opacity-45" : "opacity-100"
              }`}
            >
              {card.name}
            </span>
          </button>
        );
      })}

    </div>
  );
};

export default ProjectsCylinder;
