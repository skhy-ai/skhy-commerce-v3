// This script is extracted from AdvancedAcousticEngine.html to comply with CSP requirements.
// Refactored to use SKHY_UTILS for consistent loading and initialization.

SKHY_UTILS.onReady(() => {
    initializeVisualization();
});

function initializeVisualization() {
    if (!document.getElementById('visualization-container')) return;

    // Start loading overlay
    const loading = SKHY_UTILS.startLoading();

    Promise.all([
        import('three'),
        import('three/addons/controls/OrbitControls.js'),
        import('three/addons/postprocessing/EffectComposer.js'),
        import('three/addons/postprocessing/RenderPass.js'),
        import('three/addons/postprocessing/UnrealBloomPass.js')
    ]).then(([THREE, { OrbitControls }, { EffectComposer }, { RenderPass }, { UnrealBloomPass }]) => {
        let scene, camera, renderer, controls, composer, hemisphereLight;
        const container = document.getElementById('visualization-container');
        const infoContainer = document.getElementById('info-overlay-container');
        const labelsContainer = document.getElementById('labels-container');
        let currentScenarioIndex = 0;
        const activeObjects = new THREE.Group();
        let animatedElements = [];

        const scenarios = [
            { id: 1, title: "Wide-Area Perimeter Defense", description: "A layered perimeter: High-gain Guardians are cued by a wide network of low-cost mast sensors, providing early warning and directional inference." },
            { id: 2, title: "Coordinated Mobile Defense", description: "A vehicle convoy shares threat data via a network link, allowing for a coordinated response to an ambushing tank." },
            { id: 3, title: "Defeating Acoustic Jamming", description: "The system isolates a drone's 'machine fingerprint' from its loud siren, enabling a precise lock." },
            { id: 4, title: "Combined Arms Defense", description: "A network of platforms creates a complete, layered defensive shield against multiple air and ground threats." },
            { id: 5, title: "Over-the-Horizon Swarm Detection", description: "The Airborne Guardian detects an inbound drone swarm at long range, providing critical advance warning to friendly assets." }
        ];

        function init() {
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x111827);
            scene.fog = new THREE.Fog(0x111827, 200, 600);
            
            camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 2000);
            
            renderer = new THREE.WebGLRenderer({ antialias: true, canvas: container.querySelector('canvas') || document.createElement('canvas') });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0;

            if (!container.querySelector('canvas')) container.appendChild(renderer.domElement);

            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;

            // --- Professional Lighting Setup ---
            hemisphereLight = new THREE.HemisphereLight(0x406080, 0x101020, 1.5);
            scene.add(hemisphereLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
            directionalLight.position.set(50, 80, 60);
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 10;
            directionalLight.shadow.camera.far = 250;
            directionalLight.shadow.camera.left = -100;
            directionalLight.shadow.camera.right = 100;
            directionalLight.shadow.camera.top = 100;
            directionalLight.shadow.camera.bottom = -100;
            scene.add(directionalLight);
            
            scene.add(activeObjects);

            // --- Post-Processing ---
            const renderScene = new RenderPass(scene, camera);
            const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.4, 0.85);
            bloomPass.threshold = 0;
            bloomPass.strength = 0.6; // Subtle bloom
            bloomPass.radius = 0.5;

            composer = new EffectComposer(renderer);
            composer.addPass(renderScene);
            composer.addPass(bloomPass);

            loadScenario(currentScenarioIndex);
            animate();

            window.addEventListener('resize', onWindowResize);
            document.getElementById('next-scenario-btn').addEventListener('click', () => {
                currentScenarioIndex = (currentScenarioIndex + 1) % scenarios.length;
                loadScenario(currentScenarioIndex);
            });
            document.getElementById('prev-scenario-btn').addEventListener('click', () => {
                currentScenarioIndex = (currentScenarioIndex - 1 + scenarios.length) % scenarios.length;
                loadScenario(currentScenarioIndex);
            });
        
            const themeToggle = document.getElementById('theme-toggle');
            const mainContent = document.querySelector('main');
            const themeIcon = document.querySelector('.absolute.top-4.right-4 svg');

            function setTheme(isLight) {
                document.body.classList.toggle('light-mode', isLight);
                mainContent.classList.toggle('prose-invert', !isLight);
                themeIcon.classList.toggle('text-white', !isLight);
                themeIcon.classList.toggle('text-gray-800', isLight);
                
                if (scene) {
                    const bgColor = isLight ? 0xf3f4f6 : 0x111827;
                    const groundColor = isLight ? 0xcccccc : 0x101020;
                    scene.background.set(bgColor);
                    scene.fog.color.set(bgColor);
                    if(hemisphereLight) {
                        hemisphereLight.groundColor.set(groundColor);
                    }
                }
            }

            themeToggle.addEventListener('change', () => {
                setTheme(themeToggle.checked);
            });

            setTheme(prefersLight);

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
            controls.update();
            
            const time = Date.now();

            animatedElements.forEach(el => {
                if (el.type === 'siren') {
                    el.object.scale.setScalar(1.0 + 0.1 * Math.sin(time * 0.005));
                } else if (el.type === 'propSound') {
                    el.object.material.opacity = 0.3 + 0.2 * Math.sin(time * 0.01);
                } else if (el.type === 'propeller') {
                    el.object.rotation.x += 0.5;
                } else if (el.type === 'networkLine') {
                    el.object.material.dashOffset = -time * 0.0005;
                } else if (el.type === 'label') {
                    updateLabelPosition(el);
                }
            });

            composer.render();
        }

        const colors = {
            threat: 0x991b1b, threatLight: 0xdc2626,
            sensor: 0x1d4ed8, sensorLight: 0x3b82f6,
            friendly: 0x14532d, friendlyLight: 0x16a34a,
            detail: 0x4b5563, detailLight: 0x6b7280,
            base: 0x374151,
            cueing: 0x0ea5e9, // A light blue for cueing beams
        };
        
        function createCamoTexture() {
            const canvas = document.createElement('canvas');
            canvas.width = 128; canvas.height = 128;
            const context = canvas.getContext('2d');
            const camoColors = ['#2f3e2a', '#4a543e', '#6b6e4f', '#252a20'];
            context.fillStyle = camoColors[0];
            context.fillRect(0,0,128,128);
            for (let i = 0; i < 100; i++) {
                context.fillStyle = camoColors[Math.floor(Math.random() * camoColors.length)];
                context.beginPath();
                context.arc(Math.random() * 128, Math.random() * 128, Math.random() * 30, 0, Math.PI * 2);
                context.fill();
            }
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            return texture;
        }
        const camoTexture = createCamoTexture();

        function createPerimeterGuardian() {
            const group = new THREE.Group();
            const baseMat = new THREE.MeshStandardMaterial({ color: colors.sensor, roughness: 0.4, metalness: 0.1 });
            const detailMat = new THREE.MeshStandardMaterial({ color: colors.detail, metalness: 0.2, roughness: 0.6});
            const postGeo = new THREE.CylinderGeometry(0.3, 0.5, 8, 8);
            const post = new THREE.Mesh(postGeo, detailMat);
            post.position.y = 4;
            post.castShadow = true;
            group.add(post);

            const dishGeo = new THREE.SphereGeometry(2.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5);
            const dish = new THREE.Mesh(dishGeo, baseMat);
            dish.position.y = 8;
            dish.castShadow = true;
            group.add(dish);

            const coverageGeo = new THREE.CylinderGeometry(45, 45, 0.2, 64, 1, true); 
            const coverageMat = new THREE.MeshBasicMaterial({ color: colors.sensorLight, transparent: true, opacity: 0.1, side: THREE.DoubleSide });
            const coverageCylinder = new THREE.Mesh(coverageGeo, coverageMat);
            coverageCylinder.position.y = 0.1;
            group.add(coverageCylinder);

            return group;
        }
        
        function createMastSensor() {
            const group = new THREE.Group();
            const mat = new THREE.MeshStandardMaterial({ color: colors.detailLight, roughness: 0.6 });
            const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 10, 8);
            const pole = new THREE.Mesh(poleGeo, mat);
            pole.position.y = 5;
            pole.castShadow = true;
            group.add(pole);
            const boxGeo = new THREE.BoxGeometry(1, 1, 1);
            const box = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({color: colors.sensorLight}));
            box.position.y = 10.5;
            box.castShadow = true;
            group.add(box);
            return group;
        }

        function createMobileGuardian() {
            const group = new THREE.Group();
            const chassisMat = new THREE.MeshStandardMaterial({color: colors.friendly, map: camoTexture, roughness: 0.8});
            const detailMat = new THREE.MeshStandardMaterial({color: colors.detail, roughness: 0.7});
            const chassisGeo = new THREE.BoxGeometry(9, 3, 5);
            const chassis = new THREE.Mesh(chassisGeo, chassisMat);
            chassis.position.y = 2; chassis.castShadow = true; group.add(chassis);
            const cabGeo = new THREE.BoxGeometry(4, 2.5, 4.5);
            const cab = new THREE.Mesh(cabGeo, chassisMat);
            cab.position.set(2.5, 3.25, 0); cab.castShadow = true; group.add(cab);
            const mastGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 8);
            const mast = new THREE.Mesh(mastGeo, detailMat);
            mast.position.y = 6; mast.castShadow = true;
            const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
            const box = new THREE.Mesh(boxGeo, new THREE.MeshStandardMaterial({color: colors.sensor}));
            box.position.y = 8.5; box.castShadow = true; group.add(mast, box);
            for(let i = 0; i < 3; i++) {
                const wheelGeo = new THREE.CylinderGeometry(1, 1, 1, 16);
                const wheelL = new THREE.Mesh(wheelGeo, detailMat);
                wheelL.rotation.z = Math.PI/2;
                wheelL.position.set(-2.5 + i * 2.5, 1, 2.5);
                const wheelR = wheelL.clone();
                wheelR.position.z = -2.5;
                group.add(wheelL, wheelR);
            }
            return group;
        }

        function createAirborneGuardian() {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
            
            // Fuselage (along X-axis)
            const fuselageGeo = new THREE.CapsuleGeometry(1, 12, 4, 16);
            const fuselage = new THREE.Mesh(fuselageGeo, bodyMat);
            fuselage.rotation.z = Math.PI / 2;
            fuselage.castShadow = true;
            group.add(fuselage);

            // Main Wings (Perpendicular to fuselage, along Z-axis)
            const wingGeo = new THREE.BoxGeometry(2, 0.3, 20); // depth, height, width(wingspan)
            const mainWing = new THREE.Mesh(wingGeo, bodyMat);
            mainWing.position.x = 1; 
            mainWing.castShadow = true;
            group.add(mainWing);

            // Tail Fin (Vertical Stabilizer)
            const tailFinGeo = new THREE.BoxGeometry(1.5, 2.5, 0.2);
            const tailFin = new THREE.Mesh(tailFinGeo, bodyMat);
            tailFin.position.set(-6, 1.5, 0);
            tailFin.castShadow = true;
            group.add(tailFin);

            // Horizontal Stabilizers
            const hStabGeo = new THREE.BoxGeometry(1.5, 0.2, 6);
            const hStab = new THREE.Mesh(hStabGeo, bodyMat);
            hStab.position.set(-6, 0.5, 0);
            hStab.castShadow = true;
            group.add(hStab);
            
            // Rotate entire model to face forward (-Z) in the scene
            group.rotation.y = Math.PI / 2;

            return group;
        }

        function createGeran2() {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: colors.threat, roughness: 0.7 });
            
            // Delta Wing pointing along the +X axis
            const wingShape = new THREE.Shape();
            wingShape.moveTo(8, 0);   // Front tip
            wingShape.lineTo(-4, -7);  // Back left
            wingShape.lineTo(-4, 7);   // Back right
            wingShape.closePath();

            const extrudeSettings = { depth: 0.4, bevelEnabled: false };
            const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
            const wing = new THREE.Mesh(wingGeo, bodyMat);
            wing.rotation.x = -Math.PI / 2; // Lay it flat on the XZ plane
            wing.position.y = -0.2;
            wing.castShadow = true;
            group.add(wing);

            // Fuselage aligned with the wing
            const fuselageGeo = new THREE.CapsuleGeometry(1.5, 6, 4, 16);
            const fuselage = new THREE.Mesh(fuselageGeo, bodyMat);
            fuselage.rotation.z = Math.PI / 2; // Align capsule along X-axis
            fuselage.position.x = 1;
            fuselage.castShadow = true;
            group.add(fuselage);

            // Propeller at the back
            const propBladeGeo = new THREE.BoxGeometry(0.1, 2.5, 0.2);
            const propMat = new THREE.MeshStandardMaterial({color: colors.detail});
            const blade1 = new THREE.Mesh(propBladeGeo, propMat);
            const blade2 = blade1.clone();
            blade2.rotation.x = Math.PI / 2;
            const propellerGroup = new THREE.Group();
            propellerGroup.add(blade1, blade2);
            propellerGroup.position.x = -4.5;
            group.add(propellerGroup);

            animatedElements.push({ type: 'propeller', object: propellerGroup });
            
            // Rotate the whole model to face forward in the scene (-Z)
            group.rotation.y = -Math.PI / 2;

            return group;
        }

        function createTank() {
            const group = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({ color: colors.threat, map: camoTexture, roughness: 0.9 });
            const detailMat = new THREE.MeshStandardMaterial({ color: colors.detail, roughness: 0.8 });
            const chassisGeo = new THREE.BoxGeometry(8, 3, 5);
            const chassis = new THREE.Mesh(chassisGeo, bodyMat);
            chassis.position.y = 2; chassis.castShadow = true; group.add(chassis);
            const turretGeo = new THREE.CylinderGeometry(2, 1.8, 1.5, 16);
            const turret = new THREE.Mesh(turretGeo, bodyMat);
            turret.position.y = 4; turret.castShadow = true; group.add(turret);
            const barrelGeo = new THREE.CylinderGeometry(0.3, 0.2, 7, 8);
            const barrel = new THREE.Mesh(barrelGeo, detailMat);
            barrel.rotation.z = Math.PI / 2; barrel.position.set(4, 4, 0); barrel.castShadow = true; group.add(barrel);
            const trackGeo = new THREE.BoxGeometry(9, 1.5, 5.5);
            const track = new THREE.Mesh(trackGeo, detailMat);
            track.position.y = 1; track.castShadow = true; group.add(track);
            return group;
        }

        function createJet() {
            const group = new THREE.Group();
            const fuselageMat = new THREE.MeshStandardMaterial({ color: colors.threatLight, metalness: 0.6, roughness: 0.3 });
            
            const fuselageGeo = new THREE.CylinderGeometry(0.8, 1.2, 14, 16);
            const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
            fuselage.rotation.z = Math.PI / 2; fuselage.castShadow = true; group.add(fuselage);
            
            const cockpitGeo = new THREE.SphereGeometry(1.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            const cockpit = new THREE.Mesh(cockpitGeo, new THREE.MeshStandardMaterial({color: 0x1e40af, transparent: true, opacity: 0.6, emissive: 0x1e40af, emissiveIntensity: 0.5}));
            cockpit.position.x = 4; cockpit.rotation.z = -Math.PI / 2; group.add(cockpit);
            
            const wingShape = new THREE.Shape();
            wingShape.moveTo(0,0);
            wingShape.lineTo(-6, 1.5);
            wingShape.lineTo(-6, -1.5);
            wingShape.lineTo(0,0);
            const extrudeSettings = { depth: 0.3, bevelEnabled: false };
            const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
            const wingL = new THREE.Mesh(wingGeo, fuselageMat);
            wingL.rotation.y = Math.PI / 2;
            wingL.castShadow = true;
            const wingR = wingL.clone();
            wingR.rotation.x = Math.PI;
            group.add(wingL, wingR);

            const tailGeo = new THREE.BoxGeometry(1.5, 3, 0.3);
            const tail = new THREE.Mesh(tailGeo, fuselageMat);
            tail.position.set(-6, 1.5, 0); tail.castShadow = true; group.add(tail);

            return group;
        }
        
        function createHangar() {
            const group = new THREE.Group();
            const wallMat = new THREE.MeshStandardMaterial({color: colors.base, roughness: 0.8});
            const roofGeo = new THREE.CylinderGeometry(25, 25, 60, 32, 1, false, 0, Math.PI);
            const roof = new THREE.Mesh(roofGeo, wallMat);
            roof.rotation.z = Math.PI / 2; roof.position.y = 25;
            roof.receiveShadow = true; group.add(roof);
            const wallGeo = new THREE.BoxGeometry(60, 25, 0.5);
            const backWall = new THREE.Mesh(wallGeo, wallMat);
            backWall.position.z = -25; backWall.position.y = 12.5;
            backWall.receiveShadow = true; group.add(backWall);
            return group;
        }

        function createDetectionBeam(start, end, color = 0xfacc15) {
            const dir = new THREE.Vector3().subVectors(end, start);
            const length = dir.length();
            const geo = new THREE.CylinderGeometry(0, 1, length, 16, 1, true);
            const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
            const beam = new THREE.Mesh(geo, mat);
            beam.position.copy(start).add(dir.multiplyScalar(0.5));
            beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
            return beam;
        }
        
        function createNetworkLine(start, end) {
            const points = [start, end];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineDashedMaterial({
                color: colors.sensorLight,
                linewidth: 2, scale: 1, dashSize: 2, gapSize: 1,
            });
            const line = new THREE.Line(geo, mat);
            line.computeLineDistances();
            animatedElements.push({type: 'networkLine', object: line});
            return line;
        }

        function createSirenEffect() {
            const geo = new THREE.SphereGeometry(25, 32, 16);
            const mat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.15, emissive: 0xfef08a, emissiveIntensity: 0.2 });
            const mesh = new THREE.Mesh(geo, mat);
            animatedElements.push({type: 'siren', object: mesh});
            return mesh;
        }

        function createPropSound() {
            const geo = new THREE.ConeGeometry(3, 15, 8, 1, true);
            const mat = new THREE.MeshBasicMaterial({color: 0x22c55e, transparent: true, opacity: 0.3, side: THREE.DoubleSide, emissive: 0x22c55e, emissiveIntensity: 0.5});
            const cone = new THREE.Mesh(geo, mat);
            cone.rotation.x = Math.PI / 2;
            animatedElements.push({type: 'propSound', object: cone});
            return cone;
        }

        function addLabel(targetObject, text) {
            const div = document.createElement('div');
            div.className = 'scene-label';
            div.textContent = text;
            labelsContainer.appendChild(div);
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
            infoContainer.innerHTML = `<div class="info-overlay">
                <h3 class="font-bold text-white mb-1">${title}</h3>
                <p class="text-sm text-gray-300">${text}</p>
            </div>`;
        }

        function clearScene() {
            animatedElements = [];
            labelsContainer.innerHTML = '';
            infoContainer.innerHTML = '';
            while(activeObjects.children.length > 0){ 
                const child = activeObjects.children[0];
                activeObjects.remove(child); 
                // Proper disposal
                if(child.geometry) child.geometry.dispose();
                if(child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
            if (scene.getObjectByName('ground')) {
                const ground = scene.getObjectByName('ground');
                scene.remove(ground);
                ground.geometry.dispose();
                ground.material.dispose();
            }
        }

        function loadScenario(index) {
            clearScene();
            const scenario = scenarios[index];
            showInfoOverlay(scenario.title, scenario.description);

            const ground = new THREE.Mesh(
                new THREE.PlaneGeometry(1000, 1000),
                new THREE.MeshStandardMaterial({ color: 0x27374D, roughness: 0.95 })
            );
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            ground.name = 'ground';
            scene.add(ground);

            switch(scenario.id) {
                case 1:
                    const hangar = createHangar(); activeObjects.add(hangar);
                    const guardianRadius = 80; 
                    const mastRadius = 100;

                    for(let i=0; i<8; i++) {
                        const angle = (i/8) * Math.PI * 2;
                        const sensor = createPerimeterGuardian();
                        sensor.position.set(Math.cos(angle) * guardianRadius, 0, Math.sin(angle) * guardianRadius);
                        activeObjects.add(sensor);
                    }
                    
                    for(let i=0; i<16; i++) {
                        const angle = (i/16) * Math.PI * 2;
                        const sensor = createMastSensor();
                        sensor.position.set(Math.cos(angle) * mastRadius, 0, Math.sin(angle) * mastRadius);
                        activeObjects.add(sensor);
                    }

                    const g1 = createGeran2(); g1.position.set(-90, 25, -90); activeObjects.add(g1);
                    
                    const closestGuardianPos = new THREE.Vector3(Math.cos(5 * Math.PI / 4) * guardianRadius, 8, Math.sin(5 * Math.PI / 4) * guardianRadius);
                    const closestMastPos = new THREE.Vector3(Math.cos(10 * Math.PI / 8) * mastRadius, 10.5, Math.sin(10 * Math.PI / 8) * mastRadius);

                    activeObjects.add(createDetectionBeam(closestMastPos, g1.position, colors.cueing));
                    activeObjects.add(createDetectionBeam(closestGuardianPos, g1.position));

                    addLabel(g1, "Geran-2 Threat");
                    addLabel(hangar, "Airbase");
                    addLabel(activeObjects.children[1], "High-Gain Guardian");
                    addLabel(activeObjects.children[9], "Mast Sensor (Cueing)");

                    camera.position.set(0, 140, 180); controls.target.set(0, 5, 0);
                    break;
                case 2:
                    const convoy = [createMobileGuardian(), createMobileGuardian(), createMobileGuardian()];
                    convoy[0].position.set(0,0,0);
                    convoy[1].position.set(-20,0,-5);
                    convoy[2].position.set(20,0,5);
                    convoy.forEach(v => activeObjects.add(v));
                    activeObjects.add(createNetworkLine(convoy[0].position, convoy[1].position));
                    activeObjects.add(createNetworkLine(convoy[0].position, convoy[2].position));
                    const t1 = createTank(); t1.position.set(-40, 0, -30); activeObjects.add(t1);
                    activeObjects.add(createDetectionBeam(convoy[1].position.clone().setY(8.5), t1.position));
                    addLabel(t1, "Hostile Tank");
                    addLabel(convoy[0], "Convoy Lead");
                    camera.position.set(-20, 60, 90); controls.target.set(-10, 5, 0);
                    break;
                case 3:
                    const s3 = createPerimeterGuardian(); activeObjects.add(s3);
                    const g3 = createGeran2(); g3.position.set(0, 20, -30); activeObjects.add(g3);
                    const sirenEffect = createSirenEffect(); g3.add(sirenEffect);
                    const propSound = createPropSound(); propSound.position.y = 10; g3.add(propSound);
                    activeObjects.add(createDetectionBeam(s3.position.clone().setY(8), g3.position));
                    addLabel(sirenEffect, "Deceptive Jamming");
                    addLabel(propSound, "Isolated Machine Fingerprint");
                    camera.position.set(0, 40, 75); controls.target.set(0, 10, 0);
                    break;
                case 4:
                    const ps = createPerimeterGuardian(); ps.position.set(40, 0, 40); activeObjects.add(ps);
                    const ms = createMobileGuardian(); ms.position.set(-35, 0, 0); activeObjects.add(ms);
                    const as = createAirborneGuardian(); as.position.set(0, 35, 40); activeObjects.add(as);
                    const tt = createTank(); tt.position.set(-40, 0, -30); activeObjects.add(tt);
                    const jt = createJet(); jt.position.set(45, 30, -45); activeObjects.add(jt);
                    const gt = createGeran2(); gt.position.set(35, 20, 25); activeObjects.add(gt);
                    activeObjects.add(createDetectionBeam(ms.position.clone().setY(8.5), tt.position));
                    activeObjects.add(createDetectionBeam(as.position, jt.position));
                    activeObjects.add(createDetectionBeam(ps.position.clone().setY(8), gt.position));
                    addLabel(ps, "Perimeter Guardian");
                    addLabel(ms, "Mobile Guardian");
                    addLabel(as, "Airborne Guardian");
                    camera.position.set(0, 100, 150); controls.target.set(0, 10, 0);
                    break;
                case 5:
                    const airborneGuardian = createAirborneGuardian();
                    airborneGuardian.position.set(0, 40, 60);
                    activeObjects.add(airborneGuardian);

                    const swarm = [];
                    for (let i = 0; i < 7; i++) {
                        const drone = createGeran2();
                        drone.position.set(
                            -20 + (i % 3) * 20 + Math.random() * 5,
                            30 + Math.random() * 5,
                            -50 - Math.floor(i / 3) * 20
                        );
                        swarm.push(drone);
                        activeObjects.add(drone);
                    }
                    
                    // Draw detection beams only for drones inside the cone
                    activeObjects.add(createDetectionBeam(airborneGuardian.position, swarm[0].position));
                    activeObjects.add(createDetectionBeam(airborneGuardian.position, swarm[1].position));
                    activeObjects.add(createDetectionBeam(airborneGuardian.position, swarm[2].position));

                    addLabel(airborneGuardian, "Airborne Guardian");
                    addLabel(swarm[1], "Drone Swarm");
                    
                    camera.position.set(0, 100, 150);
                    controls.target.set(0, 30, 0);
                    break;
            }
            controls.minDistance = 20; controls.maxDistance = 600;
            controls.update();
        }
        
        init();
    });
}
