import SceneMount from "@/components/SceneMount";
import Hero from "@/sections/Hero";

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
      </main>
    </>
  );
}
