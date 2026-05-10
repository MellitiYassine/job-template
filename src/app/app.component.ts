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
  private molecules: any[] = [];
  private atoms: any[] = [];
  private books: any[] = [];
  private dnaHelixes: any[] = [];
  private mouse = { x: 0, y: 0 };

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0e27, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 1.5);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1.5);
    pointLight2.position.set(-10, -10, 5);
    this.scene.add(pointLight2);

    for (let i = 0; i < 100; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
        emissive: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
        emissiveIntensity: 0.3
      });
      const atom = new THREE.Mesh(geometry, material);
      atom.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );
      this.atoms.push({
        mesh: atom,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      });
      this.scene.add(atom);
    }

    for (let i = 0; i < 15; i++) {
      const group = new THREE.Group();
      const sphereGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const colors = [0x00ff88, 0xff0088, 0x0088ff, 0xffff00];
      const centerMat = new THREE.MeshPhongMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        shininess: 100
      });
      const center = new THREE.Mesh(sphereGeo, centerMat);
      group.add(center);

      const numOrbits = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < numOrbits; j++) {
        const orbitRadius = 0.4 + j * 0.3;
        const orbitGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const orbitMat = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          emissive: 0x4444ff,
          emissiveIntensity: 0.5
        });
        const orbitSphere = new THREE.Mesh(orbitGeo, orbitMat);
        orbitSphere.position.x = orbitRadius;
        group.add(orbitSphere);
      }

      group.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
      );
      this.molecules.push({
        group,
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      });
      this.scene.add(group);
    }

    for (let i = 0; i < 5; i++) {
      const helixGroup = new THREE.Group();
      const points1 = [];
      const points2 = [];
      const segments = 50;
      const height = 5;
      const radius = 0.5;

      for (let j = 0; j <= segments; j++) {
        const t = (j / segments) * Math.PI * 4;
        const y = (j / segments) * height - height / 2;
        points1.push(new THREE.Vector3(
          Math.cos(t) * radius,
          y,
          Math.sin(t) * radius
        ));
        points2.push(new THREE.Vector3(
          Math.cos(t + Math.PI) * radius,
          y,
          Math.sin(t + Math.PI) * radius
        ));
      }

      const curve1 = new THREE.CatmullRomCurve3(points1);
      const curve2 = new THREE.CatmullRomCurve3(points2);
      const tubeGeo1 = new THREE.TubeGeometry(curve1, segments, 0.05, 8, false);
      const tubeGeo2 = new THREE.TubeGeometry(curve2, segments, 0.05, 8, false);
      const helixMat1 = new THREE.MeshPhongMaterial({ color: 0x00ffaa, shininess: 80 });
      const helixMat2 = new THREE.MeshPhongMaterial({ color: 0xff00aa, shininess: 80 });
      const tube1 = new THREE.Mesh(tubeGeo1, helixMat1);
      const tube2 = new THREE.Mesh(tubeGeo2, helixMat2);
      helixGroup.add(tube1);
      helixGroup.add(tube2);

      for (let j = 0; j < segments; j += 3) {
        const t = (j / segments) * Math.PI * 4;
        const y = (j / segments) * height - height / 2;
        const p1 = new THREE.Vector3(Math.cos(t) * radius, y, Math.sin(t) * radius);
        const p2 = new THREE.Vector3(Math.cos(t + Math.PI) * radius, y, Math.sin(t + Math.PI) * radius);
        const linkGeo = new THREE.CylinderGeometry(0.03, 0.03, p1.distanceTo(p2), 4);
        const linkMat = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        const link = new THREE.Mesh(linkGeo, linkMat);
        link.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
        link.lookAt(p2);
        link.rotateX(Math.PI / 2);
        helixGroup.add(link);
      }

      helixGroup.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      helixGroup.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.dnaHelixes.push({
        group: helixGroup,
        rotationSpeed: (Math.random() - 0.5) * 0.01
      });
      this.scene.add(helixGroup);
    }

    for (let i = 0; i < 20; i++) {
      const bookGroup = new THREE.Group();
      const bookGeo = new THREE.BoxGeometry(0.3, 0.5, 0.05);
      const bookMat = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5)
      });
      const book = new THREE.Mesh(bookGeo, bookMat);
      bookGroup.add(book);

      const edgeGeo = new THREE.EdgesGeometry(bookGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      bookGroup.add(edges);

      bookGroup.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
      );
      bookGroup.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.books.push({
        group: bookGroup,
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        ),
        floatOffset: Math.random() * Math.PI * 2
      });
      this.scene.add(bookGroup);
    }

    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(particles);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.atoms.forEach(atom => {
      atom.mesh.position.add(atom.velocity);
      if (Math.abs(atom.mesh.position.x) > 15) atom.velocity.x *= -1;
      if (Math.abs(atom.mesh.position.y) > 15) atom.velocity.y *= -1;
      if (Math.abs(atom.mesh.position.z) > 15) atom.velocity.z *= -1;
    });

    this.molecules.forEach(mol => {
      mol.group.rotation.x += mol.rotationSpeed.x;
      mol.group.rotation.y += mol.rotationSpeed.y;
      mol.group.rotation.z += mol.rotationSpeed.z;
    });

    this.dnaHelixes.forEach(dna => {
      dna.group.rotation.y += dna.rotationSpeed;
    });

    this.books.forEach(book => {
      book.group.rotation.x += book.rotationSpeed.x;
      book.group.rotation.y += book.rotationSpeed.y;
      book.group.rotation.z += book.rotationSpeed.z;
      book.group.position.y += Math.sin(time + book.floatOffset) * 0.002;
    });

    this.camera.position.x += (this.mouse.x * 5 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.mouse.y * 5 - this.camera.position.y) * 0.05;
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