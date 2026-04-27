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
  private graphs: any[] = [];
  private stars: any[] = [];
  private handshake: any;

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
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
    this.camera.position.z = 20;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4fc3f7, 2, 50);
    pointLight.position.set(10, 10, 10);
    this.scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 2, 50);
    pointLight2.position.set(-10, -10, 5);
    this.scene.add(pointLight2);

    this.createStarField();
    this.createConnectionNetwork();
    this.createFloatingGraphs();
    this.createSuccessMetrics();
    this.createHandshake();
  }

  private createStarField(): void {
    const THREE = (window as any).THREE;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 1000; i++) {
      vertices.push(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
    this.stars.push(points);
  }

  private createConnectionNetwork(): void {
    const THREE = (window as any).THREE;
    const nodes = [];

    for (let i = 0; i < 30; i++) {
      const geometry = new THREE.SphereGeometry(0.15, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0x4fc3f7 : 0xff6b9d,
        emissive: Math.random() > 0.5 ? 0x4fc3f7 : 0xff6b9d,
        emissiveIntensity: 0.5
      });
      const node = new THREE.Mesh(geometry, material);

      const angle = (i / 30) * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      node.position.x = Math.cos(angle) * radius;
      node.position.y = Math.sin(angle) * radius;
      node.position.z = (Math.random() - 0.5) * 6;

      node.userData = { originalY: node.position.y, speed: 0.5 + Math.random() * 0.5 };
      this.scene.add(node);
      nodes.push(node);
      this.particles.push(node);
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.7) {
          const points = [nodes[i].position, nodes[j].position];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0x4fc3f7,
            opacity: 0.3,
            transparent: true
          });
          const line = new THREE.Line(geometry, material);
          this.scene.add(line);
          this.particles.push(line);
        }
      }
    }
  }

  private createFloatingGraphs(): void {
    const THREE = (window as any).THREE;

    for (let g = 0; g < 3; g++) {
      const points = [];
      for (let i = 0; i < 20; i++) {
        points.push(
          new THREE.Vector3(
            (i - 10) * 0.3,
            Math.sin(i * 0.5) * 2 + Math.random() * 0.5,
            0
          )
        );
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 });
      const graph = new THREE.Line(geometry, material);

      graph.position.x = (g - 1) * 8;
      graph.position.y = 5 + g * 2;
      graph.position.z = -5;
      graph.rotation.y = Math.PI * 0.2;

      graph.userData = { rotationSpeed: 0.001 + Math.random() * 0.001 };

      this.scene.add(graph);
      this.graphs.push(graph);
    }
  }

  private createSuccessMetrics(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 5; i++) {
      const height = 2 + Math.random() * 3;
      const geometry = new THREE.CylinderGeometry(0.3, 0.3, height, 32);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.7
      });
      const bar = new THREE.Mesh(geometry, material);

      bar.position.x = (i - 2) * 2;
      bar.position.y = -5 + height / 2;
      bar.position.z = -8;

      bar.userData = { originalHeight: height, phase: Math.random() * Math.PI * 2 };

      this.scene.add(bar);
      this.particles.push(bar);
    }
  }

  private createHandshake(): void {
    const THREE = (window as any).THREE;

    const group = new THREE.Group();

    const armGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0x4fc3f7 });

    const arm1 = new THREE.Mesh(armGeometry, armMaterial);
    arm1.position.set(-2, 0, 0);
    arm1.rotation.z = Math.PI / 4;

    const arm2 = new THREE.Mesh(armGeometry, armMaterial);
    arm2.position.set(2, 0, 0);
    arm2.rotation.z = -Math.PI / 4;

    const handGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const handMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b9d });

    const hand1 = new THREE.Mesh(handGeometry, handMaterial);
    hand1.position.set(-0.5, 0, 0);

    const hand2 = new THREE.Mesh(handGeometry, handMaterial);
    hand2.position.set(0.5, 0, 0);

    group.add(arm1, arm2, hand1, hand2);
    group.position.set(0, -2, 5);
    group.scale.set(0.8, 0.8, 0.8);

    this.scene.add(group);
    this.handshake = group;
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.particles.forEach((particle, index) => {
      if (particle.userData.originalY !== undefined) {
        particle.position.y = particle.userData.originalY + Math.sin(time * particle.userData.speed + index) * 0.3;
      }
      if (particle.userData.originalHeight !== undefined) {
        const scale = 1 + Math.sin(time * 2 + particle.userData.phase) * 0.1;
        particle.scale.y = scale;
      }
    });

    this.graphs.forEach(graph => {
      graph.rotation.y += graph.userData.rotationSpeed;
      graph.position.y += Math.sin(time * 2) * 0.005;
    });

    if (this.handshake) {
      this.handshake.rotation.y = Math.sin(time * 0.5) * 0.2;
      this.handshake.position.y = -2 + Math.sin(time) * 0.3;
    }

    this.stars.forEach(star => {
      star.rotation.y += 0.0001;
      star.rotation.x += 0.00005;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 2;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}