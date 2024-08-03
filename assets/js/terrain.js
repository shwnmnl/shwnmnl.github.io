// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create terrains
const geometry = new THREE.PlaneGeometry(600, 200, 64, 64);

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

// function modifyVertices(geometry) {
//     for (let i = 0; i < geometry.attributes.position.count; i++) {
//         const vertex = new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i);
//         const noiseValue = simplex.noise2D(vertex.x / 100, vertex.y / 100) * 10; // Adjust scale and amplitude as needed
//         vertex.z = noiseValue;
//         geometry.attributes.position.setXYZ(i, vertex.x, vertex.y, vertex.z);
//     }
//     geometry.attributes.position.needsUpdate = true;
// }

modifyVertices(geometry);
modifyVertices(geometry2);

terrain1.rotation.x = -Math.PI / 2;
terrain2.rotation.x = -Math.PI / 2;

terrain1.position.z = 0;
terrain2.position.z = -150;

scene.add(terrain1);
scene.add(terrain2);

// Lower the camera's position to move the horizon line lower
camera.position.set(0, 10, 50); // Adjust the Y position as needed
camera.lookAt(new THREE.Vector3(0, 6, 0));

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

//     function createStars() {
//     const starGeometry = new THREE.BufferGeometry();
//     const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

//     const starCount = 1000;
//     const starVertices = [];

//     for (let i = 0; i < starCount; i++) {
//         const x = Math.random() * 600 - 400; // Spread stars across width
//         const y = Math.random() * 100 + 20;  // Position stars above the terrain
//         const z = Math.random() * 400 - 200; // Spread stars across depth
//         starVertices.push(x, y, z);
//     }

//     starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
//     const stars = new THREE.Points(starGeometry, starMaterial);
//     scene.add(stars);
// }
// createStars();

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Move the terrains backwards
    terrain1.position.z += 0.3;
    terrain2.position.z += 0.3;

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
