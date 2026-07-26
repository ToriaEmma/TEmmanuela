import { useEffect, useRef, useState, type PointerEvent } from "react";
import MobileSiteMenu from "./MobileSiteMenu";
import { useSoundEffects } from "../hooks/useSoundEffects";
import DesktopSiteHeader from "./DesktopSiteHeader";

type Vibe = { id: number; type: "note" | "drawing"; content: string; name: string; color: string; rotation: number };

const colors = ["#ffffff", "#f4f4f1", "#ffaaa2", "#ffd2a0", "#aee9bd", "#a9e9e4", "#a9d8f5", "#d0b6f6", "#f4acd7"];
const starters: Vibe[] = [
  { id: 1, type: "note", content: "Continue de créer ✦", name: "Anonyme", color: "#a9e9e4", rotation: -4 },
  { id: 2, type: "note", content: "Une belle énergie vit ici.", name: "Visiteur", color: "#f4acd7", rotation: 3 },
  { id: 3, type: "note", content: "Le design rend les idées visibles.", name: "Anonyme", color: "#ffd2a0", rotation: -2 },
  { id: 4, type: "note", content: "Bravo Emmanuela !", name: "Ami·e du web", color: "#d0b6f6", rotation: 2 },
];

const VibeCheckPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<"board" | "draw" | "note">("board");
  const [color, setColor] = useState("#101010");
  const [noteColor, setNoteColor] = useState("#ffffff");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("color-theme") !== "light");
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundEffects();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState(() => localStorage.getItem("site-language") || "fr");
  const [vibes, setVibes] = useState<Vibe[]>(() => {
    try { return JSON.parse(localStorage.getItem("emmanuela-vibes") || "null") || starters; } catch { return starters; }
  });

  useEffect(() => localStorage.setItem("emmanuela-vibes", JSON.stringify(vibes)), [vibes]);
  useEffect(() => {
    const update = (event: Event) => setLanguage((event as CustomEvent<string>).detail);
    window.addEventListener("language-change", update);
    return () => window.removeEventListener("language-change", update);
  }, []);

  useEffect(() => {
    if (mode === "board") return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setMode("board");
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [mode]);

  useEffect(() => {
    if (mode !== "draw" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 700;
    canvas.height = 580;
    const context = canvas.getContext("2d");
    if (context) { context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height); context.lineCap = "round"; context.lineJoin = "round"; }
  }, [mode]);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  };
  const startDraw = (event: PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = point(event); const context = canvasRef.current?.getContext("2d");
    context?.beginPath(); context?.moveTo(p.x, p.y);
  };
  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const context = canvasRef.current?.getContext("2d"); if (!context) return;
    const p = point(event); context.strokeStyle = color; context.lineWidth = 7; context.lineTo(p.x, p.y); context.stroke();
  };
  const stopDraw = () => { drawing.current = false; };
  const publish = () => {
    const content = mode === "draw" ? canvasRef.current?.toDataURL("image/webp", .8) || "" : message.trim();
    if (!content) return;
    const next: Vibe = { id: Date.now(), type: mode === "draw" ? "drawing" : "note", content, name: name.trim() || "Anonyme", color: mode === "note" ? noteColor : "#ffffff", rotation: (vibes.length % 5 - 2) * 1.5 };
    setVibes((items) => [...items, next]); setMessage(""); setName(""); setMode("board");
  };
  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle("light-site", !next);
      localStorage.setItem("color-theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <main className={`min-h-screen p-3 font-mono transition-colors duration-500 md:p-6 ${darkMode ? "bg-[#101010] text-[#d3d0c5]" : "bg-[#f7f7f5] text-[#101010]"}`}>
      <MobileSiteMenu />
      <DesktopSiteHeader active="vibe" />
      <header className="mb-6 flex items-center justify-end">
        <div className={`flex items-center rounded-full px-4 py-3 text-[10px] shadow-sm transition-colors md:text-sm ${darkMode ? "bg-[#292929] text-white" : "bg-white text-black"}`}>
          <button type="button" onClick={toggleSound}>▦ {language === "en" ? `SOUND [${soundEnabled ? "ON" : "OFF"}]` : `SON [${soundEnabled ? "ACTIF" : "COUPÉ"}]`}&nbsp;&nbsp;</button>
          <button data-theme-sound type="button" onClick={toggleTheme} className="underline decoration-transparent underline-offset-4 transition-all hover:decoration-current">
            {language === "en" ? "COLOR" : "COULEUR"}: {darkMode ? "#FFFFFF" : "#101010"}
          </button>
        </div>
      </header>

      <section className={`relative min-h-[calc(100vh-110px)] overflow-hidden shadow-[0_0_25px_rgba(0,0,0,.06)] transition-colors duration-500 ${darkMode ? "bg-[#181818]" : "bg-white"}`}>
        <div className={`relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 text-[10px] backdrop-blur transition-colors md:text-sm ${darkMode ? "border-white/10 bg-[#181818]/90 text-white/55" : "border-black/10 bg-white/90 text-black/45"}`}>
          <p>&gt; {language === "en" ? "Draw something or leave me a note. Be kind <3" : "Dessine quelque chose ou laisse-moi un mot. Restons bienveillants <3"}</p>
          <p>{vibes.length} {language === "en" ? "real contributions" : "contributions réelles"}</p>
        </div>
        <div className="grid auto-rows-[190px] grid-cols-2 gap-0 p-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
          {vibes.map((vibe) => (
            <article key={vibe.id} className="relative -m-2 flex flex-col justify-between overflow-hidden p-5 text-black shadow-[0_5px_18px_rgba(0,0,0,.14)] transition-transform duration-300 hover:z-20 hover:scale-105" style={{ backgroundColor: vibe.color, transform: `rotate(${vibe.rotation}deg)` }}>
              {vibe.type === "drawing" ? <img loading="lazy" decoding="async" src={vibe.content} alt="Dessin laissé par un visiteur" className="size-full object-contain" /> : <p className="font-sans text-lg font-semibold leading-tight md:text-xl">{vibe.content}</p>}
              <span className="text-[10px] text-black/45">{vibe.name}</span>
            </article>
          ))}
        </div>

        <div className="fixed bottom-6 right-5 z-30 flex flex-col gap-2 rounded-3xl bg-white p-2 text-black shadow-xl md:right-8">
          <button onClick={() => setMode("note")} className="grid size-12 place-items-center rounded-full bg-[#eeeeec] text-xl text-black transition-transform hover:scale-110" aria-label={language === "en" ? "Leave a note" : "Laisser un mot"}>▤</button>
          <button onClick={() => setMode("draw")} className="grid size-12 place-items-center rounded-full bg-[#eeeeec] text-2xl text-black transition-transform hover:scale-110" aria-label={language === "en" ? "Draw" : "Faire un dessin"}>〰</button>
        </div>
      </section>

      {mode !== "board" && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[radial-gradient(circle_at_60%_90%,#5d3b51,#475956_48%,#575757)] p-5 text-white">
          <p className="absolute left-5 top-6 max-w-md text-[10px] md:left-10 md:text-sm">&gt; {language === "en" ? (mode === "draw" ? "Let your imagination run wild." : "Share an interesting fact or something sweet.") : (mode === "draw" ? "Laisse libre cours à ton imagination." : "Partage un fait intéressant ou quelque chose de doux.")}</p>
          <div className="absolute right-5 top-5 flex flex-wrap gap-2 rounded-full bg-white p-2 md:right-10">
            {(mode === "draw" ? ["#101010", "#f0442c", "#ff923e", "#ffc747", "#58c879", "#38a6ea", "#7c45ea"] : colors).map((item) => <button data-poster-sound key={item} onClick={() => mode === "draw" ? setColor(item) : setNoteColor(item)} className="size-7 rounded-full border-2 border-black/15" style={{ backgroundColor: item }} aria-label={`Couleur ${item}`} />)}
          </div>
          <div className="mt-20 w-[min(88vw,560px)] bg-white p-6 text-black shadow-2xl" style={mode === "note" ? { backgroundColor: noteColor } : undefined}>
            {mode === "draw" ? <canvas ref={canvasRef} onPointerDown={startDraw} onPointerMove={draw} onPointerUp={stopDraw} onPointerCancel={stopDraw} className="aspect-[7/5.8] w-full touch-none bg-white" /> : <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder={language === "en" ? "Write your message here" : "Écris ton message ici"} className="h-72 w-full resize-none bg-transparent font-sans text-2xl outline-none" />}
            <label className="mt-5 block font-sans text-sm font-semibold">{language === "en" ? "Your name?" : "Ton nom ?"} <span className="font-normal">({language === "en" ? "optional" : "facultatif"})</span></label>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder={language === "en" ? "Your name here" : "Ton nom ici"} className="mt-2 w-full bg-transparent font-sans text-lg outline-none placeholder:text-black/35" />
          </div>
          <button onClick={() => setMode("board")} className="fixed bottom-7 left-5 text-2xl md:left-10 md:text-5xl">{language === "en" ? "Close" : "Fermer"} [esc]</button>
          <button onClick={publish} className="fixed bottom-7 right-5 text-2xl md:right-10 md:text-5xl">{language === "en" ? "Publish" : "Publier"} ↵</button>
        </div>
      )}
    </main>
  );
};

export default VibeCheckPage;
