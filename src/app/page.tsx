import { BotanicalCanvas } from "@/components/ambient/botanical-canvas";
import { IntroHero } from "@/components/ambient/intro-hero";
import { getApps, getEntries } from "@/db/data-provider";

export default async function HomePage() {
  const [apps, entries] = await Promise.all([getApps(), getEntries()]);

  const docsCount = entries.filter((e) => e.type === "doc").length;
  const coursesCount = entries.filter((e) => e.type === "course").length;
  const ideasCount = entries.filter((e) => e.type === "idea").length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg">
      {/* 60fps Ambient Botanical Drift Canvas */}
      <BotanicalCanvas />

      {/* Floating Monochromatic Raw Luxury Hero */}
      <IntroHero
        stats={{
          appsCount: apps.length,
          docsCount,
          coursesCount,
          ideasCount,
        }}
      />
    </main>
  );
}
