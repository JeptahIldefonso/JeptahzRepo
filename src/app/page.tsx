import { BotanicalCanvas } from "@/components/ambient/botanical-canvas";
import { IntroHero } from "@/components/ambient/intro-hero";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#edf2fa]">
      {/* 60fps Ambient Botanical Drift Canvas */}
      <BotanicalCanvas />

      {/* Pure Centered Welcome: Name & Enter Button */}
      <IntroHero />
    </main>
  );
}
