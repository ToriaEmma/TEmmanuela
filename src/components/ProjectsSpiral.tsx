import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { projects } from "./ProjectsGrid";
import { navigateTo } from "../utils/navigation";

// Helice verticale reprise de pacomepertant.com. Valeurs relevees dans leur
// bundle (classe ProjectPlane) :
//   verticalGap = .5   angleGap = .85   baseRadius = 2
//   baseScale = 1.7 x 1   camera fov 35 (45 sous 900px), position z = 8
// Chaque carte tourne autour de l'axe Y et regarde vers l'exterieur ; c'est
// le defilement qui fait tourner l'helice, la camera ne bouge pas.
const VERTICAL_GAP = 0.5;
const ANGLE_GAP = 0.85;
const BASE_RADIUS = 2;
const SCALE_X = 1.7;
const SCALE_Y = 1;

// Controls : easing .1, vitesse minimale .002, delta borne a [-2, 2].
const EASING = 0.1;
const MIN_WHEEL_SPEED = 0.002;
const WHEEL_CLAMP = 2;

type Slide = { name: string; image: string; href: string };

const ProjectsSpiral = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<Slide | null>(null);

  const slides: Slide[] = useMemo(
    () => projects.map((p) => ({ name: p.name, image: p.image, href: p.href })),
    [],
  );

  useEffect(() => {
    document.body.classList.add("hide-site-cursor");
    return () => document.body.classList.remove("hide-site-cursor");
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      mount.clientWidth < 900 ? 45 : 35,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100,
    );
    // Leur camera est a z=8 ; en portrait etroit l'helice deborde, on recule
    // pour conserver la meme composition qu'en desktop.
    const cameraZ = () => (mount.clientWidth < 768 ? 13 : 8);
    camera.position.set(0, 0, cameraZ());

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const geometry = new THREE.PlaneGeometry(1, 1, 8, 8);
    const count = slides.length;
    const centerIndex = Math.floor(count / 2);

    type Card = {
      mesh: THREE.Mesh;
      slide: Slide;
      index: number;
      hoverProgress: number;
      hiddenProgress: number;
      hiddenTarget: number;
    };
    const cards: Card[] = [];

    slides.forEach((slide, i) => {
      const texture = loader.load(slide.image, (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        const img = t.image as { width: number; height: number } | undefined;
        if (img?.width) material.uniforms.uImageSizes.value.set(img.width, img.height);
      });
      // Shaders repris tels quels de la reference (lus sur leur materiau en
      // production) : plan incurve, coins arrondis par SDF, face arriere
      // floutee au lieu d'etre en miroir, et reveal pilote par uRevealProgress.
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uColorStrength: { value: 0 },
          uZoom: { value: 1 },
          uPlaneSizes: { value: new THREE.Vector2(SCALE_X, SCALE_Y) },
          uImageSizes: { value: new THREE.Vector2(1, 1) },
          uRevealProgress: { value: 0 },
          uScrollSpeed: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          #define PI 3.14159265359

          uniform float uScrollSpeed;

          void main() {
            vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            vec3 newPosition = position;
            newPosition.z = sin(uv.x * PI) * 0.2;

            vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
            vec4 viewPosition = viewMatrix * modelPosition;
            viewPosition.x += pow(worldPosition.y, 2.0) * 0.1;
            viewPosition.x += sin(uv.y * PI) * uScrollSpeed * 2.0;
            gl_Position = projectionMatrix * viewPosition;

            vUv = uv;
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform float uColorStrength;
          uniform float uZoom;
          uniform vec2 uPlaneSizes;
          uniform vec2 uImageSizes;
          uniform float uRevealProgress;

          varying vec2 vUv;

          float roundedRectSDF(vec2 uv, vec2 size, float radius) {
            vec2 d = abs(uv - 0.5) - size * 0.5 + radius;
            return length(max(d, 0.0)) - radius;
          }

          void main() {
            vec2 ratio = vec2(
              min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
              min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
            );

            vec2 uv = vec2(
              vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
              vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
            );

            vec2 zoomedUv = (uv - 0.5) / uZoom + 0.5;

            vec4 color;

            if (gl_FrontFacing) {
              color = texture2D(uTexture, zoomedUv);
              color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), uColorStrength);
            } else {
              // Leur valeur : 40/1024 en UV, sur des textures de 512 px de
              // large. C'est un offset en UV, donc independant de la taille
              // reelle de l'image : on garde leur constante telle quelle.
              float offset = 40.0 / 1024.0;
              vec4 c = vec4(0.0);

              c += texture2D(uTexture, uv + vec2(-offset, -offset)) * 1.0;
              c += texture2D(uTexture, uv + vec2( 0.0,    -offset)) * 2.0;
              c += texture2D(uTexture, uv + vec2( offset, -offset)) * 1.0;
              c += texture2D(uTexture, uv + vec2(-offset,  0.0))   * 2.0;
              c += texture2D(uTexture, uv)                         * 4.0;
              c += texture2D(uTexture, uv + vec2( offset,  0.0))   * 2.0;
              c += texture2D(uTexture, uv + vec2(-offset,  offset)) * 1.0;
              c += texture2D(uTexture, uv + vec2( 0.0,     offset)) * 2.0;
              c += texture2D(uTexture, uv + vec2( offset,  offset)) * 1.0;
              c /= 16.0;

              color = c;
            }

            float reveal = clamp(uRevealProgress, 0.0, 1.0);
            vec2 revealSize = vec2(reveal);

            float baseRadius = 0.05;
            float radius = baseRadius * reveal;

            float sdf = roundedRectSDF(vUv, revealSize, radius);

            float edge = 0.002;
            float alpha = 1.0 - smoothstep(0.0, edge, sdf);
            alpha *= smoothstep(0.1, 1.0, uRevealProgress);

            gl_FragColor = vec4(color.rgb, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(SCALE_X, SCALE_Y, 1);
      scene.add(mesh);
      cards.push({ mesh, slide, index: i, hoverProgress: 0, hiddenProgress: 1, hiddenTarget: 1 });
    });

    // Entree en cascade : leur revealProjects() decale chaque carte de
    // (index % 4) * 50 ms.
    const revealTimers = cards.map((card, i) =>
      window.setTimeout(() => { card.hiddenTarget = 0; }, (i % 4) * 50 + 120),
    );

    // --- Molette avec inertie, leur modele exact ---
    let wheelDeltaY = 0;
    let targetWheelDeltaY = 0;
    let scrollOffset = 0;
    let wheelDirection = 1;

    const onWheel = (e: WheelEvent) => {
      wheelDirection = e.deltaY > 0 ? 1 : -1;
      targetWheelDeltaY = THREE.MathUtils.clamp(
        targetWheelDeltaY + e.deltaY * 15e-5,
        -WHEEL_CLAMP,
        WHEEL_CLAMP,
      );
    };
    mount.addEventListener("wheel", onWheel, { passive: true });

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      wheelDirection = touchY - y > 0 ? 1 : -1;
      targetWheelDeltaY = THREE.MathUtils.clamp(
        targetWheelDeltaY + (touchY - y) * 0.5 * 0.003,
        -WHEEL_CLAMP,
        WHEEL_CLAMP,
      );
      touchY = y;
    };
    mount.addEventListener("touchstart", onTouchStart, { passive: true });
    mount.addEventListener("touchmove", onTouchMove, { passive: true });

    const pointer = new THREE.Vector2(-10, -10);
    const raycaster = new THREE.Raycaster();
    let hovered: Card | null = null;

    let pointerMoved = false;
    // getBoundingClientRect a chaque mouvement forcait un reflow synchrone :
    // on garde le rect en cache, reactualise au resize seulement.
    let rect = mount.getBoundingClientRect();
    const onPointerMove = (e: PointerEvent) => {
      pointerMoved = true;
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };
    const onClick = () => {
      if (!hovered) return;
      const { href } = hovered.slide;
      if (href.startsWith("/")) navigateTo(href);
      else window.open(href, "_blank", "noopener,noreferrer");
    };
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("click", onClick);

    // Liste figee : la reconstruire a chaque frame allouait pour rien.
    const meshes = cards.map((c) => c.mesh);
    let lastRaycast = 0;

    let frame = 0;
    const clock = new THREE.Clock();

    const render = () => {
      frame = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.05) * 1000;

      // Leur boucle Controls.update() a l'identique : sous la vitesse
      // minimale, la spirale ne s'arrete pas — elle continue de deriver dans
      // le dernier sens parcouru.
      // Leur boucle suppose 60 fps constants : telle quelle, la spirale
      // ralentit et saccade des que le framerate baisse. On normalise easing,
      // amortissement et avance sur le temps ecoule pour que le mouvement
      // reste identique quel que soit le nombre d'images par seconde.
      const f = delta / 16.667;
      wheelDeltaY += (targetWheelDeltaY - wheelDeltaY) * (1 - Math.pow(1 - EASING, f));
      scrollOffset += wheelDeltaY * f;
      if (Math.abs(targetWheelDeltaY) < MIN_WHEEL_SPEED) {
        targetWheelDeltaY = wheelDirection * MIN_WHEEL_SPEED;
      }
      targetWheelDeltaY *= Math.pow(0.9, f);

      // Le raycast sur 12 plans a chaque frame coutait cher pour rien : on
      // ne le refait que si la souris a bouge, et au plus ~15 fois/seconde.
      const now = performance.now();
      if (pointerMoved && now - lastRaycast > 66) {
        lastRaycast = now;
        pointerMoved = false;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(meshes)[0];
        const hitCard = hit ? cards.find((c) => c.mesh === hit.object) ?? null : null;
        if (hitCard !== hovered) {
          hovered = hitCard;
          setActive(hitCard?.slide ?? null);
          mount.style.cursor = hitCard ? "pointer" : "default";
        }
      }

      cards.forEach((card) => {
        // Leur easing de survol : .09 si survole, .07 sinon.
        const e = card === hovered ? 0.09 : 0.07;
        const alpha = 1 - Math.pow(1 - e, delta * 0.2);
        card.hoverProgress += ((card === hovered ? 1 : 0) - card.hoverProgress) * alpha;

        // hiddenProgress : lerp .05 avec exposant delta * .15 (leur valeur).
        const hAlpha = 1 - Math.pow(1 - 0.05, delta * 0.15);
        card.hiddenProgress += (card.hiddenTarget - card.hiddenProgress) * hAlpha;

        // Indice ramene dans [0, count[ puis centre : l'helice boucle.
        let n = card.index - scrollOffset;
        n = ((n % count) + count) % count;
        const b = n - centerIndex;

        // g = 1.5 si cachee, -1.5 sinon : les cartes arrivent en glissant.
        const g = card.hiddenTarget === 1 ? 1.5 : -1.5;
        const y = b * VERTICAL_GAP - 0.8 - card.hiddenProgress * g;
        const radius = BASE_RADIUS * (1 - card.hiddenProgress / 2);
        const angle = b * ANGLE_GAP;
        card.mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        card.mesh.rotation.y = -angle + Math.PI / 2;

        // Uniformes, exactement leur calcul.
        const mat = card.mesh.material as THREE.ShaderMaterial;
        mat.uniforms.uColorStrength.value = 0.55 * card.hoverProgress;
        mat.uniforms.uZoom.value = 1 + 0.05 * card.hoverProgress;
        mat.uniforms.uRevealProgress.value = (1 - card.hoverProgress * 0.05) * (1 - card.hiddenProgress);
        mat.uniforms.uScrollSpeed.value = wheelDeltaY;
      });

      renderer.render(scene, camera);
    };
    render();

    const onResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.fov = mount.clientWidth < 900 ? 45 : 35;
      camera.position.z = cameraZ();
      camera.updateProjectionMatrix();
      rect = mount.getBoundingClientRect();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      revealTimers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("wheel", onWheel);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchmove", onTouchMove);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("click", onClick);
      geometry.dispose();
      cards.forEach(({ mesh }) => {
        const mat = mesh.material as THREE.ShaderMaterial;
        mat.uniforms.uTexture.value?.dispose();
        mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [slides]);

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full" />
      {/* Pastille de survol, reprise de la reference : fond #FAFAFA,
          rayon 14px, padding 6px 16px 6px 6px, vignette 48x48 en rayon 9px,
          titre 18px / 500 en #0A0A0A. Elle est fixe en bas au centre et ne
          suit pas le curseur. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[60px] flex justify-center">
        <div
          className="flex items-center gap-3 rounded-[14px] bg-[#FAFAFA] py-1.5 pl-1.5 pr-4 transition-all duration-300"
          style={{
            opacity: active ? 1 : 0,
            transform: active ? "translateY(0) scale(1)" : "translateY(8px) scale(0.96)",
          }}
        >
          <img
            src={active?.image}
            alt=""
            aria-hidden="true"
            className="size-12 shrink-0 rounded-[9px] object-cover"
          />
          <h4 className="whitespace-nowrap text-[18px] font-medium leading-none text-[#0A0A0A]">
            {active?.name}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default ProjectsSpiral;
