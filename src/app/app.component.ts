import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private THREE = (window as any).THREE;
  private scene!: any;
  private camera!: any;
  private renderer!: any;
  private graphs: any[] = [];
  private arrows: any[] = [];
  private targets: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    this.scene = new this.THREE.Scene();
    this.scene.background = new this.THREE.Color(0x0a0e27);
    this.scene.fog = new this.THREE.Fog(0x0a0e27, 10, 50);

    this.camera = new this.THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new this.THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new this.THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);

    const pointLight1 = new this.THREE.PointLight(0x00d4ff, 2, 50);
    pointLight1.position.set(-10, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new this.THREE.PointLight(0xff6b35, 2, 50);
    pointLight2.position.set(10, -5, 5);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    this.createGrowthGraphs();
    this.createSuccessArrows();
    this.createTargetCircles();
    this.createFloatingIcons();
    this.createParticles();
  }

  private createGrowthGraphs(): void {
    const graphPoints = [
      [0, 0, 0],
      [1, 1, 0],
      [2, 1.5, 0],
      [3, 3, 0],
      [4, 4.5, 0],
      [5, 6, 0]
    ];

    const curve = new this.THREE.CatmullRomCurve3(
      graphPoints.map(p => new this.THREE.Vector3(p[0] - 2.5, p[1] - 3, p[2]))
    );

    const tubeGeometry = new this.THREE.TubeGeometry(curve, 100, 0.08, 8, false);
    const tubeMaterial = new this.THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });
    const tube = new this.THREE.Mesh(tubeGeometry, tubeMaterial);
    tube.position.set(-5, 0, -2);
    this.scene.add(tube);
    this.graphs.push(tube);

    graphPoints.forEach((point, index) => {
      const sphereGeometry = new this.THREE.SphereGeometry(0.15, 16, 16);
      const sphereMaterial = new this.THREE.MeshStandardMaterial({
        color: 0xff6b35,
        emissive: 0xff6b35,
        emissiveIntensity: 0.7
      });
      const sphere = new this.THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(point[0] - 2.5 - 5, point[1] - 3, point[2] - 2);
      this.scene.add(sphere);
      this.graphs.push(sphere);
    });
  }

  private createSuccessArrows(): void {
    for (let i = 0; i < 5; i++) {
      const arrowGroup = new this.THREE.Group();

      const shaftGeometry = new this.THREE.CylinderGeometry(0.05, 0.05, 2, 8);
      const shaftMaterial = new this.THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1
      });
      const shaft = new this.THREE.Mesh(shaftGeometry, shaftMaterial);
      shaft.rotation.z = Math.PI / 2;
      arrowGroup.add(shaft);

      const headGeometry = new this.THREE.ConeGeometry(0.2, 0.5, 8);
      const headMaterial = new this.THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1
      });
      const head = new this.THREE.Mesh(headGeometry, headMaterial);
      head.rotation.z = -Math.PI / 2;
      head.position.x = 1.25;
      arrowGroup.add(head);

      const angle = (i / 5) * Math.PI * 2;
      const radius = 6;
      arrowGroup.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * 2,
        Math.sin(angle * 2) * 3
      );
      arrowGroup.rotation.z = angle;

      this.scene.add(arrowGroup);
      this.arrows.push(arrowGroup);
    }
  }

  private createTargetCircles(): void {
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new this.THREE.TorusGeometry(1 + i * 0.5, 0.08, 16, 100);
      const ringMaterial = new this.THREE.MeshStandardMaterial({
        color: i === 0 ? 0xff6b35 : i === 1 ? 0xffd700 : 0x00d4ff,
        emissive: i === 0 ? 0xff6b35 : i === 1 ? 0xffd700 : 0x00d4ff,
        emissiveIntensity: 0.5
      });
      const ring = new this.THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(5, 2, 0);
      ring.rotation.y = Math.PI / 4;
      this.scene.add(ring);
      this.targets.push(ring);
    }

    const centerGeometry = new this.THREE.SphereGeometry(0.2, 16, 16);
    const centerMaterial = new this.THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1
    });
    const center = new this.THREE.Mesh(centerGeometry, centerMaterial);
    center.position.set(5, 2, 0);
    this.scene.add(center);
  }

  private createFloatingIcons(): void {
    const iconShapes = [
      { type: 'briefcase', pos: [-3, 4, -5] },
      { type: 'trophy', pos: [4, -2, -3] },
      { type: 'lightbulb', pos: [-4, -3, 2] },
      { type: 'gear', pos: [3, 5, -4] }
    ];

    iconShapes.forEach(icon => {
      const geometry = new this.THREE.OctahedronGeometry(0.4, 0);
      const material = new this.THREE.MeshStandardMaterial({
        color: 0x9d4edd,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0x9d4edd,
        emissiveIntensity: 0.3
      });
      const mesh = new this.THREE.Mesh(geometry, material);
      mesh.position.set(icon.pos[0], icon.pos[1], icon.pos[2]);
      this.scene.add(mesh);
      this.graphs.push(mesh);
    });
  }

  private createParticles(): void {
    const particlesGeometry = new this.THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new this.THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });

    const particles = new this.THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particles);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.graphs.forEach((obj, index) => {
      obj.rotation.y += 0.005;
      obj.position.y += Math.sin(time + index) * 0.01;
    });

    this.arrows.forEach((arrow, index) => {
      const angle = (index / 5) * Math.PI * 2 + time * 0.3;
      const radius = 6;
      arrow.position.x = Math.cos(angle) * radius;
      arrow.position.z = Math.sin(angle * 2) * 3;
      arrow.position.y = Math.sin(angle) * 2;
      arrow.rotation.z = angle;
    });

    this.targets.forEach((target, index) => {
      target.rotation.x = time * (0.5 + index * 0.2);
      target.rotation.z = time * (0.3 + index * 0.1);
    });

    this.camera.position.x = Math.sin(time * 0.2) * 2;
    this.camera.position.y = 5 + Math.sin(time * 0.3) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}