// assets/js/terrain.js

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const container = document.getElementById('threejs-container');
if (container) {
  container.appendChild(renderer.domElement);
}

const geometry = new THREE.PlaneGeometry(600, 200, 64, 64);
const colorStart = new THREE.Color(0x793079);
const colorEnd = new THREE.Color(0x480f7a);

function applyGradientColors(geometry, reverse, colorStart, colorEnd) {
  const colors = [];
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const y = geometry.attributes.position.getY(i);
    const t = reverse ? (100 - (y + 100) / 2) / 100 : (y + 100) / 200;
    const color = new THREE.Color().lerpColors(colorStart, colorEnd, t);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}

applyGradientColors(geometry, false, colorStart, colorEnd);
const geometry2 = geometry.clone();
applyGradientColors(geometry2, true, colorStart, colorEnd);

const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
  wireframe: true,
});

const terrain1 = new THREE.Mesh(geometry, material);
const terrain2 = new THREE.Mesh(geometry2, material);

function modifyVertices(geometry) {
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const vertex = new THREE.Vector3().fromBufferAttribute(
      geometry.attributes.position,
      i
    );
    vertex.z = Math.random() * 5;
    geometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  geometry.attributes.position.needsUpdate = true;
}

modifyVertices(geometry);
modifyVertices(geometry2);

terrain1.rotation.x = -Math.PI / 2;
terrain2.rotation.x = -Math.PI / 2;
terrain1.position.z = 0;
terrain2.position.z = -150;
scene.add(terrain1, terrain2);

camera.position.set(0, 10, 50);
camera.lookAt(new THREE.Vector3(0, 6, 0));

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

function animate() {
  requestAnimationFrame(animate);

  // Terrain loop
  terrain1.position.z += 0.3;
  terrain2.position.z += 0.3;
  if (terrain1.position.z >= 190) terrain1.position.z = terrain2.position.z - 190;
  if (terrain2.position.z >= 190) terrain2.position.z = terrain1.position.z - 190;

  renderer.render(scene, camera);
}
animate();
