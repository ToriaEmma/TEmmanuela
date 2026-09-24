import * as THREE from "three";
import gsap from "gsap";
import { TRAIL_FRAGMENT, POST_VERTEX, POST_FRAGMENT } from "./ball.glsl";

// Le curseur "balle sous une toile", constantes relevees dans le bundle de la
// reference. Il y tourne globalement, sur tout le site, a la souris
// uniquement -- donc aussi sur la bande projets.

const TRAIL_SIZE = 256;     // largeur fixe du buffer ; la hauteur suit l'aspect
const DISSIPATE = 4;        // decroissance du champ, par seconde
const DIFFUSE = 40;         // diffusion, par seconde
const SPLAT_RADIUS = 0.04;  // rayon du tampon, en part de largeur

const FOLLOW = 7;           // taux du suiveur exponentiel, par seconde
const DEADBAND = 0.025;     // en dessous de ce retard, rien ne se passe
const KNEE = 0.08;          // genou doux du tanh sur le retard

const WARP = -0.045;        // u_ballWarp : negatif, on echantillonne vers le bas
const SHADE = -1.2;         // u_ballShade
const EDGE = [0.22, 0.5];   // u_ballEdge

const PRESENCE_IN = 0.35;   // apparition, s
const PRESENCE_OUT = 0.25;  // disparition, s

type Ball = {
  tx: number; ty: number;   // curseur brut
  sx: number; sy: number;   // suiveur amorti
  seen: boolean;
  p: number;                // presence, 0..1
  on: boolean;
  e: number;                // enveloppe : monte d'un coup, decroit a 4/s
};

export class BallTrail {
  private renderer: THREE.WebGLRenderer;
  private targets: THREE.WebGLRenderTarget[];
  private side = 0;
  private fresh = false;

  private trailScene = new THREE.Scene();
  private postScene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  private trailMaterial: THREE.ShaderMaterial;
  private postMaterial: THREE.ShaderMaterial;
  private sceneTarget: THREE.WebGLRenderTarget;

  private ball: Ball = { tx: 0, ty: 0, sx: 0, sy: 0, seen: false, p: 0, on: false, e: 0 };
  private disposed = false;

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;

    const quad = new THREE.PlaneGeometry(2, 2);

    this.trailMaterial = new THREE.ShaderMaterial({
      vertexShader: POST_VERTEX,
      fragmentShader: TRAIL_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        u_prev: { value: null },
        u_texel: { value: new THREE.Vector2(1 / TRAIL_SIZE, 1 / TRAIL_SIZE) },
        u_decay: { value: 0 },
        u_diff: { value: 0 },
        u_pos: { value: new THREE.Vector2(0.5, 0.5) },
        u_amp: { value: 0 },
        u_rad: { value: SPLAT_RADIUS },
        u_aspect: { value: 1 },
      },
    });
    this.trailScene.add(new THREE.Mesh(quad, this.trailMaterial));

    this.postMaterial = new THREE.ShaderMaterial({
      vertexShader: POST_VERTEX,
      fragmentShader: POST_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        u_scene: { value: null },
        u_aspect: { value: new THREE.Vector2(1, 1) },
        u_ballA: { value: 0 },
        u_ballWarp: { value: 0 },
        u_ballShade: { value: 0 },
        u_ballEdge: { value: new THREE.Vector2(EDGE[0], EDGE[1]) },
        u_trail: { value: null },
        u_trailTexel: { value: new THREE.Vector2(1 / TRAIL_SIZE, 1 / TRAIL_SIZE) },
      },
    });
    this.postScene.add(new THREE.Mesh(quad, this.postMaterial));

    const opts = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type: THREE.HalfFloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
    this.targets = [
      new THREE.WebGLRenderTarget(TRAIL_SIZE, TRAIL_SIZE, opts),
      new THREE.WebGLRenderTarget(TRAIL_SIZE, TRAIL_SIZE, opts),
    ];

    // La scene est rendue ici avant d'etre deformee.
    this.sceneTarget = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: true,
      stencilBuffer: false,
    });

    this.bind();
  }

  private onMove = (e: PointerEvent) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const b = this.ball;
    b.tx = e.clientX;
    b.ty = e.clientY;
    if (!b.seen) {
      // Premier mouvement : le suiveur demarre SOUS le curseur, sinon il
      // rattrape depuis l'origine et tamponne une trainee en travers de
      // l'ecran.
      b.seen = true;
      b.sx = b.tx;
      b.sy = b.ty;
    }
    this.show(true);
  };

  private onLeave = (e: PointerEvent) => {
    if (!e.relatedTarget) this.show(false);
  };

  private show(on: boolean) {
    const b = this.ball;
    if (b.on === on) return;
    b.on = on;
    if (!on) b.seen = false;
    gsap.to(b, {
      p: on ? 1 : 0,
      duration: on ? PRESENCE_IN : PRESENCE_OUT,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  private bind() {
    window.addEventListener("pointermove", this.onMove);
    document.documentElement.addEventListener("pointerleave", this.onLeave);
  }

  setSize(ww: number, wh: number, dpr: number) {
    const h = Math.max(1, Math.round((TRAIL_SIZE * wh) / ww));
    for (const t of this.targets) t.setSize(TRAIL_SIZE, h);

    this.trailMaterial.uniforms.u_texel.value.set(1 / TRAIL_SIZE, 1 / h);
    this.trailMaterial.uniforms.u_aspect.value = ww / wh;
    this.postMaterial.uniforms.u_trailTexel.value.set(1 / TRAIL_SIZE, 1 / h);
    this.postMaterial.uniforms.u_aspect.value.set(ww / wh, 1);

    this.sceneTarget.setSize(Math.round(ww * dpr), Math.round(wh * dpr));
    this.fresh = false;
  }

  // L'amplitude du tampon n'est PAS la vitesse brute : c'est le RETARD entre
  // le curseur et un suiveur amorti, en part de largeur, avec une zone morte
  // puis un genou doux, puis mis au carre. C'est la "tension" : le tissu
  // resiste, et la resistance est la distance dont la balle a pris de
  // l'avance sur la toile.
  private syncBall(dt: number) {
    const b = this.ball;
    b.e *= Math.exp(-DISSIPATE * dt);

    const ww = window.innerWidth;
    const wh = window.innerHeight;
    let amp = 0;

    if (b.p > 0.001 && b.seen) {
      const k = 1 - Math.exp(-FOLLOW * dt);
      b.sx += (b.tx - b.sx) * k;
      b.sy += (b.ty - b.sy) * k;

      const lag = Math.hypot(b.tx - b.sx, b.ty - b.sy) / ww;
      const t = Math.tanh(Math.max(0, lag - DEADBAND) / KNEE);
      amp = t * t;

      const u = this.trailMaterial.uniforms;
      // Le tampon suit le curseur BRUT, pas le suiveur : c'est la balle qui
      // marque la toile, le suiveur ne sert qu'a mesurer le retard.
      u.u_pos.value.set(b.tx / ww, 1 - b.ty / wh);
      u.u_amp.value = amp;
      u.u_rad.value = SPLAT_RADIUS;
    } else {
      this.trailMaterial.uniforms.u_amp.value = 0;
    }

    b.e = Math.max(b.e, amp);

    const live = b.e > 0.004;
    const u = this.postMaterial.uniforms;
    u.u_ballA.value = live ? b.p : 0;
    u.u_ballWarp.value = WARP;
    u.u_ballShade.value = SHADE;

    return live;
  }

  private step(dt: number) {
    if (!this.fresh) {
      this.fresh = true;
      for (const t of this.targets) {
        this.renderer.setRenderTarget(t);
        this.renderer.setClearColor(0x000000, 1);
        this.renderer.clear();
      }
    }

    const read = this.targets[this.side];
    const write = this.targets[1 - this.side];
    const u = this.trailMaterial.uniforms;

    u.u_prev.value = read.texture;
    // Les deux taux arrivent mis en forme par dt, donc une frame a 120Hz et
    // une frame sautee laissent le meme tissu derriere elles.
    u.u_decay.value = Math.exp(-DISSIPATE * dt);
    u.u_diff.value = 1 - Math.exp(-DIFFUSE * dt);

    this.renderer.setRenderTarget(write);
    this.renderer.render(this.trailScene, this.camera);
    this.renderer.setRenderTarget(null);

    this.side = 1 - this.side;
    this.postMaterial.uniforms.u_trail.value = write.texture;
  }

  // Rend la scene, deformee si la balle est vivante. Sinon on passe par la
  // voie rapide : pas de render target du tout, la page au repos ne paie rien
  // pour un effet qui ne se voit pas.
  render(scene: THREE.Scene, camera: THREE.Camera, dt: number) {
    if (this.disposed) return;

    const live = this.syncBall(Math.min(dt, 1 / 20));

    if (!live) {
      this.renderer.setRenderTarget(null);
      this.renderer.render(scene, camera);
      return;
    }

    this.step(Math.min(dt, 1 / 20));

    this.renderer.setRenderTarget(this.sceneTarget);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();
    this.renderer.render(scene, camera);

    this.postMaterial.uniforms.u_scene.value = this.sceneTarget.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.camera);
  }

  dispose() {
    this.disposed = true;
    window.removeEventListener("pointermove", this.onMove);
    document.documentElement.removeEventListener("pointerleave", this.onLeave);
    gsap.killTweensOf(this.ball);
    for (const t of this.targets) t.dispose();
    this.sceneTarget.dispose();
    this.trailMaterial.dispose();
    this.postMaterial.dispose();
  }
}

export default BallTrail;
