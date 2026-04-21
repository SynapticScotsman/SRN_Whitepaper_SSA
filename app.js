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

    const stars = Array.from({length: 180}, () => ({
      x: Math.random(), y: Math.random(), s: Math.random() * 1.1 + 0.2, t: Math.random() * Math.PI * 2
    }));

    // Orbit definitions: [radiusFactor, tilt, speed, satCount, color, label, dotted]
    const orbits = [
      { rf: 1.12, tilt: -0.38, spd: 0.00022, n: 5, col: [125,211,252], lbl: 'LEO', dotted: false },
      { rf: 1.26, tilt: -0.28, spd: 0.00012, n: 3, col: [125,211,252], lbl: 'MEO', dotted: true  },
      { rf: 1.48, tilt: -0.15, spd: 0.00005, n: 2, col: [125,211,252], lbl: 'GEO', dotted: true  },
    ];

    // Named satellites for callout labels
    const namedSats = [
      { orbit: 0, k: 0, id: 'DARC-01' },
      { orbit: 0, k: 2, id: 'TRK-09'  },
      { orbit: 1, k: 0, id: 'SAT-A11' },
      { orbit: 2, k: 1, id: 'GEO-03'  },
    ];

    function ellipsePoint(cx, cy, rx, ry, tilt, a) {
      const cos = Math.cos(tilt), sin = Math.sin(tilt);
      const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
      return { x: cx + ex * cos - ey * sin, y: cy + ex * sin + ey * cos };
    }

    function drawCrosshair(x, y, sz, alpha, highlighted) {
      const arm = sz;
      const gap = sz * 0.35;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = highlighted ? 'rgba(255,200,100,0.95)' : 'rgba(125,211,252,0.85)';
      ctx.lineWidth = highlighted ? 1.2 : 0.9;
      ctx.beginPath();
      ctx.moveTo(x - arm, y); ctx.lineTo(x - gap, y);
      ctx.moveTo(x + gap, y); ctx.lineTo(x + arm, y);
      ctx.moveTo(x, y - arm); ctx.lineTo(x, y - gap);
      ctx.moveTo(x, y + gap); ctx.lineTo(x, y + arm);
      ctx.stroke();
      if (highlighted) {
        // corner bracket
        const b = sz * 0.9;
        ctx.strokeStyle = 'rgba(255,200,100,0.6)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        [-1,1].forEach(sx => [-1,1].forEach(sy => {
          ctx.moveTo(x + sx*(b), y + sy*(b*0.4));
          ctx.lineTo(x + sx*(b), y + sy*(b));
          ctx.lineTo(x + sx*(b*0.4), y + sy*(b));
        }));
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawCallout(x, y, label, side, alpha) {
      const lineLen = 22;
      const dx = side === 'r' ? lineLen : -lineLen;
      ctx.save();
      ctx.globalAlpha = alpha * 0.85;
      ctx.strokeStyle = 'rgba(125,211,252,0.55)';
      ctx.lineWidth = 0.7;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y - 10);
      ctx.lineTo(x + dx + (side === 'r' ? 18 : -18), y - 10);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(125,211,252,0.9)';
      ctx.font = `500 9px 'IBM Plex Mono', monospace`;
      ctx.textAlign = side === 'r' ? 'left' : 'right';
      ctx.fillText(label, x + dx + (side === 'r' ? 20 : -20), y - 7);
      ctx.restore();
    }

    function draw(t) {
      const cx = w * 0.72, cy = h * 0.52;
      const R = Math.min(w, h) * 0.36;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, w, h);

      // stars
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 0.0006 + s.t);
        ctx.fillStyle = `rgba(232,236,241,${(0.1 + 0.35 * tw).toFixed(2)})`;
        ctx.fillRect(s.x * w, s.y * h, s.s, s.s);
      }

      // earth disc
      const g = ctx.createRadialGradient(cx - R*0.28, cy - R*0.22, R*0.15, cx, cy, R);
      g.addColorStop(0, '#1e3250');
      g.addColorStop(0.55, '#0d1c30');
      g.addColorStop(1, '#05070d');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();

      // atmosphere glow ring
      const atm = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.06);
      atm.addColorStop(0, 'rgba(80,160,230,0.14)');
      atm.addColorStop(1, 'rgba(80,160,230,0)');
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.06, 0, Math.PI * 2);
      ctx.fillStyle = atm; ctx.fill();

      // continent outlines (simplified blobby shapes)
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = 'rgba(40,90,140,0.22)';
      const continents = [
        // Australia rough shape
        [[-0.05,0.18],[0.08,0.10],[0.18,0.12],[0.22,0.28],[0.12,0.36],[0.0,0.34]],
        // Asia blob
        [[-0.28,-0.32],[-0.08,-0.28],[0.05,-0.18],[-0.02,-0.05],[-0.22,-0.08]],
        // Africa
        [[-0.32,0.04],[-0.20,-0.08],[-0.10,0.0],[-0.12,0.30],[-0.28,0.22]],
        // Europe
        [[-0.30,-0.22],[-0.18,-0.28],[-0.14,-0.16],[-0.24,-0.12]],
      ];
      for (const pts of continents) {
        ctx.beginPath();
        pts.forEach(([px,py],i) => {
          const nx = cx + px * R * 1.6, ny = cy + py * R * 1.6;
          i === 0 ? ctx.moveTo(nx,ny) : ctx.lineTo(nx,ny);
        });
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      // orbit ellipses
      for (const orb of orbits) {
        const rx = R * orb.rf, ry = rx * 0.22;
        ctx.save();
        ctx.strokeStyle = `rgba(125,211,252,0.14)`;
        ctx.lineWidth = 0.8;
        if (orb.dotted) ctx.setLineDash([5, 7]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, orb.tilt, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // satellites + trails
      const satPositions = {};
      for (let oi = 0; oi < orbits.length; oi++) {
        const orb = orbits[oi];
        const rx = R * orb.rf, ry = rx * 0.22;
        for (let k = 0; k < orb.n; k++) {
          const a = t * orb.spd + k * (Math.PI * 2 / orb.n) + oi * 0.7;
          const { x: px, y: py } = ellipsePoint(cx, cy, rx, ry, orb.tilt, a);
          // depth cue
          const depth = 0.5 + 0.5 * Math.sin(a - orb.tilt);
          const named = namedSats.find(s => s.orbit === oi && s.k === k);
          const isHi = !!named;
          const sz = isHi ? 6 : 4;
          drawCrosshair(px, py, sz, 0.55 + 0.4 * depth, isHi);
          if (named) satPositions[named.id] = { x: px, y: py, side: k < orb.n/2 ? 'r' : 'l', depth };
        }
      }

      // callout labels for named sats
      for (const [id, pos] of Object.entries(satPositions)) {
        drawCallout(pos.x, pos.y, id, pos.side, 0.5 + 0.5 * pos.depth);
      }

      // trajectory arc between two tracked sats (dashed blue curve)
      const s1 = satPositions['DARC-01'], s2 = satPositions['SAT-A11'];
      if (s1 && s2) {
        const mx = (s1.x + s2.x) / 2 - 30, my = (s1.y + s2.y) / 2 - 40;
        ctx.save();
        ctx.strokeStyle = 'rgba(125,211,252,0.28)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.quadraticCurveTo(mx, my, s2.x, s2.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      requestAnimationFrame(draw);
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

/* ============ Recommendations (legacy rec-list fallback) ============ */
(function recs(){
  const ol = document.getElementById('rec-list');
  if (!ol) return;
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
  shield.addEventListener('click', () => { frame.classList.add('is-active'); });
  const io = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (!e.isIntersecting) frame.classList.remove('is-active'); });
  }, { threshold: 0 });
  io.observe(frame);
})();

/* ============ ARC funding dual-axis chart ============ */
(function arcChart(){
  const data   = window.SSA_DATA.arcFunding;
  const starlink = window.SSA_DATA.starlinkCumulative;
  if (!data || !document.getElementById('arc-svg')) return;

  const W=1000,H=340,L=70,R=70,T=20,B=50;
  const years = data.map(d => d.year);
  const xMin = years[0], xMax = years[years.length-1];
  const yMaxFund = 900000, yMaxStar = 11000;
  const sx = x => L + (x - xMin)/(xMax - xMin)*(W-L-R);
  const syF = y => H - B - (y/yMaxFund)*(H-T-B);
  const syStar = y => H - B - (y/yMaxStar)*(H-T-B);

  const grid = document.getElementById('arc-grid');
  const bars = document.getElementById('arc-bars');
  const lineG = document.getElementById('arc-line-group');
  const axes = document.getElementById('arc-axes');
  const annos = document.getElementById('arc-annos');

  // grid lines
  [0,200000,400000,600000,800000].forEach(v => {
    grid.innerHTML += `<line x1="${L}" y1="${syF(v)}" x2="${W-R}" y2="${syF(v)}" stroke="var(--rule)" stroke-width="1"/>`;
    axes.innerHTML += `<text x="${L-8}" y="${syF(v)+4}" text-anchor="end" font-family="var(--mono)" font-size="9" fill="var(--fg-faint)">$${v===0?'0':(v/1000).toFixed(0)+'k'}</text>`;
  });
  [0,2500,5000,7500,10000].forEach(v => {
    axes.innerHTML += `<text x="${W-R+8}" y="${syStar(v)+4}" text-anchor="start" font-family="var(--mono)" font-size="9" fill="rgba(255,184,77,0.8)">${v===0?'0':(v/1000).toFixed(1)+'k'}</text>`;
  });

  // x axis labels — every 5 years
  for (let y=xMin; y<=xMax; y+=5) {
    axes.innerHTML += `<text x="${sx(y)}" y="${H-B+18}" text-anchor="middle" font-family="var(--mono)" font-size="9" fill="var(--fg-faint)">${y}</text>`;
  }
  axes.innerHTML += `<text x="${L-8}" y="${T}" text-anchor="end" font-family="var(--mono)" font-size="8" fill="var(--fg-faint)" writing-mode="tb">AUD</text>`;
  axes.innerHTML += `<text x="${W-R+24}" y="${T+40}" text-anchor="middle" font-family="var(--mono)" font-size="8" fill="rgba(255,184,77,0.8)">Starlink</text>`;

  // bars
  const barW = (W-L-R)/(xMax-xMin+1)*0.6;
  data.forEach(d => {
    if (!d.amount) return;
    const bx = sx(d.year) - barW/2;
    const by = syF(d.amount);
    const bh = H-B-by;
    bars.innerHTML += `<rect x="${bx}" y="${by}" width="${barW}" height="${bh}" fill="var(--accent)" opacity="0.75"/>`;
    bars.innerHTML += `<text x="${sx(d.year)}" y="${by-6}" text-anchor="middle" font-family="var(--mono)" font-size="8" fill="var(--fg-dim)">$${(d.amount/1000).toFixed(0)}k</text>`;
    if (d.n > 0) bars.innerHTML += `<text x="${sx(d.year)}" y="${by-16}" text-anchor="middle" font-family="var(--mono)" font-size="7.5" fill="var(--fg-faint)">(n=${d.n})</text>`;
  });

  // Starlink line
  const slPts = starlink.filter(([y]) => y >= xMin && y <= xMax);
  const slPath = slPts.map(([x,y],i) => `${i===0?'M':'L'}${sx(x).toFixed(1)} ${syStar(y).toFixed(1)}`).join(' ');
  lineG.innerHTML = `<path d="${slPath}" fill="none" stroke="rgba(255,184,77,0.85)" stroke-width="2"/>`;
  slPts.forEach(([x,y]) => {
    lineG.innerHTML += `<circle cx="${sx(x)}" cy="${syStar(y)}" r="3" fill="rgba(255,184,77,0.85)"/>`;
  });

  // annotation
  annos.innerHTML = `<g transform="translate(${sx(2019)},${syF(0)+14})">
    <line x1="0" y1="-8" x2="0" y2="-40" stroke="var(--rule-strong)" stroke-width="1"/>
    <text x="4" y="-28" font-family="var(--mono)" font-size="8.5" fill="var(--fg-dim)">Starlink begins</text>
  </g>`;
})();

/* ============ Diagnostic matrix ============ */
(function diagMatrix(){
  const el = document.getElementById('diag-table');
  if (!el) return;
  el.innerHTML = `<div class="diag-row diag-head">
    <span>Country / Model</span>
    <span>Civil–Mil Integration</span>
    <span>Shared Catalogue</span>
    <span>Sovereign Sensor</span>
    <span>Key Lesson</span>
  </div>`;
  window.SSA_DATA.diagnosticMatrix.forEach(r => {
    const chk = v => v
      ? `<span class="diag-check yes" title="Yes">✓</span>`
      : `<span class="diag-check no"  title="No">✗</span>`;
    el.innerHTML += `<div class="diag-row${r.highlight ? ' diag-highlight' : ''}">
      <span class="diag-nation">${r.nation}</span>
      ${chk(r.civilMil)}
      ${chk(r.catalogue)}
      ${chk(r.sensor)}
      <span class="diag-lesson">${r.lesson}</span>
    </div>`;
  });
})();

/* ============ Coordination Matrix ============ */
(function coordMatrix(){
  const el = document.getElementById('coord-matrix');
  if (!el) return;
  window.SSA_DATA.coordinationMatrix.forEach(s => {
    el.innerHTML += `<div class="coord-step">
      <div class="coord-step-num">${s.num}</div>
      <h3 class="coord-step-title">${s.title}</h3>
      <span class="coord-step-deadline">${s.deadline}</span>
      <p class="coord-step-body">${s.body}</p>
      <span class="coord-step-tag">${s.tag}</span>
    </div>`;
  });
})();

/* ============ Outcomes grid ============ */
(function outcomesGrid(){
  const el = document.getElementById('outcomes-grid');
  if (!el) return;
  window.SSA_DATA.outcomes.forEach(o => {
    el.innerHTML += `<div class="outcome-card">
      <h3 class="outcome-title">${o.title}</h3>
      <p class="outcome-body">${o.body}</p>
    </div>`;
  });
})();
