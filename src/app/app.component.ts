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
  private socialIcons: any[] = [];
  private particles: any[] = [];
  private connectionLines: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

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

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4a90e2, 2, 30);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe24a90, 2, 30);
    pointLight2.position.set(-10, -10, 5);
    this.scene.add(pointLight2);

    const iconShapes = [
      { type: 'heart', color: 0xff1744, icon: '❤' },
      { type: 'thumbsUp', color: 0x4a90e2, icon: '👍' },
      { type: 'share', color: 0x00e676, icon: '↗' },
      { type: 'comment', color: 0xffd700, icon: '💬' },
      { type: 'star', color: 0xff9100, icon: '⭐' },
      { type: 'camera', color: 0xe91e63, icon: '📷' }
    ];

    for (let i = 0; i < 20; i++) {
      const iconData = iconShapes[Math.floor(Math.random() * iconShapes.length)];
      const geometry = this.createIconGeometry(iconData.type);
      const material = new THREE.MeshPhongMaterial({
        color: iconData.color,
        emissive: iconData.color,
        emissiveIntensity: 0.3,
        shininess: 100
      });

      const icon = new THREE.Mesh(geometry, material);
      icon.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20
      );
      icon.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      icon.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      };
      this.scene.add(icon);
      this.socialIcons.push(icon);
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.8, 0.6);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particleSystem);
    this.particles.push(particleSystem);
  }

  private createIconGeometry(type: string): any {
    const THREE = (window as any).THREE;

    switch (type) {
      case 'heart':
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0);
        heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
        heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1);
        heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
        heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);
        return new THREE.ExtrudeGeometry(heartShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1 });
      case 'thumbsUp':
        return new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
      case 'share':
        return new THREE.ConeGeometry(0.4, 1, 3);
      case 'comment':
        return new THREE.BoxGeometry(1, 0.7, 0.3);
      case 'star':
        return new THREE.OctahedronGeometry(0.5);
      case 'camera':
        return new THREE.BoxGeometry(0.8, 0.6, 0.4);
      default:
        return new THREE.SphereGeometry(0.5, 16, 16);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.socialIcons.forEach((icon, index) => {
      icon.position.add(icon.userData.velocity);
      icon.rotation.x += icon.userData.rotationSpeed.x;
      icon.rotation.y += icon.userData.rotationSpeed.y;
      icon.rotation.z += icon.userData.rotationSpeed.z;

      if (Math.abs(icon.position.x) > 15) icon.userData.velocity.x *= -1;
      if (Math.abs(icon.position.y) > 15) icon.userData.velocity.y *= -1;
      if (Math.abs(icon.position.z) > 10) icon.userData.velocity.z *= -1;

      icon.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
    });

    this.particles.forEach(particle => {
      particle.rotation.y += 0.0005;
      particle.rotation.x += 0.0003;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0003) * 2;
    this.camera.position.y = Math.cos(Date.now() * 0.0002) * 2;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}