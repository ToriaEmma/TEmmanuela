// Prechargement pendant le loader.
//
// Le site n'est monte qu'a la fin du loader (5,6 s). Ce qu'il affiche en
// premier -- le code de l'accueil, les visuels et les SVG du hero -- doit donc
// etre en cache a ce moment-la, sinon il apparait par morceaux et la page
// change de hauteur sous le doigt.
//
// Mais rien de tout cela ne doit concurrencer la PREMIERE image du loader
// (son script, sa police, ses visuels) : sur un reseau mobile, chaque octet
// demande au demarrage retarde son affichage. On attend donc que la page soit
// chargee et que le loader ait peint, puis on lance le reste, qui a encore
// plusieurs secondes d'animation devant lui pour arriver.

const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

const heroAssets = () => [
  "/title3.webp",
  "/clouds_2.webp",
  "/motif.webp",
  "/runner.gif",
  ...(isMobile()
    ? ["/oval_mobile_top.svg", "/oval_mobile_bot.svg"]
    : ["/oval_desktop_top.svg", "/oval_desktop_bot.svg", "/flag.svg"]),
  "/line.svg",
];

const preloadImage = (href: string) => {
  if (document.head.querySelector(`link[rel="preload"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = href;
  document.head.appendChild(link);
};

// Police du titre du hero (sous-ensemble latin, voir index.css). Sans elle
// en cache, CREATIVE / DESIGNING s'afficheraient d'abord en police de secours.
const preloadFont = (href: string) => {
  if (document.head.querySelector(`link[rel="preload"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.type = "font/woff2";
  link.crossOrigin = "anonymous";
  link.href = href;
  document.head.appendChild(link);
};

/** Lance le prechargement une fois la premiere image du loader affichee.
    `loadPage` charge le chunk de la page courante (l'accueil). */
export const warmUpSite = (loadPage?: () => Promise<unknown>) => {
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    window.clearTimeout(fallback);
    window.removeEventListener("load", onLoad);
    preloadFont("/fonts/Anton-Regular-latin.woff2");
    if (loadPage) void loadPage().catch(() => undefined);
    if (window.location.pathname === "/") heroAssets().forEach(preloadImage);
  };

  // Apres le chargement de la page ET deux frames (le loader a peint), avec un
  // court delai pour laisser la police et le premier visuel se poser.
  const onLoad = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.setTimeout(start, 300));
    });
  };
  // Filet : sur un reseau tres lent, `load` peut tarder ; on n'attend pas
  // au-dela, pour que tout soit pret avant la fin du loader.
  const fallback = window.setTimeout(start, 2500);

  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });

  return () => {
    window.clearTimeout(fallback);
    window.removeEventListener("load", onLoad);
  };
};
