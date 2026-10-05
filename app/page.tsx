import SceneMount from "@/components/SceneMount";
import Hero from "@/sections/Hero";
import Features from "@/sections/Features";
import HowItWorks from "@/sections/HowItWorks";
import Testimonials from "@/sections/Testimonials";
import Faq from "@/sections/Faq";
import Pricing from "@/sections/Pricing";

/**
 * the wire-up. shared file — stubbed up front, sections get added as
 * one import + one tag each. do not build section internals here.
 */
export default function Page() {
  return (
    <>
      <SceneMount />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Faq />
        <Pricing />
      </main>
    </>
  );
}
