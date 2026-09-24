import { LocalizedText } from "./LanguageToggle";
import { navigateTo } from "../utils/navigation";

/** Pinwheel motif from /wind.svg, inlined so it inherits the text color. */
const Wind = ({ className = "" }: { className?: string }) => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" className={className} aria-hidden="true">
    <path
      d="M10.5213 10.5213H4.26632L6.14563 7.72742M10.5213 10.5213L10.4787 4.26625L13.2726 6.14558M10.5213 10.5213L16.7337 10.4786L14.8544 13.2725M10.5213 10.5213V16.7336L7.72751 14.8544M6.14563 7.72742L1 4.26625V10.3292L7.72751 14.8544M6.14563 7.72742L10.6709 1L16.7338 1.00004L13.2726 6.14558M13.2726 6.14558L20 10.6707V16.7336L14.8544 13.2725M14.8544 13.2725L10.3293 20L4.26638 20L7.72751 14.8544"
      stroke="currentColor"
      strokeWidth="0.771242"
      strokeLinejoin="round"
    />
  </svg>
);

const ClientsSection = () => (
  /* En mobile le hero se termine sur "UI / UX" puis laisse du vide avant
     cette section. La marge negative la fait remonter au niveau du dernier
     mot. Elle est calee sur la taille et la position du bloc de titres du
     hero : agrandir ceux-ci ou les descendre demande de la reduire, sinon la
     section leur repasse dessus. Le desktop garde son enchainement normal. */
  <section className="clients-section relative z-[60] -mt-[180px] w-screen overflow-hidden bg-black px-5 pb-16 pt-0 text-white md:z-auto md:mt-0 md:px-8 md:pb-24">
    {/* Center stage: copy left / oval monogram / copy right */}
    {/* En mobile la colonne s'ouvrait sur un pt-[5vw] puis un gap de 40px :
        la phrase d'accroche tombait trop bas et l'ovale la repoussait encore.
        On colle la phrase en haut (pt-0) et on resserre l'ecart -- le desktop
        garde ses valeurs. */}
    <div className="relative z-[2] grid items-center gap-5 pt-0 md:grid-cols-[1fr_auto_1fr] md:gap-8 md:pt-[2vw]">
      <p className="reveal-left mx-auto max-w-[260px] text-center font-mono text-[10px] uppercase leading-[1.7] tracking-[0.08em] text-white/75 md:mx-0 md:ml-auto md:text-right md:text-[11px]">
        <LocalizedText
          fr="La fusion des principes du design avec une narration visuelle sans égale."
          en="The fusion of design principles with unparalleled visual storytelling."
        />
      </p>

      <div className="reveal-up relative mx-auto flex h-[240px] w-[135px] items-center justify-center md:h-[310px] md:w-[170px]">
        <div className="absolute inset-0 rounded-full border border-white/15" />
        <Wind className="wind-spin absolute top-[11%] text-white/70" />
        <Wind className="wind-spin absolute bottom-[11%] text-white/70" />
        <span className="clients-script text-[3.5rem] leading-none text-[#E4739B] md:text-[4.5rem]">ET</span>
      </div>

      <p className="reveal-right mx-auto max-w-[260px] text-center font-mono text-[10px] uppercase leading-[1.7] tracking-[0.08em] text-white/75 md:mx-0 md:mr-auto md:text-left md:text-[11px]">
        <LocalizedText
          fr="Je conçois des sites qui portent votre marque sur la scène mondiale."
          en="I craft websites which will elevate your brand to a global stage."
        />
      </p>
    </div>

    {/* Bracketed call to action */}
    <div className="reveal-up relative z-[2] mt-14 flex justify-center md:mt-20">
      <button
        type="button"
        onClick={() => navigateTo("/contact")}
        className="group flex items-center gap-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-70"
      >
        <span className="text-white/70 transition-transform group-hover:-translate-x-1">❨</span>
        <LocalizedText fr="Travailler ensemble" en="Work with me" />
        <span className="text-white/70 transition-transform group-hover:translate-x-1">❩</span>
      </button>
    </div>
  </section>
);

export default ClientsSection;
