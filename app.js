/* ============ Tweaks ============ */
(function tweaks(){
  const state = { ...window.TWEAKS };
  const body = document.body;
  const apply = () => {
    body.setAttribute('data-palette', state.palette || 'observatory');
    body.setAttribute('data-hero', state.hero || 'earth');
    body.setAttribute('data-mode', state.mode || 'dark');
    document.querySelectorAll('#tweaks-panel .tw-opts').forEach(g => {
      const key = g.dataset.key;
      g.querySelectorAll('button').forEach(b => {
        b.classList.toggle('is-on', b.dataset.val === state[key]);
      });
    });
    // restart hero canvases on hero switch
    if (window.__restartHeroes) window.__restartHeroes();
  };
  apply();

  const panel = document.getElementById('tweaks-panel');
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === '__activate_edit_mode') { panel.hidden = false; }
    if (e.data.type === '__deactivate_edit_mode') { panel.hidden = true; }
  });
  try { window.parent.postMessage({type:'__edit_mode_available'}, '*'); } catch(_){}

  document.getElementById('tw-close')?.addEventListener('click', () => {
    panel.hidden = true;
    try { window.parent.postMessage({type:'__edit_mode_deactivate'}, '*'); } catch(_){}
  });
  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-val]'); if (!btn) return;
    const key = btn.parentElement.dataset.key;
    state[key] = btn.dataset.val;
    apply();
    try { window.parent.postMessage({type:'__edit_mode_set_keys', edits: { [key]: state[key] }}, '*'); } catch(_){}
  });
})();

/* ============ Progress rail ============ */
(function progress(){
  const fill = document.getElementById('progress-fill');
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, (h.scrollHeight - h.clientHeight));
    fill.style.width = (p * 100).toFixed(2) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============ Number counters ============ */
(function counters(){
  const nodes = document.querySelectorAll('[data-count-to]');
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const animate = (n) => {
    if (n.dataset.done) return;
    n.dataset.done = '1';
    const target = parseFloat(n.dataset.countTo);
    const dur = parseFloat(n.dataset.countDuration) || 2000;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const v = Math.round(target * easeOut(t));
      n.textContent = v.toLocaleString('en-AU');
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting) animate(e.target); });
  }, { threshold: 0.35 });
  nodes.forEach(n => io.observe(n));
})();

/* ============ Hero canvases ============ */
(function heroCanvases(){
  function startEarth() {
    const c = document.getElementById('hero-earth-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, dpr;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({length: 240}, () => ({
      x: Math.random(), y: Math.random(), s: Math.random() * 1.2 + 0.2, t: Math.random() * Math.PI * 2
    }));

    let raf;
    function draw(t) {
      const cx = w * 0.75, cy = h * 0.55;
      const R = Math.min(w, h) * 0.38;

      ctx.clearRect(0, 0, w, h);
      // bg
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, w, h);

      // stars
      for (const s of stars) {
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.001 + s.t));
        ctx.fillStyle = `rgba(232,236,241,${0.15 + 0.5 * tw})`;
        ctx.fillRect(s.x * w, s.y * h, s.s, s.s);
      }

      // earth disc
      const g = ctx.createRadialGradient(cx - R*0.3, cy - R*0.3, R*0.2, cx, cy, R);
      g.addColorStop(0, '#1b2a3d');
      g.addColorStop(0.7, '#0a1220');
      g.addColorStop(1, '#05070d');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();

      // terminator rim
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      const rim = ctx.createRadialGradient(cx + R*0.1, cy + R*0.1, R*0.7, cx, cy, R*1.0);
      rim.addColorStop(0, 'rgba(0,0,0,0)');
      rim.addColorStop(1, 'rgba(130,180,230,0.18)');
      ctx.fillStyle = rim; ctx.fillRect(cx-R, cy-R, R*2, R*2);
      ctx.restore();

      // orbit rings
      for (let i = 0; i < 3; i++) {
        const rr = R * (1.08 + i * 0.09);
        ctx.strokeStyle = `rgba(232,236,241,${0.12 - i*0.03})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr, rr * 0.22, -0.45, 0, Math.PI * 2);
        ctx.stroke();
      }

      // moving satellites along rings
      for (let i = 0; i < 3; i++) {
        const rr = R * (1.08 + i * 0.09);
        const speed = 0.0002 + i * 0.00008;
        for (let k = 0; k < 6; k++) {
          const a = t * speed + k * (Math.PI * 2 / 6) + i;
          const x = cx + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr * 0.22 * Math.cos(-0.45) - Math.sin(a) * 0 ;
          // rotated ellipse point
          const rot = -0.45;
          const px = cx + Math.cos(a) * rr * Math.cos(rot) - Math.sin(a) * rr * 0.22 * Math.sin(rot);
          const py = cy + Math.cos(a) * rr * Math.sin(rot) + Math.sin(a) * rr * 0.22 * Math.cos(rot);
          ctx.fillStyle = 'rgba(170,210,255,0.9)';
          ctx.fillRect(px - 1, py - 1, 2, 2);
        }
      }

      raf = requestAnimationFrame(draw);
    }
    cancelAnimationFrame(c._raf);
    c._raf = requestAnimationFrame(draw);
    c._stop = () => cancelAnimationFrame(c._raf);
  }

  function startDebris() {
    const c = document.getElementById('hero-debris-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, dpr;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const N = 340;
    const parts = Array.from({length: N}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.2,
      s: Math.pow(Math.random(), 3) * 1.8 + 0.3,
      o: 0.2 + Math.random() * 0.8
    }));

    let raf;
    function draw() {
      ctx.fillStyle = 'rgba(5,7,13,0.35)';
      ctx.fillRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        ctx.fillStyle = `rgba(232,236,241,${p.o})`;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      raf = requestAnimationFrame(draw);
    }
    cancelAnimationFrame(c._raf);
    c._raf = requestAnimationFrame(draw);
    c._stop = () => cancelAnimationFrame(c._raf);
  }

  window.__restartHeroes = () => { startEarth(); startDebris(); };
  startEarth(); startDebris();
})();

/* ============ Orbital shells scrolly ============ */
(function shells(){
  const canvas = document.getElementById('shells-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let active = 'leo';
  const steps = document.querySelectorAll('#scrolly-shells .scrolly-step');
  const legends = document.querySelectorAll('#scrolly-shells .legend-row');

  const stars = Array.from({length: 200}, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.1 + 0.2 }));

  function draw(t) {
    const cx = w / 2, cy = h / 2;
    const earthR = Math.min(w, h) * 0.14;
    const R = { leo: earthR + 22, meo: earthR + 70, geo: earthR + 140 };
    const targets = { leo: 1.0, meo: 1.0, geo: 1.0 };
    const hi = { leo: active==='leo'?1:0.25, meo: active==='meo'?1:0.25, geo: active==='geo'?1:0.25 };

    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    for (const s of stars) {
      ctx.fillStyle = 'rgba(232,236,241,0.35)';
      ctx.fillRect(s.x * w, s.y * h, s.s, s.s);
    }

    // earth
    const g = ctx.createRadialGradient(cx - earthR*0.3, cy - earthR*0.3, earthR*0.2, cx, cy, earthR);
    g.addColorStop(0, '#1b2a3d'); g.addColorStop(1, '#05070d');
    ctx.beginPath(); ctx.arc(cx, cy, earthR, 0, Math.PI*2); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(170,210,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();

    // rings
    ['geo','meo','leo'].forEach(k => {
      ctx.strokeStyle = `rgba(232,236,241,${0.1 * hi[k] + 0.05})`;
      ctx.lineWidth = active === k ? 1.4 : 1;
      ctx.beginPath(); ctx.arc(cx, cy, R[k], 0, Math.PI*2); ctx.stroke();
    });

    // sats per ring
    const counts = { leo: 180, meo: 16, geo: 28 };
    const speeds = { leo: 0.0012, meo: 0.0004, geo: 0.00015 };
    ['leo','meo','geo'].forEach((k, i) => {
      const n = counts[k], sp = speeds[k], r = R[k];
      for (let j = 0; j < n; j++) {
        const a = t * sp + j * (Math.PI * 2 / n);
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        const o = 0.35 + 0.65 * hi[k];
        const col = active === k ? `rgba(140, 200, 255, ${o})` : `rgba(232,236,241,${o*0.7})`;
        ctx.fillStyle = col;
        const sz = active === k ? 1.8 : 1.2;
        ctx.fillRect(px - sz/2, py - sz/2, sz, sz);
      }
    });

    // label active ring
    ctx.font = '11px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(232,236,241,0.9)';
    const label = { leo: 'LEO · 160–2,000 KM', meo: 'MEO · 2,000–35,000 KM', geo: 'GEO · 35,786 KM' }[active];
    ctx.fillText(label, 20, h - 20);

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio > 0.4) {
        active = e.target.dataset.shell;
        steps.forEach(s => s.classList.toggle('is-active', s.dataset.shell === active));
        legends.forEach(l => l.classList.toggle('is-active', l.dataset.shell === active));
      }
    });
  }, { threshold: [0.4, 0.6, 0.8] });
  steps.forEach(s => io.observe(s));
})();

/* ============ Kessler simulation ============ */
(function kessler(){
  const canvas = document.getElementById('kessler-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  const state = { parts: [], collisions: 0, t0: 0, running: false };
  const elCount = document.getElementById('sim-count');
  const elColl = document.getElementById('sim-collisions');
  const elTime = document.getElementById('sim-time');

  function init() {
    state.parts = [];
    state.collisions = 0;
    state.t0 = performance.now();
    state.running = true;
    const cx = w / 2, cy = h / 2;
    const earthR = Math.min(w, h) * 0.08;
    // two orbital shells of satellites
    const shells = [
      { r: earthR + 60, n: 500, sp: 0.0010, size: 1.6 },
      { r: earthR + 110, n: 700, sp: 0.0007, size: 1.4 }
    ];
    shells.forEach(sh => {
      for (let i = 0; i < sh.n; i++) {
        const a = Math.random() * Math.PI * 2;
        state.parts.push({
          type: 'sat',
          r: sh.r + (Math.random() - 0.5) * 8,
          a,
          sp: sh.sp * (0.9 + Math.random() * 0.2) * (Math.random() < 0.5 ? 1 : -1),
          size: sh.size
        });
      }
    });
    draw(performance.now());
  }

  function trigger() {
    // pick a random sat, spawn a "bullet" that will cross its path
    if (!state.parts.length) init();
    const cx = w / 2, cy = h / 2;
    const earthR = Math.min(w, h) * 0.08;
    const tgt = state.parts[Math.floor(Math.random() * state.parts.length)];
    // spawn a debris stream that will chain-react
    explodeAt(tgt, 60);
  }

  function explodeAt(p, n) {
    state.collisions++;
    // remove the hit particle
    p.dead = true;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.0015 + Math.random() * 0.0025;
      const rJitter = (Math.random() - 0.5) * 40;
      state.parts.push({
        type: 'frag',
        r: p.r + rJitter,
        a: p.a + (Math.random() - 0.5) * 0.3,
        sp: (Math.random() < 0.5 ? 1 : -1) * spd,
        size: 0.8 + Math.random() * 0.8,
        life: 1
      });
    }
  }

  function draw(now) {
    const cx = w / 2, cy = h / 2;
    const earthR = Math.min(w, h) * 0.08;
    // trails
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(0, 0, w, h);

    // earth
    const g = ctx.createRadialGradient(cx - earthR*0.3, cy - earthR*0.3, earthR*0.2, cx, cy, earthR);
    g.addColorStop(0, '#1b2a3d'); g.addColorStop(1, '#05070d');
    ctx.beginPath(); ctx.arc(cx, cy, earthR, 0, Math.PI*2); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(170,210,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();

    // ring hints
    ctx.strokeStyle = 'rgba(232,236,241,0.08)';
    ctx.beginPath(); ctx.arc(cx, cy, earthR + 60, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, earthR + 110, 0, Math.PI*2); ctx.stroke();

    // collision detection via spatial grid
    const cellSize = 8;
    const grid = new Map();
    const live = [];
    for (const p of state.parts) {
      if (p.dead) continue;
      p.a += p.sp;
      const x = cx + Math.cos(p.a) * p.r;
      const y = cy + Math.sin(p.a) * p.r;
      p._x = x; p._y = y;
      live.push(p);
      const gx = Math.floor(x / cellSize), gy = Math.floor(y / cellSize);
      const key = gx + ',' + gy;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(p);
    }

    // check neighbors
    const toExplode = [];
    for (const [key, cell] of grid) {
      const [gx, gy] = key.split(',').map(Number);
      const near = [];
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        const k = (gx+dx)+','+(gy+dy);
        const c = grid.get(k);
        if (c) near.push(...c);
      }
      for (const a of cell) {
        if (a.dead || a._checked) continue;
        for (const b of near) {
          if (b === a || b.dead || b._checked) continue;
          // only chain if at least one is fragment (avoid initial noise)
          if (a.type !== 'frag' && b.type !== 'frag') continue;
          const dx = a._x - b._x, dy = a._y - b._y;
          if (dx*dx + dy*dy < 4) {
            // collision — probability scales down for frag-frag to prevent infinite
            if (Math.random() < 0.4) {
              toExplode.push(a.type === 'sat' ? a : (b.type === 'sat' ? b : a));
              a._checked = b._checked = true;
              break;
            }
          }
        }
      }
    }
    toExplode.forEach(p => explodeAt(p, p.type === 'sat' ? 40 : 8));

    // draw
    for (const p of live) {
      const size = p.size;
      if (p.type === 'sat') {
        ctx.fillStyle = 'rgba(200,220,255,0.9)';
      } else {
        ctx.fillStyle = 'rgba(255,180,120,0.9)';
      }
      ctx.fillRect(p._x - size/2, p._y - size/2, size, size);
    }
    // clear checked flag
    for (const p of live) p._checked = false;

    // cull dead
    state.parts = live;

    // readout
    elCount.textContent = live.length.toLocaleString('en-AU');
    elColl.textContent = state.collisions.toLocaleString('en-AU');
    const sec = Math.floor((now - state.t0) / 1000);
    elTime.textContent = String(Math.floor(sec/60)).padStart(2,'0') + ':' + String(sec%60).padStart(2,'0');

    if (state.running) requestAnimationFrame(draw);
  }

  document.getElementById('sim-trigger').addEventListener('click', () => {
    if (!state.parts.length) init();
    trigger();
  });
  document.getElementById('sim-reset').addEventListener('click', init);

  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (e.isIntersecting && !state.parts.length) init();
    });
  }, { threshold: 0.2 });
  io.observe(canvas);
})();

/* ============ Growth chart ============ */
(function growthChart(){
  const data = window.SSA_DATA.growth;
  const plan = window.SSA_DATA.growthPlan;
  const W = 1000, H = 420, L = 60, R = 40, T = 30, B = 50;
  const xMin = 1960, xMax = 2030, yMin = 0, yMax = 65000;
  const sx = x => L + (x - xMin) / (xMax - xMin) * (W - L - R);
  const sy = y => H - B - (y - yMin) / (yMax - yMin) * (H - T - B);

  const grid = document.getElementById('growth-grid');
  const axes = document.getElementById('growth-axes');
  for (let y = 0; y <= 60000; y += 10000) {
    grid.innerHTML += `<line x1="${L}" y1="${sy(y)}" x2="${W-R}" y2="${sy(y)}"/>`;
    axes.innerHTML += `<text x="${L-8}" y="${sy(y)+4}" text-anchor="end">${y === 0 ? '0' : (y/1000)+'k'}</text>`;
  }
  for (let x = 1960; x <= 2030; x += 10) {
    axes.innerHTML += `<text x="${sx(x)}" y="${H-B+20}" text-anchor="middle">${x}</text>`;
  }

  const pathD = data.map(([x,y], i) => `${i===0?'M':'L'}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(' ');
  const areaD = pathD + ` L${sx(data[data.length-1][0])} ${sy(0)} L${sx(data[0][0])} ${sy(0)} Z`;
  const planD = plan.map(([x,y], i) => `${i===0?'M':'L'}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(' ');

  document.getElementById('growth-line').setAttribute('d', pathD);
  document.getElementById('growth-area').setAttribute('d', areaD);
  document.getElementById('growth-plan').setAttribute('d', planD);

  // annotations
  const annos = document.getElementById('growth-annos');
  const addAnno = (x, y, text, val, warn) => {
    const xx = sx(x), yy = sy(y);
    annos.innerHTML += `<g class="chart-anno${warn?' is-warn':''}" transform="translate(${xx},${yy})">
      <circle r="3" fill="var(--accent)"/>
      <line x1="0" y1="0" x2="0" y2="-28"/>
      <text x="6" y="-32">${text}</text>
      <text x="6" y="-18" class="anno-value">${val}</text>
    </g>`;
  };
  addAnno(2019, 5100, 'Civil Space Strategy', '5,100');
  addAnno(2022, 9800, 'SST IOC', '9,800');
  addAnno(2026, 15000, 'Starlink > 10k', '15,000', true);
  addAnno(2030, 60000, 'Planned', '60,000', true);

  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => {
      if (e.isIntersecting) {
        document.getElementById('growth-line').classList.add('is-drawn');
        document.getElementById('growth-area').classList.add('is-drawn');
        document.getElementById('growth-plan').classList.add('is-drawn');
      }
    });
  }, { threshold: 0.3 });
  io.observe(document.getElementById('growth-chart'));
})();

/* ============ Australia map ============ */
(function map(){
  const data = window.SSA_DATA.sites;
  const g = document.getElementById('map-sites');
  const list = document.getElementById('map-index');
  data.forEach((s, i) => {
    g.innerHTML += `<g class="map-site" data-id="${s.id}">
      <circle class="halo" cx="${s.x}" cy="${s.y}" r="6"/>
      <circle class="pin" cx="${s.x}" cy="${s.y}" r="4" fill="#fff"/>
      <text x="${s.x + 10}" y="${s.y + 4}">${s.name.toUpperCase()}</text>
    </g>`;
    list.innerHTML += `<li data-id="${s.id}">
      <span class="mi-num">${String(i+1).padStart(2,'0')}</span>
      <span class="mi-name">${s.name}</span>
      <span class="mi-type">${s.type}</span>
    </li>`;
  });

  const set = (id) => {
    document.querySelectorAll('.map-site').forEach(el => el.classList.toggle('is-active', el.dataset.id === id));
    document.querySelectorAll('#map-index li').forEach(el => el.classList.toggle('is-active', el.dataset.id === id));
  };
  document.querySelectorAll('.map-site, #map-index li').forEach(el => {
    el.addEventListener('mouseenter', () => set(el.dataset.id));
  });
  // default
  set('exmouth');
})();

/* ============ Benchmark table ============ */
(function bench(){
  const t = document.getElementById('bench-table');
  t.innerHTML = `<div class="bench-row bench-head">
    <span>Nation</span><span>Investment</span><span>Key capabilities</span><span>Lesson</span><span></span>
  </div>`;
  window.SSA_DATA.benchmarks.forEach(b => {
    t.innerHTML += `<div class="bench-row">
      <span class="bench-nation">${b.nation}</span>
      <span class="bench-spend">${b.spend}</span>
      <span class="bench-cap">${b.cap}</span>
      <span class="bench-lesson">${b.lesson}</span>
      <span></span>
    </div>`;
  });
})();

/* ============ Recommendations ============ */
(function recs(){
  const ol = document.getElementById('rec-list');
  window.SSA_DATA.recommendations.forEach((r, i) => {
    const li = document.createElement('li');
    li.className = 'rec-item';
    li.innerHTML = `
      <div class="rec-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</div>
      <div class="rec-content">
        <h3 class="rec-title">${r.title}</h3>
        <p class="rec-body">${r.body}</p>
        <span class="rec-tag">${r.tag}</span>
      </div>
    `;
    ol.appendChild(li);
  });
})();

/* ============ Timeline ============ */
(function tl(){
  const el = document.getElementById('timeline');
  let lastYear = null;
  window.SSA_DATA.timeline.forEach(t => {
    const yearEl = (t.year !== lastYear) ? `<span class="tl-year">${t.year}</span>` : `<span class="tl-year" style="opacity:0.18">${t.year}</span>`;
    lastYear = t.year;
    el.innerHTML += `<div class="tl-item${t.milestone ? ' is-milestone' : ''}">
      ${yearEl}
      <div class="tl-body">
        <h3 class="tl-title">${t.title}</h3>
        <p class="tl-detail">${t.detail}</p>
      </div>
    </div>`;
  });
})();

/* ============ Glossary + tooltip ============ */
(function glossary(){
  const grid = document.getElementById('glossary');
  const tt = document.getElementById('tooltip');
  window.SSA_DATA.glossary.forEach(g => {
    const div = document.createElement('div');
    div.className = 'gloss-item';
    div.dataset.term = g.data || g.term.toLowerCase();
    div.dataset.def = g.def;
    div.innerHTML = `
      <div class="gloss-short">${g.short}</div>
      <h4 class="gloss-term">${g.term}</h4>
      <p class="gloss-def">${g.def}</p>`;
    grid.appendChild(div);
  });

  // inline term tooltips
  const byKey = {};
  window.SSA_DATA.glossary.forEach(g => { byKey[g.data || g.term.toLowerCase()] = g; });

  document.querySelectorAll('.term[data-term]').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      const g = byKey[el.dataset.term];
      if (!g) return;
      tt.innerHTML = `<span class="tt-term">${g.short}</span>${g.def}`;
      tt.classList.add('is-on');
    });
    el.addEventListener('mousemove', (e) => {
      const pad = 14;
      let x = e.clientX + pad, y = e.clientY + pad;
      const r = tt.getBoundingClientRect();
      if (x + r.width > window.innerWidth - 10) x = e.clientX - r.width - pad;
      if (y + r.height > window.innerHeight - 10) y = e.clientY - r.height - pad;
      tt.style.left = x + 'px'; tt.style.top = y + 'px';
    });
    el.addEventListener('mouseleave', () => tt.classList.remove('is-on'));
  });
})();

/* ============ Tracker embed — click to activate ============ */
(function trackerEmbed(){
  const frame = document.querySelector('.tracker-embed-frame');
  const shield = document.querySelector('.tracker-embed-click-shield');
  if (!frame || !shield) return;
  shield.addEventListener('click', () => {
    frame.classList.add('is-active');
  });
  // deactivate when user scrolls away so page scroll works again
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (!e.isIntersecting) frame.classList.remove('is-active'); });
  }, { threshold: 0 });
  io.observe(frame);
})();
