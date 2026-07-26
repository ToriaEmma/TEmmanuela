import { useState } from "react";
import DesktopSiteHeader from "./DesktopSiteHeader";
import Footer from "./Footer";
import { LocalizedText } from "./LanguageToggle";
import MobileSiteMenu from "./MobileSiteMenu";

const expertiseItems = [
  {
    number: "01",
    title: "UI/UX Design",
    descriptionFr: "Création d’interfaces intuitives centrées sur l’utilisateur.",
    descriptionEn: "Creating intuitive, user-centered interfaces.",
    tags: ["Figma", "Canva", "User Research", "Prototyping"],
    color: "#fb6f92",
    textColor: "#101010",
    symbol: "⌁",
  },
  {
    number: "02",
    title: "Front-end Dev",
    descriptionFr: "Développement front-end moderne, responsive et animé.",
    descriptionEn: "Modern, responsive and animated front-end development.",
    tags: ["React.js", "Tailwind CSS", "DaisyUI", "GSAP", "JavaScript"],
    color: "#d4ff36",
    textColor: "#101010",
    symbol: "</>",
  },
  {
    number: "03",
    title: "Design & Visual",
    descriptionFr: "Identité visuelle et création de contenu.",
    descriptionEn: "Visual identity and content creation.",
    tags: ["Photoshop", "CapCut", "Branding", "Typography"],
    color: "#ffffff",
    textColor: "#101010",
    symbol: "✦",
  },
  {
    number: "04",
    title: "Hardware & 3D",
    descriptionFr: "Robotique, prototypage et impression 3D.",
    descriptionEn: "Robotics, prototyping and 3D printing.",
    tags: ["Arduino", "FreeCAD", "Impression 3D", "SFML"],
    color: "#f7f7f4",
    textColor: "#101010",
    symbol: "⚙",
  },
  {
    number: "05",
    title: "Programming",
    descriptionFr: "Langages et outils de développement logiciel.",
    descriptionEn: "Software development languages and tools.",
    tags: ["C", "C++", "Haskell", "HTML/CSS", "WordPress", "GitHub Actions"],
    color: "#101010",
    textColor: "#ffffff",
    symbol: "{ }",
  },
];

const ExpertisePage = () => {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const nextCard = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(() => {
      setActive((current) => (current + 1) % expertiseItems.length);
      setLeaving(false);
    }, 460);
  };

  const visibleCards = [2, 1, 0].map((offset) => ({
    item: expertiseItems[(active + offset) % expertiseItems.length],
    offset,
  }));

  return <main className="theme-surface min-h-screen bg-black px-5 text-white md:px-8">
    <MobileSiteMenu />
    <DesktopSiteHeader active="expertise" />

    <section className="expertise-deck relative -mx-5 min-h-[760px] overflow-hidden bg-black px-5 pb-16 pt-24 text-white md:-mx-8 md:min-h-[780px] md:px-8 md:pb-20 md:pt-16">
      <div className="pointer-events-none absolute inset-y-0 left-[34%] hidden w-px bg-current opacity-25 md:block" />
      <div className="pointer-events-none absolute inset-y-0 left-[68%] hidden w-px bg-current opacity-25 md:block" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1500px] gap-12 md:grid-cols-[0.78fr_1.22fr] md:gap-16">
        <div className="flex min-h-[280px] flex-col justify-between md:min-h-[650px] md:py-4">
          <p className="font-mono text-[9px] uppercase opacity-70 md:text-xs">
            <LocalizedText fr="Processus / Expertises" en="Process / Expertise" />
          </p>
          <div>
            <h1 className="max-w-[650px] font-sans text-[17vw] font-medium leading-[0.82] tracking-[-0.075em] md:text-[7.5vw]">
              <LocalizedText fr={<>Une expertise<br />à chaque<br />étape</>} en={<>Expertise<br />at every<br />step</>} />
            </h1>
            <p className="ml-[25%] mt-10 max-w-[260px] font-mono text-[9px] uppercase leading-relaxed opacity-75 md:text-[10px]">
              <LocalizedText
                fr="Du concept au code, chaque discipline se combine pour construire des expériences claires, utiles et mémorables."
                en="From concept to code, every discipline combines to build clear, useful and memorable experiences."
              />
            </p>
          </div>
        </div>

        <div className="relative min-h-[520px] md:min-h-[650px]">
          <div className="absolute right-0 top-0 font-mono text-[9px] uppercase md:text-xs">[OCI.{expertiseItems[active].number}]</div>
          <div className="absolute bottom-0 left-[28%] top-0 w-px bg-current opacity-30" />

          <div className="relative ml-auto mt-10 h-[500px] w-[92%] max-w-[650px] md:mt-8 md:h-[610px]">
          {visibleCards.map(({ item, offset }) => (
            <div
              key={`${item.number}-${offset}`}
              className="absolute left-0 right-0 h-[145px] origin-center transition-all duration-500 md:h-[175px]"
              style={{
                zIndex: 10 - offset,
                top: `${offset * 32}%`,
                transform: `translateX(${offset === 0 ? -7 : offset === 1 ? 8 : 20}%) rotate(${offset === 0 ? 0 : offset === 1 ? -5 : 4}deg)`,
              }}
            >
              <button
                type="button"
                onClick={offset === 0 ? nextCard : undefined}
                aria-label={offset === 0 ? "Afficher l’expertise suivante" : undefined}
                className={`expertise-card ${item.color === "#101010" ? "expertise-card--dark" : ""} ${item.color === "#d4ff36" ? "expertise-card--green" : ""} flex size-full flex-col justify-between border border-black/25 p-4 text-left shadow-[8px_9px_0_rgba(16,16,16,0.12)] md:p-5 ${offset === 0 ? `cursor-pointer hover:brightness-[1.03] ${leaving ? "expert-card-exit" : "expert-card-enter"}` : "pointer-events-none"}`}
                style={{ backgroundColor: item.color, color: item.textColor }}
              >
                <div className="flex items-center justify-between border-b border-current/40 pb-2">
                  <h2 className="font-sans text-xl font-medium tracking-[-0.04em] md:text-3xl">{item.title}</h2>
                  <span className="font-mono text-sm">{item.number}</span>
                </div>
                <div className="flex items-end justify-between gap-4 border-b border-current/40 pb-2">
                  <p className="max-w-[62%] font-mono text-[8px] uppercase leading-snug md:text-[10px]">
                    <LocalizedText fr={item.descriptionFr} en={item.descriptionEn} />
                  </p>
                  <div className="flex max-w-[38%] flex-wrap justify-end gap-x-2 font-mono text-[7px] uppercase md:text-[8px]">
                    {item.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                </div>
              </button>
            </div>
          ))}
          </div>

          <button type="button" onClick={nextCard} className="absolute bottom-0 right-0 font-mono text-[10px] uppercase underline underline-offset-4 md:text-xs" aria-label="Expertise suivante">
            <LocalizedText fr="Carte suivante" en="Next card" /> →
          </button>
        </div>
      </div>
    </section>

    <div className="-mx-5 md:-mx-8"><Footer /></div>
  </main>;
};

export default ExpertisePage;
