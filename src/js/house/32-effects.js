  /* ================= confetti + flying stars ================= */
  var cvs = $('confetti'), cctx = cvs.getContext && cvs.getContext('2d'), PARTS = [], confRun = false;
  var CCOL = ['#FFC93C', '#FF5C8A', '#4CB8F5', '#4FC27A', '#8B5CF6', '#FF8A3D'];
  function confetti(x, y, n) {
    if (reduce || !cctx) return;
    var r = cvs.getBoundingClientRect();
    if (cvs.width !== Math.round(r.width) || cvs.height !== Math.round(r.height)) { cvs.width = Math.round(r.width); cvs.height = Math.round(r.height); }
    if (x == null) { x = r.width / 2; y = r.height / 3; }
    for (var i = 0; i < (n || 60); i++) {
      var a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 7;
      PARTS.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, c: CCOL[i % CCOL.length], life: 1 });
    }
    if (!confRun) { confRun = true; requestAnimationFrame(confStep); }
  }
  function confStep() {
    cctx.clearRect(0, 0, cvs.width, cvs.height);
    PARTS = PARTS.filter(function (p) { return p.life > 0 && p.y < cvs.height + 20; });
    PARTS.forEach(function (p) {
      p.vy += 0.28; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.008;
      cctx.save(); cctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5)); cctx.translate(p.x, p.y); cctx.rotate(p.r);
      cctx.fillStyle = p.c; cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cctx.restore();
    });
    if (PARTS.length) requestAnimationFrame(confStep); else { confRun = false; cctx.clearRect(0, 0, cvs.width, cvs.height); }
  }
  var lastPt = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  document.addEventListener('pointerdown', function (e) { var r = $('app').getBoundingClientRect(); lastPt = { x: e.clientX - r.left, y: e.clientY - r.top }; }, true);
  function flyStars(n, from) {
    var app = $('app'), tgt = $('starPill').getBoundingClientRect(), ar = app.getBoundingClientRect();
    var tx = tgt.left - ar.left + 10, ty = tgt.top - ar.top + 2, p = from || lastPt;
    for (var i = 0; i < Math.min(n, 5); i++) (function (i) {
      var s = document.createElement('div'); s.className = 'fly'; s.textContent = '⭐'; app.appendChild(s);
      var sx = p.x + (Math.random() - 0.5) * 40, sy = p.y + (Math.random() - 0.5) * 30, t0 = performance.now() + i * 90, D = reduce ? 1 : 750;
      (function step(now) {
        var k = Math.max(0, Math.min(1, (now - t0) / D)), e = k * k * (3 - 2 * k);
        var x = sx + (tx - sx) * e, y = sy + (ty - sy) * e - Math.sin(k * Math.PI) * 80;
        s.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + (1.3 - 0.6 * k) + ')';
        if (k < 1) requestAnimationFrame(step); else { s.remove(); var pill = $('starPill'); pill.classList.remove('pop'); void pill.offsetWidth; pill.classList.add('pop'); }
      })(performance.now());
    })(i);
  }
  function addStars(n, from) {
    if (!n) return;
    STARS += n; saveAll(); flyStars(n, from);
    setTimeout(function () { $('starTxt').textContent = STARS; }, reduce ? 0 : 700);
  }

