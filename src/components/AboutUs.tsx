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

    // On mobile the horizontal pinned scroll is disabled entirely: Locomotive
    // Scroll is off (native scroll) and the pinned +=5000 tween produced a
    // giant black pin-spacer with the text stuck off-screen. Instead the text
    // is rendered as a readable, static, centered block (see JSX) and we simply
    // fade its characters in when the section enters the viewport.
    const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;

    if (isMobileViewport) {
      const context = gsap.context(() => {
        gsap.from(".horizontal-character", {
          opacity: 0,
          y: 24,
          stagger: 0.01,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        });
      }, sectionRef);
      return () => context.revert();
    }

    const scroller = document.querySelector<HTMLElement>(".main-container");
    if (!scroller) return;

    const context = gsap.context(() => {
      const characters = gsap.utils.toArray<HTMLElement>(
        ".horizontal-character",
      );

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
      className="theme-surface flex min-h-dvh items-center overflow-hidden bg-black px-6 md:px-0"
    >
      <h2
        ref={textRef}
        aria-label={messages.fr}
        className="flex flex-wrap justify-center gap-x-[3vw] gap-y-2 text-center font-circular-web text-[clamp(2.25rem,11vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white md:w-max md:flex-nowrap md:justify-start md:gap-[4vw] md:gap-y-0 md:whitespace-nowrap md:pl-[100vw] md:text-left md:text-[clamp(3rem,10vw,12rem)] md:leading-[0.95] md:tracking-[-0.04em]"
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
