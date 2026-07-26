import ColorThemeToggle from "./ColorThemeToggle";
import LanguageToggle, { LocalizedText } from "./LanguageToggle";
import MobileProjectHeader from "./MobileProjectHeader";
import MoreProjects from "./MoreProjects";
import DesktopSiteHeader from "./DesktopSiteHeader";

const catsLogos = Array.from({ length: 4 }, (_, index) => `/REVOLU/CATS/${index + 1}.webp`);
const catsApplications = Array.from(
  { length: 6 },
  (_, index) => `/REVOLU/Totaly/${index + 7}.webp`,
);

const CatsProject = () => {
  return (
    <main className="theme-project min-h-screen bg-[#101010] text-[#d9d6cc]">
      <MobileProjectHeader />
      <div className="sticky top-0 z-50 hidden bg-[#101010]/95 px-8 backdrop-blur md:block"><DesktopSiteHeader /></div>

      <section className="px-5 pb-10 pt-16 md:px-8 md:pt-24">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-semibold tracking-[-0.06em] md:text-7xl">Cats</h1>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] md:text-sm">
              &gt; <LocalizedText fr="Un univers pensé pour les félins" en="A world designed for cats" />
            </p>
          </div>
          <span className="mb-2 size-2 bg-[#d9d6cc]" />
        </div>
      </section>

      <section className="w-full overflow-hidden bg-[#d6edf9]">
        <img loading="lazy" decoding="async" src="/REVOLU/big cats.webp" alt="Univers Cats" className="block h-auto w-full" />
      </section>

      <div
        id="about"
        className="grid gap-12 px-5 py-20 md:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]"
      >
        <div className="space-y-20">
          <section>
            <div className="mb-8 grid gap-6 md:grid-cols-[220px_1fr]">
              <p className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Concept & identité" en="Concept & identity" /></p>
              <p className="max-w-3xl text-sm leading-relaxed md:text-lg">
                <LocalizedText fr="Cats propose une identité ludique, douce et contemporaine. Les formes félines, les couleurs pastel et la typographie expressive composent une marque pleine de personnalité." en="Cats offers a playful, soft and contemporary identity. Feline shapes, pastel colors and expressive typography create a brand full of personality." />
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {catsLogos.map((src, index) => (
                <div key={src} className="overflow-hidden rounded-lg bg-white">
                  <img
                    src={src}
                    alt={`Recherche de logo Cats ${index + 1}`}
                    className="block h-auto w-full"
                    loading={index > 1 ? "lazy" : undefined}
                  />
                </div>
              ))}
            </div>
          </section>

          <section id="gallery">
            <div className="mb-8 grid gap-6 md:grid-cols-[220px_1fr]">
              <p className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Collection Cats" en="Cats collection" /></p>
              <p className="max-w-3xl text-sm leading-relaxed md:text-lg">
                <LocalizedText fr="Le système graphique se décline sur les accessoires, le textile, les objets et les espaces dédiés au quotidien des chats." en="The graphic system extends across accessories, apparel, objects and spaces dedicated to cats’ everyday lives." />
              </p>
            </div>
            <div className="grid gap-3">
              {catsApplications.map((src, index) => (
                <div key={src} className="overflow-hidden rounded-lg bg-white">
                  <img
                    src={src}
                    alt={`Application Cats ${index + 1}`}
                    className="block h-auto w-full"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-7 text-[#c9c5ba] lg:sticky lg:top-28 lg:self-start">
          <div>
            <h2 className="text-4xl font-semibold tracking-[-0.05em] text-[#e2dfd5]">Cats</h2>
            <p className="mt-2 font-mono text-xs uppercase"><LocalizedText fr="Voir le projet" en="View project" /> [&nbsp;]</p>
          </div>
          <div className="border-b border-white/15 pb-6">
            <p className="mb-3 font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Brief du projet" en="Project brief" /></p>
            <p className="max-w-md text-sm leading-relaxed">
              <LocalizedText fr="Imaginer une marque féline attachante, fonctionnelle et immédiatement identifiable." en="Create an engaging, functional and instantly recognizable feline brand." />
            </p>
          </div>
          <div className="border-b border-white/15 pb-6">
            <p className="mb-3 font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Vue d’ensemble" en="Overview" /></p>
            <p className="max-w-md text-sm leading-relaxed">
              <LocalizedText fr="Une identité complète qui accompagne tous les moments de la vie des chats." en="A complete identity supporting every moment of cats’ lives." />
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-6 text-sm lg:grid-cols-1">
            <div>
              <dt className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Rôle" en="Role" /></dt>
              <dd className="mt-1"><LocalizedText fr="Design de marque" en="Brand design" /></dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase text-[#66645f]">Expertise</dt>
              <dd className="mt-1"><LocalizedText fr="Identité & produits" en="Identity & products" /></dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Année" en="Year" /></dt>
              <dd className="mt-1">2026</dd>
            </div>
          </dl>
        </aside>
      </div>

      <MoreProjects current="Cats" />
    </main>
  );
};

export default CatsProject;
