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
  private books: any[] = [];
  private particles: any[] = [];
  private clock: any;
  private globe: any;
  private equations: any[] = [];

  ngAfterViewInit(): void {
    this.THREE = (window as any).THREE;
    this.clock = new this.THREE.Clock();
    this.initScene();
    this.createLighting();
    this.createBooks();
    this.createGlobe();
    this.createFloatingEquations();
    this.createParticles();
    this.animate();
  }

  private initScene(): void {
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
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new this.THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createLighting(): void {
    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new this.THREE.PointLight(0x4a90e2, 2, 50);
    pointLight1.position.set(10, 10, 10);
    pointLight1.castShadow = true;
    this.scene.add(pointLight1);

    const pointLight2 = new this.THREE.PointLight(0xe24a90, 1.5, 50);
    pointLight2.position.set(-10, 5, -10);
    this.scene.add(pointLight2);

    const spotLight = new this.THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 20, 0);
    spotLight.castShadow = true;
    this.scene.add(spotLight);
  }

  private createBooks(): void {
    const bookColors = [0x8b4513, 0x2c5f2d, 0x1e3a8a, 0x7c2d12, 0x4a1942];
    const bookCount = 30;

    for (let i = 0; i < bookCount; i++) {
      const width = 0.3 + Math.random() * 0.3;
      const height = 1 + Math.random() * 0.5;
      const depth = 0.8 + Math.random() * 0.4;

      const geometry = new this.THREE.BoxGeometry(width, height, depth);
      const material = new this.THREE.MeshStandardMaterial({
        color: bookColors[Math.floor(Math.random() * bookColors.length)],
        roughness: 0.7,
        metalness: 0.1
      });

      const book = new this.THREE.Mesh(geometry, material);
      book.castShadow = true;
      book.receiveShadow = true;

      const angle = (i / bookCount) * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      book.position.x = Math.cos(angle) * radius;
      book.position.y = Math.random() * 10 - 5;
      book.position.z = Math.sin(angle) * radius;

      book.rotation.x = Math.random() * Math.PI;
      book.rotation.y = Math.random() * Math.PI;
      book.rotation.z = Math.random() * Math.PI;

      book.userData = {
        speedX: (Math.random() - 0.5) * 0.002,
        speedY: (Math.random() - 0.5) * 0.002,
        speedZ: (Math.random() - 0.5) * 0.002,
        orbitSpeed: 0.0005 + Math.random() * 0.001,
        orbitRadius: radius,
        angle: angle
      };

      this.books.push(book);
      this.scene.add(book);
    }
  }

  private createGlobe(): void {
    const geometry = new this.THREE.SphereGeometry(2, 32, 32);
    const material = new this.THREE.MeshStandardMaterial({
      color: 0x2a52be,
      wireframe: true,
      emissive: 0x1a3a7e,
      emissiveIntensity: 0.5
    });

    this.globe = new this.THREE.Mesh(geometry, material);
    this.globe.position.set(0, 0, 0);
    this.scene.add(this.globe);

    const innerGlobe = new this.THREE.Mesh(
      new this.THREE.SphereGeometry(1.8, 16, 16),
      new this.THREE.MeshBasicMaterial({
        color: 0x4a90e2,
        transparent: true,
        opacity: 0.2,
        wireframe: true
      })
    );
    this.globe.add(innerGlobe);
  }

  private createFloatingEquations(): void {
    const loader = new this.THREE.TextureLoader();
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 512;
    canvas.height = 128;

    const equations = ['E=mc²', '∫f(x)dx', 'πr²', 'a²+b²=c²', '∑∞', 'Δx→0', 'f\'(x)', '√2'];

    equations.forEach((eq, index) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'rgba(255, 255, 255, 0.9)';
      context.font = 'bold 80px serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(eq, canvas.width / 2, canvas.height / 2);

      const texture = new this.THREE.CanvasTexture(canvas);
      const material = new this.THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8
      });

      const sprite = new this.THREE.Sprite(material);
      sprite.scale.set(2, 0.5, 1);

      const angle = (index / equations.length) * Math.PI * 2;
      const radius = 6;
      sprite.position.x = Math.cos(angle) * radius;
      sprite.position.y = Math.sin(index * 0.7) * 3;
      sprite.position.z = Math.sin(angle) * radius;

      sprite.userData = {
        angle: angle,
        radius: radius,
        speed: 0.0003 + Math.random() * 0.0005,
        floatSpeed: 0.001 + Math.random() * 0.001,
        floatOffset: Math.random() * Math.PI * 2
      };

      this.equations.push(sprite);
      this.scene.add(sprite);
    });
  }

  private createParticles(): void {
    const particleCount = 1000;
    const geometry = new this.THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const color = new this.THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new this.THREE.BufferAttribute(colors, 3));

    const material = new this.THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: this.THREE.AdditiveBlending
    });

    const particles = new this.THREE.Points(geometry, material);
    this.scene.add(particles);
    this.particles.push(particles);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    this.books.forEach((book) => {
      book.rotation.x += book.userData.speedX;
      book.rotation.y += book.userData.speedY;
      book.rotation.z += book.userData.speedZ;

      book.userData.angle += book.userData.orbitSpeed;
      book.position.x = Math.cos(book.userData.angle) * book.userData.orbitRadius;
      book.position.z = Math.sin(book.userData.angle) * book.userData.orbitRadius;
      book.position.y += Math.sin(elapsedTime + book.userData.angle) * 0.005;
    });

    if (this.globe) {
      this.globe.rotation.y = elapsedTime * 0.2;
      this.globe.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;
    }

    this.equations.forEach((eq) => {
      eq.userData.angle += eq.userData.speed;
      eq.position.x = Math.cos(eq.userData.angle) * eq.userData.radius;
      eq.position.z = Math.sin(eq.userData.angle) * eq.userData.radius;
      eq.position.y = Math.sin(elapsedTime * eq.userData.floatSpeed + eq.userData.floatOffset) * 2;
    });

    this.particles.forEach((particleSystem) => {
      particleSystem.rotation.y = elapsedTime * 0.05;
      particleSystem.rotation.x = elapsedTime * 0.03;
    });

    this.camera.position.x = Math.sin(elapsedTime * 0.1) * 15;
    this.camera.position.z = Math.cos(elapsedTime * 0.1) * 15;
    this.camera.position.y = 5 + Math.sin(elapsedTime * 0.15) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}