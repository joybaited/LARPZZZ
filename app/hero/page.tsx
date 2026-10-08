import Hero from "@/sections/Hero";

/**
 * section 1 on its own. a workbench, not part of the site — same idea as
 * /tuner. see app/sections/page.tsx for the list.
 *
 * no <SceneMount /> here: <Hero> mounts the canvas itself now, so adding one
 * would render a second <Canvas>.
 */
export default function HeroWorkbench() {
  return (
    <>
      <main>
        <Hero />
      </main>
    </>
  );
}
