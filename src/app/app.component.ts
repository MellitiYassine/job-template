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
  private ganttBars: any[] = [];
  private documents: any[] = [];
  private connections: any[] = [];
  private mouseX = 0;
  private mouseY = 0;

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
    this.animate();
    window.addEventListener('mousemove', (e) => {
      this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    window.addEventListener('resize', () => this.onResize());
  }

  private initThree(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e27);
    this.scene.fog = new THREE.Fog(0x0a0e27, 10, 50);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 15;
    this.camera.position.y = 2;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4fc3f7, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff6b9d, 1.5, 50);
    pointLight2.position.set(-10, -5, 5);
    this.scene.add(pointLight2);

    for (let i = 0; i < 8; i++) {
      const width = Math.random() * 3 + 2;
      const height = 0.3;
      const depth = 0.8;
      
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const hue = (i * 45) % 360;
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(`hsl(${hue}, 70%, 60%)`),
        emissive: new THREE.Color(`hsl(${hue}, 70%, 30%)`),
        shininess: 100
      });
      
      const bar = new THREE.Mesh(geometry, material);
      bar.position.y = i * 1.5 - 5;
      bar.position.x = -5;
      bar.position.z = Math.random() * 2 - 1;
      
      const originalX = bar.position.x;
      (bar as any).userData = { originalX, speed: Math.random() * 0.01 + 0.005 };
      
      this.ganttBars.push(bar);
      this.scene.add(bar);

      const progressGeometry = new THREE.BoxGeometry(width * (Math.random() * 0.5 + 0.3), height + 0.1, depth + 0.1);
      const progressMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        emissive: 0x00aa44,
        transparent: true,
        opacity: 0.8
      });
      const progress = new THREE.Mesh(progressGeometry, progressMaterial);
      progress.position.copy(bar.position);
      progress.position.x = originalX + (progressGeometry.parameters.width - width) / 2;
      this.scene.add(progress);
    }

    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.BoxGeometry(0.6, 0.8, 0.05);
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x3366ff,
        transparent: true,
        opacity: 0.7
      });
      
      const doc = new THREE.Mesh(geometry, material);
      doc.position.set(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      );
      doc.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      (doc as any).userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatOffset: Math.random() * Math.PI * 2
      };
      
      this.documents.push(doc);
      this.scene.add(doc);
    }

    for (let i = 0; i < 30; i++) {
      const points = [];
      const startX = Math.random() * 20 - 10;
      const startY = Math.random() * 20 - 10;
      const startZ = Math.random() * 20 - 10;
      
      points.push(new THREE.Vector3(startX, startY, startZ));
      
      for (let j = 0; j < 5; j++) {
        points.push(new THREE.Vector3(
          startX + (Math.random() - 0.5) * 10,
          startY + (Math.random() - 0.5) * 10,
          startZ + (Math.random() - 0.5) * 10
        ));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 50, 0.03, 8, false);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3
      });
      
      const tube = new THREE.Mesh(tubeGeometry, material);
      (tube as any).userData = { rotationSpeed: (Math.random() - 0.5) * 0.005 };
      this.connections.push(tube);
      this.scene.add(tube);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
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

    const time = Date.now() * 0.001;

    this.ganttBars.forEach((bar, index) => {
      bar.position.x = bar.userData.originalX + Math.sin(time * bar.userData.speed + index) * 2;
      bar.rotation.z = Math.sin(time * 0.5 + index) * 0.1;
    });

    this.documents.forEach((doc) => {
      doc.rotation.x += doc.userData.rotationSpeed.x;
      doc.rotation.y += doc.userData.rotationSpeed.y;
      doc.rotation.z += doc.userData.rotationSpeed.z;
      doc.position.y += Math.sin(time * doc.userData.floatSpeed + doc.userData.floatOffset) * 0.02;
    });

    this.connections.forEach((conn) => {
      conn.rotation.y += conn.userData.rotationSpeed;
    });

    this.camera.position.x += (this.mouseX * 2 - this.camera.position.x) * 0.02;
    this.camera.position.y += (-this.mouseY * 2 - this.camera.position.y) * 0.02;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}