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
  private codeBlocks: any[] = [];
  private particles: any[] = [];
  private mouse = { x: 0, y: 0 };

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
    this.animate();
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('resize', () => this.onResize());
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
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff88, 1.5, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0088ff, 1.5, 50);
    pointLight2.position.set(-10, -10, 5);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xff00ff, 1.2, 50);
    pointLight3.position.set(0, 10, -10);
    this.scene.add(pointLight3);

    this.createCodeBlocks();
    this.createParticles();
    this.createFloatingSymbols();
    this.createGrid();
  }

  private createCodeBlocks(): void {
    const THREE = (window as any).THREE;
    const codeSnippets = [
      '</>',
      '{ }',
      '< >',
      '=>',
      'fn()',
      'CSS',
      'JS',
      'TS',
      'HTML'
    ];

    for (let i = 0; i < 25; i++) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 256;
      canvas.height = 256;

      context.fillStyle = '#000000';
      context.fillRect(0, 0, 256, 256);

      context.font = 'bold 80px monospace';
      context.fillStyle = ['#00ff88', '#0088ff', '#ff00ff', '#ffaa00'][i % 4];
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(codeSnippets[i % codeSnippets.length], 128, 128);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        emissive: new THREE.Color(['#00ff88', '#0088ff', '#ff00ff', '#ffaa00'][i % 4]),
        emissiveIntensity: 0.3
      });

      const geometry = new THREE.BoxGeometry(1.5, 1.5, 0.2);
      const cube = new THREE.Mesh(geometry, material);

      cube.position.x = (Math.random() - 0.5) * 30;
      cube.position.y = (Math.random() - 0.5) * 20;
      cube.position.z = (Math.random() - 0.5) * 30;

      cube.rotation.x = Math.random() * Math.PI;
      cube.rotation.y = Math.random() * Math.PI;

      cube.userData = {
        speedX: (Math.random() - 0.5) * 0.01,
        speedY: (Math.random() - 0.5) * 0.01,
        speedZ: (Math.random() - 0.5) * 0.005,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };

      this.codeBlocks.push(cube);
      this.scene.add(cube);
    }
  }

  private createParticles(): void {
    const THREE = (window as any).THREE;
    const particleCount = 500;

    for (let i = 0; i < particleCount; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: ['#00ff88', '#0088ff', '#ff00ff'][i % 3],
        transparent: true,
        opacity: 0.6
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50
      );

      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      };

      this.particles.push(particle);
      this.scene.add(particle);
    }
  }

  private createFloatingSymbols(): void {
    const THREE = (window as any).THREE;
    const symbols = ['@', '#', '$', '%', '&', '*', '+', '='];

    for (let i = 0; i < 15; i++) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 128;
      canvas.height = 128;

      context.font = 'bold 60px monospace';
      context.fillStyle = '#ffffff';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(symbols[i % symbols.length], 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.4,
        color: ['#00ff88', '#0088ff', '#ff00ff'][i % 3]
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20
      );
      sprite.scale.set(2, 2, 1);

      sprite.userData = {
        speedY: 0.01 + Math.random() * 0.02,
        initialY: sprite.position.y
      };

      this.scene.add(sprite);
    }
  }

  private createGrid(): void {
    const THREE = (window as any).THREE;
    const gridHelper = new THREE.GridHelper(50, 50, 0x00ff88, 0x0088ff);
    gridHelper.position.y = -8;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.codeBlocks.forEach(block => {
      block.rotation.x += block.userData.rotationSpeed;
      block.rotation.y += block.userData.rotationSpeed * 0.5;

      block.position.x += block.userData.speedX;
      block.position.y += block.userData.speedY;
      block.position.z += block.userData.speedZ;

      if (Math.abs(block.position.x) > 20) block.userData.speedX *= -1;
      if (Math.abs(block.position.y) > 15) block.userData.speedY *= -1;
      if (Math.abs(block.position.z) > 20) block.userData.speedZ *= -1;
    });

    this.particles.forEach(particle => {
      particle.position.add(particle.userData.velocity);

      if (Math.abs(particle.position.x) > 25) particle.userData.velocity.x *= -1;
      if (Math.abs(particle.position.y) > 25) particle.userData.velocity.y *= -1;
      if (Math.abs(particle.position.z) > 25) particle.userData.velocity.z *= -1;
    });

    this.scene.children.forEach((child: any) => {
      if (child.isSprite && child.userData.speedY) {
        child.position.y += child.userData.speedY;
        if (child.position.y > 20) {
          child.position.y = -20;
        }
      }
    });

    this.camera.position.x += (this.mouse.x * 3 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouse.y * 2 + 2 - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}