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
  private neurons: any[] = [];
  private connections: any[] = [];
  private dataParticles: any[] = [];

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.createNeuralNetwork();
    this.createDataFlow();
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
    this.camera.position.z = 25;
    this.camera.position.y = 5;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 100);
    pointLight2.position.set(-10, -10, 10);
    this.scene.add(pointLight2);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createNeuralNetwork(): void {
    const THREE = (window as any).THREE;
    const layers = [8, 12, 12, 8, 4];
    const layerSpacing = 8;
    const neuronSpacing = 2;

    layers.forEach((neuronCount, layerIndex) => {
      const xPos = (layerIndex - layers.length / 2) * layerSpacing;

      for (let i = 0; i < neuronCount; i++) {
        const yPos = (i - neuronCount / 2) * neuronSpacing;
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(layerIndex / layers.length, 0.8, 0.5),
          emissive: new THREE.Color().setHSL(layerIndex / layers.length, 0.8, 0.3),
          metalness: 0.8,
          roughness: 0.2
        });
        const neuron = new THREE.Mesh(geometry, material);
        neuron.position.set(xPos, yPos, 0);
        neuron.userData = { layer: layerIndex, index: i, baseY: yPos, phase: Math.random() * Math.PI * 2 };
        this.scene.add(neuron);
        this.neurons.push(neuron);

        if (layerIndex > 0) {
          const prevLayerStart = layers.slice(0, layerIndex).reduce((a, b) => a + b, 0);
          const prevLayerNeurons = this.neurons.slice(prevLayerStart, prevLayerStart + layers[layerIndex - 1]);

          prevLayerNeurons.forEach(prevNeuron => {
            if (Math.random() > 0.3) {
              const points = [prevNeuron.position, neuron.position];
              const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
              const lineMaterial = new THREE.LineBasicMaterial({
                color: 0x00ffff,
                transparent: true,
                opacity: 0.15
              });
              const line = new THREE.Line(lineGeometry, lineMaterial);
              line.userData = { from: prevNeuron, to: neuron };
              this.scene.add(line);
              this.connections.push(line);
            }
          });
        }
      }
    });
  }

  private createDataFlow(): void {
    const THREE = (window as any).THREE;

    for (let i = 0; i < 100; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        transparent: true,
        opacity: 0.8
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20
      );
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ),
        originalColor: particle.material.color.clone()
      };
      this.scene.add(particle);
      this.dataParticles.push(particle);
    }
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    this.neurons.forEach((neuron, index) => {
      neuron.position.y = neuron.userData.baseY + Math.sin(time + neuron.userData.phase) * 0.2;
      neuron.rotation.y += 0.01;
      const scale = 1 + Math.sin(time * 2 + index) * 0.1;
      neuron.scale.set(scale, scale, scale);
    });

    this.connections.forEach(line => {
      const points = [line.userData.from.position, line.userData.to.position];
      line.geometry.setFromPoints(points);
      const pulse = Math.sin(time * 3 + line.userData.from.position.x) * 0.5 + 0.5;
      line.material.opacity = 0.1 + pulse * 0.2;
    });

    this.dataParticles.forEach(particle => {
      particle.position.add(particle.userData.velocity);

      if (Math.abs(particle.position.x) > 20) particle.userData.velocity.x *= -1;
      if (Math.abs(particle.position.y) > 15) particle.userData.velocity.y *= -1;
      if (Math.abs(particle.position.z) > 10) particle.userData.velocity.z *= -1;

      particle.rotation.x += 0.02;
      particle.rotation.y += 0.02;

      const hue = (time * 0.1 + particle.position.x * 0.01) % 1;
      particle.material.color.setHSL(hue, 1, 0.5);
    });

    this.camera.position.x = Math.sin(time * 0.2) * 5;
    this.camera.position.y = 5 + Math.cos(time * 0.15) * 3;
    this.camera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}