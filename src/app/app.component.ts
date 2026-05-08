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
    this.scene.background = new THREE.Color(0x0a0e27);
    this.scene.fog = new THREE.Fog(0x0a0e27, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;
    this.camera.position.y = 2;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x64b5f6, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffd54f, 1.5, 50);
    pointLight2.position.set(-10, 5, -5);
    this.scene.add(pointLight2);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 20, 0);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 15; i++) {
      const bookGeometry = new THREE.BoxGeometry(1.5, 2, 0.3);
      const bookMaterial = new THREE.MeshPhongMaterial({
        color: this.getRandomColor(),
        shininess: 30
      });
      const book = new THREE.Mesh(bookGeometry, bookMaterial);
      
      const angle = (i / 15) * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      book.position.x = Math.cos(angle) * radius;
      book.position.z = Math.sin(angle) * radius;
      book.position.y = Math.sin(i * 0.5) * 3;
      
      book.rotation.x = Math.random() * Math.PI;
      book.rotation.y = Math.random() * Math.PI;
      book.rotation.z = Math.random() * Math.PI;
      
      book.userData = {
        speedX: (Math.random() - 0.5) * 0.01,
        speedY: (Math.random() - 0.5) * 0.01,
        speedZ: (Math.random() - 0.5) * 0.01,
        orbitSpeed: 0.001 + Math.random() * 0.002,
        orbitRadius: radius,
        angle: angle
      };
      
      this.books.push(book);
      this.scene.add(book);
    }

    for (let i = 0; i < 8; i++) {
      const pencilGroup = new THREE.Group();
      
      const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3, 6);
      const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      pencilGroup.add(body);
      
      const tipGeometry = new THREE.ConeGeometry(0.08, 0.4, 6);
      const tipMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
      const tip = new THREE.Mesh(tipGeometry, tipMaterial);
      tip.position.y = -1.7;
      pencilGroup.add(tip);
      
      const leadGeometry = new THREE.ConeGeometry(0.03, 0.2, 6);
      const leadMaterial = new THREE.MeshPhongMaterial({ color: 0x2c2c2c });
      const lead = new THREE.Mesh(leadGeometry, leadMaterial);
      lead.position.y = -1.9;
      pencilGroup.add(lead);
      
      pencilGroup.position.x = (Math.random() - 0.5) * 20;
      pencilGroup.position.y = (Math.random() - 0.5) * 10;
      pencilGroup.position.z = (Math.random() - 0.5) * 20;
      
      pencilGroup.rotation.x = Math.random() * Math.PI * 2;
      pencilGroup.rotation.z = Math.random() * Math.PI * 2;
      
      pencilGroup.userData = {
        velocityY: 0.02 + Math.random() * 0.03,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };
      
      this.pencils.push(pencilGroup);
      this.scene.add(pencilGroup);
    }

    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    for (let i = 0; i < 100; i++) {
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0x64b5f6 : 0xffd54f,
        transparent: true,
        opacity: 0.6
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      particle.position.x = (Math.random() - 0.5) * 30;
      particle.position.y = (Math.random() - 0.5) * 20;
      particle.position.z = (Math.random() - 0.5) * 30;
      
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      };
      
      this.particles.push(particle);
      this.scene.add(particle);
    }
  }

  private getRandomColor(): number {
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf7b731, 0x5f27cd, 0x00d2d3, 0xff9ff3, 0x54a0ff];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();

    this.books.forEach((book, index) => {
      book.rotation.x += book.userData.speedX;
      book.rotation.y += book.userData.speedY;
      book.rotation.z += book.userData.speedZ;
      
      book.userData.angle += book.userData.orbitSpeed;
      book.position.x = Math.cos(book.userData.angle) * book.userData.orbitRadius;
      book.position.z = Math.sin(book.userData.angle) * book.userData.orbitRadius;
      book.position.y = Math.sin(time + index * 0.5) * 3;
    });

    this.pencils.forEach((pencil) => {
      pencil.position.y += pencil.userData.velocityY;
      pencil.rotation.y += pencil.userData.rotationSpeed;
      
      if (pencil.position.y > 10) {
        pencil.position.y = -10;
        pencil.position.x = (Math.random() - 0.5) * 20;
        pencil.position.z = (Math.random() - 0.5) * 20;
      }
    });

    this.particles.forEach((particle) => {
      particle.position.add(particle.userData.velocity);
      
      if (Math.abs(particle.position.x) > 15) particle.userData.velocity.x *= -1;
      if (Math.abs(particle.position.y) > 10) particle.userData.velocity.y *= -1;
      if (Math.abs(particle.position.z) > 15) particle.userData.velocity.z *= -1;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 2;
    this.camera.position.y = 2 + Math.sin(time * 0.3) * 1;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}