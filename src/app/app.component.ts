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
  private dataPoints: any[] = [];
  private charts: any[] = [];
  private lines: any[] = [];

  ngAfterViewInit(): void {
    this.initThree();
    this.createDataVisualization();
    this.animate();
  }

  private initThree(): void {
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
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 1.5, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff0088, 1.5, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x0088ff, 1.5, 50);
    pointLight3.position.set(0, 10, -10);
    this.scene.add(pointLight3);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createDataVisualization(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 300; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        emissive: new THREE.Color().setHSL(Math.random(), 0.5, 0.2),
        transparent: true,
        opacity: 0.8
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      const radius = 5 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      sphere.position.x = radius * Math.sin(phi) * Math.cos(theta);
      sphere.position.y = radius * Math.sin(phi) * Math.sin(theta);
      sphere.position.z = radius * Math.cos(phi);
      
      sphere.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        originalColor: material.color.clone()
      };
      
      this.dataPoints.push(sphere);
      this.scene.add(sphere);
    }

    for (let i = 0; i < 50; i++) {
      const start = this.dataPoints[Math.floor(Math.random() * this.dataPoints.length)];
      const end = this.dataPoints[Math.floor(Math.random() * this.dataPoints.length)];
      
      if (start !== end) {
        const points = [start.position, end.position];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.2
        });
        const line = new THREE.Line(geometry, material);
        this.lines.push({ line, start, end });
        this.scene.add(line);
      }
    }

    const barCount = 8;
    const barSpacing = 2;
    for (let i = 0; i < barCount; i++) {
      const height = 1 + Math.random() * 3;
      const geometry = new THREE.BoxGeometry(0.3, height, 0.3);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / barCount, 0.8, 0.5),
        transparent: true,
        opacity: 0.7
      });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set((i - barCount / 2) * barSpacing, height / 2, -5);
      bar.userData = { targetHeight: height, currentHeight: height, speed: 0.02 };
      this.charts.push(bar);
      this.scene.add(bar);
    }

    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      
      const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const THREE = (window as any).THREE;
    const time = Date.now() * 0.001;

    this.dataPoints.forEach((point, index) => {
      point.position.add(point.userData.velocity);
      
      const distance = point.position.length();
      if (distance > 15 || distance < 3) {
        point.userData.velocity.multiplyScalar(-1);
      }
      
      point.material.emissive.setHSL((time * 0.1 + index * 0.01) % 1, 0.5, 0.3);
      point.rotation.x += 0.01;
      point.rotation.y += 0.01;
    });

    this.lines.forEach(({ line, start, end }) => {
      const positions = line.geometry.attributes.position.array;
      positions[0] = start.position.x;
      positions[1] = start.position.y;
      positions[2] = start.position.z;
      positions[3] = end.position.x;
      positions[4] = end.position.y;
      positions[5] = end.position.z;
      line.geometry.attributes.position.needsUpdate = true;
    });

    this.charts.forEach((bar, index) => {
      if (Math.random() < 0.01) {
        bar.userData.targetHeight = 1 + Math.random() * 3;
      }
      
      const diff = bar.userData.targetHeight - bar.userData.currentHeight;
      bar.userData.currentHeight += diff * bar.userData.speed;
      
      bar.scale.y = bar.userData.currentHeight / bar.userData.targetHeight;
      bar.position.y = bar.userData.currentHeight / 2;
      bar.rotation.y = Math.sin(time + index) * 0.1;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 15;
    this.camera.position.z = Math.cos(time * 0.2) * 15;
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