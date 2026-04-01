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
  private clouds: any[] = [];
  private servers: any[] = [];
  private particles: any[] = [];
  private connections: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0e27, 1, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 25;
    this.camera.position.y = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a0e27, 1);

    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00d4ff, 1);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 1, 50);
    pointLight1.position.set(-15, 10, 0);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff0088, 1, 50);
    pointLight2.position.set(15, -10, 0);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 8; i++) {
      const cloudGroup = new THREE.Group();
      const sphereCount = 5 + Math.floor(Math.random() * 5);

      for (let j = 0; j < sphereCount; j++) {
        const geometry = new THREE.SphereGeometry(1 + Math.random() * 1.5, 16, 16);
        const material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.6,
          emissive: 0x4488ff,
          emissiveIntensity: 0.2
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 4
        );
        cloudGroup.add(sphere);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 40 - 10
      );

      this.clouds.push({
        group: cloudGroup,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01,
          0
        )
      });
      this.scene.add(cloudGroup);
    }

    const serverPositions = [
      { x: -8, y: -5, z: 0 },
      { x: 0, y: -5, z: 0 },
      { x: 8, y: -5, z: 0 }
    ];

    serverPositions.forEach((pos, index) => {
      const serverGroup = new THREE.Group();

      const boxGeometry = new THREE.BoxGeometry(2, 3, 1.5);
      const boxMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a2e,
        emissive: 0x00ff88,
        emissiveIntensity: 0.3,
        shininess: 100
      });
      const box = new THREE.Mesh(boxGeometry, boxMaterial);
      serverGroup.add(box);

      for (let i = 0; i < 4; i++) {
        const lightGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.1);
        const lightMaterial = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? 0x00ff00 : 0xff0000
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.y = -1 + i * 0.5;
        light.position.z = 0.76;
        serverGroup.add(light);
      }

      serverGroup.position.set(pos.x, pos.y, pos.z);
      this.servers.push(serverGroup);
      this.scene.add(serverGroup);
    });

    for (let i = 0; i < this.servers.length - 1; i++) {
      const points = [];
      points.push(this.servers[i].position);
      points.push(this.servers[i + 1].position);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.4 });
      const line = new THREE.Line(geometry, material);
      this.connections.push(line);
      this.scene.add(line);
    }

    for (let i = 0; i < 500; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x00ffff : 0xffffff,
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
      );
      this.particles.push({
        mesh: particle,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        )
      });
      this.scene.add(particle);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.clouds.forEach(cloud => {
      cloud.group.position.add(cloud.velocity);
      cloud.group.rotation.y += 0.001;

      if (cloud.group.position.x > 30) cloud.group.position.x = -30;
      if (cloud.group.position.x < -30) cloud.group.position.x = 30;
    });

    this.servers.forEach((server, index) => {
      server.rotation.y += 0.005;
      server.position.y = -5 + Math.sin(Date.now() * 0.001 + index) * 0.3;
    });

    this.particles.forEach(particle => {
      particle.mesh.position.add(particle.velocity);

      if (Math.abs(particle.mesh.position.x) > 30) particle.velocity.x *= -1;
      if (Math.abs(particle.mesh.position.y) > 20) particle.velocity.y *= -1;
      if (Math.abs(particle.mesh.position.z) > 20) particle.velocity.z *= -1;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}