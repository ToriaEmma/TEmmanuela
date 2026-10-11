import { useEffect, useState } from "react";

// Le son est actif a chaque visite. Le couper ne vaut que pour l'onglet en
// cours (sessionStorage) : garde en localStorage, un "off" pose une seule
// fois laissait le site muet a toutes les visites suivantes.
const KEY = "sound-effects";

export const soundEffectsEnabled = () => {
  try {
    return sessionStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
};

export const setSoundEffectsEnabled = (enabled: boolean) => {
  try {
    sessionStorage.setItem(KEY, enabled ? "on" : "off");
  } catch {
    // Stockage indisponible : le choix vaut jusqu'au rechargement.
  }
  window.dispatchEvent(new CustomEvent("sound-effects-change", { detail: enabled }));
};

// L'ancien choix persistant est efface : sans ca, les visiteurs qui avaient
// coupe le son le retrouveraient coupe.
try {
  localStorage.removeItem(KEY);
} catch {
  // rien a nettoyer
}

export const useSoundEffects = () => {
  const [enabled, setEnabled] = useState(soundEffectsEnabled);

  useEffect(() => {
    const update = (event: Event) => setEnabled((event as CustomEvent<boolean>).detail);
    window.addEventListener("sound-effects-change", update);
    return () => window.removeEventListener("sound-effects-change", update);
  }, []);

  const toggle = () => setSoundEffectsEnabled(!enabled);
  return { enabled, toggle };
};
