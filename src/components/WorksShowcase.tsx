import { Fragment, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { LocalizedText } from "./LanguageToggle";
import { navigateTo } from "../utils/navigation";

gsap.registerPlugin(ScrollTrigger);

// `blurb` : une phrase par projet, affichee sous l'annee en mobile. Les
// textes de src/data/projectDescriptions.ts sont des paragraphes entiers,
// trop longs pour une carte -- d'ou ces resumes dedies.
const works = [
  { name: "Snaki", year: "2026", tag: "Bubble tea & Web Design", tagEn: "Bubble tea & Web Design", href: "https://snaki-theta.vercel.app", image: "/works-modal/snaki/2.webp", mobileImage: "/works-mobile/snaki.webp", isSite: true,
    blurb: "Une marque de bubble tea pensée comme une boutique : identité gourmande et site de commande.",
    blurbEn: "A bubble tea brand built like a shop: appetite-driven identity and an ordering site." },
  { name: "Vintage", year: "2026", tag: "Marketplace & Brand Design", tagEn: "Marketplace & Brand Design", href: "/vintage", image: "/REVOLU/big vintagd.webp", mobileImage: "/works-mobile/vintage.webp",
    blurb: "Logo, identité visuelle et direction artistique pour une marketplace de seconde main.",
    blurbEn: "Logo, visual identity and art direction for a second-hand marketplace." },
  { name: "Score", year: "2026", tag: "Site Web", tagEn: "Website", href: "https://score-blond-six.vercel.app", image: "/site%20/score-preview.webp", mobileImage: "/works-mobile/score.webp", titleColor: "#ffffff", titleOutline: "#000000", isSite: true,
    blurb: "Un site de suivi sportif où la donnée reste lisible d'un coup d'œil.",
    blurbEn: "A sports-tracking site where the data stays readable at a glance." },
  { name: "Cats", year: "2026", tag: "Brand Design", tagEn: "Brand Design", href: "/cats", image: "/optimized/cats-card.webp", mobileImage: "/works-mobile/cats.webp",
    blurb: "Dessin de logo et typographie : un visage félin intégré au nom de la marque.",
    blurbEn: "Logo drawing and typography: a feline face woven into the brand name." },
];

const WorksShowcase = () => {
  // Deux gestes distincts, selon ce qu'il y a a montrer : un site livre se
  // visite (son <a> reste un lien ordinaire, voir le onClick), tandis qu'un
  // projet de design renvoie a la page projets avec sa planche deja ouverte.
  //
  // La modale ne s'ouvre PLUS ici : la monter par-dessus l'accueil obligeait
  // a garder toute cette page vivante derriere elle. La page projets, elle,
  // n'a que le ruban -- l'ouverture y est immediate.
  const openWork = (work: (typeof works)[number]) => {
    navigateTo(`/projects?p=${encodeURIComponent(work.name)}`);
  };

  useEffect(() => {
    // Sur mobile Locomotive est desactive (scroll natif), donc les
    // ScrollTriggers doivent viser la fenetre et non ".main-container".
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const scroller = isMobile ? undefined : ".main-container";

    const ctx = gsap.context(() => {
      // Meme geste que la reference : chaque projet grandit en entrant dans
      // le viewport puis retrecit en sortant, colle au scroll (scrub). En
      // mobile ce va-et-vient est supprime : il laissait les cartes a 60% et
      // a demi transparentes pendant l'essentiel du defilement, alors qu'un
      // ecran etroit a besoin qu'elles soient pleines et nettes d'entree.
      if (!isMobile) gsap.utils.toArray<HTMLElement>(".work-card").forEach((card) => {
        gsap.fromTo(
          card,
          { scale: 0.6, opacity: 0.4 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: card, scroller, start: "top bottom", end: "center 55%", scrub: true },
          },
        );

        gsap.fromTo(
          card,
          { scale: 1, opacity: 1 },
          {
            scale: 0.6,
            opacity: 0.4,
            ease: "none",
            scrollTrigger: { trigger: card, scroller, start: "center 45%", end: "bottom top", scrub: true },
          },
        );
      });

      // Le mot de fond reste epingle pendant que les projets defilent, tout en
      // glissant vers le bas : meme geste que la reference. En mobile il ne
      // bouge plus du tout -- l'epinglage le faisait glisser sur les cartes et
      // brouillait la lecture sur un ecran etroit. Il y reste donc fixe en
      // haut de section, pose par le seul CSS.
      if (!isMobile) {
        gsap.to(".works-float", {
          yPercent: 74,
          ease: "none",
          scrollTrigger: {
            trigger: ".works-showcase",
            scroller,
            start: "top 12%",
            end: "bottom 75.5%",
            pin: ".works-float",
            pinSpacing: false,
            scrub: true,
          },
        });
      }
    });

    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 1000);
    return () => {
      ctx.revert();
      window.clearTimeout(timer);
    };
  }, []);

  return (
  <section className="works-showcase relative w-screen overflow-x-clip bg-[#0B0B0B] py-16 text-white md:py-24">
    {/* Giant justified word behind everything, like the reference. */}
    <div className="works-float pointer-events-none absolute inset-x-0 top-[2%] z-0 select-none px-[5%] text-[13vw] uppercase leading-none text-white opacity-[0.05] md:text-[15vw]">
      P r o j e t s
    </div>

    <h2 className="clients-script relative z-[2] mb-[6vh] px-[10%] text-center text-[16vw] leading-none text-[#E4739B] md:mb-[8vh] md:text-[8vw]">
      <LocalizedText fr="Projets choisis" en="Featured Projects" />
    </h2>

    {works.map((work, index) => (
      <Fragment key={work.name}>
      <a
        href={work.href}
        {...(work.isSite ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onClick={(event) => {
          // Un site garde son comportement de lien natif : c'est une vraie
          // adresse, elle doit rester ouvrable en nouvel onglet, copiable, et
          // partir sans passer par window.open (que les navigateurs bloquent
          // volontiers). Seul un projet de design est intercepte pour ouvrir
          // sa planche en modale.
          if (work.isSite) return;
          event.preventDefault();
          openWork(work);
        }}
        className="work-card group relative z-[5] mx-auto my-[5vh] block w-[92%] will-change-transform md:my-[16vh] md:w-[60%]"
      >
        {/* Visuel portrait dedie en mobile, 16/9 en desktop. */}
        <picture>
          <source media="(min-width: 768px)" srcSet={work.image.replace(/ /g, "%20")} />
          <img
            src={work.mobileImage}
            alt={work.name}
            loading="lazy"
            decoding="async"
            className="aspect-[3/3.7] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] md:aspect-[16/9]"
          />
        </picture>

        {/* Mobile : titre centre sous l'image, remonte par-dessus. Desktop :
            absolu en haut a gauche, avec la premiere lettre en script. */}
        {/* Blanc par defaut ; un projet peut imposer sa couleur, et un
            contour (titleOutline) quand le blanc seul se perdrait dans
            l'image : Score reste blanc mais se detache par un liesere noir. */}
        <h3
          className="work-title relative z-10 -mt-[8%] whitespace-nowrap text-center text-[24vw] uppercase leading-[0.7] text-white md:absolute md:-left-[18%] md:-top-[8%] md:mt-0 md:text-[10vw] md:leading-none"
          style={{
            ...(work.titleColor ? { color: work.titleColor } : {}),
            // -webkit-text-stroke : le contour se dessine A L'INTERIEUR du
            // glyphe, donc sans decaler la ligne ni changer sa metrique.
            ...(work.titleOutline ? { WebkitTextStroke: `2px ${work.titleOutline}` } : {}),
          }}
        >
          {work.name}
        </h3>

        <div className="mt-5 flex justify-center font-mono text-[10px] uppercase md:mt-6 md:text-[12px]">
          <span className="rounded-full border border-white/10 px-5 py-1.5">
            {work.year} ✦ <LocalizedText fr={work.tag} en={work.tagEn} />
          </span>
        </div>

        {/* Resume court sous l'annee, en mobile seulement : en desktop les
            planches sont deja espacees par leur my-[16vh] et se lisent sans
            legende. */}
        <p className="mx-auto mt-4 max-w-[300px] text-justify font-mono text-[10px] uppercase leading-[1.7] tracking-[0.04em] text-white/55 md:hidden">
          <LocalizedText fr={work.blurb} en={work.blurbEn} />
        </p>

      </a>

      {/* Le trait vit HORS de la carte : a l'interieur il heritait de son
          scale au scroll, retrecissait avec elle et finissait colle au projet
          suivant. Frere de la carte, il reste a mi-chemin entre les deux.
          Pas de trait apres le dernier projet : il separe DES projets, et
          seul reste sous lui le bouton "Tous les projets". */}
      {index < works.length - 1 && (
        <img
          src="/divider.svg"
          alt=""
          aria-hidden="true"
          className="relative z-[5] mx-auto mb-[6vh] mt-[12vh] w-[70%] select-none md:hidden"
        />
      )}
      </Fragment>
    ))}

    <div className="relative z-[5] mt-4 flex justify-center">
      <button
        type="button"
        onClick={() => navigateTo("/projects")}
        className="group flex items-center gap-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-70"
      >
        <span className="text-white/70 transition-transform group-hover:-translate-x-1">❨</span>
        <LocalizedText fr="Tous les projets" en="All projects" />
        <span className="text-white/70 transition-transform group-hover:translate-x-1">❩</span>
      </button>
    </div>

  </section>
  );
};

export default WorksShowcase;
