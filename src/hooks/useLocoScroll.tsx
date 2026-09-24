"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";
// Identifie l'instance Locomotive courante. Le hook peut se monter deux fois
// de suite (React StrictMode en dev, ou un simple remontage) : dans ce cas le
// cleanup de l'ancienne instance s'execute APRES la construction de la
// nouvelle. Or Locomotive attache ses ecouteurs molette a `window` via
// VirtualScroll, et destroy() fait removeEventListener avec la MEME reference
// de fonction pour toutes les instances. Le cleanup de l'ancienne arrachait
// donc l'ecouteur de la nouvelle : plus rien ne captait la molette, delta.y
// restait a 0 et la page semblait bloquee jusqu'a ce qu'un autre evenement
// reveille le scroll. Ce compteur permet a un cleanup obsolete de se
// desister.
// Etat porte par `window` et non par le module : en dev, Vite (HMR) peut
// evaluer le module plusieurs fois, ce qui donnerait autant de copies
// independantes de ces variables -- et le partage d'instance ne marcherait
// plus.
type LocoShared = { instance: LocomotiveScroll | null; el: HTMLElement | null; refs: number };
const shared: LocoShared = ((window as unknown as { __locoShared?: LocoShared }).__locoShared ??= {
  instance: null,
  el: null,
  refs: 0,
});


const useLocoScroll = () => {
  gsap.registerPlugin(ScrollTrigger);
  const [locoScroll, setLocoScroll] = useState<LocomotiveScroll | null>(null);
  const [progress, setProgress] = useState(0);
  useLayoutEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      let frame = 0;
      const updateNativeProgress = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          setProgress(window.scrollY);
        });
      };
      updateNativeProgress();
      window.addEventListener("scroll", updateNativeProgress, { passive: true });
      return () => {
        window.removeEventListener("scroll", updateNativeProgress);
        window.cancelAnimationFrame(frame);
      };
    }

    //importing locomotive scroll
    //getting the scroller element from the dom
    const scrollEl: HTMLElement | null = document.querySelector(".main-container");
    if (!scrollEl) return;
    // Locomotive appelle window.scrollTo(0, 0) dans son constructeur. Comme
    // il est construit juste au moment ou le loader se retire, ce reset
    // tombait pile sur le premier geste de l'utilisateur et l'annulait : on
    // croyait que le defilement bloquait et qu'il fallait insister. On rend
    // donc scrollTo inoffensif pendant la construction, puis on le rend.
    const nativeScrollTo = window.scrollTo;
    window.scrollTo = (() => {}) as typeof window.scrollTo;

    // Une instance vit deja ?
    //  - sur le MEME conteneur : on la reprend telle quelle.
    //  - sur un ANCIEN conteneur (retour sur l'accueil apres une autre page :
    //    React a recree la div) : on la DETRUIT avant d'en construire une
    //    neuve. Sans cela l'ancienne restait branchee sur `window` et se
    //    disputait la molette avec la nouvelle : l'une bougeait le transform
    //    pendant que l'autre restait figee a 0, d'ou le scroll qui accroche.
    const reusedInst = Boolean(shared.instance && shared.el === scrollEl);
    if (shared.instance && shared.el !== scrollEl) {
      shared.instance.destroy();
      shared.instance = null;
      shared.el = null;
      shared.refs = 0;
    }
    const locoScrollInstance = reusedInst
      ? (shared.instance as LocomotiveScroll)
      : new LocomotiveScroll({
          el: scrollEl,
          smooth: true,
          multiplier: 1.5,
        });

    window.scrollTo = nativeScrollTo;
    shared.instance = locoScrollInstance;
    shared.el = scrollEl;
    shared.refs += 1;
    // Declare avant le callback de scroll, qui le renseigne des le premier
    // deplacement reel.
    let userScrolled = false;
    setLocoScroll(locoScrollInstance);
    const restorationKey = `emmanuela-scroll:${window.location.pathname}${window.location.search}`;
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    // every time the locomotive scroll updates (scrolls) we want the scrolltrigger from gsap to update
    //this is like sync the positioning of the two
    locoScrollInstance.on("scroll", ScrollTrigger.update);
    locoScrollInstance.on("scroll", (args) => {
      setProgress(args.scroll.y);
      // Des que l'utilisateur defile, plus aucune restauration ne doit
      // s'executer : elle le ramenerait en arriere en plein geste.
      if (args.scroll.y > 0) userScrolled = true;
      sessionStorage.setItem(restorationKey, String(args.scroll.y));
    });

    // La restauration est rejouee jusqu'a 3s apres le chargement (les images
    // arrivent en differe, la position n'est fiable qu'apres coup). Mais si
    // l'utilisateur defile DEJA, chaque rappel le ramene a la position
    // sauvegardee : son geste est annule, et la page recule meme parfois.
    // Des qu'il touche au scroll, on abandonne la restauration.
    //
    // Ces ecouteurs etaient poses en { once: true } : le drapeau se levait
    // bien, mais un rappel de restauration encore en vol (celui de 3s)
    // avalait quand meme le tout premier geste -- la page ne bougeait pas et
    // il fallait "forcer" pour demarrer. On annule donc les minuteurs
    // restants des le premier geste, au lieu de seulement lever un drapeau.
    const markUserScroll = () => {
      if (userScrolled) return;
      userScrolled = true;
      restoreTimers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("load", restoreSavedPosition);
      // On ne touche PAS au sizeObserver ici. Le loader dure plusieurs
      // secondes : l'utilisateur defile donc presque toujours AVANT que les
      // images n'aient donne au conteneur sa vraie hauteur. Couper l'observer
      // sur son premier geste tuait la seule mesure prevue, et Locomotive
      // restait sur une limite d'un ecran -- le defilement ne repondait pas
      // et il fallait insister. measureOnce conserve desormais la position
      // courante, il est donc sans danger pendant un geste.
    };

    const restoreSavedPosition = () => {
      if (userScrolled) return;
      if (window.location.hash) return;
      const savedPosition = Number(sessionStorage.getItem(restorationKey));
      if (!Number.isFinite(savedPosition) || savedPosition <= 0) return;
      locoScrollInstance.update();
      locoScrollInstance.scrollTo(savedPosition, { duration: 0, disableLerp: true });
    };
    const restoreTimers = [0, 250, 1000, 3000].map((delay) => window.setTimeout(restoreSavedPosition, delay));
    // Poses apres restoreTimers/restoreSavedPosition : markUserScroll les
    // reference, et un const n'existe pas avant sa ligne de declaration.
    window.addEventListener("load", restoreSavedPosition);
    //

    ScrollTrigger.scrollerProxy(scrollEl, {
      // ScrollTrigger ECRIT la position pendant refresh() : il la sauvegarde
      // puis la restaure. Cette ecriture passait directement par scrollTo(),
      // qui appelle stopScrolling() en interne et TUE le mouvement en cours.
      // Comme plusieurs sections rafraichissent ~1s apres leur montage, le
      // geste de l'utilisateur etait annule pile au moment ou il commencait a
      // defiler : la molette repondait une fois sur deux.
      //
      // On ignore donc une ecriture qui ne deplacerait le scroll que d'un
      // cheveu (c'est le cas de la restauration de refresh()), et on ne
      // relaie que les vrais sauts demandes par une animation.
      scrollTop(value) {
        const currentY = locoScrollInstance.scroll?.instance?.scroll?.y ?? 0;
        if (!arguments.length) return currentY;
        if (Math.abs((value as number) - currentY) < 2) return currentY;
        return locoScrollInstance.scrollTo(value, 0);
      },
      scrollLeft(value) {
        const currentX = locoScrollInstance.scroll?.instance?.scroll?.x ?? 0;
        if (!arguments.length) return currentX;
        if (Math.abs((value as number) - currentX) < 2) return currentX;
        return locoScrollInstance.scrollTo(value, 0);
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: scrollEl?.style.transform ? "transform" : "fixed",
    });

    // Remesure des hauteurs sans annuler le geste en cours.
    //
    // Deux contraintes opposees :
    //  - update() DOIT finir par s'executer, sinon Locomotive garde une
    //    limite de scroll perimee et la page bute contre un mur invisible.
    //  - update() reinitialise l'instance : appele en plein geste, il jette
    //    la cible interne (delta.y) et le mouvement s'arrete net.
    //
    // On remesure donc immediatement, puis on REND sa cible au scroll en
    // cours. C'est la difference avec une simple restauration de position :
    // reposer scroll.y seul perdrait le mouvement en vol, alors que reposer
    // delta.y laisse Locomotive terminer sa course normalement.
    const remeasurePreservingScroll = () => {
      const instance = locoScrollInstance.scroll?.instance;
      const current = instance?.scroll?.y ?? 0;
      const target = instance?.delta?.y ?? current;

      locoScrollInstance.update();

      // update() a remis l'instance a zero : on restaure la position affichee
      // ET la cible, pour que le geste en cours continue sa course.
      const after = locoScrollInstance.scroll?.instance;
      if (after && target > 0) {
        const limit = after.limit?.y ?? target;
        const clamped = Math.min(target, limit);
        // scrollTo repositionne proprement (met a jour le transform et les
        // ScrollTriggers) ; disableLerp evite un saut anime visible.
        locoScrollInstance.scrollTo(Math.min(current, limit), { duration: 0, disableLerp: true });
        // Puis on redonne la cible : si l'utilisateur defilait encore, le
        // mouvement reprend vers elle au lieu de s'arreter sur place.
        if (after.delta) after.delta.y = clamped;
      }
    };

    // Branche sur l'evenement "refresh" de ScrollTrigger. Plusieurs sections
    // de l'accueil (WorksShowcase, ServiceCards) appellent ScrollTrigger
    // .refresh() une seconde apres leur montage -- donc pile au moment ou le
    // hero apparait. En passant par remeasurePreservingScroll, ces refresh ne peuvent
    // plus avaler le geste de l'utilisateur.
    const lsUpdate = () => remeasurePreservingScroll();

    ScrollTrigger.addEventListener("refresh", lsUpdate);
    ScrollTrigger.refresh();

    // Une seule remesure, quand le contenu prend sa vraie hauteur : le
    // conteneur nait vide (le loader couvre la page) et Locomotive retiendrait
    // sinon une limite trop courte. On ne la rejoue PAS en boucle -- chaque
    // update() remet le scroll natif a zero, ce qui annulait le geste en
    // cours et faisait reculer la page.
    let measured = false;
    const measureOnce = () => {
      if (measured || scrollEl.scrollHeight <= window.innerHeight) return;
      measured = true;
      sizeObserver.disconnect();
      // Deux frames de decalage : l'observer se declenche pendant le rendu du
      // contenu, alors que Locomotive n'a pas encore fini de se caler. Un
      // update() a cet instant etait sans effet, et le tout premier cran de
      // molette restait sans reponse -- il fallait insister une fois.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(remeasurePreservingScroll);
      });
    };
    const sizeObserver = new ResizeObserver(measureOnce);
    sizeObserver.observe(scrollEl);

    // Poses apres sizeObserver : markUserScroll le reference.
    // PAS de { once: true } : le hook peut se monter deux fois (StrictMode,
    // remontage). Avec `once`, le premier montage consommait l'ecouteur et
    // celui du second n'etait jamais appele -- ses restoreTimers (jusqu'a 3s)
    // survivaient donc au premier geste et ramenaient le scroll a 0 en plein
    // defilement. C'est le "blocage" de ~3s au chargement : les premiers
    // crans de molette etaient avales.
    // markUserScroll est idempotent (il sort si userScrolled), donc le
    // laisser se declencher plusieurs fois est sans effet de bord.
    window.addEventListener("wheel", markUserScroll, { passive: true });
    window.addEventListener("touchstart", markUserScroll, { passive: true });
    window.addEventListener("keydown", markUserScroll);

    // Cleanup on component unmount
    return () => {
      if (locoScrollInstance) {
        restoreTimers.forEach((timer) => window.clearTimeout(timer));
        window.removeEventListener("wheel", markUserScroll);
        window.removeEventListener("touchstart", markUserScroll);
        window.removeEventListener("keydown", markUserScroll);
        sizeObserver.disconnect();
        window.removeEventListener("load", restoreSavedPosition);
        ScrollTrigger.removeEventListener("refresh", lsUpdate);
        // Ne detruire que si AUCUNE instance plus recente n'a pris le relais.
        // destroy() retire les ecouteurs molette de `window`, qui sont
        // partages entre instances : le faire ici alors qu'une nouvelle
        // instance vient de les poser la laisserait sourde a la molette.
        shared.refs -= 1;
        if (shared.refs <= 0 && shared.instance === locoScrollInstance) {
          shared.instance = null;
          shared.el = null;
          shared.refs = 0;
          locoScrollInstance.destroy();
        }
      }
    };
  }, []);

  return { locoScroll, progress };
};

export default useLocoScroll;
