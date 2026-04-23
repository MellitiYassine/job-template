import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene: any;
  private camera: any;
  private renderer: any;
  private brandLogos: any[] = [];
  private particles: any;
  private connectionLines: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 20;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);

    const logoShapes = [
      { type: 'cube', color: 0xff6b6b, size: 2 },
      { type: 'sphere', color: 0x4ecdc4, size: 1.5 },
      { type: 'torus', color: 0xffe66d, size: 1.2 },
      { type: 'octahedron', color: 0x95e1d3, size: 1.8 },
      { type: 'tetrahedron', color: 0xf38181, size: 2 },
      { type: 'dodecahedron', color: 0xaa96da, size: 1.5 }
    ];

    logoShapes.forEach((shape, index) => {
      let geometry;
      const angle = (index / logoShapes.length) * Math.PI * 2;
      const radius = 8;

      switch (shape.type) {
        case 'cube':
          geometry = new THREE.BoxGeometry(shape.size, shape.size, shape.size);
          break;
        case 'sphere':
          geometry = new THREE.SphereGeometry(shape.size, 32, 32);
          break;
        case 'torus':
          geometry = new THREE.TorusGeometry(shape.size, 0.4, 16, 100);
          break;
        case 'octahedron':
          geometry = new THREE.OctahedronGeometry(shape.size);
          break;
        case 'tetrahedron':
          geometry = new THREE.TetrahedronGeometry(shape.size);
          break;
        case 'dodecahedron':
          geometry = new THREE.DodecahedronGeometry(shape.size);
          break;
        default:
          geometry = new THREE.BoxGeometry(shape.size, shape.size, shape.size);
      }

      const material = new THREE.MeshPhysicalMaterial({
        color: shape.color,
        metalness: 0.5,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9,
        emissive: shape.color,
        emissiveIntensity: 0.2
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = Math.sin(angle) * radius;
      mesh.position.z = (Math.random() - 0.5) * 4;

      mesh.userData = {
        originalX: mesh.position.x,
        originalY: mesh.position.y,
        rotationSpeed: 0.01 + Math.random() * 0.02,
        floatSpeed: 0.5 + Math.random() * 0.5
      };

      this.brandLogos.push(mesh);
      this.scene.add(mesh);

      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      mesh.add(edges);
    });

    for (let i = 0; i < this.brandLogos.length; i++) {
      for (let j = i + 1; j < this.brandLogos.length; j++) {
        const points = [];
        points.push(this.brandLogos[i].position);
        points.push(this.brandLogos[j].position);

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.1,
          blending: THREE.AdditiveBlending
        });

        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.connectionLines.push({ line, start: i, end: j });
        this.scene.add(line);
      }
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.brandLogos.forEach((logo, index) => {
      logo.rotation.x += logo.userData.rotationSpeed;
      logo.rotation.y += logo.userData.rotationSpeed * 0.7;
      logo.rotation.z += logo.userData.rotationSpeed * 0.5;

      logo.position.y = logo.userData.originalY + Math.sin(time * logo.userData.floatSpeed + index) * 0.5;
      logo.position.x = logo.userData.originalX + Math.cos(time * logo.userData.floatSpeed * 0.7 + index) * 0.3;
    });

    this.connectionLines.forEach(({ line, start, end }) => {
      const positions = line.geometry.attributes.position.array as Float32Array;
      positions[0] = this.brandLogos[start].position.x;
      positions[1] = this.brandLogos[start].position.y;
      positions[2] = this.brandLogos[start].position.z;
      positions[3] = this.brandLogos[end].position.x;
      positions[4] = this.brandLogos[end].position.y;
      positions[5] = this.brandLogos[end].position.z;
      line.geometry.attributes.position.needsUpdate = true;
    });

    this.particles.rotation.y += 0.0005;
    this.particles.rotation.x += 0.0003;

    this.camera.position.x = Math.sin(time * 0.1) * 2;
    this.camera.position.y = Math.cos(time * 0.15) * 2;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}