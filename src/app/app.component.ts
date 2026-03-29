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
  private bars: any[] = [];
  private particles: any[] = [];
  private dataPoints: any[] = [];
  private time = 0;

  ngAfterViewInit(): void {
    this.initThree();
    this.createDataVisualization();
    this.animate();
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new this.THREE.Scene();
    this.scene.fog = new this.THREE.Fog(0x0a0a1a, 10, 50);

    this.camera = new this.THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new this.THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a0a1a, 1);

    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const directionalLight = new this.THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    const pointLight1 = new this.THREE.PointLight(0xff00ff, 1, 50);
    pointLight1.position.set(-10, 5, -10);
    this.scene.add(pointLight1);

    const pointLight2 = new this.THREE.PointLight(0x00ff88, 1, 50);
    pointLight2.position.set(10, -5, 10);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createDataVisualization(): void {
    const barCount = 20;
    const radius = 12;

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const height = Math.random() * 5 + 1;
      
      const geometry = new this.THREE.BoxGeometry(0.8, height, 0.8);
      const material = new this.THREE.MeshStandardMaterial({
        color: new this.THREE.Color().setHSL(i / barCount, 0.8, 0.5),
        emissive: new this.THREE.Color().setHSL(i / barCount, 0.8, 0.3),
        metalness: 0.7,
        roughness: 0.3
      });
      
      const bar = new this.THREE.Mesh(geometry, material);
      bar.position.x = Math.cos(angle) * radius;
      bar.position.z = Math.sin(angle) * radius;
      bar.position.y = height / 2;
      
      bar.userData = {
        targetHeight: height,
        baseHeight: height,
        angle: angle,
        speed: Math.random() * 0.02 + 0.01
      };
      
      this.bars.push(bar);
      this.scene.add(bar);
    }

    const particleCount = 500;
    const particleGeometry = new this.THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const color = new this.THREE.Color().setHSL(Math.random(), 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new this.THREE.BufferAttribute(colors, 3));

    const particleMaterial = new this.THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: this.THREE.AdditiveBlending
    });

    const particleSystem = new this.THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particleSystem);
    this.particles.push(particleSystem);

    for (let i = 0; i < 50; i++) {
      const sphereGeometry = new this.THREE.SphereGeometry(0.2, 16, 16);
      const sphereMaterial = new this.THREE.MeshStandardMaterial({
        color: new this.THREE.Color().setHSL(Math.random(), 0.8, 0.5),
        emissive: new this.THREE.Color().setHSL(Math.random(), 0.8, 0.4),
        metalness: 0.8,
        roughness: 0.2
      });
      
      const sphere = new this.THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 30
      );
      
      sphere.userData = {
        velocity: new this.THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        )
      };
      
      this.dataPoints.push(sphere);
      this.scene.add(sphere);
    }

    const gridHelper = new this.THREE.GridHelper(40, 40, 0x00ffff, 0x004444);
    gridHelper.position.y = -0.5;
    this.scene.add(gridHelper);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.time += 0.01;

    this.bars.forEach((bar, index) => {
      const newHeight = bar.userData.baseHeight + Math.sin(this.time * bar.userData.speed + index) * 2;
      bar.scale.y = newHeight / bar.userData.baseHeight;
      bar.position.y = (newHeight * bar.userData.baseHeight) / 2;
      bar.rotation.y += 0.01;
    });

    this.particles.forEach(particleSystem => {
      particleSystem.rotation.y += 0.001;
      particleSystem.rotation.x += 0.0005;
    });

    this.dataPoints.forEach(point => {
      point.position.add(point.userData.velocity);
      
      if (Math.abs(point.position.x) > 15) point.userData.velocity.x *= -1;
      if (Math.abs(point.position.y) > 10) point.userData.velocity.y *= -1;
      if (Math.abs(point.position.z) > 15) point.userData.velocity.z *= -1;
      
      point.rotation.x += 0.02;
      point.rotation.y += 0.02;
    });

    this.camera.position.x = Math.sin(this.time * 0.1) * 25;
    this.camera.position.z = Math.cos(this.time * 0.1) * 25;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}