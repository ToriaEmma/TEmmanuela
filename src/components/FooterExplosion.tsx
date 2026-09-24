import { useEffect, useRef } from "react";

/** Vignettes projetees depuis le bas du footer. Les visuels sont ceux des
    projets mis en avant sur la home. */
const images = [
  "/REVOLU/big vintagd.webp",
  "/REVOLU/big secure.webp",
  "/newbig.webp",
  "/REVOLU/big venis.webp",
  "/REVOLU/big cats.webp",
  "/REVOLU/DOGBIG.webp",
];

/** Meme modele physique que la reference : propulsion vers le haut, gravite
    constante, friction sur chaque composante et rotation qui s'amortit. */
class Particle {
  x = 0;
  y = 0;
  vx: number;
  vy: number;
  rotation = 0;
  rotationSpeed: number;

  constructor(private element: HTMLElement, width: number, height: number) {
    this.x = (Math.random() - 0.5) * width * 0.6;
    this.y = 0.5 * height;
    this.vx = (Math.random() - 0.5) * 25;
    this.vy = -20 - 18 * Math.random();
    this.rotationSpeed = (Math.random() - 0.5) * 12;
    this.element.style.opacity = "1";
  }

  update() {
    this.vy += 0.3;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.rotationSpeed *= 0.98;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
  }
}

const FooterExplosion = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let particles: Particle[] = [];

    const fire = () => {
      window.cancelAnimationFrame(frame);
      const { width, height } = container.getBoundingClientRect();
      particles = itemRefs.current
        .filter((el): el is HTMLImageElement => Boolean(el))
        .map((el) => new Particle(el, width, height));

      const tick = () => {
        particles.forEach((p) => p.update());
        frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    };

    // L'explosion se rejoue a chaque fois que le footer revient a l'ecran.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fire();
          } else {
            window.cancelAnimationFrame(frame);
            itemRefs.current.forEach((el) => {
              if (el) el.style.opacity = "0";
            });
          }
        });
      },
      { threshold: 0.35 },
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[50] overflow-hidden"
    >
      {images.map((src, index) => (
        <img
          key={src}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          src={src.replace(/ /g, "%20")}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute left-1/2 top-1/2 h-auto w-[140px] opacity-0 md:w-[210px]"
        />
      ))}
    </div>
  );
};

export default FooterExplosion;
