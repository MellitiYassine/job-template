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
  private documents: any[] = [];
  private pencils: any[] = [];
  private particles: any[] = [];
  private time = 0;

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
    this.camera.position.z = 15;
    this.camera.position.y = 2;
    
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x4a90e2, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xe24a90, 1.5, 50);
    pointLight2.position.set(-10, -5, 5);
    this.scene.add(pointLight2);
    
    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 20, 0);
    spotLight.castShadow = true;
    this.scene.add(spotLight);
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;
    
    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.BoxGeometry(2.5, 3.2, 0.1);
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x4a90e2,
        emissiveIntensity: 0.2,
        shininess: 30
      });
      const document = new THREE.Mesh(geometry, material);
      
      const angle = (i / 8) * Math.PI * 2;
      const radius = 8;
      document.position.x = Math.cos(angle) * radius;
      document.position.z = Math.sin(angle) * radius;
      document.position.y = Math.sin(i) * 2;
      document.rotation.y = -angle;
      
      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x4a90e2, linewidth: 2 });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      document.add(edges);
      
      const textGeometry = new THREE.PlaneGeometry(2, 0.3);
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
      for (let j = 0; j < 5; j++) {
        const line = new THREE.Mesh(textGeometry, textMaterial);
        line.position.y = 1 - j * 0.4;
        line.position.z = 0.06;
        document.add(line);
      }
      
      this.documents.push({
        mesh: document,
        speed: 0.2 + Math.random() * 0.3,
        offset: i * 0.5
      });
      this.scene.add(document);
    }
    
    for (let i = 0; i < 5; i++) {
      const pencilGroup = new THREE.Group();
      
      const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      pencilGroup.add(body);
      
      const tipGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
      const tipMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
      const tip = new THREE.Mesh(tipGeometry, tipMaterial);
      tip.position.y = -1.65;
      pencilGroup.add(tip);
      
      const leadGeometry = new THREE.ConeGeometry(0.03, 0.15, 8);
      const leadMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
      const lead = new THREE.Mesh(leadGeometry, leadMaterial);
      lead.position.y = -1.725;
      pencilGroup.add(lead);
      
      pencilGroup.position.x = (i - 2) * 2.5;
      pencilGroup.position.y = -8 + i * 0.5;
      pencilGroup.position.z = 3;
      pencilGroup.rotation.z = Math.PI / 6;
      
      this.pencils.push({
        mesh: pencilGroup,
        speed: 0.5 + i * 0.2,
        baseY: pencilGroup.position.y
      });
      this.scene.add(pencilGroup);
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x4a90e2,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particleSystem);
    this.particles.push(particleSystem);
    
    const glowGeometry = new THREE.TorusGeometry(12, 0.3, 16, 100);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI / 2;
    this.scene.add(glow);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.time += 0.01;
    
    this.documents.forEach((doc, index) => {
      doc.mesh.rotation.y += 0.005 * doc.speed;
      doc.mesh.position.y = Math.sin(this.time * doc.speed + doc.offset) * 2;
    });
    
    this.pencils.forEach((pencil, index) => {
      pencil.mesh.position.y = pencil.baseY + Math.sin(this.time * pencil.speed) * 8;
      pencil.mesh.rotation.x = this.time * 0.5;
      pencil.mesh.rotation.z = Math.PI / 6 + Math.sin(this.time) * 0.2;
    });
    
    this.particles.forEach(particle => {
      particle.rotation.y += 0.001;
      particle.rotation.x += 0.0005;
    });
    
    this.camera.position.x = Math.sin(this.time * 0.2) * 2;
    this.camera.position.y = 2 + Math.cos(this.time * 0.15) * 1;
    this.camera.lookAt(0, 0, 0);
    
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}