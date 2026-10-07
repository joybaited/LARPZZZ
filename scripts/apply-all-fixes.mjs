import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, draco } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import draco3d from 'draco3dgltf';
import fs from 'fs';
import path from 'path';

async function main() {
  await MeshoptEncoder.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  io.registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule(),
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  });

  // Start always from pristine HEAD model to ensure 100% clean, reproducible transforms
  const headModelPath = 'C:/Users/SREE HARI/.gemini/antigravity-ide/brain/9d981c4b-f987-43d0-926b-b449b804de33/scratch/head-iphone.glb';
  const outPath = path.resolve('public/models/iphone.glb');
  const doc = await io.read(headModelPath);
  const root = doc.getRoot();

  console.log('--- 1. BUILDING SOLID DYNAMIC ISLAND (OPTION 2) ---');
  // Find Dynamic Island 52-vertex loop on Object_18 (OLED)
  const m18 = root.listMeshes().find(m => m.getName() === 'Object_18');
  const p18 = m18.listPrimitives()[0];
  const pos18 = p18.getAttribute('POSITION');
  const idx18 = p18.getIndices();

  const edgeCount = new Map();
  for (let i = 0; i < idx18.getCount(); i += 3) {
    const a = idx18.getScalar(i);
    const b = idx18.getScalar(i + 1);
    const c = idx18.getScalar(i + 2);
    for (const [v0, v1] of [[a, b], [b, c], [c, a]]) {
      const k = v0 < v1 ? v0 + '_' + v1 : v1 + '_' + v0;
      edgeCount.set(k, (edgeCount.get(k) || 0) + 1);
    }
  }

  const adj = new Map();
  for (const [k, count] of edgeCount.entries()) {
    if (count === 1) {
      const [u, v] = k.split('_').map(Number);
      if (!adj.has(u)) adj.set(u, []);
      if (!adj.has(v)) adj.set(v, []);
      adj.get(u).push(v);
      adj.get(v).push(u);
    }
  }

  const visited = new Set();
  const loops18 = [];
  for (const start of adj.keys()) {
    if (visited.has(start)) continue;
    const loop = [];
    let curr = start;
    let prev = -1;
    while (curr !== undefined && !visited.has(curr)) {
      visited.add(curr);
      loop.push(curr);
      const next = (adj.get(curr) || []).find(n => n !== prev && !visited.has(n));
      prev = curr;
      curr = next;
    }
    loops18.push(loop);
  }

  const islandLoop = loops18.find(l => l.length === 52);
  let avgX = 0, avgY = 0, avgZ = 0;
  for (const v of islandLoop) {
    const el = pos18.getElement(v, []);
    avgX += el[0]; avgY += el[1]; avgZ += el[2];
  }
  avgX /= islandLoop.length; avgY /= islandLoop.length; avgZ /= islandLoop.length;
  const center = [avgX, avgY, avgZ];

  const islandPositions = [center];
  const islandNormals = [[0, 1, 0]];
  for (let i = 0; i < islandLoop.length; i++) {
    islandPositions.push(pos18.getElement(islandLoop[i], []));
    islandNormals.push([0, 1, 0]);
  }
  const islandIndices = [];
  for (let i = 0; i < islandLoop.length; i++) {
    islandIndices.push(0, ((i + 1) % islandLoop.length) + 1, i + 1);
  }

  const m17 = root.listMeshes().find(m => m.getName() === 'Object_17');
  const p17 = m17.listPrimitives()[0];
  const posAcc = doc.createAccessor().setType('VEC3').setArray(new Float32Array(islandPositions.flat()));
  const normAcc = doc.createAccessor().setType('VEC3').setArray(new Float32Array(islandNormals.flat()));
  const idxAcc = doc.createAccessor().setType('SCALAR').setArray(new Uint16Array(islandIndices));

  p17.setAttribute('POSITION', posAcc);
  p17.setAttribute('NORMAL', normAcc);
  p17.setIndices(idxAcc);
  console.log(`Solid island built: ${islandPositions.length} verts, ${islandIndices.length / 3} tris`);

  console.log('\n--- 2. ELIMINATING THE EDGE GAP (PERFECT BEZEL MATING & UNDERLAP) ---');
  // Object_15 (Display_Frame):
  // Inner rim (134 verts) mates 1:1 with OLED outer edge -> 1.0x (ZERO gap!)
  // Outer rim (142 verts) extends 1.007x under chassis opening -> ZERO light leak!
  const m15 = root.listMeshes().find(m => m.getName() === 'Object_15');
  const p15 = m15.listPrimitives()[0];
  const pos15 = p15.getAttribute('POSITION');
  const idx15 = p15.getIndices();

  const edgeCount15 = new Map();
  for (let i = 0; i < idx15.getCount(); i += 3) {
    const a = idx15.getScalar(i);
    const b = idx15.getScalar(i + 1);
    const c = idx15.getScalar(i + 2);
    for (const [v0, v1] of [[a, b], [b, c], [c, a]]) {
      const k = v0 < v1 ? v0 + '_' + v1 : v1 + '_' + v0;
      edgeCount15.set(k, (edgeCount15.get(k) || 0) + 1);
    }
  }

  const adj15 = new Map();
  for (const [k, count] of edgeCount15.entries()) {
    if (count === 1) {
      const [u, v] = k.split('_').map(Number);
      if (!adj15.has(u)) adj15.set(u, []);
      if (!adj15.has(v)) adj15.set(v, []);
      adj15.get(u).push(v);
      adj15.get(v).push(u);
    }
  }

  const visited15 = new Set();
  const loops15 = [];
  for (const start of adj15.keys()) {
    if (visited15.has(start)) continue;
    const loop = [];
    let curr = start;
    let prev = -1;
    while (curr !== undefined && !visited15.has(curr)) {
      visited15.add(curr);
      loop.push(curr);
      const next = (adj15.get(curr) || []).find(n => n !== prev && !visited15.has(n));
      prev = curr;
      curr = next;
    }
    loops15.push(loop);
  }

  const outerLoop15 = loops15.find(l => l.length === 142);
  const innerLoop15 = loops15.find(l => l.length === 134);

  if (outerLoop15) {
    for (const idx of outerLoop15) {
      const p = pos15.getElement(idx, []);
      pos15.setElement(idx, [p[0] * 1.007, p[1], p[2] * 1.007]);
    }
    console.log(`Scaled outer rim (${outerLoop15.length} verts) by 1.007x for chassis seal`);
  }
  console.log(`Inner rim (${innerLoop15?.length} verts) kept at 1.0x for seamless 0.00mm screen mate`);

  console.log('\n--- 3. UNIFIED FLUSH DEPTH ALIGNMENT ---');
  // Move Display_Frame (Object_20), OLED_off (Object_22), OLED (Object_23) together
  // All at [0, -0.00075, 0], scale [1, 1, 1]
  const node20 = root.listNodes().find(n => n.getName() === 'Object_20');
  const node22 = root.listNodes().find(n => n.getName() === 'Object_22');
  const node23 = root.listNodes().find(n => n.getName() === 'Object_23');
  const node21 = root.listNodes().find(n => n.getName() === 'Object_21');

  if (node20) {
    node20.setScale([1, 1, 1]);
    node20.setTranslation([0, -0.00075, 0]);
  }
  if (node22) {
    node22.setScale([1, 1, 1]);
    node22.setTranslation([0, -0.00075, 0]);
  }
  if (node23) {
    node23.setScale([1, 1, 1]);
    node23.setTranslation([0, -0.00075, 0]);
  }
  if (node21) {
    // Hide redundant Glass mesh so it does not cause refractive double edges
    node21.setScale([0, 0, 0]);
  }

  console.log('\n--- 4. MATERIALS CALIBRATION ---');
  // OLED_off: solid pitch black, matte roughness 0.40
  let oledOffMat = root.listMaterials().find(m => m.getName() === 'OLED_off');
  if (!oledOffMat) oledOffMat = doc.createMaterial('OLED_off');
  oledOffMat.setBaseColorFactor([0, 0, 0, 1]);
  oledOffMat.setRoughnessFactor(0.40);
  oledOffMat.setMetallicFactor(0);
  p17.setMaterial(oledOffMat);

  // Display_Frame: solid black, matte roughness 0.40
  const dfMat = root.listMaterials().find(m => m.getName() === 'Display_Frame');
  if (dfMat) {
    dfMat.setBaseColorFactor([0, 0, 0, 1]);
    dfMat.setRoughnessFactor(0.40);
    dfMat.setMetallicFactor(0);
  }

  // OLED: roughness 0.40 (matte, zero city reflections)
  const oledMat = root.listMaterials().find(m => m.getName() === 'OLED');
  if (oledMat) {
    oledMat.setRoughnessFactor(0.40);
  }

  // Anodized_aluminum: satin finish roughness 0.25
  const alumMat = root.listMaterials().find(m => m.getName() === 'Anodized_aluminum');
  if (alumMat) {
    alumMat.setBaseColorFactor([0.016509, 0.016509, 0.016509, 1]);
    alumMat.setRoughnessFactor(0.25);
  }

  // Camera internal optics blacked out
  const cameraMats = ['Camera_Lens', 'Camera_filter', 'Camera_sapphire_miror', 'Camera_mirror_filter'];
  for (const name of cameraMats) {
    const mat = root.listMaterials().find(m => m.getName() === name);
    if (mat) {
      mat.setBaseColorFactor([0, 0, 0, 1]);
      mat.setRoughnessFactor(1.0);
      mat.setMetallicFactor(0);
    }
  }

  await doc.transform(
    prune(),
    dedup(),
    draco({ method: 'edgebreaker' })
  );

  const outBuffer = await io.writeBinary(doc);
  fs.writeFileSync(outPath, Buffer.from(outBuffer));
  console.log(`\nSuccessfully written clean master model to ${outPath} (${outBuffer.byteLength} bytes)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
