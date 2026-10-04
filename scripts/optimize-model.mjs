
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, resample, draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import sharp from 'sharp';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  });

const doc = await io.read(process.argv[2]);
await doc.transform(prune(), dedup(), resample());

// classify each texture by the slot it is actually used in
const root = doc.getRoot();
for (const tex of root.listTextures()) {
  const slots = new Set();
  for (const mat of root.listMaterials()) {
    if (mat.getBaseColorTexture?.() === tex) slots.add('base');
    if (mat.getEmissiveTexture?.() === tex) slots.add('emissive');
    if (mat.getNormalTexture?.() === tex) slots.add('normal');
    if (mat.getMetallicRoughnessTexture?.() === tex) slots.add('mr');
    if (mat.getOcclusionTexture?.() === tex) slots.add('occl');
  }
  const isColour = slots.has('base') || slots.has('emissive');
  const img = tex.getImage();
  if (!img) continue;

  let pipe = sharp(Buffer.from(img));
  const meta = await pipe.metadata();
  // colour the eye reads: keep resolution, near-lossless.
  // normal/spec maps: half resolution, lower quality - the eye cannot see it.
  const cap = isColour ? 2048 : 1024;
  const w = Math.min(meta.width, cap);
  const h = Math.round(meta.height * (w / meta.width));
  const quality = isColour ? 95 : 82;

  const out = await sharp(Buffer.from(img))
    .resize(w, h, { fit: 'fill' })
    .webp({ quality, effort: 6, alphaQuality: 100 })
    .toBuffer();

  tex.setImage(out).setMimeType('image/webp');
  const name = (tex.getName() || '?').padEnd(30);
  console.log(`${name} ${[...slots].join(',').padEnd(10)} ${meta.width}x${meta.height} -> ${w}x${h} q${quality}  ${(img.byteLength/1048576).toFixed(2)}MB -> ${(out.byteLength/1048576).toFixed(2)}MB`);
}

await doc.transform(draco({ method: 'edgebreaker' }));
await io.write(process.argv[3], doc);
console.log('done');
