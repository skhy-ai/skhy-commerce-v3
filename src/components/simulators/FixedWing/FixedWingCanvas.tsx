import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface FixedWingCanvasProps {
    roll: number;
    pitch: number;
    throttle: number;
    t: number;
    motorCount?: number;
    wingspan?: number;
}

export const FixedWingCanvas: React.FC<FixedWingCanvasProps> = ({ roll, pitch, throttle, t, motorCount = 1, wingspan = 2.4 }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const threeRef = useRef<{
        scene?: THREE.Scene,
        camera?: THREE.PerspectiveCamera,
        renderer?: THREE.WebGLRenderer,
        planeGroup?: THREE.Group,
        wing?: THREE.Mesh,
        motorGroup?: THREE.Group,
        props: THREE.Mesh[],
        grid?: THREE.GridHelper,
        target: THREE.Vector3,
        zoom: number,
        t: number
    }>({ props: [], target: new THREE.Vector3(0, 0, 0), zoom: 12, t: 0 });

    const { isNightMode } = useTheme();

    useEffect(() => {
        if (!mountRef.current) return;
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isNightMode ? 0x1e293b : 0xfef3c7);
        scene.fog = new THREE.Fog(isNightMode ? 0x1e293b : 0xfde68a, 10, 50);

        const cam = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        cam.position.set(6, 4, 12);
        cam.lookAt(threeRef.current.target);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.5); // Enhanced visibility
        scene.add(hemiLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 2);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const grid = new THREE.GridHelper(100, 100, isNightMode ? 0x334155 : 0xfcd34d, isNightMode ? 0x1e293b : 0xfef3c7);
        grid.position.y = -2;
        scene.add(grid);

        // Plane Group
        const planeGroup = new THREE.Group();
        scene.add(planeGroup);

        const fuseMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.2, metalness: 0.5 });
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.3 });
        const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.7, roughness: 0.05, metalness: 0.8 });

        // Fuselage
        const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.1, 4, 16), fuseMat);
        fuselage.rotation.x = Math.PI / 2;
        planeGroup.add(fuselage);

        // Cockpit
        const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), cockpitMat);
        cockpit.scale.set(1, 1, 1.5);
        cockpit.position.set(0, 0.15, 0.8);
        planeGroup.add(cockpit);

        // Main Wing
        const wing = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 0.8), wingMat);
        wing.position.set(0, 0.2, 0.1);
        planeGroup.add(wing);

        // Vertical Stabilizer
        const vStab = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.5), wingMat);
        vStab.position.set(0, 0.4, -1.8);
        planeGroup.add(vStab);

        // Horizontal Stabilizer
        const hStab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.4), wingMat);
        hStab.position.set(0, 0.1, -1.8);
        planeGroup.add(hStab);

        // Motor Group
        const motorGroup = new THREE.Group();
        planeGroup.add(motorGroup);

        threeRef.current = { ...threeRef.current, scene, camera: cam, renderer, planeGroup, wing, motorGroup, grid };

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            
            const propSpeed = (throttle / 100) * 0.5 + 0.05;
            threeRef.current.props.forEach(p => {
                p.rotation.z += propSpeed;
            });

            // Floating movement (using synced simulation time)
            const time = threeRef.current.t;
            if (threeRef.current.planeGroup) {
                threeRef.current.planeGroup.position.y = Math.sin(time * 0.5) * 0.1;
                threeRef.current.planeGroup.rotation.z = THREE.MathUtils.lerp(threeRef.current.planeGroup.rotation.z, -roll * Math.PI / 180, 0.1);
                threeRef.current.planeGroup.rotation.x = THREE.MathUtils.lerp(threeRef.current.planeGroup.rotation.x, pitch * Math.PI / 180, 0.1);
            }

            renderer.render(scene, cam);
        };
        animate();

        // Interaction logic
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
            threeRef.current.zoom = Math.max(2, Math.min(50, threeRef.current.zoom + e.deltaY * 0.01));
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

    // Theme Effect
    useEffect(() => {
        const { scene, grid } = threeRef.current;
        if (!scene || !grid) return;

        scene.background = new THREE.Color(isNightMode ? 0x1e293b : 0xfef3c7);
        scene.fog = new THREE.Fog(isNightMode ? 0x1e293b : 0xfde68a, 10, 50);

        scene.remove(grid);
        const newGrid = new THREE.GridHelper(100, 100, isNightMode ? 0x334155 : 0xfcd34d, isNightMode ? 0x1e293b : 0xfef3c7);
        newGrid.position.y = -2;
        scene.add(newGrid);
        threeRef.current.grid = newGrid;
    }, [isNightMode]);

    // Effect for dynamic updates
    useEffect(() => {
        const { wing, motorGroup } = threeRef.current;
        if (!wing || !motorGroup) return;

        // Update wing scaling (assume base width of 1m)
        wing.scale.x = wingspan * 2; // Scaled for visual impact

        // Scale horizontal stabilizer proportionally
        const hStab = threeRef.current.planeGroup?.children.find(c => (c as THREE.Mesh).geometry.type === 'BoxGeometry' && c.position.z === -1.8 && c.position.y === 0.1);
        if (hStab) {
            hStab.scale.x = (wingspan / 2.4) * 1.5;
        }

        // Rebuild Motors
        while(motorGroup.children.length > 0) {
            motorGroup.remove(motorGroup.children[0]);
        }
        threeRef.current.props = [];

        const propMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        const bladeGeo = new THREE.SphereGeometry(1, 16, 8);

        if (motorCount === 1) {
            // Standard Pusher
            const pGroup = new THREE.Group();
            pGroup.position.set(0, 0, -2);
            motorGroup.add(pGroup);

            // Refined Curved Propeller
            const propLen = 1.6;
            
            const blade1 = new THREE.Mesh(bladeGeo, propMat);
            blade1.scale.set(propLen / 2, 0.005, 0.06);
            blade1.position.x = propLen / 4;
            blade1.rotation.z = 0.15;
            pGroup.add(blade1);

            const blade2 = new THREE.Mesh(bladeGeo, propMat);
            blade2.scale.set(propLen / 2, 0.005, 0.06);
            blade2.position.x = -propLen / 4;
            blade2.rotation.z = -0.15;
            pGroup.add(blade2);

            threeRef.current.props.push(pGroup as any);
        } else {
            // Twin/Multi-engine on wings
            const spacing = (wingspan * 2) / (motorCount + 1);
            for (let i = 0; i < motorCount; i++) {
                const xPos = -(wingspan) + (i + 1) * spacing;
                
                const pGroup = new THREE.Group();
                pGroup.position.set(xPos, 0.2, 0.6); // Moved forward for better visibility
                motorGroup.add(pGroup);

                const propLen = 1.2; // Longer for visibility
                const bladeGeo = new THREE.SphereGeometry(1, 16, 8);

                const b1 = new THREE.Mesh(bladeGeo, propMat);
                b1.scale.set(propLen / 2, 0.01, 0.06);
                b1.position.x = propLen / 4;
                b1.rotation.z = 0.15;
                pGroup.add(b1);

                const b2 = new THREE.Mesh(bladeGeo, propMat);
                b2.scale.set(propLen / 2, 0.01, 0.06);
                b2.position.x = -propLen / 4;
                b2.rotation.z = -0.15;
                pGroup.add(b2);

                threeRef.current.props.push(pGroup as any);

                // Small nacelle
                const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.6, 8), propMat);
                nacelle.rotation.x = Math.PI / 2;
                pGroup.add(nacelle);
            }
        }

    }, [wingspan, motorCount]);

    // Update simulation time ref
    useEffect(() => {
        threeRef.current.t = t;
    }, [t]);

    const handleZoom = (factor: number) => {
        if (!threeRef.current.camera) return;
        threeRef.current.zoom = Math.max(2, Math.min(50, threeRef.current.zoom + factor * 2));
        const dir = new THREE.Vector3().subVectors(threeRef.current.camera.position, threeRef.current.target).normalize();
        threeRef.current.camera.position.copy(threeRef.current.target).addScaledVector(dir, threeRef.current.zoom);
    };

    const handleReset = () => {
        if (!threeRef.current.camera) return;
        threeRef.current.target.set(0, 0, 0);
        threeRef.current.zoom = 12;
        threeRef.current.camera.position.set(6, 4, 12);
        threeRef.current.camera.lookAt(threeRef.current.target);
    };

    return (
        <div className={`flex-1 w-full h-full relative overflow-hidden select-none transition-colors group ${isNightMode ? 'bg-slate-800' : 'bg-[#fef3c7]'}`}>
            {/* Three.js Container */}
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

            {/* HUD Info */}
            <div className={`absolute top-4 left-4 z-30 font-mono text-[10px] space-y-1 p-2 rounded border ${isNightMode ? 'text-sky-400 bg-slate-900/50 border-sky-500/20' : 'text-slate-700 bg-white/50 border-slate-300'}`}>
                <div>ROLL: {roll.toFixed(1)}°</div>
                <div>PITCH: {pitch.toFixed(1)}°</div>
                <div>THRUST: {throttle}%</div>
                <div>MOTORS: {motorCount}</div>
                <div>SPAN: {wingspan}m</div>
            </div>
            
            <div className="absolute top-4 right-6 pointer-events-none opacity-40">
                <div className="text-[9px] text-slate-500 font-mono">
                    DRAG TO ROTATE • SHIFT+DRAG TO PAN
                </div>
            </div>
        </div>
    );
};
