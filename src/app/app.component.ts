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
  private networks: any[] = [];
  private dataNodes: any[] = [];
  private mouseX = 0;
  private mouseY = 0;

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.animate();
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('resize', () => this.onResize());
  }

  private initThreeJS(): void {
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
    
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a0a1a, 1);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    this.scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);
    
    this.createDataNodes();
    this.createNetworkConnections();
    this.createFloatingParticles();
    this.createServerRacks();
  }

  private createDataNodes(): void {
    const THREE = (window as any).THREE;
    
    for (let i = 0; i < 50; i++) {
      const geometry = new THREE.SphereGeometry(0.15, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
        emissive: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
      });
      const sphere = new THREE.Mesh(geometry, material);
      
      const radius = 15;
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
        originalPosition: sphere.position.clone()
      };
      
      this.scene.add(sphere);
      this.dataNodes.push(sphere);
    }
  }

  private createNetworkConnections(): void {
    const THREE = (window as any).THREE;
    
    for (let i = 0; i < this.dataNodes.length; i++) {
      for (let j = i + 1; j < this.dataNodes.length; j++) {
        const distance = this.dataNodes[i].position.distanceTo(this.dataNodes[j].position);
        
        if (distance < 8 && Math.random() > 0.7) {
          const points = [];
          points.push(this.dataNodes[i].position);
          points.push(this.dataNodes[j].position);
          
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
          });
          
          const line = new THREE.Line(geometry, material);
          this.scene.add(line);
          this.networks.push(line);
        }
      }
    }
  }

  private createFloatingParticles(): void {
    const THREE = (window as any).THREE;
    
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particleSystem);
    this.particles.push(particleSystem);
  }

  private createServerRacks(): void {
    const THREE = (window as any).THREE;
    
    for (let i = 0; i < 3; i++) {
      const rackGeometry = new THREE.BoxGeometry(2, 4, 1);
      const rackMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a2e,
        emissive: 0x00ffff,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.7
      });
      const rack = new THREE.Mesh(rackGeometry, rackMaterial);
      
      rack.position.x = (i - 1) * 8;
      rack.position.y = 0;
      rack.position.z = -10;
      rack.rotation.y = Math.PI / 6;
      
      this.scene.add(rack);
      
      for (let j = 0; j < 8; j++) {
        const lightGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.05);
        const lightMaterial = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? 0x00ff00 : 0xff0000,
          emissive: Math.random() > 0.5 ? 0x00ff00 : 0xff0000
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        
        light.position.x = rack.position.x + 0.8;
        light.position.y = rack.position.y - 1.5 + j * 0.4;
        light.position.z = rack.position.z + 0.5;
        
        this.scene.add(light);
        this.dataNodes.push(light);
      }
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    
    this.dataNodes.forEach((node) => {
      if (node.userData.velocity) {
        node.position.add(node.userData.velocity);
        
        if (node.position.length() > 20) {
          node.userData.velocity.negate();
        }
        
        node.rotation.x += 0.01;
        node.rotation.y += 0.01;
      }
    });
    
    this.particles.forEach((system) => {
      system.rotation.y += 0.0005;
      system.rotation.x += 0.0003;
    });
    
    this.camera.position.x += (this.mouseX * 5 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouseY * 5 - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);
    
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}