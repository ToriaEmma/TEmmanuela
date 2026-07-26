import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { LocalizedText } from "./LanguageToggle";

gsap.registerPlugin(ScrollTrigger);

interface SkillCardProps {
  num: string;
  title: string;
  desc: string;
  gradient: string;
  className: string;
  style?: React.CSSProperties;
  hoverRotateClass?: string;
  accentColor: string;
  textDark?: boolean;
}

const SkillCard = ({ title, desc, gradient, className, style, hoverRotateClass, accentColor, textDark }: SkillCardProps) => {
  // Combine custom styles with hover CSS variables
  const cardStyle = {
    ...style,
    "--hover-bg": accentColor,
    "--hover-text": textDark ? "#000000" : "#ffffff",
  } as React.CSSProperties;

  return (
    <div className={`absolute card-wrapper ${className} hover:!z-[50]`} style={cardStyle}>
      <div className={`w-[190px] md:w-[275px] aspect-[4/5] bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col border border-black/[0.05] hover:scale-105 hover:-translate-y-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group/card ${hoverRotateClass || ""}`}>
        {/* Top diagonal stripe header */}
        <div 
          className="h-[28%] w-full"
          style={{ background: gradient }}
        />
        
        {/* Overlapping rounded body */}
        <div className="flex-1 bg-[#f6f6f6] rounded-t-[2rem] -mt-8 p-5 md:p-6 relative flex flex-col justify-between z-10">
          {/* Title */}
          <div className="text-left">
            <h3 className="font-sans font-black text-lg md:text-xl text-black leading-tight tracking-tight uppercase">
              <LocalizedText fr={title} en={{ "UI/UX Design": "UI/UX Design", "Creative Dev": "Creative Dev", "Art Direction": "Art Direction", "Branding": "Branding" }[title] || title} />
            </h3>
          </div>

          {/* Bottom Row */}
          <div className="flex items-end justify-between gap-2 mt-4">
            <p className="mobile-fr-skill-copy text-left text-black/50 font-sans font-medium text-xs md:text-[10px] leading-relaxed max-w-[75%]">
              <LocalizedText fr={desc} en={{
                "Conception d'interfaces intuitives et esthétiques centrées sur l'expérience utilisateur.": "Design of intuitive, beautiful interfaces centered on user experience.",
                "Sites web interactifs et animés avec React, GSAP, Tailwind CSS et Three.js.": "Interactive, animated websites built with React, GSAP, Tailwind CSS and Three.js.",
                "Direction artistique complète pour créer des univers graphiques mémorables.": "Complete art direction for memorable visual worlds.",
                "Création d'identités visuelles fortes et percutantes qui résonnent avec votre audience.": "Strong visual identities that resonate with your audience.",
              }[desc] || desc} />
            </p>
            
            {/* Pixelated Chevron Button */}
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black flex items-center justify-center shadow-md group-hover/card:bg-[var(--hover-bg)] transition-colors duration-300 shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5 animate-pulse">
                <rect x="6" y="6" width="2" height="2" className="fill-white group-hover/card:fill-[var(--hover-text)] transition-colors duration-300"/>
                <rect x="8" y="8" width="2" height="2" className="fill-white group-hover/card:fill-[var(--hover-text)] transition-colors duration-300"/>
                <rect x="10" y="10" width="2" height="2" className="fill-white group-hover/card:fill-[var(--hover-text)] transition-colors duration-300"/>
                <rect x="8" y="12" width="2" height="2" className="fill-white group-hover/card:fill-[var(--hover-text)] transition-colors duration-300"/>
                <rect x="6" y="14" width="2" height="2" className="fill-white group-hover/card:fill-[var(--hover-text)] transition-colors duration-300"/>
                
                <rect x="12" y="6" width="2" height="2" className="fill-white group-hover/card:fill-[var(--hover-text)] transition-colors duration-300"/>
                <rect x="14" y="8" width="2" height="2" className="fill-white group-hover/card:fill-[var(--hover-text)] transition-colors duration-300"/>
                <rect x="16" y="10" width="2" height="2" className="fill-white group-hover/card:fill-[var(--hover-text)] transition-colors duration-300"/>
                <rect x="14" y="12" width="2" height="2" className="fill-white group-hover/card:fill-[var(--hover-text)] transition-colors duration-300"/>
                <rect x="12" y="14" width="2" height="2" className="fill-white group-hover/card:fill-[var(--hover-text)] transition-colors duration-300"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Story = () => {
  const skills = [
    {
      num: "01",
      title: "UI/UX Design",
      desc: "Conception d'interfaces intuitives et esthétiques centrées sur l'expérience utilisateur.",
      gradient: "repeating-linear-gradient(135deg, #d4ff36, #d4ff36 15px, #16161a 15px, #16161a 30px)", // Neon Green + Dark Charcoal
      hoverRotate: "md:hover:rotate-[14deg]",
      accentColor: "#d4ff36",
      textDark: true
    },
    {
      num: "02",
      title: "Creative Dev",
      desc: "Sites web interactifs et animés avec React, GSAP, Tailwind CSS et Three.js.",
      gradient: "repeating-linear-gradient(135deg, #fb6f92, #fb6f92 15px, #16161a 15px, #16161a 30px)", // Pink + Dark Charcoal
      hoverRotate: "md:hover:rotate-[5deg]",
      accentColor: "#fb6f92",
      textDark: false
    },
    {
      num: "03",
      title: "Art Direction",
      desc: "Direction artistique complète pour créer des univers graphiques mémorables.",
      gradient: "repeating-linear-gradient(135deg, #1a73e8, #1a73e8 15px, #16161a 15px, #16161a 30px)", // Blue + Dark Charcoal
      hoverRotate: "md:hover:rotate-[-5deg]",
      accentColor: "#1a73e8",
      textDark: false
    },
    {
      num: "04",
      title: "Branding",
      desc: "Création d'identités visuelles fortes et percutantes qui résonnent avec votre audience.",
      gradient: "repeating-linear-gradient(135deg, #5542ff, #5542ff 15px, #16161a 15px, #16161a 30px)", // Purple-Blue + Dark Charcoal
      hoverRotate: "md:hover:rotate-[-14deg]",
      accentColor: "#5542ff",
      textDark: false
    }
  ];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    // On mobile Locomotive Scroll is disabled (native window scroll), so the custom
    // ".main-container" scroller never scrolls — ScrollTriggers must target the window.
    const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
    const scroller = isMobileViewport ? undefined : ".main-container";

    const ctx = gsap.context(() => {
      // Parallax effect on the background marquee container
      gsap.to(".marquee-container", {
        x: -80,
        ease: "none",
        scrollTrigger: {
          trigger: "#story",
          scroller,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        }
      });

      // Initialize the cards position to center stack
      gsap.set(".card-wrapper", {
        xPercent: -50,
        yPercent: -50,
        x: 0,
        y: 0,
        left: "50%",
        top: "50%",
      });

      // Initial stack rotation/position offsets for realistic deck aesthetic
      gsap.set(".card-0", { rotate: -3, y: 0, x: 0 });
      gsap.set(".card-1", { rotate: 2, y: 4, x: 2 });
      gsap.set(".card-2", { rotate: -1, y: 8, x: -2 });
      gsap.set(".card-3", { rotate: 3, y: 12, x: 3 });

      // Match media for desktop (horizontal fanning) vs mobile (stack reveal swipe)
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 769px)",
          isMobile: "(max-width: 768px)",
        },
        (context) => {
          const { isDesktop } = context.conditions as { isDesktop: boolean };

          if (isDesktop) {
            // Desktop: pin the section and fan the cards out horizontally.
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: "#story",
                scroller,
                start: "top top",
                end: "+=1500",
                scrub: 1,
                pin: true,
                pinSpacing: true,
              },
            });
            tl.to(".card-0", { x: -330, y: 25, rotate: -14, duration: 1 }, 0)
              .to(".card-1", { x: -110, y: -10, rotate: -5, duration: 1 }, 0)
              .to(".card-2", { x: 110, y: -10, rotate: 5, duration: 1 }, 0)
              .to(".card-3", { x: 330, y: 25, rotate: 14, duration: 1 }, 0);
          } else {
            // Mobile: NO pin (native scroll + a pinned section produced a huge
            // pin-spacer and a big black gap). Scrub the card fan-out as the
            // cards section travels through the viewport instead.
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: "#story .cards-stage",
                scroller,
                start: "top 80%",
                end: "top 20%",
                scrub: 1,
              },
            });
            tl.to(".card-0", { x: -70, y: 6, rotate: -16, duration: 1 }, 0)
              .to(".card-1", { x: -26, y: -4, rotate: -6, duration: 1 }, 0)
              .to(".card-2", { x: 26, y: -4, rotate: 6, duration: 1 }, 0)
              .to(".card-3", { x: 70, y: 6, rotate: 16, duration: 1 }, 0);
          }
        }
      );
    });

    // Refresh ScrollTrigger to sync with Locomotive Scroll once the component and layout are fully ready
    timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      id="story"
      className="theme-surface relative -mt-[3px] min-h-screen w-screen bg-black text-white overflow-hidden pt-[calc(7rem+3px)] pb-16 md:pt-[calc(12rem+3px)] md:pb-24 px-6 md:px-16 flex flex-col justify-between z-10"
    >
      {/* Background Marquee Text */}
      <div className="absolute inset-x-0 top-[50%] -translate-y-1/2 overflow-hidden pointer-events-none select-none z-0 opacity-[0.06] marquee-container">
        <div className="flex whitespace-nowrap animate-marquee font-sans font-black text-[18vw] md:text-[14vw] tracking-wider uppercase text-white">
          <span># CREATIVE &nbsp; # INTERACTION &nbsp; # DEVELOPMENT &nbsp; # DESIGN &nbsp; &nbsp;</span>
          <span># CREATIVE &nbsp; # INTERACTION &nbsp; # DEVELOPMENT &nbsp; # DESIGN &nbsp; &nbsp;</span>
        </div>
      </div>

      {/* TOP SECTION: Typography Header */}
      <div className="w-full flex justify-end text-right z-10 pr-2 md:pr-8">
        <h2 className="mobile-fr-vision font-sans font-black text-[7.2vw] sm:text-[6.2vw] md:text-[4.2vw] lg:text-[3.8vw] leading-[1.05] tracking-tight uppercase">
          <span className="lang-en text-white/30">
            I AM A CREATIVE DEVELOPER
            <br />
            DEDICAT
          </span>
          <span className="lang-en text-white">
            ED TO EMPOWERING YOUR
            <br />
            DIGITAL VISION.
          </span>
          <span className="lang-fr text-white/30">JE SUIS UNE DÉVELOPPEUSE CRÉATIVE<br />DÉDIÉE À </span>
          <span className="lang-fr text-white">DONNER VIE À VOTRE<br />VISION DIGITALE.</span>
        </h2>
      </div>

      {/* CENTER SECTION: Unfolding Skills Cards Collage */}
      <div className="cards-stage relative w-full h-[320px] md:h-[480px] z-20 my-12 md:my-6">
        {skills.map((skill, index) => (
          <SkillCard
            key={index}
            num={skill.num}
            title={skill.title}
            desc={skill.desc}
            gradient={skill.gradient}
            className={`card-${index}`}
            style={{ zIndex: 40 - index * 10 }}
            hoverRotateClass={skill.hoverRotate}
            accentColor={skill.accentColor}
            textDark={skill.textDark}
          />
        ))}
      </div>

      {/* BOTTOM SECTION: Paragraph Description */}
      <div className="w-full flex justify-start z-10 md:absolute md:left-12 md:bottom-16 md:max-w-[15vw] pl-2 md:pl-0 mt-8 md:mt-0">
        <p className="max-w-[300px] md:max-w-none text-white/50 font-sans font-medium text-sm md:text-[11px] leading-relaxed">
          <LocalizedText fr="Créatrice d'expériences numériques interactives, je fusionne design et développement pour donner vie à vos projets." en="I create interactive digital experiences, combining design and development to bring your projects to life." />
        </p>
      </div>

    </section>
  );
};

export default Story;
