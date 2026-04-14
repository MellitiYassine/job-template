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
  private icons: any[] = [];
  private time = 0;

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);
    
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
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;
    
    const iconShapes = [
      { type: 'camera', color: 0xff1493 },
      { type: 'play', color: 0xff4500 },
      { type: 'heart', color: 0xff69b4 },
      { type: 'star', color: 0xffd700 },
      { type: 'like', color: 0x00bfff }
    ];
    
    for (let i = 0; i < 50; i++) {
      const shape = iconShapes[Math.floor(Math.random() * iconShapes.length)];
      let geometry;
      
      switch(shape.type) {
        case 'camera':
          geometry = new THREE.BoxGeometry(0.8, 0.6, 0.4);
          break;
        case 'play':
          geometry = new THREE.ConeGeometry(0.4, 0.7, 3);
          break;
        case 'heart':
          geometry = new THREE.SphereGeometry(0.3, 8, 8);
          break;
        case 'star':
          geometry = new THREE.OctahedronGeometry(0.4);
          break;
        default:
          geometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
      }
      
      const material = new THREE.MeshStandardMaterial({
        color: shape.color,
        emissive: shape.color,
        emissiveIntensity: 0.3,
        metalness: 0.8,
        roughness: 0.2
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      const angle = (i / 50) * Math.PI * 2;
      const radius = 8 + Math.random() * 10;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = (Math.random() - 0.5) * 15;
      mesh.position.z = Math.sin(angle) * radius;
      
      mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.02,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        orbitSpeed: 0.0005 + Math.random() * 0.001,
        orbitRadius: radius,
        angle: angle
      };
      
      this.scene.add(mesh);
      this.icons.push(mesh);
    }
    
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particlesMesh);
    this.particles.push(particlesMesh);
    
    const centralGeometry = new THREE.TorusKnotGeometry(2, 0.6, 128, 16);
    const centralMaterial = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.5,
      metalness: 1,
      roughness: 0.1,
      wireframe: false
    });
    const centralMesh = new THREE.Mesh(centralGeometry, centralMaterial);
    centralMesh.position.y = 0;
    this.scene.add(centralMesh);
    this.icons.push(centralMesh);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    
    this.time += 0.01;
    
    this.icons.forEach((icon, index) => {
      if (index === this.icons.length - 1) {
        icon.rotation.x += 0.01;
        icon.rotation.y += 0.01;
      } else {
        icon.userData.angle += icon.userData.orbitSpeed;
        icon.position.x = Math.cos(icon.userData.angle) * icon.userData.orbitRadius;
        icon.position.z = Math.sin(icon.userData.angle) * icon.userData.orbitRadius;
        icon.position.y += icon.userData.speedY;
        
        if (icon.position.y > 10) icon.position.y = -10;
        if (icon.position.y < -10) icon.position.y = 10;
        
        icon.rotation.x += icon.userData.rotationSpeed;
        icon.rotation.y += icon.userData.rotationSpeed;
      }
    });
    
    this.particles.forEach(particle => {
      particle.rotation.y += 0.0005;
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