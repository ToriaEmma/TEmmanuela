import Hero from "./Hero";
import { SmoothScrollProvider } from "../context/ScrollProviderContext.tsx";
import NavBar from "./NavBar.tsx";
import ClientsSection from "./ClientsSection.tsx";
import LegacySection from "./LegacySection.tsx";
import WorksShowcase from "./WorksShowcase.tsx";
import ServiceCards from "./ServiceCards.tsx";
import Footer from "./Footer.tsx";
import MobileSiteMenu from "./MobileSiteMenu";

// L'accueil vit dans son propre chunk : il n'est pas affiche avant la fin du
// loader, donc inutile de le faire telecharger et parser AVANT la premiere
// image du loader. App le precharge pendant l'animation (voir warmUpSite), il
// est donc pret quand le rideau s'ouvre.
const HomePage = () => (
  <SmoothScrollProvider>
    <NavBar />
    <MobileSiteMenu showIdentity={false} />
    <div data-scroll-container className="  overflow-hidden main-container relative min-h-screen w-screen ">
      <Hero />
      {/* Bloc noir qui prolonge le hero. Meme noir que la fin de son
          degrade et meme grain, pour que le raccord soit invisible.

          Sur desktop il porte la SUITE du titre (branding, web design,
          direction, ui / ux) : ces mots ne tiennent pas dans le hero sans
          en decaler le contenu, alors qu'ici ils s'enchainent sans rien
          bouger. Memes tokens typographiques que la pile du hero --
          hero-display, 14vw, leading-[0.9], tracking-[0.01em] -- donc la
          lecture se poursuit comme s'il n'y avait qu'un seul bloc.

          En mobile les six mots sont deja dans le hero : le bloc y reste
          une simple respiration noire. */}
      <div
        aria-hidden="true"
        className="relative z-20 h-[40svh] w-full bg-black md:-mt-[48dvh] md:flex md:h-auto md:flex-col md:justify-start md:bg-transparent md:pb-[18dvh]"
      >
        <div className="hero-display hidden select-none text-center text-[14vw] font-black uppercase leading-[0.9] tracking-[0.01em] text-white/85 md:block">
          <p>branding</p>
          <p>web design</p>
          <p>direction</p>
          {/* leading-[0.9] sur du 14vw : la boite de ligne depasse largement
              les glyphes, d'ou le calage vertical manuel des motifs. */}
          <p className="flex items-center justify-center gap-[19vw]">
            <img src="/motif.webp" alt="" aria-hidden="true" className="h-[28px] w-auto translate-y-[5vw]" />
            ui / ux
            <img src="/motif.webp" alt="" aria-hidden="true" className="h-[28px] w-auto translate-y-[5vw]" />
          </p>
        </div>
      </div>
      <ClientsSection />
      <LegacySection />
      <WorksShowcase />
      <ServiceCards />
      <Footer/>
    </div>
  </SmoothScrollProvider>
);

export default HomePage;
