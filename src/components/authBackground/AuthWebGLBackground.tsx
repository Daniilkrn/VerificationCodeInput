import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./AuthWebGLBackground.module.scss";

/**
 * Спокойный фон для экранов входа / кода: частицы + лёгкий wireframe, без взаимодействия.
 */
export default function AuthWebGLBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = wrapRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1220, 0.045);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      80,
    );
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const count = 2200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    const particleMat = new THREE.PointsMaterial({
      color: 0x7eb8ff,
      size: 0.055,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const torusGeo = new THREE.TorusGeometry(3.2, 0.1, 12, 80);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x4f8cff,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    const innerGeo = new THREE.IcosahedronGeometry(1.35, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    scene.add(inner);

    let raf = 0;
    const t0 = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) * 0.001;

      particles.rotation.y = t * 0.04;
      particles.rotation.x = t * 0.015;

      torus.rotation.x = t * 0.11;
      torus.rotation.y = t * 0.08;

      inner.rotation.y = -t * 0.12;
      inner.rotation.z = t * 0.05;

      camera.position.x = Math.sin(t * 0.12) * 0.35;
      camera.position.y = Math.cos(t * 0.09) * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      particleGeo.dispose();
      particleMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={wrapRef} className={styles.wrap} aria-hidden />;
}
