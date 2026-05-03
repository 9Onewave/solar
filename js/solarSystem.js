/* ============================================================
   solarSystem.js — Interactive 3D Solar System (Three.js)
   ============================================================ */

const SolarSystem = (() => {

  const PLANET_DATA = [
    {
      name: 'Mercury', radius: 0.38, distance: 7, speed: 4.74, color: '#b5b5b5',
      tilt: 0.034, tag: 'PLANET',
      stats: [
        { lbl: 'DIAMETER', val: '4,879 km' }, { lbl: 'DISTANCE FROM SUN', val: '57.9M km' },
        { lbl: 'ORBIT PERIOD', val: '88 days' }, { lbl: 'SURFACE TEMP', val: '-180°C to 430°C' },
      ],
      desc: 'The smallest planet in our solar system and the closest to the Sun. Mercury has no atmosphere to retain heat.'
    },
    {
      name: 'Venus', radius: 0.95, distance: 11, speed: 3.50, color: '#e8c97a',
      tilt: 177.4, tag: 'PLANET',
      stats: [
        { lbl: 'DIAMETER', val: '12,104 km' }, { lbl: 'DISTANCE FROM SUN', val: '108.2M km' },
        { lbl: 'ORBIT PERIOD', val: '225 days' }, { lbl: 'SURFACE TEMP', val: '465°C avg' },
      ],
      desc: 'The hottest planet with a crushing atmosphere of CO₂. Rotates backwards compared to most planets.'
    },
    {
      name: 'Earth', radius: 1.0, distance: 15, speed: 2.98, color: '#4a9ade',
      tilt: 23.5, tag: 'PLANET',
      stats: [
        { lbl: 'DIAMETER', val: '12,742 km' }, { lbl: 'DISTANCE FROM SUN', val: '149.6M km' },
        { lbl: 'ORBIT PERIOD', val: '365.25 days' }, { lbl: 'SURFACE TEMP', val: '15°C avg' },
      ],
      desc: 'Our home. The only known planet to harbour life, with liquid water oceans covering 71% of its surface.'
    },
    {
      name: 'Mars', radius: 0.53, distance: 20, speed: 2.41, color: '#c1440e',
      tilt: 25.2, tag: 'PLANET',
      stats: [
        { lbl: 'DIAMETER', val: '6,779 km' }, { lbl: 'DISTANCE FROM SUN', val: '227.9M km' },
        { lbl: 'ORBIT PERIOD', val: '687 days' }, { lbl: 'SURFACE TEMP', val: '-125°C to 20°C' },
      ],
      desc: 'The Red Planet. Home to Olympus Mons — the tallest volcano in the solar system at 22 km high.'
    },
    {
      name: 'Jupiter', radius: 3.2, distance: 32, speed: 1.31, color: '#c9a96e',
      tilt: 3.1, tag: 'GAS GIANT',
      stats: [
        { lbl: 'DIAMETER', val: '139,820 km' }, { lbl: 'DISTANCE FROM SUN', val: '778.5M km' },
        { lbl: 'ORBIT PERIOD', val: '11.9 years' }, { lbl: 'KNOWN MOONS', val: '95' },
      ],
      desc: 'The largest planet — so massive it could fit all others inside it. Its Great Red Spot is a storm older than 350 years.'
    },
    {
      name: 'Saturn', radius: 2.7, distance: 45, speed: 0.97, color: '#e4d191',
      tilt: 26.7, tag: 'GAS GIANT', hasRings: true,
      stats: [
        { lbl: 'DIAMETER', val: '116,460 km' }, { lbl: 'DISTANCE FROM SUN', val: '1.43B km' },
        { lbl: 'ORBIT PERIOD', val: '29.5 years' }, { lbl: 'RING WIDTH', val: '282,000 km' },
      ],
      desc: 'Famous for its stunning ring system made of ice and rock. Saturn is so light it could float on water.'
    },
    {
      name: 'Uranus', radius: 1.8, distance: 57, speed: 0.68, color: '#7de8e8',
      tilt: 97.8, tag: 'ICE GIANT',
      stats: [
        { lbl: 'DIAMETER', val: '50,724 km' }, { lbl: 'DISTANCE FROM SUN', val: '2.87B km' },
        { lbl: 'ORBIT PERIOD', val: '84 years' }, { lbl: 'SURFACE TEMP', val: '-214°C' },
      ],
      desc: 'The tilted planet — its axis is at 98° so it essentially rolls around the Sun on its side.'
    },
    {
      name: 'Neptune', radius: 1.75, distance: 67, speed: 0.54, color: '#4b70dd',
      tilt: 28.3, tag: 'ICE GIANT',
      stats: [
        { lbl: 'DIAMETER', val: '49,244 km' }, { lbl: 'DISTANCE FROM SUN', val: '4.5B km' },
        { lbl: 'ORBIT PERIOD', val: '165 years' }, { lbl: 'WIND SPEED', val: '2,100 km/h' },
      ],
      desc: 'The windiest planet. Neptune has the fastest winds in the solar system and takes 165 years to orbit the Sun.'
    },
  ];

  let scene, camera, renderer, raycaster, mouse;
  let planets = [], orbitLines = [];
  let isDragging = false, prevMouse = { x: 0, y: 0 };
  let targetRotY = 0, rotY = 0, rotX = -0.3, targetRotX = -0.3;
  let zoom = 1, targetZoom = 1;
  let time = 0;
  let sunMesh, sunGlow;
  let stars;
  let canvas, width, height;

  function init() {
    canvas = document.getElementById('solar-canvas');
    width = canvas.clientWidth;
    height = canvas.clientHeight;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000);
    camera.position.set(0, 40, 120);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    buildScene();
    buildStars();
    addLights();
    addEvents();
    animate();
  }

  function buildScene() {
    // Sun
    const sunGeo = new THREE.SphereGeometry(4, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff0a0 });
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Sun glow
    const glowGeo = new THREE.SphereGeometry(5.5, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff9a00, transparent: true, opacity: 0.12, side: THREE.BackSide
    });
    sunGlow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(sunGlow);

    // Sun corona
    const coronaGeo = new THREE.SphereGeometry(7, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xff6600, transparent: true, opacity: 0.05, side: THREE.BackSide
    });
    scene.add(new THREE.Mesh(coronaGeo, coronaMat));

    // Planets
    PLANET_DATA.forEach((p, i) => {
      const geo = new THREE.SphereGeometry(p.radius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: p.color,
        roughness: 0.8,
        metalness: 0.1
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { ...p, index: i, angle: Math.random() * Math.PI * 2 };
      mesh.castShadow = true;
      scene.add(mesh);

      // Saturn rings
      if (p.hasRings) {
        const ringGeo = new THREE.RingGeometry(p.radius * 1.4, p.radius * 2.4, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xe4d191, side: THREE.DoubleSide, transparent: true, opacity: 0.55
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.5;
        mesh.add(ring);
      }

      // Orbit line
      const orbitGeo = buildOrbitLine(p.distance);
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.06
      });
      const orbit = new THREE.LineLoop(orbitGeo, orbitMat);
      scene.add(orbit);
      orbitLines.push(orbit);

      planets.push(mesh);
    });
  }

  function buildOrbitLine(r) {
    const pts = [];
    const seg = 128;
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return geo;
  }

  function buildStars() {
    const count = 6000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 400 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);
      sizes[i] = Math.random() * 1.5 + 0.3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.5, transparent: true, opacity: 0.85,
      sizeAttenuation: true
    });
    stars = new THREE.Points(geo, mat);
    scene.add(stars);
  }

  function addLights() {
    const ambient = new THREE.AmbientLight(0x111122, 1.2);
    scene.add(ambient);
    const sunLight = new THREE.PointLight(0xfff0d0, 2.5, 600);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
  }

  function addEvents() {
    canvas.addEventListener('mousedown', e => {
      isDragging = false;
      prevMouse = { x: e.clientX, y: e.clientY };
      canvas.addEventListener('mousemove', onDrag);
    });
    window.addEventListener('mouseup', e => {
      canvas.removeEventListener('mousemove', onDrag);
    });
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('resize', onResize);

    // Touch support
    canvas.addEventListener('touchstart', e => {
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isDragging = false;
    });
    canvas.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - prevMouse.x;
      const dy = e.touches[0].clientY - prevMouse.y;
      targetRotY += dx * 0.008;
      targetRotX += dy * 0.008;
      targetRotX = Math.max(-1, Math.min(0.5, targetRotX));
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isDragging = true;
    });
  }

  function onDrag(e) {
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) isDragging = true;
    targetRotY += dx * 0.005;
    targetRotX += dy * 0.005;
    targetRotX = Math.max(-1, Math.min(0.5, targetRotX));
    prevMouse = { x: e.clientX, y: e.clientY };
  }

  function onWheel(e) {
    targetZoom = Math.max(0.3, Math.min(3.5, targetZoom + e.deltaY * 0.001));
  }

  function onClick(e) {
    if (isDragging) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(planets);
    if (hits.length > 0) {
      openPlanetPanel(hits[0].object.userData);
    } else {
      const sunHits = raycaster.intersectObject(sunMesh);
      if (sunHits.length > 0) openSunPanel();
    }
  }

  function onResize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);
    time += 0.002;

    // Smooth camera rotation
    rotY += (targetRotY - rotY) * 0.05;
    rotX += (targetRotX - rotX) * 0.05;
    zoom += (targetZoom - zoom) * 0.05;

    // Reposition camera based on rotation
    const baseR = 120 / zoom;
    camera.position.x = Math.sin(rotY) * Math.cos(rotX) * baseR;
    camera.position.y = Math.sin(rotX) * baseR;
    camera.position.z = Math.cos(rotY) * Math.cos(rotX) * baseR;
    camera.lookAt(0, 0, 0);

    // Sun pulse
    const s = 1 + Math.sin(time * 2) * 0.02;
    sunGlow.scale.setScalar(s);

    // Orbit planets
    planets.forEach((mesh, i) => {
      const d = PLANET_DATA[i];
      mesh.userData.angle = (mesh.userData.angle || 0) + d.speed * 0.0003;
      const a = mesh.userData.angle;
      mesh.position.x = Math.cos(a) * d.distance;
      mesh.position.z = Math.sin(a) * d.distance;
      mesh.rotation.y += 0.005;
    });

    // Stars slow drift
    stars.rotation.y = time * 0.0003;

    renderer.render(scene, camera);
  }

  function openPlanetPanel(data) {
    document.getElementById('planet-panel').classList.remove('hidden');
    document.getElementById('panel-tag').textContent = data.tag || 'PLANET';
    document.getElementById('panel-name').textContent = data.name;
    document.getElementById('panel-desc').textContent = data.desc;

    const statsEl = document.getElementById('panel-stats');
    statsEl.innerHTML = (data.stats || []).map(s =>
      `<div class="stat-row"><span class="stat-lbl">${s.lbl}</span><span class="stat-val">${s.val}</span></div>`
    ).join('');
  }

  function openSunPanel() {
    document.getElementById('planet-panel').classList.remove('hidden');
    document.getElementById('panel-tag').textContent = 'STAR';
    document.getElementById('panel-name').textContent = 'The Sun';
    document.getElementById('panel-desc').textContent = 'Our host star — a G-type main-sequence star containing 99.86% of the total mass of the solar system. Surface temperature: 5,500°C.';
    document.getElementById('panel-stats').innerHTML = `
      <div class="stat-row"><span class="stat-lbl">DIAMETER</span><span class="stat-val">1,392,700 km</span></div>
      <div class="stat-row"><span class="stat-lbl">AGE</span><span class="stat-val">4.6 billion yrs</span></div>
      <div class="stat-row"><span class="stat-lbl">SURFACE TEMP</span><span class="stat-val">5,500°C</span></div>
      <div class="stat-row"><span class="stat-lbl">CORE TEMP</span><span class="stat-val">15,000,000°C</span></div>
    `;
  }

  window.closePanel = () => {
    document.getElementById('planet-panel').classList.add('hidden');
  };

  // Expose planet data for search
  window.COSMOS_PLANETS = PLANET_DATA;

  return { init };
})();