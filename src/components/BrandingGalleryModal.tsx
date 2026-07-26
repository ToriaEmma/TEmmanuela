import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { LocalizedText } from "./LanguageToggle";
import { useSoundEffects } from "../hooks/useSoundEffects";
import DesktopSiteHeader from "./DesktopSiteHeader";

interface BrandingGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images?: { src: string; title: string }[];
}

export const brandingImages = [
  { src: "/ola/Frame%201.webp", title: "Affiche 01" },
  { src: "/ola/IMG_2356.webp", title: "Affiche 02" },
  { src: "/ola/IMG_7795.webp", title: "Affiche 03" },
  { src: "/ola/IMG_7798.webp", title: "Affiche 04" },
  { src: "/ola/IMG_7799.webp", title: "Affiche 05" },
  { src: "/ola/IMG_8564.webp", title: "Affiche 06" },
  { src: "/ola/IMG_8565.webp", title: "Affiche 07" },
  { src: "/ola/gummy.webp", title: "Affiche 08" },
];

const BrandingGalleryModal = ({ isOpen, onClose, images = brandingImages }: BrandingGalleryModalProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [lightGrid, setLightGrid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundEffects();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") selectedIdx === null ? onClose() : setSelectedIdx(null);
      if (selectedIdx !== null && event.key === "ArrowRight") {
        setSelectedIdx((selectedIdx + 1) % images.length);
      }
      if (selectedIdx !== null && event.key === "ArrowLeft") {
        setSelectedIdx((selectedIdx - 1 + images.length) % images.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [images.length, isOpen, onClose, selectedIdx]);

  if (!mounted || !isOpen) return null;

  const previous = () => setSelectedIdx((current) => current === null ? 0 : (current - 1 + images.length) % images.length);
  const next = () => setSelectedIdx((current) => current === null ? 0 : (current + 1) % images.length);

  const moveGrid = (event: MouseEvent<HTMLDivElement>) => {
    if (!gridRef.current) return;
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    gridRef.current.style.transform = `perspective(900px) translate3d(${x * 55}px, ${y * 42}px, 0) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) scale(1.045)`;
  };

  const resetGrid = () => {
    if (!gridRef.current) return;
    gridRef.current.style.transform = "perspective(900px) translate3d(0, 0, 0) rotateX(0) rotateY(0) scale(1.045)";
  };

  return createPortal(
    <div className={`fixed inset-0 z-[100] overflow-y-auto font-mono transition-colors ${lightGrid ? "bg-white text-[#101010]" : "bg-[#101010] text-[#d3d0c5]"}`}>
      <div className={`archive-desktop-header fixed inset-x-0 top-0 z-[125] hidden px-8 md:block ${lightGrid ? "archive-desktop-header--light bg-white text-[#101010]" : "archive-desktop-header--dark bg-[#101010] text-white"}`}><DesktopSiteHeader active="archive" showColor={false} /></div>
      <div className="mobile-nav-trigger fixed left-5 top-5 z-[120] flex items-center gap-2 rounded-full px-2.5 py-2 text-[11px] uppercase shadow-xl md:hidden">
        <button type="button" onClick={onClose} className="mobile-nav-trigger__mark grid size-7 place-items-center rounded-full text-[10px] font-bold shadow-sm md:size-7 md:border md:border-white/40 md:bg-transparent md:text-base" aria-label="Fermer">
          <span className="md:hidden">E©</span><span className="hidden md:inline">×</span>
        </button>
        <span className="md:hidden">Menu</span>
      </div>

      <div
        className={`fixed right-3 top-3 z-[130] rounded-full px-3 py-2 text-[10px] uppercase shadow-xl md:right-8 md:top-20 md:px-5 md:py-3 md:text-xs ${lightGrid ? "bg-white text-[#101010]" : "bg-[#55524f] text-white"}`}
      >
        <button type="button" onClick={toggleSound}>▦ <LocalizedText fr={`Son [${soundEnabled ? "Actif" : "Coupé"}]`} en={`Sound [${soundEnabled ? "On" : "Off"}]`} /></button>
        <button data-theme-sound type="button" onClick={() => setLightGrid((value) => !value)}>&nbsp;&nbsp; <LocalizedText fr="Couleur" en="Color" />: {lightGrid ? "#101010" : "#FFFFFF"}</button>
      </div>

      <div
        ref={gridRef}
        onMouseMove={moveGrid}
        onMouseLeave={resetGrid}
        className={`grid min-h-screen content-start origin-center grid-cols-2 gap-0 pt-0 transition-transform duration-150 ease-out will-change-transform sm:grid-cols-3 md:pt-16 lg:grid-cols-6 ${lightGrid ? "bg-white" : "bg-[#101010]"}`}
        style={{ transform: "perspective(900px) scale(1.045)" }}
      >
        {images.map((image, index) => {
          const actualIndex = index;
          return (
            <button
              data-nav-link
              type="button"
              key={`${image.src}-${index}`}
              onClick={() => setSelectedIdx(actualIndex)}
              className={`relative aspect-square overflow-hidden ${lightGrid ? "bg-[#f2f2f0]" : "bg-[#191919]"}`}
            >
              <img loading="lazy" decoding="async" src={image.src} alt="" className="absolute inset-0 size-full scale-110 object-cover opacity-25 blur-xl" />
              <img src={image.src} alt={image.title} className="relative size-full object-contain p-[10%]" loading="lazy" />
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[110] flex items-end justify-between px-3 text-sm uppercase md:bottom-5 md:px-8 md:text-5xl">
        <p>Archive [{String(images.length).padStart(2, "0")}]</p>
        <p>[<LocalizedText fr="Grille" en="Grid" />]</p>
      </div>

      {selectedIdx !== null && (
        <div className={`fixed inset-0 z-[150] bg-[#111]/95 text-[#d3d0c5] backdrop-blur-2xl ${images[selectedIdx].src.toLowerCase().includes("macbook") || images[selectedIdx].src.toLowerCase().endsWith(".svg") ? "overflow-y-auto" : "overflow-hidden"}`}>
          <img loading="lazy" decoding="async" src={images[selectedIdx].src} alt="" className="absolute inset-0 size-full scale-125 object-cover opacity-10 blur-3xl" />

          <div className="relative z-10 grid gap-4 px-5 pt-10 text-[10px] uppercase leading-relaxed md:grid-cols-[0.85fr_1.5fr] md:px-16 md:pt-12 md:text-xs">
            <dl className="grid grid-cols-[auto_1fr] gap-x-8">
              <dt><LocalizedText fr="Publié :" en="Published:" /></dt><dd>20 Jul, 2026</dd>
              <dt><LocalizedText fr="Type de projet :" en="Project type:" /></dt><dd><LocalizedText fr="Projet de communication" en="Communication project" /></dd>
              <dt><LocalizedText fr="Catégorie :" en="Filter tag:" /></dt><dd><LocalizedText fr="Graphisme & impression" en="Graphic & Print" /></dd>
            </dl>
            <div>
              <h2>{images[selectedIdx].title}</h2>
              <p className="mt-2 max-w-md normal-case font-sans text-[11px] md:text-sm"><LocalizedText fr="Création graphique et direction artistique développées pour l’archive visuelle d’Emmanuela." en="Graphic design and art direction developed for Emmanuela’s visual archive." /></p>
            </div>
          </div>

          {images[selectedIdx].src.toLowerCase().includes("macbook") || images[selectedIdx].src.toLowerCase().endsWith(".svg") ? (
            <div className="relative z-10 mx-auto mb-32 mt-16 w-[86vw] max-w-[760px] md:mt-20">
              <img loading="lazy" decoding="async" src={images[selectedIdx].src} alt={images[selectedIdx].title} className="h-auto w-full shadow-2xl" />
            </div>
          ) : (
            <div className="absolute inset-x-5 bottom-24 top-48 flex items-center justify-center md:inset-x-16 md:bottom-28 md:top-56">
              <img loading="lazy" decoding="async" src={images[selectedIdx].src} alt={images[selectedIdx].title} className="max-h-full max-w-full object-contain shadow-2xl" />
            </div>
          )}

          <button type="button" onClick={() => setSelectedIdx(null)} className="fixed bottom-6 left-5 z-20 text-2xl md:bottom-10 md:left-16 md:text-5xl">
            <LocalizedText fr="Fermer [esc]" en="Close [esc]" />
          </button>
          <div className="fixed bottom-6 right-5 z-20 flex items-center gap-4 text-2xl md:bottom-10 md:right-16 md:text-5xl">
            <button type="button" onClick={previous} aria-label="Affiche précédente">←</button>
            <span>{String(selectedIdx + 1).padStart(2, "0")}/{String(images.length).padStart(2, "0")}</span>
            <button type="button" onClick={next} aria-label="Affiche suivante">→</button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
};

export default BrandingGalleryModal;
