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
  private particles: any[] = [];
  private servers: any[] = [];
  private connections: any[] = [];
  private time = 0;

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
    this.animate();
    window.addEventListener('resize', () => this.onResize());
  }

  private initThree(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;
    
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 25;
    this.camera.position.y = 5;
    
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x0a0a1a, 1);
  }

  private createScene(): void {
    const THREE = (window as any).THREE;
    
    const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x00ff88, 1, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x0088ff, 1, 50);
    pointLight2.position.set(-10, -10, -10);
    this.scene.add(pointLight2);
    
    this.createServerNodes();
    this.createParticleSystem();
    this.createConnectionLines();
    this.createFloatingIcons();
  }

  private createServerNodes(): void {
    const THREE = (window as any).THREE;
    const positions = [
      { x: -8, y: 4, z: -5 },
      { x: 8, y: 4, z: -5 },
      { x: -8, y: -4, z: -5 },
      { x: 8, y: -4, z: -5 },
      { x: 0, y: 0, z: -8 }
    ];
    
    positions.forEach((pos, i) => {
      const geometry = new THREE.BoxGeometry(2, 2.5, 1.5);
      const material = new THREE.MeshPhongMaterial({
        color: i === 4 ? 0x00ff88 : 0x0088ff,
        emissive: i === 4 ? 0x00ff88 : 0x0088ff,
        emissiveIntensity: 0.3,
        shininess: 100
      });
      const server = new THREE.Mesh(geometry, material);
      server.position.set(pos.x, pos.y, pos.z);
      
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      server.add(wireframe);
      
      this.scene.add(server);
      this.servers.push({ mesh: server, baseY: pos.y, phase: i * 0.5 });
    });
  }

  private createParticleSystem(): void {
    const THREE = (window as any).THREE;
    const geometry = new THREE.BufferGeometry();
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = (Math.random() - 0.5) * 60;
      positions[i + 2] = (Math.random() - 0.5) * 60;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);
    this.particles.push(particles);
  }

  private createConnectionLines(): void {
    const THREE = (window as any).THREE;
    
    for (let i = 0; i < this.servers.length - 1; i++) {
      for (let j = i + 1; j < this.servers.length; j++) {
        const points = [
          this.servers[i].mesh.position,
          this.servers[j].mesh.position
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0.2
        });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.connections.push({ line, material });
      }
    }
  }

  private createFloatingIcons(): void {
    const THREE = (window as any).THREE;
    const iconCount = 20;
    
    for (let i = 0; i < iconCount; i++) {
      const geometry = new THREE.OctahedronGeometry(0.3);
      const material = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0xff6600 : 0x00ff88,
        emissive: Math.random() > 0.5 ? 0xff6600 : 0x00ff88,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
      });
      const icon = new THREE.Mesh(geometry, material);
      
      icon.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      
      this.scene.add(icon);
      this.particles.push({
        mesh: icon,
        velocity: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        }
      });
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.time += 0.01;
    
    this.servers.forEach((server) => {
      server.mesh.rotation.y += 0.005;
      server.mesh.position.y = server.baseY + Math.sin(this.time + server.phase) * 0.5;
    });
    
    this.particles.forEach((particle, index) => {
      if (particle.mesh) {
        particle.mesh.rotation.x += 0.02;
        particle.mesh.rotation.y += 0.02;
        particle.mesh.position.x += particle.velocity.x;
        particle.mesh.position.y += particle.velocity.y;
        particle.mesh.position.z += particle.velocity.z;
        
        if (Math.abs(particle.mesh.position.x) > 15) particle.velocity.x *= -1;
        if (Math.abs(particle.mesh.position.y) > 10) particle.velocity.y *= -1;
        if (Math.abs(particle.mesh.position.z) > 10) particle.velocity.z *= -1;
      } else {
        particle.rotation.y += 0.001;
      }
    });
    
    this.connections.forEach((conn, i) => {
      conn.material.opacity = 0.1 + Math.abs(Math.sin(this.time + i * 0.3)) * 0.3;
    });
    
    this.camera.position.x = Math.sin(this.time * 0.2) * 2;
    this.camera.position.y = 5 + Math.cos(this.time * 0.15) * 2;
    this.camera.lookAt(0, 0, -5);
    
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}