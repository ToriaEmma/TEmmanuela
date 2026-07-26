import ColorThemeToggle from "./ColorThemeToggle";
import LanguageToggle, { LocalizedText } from "./LanguageToggle";
import MobileProjectHeader from "./MobileProjectHeader";
import MoreProjects from "./MoreProjects";
import DesktopSiteHeader from "./DesktopSiteHeader";

const ProjectAside = () => (
  <aside className="space-y-7 text-[#c9c5ba] lg:sticky lg:top-28 lg:self-start">
    <div>
      <h2 className="text-4xl font-semibold tracking-[-0.05em] text-[#e2dfd5]">Vintage</h2>
      <p className="mt-2 font-mono text-xs uppercase"><LocalizedText fr="Voir le projet" en="View project" /> [&nbsp;]</p>
    </div>
    <div className="border-b border-white/15 pb-6">
      <p className="mb-3 font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Brief du projet" en="Project brief" /></p>
      <p className="max-w-md text-sm leading-relaxed">
        <LocalizedText fr="Création de l’identité d’une marketplace dédiée à la vente, à l’achat et au don d’articles vintage : logo, direction artistique et goodies." en="Creation of the identity for a marketplace dedicated to selling, buying and donating vintage items: logo, art direction and merchandise." />
      </p>
    </div>
    <div className="border-b border-white/15 pb-6">
      <p className="mb-3 font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Vue d’ensemble" en="Overview" /></p>
      <p className="max-w-md text-sm leading-relaxed">
        <LocalizedText fr="Le système visuel accompagne toute l’expérience de la marketplace et se décline sur le logo, les supports de communication et une collection de goodies." en="The visual system supports the entire marketplace experience and extends across the logo, communication materials and a merchandise collection." />
      </p>
    </div>
    <dl className="grid grid-cols-2 gap-6 text-sm lg:grid-cols-1">
      <div>
        <dt className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Rôle" en="Role" /></dt>
        <dd className="mt-1"><LocalizedText fr="Direction artistique" en="Art direction" /></dd>
      </div>
      <div>
        <dt className="font-mono text-xs uppercase text-[#66645f]">Expertise</dt>
        <dd className="mt-1"><LocalizedText fr="Logo, direction artistique & goodies" en="Logo, art direction & merchandise" /></dd>
      </div>
      <div>
        <dt className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Année" en="Year" /></dt>
        <dd className="mt-1">2026</dd>
      </div>
    </dl>
  </aside>
);

const VintageProject = () => {
  return (
    <main className="theme-project min-h-screen bg-[#101010] text-[#d9d6cc]">
      <MobileProjectHeader />
      <div className="sticky top-0 z-50 hidden bg-[#101010]/95 px-8 backdrop-blur md:block"><DesktopSiteHeader /></div>

      <section className="px-5 pb-10 pt-16 md:px-8 md:pt-24">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-semibold tracking-[-0.06em] md:text-7xl">Vintage</h1>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] md:text-sm">
              &gt; <LocalizedText fr="Une identité douce, humaine et intemporelle" en="A soft, human and timeless identity" />
            </p>
          </div>
          <span className="mb-2 size-2 bg-[#d9d6cc]" />
        </div>
      </section>

      <section className="w-full overflow-hidden bg-[#ecebe6]">
        <img loading="lazy" decoding="async"
          src="/REVOLU/big vintagd.webp"
          alt="Hero du projet Vintage"
          className="block h-auto w-full"
        />
      </section>

      <div id="about" className="grid gap-12 px-5 py-20 md:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
        <div className="space-y-20">
          <section>
            <div className="mb-8 grid gap-6 md:grid-cols-[220px_1fr]">
              <p className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Découverte & stratégie" en="Discovery & strategy" /></p>
              <p className="max-w-3xl text-sm leading-relaxed text-[#d9d6cc] md:text-lg">
                <LocalizedText fr="Vintage est une marketplace pensée pour vendre, acheter ou donner des pièces vintage. J’ai conçu son logo, sa direction artistique et ses déclinaisons sur différents goodies." en="Vintage is a marketplace designed for selling, buying or donating vintage pieces. I created its logo, art direction and applications across various merchandise." />
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="overflow-hidden rounded-lg bg-[#f6f5f1]">
                <img loading="lazy" decoding="async"
                  src="/REVOLU/vintage-logo-transparent.webp"
                  alt="Logo Vintage original"
                  className="aspect-[4/3] size-full object-contain p-[8%]"
                />
              </div>
              <div className="overflow-hidden rounded-lg bg-black">
                <img loading="lazy" decoding="async"
                  src="/REVOLU/vintage-logo-transparent.webp"
                  alt="Logo Vintage blanc"
                  className="aspect-[4/3] size-full object-contain p-[8%] brightness-0 invert"
                />
              </div>
              <div className="overflow-hidden rounded-lg bg-white">
                <img loading="lazy" decoding="async"
                  src="/REVOLU/vintage-logo-transparent.webp"
                  alt="Logo Vintage noir"
                  className="aspect-[4/3] size-full object-contain p-[8%] brightness-0"
                />
              </div>
            </div>
          </section>

          <section id="gallery">
            <div className="mb-8 grid gap-6 md:grid-cols-[220px_1fr]">
              <p className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Histoire de Vintage" en="Vintage history" /></p>
              <p className="max-w-3xl text-sm leading-relaxed md:text-lg">
                <LocalizedText fr="L’identité de la marketplace se déploie sur les supports digitaux, les vêtements, les accessoires et les objets promotionnels." en="The marketplace identity extends across digital media, apparel, accessories and promotional objects." />
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[3, 4, 12, 20, 1, 2, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23].map(
                (image) => (
                  <div key={image} className="overflow-hidden rounded-lg bg-white">
                    <img
                      src={`/REVOLU/vintagefull/${image}.webp`}
                      alt={`Application Vintage ${image}`}
                      className="aspect-[4861/6250] size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        <ProjectAside />
      </div>

      <MoreProjects current="Vintage" />
    </main>
  );
};

export default VintageProject;
