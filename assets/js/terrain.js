// === Original Terrain Code ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('threejs-container').appendChild(renderer.domElement);

// Terrain setup...
const geometry = new THREE.PlaneGeometry(600, 200, 64, 64);
const colorStart = new THREE.Color(0x793079);
const colorEnd = new THREE.Color(0x480f7a);

function applyGradientColors(geometry, reverse = false, colorStart, colorEnd) {
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

const material = new THREE.MeshBasicMaterial({ vertexColors: true, wireframe: true });
const terrain1 = new THREE.Mesh(geometry, material);
const terrain2 = new THREE.Mesh(geometry2, material);

function modifyVertices(geometry) {
    for (let i = 0; i < geometry.attributes.position.count; i++) {
        const vertex = new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i);
        vertex.z = Math.random() * 5;
        geometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geometry.attributes.position.needsUpdate = true;
}
modifyVertices(geometry);
modifyVertices(geometry2);

terrain1.rotation.x = terrain2.rotation.x = -Math.PI / 2;
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

// === COMET Trail Logic (Minimal Additions) ===
const cometStart = new THREE.Vector3(100, 60, 0);  // start of comet trail
const cometEnd = new THREE.Vector3(0, 10, 0); 
let emitterPosition = cometStart.clone();
const targetPosition = new THREE.Vector3(0, 10, 0);
let trailParticles = [];
let triggered = false;
let hasExploded = false;
let startTime = null;
let hue = 180;

const flash = document.getElementById('flash');

function triggerTransition() {
    if (triggered) return;
    triggered = true;
    startTime = performance.now();
}

window.addEventListener('click', triggerTransition);
window.addEventListener('scroll', triggerTransition);
setTimeout(triggerTransition, 8000);

function emitTrail() {
    const geo = new THREE.SphereGeometry(0.25, 8, 8);
    const color = new THREE.Color(`hsl(${hue}, 100%, 60%)`);
    hue = (hue + 2) % 360;

    const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
    const particle = new THREE.Mesh(geo, mat);
    const offset = () => (Math.random() - 0.5) * 1.5;

    particle.position.set(
        emitterPosition.x + offset(),
        emitterPosition.y + offset(),
        emitterPosition.z + offset()
    );

    scene.add(particle);
    trailParticles.push({ mesh: particle, life: 1 });
}

function explodeAndNavigate() {
    if (hasExploded) return;
    hasExploded = true;
    if (flash) flash.style.opacity = 1;
    setTimeout(() => window.location.href = "/projects.html", 800);
}

// === Unified Animation Loop ===
function animate(timestamp) {
    requestAnimationFrame(animate);

    // Terrain scroll
    terrain1.position.z += 0.3;
    terrain2.position.z += 0.3;
    if (terrain1.position.z >= 190) terrain1.position.z = terrain2.position.z - 190;
    if (terrain2.position.z >= 190) terrain2.position.z = terrain1.position.z - 190;

    // Comet movement
    if (triggered && startTime !== null) {
        const t = Math.min((timestamp - startTime) / 3000, 1);
        emitterPosition.lerpVectors(cometStart, cometEnd, t);
        emitTrail();
        if (t >= 1) {
            explodeAndNavigate();
            startTime = null;
        }
    }

    // Fade and shrink old particles
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.life -= 0.02;
        p.mesh.material.opacity = p.life;
        p.mesh.scale.setScalar(p.life + 0.5);
        if (p.life <= 0) {
            scene.remove(p.mesh);
            trailParticles.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}
animate();
