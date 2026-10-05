import Section from "@/components/Section";
import FaqItem from "@/components/FaqItem";

/* Section five. FAQ — the heading only; the questions arrive with the design.
 *
 * Megion is one weight (Bold) and display-only, so `font-display` is already
 * the bold cut — there is no font-weight to set and nothing lighter to fall
 * back to. */
export default function Faq() {
  return (
    <Section id="faq" className="bg-haze">
      <div className="flex min-h-[100svh] flex-col items-center justify-center">
        {/* a step above the hero's headline, on the same fluid 390 -> 1440
            solve so it still scales with everything else. */}
        <h2 className="font-display text-[clamp(4.5rem,1.6rem+7.4vw,12.5rem)] leading-[0.9] uppercase">
          FAQ
        </h2>

        {/* two dummy cards — one cannot show the exclusive behaviour. the
            real set arrives with the copy. */}
        <div className="mt-(--space-xl) w-full max-w-[52rem]">
          <FaqItem
            tilt={-2.5}
            q="What is this question doing here?"
            a="Placeholder answer — this is roughly the length a real one runs to, so the card can be looked at against something honest rather than one short line."
          />
          <FaqItem
            tilt={1.8}
            q="And a second one, to show they close each other?"
            a="Opening this shuts the one above it. That is the name attribute doing it, not state."
          />
        </div>
      </div>
    </Section>
  );
}
