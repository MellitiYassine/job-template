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
  private buildings: any[] = [];
  private blueprintLines: any[] = [];
  private particles: any[] = [];

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
    this.camera.position.set(0, 8, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new this.THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const directionalLight = new this.THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    this.scene.add(directionalLight);

    const pointLight1 = new this.THREE.PointLight(0x00d4ff, 1, 50);
    pointLight1.position.set(-10, 5, 0);
    this.scene.add(pointLight1);

    const pointLight2 = new this.THREE.PointLight(0xff6b00, 1, 50);
    pointLight2.position.set(10, 5, 0);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    this.createBuildings();
    this.createBlueprintGrid();
    this.createFloatingTools();
    this.createParticles();
  }

  private createBuildings(): void {
    const buildingConfigs = [
      { x: -8, z: -5, height: 6, width: 2, depth: 2, color: 0x1a3a52 },
      { x: -4, z: -3, height: 9, width: 1.5, depth: 1.5, color: 0x2a4a62 },
      { x: 0, z: -4, height: 12, width: 2.5, depth: 2.5, color: 0x1a3a52 },
      { x: 5, z: -2, height: 7, width: 1.8, depth: 1.8, color: 0x2a5a72 },
      { x: 8, z: -6, height: 5, width: 2, depth: 2, color: 0x1a4a62 },
      { x: -6, z: 2, height: 8, width: 1.5, depth: 1.5, color: 0x2a3a52 },
      { x: 3, z: 3, height: 10, width: 2, depth: 2, color: 0x1a5a72 }
    ];

    buildingConfigs.forEach(config => {
      const geometry = new this.THREE.BoxGeometry(config.width, config.height, config.depth);
      const material = new this.THREE.MeshPhongMaterial({
        color: config.color,
        emissive: 0x0a1a2a,
        specular: 0x00d4ff,
        shininess: 30,
        wireframe: false
      });
      const building = new this.THREE.Mesh(geometry, material);
      building.position.set(config.x, config.height / 2, config.z);
      building.castShadow = true;
      this.buildings.push(building);
      this.scene.add(building);

      const edgesGeometry = new this.THREE.EdgesGeometry(geometry);
      const edgesMaterial = new this.THREE.LineBasicMaterial({ color: 0x00d4ff, linewidth: 2 });
      const edges = new this.THREE.LineSegments(edgesGeometry, edgesMaterial);
      building.add(edges);

      for (let i = 0; i < config.height - 1; i += 1.5) {
        const floorGeometry = new this.THREE.PlaneGeometry(config.width * 0.9, config.depth * 0.9);
        const floorMaterial = new this.THREE.MeshBasicMaterial({ color: 0x00d4ff, opacity: 0.3, transparent: true });
        const floor = new this.THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = i - config.height / 2 + 0.5;
        building.add(floor);
      }
    });
  }

  private createBlueprintGrid(): void {
    const size = 40;
    const divisions = 40;
    const gridHelper = new this.THREE.GridHelper(size, divisions, 0x00d4ff, 0x1a3a52);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);

    for (let i = 0; i < 20; i++) {
      const points = [];
      for (let j = 0; j < 50; j++) {
        const x = (Math.random() - 0.5) * 30;
        const y = Math.random() * 0.1;
        const z = (Math.random() - 0.5) * 30;
        points.push(new this.THREE.Vector3(x, y, z));
      }
      const geometry = new this.THREE.BufferGeometry().setFromPoints(points);
      const material = new this.THREE.LineBasicMaterial({ color: 0x00d4ff, opacity: 0.2, transparent: true });
      const line = new this.THREE.Line(geometry, material);
      this.blueprintLines.push(line);
      this.scene.add(line);
    }
  }

  private createFloatingTools(): void {
    const rulerGeometry = new this.THREE.BoxGeometry(4, 0.1, 0.3);
    const rulerMaterial = new this.THREE.MeshPhongMaterial({ color: 0xffaa00, emissive: 0x442200 });
    const ruler = new this.THREE.Mesh(rulerGeometry, rulerMaterial);
    ruler.position.set(-12, 6, 5);
    ruler.userData = { type: 'ruler', speed: 0.005, radius: 2 };
    this.scene.add(ruler);

    const compassGroup = new this.THREE.Group();
    const compassBody = new this.THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
    const compassMaterial = new this.THREE.MeshPhongMaterial({ color: 0xcccccc, metalness: 0.8 });
    const compass = new this.THREE.Mesh(compassBody, compassMaterial);
    compassGroup.add(compass);
    
    const leg1Geometry = new this.THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const legMaterial = new this.THREE.MeshPhongMaterial({ color: 0x666666 });
    const leg1 = new this.THREE.Mesh(leg1Geometry, legMaterial);
    leg1.position.set(0.2, -1, 0);
    leg1.rotation.z = Math.PI / 6;
    compassGroup.add(leg1);
    
    const leg2 = new this.THREE.Mesh(leg1Geometry, legMaterial);
    leg2.position.set(-0.2, -1, 0);
    leg2.rotation.z = -Math.PI / 6;
    compassGroup.add(leg2);
    
    compassGroup.position.set(12, 7, -3);
    compassGroup.userData = { type: 'compass', speed: 0.008, radius: 1.5 };
    this.scene.add(compassGroup);

    const setSquareGeometry = new this.THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, 0,
      3, 0, 0,
      0, 3, 0
    ]);
    setSquareGeometry.setAttribute('position', new this.THREE.BufferAttribute(vertices, 3));
    const setSquareMaterial = new this.THREE.MeshPhongMaterial({ color: 0x00ff88, side: this.THREE.DoubleSide, emissive: 0x004422 });
    const setSquare = new this.THREE.Mesh(setSquareGeometry, setSquareMaterial);
    setSquare.position.set(0, 10, -8);
    setSquare.userData = { type: 'setSquare', speed: 0.006, radius: 2.5 };
    this.scene.add(setSquare);
  }

  private createParticles(): void {
    const particleGeometry = new this.THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = Math.random() * 30;
      positions[i + 2] = (Math.random() - 0.5) * 60;
    }
    
    particleGeometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
    const particleMaterial = new this.THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: this.THREE.AdditiveBlending
    });
    
    const particleSystem = new this.THREE.Points(particleGeometry, particleMaterial);
    this.particles.push(particleSystem);
    this.scene.add(particleSystem);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.buildings.forEach((building, index) => {
      building.rotation.y = Math.sin(time * 0.2 + index) * 0.02;
      building.position.y = Math.abs(building.geometry.parameters.height / 2 + Math.sin(time * 0.5 + index) * 0.2);
    });

    this.scene.children.forEach((child: any) => {
      if (child.userData.type === 'ruler') {
        child.rotation.z = time * child.userData.speed * 10;
        child.position.y = 6 + Math.sin(time * 2) * child.userData.radius;
      } else if (child.userData.type === 'compass') {
        child.rotation.y = time * child.userData.speed * 8;
        child.position.x = 12 + Math.cos(time) * child.userData.radius;
        child.position.y = 7 + Math.sin(time * 1.5) * child.userData.radius;
      } else if (child.userData.type === 'setSquare') {
        child.rotation.x = time * child.userData.speed * 6;
        child.rotation.z = time * child.userData.speed * 4;
        child.position.y = 10 + Math.sin(time * 1.2) * child.userData.radius;
      }
    });

    this.particles.forEach(particle => {
      particle.rotation.y = time * 0.05;
    });

    this.camera.position.x = Math.sin(time * 0.1) * 25;
    this.camera.position.z = Math.cos(time * 0.1) * 25;
    this.camera.lookAt(0, 5, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}