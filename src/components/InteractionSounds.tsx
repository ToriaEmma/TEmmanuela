import { useEffect } from "react";
import { soundEffectsEnabled } from "../hooks/useSoundEffects";
import { navigateTo } from "../utils/navigation";

const InteractionSounds = () => {
  useEffect(() => {
    const linkSound = new Audio("/passe.mp3");
    const cardSound = new Audio("/card pass.mp3");
    const clickSound = new Audio("/click.mp3");
    linkSound.preload = "auto";
    cardSound.preload = "auto";
    cardSound.volume = 0.65;
    cardSound.load();
    clickSound.preload = "auto";
    clickSound.volume = 0.45;
    const createPool = (source: HTMLAudioElement, volume: number) => Array.from({ length: 5 }, () => {
      const sound = new Audio(source.src);
      sound.preload = "auto";
      sound.volume = volume;
      sound.load();
      return sound;
    });
    const linkPool = createPool(linkSound, 0.75);
    const cardPool = createPool(cardSound, 0.85);
    const clickPool = createPool(clickSound, 0.55);
    let linkPoolIndex = 0;
    let cardPoolIndex = 0;
    let clickPoolIndex = 0;
    const playPool = (pool: HTMLAudioElement[], index: number) => {
      const sound = pool[index % pool.length];
      sound.currentTime = 0;
      void sound.play().catch(() => undefined);
    };

    const playLinkSound = (event: PointerEvent) => {
      if (!soundEffectsEnabled()) return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href], nav button, [data-nav-link], [data-theme-sound], [role='link']");
      if (!link || link.closest("[data-project-card]")) return;
      playPool(linkPool, linkPoolIndex++);
    };
    const delayLinkNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!link || link.closest("[data-project-card]") || link.target === "_blank" || link.hasAttribute("download")) return;
      const href = link.getAttribute("href");
      if (!href) return;
      event.preventDefault();
      window.setTimeout(() => {
        if (href.startsWith("#")) {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.replaceState(null, "", href);
        } else {
          navigateTo(link.href);
        }
      }, soundEffectsEnabled() ? 35 : 0);
    };

    const playCardSound = (event: PointerEvent) => {
      if (!soundEffectsEnabled()) return;
      const target = event.target as HTMLElement | null;
      const card = target?.closest("[data-project-card]");
      if (!card) return;
      playPool(cardPool, cardPoolIndex++);
    };
    // Desktop (mouse): play on hover. On touch devices there is no real hover,
    // and the tap already triggers playCardSound (pointerdown on [data-project-card]),
    // so we skip the synthetic mouseover here to avoid a double / mistimed sound.
    const playPosterHoverSound = (event: MouseEvent) => {
      if (!soundEffectsEnabled()) return;
      if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
      const target = event.target as HTMLElement | null;
      const poster = target?.closest("[data-poster-card]");
      if (!poster || (event.relatedTarget instanceof Node && poster.contains(event.relatedTarget))) return;
      playPool(cardPool, cardPoolIndex++);
    };
    const playClickSound = (event: PointerEvent) => {
      if (!soundEffectsEnabled()) return;
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-click-sound]")) return;
      playPool(clickPool, clickPoolIndex++);
    };
    const playPaletteSound = (event: PointerEvent) => {
      if (!soundEffectsEnabled()) return;
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-poster-sound]")) return;
      playPool(cardPool, cardPoolIndex++);
    };

    document.addEventListener("pointerdown", playLinkSound);
    document.addEventListener("pointerdown", playCardSound);
    document.addEventListener("pointerdown", playClickSound);
    document.addEventListener("pointerdown", playPaletteSound);
    document.addEventListener("click", delayLinkNavigation);
    document.addEventListener("mouseover", playPosterHoverSound);
    return () => {
      document.removeEventListener("pointerdown", playLinkSound);
      document.removeEventListener("pointerdown", playCardSound);
      document.removeEventListener("pointerdown", playClickSound);
      document.removeEventListener("pointerdown", playPaletteSound);
      document.removeEventListener("click", delayLinkNavigation);
      document.removeEventListener("mouseover", playPosterHoverSound);
    };
  }, []);

  return null;
};

export default InteractionSounds;
