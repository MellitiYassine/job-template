import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: any;
  private camera!: any;
  private renderer!: any;
  private wireframes: any[] = [];
  private cursors: any[] = [];
  private particles: any[] = [];

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
    this.animate();
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
    this.camera.position.y = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const wireframeGeometries = [
      new THREE.BoxGeometry(3, 3, 3),
      new THREE.SphereGeometry(2, 32, 32),
      new THREE.TorusGeometry(2, 0.5, 16, 100),
      new THREE.OctahedronGeometry(2),
      new THREE.TetrahedronGeometry(2.5)
    ];

    for (let i = 0; i < 8; i++) {
      const geometry = wireframeGeometries[i % wireframeGeometries.length];
      const material = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? 0x00ffff : 0xff00ff,
        wireframe: true,
        transparent: true,
        opacity: 0.6
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      mesh.userData.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
      };
      this.wireframes.push(mesh);
      this.scene.add(mesh);
    }

    for (let i = 0; i < 3; i++) {
      const cursorGroup = new THREE.Group();
      
      const cursorGeometry = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        0, 0, 0,
        0.5, 0.7, 0,
        0.2, 0.5, 0,
        0.4, 0.9, 0
      ]);
      cursorGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      
      const cursorMaterial = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
        linewidth: 2
      });
      const cursor = new THREE.Line(cursorGeometry, cursorMaterial);
      cursorGroup.add(cursor);

      const clickRing = new THREE.Mesh(
        new THREE.RingGeometry(0.3, 0.4, 32),
        new THREE.MeshBasicMaterial({ 
          color: 0x00ffff,
          transparent: true,
          opacity: 0.5
        })
      );
      clickRing.position.set(0.2, 0.3, 0);
      cursorGroup.add(clickRing);

      cursorGroup.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      );
      cursorGroup.scale.set(2, 2, 2);
      cursorGroup.userData.velocity = {
        x: (Math.random() - 0.5) * 0.05,
        y: (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * 0.02
      };
      this.cursors.push(cursorGroup);
      this.scene.add(cursorGroup);
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const color = Math.random() > 0.5 ? new THREE.Color(0x00ffff) : new THREE.Color(0xff00ff);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
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

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.wireframes.forEach(wireframe => {
      wireframe.rotation.x += wireframe.userData.rotationSpeed.x;
      wireframe.rotation.y += wireframe.userData.rotationSpeed.y;
      wireframe.rotation.z += wireframe.userData.rotationSpeed.z;
    });

    this.cursors.forEach(cursor => {
      cursor.position.x += cursor.userData.velocity.x;
      cursor.position.y += cursor.userData.velocity.y;
      cursor.position.z += cursor.userData.velocity.z;

      if (Math.abs(cursor.position.x) > 15) cursor.userData.velocity.x *= -1;
      if (Math.abs(cursor.position.y) > 15) cursor.userData.velocity.y *= -1;
      if (Math.abs(cursor.position.z) > 10) cursor.userData.velocity.z *= -1;
    });

    this.particles.forEach(particleSystem => {
      particleSystem.rotation.y += 0.001;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0002) * 5;
    this.camera.position.y = 5 + Math.cos(Date.now() * 0.0003) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}