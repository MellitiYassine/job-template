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
  private resumes: any[] = [];
  private network: any[] = [];
  private targetSphere!: any;

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 20;
    this.camera.position.y = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x0a0a1a, 1);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x6366f1,
      emissive: 0x4338ca,
      shininess: 100,
      transparent: true,
      opacity: 0.8
    });
    this.targetSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.targetSphere.position.set(0, 0, 0);
    this.scene.add(this.targetSphere);

    const ringGeometry = new THREE.TorusGeometry(2.5, 0.1, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    this.targetSphere.add(ring);

    for (let i = 0; i < 50; i++) {
      const resumeGroup = new THREE.Group();
      
      const planeGeometry = new THREE.PlaneGeometry(0.8, 1);
      const planeMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      resumeGroup.add(plane);

      const textGeometry = new THREE.PlaneGeometry(0.6, 0.1);
      const textMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
      for (let j = 0; j < 5; j++) {
        const line = new THREE.Mesh(textGeometry, textMaterial);
        line.position.y = 0.3 - j * 0.15;
        line.position.z = 0.01;
        resumeGroup.add(line);
      }

      const angle = (i / 50) * Math.PI * 2;
      const radius = 8 + Math.random() * 10;
      resumeGroup.position.x = Math.cos(angle) * radius;
      resumeGroup.position.y = (Math.random() - 0.5) * 15;
      resumeGroup.position.z = Math.sin(angle) * radius;

      resumeGroup.userData = {
        targetX: resumeGroup.position.x,
        targetY: resumeGroup.position.y,
        targetZ: resumeGroup.position.z,
        speed: 0.02 + Math.random() * 0.03,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };

      this.scene.add(resumeGroup);
      this.resumes.push(resumeGroup);
    }

    for (let i = 0; i < 30; i++) {
      const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff,
        emissive: Math.random() > 0.5 ? 0x008888 : 0x880088
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);

      const angle = (i / 30) * Math.PI * 2;
      const radius = 5 + Math.random() * 3;
      node.position.x = Math.cos(angle) * radius;
      node.position.y = (Math.random() - 0.5) * 6;
      node.position.z = Math.sin(angle) * radius;

      this.scene.add(node);
      this.network.push(node);

      if (i > 0) {
        const points = [];
        points.push(this.network[i - 1].position);
        points.push(node.position);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.3
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(line);
      }
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particles);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.targetSphere.rotation.y += 0.005;
    this.targetSphere.children[0].rotation.z += 0.01;

    this.resumes.forEach((resume) => {
      const dx = -resume.position.x;
      const dy = -resume.position.y;
      const dz = -resume.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance < 2.5) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 8 + Math.random() * 10;
        resume.userData.targetX = Math.cos(angle) * radius;
        resume.userData.targetY = (Math.random() - 0.5) * 15;
        resume.userData.targetZ = Math.sin(angle) * radius;
      }

      resume.position.x += (resume.userData.targetX - resume.position.x) * resume.userData.speed;
      resume.position.y += (resume.userData.targetY - resume.position.y) * resume.userData.speed;
      resume.position.z += (resume.userData.targetZ - resume.position.z) * resume.userData.speed;

      resume.rotation.y += resume.userData.rotationSpeed;
      resume.lookAt(this.targetSphere.position);
    });

    this.network.forEach((node, index) => {
      node.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0002) * 3;
    this.camera.position.y = 5 + Math.cos(Date.now() * 0.0003) * 2;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}