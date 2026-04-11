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
  private frameObjects: any[] = [];
  private timeline: any[] = [];
  private playhead!: any;
  private clock!: any;

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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    this.clock = new THREE.Clock();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const spotLight1 = new THREE.SpotLight(0xff00ff, 2);
    spotLight1.position.set(-10, 10, 5);
    this.scene.add(spotLight1);

    const spotLight2 = new THREE.SpotLight(0x00ffff, 2);
    spotLight2.position.set(10, 10, -5);
    this.scene.add(spotLight2);

    for (let i = 0; i < 24; i++) {
      const frameGeometry = new THREE.BoxGeometry(0.3, 4, 3);
      const frameMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / 24, 0.8, 0.5),
        transparent: true,
        opacity: 0.7,
        emissive: new THREE.Color().setHSL(i / 24, 0.8, 0.3),
        emissiveIntensity: 0.5
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);

      const angle = (i / 24) * Math.PI * 2;
      const radius = 8;
      frame.position.x = Math.cos(angle) * radius;
      frame.position.z = Math.sin(angle) * radius;
      frame.position.y = 0;
      frame.rotation.y = -angle;

      this.scene.add(frame);
      this.frameObjects.push(frame);

      const edgesGeometry = new THREE.EdgesGeometry(frameGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      frame.add(edges);
    }

    const timelineGroup = new THREE.Group();
    timelineGroup.position.y = -3;
    this.scene.add(timelineGroup);

    for (let i = 0; i < 60; i++) {
      const keyframeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const keyframeMaterial = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5
      });
      const keyframe = new THREE.Mesh(keyframeGeometry, keyframeMaterial);

      keyframe.position.x = (i - 30) * 0.5;
      keyframe.position.y = Math.sin(i * 0.3) * 0.5;
      keyframe.position.z = 0;

      timelineGroup.add(keyframe);
      this.timeline.push(keyframe);
    }

    const playheadGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 16);
    const playheadMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1
    });
    this.playhead = new THREE.Mesh(playheadGeometry, playheadMaterial);
    this.playhead.position.y = -1.5;
    timelineGroup.add(this.playhead);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
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

    const clapperGroup = new THREE.Group();
    clapperGroup.position.set(0, 5, 0);

    const baseGeometry = new THREE.BoxGeometry(3, 0.3, 2);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    clapperGroup.add(base);

    const topGeometry = new THREE.BoxGeometry(3, 0.3, 2);
    const topMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 0.5;
    clapperGroup.add(top);

    const stripeGeometry = new THREE.BoxGeometry(2.8, 0.32, 0.3);
    const stripeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    for (let i = 0; i < 4; i++) {
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.position.y = 0.5;
      stripe.position.z = -0.6 + i * 0.4;
      clapperGroup.add(stripe);
    }

    this.scene.add(clapperGroup);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    this.frameObjects.forEach((frame, index) => {
      frame.position.y = Math.sin(elapsedTime * 2 + index * 0.3) * 0.5;
      frame.rotation.x = Math.sin(elapsedTime + index * 0.2) * 0.1;
    });

    if (this.playhead) {
      this.playhead.position.x = Math.sin(elapsedTime) * 10;
    }

    this.timeline.forEach((keyframe, index) => {
      keyframe.position.y = Math.sin(elapsedTime * 3 + index * 0.5) * 0.3;
      keyframe.scale.setScalar(1 + Math.sin(elapsedTime * 4 + index) * 0.2);
    });

    this.camera.position.x = Math.sin(elapsedTime * 0.3) * 2;
    this.camera.position.z = 15 + Math.cos(elapsedTime * 0.3) * 2;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}