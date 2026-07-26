import React, { ReactNode, useRef } from "react";

export const BentoTilt = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={className || ""}>{children}</div>;
};

const BentoCard = ({
  title,
  src,
  onClick,
  imageClassName = "",
  backgroundClassName = "",
  hideTitle = false,
  forceBlackTitle = false,
  mobileSrc,
}: {
  title: ReactNode;
  src: string;
  onClick?: () => void;
  previewImages?: string[];
  imageClassName?: string;
  backgroundClassName?: string;
  hideTitle?: boolean;
  forceBlackTitle?: boolean;
  mobileSrc?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleClick = () => {
    if (onClick) {
      window.setTimeout(onClick, 35);
    }
  };

  return (
    <div
      onClick={handleClick}
      data-project-card
      className={`relative size-full overflow-hidden rounded-md border border-white/20 ${backgroundClassName} ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="  absolute size-full">
        {src.toLowerCase().endsWith(".mp4") ? (
          <video
            ref={videoRef}
            src={src}
            loop
            playsInline
            autoPlay
            muted
            className="absolute inset-0 size-full object-cover object-center"
          />
        ) : src.toLowerCase().endsWith(".svg") ? (
          <>
            <img
              src={src}
              alt={typeof title === "string" ? title : "Projet SVG"}
              draggable={false}
              loading="lazy"
              decoding="async"
              className={`pointer-events-none absolute inset-0 size-full object-cover object-top ${mobileSrc ? "hidden md:block" : ""}`}
            />
            {mobileSrc && <img src={mobileSrc} alt={typeof title === "string" ? title : "Projet"} draggable={false} loading="lazy" decoding="async" className="pointer-events-none absolute left-[3%] top-0 h-[96%] w-[94%] object-cover object-top md:hidden" />}
          </>
        ) : (
          <>
            <img
              src={src}
              alt={typeof title === "string" ? title : ""}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 size-full object-cover object-center ${imageClassName} ${mobileSrc ? "hidden md:block" : ""}`}
            />
            {mobileSrc && <img src={mobileSrc} alt={typeof title === "string" ? title : ""} loading="lazy" decoding="async" className="absolute left-[3%] top-0 h-[96%] w-[94%] object-cover object-top md:hidden" />}
          </>
        )}
        <div className="relative z-10 flex size-full flex-col justify-between p-3 text-blue-50 md:p-5">
          <div>
            <h1 className={`project-card-title ${forceBlackTitle || title === "Vintage" || title === "Secure Tutor" || title === "Full Bridge" ? "!text-black" : "!text-white"}`}>
              {hideTitle ? <span className="sr-only">{title}</span> : title}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BentoCard;
