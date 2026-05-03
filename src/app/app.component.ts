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
  private microphones: any[] = [];
  private soundWaves: any[] = [];
  private spotlights: any[] = [];
  private particles: any[] = [];

  ngAfterViewInit(): void {
    this.THREE = (window as any).THREE;
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new this.THREE.Scene();
    this.scene.fog = new this.THREE.Fog(0x0a0a1a, 10, 50);

    this.camera = new this.THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new this.THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const ambientLight = new this.THREE.AmbientLight(0x404060, 0.3);
    this.scene.add(ambientLight);

    const spotlight1 = new this.THREE.SpotLight(0xff6b9d, 2);
    spotlight1.position.set(-10, 15, 5);
    spotlight1.angle = 0.5;
    spotlight1.penumbra = 0.5;
    spotlight1.castShadow = true;
    this.scene.add(spotlight1);
    this.spotlights.push(spotlight1);

    const spotlight2 = new this.THREE.SpotLight(0x4de8ff, 2);
    spotlight2.position.set(10, 15, 5);
    spotlight2.angle = 0.5;
    spotlight2.penumbra = 0.5;
    this.scene.add(spotlight2);
    this.spotlights.push(spotlight2);

    const spotlight3 = new this.THREE.SpotLight(0xffeb3b, 1.5);
    spotlight3.position.set(0, 20, -5);
    spotlight3.angle = 0.6;
    spotlight3.penumbra = 0.7;
    this.scene.add(spotlight3);
    this.spotlights.push(spotlight3);

    this.createMicrophone(0, 0, 0);
    this.createMicrophone(-6, -1, 3);
    this.createMicrophone(6, -1, 3);

    for (let i = 0; i < 200; i++) {
      const geometry = new this.THREE.SphereGeometry(0.05, 8, 8);
      const material = new this.THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xff6b9d : 0x4de8ff,
        transparent: true,
        opacity: 0.8
      });
      const particle = new this.THREE.Mesh(geometry, material);
      particle.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 30
      );
      particle.userData.velocity = new this.THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      );
      this.particles.push(particle);
      this.scene.add(particle);
    }

    for (let i = 0; i < 5; i++) {
      this.createSoundWave(i * 0.5);
    }

    const stageGeometry = new this.THREE.BoxGeometry(20, 0.5, 10);
    const stageMaterial = new this.THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.7,
      roughness: 0.3
    });
    const stage = new this.THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.y = -3;
    stage.receiveShadow = true;
    this.scene.add(stage);
  }

  private createMicrophone(x: number, y: number, z: number): void {
    const group = new this.THREE.Group();

    const handleGeometry = new this.THREE.CylinderGeometry(0.15, 0.15, 3, 16);
    const handleMaterial = new this.THREE.MeshStandardMaterial({
      color: 0x2c2c3e,
      metalness: 0.8,
      roughness: 0.2
    });
    const handle = new this.THREE.Mesh(handleGeometry, handleMaterial);
    handle.castShadow = true;
    group.add(handle);

    const headGeometry = new this.THREE.SphereGeometry(0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const headMaterial = new this.THREE.MeshStandardMaterial({
      color: 0x8e8ea0,
      metalness: 0.9,
      roughness: 0.1
    });
    const head = new this.THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    group.add(head);

    const gridGeometry = new this.THREE.SphereGeometry(0.52, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const gridMaterial = new this.THREE.MeshStandardMaterial({
      color: 0x4a4a5e,
      metalness: 0.7,
      roughness: 0.4,
      wireframe: true
    });
    const grid = new this.THREE.Mesh(gridGeometry, gridMaterial);
    grid.position.y = 1.5;
    group.add(grid);

    group.position.set(x, y, z);
    group.userData.baseY = y;
    group.userData.rotationSpeed = Math.random() * 0.01 + 0.005;
    this.microphones.push(group);
    this.scene.add(group);
  }

  private createSoundWave(delay: number): void {
    const geometry = new this.THREE.TorusGeometry(2, 0.05, 16, 100);
    const material = new this.THREE.MeshBasicMaterial({
      color: 0xff6b9d,
      transparent: true,
      opacity: 0
    });
    const wave = new this.THREE.Mesh(geometry, material);
    wave.position.set(0, 0, 0);
    wave.rotation.x = Math.PI / 2;
    wave.userData.delay = delay;
    wave.userData.time = 0;
    this.soundWaves.push(wave);
    this.scene.add(wave);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.microphones.forEach((mic, index) => {
      mic.rotation.y += mic.userData.rotationSpeed;
      mic.position.y = mic.userData.baseY + Math.sin(time + index) * 0.2;
    });

    this.soundWaves.forEach((wave) => {
      wave.userData.time += 0.016;
      if (wave.userData.time > wave.userData.delay) {
        const elapsed = wave.userData.time - wave.userData.delay;
        const scale = 1 + elapsed * 2;
        wave.scale.set(scale, scale, 1);
        wave.material.opacity = Math.max(0, 1 - elapsed * 0.5);
        
        if (elapsed > 2) {
          wave.userData.time = 0;
          wave.scale.set(1, 1, 1);
        }
      }
    });

    this.particles.forEach((particle) => {
      particle.position.add(particle.userData.velocity);
      
      if (Math.abs(particle.position.x) > 15) particle.userData.velocity.x *= -1;
      if (Math.abs(particle.position.y) > 10) particle.userData.velocity.y *= -1;
      if (Math.abs(particle.position.z) > 15) particle.userData.velocity.z *= -1;
      
      particle.material.opacity = 0.5 + Math.sin(time * 2 + particle.position.x) * 0.3;
    });

    this.spotlights.forEach((light, index) => {
      light.intensity = 1.5 + Math.sin(time * 2 + index * Math.PI / 3) * 0.5;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 2;
    this.camera.position.y = 5 + Math.sin(time * 0.3) * 1;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}