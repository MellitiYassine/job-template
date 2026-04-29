import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private THREE = (window as any).THREE;
  private scene!: any;
  private camera!: any;
  private renderer!: any;
  private people: any[] = [];
  private connections: any[] = [];
  private time = 0;

  ngAfterViewInit(): void {
    this.initThree();
    this.createScene();
    this.animate();
  }

  private initThree(): void {
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
    this.camera.position.set(0, 5, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new this.THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new this.THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);

    const pointLight1 = new this.THREE.PointLight(0x00d4ff, 1, 30);
    pointLight1.position.set(-10, 5, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new this.THREE.PointLight(0xff00ff, 1, 30);
    pointLight2.position.set(10, 5, -10);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createScene(): void {
    const numPeople = 20;
    const radius = 8;

    for (let i = 0; i < numPeople; i++) {
      const angle = (i / numPeople) * Math.PI * 2;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 8;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;

      const person = this.createPerson(x, y, z);
      this.people.push({
        mesh: person,
        position: new this.THREE.Vector3(x, y, z),
        velocity: new this.THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        originalPos: new this.THREE.Vector3(x, y, z)
      });
      this.scene.add(person);
    }

    for (let i = 0; i < numPeople; i++) {
      for (let j = i + 1; j < numPeople; j++) {
        if (Math.random() > 0.7) {
          const connection = this.createConnection(
            this.people[i].mesh.position,
            this.people[j].mesh.position
          );
          this.connections.push({
            line: connection,
            start: i,
            end: j
          });
          this.scene.add(connection);
        }
      }
    }

    const particleGeometry = new this.THREE.BufferGeometry();
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
    }

    particleGeometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
    const particleMaterial = new this.THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    const particles = new this.THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
  }

  private createPerson(x: number, y: number, z: number): any {
    const group = new this.THREE.Group();

    const headGeometry = new this.THREE.SphereGeometry(0.3, 16, 16);
    const bodyGeometry = new this.THREE.CylinderGeometry(0.2, 0.25, 0.8, 8);
    
    const colors = [0x00d4ff, 0xff00ff, 0x00ff88, 0xffaa00, 0xff3366];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const material = new this.THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
      shininess: 100
    });

    const head = new this.THREE.Mesh(headGeometry, material);
    head.position.y = 0.5;
    
    const body = new this.THREE.Mesh(bodyGeometry, material);
    body.position.y = -0.1;

    group.add(head);
    group.add(body);
    group.position.set(x, y, z);

    return group;
  }

  private createConnection(start: any, end: any): any {
    const points = [start.clone(), end.clone()];
    const geometry = new this.THREE.BufferGeometry().setFromPoints(points);
    const material = new this.THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.2
    });
    return new this.THREE.Line(geometry, material);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.time += 0.01;

    this.people.forEach((person, index) => {
      person.mesh.position.add(person.velocity);
      
      const distFromOrigin = person.mesh.position.distanceTo(person.originalPos);
      if (distFromOrigin > 3) {
        person.velocity.multiplyScalar(-1);
      }

      person.mesh.rotation.y += 0.01;
      person.mesh.position.y += Math.sin(this.time + index) * 0.01;
    });

    this.connections.forEach(conn => {
      const start = this.people[conn.start].mesh.position;
      const end = this.people[conn.end].mesh.position;
      const points = [start.clone(), end.clone()];
      conn.line.geometry.setFromPoints(points);
    });

    this.camera.position.x = Math.sin(this.time * 0.2) * 15;
    this.camera.position.z = Math.cos(this.time * 0.2) * 15;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}