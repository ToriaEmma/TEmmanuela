import React from "react";

const ContactUs = () => {
  return (
    <div id="contact" className="w-screen px-6 md:px-12 my-24 overflow-hidden">
      
      {/* SVG Clip Path Definition with Inverted Corner Radius Notch */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="cta-card-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.15,0 L 0.85,0 A 0.15,0.15 0 0,1 1,0.15 L 1,0.36 C 1,0.40 0.90,0.42 0.90,0.46 L 0.90,0.54 C 0.90,0.58 1,0.60 1,0.64 L 1,0.85 A 0.15,0.15 0 0,1 0.85,1 L 0.15,1 A 0.15,0.15 0 0,1 0,0.85 L 0,0.15 A 0.15,0.15 0 0,1 0.15,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="relative py-16 md:py-20 bg-[#fbf9f4] rounded-[2.5rem] md:rounded-[3.5rem] border border-black/10 flex flex-col md:flex-row items-center gap-12 md:gap-20 px-8 md:px-20 overflow-hidden shadow-2xl">
        
        {/* Background Grid Pattern for texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
          style={{
            backgroundImage: `linear-gradient(to right, #000000 1px, transparent 1px), linear-gradient(to bottom, #000000 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} 
        />

        {/* Left Column: Image Card with Inverted Radius Notch */}
        <div className="relative w-full md:w-1/2 max-w-[380px] md:max-w-[420px] aspect-square flex-none z-10 overflow-visible">
          
          {/* 2026 Tilted Sticker Badge */}
          <div className="absolute -top-5 left-6 bg-black text-white font-sans font-black text-lg md:text-xl px-5 py-2 rounded-xl transform -rotate-6 shadow-lg border-[3.5px] border-white z-30 select-none tracking-widest uppercase">
            2026
          </div>

          {/* Main Image physically clipped by SVG clip path */}
          <div 
            className="w-full h-full bg-[#c5b5a5]"
            style={{ 
              clipPath: "url(#cta-card-clip)",
              WebkitClipPath: "url(#cta-card-clip)"
            }}
          >
            <img loading="lazy" decoding="async" src="/img/cta_fashion_model.webp" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" alt="Emmanuela Project" />
          </div>

          {/* SVG Border Overlay follow exact S-curve path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d="M 15,0 
                 L 85,0 
                 A 15,15 0 0,1 100,15 
                 L 100,36 
                 C 100,40 90,42 90,46 
                 L 90,54 
                 C 90,58 100,60 100,64 
                 L 100,85 
                 A 15,15 0 0,1 85,100 
                 L 15,100 
                 A 15,15 0 0,1 0,85 
                 L 0,15 
                 A 15,15 0 0,1 15,0 
                 Z" 
              fill="none" 
              stroke="rgba(0, 0, 0, 0.15)" 
              strokeWidth="1" 
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Play Badge Centered Inside the Notch */}
          <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-[#fbf9f4] rounded-full flex items-center justify-center font-mono text-[8px] tracking-widest font-black uppercase shadow-2xl border-[3px] border-white z-30 select-none hover:scale-110 hover:rotate-12 transition-transform cursor-pointer">
            PLAY
          </div>

          {/* Tilted Sticker: CREATIVE DEV */}
          <div className="absolute -bottom-3 left-4 bg-black text-white font-sans font-black text-[9px] md:text-[10px] px-4 py-1.5 rounded-lg transform rotate-6 shadow-lg border-[3px] border-white z-30 select-none tracking-widest uppercase">
            CREATIVE DEV
          </div>
        </div>

        {/* Right Column: Text and CTA */}
        <div className="relative flex-1 flex flex-col items-start justify-center text-left py-4 z-10">
          
          {/* Sparkle Star Icon in top right */}
          <div className="absolute top-0 right-0 text-black/80">
            <svg className="w-6 h-6 md:w-7 h-7 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
            </svg>
          </div>

          {/* Decorative Stamp Stickers (No Emojis) */}
          <div className="absolute right-8 top-1/4 hidden lg:flex flex-col gap-6 z-0 pointer-events-none select-none">
            {/* Sticker 1: Art */}
            <div className="w-20 h-20 bg-gradient-to-tr from-[#ffe5ec] to-[#ffc2d1] rounded-full flex flex-col items-center justify-center border-[3.5px] border-white shadow-2xl transform rotate-12 p-2 select-none relative">
              <div className="absolute inset-1 rounded-full border border-dashed border-[#fb6f92]/40" />
              <svg className="w-4 h-4 text-[#fb6f92] mb-1 z-10 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
              </svg>
              <span className="font-sans font-black text-[9px] text-[#fb6f92] tracking-[0.15em] leading-none z-10">DESIGN</span>
              <span className="font-sans font-bold text-[7px] text-[#fb6f92]/80 tracking-[0.1em] mt-0.5 z-10">STUDIO</span>
            </div>
            {/* Sticker 2: Code */}
            <div className="w-20 h-20 bg-gradient-to-tr from-[#e8f0fe] to-[#c2d7fa] rounded-full flex flex-col items-center justify-center border-[3.5px] border-white shadow-2xl transform -translate-x-8 -rotate-12 p-2 select-none relative">
              <div className="absolute inset-1 rounded-full border border-dashed border-[#1a73e8]/30" />
              <svg className="w-4 h-4 text-[#1a73e8] mb-1 z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              <span className="font-sans font-black text-[9px] text-[#1a73e8] tracking-[0.15em] leading-none z-10">BUILD</span>
              <span className="font-sans font-bold text-[7px] text-[#1a73e8]/80 tracking-[0.1em] mt-0.5 z-10">ENGINES</span>
            </div>
          </div>

          {/* Text Header (Clean, legible sans-serif) */}
          <h2 className="font-sans font-black text-black leading-[0.95] tracking-tight text-[9.5vw] sm:text-[8vw] md:text-[4.5vw] lg:text-[4.2vw] uppercase mb-6">
            Créons<br/>
            ensemble<br/>
            votre<br/>
            prochain<br/>
            projet<br/>
            digital.
          </h2>

          {/* Subtitle */}
          <p className="font-general font-bold text-[9px] md:text-[10px] tracking-[0.2em] text-black/60 uppercase mb-8">
            Collaborons ensemble pour créer l'exceptionnel.
          </p>

          {/* CTA Pill Button */}
          <button 
            onClick={() => window.location.href = 'mailto:todedjiemma9@gmail.com'}
            className="flex items-center gap-2.5 border border-black rounded-full px-7 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-[#fbf9f4] transition-all duration-300 shadow-md active:scale-95"
          >
            <svg className="w-3.5 h-3.5 transform -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
            Me contacter
          </button>

        </div>

      </div>
    </div>
  );
};

export default ContactUs;
