import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { gsap } from '../../hooks/useGSAP';

interface PointCloudProps {
  onComplete?: () => void;
}

const PointCloud = ({ onComplete }: PointCloudProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState<boolean>(false);

  // Check mobile (<768px) and prefers-reduced-motion
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleNavigate = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/architect');
    }
  };

  // After 3s: show button "DÉCOUVRIR MON PARCOURS"
  useEffect(() => {
    const delay = reducedMotion ? 500 : 3000;
    const timer = setTimeout(() => {
      setShowButton(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  // 3D Point Cloud for desktop & without reduced motion
  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Three.js scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    let animationFrameId: number;
    let geometry: THREE.BufferGeometry | null = null;
    let material: THREE.PointsMaterial | null = null;
    let pTexture: THREE.CanvasTexture | null = null;
    let animTargets: { progress: number }[] = [];

    // Mouse tracking on z=0 plane
    const mouseWorld = new THREE.Vector3(9999, 9999, 0);
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2(9999, 9999);

    const handleMouseMove = (e: MouseEvent) => {
      mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseNDC, camera);
      raycaster.ray.intersectPlane(planeZ, mouseWorld);
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Load avatar texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    textureLoader.load(
      '/avatar.jpg',
      (texture) => {
      // Draw to offscreen canvas 200x250, read pixel data
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 250;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(texture.image, 0, 0, 200, 250);
      const imageData = ctx.getImageData(0, 0, 200, 250);
      const data = imageData.data;

      // Create particles for pixels with brightness > 30, cap at 8000
      const candidates: { x: number; y: number; brightness: number }[] = [];
      for (let y = 0; y < 250; y++) {
        for (let x = 0; x < 200; x++) {
          const idx = (y * 200 + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (a > 50) {
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            if (brightness > 30) {
              candidates.push({ x, y, brightness });
            }
          }
        }
      }

      // Cap at 8000 evenly
      const maxCount = 8000;
      let selected = candidates;
      if (candidates.length > maxCount) {
        const step = candidates.length / maxCount;
        selected = [];
        for (let i = 0; i < maxCount; i++) {
          selected.push(candidates[Math.floor(i * step)]);
        }
      }

      const count = selected.length;
      geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const initialPositions = new Float32Array(count * 3);
      const targetPositions = new Float32Array(count * 3);
      const scatterOffsets = new Float32Array(count * 3);

      const scale = 0.013;

      for (let i = 0; i < count; i++) {
        const p = selected[i];

        // Particle color: grayscale (white to gray based on brightness)
        const gray = p.brightness / 255;
        colors[i * 3] = gray;
        colors[i * 3 + 1] = gray;
        colors[i * 3 + 2] = gray;

        // Target: centered avatar
        const tx = (p.x - 100) * scale;
        const ty = -(p.y - 125) * scale;
        const tz = ((p.brightness - 128) / 255) * 0.12;
        targetPositions[i * 3] = tx;
        targetPositions[i * 3 + 1] = ty;
        targetPositions[i * 3 + 2] = tz;

        // Initial: scattered in sphere radius 3
        const u = Math.random();
        const r = Math.cbrt(u) * 3;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const initX = r * Math.sin(phi) * Math.cos(theta);
        const initY = r * Math.sin(phi) * Math.sin(theta);
        const initZ = r * Math.cos(phi);

        initialPositions[i * 3] = initX;
        initialPositions[i * 3 + 1] = initY;
        initialPositions[i * 3 + 2] = initZ;

        positions[i * 3] = initX;
        positions[i * 3 + 1] = initY;
        positions[i * 3 + 2] = initZ;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Circular particle texture
      const canvasParticle = document.createElement('canvas');
      canvasParticle.width = 32;
      canvasParticle.height = 32;
      const pCtx = canvasParticle.getContext('2d');
      if (pCtx) {
        const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        pCtx.fillStyle = grad;
        pCtx.fillRect(0, 0, 32, 32);
      }
      pTexture = new THREE.CanvasTexture(canvasParticle);

      material = new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        map: pTexture,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      // Animate: fly to target over 2.5s with GSAP (stagger 0.001, ease power2.out)
      animTargets = Array.from({ length: count }, () => ({ progress: 0 }));
      gsap.to(animTargets, {
        progress: 1,
        duration: 2.5,
        stagger: 0.001,
        ease: 'power2.out',
      });

      // Render loop
      const render = () => {
        animationFrameId = requestAnimationFrame(render);

        if (geometry && geometry.attributes.position) {
          const posAttr = geometry.attributes.position;
          const posArr = posAttr.array as Float32Array;

          for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const prog = animTargets[i].progress;

            // Interpolate position from initial sphere to target
            const baseX =
              initialPositions[i3] + (targetPositions[i3] - initialPositions[i3]) * prog;
            const baseY =
              initialPositions[i3 + 1] + (targetPositions[i3 + 1] - initialPositions[i3 + 1]) * prog;
            const baseZ =
              initialPositions[i3 + 2] + (targetPositions[i3 + 2] - initialPositions[i3 + 2]) * prog;

            // Mouse interaction: particles within 0.5 units scatter 0.3 units outward
            const dx = baseX - mouseWorld.x;
            const dy = baseY - mouseWorld.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.5 && dist > 0.0001) {
              const angle = Math.atan2(dy, dx);
              const force = ((0.5 - dist) / 0.5) * 0.3;
              scatterOffsets[i3] += Math.cos(angle) * force;
              scatterOffsets[i3 + 1] += Math.sin(angle) * force;
              scatterOffsets[i3 + 2] += (Math.random() - 0.5) * force;
            }

            // Lerp back (0.1)
            scatterOffsets[i3] += (0 - scatterOffsets[i3]) * 0.1;
            scatterOffsets[i3 + 1] += (0 - scatterOffsets[i3 + 1]) * 0.1;
            scatterOffsets[i3 + 2] += (0 - scatterOffsets[i3 + 2]) * 0.1;

            posArr[i3] = baseX + scatterOffsets[i3];
            posArr[i3 + 1] = baseY + scatterOffsets[i3 + 1];
            posArr[i3 + 2] = baseZ + scatterOffsets[i3 + 2];
          }

          posAttr.needsUpdate = true;
        }

        renderer.render(scene, camera);
      };

      render();
    }, undefined, (err) => {
      console.error('PointCloud: failed to load /avatar.jpg', err);
    });

    // Cleanup: dispose geometries, materials, renderer on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animTargets.length > 0) {
        gsap.killTweensOf(animTargets);
      }
      if (geometry) {
        geometry.dispose();
      }
      if (material) {
        material.dispose();
      }
      if (pTexture) {
        pTexture.dispose();
      }
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isMobile, reducedMotion]);

  // Mobile (<768px) or prefers-reduced-motion: static image with fade-in instead of 3D
  if (isMobile || reducedMotion) {
    return (
      <div className="fixed inset-0 w-full h-full bg-[#0A0E1A] flex flex-col items-center justify-center p-6 z-30 overflow-hidden">
        <div
          className={`relative max-w-sm w-full mx-auto flex flex-col items-center ${
            reducedMotion ? '' : 'animate-[fadeIn_0.8s_ease-out]'
          }`}
        >
          {/* Cyan glow */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,229,255,0.25) 0%, transparent 70%)',
              filter: 'blur(35px)',
            }}
          />
          <img
            src="/avatar.jpg"
            alt="DIOMANDE Inza Isaak"
            className="w-64 h-80 object-cover rounded-2xl border-2 border-[rgba(0,229,255,0.4)] shadow-[0_0_35px_rgba(0,229,255,0.3)] relative z-10"
          />

          {showButton && (
            <button
              type="button"
              onClick={handleNavigate}
              className="mt-8 font-mono text-xs sm:text-sm uppercase tracking-widest font-bold px-8 py-3.5 rounded-full bg-[#00E5FF] text-[#0A0E1A] shadow-[0_0_25px_rgba(0,229,255,0.7)] hover:shadow-[0_0_40px_rgba(0,229,255,1)] hover:scale-105 active:scale-95 transition-all cursor-pointer relative z-20 animate-[fadeIn_0.5s_ease-out]"
            >
              DÉCOUVRIR MON PARCOURS →
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0A0E1A] overflow-hidden z-30">
      <div ref={containerRef} className="w-full h-full" />

      {/* Button: DÉCOUVRIR MON PARCOURS */}
      {showButton && (
        <button
          type="button"
          onClick={handleNavigate}
          className="fixed bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-50 font-mono text-xs sm:text-sm uppercase tracking-widest font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#00E5FF] text-[#0A0E1A] shadow-[0_0_25px_rgba(0,229,255,0.7)] hover:shadow-[0_0_45px_rgba(0,229,255,1)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer animate-[fadeIn_0.6s_ease-out]"
        >
          DÉCOUVRIR MON PARCOURS →
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PointCloud;
