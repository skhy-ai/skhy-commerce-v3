import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { MATERIALS } from '../../../data/droneComponents';
import { useTheme } from '../../../contexts/ThemeContext';

interface HeavyLiftCanvasProps {
    frame: any;
    prop: any;
    motor?: any;
    payloadMass: number;
    pipeMatId: string;
    camera: any;
}

export const HeavyLiftCanvas: React.FC<HeavyLiftCanvasProps> = ({ frame, prop, motor, payloadMass, pipeMatId, camera }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const threeRef = useRef<{
        scene?: THREE.Scene,
        camera?: THREE.PerspectiveCamera,
        renderer?: THREE.WebGLRenderer,
        droneGroup?: THREE.Group,
        hemiLight?: THREE.HemisphereLight,
        dirLight?: THREE.DirectionalLight,
        propsArr: THREE.Mesh[],
        grid?: THREE.GridHelper,
        target: THREE.Vector3,
        zoom: number
    }>({ propsArr: [], target: new THREE.Vector3(0, 0, 0), zoom: 5 });

    const { isNightMode } = useTheme();

    useEffect(() => {
        if (!mountRef.current) return;
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isNightMode ? 0x1e293b : 0xfef3c7);
        scene.fog = new THREE.Fog(isNightMode ? 0x0f172a : 0xfde68a, 8, 30);

        const cam = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
        cam.position.set(4, 3, 5);
        cam.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        mountRef.current.appendChild(renderer.domElement);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, isNightMode ? 2.5 : 1.5);
        scene.add(hemiLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, isNightMode ? 3.0 : 2.0);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);

        threeRef.current.hemiLight = hemiLight;
        threeRef.current.dirLight = dirLight;

        const grid = new THREE.GridHelper(20, 40, isNightMode ? 0x475569 : 0xfcd34d, isNightMode ? 0x1e293b : 0xfef3c7);
        scene.add(grid);

        const droneGroup = new THREE.Group();
        scene.add(droneGroup);

        threeRef.current = { ...threeRef.current, scene, camera: cam, renderer, droneGroup, grid };

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            threeRef.current.propsArr.forEach(p => p.rotation.y += 0.1);
            const time = Date.now() * 0.001;
            if (threeRef.current.droneGroup) threeRef.current.droneGroup.position.y = Math.sin(time) * 0.1;
            renderer.render(scene, cam);
        };
        animate();

        // Interaction
        let isDragging = false, lastMouse = { x: 0, y: 0 };
        const onDown = (e: MouseEvent) => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; };
        const onUp = () => isDragging = false;
        const onMove = (e: MouseEvent) => {
            if (!isDragging || !threeRef.current.camera) return;
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            lastMouse = { x: e.clientX, y: e.clientY };

            if (e.shiftKey) {
                const speed = threeRef.current.zoom * 0.001;
                threeRef.current.target.x -= dx * speed;
                threeRef.current.target.y += dy * speed;
            } else {
                const cam = threeRef.current.camera;
                const r = threeRef.current.zoom;
                const theta = Math.atan2(cam.position.x - threeRef.current.target.x, cam.position.z - threeRef.current.target.z) + dx * 0.01;
                cam.position.x = threeRef.current.target.x + r * Math.sin(theta);
                cam.position.z = threeRef.current.target.z + r * Math.cos(theta);
            }
            threeRef.current.camera.lookAt(threeRef.current.target);
        };
        const onWheel = (e: WheelEvent) => {
            threeRef.current.zoom = Math.max(1, Math.min(20, threeRef.current.zoom + e.deltaY * 0.01));
            const cam = threeRef.current.camera;
            if (cam) {
                const dir = new THREE.Vector3().subVectors(cam.position, threeRef.current.target).normalize();
                cam.position.copy(threeRef.current.target).addScaledVector(dir, threeRef.current.zoom);
            }
        };

        mountRef.current.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mousemove', onMove);
        mountRef.current.addEventListener('wheel', onWheel);

        const handleResize = () => {
            if (!mountRef.current) return;
            cam.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            cam.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mousemove', onMove);
            if (mountRef.current) {
                mountRef.current.removeEventListener('mousedown', onDown);
                mountRef.current.removeEventListener('wheel', onWheel);
            }
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            if (threeRef.current.scene) {
                threeRef.current.scene.traverse((object) => {
                    if (object instanceof THREE.Mesh) {
                        object.geometry.dispose();
                        if (object.material) {
                            if (Array.isArray(object.material)) object.material.forEach((m: THREE.Material) => m.dispose());
                            else object.material.dispose();
                        }
                    }
                });
            }
            renderer.dispose();
        };
    }, []);

    // Effect to update theme without re-initializing WebGL
    useEffect(() => {
        const { scene, grid, hemiLight, dirLight } = threeRef.current;
        if (!scene || !grid) return;

        scene.background = new THREE.Color(isNightMode ? 0x1e293b : 0xfef3c7);
        scene.fog = new THREE.Fog(isNightMode ? 0x0f172a : 0xfde68a, 8, 30);

        if (hemiLight) hemiLight.intensity = isNightMode ? 2.5 : 1.5;
        if (dirLight) dirLight.intensity = isNightMode ? 3.0 : 2.0;

        scene.remove(grid);
        const newGrid = new THREE.GridHelper(20, 40, isNightMode ? 0x475569 : 0xfcd34d, isNightMode ? 0x1e293b : 0xfef3c7);
        scene.add(newGrid);
        threeRef.current.grid = newGrid;

    }, [isNightMode]);

    // Sync 3D model with state
    useEffect(() => {
        const { droneGroup } = threeRef.current;
        if (!droneGroup) return;

        while (droneGroup.children.length > 0) droneGroup.remove(droneGroup.children[0]);
        threeRef.current.propsArr = [];

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.2, metalness: 0.6 });
        const armMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.4 });
        const motorMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.1 });
        const propMat = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.8 });
        const pipeMat = new THREE.MeshStandardMaterial({ color: MATERIALS[pipeMatId].color, roughness: 0.1, metalness: 0.5 });
        const camMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 1.0 });

        const coreScale = frame.radius * 0.3;
        const coreGroup = new THREE.Group();
        
        if (frame.arms === 8) {
            // Heavy Octo - Detailed octagonal double-deck core
            const bottomPlate = new THREE.Mesh(new THREE.CylinderGeometry(coreScale, coreScale, 0.05, 8), bodyMat);
            const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(coreScale, coreScale, 0.05, 8), bodyMat);
            topPlate.position.y = 0.15;
            const flightController = new THREE.Mesh(new THREE.BoxGeometry(coreScale * 0.5, 0.1, coreScale * 0.5), armMat);
            flightController.position.y = 0.075;
            coreGroup.add(bottomPlate, topPlate, flightController);
        } else if (frame.class === 'industrial') {
            // Industrial Hex/Quad - Hexagonal thick core with dome
            const coreMesh = new THREE.Mesh(new THREE.CylinderGeometry(coreScale, coreScale, 0.15, 6), bodyMat);
            const dome = new THREE.Mesh(new THREE.SphereGeometry(coreScale * 0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), armMat);
            dome.position.y = 0.075;
            coreGroup.add(coreMesh, dome);
        } else {
            // Medium Quad - Simple round core
            const coreMesh = new THREE.Mesh(new THREE.CylinderGeometry(coreScale, coreScale, 0.1, 16), bodyMat);
            coreGroup.add(coreMesh);
        }
        droneGroup.add(coreGroup);

        const radius = frame.radius;
        for (let i = 0; i < frame.arms; i++) {
            const angle = (i / frame.arms) * Math.PI * 2;
            const armGroup = new THREE.Group();
            armGroup.rotation.y = angle;

            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, radius), armMat);
            arm.position.z = radius / 2;
            armGroup.add(arm);

            const motorScale = motor?.class === 'industrial' ? 1.5 : 1.0;
            const motorHeight = 0.15 * motorScale;
            const motorRadius = 0.1 * motorScale;

            const motorGroup = new THREE.Group();
            const motorBase = new THREE.Mesh(new THREE.CylinderGeometry(motorRadius, motorRadius, motorHeight, 16), motorMat);
            const motorTop = new THREE.Mesh(new THREE.CylinderGeometry(motorRadius * 0.8, motorRadius * 0.8, 0.02, 16), armMat);
            motorTop.position.y = motorHeight / 2 + 0.01;
            motorGroup.add(motorBase, motorTop);
            motorGroup.position.set(0, 0.05 + motorHeight / 2, radius);
            armGroup.add(motorGroup);

            const propSizeInches = prop?.size || 12;
            // 1 inch = 0.0254 meters. 
            const propLenMeters = (propSizeInches * 0.0254);
            const isHeavyProp = propSizeInches >= 30;
            
            // Create a curved, airfoil-like propeller
            const propGroup = new THREE.Group();
            propGroup.position.set(0, 0.05 + motorHeight + 0.02, radius);
            
            // Central Hub
            const hubGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12);
            const hubMesh = new THREE.Mesh(hubGeo, motorMat);
            propGroup.add(hubMesh);

            // Curved Blades
            const numBlades = isHeavyProp ? 3 : 2;
            const bladeGeo = new THREE.SphereGeometry(1, 16, 8);
            
            for (let b = 0; b < numBlades; b++) {
                const bAngle = (b / numBlades) * Math.PI * 2;
                const bladePivot = new THREE.Group();
                bladePivot.rotation.y = bAngle;
                
                const blade = new THREE.Mesh(bladeGeo, propMat);
                blade.scale.set(propLenMeters / 2, 0.005, 0.04 * (isHeavyProp ? 1.5 : 1.0));
                blade.position.x = propLenMeters / 4;
                blade.rotation.z = 0.15; // Pitch angle
                
                bladePivot.add(blade);
                propGroup.add(bladePivot);
            }

            armGroup.add(propGroup);
            threeRef.current.propsArr.push(propGroup as any);
            droneGroup.add(armGroup);
        }

        const fixedLength = (frame.class === 'medium') ? 2.0 : 4.0;
        const density = MATERIALS[pipeMatId].density;
        const volume = payloadMass / density;
        let r = Math.sqrt(volume / (Math.PI * fixedLength));
        if (r < 0.02) r = 0.02; if (r > 0.5) r = 0.5;

        const pipeMesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32), pipeMat);
        pipeMesh.scale.set(r, fixedLength, r);
        pipeMesh.rotation.z = Math.PI / 2;
        pipeMesh.position.y = -1.0;
        droneGroup.add(pipeMesh);

        if (camera && camera.id !== 'none') {
            const camGroup = new THREE.Group();
            const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });

            // Gimbal Mount/Arm (connecting to body)
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8), frameMat);
            arm.position.y = 0.1;
            camGroup.add(arm);

            // Gimbal Ring
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 12, 24), frameMat);
            ring.rotation.x = Math.PI / 2;
            camGroup.add(ring);

            // Camera Body (Ball)
            const gimbalBody = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), camMat);
            camGroup.add(gimbalBody);

            // Lens
            const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16), camMat);
            lens.rotation.x = Math.PI / 2;
            lens.position.z = 0.1;
            camGroup.add(lens);

            camGroup.position.set(0, -0.4, radius * 0.4);
            droneGroup.add(camGroup);
        }

        // Auto-zoom based on frame size — keep drone well-framed
        const targetRadius = frame.radius;
        const zoomDist = Math.max(targetRadius * 3.5, 3);
        threeRef.current.camera?.position.set(zoomDist * 0.8, zoomDist * 0.6, zoomDist);
        threeRef.current.camera?.lookAt(0, 0, 0);

    }, [frame, prop, payloadMass, pipeMatId, camera]);

    const handleZoom = (factor: number) => {
        if (!threeRef.current.camera) return;
        threeRef.current.zoom = Math.max(1, Math.min(20, threeRef.current.zoom + factor));
        const dir = new THREE.Vector3().subVectors(threeRef.current.camera.position, threeRef.current.target).normalize();
        threeRef.current.camera.position.copy(threeRef.current.target).addScaledVector(dir, threeRef.current.zoom);
    };

    const handleReset = () => {
        if (!threeRef.current.camera) return;
        threeRef.current.target.set(0, 0, 0);
        threeRef.current.zoom = 5;
        threeRef.current.camera.position.set(4, 3, 5);
        threeRef.current.camera.lookAt(threeRef.current.target);
    };

    return (
        <div className={`flex-1 w-full h-full overflow-hidden transition-colors group relative ${isNightMode ? 'bg-slate-800' : 'bg-[#fef3c7]'}`}>
            <div ref={mountRef} className="absolute inset-0 z-0 cursor-move" />
            
            {/* Controls Overlay - Moved to top-right to avoid button overlap */}
            <div className="absolute top-24 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40">
                <div className="flex flex-col bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
                    <button 
                        onClick={() => handleZoom(-1)} 
                        className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border-b border-slate-800" 
                        title="Zoom In"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleZoom(1)} 
                        className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border-b border-slate-800" 
                        title="Zoom Out"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleReset} 
                        className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" 
                        title="Reset View"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="absolute top-4 right-6 pointer-events-none opacity-40">
                <div className="text-[9px] text-slate-500 font-mono text-right">
                    DRAG TO ROTATE • SHIFT+DRAG TO PAN<br/>
                    SCROLL TO ZOOM
                </div>
            </div>
        </div>
    );
};
