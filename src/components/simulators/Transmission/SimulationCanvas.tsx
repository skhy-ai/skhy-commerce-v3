import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SimulationResult } from '../../../types/simulators/transmission';
import { wattsToDbm, RFBand } from '../../../utils/rfUtils';
import { useTheme } from '../../../contexts/ThemeContext';

interface SimulationCanvasProps {
    targetDistKm: number;
    altitudeM: number;
    ctrlDistKm: number;
    activeBand: RFBand;
    envFactor: number;
    relayEnabled: boolean;
    relayMode: 'fixed-wing' | 'ground';
    relayAltKm: number;
    relayOffsetKm: number;
    relayDepthKm: number;
    calcData: SimulationResult;
    platform?: 'multirotor' | 'fixed-wing' | 'rover';
    isCommercialEmail?: boolean;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
    targetDistKm, altitudeM, ctrlDistKm, activeBand, envFactor,
    relayEnabled, relayMode, relayAltKm, relayOffsetKm, relayDepthKm, calcData, platform = 'multirotor', isCommercialEmail
}) => {
    const { isNightMode } = useTheme();
    const mountRef = useRef<HTMLDivElement>(null);
    const threeRef = useRef<any>(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isNightMode ? 0x1e293b : 0xf1f5f9);
        scene.fog = new THREE.FogExp2(isNightMode ? 0x1e293b : 0xf1f5f9, 0.0006);

        const camera = new THREE.PerspectiveCamera(45, width / height, 1, 200000);
        camera.position.set(800, 400, 800);
        camera.lookAt(0, 200, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        mountRef.current.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
        scene.add(hemiLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        scene.add(dirLight);

        const grid = new THREE.GridHelper(50000, 500, isNightMode ? 0x64748b : 0x94a3b8, isNightMode ? 0x334155 : 0xcbd5e1);
        scene.add(grid);

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(50000, 50000), new THREE.MeshStandardMaterial({ color: isNightMode ? 0x1e293b : 0xe2e8f0, roughness: 0.8 }));
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);

        const tower = new THREE.Mesh(new THREE.BoxGeometry(4, 12, 8), new THREE.MeshStandardMaterial({ color: 0x475569 }));
        tower.position.y = 20;
        scene.add(tower);

        const domeMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false });
        const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.5), domeMat);
        scene.add(dome);

        const rxGroup = new THREE.Group();
        const matRx = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });

        if (platform === 'multirotor') {
            const body = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 6), matRx);
            rxGroup.add(body);
            // Quad arms
            [45, -45].forEach(deg => {
                const arm = new THREE.Mesh(new THREE.BoxGeometry(18, 1, 1.5), matRx);
                arm.rotation.y = deg * Math.PI / 180;
                rxGroup.add(arm);
            });
        } else if (platform === 'fixed-wing') {
            const fus = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 25, 12), matRx);
            fus.rotation.x = Math.PI / 2;
            const wing = new THREE.Mesh(new THREE.BoxGeometry(30, 0.5, 4), matRx);
            wing.position.set(0, 0.5, 0);
            rxGroup.add(fus);
            rxGroup.add(wing);
        } else if (platform === 'rover') {
            const body = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 15), matRx);
            body.position.y = 2;
            rxGroup.add(body);
        }
        scene.add(rxGroup);

        const txTarget = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 8), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
        scene.add(txTarget);
        const matTx = txTarget.material as THREE.MeshStandardMaterial;

        const relayGroup = new THREE.Group();
        const fixedWingGroup = new THREE.Group();
        const matRelay = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
        const fus = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 25, 12), matRelay);
        fus.rotation.x = Math.PI / 2;
        fixedWingGroup.add(fus);
        relayGroup.add(fixedWingGroup);

        const roverGroup = new THREE.Group();
        const roverBody = new THREE.Mesh(new THREE.BoxGeometry(8, 3, 12), matRelay);
        roverBody.position.y = 2;
        roverGroup.add(roverBody);
        relayGroup.add(roverGroup);
        scene.add(relayGroup);

        // Lines
        const lineMatJamUp = new THREE.LineDashedMaterial({ color: 0xff0000, dashSize: 20, gapSize: 10, opacity: 0.8, transparent: true });
        const lineMatJamDown = new THREE.LineDashedMaterial({ color: 0xff0000, dashSize: 20, gapSize: 10, opacity: 0.8, transparent: true });
        const lineMatTx = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
        const lineMatRelayUp = new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 40, gapSize: 20, opacity: 0.5, transparent: true });
        const lineMatRelayDown = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
        const lineMatAlt = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.3 });

        const lineJamUp = new THREE.Line(new THREE.BufferGeometry(), lineMatJamUp);
        const lineJamDown = new THREE.Line(new THREE.BufferGeometry(), lineMatJamDown);
        const lineTx = new THREE.Line(new THREE.BufferGeometry(), lineMatTx);
        const lineRelayUp = new THREE.Line(new THREE.BufferGeometry(), lineMatRelayUp);
        const lineRelayDown = new THREE.Line(new THREE.BufferGeometry(), lineMatRelayDown);
        const lineAlt = new THREE.Line(new THREE.BufferGeometry(), lineMatAlt);

        scene.add(lineJamUp, lineJamDown, lineTx, lineRelayUp, lineRelayDown, lineAlt);

        let camState = { r: 800, theta: Math.PI / 4, phi: Math.PI / 3, target: new THREE.Vector3(0, 200, 0) };
        threeRef.current = { scene, camera, renderer, dome, rxGroup, txTarget, relayGroup, fixedWingGroup, roverGroup, matRx, matTx, lines: { lineJamUp, lineJamDown, lineTx, lineRelayUp, lineRelayDown, lineAlt }, camState, grid, plane };

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            camera.position.x = camState.target.x + camState.r * Math.sin(camState.phi) * Math.cos(camState.theta);
            camera.position.z = camState.target.z + camState.r * Math.sin(camState.phi) * Math.sin(camState.theta);
            camera.position.y = camState.target.y + camState.r * Math.cos(camState.phi);
            camera.lookAt(camState.target);

            if (lineJamUp.geometry.attributes.position) lineJamUp.computeLineDistances();
            if (lineJamDown.geometry.attributes.position) lineJamDown.computeLineDistances();
            if (lineRelayUp.visible && lineRelayUp.geometry.attributes.position) lineRelayUp.computeLineDistances();

            renderer.render(scene, camera);
        };
        animate();

        // Drag controls
        let isDragging = false, lastMouse = { x: 0, y: 0 };
        const onDown = (e: MouseEvent) => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; };
        const onUp = () => isDragging = false;
        const onMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            lastMouse = { x: e.clientX, y: e.clientY };

            if (e.shiftKey || e.button === 1) {
                // Pan
                const panSpeed = camState.r * 0.001;
                const forward = new THREE.Vector3().subVectors(camState.target, camera.position).setY(0).normalize();
                const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
                camState.target.addScaledVector(right, -dx * panSpeed);
                camState.target.addScaledVector(forward, dy * panSpeed);
            } else {
                // Rotate
                camState.theta -= dx * 0.01;
                camState.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, camState.phi - dy * 0.01));
            }
        };
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const zoomSpeed = camState.r * 0.05;
            camState.r = Math.max(100, Math.min(100000, camState.r + (e.deltaY > 0 ? zoomSpeed : -zoomSpeed)));
        };

        const container = mountRef.current;
        container.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mousemove', onMove);
        container.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mousemove', onMove);
            container.removeEventListener('mousedown', onDown);
            container.removeEventListener('wheel', onWheel);
            if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    // Theme update logic
    useEffect(() => {
        if (!threeRef.current) return;
        const { scene, grid, plane } = threeRef.current;
        
        scene.background = new THREE.Color(isNightMode ? 0x1e293b : 0xf1f5f9);
        scene.fog = new THREE.FogExp2(isNightMode ? 0x1e293b : 0xf1f5f9, 0.0006);
        
        scene.remove(grid);
        const newGrid = new THREE.GridHelper(50000, 500, isNightMode ? 0x64748b : 0x94a3b8, isNightMode ? 0x334155 : 0xcbd5e1);
        scene.add(newGrid);
        threeRef.current.grid = newGrid;

        plane.material.color.setHex(isNightMode ? 0x1e293b : 0xe2e8f0);
    }, [isNightMode]);

    // Sync logic
    useEffect(() => {
        if (!threeRef.current) return;
        const { dome, rxGroup, txTarget, relayGroup, fixedWingGroup, roverGroup, matRx, matTx, lines } = threeRef.current;
        const scale = 0.1;

        const rxX = targetDistKm * 1000 * scale;
        const rxY = altitudeM * scale;
        rxGroup.position.set(rxX, rxY, 0);

        const txSlantM = ctrlDistKm * 1000;
        let txGroundM = 0;
        if (txSlantM > altitudeM) txGroundM = Math.sqrt(txSlantM ** 2 - altitudeM ** 2);
        const txX = rxX + (txGroundM * scale);
        txTarget.position.set(txX, 5, 0);

        const actualRelayAltM = relayMode === 'ground' ? 5 : (relayAltKm * 1000);
        const relayX = relayOffsetKm * 1000 * scale;
        const relayY = actualRelayAltM * scale;
        const relayZ = relayDepthKm * 1000 * scale;
        relayGroup.position.set(relayX, relayY, relayZ);
        relayGroup.rotation.z = relayMode === 'ground' ? 0 : -Math.PI / 8;

        fixedWingGroup.visible = relayMode === 'fixed-wing' && !isCommercialEmail;
        roverGroup.visible = relayMode === 'ground' && !isCommercialEmail;
        relayGroup.visible = relayEnabled && !isCommercialEmail;

        lines.lineJamUp.geometry.setFromPoints([new THREE.Vector3(0, 20, 0), rxGroup.position]);
        lines.lineJamDown.geometry.setFromPoints([new THREE.Vector3(0, 20, 0), txTarget.position]);
        
        lines.lineJamUp.visible = !isCommercialEmail;
        lines.lineJamDown.visible = !isCommercialEmail;

        lines.lineTx.geometry.setFromPoints([txTarget.position, rxGroup.position]);
        lines.lineAlt.geometry.setFromPoints([rxGroup.position, new THREE.Vector3(rxX, 0, 0)]);
        
        if (relayEnabled && !isCommercialEmail) {
            lines.lineRelayUp.geometry.setFromPoints([txTarget.position, relayGroup.position]);
            lines.lineRelayDown.geometry.setFromPoints([relayGroup.position, rxGroup.position]);
            lines.lineRelayUp.visible = true;
            lines.lineRelayDown.visible = true;
        } else {
            lines.lineRelayUp.visible = false;
            lines.lineRelayDown.visible = false;
        }

        // Status coloring
        if (calcData.up.sir < 0) matRx.color.setHex(0xef4444);
        else if (calcData.up.sir < 5) matRx.color.setHex(0xf59e0b);
        else matRx.color.setHex(0x3b82f6);

        if (calcData.down.sir < 0) matTx.color.setHex(0xef4444);
        else if (calcData.down.sir < 5) matTx.color.setHex(0xf59e0b);
        else matTx.color.setHex(0x10b981);

        const targetPathLoss = wattsToDbm(activeBand.power) + activeBand.gain - (-60);
        const logD = (targetPathLoss - 20 * Math.log10(activeBand.freq) + 27.55) / (10 * envFactor);
        const r = Math.pow(10, logD) * scale;
        dome.scale.set(r, r, r);
    }, [targetDistKm, altitudeM, ctrlDistKm, activeBand, envFactor, relayEnabled, relayAltKm, relayOffsetKm, relayDepthKm, relayMode, calcData]);

    const zoom = (factor: number) => {
        if (!threeRef.current) return;
        const { camState } = threeRef.current;
        const speed = camState.r * 0.2;
        camState.r = Math.max(100, Math.min(100000, camState.r + (factor * speed)));
    };

    const reset = () => {
        if (!threeRef.current) return;
        const { camState } = threeRef.current;
        camState.r = 800;
        camState.theta = Math.PI / 4;
        camState.phi = Math.PI / 3;
        camState.target.set(0, 200, 0);
    };

    const pan = (dx: number, dz: number) => {
        if (!threeRef.current) return;
        const { camState } = threeRef.current;
        const speed = camState.r * 0.1;
        camState.target.x += dx * speed;
        camState.target.z += dz * speed;
    };

    return (
        <div className="w-full h-full relative overflow-hidden group">
            <div ref={mountRef} className={`w-full h-full transition-colors ${isNightMode ? 'bg-slate-950' : 'bg-slate-50'}`} />
            
            {/* Controls Overlay */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex flex-col bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                    <button onClick={() => zoom(-1)} className="p-2 hover:bg-slate-800 text-slate-300 transition-colors border-b border-slate-800" title="Zoom In">+</button>
                    <button onClick={() => zoom(1)} className="p-2 hover:bg-slate-800 text-slate-300 transition-colors border-b border-slate-800" title="Zoom Out">-</button>
                    <button onClick={reset} className="p-2 hover:bg-slate-800 text-slate-300 transition-colors" title="Reset View">⟲</button>
                </div>
                
                <div className="grid grid-cols-3 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                    <div />
                    <button onClick={() => pan(0, -1)} className="p-2 hover:bg-slate-800 text-slate-300 border-r border-b border-slate-800">↑</button>
                    <div />
                    <button onClick={() => pan(-1, 0)} className="p-2 hover:bg-slate-800 text-slate-300 border-r border-slate-800">←</button>
                    <button onClick={() => pan(0, 1)} className="p-2 hover:bg-slate-800 text-slate-300 border-r border-slate-800">↓</button>
                    <button onClick={() => pan(1, 0)} className="p-2 hover:bg-slate-800 text-slate-300">→</button>
                </div>
            </div>
            
            <div className="absolute top-4 left-4 pointer-events-none">
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    DRAG TO ROTATE • SHIFT+DRAG TO PAN • SCROLL TO ZOOM
                </div>
            </div>
        </div>
    );
};
