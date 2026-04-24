import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: any;
  private camera!: any;
  private renderer!: any;
  private particles: any[] = [];
  private graphs: any[] = [];
  private charts: any[] = [];
  private targetIcon!: any;
  private bulbIcon!: any;
  private megaphoneIcon!: any;
  private time = 0;

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
    this.animate();
  }

  private initThree(): void {
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
    this.camera.position.z = 15;
    this.camera.position.y = 2;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x0a0a1a, 1);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 1.5, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1.5, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 1.2, 50);
    pointLight3.position.set(0, 10, -10);
    this.scene.add(pointLight3);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    this.createTargetIcon();
    this.createBulbIcon();
    this.createMegaphoneIcon();
    this.createBarChart();
    this.createLineGraphs();
    this.createDataParticles();
    this.createNetworkConnections();
  }

  private createTargetIcon(): void {
    const THREE = (window as any).THREE;
    const group = new THREE.Group();

    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.TorusGeometry(1.5 - i * 0.4, 0.08, 16, 100);
      const material = new THREE.MeshPhongMaterial({
        color: i === 0 ? 0xff0066 : i === 1 ? 0xffffff : 0x00ffff,
        emissive: i === 0 ? 0xff0066 : i === 1 ? 0xffffff : 0x00ffff,
        emissiveIntensity: 0.3
      });
      const ring = new THREE.Mesh(geometry, material);
      group.add(ring);
    }

    const centerGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const centerMaterial = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.5
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    group.add(center);

    group.position.set(-6, 3, 0);
    this.targetIcon = group;
    this.scene.add(group);
  }

  private createBulbIcon(): void {
    const THREE = (window as any).THREE;
    const group = new THREE.Group();

    const bulbGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const bulbMaterial = new THREE.MeshPhongMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    group.add(bulb);

    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 32);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.7;
    group.add(base);

    for (let i = 0; i < 6; i++) {
      const rayGeometry = new THREE.ConeGeometry(0.1, 1.5, 4);
      const rayMaterial = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.4
      });
      const ray = new THREE.Mesh(rayGeometry, rayMaterial);
      const angle = (i / 6) * Math.PI * 2;
      ray.position.x = Math.cos(angle) * 1.2;
      ray.position.z = Math.sin(angle) * 1.2;
      ray.rotation.z = Math.PI / 2;
      ray.lookAt(new THREE.Vector3(Math.cos(angle) * 3, 0, Math.sin(angle) * 3));
      group.add(ray);
    }

    group.position.set(6, 3, 0);
    this.bulbIcon = group;
    this.scene.add(group);
  }

  private createMegaphoneIcon(): void {
    const THREE = (window as any).THREE;
    const group = new THREE.Group();

    const coneGeometry = new THREE.ConeGeometry(1, 2, 32);
    const coneMaterial = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.3
    });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.rotation.z = Math.PI / 2;
    group.add(cone);

    const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 32);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.x = -0.5;
    handle.position.y = -0.5;
    handle.rotation.z = Math.PI / 4;
    group.add(handle);

    for (let i = 0; i < 5; i++) {
      const waveGeometry = new THREE.TorusGeometry(0.5 + i * 0.3, 0.05, 8, 32, Math.PI / 2);
      const waveMaterial = new THREE.MeshPhongMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.5 - i * 0.08
      });
      const wave = new THREE.Mesh(waveGeometry, waveMaterial);
      wave.position.x = 1 + i * 0.2;
      wave.rotation.y = Math.PI / 2;
      group.add(wave);
    }

    group.position.set(0, 3, -5);
    group.rotation.y = Math.PI / 6;
    this.megaphoneIcon = group;
    this.scene.add(group);
  }

  private createBarChart(): void {
    const THREE = (window as any).THREE;
    const barData = [0.5, 1.2, 0.8, 1.8, 1.4, 2.2, 1.9];
    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff0066, 0x66ff00, 0x0066ff];

    barData.forEach((height, i) => {
      const geometry = new THREE.BoxGeometry(0.3, height, 0.3);
      const material = new THREE.MeshPhongMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: 0.3
      });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set(i * 0.5 - 1.5, height / 2 - 2, 5);
      this.charts.push(bar);
      this.scene.add(bar);
    });
  }

  private createLineGraphs(): void {
    const THREE = (window as any).THREE;

    for (let g = 0; g < 3; g++) {
      const points = [];
      for (let i = 0; i < 20; i++) {
        const x = i * 0.5 - 5;
        const y = Math.sin(i * 0.3 + g) * 2;
        const z = -3 + g * 1.5;
        points.push(new THREE.Vector3(x, y, z));
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: g === 0 ? 0x00ffff : g === 1 ? 0xff00ff : 0xffff00,
        linewidth: 2
      });
      const line = new THREE.Line(geometry, material);
      this.graphs.push(line);
      this.scene.add(line);
    }
  }

  private createDataParticles(): void {
    const THREE = (window as any).THREE;
    const particleCount = 300;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0x00ffff : Math.random() > 0.5 ? 0xff00ff : 0xffff00,
        emissive: 0xffffff,
        emissiveIntensity: 0.3
      });
      const particle = new THREE.Mesh(geometry, material);

      particle.position.x = (Math.random() - 0.5) * 30;
      particle.position.y = (Math.random() - 0.5) * 20;
      particle.position.z = (Math.random() - 0.5) * 30;

      (particle as any).velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      );

      this.particles.push(particle);
      this.scene.add(particle);
    }
  }

  private createNetworkConnections(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 50; i++) {
      const points = [
        new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 20
        ),
        new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 20
        )
      ];

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.2
      });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.time += 0.01;

    if (this.targetIcon) {
      this.targetIcon.rotation.z += 0.005;
      this.targetIcon.position.y = 3 + Math.sin(this.time * 2) * 0.3;
    }

    if (this.bulbIcon) {
      this.bulbIcon.rotation.y += 0.01;
      this.bulbIcon.position.y = 3 + Math.cos(this.time * 2) * 0.3;
      this.bulbIcon.children.forEach((child, i) => {
        if (i > 1) {
          (child as any).material.opacity = 0.3 + Math.sin(this.time * 3 + i) * 0.2;
        }
      });
    }

    if (this.megaphoneIcon) {
      this.megaphoneIcon.rotation.y = Math.PI / 6 + Math.sin(this.time) * 0.1;
      this.megaphoneIcon.position.y = 3 + Math.sin(this.time * 1.5) * 0.2;
    }

    this.charts.forEach((bar, i) => {
      bar.scale.y = 1 + Math.sin(this.time * 2 + i * 0.5) * 0.1;
    });

    this.particles.forEach((particle) => {
      particle.position.add((particle as any).velocity);

      if (Math.abs(particle.position.x) > 15) (particle as any).velocity.x *= -1;
      if (Math.abs(particle.position.y) > 10) (particle as any).velocity.y *= -1;
      if (Math.abs(particle.position.z) > 15) (particle as any).velocity.z *= -1;
    });

    this.camera.position.x = Math.sin(this.time * 0.2) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}