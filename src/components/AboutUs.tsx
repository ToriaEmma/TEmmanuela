import { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const messages = {
  fr: "Je transforme les idées en expériences digitales qui marquent.",
  en: "I turn ideas into memorable digital experiences.",
};

const AboutUs = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return;

    // On mobile Locomotive Scroll is disabled (native window scroll), so the
    // ".main-container" custom scroller never scrolls. A pinned +=5000 tween
    // there produced a giant pin-spacer (huge black gap) and no motion.
    // Use the native window scroller and translate the text as the section
    // travels through the viewport, without pinning.
    const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
    const scroller = isMobileViewport
      ? undefined
      : document.querySelector<HTMLElement>(".main-container");
    if (!isMobileViewport && !scroller) return;

    const context = gsap.context(() => {
      const characters = gsap.utils.toArray<HTMLElement>(
        ".horizontal-character",
      );

      if (isMobileViewport) {
        // Simple horizontal reveal scrubbed over the section's own scroll span.
        gsap.to(textRef.current, {
          xPercent: -100,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        return;
      }

      const scrollTween = gsap.to(textRef.current, {
        xPercent: -100,
        ease: "none",
        scrollTrigger: {
          scroller,
          trigger: sectionRef.current,
          pin: true,
          start: "top top",
          end: "+=5000",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      characters.forEach((character) => {
        gsap.from(character, {
          yPercent: gsap.utils.random(-200, 200),
          rotation: gsap.utils.random(-20, 20),
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: character,
            scroller,
            containerAnimation: scrollTween,
            start: "left 100%",
            end: "left 30%",
            scrub: 1,
          },
        });
      });
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="theme-surface flex h-dvh items-center overflow-hidden bg-black"
    >
      <h2
        ref={textRef}
        aria-label={messages.fr}
        className="flex w-max gap-[4vw] whitespace-nowrap pl-[100vw] font-circular-web text-[clamp(3rem,10vw,12rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-white"
      >
        {messages.fr.split(" ").map((word, wordIndex) => (
          <span
            key={`${word}-${wordIndex}`}
            aria-hidden="true"
            className="lang-fr inline-flex"
          >
            {word.split("").map((character, characterIndex) => (
              <span
                key={`${character}-${characterIndex}`}
                className="horizontal-character inline-block"
              >
                {character}
              </span>
            ))}
          </span>
        ))}
        {messages.en.split(" ").map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`} aria-hidden="true" className="lang-en inline-flex">
            {word.split("").map((character, characterIndex) => (
              <span key={`${character}-${characterIndex}`} className="horizontal-character inline-block">{character}</span>
            ))}
          </span>
        ))}
      </h2>
    </section>
  );
};

export default AboutUs;
