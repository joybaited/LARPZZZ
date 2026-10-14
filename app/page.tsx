import Hero from "@/sections/Hero";
import HowItWorks from "@/sections/HowItWorks";
import Features from "@/sections/Features";
import Testimonials from "@/sections/Testimonials";
import Faq from "@/sections/Faq";
import Pricing from "@/sections/Pricing";
import Footer from "@/sections/Footer";

/**
 * the wire-up. shared file — stubbed up front, sections get added as
 * one import + one tag each. do not build section internals here.
 *
 * the <Canvas> is NOT here: it is absolute and belongs to <Hero>, which
 * mounts it. mounting it here would position it against the body and it
 * would ride down the whole page again.
 */
export default function Page() {
  return (
    <>
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Faq />
        <Pricing />
        <Footer />
      </main>
    </>
  );
}
