/**
 * swap the phone's screen texture.
 *
 *   node scripts/swap-screen.mjs <in.glb> <new-screen.png> <out.glb> [--flip] [--no-flop] [--gloss] [--roughness=N]
 *
 * texture `111` is the screen, 1320x2868, bound to BOTH baseColor and
 * emissive — the emissive is why it reads as lit. setting the image on the
 * texture updates both slots, because they are the same texture object.
 *
 * q95 webp to match the colour textures in optimize-model.mjs. the rest of
 * the glb is left exactly as it is: this runs on the already-optimized file.
 */
import { NodeIO } from '@gltf-transform/core';
import { prune, dedup, draco } from '@gltf-transform/functions';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const args = process.argv.slice(2);
const flags = args.filter((a) => a.startsWith('--'));
const [input, screen, output] = args.filter((a) => !a.startsWith('--'));
// this model's screen UVs are mirrored horizontally, so the texture needs a
// flop to read correctly. --flip is the vertical axis, needed by neither
// image so far but kept because a replacement may be authored either way.
const flop = !flags.includes('--no-flop');
const flip = flags.includes('--flip');
// the OLED material ships emissiveStrength 10 and roughness 0.06: a 10x
// emitter blows colour out to white and that roughness is a mirror.
// --gloss keeps both as the model shipped them.
const matte = !flags.includes('--gloss');
// roughness is the only glass knob. 0 mirrors the room, 1 is chalk. 0.4 reads
// as a sealed pane — a wide soft highlight, nothing legible reflected in it.
// ponytail: one number tuned by eye, like the phone's angles. a real glass
// layer (KHR_materials_transmission over the screen) only if 'not reflective
// at all' ever stops meaning this.
const roughness = Number(flags.find((f) => f.startsWith('--roughness='))?.split('=')[1] ?? 0.4);
if (!(roughness >= 0 && roughness <= 1)) throw new Error('--roughness must be 0..1');
if (!input || !screen || !output) {
  console.error('usage: node scripts/swap-screen.mjs <in.glb> <screen.png> <out.glb>');
  process.exit(1);
}

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  });

const doc = await io.read(input);
const tex = doc.getRoot().listTextures().find((t) => t.getName() === '111');
if (!tex) throw new Error('texture `111` not found — has the model changed?');

const before = tex.getImage().byteLength;
const meta = await sharp(screen).metadata();
const target = { w: 1320, h: 2868 };
const ratio = meta.height / meta.width;
if (Math.abs(ratio - target.h / target.w) > 0.02) {
  throw new Error(`need a 1:2.17 portrait image, got ${meta.width}x${meta.height} (1:${ratio.toFixed(2)})`);
}

const out = await sharp(screen)
  .resize(target.w, target.h, { fit: 'fill' })
  .flip(flip)
  .flop(flop)
  .webp({ quality: 95, effort: 6, alphaQuality: 100 })
  .toBuffer();

tex.setImage(out).setMimeType('image/webp');

if (matte) {
  for (const mat of doc.getRoot().listMaterials()) {
    if (mat.getBaseColorTexture() !== tex && mat.getEmissiveTexture() !== tex) continue;
    // emissiveStrength 10 is what washes the colour out. 1 shows the texture
    // as authored and still reads as lit, because emissive is still bound.
    mat.getExtension('KHR_materials_emissive_strength')?.setEmissiveStrength(1);
    mat.setRoughnessFactor(roughness).setMetallicFactor(0);
    console.log(`screen: ${mat.getName()} emissiveStrength -> 1, roughness -> ${roughness}`);
  }
}

// both slots point at this one texture — confirm, so a model change that
// splits them does not silently swap only half the screen.
const slots = doc.getRoot().listMaterials().flatMap((m) => [
  m.getBaseColorTexture() === tex && 'baseColor',
  m.getEmissiveTexture() === tex && 'emissive',
].filter(Boolean));
console.log(`slots updated: ${slots.join(', ') || 'NONE — check the model'}`);

// read+rewrite re-expands data that optimize-model.mjs had merged: without
// these the file gains ~0.75MB and 65 accessors. prune/dedup drop unused and
// duplicate data only; draco re-encodes the geometry it decoded on read.
await doc.transform(prune(), dedup(), draco({ method: 'edgebreaker' }));
await io.write(output, doc);
console.log(`screen ${meta.width}x${meta.height} -> ${target.w}x${target.h} q95  ${(before/1048576).toFixed(2)}MB -> ${(out.byteLength/1048576).toFixed(2)}MB`);
