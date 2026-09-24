// L'effet "balle sous une toile" : ce que le curseur laisse derriere lui.
//
// Deliberement PAS un fluide, et la reference insiste sur ce point : une
// version fluide de la meme chose se lit comme de l'eau -- de l'encre
// emportee par le courant, des tourbillons. Une balle sous une toile est le
// marche inverse : la bosse reste ou la balle l'a faite et meurt sur place,
// parce qu'un tissu n'a pas d'inertie -- seulement de la tension et du
// relachement, ce qui est exactement une decroissance et une diffusion.
//
// Deux passes : ce fichier entretient un champ de hauteur dans un petit
// render target ping-pong, et le pass plein ecran (POST_*) lit ses PENTES
// pour deplacer la page et l'eclairer.

// La simulation. Pas de vitesse, pas de pression : le champ precedent survit
// x u_decay, diffuse un peu vers ses voisins, et le curseur tamponne une
// gaussienne par-dessus. C'est toute la simulation, et ca suffit pour ce
// qu'une capsule analytique ne savait pas faire : le champ se souvient du
// CHEMIN (un trace courbe reste courbe), l'encre ancienne meurt pendant que
// la nouvelle nait, et les bords s'adoucissent en s'effacant.
export const TRAIL_FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D u_prev;
uniform vec2 u_texel;   // un texel de CE buffer, en uv
uniform float u_decay;  // survie de cette frame, mise en forme par dt sur le CPU
uniform float u_diff;   // melange de diffusion de cette frame, idem
uniform vec2 u_pos;     // centre du tampon, uv
uniform float u_amp;    // force du tampon -- la tension, voir syncBall
uniform float u_rad;    // rayon du tampon, en part de largeur
uniform float u_aspect; // ww / wh, pour un tampon rond dans un buffer non carre

varying vec2 vUv;

void main() {
  float c = texture2D(u_prev, vUv).r;

  float n = texture2D(u_prev, vUv + vec2(u_texel.x, 0.0)).r
    + texture2D(u_prev, vUv - vec2(u_texel.x, 0.0)).r
    + texture2D(u_prev, vUv + vec2(0.0, u_texel.y)).r
    + texture2D(u_prev, vUv - vec2(0.0, u_texel.y)).r;

  float h = mix(c, n * 0.25, u_diff) * u_decay;

  // Le tampon. Distance jugee en part de largeur -- x tel quel, y divise par
  // l'aspect -- pour que la tache soit un cercle a l'ecran et non une ellipse
  // ecrasee par la forme du buffer.
  vec2 d = vUv - u_pos;
  vec2 q = vec2(d.x, d.y / u_aspect);

  h += u_amp * exp(-dot(q, q) / (u_rad * u_rad));

  // Plafond bien au-dessus de 1, assez bas pour qu'une main qui tourne en
  // rond sur place ne puisse pas remonter le champ indefiniment.
  gl_FragColor = vec4(min(h, 1.5), 0.0, 0.0, 1.0);
}
`;

export const POST_VERTEX = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Le pass plein ecran. Il ne deplace aucune geometrie : il RE-ECHANTILLONNE
// la scene deja rendue, decalee par la pente du champ. La ou le champ monte,
// la page est tiree vers le haut de la pente -- c'est la toile qui se bombe
// par-dessus ce que la balle a laisse.
export const POST_FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D u_scene;
uniform vec2 u_aspect;

uniform float u_ballA;      // portail global, 0 = page intacte
uniform float u_ballWarp;   // force de poussee de la pente, en uv
uniform float u_ballShade;  // force de l'eclairage de la pente
uniform vec2 u_ballEdge;    // decroissance radiale : plein avant .x, nul apres .y
uniform sampler2D u_trail;  // le champ de hauteur
uniform vec2 u_trailTexel;  // un texel de ce buffer, en uv

varying vec2 vUv;

void main() {
  vec4 page = texture2D(u_scene, vUv);

  if (u_ballA > 0.0005) {
    // La pente, prise a 1.5 texel : assez loin pour lire une PENTE et non le
    // bruit d'un texel a l'autre.
    vec2 e = u_trailTexel * 1.5;
    vec2 g = vec2(
      texture2D(u_trail, vUv + vec2(e.x, 0.0)).r - texture2D(u_trail, vUv - vec2(e.x, 0.0)).r,
      texture2D(u_trail, vUv + vec2(0.0, e.y)).r - texture2D(u_trail, vUv - vec2(0.0, e.y)).r
    );

    // Laisse radiale : pleine force au centre, nulle aux bords. Sans elle
    // l'effet se lit comme un filtre applique a tout l'ecran plutot que comme
    // un objet pose dessus.
    vec2 pw = vec2(vUv.x - 0.5, (vUv.y - 0.5) / u_aspect.x);
    float edge = 1.0 - smoothstep(u_ballEdge.x, u_ballEdge.y, length(pw));

    vec2 off = g * u_ballWarp * u_ballA * edge;
    vec2 buv = clamp(vUv + off, 0.0, 1.0);
    float m = smoothstep(0.0, 0.002, length(off));
    vec3 warped = texture2D(u_scene, buv).rgb;

    // La profondeur est PEINTE, pas deplacee : un seul produit scalaire,
    // lumiere venant d'en haut et legerement de la gauche.
    float shade = dot(-g, normalize(vec2(-0.3, 1.0))) * u_ballShade * u_ballA * edge;

    // L'ombrage a besoin de marge : on l'efface a mesure que le pixel
    // approche du blanc, sinon il ecrete au lieu d'eclairer.
    float lum = dot(warped, vec3(0.2126, 0.7152, 0.0722));
    float head = 1.0 - smoothstep(0.7, 0.95, lum);
    warped *= 1.0 + clamp(shade, -0.5, 0.5) * head;

    page = mix(page, vec4(warped, 1.0), m);
  }

  gl_FragColor = page;
}
`;
