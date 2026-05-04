import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private scene: any;
  private camera: any;
  private renderer: any;
  private dumbbells: any[] = [];
  private kettlebells: any[] = [];
  private proteins: any[] = [];
  private particles: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const THREE = (window as any).THREE;
    const canvas = this.canvasRef.nativeElement;
    
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

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const spotLight1 = new THREE.SpotLight(0xff6b00, 1.5);
    spotLight1.position.set(10, 15, 10);
    spotLight1.castShadow = true;
    this.scene.add(spotLight1);

    const spotLight2 = new THREE.SpotLight(0x00d4ff, 1.2);
    spotLight2.position.set(-10, 15, -10);
    spotLight2.castShadow = true;
    this.scene.add(spotLight2);

    const pointLight = new THREE.PointLight(0xff0040, 1, 50);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 5; i++) {
      const dumbbellGroup = new THREE.Group();
      
      const barGeometry = new THREE.CylinderGeometry(0.15, 0.15, 3, 16);
      const barMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444, 
        metalness: 0.8, 
        roughness: 0.2 
      });
      const bar = new THREE.Mesh(barGeometry, barMaterial);
      bar.rotation.z = Math.PI / 2;
      dumbbellGroup.add(bar);

      const weightGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
      const weightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff4500, 
        metalness: 0.7, 
        roughness: 0.3 
      });
      
      const weight1 = new THREE.Mesh(weightGeometry, weightMaterial);
      weight1.position.x = -1.5;
      weight1.rotation.z = Math.PI / 2;
      dumbbellGroup.add(weight1);

      const weight2 = new THREE.Mesh(weightGeometry, weightMaterial);
      weight2.position.x = 1.5;
      weight2.rotation.z = Math.PI / 2;
      dumbbellGroup.add(weight2);

      dumbbellGroup.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      );
      dumbbellGroup.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      dumbbellGroup.userData = {
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.02,
        rotationSpeed: (Math.random() - 0.5) * 0.03
      };

      this.dumbbells.push(dumbbellGroup);
      this.scene.add(dumbbellGroup);
    }

    for (let i = 0; i < 4; i++) {
      const kettlebellGroup = new THREE.Group();
      
      const ballGeometry = new THREE.SphereGeometry(0.6, 32, 32);
      const ballMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a, 
        metalness: 0.9, 
        roughness: 0.1 
      });
      const ball = new THREE.Mesh(ballGeometry, ballMaterial);
      kettlebellGroup.add(ball);

      const handleGeometry = new THREE.TorusGeometry(0.5, 0.1, 16, 32, Math.PI);
      const handleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a, 
        metalness: 0.8, 
        roughness: 0.2 
      });
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.position.y = 0.6;
      handle.rotation.x = Math.PI;
      kettlebellGroup.add(handle);

      kettlebellGroup.position.set(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 25
      );
      
      kettlebellGroup.userData = {
        speedX: (Math.random() - 0.5) * 0.015,
        speedY: (Math.random() - 0.5) * 0.015,
        rotationSpeed: (Math.random() - 0.5) * 0.025
      };

      this.kettlebells.push(kettlebellGroup);
      this.scene.add(kettlebellGroup);
    }

    for (let i = 0; i < 8; i++) {
      const bottleGroup = new THREE.Group();
      
      const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.35, 1.2, 16);
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ccff, 
        transparent: true, 
        opacity: 0.6,
        metalness: 0.3,
        roughness: 0.1
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      bottleGroup.add(body);

      const capGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.3, 16);
      const capMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff6600, 
        metalness: 0.7, 
        roughness: 0.3 
      });
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.y = 0.75;
      bottleGroup.add(cap);

      bottleGroup.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 30
      );
      
      bottleGroup.userData = {
        speedX: (Math.random() - 0.5) * 0.01,
        speedY: (Math.random() - 0.5) * 0.01,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };

      this.proteins.push(bottleGroup);
      this.scene.add(bottleGroup);
    }

    for (let i = 0; i < 200; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      particle.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 50
      );
      
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        )
      };

      this.particles.push(particle);
      this.scene.add(particle);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.dumbbells.forEach((dumbbell) => {
      dumbbell.rotation.x += dumbbell.userData.rotationSpeed;
      dumbbell.rotation.y += dumbbell.userData.rotationSpeed * 0.5;
      dumbbell.position.x += dumbbell.userData.speedX;
      dumbbell.position.y += dumbbell.userData.speedY;

      if (Math.abs(dumbbell.position.x) > 15) dumbbell.userData.speedX *= -1;
      if (Math.abs(dumbbell.position.y) > 10) dumbbell.userData.speedY *= -1;
    });

    this.kettlebells.forEach((kettlebell) => {
      kettlebell.rotation.y += kettlebell.userData.rotationSpeed;
      kettlebell.position.x += kettlebell.userData.speedX;
      kettlebell.position.y += kettlebell.userData.speedY;

      if (Math.abs(kettlebell.position.x) > 18) kettlebell.userData.speedX *= -1;
      if (Math.abs(kettlebell.position.y) > 12) kettlebell.userData.speedY *= -1;
    });

    this.proteins.forEach((protein) => {
      protein.rotation.y += protein.userData.rotationSpeed;
      protein.position.x += protein.userData.speedX;
      protein.position.y += protein.userData.speedY;

      if (Math.abs(protein.position.x) > 20) protein.userData.speedX *= -1;
      if (Math.abs(protein.position.y) > 15) protein.userData.speedY *= -1;
    });

    this.particles.forEach((particle) => {
      particle.position.add(particle.userData.velocity);

      if (Math.abs(particle.position.x) > 25) particle.userData.velocity.x *= -1;
      if (Math.abs(particle.position.y) > 15) particle.userData.velocity.y *= -1;
      if (Math.abs(particle.position.z) > 25) particle.userData.velocity.z *= -1;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 5;
    this.camera.position.y = Math.cos(time * 0.15) * 3 + 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}