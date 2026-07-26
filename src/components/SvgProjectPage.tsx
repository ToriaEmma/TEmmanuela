import { useEffect, useState } from "react";
import ColorThemeToggle from "./ColorThemeToggle";
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

const SvgProjectPage = ({ title, description, descriptionEn, images, compactScreens = false, year = "2026" }: SvgProjectPageProps) => (
  <main className="theme-project min-h-screen bg-[#101010] text-white">
    <MobileSiteMenu />
    <div className="sticky top-0 z-50 hidden bg-[#101010]/95 px-8 backdrop-blur md:block"><DesktopSiteHeader /></div>

    <section className="px-5 pb-12 pt-28 md:px-8 md:pb-16 md:pt-24">
      <div className="border-b border-white/15 pb-12">
        <p className="mb-4 font-mono text-xs uppercase">UI/UX — {year}</p>
        <h1 className="font-sans text-[17vw] font-black uppercase leading-[0.75] tracking-[-0.075em] md:text-[10vw]">{title}</h1>
      </div>
    </section>

    <section className="grid gap-12 px-5 pb-24 md:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
      <div className={compactScreens ? "grid grid-cols-2 items-start gap-3 sm:grid-cols-3 md:gap-5" : "space-y-8 md:space-y-12"}>
        {images.map((src, index) => (
          <figure key={src} className={`border border-white/15 bg-white ${compactScreens ? "overflow-hidden rounded-[1.5rem] shadow-xl" : ""}`}>
            {src.toLowerCase().endsWith(".svg") ? (
              <InlineSvg src={src} label={`${title} — écran ${index + 1}`} />
            ) : (
              <img src={src} alt={`${title} — écran ${index + 1}`} className="block h-auto w-full" loading={index > 1 ? "lazy" : undefined} />
            )}
          </figure>
        ))}
      </div>

      <aside className="space-y-7 lg:sticky lg:top-28 lg:self-start">
        <div>
          <h2 className="text-4xl font-semibold tracking-[-0.05em]">{title}</h2>
          <p className="mt-2 font-mono text-xs uppercase"><LocalizedText fr="Voir le projet" en="View project" /> [&nbsp;]</p>
        </div>
        <div className="border-b border-white/15 pb-6">
          <p className="mb-3 font-mono text-xs uppercase opacity-60"><LocalizedText fr="Brief du projet" en="Project brief" /></p>
          <p className="font-sans text-sm leading-relaxed"><LocalizedText fr={description} en={descriptionEn} /></p>
        </div>
        <div className="border-b border-white/15 pb-6">
          <p className="mb-3 font-mono text-xs uppercase opacity-60"><LocalizedText fr="Vue d’ensemble" en="Overview" /></p>
          <p className="font-sans text-sm leading-relaxed"><LocalizedText fr="Recherche, architecture de l’information, conception visuelle et création des écrans responsifs." en="Research, information architecture, visual design and responsive screen creation." /></p>
        </div>
        <dl className="grid grid-cols-2 gap-6 text-sm lg:grid-cols-1">
          <div><dt className="font-mono text-xs uppercase opacity-60"><LocalizedText fr="Rôle" en="Role" /></dt><dd className="mt-1">UI/UX Designer</dd></div>
          <div><dt className="font-mono text-xs uppercase opacity-60">Expertise</dt><dd className="mt-1"><LocalizedText fr="Design d’interface & développement web" en="Interface design & web development" /></dd></div>
          <div><dt className="font-mono text-xs uppercase opacity-60"><LocalizedText fr="Année" en="Year" /></dt><dd className="mt-1">{year}</dd></div>
        </dl>
      </aside>
    </section>
    <MoreProjects current={title} />
  </main>
);

export default SvgProjectPage;
