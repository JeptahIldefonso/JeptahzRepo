import { AmbientBackground } from "@/components/ambient/ambient-background";
import { IntroHero } from "@/components/ambient/intro-hero";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#041a24]">
      {/* 60fps Ambient Botanical Drift Canvas (Loaded dynamically on client) */}
      <AmbientBackground />

      {/* Pure Centered Welcome: Name & Enter Button */}
      <IntroHero />
    </main>
  );
}
