// Le pied de carte, dessine sur un canvas au format exact de la carte :
// titre a gauche, pastille ronde a fleche a droite, poses sur le bord bas.
//
// Dessine dans une TEXTURE plutot que pose en DOM par-dessus le canvas, et
// c'est le point : une fois dans la texture, le titre et la pastille passent
// par le meme deplacement de vertex que l'image, donc ils se courbent AVEC la
// carte -- ils font corps avec elle. La reference obtient la meme chose en
// faisant passer ses titres et ses pastilles par la meme fonction sheet() que
// les cartes ; elle peut se le permettre parce qu'elle rend son texte en GL
// depuis un atlas de courbes. Ici le canvas 2D donne le meme resultat visuel
// pour une fraction du travail.

// Marges du pied, en part de la HAUTEUR de carte -- pas de la largeur : les
// cartes ont toutes la meme hauteur, donc le pied se pose au meme endroit sur
// chacune quelle que soit sa largeur.
const PAD = 0.075;

// La pastille, en part de la hauteur.
const PILL = 0.09;

// Le trait de la fleche est en PIXELS, pas en fraction : c'est ce qui la
// garde fine quelle que soit la taille du disque -- la geometrie grandit, le
// trait non. (La reference fait pareil : 1px pour une pastille de bande.)
const STROKE_PX = 1.5;

// Bras et barbes de la fleche, en part de la hauteur de la pastille.
const ARROW_ARM = 0.17;
const ARROW_HEAD = 0.19;

export type LabelOptions = {
  width: number;
  height: number;
  title: string;
  dpr: number;
};

// Une fleche droite, tracee comme la reference la trace : un fut et deux
// barbes, en segments -- pas un glyphe. Des traits ont leurs propres bouts et
// leurs propres directions, ce qu'un caractere rasterise n'a plus.
const arrow = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, stroke: number) => {
  const arm = r * ARROW_ARM * 2;
  const head = r * ARROW_HEAD * 2;
  const tip = cx + arm;

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = stroke;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(cx - arm, cy);
  ctx.lineTo(tip, cy);
  ctx.moveTo(tip, cy);
  ctx.lineTo(tip - head * 0.7071, cy - head * 0.7071);
  ctx.moveTo(tip, cy);
  ctx.lineTo(tip - head * 0.7071, cy + head * 0.7071);
  ctx.stroke();
};

export const drawLabel = ({ width, height, title, dpr }: LabelOptions): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const pad = height * PAD;
  const pill = height * PILL;
  const radius = pill / 2;

  // La pastille : disque noir plein, colle au bord droit.
  const cx = width - pad - radius;
  const cy = height - pad - radius;

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  arrow(ctx, cx, cy, radius, STROKE_PX);

  // Le titre, aligne sur le meme bord bas que la pastille -- pas sur le bord
  // bas du texte, sur son milieu : les deux se lisent alors comme poses sur
  // une meme ligne.
  const size = Math.round(height * 0.055);
  ctx.font = `500 ${size}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "-0.03em";

  // Une ombre portee douce : le titre passe sur des photos claires comme
  // sombres, et sans elle il disparait sur les premieres.
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = size * 0.7;
  ctx.shadowOffsetY = 1;

  ctx.fillStyle = "#fff";
  ctx.fillText(title, pad, cy, width - pad * 2 - pill - pad);

  return canvas;
};

export default drawLabel;
