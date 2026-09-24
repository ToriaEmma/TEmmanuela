// Le sol sous la bande : un vrai plan dans une vraie camera perspective --
// la seule geometrie de la page qui ne soit pas parallele a l'ecran. Tout le
// reste est un rect DOM pousse a z=0 et dessine a plat ; ici la fuite EST
// l'effet, donc c'est la projection qui doit la faire, pas un degrade qui
// fait semblant.

export const FLOOR_VERTEX = /* glsl */ `
uniform float u_leanK; // part de la porte que cette surface prend, 0..1
uniform float u_run;   // jusqu'ou il fuit derriere la bande, en unites monde
uniform float u_leanA; // profondeur signee au bord du frustum
uniform float u_leanW; // demi-largeur du frustum a z=0

varying vec2 vUv;
varying vec3 vWorld;

// 0 exactement la ou les cartes se tiennent, 1 au bord lointain -- et NEGATIF
// devant elles, parce que le sol continue vers la camera et sort par le bas du
// cadre. Pris sur le z monde plutot que sur uv.y : uv va de 0 a 1 sur ce que
// le maillage couvre, donc il mettrait 0 au bord avant, et 0 doit signifier la
// ligne de contact ou l'ombrage n'a plus rien a quoi s'accrocher.
varying float vFar;

float leanRamp(float s) {
  s = clamp(s, -1.0, 1.0);
  return s * (1.5 - 0.5 * s * s);
}

vec4 lean(vec4 w, float k) {
  if (u_leanW > 0.001 && k > 0.001) {
    w.z += u_leanA * leanRamp(w.x / u_leanW) * k;
  }
  return w;
}

void main() {
  vUv = uv;

  vec4 w = modelMatrix * vec4(position, 1.0);

  // Avant la porte, qui deplace z. La porte decide ou la surface EST ; la
  // distance parcourue le long du sol est un fait de mise en page, et laisser
  // la charniere la moduler ferait osciller la fondu et la bande de contact
  // avec la bande.
  vFar = -w.z / max(u_run, 0.0001);

  // La porte, partagee avec la bande. C'est tout le sens de "incline pareil" :
  // LEAN est une fonction du X MONDE, donc le sol et les cartes evaluent la
  // meme rampe et la meme charniere comme un seul objet. Faire pivoter le
  // maillage du sol pour l'accorder ne coinciderait qu'a un seul x -- les deux
  // surfaces seraient visiblement en desaccord sur ou se trouve la charniere,
  // ce qui est pire que pas de sol du tout.
  w = lean(w, u_leanK);

  // APRES la porte -- le reflet projette ce point a travers la camera
  // miroir, et ce doit etre le point reellement dessine.
  vWorld = w.xyz;

  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const FLOOR_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 u_c0;      // ce dans quoi il se dissout -- la base du fond
uniform vec3 u_c1;      // teinte proche de la surface
uniform float u_alpha;  // presence du sol entier
uniform float u_grid;
uniform vec2 u_gridF;   // cellules en travers du maillage, et le long de la fuite

// Le faux reflet : une capture au dixieme de resolution des cartes vues par un
// oeil MIROIR, echantillonnee en projetant le point monde de ce fragment a
// travers cette camera, et ajoutee UNIQUEMENT dans les traits.
uniform sampler2D u_refl;
uniform float u_reflA;      // sa force ; 0 = eteint, et l'echantillon est saute
uniform mat4 u_reflVP;      // projection * vue de la camera miroir
uniform float u_reflSpread; // a quel point la trainee raye depuis la lampe
uniform float u_reflLX;     // le x monde de la lampe d'ou partent les trainees

varying vec2 vUv;
varying vec3 vWorld;
varying float vFar;

void main() {
  // Une dissolution plutot qu'un horizon. Un sol qui s'arrete sur une LIGNE
  // doit repondre de ce qu'il y a au-dela, et la reponse est toujours soit une
  // couture franche soit un ciel qui doit s'accorder au sol exactement la ou
  // ils se rejoignent. Le fondre dans la base du fond fait que le bord lointain
  // cesse simplement d'exister.
  float fade = 1.0 - smoothstep(0.2, 0.95, vFar);

  // Le contact. Les cartes ne touchent pas ce sol -- rien ici ne s'intersecte,
  // tous les materiaux tournent en depthTest false -- donc l'ombre qu'elles
  // porteraient est la SEULE chose qui dise qu'elles se tiennent dessus plutot
  // que de flotter devant. Une bande exponentielle serree au bord proche.
  //
  // Une bande pour toute la bande plutot qu'une flaque par carte : par carte il
  // faudrait le x de chacune ici, et la bande boucle -- la version honnete
  // serait une liste de positions dont la longueur change quand les cartes se
  // recyclent. abs, pour que la bande soit POSEE sur la ligne de contact
  // plutot que d'y commencer.
  float contact = exp(-abs(vFar) * 14.0);

  vec3 col = mix(u_c1, u_c0, smoothstep(0.0, 0.8, vFar));
  col *= 1.0 - contact * 0.55;

  // ── La grille ──
  //
  // La seule chose qui fasse lire un plan fuyant comme une SURFACE. Sans elle
  // un sol qui s'efface est indiscernable d'un brouillard, parce qu'un degrade
  // lisse ne porte aucune information sur l'angle auquel il est couche -- l'oeil
  // a besoin d'une texture dont l'espacement se comprime avec la distance.
  //
  // Faible contraste a dessein : a pleine force c'est une grille, et une grille
  // est un tout autre genre. Ca doit etre ce qu'on remarque en second.
  //
  // Anticrenele par fwidth plutot qu'a largeur fixe, et c'est ce qui le rend
  // abordable : les traits s'adoucissent exactement aussi vite que la
  // perspective les serre, donc ils se fondent en un lavis regulier au loin au
  // lieu de moirer puis d'etre effaces pour le cacher.
  //
  // STATIQUE. La grille etait decalee par le trajet de la bande, et c'etait
  // faux : la camera ne bouge pas et le sol non plus -- ce sont les cartes. Un
  // sol qui glisse sous un carrousel est un tapis roulant, et un tapis roulant
  // est la seule chose qui ne puisse pas aussi etre une piece.
  vec2 g = vec2(vUv.x * u_gridF.x, vFar * u_gridF.y);
  vec2 gf = abs(fract(g) - 0.5);
  vec2 gw = fwidth(g) * 1.5;

  vec2 lines = vec2(1.0) - smoothstep(vec2(0.0), gw, gf);
  float line = max(lines.x, lines.y);

  col += line * u_grid * fade;

  // ── Le reflet, dans les traits seulement ──
  //
  // Les cartes a l'envers dans les traits mouilles sous elles. Le point monde
  // de ce fragment est projete a travers la camera MIROIR, et la capture
  // contient ce que cet oeil voit -- donc, le long de cette ligne de visee
  // exacte, la carte que le sol refleterait. La perspective est celle de la
  // piece : l'image s'incline et converge avec le sol au lieu de pendre droit.
  // La capture est au dixieme de resolution, et cette grossierete EST le flou
  // -- un sol mouille ne fait pas la mise au point.
  //
  // Confine au masque de la grille, pour que la surface entre les traits reste
  // noire et que ca se lise "les traits sont un peu mouilles", jamais "le sol
  // est un miroir".
  if (u_reflA > 0.001) {
    // La trainee RAYONNE depuis la lampe plutot que de pencher d'un cote fixe :
    // le point echantillonne glisse vers le x de la lampe a mesure que le
    // fragment quitte la ligne de contact, donc chaque trainee s'etire a
    // l'oppose de la lumiere. Une inclinaison constante se lit comme un decalque
    // colle au sol ; un eventail d'inclinaisons est une lampe dans la piece.
    vec3 wp = vWorld;
    wp.x -= (vWorld.x - u_reflLX) * u_reflSpread * abs(vFar);

    vec4 rp = u_reflVP * vec4(wp, 1.0);
    vec2 ruv = (rp.xy / max(rp.w, 0.0001)) * 0.5 + 0.5;

    // Hors de la capture il n'y a rien a refleter -- mais la bordure est
    // ADOUCIE, pas coupee : le clamp franc se lisait comme un reflet eteint sur
    // une ligne en travers du sol.
    vec2 soft = smoothstep(vec2(0.0), vec2(0.1), ruv)
      * (vec2(1.0) - smoothstep(vec2(0.9), vec2(1.0), ruv));
    float ok = soft.x * soft.y;

    vec3 refl = texture2D(u_refl, ruv).rgb;

    // L'extinction, asymetrique a dessein. Vers le fond elle est RAPIDE --
    // finie des la premiere portion, un reflet qui atteint l'horizon est un lac.
    // VERS la camera elle s'attarde : ce cote-la est le sol sur lequel on se
    // tient, et la lumiere meurt lentement sur une surface qu'elle rase.
    float fall = exp(-((vFar > 0.0) ? vFar * 6.0 : -vFar * 2.2));

    col += refl * line * u_reflA * fall * ok * fade;
  }

  gl_FragColor = vec4(col, u_alpha * fade);
}
`;
