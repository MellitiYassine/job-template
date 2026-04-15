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
  private letters: any[] = [];
  private words: any[] = [];
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
    this.scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;
    this.camera.position.y = 2;
    
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x0a0a1a, 1);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    this.scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x4a9eff, 3, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff6b9d, 2, 50);
    pointLight2.position.set(-10, -10, 5);
    this.scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0xffd700, 2, 50);
    pointLight3.position.set(0, 15, -10);
    this.scene.add(pointLight3);
    
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;
    
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fontLoader = new THREE.FontLoader();
    
    for (let i = 0; i < 80; i++) {
      const geometry = new THREE.BoxGeometry(0.3, 0.4, 0.1);
      const material = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0x4a9eff : 0xff6b9d,
        emissive: Math.random() > 0.5 ? 0x1a4eff : 0xff1a6d,
        emissiveIntensity: 0.3,
        shininess: 100
      });
      const letter = new THREE.Mesh(geometry, material);
      
      const angle = (i / 80) * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      letter.position.x = Math.cos(angle) * radius;
      letter.position.z = Math.sin(angle) * radius;
      letter.position.y = (Math.random() - 0.5) * 10;
      
      letter.rotation.x = Math.random() * Math.PI;
      letter.rotation.y = Math.random() * Math.PI;
      letter.rotation.z = Math.random() * Math.PI;
      
      letter.userData = {
        rotationSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.02 },
        orbitSpeed: 0.0005 + Math.random() * 0.001,
        orbitRadius: radius,
        angle: angle,
        floatSpeed: 0.001 + Math.random() * 0.002,
        floatOffset: Math.random() * Math.PI * 2
      };
      
      this.scene.add(letter);
      this.letters.push(letter);
    }
    
    for (let i = 0; i < 150; i++) {
      const geometry = new THREE.SphereGeometry(0.05, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: Math.random() * 0.6 + 0.4
      });
      const particle = new THREE.Mesh(geometry, material);
      
      particle.position.x = (Math.random() - 0.5) * 40;
      particle.position.y = (Math.random() - 0.5) * 40;
      particle.position.z = (Math.random() - 0.5) * 40;
      
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      };
      
      this.scene.add(particle);
      this.particles.push(particle);
    }
    
    const words = ['CREATE', 'WRITE', 'INSPIRE', 'CRAFT'];
    words.forEach((word, index) => {
      const geometry = new THREE.PlaneGeometry(3, 0.6);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;
      
      if (context) {
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'bold 80px Arial';
        context.fillStyle = index % 2 === 0 ? '#4a9eff' : '#ff6b9d';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(word, 256, 64);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 3 - index * 2;
      mesh.position.z = -5;
      mesh.userData = {
        floatSpeed: 0.001,
        floatOffset: index * Math.PI / 2
      };
      
      this.scene.add(mesh);
      this.words.push(mesh);
    });
    
    const penGeometry = new THREE.CylinderGeometry(0.05, 0.1, 2, 8);
    const penMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a, shininess: 80 });
    const pen = new THREE.Mesh(penGeometry, penMaterial);
    pen.position.set(5, -2, 3);
    pen.rotation.z = Math.PI / 4;
    pen.userData = { rotationSpeed: 0.01 };
    this.scene.add(pen);
    this.words.push(pen);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    
    const time = Date.now() * 0.001;
    
    this.letters.forEach(letter => {
      letter.rotation.x += letter.userData.rotationSpeed.x;
      letter.rotation.y += letter.userData.rotationSpeed.y;
      letter.rotation.z += letter.userData.rotationSpeed.z;
      
      letter.userData.angle += letter.userData.orbitSpeed;
      letter.position.x = Math.cos(letter.userData.angle) * letter.userData.orbitRadius;
      letter.position.z = Math.sin(letter.userData.angle) * letter.userData.orbitRadius;
      letter.position.y += Math.sin(time * letter.userData.floatSpeed + letter.userData.floatOffset) * 0.01;
    });
    
    this.particles.forEach(particle => {
      particle.position.add(particle.userData.velocity);
      
      if (Math.abs(particle.position.x) > 20) particle.userData.velocity.x *= -1;
      if (Math.abs(particle.position.y) > 20) particle.userData.velocity.y *= -1;
      if (Math.abs(particle.position.z) > 20) particle.userData.velocity.z *= -1;
    });
    
    this.words.forEach((word, index) => {
      if (word.userData.floatSpeed) {
        word.position.y += Math.sin(time * word.userData.floatSpeed + word.userData.floatOffset) * 0.005;
      }
      if (word.userData.rotationSpeed) {
        word.rotation.y += word.userData.rotationSpeed;
      }
    });
    
    this.camera.position.x = Math.sin(time * 0.1) * 2;
    this.camera.lookAt(this.scene.position);
    
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}