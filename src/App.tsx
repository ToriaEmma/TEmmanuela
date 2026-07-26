import AboutUs from "./components/AboutUs";
import Hero from "./components/Hero";
import "locomotive-scroll/dist/locomotive-scroll.css";
import { SmoothScrollProvider } from "./context/ScrollProviderContext.tsx";
import NavBar from "./components/NavBar.tsx";
import Features from "./components/Features.tsx";
import Story from "./components/Story.tsx";
import Footer from "./components/Footer.tsx";
import VintageProject from "./components/VintageProject.tsx";
import DogsProject from "./components/DogsProject.tsx";
import CatsProject from "./components/CatsProject.tsx";
import ProjectShowcase from "./components/ProjectShowcase.tsx";
import { useEffect, useState } from "react";
import { LocalizedText } from "./components/LanguageToggle";
import AboutPage from "./components/AboutPage";
import BrandingGalleryModal from "./components/BrandingGalleryModal";
import VibeCheckPage from "./components/VibeCheckPage";
import MobileSiteMenu from "./components/MobileSiteMenu";
import ProjectsPage from "./components/ProjectsPage";
import ContactPage from "./components/ContactPage";
import PinkCursor from "./components/PinkCursor";
import SvgProjectPage from "./components/SvgProjectPage";
import InteractionSounds from "./components/InteractionSounds";
import ExpertisePage from "./components/ExpertisePage";
import { navigateTo } from "./utils/navigation";

const SiteLoader = () => (
  <div className="site-loader" role="status" aria-label="Chargement du site">
    <div className="site-loader__label">
      <span className="site-loader__marker" aria-hidden="true" />
      <p><LocalizedText fr="Chargement du site..." en="Loading site..." /></p>
    </div>
  </div>
);

function PageContent() {
  if (window.location.pathname === "/secure-tutor-app") return <SvgProjectPage compactScreens title="Secure Tutor App" description="Une application éducative pensée pour accompagner les enfants avec des parcours simples, interactifs et rassurants." descriptionEn="An educational app designed to support children through simple, interactive and reassuring learning journeys." images={["/securtutorapp/Bienvenue-1.webp", "/securtutorapp/Page d'acceuil.webp", "/securtutorapp/choix.webp", "/securtutorapp/enfant.webp", "/securtutorapp/enfant-1.webp", "/securtutorapp/enfant-2.webp", "/securtutorapp/Reaction.webp", "/securtutorapp/Reaction-1.webp", "/securtutorapp/Reaction-2.webp"]} />;
  if (window.location.pathname === "/arbitrachain") return <SvgProjectPage year="2025" title="ArbitraChain" description="Conception d’une plateforme numérique dédiée à l’arbitrage, structurée pour rendre les démarches plus claires et accessibles." descriptionEn="Design of a digital arbitration platform structured to make processes clearer and more accessible." images={Array.from({ length: 8 }, (_, index) => `/ArbitraChain/image_${index + 1}.webp`)} />;
  if (window.location.pathname === "/tekbot") return <SvgProjectPage year="2025" title="Tekbot" description="Conception d’une plateforme pédagogique qui rend l’apprentissage de la robotique progressif, pratique et accessible." descriptionEn="Design of a learning platform that makes robotics education progressive, practical and accessible." images={["/Tekbot/Accueil.webp", "/Tekbot/Dashboard.webp", "/Tekbot/Modules_inter.webp", "/Tekbot/mod1_exo1_step1-1.webp", "/Tekbot/mod1_exo1_step1_valided-2.webp"]} />;
  if (window.location.pathname === "/rhode") return <SvgProjectPage year="2025" title="Rhode" description="Direction artistique et conception d’une expérience digitale dédiée à la beauté et au soin." descriptionEn="Art direction and design of a digital experience dedicated to beauty and skincare." images={["/site%20/rhode.webp"]} />;

  if (window.location.pathname === "/meb") return <SvgProjectPage title="MEB" description="Conception d’une expérience web complète, claire et structurée, de l’interface jusqu’aux écrans détaillés." descriptionEn="Design of a complete, clear and structured web experience, from the interface to detailed screens." images={["/site%20/meb1.svg", "/site%20/meb2.svg"]} />;
  if (window.location.pathname === "/zem") return <SvgProjectPage title="ZEM" description="Direction UI/UX et conception d’une expérience digitale aux contrastes affirmés." descriptionEn="UI/UX direction and design of a digital experience with bold contrasts." images={["/site%20/zem1.svg", "/site%20/zem2.svg"]} />;
  if (window.location.pathname === "/contact") {
    return <ContactPage />;
  }

  if (window.location.pathname === "/projects") {
    return <ProjectsPage />;
  }

  if (window.location.pathname === "/expertise") {
    return <ExpertisePage />;
  }

  if (window.location.pathname === "/vibe-check") {
    return <VibeCheckPage />;
  }

  if (window.location.pathname === "/archive") {
    return (
      <main className="min-h-screen bg-[#101010]">
        <MobileSiteMenu />
        <BrandingGalleryModal isOpen onClose={() => navigateTo("/projects")} />
      </main>
    );
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
        applicationImages={Array.from({ length: 6 }, (_, index) => `/REVOLU/Totaly/${index + 19}.webp`)}
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
        applicationImages={Array.from({ length: 6 }, (_, index) => `/REVOLU/Totaly/${index + 13}.webp`)}
        expertise="Branding & direction artistique"
        expertiseEn="Branding & art direction"
      />
    );
  }

  return (
    <>
      <SmoothScrollProvider>
        <NavBar />
        <div className="  overflow-hidden main-container relative min-h-screen w-screen ">
          <Hero />
          <AboutUs />
          <Features showAllSiteProjects showProjectsButton stopAfterVennis />
          <Story />
          <Footer/>
        </div>
      </SmoothScrollProvider>
    </>
  );
}

function App() {
  const isLoading = false;
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
      <PageContent />
      {isLoading && <SiteLoader />}
    </>
  );
}

export default App;
