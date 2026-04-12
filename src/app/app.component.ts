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
  private filmStrips: any[] = [];
  private playButton!: any;
  private timeline!: any;
  private videoFrames: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
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
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const mainLight = new THREE.SpotLight(0x00d4ff, 1.5);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    const accentLight = new THREE.PointLight(0xff00ff, 1);
    accentLight.position.set(-10, 10, -10);
    this.scene.add(accentLight);

    const backLight = new THREE.PointLight(0xffaa00, 0.8);
    backLight.position.set(0, 5, -15);
    this.scene.add(backLight);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 5; i++) {
      const filmStripGeometry = new THREE.BoxGeometry(12, 0.1, 2);
      const filmStripMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.8,
        roughness: 0.2
      });
      const filmStrip = new THREE.Mesh(filmStripGeometry, filmStripMaterial);
      filmStrip.position.set(
        (Math.random() - 0.5) * 20,
        i * 2 - 4,
        (Math.random() - 0.5) * 10
      );
      filmStrip.rotation.y = Math.random() * Math.PI;
      filmStrip.castShadow = true;
      filmStrip.receiveShadow = true;
      this.scene.add(filmStrip);
      this.filmStrips.push(filmStrip);

      for (let j = 0; j < 6; j++) {
        const frameGeometry = new THREE.PlaneGeometry(1.5, 1.2);
        const colors = [0x00d4ff, 0xff00ff, 0xffaa00, 0x00ff88, 0xff4444, 0x4444ff];
        const frameMaterial = new THREE.MeshStandardMaterial({
          color: colors[j % colors.length],
          emissive: colors[j % colors.length],
          emissiveIntensity: 0.3,
          metalness: 0.5,
          roughness: 0.5
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(j * 2 - 5, 0, 0.11);
        filmStrip.add(frame);
        this.videoFrames.push(frame);
      }

      const holesGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16);
      const holesMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
      for (let k = -5; k <= 5; k++) {
        const hole1 = new THREE.Mesh(holesGeometry, holesMaterial);
        hole1.position.set(k * 1.1, 0, 0.8);
        hole1.rotation.x = Math.PI / 2;
        filmStrip.add(hole1);

        const hole2 = new THREE.Mesh(holesGeometry, holesMaterial);
        hole2.position.set(k * 1.1, 0, -0.8);
        hole2.rotation.x = Math.PI / 2;
        filmStrip.add(hole2);
      }
    }

    const playButtonGeometry = new THREE.ConeGeometry(1, 2, 3);
    const playButtonMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0055,
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.3
    });
    this.playButton = new THREE.Mesh(playButtonGeometry, playButtonMaterial);
    this.playButton.rotation.z = -Math.PI / 2;
    this.playButton.position.set(0, 0, 0);
    this.playButton.castShadow = true;
    this.scene.add(this.playButton);

    const timelineGeometry = new THREE.BoxGeometry(20, 0.3, 0.5);
    const timelineMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.7,
      roughness: 0.4
    });
    this.timeline = new THREE.Mesh(timelineGeometry, timelineMaterial);
    this.timeline.position.set(0, -6, 0);
    this.timeline.castShadow = true;
    this.scene.add(this.timeline);

    for (let i = 0; i < 10; i++) {
      const markerGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
      const markerMaterial = new THREE.MeshStandardMaterial({
        color: 0x00d4ff,
        emissive: 0x00d4ff,
        emissiveIntensity: 0.4
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(i * 2 - 9, -5.5, 0);
      this.scene.add(marker);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 50;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particles);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.filmStrips.forEach((strip, index) => {
      strip.rotation.y += 0.005;
      strip.position.y = Math.sin(time + index) * 2;
      strip.position.x = Math.cos(time * 0.5 + index) * 8;
    });

    this.playButton.rotation.y += 0.02;
    this.playButton.position.y = Math.sin(time * 2) * 0.5;
    this.playButton.scale.set(
      1 + Math.sin(time * 3) * 0.1,
      1 + Math.sin(time * 3) * 0.1,
      1 + Math.sin(time * 3) * 0.1
    );

    this.videoFrames.forEach((frame, index) => {
      frame.material.emissiveIntensity = 0.3 + Math.sin(time * 2 + index * 0.5) * 0.2;
    });

    this.timeline.position.x = Math.sin(time * 0.5) * 2;

    this.camera.position.x = Math.sin(time * 0.3) * 3;
    this.camera.position.y = 5 + Math.cos(time * 0.2) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}