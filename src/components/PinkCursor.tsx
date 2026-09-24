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
    <>
      {/* Reticule : deux traits pleine page qui se croisent sur le curseur,
          plus la croix centrale. Suit la souris sur tout le site. */}
      <div aria-hidden="true" className="site-cursor pointer-events-none fixed inset-0 z-[499] hidden md:block">
        <div className="absolute inset-x-0 h-px bg-white/[0.09]" style={{ top: cursor.y }} />
        <div className="absolute inset-y-0 w-px bg-white/[0.09]" style={{ left: cursor.x }} />
        <div className="absolute size-4 -translate-x-1/2 -translate-y-1/2" style={{ left: cursor.x, top: cursor.y }}>
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/40" />
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/40" />
        </div>
      </div>

      <span
        aria-hidden="true"
        className="site-cursor pointer-events-none fixed z-[500] hidden size-3 bg-[#fb6f92] transition-transform duration-150 md:block"
        style={{ left: cursor.x, top: cursor.y, transform: `translate(-50%, -50%) rotate(${cursor.scrolling ? 135 : 0}deg) scale(${cursor.scrolling ? 1.8 : 1})` }}
      />
    </>
  );
};

export default PinkCursor;
