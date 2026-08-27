import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { gsap } from "gsap";
import "./AccordionGallery.css";

export type AccordionGalleryItem = {
  image: string;
  label: string;
  alt?: string;
};

type AccordionGalleryProps = {
  items: AccordionGalleryItem[];
  defaultIndex?: number;
  expandRatio?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  grayscale?: boolean;
  showLabels?: boolean;
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  height?: number;
  gap?: number;
  radius?: number;
  onItemClick?: (index: number) => void;
};

type GalleryStyle = CSSProperties & Record<`--ag-${string}`, string>;

export default function AccordionGallery({
  items,
  defaultIndex = 2,
  expandRatio = 0.52,
  accentColor = "#ffffff",
  overlayColor = "#060010",
  textColor = "#ffffff",
  grayscale = true,
  showLabels = true,
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  height = 460,
  gap = 10,
  radius = 16,
  onItemClick,
}: AccordionGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));

  const applyLayout = useCallback((animate: boolean) => {
    if (!panelRefs.current.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ratio = Math.min(Math.max(expandRatio, 0.2), 0.9);
    const grow = count > 1 ? (ratio * (count - 1)) / (1 - ratio) : 1;
    const animationDuration = animate && !reduced ? duration : 0;

    timelineRef.current?.kill();
    const timeline = gsap.timeline();

    panelRefs.current.forEach((panel, index) => {
      if (!panel) return;
      const isActive = index === active;
      const drift = Math.max(-1.5, Math.min(1.5, active - index));

      timeline.to(panel, {
        flexGrow: isActive ? grow : 1,
        rotateY: isActive ? 0 : index < active ? tilt : -tilt,
        duration: animationDuration,
        ease,
      }, 0);

      const media = mediaRefs.current[index];
      if (media) {
        timeline.to(media, {
          xPercent: -50,
          yPercent: -50,
          x: isActive ? 0 : drift * parallax * mediaSizeRef.current * 0.06,
          "--ag-gray": grayscale ? (isActive ? 0 : 1) : 0,
          "--ag-dim": isActive ? 0 : 0.35,
          duration: animationDuration,
          ease,
        }, 0);
      }

      const labels = [barRefs.current[index], textRefs.current[index]].filter(Boolean);
      if (showLabels && labels.length) {
        timeline.to(labels, {
          opacity: isActive ? 1 : 0,
          x: isActive ? 0 : -14,
          duration: isActive ? animationDuration : animationDuration * 0.6,
          ease,
          stagger: isActive && !reduced ? stagger : 0,
        }, 0);
      }
    });

    timelineRef.current = timeline;
  }, [active, count, duration, ease, expandRatio, grayscale, parallax, showLabels, stagger, tilt]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const usable = Math.max(root.getBoundingClientRect().width - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      root.style.setProperty("--ag-media-size", `${size}px`);
      applyLayout(!firstRunRef.current);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [applyLayout, count, expandRatio, gap]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(() => () => timelineRef.current?.kill(), []);

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index + 1) % count);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index - 1 + count) % count);
    }
  }

  const style: GalleryStyle = {
    "--ag-accent": accentColor,
    "--ag-overlay": overlayColor,
    "--ag-text": textColor,
    "--ag-gap": `${gap}px`,
    "--ag-radius": `${radius}px`,
    height,
  };

  return (
    <div ref={rootRef} className="accordion-gallery" style={style} role="list" aria-label="Galerie d’affiches">
      {items.map((item, index) => {
        const isActive = index === active;
        return (
          <button
            type="button"
            key={item.image}
            ref={(element) => { panelRefs.current[index] = element; }}
            className={`ag-panel${isActive ? " ag-panel--active" : ""}`}
            onClick={() => isActive ? onItemClick?.(index) : setActive(index)}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            role="listitem"
            aria-current={isActive ? "true" : undefined}
            aria-label={`${item.label}${isActive ? ", ouvrir" : ""}`}
          >
            <span className="ag-panel__frame">
              <span className="ag-panel__media" ref={(element) => { mediaRefs.current[index] = element; }}>
                <img src={item.image} alt={item.alt ?? item.label} draggable="false" loading="lazy" />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            {showLabels && (
              <span className="ag-panel__label" aria-hidden="true">
                <span className="ag-panel__bar" ref={(element) => { barRefs.current[index] = element; }} />
                <span className="ag-panel__text" ref={(element) => { textRefs.current[index] = element; }}>{item.label}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
