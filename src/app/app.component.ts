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
  private books: any[] = [];
  private pencils: any[] = [];
  private apples: any[] = [];
  private particles: any[] = [];
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
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

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
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4ecdc4, 1, 50);
    pointLight1.position.set(-10, 5, -10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b6b, 1, 50);
    pointLight2.position.set(10, 5, -10);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 15; i++) {
      const bookGroup = new THREE.Group();
      
      const bookGeometry = new THREE.BoxGeometry(1.5, 2, 0.3);
      const bookMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        shininess: 30
      });
      const book = new THREE.Mesh(bookGeometry, bookMaterial);
      book.castShadow = true;
      book.receiveShadow = true;
      bookGroup.add(book);

      const spineGeometry = new THREE.BoxGeometry(1.5, 2, 0.35);
      const spineMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.3),
        shininess: 50
      });
      const spine = new THREE.Mesh(spineGeometry, spineMaterial);
      spine.position.z = -0.025;
      bookGroup.add(spine);

      const angle = (i / 15) * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      bookGroup.position.x = Math.cos(angle) * radius;
      bookGroup.position.y = -2 + Math.random() * 8;
      bookGroup.position.z = Math.sin(angle) * radius;
      
      bookGroup.rotation.x = Math.random() * 0.5;
      bookGroup.rotation.y = Math.random() * Math.PI * 2;
      bookGroup.rotation.z = Math.random() * 0.5;
      
      bookGroup.userData = {
        rotationSpeed: 0.002 + Math.random() * 0.003,
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatOffset: Math.random() * Math.PI * 2,
        orbitSpeed: 0.1 + Math.random() * 0.2
      };
      
      this.books.push(bookGroup);
      this.scene.add(bookGroup);
    }

    for (let i = 0; i < 12; i++) {
      const pencilGroup = new THREE.Group();
      
      const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0xffeb3b : 0x00bcd4,
        shininess: 60
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.castShadow = true;
      pencilGroup.add(body);

      const tipGeometry = new THREE.ConeGeometry(0.08, 0.4, 8);
      const tipMaterial = new THREE.MeshPhongMaterial({
        color: 0x3e2723,
        shininess: 80
      });
      const tip = new THREE.Mesh(tipGeometry, tipMaterial);
      tip.position.y = -1.7;
      pencilGroup.add(tip);

      const eraserGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
      const eraserMaterial = new THREE.MeshPhongMaterial({
        color: 0xff1744,
        shininess: 40
      });
      const eraser = new THREE.Mesh(eraserGeometry, eraserMaterial);
      eraser.position.y = 1.65;
      pencilGroup.add(eraser);

      const angle = (i / 12) * Math.PI * 2;
      const radius = 6 + Math.random() * 3;
      pencilGroup.position.x = Math.cos(angle) * radius;
      pencilGroup.position.y = -3 + Math.random() * 10;
      pencilGroup.position.z = Math.sin(angle) * radius;
      
      pencilGroup.rotation.x = Math.random() * Math.PI;
      pencilGroup.rotation.z = Math.random() * Math.PI;
      
      pencilGroup.userData = {
        rotationSpeed: 0.01 + Math.random() * 0.02,
        floatSpeed: 0.8 + Math.random() * 0.7,
        floatOffset: Math.random() * Math.PI * 2,
        orbitSpeed: 0.15 + Math.random() * 0.25
      };
      
      this.pencils.push(pencilGroup);
      this.scene.add(pencilGroup);
    }

    for (let i = 0; i < 8; i++) {
      const appleGroup = new THREE.Group();
      
      const appleGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      appleGeometry.scale(1, 0.9, 1);
      const appleMaterial = new THREE.MeshPhongMaterial({
        color: 0xe53935,
        shininess: 100
      });
      const apple = new THREE.Mesh(appleGeometry, appleMaterial);
      apple.castShadow = true;
      appleGroup.add(apple);

      const stemGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.3, 8);
      const stemMaterial = new THREE.MeshPhongMaterial({
        color: 0x5d4037
      });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.position.y = 0.6;
      appleGroup.add(stem);

      const leafGeometry = new THREE.CircleGeometry(0.2, 8);
      const leafMaterial = new THREE.MeshPhongMaterial({
        color: 0x43a047,
        side: THREE.DoubleSide
      });
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.set(0.15, 0.7, 0);
      leaf.rotation.y = Math.PI / 4;
      appleGroup.add(leaf);

      const angle = (i / 8) * Math.PI * 2;
      const radius = 10 + Math.random() * 2;
      appleGroup.position.x = Math.cos(angle) * radius;
      appleGroup.position.y = -1 + Math.random() * 6;
      appleGroup.position.z = Math.sin(angle) * radius;
      
      appleGroup.userData = {
        rotationSpeed: 0.005 + Math.random() * 0.01,
        floatSpeed: 0.6 + Math.random() * 0.6,
        floatOffset: Math.random() * Math.PI * 2,
        orbitSpeed: 0.12 + Math.random() * 0.18
      };
      
      this.apples.push(appleGroup);
      this.scene.add(appleGroup);
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
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
    
    const elapsedTime = this.clock.getElapsedTime();

    this.books.forEach((book, index) => {
      book.rotation.y += book.userData.rotationSpeed;
      book.rotation.x += book.userData.rotationSpeed * 0.5;
      
      const originalY = book.position.y;
      book.position.y += Math.sin(elapsedTime * book.userData.floatSpeed + book.userData.floatOffset) * 0.02;
      
      const angle = elapsedTime * book.userData.orbitSpeed + (index / this.books.length) * Math.PI * 2;
      const radius = 8 + Math.sin(elapsedTime * 0.3 + index) * 2;
      book.position.x = Math.cos(angle) * radius;
      book.position.z = Math.sin(angle) * radius;
    });

    this.pencils.forEach((pencil, index) => {
      pencil.rotation.z += pencil.userData.rotationSpeed;
      pencil.rotation.x += pencil.userData.rotationSpeed * 0.3;
      
      pencil.position.y += Math.sin(elapsedTime * pencil.userData.floatSpeed + pencil.userData.floatOffset) * 0.03;
      
      const angle = elapsedTime * pencil.userData.orbitSpeed + (index / this.pencils.length) * Math.PI * 2;
      const radius = 6 + Math.cos(elapsedTime * 0.4 + index) * 1.5;
      pencil.position.x = Math.cos(angle) * radius;
      pencil.position.z = Math.sin(angle) * radius;
    });

    this.apples.forEach((apple, index) => {
      apple.rotation.y += apple.userData.rotationSpeed;
      
      apple.position.y += Math.sin(elapsedTime * apple.userData.floatSpeed + apple.userData.floatOffset) * 0.025;
      
      const angle = elapsedTime * apple.userData.orbitSpeed + (index / this.apples.length) * Math.PI * 2;
      const radius = 10 + Math.sin(elapsedTime * 0.5 + index) * 1;
      apple.position.x = Math.cos(angle) * radius;
      apple.position.z = Math.sin(angle) * radius;
    });

    this.particles.forEach(particleSystem => {
      particleSystem.rotation.y += 0.0005;
      particleSystem.rotation.x += 0.0003;
    });

    this.camera.position.x = Math.sin(elapsedTime * 0.1) * 15;
    this.camera.position.z = Math.cos(elapsedTime * 0.1) * 15;
    this.camera.position.y = 5 + Math.sin(elapsedTime * 0.15) * 3;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}