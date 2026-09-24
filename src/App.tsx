import Hero from "./components/Hero";
import "locomotive-scroll/dist/locomotive-scroll.css";
import { SmoothScrollProvider } from "./context/ScrollProviderContext.tsx";
import NavBar from "./components/NavBar.tsx";
import ClientsSection from "./components/ClientsSection.tsx";
import LegacySection from "./components/LegacySection.tsx";
import WorksShowcase from "./components/WorksShowcase.tsx";
import ServiceCards from "./components/ServiceCards.tsx";
import Footer from "./components/Footer.tsx";
import { lazy, Suspense, useEffect, useState } from "react";

// Chargees a la demande : chacune traine ses visuels et, pour la grille
// de projets, tout le moteur WebGL. Les garder en import statique mettait ce
// poids dans le bundle de l'accueil, d'ou la lenteur a l'ouverture.
const AboutPage = lazy(() => import("./components/AboutPage"));
const VibeCheckPage = lazy(() => import("./components/VibeCheckPage"));
const ProjectsPage = lazy(() => import("./components/ProjectsPage"));
const ContactPage = lazy(() => import("./components/ContactPage"));
const SvgProjectPage = lazy(() => import("./components/SvgProjectPage"));
const VintageProject = lazy(() => import("./components/VintageProject"));
const DogsProject = lazy(() => import("./components/DogsProject"));
const CatsProject = lazy(() => import("./components/CatsProject"));
const ProjectShowcase = lazy(() => import("./components/ProjectShowcase"));

import MobileSiteMenu from "./components/MobileSiteMenu";
import PinkCursor from "./components/PinkCursor";
import SiteLoader from "./components/SiteLoader";
import InteractionSounds from "./components/InteractionSounds";


function PageContent() {
  if (window.location.pathname === "/shella") return <SvgProjectPage compactScreens year="2026" title="Shella" description="Une application de couture sur mesure : suivre sa commande étape par étape, échanger avec l’atelier et régler en mobile money." descriptionEn="A made-to-measure tailoring app: follow your order step by step, talk to the workshop and pay with mobile money." images={["/shella/14.webp", "/shella/2.webp", "/shella/1.webp", "/shella/3.webp", "/shella/4.webp", "/shella/5.webp", "/shella/6.webp", "/shella/7.webp", "/shella/8.webp", "/shella/9.webp", "/shella/10.webp", "/shella/11.webp", "/shella/12.webp", "/shella/13.webp"]} />;
  if (window.location.pathname === "/secure-tutor-app") return <SvgProjectPage compactScreens title="Secure Tutor App" description="Une application éducative pensée pour accompagner les enfants avec des parcours simples, interactifs et rassurants." descriptionEn="An educational app designed to support children through simple, interactive and reassuring learning journeys." images={["/securtutorapp/Bienvenue-1.webp", "/securtutorapp/Page d'acceuil.webp", "/securtutorapp/choix.webp", "/securtutorapp/enfant.webp", "/securtutorapp/enfant-1.webp", "/securtutorapp/enfant-2.webp", "/securtutorapp/Reaction.webp", "/securtutorapp/Reaction-1.webp", "/securtutorapp/Reaction-2.webp"]} />;
  if (window.location.pathname === "/arbitrachain") return <SvgProjectPage year="2025" title="ArbitraChain" description="Conception d’une plateforme numérique dédiée à l’arbitrage, structurée pour rendre les démarches plus claires et accessibles." descriptionEn="Design of a digital arbitration platform structured to make processes clearer and more accessible." images={Array.from({ length: 8 }, (_, index) => `/ArbitraChain/image_${index + 1}.webp`)} />;
  if (window.location.pathname === "/tekbot") return <SvgProjectPage year="2025" title="Tekbot" description="Conception d’une plateforme pédagogique qui rend l’apprentissage de la robotique progressif, pratique et accessible." descriptionEn="Design of a learning platform that makes robotics education progressive, practical and accessible." images={["/Tekbot/Accueil.webp", "/Tekbot/Dashboard.webp", "/Tekbot/Modules_inter.webp", "/Tekbot/mod1_exo1_step1-1.webp", "/Tekbot/mod1_exo1_step1_valided-2.webp"]} />;

  if (window.location.pathname === "/meb") return <SvgProjectPage title="MEB" description="Conception d’une expérience web complète, claire et structurée, de l’interface jusqu’aux écrans détaillés." descriptionEn="Design of a complete, clear and structured web experience, from the interface to detailed screens." images={["/site%20/meb1.svg", "/site%20/meb2.svg"]} />;
  if (window.location.pathname === "/snaki") return <SvgProjectPage year="2026" title="Snaki" description="Un site de bubble tea pensé comme une marque autant que comme une boutique : univers illustré, carte des bobas et commande à emporter." descriptionEn="A bubble tea site built as much as a brand as a shop: illustrated world, boba menu and takeaway ordering." images={[1, 2, 3, 4, 5].map((i) => `/works-modal/snaki/${i}.webp`)} />;
  if (window.location.pathname === "/zem") return <SvgProjectPage title="ZEM" description="Direction UI/UX et conception d’une expérience digitale aux contrastes affirmés." descriptionEn="UI/UX direction and design of a digital experience with bold contrasts." images={["/site%20/zem1.svg", "/site%20/zem2.svg"]} />;
  if (window.location.pathname === "/contact") {
    return <ContactPage />;
  }

  if (window.location.pathname === "/projects") {
    return <ProjectsPage />;
  }


  if (window.location.pathname === "/vibe-check") {
    return <VibeCheckPage />;
  }


  if (window.location.pathname === "/about") {
    return <AboutPage />;
  }

  if (window.location.pathname === "/vintage") {
    return <VintageProject />;
  }

  if (window.location.pathname === "/dogs") {
    return <DogsProject />;
  }

  if (window.location.pathname === "/cats") {
    return <CatsProject />;
  }

  if (window.location.pathname === "/secure-tutor") {
    return (
      <ProjectShowcase
        title="Secure Tutor"
        tagline="Apprendre avec confiance"
        taglineEn="Learn with confidence"
        hero="/REVOLU/big secure.webp"
        intro="Création de l’identité Secure Tutor et de ses déclinaisons sur des goodies, notamment les t-shirts et les objets de marque."
        introEn="Creation of the Secure Tutor identity and its applications across branded merchandise, including T-shirts and promotional items."
        sectionTitle="Goodies & textile"
        sectionTitleEn="Merchandise & apparel"
        sectionText="L’univers graphique se décline sur les t-shirts, accessoires et supports promotionnels pour rendre la marque cohérente et reconnaissable."
        sectionTextEn="The visual identity extends across T-shirts, accessories and promotional materials to make the brand consistent and recognizable."
        identityImages={Array.from({ length: 4 }, (_, index) => `/REVOLU/secure/${index + 1}.webp`)}
        applicationImages={[1, 2, 3, 4, 5, 7].map(
          (index) => `/SITEE_optimized/frame_${index}.webp`,
        )}
        compactApplications
        expertise="Identité, goodies & textile"
        expertiseEn="Identity, merchandise & apparel"
      />
    );
  }

  if (window.location.pathname === "/gummy") {
    return (
      <ProjectShowcase
        title="Gummy"
        tagline="Eat the gummy with no regret"
        taglineEn="Eat the gummy with no regret"
        hero="/newbig.webp"
        intro="Gummy développe un univers gourmand, énergique et pop autour d’une identité illustrée à fort impact."
        introEn="Gummy builds a delicious, energetic pop universe around a high-impact illustrated identity."
        sectionTitle="Gummy collection"
        sectionTitleEn="Gummy collection"
        sectionText="La marque se déploie sur le packaging, les accessoires et le textile avec une énergie colorée constante."
        sectionTextEn="The brand unfolds across packaging, accessories and apparel with consistent colorful energy."
        identityImages={[
          "/REVOLU/GUMMY/0.83.webp",
          "/REVOLU/GUMMY/0.83 (2).webp",
          "/REVOLU/GUMMY/0.83 (3).webp",
        ]}
        applicationImages={Array.from({ length: 5 }, (_, index) => `/REVOLU/Totaly/${index + 19}.webp`)}
        expertise="Branding & packaging"
        expertiseEn="Branding & packaging"
      />
    );
  }

  if (window.location.pathname === "/vennis") {
    return (
      <ProjectShowcase
        title="Vennis Tenis Club"
        tagline="Play beyond the baseline"
        taglineEn="Play beyond the baseline"
        hero="/REVOLU/big venis.webp"
        intro="Vennis Tenis Club associe l’élégance du tennis à une attitude contemporaine, vive et inclusive."
        introEn="Vennis Tennis Club combines the elegance of tennis with a contemporary, vibrant and inclusive attitude."
        sectionTitle="Vennis collection"
        sectionTitleEn="Vennis collection"
        sectionText="L’identité se prolonge sur les accessoires, le textile et les espaces du club dans une palette verte et rose."
        sectionTextEn="The identity extends across accessories, apparel and club spaces in a green and pink palette."
        identityImages={Array.from({ length: 3 }, (_, index) => `/REVOLU/VENNIS/${index + 1}.webp`)}
        applicationImages={["13", "14", "15", "17", "18"].map((n) => `/REVOLU/Totaly/${n}.webp`)}
        expertise="Branding & direction artistique"
        expertiseEn="Branding & art direction"
      />
    );
  }

  return (
    <>
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
                <img src="/motif.gif" alt="" aria-hidden="true" className="h-[28px] w-auto translate-y-[5vw]" />
                ui / ux
                <img src="/motif.gif" alt="" aria-hidden="true" className="h-[28px] w-auto translate-y-[5vw]" />
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
    </>
  );
}

function App() {
  // Le loader couvre l'ecran le temps de sa timeline (compteur 000 -> 100 puis
  // ouverture du rideau), puis se retire.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 5600);
    return () => window.clearTimeout(timer);
  }, []);
  const [, setLocationKey] = useState(() => `${window.location.pathname}${window.location.search}${window.location.hash}`);

  useEffect(() => {
    const updateLocation = () => setLocationKey(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    window.addEventListener("popstate", updateLocation);
    return () => window.removeEventListener("popstate", updateLocation);
  }, []);

  useEffect(() => {
    if (isLoading || !window.location.hash) return;
    const timer = window.setTimeout(() => {
      document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  return (
    <>
      <PinkCursor />
      <InteractionSounds />
      {/* Le site ne se monte qu'une fois le loader termine : sinon Three.js,
          Locomotive et toutes les images se chargent PENDANT l'animation et la
          font tomber a quelques images par seconde. */}
      {/* Grain du site : un seul calque, fixe au viewport, pose par-dessus
          toutes les pages (et non plus seulement la home). */}
      {!isLoading && <div aria-hidden="true" className="site-grain" />}
      {/* Fallback noir plein ecran : les pages chargees a la demande arrivent
          en une fraction de seconde, on evite juste le flash blanc. */}
      {!isLoading && (
        <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
          <PageContent />
        </Suspense>
      )}
      {isLoading && <SiteLoader />}
    </>
  );
}

export default App;
