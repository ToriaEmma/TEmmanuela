import * as THREE from "three";
import gsap from "gsap";
import { FLOOR_VERTEX, FLOOR_FRAGMENT } from "./floor.glsl";

// Le sol de la reference, constantes relevees dans le bundle.
const CFG = {
  tint: "#000000",
  base: "#000000",
  alpha: 0.9,
  drop: 0.06,        // le sol descend de 0.06*H sous le bas des cartes
  run: 6,            // longueur de fuite = 6*H
  wide: 4,           // largeur = 4 largeurs de frustum
  cell: 0.22,        // cote d'une cellule monde = 0.22*H
  grid: 0.08,        // force des traits (faible : a remarquer en second)
  lip: 0.2,          // debord vers la camera
  refl: 0.5,
  reflGap: 0.07,     // le plan miroir est 0.07*H SOUS le sol
  reflSpread: 0.35,
  reflLight: 0.6,    // la lampe est a -0.6*W, a gauche du centre
};

// La couche three.js des objets reflechissables : seules les cartes s'y
// inscrivent, donc la capture ne contient qu'elles sur un fond efface.
export const REFLECT_LAYER = 1;

const REFL_SCALE = 0.1; // capture au dixieme : la grossierete EST le flou

export class Floor {
  readonly mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private reflectCamera: THREE.PerspectiveCamera | null = null;
  private reflectTarget: THREE.WebGLRenderTarget | null = null;
  private reflectOn = false;

  constructor() {
    // Un plan couche dans le plan XZ. La rotation est CUITE dans la
    // geometrie, pas posee sur le maillage, pour que uv.x suive le X monde.
    // 48x24 segments parce que la porte deplace chaque vertex.
    const geometry = new THREE.PlaneGeometry(1, 1, 48, 24);
    geometry.rotateX(-Math.PI / 2);

    const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
    blank.needsUpdate = true;

    this.material = new THREE.ShaderMaterial({
      vertexShader: FLOOR_VERTEX,
      fragmentShader: FLOOR_FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        u_leanK: { value: 1 },
        u_run: { value: 1 },
        u_leanA: { value: 0 },
        u_leanW: { value: 1 },
        u_c0: { value: new THREE.Color(CFG.base) },
        u_c1: { value: new THREE.Color(CFG.tint) },
        u_alpha: { value: 0 },
        u_grid: { value: CFG.grid },
        u_gridF: { value: new THREE.Vector2(1, 1) },
        u_refl: { value: blank },
        u_reflA: { value: 0 },
        u_reflVP: { value: new THREE.Matrix4() },
        u_reflSpread: { value: 0 },
        u_reflLX: { value: 0 },
      },
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.frustumCulled = false;
    // Derriere les cartes (0), devant le fond.
    this.mesh.renderOrder = -1;
  }

  // Le sol se montre une fois la bande en place, et disparait avec elle.
  show(on: boolean, delay = on ? 0.15 : 0) {
    gsap.to(this.material.uniforms.u_alpha, {
      value: on ? CFG.alpha : 0,
      duration: on ? 1.1 : 0.45,
      ease: on ? "power2.out" : "power1.out",
      delay,
      overwrite: "auto",
    });
  }

  // Place le sol sous la premiere carte. H et W sont les demi-dimensions du
  // frustum a z=0, cardBottom le bas de la carte en unites monde.
  sync(camera: THREE.PerspectiveCamera, H: number, W: number, cardBottom: number, door: number) {
    const small = window.matchMedia("(max-width: 649px)").matches;
    this.mesh.visible = !small;

    const u = this.material.uniforms;
    const live = !small && u.u_alpha.value > 0.01;
    this.reflectOn = live;
    u.u_reflA.value = live ? CFG.refl : 0;

    u.u_leanA.value = W * door;
    u.u_leanW.value = W;

    const y = cardBottom - H * CFG.drop;
    const run = H * CFG.run;
    const camZ = camera.position.z;
    // Le debord vers la camera, borne : le sol continue sous le spectateur
    // mais ne doit pas passer derriere l'oeil.
    const lip = Math.min(camZ * (1 - Math.abs(y) / H) + H * CFG.lip, camZ * 0.8);
    const depth = lip + run;
    const width = W * 2 * CFG.wide;

    this.mesh.scale.set(width, 1, depth);
    this.mesh.position.set(0, y, (lip - run) / 2);

    // Une cellule monde carree : les deux axes couvrent des distances
    // differentes, donc on divise chaque portee par le MEME cote de cellule.
    // Compter les cellules par axe dans le shader les rendrait carrees a une
    // seule forme d'ecran et en losanges partout ailleurs.
    const cell = H * CFG.cell;
    u.u_gridF.value.set(width / cell, run / cell);
    u.u_run.value = run;

    if (!live) return;

    // La camera miroir : l'oeil reflechi sous le plan du sol. Une simple
    // translation, jamais une rotation -- le clone garde la direction de vue
    // de la camera principale.
    const mirrorY = y - H * CFG.reflGap;
    const cam = (this.reflectCamera ||= camera.clone() as THREE.PerspectiveCamera);
    cam.fov = camera.fov;
    cam.aspect = camera.aspect;
    cam.near = camera.near;
    cam.far = camera.far;
    cam.updateProjectionMatrix();
    cam.position.set(camera.position.x, 2 * mirrorY - camera.position.y, camera.position.z);
    cam.updateMatrixWorld();

    u.u_reflVP.value.copy(cam.matrixWorld).invert().premultiply(cam.projectionMatrix);
    u.u_reflSpread.value = CFG.reflSpread;
    u.u_reflLX.value = -W * CFG.reflLight;
  }

  // La passe de reflet, a lancer AVANT le rendu principal.
  renderReflection(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
    if (!this.reflectOn || !this.reflectCamera) return;

    if (!this.reflectTarget) {
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());
      this.reflectTarget = new THREE.WebGLRenderTarget(
        Math.max(1, Math.round(size.x * REFL_SCALE)),
        Math.max(1, Math.round(size.y * REFL_SCALE)),
      );
    }

    // Seules les cartes sont capturees : le sol lui-meme n'a pas a se
    // refleter dans son propre reflet.
    this.reflectCamera.layers.set(REFLECT_LAYER);

    renderer.setRenderTarget(this.reflectTarget);
    renderer.setClearAlpha(1);
    renderer.clear();
    renderer.render(scene, this.reflectCamera);
    renderer.setRenderTarget(null);

    this.material.uniforms.u_refl.value = this.reflectTarget.texture;
  }

  resize() {
    // La cible suit la taille du buffer : on la jette, elle se recree a la
    // bonne dimension a la prochaine passe.
    this.reflectTarget?.dispose();
    this.reflectTarget = null;
  }

  dispose() {
    gsap.killTweensOf(this.material.uniforms.u_alpha);
    this.reflectTarget?.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}

export default Floor;
