import { useEffect, useState } from "react";

const PinkCursor = () => {
  const [cursor, setCursor] = useState({ x: -40, y: -40, scrolling: false });

  useEffect(() => {
    let scrollTimer = 0;
    const move = (event: MouseEvent) => setCursor((current) => ({ ...current, x: event.clientX, y: event.clientY }));
    const scroll = () => {
      setCursor((current) => ({ ...current, scrolling: true }));
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => setCursor((current) => ({ ...current, scrolling: false })), 180);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.clearTimeout(scrollTimer);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("scroll", scroll);
    };
  }, []);

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none fixed z-[500] hidden size-3 bg-[#fb6f92] transition-transform duration-150 md:block"
      style={{ left: cursor.x, top: cursor.y, transform: `translate(-50%, -50%) rotate(${cursor.scrolling ? 135 : 0}deg) scale(${cursor.scrolling ? 1.8 : 1})` }}
    />
  );
};

export default PinkCursor;
