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
  private books: any[] = [];
  private particles: any[] = [];
  private clock: any;

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e27);
    this.scene.fog = new THREE.Fog(0x0a0e27, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x6366f1, 1.5);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0xf59e0b, 1, 30);
    pointLight1.position.set(-8, 5, 5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 1, 30);
    pointLight2.position.set(8, 5, -5);
    this.scene.add(pointLight2);

    this.createBooks();
    this.createParticles();
    this.createFloatingIcons();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createBooks(): void {
    const THREE = (window as any).THREE;
    const colors = [0x6366f1, 0xf59e0b, 0x10b981, 0xef4444, 0x8b5cf6];

    for (let i = 0; i < 8; i++) {
      const bookGroup = new THREE.Group();

      const bookGeometry = new THREE.BoxGeometry(1.5, 2, 0.3);
      const bookMaterial = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.4,
        metalness: 0.3
      });
      const book = new THREE.Mesh(bookGeometry, bookMaterial);
      book.castShadow = true;
      book.receiveShadow = true;

      const spineGeometry = new THREE.BoxGeometry(1.5, 2, 0.1);
      const spineMaterial = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.2,
        metalness: 0.5
      });
      const spine = new THREE.Mesh(spineGeometry, spineMaterial);
      spine.position.z = 0.2;

      bookGroup.add(book);
      bookGroup.add(spine);

      const angle = (i / 8) * Math.PI * 2;
      const radius = 8;
      bookGroup.position.x = Math.cos(angle) * radius;
      bookGroup.position.y = Math.sin(i * 0.5) * 2;
      bookGroup.position.z = Math.sin(angle) * radius;
      bookGroup.rotation.y = -angle + Math.PI / 2;

      bookGroup.userData = {
        originalY: bookGroup.position.y,
        speed: 0.5 + Math.random() * 0.5,
        offset: i * 0.5
      };

      this.books.push(bookGroup);
      this.scene.add(bookGroup);
    }
  }

  private createParticles(): void {
    const THREE = (window as any).THREE;
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    this.scene.add(particleSystem);
    this.particles.push(particleSystem);
  }

  private createFloatingIcons(): void {
    const THREE = (window as any).THREE;
    const shapes = [];

    const playGeometry = new THREE.ConeGeometry(0.3, 0.6, 3);
    playGeometry.rotateZ(-Math.PI / 2);
    const playMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.3
    });
    const play = new THREE.Mesh(playGeometry, playMaterial);
    play.position.set(-5, 3, 5);
    play.userData = { rotSpeed: 0.02, floatSpeed: 1 };
    shapes.push(play);
    this.scene.add(play);

    const certificateGeometry = new THREE.TorusGeometry(0.5, 0.1, 16, 32);
    const certificateMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.3
    });
    const certificate = new THREE.Mesh(certificateGeometry, certificateMaterial);
    certificate.position.set(5, 2, -3);
    certificate.userData = { rotSpeed: 0.015, floatSpeed: 1.2 };
    shapes.push(certificate);
    this.scene.add(certificate);

    const lightbulbGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const lightbulbMaterial = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.5
    });
    const lightbulb = new THREE.Mesh(lightbulbGeometry, lightbulbMaterial);
    lightbulb.position.set(0, 6, -5);
    lightbulb.userData = { rotSpeed: 0.01, floatSpeed: 0.8 };
    shapes.push(lightbulb);
    this.scene.add(lightbulb);

    this.particles.push(...shapes);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();

    this.books.forEach((book: any, index: number) => {
      book.position.y = book.userData.originalY + Math.sin(time * book.userData.speed + book.userData.offset) * 0.5;
      book.rotation.y += 0.005;
    });

    this.particles.forEach((particle: any, index: number) => {
      if (particle.geometry && particle.geometry.attributes) {
        particle.rotation.y += 0.001;
      } else if (particle.userData.rotSpeed) {
        particle.rotation.y += particle.userData.rotSpeed;
        particle.rotation.z += particle.userData.rotSpeed * 0.5;
        particle.position.y += Math.sin(time * particle.userData.floatSpeed) * 0.01;
      }
    });

    this.camera.position.x = Math.sin(time * 0.1) * 2;
    this.camera.position.z = 15 + Math.cos(time * 0.1) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}