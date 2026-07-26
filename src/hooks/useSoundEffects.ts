import { useEffect, useState } from "react";

export const soundEffectsEnabled = () => localStorage.getItem("sound-effects") !== "off";

export const setSoundEffectsEnabled = (enabled: boolean) => {
  localStorage.setItem("sound-effects", enabled ? "on" : "off");
  window.dispatchEvent(new CustomEvent("sound-effects-change", { detail: enabled }));
};

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
