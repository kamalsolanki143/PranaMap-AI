'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CosmicHero3DProps {
  onSatelliteClick?: (satelliteName: string) => void;
  className?: string;
}

export default function CosmicHero3D({ onSatelliteClick, className = '' }: CosmicHero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 750;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060312, 0.0016);

    const initialCameraZ = width < 640 ? 30 : width < 1024 ? 26 : 22;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, initialCameraZ);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. Starfield & Cosmic Dust Particles
    const starCount = 2000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const colorPalette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#f59e0b'), // warm amber
      new THREE.Color('#c084fc'), // violet
      new THREE.Color('#38bdf8'), // electric cyan
      new THREE.Color('#fb923c'), // radiant orange
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 55 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;

      starSizes[i] = Math.random() * 2.8 + 0.8;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 3. Central Atmospheric Globe (The Planet)
    // Procedural canvas texture featuring Earth-like continents & golden/amber atmospheric glow
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 1024;
    textureCanvas.height = 512;
    const ctx = textureCanvas.getContext('2d');
    if (ctx) {
      // Warm cosmic planetary gradient matching reference image
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#1a0c2e');
      oceanGrad.addColorStop(0.3, '#3b1854');
      oceanGrad.addColorStop(0.65, '#853e16');
      oceanGrad.addColorStop(0.85, '#a44d18');
      oceanGrad.addColorStop(1, '#230e3b');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Continent landmass shapes in warm amber
      ctx.fillStyle = 'rgba(245, 158, 11, 0.42)';
      for (let i = 0; i < 45; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const r = 30 + Math.random() * 70;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Swirling atmospheric clouds in soft white/cream
      ctx.fillStyle = 'rgba(255, 245, 230, 0.22)';
      for (let i = 0; i < 70; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const rw = 60 + Math.random() * 140;
        const rh = 12 + Math.random() * 35;
        ctx.beginPath();
        ctx.ellipse(x, y, rw, rh, Math.PI / 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const planetTexture = new THREE.CanvasTexture(textureCanvas);
    planetTexture.wrapS = THREE.RepeatWrapping;
    planetTexture.wrapT = THREE.ClampToEdgeWrapping;

    const planetRadius = 8.8;
    const planetGeometry = new THREE.SphereGeometry(planetRadius, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: planetTexture,
      roughness: 0.55,
      metalness: 0.2,
      emissive: new THREE.Color('#581c87'),
      emissiveIntensity: 0.4,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(0, 0.3, -4);
    scene.add(planet);

    // 4. Atmospheric Halo & Rim Lighting (Fresnel Glow)
    const atmosphereGeometry = new THREE.SphereGeometry(planetRadius * 1.04, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.74 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 atmosphereColor = mix(vec3(0.98, 0.62, 0.18), vec3(0.78, 0.38, 0.98), vNormal.y * 0.5 + 0.5);
          gl_FragColor = vec4(atmosphereColor, intensity * 0.95);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereGlow = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereGlow.position.copy(planet.position);
    scene.add(atmosphereGlow);

    // 5. 3D Floating Metallic Emblem (Matching Reference Stylized 'T' / Prism)
    const emblemGroup = new THREE.Group();

    // Polished Mirror Chrome Material
    const chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 1.0,
      emissive: new THREE.Color(0x3b156b),
      emissiveIntensity: 0.2,
    });

    // Warm Golden-Amber Inner Trim Material
    const goldAccentMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 0.94,
      roughness: 0.14,
      clearcoat: 1.0,
      emissive: new THREE.Color(0x92400e),
      emissiveIntensity: 0.35,
    });

    // Construct the upward-facing futuristic metallic 'T' emblem with chamfered bevels
    // A. Vertical Center Pillar
    const stemGeom = new THREE.BoxGeometry(0.85, 3.2, 0.85);
    const stemMesh = new THREE.Mesh(stemGeom, chromeMaterial);
    stemMesh.position.set(0, -0.2, 0);
    emblemGroup.add(stemMesh);

    // B. Left Top Chamfered Wing
    const leftWingGeom = new THREE.BoxGeometry(1.8, 0.85, 0.85);
    const leftWingMesh = new THREE.Mesh(leftWingGeom, chromeMaterial);
    leftWingMesh.position.set(-0.95, 1.25, 0);
    leftWingMesh.rotation.z = Math.PI / 16;
    emblemGroup.add(leftWingMesh);

    // C. Right Top Chamfered Wing (Elevated chevron crest)
    const rightWingGeom = new THREE.BoxGeometry(1.8, 0.85, 0.85);
    const rightWingMesh = new THREE.Mesh(rightWingGeom, chromeMaterial);
    rightWingMesh.position.set(0.95, 1.25, 0);
    rightWingMesh.rotation.z = -Math.PI / 16;
    emblemGroup.add(rightWingMesh);

    // D. Center Beveled Arrow / Diamond Prism
    const prismShape = new THREE.Shape();
    prismShape.moveTo(0, 2.4);      // Top apex
    prismShape.lineTo(1.4, 0.9);     // Right outer wing
    prismShape.lineTo(0.7, 0.9);     // Right inner notch
    prismShape.lineTo(0.7, -1.6);    // Right stem base
    prismShape.lineTo(-0.7, -1.6);   // Left stem base
    prismShape.lineTo(-0.7, 0.9);    // Left inner notch
    prismShape.lineTo(-1.4, 0.9);    // Left outer wing
    prismShape.closePath();

    const extrudeSettings = {
      steps: 2,
      depth: 0.8,
      bevelEnabled: true,
      bevelThickness: 0.28,
      bevelSize: 0.22,
      bevelOffset: 0,
      bevelSegments: 5,
    };

    const emblemPrismGeom = new THREE.ExtrudeGeometry(prismShape, extrudeSettings);
    emblemPrismGeom.center();
    const emblemPrism = new THREE.Mesh(emblemPrismGeom, chromeMaterial);
    emblemPrism.scale.set(1.15, 1.15, 1.15);
    emblemGroup.add(emblemPrism);

    // E. Glowing Inner Amber Core Ridge
    const coreGeom = new THREE.BoxGeometry(0.32, 2.6, 1.15);
    const coreMesh = new THREE.Mesh(coreGeom, goldAccentMaterial);
    coreMesh.position.set(0, 0.1, 0.1);
    emblemGroup.add(coreMesh);

    // Initial position & tilt of emblem
    emblemGroup.position.set(0, 0.2, 5.0);
    emblemGroup.rotation.y = -Math.PI / 9;
    scene.add(emblemGroup);

    // 6. Elliptical 3D Orbital Rings with Revolving Satellites
    const orbitsGroup = new THREE.Group();
    orbitsGroup.position.copy(planet.position);
    scene.add(orbitsGroup);

    interface OrbitConfig {
      radiusX: number;
      radiusY: number;
      rotX: number;
      rotY: number;
      rotZ: number;
      speed: number;
      color: string;
      satelliteName: string;
      satelliteColor: string;
      size: number;
    }

    const orbitConfigs: OrbitConfig[] = [
      {
        radiusX: 14.2,
        radiusY: 6.5,
        rotX: Math.PI / 3.2,
        rotY: -Math.PI / 8,
        rotZ: Math.PI / 12,
        speed: 0.45,
        color: '#f97316', // Radiant orange orbit
        satelliteName: 'Sentinel-5P TROPOMI',
        satelliteColor: '#fb923c',
        size: 0.55,
      },
      {
        radiusX: 16.0,
        radiusY: 7.8,
        rotX: -Math.PI / 3.0,
        rotY: Math.PI / 7,
        rotZ: -Math.PI / 10,
        speed: -0.32,
        color: '#c084fc', // Violet orbit
        satelliteName: 'Copernicus CAMS Assimilation',
        satelliteColor: '#e879f9',
        size: 0.48,
      },
      {
        radiusX: 12.5,
        radiusY: 5.8,
        rotX: Math.PI / 2.5,
        rotY: Math.PI / 14,
        rotZ: Math.PI / 5,
        speed: 0.62,
        color: '#38bdf8', // Electric cyan orbit
        satelliteName: 'INSAT-3DR Geostationary',
        satelliteColor: '#60a5fa',
        size: 0.44,
      },
    ];

    const satellites: {
      mesh: THREE.Mesh;
      config: OrbitConfig;
      angle: number;
    }[] = [];

    orbitConfigs.forEach((cfg) => {
      const orbitContainer = new THREE.Group();
      orbitContainer.rotation.set(cfg.rotX, cfg.rotY, cfg.rotZ);

      // Smooth elliptical curve
      const curve = new THREE.EllipseCurve(
        0, 0,
        cfg.radiusX, cfg.radiusY,
        0, 2 * Math.PI,
        false,
        0
      );

      const points = curve.getPoints(128);
      const ringGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const ringMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(cfg.color),
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });

      const ringLine = new THREE.Line(ringGeometry, ringMaterial);
      orbitContainer.add(ringLine);

      // Revolving satellite node
      const satGeometry = new THREE.SphereGeometry(cfg.size, 24, 24);
      const satMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(cfg.satelliteColor),
        emissive: new THREE.Color(cfg.satelliteColor),
        emissiveIntensity: 0.85,
        metalness: 0.85,
        roughness: 0.15,
      });
      const satMesh = new THREE.Mesh(satGeometry, satMaterial);

      // Add glowing halo ring
      const satHaloGeom = new THREE.RingGeometry(cfg.size * 1.35, cfg.size * 1.7, 24);
      const satHaloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(cfg.satelliteColor),
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const satHalo = new THREE.Mesh(satHaloGeom, satHaloMat);
      satMesh.add(satHalo);

      orbitContainer.add(satMesh);
      orbitsGroup.add(orbitContainer);

      satellites.push({
        mesh: satMesh,
        config: cfg,
        angle: Math.random() * Math.PI * 2,
      });
    });

    // 7. Dynamic Lighting Environment
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 3.8);
    sunLight.position.set(16, 14, 20);
    scene.add(sunLight);

    const amberRimLight = new THREE.DirectionalLight(0xf97316, 3.2);
    amberRimLight.position.set(-20, -10, -8);
    scene.add(amberRimLight);

    const violetLight = new THREE.DirectionalLight(0xa855f7, 2.5);
    violetLight.position.set(0, 18, -16);
    scene.add(violetLight);

    const ambientLight = new THREE.AmbientLight(0x311068, 0.9);
    scene.add(ambientLight);

    // Specular Glint Spotlight focused on the 3D Chrome Emblem
    const emblemGlint = new THREE.PointLight(0xffffff, 3.5, 14);
    emblemGlint.position.set(2, 3, 8.5);
    scene.add(emblemGlint);

    // 8. Mouse Parallax & Dynamic Motion Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = normX;
      mouseY = normY;
      targetCameraX = normX * 2.4;
      targetCameraY = normY * 1.5;

      // Move specular glint dynamically with cursor
      emblemGlint.position.set(normX * 5, normY * 3 + 2, 8.5);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.position.z = width < 640 ? 30 : width < 1024 ? 26 : 22;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Slowly rotate planet
      planet.rotation.y += delta * 0.085;

      // Rotate starfield slowly
      starField.rotation.y -= delta * 0.015;

      // Floating / levitating 3D emblem with mouse reaction
      emblemGroup.position.y = 0.2 + Math.sin(elapsedTime * 1.6) * 0.18;
      emblemGroup.rotation.y = -Math.PI / 9 + Math.sin(elapsedTime * 0.8) * 0.12 + mouseX * 0.42;
      emblemGroup.rotation.x = mouseY * 0.3 + Math.cos(elapsedTime * 1.2) * 0.05;

      // Orbiting satellites
      satellites.forEach((sat) => {
        sat.angle += delta * sat.config.speed;
        const x = Math.cos(sat.angle) * sat.config.radiusX;
        const y = Math.sin(sat.angle) * sat.config.radiusY;
        sat.mesh.position.set(x, y, 0);
      });

      // Smooth camera parallax
      camera.position.x += (targetCameraX - camera.position.x) * 0.045;
      camera.position.y += (targetCameraY - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planetGeometry.dispose();
      planetMaterial.dispose();
      emblemPrismGeom.dispose();
      chromeMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[620px] md:min-h-[720px] lg:min-h-[780px] overflow-hidden ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Radial Dark & Cosmic Ambient Lighting Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,transparent_22%,rgba(6,3,18,0.4)_72%,rgba(6,3,18,0.92)_100%)] z-1" />

      {/* Loading state indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#070314] z-10">
          <div className="flex flex-col items-center gap-3 text-white/70">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400">
              Initializing Planetary 3D Atmospheric Canvas...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
