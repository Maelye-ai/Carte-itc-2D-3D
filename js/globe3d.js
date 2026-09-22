/**
 * MOTEUR 3D DU GLOBE TERRESTRE (STYLE GOOGLE EARTH / GOOGLE MAPS 3D)
 * LAGUNES EXPLORATION AFRIQUE (LEA)
 */

class LEAGlobe3D {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) throw new Error(`Conteneur #${containerId} introuvable.`);

    this.options = Object.assign({
      radius: 10,
      initialLat: 7.54,
      initialLon: -5.55,
      initialDistance: 23,
      minDistance: 11.5,
      maxDistance: 45,
      autoRotateSpeed: 0.0012,
      onSiteSelect: null,
      onCameraMove: null
    }, options);

    this.R = this.options.radius;
    this.sites = window.LEA_DATA ? window.LEA_DATA.sites : [];
    this.markers = [];
    this.pulseRings = [];
    this.isUserInteracting = false;
    this.autoRotate = true;
    this.idleTimer = null;
    this.isTransitioning = false;

    // Interaction state
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.hoveredMarker = null;

    // Camera spherical parameters
    this.spherical = {
      radius: this.options.initialDistance,
      theta: 0,
      phi: Math.PI / 2.2
    };

    this.init();
  }

  init() {
    this.setupScene();
    this.setupLights();
    this.setupStars();
    this.setupEarth();
    this.setupAtmosphere();
    this.setupIvoryCoastContour();
    this.setupMarkers();
    this.setupEvents();
    this.focusOnIvoryCoast(false);
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050914, 0.012);

    const width = this.container.clientWidth || window.innerWidth || 800;
    const height = this.container.clientHeight || window.innerHeight || 600;

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, this.options.initialDistance);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    if (this.renderer.outputEncoding) {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }

    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";

    this.container.appendChild(this.renderer.domElement);
    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfff8ee, 1.3);
    this.sunLight.position.set(25, 12, 20);
    this.scene.add(this.sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.45);
    rimLight.position.set(-20, -10, -15);
    this.scene.add(rimLight);
  }

  setupStars() {
    const starGeom = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 80 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const variant = Math.random();
      if (variant > 0.8) {
        colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 1.0;
      } else if (variant > 0.6) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 0.6;
      } else {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0;
      }
    }

    starGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    const starField = new THREE.Points(starGeom, starMat);
    this.scene.add(starField);
  }

  // Crée un canvas procédural comme texture de base immédiate
  createProceduralEarthCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Océans profonds
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, "#0c1d36");
    grad.addColorStop(0.5, "#142c4f");
    grad.addColorStop(1, "#0c1d36");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Grille de latitude / longitude subtile
    ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= 1024; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Équateur en doré subtil
    ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(1024, 256);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  setupEarth() {
    const loader = new THREE.TextureLoader();

    // Textures Base64 embarquées (100% fiables, zéro erreur CORS, fonctionnent en file:// et http://)
    const dayTexUrl = (window.LEA_TEXTURES && window.LEA_TEXTURES.earthDay)
      ? window.LEA_TEXTURES.earthDay
      : "assets/textures/earth_atmos_2048.jpg";

    const cloudsTexUrl = (window.LEA_TEXTURES && window.LEA_TEXTURES.clouds)
      ? window.LEA_TEXTURES.clouds
      : "assets/textures/earth_clouds_1024.png";

    const earthGeometry = new THREE.SphereGeometry(this.R, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: new THREE.Color(0x223344),
      shininess: 15
    });

    loader.load(dayTexUrl, (tex) => {
      if (this.renderer.outputEncoding) tex.encoding = THREE.sRGBEncoding;
      earthMaterial.map = tex;
      earthMaterial.needsUpdate = true;
    });

    this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    this.globeGroup.add(this.earthMesh);

    // Couche de nuages dynamiques
    const cloudGeometry = new THREE.SphereGeometry(this.R * 1.009, 64, 64);
    const cloudMaterial = new THREE.MeshLambertMaterial({
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    });

    loader.load(cloudsTexUrl, (tex) => {
      cloudMaterial.map = tex;
      cloudMaterial.needsUpdate = true;
    });

    this.cloudsMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.globeGroup.add(this.cloudsMesh);
  }

  setupAtmosphere() {
    const atmosphereGeom = new THREE.SphereGeometry(this.R * 1.07, 48, 48);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float dotVal = dot(vNormal, vec3(0.0, 0.0, 1.0));
          float intensity = pow(max(0.0, 0.65 - dotVal), 2.0);
          gl_FragColor = vec4(0.25, 0.65, 1.0, 1.0) * intensity * 0.85;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });

    const atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMat);
    this.globeGroup.add(atmosphere);
  }

  setupIvoryCoastContour() {
    if (!window.LEA_DATA || !window.LEA_DATA.ivoryCoastBounds) return;
    const poly = window.LEA_DATA.ivoryCoastBounds.polygon;
    const points = [];

    for (let i = 0; i < poly.length; i++) {
      const [lon, lat] = poly[i];
      const vec = this.latLonToVector3(lat, lon, this.R * 1.005);
      points.push(vec);
    }

    const curve = new THREE.CatmullRomCurve3(points, true);
    const lineGeom = new THREE.BufferGeometry().setFromPoints(curve.getPoints(120));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xe8c85a,
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    });

    const borderLine = new THREE.Line(lineGeom, lineMat);
    this.globeGroup.add(borderLine);

    // Disque lumineux sous la Côte d'Ivoire
    const centerVec = this.latLonToVector3(7.54, -5.55, this.R * 1.002);
    const glowGeom = new THREE.CircleGeometry(0.85, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const zoneGlow = new THREE.Mesh(glowGeom, glowMat);
    zoneGlow.position.copy(centerVec);
    zoneGlow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), centerVec.clone().normalize());
    this.globeGroup.add(zoneGlow);
  }

  setupMarkers() {
    const statusColors = {
      ok: { main: 0x10b981, hex: "#10b981", glow: 0x34d399 },
      wip: { main: 0xd4af37, hex: "#d4af37", glow: 0xfde047 },
      todo: { main: 0x38bdf8, hex: "#38bdf8", glow: 0x7dd3fc }
    };

    this.sites.forEach(site => {
      const pos = this.latLonToVector3(site.lat, site.lon, this.R);
      const normal = pos.clone().normalize();
      const col = statusColors[site.status] || statusColors.wip;

      const markerGroup = new THREE.Group();
      markerGroup.userData = { site: site };

      // Pilier vertical lumineux
      const stemHeight = 0.85;
      const stemGeom = new THREE.CylinderGeometry(0.025, 0.045, stemHeight, 16);
      stemGeom.translate(0, stemHeight / 2, 0);
      const stemMat = new THREE.MeshStandardMaterial({
        color: col.main,
        roughness: 0.3,
        metalness: 0.7,
        emissive: col.main,
        emissiveIntensity: 0.4
      });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      stem.position.copy(pos);
      markerGroup.add(stem);

      // Balise sphérique sommet
      const headRadius = 0.14;
      const headGeom = new THREE.SphereGeometry(headRadius, 20, 20);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: col.main,
        emissiveIntensity: 0.85,
        roughness: 0.2,
        metalness: 0.8
      });
      const headMesh = new THREE.Mesh(headGeom, headMat);
      const headPos = pos.clone().add(normal.clone().multiplyScalar(stemHeight));
      headMesh.position.copy(headPos);
      headMesh.userData = { isHead: true, site: site };
      markerGroup.add(headMesh);

      // Anneau halo au sommet
      const haloGeom = new THREE.RingGeometry(0.18, 0.26, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: col.glow,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const haloMesh = new THREE.Mesh(haloGeom, haloMat);
      haloMesh.position.copy(headPos);
      haloMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      markerGroup.add(haloMesh);

      // Onde radar pulsante au sol
      const ringGeom = new THREE.RingGeometry(0.08, 0.28, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: col.main,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });
      const baseRing = new THREE.Mesh(ringGeom, ringMat);
      baseRing.position.copy(pos.clone().add(normal.clone().multiplyScalar(0.02)));
      baseRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      markerGroup.add(baseRing);

      this.pulseRings.push({
        mesh: baseRing,
        maxScale: 2.4,
        scale: 1.0,
        speed: 0.015 + Math.random() * 0.005
      });

      this.globeGroup.add(markerGroup);
      this.markers.push({
        group: markerGroup,
        head: headMesh,
        stem: stem,
        halo: haloMesh,
        site: site,
        position: pos,
        headPosition: headPos
      });
    });
  }

  latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  setupEvents() {
    let isMouseDown = false;
    let isRightClick = false;
    let prevMouse = { x: 0, y: 0 };
    let totalDrag = 0;

    const onPointerDown = (e) => {
      isMouseDown = true;
      isRightClick = (e.button === 2);
      this.autoRotate = false;
      this.isUserInteracting = true;
      clearTimeout(this.idleTimer);
      totalDrag = 0;
      prevMouse = { x: e.clientX, y: e.clientY };
      this.container.style.cursor = isRightClick ? "ns-resize" : "grabbing";
    };

    const onPointerMove = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (!isMouseDown) {
        this.checkMarkerHover();
        return;
      }

      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      totalDrag += Math.abs(dx) + Math.abs(dy);

      if (isRightClick) {
        this.spherical.phi -= dy * 0.006;
        this.spherical.phi = Math.max(0.15, Math.min(Math.PI / 2.05, this.spherical.phi));
      } else {
        this.globeGroup.rotation.y += dx * 0.004;
        this.globeGroup.rotation.x += dy * 0.004;
        this.globeGroup.rotation.x = Math.max(-1.3, Math.min(1.3, this.globeGroup.rotation.x));
      }

      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e) => {
      if (isMouseDown && totalDrag < 6) {
        this.handleMarkerClick(e);
      }
      isMouseDown = false;
      this.container.style.cursor = "grab";
      this.idleTimer = setTimeout(() => {
        this.autoRotate = true;
        this.isUserInteracting = false;
      }, 4500);
    };

    const onWheel = (e) => {
      e.preventDefault();
      clearTimeout(this.idleTimer);
      this.autoRotate = false;

      const zoomFactor = e.deltaY * 0.015;
      this.camera.position.z = Math.max(
        this.options.minDistance,
        Math.min(this.options.maxDistance, this.camera.position.z + zoomFactor)
      );

      this.idleTimer = setTimeout(() => {
        this.autoRotate = true;
      }, 4000);
    };

    this.container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    this.container.addEventListener("wheel", onWheel, { passive: false });
    this.container.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("resize", () => this.onWindowResize());
  }

  checkMarkerHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const heads = this.markers.map(m => m.head);
    const hits = this.raycaster.intersectObjects(heads, true);

    if (hits.length > 0) {
      const marker = this.markers.find(m => m.head === hits[0].object);
      if (marker && this.hoveredMarker !== marker) {
        if (this.hoveredMarker) this.resetMarkerScale(this.hoveredMarker);
        this.hoveredMarker = marker;
        marker.head.scale.set(1.4, 1.4, 1.4);
        marker.halo.scale.set(1.3, 1.3, 1.3);
        this.container.style.cursor = "pointer";
        this.show3DTooltip(marker.site, hits[0].point);
      }
    } else {
      if (this.hoveredMarker) {
        this.resetMarkerScale(this.hoveredMarker);
        this.hoveredMarker = null;
        this.container.style.cursor = "grab";
        this.hide3DTooltip();
      }
    }
  }

  resetMarkerScale(marker) {
    marker.head.scale.set(1, 1, 1);
    marker.halo.scale.set(1, 1, 1);
  }

  handleMarkerClick(e) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const heads = this.markers.map(m => m.head);
    const hits = this.raycaster.intersectObjects(heads, true);

    if (hits.length > 0) {
      const marker = this.markers.find(m => m.head === hits[0].object);
      if (marker) {
        this.flyToSite(marker.site);
        if (typeof this.options.onSiteSelect === "function") {
          this.options.onSiteSelect(marker.site);
        }
      }
    }
  }

  show3DTooltip(site, point3d) {
    let tooltip = document.getElementById("globe-3d-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "globe-3d-tooltip";
      tooltip.className = "globe-tooltip";
      this.container.appendChild(tooltip);
    }

    const screenPos = this.toScreenPosition(point3d);
    tooltip.innerHTML = `
      <div class="tooltip-title">${site.name}</div>
      <div class="tooltip-region">${site.region}</div>
      <div class="tooltip-meta">
        <span class="tooltip-mineral">${site.mineralPrimary}</span>
        <span class="tooltip-status status-${site.status}">${site.statusLabel}</span>
      </div>
    `;

    tooltip.style.left = `${screenPos.x + 12}px`;
    tooltip.style.top = `${screenPos.y - 20}px`;
    tooltip.classList.add("visible");
  }

  hide3DTooltip() {
    const tooltip = document.getElementById("globe-3d-tooltip");
    if (tooltip) tooltip.classList.remove("visible");
  }

  toScreenPosition(vector3) {
    const vector = vector3.clone().project(this.camera);
    const widthHalf = this.container.clientWidth / 2;
    const heightHalf = this.container.clientHeight / 2;
    return {
      x: (vector.x * widthHalf) + widthHalf,
      y: -(vector.y * heightHalf) + heightHalf
    };
  }

  flyToSite(site, duration = 1800) {
    this.autoRotate = false;
    clearTimeout(this.idleTimer);
    this.isTransitioning = true;

    const phi = (90 - site.lat) * (Math.PI / 180);
    const theta = (site.lon + 180) * (Math.PI / 180);

    const targetRotY = -theta + Math.PI / 2;
    const targetRotX = Math.PI / 2 - phi;

    const startRotX = this.globeGroup.rotation.x;
    const startRotY = this.globeGroup.rotation.y;
    const startDist = this.camera.position.z;
    const targetDist = 13.8;

    let diffY = (targetRotY - startRotY) % (Math.PI * 2);
    if (diffY < -Math.PI) diffY += Math.PI * 2;
    if (diffY > Math.PI) diffY -= Math.PI * 2;

    const startTime = performance.now();

    const animateFly = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.globeGroup.rotation.x = startRotX + (targetRotX - startRotX) * ease;
      this.globeGroup.rotation.y = startRotY + diffY * ease;

      const arc = Math.sin(t * Math.PI) * 2.2;
      this.camera.position.z = startDist + (targetDist - startDist) * ease + arc;

      if (t < 1) {
        requestAnimationFrame(animateFly);
      } else {
        this.isTransitioning = false;
        this.idleTimer = setTimeout(() => {
          this.autoRotate = true;
        }, 5000);
      }
    };

    requestAnimationFrame(animateFly);
  }

  focusOnIvoryCoast(smooth = true) {
    const ciSite = { lat: 7.54, lon: -5.55 };
    if (smooth) {
      this.flyToSite(ciSite, 1600);
    } else {
      const phi = (90 - ciSite.lat) * (Math.PI / 180);
      const theta = (ciSite.lon + 180) * (Math.PI / 180);
      this.globeGroup.rotation.y = -theta + Math.PI / 2;
      this.globeGroup.rotation.x = Math.PI / 2 - phi;
      this.camera.position.z = 21.5;
    }
  }

  startGuidedTour(onTourStep) {
    if (!this.sites || this.sites.length === 0) return;
    let currentIndex = 0;

    const nextStep = () => {
      const site = this.sites[currentIndex];
      this.flyToSite(site, 2000);
      if (typeof onTourStep === "function") {
        onTourStep(site, currentIndex, this.sites.length);
      }
      currentIndex = (currentIndex + 1) % this.sites.length;
    };

    nextStep();
    this.tourInterval = setInterval(nextStep, 6500);
  }

  stopGuidedTour() {
    if (this.tourInterval) {
      clearInterval(this.tourInterval);
      this.tourInterval = null;
    }
  }

  onWindowResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.autoRotate && !this.isTransitioning) {
      this.globeGroup.rotation.y += this.options.autoRotateSpeed;
      if (this.cloudsMesh) {
        this.cloudsMesh.rotation.y += this.options.autoRotateSpeed * 1.35;
      }
    }

    this.pulseRings.forEach(ring => {
      ring.scale += ring.speed;
      if (ring.scale > ring.maxScale) {
        ring.scale = 1.0;
      }
      ring.mesh.scale.set(ring.scale, ring.scale, ring.scale);
      ring.mesh.material.opacity = Math.max(0, 0.85 * (1 - (ring.scale - 1) / (ring.maxScale - 1)));
    });

    this.renderer.render(this.scene, this.camera);
  }
}

if (typeof window !== "undefined") {
  window.LEAGlobe3D = LEAGlobe3D;
}
