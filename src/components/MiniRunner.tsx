import { useEffect, useRef, useState } from "react";
import { soundEffectsEnabled } from "../hooks/useSoundEffects";

const MiniRunner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef(0);
  const gameOverAudioRef = useRef<HTMLAudioElement | null>(null);
  const jumpAudioRef = useRef<HTMLAudioElement | null>(null);
  const directionRef = useRef(0);
  const stateRef = useRef({ running: false, over: false, y: 0, velocity: 0, playerX: 42, playerOffset: 0, obstacleX: 360, obstaclePassed: false, score: 0, last: 0 });
  const [status, setStatus] = useState("CLIQUE POUR JOUER");
  const [score, setScore] = useState(0);

  const jump = () => {
    const game = stateRef.current;
    const playJump = () => {
      if (!soundEffectsEnabled()) return;
      if (!jumpAudioRef.current) jumpAudioRef.current = new Audio("/jump.mp3");
      jumpAudioRef.current.volume = 0.35;
      jumpAudioRef.current.currentTime = 0;
      void jumpAudioRef.current.play().catch(() => undefined);
    };
    if (game.over) {
      game.over = false;
      game.running = true;
      game.y = 0;
      game.velocity = -7.3;
      game.playerX = 42;
      game.playerOffset = 0;
      game.obstacleX = Math.max(320, (canvasRef.current?.clientWidth || 500) * 0.72);
      game.obstaclePassed = false;
      game.score = 0;
      setScore(0);
      setStatus("ESPACE / CLIC POUR SAUTER");
      playJump();
      return;
    }
    if (!game.running) {
      game.running = true;
      game.velocity = -7.3;
      setStatus("ESPACE / CLIC POUR SAUTER");
      playJump();
      return;
    }
    if (game.y === 0) { game.velocity = -7.3; playJump(); }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.15 });
    observer.observe(section);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!visible) return;
      if ((event.target as HTMLElement | null)?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.code === "ArrowLeft" || event.code === "KeyA") { event.preventDefault(); directionRef.current = -1; }
      if (event.code === "ArrowRight" || event.code === "KeyD") { event.preventDefault(); directionRef.current = 1; }
      if (event.code === "Space" && !event.repeat) { event.preventDefault(); jump(); }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "KeyA", "KeyD"].includes(event.code)) directionRef.current = 0;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    gameOverAudioRef.current = new Audio("/gameover.mp3");
    gameOverAudioRef.current.preload = "auto";
    gameOverAudioRef.current.load();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (!stateRef.current.running && stateRef.current.playerX === 42) stateRef.current.obstacleX = Math.max(320, rect.width * 0.72);
    };
    resize();
    window.addEventListener("resize", resize);

    const drawCat = (x: number, ground: number, y: number) => {
      context.save();
      context.translate(x, ground - 31 + y);
      context.fillStyle = "#fb6f92";
      context.fillRect(4, 8, 27, 22);
      context.fillRect(8, 3, 6, 8);
      context.fillRect(22, 3, 6, 8);
      context.fillRect(8, 30, 6, 5);
      context.fillRect(24, 30, 6, 5);
      context.fillRect(31, 14, 9, 5);
      context.fillStyle = "#101010";
      context.fillRect(10, 15, 3, 3);
      context.fillRect(23, 15, 3, 3);
      context.restore();
    };

    const loop = (time: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ground = height - 28;
      const game = stateRef.current;
      const delta = Math.min((time - (game.last || time)) / 16.67, 2);
      game.last = time;

      if (game.running) {
        const automaticSpeed = 4.8 + Math.min(game.score / 240, 2.5);
        game.playerX += automaticSpeed * delta;
        game.playerOffset += directionRef.current * 4.5 * delta;
        game.playerOffset = Math.max(-width * 0.3, Math.min(width * 0.34, game.playerOffset));
        game.velocity += 0.72 * delta;
        game.y += game.velocity * delta;
        if (game.y > 0) { game.y = 0; game.velocity = 0; }
        const liveCameraX = Math.max(0, game.playerX - width * 0.38);
        const livePlayerScreenX = game.playerX - liveCameraX + game.playerOffset;
        const liveObstacleScreenX = game.obstacleX - liveCameraX;
        if (livePlayerScreenX > liveObstacleScreenX + 28) game.obstaclePassed = true;
        if (game.obstaclePassed) game.obstacleX -= 5.5 * delta;
        if (game.obstaclePassed && game.obstacleX - liveCameraX < -20) {
          game.obstacleX = game.playerX + width * 0.58 + 90 + Math.random() * 160;
          game.obstaclePassed = false;
          game.score += 1;
          setScore(game.score);
        }
        const catLeft = livePlayerScreenX, catRight = livePlayerScreenX + 40;
        const obstacleLeft = liveObstacleScreenX, obstacleRight = liveObstacleScreenX + 8;
        const catBottom = ground + game.y;
        if (catRight > obstacleLeft && catLeft < obstacleRight && catBottom > ground - 12) {
          game.running = false;
          game.over = true;
          setStatus("PERDU — CLIQUE POUR REJOUER");
          if (soundEffectsEnabled()) {
            const sound = gameOverAudioRef.current;
            if (sound) {
              sound.volume = 0.55;
              sound.currentTime = 0;
              void sound.play().catch(() => undefined);
            }
          }
        }
      }

      context.clearRect(0, 0, width, height);
      const cameraX = Math.max(0, game.playerX - width * 0.38);
      const playerScreenX = game.playerX - cameraX + game.playerOffset;
      const obstacleScreenX = game.obstacleX - cameraX;
      const lightTheme = document.documentElement.classList.contains("light-site");
      context.strokeStyle = lightTheme ? "#101010" : "#d4ff36";
      context.lineWidth = 1;
      context.beginPath(); context.moveTo(0, ground + 5); context.lineTo(width, ground + 5); context.stroke();
      drawCat(playerScreenX, ground, game.y);
      context.fillStyle = lightTheme ? "#101010" : "#d4ff36";
      context.fillRect(obstacleScreenX, ground - 8, 8, 13);
      context.fillRect(obstacleScreenX - 2, ground - 5, 3, 3);
      context.fillRect(obstacleScreenX + 7, ground - 7, 3, 3);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section ref={sectionRef} className="theme-surface relative z-10 w-full bg-black px-5 py-3 font-mono text-[#d3d0c5] md:px-8 md:py-4" aria-label="Mini-jeu Emmanuela Runner">
      <div className="mb-1 flex items-center justify-end text-[8px] uppercase md:text-[10px]">
        <span>Score [{String(score).padStart(2, "0")}]</span>
      </div>
      <canvas
        ref={canvasRef}
        tabIndex={0}
        onPointerDown={jump}
        onKeyDown={(event) => { if (event.code === "Space") { event.preventDefault(); jump(); } }}
        className="block h-[90px] w-full cursor-pointer outline-none md:h-[96px]"
      />
      <div className="mt-1 flex items-center justify-between gap-3 text-[8px] uppercase md:text-[10px]">
        <button type="button" onClick={jump} className="underline decoration-transparent underline-offset-4 transition-all hover:decoration-current">{status} →</button>
        <div className="flex gap-2">
          <button type="button" aria-label="Aller à gauche" onPointerDown={() => { directionRef.current = -1; }} onPointerUp={() => { directionRef.current = 0; }} onPointerLeave={() => { directionRef.current = 0; }} className="px-2 py-1">←</button>
          <button type="button" aria-label="Aller à droite" onPointerDown={() => { directionRef.current = 1; }} onPointerUp={() => { directionRef.current = 0; }} onPointerLeave={() => { directionRef.current = 0; }} className="px-2 py-1">→</button>
        </div>
      </div>
    </section>
  );
};

export default MiniRunner;
