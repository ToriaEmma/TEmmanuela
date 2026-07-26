import React, { useEffect, useRef } from "react";
import { LocalizedText } from "./LanguageToggle";
import MiniRunner from "./MiniRunner";
import ColorThemeToggle from "./ColorThemeToggle";
import { useSoundEffects } from "../hooks/useSoundEffects";

const bubbleWords = [
  "React", "GSAP", "Three.js", "Creative Dev", "UI/UX", "Bénin"
];

const Footer = () => {
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundEffects();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!bubbleRefs.current.some(Boolean)) return;

    let animationFrameId: number;
    let isActive = false;

    // Physics parameters
    const gravity = 0.25;
    const bounce = 0.55;
    const friction = 0.96;
    const airResistance = 0.99;

    interface PhysicsBubble {
      el: HTMLDivElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      w: number;
      h: number;
      r: number;
      mass: number;
    }

    let pBubbles: PhysicsBubble[] = [];

    const initPhysics = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cw = rect.width;

      pBubbles = bubbleRefs.current
        .filter((el): el is HTMLDivElement => el !== null)
        .map((el, index) => {
          const w = el.offsetWidth || 80;
          const h = el.offsetHeight || 30;
          const r = Math.max(w, h) / 2;
          
          // Spread starting positions
          const x = Math.random() * (cw - w - 20) + 10;
          // Stagger starting heights so they fall sequentially
          const y = -h - (index * 45) - Math.random() * 50; 
          
          return {
            el,
            x,
            y,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 2 + 2,
            w,
            h,
            r,
            mass: r,
          };
        });
    };

    const updatePhysics = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;

      // 1. Update positions & check boundary collisions
      pBubbles.forEach((b) => {
        b.vy += gravity;
        b.vx *= airResistance;
        b.vy *= airResistance;
        b.x += b.vx;
        b.y += b.vy;

        // Bottom boundary (leave some space for padding at the bottom)
        const bottomLimit = ch - b.h - 15;
        if (b.y > bottomLimit) {
          b.y = bottomLimit;
          b.vy = -b.vy * bounce;
          b.vx *= friction;
        }

        // Left boundary
        if (b.x < 10) {
          b.x = 10;
          b.vx = -b.vx * bounce;
        }

        // Right boundary
        if (b.x + b.w > cw - 10) {
          b.x = cw - b.w - 10;
          b.vx = -b.vx * bounce;
        }
      });

      // 2. Resolve bubble-to-bubble collisions
      for (let i = 0; i < pBubbles.length; i++) {
        for (let j = i + 1; j < pBubbles.length; j++) {
          const b1 = pBubbles[i];
          const b2 = pBubbles[j];

          // Center coordinates
          const c1x = b1.x + b1.w / 2;
          const c1y = b1.y + b1.h / 2;
          const c2x = b2.x + b2.w / 2;
          const c2y = b2.y + b2.h / 2;

          const dx = c2x - c1x;
          const dy = c2y - c1y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.r + b2.r - 2; // slight overlap tolerance for aesthetic

          if (dist < minDist) {
            // Overlap detected, resolve overlap
            const overlap = minDist - dist;
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);

            // Push apart
            const totalMass = b1.mass + b2.mass;
            const ratio1 = b2.mass / totalMass;
            const ratio2 = b1.mass / totalMass;

            b1.x -= nx * overlap * ratio1;
            b1.y -= ny * overlap * ratio1;
            b2.x += nx * overlap * ratio2;
            b2.y += ny * overlap * ratio2;

            // Elastic collision response
            const rvx = b2.vx - b1.vx;
            const rvy = b2.vy - b1.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal < 0) {
              const restitution = 0.5;
              const impulseScalar = -(1 + restitution) * velAlongNormal / (1 / b1.mass + 1 / b2.mass);

              b1.vx -= (impulseScalar * nx) / b1.mass;
              b1.vy -= (impulseScalar * ny) / b1.mass;
              b2.vx += (impulseScalar * nx) / b2.mass;
              b2.vy += (impulseScalar * ny) / b2.mass;
            }
          }
        }
      }

      // 3. Apply positions to DOM
      pBubbles.forEach((b) => {
        b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
      });

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    const handleResize = () => {
      if (!isActive) return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;

      pBubbles.forEach((b) => {
        const w = b.el.offsetWidth || 80;
        const h = b.el.offsetHeight || 30;
        const r = Math.max(w, h) / 2;

        b.w = w;
        b.h = h;
        b.r = r;
        b.mass = r;

        // Clamp positions to the new screen boundaries
        b.x = Math.max(10, Math.min(b.x, cw - b.w - 10));
        b.y = Math.min(b.y, ch - b.h - 15);
      });
    };

    window.addEventListener("resize", handleResize);

    // IntersectionObserver to trigger fall on scroll-into-view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!isActive) {
            isActive = true;
            initPhysics();
            updatePhysics();
          }
        } else {
          isActive = false;
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <footer className="theme-surface relative z-10 flex min-h-[72vh] w-screen flex-col overflow-hidden bg-black px-5 pb-8 pt-[15px] font-mono text-[#d3d0c5] md:min-h-[68vh] md:px-8 md:pb-10 md:pt-4">
      <MiniRunner />
      
      {/* Noise Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} 
      />

      <div className="relative z-20 mb-10 mt-auto flex justify-center md:mb-12 md:justify-end">
        <div className="w-full max-w-sm">
          <div className="relative">
            <input
              type="email"
              placeholder="TON EMAIL"
              className="lang-fr w-full rounded-full border-none bg-[#d4ff36] py-4 pl-6 pr-12 text-xs font-bold uppercase tracking-wider text-black outline-none placeholder:text-black/60"
            />
            <input
              type="email"
              placeholder="YOUR EMAIL"
              className="lang-en w-full rounded-full border-none bg-[#d4ff36] py-4 pl-6 pr-12 text-xs font-bold uppercase tracking-wider text-black outline-none placeholder:text-black/60"
            />
            <button type="button" aria-label="Envoyer l’adresse email" className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-105">
              <span className="theme-arrow" aria-hidden="true">↘</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full">
        <h1 className="select-none whitespace-nowrap text-center font-sans text-[16.2vw] font-black uppercase leading-[0.72] tracking-[-0.075em] text-[#d3d0c5]">
          Emmanuela©
        </h1>

        <div className="mt-8 grid grid-cols-2 gap-7 text-[10px] uppercase leading-relaxed md:grid-cols-5 md:text-sm">
          <div><p>Portfolio ’26</p><p>Cotonou, BJ</p></div>
          <div><p>Contact</p><a href="mailto:todedjiemma9@gmail.com">todedjiemma9@gmail.com</a></div>
          <div><a href="https://www.linkedin.com/in/Emmanuela%20TODEDJI" target="_blank" rel="noreferrer">LinkedIn</a><a className="block" href="https://wa.me/22968678025" target="_blank" rel="noreferrer">WhatsApp</a></div>
          <div>
            <button type="button" onClick={toggleSound} className="block uppercase"><LocalizedText fr={`Son [${soundEnabled ? "On" : "Off"}]`} en={`Sound [${soundEnabled ? "On" : "Off"}]`} /></button>
            <ColorThemeToggle />
          </div>
          <div className="text-left md:text-right"><p><LocalizedText fr="Chargement du site" en="Loading site" /></p><p><LocalizedText fr="Patientez ;)" en="Please wait ;)" /></p></div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
