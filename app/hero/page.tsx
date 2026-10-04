import SceneMount from "@/components/SceneMount";
import Hero from "@/sections/Hero";

/**
 * section 1 on its own. a workbench, not part of the site — same idea as
 * /tuner. see app/sections/page.tsx for the list.
 *
 * SceneMount is here because the phone lives in the shared canvas, which
 * page.tsx normally mounts. without it the hero renders with no phone, which
 * is not what the hero is.
 */
export default function HeroWorkbench() {
  return (
    <>
      <SceneMount />
      <main>
        <Hero />
      </main>
    </>
  );
}
