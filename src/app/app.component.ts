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
  private cameras: any[] = [];
  private lenses: any[] = [];
  private photos: any[] = [];
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
    this.scene.background = new THREE.Color(0x0a0a0a);
    this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 50);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(10, 20, 10);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    const pointLight1 = new THREE.PointLight(0xff6b35, 2, 20);
    pointLight1.position.set(-10, 5, -5);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4ecdc4, 2, 20);
    pointLight2.position.set(10, -5, 5);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 5; i++) {
      const cameraBody = new THREE.Group();

      const bodyGeometry = new THREE.BoxGeometry(1.5, 1, 1);
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.8,
        roughness: 0.2
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      cameraBody.add(body);

      const lensGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.8, 32);
      const lensMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.1
      });
      const lens = new THREE.Mesh(lensGeometry, lensMaterial);
      lens.rotation.z = Math.PI / 2;
      lens.position.x = 1.15;
      cameraBody.add(lens);

      const glassGeometry = new THREE.CircleGeometry(0.35, 32);
      const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x4ecdc4,
        metalness: 1,
        roughness: 0,
        emissive: 0x4ecdc4,
        emissiveIntensity: 0.3
      });
      const glass = new THREE.Mesh(glassGeometry, glassMaterial);
      glass.position.x = 1.56;
      cameraBody.add(glass);

      const viewfinderGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.2);
      const viewfinder = new THREE.Mesh(viewfinderGeometry, bodyMaterial);
      viewfinder.position.set(-0.5, 0.65, 0);
      cameraBody.add(viewfinder);

      cameraBody.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      );
      cameraBody.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      this.cameras.push({
        mesh: cameraBody,
        speed: 0.002 + Math.random() * 0.003,
        rotationSpeed: 0.005 + Math.random() * 0.01
      });

      this.scene.add(cameraBody);
    }

    for (let i = 0; i < 8; i++) {
      const lensGeometry = new THREE.CylinderGeometry(0.6, 0.7, 2, 32);
      const lensMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.1
      });
      const lens = new THREE.Mesh(lensGeometry, lensMaterial);

      lens.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 25
      );
      lens.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      this.lenses.push({
        mesh: lens,
        speed: 0.001 + Math.random() * 0.002,
        rotationSpeed: 0.003 + Math.random() * 0.007
      });

      this.scene.add(lens);
    }

    for (let i = 0; i < 12; i++) {
      const photoGeometry = new THREE.PlaneGeometry(2, 1.5);
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 384;
      const ctx = canvas.getContext('2d')!;

      const gradient = ctx.createLinearGradient(0, 0, 512, 384);
      gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 60%)`);
      gradient.addColorStop(1, `hsl(${Math.random() * 360}, 70%, 40%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 384);

      const texture = new THREE.CanvasTexture(canvas);
      const photoMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      const photo = new THREE.Mesh(photoGeometry, photoMaterial);

      photo.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 30
      );
      photo.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      this.photos.push({
        mesh: photo,
        speed: 0.0015 + Math.random() * 0.0025,
        rotationSpeed: 0.002 + Math.random() * 0.005
      });

      this.scene.add(photo);
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particleSystem);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.cameras.forEach(cam => {
      cam.mesh.rotation.x += cam.rotationSpeed;
      cam.mesh.rotation.y += cam.rotationSpeed * 0.7;
      cam.mesh.position.y += Math.sin(Date.now() * cam.speed) * 0.01;
    });

    this.lenses.forEach(lens => {
      lens.mesh.rotation.x += lens.rotationSpeed;
      lens.mesh.rotation.z += lens.rotationSpeed * 0.5;
      lens.mesh.position.x += Math.cos(Date.now() * lens.speed) * 0.01;
    });

    this.photos.forEach(photo => {
      photo.mesh.rotation.y += photo.rotationSpeed;
      photo.mesh.rotation.z += photo.rotationSpeed * 0.3;
      photo.mesh.position.z += Math.sin(Date.now() * photo.speed) * 0.008;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 3;
    this.camera.position.y = 2 + Math.cos(Date.now() * 0.00015) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}