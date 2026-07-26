import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { TiLocationArrow } from "react-icons/ti";
import { useSmoothScroll } from "../context/ScrollProviderContext";
import gsap from "gsap";
import LanguageToggle, { LocalizedText } from "./LanguageToggle";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { navigateTo } from "../utils/navigation";

const NavBar = () => {
  const isHomePage = window.location.pathname === "/";
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const { enabled: isAudioPlaying, toggle: toggleAudio } = useSoundEffects();
  const { locoScroll, progress } = useSmoothScroll();
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isLightTheme, setIsLightTheme] = useState(() => localStorage.getItem("color-theme") === "light");
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
  const toggleColorTheme = () => {
    setIsLightTheme((current) => {
      const next = !current;
      document.documentElement.classList.toggle("light-site", next);
      localStorage.setItem("color-theme", next ? "light" : "dark");
      return next;
    });
  };

  const goToSection = (target: string) => {
    setIsMobileMenuOpen(false);
    window.setTimeout(() => locoScroll?.scrollTo(target, { duration: 0 }), 50);
  };

  const openArchive = () => {
    setIsMobileMenuOpen(false);
    navigateTo("/archive");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("light-site", isLightTheme);
  }, []);

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
        className={`mobile-scroll-header fixed inset-x-0 top-0 z-[60] flex h-[74px] items-center justify-between border-b px-5 font-mono transition-transform duration-300 md:hidden ${progress > 0.1 ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="text-xs uppercase leading-relaxed">
          <a href="/" className="block font-bold">Emmanuela©</a>
          <p>{mobileTime} GMT+1</p>
        </div>
        <button
          type="button"
          className="origin-center rotate-[-90deg] text-sm uppercase"
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
          <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="rotate-[-90deg] text-sm uppercase">
            <LocalizedText fr="Sortir" en="Exit" />
          </button>
        </div>

        <nav className="absolute left-5 top-[41%] flex -translate-y-1/2 flex-col items-start gap-4 text-[18px] uppercase leading-none">
          <button type="button" onClick={() => navigateTo("/projects")} className="mobile-menu-link"><LocalizedText fr="PROJETS" en="PROJECTS" /></button>
          <button type="button" onClick={() => navigateTo("/about")} className="mobile-menu-link"><LocalizedText fr="À PROPOS" en="ABOUT" /></button>
          <button type="button" onClick={() => navigateTo("/expertise")} className="mobile-menu-link"><LocalizedText fr="EXPERTISES" en="EXPERTISE" /></button>
          <button type="button" onClick={openArchive} className="mobile-menu-link">ARCHIVE</button>
          <button type="button" onClick={() => navigateTo("/vibe-check")} className="mobile-menu-link">VIBE-CHECK</button>
          <button type="button" onClick={() => navigateTo("/contact")} className="mobile-menu-link">CONTACT</button>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="mobile-menu-link">LINKEDIN</a>
        </nav>

        <div className="absolute bottom-10 left-5 text-sm uppercase leading-relaxed">
          <button type="button" onClick={toggleAudio} className="block">▦ <LocalizedText fr={`Son [${isAudioPlaying ? "Actif" : "Coupé"}]`} en={`Sound [${isAudioPlaying ? "On" : "Off"}]`} /></button>
          <button data-theme-sound type="button" onClick={toggleColorTheme} className="block">Color: {isLightTheme ? "#101010" : "#D3D0C5"}</button>
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
      className="fixed inset-x-0 top-2 z-50 hidden h-11 border-none transition-all duration-700 sm:inset-x-6 sm:top-4 sm:h-16 md:block"
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
              <a href="/projects" className="nav-hover-btn"><LocalizedText fr="Projets [14]" en="Projects [14]" /></a>
              <a href="/about" className="nav-hover-btn"><LocalizedText fr="À propos" en="About" /></a>
              <a href="/expertise" className="nav-hover-btn"><LocalizedText fr="Expertises" en="Expertise" /></a>
              <a href="/archive" className="nav-hover-btn">Archive</a>
              <a href="/vibe-check" className="nav-hover-btn">Vibe-check</a>
              <a href="/contact" className="nav-hover-btn hidden xl:block">Contact</a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="nav-hover-btn hidden 2xl:block">LinkedIn</a>
            </div>
            <button
              data-theme-sound
              type="button"
              onClick={toggleColorTheme}
              className="ml-2 whitespace-nowrap font-mono text-[7px] uppercase text-blue-50 sm:ml-5 sm:text-[10px] md:ml-8 md:text-xs"
            >
              Color: {isLightTheme ? "#101010" : "#D3D0C5"}
            </button>
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
