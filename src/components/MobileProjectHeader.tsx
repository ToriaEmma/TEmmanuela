import MobileSiteMenu from "./MobileSiteMenu";
import { navigateTo } from "../utils/navigation";

const OldMobileProjectHeader = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Africa/Porto-Novo",
      }).format(new Date()).toUpperCase());
    };
    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="mobile-scroll-header sticky top-0 z-50 flex h-[74px] items-center justify-between border-b px-5 font-mono md:hidden">
      <button type="button" onClick={() => navigateTo("/")} className="text-left text-[11px] uppercase leading-relaxed">
        <span className="block font-bold">Emmanuela©</span>
        <span className="block font-normal">{time} GMT+1</span>
      </button>
      <button type="button" onClick={() => navigateTo("/#projects")} className="rotate-[-90deg] text-xs uppercase">
        Menu
      </button>
    </header>
  );
};

const MobileProjectHeader = () => <MobileSiteMenu />;
export default MobileProjectHeader;
