"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";
const useLocoScroll = () => {
  gsap.registerPlugin(ScrollTrigger);
  const [locoScroll, setLocoScroll] = useState<LocomotiveScroll | null>(null);
  const [progress, setProgress] = useState(0);
  useLayoutEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isMobile) {
      let frame = 0;
      const updateNativeProgress = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          setProgress(window.scrollY);
        });
      };
      updateNativeProgress();
      window.addEventListener("scroll", updateNativeProgress, { passive: true });
      return () => {
        window.removeEventListener("scroll", updateNativeProgress);
        window.cancelAnimationFrame(frame);
      };
    }

    //importing locomotive scroll
    //getting the scroller element from the dom
    const scrollEl: HTMLElement | null = document.querySelector(".main-container");
    if (!scrollEl) return;
    //initializing the locomotive scroll instance giving it the element and smooth true and other props and options
    const locoScrollInstance = new LocomotiveScroll({
      el: scrollEl,
      smooth: true,
      multiplier: 1.5,
    });
    setLocoScroll(locoScrollInstance);
    const restorationKey = `emmanuela-scroll:${window.location.pathname}${window.location.search}`;
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    // every time the locomotive scroll updates (scrolls) we want the scrolltrigger from gsap to update
    //this is like sync the positioning of the two
    locoScrollInstance.on("scroll", ScrollTrigger.update);
    locoScrollInstance.on("scroll", (args) => {
      setProgress(args.scroll.y);
      sessionStorage.setItem(restorationKey, String(args.scroll.y));
    });

    const restoreSavedPosition = () => {
      if (window.location.hash) return;
      const savedPosition = Number(sessionStorage.getItem(restorationKey));
      if (!Number.isFinite(savedPosition) || savedPosition <= 0) return;
      locoScrollInstance.update();
      locoScrollInstance.scrollTo(savedPosition, { duration: 0, disableLerp: true });
    };
    const restoreTimers = [0, 250, 1000, 3000].map((delay) => window.setTimeout(restoreSavedPosition, delay));
    window.addEventListener("load", restoreSavedPosition);
    //

    ScrollTrigger.scrollerProxy(scrollEl, {
      scrollTop(value) {
        return arguments.length ? locoScrollInstance.scrollTo(value, 0) : locoScrollInstance.scroll.instance.scroll.y;
      },
      scrollLeft(value) {
        return arguments.length ? locoScrollInstance.scrollTo(value, 0) : locoScrollInstance.scroll.instance.scroll.x;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: scrollEl?.style.transform ? "transform" : "fixed",
    });

    const lsUpdate = () => locoScrollInstance.update();

    ScrollTrigger.addEventListener("refresh", lsUpdate);
    ScrollTrigger.refresh();

    // Cleanup on component unmount
    return () => {
      if (locoScrollInstance) {
        restoreTimers.forEach((timer) => window.clearTimeout(timer));
        window.removeEventListener("load", restoreSavedPosition);
        ScrollTrigger.removeEventListener("refresh", lsUpdate);
        locoScrollInstance.destroy(); // Destroy Locomotive Scroll instance
      }
    };
  }, []);

  return { locoScroll, progress };
};

export default useLocoScroll;
