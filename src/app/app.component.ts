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
  private roadmapItems: any[] = [];
  private particles: any[] = [];
  private connections: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e27);
    this.scene.fog = new THREE.Fog(0x0a0e27, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;
    this.camera.position.y = 5;
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight2.position.set(-10, -10, 5);
    this.scene.add(pointLight2);

    this.createRoadmapPath();
    this.createFloatingFeatures();
    this.createParticleSystem();
    this.createDataConnections();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createRoadmapPath(): void {
    const THREE = (window as any).THREE;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, -3, 0),
      new THREE.Vector3(-4, 0, 2),
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(4, 0, -2),
      new THREE.Vector3(8, -2, 0)
    ]);

    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00d4ff,
      linewidth: 3
    });
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);

    const milestones = [-8, -4, 0, 4, 8];
    milestones.forEach((x, index) => {
      const geometry = new THREE.OctahedronGeometry(0.5, 0);
      const material = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
      });
      const milestone = new THREE.Mesh(geometry, material);
      milestone.position.set(x, index % 2 === 0 ? -3 + index * 0.8 : index * 0.5, index % 2 === 0 ? 0 : 2);
      this.roadmapItems.push(milestone);
      this.scene.add(milestone);
    });
  }

  private createFloatingFeatures(): void {
    const THREE = (window as any).THREE;
    const features = [
      { shape: 'box', color: 0xff6b35, pos: [-6, 4, -3] },
      { shape: 'sphere', color: 0x4ecdc4, pos: [6, 3, -2] },
      { shape: 'torus', color: 0xffe66d, pos: [-5, -4, 2] },
      { shape: 'cone', color: 0xa8dadc, pos: [5, -3, 3] }
    ];

    features.forEach(feature => {
      let geometry;
      if (feature.shape === 'box') {
        geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      } else if (feature.shape === 'sphere') {
        geometry = new THREE.SphereGeometry(0.8, 32, 32);
      } else if (feature.shape === 'torus') {
        geometry = new THREE.TorusGeometry(0.8, 0.3, 16, 100);
      } else {
        geometry = new THREE.ConeGeometry(0.8, 1.5, 32);
      }

      const material = new THREE.MeshStandardMaterial({
        color: feature.color,
        emissive: feature.color,
        emissiveIntensity: 0.3,
        metalness: 0.7,
        roughness: 0.3,
        wireframe: false
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(feature.pos[0], feature.pos[1], feature.pos[2]);
      this.roadmapItems.push(mesh);
      this.scene.add(mesh);
    });
  }

  private createParticleSystem(): void {
    const THREE = (window as any).THREE;
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 1, 0.5);
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
    this.particles.push(particles);
    this.scene.add(particles);
  }

  private createDataConnections(): void {
    const THREE = (window as any).THREE;
    for (let i = 0; i < 20; i++) {
      const points = [];
      points.push(new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ));
      points.push(new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.2
      });
      const line = new THREE.Line(geometry, material);
      this.connections.push(line);
      this.scene.add(line);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.roadmapItems.forEach((item, index) => {
      item.rotation.x += 0.01;
      item.rotation.y += 0.01;
      item.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
    });

    this.particles.forEach(particle => {
      particle.rotation.y += 0.0005;
      particle.rotation.x += 0.0003;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0002) * 3;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}