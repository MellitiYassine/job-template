import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private THREE: any;
  private scene: any;
  private camera: any;
  private renderer: any;
  private newspapers: any[] = [];
  private typewriters: any[] = [];
  private microphones: any[] = [];
  private cameras: any[] = [];

  ngAfterViewInit(): void {
    this.THREE = (window as any).THREE;
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new this.THREE.Scene();
    this.scene.background = new this.THREE.Color(0x1a1a2e);
    this.scene.fog = new this.THREE.Fog(0x1a1a2e, 10, 50);

    this.camera = new this.THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;
    this.camera.position.y = 2;

    this.renderer = new this.THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const spotLight = new this.THREE.SpotLight(0xffd700, 1.5);
    spotLight.position.set(10, 20, 10);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    const pointLight1 = new this.THREE.PointLight(0x4169e1, 1);
    pointLight1.position.set(-10, 5, -10);
    this.scene.add(pointLight1);

    const pointLight2 = new this.THREE.PointLight(0xff4500, 0.8);
    pointLight2.position.set(10, -5, 5);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    this.createNewspapers();
    this.createTypewriters();
    this.createMicrophones();
    this.createCameras();
    this.createFloatingText();
  }

  private createNewspapers(): void {
    for (let i = 0; i < 20; i++) {
      const geometry = new this.THREE.PlaneGeometry(2, 2.8);
      const material = new this.THREE.MeshStandardMaterial({
        color: 0xf5f5dc,
        side: this.THREE.DoubleSide,
        roughness: 0.8
      });
      const newspaper = new this.THREE.Mesh(geometry, material);

      const linesGeometry = new this.THREE.BufferGeometry();
      const linesPoints = [];
      for (let j = 0; j < 10; j++) {
        linesPoints.push(-0.8, 1 - j * 0.2, 0.01);
        linesPoints.push(0.8, 1 - j * 0.2, 0.01);
      }
      linesGeometry.setAttribute('position', new this.THREE.Float32BufferAttribute(linesPoints, 3));
      const linesMaterial = new this.THREE.LineBasicMaterial({ color: 0x333333 });
      const lines = new this.THREE.LineSegments(linesGeometry, linesMaterial);
      newspaper.add(lines);

      newspaper.position.x = Math.random() * 40 - 20;
      newspaper.position.y = Math.random() * 40 - 20;
      newspaper.position.z = Math.random() * 40 - 20;
      newspaper.rotation.x = Math.random() * Math.PI;
      newspaper.rotation.y = Math.random() * Math.PI;

      this.newspapers.push({
        mesh: newspaper,
        velocity: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        rotation: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01
        }
      });
      this.scene.add(newspaper);
    }
  }

  private createTypewriters(): void {
    for (let i = 0; i < 8; i++) {
      const group = new this.THREE.Group();

      const baseGeometry = new this.THREE.BoxGeometry(1.5, 0.3, 1);
      const baseMaterial = new this.THREE.MeshStandardMaterial({ color: 0x2c3e50 });
      const base = new this.THREE.Mesh(baseGeometry, baseMaterial);
      group.add(base);

      const keysGeometry = new this.THREE.BoxGeometry(1.2, 0.1, 0.8);
      const keysMaterial = new this.THREE.MeshStandardMaterial({ color: 0x34495e });
      const keys = new this.THREE.Mesh(keysGeometry, keysMaterial);
      keys.position.y = 0.2;
      group.add(keys);

      const paperGeometry = new this.THREE.PlaneGeometry(0.8, 1);
      const paperMaterial = new this.THREE.MeshStandardMaterial({ color: 0xffffff });
      const paper = new this.THREE.Mesh(paperGeometry, paperMaterial);
      paper.position.set(0, 0.6, -0.3);
      paper.rotation.x = -0.3;
      group.add(paper);

      group.position.x = Math.random() * 30 - 15;
      group.position.y = Math.random() * 30 - 15;
      group.position.z = Math.random() * 30 - 15;

      this.typewriters.push({
        mesh: group,
        velocity: {
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.015
        },
        rotation: (Math.random() - 0.5) * 0.008
      });
      this.scene.add(group);
    }
  }

  private createMicrophones(): void {
    for (let i = 0; i < 6; i++) {
      const group = new this.THREE.Group();

      const headGeometry = new this.THREE.SphereGeometry(0.3, 16, 16);
      const headMaterial = new this.THREE.MeshStandardMaterial({
        color: 0x708090,
        metalness: 0.8,
        roughness: 0.2
      });
      const head = new this.THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 1;
      group.add(head);

      const handleGeometry = new this.THREE.CylinderGeometry(0.1, 0.1, 1, 16);
      const handleMaterial = new this.THREE.MeshStandardMaterial({ color: 0x2c3e50 });
      const handle = new this.THREE.Mesh(handleGeometry, handleMaterial);
      handle.position.y = 0.5;
      group.add(handle);

      group.position.x = Math.random() * 25 - 12.5;
      group.position.y = Math.random() * 25 - 12.5;
      group.position.z = Math.random() * 25 - 12.5;

      this.microphones.push({
        mesh: group,
        velocity: {
          x: (Math.random() - 0.5) * 0.012,
          y: (Math.random() - 0.5) * 0.012,
          z: (Math.random() - 0.5) * 0.012
        },
        rotation: (Math.random() - 0.5) * 0.01
      });
      this.scene.add(group);
    }
  }

  private createCameras(): void {
    for (let i = 0; i < 5; i++) {
      const group = new this.THREE.Group();

      const bodyGeometry = new this.THREE.BoxGeometry(0.8, 0.6, 0.5);
      const bodyMaterial = new this.THREE.MeshStandardMaterial({ color: 0x1c1c1c });
      const body = new this.THREE.Mesh(bodyGeometry, bodyMaterial);
      group.add(body);

      const lensGeometry = new this.THREE.CylinderGeometry(0.25, 0.25, 0.4, 16);
      const lensMaterial = new this.THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.1
      });
      const lens = new this.THREE.Mesh(lensGeometry, lensMaterial);
      lens.rotation.z = Math.PI / 2;
      lens.position.z = 0.45;
      group.add(lens);

      const flashGeometry = new this.THREE.BoxGeometry(0.3, 0.2, 0.2);
      const flashMaterial = new this.THREE.MeshStandardMaterial({ color: 0x444444 });
      const flash = new this.THREE.Mesh(flashGeometry, flashMaterial);
      flash.position.set(0, 0.4, 0);
      group.add(flash);

      group.position.x = Math.random() * 28 - 14;
      group.position.y = Math.random() * 28 - 14;
      group.position.z = Math.random() * 28 - 14;

      this.cameras.push({
        mesh: group,
        velocity: {
          x: (Math.random() - 0.5) * 0.018,
          y: (Math.random() - 0.5) * 0.018,
          z: (Math.random() - 0.5) * 0.018
        },
        rotation: (Math.random() - 0.5) * 0.012
      });
      this.scene.add(group);
    }
  }

  private createFloatingText(): void {
    const words = ['TRUTH', 'NEWS', 'STORY', 'PRESS', 'REPORT'];
    words.forEach((word, index) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 512;
      canvas.height = 128;
      context.fillStyle = 'rgba(255, 255, 255, 0.9)';
      context.font = 'bold 80px Arial';
      context.textAlign = 'center';
      context.fillText(word, 256, 90);

      const texture = new this.THREE.CanvasTexture(canvas);
      const material = new this.THREE.SpriteMaterial({ map: texture });
      const sprite = new this.THREE.Sprite(material);
      sprite.scale.set(4, 1, 1);
      sprite.position.set(
        (index - 2) * 8,
        Math.sin(index) * 5,
        -10 - index * 3
      );
      this.scene.add(sprite);
    });
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.newspapers.forEach(item => {
      item.mesh.position.x += item.velocity.x;
      item.mesh.position.y += item.velocity.y;
      item.mesh.position.z += item.velocity.z;

      item.mesh.rotation.x += item.rotation.x;
      item.mesh.rotation.y += item.rotation.y;
      item.mesh.rotation.z += item.rotation.z;

      if (Math.abs(item.mesh.position.x) > 25) item.velocity.x *= -1;
      if (Math.abs(item.mesh.position.y) > 25) item.velocity.y *= -1;
      if (Math.abs(item.mesh.position.z) > 25) item.velocity.z *= -1;
    });

    this.typewriters.forEach(item => {
      item.mesh.position.x += item.velocity.x;
      item.mesh.position.y += item.velocity.y;
      item.mesh.position.z += item.velocity.z;
      item.mesh.rotation.y += item.rotation;

      if (Math.abs(item.mesh.position.x) > 20) item.velocity.x *= -1;
      if (Math.abs(item.mesh.position.y) > 20) item.velocity.y *= -1;
      if (Math.abs(item.mesh.position.z) > 20) item.velocity.z *= -1;
    });

    this.microphones.forEach(item => {
      item.mesh.position.x += item.velocity.x;
      item.mesh.position.y += item.velocity.y;
      item.mesh.position.z += item.velocity.z;
      item.mesh.rotation.z += item.rotation;

      if (Math.abs(item.mesh.position.x) > 18) item.velocity.x *= -1;
      if (Math.abs(item.mesh.position.y) > 18) item.velocity.y *= -1;
      if (Math.abs(item.mesh.position.z) > 18) item.velocity.z *= -1;
    });

    this.cameras.forEach(item => {
      item.mesh.position.x += item.velocity.x;
      item.mesh.position.y += item.velocity.y;
      item.mesh.position.z += item.velocity.z;
      item.mesh.rotation.x += item.rotation;

      if (Math.abs(item.mesh.position.x) > 19) item.velocity.x *= -1;
      if (Math.abs(item.mesh.position.y) > 19) item.velocity.y *= -1;
      if (Math.abs(item.mesh.position.z) > 19) item.velocity.z *= -1;
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 2;
    this.camera.position.y = 2 + Math.cos(Date.now() * 0.00015) * 1.5;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}