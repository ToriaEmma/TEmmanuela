import ColorThemeToggle from "./ColorThemeToggle";
import LanguageToggle, { LocalizedText } from "./LanguageToggle";
import MobileProjectHeader from "./MobileProjectHeader";
import MoreProjects from "./MoreProjects";
import DesktopSiteHeader from "./DesktopSiteHeader";

type ProjectShowcaseProps = {
  title: string;
  tagline: string;
  taglineEn: string;
  hero: string;
  intro: string;
  introEn: string;
  sectionTitle: string;
  sectionTitleEn: string;
  sectionText: string;
  sectionTextEn: string;
  identityImages: string[];
  applicationImages?: string[];
  compactApplications?: boolean;
  expertise: string;
  expertiseEn: string;
};

const ProjectShowcase = ({
  title,
  tagline,
  taglineEn,
  hero,
  intro,
  introEn,
  sectionTitle,
  sectionTitleEn,
  sectionText,
  sectionTextEn,
  identityImages,
  applicationImages = [],
  compactApplications = false,
  expertise,
  expertiseEn,
}: ProjectShowcaseProps) => (
  <main className="theme-project min-h-screen bg-[#101010] text-[#d9d6cc]">
    <MobileProjectHeader />
    <div className="sticky top-0 z-50 hidden bg-[#101010]/95 px-8 backdrop-blur md:block"><DesktopSiteHeader /></div>

    <section className="px-5 pb-10 pt-16 md:px-8 md:pt-24">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-[-0.06em] md:text-7xl">{title}</h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] md:text-sm">
            &gt; <LocalizedText fr={tagline} en={taglineEn} />
          </p>
        </div>
        <span className="mb-2 size-2 bg-[#d9d6cc]" />
      </div>
    </section>

    <section className="w-full overflow-hidden bg-white">
      <img loading="lazy" decoding="async" src={hero} alt={title} className="block h-auto w-full" />
    </section>

    <div
      id="about"
      className="grid gap-12 px-5 py-20 md:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]"
    >
      <div className="space-y-20">
        <section>
          <div className="mb-8 grid gap-6 md:grid-cols-[220px_1fr]">
            <p className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Concept & identité" en="Concept & identity" /></p>
            <p className="max-w-3xl text-sm leading-relaxed md:text-lg"><LocalizedText fr={intro} en={introEn} /></p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {identityImages.map((src, index) => (
              <div key={src} className="overflow-hidden rounded-lg bg-white">
                <img
                  src={src}
                  alt={`${title} — identité ${index + 1}`}
                  className="block h-auto w-full"
                  loading={index > 1 ? "lazy" : undefined}
                />
              </div>
            ))}
          </div>
        </section>

        {applicationImages.length > 0 && (
          <section id="gallery">
            <div className="mb-8 grid gap-6 md:grid-cols-[220px_1fr]">
              <p className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr={sectionTitle} en={sectionTitleEn} /></p>
              <p className="max-w-3xl text-sm leading-relaxed md:text-lg"><LocalizedText fr={sectionText} en={sectionTextEn} /></p>
            </div>
            <div className={`grid gap-3 ${compactApplications ? "sm:grid-cols-2" : ""}`}>
              {applicationImages.map((src, index) => (
                <div key={src} className="overflow-hidden rounded-lg bg-white">
                  <img
                    src={src}
                    alt={`${title} — application ${index + 1}`}
                    className="block h-auto w-full"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-7 text-[#c9c5ba] lg:sticky lg:top-28 lg:self-start">
        <div>
          <h2 className="text-4xl font-semibold tracking-[-0.05em] text-[#e2dfd5]">{title}</h2>
          <p className="mt-2 font-mono text-xs uppercase"><LocalizedText fr="Voir le projet" en="View project" /> [&nbsp;]</p>
        </div>
        <div className="border-b border-white/15 pb-6">
          <p className="mb-3 font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Brief du projet" en="Project brief" /></p>
          <p className="max-w-md text-sm leading-relaxed"><LocalizedText fr={intro} en={introEn} /></p>
        </div>
        <div className="border-b border-white/15 pb-6">
          <p className="mb-3 font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Vue d’ensemble" en="Overview" /></p>
          <p className="max-w-md text-sm leading-relaxed"><LocalizedText fr={sectionText} en={sectionTextEn} /></p>
        </div>
        <dl className="grid grid-cols-2 gap-6 text-sm lg:grid-cols-1">
          <div>
            <dt className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Rôle" en="Role" /></dt>
            <dd className="mt-1"><LocalizedText fr="Direction artistique" en="Art direction" /></dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase text-[#66645f]">Expertise</dt>
            <dd className="mt-1"><LocalizedText fr={expertise} en={expertiseEn} /></dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase text-[#66645f]"><LocalizedText fr="Année" en="Year" /></dt>
            <dd className="mt-1">2026</dd>
          </div>
        </dl>
      </aside>
    </div>

    <MoreProjects current={title} />
  </main>
);

export default ProjectShowcase;
