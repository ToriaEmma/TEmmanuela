import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { TiLocation } from "react-icons/ti";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { LocalizedText } from "./LanguageToggle";
gsap.registerPlugin(ScrollTrigger);
const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasClicked, setHasClicked] = useState(false);
  const totalVideos = 3;
  const upcomingVideoIndex = (currentIndex + 1) % totalVideos;
  const [isLoading, setIsLoading] = useState(true);
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundVideoRef = useRef(null);
  const cursorRef = useRef(null);
  const heroRef = useRef<HTMLDivElement | null>(null);

  function handleMiniVidoClick() {
    setHasClicked(true);
    setCurrentIndex(upcomingVideoIndex);
    const animatedVideo = `#video-${upcomingVideoIndex}`;
    const otherVideos = ["#video-0", "#video-1", "#video-2"].filter((video) => video !== animatedVideo);
    gsap.set(animatedVideo, { zIndex: 30, width: "16rem", height: "16rem" });
    gsap.set(otherVideos, {
      zIndex: 20,
    });
    gsap.to(animatedVideo, {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      transformOrigin: "center center",
      duration: 1,
      width: "100%",
      height: "100%",
    });
  }
  
  const heroImages = ["/optimized/hero-p4.webp", "/optimized/hero-3p.webp", "/REVOLU/2p.webp"];
  const getVideoSrc = (index: number) => heroImages[index];

  useEffect(() => {
    // Never leave mobile visitors trapped behind the hero loader when an
    // optional image is slow or rejected by Safari/the CDN.
    const fallback = window.setTimeout(() => setIsLoading(false), 4500);
    return () => window.clearTimeout(fallback);
  }, []);
  useGSAP(
    () => {
      if (hasClicked) gsap.from(backgroundVideoRef.current, { autoAlpha: 0, duration: 2 }).duration(2);
    },
    { dependencies: [currentIndex] },
  );
  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      gsap.set("#video-frame", {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        borderRadius: 0,
      });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.set("#video-frame", { clipPath: "polygon(14% 0, 72% 0, 90% 97%, 0 96%)", borderRadius: "0 0 40% 10%" });
      gsap.from("#video-frame", {
        clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0 100%)",
        borderRadius: "0 0 0 0",
        ease: "power1.inOut",
        scrollTrigger: {
          scroller: ".main-container",
          trigger: "#video-frame",
          start: "center 40%",
          end: "bottom center",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, []);
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!backgroundVideoRef.current) return;
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (isMouseMoving) {
        gsap.to(backgroundVideoRef.current, { autoAlpha: 1, duration: 0.2 });
      }

      // Set new inactivity timeout
      inactivityTimeoutRef.current = setTimeout(() => {
        setIsMouseMoving(false);
        gsap.to(backgroundVideoRef.current, { autoAlpha: 0, duration: 0.5 });
      }, 1000);
      gsap.to(backgroundVideoRef.current, { autoAlpha: 1 });
      const { clientX, clientY } = e;
      const maxOffsetX = 100;
      const maxOffsetY = 200;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const constrainedX = Math.min(Math.max(clientX, centerX - maxOffsetX), centerX + maxOffsetX);
      const constrainedY = Math.min(Math.max(clientY, centerY - maxOffsetY), centerY + maxOffsetY);

      const polygonClipPath = `polygon(
        ${Math.max(constrainedX - 100, 0)}px ${Math.max(constrainedY - 100, 0)}px,
        ${Math.min(constrainedX + 100, window.innerWidth)}px ${Math.max(constrainedY - 100, 0)}px,
        ${Math.min(constrainedX + 100, window.innerWidth)}px ${Math.min(constrainedY + 100, window.innerHeight)}px,
        ${Math.max(constrainedX - 100, 0)}px ${Math.min(constrainedY + 100, window.innerHeight)}px
      )`;
      gsap.to(backgroundVideoRef.current, {
        polygonClipPath,
        WebkitClipPath: polygonClipPath,
        duration: 0.2,
        ease: "power2.out",
      });
    };
    if (!heroRef.current) return;
    heroRef.current.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  return (
    <div ref={heroRef} className="hero relative h-[82svh] w-screen overflow-x-hidden md:h-dvh">
      {isLoading && (
        <div className="flex-center absolute z-[100] h-[82svh] w-screen overflow-hidden bg-violet-50 md:h-dvh">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}
      <div id="video-frame" className="relative z-10 h-[82svh] w-screen overflow-hidden rounded-lg bg-blue-75 md:h-dvh">
        {" "}
        <div className=" video-container">
          {[...Array(3)].map((_, index) => (
            <img
              key={index}
              src={getVideoSrc(index)}
              id={`video-${index}`}
              alt=""
              className={`absolute-center absolute h-full w-full object-cover object-center ${index === currentIndex ? "z-[30]" : "z-[20]"}`}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              onLoad={() => index === 0 && setIsLoading(false)}
              onError={() => index === 0 && setIsLoading(false)}
            />
          ))}

          <div ref={cursorRef} className="absolute  z-50 h-32 w-32 overflow-hidden pointer-events-none" style={{ mixBlendMode: "normal" }} />
          <img
            onClick={() => {
              handleMiniVidoClick();
            }}
            ref={backgroundVideoRef}
            src={getVideoSrc(upcomingVideoIndex)}
            alt="Visuel suivant"
            className="absolute invisible left-0 top-0 z-50 h-full w-full cursor-pointer rounded-2xl border-2 border-blue-200 object-cover"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-30 bg-black/10" />
        <div className="pointer-events-none absolute inset-x-0 top-[35%] z-30 h-[8%] border-y border-white/10 bg-white/10 backdrop-blur-[1px]" />
        <div className="pointer-events-none absolute inset-x-0 top-[51%] z-30 h-[6%] translate-x-8 border-y border-white/10 bg-black/10 backdrop-blur-[1px]" />
        <div className="pointer-events-none absolute inset-x-0 top-[64%] z-30 h-[5%] -translate-x-10 border-y border-white/10 bg-white/10 backdrop-blur-[1px]" />

        <div className="pointer-events-none absolute -left-7 bottom-[3%] z-40 grid grid-cols-5 gap-0 md:-left-3">
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map((cell) => (
            <span key={cell} className={`size-5 md:size-8 ${[0,5,6,10,11,12,16,17,18,19].includes(cell) ? "bg-[#D4FF36]" : "bg-transparent"}`} />
          ))}
        </div>
        <div className="pointer-events-none absolute -right-4 top-0 z-40 grid grid-cols-5 gap-0">
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map((cell) => (
            <span key={cell} className={`size-5 md:size-8 ${[0,1,5,6,7,11,12,13,14,18,19].includes(cell) ? "bg-[#D4FF36]" : "bg-transparent"}`} />
          ))}
        </div>

        <div className={`pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-5 text-center text-white transition-opacity duration-500 md:scale-[0.76] ${currentIndex === 1 ? "opacity-0" : "opacity-100"}`}>
          <p className="font-mono text-[clamp(1.1rem,3.8vw,3.8rem)] uppercase leading-none tracking-[-0.06em] drop-shadow-lg">
            <LocalizedText fr="Créer" en="Creating" />
          </p>
          <h1 className="my-1 bg-[#4d98f7] px-3 pb-2 font-sans text-[clamp(3.2rem,10vw,10rem)] font-light leading-[0.76] tracking-[-0.09em] md:px-6 md:pb-5">
            <LocalizedText fr="n’est pas" en="isn’t just" />
          </h1>
          <p className="font-serif text-[clamp(2.5rem,7vw,7rem)] italic leading-[0.75] tracking-[-0.07em] drop-shadow-lg">
            <LocalizedText fr="qu’un métier" en="a profession" />
          </p>
        </div>

      </div>
      <h1 className=" special-font hero-heading absolute bottom-5 right-5   text-black">
        CREA<b>T</b>IVE
      </h1>
    </div>
  );
};

export default Hero;
