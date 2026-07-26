import { useEffect, useRef, useState } from "react";
import LanguageToggle, { LocalizedText } from "./LanguageToggle";
import MobileSiteMenu from "./MobileSiteMenu";
import Footer from "./Footer";
import ColorThemeToggle from "./ColorThemeToggle";
import { useSoundEffects, soundEffectsEnabled } from "../hooks/useSoundEffects";
import DesktopSiteHeader from "./DesktopSiteHeader";
import { navigateTo } from "../utils/navigation";

const polaroidPhotos = [
  "/REVOLU/paro/Profil.webp",
  "/REVOLU/paro/Profil0.webp",
];

const AboutPage = () => {
  const [time, setTime] = useState("");
  const [ejectedPhotos, setEjectedPhotos] = useState<number[]>([]);
  const cameraAudioRef = useRef<HTMLAudioElement>(null);
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundEffects();

  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
      timeZone: "Africa/Porto-Novo",
    }).format(new Date()).toUpperCase());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const navClass = "relative transition-all duration-300 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform hover:tracking-[0.08em] hover:after:origin-left hover:after:scale-x-100";

  const ejectNextPhoto = () => {
    if (soundEffectsEnabled() && cameraAudioRef.current) {
      cameraAudioRef.current.currentTime = 0;
      void cameraAudioRef.current.play();
    }
    setEjectedPhotos((current) => [
      ...current,
      current.length % polaroidPhotos.length,
    ]);
  };

  return (
    <main className="theme-surface min-h-screen bg-black px-5 font-mono text-[#d3d0c5] md:px-8">
      <MobileSiteMenu />
      <DesktopSiteHeader active="about" />
      <header className="grid gap-6 border-b border-white/15 py-5 text-[10px] uppercase md:hidden">
        <button type="button" onClick={() => navigateTo("/")} className="text-left font-bold">
          Emmanuela©<span className="block font-normal">{time} GMT+1</span>
        </button>
        <nav className="flex flex-wrap items-start gap-x-8 gap-y-2">
          <a href="/projects" className={navClass}>Projets [14]</a>
          <span className="line-through">À propos</span>
          <a href="/expertise" className={navClass}>Expertises</a>
          <a href="/archive" className={navClass}>Archive</a>
          <a href="/vibe-check" className={navClass}>Vibe-check</a>
          <a href="/contact" className={navClass}>Contact</a>
        </nav>
        <div className="flex items-start gap-4 md:justify-end">
          <button type="button" onClick={toggleSound}><LocalizedText fr={`Son [${soundEnabled ? "Actif" : "Coupé"}]`} en={`Sound [${soundEnabled ? "On" : "Off"}]`} /></button>
          <ColorThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      <section className="mt-10 grid gap-12 text-[12px] leading-relaxed md:mt-28 md:grid-cols-[0.72fr_1.55fr_1.2fr_1.2fr] md:gap-10 md:text-xs">
        <div className="hidden space-y-24 text-[10px] uppercase md:block md:text-[11px]">
          <p>Biographie :</p>
          <p>Parcours :</p>
          <p>Philosophie :</p>
          <p>Intérêts :</p>
          <p>Expérience :</p>
        </div>

        <div className="space-y-6 font-sans text-[13px] leading-[1.5] md:space-y-8 md:text-sm">
          <h1 className="font-mono text-[11px] uppercase md:text-xs">// Faire connaissance avec Emmanuela</h1>
          <p>
            <LocalizedText
              fr={<>Je suis <u>Emmanuela</u>. Depuis toujours, je navigue entre deux mondes : celui du design, où tout doit être beau, clair et inspirant, et celui de la technique, où chaque idée doit tenir debout, fonctionner et avoir du sens.</>}
              en={<>I am <u>Emmanuela</u>. I have always moved between two worlds: design, where everything should be beautiful, clear and inspiring, and technology, where every idea must stand up, work and make sense.</>}
            />
          </p>
          <p>
            <LocalizedText
              fr="Avec le temps, j’ai compris que je n’avais pas à choisir. J’ai simplement décidé de créer des projets où ces deux univers se rencontrent."
              en="Over time, I understood that I did not have to choose. I simply decided to create projects where these two worlds meet."
            />
          </p>
          <p>
            <LocalizedText
              fr="Aujourd’hui, je conçois des expériences qui racontent quelque chose : des interfaces qui respirent, des solutions qui résolvent de vrais problèmes et des concepts qui deviennent concrets."
              en="Today, I design experiences that tell a story: interfaces that breathe, solutions that solve real problems and concepts that become tangible."
            />
          </p>
          <p>
            <LocalizedText
              fr="Mon but ? Transformer une idée en un projet à la fois esthétique, intelligent et utile, tout en gardant ma touche : naturelle, fluide et authentique."
              en="My goal? To transform an idea into a project that is aesthetic, intelligent and useful, while keeping my own touch: natural, fluid and authentic."
            />
          </p>

        </div>

        <div className="order-first md:order-none">
          <p className="mb-10 text-center text-[11px] uppercase md:hidden">Une idée arrive.</p>
          <div className="relative left-1/2 z-20 -mt-12 aspect-square w-[125%] max-w-[650px] -translate-x-1/2 md:-mt-16 md:w-[140%]">
            <audio ref={cameraAudioRef} src="/click.mp3" preload="auto" />
            <img loading="lazy" decoding="async" src="/REVOLU/palo.webp" alt="Appareil photo Polaroid" className="about-camera size-full object-contain" />
            <div className="pointer-events-none absolute right-[9%] top-[7%] z-40 flex items-center gap-1 md:right-[9%] md:top-[1%]">
              <div className="relative h-12 w-14 shrink-0 md:h-16 md:w-20" aria-hidden="true">
                <span className="absolute left-[12%] top-[25%] h-[52%] w-[54%] bg-[#fb6f92] shadow-[4px_0_0_#fb6f92,8px_0_0_#fb6f92]" />
                <span className="absolute left-[19%] top-[12%] size-[18%] bg-[#fb6f92]" />
                <span className="absolute left-[48%] top-[12%] size-[18%] bg-[#fb6f92]" />
                <span className="absolute left-[22%] top-[45%] size-[6%] bg-[#101010]" />
                <span className="absolute left-[48%] top-[45%] size-[6%] bg-[#101010]" />
                <span className="absolute left-[18%] top-[77%] h-[13%] w-[12%] bg-[#fb6f92]" />
                <span className="absolute left-[49%] top-[77%] h-[13%] w-[12%] bg-[#fb6f92]" />
                <span className="absolute left-[72%] top-[43%] h-[12%] w-[22%] bg-[#fb6f92]" />
              </div>
              <span className="max-w-[68px] bg-[#fb6f92] px-1.5 py-1 font-mono text-[7px] uppercase leading-tight text-[#101010] md:max-w-[82px] md:px-2 md:py-1.5 md:text-[8px]">
                Clique sur le point rose
              </span>
            </div>
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 z-30 size-full overflow-visible"
            >
              <path
                d="M 84 17 C 68 18, 55 27, 47 35 C 39 42, 34 43, 28.5 45"
                fill="none"
                stroke="#fb6f92"
                strokeWidth="0.9"
                strokeDasharray="2 1.5"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 31 41.8 L 28.5 45 L 32.7 45.5"
                fill="none"
                stroke="#fb6f92"
                strokeWidth="0.9"
                strokeLinecap="square"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <button
              type="button"
              onClick={ejectNextPhoto}
              className="absolute left-[27%] top-[45%] z-30 size-[9%] rounded-full bg-transparent transition-all duration-150 hover:scale-110 hover:ring-4 hover:ring-white/60 active:scale-90"
              aria-label="Déclencher l’appareil photo"
            />
          </div>
          <div className="relative z-30 mx-auto -mt-14 min-h-[300px] max-w-[220px] -translate-y-8">
            {ejectedPhotos.map((photoIndex, cardIndex) => (
              <div
                key={`${cardIndex}-${photoIndex}`}
                className="absolute left-1/2 top-0 w-full -translate-x-1/2"
                style={{
                  zIndex: cardIndex + 1,
                  marginLeft: `${((cardIndex % 5) - 2) * 3}px`,
                }}
              >
                <div
                  className="border border-black/15 bg-white p-3 text-black shadow-lg"
                  style={{
                    animation: "polaroid-eject 2200ms linear both",
                    transformOrigin: "top center",
                    rotate: `${((cardIndex % 5) - 2) * 0.8}deg`,
                  }}
                >
                  <img loading="lazy" decoding="async" src={polaroidPhotos[photoIndex]} alt={`Portrait d’Emmanuela ${cardIndex + 1}`} className="aspect-[3/4] w-full object-cover" />
                  <p className="pt-3 text-center font-sans text-xs italic">Construire, créer, recommencer.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-14">
          <section>
            <h2 className="mb-6 text-[11px] uppercase md:text-xs">// Formation</h2>
            <div className="space-y-5 font-sans text-[13px] md:text-sm">
              <div className="flex justify-between gap-6"><p>Bachelor en ingénierie logicielle<br /><span className="opacity-55">Epitech Bénin, Saint-Michel</span></p><span>Depuis 2023</span></div>
              <div className="flex justify-between gap-6"><p>Baccalauréat Série B<br /><span className="opacity-55">Collège Catholique Don Zefirino Agostini, Cocotomey</span></p><span>2022–2023</span></div>
            </div>
          </section>
          <section>
            <h2 className="mb-6 text-[11px] uppercase md:text-xs">// Expertise design</h2>
            <div className="grid grid-cols-2 gap-x-8 font-sans text-[13px] leading-relaxed md:text-sm">
              <p>UI/UX Design<br />Design graphique<br />Développement logiciel<br />Montage vidéo</p>
              <p>Programmation<br />Robotique<br />Technologies immersives<br />Interfaces interactives</p>
            </div>
          </section>
        </aside>
      </section>
      <div className="-mx-5 mt-20 md:-mx-8 md:mt-28">
        <Footer />
      </div>
    </main>
  );
};

export default AboutPage;
