import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let scene, camera; // Make scene and camera globally accessible

const colors = { threat: 0xf43f5e, friendly: 0x3b82f6, neutral: 0xa8a29e, beam: 0x22d3ee, null: 0x18181b, sensor: 0x10b981 };

function createBeam(start, end, color, isWide) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const length = dir.length();
    const radius = isWide ? 15 : 2;
    const geo = new THREE.CylinderGeometry(0.5, radius, length, 32, 1, true);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(geo, mat);
    beam.position.copy(start).add(dir.multiplyScalar(0.5));
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return beam;
}

function createJammer() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: colors.threat, roughness: 0.7 });
    const boxGeo = new THREE.BoxGeometry(6, 4, 4);
    const box = new THREE.Mesh(boxGeo, bodyMat);
    box.position.y = 2;
    group.add(box);
    const antennaGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
    const antenna = new THREE.Mesh(antennaGeo, new THREE.MeshStandardMaterial({color: 0x404040}));
    antenna.position.y = 6.5;
    group.add(antenna);
    return group;
}

function createSatellite() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.2 });
    const panelMat = new THREE.MeshStandardMaterial({ color: colors.friendly, emissive: colors.friendly, emissiveIntensity: 0.5 });
    const bodyGeo = new THREE.BoxGeometry(4, 4, 4);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);
    const panelGeo = new THREE.BoxGeometry(10, 0.2, 5);
    const panel1 = new THREE.Mesh(panelGeo, panelMat);
    panel1.position.x = 7;
    const panel2 = panel1.clone();
    panel2.position.x = -7;
    group.add(panel1, panel2);
    return group;
}

function initMainVisualization() {
    const container = document.getElementById('visualization-container');
    if (!container) return;
    
    let renderer, controls, composer;
    const infoContainer = document.getElementById('info-overlay-container');
    const labelsContainer = document.getElementById('labels-container');
    let currentScenarioIndex = 0;
    const activeObjects = new THREE.Group();
    let animatedElements = [];

    const scenarios = [
        { id: 1, title: "Anti-Jamming: Null-Steering", description: "The SKHY Resilicom AI Box detects a hostile jammer and instantly creates a 'null' in its reception pattern, blocking the interference while maintaining a clean link to the friendly satellite." },
        { id: 2, title: "SATCOM: High-Gain Beamforming", description: "To ensure a robust connection, the system forms a tight, high-gain beam aimed directly at the communications satellite, increasing signal quality and reducing probability of intercept." },
        { id: 3, title: "Counter-Spoofing: Signal Authentication", description: "The AI analyzes incoming GNSS signals. It identifies the ground-based spoofer by its angle and characteristics, nulling it to maintain an authentic PNT lock from the real satellites." },
    ];

    function init() {
        scene = new THREE.Scene();
        const isLight = document.body.classList.contains('light-mode');
        const bgColor = isLight ? 0xe5e7eb : 0x0a0f19;
        scene.background = new THREE.Color(bgColor);
        scene.fog = new THREE.Fog(bgColor, 200, 500);
        
        camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 2000);
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        const hemisphereLight = new THREE.HemisphereLight(0x8791a6, 0x111827, 2.0);
        scene.add(hemisphereLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(30, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // Start loading overlay
    const loading = SKHY_UTILS.startLoading();
        
        scene.add(activeObjects);

        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.6, 0.7, 0.1);
        composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        loadScenario(currentScenarioIndex);
        animate();

        window.addEventListener('resize', onWindowResize);
        const nextBtn = document.getElementById('next-scenario-btn');
        const prevBtn = document.getElementById('prev-scenario-btn');
        if (nextBtn) nextBtn.addEventListener('click', () => { currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length; loadScenario(currentScenarioIndex); });
        if (prevBtn) prevBtn.addEventListener('click', () => { currentScenarioIndex = (currentScenarioIndex - 1 + scenarios.length) % scenarios.length; loadScenario(currentScenarioIndex); });

        // Signal that initialization is complete
        if (loading) loading.finish();
    }

    function onWindowResize() {
        if (!renderer || !camera) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        composer.setSize(width, height);
    }

    function animate() {
        requestAnimationFrame(animate);
        if (controls) controls.update();
        const time = Date.now();
        animatedElements.forEach(el => {
            if (el.type === 'receptionPattern') {
                el.object.material.opacity = 0.05 + 0.02 * Math.sin(time * 0.002);
            } else if (el.type === 'label') {
                updateLabelPosition(el);
            } else if (el.type === 'beam') {
                el.object.material.opacity = 0.3 + 0.15 * Math.sin(time * 0.005);
            }
        });
        if (composer) composer.render();
    }

    function createAsset() {
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.neutral, roughness: 0.5 });
        const boxGeo = new THREE.BoxGeometry(10, 3, 6);
        const box = new THREE.Mesh(boxGeo, bodyMat);
        box.position.y = 1.5;
        box.castShadow = true;
        group.add(box);
        
        const skhyBoxGeo = new THREE.BoxGeometry(2, 1, 2);
        const skhyBoxMat = new THREE.MeshStandardMaterial({
            color: colors.friendly, 
            emissive: colors.friendly, 
            emissiveIntensity: 1,
            metalness: 0.5,
            roughness: 0.3
        });
        const skhyBox = new THREE.Mesh(skhyBoxGeo, skhyBoxMat);
        skhyBox.position.y = 3.5;
        skhyBox.castShadow = true;
        group.add(skhyBox);
        return group;
    }

    function createReceptionPattern(hasNull, nullDirection) {
        const group = new THREE.Group();
        const segments = 64;
        const geo = new THREE.SphereGeometry(80, segments, segments / 2);
        const mat = new THREE.MeshBasicMaterial({ color: colors.beam, transparent: true, opacity: 0.05, side: THREE.BackSide, wireframe: true });
        const sphere = new THREE.Mesh(geo, mat);
        animatedElements.push({type: 'receptionPattern', object: sphere});
        group.add(sphere);

        if (hasNull) {
            const nullGeo = new THREE.ConeGeometry(30, 80, 16, 1, true);
            const nullMat = new THREE.MeshBasicMaterial({ color: colors.null, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
            const nullCone = new THREE.Mesh(nullGeo, nullMat);
            nullCone.position.set(nullDirection.x * 40, nullDirection.y * 40, nullDirection.z * 40);
            nullCone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nullDirection);
            group.add(nullCone);
        }
        return group;
    }

    function addLabel(targetObject, text) {
        const div = document.createElement('div');
        div.className = 'scene-label';
        div.textContent = text;
        if (labelsContainer) labelsContainer.appendChild(div);
        animatedElements.push({ type: 'label', object: targetObject, element: div, offset: new THREE.Vector3(0, 5, 0) });
    }

    function updateLabelPosition(label) {
        const position = new THREE.Vector3();
        label.object.getWorldPosition(position);
        position.add(label.offset);
        const screenPosition = position.project(camera);
        const x = (screenPosition.x * .5 + .5) * container.clientWidth;
        const y = (screenPosition.y * -.5 + .5) * container.clientHeight;
        label.element.style.left = `${x}px`;
        label.element.style.top = `${y}px`;
    }

    function showInfoOverlay(title, text) {
        if (infoContainer) {
            infoContainer.innerHTML = `<div class="info-overlay">
                <h3 class="font-bold mb-1" style="font-family: 'Teko', sans-serif; font-size: 1.5rem;">${title}</h3>
                <p class="text-sm">${text}</p>
            </div>`;
        }
    }

    function clearScene() {
        animatedElements = [];
        if (labelsContainer) labelsContainer.innerHTML = '';
        if (infoContainer) infoContainer.innerHTML = '';
        while(activeObjects.children.length > 0){ 
            activeObjects.remove(activeObjects.children[0]); 
        }
    }

    function loadScenario(index) {
        clearScene();
        const scenario = scenarios[index];
        showInfoOverlay(scenario.title, scenario.description);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshStandardMaterial({ color: document.body.classList.contains('light-mode') ? 0xf3f4f6 : 0x1f2937, roughness: 0.95 }));
        ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; activeObjects.add(ground);
        const asset = createAsset(); activeObjects.add(asset); addLabel(asset, "Friendly Asset");
        switch(scenario.id) {
            case 1: { // Anti-Jamming
                const friendlySat = createSatellite();
                friendlySat.position.set(50, 80, 50);
                activeObjects.add(friendlySat);
                addLabel(friendlySat, "Friendly SATCOM");

                const jammer = createJammer();
                jammer.position.set(-60, 0, 0);
                jammer.traverse(n => { if(n.isMesh) n.castShadow = true; });
                activeObjects.add(jammer);
                addLabel(jammer, "Hostile Jammer");

                const jammerBeam = createBeam(jammer.position, asset.position, colors.threat, true);
                animatedElements.push({type: 'beam', object: jammerBeam});
                activeObjects.add(jammerBeam);

                const assetPos = asset.position.clone();
                const jammerPos = jammer.position.clone();
                const nullDirection = new THREE.Vector3().subVectors(jammerPos, assetPos).normalize();
                const pattern = createReceptionPattern(true, nullDirection);
                asset.add(pattern);
                
                camera.position.set(-50, 70, 140);
                controls.target.set(0, 20, 0);
                break;
            }
            case 2: { // Beamforming
                const friendlySat = createSatellite();
                friendlySat.position.set(0, 80, -60);
                activeObjects.add(friendlySat);
                addLabel(friendlySat, "Friendly SATCOM");

                const otherSat = createSatellite();
                otherSat.position.set(70, 70, 40);
                otherSat.children[0].material.color.set(colors.neutral);
                activeObjects.add(otherSat);
                addLabel(otherSat, "Other Signal");

                const satcomBeam = createBeam(asset.position, friendlySat.position, colors.beam, false);
                animatedElements.push({type: 'beam', object: satcomBeam});
                activeObjects.add(satcomBeam);
                
                const pattern = createReceptionPattern(false);
                asset.add(pattern);

                camera.position.set(90, 70, 120);
                controls.target.set(0, 30, 0);
                break;
            }
            case 3: { // Counter-Spoofing
                const gpsSats = [createSatellite(), createSatellite(), createSatellite()];
                gpsSats[0].position.set(0, 90, 0);
                gpsSats[1].position.set(80, 70, 30);
                gpsSats[2].position.set(-70, 60, -50);
                gpsSats.forEach(sat => {
                    activeObjects.add(sat);
                    addLabel(sat, "GPS Satellite");
                    const beam = createBeam(sat.position, asset.position, colors.friendly, false);
                    animatedElements.push({type: 'beam', object: beam});
                    activeObjects.add(beam);
                });

                const spoofer = createJammer();
                spoofer.position.set(40, 0, 50);
                spoofer.traverse(n => { if(n.isMesh) n.castShadow = true; });
                activeObjects.add(spoofer);
                addLabel(spoofer, "GNSS Spoofer");

                const spooferBeam = createBeam(spoofer.position, asset.position, colors.threat, false);
                animatedElements.push({type: 'beam', object: spooferBeam});
                activeObjects.add(spooferBeam);

                const assetPos = asset.position.clone();
                const spooferPos = spoofer.position.clone();
                const nullDirection = new THREE.Vector3().subVectors(spooferPos, assetPos).normalize();
                const pattern = createReceptionPattern(true, nullDirection);
                asset.add(pattern);
                
                camera.position.set(120, 60, 120);
                controls.target.set(0, 30, 0);
                break;
            }
        }
        if (controls) controls.update();
    }
    init();
}

function initDomainTabs() {
    const tabs = document.querySelectorAll('.domain-tab-btn');
    const diagrams = document.querySelectorAll('.domain-diagram');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            diagrams.forEach(d => d.classList.add('hidden'));
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab') + '-diagram';
            document.getElementById(targetId)?.classList.remove('hidden');
        });
    });
}

function initYouTubePlayer() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    let player;
    const videoId = 'mTzgDyLazWc'; const startTime = 49;
    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('player', {
            height: '100%', width: '100%', videoId: videoId,
            playerVars: { 'autoplay': 1, 'mute': 1, 'controls': 0, 'showinfo': 0, 'rel': 0, 'loop': 1, 'start': startTime, 'playlist': videoId },
            events: { 'onReady': onPlayerReady }
        });
    }
    function onPlayerReady(event) {
        event.target.playVideo();
        const overlay = document.getElementById('video-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                if (player.isMuted()) { player.unMute(); overlay.classList.add('hidden'); }
            });
        }
    }
}

function initTheme() {
    const toggleButton = document.getElementById('theme-toggle');
    const body = document.body;
    const applyTheme = (theme) => {
        if (theme === 'light') { body.classList.add('light-mode'); } else { body.classList.remove('light-mode'); }
        if (scene) {
            const bgColor = theme === 'light' ? 0xe5e7eb : 0x0a0f19;
            scene.background.set(bgColor);
            scene.fog.color.set(bgColor);
            const groundMaterial = scene.getObjectByName("ground")?.material;
            if(groundMaterial) groundMaterial.color.set(theme === 'light' ? 0xf3f4f6 : 0x1f2937);
        }
    };
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            const newTheme = body.classList.contains('light-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
}

SKHY_UTILS.onReady(() => {
    initTheme();
    initMainVisualization();
    initDomainTabs();
    initYouTubePlayer();
});
