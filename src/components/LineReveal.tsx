import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

// La revelation ligne par ligne de la reference (lorisbukvic.graphics) : le
// texte est decoupe en LIGNES, chaque ligne est enfermee dans son propre
// conteneur en overflow hidden, et elles remontent en decale.
//
// Transform SEUL -- pas d'opacite, pas de clip-path, pas de flou. Ce sont les
// masques qui font la revelation : chaque ligne part une fois et demie sa
// propre hauteur plus bas et glisse dans sa fenetre.
//
// La reference passe par SplitText (plugin GSAP, gratuit depuis la 3.13). Le
// projet est en 3.12.5, donc le decoupage est fait a la main ici : on mesure
// ou le navigateur a coupe les lignes en comparant le `top` de chaque mot.
// C'est le meme resultat pour une vingtaine de lignes de code, sans toucher a
// une dependance dont tout le site depend.

const Y_PERCENT = 150;   // une ligne et demie plus bas
const DURATION = 1.2;
const STAGGER = 0.05;
const START = "top 85%"; // se declenche quand le haut du bloc atteint 85% du cadre

type Props = {
  children: string;
  className?: string;
  as?: "p" | "h2" | "h3";
  scroller?: Element | string;
  // La langue n'est pas passee ici : la bascule du site est en CSS (les deux
  // versions coexistent, une seule est affichee). Le composant est donc monte
  // une fois par langue, et celle qui est masquee ne coute que son decoupage.
  lang?: "fr" | "en";
};

// Decoupe en lignes : chaque mot devient un span, et on regroupe les mots qui
// partagent la meme position verticale. C'est le navigateur qui decide ou
// couper -- on ne fait que lire son verdict.
const splitLines = (el: HTMLElement, text: string) => {
  el.textContent = "";

  const probes: HTMLSpanElement[] = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const span = document.createElement("span");
    span.textContent = word;
    el.append(span, document.createTextNode(" "));
    probes.push(span);
  }

  const lines: string[][] = [];
  let top: number | null = null;
  for (const span of probes) {
    const y = span.offsetTop;
    // Tolerance d'un pixel : les exposants et les accents decalent le offsetTop
    // de quelques dixiemes sans pour autant creer une nouvelle ligne.
    if (top === null || Math.abs(y - top) > 1) {
      top = y;
      lines.push([]);
    }
    lines[lines.length - 1].push(span.textContent ?? "");
  }

  el.textContent = "";

  // Le texte complet reste lisible par un lecteur d'ecran : les lignes ne sont
  // qu'un artefact de mise en page, pas une structure a annoncer.
  el.setAttribute("aria-label", text);

  return lines.map((words) => {
    const mask = document.createElement("span");
    mask.style.display = "block";
    mask.style.overflow = "hidden";

    const line = document.createElement("span");
    line.style.display = "block";
    line.textContent = words.join(" ");
    line.setAttribute("aria-hidden", "true");

    mask.appendChild(line);
    el.appendChild(mask);
    return line;
  });
};

const LineReveal = ({ children, className, as: Tag = "p", scroller }: Props) => {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ctx: gsap.Context | null = null;
    let frame = 0;
    let cancelled = false;

    const build = () => {
      if (cancelled || !el) return;

      // Un bloc masque (la langue inactive) n'a pas de mise en page : tous les
      // offsetTop valent 0 et le decoupage mettrait tout sur une seule ligne.
      // On attend qu'il soit affiche -- il le sera si l'on change de langue.
      if (!el.offsetParent && el.offsetHeight === 0) return;

      // Le conteneur de defilement designe par selecteur peut ne pas encore
      // exister (une modale qui vient de s'ouvrir) : ScrollTrigger le
      // resoudrait alors en undefined et planterait. On reessaie a la frame
      // suivante plutot que de partir sans lui, et on lui passe ensuite
      // l'ELEMENT -- un selecteur serait re-resolu a chaque refresh, y compris
      // apres la fermeture de la modale, quand il ne designe plus rien.
      let target: Element | undefined;
      if (typeof scroller === "string") {
        const found = document.querySelector(scroller);
        if (!found) {
          frame = requestAnimationFrame(build);
          return;
        }
        target = found;
      } else {
        target = scroller;
      }

      ctx?.revert();
      const lines = splitLines(el, children);
      if (!lines.length) return;

      ctx = gsap.context(() => {
        gsap.from(lines, {
          yPercent: Y_PERCENT,
          duration: DURATION,
          stagger: STAGGER,
          // La reference ecrit ease:"out", qui n'est pas un nom valide -- GSAP
          // retombe silencieusement sur sa valeur par defaut. C'est donc
          // power1.out qui joue reellement sur le site.
          ease: "power1.out",
          scrollTrigger: {
            trigger: el,
            scroller: target,
            start: START,
            // Rejoue a la remontee, comme la reference.
            toggleActions: "play none none reverse",
          },
        });
      }, el);
    };

    // Les polices changent ou les lignes se coupent : decouper avant qu'elles
    // soient chargees donnerait des lignes fausses.
    document.fonts.ready.then(() => {
      frame = requestAnimationFrame(build);
    });

    // Un changement de largeur recoupe les lignes ailleurs, donc on refait.
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 150);
    };
    window.addEventListener("resize", onResize);
    // La langue qui devient visible n'avait pas de mise en page a mesurer :
    // c'est maintenant qu'il faut la decouper.
    window.addEventListener("language-change", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("language-change", onResize);
      ctx?.revert();
      if (el) {
        el.textContent = children;
        el.removeAttribute("aria-label");
      }
    };
  }, [children, scroller]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
};

export default LineReveal;
