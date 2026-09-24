import { LocalizedText } from "./LanguageToggle";

const LegacySection = () => (
  <section className="legacy-section relative w-screen overflow-hidden bg-white px-5 py-16 text-[#608FBA] md:px-10 md:py-24">
    <div className="grid gap-16 md:grid-cols-2 md:gap-10">
      {/* LEFT — stacked display headline with the script laid over it */}
      <div>
        <div className="relative select-none">
          <h2 className="reveal-up legacy-display text-[19vw] leading-[1.05] tracking-[0.01em] text-[#608FBA] md:text-[9.5vw]">
            <span className="block">CONCEVOIR</span>
            <span className="block">AUTREMENT</span>
          </h2>

        </div>

        {/* Two mono captions under the headline */}
        <div className="reveal-up mt-8 grid grid-cols-2 gap-6 font-mono text-[9px] uppercase leading-[1.6] tracking-[0.06em] text-[#608FBA]/70 md:mt-10 md:text-[11px]">
          <p>
            <LocalizedText
              fr="Avant de dessiner quoi que ce soit, je vous demande ce que vous voulez vraiment dire."
              en="Before I draw anything, I ask what you actually want to say."
            />
          </p>
          <p>
            <LocalizedText
              fr="Le logo, l’appli, le site. Je m’occupe de tout, du premier croquis à la mise en ligne."
              en="The logo, the app, the site. I handle all of it, from first sketch to going live."
            />
          </p>
        </div>

      </div>

      {/* RIGHT — asterisks, label, then the serif statement */}
      <div className="flex flex-col md:pl-[6%]">
        <div className="reveal-right flex justify-end" aria-hidden="true">
          <img src="/motife.svg" alt="" className="h-auto w-[38vw] max-w-[312px]" />
        </div>

        <div className="reveal-up mt-16 flex justify-center md:mt-32">
          <span className="flex items-center gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] md:text-[11px]">
            <span className="text-[#608FBA]/70">❨</span>
            <LocalizedText fr="Ce que je fais" en="What I do" />
            <span className="text-[#608FBA]/70">❩</span>
          </span>
        </div>

        <p className="reveal-up legacy-serif mx-auto mt-8 max-w-[440px] text-center text-[6.2vw] leading-[1.15] text-[#1A1A1A] md:mt-10 md:text-[2.5vw]">
          <LocalizedText
            fr="Je fais des marques et des interfaces qu’on comprend tout de suite, dont on se sert sans réfléchir, et qui vous ressemblent vraiment."
            en="I make brands and interfaces you understand right away, use without thinking, and actually recognise as yours."
          />
        </p>
      </div>
    </div>
  </section>
);

export default LegacySection;
