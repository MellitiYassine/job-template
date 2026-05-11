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
  private dnaHelixes: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a2e);
    this.scene.fog = new THREE.Fog(0x0a0a2e, 10, 50);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 100);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 100);
    pointLight2.position.set(-10, -10, 5);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 100; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        emissive: Math.random() * 0x444444,
        metalness: 0.8,
        roughness: 0.2
      });
      const atom = new THREE.Mesh(geometry, material);
      
      atom.position.x = (Math.random() - 0.5) * 40;
      atom.position.y = (Math.random() - 0.5) * 40;
      atom.position.z = (Math.random() - 0.5) * 40;
      
      atom.userData = {
        velocityX: (Math.random() - 0.5) * 0.02,
        velocityY: (Math.random() - 0.5) * 0.02,
        velocityZ: (Math.random() - 0.5) * 0.02
      };
      
      this.atoms.push(atom);
      this.scene.add(atom);
    }

    for (let i = 0; i < 15; i++) {
      const moleculeGroup = new THREE.Group();
      const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00];
      
      for (let j = 0; j < 6; j++) {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshStandardMaterial({
          color: colors[Math.floor(Math.random() * colors.length)],
          emissive: 0x222222,
          metalness: 0.5,
          roughness: 0.3
        });
        const sphere = new THREE.Mesh(geometry, material);
        
        const angle = (j / 6) * Math.PI * 2;
        sphere.position.x = Math.cos(angle) * 1.5;
        sphere.position.y = Math.sin(angle) * 1.5;
        
        moleculeGroup.add(sphere);
      }
      
      moleculeGroup.position.x = (Math.random() - 0.5) * 30;
      moleculeGroup.position.y = (Math.random() - 0.5) * 30;
      moleculeGroup.position.z = (Math.random() - 0.5) * 30;
      
      moleculeGroup.userData = {
        rotationSpeed: Math.random() * 0.02
      };
      
      this.molecules.push(moleculeGroup);
      this.scene.add(moleculeGroup);
    }

    for (let i = 0; i < 3; i++) {
      const dnaGroup = new THREE.Group();
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -5, 0),
        new THREE.Vector3(1, -2.5, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(1, 2.5, 0),
        new THREE.Vector3(0, 5, 0)
      ]);

      for (let j = 0; j < 30; j++) {
        const t = j / 29;
        const point = curve.getPoint(t);
        const angle = t * Math.PI * 6;
        
        const geometry1 = new THREE.SphereGeometry(0.15, 16, 16);
        const material1 = new THREE.MeshStandardMaterial({
          color: 0x00ffaa,
          emissive: 0x003322,
          metalness: 0.6,
          roughness: 0.4
        });
        const sphere1 = new THREE.Mesh(geometry1, material1);
        sphere1.position.set(
          point.x + Math.cos(angle) * 0.8,
          point.y,
          point.z + Math.sin(angle) * 0.8
        );
        dnaGroup.add(sphere1);

        const geometry2 = new THREE.SphereGeometry(0.15, 16, 16);
        const material2 = new THREE.MeshStandardMaterial({
          color: 0xff00aa,
          emissive: 0x330022,
          metalness: 0.6,
          roughness: 0.4
        });
        const sphere2 = new THREE.Mesh(geometry2, material2);
        sphere2.position.set(
          point.x - Math.cos(angle) * 0.8,
          point.y,
          point.z - Math.sin(angle) * 0.8
        );
        dnaGroup.add(sphere2);

        if (j % 3 === 0) {
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            sphere1.position,
            sphere2.position
          ]);
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x666666 });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          dnaGroup.add(line);
        }
      }

      dnaGroup.position.x = (Math.random() - 0.5) * 20;
      dnaGroup.position.y = (Math.random() - 0.5) * 20;
      dnaGroup.position.z = -10 + i * 5;
      
      dnaGroup.userData = {
        rotationSpeed: 0.005
      };
      
      this.dnaHelixes.push(dnaGroup);
      this.scene.add(dnaGroup);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particles);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.atoms.forEach(atom => {
      atom.position.x += atom.userData.velocityX;
      atom.position.y += atom.userData.velocityY;
      atom.position.z += atom.userData.velocityZ;

      if (Math.abs(atom.position.x) > 20) atom.userData.velocityX *= -1;
      if (Math.abs(atom.position.y) > 20) atom.userData.velocityY *= -1;
      if (Math.abs(atom.position.z) > 20) atom.userData.velocityZ *= -1;

      atom.rotation.x += 0.01;
      atom.rotation.y += 0.01;
    });

    this.molecules.forEach(molecule => {
      molecule.rotation.x += molecule.userData.rotationSpeed;
      molecule.rotation.y += molecule.userData.rotationSpeed * 1.5;
      molecule.rotation.z += molecule.userData.rotationSpeed * 0.5;
    });

    this.dnaHelixes.forEach(helix => {
      helix.rotation.y += helix.userData.rotationSpeed;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 3;
    this.camera.position.y = Math.cos(Date.now() * 0.00015) * 2;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}