import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { LocalizedText } from "./LanguageToggle";
import { navigateTo } from "../utils/navigation";

gsap.registerPlugin(ScrollTrigger);

/** Le paragraphe est decoupe a la main : chaque ligne se revele derriere son
    propre masque, comme sur la reference (descriptionLineMask). */
const cards = [
  {
    number: "01",
    title: "UI/UX Design",
    tools: ["Figma", "Framer", "Prototypage", "Design System"],
    bg: "#fdfdfd",
    fg: "#212121",
    // Chaque carte montre un projet de SA discipline (meme categorie que
    // dans la page projets) : Shella est classee uiux.
    image: "/shella/cover.webp",
    href: "/projects",
    lines: [
      "Je commence toujours par regarder qui va",
      "s'en servir, et dans quel état : pressé,",
      "sur un écran fissuré, à une main dans le",
      "bus. Un écran réussi, c'est celui où on",
      "trouve ce qu'on cherche sans y penser.",
      "Le reste, c'est de la décoration.",
    ],
    linesEn: [
      "I always start by looking at who will",
      "use it, and in what state: in a hurry,",
      "on a cracked screen, one-handed on the",
      "bus. A screen works when you find what",
      "you came for without thinking about it.",
      "The rest is decoration.",
    ],
  },
  {
    number: "02",
    title: "Creative Dev",
    tools: ["HTML", "CSS", "JavaScript", "React", "GSAP", "Three.js"],
    bg: "#f27ca3",
    fg: "#212121",
    // Snaki, categorie website : un site livre, code.
    image: "/works-modal/snaki/2.webp",
    href: "/projects",
    lines: [
      "Je code moi-même ce que je dessine : rien",
      "ne se perd entre la maquette et l'écran,",
      "et je sais ce qui coûte cher à charger.",
      "Une animation doit dire où l'on est ou",
      "ce qui vient de changer. Si elle ne fait",
      "que décorer, je l'enlève.",
    ],
    linesEn: [
      "I code what I draw, myself: nothing gets",
      "lost between the mockup and the screen,",
      "and I know what is expensive to load.",
      "An animation should say where you are or",
      "what just changed. If it only decorates,",
      "it goes.",
    ],
  },
  {
    number: "03",
    title: "Art Direction",
    tools: ["Figma", "Illustrator", "Photoshop", "Typographie"],
    bg: "#608fba",
    fg: "#fdfdfd",
    // ZEM : direction artistique a fort contraste.
    image: "/works-modal/zem2.0/1.webp",
    href: "/about",
    lines: [
      "Avant les couleurs et les typos, je",
      "cherche ce que le projet a à dire.",
      "C'est ce qui rend les choix évidents",
      "plus tard, au lieu d'en faire une",
      "affaire de goût. Une direction tient",
      "quand elle sait aussi dire non.",
    ],
    linesEn: [
      "Before colours and type, I look for",
      "what the project has to say.",
      "That is what makes later choices",
      "obvious, not a matter of taste.",
      "A direction holds when it also",
      "knows how to say no.",
    ],
  },
  {
    number: "04",
    title: "Branding",
    tools: ["Illustrator", "Photoshop", "InDesign", "Figma"],
    bg: "#d4ff36",
    fg: "#212121",
    // Cats, categorie brand : identite de marque illustree.
    image: "/optimized/cats-card.webp",
    href: "/projects",
    lines: [
      "Une marque, c'est ce qu'on retient",
      "de vous quand vous n'êtes pas là.",
      "Je commence par vous écouter en",
      "parler : les mots justes sont déjà",
      "là. Un logo ne sauve pas une histoire",
      "floue, il rend la vôtre visible.",
    ],
    linesEn: [
      "A brand is what people remember",
      "of you when you are not there.",
      "I start by listening to you talk",
      "about it: the right words are",
      "already there. A logo cannot save a",
      "blurry story, it makes yours visible.",
    ],
  },
];

const ServiceCards = () => {
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const scroller = isMobile ? undefined : ".main-container";

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".service-card");

      cards.forEach((card, index) => {
        const inner = card.querySelector<HTMLElement>(".service-card__inner");
        if (!inner) return;

        // 1. La carte arrive inclinee (rotate 3deg en CSS) et se redresse.
        gsap.to(inner, {
          rotation: 0,
          ease: "none",
          scrollTrigger: { trigger: card, scroller, start: "top bottom", end: "top 20%", scrub: true },
        });

        const separator = card.querySelector(".service-card__separator");
        const number = card.querySelector(".service-card__number");
        const lines = card.querySelectorAll(".service-card__line");
        const rule = card.querySelector(".service-card__rule");
        // En mobile le visuel est masque (hidden md:block) : inutile de lui
        // poser un clipPath et un ScrollTrigger, c'est autant de travail en
        // moins sur des appareils deja charges.
        const image = isMobile ? null : card.querySelector(".service-card__image");

        // 2. Revelation du visuel par clip-path.
        if (image) {
          gsap.set(image, { clipPath: "inset(100% 0 0 0)" });
          const reveal = gsap.timeline({ paused: true });
          reveal.to(image, { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "expo.inOut" });
          ScrollTrigger.create({
            trigger: image, scroller, start: "top 70%", end: "bottom 60%",
            onEnter: () => reveal.play(), onEnterBack: () => reveal.play(), onLeaveBack: () => reveal.reverse(),
          });
        }

        // 3. Entree du bloc de texte : separateur, numero, puis les lignes.
        const intro = gsap.timeline({ paused: true });
        if (separator) {
          gsap.set(separator, { scaleY: 0 });
          intro.to(separator, { scaleY: 1, duration: 0.7, ease: "power3.out" }, 0);
        }
        if (number) {
          gsap.set(number, { y: "108%" });
          intro.to(number, { y: "0%", duration: 0.75, ease: "power3.out" }, 0);
        }
        if (lines.length) {
          gsap.set(lines, { y: "108%" });
          intro.to(lines, { y: "0%", duration: 0.65, ease: "power3.out", stagger: 0.055 }, 0.05);
        }
        ScrollTrigger.create({
          trigger: card, scroller, start: "top 75%", end: "top 50%",
          onEnter: () => intro.play(), onEnterBack: () => intro.play(), onLeaveBack: () => intro.reverse(),
        });

        // 4. Trait qui se deploie a cote du visuel.
        if (rule) {
          gsap.set(rule, { scaleX: 0 });
          const draw = gsap.timeline({ paused: true });
          draw.to(rule, { scaleX: 1, duration: 1.8, ease: "expo.inOut" });
          ScrollTrigger.create({
            trigger: rule, scroller, start: "top 95%", end: "top 60%",
            onEnter: () => draw.play(), onEnterBack: () => draw.play(), onLeaveBack: () => draw.reverse(),
          });
        }

        // 5. Empilement : chaque carte sauf la derniere reste epinglee et
        //    s'assombrit pendant que la suivante monte par-dessus.
        if (index < cards.length - 1) {
          ScrollTrigger.create({
            trigger: card, scroller, start: "bottom bottom", end: "bottom top",
            pin: true, pinSpacing: false,
          });
          const overlay = card.querySelector(".service-card__overlay");
          if (overlay) {
            gsap.to(overlay, {
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: card, scroller, start: "bottom bottom", end: "bottom top", scrub: true },
            });
          }
        }
      });
    });

    const timer = window.setTimeout(() => ScrollTrigger.refresh(), 1000);
    return () => {
      ctx.revert();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section className="service-cards relative w-screen overflow-x-clip bg-black">
      {cards.map((card) => (
        <div key={card.number} className="service-card relative h-screen min-h-screen w-full">
          <div
            className={`service-card__inner relative flex h-full w-full origin-bottom-left rotate-3 flex-col gap-6 px-3 py-14 md:flex-row md:items-stretch md:gap-[8vw] md:px-6 ${card.bg === "#fdfdfd" || card.bg === "#d4ff36" ? "is-light-surface" : ""}`}
            style={{ backgroundColor: card.bg, color: card.fg }}
          >
            {/* is-light-surface : seuls le blanc et le vert neon sont assez
                clairs pour que la nav doive s'y inverser. Le rose et le bleu
                restent assez sombres pour garder une nav blanche. */}
            {/* Voile noir : s'opacifie quand la carte suivante monte dessus. */}
            <div className="service-card__overlay pointer-events-none absolute inset-0 z-10 bg-black/35 opacity-0" />

            {/* Colonne gauche : numero, texte revele, titre geant */}
            <div className="flex flex-1 flex-col justify-between md:h-full">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="overflow-hidden font-mono text-[11px] md:text-[13px]">
                  <span className="service-card__number block">{card.number}</span>
                </span>
                <span className="service-card__separator mt-2 h-10 w-px shrink-0 origin-top bg-current opacity-40 md:h-14" />

                <div>
                  {card.lines.map((line, index) => (
                    <div key={index} className="overflow-hidden">
                      <span className="service-card__line block font-mono text-[11px] uppercase leading-[1.8] tracking-[0.04em] md:text-[13px]">
                        <LocalizedText fr={line} en={card.linesEn[index] ?? ""} />
                      </span>
                    </div>
                  ))}

                  {/* Les outils concrets derriere la competence : la carte
                      disait l'intention, pas avec quoi elle se fabrique. Meme
                      reveal que les lignes (masque + service-card__line). */}
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {card.tools.map((tool) => (
                      <li key={tool} className="overflow-hidden">
                        <span className="service-card__line block rounded-full border border-current px-3 py-1 font-mono text-[10px] uppercase tracking-[0.06em] opacity-70 md:text-[11px]">
                          {tool}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo(card.href)}
                className="group mt-12 text-left md:mt-0"
              >
                <p className="legacy-display text-[22vw] uppercase leading-[1.05] tracking-[0.01em] md:text-[13vw]">
                  {card.title}
                </p>
                <span className="mt-2 block h-px w-full origin-center bg-current transition-transform duration-500 group-hover:scale-x-0" />
                <span className="mt-3 flex items-center justify-between font-mono text-[10px] md:text-[12px]">
                  <LocalizedText fr="En savoir plus" en="Learn more" />
                  <span aria-hidden="true">↗</span>
                </span>
              </button>
            </div>

            {/* Colonne droite : trait qui se deploie + visuel revele */}
            <div className="flex shrink-0 flex-col self-start md:max-w-[22%] md:self-end md:pb-24">
              <span className="service-card__rule mb-4 block h-px w-full origin-left bg-current opacity-40" />
              <img
                src={card.image.replace(/ /g, "%20")}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="service-card__image hidden aspect-[4/3] w-full object-cover md:block md:aspect-[3/4]"
              />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ServiceCards;
