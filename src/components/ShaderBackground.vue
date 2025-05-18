<!-- ShaderBackground.vue -->
<template>
    <canvas ref="canvas"></canvas>
  </template>
  
  <script setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import * as THREE from 'three';
  
  const canvas = ref(null);
  let renderer, scene, camera, raycaster, mouse;
  let frameId;
  let cloudMeshes = []; 
  let galaxyStars;
  let showGalaxy = false; // or true if you want it on by default
  
  onMounted(() => {
    initThreeJs();
    handleResize();
    window.addEventListener('resize', handleResize);
    animate();
  });
  
  onBeforeUnmount(() => {
    // Add resource cleanup

    cloudMeshes.forEach(cloud => {
      cloud.material.dispose();
      cloud.geometry?.dispose();
    });
    cloudMeshes = [];
    
    scene.traverse(child => {
      if (child.isMesh) {
        child.geometry.dispose()
        child.material.dispose()
      }
    })
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
    scene = null
    camera = null
  })

  function createStarField() {
    const geometry = new THREE.BufferGeometry();

    const nebulaData = createNebulae();
    const { positions, sizes, brightness, temperatures } = nebulaData;
    cloudMeshes = nebulaData.cloudMeshes;
    

    // Add background stars
    for (let i = 0; i < 1500; i++) {
      positions.push(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        -0.2
      );
      sizes.push(1 + Math.random() * 3);
      brightness.push(0.2 + Math.random() * 0.3);
      temperatures.push(Math.pow(Math.random(), 2));
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('brightness', new THREE.Float32BufferAttribute(brightness, 1));
    geometry.setAttribute('temperature', new THREE.Float32BufferAttribute(temperatures, 1));

    const material = new THREE.ShaderMaterial({
      // ... your shader uniforms and logic ...
      uniforms: {
        uMousePosition: { value: new THREE.Vector2(0, 0) },
        uHoverRadius: { value: 0.2 },
        uTime: { value: 0 }
      },
      vertexShader: `
        precision highp float;
        uniform float uTime;
        attribute float size;
        attribute float brightness;
        attribute float temperature;
        varying float vBrightness;
        varying float vTemperature;
        varying vec2 vPosition;
        varying float vSize;
  
        void main() {
          vBrightness = brightness;
          vTemperature = temperature;
          vPosition = position.xy;
          vSize = size;
          
          // Add size variation with turbulence
          float sizeVariation = 1.0 + sin(position.x * 100.0) * 0.2;
          gl_PointSize = size * sizeVariation * (1.0 + brightness * 0.5);

          vec3 displacedPosition = position + vec3(
              sin(position.y * 10.0 + uTime) * 0.002,
              cos(position.x * 8.0 + uTime) * 0.0015,
              0.0
          );
          
          vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        precision highp float;
        #define PI 3.14159265359
        varying float vBrightness;
        varying float vTemperature;
        varying vec2 vPosition;
        varying float vSize;
        uniform vec2 uMousePosition;
        uniform float uHoverRadius;
        uniform float uTime;
  
        vec3 starColor(float temp) {
          // Cool blue color palette
          vec3 coolColor = vec3(0.4, 0.6, 1.0);   // Deep blue
          vec3 midColor = vec3(0.7, 0.8, 1.0);      // Ice blue
          vec3 hotColor = vec3(1.0, 1.0, 1.0);      // White
  
          vec3 color = mix(coolColor, midColor, smoothstep(0.0, 0.5, temp));
          color = mix(color, hotColor, smoothstep(0.5, 1.0, temp));
  
          // Add blue tint to all stars
          color *= vec3(0.9, 0.95, 1.1);
          return color;
        }
  
        float sharpStar(vec2 uv, float spikes) {
          float angle = atan(uv.y, uv.x);
          float radius = length(uv);
          
          // Create sharp spikes
          float spike = pow(abs(sin(angle * spikes)), 16.0);
          float star = step(0.9, spike * (1.0 - radius));
          
          // Add subtle glow only for small stars
          float glow = smoothstep(0.7, 0.3, radius) * 0.3;
          return mix(star, 1.0, glow * step(vSize, 15.0));
        }
  
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
  
        float coneEffect(vec2 uv, vec2 direction, float sharpness, float maxDistance) {
            // Calculate angle between UV position and direction
            float angle = dot(normalize(uv), normalize(direction));
            float cone = smoothstep(0.85, 0.95, pow(abs(angle), sharpness));
            float distanceFade = 1.0 - smoothstep(0.0, maxDistance, length(uv));
            return cone * distanceFade;
        }
  
        void main() {
            vec2 uv = 2.0 * gl_PointCoord - 1.0;
            
            // Base directions relative to star center
            float rotationAngle = uTime * 0.5; // Unified rotation for all stars
            mat2 rotation = mat2(cos(rotationAngle), -sin(rotationAngle),
                                sin(rotationAngle), cos(rotationAngle));
            
            // Cardinal directions (rotating)
            vec2 dirRight = rotation * vec2(1, 0);
            vec2 dirUp = rotation * vec2(0, 1);
            vec2 dirLeft = rotation * vec2(-1, 0);
            vec2 dirDown = rotation * vec2(0, -1);
            
            // Diagonal directions (45° between cardinals)
            vec2 dirUR = normalize(vec2(1, 1)) * rotation;
            vec2 dirUL = normalize(vec2(-1, 1)) * rotation;
            vec2 dirDR = normalize(vec2(1, -1)) * rotation;
            vec2 dirDL = normalize(vec2(-1, -1)) * rotation;
  
            // Create main star shape
            float spikeCount = mix(6.0, 10.0, smoothstep(10.0, 30.0, vSize));
            float starShape = sharpStar(uv, spikeCount);
            
            // Main cones (cardinal directions, full length)
            float coneIntensity = 0.7 + 0.3 * sin(uTime * 2.0);
            float cone1 = coneEffect(uv, dirRight, 128.0, 1.0) * coneIntensity;
            float cone2 = coneEffect(uv, dirUp, 128.0, 1.0) * coneIntensity;
            float cone3 = coneEffect(uv, dirLeft, 128.0, 1.0) * coneIntensity;
            float cone4 = coneEffect(uv, dirDown, 128.0, 1.0) * coneIntensity;
            
            // Secondary cones (diagonal directions, half length)
            float cone5 = coneEffect(uv, dirUR, 256.0, 0.5) * coneIntensity * 0.6;
            float cone6 = coneEffect(uv, dirUL, 256.0, 0.5) * coneIntensity * 0.6;
            float cone7 = coneEffect(uv, dirDR, 256.0, 0.5) * coneIntensity * 0.6;
            float cone8 = coneEffect(uv, dirDL, 256.0, 0.5) * coneIntensity * 0.6;
            
            // Combine effects
            vec3 color = starColor(vTemperature) * vBrightness;
            color += color * (cone1 + cone2 + cone3 + cone4) * 1.0;
            color += color * (cone5 + cone6 + cone7 + cone8) * 0.8;
            
            // Mouse interaction
            float mouseDist = length(vPosition - uMousePosition);
            float hover = smoothstep(uHoverRadius, 0.0, mouseDist);
            color = mix(color, color * 1.5, hover);
            
            // Alpha calculation
            float alpha = starShape + 
                (cone1 + cone2 + cone3 + cone4) * 0.15 +
                (cone5 + cone6 + cone7 + cone8) * 0.1;
            alpha = clamp(alpha, 0.0, 1.0);
            
            // Edge sharpening for large stars
            if(vSize > 15.0) {
                alpha *= step(0.7, 1.0 - length(uv));
            }
            
            gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);

    // Add stars and gas clouds
    cloudMeshes.forEach(cloud => scene.add(cloud));

    return points;
  }
  
  function animate() {
    frameId = requestAnimationFrame(animate);
    updateStarEffects();
    updateNebulae();
    render();
  }
  
  function updateStarEffects() {
    if (!scene) return; // Add this line to prevent null access

    const t = performance.now() / 1000;
    scene.children.forEach(obj => {
      if (obj.material && obj.material.uniforms?.uTime) {
        obj.material.uniforms.uTime.value = t;
      }
    });
  }

  
  function initThreeJs() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    
    renderer = new THREE.WebGLRenderer({ 
      canvas: canvas.value,
      antialias: true
    });
    
    const starField = createStarField();
    scene.add(starField);
  

    galaxyStars = createGalaxy();
    galaxyStars.visible = showGalaxy;
    scene.add(galaxyStars);
    mouse = new THREE.Vector2();
  }
  
  function handleResize() {
    if (!renderer || !camera) return;
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }
  
  function render() {
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
  }

  function createGalaxy() {
    const arms = 5;
    const armOffsetMax = 0.5;
    const twist = 1.8;
    const maxRadius = 0.9;
    const totalStars = 3000;

    const positions = [];
    const sizes = [];
    const brightness = [];
    const temperatures = [];

    for (let i = 0; i < totalStars; i++) {
      const arm = i % arms;
      const armOffset = (Math.random() - 0.5) * armOffsetMax;

      const radius = Math.pow(Math.random(), 1.5) * maxRadius;
      const angle = (arm / arms) * 2 * Math.PI + radius * twist + armOffset;

      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.05;
      const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.05;

      positions.push(x, y, -0.15);
      sizes.push(Math.random() * 3 + 1);
      brightness.push(Math.random() * 0.5 + 0.5);
      temperatures.push(Math.pow(Math.random(), 2));
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('brightness', new THREE.Float32BufferAttribute(brightness, 1));
    geometry.setAttribute('temperature', new THREE.Float32BufferAttribute(temperatures, 1));

    const material = scene.children[0].material.clone();
    return new THREE.Points(geometry, material);
  }

  function createNebulae() {
    const clusters = Array(75).fill().map(() => ({
      position: [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2],
      size: Math.random() * 0.4 + 0.2,
      starCount: Math.floor(Math.random() * 150 + 50)
    }));

    const positions = [];
    const sizes = [];
    const brightness = [];
    const temperatures = [];
    const cloudMeshes = [];

    const cloudTexture = createNebulaCloudTexture();

    clusters.forEach(cluster => {
      const baseSize = cluster.size * 23;

      for (let i = 0; i < cluster.starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.pow(Math.random(), 2) * cluster.size;
        const x = cluster.position[0] + Math.cos(angle) * distance;
        const y = cluster.position[1] + Math.sin(angle) * distance;

        const size = baseSize * Math.pow(Math.random(), 3) * (0.5 + Math.random());
        const isLarge = Math.random() < 0.1;
        const finalSize = isLarge ? size * 2 : size;

        const bright = 0.3 + Math.random() * 0.7;
        const temp = Math.pow(Math.random(), 1.8);

        positions.push(x, y, Math.random() < 0.5 ? 0 : -0.1);
        sizes.push(finalSize);
        brightness.push(bright);
        temperatures.push(temp);
      }

      const SHO_COLORS = [
        new THREE.Color(0x0a0a1f), // deep void (almost black)
        new THREE.Color(0x111133), // dark blue-violet
        new THREE.Color(0x1a2b55), // rich shadowed blue
        new THREE.Color(0x2c4a7f), // dark nebula blue
        new THREE.Color(0x4a4a88), // dusty purple-blue
      ];




      // Pick 1 or 2 colors and mix
      const baseColor = SHO_COLORS[Math.floor(Math.random() * SHO_COLORS.length)];
      const hsl = baseColor.getHSL({}); // Get base color's HSL values

      // Create complementary mix color
      const mixColor = new THREE.Color().setHSL(
        hsl.h, // stick to original hue for clarity
        hsl.s * (0.8 + Math.random() * 0.2), // slight saturation change
        hsl.l * (0.4 + Math.random() * 0.3)  // keep it dark and mysterious
      );

      // More controlled mixing
      const mixedColor = baseColor.clone().lerp(
        mixColor, 
        0.3 + Math.random() * 0.5 // Keep mix between 30-80%
      );

      // 🌫️ Add gas cloud
      const cloudMaterial = new THREE.SpriteMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.3, // Reduced base opacity
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
        color: mixedColor
      });

      const sprite = new THREE.Sprite(cloudMaterial);
      sprite.position.set(cluster.position[0], cluster.position[1], -0.25);
      sprite.scale.set(cluster.size * 3.5, cluster.size * 3.5, 1.0);

      cloudMeshes.push(sprite);
    });

    return { positions, sizes, brightness, temperatures, cloudMeshes };
  }

  function updateNebulae() {
    const t = performance.now() / 1000;
    cloudMeshes.forEach((cloud, index) => {
      cloud.position.x += Math.sin(t + index) * 0.0002;
      cloud.position.y += Math.cos(t * 0.8 + index) * 0.00015;
      cloud.rotation.z += 0.0001;
      cloud.material.opacity = 0.3 + Math.sin(t * 0.5 + index) * 0.1;
    });
  }

  function createNebulaCloudTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(100,150,255,0.2)');
    gradient.addColorStop(1, 'rgba(0,0,50,0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }


  </script>
  
  <style scoped>
  canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  </style>