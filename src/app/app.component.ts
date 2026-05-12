import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private THREE: any;
  private scene: any;
  private camera: any;
  private renderer: any;
  private gears: any[] = [];
  private particles: any[] = [];
  private blueprintLines: any[] = [];

  ngAfterViewInit(): void {
    this.THREE = (window as any).THREE;
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new this.THREE.Scene();
    this.scene.background = new this.THREE.Color(0x0a0e27);
    this.scene.fog = new this.THREE.Fog(0x0a0e27, 10, 50);

    this.camera = new this.THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;
    this.camera.position.y = 2;

    this.renderer = new this.THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new this.THREE.PointLight(0x00d4ff, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new this.THREE.PointLight(0xff6b00, 1.5, 50);
    pointLight2.position.set(-10, -5, 5);
    this.scene.add(pointLight2);

    const spotLight = new this.THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 20, 0);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    this.createGears();
    this.createParticles();
    this.createBlueprintLines();
    this.createCircuitBoard();
  }

  private createGears(): void {
    const gearPositions = [
      { x: -5, y: 2, z: 0, radius: 2, teeth: 20 },
      { x: 2, y: 3, z: -2, radius: 1.5, teeth: 16 },
      { x: 5, y: -1, z: 1, radius: 1.8, teeth: 18 },
      { x: -2, y: -3, z: -1, radius: 1.2, teeth: 12 },
      { x: 0, y: 0, z: -5, radius: 2.5, teeth: 24 }
    ];

    gearPositions.forEach((pos, index) => {
      const gear = this.createGear(pos.radius, pos.teeth);
      gear.position.set(pos.x, pos.y, pos.z);
      gear.userData = { speed: (index % 2 === 0 ? 0.5 : -0.5) * (1 + Math.random() * 0.5) };
      this.gears.push(gear);
      this.scene.add(gear);
    });
  }

  private createGear(radius: number, teethCount: number): any {
    const shape = new this.THREE.Shape();
    const innerRadius = radius * 0.6;
    const toothHeight = radius * 0.2;
    const toothWidth = (Math.PI * 2 * radius) / teethCount / 2;

    for (let i = 0; i < teethCount; i++) {
      const angle1 = (i / teethCount) * Math.PI * 2;
      const angle2 = ((i + 0.4) / teethCount) * Math.PI * 2;
      const angle3 = ((i + 0.6) / teethCount) * Math.PI * 2;
      const angle4 = ((i + 1) / teethCount) * Math.PI * 2;

      if (i === 0) {
        shape.moveTo(Math.cos(angle1) * radius, Math.sin(angle1) * radius);
      }

      shape.lineTo(Math.cos(angle2) * radius, Math.sin(angle2) * radius);
      shape.lineTo(Math.cos(angle2) * (radius + toothHeight), Math.sin(angle2) * (radius + toothHeight));
      shape.lineTo(Math.cos(angle3) * (radius + toothHeight), Math.sin(angle3) * (radius + toothHeight));
      shape.lineTo(Math.cos(angle3) * radius, Math.sin(angle3) * radius);
      shape.lineTo(Math.cos(angle4) * radius, Math.sin(angle4) * radius);
    }

    const holePath = new this.THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, false);
    shape.holes.push(holePath);

    const extrudeSettings = {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelSegments: 3
    };

    const geometry = new this.THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new this.THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x1a3a5a,
      emissiveIntensity: 0.3
    });

    const gear = new this.THREE.Mesh(geometry, material);
    
    const edgesGeometry = new this.THREE.EdgesGeometry(geometry);
    const edgesMaterial = new this.THREE.LineBasicMaterial({ color: 0x00d4ff, linewidth: 2 });
    const edges = new this.THREE.LineSegments(edgesGeometry, edgesMaterial);
    gear.add(edges);

    return gear;
  }

  private createParticles(): void {
    const particleGeometry = new this.THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;
    }

    particleGeometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));

    const particleMaterial = new this.THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: this.THREE.AdditiveBlending
    });

    const particles = new this.THREE.Points(particleGeometry, particleMaterial);
    this.particles.push(particles);
    this.scene.add(particles);
  }

  private createBlueprintLines(): void {
    for (let i = 0; i < 15; i++) {
      const points = [];
      const startX = (Math.random() - 0.5) * 20;
      const startY = (Math.random() - 0.5) * 20;
      const startZ = (Math.random() - 0.5) * 20;

      points.push(new this.THREE.Vector3(startX, startY, startZ));
      
      for (let j = 0; j < 3; j++) {
        points.push(
          new this.THREE.Vector3(
            startX + (Math.random() - 0.5) * 5,
            startY + (Math.random() - 0.5) * 5,
            startZ + (Math.random() - 0.5) * 5
          )
        );
      }

      const geometry = new this.THREE.BufferGeometry().setFromPoints(points);
      const material = new this.THREE.LineBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.3
      });

      const line = new this.THREE.Line(geometry, material);
      this.blueprintLines.push(line);
      this.scene.add(line);
    }
  }

  private createCircuitBoard(): void {
    const boardGeometry = new this.THREE.PlaneGeometry(20, 15);
    const boardMaterial = new this.THREE.MeshStandardMaterial({
      color: 0x1a2332,
      side: this.THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    const board = new this.THREE.Mesh(boardGeometry, boardMaterial);
    board.position.z = -8;
    board.rotation.x = 0.2;
    this.scene.add(board);

    for (let i = 0; i < 30; i++) {
      const circuitGeometry = new this.THREE.BoxGeometry(0.2, 0.2, 0.1);
      const circuitMaterial = new this.THREE.MeshStandardMaterial({
        color: 0xff6b00,
        emissive: 0xff6b00,
        emissiveIntensity: 0.5
      });
      const circuit = new this.THREE.Mesh(circuitGeometry, circuitMaterial);
      circuit.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 13,
        -7.9
      );
      this.scene.add(circuit);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.gears.forEach((gear) => {
      gear.rotation.z += gear.userData.speed * 0.01;
    });

    this.particles.forEach((particleSystem) => {
      particleSystem.rotation.y += 0.0005;
      particleSystem.rotation.x += 0.0003;
    });

    this.blueprintLines.forEach((line, index) => {
      line.rotation.z += 0.001 * (index % 2 === 0 ? 1 : -1);
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
    this.camera.position.y = 2 + Math.cos(Date.now() * 0.0002) * 1;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}