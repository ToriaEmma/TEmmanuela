// Le ruban : la surface partagee sur laquelle toutes les cartes sont posees.
//
// Portee depuis la reference (jesperlandberg.com). La forme est UNE courbe en
// S en PROFONDEUR -- proche sur la moitie gauche, lointaine sur la droite --
// ramenee a plat hors cadre par une queue gaussienne. C'est la distinction qui
// fait tout le geste : la silhouette des cartes ondule parce que la PERSPECTIVE
// la plie, pas parce que la geometrie la deforme. La meme courbe appliquee en y
// donnait des bords superieurs ondules et un milieu pince.
//
// Chaque terme porte la queue gaussienne, donc tout decroit vers le plat tout
// seul : une carte qui rentre par le bord reprend la courbe progressivement,
// un pli a un point de coupure est structurellement impossible.

// Chunk commun au vertex et au fragment : la surface, sa pente exacte, le
// roulis, l'ombrage et la normale analytique. Les deux etages doivent evaluer
// exactement les memes fonctions, sinon la surface eclairee et la surface
// dessinee divergent -- et un exposant speculaire trouve ca immediatement.
export const SHEET_CHUNK = /* glsl */ `
const float SHEET_PI = 3.141592653589793;

// Roulis au repos, en radians au point le plus pentu. La surface s'incline
// DANS la pente de la vague, comme un virage releve.
const float SHEET_BANK = -0.16;

// Cisaillement : y par x, le ruban monte legerement vers la droite.
const float SHEET_DIAG = 0.03;

// La vague en y -- au point mort dans la reference, gardee pour la forme.
const float SHEET_WAVE = 0.0;
const float SHEET_WAVE_F = 0.8;
const float SHEET_WAVE_PH = 0.35;

// Le cabrage a la velocite : le cote gauche se souleve et vient vers la
// camera. Le masque s'ouvre a gauche du centre, la moitie droite reste
// assise et le mouvement a un point d'appui.
const float SHEET_REAR_Y = 0.1;
const float SHEET_REAR_Z = 0.2;

// L'essorage des bords a la velocite, en radians au bout du masque.
const float SHEET_VTWIST = 1.8;

// La decroissance gaussienne.
const float SHEET_TAIL = 1.0;

// Glisse le profil le long de x : le pic proche -- le renflement vers la
// camera -- se pose nettement a GAUCHE du centre, donc le cadre se lit comme
// un ruban qui enfle en arrivant plutot que qui culmine droit devant.
const float SHEET_SHIFT = -0.2;

uniform float u_sheetW; // demi-largeur du frustum a z=0 (0 = ruban eteint)
uniform float u_sheetD; // amplitude de la vague, en unites monde
uniform float u_sheetT; // quelle part du cadre le S traverse (>1 finit plus tot)
uniform float u_sheetC; // 0 = cuvette symetrique, 1 = le S proche-vers-lointain
uniform float u_sheetP; // force du ruban : 1 sur la bande, 0 ailleurs
uniform float u_sheetV; // vitesse de scroll, 0..1 -- pilote le cabrage
uniform float u_hover;  // 0 au repos, 1 avec le pointeur sur cette carte
uniform float u_dent;   // profondeur du creux, en part de la hauteur
uniform float u_leanA;  // profondeur signee au bord du frustum (la "porte")
uniform float u_leanW;  // demi-largeur du frustum a z=0

// Le renflement : une parabole en y, pilotee par la vitesse de defilement.
// C'est ce qui porte tout le mobile -- la courbe du ruban y est ETEINTE
// (pas seulement adoucie : u_sheetW reste a 0), donc sans lui la colonne
// serait une pile de rectangles plats. Maximum au centre de l'ecran, nul en
// haut et en bas : toute la colonne se bombe vers la camera ou s'en ecarte
// pendant le geste, et se remet a plat en se reposant.
uniform float u_bulgeA; // amplitude signee, unites monde (0 = plat)
uniform float u_bulgeH; // demi-hauteur du frustum a z=0

vec4 bulge(vec4 w) {
  if (u_bulgeH > 0.001) {
    float t = clamp(w.y / u_bulgeH, -1.0, 1.0);
    w.z += u_bulgeA * (1.0 - t * t);
  }
  return w;
}

// La rampe de la porte, et c'est une rampe LISSE, pas le clamp d'avant : un
// clamp a un coin a +/-1, donc un saut dans dz/dx, et sous le gloss un saut
// de normale est une couture verticale nette en plein milieu d'une carte
// large. Le cubique raccorde le plat proprement.
float leanRamp(float s) {
  s = clamp(s, -1.0, 1.0);
  return s * (1.5 - 0.5 * s * s);
}

// Sa derivee exacte : 1.5(1 - s^2) dans les bords, 0 au-dela.
float leanSlope(float s) {
  s = min(abs(s), 1.0);
  return 1.5 * (1.0 - s * s);
}

vec4 lean(vec4 w, float k) {
  if (u_leanW > 0.001 && k > 0.001) {
    w.z += u_leanA * leanRamp(w.x / u_leanW) * k;
  }
  return w;
}

// Ou ce point tombe en travers du cadre : -1 au bord gauche, 0 au milieu,
// +1 a droite, et doucement AU-DELA dans les marges de wrap -- aucun clamp.
float sheetQ(float wx) {
  return wx / max(u_sheetW, 0.0001) * u_sheetT + SHEET_SHIFT;
}

// DEUX profils, melanges par u_sheetC -- melanges plutot que branches pour
// qu'il n'y ait qu'une seule derivee en dessous au lieu de deux qui peuvent
// se desynchroniser. A 0 une parabole (la cuvette douce que veut un ecran
// etroit), a 1 le S sinusoidal qui a besoin de largeur pour se lire.
float sheetShape(float q) {
  return mix(1.0 - q * q, sin(SHEET_PI * q), u_sheetC) * exp(-SHEET_TAIL * q * q);
}

// Sa pente exacte, terme par terme : regle du produit sur chaque profil puis
// le meme melange. Exacte parce que la normale et le devers en sont tires.
float sheetShapeSlope(float q) {
  float g = exp(-SHEET_TAIL * q * q);
  float bowl = -2.0 * q * (1.0 + SHEET_TAIL * (1.0 - q * q));
  float ess = SHEET_PI * cos(SHEET_PI * q) - 2.0 * SHEET_TAIL * q * sin(SHEET_PI * q);
  return mix(bowl, ess, u_sheetC) * g;
}

float sheetZ(float wx) {
  return -u_sheetD * sheetShape(sheetQ(wx));
}

// Le devers : la derivee propre de la vague, mise a l'echelle en radians.
// Multiplie par u_sheetC, donc le devers appartient au S et disparait avec
// lui : une cuvette symetrique n'a rien dans quoi s'incliner.
float sheetRoll(float wx) {
  if (u_sheetW < 0.001) return 0.0;
  return SHEET_BANK * sheetShapeSlope(sheetQ(wx)) / SHEET_PI * u_sheetC * u_sheetP;
}

// Le vent : un point monde roule autour de la LIGNE CENTRALE du ruban.
// Pas autour du centre de chaque plan -- sinon chaque carte s'enroule sur
// elle-meme et la bande cesse d'etre une seule surface. Cette ligne est
// y = z = 0, donc la rotation est juste (y, z) autour de l'origine, x intact.
// x intact est ce qui fait marcher l'ordre plus bas.
vec4 sheetWind(vec4 w) {
  float a = sheetRoll(w.x);

  if (u_sheetV > 0.001 && u_sheetW > 0.001 && u_sheetP > 0.001) {
    float qe = w.x / u_sheetW;
    // 0.3-0.9 de la demi-largeur : sous cette perspective le cadre visible
    // depasse a peine |q| = 1, donc un masque culminant a 1.1 etait a pleine
    // force hors ecran -- de l'arithmetique sans pixels.
    a += SHEET_VTWIST * u_sheetV * smoothstep(0.3, 0.9, abs(qe)) * sign(qe) * u_sheetP;
  }

  if (abs(a) < 0.0001) return w;

  float s = sin(a);
  float c = cos(a);
  return vec4(w.x, w.y * c - w.z * s, w.y * s + w.z * c, w.w);
}

// Tout ce que le ruban fait a un point monde, dans le seul ordre qui compose.
vec4 sheet(vec4 w) {
  w = sheetWind(w);
  w.z += sheetZ(w.x) * u_sheetP;

  // La diagonale et la vague APRES le vent : le roulis tourne (y, z) autour
  // de la ligne centrale, et deplacer y d'abord donnerait a la rotation une
  // coordonnee portant deja la pente -- on enroulerait le serpent au lieu du
  // ruban.
  if (u_sheetW > 0.001) {
    float qw = w.x / u_sheetW;

    w.y += SHEET_DIAG * w.x * u_sheetP;
    w.y += SHEET_WAVE * u_sheetW *
      sin(SHEET_PI * (qw * SHEET_WAVE_F + SHEET_WAVE_PH)) * u_sheetP;

    if (u_sheetV > 0.001) {
      float m = 1.0 - smoothstep(-1.0, 0.3, qw);
      w.y += SHEET_REAR_Y * u_sheetW * u_sheetV * m * u_sheetP;
      w.z += SHEET_REAR_Z * u_sheetW * u_sheetV * m * u_sheetP;
    }
  }

  return w;
}

// Le survol, dans les coordonnees propres du plan : un produit de deux
// paraboles, 1 au centre et exactement 0 sur chaque bord -- la silhouette
// reste intacte quelle que soit la profondeur du creux.
float sheetDome(vec2 uv) {
  vec2 q = uv * 2.0 - 1.0;
  return (1.0 - q.x * q.x) * (1.0 - q.y * q.y);
}

// 0 aux cretes, 1 dans les creux. Le creux du survol y compte, normalise par
// la plage PROPRE de la vague : une carte enfoncee aussi loin que le creux
// s'ombre exactement comme le creux, pas de seconde constante qui derive.
float sheetShade(float wx, vec2 uv, float resY) {
  if (u_sheetD < 0.001) return 0.0;

  float d = u_sheetW > 0.001 && u_sheetP > 0.001
    ? clamp((u_sheetD - sheetZ(wx)) / (2.0 * u_sheetD), 0.0, 1.0) * u_sheetP
    : 0.0;

  if (u_hover > 0.0001) {
    d += (u_hover * u_dent * resY * sheetDome(uv)) / (2.0 * u_sheetD);
  }

  return clamp(d, 0.0, 1.0);
}

// Tout ce que l'etage vertex a fait a z, pour que le fragment remette un point
// la ou il a reellement atterri. La position vertex ne peut pas etre
// interpolee pour ca : z est la seule composante qui n'est PAS affine dans les
// coordonnees du plan, donc le varying reporterait les cordes de la courbe.
float sheetOffset(float wx, vec2 uv, float resY) {
  float z = 0.0;
  if (u_sheetW > 0.001 && u_sheetP > 0.001 && u_sheetD > 0.001) z += sheetZ(wx) * u_sheetP;
  if (u_leanW > 0.001) z += u_leanA * leanRamp(wx / u_leanW) * u_sheetP;
  if (u_hover > 0.0001) z -= u_hover * u_dent * resY * sheetDome(uv);
  return z;
}

// La normale de la surface, analytiquement -- et c'est toute la raison d'etre
// de l'arrangement. Le ruban est un champ de hauteur a forme close, donc sa
// pente en a une aussi. La prendre de la GEOMETRIE rendrait les 24 facettes
// plates dont le maillage est reellement fait, et un exposant speculaire est
// precisement ce qui transforme une arete de facette en couture visible.
vec3 sheetNormal(float wx, vec2 uv, vec2 res) {
  float dzdx = 0.0;
  float dzdy = 0.0;

  if (u_sheetW > 0.001 && u_sheetP > 0.001 && u_sheetD > 0.001) {
    dzdx += -u_sheetD * sheetShapeSlope(sheetQ(wx)) * u_sheetT / u_sheetW * u_sheetP;
  }

  if (u_leanW > 0.001) {
    dzdx += (u_leanA / u_leanW) * leanSlope(wx / u_leanW) * u_sheetP;
  }

  if (u_hover > 0.0001) {
    vec2 q = uv * 2.0 - 1.0;
    float a = u_hover * u_dent;
    dzdx += 4.0 * a * res.y * q.x * (1.0 - q.y * q.y) / max(res.x, 0.0001);
    dzdy += 4.0 * a * q.y * (1.0 - q.x * q.x);
  }

  vec3 n = normalize(vec3(-dzdx, -dzdy, 1.0));

  // Roulee avec la surface : le champ de hauteur decrit le ruban AVANT
  // l'enroulement, donc la normale doit prendre le meme virage.
  float a = sheetRoll(wx);
  if (abs(a) > 0.0001) {
    float s = sin(a);
    float c = cos(a);
    n = vec3(n.x, n.y * c - n.z * s, n.y * s + n.z * c);
  }

  return n;
}
`;

export const VERTEX_SHADER = /* glsl */ `
uniform vec2 u_res; // taille monde du plan

varying vec2 vUv;
varying vec3 vFlat; // position monde AVANT qu'aucun z ne soit ecrit

${SHEET_CHUNK}

void main() {
  vUv = uv;

  // Le plan la ou le DOM l'a mis, avant que la surface ne lui fasse quoi que
  // ce soit. CHAQUE composante est affine dans les coordonnees du plan :
  // l'interpolateur les reproduit exactement, et l'etage fragment rajoute le
  // deplacement analytiquement (sheetOffset) au lieu d'en recevoir une
  // version en cordes.
  vFlat = (modelMatrix * vec4(position, 1.0)).xyz;

  vec3 p = position;

  // Le survol : le milieu de la carte se bombe VERS L'ARRIERE, et le bord ne
  // bouge pas du tout. Rien de la boite de la carte ne change -- son rect,
  // ses coins arrondis, ce qu'elle chevauche. Local, AVANT la model matrix :
  // le plan n'est mis a l'echelle qu'en x et y, donc un z ecrit ici passe a
  // l'echelle monde, et la profondeur est prise sur u_res.y -- une part de la
  // hauteur propre de la carte, donc un creux a la meme allure sur telephone.
  if (u_hover > 0.0001) {
    p.z -= u_hover * u_dent * u_res.y * sheetDome(uv);
  }

  vec4 w = modelMatrix * vec4(p, 1.0);

  // Le ruban : le vent autour de sa ligne centrale, puis la vague le long.
  w = sheet(w);

  // La porte a laquelle toute la bande est accrochee. APRES la vague et
  // appliquee en espace monde, donc c'est une seule charniere sous chaque
  // carte plutot qu'une inclinaison que chaque plan prend de son cote.
  w = lean(w, u_sheetP);

  // Le renflement en dernier, et en espace monde : c'est une propriete de la
  // COLONNE entiere, pas de chaque carte -- toutes se bombent ensemble selon
  // ou elles se trouvent a l'ecran.
  w = bulge(w);

  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform sampler2D u_texture;
uniform vec2 u_size;   // taille en pixels de l'image
uniform vec2 u_res;    // taille monde du plan
uniform float u_alpha;
// 0 tant que la photo n'est pas arrivee : la carte est alors peinte comme
// une plaque sombre plutot que laissee transparente, pour que la grille ait
// sa forme complete des l'ouverture au lieu de se remplir case par case.
uniform float u_hasTexture;

// Le pied de carte -- titre et pastille -- pre-dessine sur un canvas au
// format EXACT de la carte, donc echantillonne en vUv direct sans passer par
// uvCover : il ne doit pas etre recadre comme la photo l'est.
//
// Compose ici plutot que pose en DOM par-dessus le canvas, et c'est tout
// l'interet : une fois dans la texture, le titre subit le meme deplacement de
// vertex que l'image, donc il se courbe AVEC la carte au lieu de flotter a
// plat devant elle. C'est ce que la reference obtient en faisant passer ses
// titres par la meme fonction sheet() que les cartes.
uniform sampler2D u_label;
uniform float u_hasLabel;
uniform float u_shade;  // force de l'eclairage de la surface
uniform float u_haze;   // force de la brume de profondeur (0 = aucune)
uniform float u_shadeS; // etalement : sous 1 il s'elargit
uniform float u_corner; // border-radius, normalise a la hauteur du plan
uniform float u_scrim;  // force du voile sous le titre

varying vec2 vUv;
varying vec3 vFlat;

${SHEET_CHUNK}

// En haut a gauche, et vers le spectateur -- la direction dont la porte
// ecarte deja la bande, donc le bord proche est celui qui est eclaire.
const vec3 LIGHT_DIR = normalize(vec3(-0.4, 0.5, 1.0));

// A quel point le lustre est serre. Eleve, parce qu'un lustre large sur une
// photo est indiscernable de la carte entiere qui s'eclaircit.
const float LIGHT_GLOSS = 48.0;
const float LIGHT_SPEC = 0.35;
const float LIGHT_DIFF = 0.12;

vec3 sheetLit(vec3 col, vec3 n, vec3 v, float amt) {
  if (amt < 0.001) return col;

  // Enveloppe plutot que clampe : un terminateur dur sur une surface aussi
  // peu profonde trace une ligne visible en travers de la carte la ou dot()
  // passe par zero.
  float d = dot(n, LIGHT_DIR) * 0.5 + 0.5;
  col *= 1.0 - LIGHT_DIFF * amt * (1.0 - d);

  vec3 h = normalize(LIGHT_DIR + v);
  return col + pow(max(dot(n, h), 0.0), LIGHT_GLOSS) * LIGHT_SPEC * amt;
}

// Couvre le plan avec l'image sans la deformer (equivalent object-fit: cover).
vec2 uvCover(vec2 planeSize, vec2 imageSize, vec2 uv) {
  float planeRatio = planeSize.x / planeSize.y;
  float imageRatio = imageSize.x / imageSize.y;

  vec2 newSize = planeRatio < imageRatio
    ? vec2(imageSize.x * (planeSize.y / imageSize.y), planeSize.y)
    : vec2(planeSize.x, imageSize.y * (planeSize.x / imageSize.x));
  vec2 newOffset = (planeRatio < imageRatio
    ? vec2((newSize.x - planeSize.x) / 2.0, 0.0)
    : vec2(0.0, (newSize.y - planeSize.y) / 2.0)) / newSize;

  return uv * planeSize / newSize + newOffset;
}

float roundedBox(vec2 p, vec2 mid, float r) {
  vec2 q = abs(p - mid) - (mid - r);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec4 tex = u_hasTexture > 0.5
    ? texture2D(u_texture, uvCover(u_res, u_size, vUv))
    : vec4(vec3(0.075), 1.0);

  if (u_shade > 0.001) {
    // La brume de profondeur : les parties les plus eloignees de la camera
    // s'enfoncent vers le fond de page. Sur u_haze plutot que sur u_shade,
    // pour pouvoir la couper en gardant la LUMIERE qui suit -- les deux
    // repondent a la meme surface mais ne disent pas la meme chose : l'une
    // efface l'image au loin, l'autre lui donne son relief.
    if (u_haze > 0.001) {
      float depth = sheetShade(vFlat.x, vUv, u_res.y);
      tex.rgb = mix(tex.rgb, vec3(0.059), u_haze * 0.8 * pow(depth, u_shadeS));
    }

    // Le point est remis la ou l'etage vertex l'a reellement laisse, plutot
    // qu'interpole : le deplacement est rajoute ici depuis la meme forme
    // close que la geometrie a utilisee, donc le vecteur de vue est exact et
    // le lustre ne peut pas heriter d'une corde.
    vec3 p = vFlat + vec3(0.0, 0.0, sheetOffset(vFlat.x, vUv, u_res.y));

    tex.rgb = sheetLit(
      tex.rgb,
      sheetNormal(vFlat.x, vUv, u_res),
      normalize(cameraPosition - p),
      u_shade
    );
  }

  // Le voile du titre : un degrade sombre depuis le bord bas de la carte, au
  // carre pour que le poids soit tout au bord et que la bande se dissolve au
  // lieu de s'arreter sur une ligne.
  if (u_scrim > 0.001) {
    float g = 1.0 - smoothstep(0.0, 0.5, vUv.y);
    tex.rgb = mix(tex.rgb, vec3(0.0), u_scrim * 0.65 * g * g);
  }

  // Le pied par-dessus la photo, APRES l'ombrage et le voile : le titre garde
  // son contraste ou que la carte se trouve sur la courbe, au lieu de
  // s'enfoncer dans le noir avec le fond quand elle part au loin.
  if (u_hasLabel > 0.5) {
    vec4 lab = texture2D(u_label, vUv);
    tex.rgb = mix(tex.rgb, lab.rgb, lab.a);
  }

  float alpha = u_alpha;

  // C'est le GL qui dessine ces plans, donc le border-radius de la carte DOM
  // doit etre decoupe ici ou il n'existe simplement pas.
  if (u_corner > 0.0001) {
    vec2 sz = vec2(u_res.x / max(u_res.y, 0.0001), 1.0);
    vec2 mid = sz * 0.5;
    float r = min(u_corner, min(mid.x, mid.y));
    float d = roundedBox(vUv * sz, mid, r);
    float aa = max(fwidth(d), 0.0001);
    alpha *= 1.0 - smoothstep(-aa, aa, d);
  }

  gl_FragColor = vec4(tex.rgb, alpha);
}
`;
