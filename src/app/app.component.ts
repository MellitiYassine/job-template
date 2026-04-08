import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: any;
  private camera!: any;
  private renderer!: any;
  private shapes: any[] = [];
  private particles: any[] = [];
  private mouse = { x: 0, y: 0 };
  private targetRotation = { x: 0, y: 0 };

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
    this.animate();
    this.setupMouseMove();
  }

  private initThree(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 2, 100);
    pointLight3.position.set(0, 10, -10);
    this.scene.add(pointLight3);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.ConeGeometry(0.6, 1.2, 32),
      new THREE.TorusGeometry(0.5, 0.2, 16, 100),
      new THREE.OctahedronGeometry(0.7, 0),
      new THREE.TetrahedronGeometry(0.8, 0),
      new THREE.IcosahedronGeometry(0.7, 0)
    ];

    const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff0066, 0x6600ff, 0xff6600];

    for (let i = 0; i < 20; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        wireframe: Math.random() > 0.5,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (Math.random() - 0.5) * 20;
      mesh.position.y = (Math.random() - 0.5) * 20;
      mesh.position.z = (Math.random() - 0.5) * 20;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatOffset: Math.random() * Math.PI * 2
      };

      this.shapes.push(mesh);
      this.scene.add(mesh);
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particleSystem);
    this.particles.push(particleSystem);

    const gridHelper = new THREE.GridHelper(30, 30, 0x00ffff, 0xff00ff);
    gridHelper.position.y = -8;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    this.scene.add(gridHelper);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.shapes.forEach((shape) => {
      shape.rotation.x += shape.userData.rotationSpeed.x;
      shape.rotation.y += shape.userData.rotationSpeed.y;
      shape.rotation.z += shape.userData.rotationSpeed.z;

      shape.position.y += Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.01;
    });

    this.particles.forEach((particle) => {
      particle.rotation.y += 0.001;
    });

    this.camera.rotation.x += (this.targetRotation.x - this.camera.rotation.x) * 0.05;
    this.camera.rotation.y += (this.targetRotation.y - this.camera.rotation.y) * 0.05;

    this.renderer.render(this.scene, this.camera);
  }

  private setupMouseMove(): void {
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      this.targetRotation.y = this.mouse.x * 0.3;
      this.targetRotation.x = this.mouse.y * 0.3;
    });
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}