import { FormEvent, useState } from "react";
import LanguageToggle, { LocalizedText } from "./LanguageToggle";
import MobileSiteMenu from "./MobileSiteMenu";
import Footer from "./Footer";
import DesktopSiteHeader from "./DesktopSiteHeader";
import SocialMark from "./SocialMark";

const services = ["Site web", "UI/UX", "Identité", "Développement"];
const budgets = ["< 300 000 FCFA", "300 000–650 000 FCFA", "650 000–1 500 000 FCFA", "> 1 500 000 FCFA"];

const ContactPage = () => {
  const [service, setService] = useState(services[0]);
  const [budget, setBudget] = useState(budgets[1]);
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    data.append("service", service);
    data.append("budget", budget);
    data.append("_subject", `Nouveau projet — ${service}`);
    setFormStatus("sending");
    try {
      const response = await fetch("https://formspree.io/f/mlgqpvop", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Formspree request failed");
      form.reset();
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  };

  const pill = (active: boolean) => `rounded-full border px-4 py-2 text-[10px] uppercase transition-all md:text-xs ${active ? "border-[#fb6f92] bg-[#fb6f92] text-black" : "border-current/40 hover:border-[#fb6f92] hover:bg-[#fb6f92] hover:text-black"}`;

  return (
    <main className="theme-surface min-h-screen overflow-hidden bg-black px-5 font-mono text-[#d3d0c5] md:px-8">
      <MobileSiteMenu />

      <DesktopSiteHeader active="contact" />

      <section className="pb-16 pt-28 md:pb-24 md:pt-20">
        <div className="mb-3 flex items-center justify-center gap-8 text-xl font-bold uppercase md:justify-start md:pl-[20%] md:text-4xl">
          <LocalizedText fr="Parlons de" en="Talk about" />
          <span className="rounded-full bg-[#fb6f92] px-5 py-2 text-[9px] font-normal text-black md:text-xs"><LocalizedText fr="Discutons" en="Let's talk" />　•</span>
        </div>
        <h1 className="whitespace-nowrap text-center font-sans text-[23vw] font-black uppercase leading-[0.72] tracking-[-0.075em] md:text-[19vw]">
          <LocalizedText fr="Ton projet" en="Your project" />
        </h1>
      </section>

      <section className="grid gap-16 border-y border-white/20 py-14 md:grid-cols-[0.9fr_1.15fr] md:gap-24 md:px-[6%] md:py-20">
        <div className="flex flex-col justify-between gap-12">
          <h2 className="max-w-xl font-sans text-4xl font-medium uppercase leading-[0.82] tracking-[-0.075em] md:text-6xl">
            <LocalizedText fr="Je suis curieuse de découvrir ce que tu prépares." en="I am curious about what you are up to." />
          </h2>
          <div className="flex gap-3">
            <a href="https://www.linkedin.com/in/Emmanuela%20TODEDJI" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="group"><SocialMark type="linkedin" /></a>
            <a href="https://wa.me/22968678025" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="group"><SocialMark type="whatsapp" /></a>
          </div>
        </div>

        <form action="https://formspree.io/f/mlgqpvop" method="POST" onSubmit={submit} className="space-y-8">
          <fieldset>
            <legend className="mb-3 text-[10px] uppercase md:text-xs"><LocalizedText fr="Type de service" en="Type of service" /></legend>
            <div className="flex flex-wrap gap-2">{services.map((item) => <button key={item} type="button" onClick={() => setService(item)} className={pill(service === item)}>{item}</button>)}</div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-[10px] uppercase md:text-xs"><LocalizedText fr="Budget estimé" en="Estimated budget" /></legend>
            <div className="flex flex-wrap gap-2">{budgets.map((item) => <button key={item} type="button" onClick={() => setBudget(item)} className={pill(budget === item)}>{item}</button>)}</div>
          </fieldset>
          <label className="block border-b border-current/30 pb-3 text-[10px] uppercase md:text-xs"><LocalizedText fr="Nom" en="Name" /><input name="name" required className="mt-2 block w-full bg-transparent font-sans text-base outline-none" /></label>
          <label className="block border-b border-current/30 pb-3 text-[10px] uppercase md:text-xs">E-mail<input name="email" type="email" required className="mt-2 block w-full bg-transparent font-sans text-base outline-none" /></label>
          <label className="block border-b border-current/30 pb-3 text-[10px] uppercase md:text-xs"><LocalizedText fr="Parle-moi du projet" en="Tell me about the project" /><textarea name="message" rows={3} required className="mt-2 block w-full resize-none bg-transparent font-sans text-base outline-none" /></label>
          {formStatus === "success" && <p className="text-xs uppercase text-[#d4ff36]"><LocalizedText fr="Message envoyé. Merci !" en="Message sent. Thank you!" /></p>}
          {formStatus === "error" && <p className="text-xs uppercase text-[#fb6f92]"><LocalizedText fr="L’envoi a échoué. Réessaie." en="Sending failed. Please try again." /></p>}
          <button disabled={formStatus === "sending"} type="submit" className="flex w-full items-center justify-between rounded-full bg-[#fb6f92] px-7 py-5 text-xs uppercase text-black transition-transform hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60">
            {formStatus === "sending" ? <LocalizedText fr="Envoi…" en="Sending…" /> : <LocalizedText fr="Envoyer le projet" en="Let's talk" />}<span>•</span>
          </button>
        </form>
      </section>

      <div className="-mx-5 mt-20 md:-mx-8 md:mt-28"><Footer /></div>
    </main>
  );
};

export default ContactPage;
