import { useEffect, useRef, useState, type PointerEvent } from "react";
import MobileSiteMenu from "./MobileSiteMenu";
import { useSoundEffects } from "../hooks/useSoundEffects";
import DesktopSiteHeader from "./DesktopSiteHeader";
import { supabase } from "../lib/supabase";

type Vibe = { id: number; type: "note" | "drawing"; content: string; name: string; color: string; rotation: number };

const canvasToBlob = (canvas: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error("Le dessin n’a pas pu être converti.")),
    "image/webp",
    0.8,
  );
});

const colors = ["#ffffff", "#f4f4f1", "#ffaaa2", "#ffd2a0", "#aee9bd", "#a9e9e4", "#a9d8f5", "#d0b6f6", "#f4acd7"];
const VibeCheckPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<"board" | "draw" | "note">("board");
  const [color, setColor] = useState("#101010");
  const [noteColor, setNoteColor] = useState("#ffffff");
  // Le bandeau son/couleur est retire : le theme suit simplement le choix
  // enregistre ailleurs sur le site, sans bascule propre a cette page.
  const [darkMode] = useState(() => localStorage.getItem("color-theme") !== "light");
  useSoundEffects();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [language, setLanguage] = useState(() => localStorage.getItem("site-language") || "fr");
  const [vibes, setVibes] = useState<Vibe[]>([]);

  useEffect(() => {
    if (!supabase) return;

    const addVibe = (vibe: Vibe) => {
      setVibes((current) => current.some((item) => item.id === vibe.id) ? current : [...current, vibe]);
    };

    void supabase
      .from("vibes")
      .select("id,type,content,name,color,rotation")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) setPublishError("Impossible de charger les contributions.");
        else setVibes((data ?? []) as Vibe[]);
      });

    const channel = supabase
      .channel("public-vibes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "vibes" }, (payload) => {
        addVibe(payload.new as Vibe);
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, []);
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
  const publish = async () => {
    if (!supabase || isPublishing) {
      if (!supabase) setPublishError("Le Vibe Check n’est pas encore connecté à la base publique.");
      return;
    }

    setIsPublishing(true);
    setPublishError("");

    try {
      let content = message.trim().slice(0, 2000);
      const type: Vibe["type"] = mode === "draw" ? "drawing" : "note";

      if (type === "drawing") {
        if (!canvasRef.current) throw new Error("Canvas indisponible.");
        const drawing = await canvasToBlob(canvasRef.current);
        const extension = drawing.type === "image/png" ? "png" : "webp";
        const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("vibe-drawings").upload(path, drawing, {
          contentType: drawing.type || "image/webp",
          cacheControl: "31536000",
        });
        if (uploadError) throw uploadError;
        content = supabase.storage.from("vibe-drawings").getPublicUrl(path).data.publicUrl;
      }

      if (!content) return;
      const { data, error } = await supabase.from("vibes").insert({
        type,
        content,
        name: name.trim().slice(0, 50) || "Anonyme",
        color: type === "note" ? noteColor : "#ffffff",
        rotation: (vibes.length % 5 - 2) * 1.5,
      }).select("id,type,content,name,color,rotation").single();
      if (error) throw error;

      setVibes((current) => current.some((item) => item.id === data.id) ? current : [...current, data as Vibe]);
      setMessage("");
      setName("");
      setMode("board");
    } catch (error) {
      console.error("Vibe Check publication error", error);
      const reason = error instanceof Error ? error.message : "Erreur inconnue";
      setPublishError(`La publication a échoué : ${reason}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <main className={`min-h-screen px-5 font-mono transition-colors duration-500 md:px-8 ${darkMode ? "bg-[#101010] text-[#d3d0c5]" : "bg-[#f7f7f5] text-[#101010]"}`}>
      <MobileSiteMenu />
      <div className={darkMode ? "" : "vibe-header--light"}><DesktopSiteHeader active="vibe" /></div>
      {/* En mobile la barre nom/heure flotte par-dessus le haut de page :
          le cadre descend pour ne plus passer dessous. */}
      <div className="mb-16 md:mb-6" />

      <section className={`relative min-h-[calc(100vh-110px)] overflow-hidden shadow-[0_0_25px_rgba(0,0,0,.06)] transition-colors duration-500 ${darkMode ? "bg-[#181818]" : "bg-white"}`}>
        <div className={`relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 text-[10px] backdrop-blur transition-colors md:text-sm ${darkMode ? "border-white/10 bg-[#181818]/90 text-white/55" : "border-black/10 bg-white/90 text-black/45"}`}>
          <p>&gt; {language === "en" ? "Draw something or leave me a note. Be kind <3" : "Dessine quelque chose ou laisse-moi un mot. Restons bienveillants <3"}</p>
        </div>
        {publishError && <p role="alert" className="relative z-20 px-5 py-3 text-xs text-[#ffaaa2]">{publishError}</p>}
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
          <button disabled={isPublishing} onClick={() => void publish()} className="fixed bottom-7 right-5 text-2xl disabled:cursor-wait disabled:opacity-50 md:right-10 md:text-5xl">{isPublishing ? (language === "en" ? "Publishing…" : "Publication…") : (language === "en" ? "Publish" : "Publier")} ↵</button>
        </div>
      )}
    </main>
  );
};

export default VibeCheckPage;
