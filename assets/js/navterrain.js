// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 100, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, 100);
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.nav').appendChild(renderer.domElement).classList.add('nav-canvas');
});

// Create terrains
const geometry = new THREE.PlaneGeometry(800, 200, 64, 64);

// Define gradient colors
const colorStart = new THREE.Color(0x793079); // Purple
const colorEnd = new THREE.Color(0x480f7a);   // Pink

// Function to apply vertex colors for gradient
function applyGradientColors(geometry, reverse = false, colorStart, colorEnd) {
    const colors = [];
    for (let i = 0; i < geometry.attributes.position.count; i++) {
        const y = geometry.attributes.position.getY(i);
        const t = reverse ? (100 - (y + 100) / 2) / 100 : (y + 100) / 200; // Normalize y to range [0, 1] and reverse if needed
        const color = new THREE.Color();
        color.lerpColors(colorStart, colorEnd, t); // Interpolate between start and end colors
        colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}

// Apply gradient colors
applyGradientColors(geometry, false, colorStart, colorEnd);

const geometry2 = geometry.clone();
applyGradientColors(geometry2, true, colorStart, colorEnd); // Reverse gradient for the second terrain

// Wireframe material with vertex colors
const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
    wireframe: true
});

const terrain1 = new THREE.Mesh(geometry, material);
const terrain2 = new THREE.Mesh(geometry2, material);

// Modify vertices to create bumps and valleys
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

terrain1.rotation.x = -Math.PI / 2;
terrain2.rotation.x = -Math.PI / 2;

terrain1.position.z = 0;
terrain2.position.z = -150;

scene.add(terrain1);
scene.add(terrain2);

// Lower the camera's position to move the horizon line lower
camera.position.set(0, 12, 0); // Adjust the Y position as needed
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    renderer.setSize(width, 100);
    camera.aspect = width / 100;
    camera.updateProjectionMatrix();
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Move the terrains backwards
    terrain1.position.z += 0.1;
    terrain2.position.z += 0.1;

    // Reset position to create an endless effect
    if (terrain1.position.z >= 190) {
        terrain1.position.z = terrain2.position.z - 190;
    }
    if (terrain2.position.z >= 190) {
        terrain2.position.z = terrain1.position.z - 190;
    }

    renderer.render(scene, camera);
}

animate();

document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    navToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
});