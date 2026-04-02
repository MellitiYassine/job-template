import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: any;
  private camera!: any;
  private renderer!: any;
  private particles: any[] = [];
  private shields: any[] = [];
  private locks: any[] = [];
  private dataStreams: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const ambientLight = new THREE.AmbientLight(0x00ff00, 0.3);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 1.5, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1.5, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    this.createParticleField();
    this.createShields();
    this.createLocks();
    this.createDataStreams();
    this.createCentralCore();
  }

  private createParticleField(): void {
    const THREE = (window as any).THREE;
    const geometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

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
    this.scene.add(particles);
    this.particles.push(particles);
  }

  private createShields(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.TorusGeometry(3 + i * 2, 0.1, 16, 100);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.4,
        emissive: 0x00ff88,
        emissiveIntensity: 0.5,
        wireframe: true
      });
      const shield = new THREE.Mesh(geometry, material);
      shield.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      shield.rotation.y = Math.random() * Math.PI;
      this.scene.add(shield);
      this.shields.push(shield);
    }
  }

  private createLocks(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 8; i++) {
      const group = new THREE.Group();

      const bodyGeometry = new THREE.BoxGeometry(0.8, 1, 0.4);
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0088,
        emissive: 0xff0088,
        emissiveIntensity: 0.3
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      group.add(body);

      const shackleGeometry = new THREE.TorusGeometry(0.4, 0.1, 8, 16, Math.PI);
      const shackleMaterial = new THREE.MeshPhongMaterial({
        color: 0xffaa00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.3
      });
      const shackle = new THREE.Mesh(shackleGeometry, shackleMaterial);
      shackle.position.y = 0.7;
      shackle.rotation.x = Math.PI / 2;
      group.add(shackle);

      const angle = (i / 8) * Math.PI * 2;
      const radius = 8;
      group.position.x = Math.cos(angle) * radius;
      group.position.y = Math.sin(angle) * radius;
      group.position.z = (Math.random() - 0.5) * 4;

      this.scene.add(group);
      this.locks.push(group);
    }
  }

  private createDataStreams(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 20; i++) {
      const points = [];
      const startX = (Math.random() - 0.5) * 20;
      const startY = (Math.random() - 0.5) * 20;
      const startZ = (Math.random() - 0.5) * 20;

      for (let j = 0; j < 50; j++) {
        points.push(
          new THREE.Vector3(
            startX + Math.sin(j * 0.1) * 2,
            startY + j * 0.2,
            startZ + Math.cos(j * 0.1) * 2
          )
        );
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.dataStreams.push({ line, offset: Math.random() * Math.PI * 2 });
    }
  }

  private createCentralCore(): void {
    const THREE = (window as any).THREE;

    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    const core = new THREE.Mesh(geometry, material);
    this.scene.add(core);
    this.particles.push(core);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    if (this.particles.length > 0) {
      this.particles[0].rotation.y += 0.002;
      if (this.particles[1]) {
        this.particles[1].rotation.x += 0.01;
        this.particles[1].rotation.y += 0.015;
      }
    }

    this.shields.forEach((shield, index) => {
      shield.rotation.z += 0.005 * (index + 1);
      shield.scale.x = 1 + Math.sin(time + index) * 0.05;
      shield.scale.y = 1 + Math.sin(time + index) * 0.05;
    });

    this.locks.forEach((lock, index) => {
      lock.rotation.y += 0.01;
      lock.position.y += Math.sin(time * 2 + index) * 0.02;
    });

    this.dataStreams.forEach((stream, index) => {
      stream.line.rotation.y += 0.002;
      stream.line.position.y = Math.sin(time + stream.offset) * 3;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 2;
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