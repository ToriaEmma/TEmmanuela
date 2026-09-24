import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Le GLB sort d'un optimiseur (PlugXR) : ses 3 meshes arrivent avec des
// materiaux "default" sans couleur ni texture. On les repeint a la volee avec
// une palette accordee au site.
const PETAL_COLOR = "#f3e2d8";
const CORE_COLOR = "#e0a84f";
const STEM_COLOR = "#D4FF36";

// Vitesse de rotation de la fleur, en radians/seconde (~10 s par tour).
const SPIN_SPEED = 0.6;

const MODEL_URL = "/Flower2.glb";

type Fit = { scale: number; center: [number, number, number] };

function FlowerModel() {
  const { scene } = useGLTF(MODEL_URL);
  const spinRef = useRef<THREE.Group>(null);
  const [fit, setFit] = useState<Fit | null>(null);

  // `scale` est une prop three.js, pas du CSS : aucun breakpoint Tailwind ne
  // peut l'atteindre. On suit donc la media query en JS, uniquement pour
  // choisir un nombre. Le rendu desktop reste strictement inchange.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    // Les meshes n'ont pas de nom exploitable : on les classe par hauteur pour
    // deviner petales / coeur / tige.
    const meshes: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
    });

    // Les bounding boxes lisent `matrixWorld` : il faut donc l'avoir calculee
    // AVANT de trier les meshes par hauteur, sinon le tri porte sur des
    // matrices identite et l'attribution des couleurs devient aleatoire.
    scene.updateWorldMatrix(true, true);

    const palette = [PETAL_COLOR, CORE_COLOR, STEM_COLOR];
    meshes
      .map((mesh) => ({ mesh, top: new THREE.Box3().setFromObject(mesh).max.y }))
      .sort((a, b) => b.top - a.top)
      .forEach(({ mesh }, index) => {
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(palette[Math.min(index, palette.length - 1)]),
          roughness: index === 1 ? 0.35 : 0.6,
          metalness: index === 1 ? 0.45 : 0.05,
        });
      });

    // On ne touche NI a la rotation NI a la position de `scene` : cet objet est
    // mis en cache par useGLTF et partage entre les montages, et une mutation
    // survivrait aux rechargements a chaud. Le recentrage se fait sur nos
    // propres groupes, ou l'ordre des transformations est maitrise.
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z) || 1;

    setFit({ scale: 1 / largest, center: [-center.x, -center.y, -center.z] });
  }, [scene]);

  // Rotation continue sur elle-meme, indexee sur delta donc stable quel que
  // soit le framerate. Le SENS suit la souris : a droite de l'ecran elle
  // tourne dans un sens, a gauche dans l'autre. Le changement est amorti
  // plutot que sec -- la vitesse traverse zero au lieu de s'inverser d'un
  // coup, ce qui donnerait un a-coup.
  const dirRef = useRef(1);
  const speedRef = useRef(SPIN_SPEED);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      dirRef.current = e.clientX < window.innerWidth / 2 ? -1 : 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_state, delta) => {
    if (!spinRef.current) return;
    const target = SPIN_SPEED * dirRef.current;
    // Amortissement exponentiel : independant du framerate.
    speedRef.current += (target - speedRef.current) * (1 - Math.exp(-delta * 3));
    spinRef.current.rotation.y += delta * speedRef.current;
  });

  if (!fit) return null;

  // Trois groupes imbriques, et l'ordre compte : `position` s'applique dans
  // l'espace du PARENT, donc porter le recentrage et la mise a l'echelle sur le
  // meme groupe translaterait la fleur de -17 unites a l'echelle 1 tout en la
  // reduisant a ~1 unite -> elle part hors du champ. Le recentrage doit donc
  // vivre dans un groupe enfant, ou il subit deja la mise a l'echelle.
  // Pas de redressement : les noeuds racines du GLB portent deja un quart de
  // tour sur X, en rajouter un recoucherait la fleur.
  return (
    <group ref={spinRef} scale={isMobile ? 2.9 : 5.2} position={[0, isMobile ? 0.45 : -0.65, 0]}>
      <group scale={fit.scale}>
        <group position={fit.center}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);

type Flower3DProps = {
  className?: string;
};

const Flower3D = ({ className = "" }: Flower3DProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  // La fleur n'occupe que le hero. Une fois celui-ci passe, son canvas
  // continuait pourtant a rendre en boucle pour toute la page : c'est ce qui
  // ecrasait le framerate du site entier -- la modale et le scroll n'etaient
  // lents que parce qu'ils partageaient la frame avec elle. On ne la fait
  // donc tourner que tant qu'elle est reellement a l'ecran.
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      // Une marge : elle reprend avant de revenir dans le champ, donc on ne
      // la voit jamais figee puis repartir.
      { rootMargin: "10% 0px" },
    );
    io.observe(host);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={className}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        // Plafonne a 1 : la fleur est un decor flou-friendly pose derriere un
        // degrade, et rendre 4x plus de pixels pour elle coutait l'essentiel
        // du budget de frame du hero (mesure : ~970ms -> ~230ms par frame en
        // divisant le buffer). A l'oeil, sur ce sujet, la difference ne se
        // voit pas ; le gain de fluidite, lui, se voit partout.
        dpr={1}
        // La boucle ne tourne plus que quand la fleur est visible. Hors champ,
        // R3F ne dessine plus rien et rend la frame au reste du site.
        frameloop={onScreen ? "always" : "never"}
        gl={{ alpha: true, antialias: true }}
        // Le pointer-events-none du conteneur ne descend PAS sur le <canvas>
        // que R3F cree : celui-ci captait la molette. Comme il couvre tout le
        // hero, la page ne defilait quasiment plus tant que le curseur etait
        // dessus (mesure : 5 crans = 1px sur le canvas, 44px a cote) -- d'ou
        // le blocage qu'il fallait forcer pour quitter le hero.
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 2]} intensity={1.6} />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#4d98f7" />
        <Suspense fallback={null}>
          <FlowerModel />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Flower3D;
