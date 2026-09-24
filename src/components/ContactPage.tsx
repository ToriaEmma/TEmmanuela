import MobileSiteMenu from "./MobileSiteMenu";
import DesktopSiteHeader from "./DesktopSiteHeader";
import Footer from "./Footer";
import { LocalizedText } from "./LanguageToggle";

// La page tenait sur un seul ecran (h-screen + overflow-hidden). Le Footer du
// site faisant a lui seul 72vh, il ne pouvait pas y entrer : la page defile
// donc maintenant, la carte de contact gardant son ecran plein, le Footer
// venant dessous.
const ContactPage = () => (
  <main className="theme-surface contact-page relative bg-black px-5 font-mono text-[#d3d0c5] md:px-8">
    <MobileSiteMenu />
    <DesktopSiteHeader active="contact" />

    {/* La marge laterale vit sur le <main>, comme sur les autres pages : c'est
        elle qui aligne l'en-tete. Le Footer, lui, doit filer bord a bord --
        d'ou le -mx qui annule cette marge juste pour lui. */}
    <div className="relative flex min-h-svh flex-col justify-between overflow-hidden">

    {/* Bloc central : grille 3 colonnes, la carte encadree au milieu. */}
    <section className="contact-stage relative z-10 grid flex-1 items-center gap-10 py-6 md:grid-cols-[1fr_auto_1fr]">
      {/* Colonne gauche : coordonnees */}
      <div className="hidden flex-col gap-2 text-[10px] font-semibold uppercase leading-[1.3] tracking-[0.1em] opacity-70 md:flex">
        <a href="mailto:todedjiemma9@gmail.com" className="contact-link">todedjiemma9@gmail.com</a>
        <a href="https://wa.me/22968678025" target="_blank" rel="noreferrer" className="contact-link">+229 68 67 80 25</a>
      </div>

      {/* La carte encadree, coeur de la composition. Le cadre est un SVG a
          ombres internes (comme la reference) et non un simple outline : les
          trois ombres decalees lui donnent son relief grave. */}
      <div className="contact-card relative mx-auto flex items-center justify-center text-center">
        <svg
          className="contact-card__frame"
          viewBox="0 0 540 324"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <g filter="url(#contactFrameShadow)">
            <path d="M536.5 3.5V320.5H3.5V3.5H536.5Z" stroke="currentColor" strokeWidth="7" />
          </g>
          <defs>
            <filter id="contactFrameShadow" x="-3" y="-10" width="551" height="336" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />

              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dx="4" dy="-2" />
              <feGaussianBlur stdDeviation="1.5" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend mode="overlay" in2="shape" result="inner1" />

              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dx="8" dy="-10" />
              <feGaussianBlur stdDeviation="7.5" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend mode="overlay" in2="inner1" result="inner2" />

              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dx="-3" dy="2" />
              <feGaussianBlur stdDeviation="1.5" />
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
              <feBlend mode="normal" in2="inner2" result="inner3" />
            </filter>
          </defs>
        </svg>

        {/* Le cadre contient deux moities, comme la reference : la
            newsletter a gauche, la signature et l'adresse a droite. */}
        <div className="contact-card__inner relative z-10 flex h-full w-full">
          <div className="news-letter-card is-contact">
            <div className="news-letter-card__title">Newsletter</div>

            <form className="news-form" onSubmit={(event) => event.preventDefault()}>
              <input
                type="email"
                name="email"
                required
                placeholder="Votre email"
                aria-label="Votre email"
                className="field-form"
              />
              <div className="fake-submit_w">
                <button type="submit" className="submit-btn" aria-label="Envoyer" />
                <span className="arrow-submit-form" aria-hidden="true">
                  <svg width="100%" height="100%" viewBox="0 0 9 9" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.97361 0.199952L0.200012 0.199951L0.200012 1.42636L6.10593 1.42636L0.412716 7.11956L1.2804 7.98725L6.97361 2.29404L6.97361 8.19995L8.20001 8.19995L8.20001 1.42636L8.20001 0.199953L6.97361 0.199952Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="0.4"
                    />
                  </svg>
                </span>
              </div>
            </form>
          </div>

          <div className="card-svg_w">
            {/* Meme monogramme que la section ET de la home : script rose. */}
            <span className="clients-script card-signature" aria-hidden="true">ET</span>
            <p className="card-address">
              Cotonou
              <br />
              Bénin
            </p>
          </div>
        </div>
      </div>

      {/* Colonne droite : liens sociaux */}
      <div className="hidden flex-col items-end gap-2 text-right text-[10px] font-semibold uppercase leading-[1.3] tracking-[0.1em] opacity-70 md:flex">
        <a href="https://www.linkedin.com/in/Emmanuela%20TODEDJI" target="_blank" rel="noreferrer" className="contact-link">LinkedIn</a>
        <a href="https://wa.me/22968678025" target="_blank" rel="noreferrer" className="contact-link">WhatsApp</a>
      </div>
    </section>

    {/* Pied de page interne : la page ne scrolle pas. */}
    <footer className="relative z-10 flex items-end justify-between border-t border-current/15 py-5 text-[10px] font-semibold uppercase tracking-[0.1em] opacity-60 md:text-[11px]">
      <p>
        Cotonou, Bénin
        <span className="block opacity-70"><LocalizedText fr="Disponible pour de nouveaux projets" en="Available for new projects" /></span>
      </p>
      <p>Emmanuela© 2026</p>
    </footer>
    </div>

    <div className="-mx-5 md:-mx-8">
      <Footer />
    </div>
  </main>
);

export default ContactPage;
