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
  private charts: any[] = [];
  private dataNodes: any[] = [];
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
    this.scene.background = new THREE.Color(0x0a0e27);
    this.scene.fog = new THREE.Fog(0x0a0e27, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 50);
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
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 4;

      const barGroup = new THREE.Group();
      const barCount = 5;
      const barWidth = 0.3;
      const spacing = 0.4;

      for (let j = 0; j < barCount; j++) {
        const height = Math.random() * 2 + 0.5;
        const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
        const material = new THREE.MeshPhongMaterial({
          color: new THREE.Color().setHSL(0.55 + i * 0.1, 0.8, 0.6),
          emissive: new THREE.Color().setHSL(0.55 + i * 0.1, 0.5, 0.3),
          shininess: 100
        });
        const bar = new THREE.Mesh(geometry, material);
        bar.position.x = (j - barCount / 2) * spacing;
        bar.position.y = height / 2;
        barGroup.add(bar);
      }

      barGroup.position.set(x, y, z);
      barGroup.rotation.z = -angle;
      this.scene.add(barGroup);
      this.charts.push(barGroup);

      const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x0088ff,
        shininess: 100
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(x, y, z);
      this.scene.add(node);
      this.dataNodes.push(node);
    }

    for (let i = 0; i < this.dataNodes.length; i++) {
      const nextIndex = (i + 1) % this.dataNodes.length;
      const start = this.dataNodes[i].position;
      const end = this.dataNodes[nextIndex].position;

      const points = [start, end];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
      });
      const line = new THREE.Line(geometry, material);
      this.scene.add(line);
      this.connections.push(line);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particles);

    const gridHelper = new THREE.GridHelper(30, 30, 0x00ffff, 0x003366);
    gridHelper.position.y = -10;
    this.scene.add(gridHelper);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.charts.forEach((chart, index) => {
      chart.rotation.y += 0.005;
      chart.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
    });

    this.dataNodes.forEach((node, index) => {
      const scale = 1 + Math.sin(Date.now() * 0.002 + index) * 0.2;
      node.scale.set(scale, scale, scale);
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0002) * 5;
    this.camera.position.y = Math.cos(Date.now() * 0.0003) * 3;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}