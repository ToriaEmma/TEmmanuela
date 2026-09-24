import gsap from "gsap";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import Button from "./Button";
import { TiLocation } from "react-icons/ti";
import { ScrollTrigger } from "gsap/all";
// La fleur est purement decorative : trois-quarts du poids JS du site
// (three + @react-three) partaient avec l'accueil pour elle. Chargee a la
// demande, le hero s'affiche sans l'attendre et elle apparait ensuite.
const Flower3D = lazy(() => import("./Flower3D"));
import { LocalizedText } from "./LanguageToggle";
gsap.registerPlugin(ScrollTrigger);
const Hero = () => {
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement | null>(null);

  // Fond unique du hero : plus de rotation au clic, donc plus de cible cliquable
  // ni d'etat d'index a suivre.
  const heroImage = "/title3.png";

  useEffect(() => {
    // Never leave mobile visitors trapped behind the hero loader when an
    // optional image is slow or rejected by Safari/the CDN.
    const fallback = window.setTimeout(() => setIsLoading(false), 4500);
    return () => window.clearTimeout(fallback);
  }, []);
  useEffect(() => {
    // Le hero reste un bloc rectangulaire net, identique sur mobile et desktop :
    // plus de decoupe en polygone ni d'arrondi animes au scroll, pour qu'il soit
    // directement colle a la section suivante en defilement simple.
    gsap.set("#video-frame", {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      borderRadius: 0,
    });
  }, []);
  return (
    <div ref={heroRef} className="hero relative h-[120svh] w-screen overflow-x-hidden md:h-[185dvh]">
      {isLoading && (
        <div className="flex-center absolute z-[100] h-[120svh] w-screen overflow-hidden bg-violet-50 md:h-[185dvh]">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}
      <div id="video-frame" className="relative z-10 h-[120svh] w-screen overflow-hidden bg-blue-75 md:h-[185dvh]">
        {" "}
        <div className=" video-container">
          <img
            src={heroImage}
            id="video-0"
            alt=""
            className="absolute-center absolute z-[30] h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />

        </div>
        {/* Nuages : deux bandes qui derivent de la droite vers la gauche, a des
            vitesses differentes pour donner de la profondeur. Chaque piste fait
            200% de large et contient l'image en double, ce qui permet a
            l'animation de boucler sur -50% sans couture visible. */}
        <div className="cloud-band pointer-events-none absolute inset-x-0 top-[24%] z-[32] h-[52%] overflow-hidden">
          <div className="animate-cloud-drift flex h-full w-[200%]">
            <img src="/clouds_2.webp" alt="" aria-hidden="true" className="h-full w-1/2 object-cover opacity-55" />
            <img src="/clouds_2.webp" alt="" aria-hidden="true" className="h-full w-1/2 object-cover opacity-55" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-30 bg-black/10" />

        {/* Fondu du FOND vers le noir : demarre a hauteur de CREATIVE et
            s'assombrit jusqu'au bas du hero. Pose en z-[31] : au-dessus de
            l'image de fond (z-30), mais sous les nuages, la fleur et les
            titres. Trois paliers rapproches (25% / 60% / 85%) pour que la
            progression reste douce sur toute la hauteur, sans palier visible. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[31] h-[92svh] bg-gradient-to-b from-transparent via-black/45 to-black md:h-[95dvh] md:via-black/25 md:to-black" />

        {/* Les deux moities de l'ovale sont empilees separement pour que la
            fleur passe ENTRE elles : le haut derriere (z-34), le bas devant
            (z-40). Elles restent dans un conteneur commun de meme geometrie,
            donc le raccord ne bouge pas. */}
        <div className="pointer-events-none absolute inset-x-0 top-[30%] z-[34] mx-auto flex w-[90%] -translate-y-1/2 flex-col md:top-[26%]">
          <img
            src="/oval_mobile_top.svg"
            alt=""
            aria-hidden="true"
            className="block w-full select-none md:hidden"
          />
          <img
            src="/oval_desktop_top.svg"
            alt=""
            aria-hidden="true"
            className="hidden w-full select-none md:block"
          />
          <img
            src="/oval_mobile_bot.svg"
            alt=""
            aria-hidden="true"
            className="-mt-px block w-full select-none opacity-0 md:hidden"
          />
          <img
            src="/oval_desktop_bot.svg"
            alt=""
            aria-hidden="true"
            className="-mt-px hidden w-full select-none opacity-0 md:block"
          />

          {/* Encadre en haut a gauche du cadre, comme l'infobox de la
              reference (.ban__oval__box : top 5%, left 2%). */}
          <div className="absolute left-1/2 top-[4%] z-[8] w-[84%] -translate-x-1/2 border border-[#280822]/25 px-3 py-1.5 text-center md:left-[1%] md:w-auto md:max-w-[16%] md:translate-x-0 md:px-4 md:py-3 md:text-left">
            <p className="whitespace-nowrap font-mono text-[8px] uppercase leading-[1.7] tracking-[0.08em] text-[#280822] md:whitespace-normal md:text-[9px]">
              <LocalizedText
                fr="Designer UI créative & visuelle"
                en="Creative UI & Visual designer"
              />
            </p>
          </div>

          {/* Pendant du bloc de gauche, cale en haut a droite du cadre. */}
          <img
            src="/flag.svg"
            alt=""
            aria-hidden="true"
            className="absolute right-[1%] top-[4%] z-[8] hidden w-[94px] select-none md:block"
          />

        </div>

        <Suspense fallback={null}>
          <Flower3D className="pointer-events-none absolute inset-0 z-[35] translate-y-[3%] md:translate-y-0" />
        </Suspense>

        {/* Second calque du MEME fondu, pose PAR-DESSUS la fleur (z-[36] > 35).
            Sans lui, la plante reste vert vif jusqu'en bas pendant que le fond
            s'assombrit : elle se detache comme un decoupage colle. Avec lui,
            elle s'eteint avec la scene. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[36] h-[92svh] bg-gradient-to-b from-transparent via-black/45 to-black md:h-[95dvh] md:via-black/25 md:to-black" />

        <div className="pointer-events-none absolute inset-x-0 top-[30%] z-40 mx-auto flex w-[90%] -translate-y-1/2 flex-col md:top-[26%]">
          <img
            src="/oval_mobile_top.svg"
            alt=""
            aria-hidden="true"
            className="block w-full select-none opacity-0 md:hidden"
          />
          <img
            src="/oval_desktop_top.svg"
            alt=""
            aria-hidden="true"
            className="hidden w-full select-none opacity-0 md:block"
          />
          <img
            src="/oval_mobile_bot.svg"
            alt=""
            aria-hidden="true"
            className="-mt-px block w-full select-none md:hidden"
          />
          <img
            src="/oval_desktop_bot.svg"
            alt=""
            aria-hidden="true"
            className="-mt-px hidden w-full select-none md:block"
          />
          {/* Trait cale en bas a gauche du cadre de l'ovale, comme sur la
              reference (.ban__oval:after). */}
          <img
            src="/line.svg"
            alt=""
            aria-hidden="true"
            className="absolute bottom-[4%] left-0 z-[6] w-[70px] select-none md:left-[1%] md:w-[90px]"
          />

        </div>

      </div>

      {/* Bloc de titres monumental pose a cheval sur le bas du cadre : on n'en
          voit que les premieres lignes tant que le hero est visible, le reste
          se decouvre au scroll. z-[33] le place DERRIERE la fleur (z-35) et
          l'ovale du bas (z-40), comme sur la reference ou la tige passe devant
          les lettres.

          Les six mots vivent dans un conteneur unique et s'empilent en flux
          normal : chaque ligne herite de la meme police, taille et interligne,
          donc l'empilement reste exact sans calcul de decalage par ligne. */}
      <div
        className="hero-display pointer-events-none absolute inset-x-0 top-[58svh] z-[33] select-none text-center text-[17vw] font-black uppercase leading-[0.9] tracking-[0.01em] md:top-[100dvh] md:-translate-y-[22%] md:text-[14vw]"
        aria-hidden="true"
      >
        <h1 className="text-white/90">Creative</h1>
        <p className="text-white/85">designing</p>
        {/* Les quatre mots suivants n'existent qu'en mobile : sur desktop, le
            titre se limite a CREATIVE / DESIGNING. */}
        {["branding", "web design", "direction"].map((word) => (
          <p key={word} className="text-white/85 md:hidden">
            {word}
          </p>
        ))}
        {/* "ui / ux" est encadre des deux motifs, comme la meme ligne en
            desktop (voir App.tsx) : la version mobile les perdait, le bloc qui
            les portait etant masque sous md. */}
        <p className="flex items-center justify-center gap-[7vw] text-white/85 md:hidden">
          <img src="/motif.gif" alt="" aria-hidden="true" className="h-[18px] w-auto" />
          ui / ux
          <img src="/motif.gif" alt="" aria-hidden="true" className="h-[18px] w-auto" />
        </p>
      </div>
    </div>
  );
};

export default Hero;
