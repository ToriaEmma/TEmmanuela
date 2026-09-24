import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Visuels empiles au centre : ils apparaissent l'un apres l'autre en
    grandissant, puis le bloc entier sort par le bas. */
const images = [
  "/loader/1.webp",
  "/loader/2.webp",
  "/loader/3.webp",
  "/loader/4.webp",
  "/loader/5.webp",
  "/loader/6.webp",
  "/loader/7.webp",
];

const HEADING = "Emmanuela©";

/** Colonnes du compteur. La 1re ne monte que jusqu'a "1", les deux autres
    font defiler toute la serie pour retomber sur "0" : on lit donc 100. */
const counter1 = ["0", "1"];
const counter2 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const counter3 = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

const SiteLoader = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Chaque colonne monte jusqu'a la DERNIERE occurrence de son chiffre
      // cible, en pixels reels — c'est la methode du site de reference.
      const animateCounter = (selector: string, targetDigit: string, duration: number) => {
        const column = rootRef.current?.querySelector<HTMLElement>(selector);
        if (!column) return;
        const nums = column.querySelectorAll<HTMLElement>(".loader-num");
        if (!nums.length) return;

        const numHeight = nums[0].clientHeight;
        let targetIndex = [...nums].map((n) => n.textContent).lastIndexOf(targetDigit);
        if (targetIndex === -1) targetIndex = nums.length - 1;

        gsap.to(column, { y: -(targetIndex * numHeight), duration, ease: "power2.inOut" });
      };

      // Les images grandissent en cascade, puis le bloc sort vers le bas
      // pendant que les chiffres filent a droite.
      const animateImages = () => {
        const tl = gsap.timeline();
        tl.from(".site-loader__image", {
          scale: 0,
          duration: 0.8,
          ease: "power2.inOut",
          stagger: { each: 0.2, from: "start" },
        }).to(".site-loader__images-inner", {
          y: "100%",
          duration: 1.25,
          ease: "power3.inOut",
          onStart: () => {
            gsap.to(".loader-digit", { x: "300%", duration: 1.25, ease: "power3.inOut" });
          },
        });
        return tl;
      };

      // Les lettres du titre montent, marquent un temps, puis repartent en
      // haut dans l'ordre inverse.
      const animateHeading = () => {
        const tl = gsap.timeline();
        tl.from(".loader-char", {
          yPercent: 100,
          duration: 0.75,
          stagger: { each: 0.025, from: "start" },
          ease: "power3.inOut",
        }).to(".loader-char", {
          yPercent: -100,
          duration: 0.75,
          delay: 0.25,
          stagger: { each: 0.025, from: "end" },
          ease: "power3.inOut",
        });
        return tl;
      };

      // force3D : les transforms passent sur le GPU, ce qui evite les
      // saccades quand plusieurs elements bougent en meme temps.
      gsap.set([".site-loader__image", ".site-loader__images-inner", ".loader-char", ".loader-digit"], { force3D: true });

      const tl = gsap.timeline();

      tl.add(() => {
        animateCounter(".counter-1", "1", 2.75);
        animateCounter(".counter-2", "0", 2.5);
        animateCounter(".counter-3", "0", 2.5);
      });

      tl.add(animateImages(), "<");
      tl.add(animateHeading(), "<90%");

      // Les volets se referment par clip-path, puis tout s'efface.
      tl.to(".site-loader__panel--top", {
        clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)",
        duration: 1.25,
        ease: "power4.out",
        onStart: () => {
          gsap.to(".site-loader__panel--bottom", {
            clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
            duration: 1.25,
            ease: "power4.out",
          });
        },
      }).to(".site-loader", { opacity: 0, duration: 1, ease: "power2.out" }, "<85%");
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="site-loader" role="status" aria-label="Chargement du site">
      <div className="site-loader__panel site-loader__panel--top" />
      <div className="site-loader__panel site-loader__panel--bottom" />

      {/* Toutes les images occupent la meme case : elles se superposent. */}
      <div className="site-loader__images" aria-hidden="true">
        <div className="site-loader__img">
          <div className="site-loader__images-inner">
            {images.map((src) => (
              <img key={src} className="site-loader__image" src={src.replace(/ /g, "%20")} alt="" loading="eager" decoding="async" fetchPriority="high" />
            ))}
          </div>
        </div>
      </div>

      <div className="site-loader__heading">
        <h2>
          {/* Un span masque par lettre : c'est ce que fait SplitText. */}
          {HEADING.split("").map((char, index) => (
            <span key={index} className="loader-char-mask">
              <span className="loader-char">{char === " " ? " " : char}</span>
            </span>
          ))}
        </h2>
      </div>

      <div className="site-loader__counter" aria-hidden="true">
        <div className="loader-digit counter-1">
          {counter1.map((n, i) => <div key={i} className="loader-num">{n}</div>)}
        </div>
        <div className="loader-digit counter-2">
          {counter2.map((n, i) => <div key={i} className="loader-num">{n}</div>)}
        </div>
        <div className="loader-digit counter-3">
          {counter3.map((n, i) => <div key={i} className="loader-num">{n}</div>)}
        </div>
      </div>
    </div>
  );
};

export default SiteLoader;
