import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { TiLocationArrow } from "react-icons/ti";
import { useSmoothScroll } from "../context/ScrollProviderContext";
import gsap from "gsap";
import LanguageToggle, { LocalizedText } from "./LanguageToggle";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { navigateTo } from "../utils/navigation";
import { PROJECT_COUNT } from "../data/projectCount";

const NavBar = () => {
  const isHomePage = window.location.pathname === "/";
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const { enabled: isAudioPlaying, toggle: toggleAudio } = useSoundEffects();
  const { locoScroll, progress } = useSmoothScroll();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [mobileTime, setMobileTime] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!navContainerRef.current) return;
    if (progress <= 0.1) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (progress > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (progress < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }
    setLastScrollY(progress);
  }, [progress]);
  useEffect(() => {
    gsap.to(navContainerRef.current, { y: isNavVisible ? 0 : -100, opacity: isNavVisible ? 1 : 0, duration: 0.2 });
  }, [isNavVisible]);

  // Couleur adaptative : le mode "difference" inverse tout uniformement, ce
  // qui rend la nav sombre au-dessus du hero et des cartes colorees. On ne
  // l'active donc QUE sur les sections a fond clair ; partout ailleurs la nav
  // reste blanche.
  // Vrai tant que le hero couvre encore le haut de l'ecran : la barre y reste
  // blanche (voir .is-over-hero), puis retrouve son adaptation de couleur.
  const [overHero, setOverHero] = useState(true);
  // Vrai des que la page a quitte le haut : en mobile le nom et l'heure
  // s'effacent alors, pour ne pas suivre le lecteur tout au long du
  // defilement. Le bouton Menu, lui, reste accessible en permanence.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const check = () => {
      setScrolled(window.scrollY > 8);
      const hero = document.querySelector(".hero-display")?.closest("section, div");
      if (!hero) return setOverHero(window.scrollY < window.innerHeight * 0.8);
      setOverHero(hero.getBoundingClientRect().bottom > 74);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  useEffect(() => {
    const shell = navContainerRef.current;
    if (!shell) return;

    const update = () => {
      const probeY = shell.getBoundingClientRect().bottom - 6;
      const under = document.elementsFromPoint(window.innerWidth / 2, probeY);
      const onLight = under.some(
        (el) =>
          el.classList?.contains("legacy-section") ||
          el.classList?.contains("is-light-surface") ||
          el.closest?.(".legacy-section, .is-light-surface") != null,
      );
      shell.classList.toggle("nav-blend", onLight);
    };

    update();
    const id = window.setInterval(update, 150);
    return () => window.clearInterval(id);
  }, [progress]);

  const goToSection = (target: string) => {
    setIsMobileMenuOpen(false);
    window.setTimeout(() => locoScroll?.scrollTo(target, { duration: 0 }), 50);
  };

  const openArchive = () => {
    setIsMobileMenuOpen(false);
    navigateTo("/projects");
  };


  useEffect(() => {
    const updateTime = () => {
      setMobileTime(new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Africa/Porto-Novo",
      }).format(new Date()).toUpperCase());
    };
    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <div
        /* Toujours en place : elle etait escamotee tant que le defilement
           n'avait pas depasse 10%, donc le nom et l'heure restaient invisibles
           sur tout le hero. */
        className={`mobile-adaptive-nav fixed inset-x-0 top-0 z-[60] flex h-[74px] items-center justify-between px-5 font-mono transition-transform duration-300 md:hidden ${overHero ? "is-over-hero" : ""}`}
      >
        {/* Le nom et l'heure ne vivent qu'en haut de page : des que le
            defilement commence ils s'effacent, et le bouton Menu reste seul.
            `invisible` en fin de transition plutot que `hidden` : le bloc
            garde sa place, donc le bouton ne se deplace pas. */}
        <div
          className={`text-xs uppercase leading-relaxed transition-opacity duration-300 ${scrolled ? "invisible opacity-0" : "visible opacity-100"}`}
          aria-hidden={scrolled}
        >
          <a href="/" className="block font-bold">Emmanuela©</a>
          <p>{mobileTime} GMT+1</p>
        </div>
        <button
          type="button"
          className="text-sm uppercase"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          Menu
        </button>
      </div>

      <div className={`mobile-menu-panel fixed inset-0 z-[70] font-mono transition-colors duration-300 md:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-[74px] items-center justify-between border-b border-current/20 px-5">
          <div className="text-xs uppercase leading-relaxed">
            <a href="/" className="block font-bold">Emmanuela©</a>
            <p>{mobileTime} GMT+1</p>
          </div>
          <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="text-sm uppercase">
            <LocalizedText fr="Sortir" en="Exit" />
          </button>
        </div>

        <nav className="absolute left-5 top-[41%] flex -translate-y-1/2 flex-col items-start gap-4 text-[18px] uppercase leading-none">
          <button type="button" onClick={() => navigateTo("/projects")} className="mobile-menu-link"><LocalizedText fr="PROJETS" en="PROJECTS" /></button>
          <button type="button" onClick={() => navigateTo("/about")} className="mobile-menu-link"><LocalizedText fr="À PROPOS" en="ABOUT" /></button>
          <button type="button" onClick={openArchive} className="mobile-menu-link">ARCHIVE</button>
          <button type="button" onClick={() => navigateTo("/vibe-check")} className="mobile-menu-link">VIBE-CHECK</button>
          <button type="button" onClick={() => navigateTo("/contact")} className="mobile-menu-link">CONTACT</button>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="mobile-menu-link">LINKEDIN</a>
        </nav>

        <div className="absolute bottom-10 left-5 text-sm uppercase leading-relaxed">
          <button type="button" onClick={toggleAudio} className="block">▦ <LocalizedText fr={`Son [${isAudioPlaying ? "Actif" : "Coupé"}]`} en={`Sound [${isAudioPlaying ? "On" : "Off"}]`} /></button>
        </div>

        <div className="absolute bottom-10 right-11 flex items-end gap-2">
          <div
            aria-hidden="true"
            className="mobile-menu-barcode h-14 w-24"
          />
          <span className="origin-bottom-right rotate-[-90deg] translate-x-5 text-[11px] uppercase">Credit +</span>
        </div>
      </div>

    <div
      ref={navContainerRef}
      className="desktop-nav-shell fixed inset-x-0 top-2 z-50 hidden h-11 border-none transition-all duration-700 sm:inset-x-6 sm:top-4 sm:h-16 md:block"
    >
      <header className=" absolute top-1/2 w-full  -translate-y-1/2">
        <nav className={`${isHomePage ? "hero-desktop-nav" : "secondary-desktop-nav"} relative flex size-full items-center justify-between gap-5 px-3 py-2 font-mono text-white sm:p-4`}>
          <div className="flex shrink-0 items-center gap-3 sm:gap-7">
            <button type="button" onClick={() => navigateTo("/")} className="hero-brand hidden text-left text-[11px] font-bold uppercase leading-relaxed text-white md:block">
              Emmanuela© <span className="block font-normal">{mobileTime} GMT+1</span>
            </button>
          </div>
          <div className="flex h-full items-center text-[10px] uppercase xl:text-xs">
              <div className={`hidden items-center md:flex ${isHomePage ? "absolute left-1/2 -translate-x-1/2" : ""}`}>
              <a href="/projects" className="nav-hover-btn"><LocalizedText fr={`Projets [${PROJECT_COUNT}]`} en={`Projects [${PROJECT_COUNT}]`} /></a>
              <a href="/about" className="nav-hover-btn"><LocalizedText fr="À propos" en="About" /></a>
              
              <a href="/vibe-check" className="nav-hover-btn">Vibe-check</a>
              <a href="/contact" className="nav-hover-btn hidden items-center gap-1.5 xl:inline-flex">
                Contact
                <img src="/runner.gif" alt="" aria-hidden="true" className="h-4 w-4 object-contain [image-rendering:pixelated]" />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="nav-hover-btn hidden 2xl:block">LinkedIn</a>
            </div>
            <div className="ml-2 scale-75 text-blue-50 sm:ml-4 sm:scale-100"><LanguageToggle /></div>
            <button onClick={toggleAudio} className="ml-3 flex items-center gap-1 p-1 xl:ml-6">
              <span className="hero-sound-label hidden text-black xl:inline"><LocalizedText fr={`Son [${isAudioPlaying ? "Actif" : "Coupé"}]`} en={`Sound [${isAudioPlaying ? "On" : "Off"}]`} /></span>
              {[1, 2, 3, 4].map((index) => (
                <div
                  style={{ animationDelay: `${index * 0.1}s` }}
                  key={index}
                  className={` ${isAudioPlaying ? "active" : ""} indicator-line`}
                />
              ))}
            </button>
          </div>
        </nav>
      </header>
    </div>
    </>
  );
};

export default NavBar;
