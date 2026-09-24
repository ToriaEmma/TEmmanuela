import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import LanguageToggle, { LocalizedText } from "./LanguageToggle";
import MobileSiteMenu from "./MobileSiteMenu";
import MoreProjects from "./MoreProjects";
import DesktopSiteHeader from "./DesktopSiteHeader";

type SvgProjectPageProps = {
  title: string;
  description: string;
  descriptionEn: string;
  images: string[];
  compactScreens?: boolean;
  year?: string;
};

gsap.registerPlugin(ScrollTrigger);

const svgRatios: Record<string, string> = {
  "/site%20/meb1.svg": "1923 / 9465", "/site%20/meb2.svg": "1920 / 4721",
  "/site%20/beg1.svg": "1920 / 8209", "/site%20/beg2.svg": "1926 / 2410",
  "/site%20/zem1.svg": "1968 / 4977", "/site%20/zem2.svg": "1920 / 1284",
};

const InlineSvg = ({ src, label }: { src: string; label: string }) => {
  const [objectUrl, setObjectUrl] = useState("");

  useEffect(() => {
    let active = true;
    let createdUrl = "";
    fetch(src)
      .then((response) => response.text())
      .then((svg) => {
        if (!active) return;
        const cleanedSvg = /beg[12]\.svg$/i.test(src)
          ? svg.replace(/<foreignObject[\s\S]*?<\/foreignObject>/g, "")
          : svg;
        createdUrl = URL.createObjectURL(new Blob([cleanedSvg], { type: "image/svg+xml" }));
        setObjectUrl(createdUrl);
      });
    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [src]);

  if (!objectUrl) return <div className="grid min-h-72 place-items-center bg-white font-mono text-xs uppercase text-black">Chargement du visuel…</div>;

  return (
    <object
      data={objectUrl}
      type="image/svg+xml"
      aria-label={label}
      className="pointer-events-none block w-full"
      style={{ aspectRatio: svgRatios[src], transform: "none", willChange: "auto", contain: "none" }}
    />
  );
};

// Les trois prestations affichees sous le resume. Elles reprennent ce que
// la colonne laterale annonce deja (role, expertise, livrables).
// Page projet calquee sur mersi-architecture.com/projets/projet-velderid-mersi.
// Leur rail horizontal enchaine 5 panneaux, releves sur leur DOM :
//   1. project-hero_w   1440px  split 50/50, gauche fond rgb(78,109,115),
//                               padding 36px, space-between, lieu+annee en
//                               haut, titre 86.4px/700 en bas ; droite image
//   2. section-h         648px  description, padding 108px 36px 36px
//   3. project-hero_w.test      galerie d'images plein cadre, sans marge
//   4. section          1440px  citation de l'agence
//   5. project-slider_w         projets suivants
// Le fond colore du hero est la seule surface teintee : les visuels de la
// galerie sont plein cadre (parPad 0, parBg transparent).
const HERO_BG = "#1B2A4A";

const ProjectRail = ({
  title,
  description,
  descriptionEn,
  images,
  year,
}: {
  title: string;
  description: string;
  descriptionEn: string;
  images: string[];
  year: string;
}) => {
  const windowRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const window_ = windowRef.current;
    const track = trackRef.current;
    if (!window_ || !track) return;
    // Leur garde exacte : breakpoint 991px.
    if (window.innerWidth <= 991) return;

    const scroller = window_.closest(".main-container") ?? undefined;
    gsap.set(track, { x: 0 });

    let tween: gsap.core.Tween | null = null;
    let cancelled = false;

    // Ils attendent document.fonts.ready avant de mesurer scrollWidth.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const distance = () => track.scrollWidth - window.innerWidth;
      if (distance() <= 0) return;

      tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          scroller,
          trigger: window_,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      tween?.scrollTrigger?.kill();
      tween?.kill();
      gsap.set(track, { x: 0, clearProps: "all" });
      gsap.set(window_, { clearProps: "all" });
    };
  }, [images]);

  return (
    <div ref={windowRef} className="relative w-full lg:h-[min(760px,100svh)] lg:overflow-hidden">
      <div
        ref={trackRef}
        className="flex flex-col lg:h-[min(760px,100svh)] lg:w-max lg:flex-row lg:flex-nowrap lg:items-stretch lg:[will-change:transform]"
      >
        {/* 1. HERO — split 50/50, moitie gauche teintee */}
        <section className="flex shrink-0 flex-col lg:h-[min(760px,100svh)] lg:w-screen lg:flex-row">
          <div
            className="flex flex-col justify-between gap-10 p-7 lg:w-1/2 lg:gap-12 lg:p-8"
            style={{ backgroundColor: HERO_BG }}
          >
            <div className="flex items-start justify-between font-sans text-[10.8px] font-semibold leading-[1.1]">
              <span>UI/UX</span>
              <span>{year}</span>
            </div>

            <p className="text-center font-sans text-[10.8px] font-semibold leading-[1.1]">
              <LocalizedText
                fr="Une interface pensée pour durer"
                en="An interface designed to last"
              />
            </p>

            <h1 className="font-sans text-[42px] font-bold leading-[0.95] tracking-[-0.04em] lg:text-[clamp(48px,5.2vw,76px)]">
              {title}
            </h1>
          </div>

          <div className="lg:w-1/2">
            {/* Visuel d'en-tete : au-dessus de la ligne de flottaison, donc
                charge tout de suite et en priorite -- c'est lui qui donne le
                LCP de la page. */}
            <img
              src={images[0]}
              alt={title}
              fetchPriority="high"
              decoding="async"
              className="h-64 w-full object-cover lg:h-[min(760px,100svh)]"
            />
          </div>
        </section>

        {/* 2. DESCRIPTION — colonne etroite, padding 108/36/36 */}
        <section className="flex shrink-0 items-start px-7 pb-8 pt-14 lg:h-[min(760px,100svh)] lg:w-[520px] lg:px-8 lg:pt-24">
          <div className="w-full max-w-[340px]">
            <h2 className="font-sans text-[18px] font-medium uppercase leading-[1.1] tracking-[-0.01em]">
              <LocalizedText fr={description} en={descriptionEn} />
            </h2>

            <p className="mt-14 font-sans text-[72px] font-medium leading-[0.8] tracking-[-0.06em] lg:mt-20 lg:text-[88px]">
              {images.length}
              <span className="ml-2 align-baseline text-[26px] font-normal tracking-normal lg:text-[30px]">
                <LocalizedText
                  fr={images.length > 1 ? "écrans" : "écran"}
                  en={images.length > 1 ? "screens" : "screen"}
                />
              </span>
            </p>
          </div>
        </section>

        {/* 3. GALERIE — visuels plein cadre, largeurs variables, sans marge */}
        {images.slice(1).map((src, index) => (
          <figure
            key={src}
            className="shrink-0 lg:h-[min(760px,100svh)]"
            style={{ width: index % 3 === 1 ? undefined : undefined }}
          >
            {src.toLowerCase().endsWith(".svg") ? (
              <div className="h-64 w-full overflow-hidden bg-white sm:h-96 lg:h-[min(760px,100svh)] lg:w-[52vw]">
                <InlineSvg src={src} label={`${title} — visuel ${index + 2}`} />
              </div>
            ) : (
              <img
                src={src}
                alt={`${title} — visuel ${index + 2}`}
                className="h-64 w-full object-cover sm:h-96 lg:h-[min(760px,100svh)] lg:w-auto lg:max-w-none"
                loading="lazy"
                decoding="async"
              />
            )}
          </figure>
        ))}

        {/* 4. CITATION — pleine largeur */}
        <section className="flex shrink-0 items-center px-7 py-14 lg:h-[min(760px,100svh)] lg:w-screen lg:px-[12vw]">
          <p className="max-w-[28ch] font-sans text-[24px] font-medium leading-[1.12] tracking-[-0.03em] lg:text-[36px]">
            <LocalizedText
              fr="Je conçois des interfaces uniques, pensées pour être utilisées, et dessinées pour traverser le temps."
              en="I design unique interfaces, made to be used, and drawn to endure."
            />
          </p>
        </section>
      </div>
    </div>
  );
};

const SvgProjectPage = ({ title, description, descriptionEn, images, year = "2026" }: SvgProjectPageProps) => (
  <main className="theme-project min-h-screen bg-[#101010] text-white">
    <MobileSiteMenu />
    <div className="sticky top-0 z-50 hidden bg-[#101010]/95 px-8 backdrop-blur md:block">
      <DesktopSiteHeader />
    </div>

    <ProjectRail
      title={title}
      description={description}
      descriptionEn={descriptionEn}
      images={images}
      year={year}
    />

    {/* 5. PROJETS SUIVANTS */}
    <MoreProjects current={title} />
  </main>
);

export default SvgProjectPage;
