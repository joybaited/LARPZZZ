import Features from "@/sections/Features";
import HowItWorks from "@/sections/HowItWorks";
import Testimonials from "@/sections/Testimonials";
import Faq from "@/sections/Faq";
import Pricing from "@/sections/Pricing";

/**
 * every section in order, minus the hero. a workbench for looking at how the
 * sections read together without scrolling past the hero each time.
 *
 * NO <SceneMount />. The canvas is the hero's phone and this route is the
 * hero's absence — mounting it would render the 3D over section two's cards,
 * which is a known open item on the full page. see app/sections/page.tsx.
 *
 * ⚠ NOT app/page.tsx. That is the finished page and is stubbed up front; this
 * is a second view of the same sections, so the shared file stays untouched.
 */
export default function NoHero() {
  return (
    <main>
      <Features />
      <HowItWorks />
      <Testimonials />
      <Faq />
      <Pricing />
    </main>
  );
}
