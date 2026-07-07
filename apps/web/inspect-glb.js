const fs = require('fs');

async function inspectGLB() {
  // Since we are in node, we can just parse the GLTF JSON chunk
  const buffer = fs.readFileSync('./public/models/rigged_female_fashion_character_in_ruffle_dress.glb');
  
  // Parse GLB header
  const magic = buffer.toString('utf8', 0, 4);
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);
  
  // Parse Chunk 0 (JSON)
  const chunk0Length = buffer.readUInt32LE(12);
  const chunk0Type = buffer.toString('utf8', 16, 20);
  
  if (chunk0Type !== 'JSON') {
    console.error('First chunk is not JSON');
    return;
  }
  
  const jsonStr = buffer.toString('utf8', 20, 20 + chunk0Length);
  const json = JSON.parse(jsonStr);
  
  // Print all nodes that have a mesh
  console.log('\nMeshes found in nodes:');
  for (let i = 0; i < json.nodes.length; i++) {
    const n = json.nodes[i];
    if (n.mesh !== undefined) {
      console.log(`Node ${i} "${n.name}": uses mesh ${n.mesh}, translation: ${n.translation || '[0,0,0]'}, scale: ${n.scale || '[1,1,1]'}`);
    }
  }
}

inspectGLB();
