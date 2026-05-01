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
  private particles: any[] = [];
  private paths: any[] = [];
  private clock: any;

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
    this.animate();
  }

  private initThree(): void {
    const THREE = (window as any).THREE;
    this.clock = new THREE.Clock();
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.Fog(0x0a0a1a, 10, 50);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4a90e2, 2, 50);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe24a90, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x90e24a, 2, 50);
    pointLight3.position.set(0, 10, -10);
    this.scene.add(pointLight3);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const THREE = (window as any).THREE;
    
    this.createStairwayPath();
    this.createFloatingGoals();
    this.createEnergyParticles();
    this.createMotivationalRings();
    this.createGrowthSpiral();
  }

  private createStairwayPath(): void {
    const THREE = (window as any).THREE;
    
    for (let i = 0; i < 12; i++) {
      const geometry = new THREE.BoxGeometry(2, 0.2, 1);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / 12, 0.7, 0.5),
        transparent: true,
        opacity: 0.8,
        emissive: new THREE.Color().setHSL(i / 12, 0.7, 0.3),
        emissiveIntensity: 0.5
      });
      const step = new THREE.Mesh(geometry, material);
      step.position.set(
        Math.sin(i * 0.5) * 5,
        i * 0.8 - 5,
        Math.cos(i * 0.5) * 5 - 10
      );
      step.rotation.y = i * 0.3;
      this.scene.add(step);
      this.paths.push({ mesh: step, speed: 0.5 + i * 0.1, offset: i });
    }
  }

  private createFloatingGoals(): void {
    const THREE = (window as any).THREE;
    const shapes = ['star', 'trophy', 'heart'];
    
    for (let i = 0; i < 8; i++) {
      let geometry;
      const shapeType = shapes[i % 3];
      
      if (shapeType === 'star') {
        const starShape = new THREE.Shape();
        const outerRadius = 0.5;
        const innerRadius = 0.2;
        const points = 5;
        
        for (let j = 0; j < points * 2; j++) {
          const radius = j % 2 === 0 ? outerRadius : innerRadius;
          const angle = (j * Math.PI) / points;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (j === 0) starShape.moveTo(x, y);
          else starShape.lineTo(x, y);
        }
        starShape.closePath();
        
        geometry = new THREE.ExtrudeGeometry(starShape, {
          depth: 0.2,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05
        });
      } else if (shapeType === 'trophy') {
        geometry = new THREE.ConeGeometry(0.4, 0.8, 6);
      } else {
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0.2);
        heartShape.bezierCurveTo(0, 0.4, -0.4, 0.4, -0.4, 0.2);
        heartShape.bezierCurveTo(-0.4, 0, -0.2, -0.2, 0, -0.5);
        heartShape.bezierCurveTo(0.2, -0.2, 0.4, 0, 0.4, 0.2);
        heartShape.bezierCurveTo(0.4, 0.4, 0, 0.4, 0, 0.2);
        
        geometry = new THREE.ExtrudeGeometry(heartShape, {
          depth: 0.3,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05
        });
      }
      
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / 8, 0.8, 0.6),
        emissive: new THREE.Color().setHSL(i / 8, 0.8, 0.4),
        emissiveIntensity: 0.3,
        shininess: 100
      });
      
      const goal = new THREE.Mesh(geometry, material);
      const angle = (i / 8) * Math.PI * 2;
      goal.position.set(
        Math.cos(angle) * 8,
        Math.sin(i * 0.8) * 3,
        Math.sin(angle) * 8 - 5
      );
      
      this.scene.add(goal);
      this.particles.push({
        mesh: goal,
        speed: 0.3 + Math.random() * 0.5,
        radius: 8,
        angle: angle,
        height: Math.sin(i * 0.8) * 3,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      });
    }
  }

  private createEnergyParticles(): void {
    const THREE = (window as any).THREE;
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      
      const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(geometry, material);
    this.scene.add(particleSystem);
    this.particles.push({ mesh: particleSystem, type: 'particles' });
  }

  private createMotivationalRings(): void {
    const THREE = (window as any).THREE;
    
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.TorusGeometry(3 + i * 1.5, 0.1, 16, 100);
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL(i / 5, 0.7, 0.5),
        transparent: true,
        opacity: 0.3,
        emissive: new THREE.Color().setHSL(i / 5, 0.7, 0.3),
        emissiveIntensity: 0.5
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.position.z = -5;
      ring.rotation.x = Math.PI / 2;
      this.scene.add(ring);
      this.paths.push({ mesh: ring, speed: 0.2 + i * 0.1, type: 'ring' });
    }
  }

  private createGrowthSpiral(): void {
    const THREE = (window as any).THREE;
    const curve = new THREE.CatmullRomCurve3([]);
    const points: any[] = [];
    
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 8;
      const radius = t * 10;
      const x = Math.cos(angle) * radius;
      const y = t * 15 - 7.5;
      const z = Math.sin(angle) * radius - 10;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    curve.points = points;
    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.05, 8, false);
    const tubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.6,
      emissive: 0x2a5082,
      emissiveIntensity: 0.5
    });
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    this.scene.add(tube);
    this.paths.push({ mesh: tube, type: 'spiral' });
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    const time = this.clock.getElapsedTime();
    
    this.paths.forEach((item) => {
      if (item.type === 'ring') {
        item.mesh.rotation.z += item.speed * 0.01;
      } else if (item.type === 'spiral') {
        item.mesh.rotation.y += 0.002;
      } else {
        item.mesh.position.y += Math.sin(time + item.offset) * 0.003;
        item.mesh.rotation.y += 0.005;
      }
    });
    
    this.particles.forEach((item) => {
      if (item.type === 'particles') {
        item.mesh.rotation.y += 0.001;
        const positions = item.mesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] += Math.sin(time + i) * 0.01;
        }
        item.mesh.geometry.attributes.position.needsUpdate = true;
      } else {
        item.angle += item.speed * 0.01;
        item.mesh.position.x = Math.cos(item.angle) * item.radius;
        item.mesh.position.z = Math.sin(item.angle) * item.radius - 5;
        item.mesh.position.y = item.height + Math.sin(time * 2 + item.angle) * 0.5;
        item.mesh.rotation.y += item.rotationSpeed;
        item.mesh.rotation.x += item.rotationSpeed * 0.5;
      }
    });
    
    this.camera.position.x = Math.sin(time * 0.1) * 2;
    this.camera.position.y = 2 + Math.cos(time * 0.15) * 1;
    this.camera.lookAt(0, 0, -5);
    
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}