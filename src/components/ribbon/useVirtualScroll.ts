import { useEffect, useRef } from "react";
import gsap from "gsap";

// Le scroll virtuel de la reference. La page ne defile PAS : <main> est
// fixed inset-0 overflow-hidden, et la molette alimente une cible qui est
// rattrapee par lerp a chaque frame. Toutes les constantes sont celles
// relevees dans le bundle d'origine.

const WHEEL_MULT = 1.25;   // multiplicateur molette
const TOUCH_MULT = 3.25;   // multiplicateur touchmove
const FLING_MULT = 35;     // multiplicateur de lancer au touchend
const KEY_STEP = 100;      // pas des fleches, en px
const PAGE_STEP = 0.9;     // pas des touches page, x hauteur de fenetre

const LERP = 0.1;          // fraction rattrapee par frame a 60fps
const RUBBER = 1;          // portee de l'elastique, x largeur de viewport

export type ScrollState = { t: number; a: number };

type Options = {
  enabled?: boolean;
  onTick?: (state: ScrollState, framesElapsed: number) => void;
};

export const useVirtualScroll = ({ enabled = true, onTick }: Options = {}) => {
  const state = useRef<ScrollState>({ t: 0, a: 0 });
  const tickRef = useRef(onTick);
  tickRef.current = onTick;

  useEffect(() => {
    if (!enabled) return;

    const s = state.current;
    let touchY = 0;
    let touchX = 0;
    let lastTouchDelta = 0;

    // L'elastique s'applique a la CIBLE, pas a la valeur courante : l'avance
    // (t - a) est ecrasee par tanh sur une largeur de viewport, donc la cible
    // ne peut jamais devancer l'actuel de plus d'un ecran. Ca borne la
    // velocite, et donc tous les termes du shader qui en dependent.
    const push = (delta: number) => {
      s.t += delta;
      const reach = window.innerWidth * RUBBER;
      const lead = s.t - s.a;
      s.t = s.a + Math.tanh(lead / reach) * reach;
    };

    // Un panneau ouvert par-dessus (la modale projet) gele la bande : la
    // molette doit defiler DANS le panneau, pas faire glisser le ruban
    // derriere lui. Le drapeau est pose sur le document plutot que passe en
    // prop -- le ruban n'a pas a connaitre l'existence de la modale.
    const frozen = () => document.documentElement.dataset.ribbonFrozen === "1";

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || frozen()) return;
      e.preventDefault();
      // deltaMode 1 = lignes, 2 = pages.
      const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      // La molette VERTICALE pilote l'horizontale : c'est le geste de la
      // reference, et deltaX est ajoute pour les trackpads.
      push((e.deltaY * scale + e.deltaX * scale) * WHEEL_MULT);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      touchX = e.touches[0].clientX;
      lastTouchDelta = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (frozen()) return;
      const y = e.touches[0].clientY;
      const x = e.touches[0].clientX;
      // Les deux axes etaient ADDITIONNES : un glissement vertical et un
      // glissement horizontal se compensaient ou s'ajoutaient selon l'angle
      // du doigt, si bien que le ruban partait dans le mauvais sens ou
      // n'avancait pas. On ne garde que l'axe dominant du geste, et le
      // defilement repond alors aussi bien vers le haut que vers le bas.
      const dy = touchY - y;
      const dx = touchX - x;
      const delta = (Math.abs(dy) >= Math.abs(dx) ? dy : dx) * TOUCH_MULT;
      touchY = y;
      touchX = x;
      lastTouchDelta = delta;
      push(delta);
    };

    const onTouchEnd = () => {
      push(lastTouchDelta * FLING_MULT);
      lastTouchDelta = 0;
    };

    const onKey = (e: KeyboardEvent) => {
      if (frozen()) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") push(KEY_STEP);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") push(-KEY_STEP);
      else if (e.key === "PageDown") push(window.innerHeight * PAGE_STEP);
      else if (e.key === "PageUp") push(-window.innerHeight * PAGE_STEP);
      else return;
      e.preventDefault();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);

    // gsap.ticker plutot qu'un rAF maison : lagSmoothing(0) pour que le ratio
    // reste le nombre reel de frames ecoulees. Sans ca, GSAP ecrete les gros
    // deltas et le lerp avance moins que le temps reellement passe.
    gsap.ticker.lagSmoothing(0);

    // La derniere position REELLEMENT dessinee. Tant que la bande est
    // immobile, il n'y a rien a redessiner : sans cette garde, le ticker
    // relancait a chaque frame une passe WebGL complete (sync des uniformes
    // de chaque carte, reflet du sol, render) pour une image identique a la
    // precedente -- c'est ce qui tenait le thread occupe en permanence et
    // rendait le reste du site poussif, modale comprise.
    let lastDrawn = Number.NaN;
    // Une passe de plus apres l'arret : la toute derniere frame doit etre
    // celle de la position finale, pas celle d'avant.
    let settled = false;

    const tick = (_time: number, deltaTime: number) => {
      // ratio = frames ecoulees a 60fps, clampe a 2 pour qu'un gros hoquet ne
      // fasse pas sauter la bande.
      const ratio = Math.min(deltaTime / (1000 / 60), 2);
      s.a = s.a + (s.t - s.a) * LERP * ratio;
      // Quantifie au centieme de pixel : en dessous, rien n'est visible et le
      // flottant continue de reveiller le ticker indefiniment.
      s.a = Math.round(s.a * 100) / 100;

      if (s.a === lastDrawn) {
        if (settled) return;
        settled = true;
      } else {
        settled = false;
      }
      lastDrawn = s.a;

      tickRef.current?.(s, ratio);
    };

    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
      gsap.ticker.remove(tick);
    };
  }, [enabled]);

  return state;
};

export default useVirtualScroll;
