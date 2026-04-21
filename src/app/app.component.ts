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
  private icons: any[] = [];
  private particles: any[] = [];
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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a0a1a, 1);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff0088, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(i * 0.5) * 2;

      const iconGeometry = new THREE.BoxGeometry(1.2, 1.2, 0.2);
      const iconMaterial = new THREE.MeshPhongMaterial({
        color: this.getIconColor(i),
        emissive: this.getIconColor(i),
        emissiveIntensity: 0.4,
        shininess: 100
      });
      const icon = new THREE.Mesh(iconGeometry, iconMaterial);
      icon.position.set(x, y, z);
      icon.lookAt(0, y, 0);
      icon.userData = { angle, radius, baseY: y, speed: 0.2 + Math.random() * 0.3 };
      this.scene.add(icon);
      this.icons.push(icon);

      const edgesGeometry = new THREE.EdgesGeometry(iconGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      icon.add(edges);
    }

    for (let i = 0; i < 500; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x00ff88 : 0xff0088,
        transparent: true,
        opacity: 0.6
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      };
      this.scene.add(particle);
      this.particles.push(particle);
    }

    for (let i = 0; i < 50; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10),
        new THREE.Vector3(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10),
        new THREE.Vector3(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10)
      ]);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x4444ff,
        transparent: true,
        opacity: 0.3
      });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.dataStreams.push(line);
    }

    const centerGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const centerMaterial = new THREE.MeshPhongMaterial({
      color: 0x6600ff,
      emissive: 0x3300aa,
      emissiveIntensity: 0.5,
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });
    const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
    this.scene.add(centerSphere);

    const ringGeometry = new THREE.TorusGeometry(2, 0.1, 16, 100);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    this.scene.add(ring);
  }

  private getIconColor(index: number): number {
    const colors = [0xff0088, 0x00ff88, 0x0088ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800, 0x88ff00];
    return colors[index % colors.length];
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.icons.forEach((icon, index) => {
      icon.userData.angle += icon.userData.speed * 0.01;
      const x = Math.cos(icon.userData.angle) * icon.userData.radius;
      const z = Math.sin(icon.userData.angle) * icon.userData.radius;
      const y = icon.userData.baseY + Math.sin(time + index) * 0.5;
      icon.position.set(x, y, z);
      icon.lookAt(0, y, 0);
      icon.rotation.z = Math.sin(time * 2 + index) * 0.2;
    });

    this.particles.forEach((particle) => {
      particle.position.add(particle.userData.velocity);
      if (particle.position.length() > 20) {
        particle.position.normalize().multiplyScalar(20);
        particle.userData.velocity.negate();
      }
    });

    this.dataStreams.forEach((stream, index) => {
      stream.rotation.x += 0.001;
      stream.rotation.y += 0.002;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 2;
    this.camera.position.y = 2 + Math.cos(time * 0.15) * 1;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}