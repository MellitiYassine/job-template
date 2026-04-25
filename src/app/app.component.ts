import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private THREE = (window as any).THREE;
  private scene!: any;
  private camera!: any;
  private renderer!: any;
  private coins: any[] = [];
  private charts: any[] = [];
  private arrows: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createScene();
    this.animate();
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new this.THREE.Scene();
    this.scene.background = new this.THREE.Color(0x0a0e27);
    this.scene.fog = new this.THREE.Fog(0x0a0e27, 10, 50);

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
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new this.THREE.DirectionalLight(0xffd700, 1);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);

    const pointLight1 = new this.THREE.PointLight(0x00ff88, 1, 30);
    pointLight1.position.set(-10, 5, -5);
    this.scene.add(pointLight1);

    const pointLight2 = new this.THREE.PointLight(0xff0088, 1, 30);
    pointLight2.position.set(10, 5, -5);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    this.createCoins();
    this.createCharts();
    this.createArrows();
    this.createParticles();
  }

  private createCoins(): void {
    const coinGeometry = new this.THREE.CylinderGeometry(0.5, 0.5, 0.1, 32);
    const coinMaterial = new this.THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.8,
      roughness: 0.2
    });

    for (let i = 0; i < 25; i++) {
      const coin = new this.THREE.Mesh(coinGeometry, coinMaterial);
      coin.position.x = Math.random() * 30 - 15;
      coin.position.y = Math.random() * 20 - 10;
      coin.position.z = Math.random() * 20 - 30;
      coin.rotation.x = Math.random() * Math.PI;
      coin.userData = {
        speedY: Math.random() * 0.02 + 0.01,
        speedRotation: Math.random() * 0.05 + 0.02
      };
      this.scene.add(coin);
      this.coins.push(coin);
    }
  }

  private createCharts(): void {
    for (let i = 0; i < 8; i++) {
      const group = new this.THREE.Group();
      const barCount = 5;
      
      for (let j = 0; j < barCount; j++) {
        const height = Math.random() * 2 + 0.5;
        const barGeometry = new this.THREE.BoxGeometry(0.3, height, 0.3);
        const barMaterial = new this.THREE.MeshStandardMaterial({
          color: new this.THREE.Color().setHSL(j / barCount, 0.7, 0.5),
          emissive: new this.THREE.Color().setHSL(j / barCount, 0.7, 0.3),
          emissiveIntensity: 0.5
        });
        const bar = new this.THREE.Mesh(barGeometry, barMaterial);
        bar.position.x = (j - barCount / 2) * 0.4;
        bar.position.y = height / 2;
        group.add(bar);
      }

      group.position.x = Math.random() * 30 - 15;
      group.position.y = Math.random() * 15 - 7;
      group.position.z = Math.random() * 20 - 30;
      group.scale.set(0.8, 0.8, 0.8);
      group.userData = {
        speedRotation: Math.random() * 0.01 + 0.005,
        speedY: Math.random() * 0.015 + 0.005
      };
      this.scene.add(group);
      this.charts.push(group);
    }
  }

  private createArrows(): void {
    const arrowLength = 2;
    const arrowWidth = 0.5;
    
    for (let i = 0; i < 15; i++) {
      const shape = new this.THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(arrowWidth / 2, arrowLength * 0.7);
      shape.lineTo(arrowWidth / 4, arrowLength * 0.7);
      shape.lineTo(arrowWidth / 4, arrowLength);
      shape.lineTo(-arrowWidth / 4, arrowLength);
      shape.lineTo(-arrowWidth / 4, arrowLength * 0.7);
      shape.lineTo(-arrowWidth / 2, arrowLength * 0.7);
      shape.lineTo(0, 0);

      const extrudeSettings = {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 3
      };

      const geometry = new this.THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new this.THREE.MeshStandardMaterial({
        color: 0x00ff00,
        emissive: 0x00aa00,
        emissiveIntensity: 0.3
      });
      const arrow = new this.THREE.Mesh(geometry, material);
      
      arrow.position.x = Math.random() * 30 - 15;
      arrow.position.y = Math.random() * 20 - 10;
      arrow.position.z = Math.random() * 20 - 30;
      arrow.rotation.z = Math.random() * Math.PI * 2;
      arrow.userData = {
        speedY: Math.random() * 0.02 + 0.01,
        speedRotation: Math.random() * 0.03 + 0.01
      };
      this.scene.add(arrow);
      this.arrows.push(arrow);
    }
  }

  private createParticles(): void {
    const particlesGeometry = new this.THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = Math.random() * 60 - 30;
      positions[i + 1] = Math.random() * 40 - 20;
      positions[i + 2] = Math.random() * 40 - 40;
    }

    particlesGeometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new this.THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: this.THREE.AdditiveBlending
    });

    const particles = new this.THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(particles);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    this.coins.forEach(coin => {
      coin.rotation.y += coin.userData.speedRotation;
      coin.position.y += coin.userData.speedY;
      if (coin.position.y > 12) {
        coin.position.y = -12;
      }
    });

    this.charts.forEach(chart => {
      chart.rotation.y += chart.userData.speedRotation;
      chart.position.y += chart.userData.speedY;
      if (chart.position.y > 10) {
        chart.position.y = -10;
      }
    });

    this.arrows.forEach(arrow => {
      arrow.rotation.z += arrow.userData.speedRotation;
      arrow.position.y += arrow.userData.speedY;
      if (arrow.position.y > 12) {
        arrow.position.y = -12;
      }
    });

    this.camera.position.x = Math.sin(Date.now() * 0.0002) * 3;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}