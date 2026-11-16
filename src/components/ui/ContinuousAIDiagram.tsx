import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Shield, Plane, Ship, Radar, Anchor, Crosshair } from 'lucide-react';

export const ContinuousAIDiagram: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [nodes2D, setNodes2D] = useState<{ id: string; x: number; y: number }[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Setup Scene, Camera, Renderer
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || (width < 640 ? 380 : 500);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050a14, 0.05);

    const getCameraZ = (w: number) => {
      if (w < 480) return 17;
      if (w < 640) return 15;
      if (w < 1024) return 13.5;
      return 12;
    };

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, width < 640 ? 1.2 : 2, getCameraZ(width));
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Define Node Positions (3D)
    // Distributed in a pentagon shape around the center
    const positions = {
      center: new THREE.Vector3(0, 0, 0),
      air: new THREE.Vector3(0, 3.5, 0),
      sea: new THREE.Vector3(-4.5, 0.5, 1),
      usv: new THREE.Vector3(-2.5, -3, 2),
      tank: new THREE.Vector3(2.5, -3, 2),
      land: new THREE.Vector3(4.5, 0.5, 1)
    };

    // 3. Create connecting lines (Mesh)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x444455, transparent: true, opacity: 0.5 });
    const createLine = (start: THREE.Vector3, end: THREE.Vector3) => {
      const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
      return new THREE.Line(geo, lineMaterial);
    };
    scene.add(createLine(positions.center, positions.air));
    scene.add(createLine(positions.center, positions.sea));
    scene.add(createLine(positions.center, positions.usv));
    scene.add(createLine(positions.center, positions.tank));
    scene.add(createLine(positions.center, positions.land));

    // Lateral Mesh Connections
    scene.add(createLine(positions.air, positions.sea));
    scene.add(createLine(positions.sea, positions.usv));
    scene.add(createLine(positions.usv, positions.tank));
    scene.add(createLine(positions.tank, positions.land));
    scene.add(createLine(positions.land, positions.air));

    // 4. Create Animated Arrow Particles (Data Flow)
    const arrowGeo = new THREE.ConeGeometry(0.15, 0.4, 8);
    arrowGeo.rotateX(Math.PI / 2); // Point along Z axis

    const inMaterial = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Red for incoming (Positives)
    const outMaterial = new THREE.MeshBasicMaterial({ color: 0x00f0ff }); // Cyan for outgoing (OTA)
    const meshMaterial = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Yellow for inter-node telemetry

    interface FlowArrow {
      mesh: THREE.Mesh;
      start: THREE.Vector3;
      end: THREE.Vector3;
      progress: number;
      speed: number;
    }
    const arrows: FlowArrow[] = [];

    const addArrow = (start: THREE.Vector3, end: THREE.Vector3, material: THREE.Material, speed: number, offset: number) => {
      const mesh = new THREE.Mesh(arrowGeo, material);
      scene.add(mesh);
      
      // Look at destination
      mesh.position.copy(start);
      mesh.lookAt(end);
      
      arrows.push({ mesh, start, end, progress: offset, speed });
    };

    // Edge -> Center (Red)
    addArrow(positions.air, positions.center, inMaterial, 0.005, 0);
    addArrow(positions.sea, positions.center, inMaterial, 0.006, 0.3);
    addArrow(positions.usv, positions.center, inMaterial, 0.005, 0.8);
    addArrow(positions.tank, positions.center, inMaterial, 0.0055, 0.2);
    addArrow(positions.land, positions.center, inMaterial, 0.0045, 0.6);

    // Center -> Edge (Cyan)
    addArrow(positions.center, positions.air, outMaterial, 0.004, 0.5);
    addArrow(positions.center, positions.sea, outMaterial, 0.0045, 0.1);
    addArrow(positions.center, positions.usv, outMaterial, 0.004, 0.7);
    addArrow(positions.center, positions.tank, outMaterial, 0.005, 0.4);
    addArrow(positions.center, positions.land, outMaterial, 0.0042, 0.8);

    // Lateral Inter-Node Telemetry (Yellow)
    addArrow(positions.air, positions.sea, meshMaterial, 0.003, 0.2);
    addArrow(positions.sea, positions.usv, meshMaterial, 0.0035, 0.5);
    addArrow(positions.usv, positions.tank, meshMaterial, 0.004, 0.1);
    addArrow(positions.tank, positions.land, meshMaterial, 0.003, 0.7);
    addArrow(positions.land, positions.air, meshMaterial, 0.0032, 0.4);
    
    // Reverse Lateral Flow
    addArrow(positions.sea, positions.air, meshMaterial, 0.0032, 0.8);
    addArrow(positions.usv, positions.sea, meshMaterial, 0.003, 0.3);
    addArrow(positions.tank, positions.usv, meshMaterial, 0.004, 0.6);
    addArrow(positions.land, positions.tank, meshMaterial, 0.0028, 0.9);
    addArrow(positions.air, positions.land, meshMaterial, 0.0035, 0.1);

    // 5. Add ambient decorative particles (Stars/Grid nodes)
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 100;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount*3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.05, transparent: true, opacity: 0.3 });
    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // 6. Add Node "Glow" spheres in 3D to ground the HTML icons
    const centerGlow = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.2 }));
    centerGlow.position.copy(positions.center);
    scene.add(centerGlow);

    const edgeGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.2 });
    
    const airGlow = new THREE.Mesh(edgeGeo, edgeMat);
    airGlow.position.copy(positions.air);
    scene.add(airGlow);

    const seaGlow = new THREE.Mesh(edgeGeo, edgeMat);
    seaGlow.position.copy(positions.sea);
    scene.add(seaGlow);

    const usvGlow = new THREE.Mesh(edgeGeo, edgeMat);
    usvGlow.position.copy(positions.usv);
    scene.add(usvGlow);

    const tankGlow = new THREE.Mesh(edgeGeo, edgeMat);
    tankGlow.position.copy(positions.tank);
    scene.add(tankGlow);

    const landGlow = new THREE.Mesh(edgeGeo, edgeMat);
    landGlow.position.copy(positions.land);
    scene.add(landGlow);


    // 7. Animation Loop
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.01;

      // Slowly rotate scene for dynamic feel
      scene.rotation.y = Math.sin(time * 0.5) * 0.1;
      scene.rotation.x = Math.cos(time * 0.3) * 0.05;

      // Pulse glows
      const scale = 1 + Math.sin(time * 5) * 0.1;
      centerGlow.scale.set(scale, scale, scale);
      airGlow.scale.set(scale, scale, scale);
      seaGlow.scale.set(scale, scale, scale);
      usvGlow.scale.set(scale, scale, scale);
      tankGlow.scale.set(scale, scale, scale);
      landGlow.scale.set(scale, scale, scale);

      // Move arrows
      arrows.forEach(arr => {
        arr.progress += arr.speed;
        if (arr.progress > 1) arr.progress = 0;
        
        // Linear interpolation
        arr.mesh.position.lerpVectors(arr.start, arr.end, arr.progress);
      });

      // Update 2D positions for HTML Overlays
      const to2D = (pos: THREE.Vector3, id: string) => {
        const vec = pos.clone();
        // Apply scene rotation to the position before projecting
        vec.applyMatrix4(scene.matrixWorld);
        vec.project(camera);
        return {
          id,
          x: (vec.x *  .5 + .5) * width,
          y: (vec.y * -.5 + .5) * height
        };
      };

      setNodes2D([
        to2D(positions.center, 'center'),
        to2D(positions.air, 'air'),
        to2D(positions.sea, 'sea'),
        to2D(positions.usv, 'usv'),
        to2D(positions.tank, 'tank'),
        to2D(positions.land, 'land')
      ]);

      renderer.render(scene, camera);
    };
    animate();

    // 8. Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || (w < 640 ? 380 : 500);
      camera.aspect = w / h;
      camera.position.set(0, w < 640 ? 1.2 : 2, getCameraZ(w));
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      // Clean up Three.js resources
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full border border-white/10 bg-[#050a14] relative rounded-lg shadow-glow-accent mb-8 overflow-hidden">
      
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-[380px] sm:h-[450px] md:h-[500px]" />

      {/* HTML Overlays (Sync with 3D positions) */}
      {nodes2D.map(node => {
        let Icon = Shield;
        let title = "Command Center";
        let color = "text-[#a78bfa]";
        let borderColor = "border-[#a78bfa]";
        let bg = "bg-[#a78bfa]/10";

        if (node.id === 'air') {
          Icon = Plane;
          title = "Air Node";
          color = "text-[#00f0ff]";
          borderColor = "border-[#00f0ff]";
          bg = "bg-[#00f0ff]/10";
        } else if (node.id === 'sea') {
          Icon = Anchor;
          title = "Sea Buoy";
          color = "text-[#00f0ff]";
          borderColor = "border-[#00f0ff]";
          bg = "bg-[#00f0ff]/10";
        } else if (node.id === 'usv') {
          Icon = Ship;
          title = "USV";
          color = "text-[#00f0ff]";
          borderColor = "border-[#00f0ff]";
          bg = "bg-[#00f0ff]/10";
        } else if (node.id === 'tank') {
          Icon = Crosshair;
          title = "Armour Tank";
          color = "text-[#00f0ff]";
          borderColor = "border-[#00f0ff]";
          bg = "bg-[#00f0ff]/10";
        } else if (node.id === 'land') {
          Icon = Radar;
          title = "Land Sensor";
          color = "text-[#00f0ff]";
          borderColor = "border-[#00f0ff]";
          bg = "bg-[#00f0ff]/10";
        }

        return (
          <div 
            key={node.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 sm:gap-2 pointer-events-none transition-all duration-75`}
            style={{ left: `${node.x}px`, top: `${node.y}px` }}
          >
            <div className={`p-2 sm:p-3 rounded-full border ${borderColor} ${bg} backdrop-blur-sm flex items-center justify-center`}>
              <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${color}`} />
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-[9px] sm:text-xs uppercase tracking-wider bg-black/60 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                {title}
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend Overlay */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/75 backdrop-blur-md border border-white/10 p-2 sm:p-4 rounded-lg pointer-events-none max-w-[170px] sm:max-w-none">
        <h4 className="text-white text-[9px] sm:text-xs font-bold tracking-widest mb-1.5 sm:mb-3 uppercase">Mesh Data Flow</h4>
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <div className="w-4 sm:w-6 h-0.5 bg-[#ef4444] relative shrink-0">
            <div className="w-0 h-0 border-t-[3px] sm:border-t-4 border-t-transparent border-b-[3px] sm:border-b-4 border-b-transparent border-l-[4px] sm:border-l-[6px] border-l-[#ef4444] absolute right-0 top-1/2 -translate-y-1/2 translate-x-full"></div>
          </div>
          <span className="text-[#a0a0a0] text-[8px] sm:text-[10px] uppercase truncate">Telemetry to Cmd</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          <div className="w-4 sm:w-6 h-0.5 bg-[#00f0ff] relative shrink-0">
            <div className="w-0 h-0 border-t-[3px] sm:border-t-4 border-t-transparent border-b-[3px] sm:border-b-4 border-b-transparent border-l-[4px] sm:border-l-[6px] border-l-[#00f0ff] absolute right-0 top-1/2 -translate-y-1/2 translate-x-full"></div>
          </div>
          <span className="text-[#a0a0a0] text-[8px] sm:text-[10px] uppercase truncate">OTA Model Updates</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-4 sm:w-6 h-0.5 bg-[#facc15] relative shrink-0">
            <div className="w-0 h-0 border-t-[3px] sm:border-t-4 border-t-transparent border-b-[3px] sm:border-b-4 border-b-transparent border-l-[4px] sm:border-l-[6px] border-l-[#facc15] absolute right-0 top-1/2 -translate-y-1/2 translate-x-full"></div>
          </div>
          <span className="text-[#a0a0a0] text-[8px] sm:text-[10px] uppercase truncate">Mesh Telemetry Sharing</span>
        </div>
      </div>
    </div>
  );
};
