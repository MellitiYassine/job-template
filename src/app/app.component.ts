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
  private particles: any[] = [];
  private servers: any[] = [];
  private connections: any[] = [];
  private pipeline: any;

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
    this.camera.position.y = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 1, 100);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0088ff, 1, 100);
    pointLight2.position.set(-10, -10, 5);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const serverGeometry = new THREE.BoxGeometry(1.5, 2, 0.8);
    const serverMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      emissive: 0x00ff88,
      emissiveIntensity: 0.2,
      shininess: 100
    });

    for (let i = 0; i < 8; i++) {
      const server = new THREE.Mesh(serverGeometry, serverMaterial.clone());
      const angle = (i / 8) * Math.PI * 2;
      const radius = 8;
      server.position.x = Math.cos(angle) * radius;
      server.position.z = Math.sin(angle) * radius;
      server.position.y = Math.sin(i * 0.5) * 2;
      server.userData = { angle, radius, initialY: server.position.y };
      this.scene.add(server);
      this.servers.push(server);

      const edgesGeometry = new THREE.EdgesGeometry(serverGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x00ff88 });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      server.add(edges);

      for (let j = 0; j < 3; j++) {
        const lightGeometry = new THREE.PlaneGeometry(0.2, 0.2);
        const lightMaterial = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? 0x00ff00 : 0xff0000,
          side: THREE.DoubleSide
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(-0.5, 0.5 - j * 0.4, 0.41);
        server.add(light);
      }
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particleSystem);
    this.particles.push(particleSystem);

    const pipelineGeometry = new THREE.CylinderGeometry(0.1, 0.1, 20, 32);
    const pipelineMaterial = new THREE.MeshPhongMaterial({
      color: 0x0088ff,
      emissive: 0x0088ff,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.7
    });
    this.pipeline = new THREE.Mesh(pipelineGeometry, pipelineMaterial);
    this.pipeline.rotation.z = Math.PI / 2;
    this.pipeline.position.y = -3;
    this.scene.add(this.pipeline);

    for (let i = 0; i < 5; i++) {
      const dataPacketGeometry = new THREE.OctahedronGeometry(0.3);
      const dataPacketMaterial = new THREE.MeshPhongMaterial({
        color: 0xffaa00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5
      });
      const dataPacket = new THREE.Mesh(dataPacketGeometry, dataPacketMaterial);
      dataPacket.position.x = -10 + i * 4;
      dataPacket.position.y = -3;
      dataPacket.userData = { speed: 0.05 + Math.random() * 0.05 };
      this.scene.add(dataPacket);
      this.connections.push(dataPacket);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.servers.forEach((server, i) => {
      server.rotation.y += 0.01;
      server.position.y = server.userData.initialY + Math.sin(time + i) * 0.5;
      
      const angle = server.userData.angle + time * 0.1;
      server.position.x = Math.cos(angle) * server.userData.radius;
      server.position.z = Math.sin(angle) * server.userData.radius;
    });

    this.particles.forEach(particle => {
      particle.rotation.y += 0.0005;
      particle.rotation.x += 0.0003;
    });

    this.connections.forEach(packet => {
      packet.position.x += packet.userData.speed;
      packet.rotation.x += 0.05;
      packet.rotation.y += 0.03;
      
      if (packet.position.x > 10) {
        packet.position.x = -10;
      }
    });

    if (this.pipeline) {
      this.pipeline.rotation.x += 0.005;
    }

    this.camera.position.x = Math.sin(time * 0.1) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}