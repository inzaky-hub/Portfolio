import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { gsap } from '../../hooks/useGSAP';

export interface BookCoverProps {
  name?: string;
  tagline?: string;
  onEnter?: () => void;
  reducedMotion?: boolean;
}

// ---------------------------------------------------------------------------
// Procedural Canvas Texture Generators (Zero Image Assets)
// ---------------------------------------------------------------------------

function createProceduralCoverCanvas(title: string, subtitle: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Dark obsidian cyber-leather background
  const bgGrad = ctx.createRadialGradient(256, 384, 40, 256, 384, 460);
  bgGrad.addColorStop(0, '#1c1510');
  bgGrad.addColorStop(0.5, '#120d09');
  bgGrad.addColorStop(1, '#070503');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 768);

  // Subtle geometric leather striations
  ctx.strokeStyle = 'rgba(255, 153, 0, 0.05)';
  ctx.lineWidth = 1;
  for (let i = -768; i < 768; i += 28) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 768, 768);
    ctx.stroke();
  }

  // Double metallic border
  ctx.strokeStyle = '#8a6a4a';
  ctx.lineWidth = 3;
  ctx.strokeRect(22, 22, 468, 724);

  ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(30, 30, 452, 708);

  // Central Cyber Rune
  ctx.save();
  ctx.translate(256, 340);

  ctx.strokeStyle = '#FF9900';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 75, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 55, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 153, 0, 0.6)';
  for (let a = 0; a < 6; a++) {
    const rad = (a * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(rad) * 22, Math.sin(rad) * 22);
    ctx.lineTo(Math.cos(rad) * 75, Math.sin(rad) * 75);
    ctx.stroke();
  }

  ctx.fillStyle = '#00E5FF';
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Cover Titles
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#00E5FF';
  ctx.fillText('// LIVING DATACENTER', 256, 160);

  ctx.font = 'bold 34px sans-serif';
  ctx.fillStyle = '#F9FAFB';
  ctx.fillText(title, 256, 210);

  ctx.font = '14px monospace';
  ctx.fillStyle = '#FF9900';
  ctx.fillText(subtitle, 256, 480);

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = 'rgba(0, 229, 255, 0.85)';
  ctx.fillText('[ CLICK OR SCROLL TO OPEN ]', 256, 680);

  return canvas;
}

function createProceduralPageCanvas(
  title: string,
  chapter: string,
  subtitle: string,
  bullets: string[],
  tag: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Dark slate background
  const grad = ctx.createLinearGradient(0, 0, 512, 768);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(1, '#070b13');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 768);

  // Subtle cyber grid pattern
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 768);
    ctx.stroke();
  }
  for (let y = 0; y < 768; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Border & ornamental corners
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 20, 472, 728);

  ctx.fillStyle = '#00E5FF';
  const corners = [
    [20, 20],
    [492, 20],
    [20, 748],
    [492, 748],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillRect(cx - 3, cy - 3, 6, 6);
  });

  // Meta Tag
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = '#00E5FF';
  ctx.fillText(`// ${tag.toUpperCase()}`, 40, 65);

  // Chapter
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#FF9900';
  ctx.fillText(chapter, 40, 105);

  // Main Page Title: "HISTORY", "SOON", "COMING SOON", etc.
  ctx.font = 'bold 44px sans-serif';
  ctx.fillStyle = '#F9FAFB';
  ctx.fillText(title, 40, 160);

  // Glowing divider line
  ctx.strokeStyle = '#00E5FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 185);
  ctx.lineTo(472, 185);
  ctx.stroke();

  // Subtitle
  ctx.font = 'bold 17px sans-serif';
  ctx.fillStyle = '#00E5FF';
  ctx.fillText(subtitle, 40, 225);

  // Bullets
  ctx.font = '14px monospace';
  let curY = 280;
  bullets.forEach((bullet) => {
    ctx.fillStyle = '#00E5FF';
    ctx.fillText('▪', 40, curY);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(bullet, 60, curY);
    curY += 45;
  });

  // Footer status indicator
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(45, 712, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '11px monospace';
  ctx.fillStyle = '#10B981';
  ctx.fillText('PROCEDURAL PAGE ENGINE · BUFFER OK', 58, 716);

  return canvas;
}

// ---------------------------------------------------------------------------
// GLSL Shaders for Dynamic Bending & Page Peeling
// ---------------------------------------------------------------------------

const pageVertexShader = `
  uniform float uProgress;
  uniform float uBend;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vec3 pos = position; // x in [0, 2.2], y in [-1.5, 1.5]

    float pageWidth = 2.2;
    float xRatio = clamp(pos.x / pageWidth, 0.0, 1.0);

    // Rotation angle from 0 to PI
    float angle = uProgress * 3.14159265;

    // Organic bend curve (max at mid-turn, peaks near outer edge)
    float curl = sin(uProgress * 3.14159265) * uBend * pow(xRatio, 1.3);

    // Dynamic rotation angle with bending lag
    float theta = angle - curl;

    // Polar transformation around the spine (X=0)
    float r = pos.x;
    pos.x = r * cos(theta);
    pos.z = r * sin(theta);

    // Natural vertical lift of flexible paper during turn
    pos.y += sin(theta) * 0.12 * xRatio;

    vPosition = (modelViewMatrix * vec4(pos, 1.0)).xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const pageFragmentShader = `
  uniform sampler2D uFrontTexture;
  uniform sampler2D uBackTexture;
  uniform float uProgress;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec4 texColor;
    if (gl_FrontFacing) {
      texColor = texture2D(uFrontTexture, vUv);
    } else {
      // Horizontal flip for back page so text is not mirrored
      texColor = texture2D(uBackTexture, vec2(1.0 - vUv.x, vUv.y));
    }

    vec3 lightDir = normalize(vec3(0.5, 1.0, 1.0));
    float diff = max(dot(normalize(vNormal), lightDir), 0.38);

    // Cyberpunk cyan edge rim light
    vec3 rim = vec3(0.0, 0.9, 1.0) * pow(1.0 - abs(dot(normalize(-vPosition), normalize(vNormal))), 3.0) * 0.25;

    gl_FragColor = vec4(texColor.rgb * diff + rim, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// BookCover Component
// ---------------------------------------------------------------------------

const BookCover = ({ onEnter, reducedMotion = false }: BookCoverProps) => {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const totalPages = 2; // Page 0: History / Superpowers, Page 1: Coming Soon / Soon

  // Refs for 3D state & animation controls
  const animStateRef = useRef({
    coverProgress: { val: 0 },
    pagesProgress: [{ val: 0 }, { val: 0 }],
    isFlipping: false,
  });

  const handleEnterUniverse = () => {
    if (onEnter) {
      onEnter();
    } else {
      navigate('/architect');
    }
  };

  // Flip page action
  const flipPage = useCallback(
    (targetIndex: number) => {
      if (animStateRef.current.isFlipping || !isOpen) return;
      if (targetIndex < 0 || targetIndex >= totalPages) return;

      animStateRef.current.isFlipping = true;

      const goingNext = targetIndex > currentPageIndex;
      const flippingPage = goingNext ? currentPageIndex : targetIndex;
      const targetVal = goingNext ? 1.0 : 0.0;

      if (reducedMotion) {
        animStateRef.current.pagesProgress[flippingPage].val = targetVal;
        setCurrentPageIndex(targetIndex);
        animStateRef.current.isFlipping = false;
        return;
      }

      gsap.to(animStateRef.current.pagesProgress[flippingPage], {
        val: targetVal,
        duration: 0.85,
        ease: 'power2.inOut',
        onComplete: () => {
          setCurrentPageIndex(targetIndex);
          animStateRef.current.isFlipping = false;
        },
      });
    },
    [currentPageIndex, isOpen, reducedMotion]
  );

  // Open cover action
  const openCover = useCallback(() => {
    if (isOpen || animStateRef.current.isFlipping) return;
    animStateRef.current.isFlipping = true;

    if (reducedMotion) {
      animStateRef.current.coverProgress.val = 1.0;
      setIsOpen(true);
      animStateRef.current.isFlipping = false;
      return;
    }

    gsap.to(animStateRef.current.coverProgress, {
      val: 1.0,
      duration: 1.0,
      ease: 'power2.inOut',
      onComplete: () => {
        setIsOpen(true);
        animStateRef.current.isFlipping = false;
      },
    });
  }, [isOpen, reducedMotion]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 5.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Book Group
    const bookGroup = new THREE.Group();
    scene.add(bookGroup);

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0x00e5ff, 1.2);
    dirLight1.position.set(3, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff9900, 0.6);
    dirLight2.position.set(-3, -2, 3);
    scene.add(dirLight2);

    // -----------------------------------------------------------------------
    // Generate Procedural Textures
    // -----------------------------------------------------------------------
    const coverCanvas = createProceduralCoverCanvas(
      'INZA ISAAK',
      'SOC ANALYST · ML & CYBERSECURITY'
    );
    const coverTex = new THREE.CanvasTexture(coverCanvas);

    // Page 1: Front (History) & Back (Superpowers)
    const p1FrontCanvas = createProceduralPageCanvas(
      'HISTORY',
      'CHAPTER 01',
      'The Architect & SOC Journey',
      [
        'VEONE Groupe · SOC Analyst (2026)',
        'SYNELIA GROUP · Junior SysAdmin',
        'INP-HB / IDSI · Master SCIA',
        'LightGBM & Wazuh cryptojacking detection',
      ],
      'ARCHITECT LOG'
    );
    const p1FrontTex = new THREE.CanvasTexture(p1FrontCanvas);

    const p1BackCanvas = createProceduralPageCanvas(
      'SUPERPOWERS',
      'CHAPTER 02',
      'Technical Arsenal & SIEM Defense',
      [
        'Machine Learning: LightGBM, behavioral AI',
        'Security SIEM: Wazuh, OpenSearch, Suricata',
        'Infrastructure: Docker, Ansible, VMware, Linux',
        'Autonomous CTF Solving Agents',
      ],
      'ARSENAL LOG'
    );
    const p1BackTex = new THREE.CanvasTexture(p1BackCanvas);

    // Page 2: Front (Coming Soon) & Back (Soon)
    const p2FrontCanvas = createProceduralPageCanvas(
      'COMING SOON',
      'CHAPTER 03',
      'Missions & Behavioral Threat Hunting',
      [
        'Wazuh Rule 100030 (MITRE T1496)',
        'F1-Score: 0.9639 · AUC-ROC: 0.9987',
        'Automated SOC Daily Pipeline',
        'Headwind MDM & AVD Deployment',
      ],
      'MISSIONS LOG'
    );
    const p2FrontTex = new THREE.CanvasTexture(p2FrontCanvas);

    const p2BackCanvas = createProceduralPageCanvas(
      'SOON',
      'CHAPTER 04',
      'Ask Inza · Neural SOC Console',
      [
        'Interactive AI Digital Twin',
        'Instant answering from local knowledge',
        'Zero external API dependencies',
        'Live terminal simulation',
      ],
      'TERMINAL LOG'
    );
    const p2BackTex = new THREE.CanvasTexture(p2BackCanvas);

    // -----------------------------------------------------------------------
    // Procedural Book Meshes (Bending Planes & Custom Geometry)
    // -----------------------------------------------------------------------
    const pageWidth = 2.2;
    const pageHeight = 3.0;

    // Spine
    const spineGeo = new THREE.CylinderGeometry(0.12, 0.12, pageHeight + 0.1, 16, 1, false, -Math.PI / 2, Math.PI);
    const spineMat = new THREE.MeshStandardMaterial({
      color: 0x140e0a,
      roughness: 0.6,
      metalness: 0.3,
    });
    const spineMesh = new THREE.Mesh(spineGeo, spineMat);
    spineMesh.rotation.y = Math.PI / 2;
    bookGroup.add(spineMesh);

    // Bottom Base Left & Right Covers (Chassis)
    const backCoverGeo = new THREE.PlaneGeometry(pageWidth, pageHeight + 0.1);
    backCoverGeo.translate(pageWidth / 2, 0, -0.05);
    const backCoverMat = new THREE.MeshStandardMaterial({
      color: 0x0a0705,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    const leftBaseCover = new THREE.Mesh(backCoverGeo, backCoverMat);
    leftBaseCover.rotation.y = Math.PI;
    bookGroup.add(leftBaseCover);

    const rightBaseCover = new THREE.Mesh(backCoverGeo, backCoverMat);
    bookGroup.add(rightBaseCover);

    // Front Cover (Rotates 0 to -PI along spine)
    const frontCoverGeo = new THREE.PlaneGeometry(pageWidth, pageHeight + 0.1, 24, 12);
    frontCoverGeo.translate(pageWidth / 2, 0, 0);

    const frontCoverMat = new THREE.ShaderMaterial({
      vertexShader: pageVertexShader,
      fragmentShader: pageFragmentShader,
      uniforms: {
        uProgress: { value: 0.0 },
        uBend: { value: 0.45 },
        uFrontTexture: { value: coverTex },
        uBackTexture: { value: p1BackTex },
      },
      side: THREE.DoubleSide,
    });

    const frontCoverMesh = new THREE.Mesh(frontCoverGeo, frontCoverMat);
    frontCoverMesh.position.z = 0.02;
    bookGroup.add(frontCoverMesh);

    // Dynamic Bending Pages
    const pagePlaneGeo = new THREE.PlaneGeometry(pageWidth, pageHeight, 36, 18);
    pagePlaneGeo.translate(pageWidth / 2, 0, 0);

    // Page 1 Shader Mesh
    const page1Mat = new THREE.ShaderMaterial({
      vertexShader: pageVertexShader,
      fragmentShader: pageFragmentShader,
      uniforms: {
        uProgress: { value: 0.0 },
        uBend: { value: 0.65 },
        uFrontTexture: { value: p1FrontTex },
        uBackTexture: { value: p1BackTex },
      },
      side: THREE.DoubleSide,
    });
    const page1Mesh = new THREE.Mesh(pagePlaneGeo, page1Mat);
    page1Mesh.position.z = 0.01;
    bookGroup.add(page1Mesh);

    // Page 2 Shader Mesh
    const page2Mat = new THREE.ShaderMaterial({
      vertexShader: pageVertexShader,
      fragmentShader: pageFragmentShader,
      uniforms: {
        uProgress: { value: 0.0 },
        uBend: { value: 0.65 },
        uFrontTexture: { value: p2FrontTex },
        uBackTexture: { value: p2BackTex },
      },
      side: THREE.DoubleSide,
    });
    const page2Mesh = new THREE.Mesh(pagePlaneGeo, page2Mat);
    page2Mesh.position.z = 0.005;
    bookGroup.add(page2Mesh);

    // -----------------------------------------------------------------------
    // Interactive Raycasting & Mouse Tilt
    // -----------------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let targetRotY = 0;
    let targetRotX = 0.15;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Subtle parallax tilt
      targetRotY = mouse.x * 0.15;
      targetRotX = 0.15 - mouse.y * 0.1;
    };

    const handleClickCanvas = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([frontCoverMesh, page1Mesh, page2Mesh, rightBaseCover, leftBaseCover]);

      if (intersects.length > 0) {
        if (!isOpen) {
          openCover();
        } else {
          // If clicked right side: flip next; if clicked left side: flip prev
          const hitPoint = intersects[0].point;
          if (hitPoint.x > 0.2) {
            flipPage(1);
          } else if (hitPoint.x < -0.2) {
            flipPage(0);
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 20) {
        if (!isOpen) {
          openCover();
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handlePointerMove);
    domEl.addEventListener('click', handleClickCanvas);
    domEl.addEventListener('wheel', handleWheel);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // -----------------------------------------------------------------------
    // Animation Loop
    // -----------------------------------------------------------------------
    let animId: number;
    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      // Smooth camera tilt
      bookGroup.rotation.y += (targetRotY - bookGroup.rotation.y) * 0.08;
      bookGroup.rotation.x += (targetRotX - bookGroup.rotation.x) * 0.08;

      // Update shader uniforms from animation states
      frontCoverMat.uniforms.uProgress.value = animStateRef.current.coverProgress.val;
      page1Mat.uniforms.uProgress.value = animStateRef.current.pagesProgress[0].val;
      page2Mat.uniforms.uProgress.value = animStateRef.current.pagesProgress[1].val;

      renderer.render(scene, camera);
    };

    renderLoop();

    // -----------------------------------------------------------------------
    // Cleanup
    // -----------------------------------------------------------------------
    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousemove', handlePointerMove);
      domEl.removeEventListener('click', handleClickCanvas);
      domEl.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);

      spineGeo.dispose();
      spineMat.dispose();
      backCoverGeo.dispose();
      backCoverMat.dispose();
      frontCoverGeo.dispose();
      frontCoverMat.dispose();
      pagePlaneGeo.dispose();
      page1Mat.dispose();
      page2Mat.dispose();

      coverTex.dispose();
      p1FrontTex.dispose();
      p1BackTex.dispose();
      p2FrontTex.dispose();
      p2BackTex.dispose();

      renderer.dispose();
      if (domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
    };
  }, [flipPage, isOpen, openCover]);

  return (
    <div className="relative w-full max-w-[1000px] mx-auto flex flex-col items-center justify-center select-none py-4">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="relative w-full h-[480px] sm:h-[540px] md:h-[580px] rounded-2xl overflow-hidden cursor-pointer"
        style={{ touchAction: 'none' }}
        aria-label="Livre 3D interactif - Cliquez ou faites défiler pour ouvrir"
      />

      {/* Control Buttons & Indicators */}
      <div className="flex flex-col items-center gap-4 mt-4 w-full z-20">
        {isOpen && (
          <div className="flex items-center justify-between w-full max-w-[500px] px-4 gap-4">
            <button
              type="button"
              onClick={() => flipPage(currentPageIndex - 1)}
              disabled={currentPageIndex === 0}
              className={`font-mono text-xs sm:text-sm uppercase tracking-wider font-bold px-4 sm:px-5 py-2.5 rounded-lg border transition-all cursor-pointer ${
                currentPageIndex === 0
                  ? 'opacity-40 border-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-[#111827] text-[#00E5FF] border-[rgba(0,229,255,0.3)] hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]'
              }`}
            >
              ← Page précédente
            </button>

            <span className="font-mono text-xs text-[#9CA3AF] tracking-widest font-semibold">
              PAGE {currentPageIndex + 1} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => flipPage(currentPageIndex + 1)}
              disabled={currentPageIndex >= totalPages - 1}
              className={`font-mono text-xs sm:text-sm uppercase tracking-wider font-bold px-4 sm:px-5 py-2.5 rounded-lg border transition-all cursor-pointer ${
                currentPageIndex >= totalPages - 1
                  ? 'opacity-40 border-white/10 text-white/40 cursor-not-allowed'
                  : 'bg-[#111827] text-[#00E5FF] border-[rgba(0,229,255,0.3)] hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]'
              }`}
            >
              Page suivante →
            </button>
          </div>
        )}

        {/* Primary CTA Button: ENTRER DANS MON UNIVERS (Navigates to /architect) */}
        <button
          type="button"
          onClick={handleEnterUniverse}
          className="font-mono text-xs sm:text-sm md:text-base uppercase tracking-widest font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#00E5FF] text-[#0A0E1A] shadow-[0_0_25px_rgba(0,229,255,0.7)] hover:shadow-[0_0_45px_rgba(0,229,255,1)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          ENTRER DANS MON UNIVERS
        </button>
      </div>
    </div>
  );
};

export default BookCover;
