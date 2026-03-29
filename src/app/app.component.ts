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
  private phones: any[] = [];
  private particles: any[] = [];
  private codes: any[] = [];

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
    this.animate();
  }

  private initThree(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a1f, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a0a1f, 1);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 5; i++) {
      const phoneGroup = new THREE.Group();

      const screenGeometry = new THREE.BoxGeometry(2, 3.5, 0.2);
      const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        metalness: 0.8,
        roughness: 0.2
      });
      const phone = new THREE.Mesh(screenGeometry, screenMaterial);

      const displayGeometry = new THREE.PlaneGeometry(1.8, 3.2);
      const displayMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        emissive: 0x00ffaa,
        emissiveIntensity: 0.5
      });
      const display = new THREE.Mesh(displayGeometry, displayMaterial);
      display.position.z = 0.11;

      const buttonGeometry = new THREE.CircleGeometry(0.2, 32);
      const buttonMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9
      });
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.position.set(0, -1.5, 0.11);

      phoneGroup.add(phone);
      phoneGroup.add(display);
      phoneGroup.add(button);

      const angle = (i / 5) * Math.PI * 2;
      phoneGroup.position.x = Math.cos(angle) * 8;
      phoneGroup.position.y = Math.sin(angle) * 8;
      phoneGroup.position.z = -5;

      phoneGroup.rotation.x = Math.random() * 0.5;
      phoneGroup.rotation.y = Math.random() * 0.5;

      this.scene.add(phoneGroup);
      this.phones.push({
        mesh: phoneGroup,
        speed: 0.001 + Math.random() * 0.002,
        axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()
      });
    }

    for (let i = 0; i < 200; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(geometry, material);

      particle.position.x = (Math.random() - 0.5) * 40;
      particle.position.y = (Math.random() - 0.5) * 40;
      particle.position.z = (Math.random() - 0.5) * 40;

      this.scene.add(particle);
      this.particles.push({
        mesh: particle,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      });
    }

    const codeSymbols = ['{ }', '< >', '[ ]', '( )', '=', ';', '//', '/*', '*/', 'fn', 'let', 'var'];
    for (let i = 0; i < 30; i++) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 128;
      canvas.height = 128;
      context.fillStyle = 'rgba(0, 255, 170, 0.9)';
      context.font = 'bold 40px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(codeSymbols[Math.floor(Math.random() * codeSymbols.length)], 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);

      sprite.position.x = (Math.random() - 0.5) * 30;
      sprite.position.y = (Math.random() - 0.5) * 30;
      sprite.position.z = (Math.random() - 0.5) * 30;
      sprite.scale.set(1, 1, 1);

      this.scene.add(sprite);
      this.codes.push({
        mesh: sprite,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        )
      });
    }
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    this.phones.forEach(phone => {
      phone.mesh.rotateOnAxis(phone.axis, phone.speed);
      phone.mesh.position.y += Math.sin(Date.now() * phone.speed) * 0.01;
    });

    this.particles.forEach(particle => {
      particle.mesh.position.add(particle.velocity);

      if (Math.abs(particle.mesh.position.x) > 20) particle.velocity.x *= -1;
      if (Math.abs(particle.mesh.position.y) > 20) particle.velocity.y *= -1;
      if (Math.abs(particle.mesh.position.z) > 20) particle.velocity.z *= -1;
    });

    this.codes.forEach(code => {
      code.mesh.position.add(code.velocity);

      if (Math.abs(code.mesh.position.x) > 15) code.velocity.x *= -1;
      if (Math.abs(code.mesh.position.y) > 15) code.velocity.y *= -1;
      if (Math.abs(code.mesh.position.z) > 15) code.velocity.z *= -1;

      code.mesh.material.rotation += 0.01;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0002) * 2;
    this.camera.position.y = Math.cos(Date.now() * 0.0003) * 2;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}