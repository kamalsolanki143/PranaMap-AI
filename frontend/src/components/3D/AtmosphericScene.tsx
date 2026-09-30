'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

export interface Hotspot3DData {
  id: string;
  name: string;
  aqi: number;
  level: string;
  pm25: number;
  driver: string;
  x: number;
  z: number;
  color: string;
  source?: string;
  truthTier?: 'OBSERVED' | 'MODELLED';
}

interface AtmosphericSceneProps {
  onSelectHotspot?: (hotspot: Hotspot3DData) => void;
  activeHotspotId?: string;
}

export const HOTSPOTS_DATA: Hotspot3DData[] = [
  {
    id: 'anand-vihar',
    name: 'Anand Vihar',
    aqi: 342,
    level: 'Severe',
    pm25: 218,
    driver: 'Arterial Traffic Congestion & Bus Idling (41%)',
    x: 8,
    z: -3,
    color: '#C94B4B',
    source: 'CPCB CAAQMS Station (Anand Vihar)',
    truthTier: 'OBSERVED',
  },
  {
    id: 'punjabi-bagh',
    name: 'Punjabi Bagh',
    aqi: 312,
    level: 'Very Poor',
    pm25: 184,
    driver: 'Heavy Commercial Transport Corridor (36%)',
    x: -7,
    z: -4,
    color: '#D85A4F',
    source: 'CPCB CAAQMS Station (Punjabi Bagh)',
    truthTier: 'OBSERVED',
  },
  {
    id: 'dwarka',
    name: 'Dwarka Sector 8',
    aqi: 271,
    level: 'Poor',
    pm25: 142,
    driver: 'Unpaved Excavation & Road Dust (32%)',
    x: -8,
    z: 6,
    color: '#C47A52',
    source: 'Copernicus CAMS & Sentinel-5P Micro-Dispersion',
    truthTier: 'MODELLED',
  },
  {
    id: 'rk-puram',
    name: 'RK Puram',
    aqi: 238,
    level: 'Moderate / Poor',
    pm25: 126,
    driver: 'Low Wind Dispersion & Stagnation (28%)',
    x: -2,
    z: 4,
    color: '#D89B2B',
    source: 'CPCB CAAQMS Station (RK Puram)',
    truthTier: 'OBSERVED',
  },
  {
    id: 'ito',
    name: 'ITO Central',
    aqi: 289,
    level: 'Poor',
    pm25: 156,
    driver: 'Urban Intersection Traffic Stagnation (38%)',
    x: 2,
    z: -1,
    color: '#C47A52',
    source: 'CPCB CAAQMS Station (ITO)',
    truthTier: 'OBSERVED',
  },
];

export default function AtmosphericScene({ onSelectHotspot, activeHotspotId }: AtmosphericSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot3DData | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot3DData>(HOTSPOTS_DATA[0]);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [activeLayers, setActiveLayers] = useState({
    flowLines: true,
    plumes: true,
    stations: true,
    inversionBoundary: true,
  });

  // Handle Hotspot selection
  const handleSelect = useCallback((hotspot: Hotspot3DData) => {
    setSelectedHotspot(hotspot);
    if (onSelectHotspot) onSelectHotspot(hotspot);
  }, [onSelectHotspot]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Check WebGL availability
    const canvasTest = document.createElement('canvas');
    const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
    if (!gl) {
      setIsWebGLSupported(false);
      return;
    }

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xF4F7F2, 0.022);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 2. Ambient & Daylight Sunlight Lighting
    const ambientLight = new THREE.AmbientLight(0xE0ECF4, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xFFFBEB, 1.4);
    sunLight.position.set(18, 32, 22);
    scene.add(sunLight);

    const bounceLight = new THREE.DirectionalLight(0xD8E5D5, 0.5);
    bounceLight.position.set(-15, 10, -15);
    scene.add(bounceLight);

    // 3. Natural Environmental Terrain Mesh (Airshed Basin)
    const terrainGeo = new THREE.PlaneGeometry(36, 36, 48, 48);
    terrainGeo.rotateX(-Math.PI / 2);

    // Modulate terrain vertices for natural basin topography
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      // Natural basin depression in center, gentle landscape ridge at perimeter
      const distFromCenter = Math.sqrt(vx * vx + vz * vz);
      const elevation = Math.sin(vx * 0.25) * Math.cos(vz * 0.25) * 0.7 + (distFromCenter > 12 ? (distFromCenter - 12) * 0.22 : -0.35);
      pos.setY(i, elevation);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x93AA8A, // Natural foliage green-stone
      roughness: 0.9,
      metalness: 0.05,
      wireframe: false,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.position.y = -0.5;
    scene.add(terrainMesh);

    // Subtle Natural Contour Grid
    const gridHelper = new THREE.GridHelper(36, 36, 0xC4D4C0, 0xDAE4D8);
    gridHelper.position.y = -0.45;
    scene.add(gridHelper);

    // 4. Inversion Boundary Layer (Pale Daylight Sky Ceiling at Y=8)
    const inversionGeo = new THREE.PlaneGeometry(34, 34, 16, 16);
    inversionGeo.rotateX(-Math.PI / 2);
    const inversionMat = new THREE.MeshBasicMaterial({
      color: 0x5B9CC5, // Atmospheric blue
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const inversionMesh = new THREE.Mesh(inversionGeo, inversionMat);
    inversionMesh.position.y = 8;
    scene.add(inversionMesh);

    // 5. Atmospheric Streamlines / Wind Particles (NW -> SE Flow in daylight)
    const particleCount = prefersReducedMotion ? 100 : 380;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleAlphas = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 34;
      particlePositions[i * 3 + 1] = Math.random() * 7 + 0.5;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 34;
      particleSpeeds[i] = 0.035 + Math.random() * 0.045;
      particleAlphas[i] = Math.random();
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle texture - calm atmospheric blue
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 32;
    particleCanvas.height = 32;
    const ctx = particleCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(59, 130, 160, 0.9)');
      grad.addColorStop(0.5, 'rgba(79, 145, 184, 0.4)');
      grad.addColorStop(1, 'rgba(247, 248, 244, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    const particleTexture = new THREE.CanvasTexture(particleCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.7,
      map: particleTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.7,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Interactive Hotspot Nodes (Pillars & Beacon Rings)
    const hotspotGroup = new THREE.Group();
    const interactiveMeshes: THREE.Mesh[] = [];

    HOTSPOTS_DATA.forEach((data) => {
      const colorNum = new THREE.Color(data.color).getHex();

      // Vertical Telemetry Pillar
      const pillarHeight = (data.aqi / 400) * 6 + 1.5;
      const pillarGeo = new THREE.CylinderGeometry(0.18, 0.18, pillarHeight, 16);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: colorNum,
        emissive: colorNum,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.8,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(data.x, pillarHeight / 2, data.z);
      pillar.userData = data;
      hotspotGroup.add(pillar);
      interactiveMeshes.push(pillar);

      // Top Beacon Sphere
      const sphereGeo = new THREE.SphereGeometry(0.55, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: colorNum,
        emissive: colorNum,
        emissiveIntensity: 0.7,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(data.x, pillarHeight, data.z);
      sphere.userData = data;
      hotspotGroup.add(sphere);
      interactiveMeshes.push(sphere);

      // Base Pulsating Concentric Halo
      const ringGeo = new THREE.RingGeometry(0.8, 1.3, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorNum,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(data.x, 0.05, data.z);
      ring.userData = { isRing: true, baseScale: 1, colorNum };
      hotspotGroup.add(ring);

      // Concentration Plume Volume (Semi-transparent ellipsoid)
      const plumeGeo = new THREE.SphereGeometry(2.4, 24, 16);
      plumeGeo.scale(1.2, 0.6, 1.2);
      const plumeMat = new THREE.MeshBasicMaterial({
        color: colorNum,
        transparent: true,
        opacity: 0.12,
        wireframe: true,
      });
      const plume = new THREE.Mesh(plumeGeo, plumeMat);
      plume.position.set(data.x, 1.2, data.z);
      hotspotGroup.add(plume);
    });

    scene.add(hotspotGroup);

    // 7. Raycasting & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);
    let targetCameraX = 0;
    let targetCameraY = 18;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      // Parallax target
      targetCameraX = mouse.x * 3.5;
      targetCameraY = 18 - mouse.y * 2.5;

      // Raycast for hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hitData = intersects[0].object.userData as Hotspot3DData;
        if (hitData && hitData.id) {
          setHoveredHotspot(hitData);
          setTooltipPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top - 15,
          });
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredHotspot(null);
        container.style.cursor = 'default';
      }
    };

    const onClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hitData = intersects[0].object.userData as Hotspot3DData;
        if (hitData && hitData.id) {
          handleSelect(hitData);
        }
      }
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera smooth damping
      if (!prefersReducedMotion) {
        camera.position.x += (targetCameraX - camera.position.x) * 0.04;
        camera.position.y += (targetCameraY - camera.position.y) * 0.04;
        camera.lookAt(0, 1.5, 0);
      }

      // Animate atmospheric particles (Simulating NW wind vector)
      if (!prefersReducedMotion && activeLayers.flowLines) {
        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          // Move from NW (-x, -z) towards SE (+x, +z)
          positions[i * 3] += particleSpeeds[i] * 0.6;
          positions[i * 3 + 2] += particleSpeeds[i] * 0.8;

          // Wrap around boundary
          if (positions[i * 3] > 18) positions[i * 3] = -18;
          if (positions[i * 3 + 2] > 18) positions[i * 3 + 2] = -18;
        }
        particleGeo.attributes.position.needsUpdate = true;
      }

      // Animate pulsating beacon rings
      hotspotGroup.children.forEach((child) => {
        if (child.userData && child.userData.isRing) {
          const mesh = child as THREE.Mesh;
          const s = 1 + Math.sin(elapsedTime * 2.5) * 0.25;
          mesh.scale.set(s, s, s);
          const mat = mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.6 - (s - 1) * 1.5;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      renderer.dispose();
      terrainGeo.dispose();
      terrainMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [handleSelect, activeLayers]);

  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[580px] bg-gradient-to-b from-[#EBF2F7] via-[#F3F6F1] to-[#F7F8F4] rounded-xl overflow-hidden border border-border shadow-xs">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Fallback for WebGL-disabled environments */}
      {!isWebGLSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-surface">
          <div className="w-12 h-12 rounded-full bg-brand-forest/10 border border-brand-forest/30 flex items-center justify-center text-brand-forest mb-3">
            <span className="font-mono text-sm">GIS</span>
          </div>
          <h4 className="font-bold text-sm text-text-primary">Geospatial Airshed Vector Mesh</h4>
          <p className="text-xs text-text-muted mt-1 max-w-sm">
            High-density 2D fallback rendering Delhi NCR airshed telemetry with continuous ground stations.
          </p>
        </div>
      )}

      {/* Top Left HUD: Airshed Identity & Live Status */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-border shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#4F8F62]" />
          <span className="text-xs font-bold text-text-primary font-mono tracking-tight">
            DELHI NCR 3D AIRSHED MESH
          </span>
          <span className="text-border">•</span>
          <span className="text-[10px] font-mono text-brand-forest font-semibold">CAAQMS GROUND COUPLED</span>
        </div>
        <div className="px-2.5 py-1 rounded bg-white/90 backdrop-blur-xs border border-border text-[10px] font-mono text-text-secondary shadow-2xs">
          Atmospheric Inversion: 210m AGL • Wind: NW 7.2 km/h
        </div>
      </div>

      {/* Top Right HUD: 3D Layer Toggles */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-lg border border-border text-xs shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveLayers((prev) => ({ ...prev, flowLines: !prev.flowLines }))}
          className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
            activeLayers.flowLines
              ? 'bg-brand-forest text-white font-semibold shadow-2xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-stone-100'
          }`}
        >
          Wind Streamlines
        </button>
        <button
          type="button"
          onClick={() => setActiveLayers((prev) => ({ ...prev, plumes: !prev.plumes }))}
          className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
            activeLayers.plumes
              ? 'bg-brand-forest text-white font-semibold shadow-2xs'
              : 'text-text-secondary hover:text-text-primary hover:bg-stone-100'
          }`}
        >
          Pollution Volumes
        </button>
      </div>

      {/* Dynamic Hover Tooltip */}
      {hoveredHotspot && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-75 px-3 py-2 rounded-lg bg-white/98 backdrop-blur-md border border-border shadow-lg text-xs space-y-0.5"
          style={{
            left: `${tooltipPos.x + 12}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-text-primary">{hoveredHotspot.name}</span>
            <span
              className="font-mono text-xs font-bold px-1.5 py-0.2 rounded"
              style={{ backgroundColor: `${hoveredHotspot.color}15`, color: hoveredHotspot.color }}
            >
              AQI {hoveredHotspot.aqi}
            </span>
          </div>
          <div className="text-[10px] text-text-muted font-mono">
            PM2.5: <strong className="text-text-primary">{hoveredHotspot.pm25} µg/m³</strong> • {hoveredHotspot.level}
          </div>
          <div className="text-[9px] text-text-secondary pt-0.5 truncate max-w-[200px]">
            {hoveredHotspot.driver}
          </div>
        </div>
      )}

      {/* Bottom Floating Hotspot Drawer: Selected Hotspot Telemetry */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 p-3 rounded-lg bg-white/95 backdrop-blur-md border border-border shadow-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className="w-2.5 h-9 rounded-sm shrink-0"
            style={{ backgroundColor: selectedHotspot.color }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary">
                {selectedHotspot.name}
              </span>
              <span
                className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                style={{ backgroundColor: `${selectedHotspot.color}15`, color: selectedHotspot.color }}
              >
                {selectedHotspot.level} • AQI {selectedHotspot.aqi}
              </span>
            </div>
            <p className="text-[11px] text-text-muted mt-0.5">
              Primary Driver: <span className="text-text-secondary">{selectedHotspot.driver}</span>
            </p>
          </div>
        </div>

        {/* Quick Station Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto shrink-0 pb-1 sm:pb-0">
          {HOTSPOTS_DATA.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => handleSelect(h)}
              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors shrink-0 ${
                selectedHotspot.id === h.id
                  ? 'bg-brand-forest/10 text-brand-forest border border-brand-forest/30 font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-stone-100 border border-transparent'
              }`}
            >
              {h.name} ({h.aqi})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
