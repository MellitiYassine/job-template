import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene: any;
  private camera: any;
  private renderer: any;
  private colorPalettes: any[] = [];
  private brushStrokes: any[] = [];
  private pencils: any[] = [];
  private paintDrops: any[] = [];

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xffff00, 2, 50);
    pointLight3.position.set(0, 10, -10);
    this.scene.add(pointLight3);

    window.addEventListener('resize', () => this.onResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.BoxGeometry(1.5, 0.1, 1.5);
      const colors = [
        [0xff0066, 0xff9900, 0xffff00, 0x00ff99, 0x0066ff],
        [0xff3366, 0xff6633, 0xffff33, 0x33ff66, 0x3366ff],
        [0xff0033, 0xff6600, 0xffcc00, 0x00ff66, 0x0033ff],
        [0xff0099, 0xff9933, 0xccff00, 0x00ffcc, 0x0099ff],
        [0xff00cc, 0xffcc33, 0x99ff00, 0x00ffff, 0x00ccff]
      ];

      const materials = colors[i].map(color => 
        new THREE.MeshPhongMaterial({ 
          color, 
          emissive: color, 
          emissiveIntensity: 0.3,
          shininess: 100
        })
      );

      const palette = new THREE.Mesh(geometry, materials);
      palette.position.set(
        Math.sin(i * Math.PI * 0.4) * 8,
        Math.cos(i * Math.PI * 0.3) * 3,
        -5 - i * 2
      );
      palette.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.colorPalettes.push(palette);
      this.scene.add(palette);
    }

    for (let i = 0; i < 30; i++) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(
          Math.random() * 20 - 10,
          Math.random() * 10 - 5,
          Math.random() * 20 - 10
        ),
        new THREE.Vector3(
          Math.random() * 20 - 10,
          Math.random() * 10 - 5,
          Math.random() * 20 - 10
        ),
        new THREE.Vector3(
          Math.random() * 20 - 10,
          Math.random() * 10 - 5,
          Math.random() * 20 - 10
        )
      );

      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.6),
        linewidth: 2
      });
      const stroke = new THREE.Line(geometry, material);
      this.brushStrokes.push(stroke);
      this.scene.add(stroke);
    }

    for (let i = 0; i < 8; i++) {
      const pencilGroup = new THREE.Group();

      const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 6);
      const bodyMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / 8, 0.8, 0.5),
        shininess: 50
      });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

      const tipGeometry = new THREE.ConeGeometry(0.1, 0.3, 6);
      const tipMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
      const tip = new THREE.Mesh(tipGeometry, tipMaterial);
      tip.position.y = -1.65;

      const eraserGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 6);
      const eraserMaterial = new THREE.MeshPhongMaterial({ color: 0xff9999 });
      const eraser = new THREE.Mesh(eraserGeometry, eraserMaterial);
      eraser.position.y = 1.65;

      pencilGroup.add(body);
      pencilGroup.add(tip);
      pencilGroup.add(eraser);

      pencilGroup.position.set(
        Math.cos(i * Math.PI / 4) * 6,
        Math.sin(i * Math.PI / 4) * 4,
        -3
      );
      pencilGroup.rotation.z = i * Math.PI / 4;

      this.pencils.push(pencilGroup);
      this.scene.add(pencilGroup);
    }

    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        transparent: true,
        opacity: 0.7,
        emissive: new THREE.Color().setHSL(Math.random(), 1, 0.3),
        emissiveIntensity: 0.5
      });
      const drop = new THREE.Mesh(geometry, material);
      drop.position.set(
        Math.random() * 30 - 15,
        Math.random() * 20 - 10,
        Math.random() * 30 - 15
      );
      drop.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      };
      this.paintDrops.push(drop);
      this.scene.add(drop);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.colorPalettes.forEach((palette, i) => {
      palette.rotation.x += 0.005;
      palette.rotation.y += 0.008;
      palette.position.y += Math.sin(time + i) * 0.01;
    });

    this.brushStrokes.forEach((stroke, i) => {
      stroke.rotation.z += 0.002;
      stroke.rotation.y += 0.003;
    });

    this.pencils.forEach((pencil, i) => {
      pencil.rotation.y += 0.01;
      pencil.position.y += Math.sin(time * 2 + i) * 0.02;
    });

    this.paintDrops.forEach(drop => {
      drop.position.add(drop.userData.velocity);
      drop.rotation.x += 0.02;
      drop.rotation.y += 0.03;

      if (Math.abs(drop.position.x) > 15) drop.userData.velocity.x *= -1;
      if (Math.abs(drop.position.y) > 10) drop.userData.velocity.y *= -1;
      if (Math.abs(drop.position.z) > 15) drop.userData.velocity.z *= -1;
    });

    this.camera.position.x = Math.sin(time * 0.2) * 3;
    this.camera.position.y = 2 + Math.cos(time * 0.3) * 2;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}