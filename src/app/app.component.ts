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
  private coins: any[] = [];
  private charts: any[] = [];
  private particles: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
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
    this.camera.position.y = 2;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0088ff, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 30; i++) {
      const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.2,
        emissive: 0xaa8800,
        emissiveIntensity: 0.3
      });
      const coin = new THREE.Mesh(geometry, material);

      coin.position.x = (Math.random() - 0.5) * 30;
      coin.position.y = (Math.random() - 0.5) * 20;
      coin.position.z = (Math.random() - 0.5) * 20;

      coin.userData = {
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.02,
        rotationSpeed: Math.random() * 0.05
      };

      this.coins.push(coin);
      this.scene.add(coin);
    }

    for (let i = 0; i < 15; i++) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0, 2);
      shape.lineTo(1.5, 1.5);
      shape.lineTo(1.8, 0.8);
      shape.lineTo(2, 0);
      shape.lineTo(0, 0);

      const extrudeSettings = {
        steps: 1,
        depth: 0.1,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        metalness: 0.5,
        roughness: 0.3,
        transparent: true,
        opacity: 0.7,
        emissive: 0x00aa66,
        emissiveIntensity: 0.4
      });
      const chart = new THREE.Mesh(geometry, material);

      chart.position.x = (Math.random() - 0.5) * 25;
      chart.position.y = (Math.random() - 0.5) * 15;
      chart.position.z = (Math.random() - 0.5) * 15;

      chart.rotation.x = Math.random() * Math.PI;
      chart.rotation.y = Math.random() * Math.PI;

      chart.userData = {
        speedX: (Math.random() - 0.5) * 0.015,
        speedY: (Math.random() - 0.5) * 0.015,
        rotationSpeed: (Math.random() - 0.5) * 0.03
      };

      this.charts.push(chart);
      this.scene.add(chart);
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ddff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particleSystem);
    this.particles.push(particleSystem);

    const dollarGeometry = new THREE.TorusGeometry(1.2, 0.15, 16, 100);
    const dollarMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x00aa00,
      emissiveIntensity: 0.5
    });
    const dollarSign = new THREE.Mesh(dollarGeometry, dollarMaterial);
    dollarSign.position.set(0, 0, -5);
    dollarSign.userData = { rotationSpeed: 0.02 };
    this.coins.push(dollarSign);
    this.scene.add(dollarSign);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.coins.forEach(coin => {
      coin.position.x += coin.userData.speedX;
      coin.position.y += coin.userData.speedY;
      coin.rotation.y += coin.userData.rotationSpeed;

      if (Math.abs(coin.position.x) > 15) coin.userData.speedX *= -1;
      if (Math.abs(coin.position.y) > 10) coin.userData.speedY *= -1;
    });

    this.charts.forEach(chart => {
      chart.position.x += chart.userData.speedX;
      chart.position.y += chart.userData.speedY;
      chart.rotation.z += chart.userData.rotationSpeed;

      if (Math.abs(chart.position.x) > 12) chart.userData.speedX *= -1;
      if (Math.abs(chart.position.y) > 8) chart.userData.speedY *= -1;
    });

    this.particles.forEach(system => {
      system.rotation.y += 0.0005;
      system.rotation.x += 0.0003;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0003) * 2;
    this.camera.position.y = 2 + Math.cos(Date.now() * 0.0002) * 1;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}