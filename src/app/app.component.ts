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
  private particles: any[] = [];
  private dataNodes: any[] = [];
  private connections: any[] = [];
  private clock: any;

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createDataVisualization();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 50;
    this.camera.position.y = 10;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight1.position.set(20, 20, 20);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
    pointLight2.position.set(-20, -20, -20);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  private createDataVisualization(): void {
    const THREE = (window as any).THREE;

    this.createParticleField();
    this.createDataNodes();
    this.createNeuralNetwork();
    this.createDataStreams();
  }

  private createParticleField(): void {
    const THREE = (window as any).THREE;
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 1, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    this.particles.push(particles);
  }

  private createDataNodes(): void {
    const THREE = (window as any).THREE;
    const nodeCount = 30;

    for (let i = 0; i < nodeCount; i++) {
      const geometry = new THREE.IcosahedronGeometry(1, 0);
      const material = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
        emissive: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8,
        wireframe: Math.random() > 0.5
      });

      const node = new THREE.Mesh(geometry, material);
      const radius = 30 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      node.position.x = radius * Math.sin(phi) * Math.cos(theta);
      node.position.y = radius * Math.sin(phi) * Math.sin(theta);
      node.position.z = radius * Math.cos(phi);

      node.userData = {
        originalPosition: node.position.clone(),
        speed: 0.1 + Math.random() * 0.2,
        offset: Math.random() * Math.PI * 2
      };

      this.scene.add(node);
      this.dataNodes.push(node);
    }
  }

  private createNeuralNetwork(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < this.dataNodes.length; i++) {
      for (let j = i + 1; j < this.dataNodes.length; j++) {
        if (Math.random() > 0.85) {
          const points = [];
          points.push(this.dataNodes[i].position);
          points.push(this.dataNodes[j].position);

          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0x00ffaa,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
          });

          const line = new THREE.Line(geometry, material);
          this.scene.add(line);
          this.connections.push({
            line: line,
            start: this.dataNodes[i],
            end: this.dataNodes[j]
          });
        }
      }
    }
  }

  private createDataStreams(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 5; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-50, -30, -30),
        new THREE.Vector3(-20, 0, 0),
        new THREE.Vector3(20, 20, 20),
        new THREE.Vector3(50, -10, 30)
      ]);

      const points = curve.getPoints(100);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.4,
        linewidth: 2
      });

      const stream = new THREE.Line(geometry, material);
      stream.rotation.y = (i / 5) * Math.PI * 2;
      this.scene.add(stream);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();

    this.particles.forEach((particle) => {
      particle.rotation.y = time * 0.1;
      particle.rotation.x = time * 0.05;
    });

    this.dataNodes.forEach((node) => {
      const userData = node.userData;
      node.position.x = userData.originalPosition.x + Math.sin(time * userData.speed + userData.offset) * 5;
      node.position.y = userData.originalPosition.y + Math.cos(time * userData.speed + userData.offset) * 5;
      node.position.z = userData.originalPosition.z + Math.sin(time * userData.speed * 0.5 + userData.offset) * 5;
      node.rotation.x += 0.01;
      node.rotation.y += 0.01;

      const scale = 1 + Math.sin(time * 2 + userData.offset) * 0.3;
      node.scale.set(scale, scale, scale);
    });

    this.connections.forEach((conn) => {
      const points = [conn.start.position, conn.end.position];
      conn.line.geometry.setFromPoints(points);
    });

    this.camera.position.x = Math.sin(time * 0.1) * 60;
    this.camera.position.z = Math.cos(time * 0.1) * 60;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onMouseMove(event: MouseEvent): void {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    this.camera.position.x += (mouseX * 10 - this.camera.position.x) * 0.05;
    this.camera.position.y += (mouseY * 10 - this.camera.position.y) * 0.05;
  }
}