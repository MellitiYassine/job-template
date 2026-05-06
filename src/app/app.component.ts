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
  private books: any[] = [];
  private pencils: any[] = [];
  private particles: any[] = [];
  private brain!: any;
  private lightbulb!: any;
  private globe!: any;

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
    this.animate();
  }

  private initThree(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.Fog(0x0f172a, 10, 50);

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
    this.renderer.shadowMap.enabled = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4ade80, 2, 20);
    pointLight1.position.set(-8, 5, 0);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x60a5fa, 2, 20);
    pointLight2.position.set(8, 5, 0);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 8; i++) {
      const bookGeometry = new THREE.BoxGeometry(1.5, 0.3, 1);
      const bookMaterial = new THREE.MeshPhongMaterial({
        color: [0x3b82f6, 0x10b981, 0xf59e0b, 0xef4444, 0x8b5cf6][i % 5],
        shininess: 30
      });
      const book = new THREE.Mesh(bookGeometry, bookMaterial);
      book.castShadow = true;
      
      const angle = (i / 8) * Math.PI * 2;
      const radius = 8;
      book.position.x = Math.cos(angle) * radius;
      book.position.y = Math.sin(i * 0.5) * 2;
      book.position.z = Math.sin(angle) * radius;
      book.rotation.y = -angle;
      
      this.books.push(book);
      this.scene.add(book);
    }

    for (let i = 0; i < 12; i++) {
      const pencilGroup = new THREE.Group();
      
      const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2, 6);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xfbbf24 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      
      const tipGeometry = new THREE.ConeGeometry(0.08, 0.3, 6);
      const tipMaterial = new THREE.MeshPhongMaterial({ color: 0x78350f });
      const tip = new THREE.Mesh(tipGeometry, tipMaterial);
      tip.position.y = -1.15;
      
      const eraserGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 6);
      const eraserMaterial = new THREE.MeshPhongMaterial({ color: 0xfca5a5 });
      const eraser = new THREE.Mesh(eraserGeometry, eraserMaterial);
      eraser.position.y = 1.15;
      
      pencilGroup.add(body);
      pencilGroup.add(tip);
      pencilGroup.add(eraser);
      
      const angle = (i / 12) * Math.PI * 2;
      const radius = 6;
      pencilGroup.position.x = Math.cos(angle) * radius;
      pencilGroup.position.y = Math.sin(i * 0.8) * 3 + 3;
      pencilGroup.position.z = Math.sin(angle) * radius;
      pencilGroup.rotation.z = Math.random() * Math.PI * 2;
      
      this.pencils.push(pencilGroup);
      this.scene.add(pencilGroup);
    }

    const brainGroup = new THREE.Group();
    const brainGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0xec4899,
      emissive: 0xec4899,
      emissiveIntensity: 0.2,
      shininess: 50
    });
    const brainMesh = new THREE.Mesh(brainGeometry, brainMaterial);
    brainGroup.add(brainMesh);
    
    for (let i = 0; i < 20; i++) {
      const tubeGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
      const tubeMaterial = new THREE.MeshPhongMaterial({ color: 0xdb2777 });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      tube.position.set(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5
      );
      tube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      brainGroup.add(tube);
    }
    
    brainGroup.position.set(-5, 4, -3);
    this.brain = brainGroup;
    this.scene.add(brainGroup);

    const bulbGroup = new THREE.Group();
    const bulbGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const bulbMaterial = new THREE.MeshPhongMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulbGroup.add(bulb);
    
    const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x71717a });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1;
    bulbGroup.add(base);
    
    bulbGroup.position.set(5, 5, -2);
    this.lightbulb = bulbGroup;
    this.scene.add(bulbGroup);

    const globeGeometry = new THREE.SphereGeometry(1, 32, 32);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      emissive: 0x1e40af,
      emissiveIntensity: 0.2
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    
    const linesMaterial = new THREE.LineBasicMaterial({ color: 0x60a5fa });
    for (let i = 0; i < 12; i++) {
      const points = [];
      const lat = (i / 12) * Math.PI;
      for (let j = 0; j <= 32; j++) {
        const lon = (j / 32) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.sin(lat) * Math.cos(lon),
          Math.cos(lat),
          Math.sin(lat) * Math.sin(lon)
        ));
      }
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, linesMaterial);
      globeMesh.add(line);
    }
    
    globeMesh.position.set(0, -2, 0);
    this.globe = globeMesh;
    this.scene.add(globeMesh);

    for (let i = 0; i < 200; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: [0x4ade80, 0x60a5fa, 0xfbbf24, 0xf472b6][i % 4],
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      particle.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 30
      );
      
      (particle as any).velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      );
      
      this.particles.push(particle);
      this.scene.add(particle);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.books.forEach((book, i) => {
      book.position.y = Math.sin(time + i * 0.5) * 2;
      book.rotation.y += 0.005;
    });

    this.pencils.forEach((pencil, i) => {
      pencil.position.y = Math.sin(time * 0.8 + i * 0.8) * 3 + 3;
      pencil.rotation.z += 0.01;
    });

    if (this.brain) {
      this.brain.rotation.y += 0.01;
      this.brain.position.y = 4 + Math.sin(time) * 0.3;
    }

    if (this.lightbulb) {
      this.lightbulb.rotation.y += 0.02;
      this.lightbulb.position.y = 5 + Math.sin(time * 1.5) * 0.2;
      const scale = 1 + Math.sin(time * 2) * 0.1;
      this.lightbulb.children[0].scale.set(scale, scale, scale);
    }

    if (this.globe) {
      this.globe.rotation.y += 0.005;
    }

    this.particles.forEach(particle => {
      particle.position.add((particle as any).velocity);
      
      if (Math.abs(particle.position.x) > 15) (particle as any).velocity.x *= -1;
      if (Math.abs(particle.position.y) > 10) (particle as any).velocity.y *= -1;
      if (Math.abs(particle.position.z) > 15) (particle as any).velocity.z *= -1;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}