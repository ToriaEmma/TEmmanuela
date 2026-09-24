import MobileSiteMenu from "./MobileSiteMenu";
import DesktopSiteHeader from "./DesktopSiteHeader";
import Footer from "./Footer";

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
      </div>
    </section>

    </div>

    <div className="-mx-5 md:-mx-8">
      <Footer />
    </div>
  </main>
);

export default ContactPage;
