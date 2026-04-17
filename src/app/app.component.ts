import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

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
  private particles: any[] = [];
  private letters: any[] = [];
  private clock: any;

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 1.5, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1.5, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    this.createFloatingLetters();
    this.createParticleCloud();
    this.createBlogPages();
    this.createPencil();
  }

  private createFloatingLetters(): void {
    const THREE = (window as any).THREE;
    const chars = ['B', 'L', 'O', 'G', '#', '@', '*'];

    for (let i = 0; i < 20; i++) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 128;
      canvas.height = 128;

      context.fillStyle = '#ffffff';
      context.font = 'Bold 80px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(chars[Math.floor(Math.random() * chars.length)], 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.7,
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20
      );
      sprite.scale.set(2, 2, 1);

      sprite.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };

      this.letters.push(sprite);
      this.scene.add(sprite);
    }
  }

  private createParticleCloud(): void {
    const THREE = (window as any).THREE;
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.6);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(geometry, material);
    this.particles.push(particleSystem);
    this.scene.add(particleSystem);
  }

  private createBlogPages(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.PlaneGeometry(2, 3, 1, 1);
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        shininess: 30,
        transparent: true,
        opacity: 0.9
      });

      const page = new THREE.Mesh(geometry, material);
      const angle = (i / 8) * Math.PI * 2;
      const radius = 8;

      page.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 4,
        Math.sin(angle) * radius
      );

      page.rotation.y = -angle + Math.PI / 2;

      page.userData = {
        initialY: page.position.y,
        floatOffset: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01
      };

      this.letters.push(page);
      this.scene.add(page);
    }
  }

  private createPencil(): void {
    const THREE = (window as any).THREE;

    const group = new THREE.Group();

    const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 6);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc00 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    const tipGeometry = new THREE.ConeGeometry(0.1, 0.5, 6);
    const tipMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.y = -2.25;
    group.add(tip);

    const leadGeometry = new THREE.ConeGeometry(0.03, 0.3, 6);
    const leadMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const lead = new THREE.Mesh(leadGeometry, leadMaterial);
    lead.position.y = -2.55;
    group.add(lead);

    const eraserGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 6);
    const eraserMaterial = new THREE.MeshPhongMaterial({ color: 0xff69b4 });
    const eraser = new THREE.Mesh(eraserGeometry, eraserMaterial);
    eraser.position.y = 2.2;
    group.add(eraser);

    group.position.set(-5, 0, 5);
    group.rotation.z = Math.PI / 6;

    group.userData = { rotationSpeed: 0.01 };

    this.letters.push(group);
    this.scene.add(group);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const THREE = (window as any).THREE;
    const elapsedTime = this.clock.getElapsedTime();

    this.letters.forEach((obj) => {
      if (obj.userData.velocity) {
        obj.position.add(obj.userData.velocity);

        if (Math.abs(obj.position.x) > 15) obj.userData.velocity.x *= -1;
        if (Math.abs(obj.position.y) > 15) obj.userData.velocity.y *= -1;
        if (Math.abs(obj.position.z) > 10) obj.userData.velocity.z *= -1;
      }

      if (obj.userData.rotationSpeed) {
        obj.rotation.y += obj.userData.rotationSpeed;
      }

      if (obj.userData.floatOffset !== undefined) {
        obj.position.y = obj.userData.initialY + Math.sin(elapsedTime * 2 + obj.userData.floatOffset) * 0.5;
        obj.rotation.x = Math.sin(elapsedTime + obj.userData.floatOffset) * 0.1;
      }
    });

    this.particles.forEach((system) => {
      system.rotation.y += 0.0005;
      system.rotation.x += 0.0003;
    });

    this.camera.position.x = Math.sin(elapsedTime * 0.3) * 2;
    this.camera.position.y = Math.cos(elapsedTime * 0.2) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}