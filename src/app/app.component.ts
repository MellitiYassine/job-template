import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene: any;
  private camera: any;
  private renderer: any;
  private paths: any[] = [];
  private nodes: any[] = [];
  private particles: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createCareerPaths();
    this.createNodes();
    this.createParticles();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1f);
    this.scene.fog = new THREE.Fog(0x0a0a1f, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 50);
    pointLight2.position.set(-10, -10, -10);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createCareerPaths(): void {
    const THREE = (window as any).THREE;
    const pathCount = 8;

    for (let i = 0; i < pathCount; i++) {
      const angle = (i / pathCount) * Math.PI * 2;
      const radius = 8;
      const height = Math.random() * 6 - 3;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(angle) * radius * 0.3,
          height * 0.3,
          Math.sin(angle) * radius * 0.3
        ),
        new THREE.Vector3(
          Math.cos(angle) * radius * 0.6,
          height * 0.6,
          Math.sin(angle) * radius * 0.6
        ),
        new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        )
      ]);

      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(i / pathCount, 0.8, 0.6),
        transparent: true,
        opacity: 0.6
      });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.paths.push({ line, curve, progress: 0 });
    }
  }

  private createNodes(): void {
    const THREE = (window as any).THREE;
    const nodePositions = [
      { x: 0, y: 0, z: 0, size: 0.5, color: 0xffffff },
      { x: 3, y: 2, z: 3, size: 0.3, color: 0x00ffff },
      { x: -4, y: 1, z: 2, size: 0.3, color: 0xff00ff },
      { x: 2, y: -1, z: -4, size: 0.3, color: 0xffff00 },
      { x: -3, y: 3, z: -3, size: 0.3, color: 0x00ff00 },
      { x: 5, y: -2, z: 1, size: 0.3, color: 0xff6600 },
      { x: -2, y: -2, z: 4, size: 0.3, color: 0x6600ff },
      { x: 4, y: 2, z: -2, size: 0.3, color: 0xff0066 },
      { x: -5, y: 0, z: -1, size: 0.3, color: 0x00ffaa }
    ];

    nodePositions.forEach(pos => {
      const geometry = new THREE.SphereGeometry(pos.size, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: pos.color,
        emissive: pos.color,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(pos.x, pos.y, pos.z);
      this.scene.add(sphere);
      this.nodes.push({ mesh: sphere, baseY: pos.y, time: Math.random() * Math.PI * 2 });

      const glowGeometry = new THREE.SphereGeometry(pos.size * 1.5, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.2
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.set(pos.x, pos.y, pos.z);
      this.scene.add(glow);
      this.nodes.push({ mesh: glow, baseY: pos.y, time: Math.random() * Math.PI * 2, isGlow: true });
    });
  }

  private createParticles(): void {
    const THREE = (window as any).THREE;
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    this.particles.push(particles);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.nodes.forEach(node => {
      node.time += 0.02;
      node.mesh.position.y = node.baseY + Math.sin(node.time) * 0.3;
      if (!node.isGlow) {
        node.mesh.rotation.y += 0.01;
      }
    });

    this.particles.forEach(particle => {
      particle.rotation.y += 0.0005;
      particle.rotation.x += 0.0003;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 15;
    this.camera.position.z = Math.cos(time * 0.2) * 15;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}