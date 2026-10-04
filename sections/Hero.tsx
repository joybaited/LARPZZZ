import Section from "@/components/Section";

/** phase 1 placeholder. black and white, shapes only, no content. */
export default function Hero() {
  return (
    <Section id="hero" bleed className="bg-haze pt-(--space-m)">
      {/*
        nav. a rectangle for now, but built as a nav because that is what it
        is — it will hold items later. empty until told otherwise.

        full-bleed: it sits inside the section's own width with its own
        inset, rather than inside the 1280 content column. widen or narrow
        by changing --nav-inset alone.
      */}
      <nav
        aria-label="Main"
        className="mx-(--nav-inset) h-(--space-xl) rounded-lg bg-ink"
      />

      {/*
        headline. left of the phone, which the canvas centres — so this
        occupies the left half and stops there. stacked in three lines:
        the breaks are the design, not wrapping, hence spans not a width.
        indented past the nav's left edge — nav inset plus one step.

        size is a step above text-1, kept fluid on the same 390 -> 1440
        solve so it scales with everything else.
      */}
      <h1 className="mt-(--space-3xl) ml-[calc(var(--nav-inset)+var(--space-l))] font-display text-[clamp(3.25rem,1.14rem+5.4vw,9rem)] leading-[0.9] uppercase">
        <span className="block">Fake it</span>
        <span className="block">Till&rsquo; you</span>
        <span className="block">Make it</span>
      </h1>
    </Section>
  );
}
