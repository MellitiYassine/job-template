import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private THREE: any;
  private scene: any;
  private camera: any;
  private renderer: any;
  private shapes: any[] = [];
  private particles: any[] = [];
  private time = 0;

  ngAfterViewInit(): void {
    this.THREE = (window as any).THREE;
    this.initScene();
    this.createShapes();
    this.createParticles();
    this.animate();
    window.addEventListener('resize', () => this.onResize());
  }

  private initScene(): void {
    this.scene = new this.THREE.Scene();
    this.scene.background = new this.THREE.Color(0x0a0a0a);
    this.scene.fog = new this.THREE.Fog(0x0a0a0a, 10, 50);

    this.camera = new this.THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 20;

    this.renderer = new this.THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight1 = new this.THREE.PointLight(0xff00ff, 2, 100);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new this.THREE.PointLight(0x00ffff, 2, 100);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    const pointLight3 = new this.THREE.PointLight(0xffff00, 2, 100);
    pointLight3.position.set(0, 10, -10);
    this.scene.add(pointLight3);
  }

  private createShapes(): void {
    const geometries = [
      new this.THREE.TorusGeometry(2, 0.5, 16, 100),
      new this.THREE.IcosahedronGeometry(2, 0),
      new this.THREE.OctahedronGeometry(2, 0),
      new this.THREE.TetrahedronGeometry(2, 0),
      new this.THREE.BoxGeometry(3, 3, 3),
      new this.THREE.ConeGeometry(2, 4, 32)
    ];

    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new this.THREE.MeshPhongMaterial({
        color: Math.random() * 0xffffff,
        wireframe: Math.random() > 0.5,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      
      const mesh = new this.THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.scale.set(
        0.5 + Math.random() * 0.5,
        0.5 + Math.random() * 0.5,
        0.5 + Math.random() * 0.5
      );
      
      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: (Math.random() - 0.5) * 0.02,
        floatOffset: Math.random() * Math.PI * 2,
        originalY: mesh.position.y
      };
      
      this.shapes.push(mesh);
      this.scene.add(mesh);
    }
  }

  private createParticles(): void {
    const particleGeometry = new this.THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }

    particleGeometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));

    const particleMaterial = new this.THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: this.THREE.AdditiveBlending
    });

    const particleSystem = new this.THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particleSystem);
    this.particles.push(particleSystem);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    
    this.time += 0.01;
    
    this.shapes.forEach((shape) => {
      shape.rotation.x += shape.userData.rotationSpeed.x;
      shape.rotation.y += shape.userData.rotationSpeed.y;
      shape.rotation.z += shape.userData.rotationSpeed.z;
      
      shape.position.y = shape.userData.originalY + Math.sin(this.time + shape.userData.floatOffset) * 2;
    });

    this.particles.forEach((particle) => {
      particle.rotation.y += 0.001;
    });

    this.camera.position.x = Math.sin(this.time * 0.2) * 5;
    this.camera.position.y = Math.cos(this.time * 0.15) * 5;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}