const SimplexNoise = (function () {
    function Grad(x, y, z) { this.x = x; this.y = y; this.z = z; }
    Grad.prototype.dot2 = function (x, y) { return this.x * x + this.y * y; };
    var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
    new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
    new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
    var p = []; for (var i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
    var perm = new Array(512); var gradP = new Array(512);
    for (var i = 0; i < 512; i++) { perm[i] = p[i & 255]; gradP[i] = grad3[perm[i] % 12]; }
    return {
        noise: function (xin, yin) {
            var n0, n1, n2; var F2 = 0.5 * (Math.sqrt(3.0) - 1.0); var s = (xin + yin) * F2; var i = Math.floor(xin + s); var j = Math.floor(yin + s);
            var G2 = (3.0 - Math.sqrt(3.0)) / 6.0; var t = (i + j) * G2; var X0 = i - t; var Y0 = j - t; var x0 = xin - X0; var y0 = yin - Y0;
            var i1, j1; if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
            var x1 = x0 - i1 + G2; var y1 = y0 - j1 + G2; var x2 = x0 - 1.0 + 2.0 * G2; var y2 = y0 - 1.0 + 2.0 * G2;
            var ii = i & 255; var jj = j & 255; var gi0 = gradP[ii + perm[jj]]; var gi1 = gradP[ii + i1 + perm[jj + j1]]; var gi2 = gradP[ii + 1 + perm[jj + 1]];
            var t0 = 0.5 - x0 * x0 - y0 * y0; if (t0 < 0) n0 = 0.0; else { t0 *= t0; n0 = t0 * t0 * gi0.dot2(x0, y0); }
            var t1 = 0.5 - x1 * x1 - y1 * y1; if (t1 < 0) n1 = 0.0; else { t1 *= t1; n1 = t1 * t1 * gi1.dot2(x1, y1); }
            var t2 = 0.5 - x2 * x2 - y2 * y2; if (t2 < 0) n2 = 0.0; else { t2 *= t2; n2 = t2 * t2 * gi2.dot2(x2, y2); }
            return 70.0 * (n0 + n1 + n2);
        }
    };
})();

SKHY_UTILS.injectLoadingOverlay("Initializing Simulator", "Loading Rover Edge Environment...");
SKHY_UTILS.startLoading(() => {
    console.log("Simulator Ready");
});

// --- CONFIG LOGIC ---
let config = {
    rfWatts: 10,
    jamRange: 50,
    jamSpeed: 1,
    rfDrain: 0.08,
    avoidRadius: 12,
    idleDrain: 0.005,
    nodeType: 'skhy_resilient'
};

const edgeData = {
    'skhy_light': {
        desc: "Architecture: NVIDIA Maxwell + Xilinx Zynq<br>AI Performance: <span class='highlight'>0.5 TOPS</span> (Enhanced Vision)<br>Capabilities: Spectrum Awareness, Freq Hopping<br>Power: 5V DC (High Efficiency)",
        radius: 18, idleDrain: 0.003, name: "SKHY LIGHT", color: 0x00aaff, scale: 0.8, lightColor: 0x00aaff
    },
    'skhy_resilient': {
        desc: "Architecture: NVIDIA Ampere + Xilinx Zynq<br>AI Performance: <span class='highlight'>67 TOPS</span> (Superior Vision)<br>Capabilities: Anti-Jamming GNSS, Spectrum Awareness<br>Power: 12V DC (High Consumption)",
        radius: 28, idleDrain: 0.012, name: "SKHY RESILIENT", color: 0xffaa00, scale: 1.2, lightColor: 0xffaa00
    }
};

const rfSelect = document.getElementById('rf-select');
const rfSpecs = document.getElementById('rf-specs');
const relaySelect = document.getElementById('relay-select');
const edgeSelect = document.getElementById('edge-select');
const edgeSpecs = document.getElementById('edge-specs');

rfSelect.addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    if (val === 5) { rfSpecs.innerHTML = "Effective Radius: 40m<br>Battery Impact: Low"; }
    else if (val === 10) { rfSpecs.innerHTML = "Effective Radius: 50m<br>Battery Impact: Moderate"; }
    else if (val === 20) { rfSpecs.innerHTML = "Effective Radius: 70m<br>Battery Impact: High"; }
    else if (val === 50) { rfSpecs.innerHTML = "Effective Radius: 150m<br>Battery Impact: Very High"; }
    else { rfSpecs.innerHTML = "Effective Radius: 300m<br>Battery Impact: <span style='color:red'>CRITICAL</span>"; }
});

edgeSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    edgeSpecs.innerHTML = edgeData[val].desc;

    // Notify Parent React App
    const productIds = {
        'skhy_resilient': 900009,
        'skhy_light': 900010
    };
    SKHY_UTILS.notifyParentSelection('skhy-rover', productIds[val] || 900009, edgeData[val].name);
});

// Initialize parent with default selection
window.addEventListener('load', () => {
    const val = edgeSelect.value;
    const productIds = {
        'skhy_resilient': 900009,
        'skhy_light': 900010
    };
    SKHY_UTILS.notifyParentSelection('skhy-rover', productIds[val] || 900009, edgeData[val].name);
});


// --- 1. SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a25);
scene.fog = new THREE.FogExp2(0x1a1a25, 0.005);

const frustumSize = 100;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    1, 1000
);
camera.position.set(50, 50, 50);
camera.lookAt(0, 0, 0);

// --- FPV CAMERA SETUP ---
const fpvCamera = new THREE.PerspectiveCamera(75, 320 / 240, 0.1, 500);
// Positioned relative to rover later when attached

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
dirLight.position.set(50, 80, -50);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.bias = -0.0001;
dirLight.shadow.camera.left = -100;
dirLight.shadow.camera.right = 100;
dirLight.shadow.camera.top = 100;
dirLight.shadow.camera.bottom = -100;
scene.add(dirLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);

// --- 3. TERRAIN ---
const worldWidth = 200;
const worldDepth = 200;

function createGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dark soil/base
    ctx.fillStyle = '#050805';
    ctx.fillRect(0, 0, 512, 512);

    // Grass Blades / Texture
    for (let i = 0; i < 120000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;

        // Varied greens, mostly dark, some highlights
        const g = Math.floor(Math.random() * 100 + 40);
        const r = Math.floor(Math.random() * 40);
        const b = Math.floor(Math.random() * 40);

        ctx.fillStyle = `rgba(${r},${g},${b}, 0.7)`;

        // Small noise specs
        ctx.fillRect(x, y, 1.5, 1.5);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20); // High frequency tiling for grass detail
    return tex;
}

const groundGeo = new THREE.PlaneGeometry(worldWidth, worldDepth, 128, 128);
const posAttribute = groundGeo.attributes.position;
for (let i = 0; i < posAttribute.count; i++) {
    const x = posAttribute.getX(i);
    const y = posAttribute.getY(i);
    const z = SimplexNoise.noise(x * 0.01, y * 0.01) * 2.5 + SimplexNoise.noise(x * 0.03, y * 0.03) * 0.5;
    posAttribute.setZ(i, z);
}
groundGeo.computeVertexNormals();

// Updated Material to show grass texture
const groundMat = new THREE.MeshStandardMaterial({
    map: createGroundTexture(),
    roughness: 1.0,
    metalness: 0.0,
    color: 0xaaaaaa // Neutral tint to allow texture colors to show
});

const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const raycaster = new THREE.Raycaster();
const downVec = new THREE.Vector3(0, -1, 0);

function getTerrainHeight(x, z) {
    raycaster.set(new THREE.Vector3(x, 50, z), downVec);
    const intersects = raycaster.intersectObject(ground);
    if (intersects.length > 0) return intersects[0].point.y;
    return 0;
}

// --- 4. ZONES ---
const dangerZones = [];
const safeZones = []; // Array to track safe zones for drone spawning
const rfObsMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
const safeObsMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.15, side: THREE.DoubleSide });

function createZone(x, z, type) {
    const radius = 15;
    const geo = new THREE.CylinderGeometry(radius, radius, 10, 32, 1, true);
    const mat = type === 'danger' ? rfObsMat : safeObsMat;
    const mesh = new THREE.Mesh(geo, mat);
    const h = getTerrainHeight(x, z);
    mesh.position.set(x, h + 5, z);
    scene.add(mesh);

    const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 32), new THREE.MeshBasicMaterial({ color: type === 'danger' ? 0xff0000 : 0x00ff00, transparent: true, opacity: 0.3 }));
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -4.8;
    mesh.add(disc);

    if (type === 'danger') {
        dangerZones.push({ position: new THREE.Vector3(x, 0, z), radius: radius + 5 });
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1, 8), new THREE.MeshStandardMaterial({ color: 0x330000 }));
        tower.position.set(x, h + 4, z);
        scene.add(tower);
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        beacon.position.y = 4;
        tower.add(beacon);
    } else {
        // Track safe zones
        safeZones.push({ position: new THREE.Vector3(x, 0, z), radius: radius });
    }
}

createZone(0, 0, 'danger');
createZone(-40, 40, 'danger');
createZone(40, -40, 'danger');
createZone(60, 20, 'danger');
createZone(-85, 85, 'safe');
createZone(85, -85, 'safe');

// --- 5. ROVER SETUP ---
const roverContainer = new THREE.Group();
const startX = -85; const startZ = 85;
roverContainer.position.set(startX, getTerrainHeight(startX, startZ) + 1, startZ);
roverContainer.rotation.y = Math.PI;
scene.add(roverContainer);

// Attach FPV Camera to Rover
fpvCamera.position.set(0, 2.8, 0.5); // On mast, slightly forward
fpvCamera.rotation.y = Math.PI; // Face forward relative to rover (rover faces -Z locally?)
// Note: rover logic moves along its local axes. If it faces 'backwards' we adjust here.
// Based on headlights logic: light target is (x, 0, 15). 
// Actually, THREE.SpotLight default points -Z. If target is +Z relative, it means forward is +Z.
// Camera default looks -Z. So we need rotation Y = Math.PI to look +Z.
roverContainer.add(fpvCamera);

function createTextTexture() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#444b44'; ctx.fillRect(0, 0, 512, 128);
    ctx.font = 'bold 60px "Courier New"'; ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SKHY ROVER', 256, 64);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.lineWidth = 4; ctx.strokeRect(10, 10, 492, 108);
    return new THREE.CanvasTexture(c);
}

const baseMat = new THREE.MeshStandardMaterial({ color: 0x444b44, roughness: 0.6, metalness: 0.5 });
const textMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.6, metalness: 0.5, map: createTextTexture() });
const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 6), [textMat, textMat, baseMat, baseMat, baseMat, baseMat]);
chassis.position.y = 1.2; chassis.castShadow = true;
roverContainer.add(chassis);

// SKHY EDGE DEVICE MESHES (Initialized Hidden, shown based on config)
const edgeGroup = new THREE.Group();
roverContainer.add(edgeGroup);

// Compute Module (Sleek box on back)
const computeMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.0), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 }));
computeMesh.position.set(0, 1.9, 2.0);
computeMesh.visible = false;
edgeGroup.add(computeMesh);
const computeLight = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
computeLight.position.set(0, 2.15, 2.0); computeMesh.add(computeLight);

// RF Modules (Antennas)
const rfSmall = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5), new THREE.MeshStandardMaterial({ color: 0x888888 }));
rfSmall.position.set(0, 2.0, -1.0); rfSmall.visible = false; edgeGroup.add(rfSmall);

const rfLarge = new THREE.Group();
const rfBase = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x222222 }));
rfBase.position.set(0, 1.8, -1.5);
const dish = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16, 0, Math.PI * 2, 0, 0.5), new THREE.MeshStandardMaterial({ color: 0xdddddd, side: THREE.DoubleSide }));
dish.rotation.x = -Math.PI / 2; dish.position.set(0, 2.5, -1.5);
rfLarge.add(rfBase); rfLarge.add(dish);
rfLarge.visible = false;
edgeGroup.add(rfLarge);

function createHeadlight(x) {
    const light = new THREE.SpotLight(0xffffee, 5, 80, Math.PI / 6, 0.5, 1);
    light.position.set(x, 1.2, 2.8);
    light.target.position.set(x, 0, 15);
    light.castShadow = true;
    roverContainer.add(light); roverContainer.add(light.target);
    const bulb = new THREE.Mesh(new THREE.CircleGeometry(0.3), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    bulb.position.set(x, 1.2, 3.01); roverContainer.add(bulb);
}
createHeadlight(1); createHeadlight(-1);

const wheels = [];
const wheelGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.8, 24);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
const treadGeo = new THREE.BoxGeometry(1.7, 0.1, 0.2);
const treadMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
const singleWheelGroup = new THREE.Group();
const coreWheel = new THREE.Mesh(wheelGeo, wheelMat);
coreWheel.rotation.z = Math.PI / 2; singleWheelGroup.add(coreWheel);
for (let i = 0; i < 8; i++) {
    const t = new THREE.Mesh(treadGeo, treadMat);
    t.position.set(0, Math.sin(i / 8 * Math.PI * 2) * 0.8, Math.cos(i / 8 * Math.PI * 2) * 0.8);
    t.lookAt(0, 0, 0); singleWheelGroup.add(t);
}
const wheelOffsets = [
    { x: 2.2, z: 2 }, { x: -2.2, z: 2 }, { x: 2.2, z: 0 }, { x: -2.2, z: 0 }, { x: 2.2, z: -2 }, { x: -2.2, z: -2 }
];
wheelOffsets.forEach(pos => {
    const wContainer = new THREE.Group();
    wContainer.position.set(pos.x, 0.8, pos.z);
    wContainer.add(singleWheelGroup.clone());
    const axle = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: 0x555555 }));
    axle.position.set(pos.x > 0 ? -0.5 : 0.5, 0, 0); wContainer.add(axle);
    roverContainer.add(wContainer);
    wheels.push({ container: wContainer, mesh: wContainer.children[0] });
});

const jammerGroup = new THREE.Group();
jammerGroup.position.set(0, 2.2, 0);
roverContainer.add(jammerGroup); // Attached to Rover

const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10, 0)]);
const laserMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0 });
const laser = new THREE.Line(laserGeo, laserMat);
laser.position.y = 0.6;
jammerGroup.add(laser);

// --- 6. OBSTACLES ---
const obstacles = [];
function createTree(x, z) {
    const h = getTerrainHeight(x, z);
    const tree = new THREE.Group();
    tree.position.set(x, h, z);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3), new THREE.MeshStandardMaterial({ color: 0x4d3827 }));
    trunk.position.y = 1.5; trunk.castShadow = true; tree.add(trunk);
    const folMat = new THREE.MeshStandardMaterial({ color: 0x334433, flatShading: true });
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(2, 4, 6), folMat); c1.position.y = 3.5; tree.add(c1);
    const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 6), folMat); c2.position.y = 5.0; tree.add(c2);
    scene.add(tree);
    obstacles.push({ position: new THREE.Vector3(x, 0, z), radius: 3 });
}
for (let i = 0; i < 12; i++) {
    const tx = (Math.random() - 0.5) * 180;
    const tz = (Math.random() - 0.5) * 180;
    if (Math.abs(tx + 85) > 15 || Math.abs(tz - 85) > 15) {
        if (Math.abs(tx - 85) > 15 || Math.abs(tz + 85) > 15) createTree(tx, tz);
    }
}

// --- 7. DRONES ---
const drones = [];
function createDrone() {
    const dGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 1.2), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    dGroup.add(body);
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const a1 = new THREE.Mesh(armGeo, armMat); a1.rotation.z = Math.PI / 2; a1.rotation.y = Math.PI / 4; dGroup.add(a1);
    const a2 = new THREE.Mesh(armGeo, armMat); a2.rotation.z = Math.PI / 2; a2.rotation.y = -Math.PI / 4; dGroup.add(a2);
    const rotorGeo = new THREE.BoxGeometry(1.2, 0.02, 0.1);
    const rotorMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    const rotors = [];
    [{ x: 0.9, z: 0.9 }, { x: -0.9, z: 0.9 }, { x: 0.9, z: -0.9 }, { x: -0.9, z: -0.9 }].forEach(pos => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2), armMat); m.position.set(pos.x, 0.15, pos.z); dGroup.add(m);
        const r = new THREE.Mesh(rotorGeo, rotorMat); r.position.set(pos.x, 0.3, pos.z); dGroup.add(r); rotors.push(r);
    });
    const dl = new THREE.SpotLight(0x00ff00, 2, 40, 0.5, 0.5, 1);
    dl.position.set(0, -0.2, 0); dl.target.position.set(0, -10, 0); dGroup.add(dl); dGroup.add(dl.target);
    return { mesh: dGroup, rotors: rotors, light: dl };
}

for (let i = 0; i < 6; i++) {
    const dObj = createDrone();
    let sx, sz, valid;
    let attempts = 0;

    // Spawn drones specifically inside safe green circles
    do {
        valid = true;
        // Pick a random safe zone
        const zone = safeZones[Math.floor(Math.random() * safeZones.length)];

        // Random point within circle
        const r = zone.radius * Math.sqrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;

        sx = zone.position.x + r * Math.cos(theta);
        sz = zone.position.z + r * Math.sin(theta);

        // Don't spawn directly on top of the player at the start (give 15m buffer from start pos)
        if (new THREE.Vector3(sx, 0, sz).distanceTo(new THREE.Vector3(-85, 0, 85)) < 15) {
            valid = false;
        }
        attempts++;
    } while (!valid && attempts < 50);

    dObj.mesh.position.set(sx, 25, sz);
    scene.add(dObj.mesh);
    drones.push({
        ...dObj,
        velocity: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize().multiplyScalar(0.25),
        heightOffset: 25, state: 'PATROL', jamCount: 0
    });
}

const target = new THREE.Mesh(new THREE.CylinderGeometry(0, 1, 4, 4), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
target.position.set(85, 2, -85); target.rotation.x = Math.PI; scene.add(target);
const targetRing = new THREE.Mesh(new THREE.TorusGeometry(3, 0.2, 4, 32), new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
targetRing.rotation.x = -Math.PI / 2; targetRing.position.set(85, 0.5, -85); scene.add(targetRing);

// --- EXPLOSION FX ---
const particles = [];
function triggerExplosion() {
    missionActive = false;
    roverContainer.visible = false;

    const pGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    for (let i = 0; i < 30; i++) {
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.copy(roverContainer.position);
        p.position.x += (Math.random() - 0.5) * 2;
        p.position.y += (Math.random() - 0.5) * 2;
        p.position.z += (Math.random() - 0.5) * 2;

        const vel = new THREE.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5).normalize().multiplyScalar(0.5 + Math.random());
        scene.add(p);
        particles.push({ mesh: p, velocity: vel, life: 100 });
    }

    document.getElementById('ui-status').innerText = "CRITICAL FAILURE: HULL BREACH";
    document.getElementById('ui-status').className = "warning";
    document.getElementById('ui-status').style.color = "red";

    // Show Fail Screen after a brief delay for the explosion
    setTimeout(() => {
        document.getElementById('fail-screen').style.display = 'flex';
        document.getElementById('fail-reason').innerText = "ROVER DESTROYED BY DRONE";
    }, 1500);
}

// --- 8. LOGIC LOOP ---

let missionActive = false;
let speed = 0.0;
const maxSpeed = 0.35;
let battery = 100.0;

let lastPos = new THREE.Vector3();
let stuckTimer = 0;
let recoveryMode = false;   // New Flag

const debugArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 10, 0xffff00);
scene.add(debugArrow);

function updatePhysics() {
    // Update particles regardless of mission state
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.mesh.position.add(p.velocity);
        p.velocity.y -= 0.02; // Gravity
        p.life--;
        p.mesh.scale.multiplyScalar(0.95);
        if (p.life <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
        }
    }

    if (!missionActive) return;

    if (battery <= 0) {
        missionActive = false;
        document.getElementById('ui-status').innerText = "CRITICAL FAILURE: BATTERY DEPLETED";
        document.getElementById('ui-status').className = "warning";
        document.getElementById('ui-battery').innerText = "0%";

        // Show Fail Screen
        document.getElementById('fail-screen').style.display = 'flex';
        document.getElementById('fail-reason').innerText = "POWER SYSTEMS DEPLETED";
        return;
    }

    const targetVec = new THREE.Vector3().subVectors(target.position, roverContainer.position);
    targetVec.y = 0;
    const distToTarget = targetVec.length();
    targetVec.normalize();

    // --- MISSION SUCCESS CHECK ---
    // Trigger as soon as rover enters the visual Safe Zone (Radius 15)
    if (distToTarget < 15) {
        missionActive = false;
        document.getElementById('success-screen').style.display = 'flex';
        document.getElementById('ui-status').innerText = "MISSION COMPLETE";
        document.getElementById('ui-status').style.color = "#00ffff";
        document.getElementById('ui-status').className = "";
        document.getElementById('ui-status').style.textShadow = "0 0 10px #00ffff";

        // Enable BOM Button
        document.getElementById('btn-generate-bom').onclick = () => {
            SKHY_UTILS.notifyParentBOM({
                edgeType: config.edgeType,
                rfWatts: config.rfWatts,
                relayType: document.getElementById('relay-select').value
            });
        };

        return;
    }

    let moveDir = new THREE.Vector3(); // Initialize for scope

    // --- STUCK DETECTION & RECOVERY LOGIC ---
    const distMoved = roverContainer.position.distanceTo(lastPos);
    lastPos.copy(roverContainer.position);

    // If we are far from target but barely moving, increment timer
    if (distToTarget > 5 && distMoved < 0.05 && !recoveryMode) {
        stuckTimer++;
    } else if (!recoveryMode) {
        stuckTimer = Math.max(0, stuckTimer - 2);
    }

    // Trigger Recovery: FORCE FORWARD
    if (stuckTimer > 60 && !recoveryMode) {
        recoveryMode = true;
        stuckTimer = 0;
        document.getElementById('ui-status').innerText = "STUCK DETECTED: FORCING FORWARD";
        document.getElementById('ui-status').style.color = "orange";
    }

    if (recoveryMode) {
        stuckTimer++;

        // Just force movement towards target for 60 frames (approx 1 sec)
        // ignoring all obstacle avoidance vectors
        if (stuckTimer < 60) {
            moveDir.copy(targetVec); // Override direction
            speed = THREE.MathUtils.lerp(speed, maxSpeed, 0.1); // Maintain speed
        } else {
            recoveryMode = false;
            stuckTimer = 0;
            document.getElementById('ui-status').innerText = "ACTIVE";
            document.getElementById('ui-status').style.color = "#00ffff";
        }
    } else {
        // --- NORMAL NAVIGATION (Potential Fields) ---
        let steerVec = targetVec.clone().multiplyScalar(1.0);

        // Obstacles (Trees)
        obstacles.forEach(ob => {
            const toObs = new THREE.Vector3().subVectors(ob.position, roverContainer.position);
            toObs.y = 0;
            const dist = toObs.length();
            if (dist < config.avoidRadius) {
                const repelDir = toObs.clone().negate().normalize();
                let tangent = new THREE.Vector3().crossVectors(toObs, new THREE.Vector3(0, 1, 0)).normalize();
                if (tangent.dot(targetVec) < 0) tangent.negate();
                const weight = (config.avoidRadius - dist) / config.avoidRadius;
                steerVec.add(repelDir.multiplyScalar(weight * 5.0));
                steerVec.add(tangent.multiplyScalar(weight * 3.0));
            }
        });

        // Danger Zones
        dangerZones.forEach(zone => {
            const toZone = new THREE.Vector3().subVectors(zone.position, roverContainer.position);
            toZone.y = 0;
            const dist = toZone.length();
            const dangerRadius = zone.radius + 5;

            if (dist < dangerRadius) {
                const repelDir = toZone.clone().negate().normalize();
                let tangent = new THREE.Vector3().crossVectors(toZone, new THREE.Vector3(0, 1, 0)).normalize();
                if (tangent.dot(targetVec) < 0) tangent.negate();
                const weight = (dangerRadius - dist) / dangerRadius;
                steerVec.add(repelDir.multiplyScalar(weight * 8.0));
                steerVec.add(tangent.multiplyScalar(weight * 5.0));
            }
        });

        moveDir = steerVec.normalize();
    }

    // Apply Movement
    if (distToTarget > 3) {
        battery -= 0.015;
        if (!recoveryMode) {
            speed = THREE.MathUtils.lerp(speed, maxSpeed, 0.05);
        }

        // Apply Velocity
        roverContainer.position.x += moveDir.x * speed;
        roverContainer.position.z += moveDir.z * speed;

        // Visuals & Rotation
        debugArrow.position.copy(roverContainer.position);
        debugArrow.position.y += 3;
        debugArrow.setDirection(moveDir);

        const targetRot = Math.atan2(moveDir.x, moveDir.z);
        let delta = targetRot - roverContainer.rotation.y;
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        roverContainer.rotation.y += delta * 0.05;

        wheels.forEach(w => w.mesh.rotation.x -= speed * 2);

    } else {
        battery -= config.idleDrain;
    }

    // Terrain Following
    const centerY = getTerrainHeight(roverContainer.position.x, roverContainer.position.z);
    const offset = 2.0;
    const hF = getTerrainHeight(roverContainer.position.x + Math.sin(roverContainer.rotation.y) * offset, roverContainer.position.z + Math.cos(roverContainer.rotation.y) * offset);
    const hB = getTerrainHeight(roverContainer.position.x - Math.sin(roverContainer.rotation.y) * offset, roverContainer.position.z - Math.cos(roverContainer.rotation.y) * offset);
    const hL = getTerrainHeight(roverContainer.position.x + Math.cos(roverContainer.rotation.y) * offset, roverContainer.position.z - Math.sin(roverContainer.rotation.y) * offset);
    const hR = getTerrainHeight(roverContainer.position.x - Math.cos(roverContainer.rotation.y) * offset, roverContainer.position.z + Math.sin(roverContainer.rotation.y) * offset);

    roverContainer.position.y = centerY + 0.5;
    roverContainer.rotation.x = Math.atan2(hF - hB, offset * 2);
    roverContainer.rotation.z = Math.atan2(hL - hR, offset * 2);

    wheels.forEach(w => {
        const worldPos = w.container.position.clone().applyMatrix4(roverContainer.matrixWorld);
        const groundY = getTerrainHeight(worldPos.x, worldPos.z);
        const localGround = new THREE.Vector3(worldPos.x, groundY + 0.8, worldPos.z);
        roverContainer.worldToLocal(localGround);
        w.container.position.y = THREE.MathUtils.lerp(w.container.position.y, localGround.y, 0.2);
    });

    // --- DRONE AI ---
    let jamming = false;
    let activeThreats = 0;

    drones.forEach(d => {
        if (d.state === 'crashed') return;

        // Collision Check
        if (d.state !== 'falling' && d.mesh.position.distanceTo(roverContainer.position) < 3.5) {
            triggerExplosion();
            return;
        }

        if (d.state === 'falling') {
            d.mesh.position.y -= 0.4;
            d.mesh.rotation.z += 0.2; d.mesh.rotation.x += 0.1;
            const groundH = getTerrainHeight(d.mesh.position.x, d.mesh.position.z);
            if (d.mesh.position.y <= groundH + 0.5) {
                d.mesh.position.y = groundH + 0.5; d.state = 'crashed';
                d.light.intensity = 0; d.rotors.forEach(r => r.material.color.setHex(0x333333));
            }
            return;
        }

        let desiredVel = d.velocity.clone().normalize();
        if (Math.random() < 0.05) desiredVel.add(new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5));

        const distToRover = d.mesh.position.distanceTo(roverContainer.position);
        const detectionRange = 45;
        let targetSpeed = 0.25;
        let targetAltitudeOffset = d.heightOffset; // Default to high altitude

        if (distToRover < detectionRange) {
            d.state = 'PURSUIT';
            d.light.color.setHex(0xff0000);
            targetSpeed = 0.45;
            targetAltitudeOffset = 2.0; // DIVE!

            const seek = new THREE.Vector3().subVectors(roverContainer.position, d.mesh.position);
            seek.y = 0; seek.normalize().multiplyScalar(1.5);
            desiredVel.add(seek);
        } else {
            d.state = 'PATROL';
            d.light.color.setHex(0xffff00);
        }

        dangerZones.forEach(zone => {
            const dzVec = new THREE.Vector3().subVectors(d.mesh.position, zone.position);
            dzVec.y = 0; const dist = dzVec.length();
            if (dist < zone.radius + 5) {
                const repel = dzVec.normalize().multiplyScalar(4.0); desiredVel.add(repel);
            }
        });

        if (Math.abs(d.mesh.position.x) > 90 || Math.abs(d.mesh.position.z) > 90) {
            const centerPull = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), d.mesh.position).normalize().multiplyScalar(0.8);
            desiredVel.add(centerPull);
        }

        desiredVel.y = 0; desiredVel.normalize().multiplyScalar(targetSpeed);
        d.velocity.lerp(desiredVel, 0.05);
        d.mesh.position.add(d.velocity);

        const dGround = getTerrainHeight(d.mesh.position.x, d.mesh.position.z);
        d.mesh.position.y = THREE.MathUtils.lerp(d.mesh.position.y, dGround + targetAltitudeOffset, 0.08); // Swoop down
        d.mesh.lookAt(d.mesh.position.clone().add(d.velocity));
        d.rotors.forEach(r => r.rotation.y += 0.8);

        // JAMMING
        if (distToRover < config.jamRange) {
            activeThreats++;
            if (!jamming && missionActive) {
                jamming = true;
                jammerGroup.lookAt(d.mesh.position);
                jammerGroup.rotateX(Math.PI / 2);
                const localTarget = d.mesh.position.clone();
                jammerGroup.worldToLocal(localTarget);
                const positions = laser.geometry.attributes.position.array;
                positions[3] = localTarget.x; positions[4] = localTarget.y; positions[5] = localTarget.z;
                laser.geometry.attributes.position.needsUpdate = true;
                laserMat.opacity = 0.8 + Math.random() * 0.2;

                d.jamCount += config.jamSpeed; // Faster jamming with higher watts
                if (d.jamCount > 150) {
                    d.state = 'falling';
                    d.rotors.forEach(r => r.material.color.setHex(0xff0000));
                }
            }
        } else {
            d.jamCount = Math.max(0, d.jamCount - 1);
        }
    });

    if (jamming) battery -= config.rfDrain;

    document.getElementById('ui-battery').innerText = Math.floor(battery) + "%";
    if (battery < 20) document.getElementById('ui-battery').style.color = "#ff3333";
    else if (battery < 50) document.getElementById('ui-battery').style.color = "yellow";
    else document.getElementById('ui-battery').style.color = "#00ffff";

    if (!jamming) {
        jammerGroup.rotation.set(0, 0, 0); jammerGroup.rotation.y += 0.02; laserMat.opacity = 0;
    }

    document.getElementById('ui-coords').innerText = `${Math.floor(roverContainer.position.x)}, ${Math.floor(roverContainer.position.z)}`;
    document.getElementById('ui-rf').innerText = jamming ? "JAMMING ACTIVE" : "SCANNING...";
    document.getElementById('ui-rf').style.color = jamming ? "#ff3333" : "#00ffff";
    document.getElementById('ui-threat').innerText = activeThreats > 0 ? "HIGH" : "LOW";
    document.getElementById('ui-threat').className = activeThreats > 0 ? "warning" : "";
}

function animate() {
    requestAnimationFrame(animate);
    updatePhysics();

    // 1. Render Main View
    debugArrow.visible = true; // Show guide arrow in Iso view
    camera.position.set(roverContainer.position.x + 50, roverContainer.position.y + 50, roverContainer.position.z + 50);
    camera.lookAt(roverContainer.position);

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissorTest(false);
    renderer.render(scene, camera);

    // 2. Render PiP FPV
    const pipWidth = 320;
    const pipHeight = 240;
    const pipX = window.innerWidth - pipWidth - 20;
    const pipY = window.innerHeight - pipHeight - 20;

    renderer.setScissor(pipX, pipY, pipWidth, pipHeight);
    renderer.setViewport(pipX, pipY, pipWidth, pipHeight);
    renderer.setScissorTest(true);

    // Ensure depth is cleared for the PiP area so it draws over the main scene cleanly
    renderer.clearDepth();

    debugArrow.visible = false; // Hide guide arrow in FPV view for immersion
    renderer.render(scene, fpvCamera);
    debugArrow.visible = true; // Restore visibility for next frame

    renderer.setScissorTest(false);
}

// --- START BUTTON ---
document.getElementById('start-btn').addEventListener('click', () => {
    const rfVal = parseInt(document.getElementById('rf-select').value);
    const edgeVal = document.getElementById('edge-select').value;
    const selectedEdge = edgeData[edgeVal];

    // Apply Config
    config.rfWatts = rfVal;
    config.edgeType = edgeVal;
    config.avoidRadius = selectedEdge.radius;
    config.idleDrain = selectedEdge.idleDrain;

    // Jamming Logic tuning based on wattage and compute awareness
    if (rfVal === 5) { config.jamRange = 40; config.rfDrain = 0.04; }
    else if (rfVal === 10) { config.jamRange = 50; config.rfDrain = 0.08; }
    else { config.jamRange = 70; config.rfDrain = 0.18; }

    // Boost jam speed if spectrum awareness is present
    let baseJamSpeed = (rfVal / 10);
    // All SKHY devices have spectrum awareness
    baseJamSpeed *= 1.2;

    if (edgeVal === 'skhy_resilient') baseJamSpeed *= 1.2; // FPGA boost
    config.jamSpeed = baseJamSpeed;

    // Visuals
    computeMesh.visible = true;
    computeMesh.material.color.setHex(0x111111);
    computeMesh.scale.set(selectedEdge.scale, selectedEdge.scale, selectedEdge.scale);
    computeLight.material.color.setHex(selectedEdge.lightColor);

    // Show RF module based on wattage
    if (rfVal === 20) rfLarge.visible = true;
    else rfSmall.visible = true;

    document.getElementById('ui-rf-type').innerText = rfVal + "W";
    document.getElementById('ui-vision-type').innerText = selectedEdge.name;
    document.getElementById('ui-system-name').innerText = selectedEdge.name;

    document.getElementById('start-screen').style.display = 'none';
    missionActive = true;
    document.getElementById('ui-status').innerText = "ACTIVE";
    document.getElementById('ui-status').style.color = "#00ffff";
});

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
