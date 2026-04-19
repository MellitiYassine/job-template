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
  private pages: any[] = [];
  private cursor: any;
  private particles: any[] = [];
  private pen: any;
  private inkDrops: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
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
    this.camera.position.set(0, 2, 8);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    const pointLight1 = new THREE.PointLight(0x4a90e2, 1, 20);
    pointLight1.position.set(-5, 3, -5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe24a90, 1, 20);
    pointLight2.position.set(5, 3, -5);
    this.scene.add(pointLight2);

    this.createFloatingPages();
    this.createCursor();
    this.createTextParticles();
    this.createPen();
    this.createDesk();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createFloatingPages(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 12; i++) {
      const geometry = new THREE.PlaneGeometry(2, 2.8, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        roughness: 0.7,
        metalness: 0.1,
      });

      const page = new THREE.Mesh(geometry, material);
      page.castShadow = true;
      page.receiveShadow = true;

      const angle = (i / 12) * Math.PI * 2;
      const radius = 5;
      page.position.x = Math.cos(angle) * radius;
      page.position.y = Math.sin(i * 0.5) * 2;
      page.position.z = Math.sin(angle) * radius - 3;
      page.rotation.y = -angle;

      page.userData = {
        originalY: page.position.y,
        speed: 0.3 + Math.random() * 0.3,
        offset: Math.random() * Math.PI * 2,
      };

      this.pages.push(page);
      this.scene.add(page);

      const textGeometry = new THREE.PlaneGeometry(1.8, 0.1);
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
      const lines = Math.floor(Math.random() * 15) + 10;

      for (let j = 0; j < lines; j++) {
        const line = new THREE.Mesh(textGeometry, textMaterial);
        line.position.set(
          0,
          1.2 - j * 0.15,
          0.01
        );
        page.add(line);
      }
    }
  }

  private createCursor(): void {
    const THREE = (window as any).THREE;

    const cursorGeometry = new THREE.BoxGeometry(0.05, 1.2, 0.05);
    const cursorMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x222222,
      emissiveIntensity: 0.5,
    });
    this.cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
    this.cursor.position.set(1, 0, 3);
    this.scene.add(this.cursor);
  }

  private createTextParticles(): void {
    const THREE = (window as any).THREE;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:\'"';

    for (let i = 0; i < 100; i++) {
      const geometry = new THREE.PlaneGeometry(0.2, 0.2);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
        transparent: true,
        opacity: 0.8,
      });
      const particle = new THREE.Mesh(geometry, material);

      particle.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      );

      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        char: chars[Math.floor(Math.random() * chars.length)],
      };

      this.particles.push(particle);
      this.scene.add(particle);
    }
  }

  private createPen(): void {
    const THREE = (window as any).THREE;

    const penGroup = new THREE.Group();

    const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.08, 2, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.6,
      roughness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    penGroup.add(body);

    const tipGeometry = new THREE.ConeGeometry(0.08, 0.3, 16);
    const tipMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      metalness: 0.4,
      roughness: 0.5,
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.y = -1.15;
    tip.castShadow = true;
    penGroup.add(tip);

    const clipGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.03);
    const clipMaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.9,
      roughness: 0.1,
    });
    const clip = new THREE.Mesh(clipGeometry, clipMaterial);
    clip.position.set(0.1, 0.5, 0);
    penGroup.add(clip);

    penGroup.position.set(-2, 2, 2);
    penGroup.rotation.z = Math.PI / 4;

    this.pen = penGroup;
    this.scene.add(penGroup);
  }

  private createDesk(): void {
    const THREE = (window as any).THREE;

    const deskGeometry = new THREE.BoxGeometry(15, 0.3, 10);
    const deskMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2817,
      roughness: 0.8,
      metalness: 0.1,
    });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.y = -2;
    desk.receiveShadow = true;
    this.scene.add(desk);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.pages.forEach((page) => {
      page.position.y =
        page.userData.originalY +
        Math.sin(time * page.userData.speed + page.userData.offset) * 0.5;
      page.rotation.y += 0.002;
      page.rotation.x = Math.sin(time * 0.5 + page.userData.offset) * 0.1;
    });

    if (this.cursor) {
      this.cursor.material.opacity = Math.abs(Math.sin(time * 3));
    }

    this.particles.forEach((particle) => {
      particle.position.add(particle.userData.velocity);
      particle.rotation.z += 0.02;

      if (Math.abs(particle.position.x) > 10) particle.userData.velocity.x *= -1;
      if (Math.abs(particle.position.y) > 5) particle.userData.velocity.y *= -1;
      if (Math.abs(particle.position.z) > 10) particle.userData.velocity.z *= -1;
    });

    if (this.pen) {
      this.pen.position.y = 2 + Math.sin(time * 2) * 0.3;
      this.pen.rotation.z = Math.PI / 4 + Math.sin(time) * 0.2;

      if (Math.random() < 0.05) {
        this.createInkDrop();
      }
    }

    this.inkDrops = this.inkDrops.filter((drop) => {
      drop.position.y -= 0.05;
      drop.material.opacity -= 0.01;

      if (drop.material.opacity <= 0) {
        this.scene.remove(drop);
        return false;
      }
      return true;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 2;
    this.camera.position.y = 2 + Math.cos(time * 0.15) * 0.5;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private createInkDrop(): void {
    const THREE = (window as any).THREE;

    const dropGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const dropMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066cc,
      transparent: true,
      opacity: 0.8,
    });
    const drop = new THREE.Mesh(dropGeometry, dropMaterial);
    drop.position.copy(this.pen.position);
    drop.position.y -= 1.2;

    this.inkDrops.push(drop);
    this.scene.add(drop);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}