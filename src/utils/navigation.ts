export const navigateTo = (href: string) => {
  const target = new URL(href, window.location.href);
  if (target.origin !== window.location.origin || target.protocol === "mailto:" || target.protocol === "tel:") {
    window.location.href = target.href;
    return;
  }

  const next = `${target.pathname}${target.search}${target.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === current) return;

  window.history.pushState({}, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
  if (target.hash) {
    window.requestAnimationFrame(() => document.querySelector(target.hash)?.scrollIntoView({ block: "start" }));
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
};
