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
  private keywords: any[] = [];
  private links: any[] = [];
  private centerSphere!: any;

  ngAfterViewInit(): void {
    this.initThree();
    this.animate();
  }

  private initThree(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e27);
    this.scene.fog = new THREE.FogExp2(0x0a0e27, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 50;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4a9eff, 2, 100);
    pointLight1.position.set(20, 20, 20);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff4a9e, 2, 100);
    pointLight2.position.set(-20, -20, 20);
    this.scene.add(pointLight2);

    const sphereGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a9eff,
      emissive: 0x2244aa,
      shininess: 100,
      wireframe: false
    });
    this.centerSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.scene.add(this.centerSphere);

    const keywordTexts = ['SEO', 'KEYWORDS', 'BACKLINKS', 'RANKING', 'ANALYTICS', 'CONTENT', 'META', 'SERP', 'TRAFFIC', 'OPTIMIZE', 'GOOGLE', 'SEARCH'];
    
    for (let i = 0; i < keywordTexts.length; i++) {
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({
        color: Math.random() * 0xffffff,
        emissive: 0x111111,
        shininess: 50
      });
      const cube = new THREE.Mesh(geometry, material);
      
      const angle = (i / keywordTexts.length) * Math.PI * 2;
      const radius = 15 + Math.random() * 10;
      cube.position.x = Math.cos(angle) * radius;
      cube.position.y = Math.sin(angle) * radius;
      cube.position.z = (Math.random() - 0.5) * 20;
      
      cube.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        orbitSpeed: 0.001 + Math.random() * 0.002,
        orbitAngle: angle,
        orbitRadius: radius
      };
      
      this.keywords.push(cube);
      this.scene.add(cube);
    }

    for (let i = 0; i < 50; i++) {
      const points = [];
      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      );
      const end = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      );
      points.push(start, end);
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0x4a9eff,
        transparent: true,
        opacity: 0.3
      });
      const line = new THREE.Line(geometry, material);
      
      this.links.push(line);
      this.scene.add(line);
    }

    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(stars);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    this.centerSphere.rotation.x += 0.005;
    this.centerSphere.rotation.y += 0.01;

    this.keywords.forEach((keyword) => {
      keyword.rotation.x += keyword.userData.rotationSpeed.x;
      keyword.rotation.y += keyword.userData.rotationSpeed.y;
      keyword.rotation.z += keyword.userData.rotationSpeed.z;
      
      keyword.userData.orbitAngle += keyword.userData.orbitSpeed;
      keyword.position.x = Math.cos(keyword.userData.orbitAngle) * keyword.userData.orbitRadius;
      keyword.position.y = Math.sin(keyword.userData.orbitAngle) * keyword.userData.orbitRadius;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 50;
    this.camera.position.z = Math.cos(Date.now() * 0.0001) * 50;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}