const fs = require('fs');

const data = fs.readFileSync('./public/models/fashion-lady.glb');
const str = data.toString('utf-8', 0, 1000);
if (str.includes('KHR_draco_mesh_compression')) {
  console.log('Uses DRACO compression!');
} else {
  console.log('No DRACO compression found in first 1000 bytes.');
}
