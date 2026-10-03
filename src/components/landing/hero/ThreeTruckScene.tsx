import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeTruckSceneProps {
  progress: number; // 0 to 1 during reveal animation
  isBursting: boolean;
}

export const ThreeTruckScene: React.FC<ThreeTruckSceneProps> = ({ progress, isBursting }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    truckGroup: THREE.Group;
    particles: THREE.Points;
    headlightR: THREE.SpotLight;
    headlightL: THREE.SpotLight;
    reqId: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // 1. Scene & Camera setup
      const width = containerRef.current.clientWidth || 800;
      const height = containerRef.current.clientHeight || 500;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050811, 0.04);

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 1.2, 7.5);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);

      // 2. Lighting setup (Cinematic luxury commercial lighting)
      const ambientLight = new THREE.AmbientLight(0x0e172a, 1.8);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xe0f2fe, 3.5);
      keyLight.position.set(5, 8, 6);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 4.0);
      rimLight.position.set(-6, 3, -4);
      scene.add(rimLight);

      const underGlow = new THREE.PointLight(0x0284c7, 2.5, 8);
      underGlow.position.set(0, 0.1, 0);
      scene.add(underGlow);

      // Headlights
      const headlightR = new THREE.SpotLight(0xffffff, 8, 20, Math.PI / 8, 0.4, 1);
      headlightR.position.set(0.65, 0.75, 2.4);
      headlightR.target.position.set(0.8, 0.1, 10);
      scene.add(headlightR);
      scene.add(headlightR.target);

      const headlightL = new THREE.SpotLight(0xffffff, 8, 20, Math.PI / 8, 0.4, 1);
      headlightL.position.set(-0.65, 0.75, 2.4);
      headlightL.target.position.set(-0.8, 0.1, 10);
      scene.add(headlightL);
      scene.add(headlightL.target);

      // 3. Procedural Luxury High-Tech Freight Truck
      const truckGroup = new THREE.Group();

      // Materials
      const cabinPaint = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        metalness: 0.92,
        roughness: 0.18,
      });

      const silverTrim = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.95,
        roughness: 0.1,
      });

      const windshieldGlass = new THREE.MeshStandardMaterial({
        color: 0x021329,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.85,
      });

      const cyanEmissive = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 2.5,
      });

      const darkAlloy = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.4,
      });

      const tireRubber = new THREE.MeshStandardMaterial({
        color: 0x0a0d14,
        roughness: 0.9,
      });

      // Cab Body (Sleek aerodynamic curves)
      const cabGeo = new THREE.BoxGeometry(1.6, 1.35, 1.8);
      const cab = new THREE.Mesh(cabGeo, cabinPaint);
      cab.position.set(0, 0.95, 1.3);
      truckGroup.add(cab);

      // Cab Roof Aerofoil
      const roofGeo = new THREE.BoxGeometry(1.58, 0.35, 1.7);
      const roof = new THREE.Mesh(roofGeo, cabinPaint);
      roof.position.set(0, 1.65, 1.25);
      truckGroup.add(roof);

      // Panoramic Windshield
      const windshieldGeo = new THREE.BoxGeometry(1.48, 0.65, 0.2);
      const windshield = new THREE.Mesh(windshieldGeo, windshieldGlass);
      windshield.position.set(0, 1.2, 2.12);
      windshield.rotation.x = -Math.PI * 0.08;
      truckGroup.add(windshield);

      // Front Grill / Modern LED Lightbar
      const grillGeo = new THREE.BoxGeometry(1.4, 0.45, 0.1);
      const grill = new THREE.Mesh(grillGeo, darkAlloy);
      grill.position.set(0, 0.65, 2.22);
      truckGroup.add(grill);

      const ledBarGeo = new THREE.BoxGeometry(1.42, 0.04, 0.08);
      const ledBar = new THREE.Mesh(ledBarGeo, cyanEmissive);
      ledBar.position.set(0, 0.85, 2.24);
      truckGroup.add(ledBar);

      // SwiftRoute Logo Emblem on Grill
      const emblemGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 24);
      const emblem = new THREE.Mesh(emblemGeo, silverTrim);
      emblem.rotation.x = Math.PI / 2;
      emblem.position.set(0, 0.65, 2.28);
      truckGroup.add(emblem);

      // Headlight housings
      const hlGeo = new THREE.BoxGeometry(0.24, 0.12, 0.08);
      const hlRight = new THREE.Mesh(hlGeo, cyanEmissive);
      hlRight.position.set(0.62, 0.68, 2.24);
      truckGroup.add(hlRight);

      const hlLeft = new THREE.Mesh(hlGeo, cyanEmissive);
      hlLeft.position.set(-0.62, 0.68, 2.24);
      truckGroup.add(hlLeft);

      // Heavy Cargo Trailer
      const trailerPaint = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.7,
        roughness: 0.35,
      });

      const trailerGeo = new THREE.BoxGeometry(1.7, 1.85, 4.4);
      const trailer = new THREE.Mesh(trailerGeo, trailerPaint);
      trailer.position.set(0, 1.28, -1.8);
      truckGroup.add(trailer);

      // Lateral Cybernetic Glow Ribs on Trailer
      const ribGeo = new THREE.BoxGeometry(1.72, 0.03, 4.2);
      const rib = new THREE.Mesh(ribGeo, cyanEmissive);
      rib.position.set(0, 1.25, -1.8);
      truckGroup.add(rib);

      // Chassis frame
      const chassisGeo = new THREE.BoxGeometry(1.4, 0.25, 6.2);
      const chassis = new THREE.Mesh(chassisGeo, darkAlloy);
      chassis.position.set(0, 0.32, -0.6);
      truckGroup.add(chassis);

      // Wheels helper
      const createWheel = (x: number, y: number, z: number) => {
        const wheelGroup = new THREE.Group();
        const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.25, 28);
        const tire = new THREE.Mesh(tireGeo, tireRubber);
        tire.rotation.z = Math.PI / 2;
        wheelGroup.add(tire);

        const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.26, 24);
        const rim = new THREE.Mesh(rimGeo, silverTrim);
        rim.rotation.z = Math.PI / 2;
        wheelGroup.add(rim);

        wheelGroup.position.set(x, y, z);
        return wheelGroup;
      };

      // 6 Wheel sets
      truckGroup.add(createWheel(0.85, 0.38, 1.3));
      truckGroup.add(createWheel(-0.85, 0.38, 1.3));
      truckGroup.add(createWheel(0.88, 0.38, -2.6));
      truckGroup.add(createWheel(-0.88, 0.38, -2.6));
      truckGroup.add(createWheel(0.88, 0.38, -3.4));
      truckGroup.add(createWheel(-0.88, 0.38, -3.4));

      // Initial position: starts behind the paper plane
      truckGroup.position.set(0, -0.2, -6);
      truckGroup.rotation.y = 0.05;
      scene.add(truckGroup);

      // 4. Particle Atmosphere (Stardust / GPS coordinate telemetry nodes)
      const particleCount = 200;
      const particleGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 16;
        posArray[i + 1] = (Math.random() - 0.2) * 8;
        posArray[i + 2] = (Math.random() - 0.5) * 16;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMat = new THREE.PointsMaterial({
        size: 0.04,
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Resize handler
      const handleResize = () => {
        if (!containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Animation Loop
      let clock = new THREE.Clock();
      const animate = () => {
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Particles drift like high-speed highway air
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 2; i < particleCount * 3; i += 3) {
          positions[i] += delta * 4;
          if (positions[i] > 8) positions[i] = -8;
        }
        particleGeo.attributes.position.needsUpdate = true;

        // Gentle chassis suspension bounce
        truckGroup.position.y = -0.1 + Math.sin(time * 6) * 0.015;

        renderer.render(scene, camera);
        sceneRef.current!.reqId = requestAnimationFrame(animate);
      };

      sceneRef.current = {
        renderer,
        scene,
        camera,
        truckGroup,
        particles,
        headlightR,
        headlightL,
        reqId: requestAnimationFrame(animate),
      };

      return () => {
        window.removeEventListener('resize', handleResize);
        if (sceneRef.current) {
          cancelAnimationFrame(sceneRef.current.reqId);
          renderer.dispose();
        }
      };
    } catch {
      // Graceful fallback if WebGL is unavailable
      setWebGLFailed(true);
    }
  }, []);

  // Update truck forward motion based on progress
  useEffect(() => {
    if (!sceneRef.current) return;
    const { truckGroup, camera } = sceneRef.current;

    // Progress 0 to 1 translates truck forward from z = -6 to z = 0.5
    const targetZ = isBursting ? -6 + progress * 7.5 : -6;
    truckGroup.position.z = THREE.MathUtils.lerp(truckGroup.position.z, targetZ, 0.15);

    // Subtle camera drift
    camera.position.x = Math.sin(progress * Math.PI) * 0.35;
    camera.lookAt(0, 0.8, 0);
  }, [progress, isBursting]);

  if (webGLFailed) {
    // High-fidelity 2D Vector Cinematic Fallback
    return (
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-blue-950/40 via-[#050811] to-[#050811]" />
        <div
          className="relative z-10 transition-transform duration-700 ease-out transform"
          style={{
            transform: `scale(${0.6 + progress * 0.4}) translateZ(0)`,
            opacity: progress > 0.1 ? 1 : 0.2,
          }}
        >
          {/* Detailed SVG luxury aerodynamic logistics hauler */}
          <svg className="w-[360px] sm:w-[500px] drop-shadow-[0_20px_40px_rgba(2,132,199,0.35)]" viewBox="0 0 500 240" fill="none">
            {/* Ground shadow */}
            <ellipse cx="250" cy="210" rx="200" ry="14" fill="#0284c7" opacity="0.3" filter="blur(16px)" />
            {/* Trailer Body */}
            <rect x="50" y="40" width="280" height="130" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <line x1="50" y1="105" x2="330" y2="105" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
            <text x="110" y="95" fill="#f8fafc" fontSize="16" fontFamily="Manrope, sans-serif" fontWeight="800" letterSpacing="6">
              SWIFTROUTE
            </text>
            <text x="135" y="125" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono, monospace" letterSpacing="3">
              EXPRESS CARGO
            </text>
            {/* Cabin Body */}
            <path d="M330 65 L400 70 L445 110 L450 170 L330 170 Z" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Windshield */}
            <path d="M385 75 L430 110 L395 110 L345 80 Z" fill="#0284c7" fillOpacity="0.4" stroke="#7dd3fc" strokeWidth="1" />
            {/* Headlight beam */}
            <polygon points="450,150 495,120 495,185 450,165" fill="url(#hlGlow)" opacity="0.75" />
            {/* Wheels */}
            <circle cx="110" cy="175" r="22" fill="#090d16" stroke="#475569" strokeWidth="6" />
            <circle cx="170" cy="175" r="22" fill="#090d16" stroke="#475569" strokeWidth="6" />
            <circle cx="395" cy="175" r="22" fill="#090d16" stroke="#475569" strokeWidth="6" />
            <defs>
              <linearGradient id="hlGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing pointer-events-none select-none"
    />
  );
};
