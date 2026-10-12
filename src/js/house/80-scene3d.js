  function init3D() {
    var THREE = window.THREE;
    var canvas = $('gl'), view = $('view'), labelsBox = $('labels');
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);
    camera.rotation.order = 'YXZ';

    /* --- helpers --- */
    var MATS = {};
    function mat(c) { if (!MATS[c]) MATS[c] = new THREE.MeshLambertMaterial({ color: c }); return MATS[c]; }
    var BASICS = {};
    function basic(c, fog) { var k = c + (fog === false ? 'n' : 'f'); if (!BASICS[k]) { BASICS[k] = new THREE.MeshBasicMaterial({ color: c }); if (fog === false) BASICS[k].fog = false; } return BASICS[k]; }
    function bx(g, w, h, d, c, x, y, z, ry) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x, y, z); if (ry) m.rotation.y = ry; g.add(m); return m; }
    function cy(g, rt, rb, h, c, x, y, z, seg) { var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), mat(c)); m.position.set(x, y, z); g.add(m); return m; }
    function sp(g, r, c, x, y, z, sx, sy, sz) { var m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat(c)); m.position.set(x, y, z); if (sx) m.scale.set(sx, sy, sz); g.add(m); return m; }
    function canvasTex(w, h, draw) {
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      return new THREE.CanvasTexture(c);
    }
    function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    var rand = mulberry(77);
    function blob(g, x, z, rx, rz) {
      var m = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }));
      m.rotation.x = -Math.PI / 2; m.position.set(x, 0.014, z); m.scale.set(rx, rz, 1); g.add(m);
    }

    var PICK = [];
    function tag(obj, id, zone) {
      obj.traverse(function (m) { if (m.isMesh) { m.userData.wordId = id; m.userData.zone = zone; PICK.push(m); } });
    }

    /* palette */
    var C = { wallOut: 0xF4DE9B, wallIn: 0xCFE3EE, white: 0xFFFFFF, roof: 0xB5473A, wood: 0x8B5E3C, floor: 0xC9A06B, door: 0x1F8A8A, door2: 0x177070, gold: 0xE9B949,
              grass: 0x8CCB6A, leaf: 0x3FA34D, leaf2: 0x2E8B57, trunk: 0x7A5230, sky: 0xBFE3F2 };

    /* --- lights & sky --- */
    scene.add(new THREE.AmbientLight(0xFFF6E8, 0.36));
    scene.add(new THREE.HemisphereLight(0xCDE9F7, 0x9CCB7A, 0.38));
    var sun = new THREE.DirectionalLight(0xFFE8BF, 0.5); sun.position.set(-6, 12, 9); scene.add(sun);
    var zl = new THREE.PointLight(0xFFE2B0, 0, 11); scene.add(zl);
    function lightFor(z) { if (!z) return; if (z === 'out' || z === 'back') { zl.intensity = 0; return; } zl.position.set(ZX[z] || 0, (ZY[z] || 0) + 2.5, (z === 'hall' || z === 'land') ? 0.5 : 0); zl.intensity = 0.8; }
    scene.background = canvasTex(8, 256, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7EC4E8'); g.addColorStop(0.6, '#BFE3F2'); g.addColorStop(1, '#EAF6FA');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    scene.fog = new THREE.Fog(0xDCEFF6, 40, 110);

    var world = new THREE.Group(); scene.add(world);

    /* --- ground & garden --- */
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), mat(C.grass)); ground.rotation.x = -Math.PI / 2; world.add(ground);
    for (var s = 0; s < 9; s++) bx(world, 1.0, 0.04, 0.62, 0xDAD3C4, 0, 0.02, 4.7 + s * 1.28);
    bx(world, 1.5, 0.03, 0.8, 0x8D6E63, 0, 0.015, 4.3);   /* doormat */
    function mkTree(x, z, k) {
      var g = new THREE.Group();
      cy(g, 0.2 * k, 0.28 * k, 2.2 * k, C.trunk, 0, 1.1 * k, 0, 10);
      sp(g, 1.25 * k, C.leaf, 0, 3.0 * k, 0); sp(g, 0.95 * k, C.leaf2, 0.7 * k, 2.6 * k, 0.3 * k); sp(g, 0.9 * k, C.leaf, -0.7 * k, 2.7 * k, -0.2 * k);
      g.position.set(x, 0, z); world.add(g); blob(world, x, z, 1.1 * k, 1.1 * k); tag(g, 'tree', 'out'); return g;
    }
    var tree1 = mkTree(-6.4, 6.0, 1.15); mkTree(14.2, 6.0, 1.0); mkTree(-15, -6.0, 1.2); mkTree(15.5, -7.0, 1.1); mkTree(-12.5, -11.0, 1.3);
    function mkBush(x, z, r, c) { var g = new THREE.Group(); sp(g, r, c, 0, r * 0.7, 0, 1.2, 0.8, 1); g.position.set(x, 0, z); world.add(g); tag(g, 'house', 'out'); }
    mkBush(-3.4, 4.6, 0.55, C.leaf2); mkBush(-2.6, 4.45, 0.4, C.leaf); mkBush(3.4, 4.6, 0.55, C.leaf2); mkBush(2.6, 4.45, 0.4, C.leaf);
    var fcols = [0xFF6B6B, 0xFFD93D, 0xFF9FF3, 0xFFFFFF];
    for (var f = 0; f < 18; f++) { var fx = (f < 9 ? -1 : 1) * (1.6 + (f % 9) * 0.18), fz = 4.25 + (f % 3) * 0.12; bx(world, 0.012, 0.18, 0.012, 0x3B7D3A, fx, 0.09, fz); sp(world, 0.05, fcols[f % 4], fx, 0.2, fz); }
    /* fence */
    for (var px = -16; px <= 16; px += 0.45) { if (Math.abs(px) < 1.4) continue; bx(world, 0.12, 0.9, 0.05, C.white, px, 0.45, 17.5); }
    [[-8.7, 14.6], [8.7, 14.6]].forEach(function (p) { bx(world, p[1], 0.08, 0.05, C.white, p[0], 0.3, 17.5); bx(world, p[1], 0.08, 0.05, C.white, p[0], 0.7, 17.5); });
    /* mailbox */
    var mb = new THREE.Group();
    bx(mb, 0.08, 0.95, 0.08, C.wood, 0, 0.475, 0); bx(mb, 0.44, 0.26, 0.24, 0x3A86FF, 0, 1.05, 0);
    var mtop = cy(mb, 0.13, 0.13, 0.44, 0x3A86FF, 0, 1.18, 0, 16); mtop.rotation.z = Math.PI / 2;
    bx(mb, 0.03, 0.2, 0.03, 0xE63946, 0.25, 1.2, 0); bx(mb, 0.12, 0.05, 0.03, 0xE63946, 0.3, 1.3, 0);
    mb.position.set(2.5, 0, 13.6); world.add(mb); tag(mb, 'mailbox', 'out');
    /* sun & clouds */
    var sunBall = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12), basic(0xFFE066, false)); sunBall.position.set(-40, 48, -80); scene.add(sunBall);
    var clouds = [];
    [[-25, 32, -60], [30, 38, -70], [10, 30, 40], [-45, 36, 10], [50, 34, -10]].forEach(function (p) {
      var g = new THREE.Group();
      [[0, 0, 0, 4], [4, -0.5, 0, 3.2], [-4, -0.6, 0, 3], [1.5, 1.2, 0, 3]].forEach(function (s) { var m = new THREE.Mesh(new THREE.SphereGeometry(s[3], 10, 8), basic(0xFFFFFF, false)); m.position.set(s[0], s[1], s[2]); m.scale.y = 0.6; g.add(m); });
      g.position.set(p[0], p[1], p[2]); scene.add(g); clouds.push(g);
    });

    /* --- house shell: three columns, two storeys (cells are 7 deep; walls are built per room) --- */
    var house = new THREE.Group(); world.add(house);
    var SH = 3.3, EXT = 0xE3B877, EXT_TRIM = 0x7A4B2A, EXT_BASE = 0x8F8579;
    var CFG = {
      'in':    { wall: 0xE3C294, wain: 0x9A6A45, trim: 0xF1E3C4, floor: 0xC49A64, ceil: 0xEFDDB8 },
      kitchen: { wall: 0xF0CC73, wain: 0x4F9E9A, trim: 0xF4E9CB, floor: 0xBDB4A4, ceil: 0xF2E5C2 },
      bath:    { wall: 0x93D1D6, wain: 0x4A97A1, trim: 0xE8F2F0, floor: 0xA9B9BF, ceil: 0xE4EFEB },
      hall:    { wall: 0xD4AE86, wain: 0x76502F, trim: 0xEEDFC0, floor: 0x8F7152, ceil: 0xEBDAB6 },
      bed:     { wall: 0xAFD0B8, wain: 0x6A9879, trim: 0xF2EAD2, floor: 0xCFAE7B, ceil: 0xF0E6C8 },
      study:   { wall: 0xC4B6E0, wain: 0x7B68AE, trim: 0xF0E7D2, floor: 0xB48658, ceil: 0xEEE4C8 },
      kids:    { wall: 0x97C8EF, wain: 0xE9AE3F, trim: 0xF6EDD0, floor: 0xDCBE88, ceil: 0xF4EACB },
      land:    { wall: 0xE6C89E, wain: 0x86593A, trim: 0xEFE0C0, floor: 0xB48658, ceil: 0xEDDDB9 }
    };
    var DOORCFG = {
      'in': [{ side: 's', at: 0, w: 1.2 }, { side: 'w', at: 2.3, w: 1.1 }, { side: 'e', at: 2.3, w: 1.1 }],
      kitchen: [{ side: 'e', at: 2.3, w: 1.1 }],
      hall: [{ side: 'w', at: 2.3, w: 1.1 }, { side: 'e', at: -2.0, w: 1.0 }, { side: 'n', at: -0.8, w: 1.1 }],
      bath: [{ side: 'w', at: -2.0, w: 1.0 }],
      bed: [{ side: 'e', at: 2.3, w: 1.1 }],
      study: [{ side: 'w', at: 2.3, w: 1.1 }, { side: 'e', at: 2.3, w: 1.1 }],
      land: [{ side: 'w', at: 2.3, w: 1.1 }, { side: 'e', at: -2.0, w: 1.0 }],
      kids: [{ side: 'w', at: -2.0, w: 1.0 }]
    };
    function bx6(g, w, h, d, cols, x, y, z) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cols.map(function (c) { return mat(c); })); m.position.set(x, y, z); g.add(m); return m;
    }
    /* walls (two-tone with skirting, chair rail and crown), floor, ceiling; g sits at the room centre, W wide, 7 deep */
    function roomShell(g, W, key, upstairs, hole) {
      var o = CFG[key], gaps0 = DOORCFG[key] || [], D = 7, T = 0.02;
      var B = { n: -D / 2, s: D / 2, w: -W / 2, e: W / 2 }, dir = { n: 1, s: -1, w: 1, e: -1 };
      function piece(side, a0, a1, y0, y1, c, from, t) {
        var pos = B[side] + dir[side] * (from + t / 2), len = a1 - a0, mid = (a0 + a1) / 2, h = y1 - y0, my = (y0 + y1) / 2;
        return (side === 'n' || side === 's') ? bx(g, len, h, t, c, mid, my, pos) : bx(g, t, h, len, c, pos, my, mid);
      }
      function band(side, y0, y1, c, from, t, gaps) {
        var L = (side === 'n' || side === 's') ? W : D, cur = -L / 2;
        gaps.forEach(function (q) { if (q[0] - cur > 0.001) piece(side, cur, q[0], y0, y1, c, from, t); cur = q[1]; });
        if (L / 2 - cur > 0.001) piece(side, cur, L / 2, y0, y1, c, from, t);
      }
      ['n', 's', 'w', 'e'].forEach(function (side) {
        var gaps = gaps0.filter(function (d) { return d.side === side; }).map(function (d) { return [d.at - d.w / 2, d.at + d.w / 2]; }).sort(function (a, b) { return a[0] - b[0]; });
        band(side, 0, 1.0, o.wain, 0, T, gaps);
        band(side, 1.0, 3.0, o.wall, 0, T, gaps);
        gaps.forEach(function (q) { piece(side, q[0], q[1], 2.15, 3.0, o.wall, 0, T); });
        band(side, 0, 0.14, o.trim, T, 0.03, gaps);
        band(side, 0.97, 1.05, o.trim, T, 0.04, gaps);
        band(side, 2.88, 3.0, o.trim, T, 0.05, []);
        gaps.forEach(function (q) { piece(side, q[0] - 0.07, q[0], 0, 2.2, EXT_TRIM, 0, T + 0.05); piece(side, q[1], q[1] + 0.07, 0, 2.2, EXT_TRIM, 0, T + 0.05); piece(side, q[0] - 0.07, q[1] + 0.07, 2.15, 2.25, EXT_TRIM, 0, T + 0.05); });
      });
      /* floor / floor slab, and ceiling for the upper storey */
      var cols = [o.floor, o.floor, o.floor, o.ceil, o.floor, o.floor];
      if (!upstairs) { bx(g, W, 0.1, D, o.floor, 0, -0.05, 0); }
      else if (!hole) { bx6(g, W, 0.3, D, cols, 0, -0.15, 0); }
      else {
        var hx0 = hole[0], hx1 = hole[1], hz0 = hole[2], hz1 = hole[3];
        bx6(g, W, 0.3, hz0 + D / 2, cols, 0, -0.15, (-D / 2 + hz0) / 2);
        bx6(g, W, 0.3, D / 2 - hz1, cols, 0, -0.15, (hz1 + D / 2) / 2);
        bx6(g, hx0 + W / 2, 0.3, hz1 - hz0, cols, 0, -0.15, (hz0 + hz1) / 2).position.x = (-W / 2 + hx0) / 2;
        if (W / 2 - hx1 > 0.01) bx(g, W / 2 - hx1, 0.3, hz1 - hz0, o.floor, (hx1 + W / 2) / 2, -0.15, (hz0 + hz1) / 2);
      }
      if (upstairs) bx(g, W, 0.1, D, o.ceil, 0, 3.05, 0);
      var lt = cy(g, 0.35, 0.35, 0.05, 0xFFEFC8, 0, 2.97, 0, 24);
      lt.material = new THREE.MeshLambertMaterial({ color: 0xFFF1CF, emissive: 0xFFE2A0, emissiveIntensity: 0.6 });
    }
    function wallBox(x0, x1, y0, y1, z, t, c) { var m = bx(house, x1 - x0, y1 - y0, t, c, (x0 + x1) / 2, (y0 + y1) / 2, z); m.userData.wordId = 'house'; m.userData.zone = 'out'; PICK.push(m); return m; }
    /* outer skin: front (door gap), back (back-door gap), sides */
    wallBox(-10.75, -0.6, 0, 6.6, 3.625, 0.25, EXT); wallBox(0.6, 10.75, 0, 6.6, 3.625, 0.25, EXT); wallBox(-0.6, 0.6, 2.25, 6.6, 3.625, 0.25, EXT);
    wallBox(-10.75, 4.15, 0, 6.6, -3.625, 0.25, EXT); wallBox(5.25, 10.75, 0, 6.6, -3.625, 0.25, EXT); wallBox(4.15, 5.25, 2.25, 6.6, -3.625, 0.25, EXT);
    [-10.625, 10.625].forEach(function (x) { var m = bx(house, 0.25, 6.6, 7.5, EXT, x, 3.3, 0); m.userData.wordId = 'house'; m.userData.zone = 'out'; PICK.push(m); });
    /* trims: stone base, storey band, corner posts */
    bx(house, 10.2, 0.5, 0.06, EXT_BASE, -5.65, 0.25, 3.78); bx(house, 10.2, 0.5, 0.06, EXT_BASE, 5.65, 0.25, 3.78);
    bx(house, 21.7, 0.2, 0.08, EXT_TRIM, 0, SH, 3.78); bx(house, 21.7, 0.2, 0.08, EXT_TRIM, 0, SH, -3.78);
    bx(house, 0.08, 0.2, 7.6, EXT_TRIM, -10.78, SH, 0); bx(house, 0.08, 0.2, 7.6, EXT_TRIM, 10.78, SH, 0);
    [[-10.7, 3.7], [10.7, 3.7], [-10.7, -3.7], [10.7, -3.7]].forEach(function (p) { bx(house, 0.3, 6.7, 0.3, EXT_TRIM, p[0], 3.35, p[1]); });
    /* decorative windows on the front */
    function fwin(x, y) {
      bx(house, 1.3, 1.1, 0.06, EXT_TRIM, x, y, 3.78); bx(house, 1.1, 0.9, 0.07, 0x7FB6D6, x, y, 3.79);
      bx(house, 0.05, 0.9, 0.08, EXT_TRIM, x, y, 3.8); bx(house, 1.1, 0.05, 0.08, EXT_TRIM, x, y, 3.8); bx(house, 1.5, 0.07, 0.22, EXT_TRIM, x, y - 0.6, 3.86);
      bx(house, 0.3, 1.1, 0.05, 0x3F8F8A, x - 0.8, y, 3.8); bx(house, 0.3, 1.1, 0.05, 0x3F8F8A, x + 0.8, y, 3.8);
    }
    [-7, -2.2, 2.2, 5.5, 9].forEach(function (x) { fwin(x, 1.7); }); [-7, -1.8, 1.8, 5.5, 9].forEach(function (x) { fwin(x, 5.0); });
    /* roof: ridge runs along x */
    var rAng = Math.atan(2.6 / 4.4), rLen = Math.sqrt(4.4 * 4.4 + 2.6 * 2.6);
    var rf = bx(house, 22.6, 0.22, rLen, 0xA64B3C, 0, 7.9, 2.2); rf.rotation.x = rAng; var rb = bx(house, 22.6, 0.22, rLen, 0xA64B3C, 0, 7.9, -2.2); rb.rotation.x = -rAng;
    bx(house, 22.8, 0.16, 0.5, 0x7E3328, 0, 9.22, 0);
    bx(house, 22.8, 0.12, 0.1, 0x6E2B22, 0, 6.62, 4.38); bx(house, 22.8, 0.12, 0.1, 0x6E2B22, 0, 6.62, -4.38);
    var tri = new THREE.Shape(); tri.moveTo(-3.8, 6.6); tri.lineTo(3.8, 6.6); tri.lineTo(0, 9.1); tri.lineTo(-3.8, 6.6);
    [[10.76, Math.PI / 2], [-10.76, -Math.PI / 2]].forEach(function (p) { var m = new THREE.Mesh(new THREE.ShapeGeometry(tri), mat(EXT)); m.position.set(p[0], 0, 0); m.rotation.y = p[1]; house.add(m); });
    bx(house, 0.8, 2.4, 0.8, 0x9A4A38, -7.5, 8.6, -1.4);
    /* front door frame and the door leaf (hinged at its left edge, swings outward) */
    bx(house, 0.12, 2.3, 0.34, EXT_TRIM, -0.66, 1.15, 3.625); bx(house, 0.12, 2.3, 0.34, EXT_TRIM, 0.66, 1.15, 3.625); bx(house, 1.44, 0.12, 0.34, EXT_TRIM, 0, 2.3, 3.625);
    bx(house, 1.6, 0.06, 0.8, 0x6D5A4A, 0, 0.03, 4.15);

    /* --- door (hinged at its left edge, swings outward) --- */
    var doorPivot = new THREE.Group(); doorPivot.position.set(-0.55, 0, 3.625); house.add(doorPivot);
    bx(doorPivot, 1.1, 2.15, 0.08, C.door, 0.55, 1.075, 0);
    [0.55, 1.55].forEach(function (y) { bx(doorPivot, 0.78, 0.7, 0.02, C.door2, 0.55, y, 0.045); bx(doorPivot, 0.78, 0.7, 0.02, C.door2, 0.55, y, -0.045); });
    sp(doorPivot, 0.05, C.gold, 0.95, 1.05, 0.09); sp(doorPivot, 0.05, C.gold, 0.95, 1.05, -0.09);
    tag(doorPivot, 'door', 'both');

    /* ================= living room ================= */
    var room = new THREE.Group(); world.add(room);
    roomShell(room, 7, 'in', false, null);
    var WOOD = C.wood;

    /* rug */
    var rug = new THREE.Group();
    bx(rug, 3.0, 0.02, 2.2, 0x3D5A80, 0, 0.011, 0); bx(rug, 2.8, 0.022, 2.0, 0xEE6C4D, 0, 0.012, 0); bx(rug, 2.55, 0.024, 1.75, 0xAFC8E0, 0, 0.013, 0); bx(rug, 2.2, 0.026, 1.4, 0x3D5A80, 0, 0.014, 0);
    rug.position.set(-1.0, 0, -0.1); room.add(rug); tag(rug, 'rug', 'in');

    /* sofa (west wall, faces east) */
    var sofa = new THREE.Group();
    bx(sofa, 2.2, 0.38, 0.95, 0xD9694F, 0, 0.30, 0); bx(sofa, 2.2, 0.62, 0.24, 0xD9694F, 0, 0.80, -0.36);
    bx(sofa, 0.26, 0.55, 0.95, 0xB9523A, -1.1, 0.50, 0); bx(sofa, 0.26, 0.55, 0.95, 0xB9523A, 1.1, 0.50, 0);
    bx(sofa, 0.92, 0.16, 0.7, 0xE27E63, -0.45, 0.58, 0.1); bx(sofa, 0.92, 0.16, 0.7, 0xE27E63, 0.45, 0.58, 0.1);
    [[-1, -0.38], [1, -0.38], [-1, 0.38], [1, 0.38]].forEach(function (p) { bx(sofa, 0.08, 0.12, 0.08, 0x5A3B2A, p[0], 0.06, p[1]); });
    sofa.position.set(-2.95, 0, -0.1); sofa.rotation.y = Math.PI / 2; room.add(sofa); tag(sofa, 'sofa', 'in'); blob(room, -2.9, -0.1, 0.7, 1.25);
    var cu1 = new THREE.Group(); bx(cu1, 0.42, 0.42, 0.14, 0xF2C14E, 0, 0, 0); cu1.position.set(-0.7, 0.9, -0.12); cu1.rotation.x = -0.22; sofa.add(cu1);
    var cu2 = new THREE.Group(); bx(cu2, 0.42, 0.42, 0.14, 0x2A9D8F, 0, 0, 0); cu2.position.set(0.7, 0.9, -0.12); cu2.rotation.x = -0.22; cu2.rotation.z = 0.12; sofa.add(cu2);
    tag(cu1, 'cushion', 'in'); tag(cu2, 'cushion', 'in');

    /* coffee table and things on it */
    var ct = new THREE.Group();
    bx(ct, 1.4, 0.07, 0.75, WOOD, 0, 0.45, 0); bx(ct, 1.2, 0.04, 0.6, 0x6E4529, 0, 0.16, 0);
    [[-0.62, -0.32], [0.62, -0.32], [-0.62, 0.32], [0.62, 0.32]].forEach(function (p) { bx(ct, 0.07, 0.42, 0.07, 0x6E4529, p[0], 0.21, p[1]); });
    ct.position.set(-1.2, 0, -0.1); room.add(ct); tag(ct, 'coffeetable', 'in'); blob(room, -1.2, -0.1, 0.8, 0.5);
    var TT = 0.485;
    /* remote */
    var rem = new THREE.Group(); bx(rem, 0.06, 0.02, 0.2, 0x23282D, 0, 0.01, 0); [-0.05, 0, 0.05].forEach(function (z, i) { bx(rem, 0.03, 0.006, 0.025, [0xE63946, 0x2A9D8F, 0xF2C14E][i], 0, 0.023, z); });
    rem.position.set(-0.95, TT, 0.08); rem.rotation.y = 0.5; room.add(rem); tag(rem, 'remote', 'in');
    /* cup */
    var cup = new THREE.Group(); cy(cup, 0.05, 0.04, 0.09, 0xFFFFFF, 0, 0.045, 0, 18); cy(cup, 0.042, 0.042, 0.005, 0x6F4E37, 0, 0.088, 0, 18);
    var hd = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 8, 14), mat(0xFFFFFF)); hd.position.set(0.058, 0.045, 0); cup.add(hd);
    cup.position.set(-1.5, TT, -0.4); room.add(cup); tag(cup, 'cup', 'in');
    /* book */
    var bk = new THREE.Group(); bx(bk, 0.3, 0.035, 0.22, 0x3B6EA8, 0, 0.0175, 0); bx(bk, 0.28, 0.03, 0.2, 0xE0A030, 0.01, 0.05, 0.01, 0.2);
    bk.position.set(-1.5, TT, 0.15); bk.rotation.y = -0.3; room.add(bk); tag(bk, 'book', 'in');
    /* vase with flowers */
    var vase = new THREE.Group();
    var pts = [[0.001, 0], [0.07, 0], [0.09, 0.04], [0.1, 0.12], [0.07, 0.2], [0.05, 0.26], [0.065, 0.3]].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    var vm = new THREE.Mesh(new THREE.LatheGeometry(pts, 20), new THREE.MeshLambertMaterial({ color: 0x3DA5D9, side: THREE.DoubleSide })); vase.add(vm);
    for (var fi = 0; fi < 5; fi++) {
      var piv = new THREE.Group(); piv.rotation.y = fi / 5 * Math.PI * 2; piv.position.y = 0.28;
      var st = cy(piv, 0.008, 0.008, 0.34, 0x3B7D3A, 0.04, 0.17, 0, 6); st.rotation.z = -0.25;
      sp(piv, 0.045, [0xFF6B9D, 0xFFD93D, 0xFF6B9D, 0xFFFFFF, 0xFFD93D][fi], 0.085, 0.34, 0); vase.add(piv);
    }
    vase.position.set(-1.2, TT, -0.1); room.add(vase); tag(vase, 'vase', 'in');

    /* TV (east wall, faces west) */
    var tvs = new THREE.Group();
    bx(tvs, 2.0, 0.5, 0.5, 0x6B4A32, 0, 0.25, 0); bx(tvs, 0.6, 0.36, 0.02, 0x4F3622, -0.5, 0.25, 0.26); bx(tvs, 0.6, 0.36, 0.02, 0x4F3622, 0.5, 0.25, 0.26);
    sp(tvs, 0.02, C.gold, -0.5, 0.25, 0.28); sp(tvs, 0.02, C.gold, 0.5, 0.25, 0.28);
    bx(tvs, 0.5, 0.03, 0.25, 0x15191D, 0, 0.515, 0); bx(tvs, 0.1, 0.16, 0.08, 0x15191D, 0, 0.59, 0);
    bx(tvs, 1.6, 0.95, 0.06, 0x15191D, 0, 1.12, 0);
    var screen = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.85), new THREE.MeshBasicMaterial({
      map: canvasTex(256, 144, function (ctx, w, h) {
        var g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6EC1F0'); g.addColorStop(1, '#D8F0FB'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#FFE066'; ctx.beginPath(); ctx.arc(200, 38, 20, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#7CC36B'; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, 100); ctx.quadraticCurveTo(70, 60, 140, 105); ctx.quadraticCurveTo(200, 80, w, 100); ctx.lineTo(w, h); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(60, 40, 14, 0, 6.3); ctx.arc(78, 40, 18, 0, 6.3); ctx.arc(98, 42, 12, 0, 6.3); ctx.fill();
      })
    }));
    screen.position.set(0, 1.12, 0.035); tvs.add(screen);
    tvs.position.set(3.15, 0, -0.1); tvs.rotation.y = -Math.PI / 2; room.add(tvs); blob(room, 3.1, -0.1, 0.5, 1.1);
    tag(tvs, 'tv', 'in');

    /* air conditioner above the TV */
    var ac = new THREE.Group();
    bx(ac, 1.1, 0.3, 0.25, 0xF2F4F5, 0, 0, 0); bx(ac, 1.0, 0.05, 0.2, 0xDDE2E5, 0, -0.11, 0.03);
    [-0.03, 0.02].forEach(function (y) { bx(ac, 0.96, 0.008, 0.01, 0xBFC7CC, 0, y, 0.128); });
    sp(ac, 0.016, 0x4CD964, 0.45, 0.08, 0.13);
    ac.position.set(3.375, 2.4, -0.1); ac.rotation.y = -Math.PI / 2; room.add(ac); tag(ac, 'aircon', 'in');

    /* bookshelf (north wall, right) */
    var shelf = new THREE.Group();
    var sw = 1.6, sh = 2.0, sd = 0.34;
    bx(shelf, sw, sh, 0.03, 0x6E4529, 0, sh / 2, -sd / 2 + 0.015); bx(shelf, 0.05, sh, sd, 0x8A5A3B, -sw / 2 + 0.025, sh / 2, 0); bx(shelf, 0.05, sh, sd, 0x8A5A3B, sw / 2 - 0.025, sh / 2, 0);
    [0.03, 0.55, 1.05, 1.55, 1.98].forEach(function (y) { bx(shelf, sw, 0.04, sd, 0x8A5A3B, 0, y, 0); });
    var bcol = [0xE76F51, 0x2A9D8F, 0xE9C46A, 0x264653, 0xF4A261, 0x8AB17D, 0x6D597A, 0xB56576];
    [0.05, 0.57, 1.07, 1.57].forEach(function (y0) {
      var x = -sw / 2 + 0.08;
      while (x < sw / 2 - 0.14) {
        var bw = 0.04 + rand() * 0.05, bh = 0.2 + rand() * 0.2;
        bx(shelf, bw, bh, 0.22, bcol[Math.floor(rand() * bcol.length)], x + bw / 2, y0 + 0.02 + bh / 2, 0.02);
        x += bw + 0.006; if (rand() < 0.1) x += 0.14;
      }
    });
    shelf.position.set(2.2, 0, -3.3); room.add(shelf); tag(shelf, 'bookshelf', 'in'); blob(room, 2.2, -3.2, 0.9, 0.35);

    /* window with curtains (north wall, centre) */
    var win = new THREE.Group();
    bx(win, 2.4, 1.5, 0.06, C.white, 0, 0, 0);
    var glass = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.2), new THREE.MeshBasicMaterial({
      map: canvasTex(256, 128, function (ctx, w, h) {
        var g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#77C0EA'); g.addColorStop(1, '#D6EEF8'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#FFE066'; ctx.beginPath(); ctx.arc(190, 32, 16, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(60, 36, 14, 0, 6.3); ctx.arc(80, 38, 18, 0, 6.3); ctx.arc(102, 40, 12, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#6DBB63'; ctx.fillRect(0, 92, w, 36);
        ctx.fillStyle = '#4E9A4A'; ctx.beginPath(); ctx.moveTo(150, 92); ctx.lineTo(176, 50); ctx.lineTo(202, 92); ctx.fill();
        ctx.fillStyle = '#7A5230'; ctx.fillRect(172, 88, 8, 14);
      })
    }));
    glass.position.z = 0.035; win.add(glass);
    bx(win, 0.05, 1.2, 0.04, C.white, 0, 0, 0.04); bx(win, 2.1, 0.05, 0.04, C.white, 0, 0, 0.04); bx(win, 2.6, 0.06, 0.2, C.white, 0, -0.78, 0.08);
    win.position.set(-0.5, 1.6, -3.46); room.add(win); tag(win, 'window', 'in');
    function mkCurtain(x) {
      var g = new THREE.Group();
      for (var i = 0; i < 5; i++) bx(g, 0.11, 1.9, 0.07, i % 2 ? 0xE76F51 : 0xD95D3F, -0.22 + i * 0.11, 0, (i % 2) * 0.05);
      g.position.set(x, 1.5, -3.38); return g;
    }
    var cl1 = mkCurtain(-1.95), cl2 = mkCurtain(0.95); room.add(cl1); room.add(cl2);
    var rod = cy(room, 0.02, 0.02, 3.3, 0x5A3B2A, -0.5, 2.5, -3.38, 8); rod.rotation.z = Math.PI / 2;
    tag(cl1, 'curtain', 'in'); tag(cl2, 'curtain', 'in');

    /* clock (7 o'clock) */
    var clk = new THREE.Group();
    var rim = cy(clk, 0.26, 0.26, 0.05, 0x2B2B2B, 0, 0, 0, 28); rim.rotation.x = Math.PI / 2;
    var face = new THREE.Mesh(new THREE.CircleGeometry(0.23, 32), new THREE.MeshBasicMaterial({
      map: canvasTex(128, 128, function (ctx, w, h) {
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#222'; ctx.fillStyle = '#222';
        for (var i = 0; i < 12; i++) { var a = i / 12 * Math.PI * 2; ctx.lineWidth = i % 3 === 0 ? 5 : 2; ctx.beginPath(); ctx.moveTo(64 + Math.sin(a) * 52, 64 - Math.cos(a) * 52); ctx.lineTo(64 + Math.sin(a) * 60, 64 - Math.cos(a) * 60); ctx.stroke(); }
      })
    }));
    face.position.z = 0.028; clk.add(face);
    var hh = new THREE.Group(); bx(hh, 0.025, 0.12, 0.012, 0x222222, 0, 0.06, 0); hh.rotation.z = -(7 / 12) * Math.PI * 2; hh.position.z = 0.04; clk.add(hh);
    var mh = new THREE.Group(); bx(mh, 0.018, 0.18, 0.012, 0x222222, 0, 0.09, 0); mh.position.z = 0.045; clk.add(mh);
    sp(clk, 0.016, 0xE63946, 0, 0, 0.05);
    clk.position.set(-0.5, 2.68, -3.46); room.add(clk); tag(clk, 'clock', 'in');

    /* picture frame */
    var pic = new THREE.Group();
    bx(pic, 0.95, 0.75, 0.05, 0x7A4B2A, 0, 0, 0);
    var art = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshBasicMaterial({
      map: canvasTex(200, 150, function (ctx, w, h) {
        ctx.fillStyle = '#F6D186'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#FF8C42'; ctx.beginPath(); ctx.arc(150, 46, 22, 0, 6.3); ctx.fill();
        ctx.fillStyle = '#3D5A80'; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(50, 60); ctx.lineTo(110, h); ctx.fill();
        ctx.fillStyle = '#5C7FA8'; ctx.beginPath(); ctx.moveTo(60, h); ctx.lineTo(120, 74); ctx.lineTo(w, h); ctx.fill();
        ctx.fillStyle = '#3FA34D'; ctx.fillRect(0, 124, w, 26);
      })
    }));
    art.position.z = 0.03; pic.add(art);
    pic.position.set(-2.75, 1.75, -3.46); room.add(pic); tag(pic, 'frame', 'in');

    /* floor lamp */
    var lamp = new THREE.Group();
    cy(lamp, 0.2, 0.22, 0.04, 0x2F3640, 0, 0.02, 0, 20); cy(lamp, 0.018, 0.018, 1.5, 0x2F3640, 0, 0.78, 0, 8);
    var shade = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 0.4, 24, 1, true), new THREE.MeshLambertMaterial({ color: 0xFFE3A3, emissive: 0xFFC76B, emissiveIntensity: 0.55, side: THREE.DoubleSide }));
    shade.position.y = 1.7; lamp.add(shade); sp(lamp, 0.07, 0xFFF6D8, 0, 1.68, 0);
    lamp.position.set(-3.1, 0, -2.5); room.add(lamp); tag(lamp, 'floorlamp', 'in'); blob(room, -3.1, -2.5, 0.3, 0.3);

    /* plant */
    var plant = new THREE.Group();
    cy(plant, 0.22, 0.17, 0.32, 0x2A9D8F, 0, 0.16, 0, 18); cy(plant, 0.2, 0.2, 0.02, 0x4B3621, 0, 0.32, 0, 18);
    for (var li = 0; li < 9; li++) {
      var pv = new THREE.Group(); pv.rotation.y = li / 9 * Math.PI * 2; pv.position.y = 0.3;
      var lf = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mat(li % 2 ? 0x3FA34D : 0x2E8B57));
      lf.scale.set(0.5, 1.9 + (li % 3) * 0.35, 0.12); lf.position.set(0.12, 0.3 + (li % 3) * 0.12, 0); lf.rotation.z = -0.45; pv.add(lf); plant.add(pv);
    }
    plant.position.set(3.0, 0, -2.4); room.add(plant); tag(plant, 'plant', 'in'); blob(room, 3.0, -2.4, 0.3, 0.3);

    /* ceiling light */
    var cl = new THREE.Group();
    cy(cl, 0.5, 0.5, 0.06, 0xFFF3D6, 0, 0, 0, 28); var cm = cl.children[0]; cm.material = new THREE.MeshLambertMaterial({ color: 0xFFF3D6, emissive: 0xFFE9B8, emissiveIntensity: 0.7 });
    var cring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 8, 28), mat(0xBFA77A)); cring.rotation.x = Math.PI / 2; cl.add(cring);
    cl.position.set(-0.8, 2.97, -0.1); room.add(cl); tag(cl, 'ceilinglight', 'in');

    /* ================= extra zones: shared helpers ================= */
    var ANCHX = [], NAVX = [];
    var ZX = { kitchen: -7, bed: -7, study: 0, hall: 5.5, bath: 9, land: 5.5, kids: 9 };
    var ZY = { bed: SH, study: SH, land: SH, kids: SH };
    var ZW = { hall: 4, bath: 3, land: 4, kids: 3 };
    function A(id, zone, x, y, z) { ANCHX.push([id, zone, x + (ZX[zone] || 0), (ZY[zone] || 0) + y, z]); }
    function NAV(zone, text, target, x, y, z) { NAVX.push([zone, text, target, x, y, z]); }
    function mkRoom(zone) {
      var g = new THREE.Group(); g.position.set(ZX[zone] || 0, ZY[zone] || 0, 0); scene.add(g);
      roomShell(g, ZW[zone] || 7, zone, !!ZY[zone], zone === 'land' ? [0.7, 1.9, -0.6, 2.3] : null);
      return g;
    }
    /* interior doors: a leaf hinged at one side, clickable from both rooms */
    var DOORS = {};
    function mkDoor(id, x, y, z, w, along, ang, zA, zB) {
      var piv = new THREE.Group(); piv.position.set(x, y, z); house.add(piv);
      var leaf = along === 'z' ? bx(piv, 0.05, 2.1, w - 0.06, 0x9A6339, 0, 1.05, w / 2) : bx(piv, w - 0.06, 2.1, 0.05, 0x9A6339, w / 2, 1.05, 0);
      var pnl = along === 'z' ? bx(piv, 0.07, 1.5, w - 0.4, 0xB57B4A, 0, 1.1, w / 2) : bx(piv, w - 0.4, 1.5, 0.07, 0xB57B4A, w / 2, 1.1, 0);
      var hd = along === 'z' ? sp(piv, 0.045, C.gold, 0.06, 1.05, w - 0.14) : sp(piv, 0.045, C.gold, w - 0.14, 1.05, 0.06);
      var map = {}; map[zA[0]] = zA[1]; map[zB[0]] = zB[1];
      [leaf, pnl, hd].forEach(function (m) { m.userData.navMap = map; PICK.push(m); });
      DOORS[id] = { pivot: piv, ang: ang };
    }
    mkDoor('d_lk', -3.5, 0, 1.75, 1.1, 'z', -Math.PI / 2, ['in', 'kitchen'], ['kitchen', 'in']);
    mkDoor('d_lh', 3.5, 0, 1.75, 1.1, 'z', Math.PI / 2, ['in', 'hall'], ['hall', 'in']);
    mkDoor('d_hb', 7.5, 0, -2.5, 1.0, 'z', Math.PI / 2, ['hall', 'bath'], ['bath', 'hall']);
    mkDoor('d_back', 4.15, 0, -3.55, 1.1, 'x', Math.PI / 2, ['hall', 'back'], ['back', 'hall']);
    mkDoor('d_bs', -3.5, SH, 1.75, 1.1, 'z', Math.PI / 2, ['bed', 'study'], ['study', 'bed']);
    mkDoor('d_sl', 3.5, SH, 1.75, 1.1, 'z', Math.PI / 2, ['study', 'land'], ['land', 'study']);
    mkDoor('d_lk2', 7.5, SH, -2.5, 1.0, 'z', Math.PI / 2, ['land', 'kids'], ['kids', 'land']);
    function lab(g, w, h, d, c, x, y, z, ry) { return bx(g, w, h, d, c, x, y, z, ry); }

    /* ================= front yard additions ================= */
    (function () {
      /* swimming pool (right side) */
      var pool = new THREE.Group();
      bx(pool, 4.6, 0.14, 3.4, 0xE6E0D2, 0, 0.07, 0);
      var wtr = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 2.7), new THREE.MeshBasicMaterial({
        map: canvasTex(128, 96, function (ctx, w, h) {
          var g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#4FC3F7'); g.addColorStop(1, '#0288D1'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2;
          for (var i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(8 + i * 20, 20 + (i % 2) * 30); ctx.quadraticCurveTo(18 + i * 20, 10 + (i % 3) * 25, 30 + i * 20, 24 + (i % 2) * 30); ctx.stroke(); }
        })
      }));
      wtr.rotation.x = -Math.PI / 2; wtr.position.y = 0.155; pool.add(wtr);
      [[-0.5, 1.6], [0.5, 1.6]].forEach(function (p) { cy(pool, 0.03, 0.03, 0.5, 0xC0C7CC, p[0] > 0 ? 2.05 : 2.05, 0.38, p[0] * 0.9, 8); });
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 8, 16), mat(0xFF6B6B)); ring.rotation.x = Math.PI / 2; ring.position.set(0.7, 0.2, 0.2); pool.add(ring);
      pool.position.set(6.2, 0, 7.6); world.add(pool); tag(pool, 'pool', 'out');
      /* pool fence */
      var pf = new THREE.Group();
      for (var i = 0; i < 12; i++) { bx(pf, 0.08, 0.7, 0.04, C.white, 3.9 + i * 0.4, 0.35, 9.55); }
      for (var j = 0; j < 8; j++) { bx(pf, 0.04, 0.7, 0.08, C.white, 3.9, 0.35, 6.0 + j * 0.45); }
      bx(pf, 4.7, 0.06, 0.04, C.white, 6.15, 0.5, 9.55); bx(pf, 0.04, 0.06, 3.6, C.white, 3.9, 0.5, 7.8);
      world.add(pf); tag(pf, 'fence', 'out');
      /* car (left side) */
      var car = new THREE.Group();
      bx(car, 3.6, 0.6, 1.6, 0xD7263D, 0, 0.55, 0); bx(car, 2.0, 0.55, 1.5, 0xD7263D, -0.1, 1.1, 0);
      bx(car, 1.7, 0.4, 1.52, 0x9ED2EA, -0.1, 1.12, 0); bx(car, 0.05, 0.4, 1.6, 0xB9202F, -0.1, 1.12, 0);
      [[-1.1, 0.82], [1.1, 0.82], [-1.1, -0.82], [1.1, -0.82]].forEach(function (p) {
        var w = cy(car, 0.33, 0.33, 0.22, 0x23282D, p[0], 0.33, p[1], 16); w.rotation.x = Math.PI / 2; var hub = cy(car, 0.14, 0.14, 0.24, 0xC0C7CC, p[0], 0.33, p[1], 10); hub.rotation.x = Math.PI / 2;
      });
      sp(car, 0.12, 0xFFF3B0, 1.8, 0.65, 0.5); sp(car, 0.12, 0xFFF3B0, 1.8, 0.65, -0.5); bx(car, 0.04, 0.2, 0.3, 0xE63946, -1.82, 0.65, 0.5); bx(car, 0.04, 0.2, 0.3, 0xE63946, -1.82, 0.65, -0.5);
      car.position.set(-6.3, 0, 8.6); car.rotation.y = 0.35; world.add(car); tag(car, 'car', 'out'); blob(world, -6.3, 8.6, 2.0, 1.0);
      /* bicycle (leaning near the path) */
      var bike = new THREE.Group();
      [-0.55, 0.55].forEach(function (x) { var t = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.03, 8, 20), mat(0x23282D)); t.position.set(x, 0.37, 0); bike.add(t); });
      var fr = [[-0.55, 0.37, -0.05, 0.62, 0.65], [0.55, 0.37, 0.05, 0.62, 0.65]];
      var b1 = bx(bike, 1.2, 0.04, 0.04, 0x2E86AB, 0, 0.62, 0); var b2 = bx(bike, 0.7, 0.04, 0.04, 0x2E86AB, -0.15, 0.5, 0); b2.rotation.z = 0.6;
      var b3 = bx(bike, 0.04, 0.5, 0.04, 0x2E86AB, 0.55, 0.62, 0); b3.rotation.z = -0.25;
      bx(bike, 0.28, 0.05, 0.12, 0x23282D, -0.45, 0.82, 0); bx(bike, 0.04, 0.04, 0.5, 0x23282D, 0.62, 0.9, 0);
      bike.position.set(-2.6, 0, 7.2); bike.rotation.y = 1.0; world.add(bike); tag(bike, 'bicycle', 'out'); blob(world, -2.6, 7.2, 0.9, 0.3);
      /* ball and flowers */
      var ball = new THREE.Group(); sp(ball, 0.22, 0xFFFFFF, 0, 0.22, 0); [[0.14, 0.34, 0.1], [-0.12, 0.2, 0.14], [0.05, 0.12, -0.2]].forEach(function (p) { sp(ball, 0.07, 0x23282D, p[0], p[1], p[2]); });
      ball.position.set(2.7, 0, 8.4); world.add(ball); tag(ball, 'ball', 'out'); blob(world, 2.7, 8.4, 0.3, 0.3);
      var fb = new THREE.Group(); var fc = [0xFF6B6B, 0xFFD93D, 0xFF9FF3, 0xFF8C42, 0xFF6B6B];
      bx(fb, 2.2, 0.15, 0.7, 0x5A3B2A, 0, 0.075, 0);
      for (var q = 0; q < 5; q++) { bx(fb, 0.02, 0.6, 0.02, 0x3B7D3A, -0.8 + q * 0.4, 0.4, (q % 2) * 0.1); sp(fb, 0.14, fc[q], -0.8 + q * 0.4, 0.75, (q % 2) * 0.1); sp(fb, 0.05, 0xFFF3B0, -0.8 + q * 0.4, 0.75, 0.12 + (q % 2) * 0.1); }
      fb.position.set(3.3, 0, 5.3); world.add(fb); tag(fb, 'flower', 'out');
      A('pool', 'out', 6.2, 1.5, 7.6); A('car', 'out', -6.3, 1.9, 8.6); A('bicycle', 'out', -2.6, 1.3, 7.2);
      A('fence', 'out', 4.3, 1.1, 9.55); A('ball', 'out', 2.7, 0.7, 8.4); A('flower', 'out', 3.3, 1.3, 5.3);
    })();
    /* ================= bedroom ================= */
    (function () {
      var r = mkRoom('bed', 0xCFE6D8, 0xD9B98A, 0xFFE0C0);
      var rug = cy(r, 1.5, 1.5, 0.02, 0xF4B6C2, 0, 0.012, 0.6, 32);
      /* bed against the north wall */
      var bed = new THREE.Group();
      bx(bed, 1.8, 0.3, 2.2, 0x8A5A3B, 0, 0.25, 0); bx(bed, 1.8, 1.0, 0.1, 0x8A5A3B, 0, 0.7, -1.1);
      bx(bed, 1.7, 0.22, 2.1, 0xFFFFFF, 0, 0.5, 0.0);
      bx(bed, 1.74, 0.12, 1.3, 0x4D96FF, 0, 0.62, 0.4);                 /* blanket */
      bx(bed, 1.74, 0.13, 0.12, 0x2F6FD6, 0, 0.66, -0.2);               /* blanket fold */
      bed.position.set(1.0, 0, -2.3); r.add(bed); tag(bed, 'bed', 'bed');
      var pl = new THREE.Group();
      [-0.42, 0.42].forEach(function (x) { bx(pl, 0.7, 0.16, 0.42, 0xFFF5E6, x, 0, 0); });
      pl.position.set(1.0, 0.68, -3.0); pl.rotation.x = -0.15; r.add(pl); tag(pl, 'pillow', 'bed');
      var bl = bx(r, 1.76, 0.14, 1.32, 0x4D96FF, 1.0, 0.7, -1.9); bl.userData.wordId = 'blanket'; bl.userData.zone = 'bed'; PICK.push(bl);
      /* teddy bear on the bed */
      var ted = new THREE.Group();
      sp(ted, 0.2, 0xB5835A, 0, 0.2, 0, 1, 1.1, 0.9); sp(ted, 0.15, 0xB5835A, 0, 0.5, 0); sp(ted, 0.06, 0xB5835A, -0.12, 0.62, 0); sp(ted, 0.06, 0xB5835A, 0.12, 0.62, 0);
      sp(ted, 0.06, 0xE8C9A5, 0, 0.47, 0.12); sp(ted, 0.025, 0x23282D, 0, 0.5, 0.15); sp(ted, 0.02, 0x23282D, -0.05, 0.54, 0.13); sp(ted, 0.02, 0x23282D, 0.05, 0.54, 0.13);
      sp(ted, 0.07, 0xB5835A, -0.2, 0.25, 0.05); sp(ted, 0.07, 0xB5835A, 0.2, 0.25, 0.05); sp(ted, 0.08, 0xB5835A, -0.1, 0.02, 0.1); sp(ted, 0.08, 0xB5835A, 0.1, 0.02, 0.1);
      bx(ted, 0.22, 0.05, 0.02, 0xE63946, 0, 0.36, 0.1);
      ted.position.set(1.7, 0.7, -1.6); ted.rotation.y = -0.4; r.add(ted); tag(ted, 'teddy', 'bed');
      /* nightstand + alarm clock + lamp */
      var ns = new THREE.Group();
      bx(ns, 0.6, 0.6, 0.5, 0xA9744F, 0, 0.35, 0); bx(ns, 0.5, 0.2, 0.02, 0x8A5A3B, 0, 0.5, 0.26); bx(ns, 0.5, 0.2, 0.02, 0x8A5A3B, 0, 0.22, 0.26);
      sp(ns, 0.02, C.gold, 0, 0.5, 0.28); sp(ns, 0.02, C.gold, 0, 0.22, 0.28);
      ns.position.set(-0.4, 0, -3.15); r.add(ns); tag(ns, 'nightstand', 'bed');
      var ac = new THREE.Group();
      cy(ac, 0.11, 0.11, 0.07, 0xFFD93D, 0, 0.12, 0, 20).rotation.x = Math.PI / 2;
      var cf = new THREE.Mesh(new THREE.CircleGeometry(0.085, 20), mat(0xFFFFFF)); cf.position.set(0, 0.12, 0.04); ac.add(cf);
      bx(ac, 0.012, 0.06, 0.01, 0x23282D, 0, 0.145, 0.045); bx(ac, 0.01, 0.045, 0.01, 0xE63946, 0.02, 0.125, 0.045);
      sp(ac, 0.035, 0xE63946, -0.09, 0.24, 0); sp(ac, 0.035, 0xE63946, 0.09, 0.24, 0); sp(ac, 0.03, 0x23282D, 0, 0.0, 0);
      ac.position.set(-0.5, 0.65, -3.1); r.add(ac); tag(ac, 'alarmclock', 'bed');
      var bl2 = new THREE.Group(); cy(bl2, 0.07, 0.07, 0.03, 0x2F3640, 0, 0.015, 0, 14); cy(bl2, 0.012, 0.012, 0.25, 0x2F3640, 0, 0.15, 0, 6);
      var sh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 18, 1, true), new THREE.MeshLambertMaterial({ color: 0xFFE3A3, emissive: 0xFFC76B, emissiveIntensity: 0.55, side: THREE.DoubleSide })); sh.position.y = 0.36; bl2.add(sh);
      bl2.position.set(-0.25, 0.65, -3.25); r.add(bl2);
      /* wardrobe on the west wall */
      var wd = new THREE.Group();
      bx(wd, 0.7, 2.4, 2.2, 0x9C6B45, 0, 1.2, 0); bx(wd, 0.04, 2.2, 1.0, 0xB48257, 0.37, 1.2, -0.52); bx(wd, 0.04, 2.2, 1.0, 0xB48257, 0.37, 1.2, 0.52);
      sp(wd, 0.035, C.gold, 0.4, 1.2, -0.08); sp(wd, 0.035, C.gold, 0.4, 1.2, 0.08); bx(wd, 0.76, 0.06, 2.26, 0x7A4B2A, 0, 2.43, 0);
      wd.position.set(-3.1, 0, -0.6); r.add(wd); tag(wd, 'wardrobe', 'bed');
      /* mirror on the east wall */
      var mr = new THREE.Group();
      bx(mr, 0.06, 1.9, 0.9, 0xC9A04A, 0, 0, 0);
      var mg = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.7), new THREE.MeshBasicMaterial({ color: 0xDDF3FA })); mg.rotation.y = -Math.PI / 2; mg.position.x = -0.035; mr.add(mg);
      var sh2 = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 1.5), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.5 })); sh2.rotation.y = -Math.PI / 2; sh2.position.set(-0.04, 0, 0.15); mr.add(sh2);
      mr.position.set(3.44, 1.05, 0.8); r.add(mr); tag(mr, 'mirror', 'bed');
      /* slippers */
      var sl = new THREE.Group();
      [-0.16, 0.16].forEach(function (x) { var s = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 8), mat(0xFF8FA3)); s.scale.set(0.9, 0.45, 1.8); s.position.set(x, 0.06, 0); sl.add(s); sp(sl, 0.08, 0xFFFFFF, x, 0.1, 0.1); });
      sl.position.set(2.4, 0, -0.5); sl.rotation.y = 0.4; r.add(sl); tag(sl, 'slippers', 'bed');
      /* window with moon */
      bx(r, 1.4, 1.2, 0.05, 0xFFFFFF, -2.2, 1.7, -3.47); bx(r, 1.2, 1.0, 0.06, 0x2B3A67, -2.2, 1.7, -3.46); sp(r, 0.14, 0xFFF3B0, -2.0, 1.85, -3.42);
      A('bed', 'bed', 1.0, 1.4, -2.3); A('pillow', 'bed', 1.0, 1.15, -3.0); A('blanket', 'bed', 1.0, 1.0, -1.9); A('teddy', 'bed', 1.7, 1.45, -1.6);
      A('nightstand', 'bed', -0.4, 0.85, -3.15); A('alarmclock', 'bed', -0.5, 1.2, -3.1); A('wardrobe', 'bed', -3.1, 2.7, -0.6);
      A('mirror', 'bed', 3.4, 2.2, 0.8); A('slippers', 'bed', 2.4, 0.5, -0.5);
    })();
    /* ================= study ================= */
    (function () {
      var r = mkRoom('study', 0xE6DDF2, 0xB98B5E, 0xFFF0C8);
      bx(r, 3.0, 0.02, 2.0, 0x6C7AE0, 0, 0.011, 0.2); bx(r, 2.6, 0.022, 1.6, 0xA9B4F5, 0, 0.012, 0.2);
      /* desk */
      var dk = new THREE.Group();
      bx(dk, 2.4, 0.07, 0.95, 0xA9744F, 0, 0.75, 0);
      [[-1.1, -0.4], [1.1, -0.4], [-1.1, 0.4], [1.1, 0.4]].forEach(function (p) { bx(dk, 0.07, 0.72, 0.07, 0x7A4B2A, p[0], 0.36, p[1]); });
      bx(dk, 0.7, 0.55, 0.85, 0x8A5A3B, 0.8, 0.45, 0); bx(dk, 0.6, 0.15, 0.02, 0xA9744F, 0.8, 0.6, 0.43); bx(dk, 0.6, 0.15, 0.02, 0xA9744F, 0.8, 0.35, 0.43);
      dk.position.set(-0.5, 0, -3.0); r.add(dk); tag(dk, 'desk', 'study');
      /* chair */
      var ch = new THREE.Group();
      bx(ch, 0.6, 0.08, 0.6, 0x2A9D8F, 0, 0.5, 0); bx(ch, 0.6, 0.65, 0.08, 0x2A9D8F, 0, 0.9, 0.3);
      [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].forEach(function (p) { bx(ch, 0.05, 0.5, 0.05, 0x23282D, p[0], 0.25, p[1]); });
      ch.position.set(-0.5, 0, -2.1); ch.rotation.y = 0.15; r.add(ch); tag(ch, 'chair', 'study');
      /* laptop */
      var lp = new THREE.Group();
      bx(lp, 0.5, 0.025, 0.34, 0x9AA5AD, 0, 0.0125, 0); bx(lp, 0.46, 0.012, 0.22, 0x23282D, 0, 0.03, 0.03);
      var scr = bx(lp, 0.5, 0.33, 0.015, 0x9AA5AD, 0, 0.19, -0.17); scr.rotation.x = -0.25;
      var sg = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.27), new THREE.MeshBasicMaterial({ color: 0x6EC1F0 })); sg.position.set(0, 0.19, -0.16); sg.rotation.x = -0.25; lp.add(sg);
      lp.position.set(-0.7, 0.785, -3.0); r.add(lp); tag(lp, 'laptop', 'study');
      /* desk lamp */
      var dl = new THREE.Group();
      cy(dl, 0.1, 0.12, 0.03, 0xE63946, 0, 0.015, 0, 18); var arm = bx(dl, 0.03, 0.45, 0.03, 0xE63946, 0, 0.25, 0); arm.rotation.z = 0.2;
      var hd = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.2, 18, 1, true), new THREE.MeshLambertMaterial({ color: 0xE63946, emissive: 0xFFC76B, emissiveIntensity: 0.4, side: THREE.DoubleSide })); hd.position.set(-0.05, 0.5, 0); hd.rotation.z = 0.6; dl.add(hd);
      sp(dl, 0.05, 0xFFF6D8, -0.1, 0.45, 0);
      dl.position.set(-1.45, 0.785, -3.2); r.add(dl); tag(dl, 'desklamp', 'study');
      /* notebook + pencils */
      var nb = new THREE.Group(); bx(nb, 0.3, 0.03, 0.4, 0xFF8C42, 0, 0.015, 0); bx(nb, 0.27, 0.012, 0.37, 0xFFFFFF, 0.01, 0.036, 0); bx(nb, 0.03, 0.04, 0.4, 0x23282D, -0.15, 0.02, 0);
      nb.position.set(0.0, 0.785, -2.85); nb.rotation.y = 0.2; r.add(nb); tag(nb, 'notebook', 'study');
      var pc = new THREE.Group(); bx(pc, 0.02, 0.012, 0.22, 0xFFD93D, 0, 0.006, 0); var tipM = bx(pc, 0.016, 0.012, 0.03, 0xE8C9A5, 0, 0.006, 0.125); bx(pc, 0.018, 0.013, 0.02, 0xFF6B6B, 0, 0.006, -0.12);
      pc.position.set(0.3, 0.79, -2.7); pc.rotation.y = 0.9; r.add(pc); tag(pc, 'pencil', 'study');
      /* globe */
      var gl = new THREE.Group();
      cy(gl, 0.1, 0.12, 0.03, 0x5A3B2A, 0, 0.015, 0, 16); cy(gl, 0.012, 0.012, 0.3, 0x5A3B2A, 0, 0.17, 0, 6);
      var gb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 14), new THREE.MeshLambertMaterial({ map: canvasTex(256, 128, function (ctx, w, h) {
        ctx.fillStyle = '#4FA3E0'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#6DBB63';
        [[30, 30, 40, 24], [90, 70, 30, 34], [150, 40, 50, 26], [200, 80, 28, 18], [230, 40, 18, 12]].forEach(function (p) { ctx.beginPath(); ctx.ellipse(p[0], p[1], p[2], p[3], 0, 0, 6.3); ctx.fill(); });
      }) })); gb.position.y = 0.36; gb.rotation.z = 0.4; gl.add(gb);
      gl.position.set(0.55, 0.785, -3.2); r.add(gl); tag(gl, 'globe', 'study');
      /* backpack on the floor */
      var bp = new THREE.Group();
      bx(bp, 0.4, 0.5, 0.2, 0xF2994A, 0, 0.3, 0); bx(bp, 0.32, 0.25, 0.08, 0xE67E22, 0, 0.2, 0.13); bx(bp, 0.28, 0.06, 0.03, 0x23282D, 0, 0.35, 0.16);
      bx(bp, 0.04, 0.4, 0.05, 0x23282D, -0.12, 0.3, -0.12); bx(bp, 0.04, 0.4, 0.05, 0x23282D, 0.12, 0.3, -0.12); bx(bp, 0.12, 0.03, 0.04, 0xE63946, 0, 0.55, 0);
      bp.position.set(1.2, 0, -2.4); bp.rotation.y = -0.4; r.add(bp); tag(bp, 'backpack', 'study');
      /* wall poster (decor) */
      bx(r, 1.2, 0.8, 0.04, 0xFFFFFF, 2.2, 1.8, -3.47); bx(r, 1.08, 0.68, 0.045, 0xFFD93D, 2.2, 1.8, -3.46); bx(r, 0.7, 0.1, 0.05, 0x3D5A80, 2.2, 1.9, -3.45);
      A('desk', 'study', -0.5, 1.1, -3.0); A('chair', 'study', -0.5, 1.45, -2.1); A('laptop', 'study', -0.7, 1.25, -3.0);
      A('desklamp', 'study', -1.5, 1.6, -3.2); A('notebook', 'study', 0.0, 1.0, -2.85); A('pencil', 'study', 0.3, 0.95, -2.7);
      A('globe', 'study', 0.55, 1.4, -3.2); A('backpack', 'study', 1.2, 0.85, -2.4);
    })();
    /* ================= kitchen ================= */
    (function () {
      var r = mkRoom('kitchen', 0xFFF1C9, 0xE9E4DA, 0xFFF4DA);
      /* base units + worktop along the north wall */
      bx(r, 5.0, 0.85, 0.65, 0xF2F4F5, -1.0, 0.425, -3.15);
      for (var i = 0; i < 6; i++) { bx(r, 0.7, 0.6, 0.02, 0x7FB8D6, -3.1 + i * 0.84, 0.45, -2.82); sp(r, 0.025, 0x555555, -2.85 + i * 0.84, 0.6, -2.80); }
      bx(r, 5.0, 0.06, 0.7, 0x6B7A86, -1.0, 0.88, -3.12);
      /* sink */
      var sk = new THREE.Group();
      bx(sk, 0.8, 0.02, 0.5, 0xC9D1D6, 0, 0, 0); bx(sk, 0.7, 0.012, 0.4, 0x8FA0AB, 0, 0.012, 0);
      cy(sk, 0.025, 0.025, 0.28, 0xC9D1D6, 0, 0.14, -0.22, 8); var sp2 = cy(sk, 0.02, 0.02, 0.2, 0xC9D1D6, 0, 0.27, -0.12, 8); sp2.rotation.x = Math.PI / 2;
      sk.position.set(-2.6, 0.91, -3.1); r.add(sk); tag(sk, 'sink', 'kitchen');
      /* stove */
      var sv = new THREE.Group();
      bx(sv, 0.8, 0.05, 0.62, 0x23282D, 0, 0, 0);
      [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]].forEach(function (p) { var b = cy(sv, 0.1, 0.1, 0.02, 0x4A525A, p[0], 0.03, p[1], 20); cy(sv, 0.04, 0.04, 0.025, 0xE63946, p[0], 0.04, p[1], 12); });
      sv.position.set(-0.7, 0.93, -3.1); r.add(sv); tag(sv, 'stove', 'kitchen');
      /* pot + kettle on the stove */
      var pt = new THREE.Group();
      cy(pt, 0.13, 0.13, 0.2, 0x9AA5AD, 0, 0.1, 0, 20); cy(pt, 0.14, 0.14, 0.02, 0x7C8790, 0, 0.21, 0, 20); sp(pt, 0.03, 0x23282D, 0, 0.25, 0); bx(pt, 0.12, 0.03, 0.03, 0x23282D, 0.22, 0.17, 0);
      pt.position.set(-0.9, 0.98, -3.25); r.add(pt); tag(pt, 'pot', 'kitchen');
      var kt = new THREE.Group();
      var kb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), mat(0x3A86FF)); kb.scale.y = 0.85; kb.position.y = 0.11; kt.add(kb);
      cy(kt, 0.03, 0.05, 0.06, 0x3A86FF, 0, 0.23, 0, 10); var sps = cy(kt, 0.015, 0.025, 0.14, 0x3A86FF, 0.15, 0.14, 0, 8); sps.rotation.z = -0.8;
      var kh = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 14, Math.PI), mat(0x23282D)); kh.position.set(-0.02, 0.2, 0); kt.add(kh);
      kt.position.set(-0.45, 0.98, -3.1); r.add(kt); tag(kt, 'kettle', 'kitchen');
      /* microwave */
      var mw = new THREE.Group();
      bx(mw, 0.55, 0.32, 0.4, 0xE5E9EB, 0, 0.16, 0); bx(mw, 0.36, 0.24, 0.02, 0x23282D, -0.06, 0.16, 0.205); bx(mw, 0.1, 0.24, 0.02, 0x9AA5AD, 0.17, 0.16, 0.205); sp(mw, 0.02, 0x4CD964, 0.17, 0.26, 0.22);
      mw.position.set(0.7, 0.91, -3.1); r.add(mw); tag(mw, 'microwave', 'kitchen');
      /* upper cabinets */
      var cb = new THREE.Group();
      bx(cb, 2.4, 0.8, 0.4, 0xF2F4F5, 0, 0, 0); for (var k = 0; k < 3; k++) { bx(cb, 0.76, 0.7, 0.02, 0xFFB347, -0.8 + k * 0.8, 0, 0.21); sp(cb, 0.025, 0x555555, -0.6 + k * 0.8, -0.2, 0.23); }
      cb.position.set(-1.9, 2.0, -3.28); r.add(cb); tag(cb, 'cabinet', 'kitchen');
      /* fridge */
      var fg = new THREE.Group();
      bx(fg, 0.95, 1.95, 0.8, 0xF4F6F7, 0, 0.975, 0); bx(fg, 0.93, 0.015, 0.01, 0xB8C0C5, 0, 1.38, 0.405);
      bx(fg, 0.04, 0.4, 0.05, 0x9AA5AD, 0.38, 1.7, 0.42); bx(fg, 0.04, 0.6, 0.05, 0x9AA5AD, 0.38, 0.9, 0.42);
      bx(fg, 0.2, 0.2, 0.01, 0xFFD93D, -0.2, 1.65, 0.41); bx(fg, 0.15, 0.2, 0.01, 0xFF6B9D, 0.0, 1.55, 0.41);
      fg.position.set(2.8, 0, -3.0); r.add(fg); tag(fg, 'fridge', 'kitchen');
      /* dining table with plates, bowl of apples */
      var dt = new THREE.Group();
      bx(dt, 1.7, 0.07, 0.95, 0xC48A58, 0, 0.74, 0);
      [[-0.75, -0.4], [0.75, -0.4], [-0.75, 0.4], [0.75, 0.4]].forEach(function (p) { bx(dt, 0.07, 0.72, 0.07, 0x8A5A3B, p[0], 0.36, p[1]); });
      dt.position.set(0.3, 0, 0.0); r.add(dt); tag(dt, 'diningtable', 'kitchen');
      [[-0.55, 0.2], [-0.55, -0.2]].forEach(function (p) {
        var pl = new THREE.Group(); cy(pl, 0.13, 0.1, 0.02, 0xFFFFFF, 0, 0.01, 0, 22); cy(pl, 0.08, 0.08, 0.005, 0xDDE6EA, 0, 0.022, 0, 18);
        pl.position.set(0.3 + p[0], 0.78, p[1]); r.add(pl); tag(pl, 'plate', 'kitchen');
      });
      var bw = new THREE.Group();
      var bm = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x3A86FF, side: THREE.DoubleSide })); bm.position.y = 0.17; bw.add(bm);
      [[0, 0.1, 0, 0xE63946], [0.08, 0.08, 0.06, 0x7ED957], [-0.07, 0.09, -0.05, 0xE63946], [0.02, 0.17, 0.0, 0xFFD93D]].forEach(function (p) { sp(bw, 0.07, p[3], p[0], p[1] + 0.08, p[2]); });
      bw.position.set(0.55, 0.78, 0.0); r.add(bw); tag(bw, 'bowl', 'kitchen');
      /* chairs (decor) */
      [[-0.2, 0.75], [0.8, 0.75]].forEach(function (p) { var c = new THREE.Group(); bx(c, 0.45, 0.06, 0.45, 0xE76F51, 0, 0.45, 0); bx(c, 0.45, 0.5, 0.06, 0xE76F51, 0, 0.75, 0.2); [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(function (q) { bx(c, 0.04, 0.45, 0.04, 0x8A5A3B, q[0], 0.22, q[1]); }); c.position.set(p[0], 0, p[1]); c.rotation.y = Math.PI; r.add(c); });
      A('sink', 'kitchen', -2.6, 1.3, -3.1); A('stove', 'kitchen', -0.7, 1.3, -3.1); A('pot', 'kitchen', -1.0, 1.55, -3.25); A('kettle', 'kitchen', -0.4, 1.5, -3.1);
      A('microwave', 'kitchen', 0.7, 1.5, -3.1); A('cabinet', 'kitchen', -1.9, 2.6, -3.28); A('fridge', 'kitchen', 2.8, 2.2, -3.0);
      A('diningtable', 'kitchen', 0.1, 0.65, 0.5); A('plate', 'kitchen', -0.25, 1.05, 0.2); A('bowl', 'kitchen', 0.55, 1.1, 0.0);
    })();
    /* ================= back yard farm (z < -14) ================= */
    (function () {
      var f = new THREE.Group(); world.add(f);
      function put(g, id, x, z, ry) { g.position.set(x, 0, z); if (ry) g.rotation.y = ry; f.add(g); tag(g, id, 'back'); }
      /* barn */
      var barn = new THREE.Group();
      bx(barn, 6, 3.2, 5, 0xC0392B, 0, 1.6, 0);
      var bt = new THREE.Shape(); bt.moveTo(-3, 0); bt.lineTo(3, 0); bt.lineTo(0, 1.6); bt.lineTo(-3, 0);
      [2.51, -2.51].forEach(function (z, i) { var m = new THREE.Mesh(new THREE.ShapeGeometry(bt), mat(0xC0392B)); m.position.set(0, 3.2, z); if (i) m.rotation.y = Math.PI; barn.add(m); });
      var ba = Math.atan(1.6 / 3), bsl = Math.sqrt(9 + 2.56);
      var r1 = bx(barn, bsl + 0.3, 0.14, 5.4, 0x6D4C41, -1.5, 4.0, 0); r1.rotation.z = ba; var r2 = bx(barn, bsl + 0.3, 0.14, 5.4, 0x6D4C41, 1.5, 4.0, 0); r2.rotation.z = -ba;
      bx(barn, 2.0, 2.3, 0.1, 0x8B1E14, 0, 1.15, 2.53); bx(barn, 0.1, 2.3, 0.12, 0xFFFFFF, 0, 1.15, 2.56);
      var d1 = bx(barn, 2.3, 0.1, 0.12, 0xFFFFFF, 0, 1.15, 2.57); d1.rotation.z = 0.78; var d2 = bx(barn, 2.3, 0.1, 0.12, 0xFFFFFF, 0, 1.15, 2.57); d2.rotation.z = -0.78;
      bx(barn, 0.7, 0.7, 0.1, 0xFFF3B0, 0, 3.6, 2.55);
      put(barn, 'barn', -9, -27, 0.35); blob(f, -9, -27, 3.6, 3.2);
      /* windmill */
      var wm = new THREE.Group();
      cy(wm, 0.6, 1.1, 6, 0xF2E9D8, 0, 3, 0, 12); var cap = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.2, 12), mat(0xA6513F)); cap.position.y = 6.5; wm.add(cap);
      bx(wm, 0.6, 0.9, 0.1, 0x6D4C41, 0, 0.45, 1.05);
      var rot = new THREE.Group(); rot.position.set(0, 6.0, 1.0); wm.add(rot);
      for (var b = 0; b < 4; b++) { var bl = new THREE.Group(); bl.rotation.z = b * Math.PI / 2 + 0.4; bx(bl, 0.5, 3.2, 0.05, 0xFFFFFF, 0, 1.8, 0); bx(bl, 0.06, 3.2, 0.08, 0x6D4C41, -0.28, 1.8, 0); rot.add(bl); }
      sp(rot, 0.2, 0x6D4C41, 0, 0, 0.1);
      put(wm, 'windmill', 12, -30, -0.4); blob(f, 12, -30, 1.6, 1.6);
      /* tractor */
      var tr = new THREE.Group();
      bx(tr, 1.8, 0.7, 1.0, 0x2E8B57, 0.2, 0.9, 0); bx(tr, 0.8, 0.8, 0.95, 0x2E8B57, -0.55, 1.35, 0); bx(tr, 0.85, 0.05, 1.0, 0x1E5E3B, -0.55, 1.78, 0);
      bx(tr, 0.7, 0.55, 0.02, 0x9ED2EA, -0.55, 1.42, 0.49); bx(tr, 0.7, 0.55, 0.02, 0x9ED2EA, -0.55, 1.42, -0.49); cy(tr, 0.06, 0.06, 0.5, 0x23282D, 0.9, 1.45, 0, 8);
      [[-0.65, 0.4, 0.6], [0.95, 0.4, 0.45]].forEach(function (p) { [0.56, -0.56].forEach(function (z) { var w = cy(tr, p[2], p[2], 0.3, 0x23282D, p[0], p[2], z, 18); w.rotation.x = Math.PI / 2; var h = cy(tr, p[2] * 0.5, p[2] * 0.5, 0.32, 0xF2C14E, p[0], p[2], z, 12); h.rotation.x = Math.PI / 2; }); });
      put(tr, 'tractor', 4.5, -20, 0.6); blob(f, 4.5, -20, 1.6, 1.0);
      /* generic four-legged animal */
      function quad(body, w, l, h, legH, spots) {
        var a = new THREE.Group();
        bx(a, w, h, l, body, 0, legH + h / 2, 0);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) { bx(a, 0.12, legH, 0.12, body === 0xFFFFFF ? 0x6D4C41 : 0x5A3B2A, p[0] * (w / 2 - 0.1), legH / 2, p[1] * (l / 2 - 0.12)); });
        if (spots) spots.forEach(function (s) { bx(a, s[0], 0.02 + h * 0.5, s[1], 0x23282D, s[2] * w / 2, legH + h / 2 + h * 0.255, s[3]); });
        return a;
      }
      /* cow */
      var cow = quad(0xFFFFFF, 0.8, 1.6, 0.8, 0.7, [[0.4, 0.4, 0.2, 0.2], [0.35, 0.5, -0.3, -0.4]]);
      sp(cow, 0.3, 0xFFFFFF, 0, 1.3, 0.95, 1, 1, 1.2); bx(cow, 0.3, 0.2, 0.12, 0xF4A6B7, 0, 1.2, 1.28); bx(cow, 0.05, 0.14, 0.05, 0xEFE6D0, -0.2, 1.65, 0.9); bx(cow, 0.05, 0.14, 0.05, 0xEFE6D0, 0.2, 1.65, 0.9);
      bx(cow, 0.12, 0.2, 0.06, 0xFFFFFF, -0.34, 1.45, 0.95); bx(cow, 0.12, 0.2, 0.06, 0xFFFFFF, 0.34, 1.45, 0.95); sp(cow, 0.04, 0x23282D, -0.12, 1.4, 1.2); sp(cow, 0.04, 0x23282D, 0.12, 1.4, 1.2);
      bx(cow, 0.06, 0.6, 0.06, 0x23282D, 0, 1.0, -0.85); bx(cow, 0.35, 0.14, 0.2, 0xF4A6B7, 0, 0.75, 0.2);
      put(cow, 'cow', -2.6, -22, 0.5); blob(f, -2.6, -22, 0.8, 1.1);
      /* pig */
      var pig = quad(0xF8B6C1, 0.7, 1.0, 0.65, 0.3, null);
      sp(pig, 0.26, 0xF8B6C1, 0, 0.78, 0.6); cy(pig, 0.1, 0.1, 0.1, 0xF08CA0, 0, 0.72, 0.84, 12).rotation.x = Math.PI / 2;
      bx(pig, 0.1, 0.12, 0.04, 0xF08CA0, -0.16, 1.05, 0.55); bx(pig, 0.1, 0.12, 0.04, 0xF08CA0, 0.16, 1.05, 0.55); sp(pig, 0.03, 0x23282D, -0.1, 0.85, 0.82); sp(pig, 0.03, 0x23282D, 0.1, 0.85, 0.82);
      var tl = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 6, 12, Math.PI * 1.6), mat(0xF08CA0)); tl.position.set(0, 0.8, -0.52); pig.add(tl);
      put(pig, 'pig', 1.0, -24, -0.6); blob(f, 1, -24, 0.55, 0.7);
      /* chicken */
      var ck = new THREE.Group();
      sp(ck, 0.2, 0xFFFFFF, 0, 0.35, 0, 1, 1, 1.3); sp(ck, 0.11, 0xFFFFFF, 0, 0.62, 0.17); bx(ck, 0.04, 0.05, 0.12, 0xF2A33C, 0, 0.6, 0.3); bx(ck, 0.03, 0.1, 0.06, 0xE63946, 0, 0.74, 0.17); bx(ck, 0.04, 0.05, 0.04, 0xE63946, 0, 0.55, 0.28);
      bx(ck, 0.04, 0.3, 0.14, 0xFFFFFF, 0, 0.5, -0.28).rotation.x = -0.6; sp(ck, 0.02, 0x23282D, -0.05, 0.64, 0.25); sp(ck, 0.02, 0x23282D, 0.05, 0.64, 0.25);
      bx(ck, 0.025, 0.2, 0.025, 0xF2A33C, -0.07, 0.1, 0); bx(ck, 0.025, 0.2, 0.025, 0xF2A33C, 0.07, 0.1, 0);
      put(ck, 'chicken', -0.4, -17.2, 0.4); blob(f, -0.4, -17.2, 0.25, 0.3);
      /* sheep */
      var sh = quad(0xF5F1E6, 0.8, 1.0, 0.7, 0.4, null);
      [[0, 0.85, 0, 0.5], [0.3, 0.8, 0.1, 0.35], [-0.3, 0.8, 0.1, 0.35], [0, 0.8, -0.35, 0.38], [0, 0.85, 0.35, 0.3]].forEach(function (p) { sp(sh, p[3] * 0.8, 0xFFFFFF, p[0], p[1] + 0.1, p[2]); });
      sp(sh, 0.18, 0x3B3B3B, 0, 0.95, 0.65, 1, 1, 1.15); sp(sh, 0.04, 0xFFFFFF, -0.1, 1.0, 0.8); sp(sh, 0.04, 0xFFFFFF, 0.1, 1.0, 0.8);
      put(sh, 'sheep', -6, -18.5, -0.4); blob(f, -6, -18.5, 0.7, 0.7);
      /* scarecrow */
      var sc = new THREE.Group();
      bx(sc, 0.08, 2.2, 0.08, 0x6D4C41, 0, 1.1, 0); bx(sc, 1.5, 0.08, 0.08, 0x6D4C41, 0, 1.6, 0); bx(sc, 0.5, 0.7, 0.2, 0x3D5A80, 0, 1.4, 0);
      sp(sc, 0.2, 0xF2D3A5, 0, 2.0, 0); cy(sc, 0.3, 0.3, 0.03, 0xB5835A, 0, 2.16, 0, 16); cy(sc, 0.16, 0.16, 0.2, 0xB5835A, 0, 2.28, 0, 16);
      sp(sc, 0.025, 0x23282D, -0.07, 2.02, 0.18); sp(sc, 0.025, 0x23282D, 0.07, 2.02, 0.18); bx(sc, 0.12, 0.03, 0.02, 0xE63946, 0, 1.93, 0.19);
      bx(sc, 0.2, 0.1, 0.1, 0xE8C76B, -0.75, 1.52, 0); bx(sc, 0.2, 0.1, 0.1, 0xE8C76B, 0.75, 1.52, 0);
      put(sc, 'scarecrow', 7.5, -17, 0); blob(f, 7.5, -17, 0.4, 0.4);
      /* hay bales */
      var hy = new THREE.Group();
      [[0, 0.3, 0], [0.9, 0.3, 0.1], [0.45, 0.9, 0.05]].forEach(function (p) { bx(hy, 0.85, 0.6, 0.6, 0xE9C46A, p[0], p[1], p[2]); bx(hy, 0.87, 0.04, 0.62, 0xB8892B, p[0], p[1] + 0.12, p[2]); bx(hy, 0.87, 0.04, 0.62, 0xB8892B, p[0], p[1] - 0.12, p[2]); });
      put(hy, 'hay', -5.8, -23.5, 0.2); blob(f, -5.2, -23.5, 1.1, 0.5);
      /* carrot patch */
      var cp = new THREE.Group();
      bx(cp, 3.4, 0.12, 2.2, 0x6B4A2F, 0, 0.06, 0);
      for (var rr = 0; rr < 3; rr++) for (var cc = 0; cc < 6; cc++) {
        var cx = -1.4 + cc * 0.56, cz = -0.7 + rr * 0.7;
        var cn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 8), mat(0xFF8C1A)); cn.rotation.x = Math.PI; cn.position.set(cx, 0.2, cz); cp.add(cn);
        bx(cp, 0.03, 0.2, 0.03, 0x3FA34D, cx, 0.4, cz); bx(cp, 0.03, 0.18, 0.03, 0x2E8B57, cx + 0.04, 0.38, cz).rotation.z = -0.4;
      }
      put(cp, 'carrot', 3.0, -15.6, 0);
      /* pond */
      var pd = new THREE.Group();
      var pdm = new THREE.Mesh(new THREE.CircleGeometry(2.6, 32), mat(0x4FA3E0)); pdm.rotation.x = -Math.PI / 2; pdm.position.y = 0.03; pdm.scale.set(1.4, 1, 1); pd.add(pdm);
      var edge = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.0, 32), mat(0x9E8B6B)); edge.rotation.x = -Math.PI / 2; edge.position.y = 0.025; edge.scale.set(1.4, 1, 1); pd.add(edge);
      for (var rd = 0; rd < 5; rd++) { cy(pd, 0.02, 0.02, 0.9, 0x6B8E3A, 3.0 + (rd % 2) * 0.1, 0.45, -0.6 + rd * 0.3, 6); sp(pd, 0.06, 0x7A4B2A, 3.0 + (rd % 2) * 0.1, 0.95, -0.6 + rd * 0.3, 0.7, 2, 0.7); }
      var duck = new THREE.Group(); sp(duck, 0.18, 0xFFD93D, 0, 0.15, 0, 1.2, 0.8, 1.6); sp(duck, 0.1, 0xFFD93D, 0, 0.32, 0.25); bx(duck, 0.08, 0.03, 0.1, 0xFF8C42, 0, 0.3, 0.37); duck.position.set(-0.5, 0.05, 0.4); pd.add(duck);
      put(pd, 'pond', -13.5, -15.5, 0);
      /* farm labels */
      A('barn', 'back', -9, 5.0, -27); A('windmill', 'back', 12, 8.2, -30); A('tractor', 'back', 4.5, 2.7, -20); A('cow', 'back', -2.6, 2.2, -22);
      A('pig', 'back', 1.0, 1.4, -24); A('chicken', 'back', -0.4, 1.15, -17.2); A('sheep', 'back', -6, 1.6, -18.5); A('scarecrow', 'back', 7.5, 2.9, -17);
      A('hay', 'back', -5.8, 1.7, -23.5); A('carrot', 'back', 3.0, 0.9, -15.6); A('pond', 'back', -13.5, 0.9, -15.5);
      /* the back fence & field floor (decor) */
      for (var fx = -16; fx <= 16; fx += 0.5) bx(f, 0.1, 0.9, 0.05, 0xFFFFFF, fx, 0.45, -50);
      bx(f, 34, 0.08, 0.05, 0xFFFFFF, 0, 0.3, -50); bx(f, 34, 0.08, 0.05, 0xFFFFFF, 0, 0.7, -50);
    })();

    /* ================= hall + staircase ================= */
    (function () {
      var r = mkRoom('hall');
      /* straight stairs along the east wall: 16 steps from z=3.4 (floor) up to z=-0.6 (upper floor) */
      var st = new THREE.Group(); house.add(st);
      var rise = SH / 16;
      for (var i = 0; i < 16; i++) {
        var h = (i + 1) * rise, zc = 3.4 - 0.25 * (i + 0.5);
        bx(st, 1.2, h, 0.25, 0x9A6339, 6.8, h / 2, zc); bx(st, 1.2, 0.04, 0.29, 0xD1A878, 6.8, h + 0.01, zc - 0.01);
      }
      tag(st, 'stairs', 'hall');
      /* handrail on the open side */
      var hr = new THREE.Group(); house.add(hr);
      [0, 3, 6, 9, 12, 15].forEach(function (i) { var h = (i + 1) * rise, zc = 3.4 - 0.25 * (i + 0.5); cy(hr, 0.03, 0.03, 0.9, 0x5A3B2A, 6.15, h + 0.45, zc, 8); });
      var rl = bx(hr, 0.07, 0.07, 4.9, 0x5A3B2A, 6.15, 2.65, 1.4); rl.rotation.x = Math.atan(3.1 / 3.8);
      tag(hr, 'handrail', 'hall');
      /* shoe cabinet with shoes */
      var sc = new THREE.Group();
      bx(sc, 1.3, 0.95, 0.36, 0x8A5A3B, 0, 0.475, 0); bx(sc, 1.24, 0.04, 0.4, 0xA9744F, 0, 0.97, 0);
      [-0.31, 0.31].forEach(function (x) { bx(sc, 0.58, 0.8, 0.02, 0xA9744F, x, 0.47, 0.19); sp(sc, 0.025, C.gold, x * 0.2 + (x > 0 ? 0.2 : -0.2), 0.47, 0.21); });
      [[-0.3, 0xE63946], [0.3, 0x3A86FF]].forEach(function (p) { var sh = new THREE.Group(); bx(sh, 0.11, 0.08, 0.28, p[1], -0.07, 0.04, 0); bx(sh, 0.11, 0.08, 0.28, p[1], 0.07, 0.04, 0.02); bx(sh, 0.11, 0.015, 0.29, 0xFFFFFF, -0.07, 0.005, 0); bx(sh, 0.11, 0.015, 0.29, 0xFFFFFF, 0.07, 0.005, 0.02); sh.position.set(p[0], 0.99, 0); sc.add(sh); });
      sc.position.set(6.4, 0, -3.25); house.add(sc); tag(sc, 'shoecabinet', 'hall');
      /* umbrella stand with two umbrellas */
      var us = new THREE.Group();
      cy(us, 0.17, 0.15, 0.5, 0x4A6FA5, 0, 0.25, 0, 14);
      [[-0.05, 0xE63946], [0.06, 0xFFD93D]].forEach(function (p, i) {
        cy(us, 0.015, 0.015, 0.9, 0x5A3B2A, p[0], 0.7, i * 0.03, 6); var cn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.35, 8), mat(p[1])); cn.position.set(p[0], 1.05, i * 0.03); us.add(cn);
        sp(us, 0.03, 0x5A3B2A, p[0], 0.22, i * 0.03);
      });
      us.position.set(3.95, 0, -3.15); house.add(us); tag(us, 'umbrella', 'hall');
      /* coat rack on the west wall */
      var cr = new THREE.Group();
      bx(cr, 0.06, 0.14, 1.5, 0x6E4529, 0, 1.75, 0);
      [-0.5, 0, 0.5].forEach(function (z, i) { sp(cr, 0.03, C.gold, 0.06, 1.75, z); bx(cr, 0.1, 0.8, 0.34, [0xD9694F, 0x3D5A80, 0x2A9D8F][i], 0.1, 1.28, z); sp(cr, 0.08, [0xB9523A, 0x2C4466, 0x1F7D72][i], 0.1, 1.72, z); });
      cr.position.set(3.65, 0, -1.2); house.add(cr); tag(cr, 'coatrack', 'hall');
      /* railing around the stair opening upstairs (decor) */
      for (var q = 0; q < 4; q++) cy(house, 0.03, 0.03, 0.95, 0x5A3B2A, 6.15, SH + 0.475, -0.5 + q * 0.95, 8);
      bx(house, 0.06, 0.06, 2.95, 0x5A3B2A, 6.15, SH + 0.95, 0.9);
      [0, 1, 2].forEach(function (q) { cy(house, 0.03, 0.03, 0.95, 0x5A3B2A, 6.2 + q * 0.6, SH + 0.475, 2.3, 8); }); bx(house, 1.3, 0.06, 0.06, 0x5A3B2A, 6.8, SH + 0.95, 2.3);
      A('stairs', 'hall', 1.3, 1.9, 1.5); A('handrail', 'hall', 0.7, 3.1, 0.2); A('shoecabinet', 'hall', 0.9, 1.5, -3.25); A('umbrella', 'hall', -1.55, 1.6, -3.15); A('coatrack', 'hall', -1.85, 2.2, -1.2);
      NAV('hall', '→ Living room 客厅', 'in', 3.45, 2.5, 2.3); NAV('hall', '→ Bathroom 卫生间', 'bath', 7.45, 2.5, -2.0);
      NAV('hall', '↑ Upstairs 上楼', 'land', 6.8, 2.2, 1.0); NAV('hall', '→ Back yard 后院', 'back', 4.7, 2.5, -3.5);
      NAV('in', '→ Kitchen 厨房', 'kitchen', -3.45, 2.5, 2.3); NAV('in', '→ Hall 玄关', 'hall', 3.45, 2.5, 2.3);
      NAV('kitchen', '→ Living room 客厅', 'in', -3.45, 2.5, 2.3);
      NAV('back', '→ Back into house 进屋', 'hall', 4.7, 2.5, -3.7);
      NAV('land', '↓ Downstairs 下楼', 'hall', 6.8, 4.9, 1.1); NAV('land', '← Study 书房', 'study', 3.45, 5.7, 2.3); NAV('land', '→ Kids room 儿童房', 'kids', 7.45, 5.7, -2.0);
      NAV('study', '← Bedroom 主卧', 'bed', -3.45, 5.7, 2.3); NAV('study', '→ Landing 走廊', 'land', 3.45, 5.7, 2.3);
      NAV('bed', '→ Study 书房', 'study', -3.45, 5.7, 2.3); NAV('kids', '← Landing 走廊', 'land', 7.45, 5.7, -2.0); NAV('bath', '← Hall 玄关', 'hall', 7.45, 2.5, -2.0);
    })();
    /* ================= bathroom (3 wide) ================= */
    (function () {
      var r = mkRoom('bath');
      var CER = 0xEEF3F5;
      function glass(g, w, h, d, x, y, z) { var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: 0xBFE6F2, transparent: true, opacity: 0.4 })); m.position.set(x, y, z); g.add(m); return m; }
      /* bathtub along the east wall, north end */
      var tub = new THREE.Group();
      bx(tub, 0.8, 0.55, 1.8, CER, 0, 0.3, 0); bx(tub, 0.62, 0.02, 1.62, 0xBFE6F2, 0, 0.57, 0);
      [[-0.3, -0.8], [0.3, -0.8], [-0.3, 0.8], [0.3, 0.8]].forEach(function (p) { sp(tub, 0.05, 0xC9A04A, p[0], 0.03, p[1]); });
      cy(tub, 0.02, 0.02, 0.2, 0xC0C7CC, 0, 0.7, -0.85, 8); var sp2 = cy(tub, 0.015, 0.015, 0.14, 0xC0C7CC, 0, 0.8, -0.78, 8); sp2.rotation.x = Math.PI / 2;
      sp(tub, 0.07, 0xFFD93D, -0.15, 0.62, 0.3); sp(tub, 0.05, 0xFFFFFF, 0.1, 0.62, -0.2);
      tub.position.set(0.95, 0, -2.4); r.add(tub); tag(tub, 'bathtub', 'bath');
      /* shower */
      var sw = new THREE.Group();
      bx(sw, 0.95, 0.06, 0.95, 0xD8E4E8, 0, 0.03, 0); cy(sw, 0.02, 0.02, 2.2, 0xC0C7CC, 0.4, 1.1, -0.4, 8);
      var hd = cy(sw, 0.13, 0.05, 0.05, 0xC0C7CC, 0.3, 2.2, -0.4, 14); hd.rotation.z = 0.5;
      [-0.1, 0, 0.1].forEach(function (z) { bx(sw, 0.01, 0.2, 0.01, 0x9ED2EA, 0.2 + z * 0.4, 1.9, -0.4 + z); });
      glass(sw, 0.03, 2.0, 0.95, -0.46, 1.03, 0); glass(sw, 0.95, 2.0, 0.03, 0, 1.03, 0.47);
      sw.position.set(0.88, 0, 0.8); r.add(sw); tag(sw, 'shower', 'bath');
      /* toilet on the west wall */
      var tl = new THREE.Group();
      bx(tl, 0.22, 0.5, 0.42, CER, -0.26, 0.5, 0); bx(tl, 0.25, 0.05, 0.44, 0xDDE6E9, -0.26, 0.77, 0);
      bx(tl, 0.5, 0.3, 0.38, CER, 0.0, 0.3, 0); bx(tl, 0.42, 0.04, 0.34, 0xDDE6E9, 0.04, 0.47, 0); bx(tl, 0.4, 0.02, 0.3, 0x8CC8DC, 0.04, 0.49, 0); bx(tl, 0.2, 0.2, 0.2, CER, -0.05, 0.1, 0);
      sp(tl, 0.03, 0xC0C7CC, -0.26, 0.82, 0);
      tl.position.set(-1.1, 0, 1.6); r.add(tl); tag(tl, 'toilet', 'bath');
      /* washbasin + mirror + soap + toothbrush */
      var wb = new THREE.Group();
      bx(wb, 0.3, 0.62, 0.34, CER, -0.05, 0.31, 0); bx(wb, 0.46, 0.14, 0.62, CER, 0.0, 0.8, 0); bx(wb, 0.36, 0.03, 0.5, 0x8CC8DC, 0.02, 0.88, 0);
      cy(wb, 0.015, 0.015, 0.16, 0xC0C7CC, -0.17, 1.0, 0, 8); var sp3 = cy(wb, 0.012, 0.012, 0.1, 0xC0C7CC, -0.12, 1.08, 0, 8); sp3.rotation.z = Math.PI / 2;
      wb.position.set(-1.12, 0, -0.5); r.add(wb); tag(wb, 'washbasin', 'bath');
      var mr = new THREE.Group();
      bx(mr, 0.05, 0.85, 0.7, 0xC9A04A, 0, 0, 0); var mg = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.72), new THREE.MeshBasicMaterial({ color: 0xD6EEF6 })); mg.rotation.y = Math.PI / 2; mg.position.x = 0.03; mr.add(mg);
      mr.position.set(-1.44, 1.65, -0.5); r.add(mr); tag(mr, 'mirror', 'bath');
      var so = new THREE.Group(); bx(so, 0.08, 0.035, 0.05, 0xF28CB1, 0, 0.0175, 0); sp(so, 0.015, 0xFFFFFF, 0.01, 0.045, 0);
      so.position.set(-0.98, 0.9, -0.28); r.add(so); tag(so, 'soap', 'bath');
      var tb = new THREE.Group(); cy(tb, 0.035, 0.03, 0.1, 0x3A86FF, 0, 0.05, 0, 10); [-0.012, 0.012].forEach(function (x, i) { bx(tb, 0.012, 0.14, 0.012, [0xE63946, 0xFFD93D][i], x, 0.15, 0); bx(tb, 0.014, 0.025, 0.012, 0xFFFFFF, x, 0.225, 0); });
      tb.position.set(-1.0, 0.9, -0.75); r.add(tb); tag(tb, 'toothbrush', 'bath');
      /* towel on a rail (north wall) */
      var tw = new THREE.Group();
      bx(tw, 0.9, 0.025, 0.05, 0xC0C7CC, 0, 0, 0); bx(tw, 0.55, 0.7, 0.04, 0xF28C28, 0, -0.35, 0.03); bx(tw, 0.55, 0.12, 0.045, 0xFFD27A, 0, -0.62, 0.032);
      tw.position.set(-0.1, 1.5, -3.33); r.add(tw); tag(tw, 'towel', 'bath');
      /* bath mat */
      bx(r, 0.9, 0.02, 0.55, 0x5DA9E9, 0.3, 0.012, -1.0);
      A('bathtub', 'bath', 0.95, 1.0, -2.4); A('shower', 'bath', 0.88, 2.5, 0.8); A('toilet', 'bath', -1.1, 1.15, 1.6);
      A('washbasin', 'bath', -1.12, 1.35, -0.5); A('mirror', 'bath', -1.3, 2.3, -0.5); A('soap', 'bath', -0.98, 1.1, -0.1); A('toothbrush', 'bath', -1.0, 1.3, -0.85);
      A('towel', 'bath', -0.1, 1.85, -3.3);
    })();

    /* ================= kids room (3 wide) ================= */
    (function () {
      var r = mkRoom('kids');
      cy(r, 0.95, 0.95, 0.02, 0xF4A6B7, 0, 0.012, 1.0, 20); cy(r, 0.7, 0.7, 0.022, 0xFFE08A, 0, 0.014, 1.0, 20);
      /* small bed against the east wall */
      var bd = new THREE.Group();
      bx(bd, 1.0, 0.3, 2.0, 0xF4A261, 0, 0.25, 0); bx(bd, 1.0, 0.7, 0.08, 0xF4A261, 0, 0.55, -1.0); bx(bd, 0.9, 0.2, 1.9, 0xFFF3D6, 0, 0.45, 0); bx(bd, 0.92, 0.1, 1.2, 0x3A86FF, 0, 0.58, 0.3);
      bx(bd, 0.5, 0.12, 0.35, 0xFFFFFF, 0, 0.6, -0.78);
      bd.position.set(0.85, 0, -2.3); r.add(bd);
      /* toy box with a robot on top */
      var tbx = new THREE.Group();
      bx(tbx, 0.5, 0.45, 0.8, 0x2A9D8F, 0, 0.225, 0); bx(tbx, 0.54, 0.05, 0.84, 0xF2C14E, 0, 0.47, 0);
      sp(tbx, 0.08, 0xE63946, 0.0, 0.58, 0.1); sp(tbx, 0.06, 0xFFD93D, 0.0, 0.56, -0.15);
      tbx.position.set(-1.1, 0, 1.2); r.add(tbx); tag(tbx, 'toybox', 'kids');
      var rb = new THREE.Group();
      bx(rb, 0.18, 0.2, 0.12, 0xB8C2CC, 0, 0.2, 0); bx(rb, 0.14, 0.12, 0.12, 0xD5DCE3, 0, 0.36, 0); sp(rb, 0.018, 0xE63946, -0.035, 0.37, 0.065); sp(rb, 0.018, 0xE63946, 0.035, 0.37, 0.065);
      bx(rb, 0.012, 0.08, 0.012, 0x8A939B, 0, 0.46, 0); sp(rb, 0.02, 0xFFD93D, 0, 0.5, 0); bx(rb, 0.05, 0.14, 0.05, 0x8A939B, -0.12, 0.2, 0); bx(rb, 0.05, 0.14, 0.05, 0x8A939B, 0.12, 0.2, 0); bx(rb, 0.06, 0.1, 0.06, 0x8A939B, -0.04, 0.05, 0); bx(rb, 0.06, 0.1, 0.06, 0x8A939B, 0.04, 0.05, 0);
      rb.position.set(-1.1, 0.5, 1.45); rb.rotation.y = 1.2; r.add(rb); tag(rb, 'robot', 'kids');
      /* building blocks */
      var bl = new THREE.Group();
      [[0, 0, 0xE63946], [0.13, 0, 0x3A86FF], [0.065, 0.12, 0xFFD93D], [-0.14, 0, 0x2A9D8F]].forEach(function (p) { bx(bl, 0.12, 0.12, 0.12, p[2], p[0], 0.07 + p[1], 0); });
      bl.position.set(0.2, 0, 0.5); bl.rotation.y = 0.4; r.add(bl); tag(bl, 'blocks', 'kids');
      /* toy car */
      var tc = new THREE.Group();
      bx(tc, 0.3, 0.09, 0.14, 0xFFD93D, 0, 0.09, 0); bx(tc, 0.16, 0.08, 0.13, 0xFFD93D, -0.02, 0.17, 0); bx(tc, 0.1, 0.06, 0.135, 0x9ED2EA, -0.02, 0.18, 0);
      [[-0.09, 0.07], [0.09, 0.07], [-0.09, -0.07], [0.09, -0.07]].forEach(function (p) { var w = cy(tc, 0.045, 0.045, 0.03, 0x23282D, p[0], 0.045, p[1], 10); w.rotation.x = Math.PI / 2; });
      tc.position.set(-0.45, 0, 1.9); tc.rotation.y = 0.6; r.add(tc); tag(tc, 'toycar', 'kids');
      /* doll */
      var dl = new THREE.Group();
      cy(dl, 0.03, 0.1, 0.22, 0xFF8FB1, 0, 0.18, 0, 12); sp(dl, 0.06, 0xF2D3A5, 0, 0.36, 0); sp(dl, 0.065, 0x7A4B2A, 0, 0.385, -0.01); bx(dl, 0.04, 0.12, 0.04, 0xF2D3A5, -0.07, 0.2, 0); bx(dl, 0.04, 0.12, 0.04, 0xF2D3A5, 0.07, 0.2, 0);
      bx(dl, 0.025, 0.08, 0.025, 0xF2D3A5, -0.03, 0.03, 0); bx(dl, 0.025, 0.08, 0.025, 0xF2D3A5, 0.03, 0.03, 0);
      dl.position.set(0.55, 0, 1.7); dl.rotation.y = -0.5; r.add(dl); tag(dl, 'doll', 'kids');
      /* crayons */
      var cr = new THREE.Group();
      [0xE63946, 0xFFD93D, 0x3A86FF, 0x2A9D8F, 0xFF8C42].forEach(function (c, i) { var b = bx(cr, 0.018, 0.018, 0.12, c, i * 0.03, 0.009, 0); b.rotation.y = (i - 2) * 0.12; });
      cr.position.set(-0.25, 0.012, 0.0); cr.rotation.y = 0.3; r.add(cr); tag(cr, 'crayon', 'kids');
      /* window decor */
      bx(r, 1.0, 0.9, 0.04, 0xF6EDD0, 0, 1.7, -3.47); bx(r, 0.86, 0.76, 0.045, 0x77C0EA, 0, 1.7, -3.46); sp(r, 0.1, 0xFFE066, 0.2, 1.85, -3.42);
      A('toybox', 'kids', -1.1, 0.95, 1.2); A('robot', 'kids', -1.1, 1.3, 1.45); A('blocks', 'kids', 0.2, 0.55, 0.5); A('toycar', 'kids', -0.45, 0.6, 1.9);
      A('doll', 'kids', 0.55, 0.85, 1.7); A('crayon', 'kids', -0.25, 0.5, 0.0);
    })();

    /* ================= camera rig ================= */
    var cam = { x: 0, y: 1.8, z: 16.2, yaw: 0, pitch: -0.03, fov: 64 };
    var BASE_FOV = 62;
    var POSE_OUT = { x: 0, y: 1.8, z: 16.2, yaw: 0, pitch: -0.03, fov: 64 };
    var POSE_B = { x: 0, y: 1.65, z: 6.2, yaw: 0, pitch: -0.02, fov: 66 };
    var POSE_IN = { x: 0, y: 1.6, z: 2.5, yaw: 0, pitch: -0.05, fov: 72 };
    function wrapPi(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeIO(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    var seqQ = [], seqCur = null, seqDone = null, camDirty = true;
    function nextSeg() {
      var s = seqQ.shift();
      if (!s) { seqCur = null; var d = seqDone; seqDone = null; if (d) d(); return; }
      seqCur = { s: s, t: 0, from: { x: cam.x, y: cam.y, z: cam.z, yaw: cam.yaw, pitch: cam.pitch, fov: cam.fov } };
      if (s.start) s.start();
    }
    function runSeq(segs, done) { seqQ = segs.slice(); seqDone = done; nextSeg(); }
    function stepSeq(dt) {
      if (!seqCur) return;
      var c = seqCur, s = c.s; c.t += dt;
      var k = s.dur > 0 ? Math.min(1, c.t / s.dur) : 1, e = easeIO(k), to = s.to || {};
      ['x', 'y', 'z', 'pitch', 'fov'].forEach(function (p) { if (to[p] !== undefined) cam[p] = lerp(c.from[p], to[p], e); });
      if (to.yaw !== undefined) cam.yaw = c.from.yaw + wrapPi(to.yaw - c.from.yaw) * e;
      if (s.tick) s.tick(e);
      camDirty = true;
      if (k >= 1) nextSeg();
    }
    var busy = false;
    var STAND = { out: POSE_OUT, 'in': POSE_IN,
      kitchen: { x: -7, y: 1.6, z: 2.6, yaw: 0, pitch: -0.1, fov: 74 },
      hall: { x: 4.9, y: 1.6, z: 2.7, yaw: -0.5, pitch: -0.12, fov: 76 },
      bath: { x: 9, y: 1.6, z: 3.0, yaw: 0, pitch: -0.12, fov: 78 },
      land: { x: 4.8, y: SH + 1.6, z: 1.2, yaw: -0.7, pitch: -0.2, fov: 76 },
      bed: { x: -7, y: SH + 1.6, z: 2.6, yaw: 0, pitch: -0.1, fov: 74 },
      study: { x: 0, y: SH + 1.6, z: 2.6, yaw: 0, pitch: -0.1, fov: 74 },
      kids: { x: 9, y: SH + 1.6, z: 3.0, yaw: 0, pitch: -0.12, fov: 78 },
      back: { x: 3.5, y: 1.7, z: -8.5, yaw: 0, pitch: -0.03, fov: 66 } };
    var ZP = STAND;
    var fadeEl = $('fade');
    function isOpenZone(z) { return z === 'out' || z === 'back'; }
    function jump(z) {
      var to = ZP[z]; if (!to) return;
      setMode(isOpenZone(z) ? 'exiting' : 'entering'); setZone(null); showSide(null);
      runSeq([
        { dur: 0.3, tick: function (e) { fadeEl.style.opacity = e; } },
        { dur: 0.02, start: function () {
            cam.x = to.x; cam.y = to.y; cam.z = to.z; cam.yaw = to.yaw; cam.pitch = to.pitch; cam.fov = to.fov;
            doorPivot.rotation.y = (z === 'in') ? -1.75 : 0; lightFor(z); } },
        { dur: 0.35, tick: function (e) { fadeEl.style.opacity = 1 - e; } }
      ], function () { fadeEl.style.opacity = 0; setMode(isOpenZone(z) ? 'out' : 'in'); setZone(z); });
    }
    /* walking routes between neighbouring rooms: waypoints through the door (or up the stairs) */
    var ROUTES = {};
    function addRoute(a, b, door, pts) { ROUTES[a + '>' + b] = { door: door, pts: pts }; ROUTES[b + '>' + a] = { door: door, pts: pts.slice().reverse() }; }
    addRoute('in', 'kitchen', 'd_lk', [[-1.2, 1.6, 2.3], [-3.5, 1.6, 2.3], [-5.0, 1.6, 2.3]]);
    addRoute('in', 'hall', 'd_lh', [[1.2, 1.6, 2.3], [3.5, 1.6, 2.3], [4.7, 1.6, 2.3]]);
    addRoute('hall', 'bath', 'd_hb', [[5.4, 1.6, -2.0], [7.5, 1.6, -2.0], [8.6, 1.6, -2.0]]);
    addRoute('hall', 'back', 'd_back', [[4.7, 1.6, -1.2], [4.7, 1.6, -3.6], [4.7, 1.7, -5.8]]);
    addRoute('hall', 'land', null, [[6.8, 1.6, 3.0], [6.8, SH + 1.6, -0.9]]);
    addRoute('bed', 'study', 'd_bs', [[-5.0, SH + 1.6, 2.3], [-3.5, SH + 1.6, 2.3], [-1.2, SH + 1.6, 2.3]]);
    addRoute('study', 'land', 'd_sl', [[1.2, SH + 1.6, 2.3], [3.5, SH + 1.6, 2.3], [4.7, SH + 1.6, 2.3]]);
    addRoute('land', 'kids', 'd_lk2', [[5.4, SH + 1.6, -2.0], [7.5, SH + 1.6, -2.0], [8.6, SH + 1.6, -2.0]]);
    function walk(to) {
      var r = ROUTES[zoneNow + '>' + to]; if (!r) { jump(to); return; }
      var dr = r.door ? DOORS[r.door] : null, segs = [], prev = { x: cam.x, y: cam.y, z: cam.z };
      function face(a, b) { return Math.atan2(-(b[0] - a.x), -(b[2] - a.z)); }
      setMode(isOpenZone(to) ? 'exiting' : 'entering'); lightFor(to); setZone(null); showSide(null);
      if (dr) creak();
      segs.push({ dur: 0.5, to: { yaw: face(prev, r.pts[0]), pitch: -0.04 }, tick: function (e) { if (dr) dr.pivot.rotation.y = dr.ang * e; } });
      r.pts.forEach(function (q) {
        var d = Math.sqrt((q[0] - prev.x) * (q[0] - prev.x) + (q[1] - prev.y) * (q[1] - prev.y) + (q[2] - prev.z) * (q[2] - prev.z)), yw = face(prev, q);
        segs.push({ dur: Math.max(0.5, d / 2.3), to: { x: q[0], y: q[1], z: q[2], yaw: yw } }); prev = { x: q[0], y: q[1], z: q[2] };
      });
      segs.push({ dur: 1.3, to: STAND[to], tick: function (e) { if (dr) dr.pivot.rotation.y = dr.ang * (1 - e); } });
      runSeq(segs, function () { setMode(isOpenZone(to) ? 'out' : 'in'); setZone(to); });
    }
    function goZone(z) {
      if (busy || !z || z === zoneNow) return;
      if (z === 'in' && zoneNow === 'out') { enter(); return; }
      if (z === 'out' && zoneNow === 'in') { exit(); return; }
      if (ROUTES[zoneNow + '>' + z]) { walk(z); return; }
      jump(z);
    }

    function isOpen() { return zoneNow === 'out' || zoneNow === 'back'; }
    function setZone(z) { zoneNow = z; if (z) lightFor(z); markZone(); setHint(); setButtons(); onZone(z); }
    function setMode(m) { mode = m; busy = (m === 'entering' || m === 'exiting'); setHint(); setButtons(); }

    function enter() {
      if (zoneNow !== 'out') return;
      setMode('entering'); setZone(null); showSide(null); creak(); lightFor('in');
      runSeq([
        { dur: 1.1, tick: function (e) { doorPivot.rotation.y = -1.75 * e; } },
        { dur: 3.2, to: POSE_B },
        { dur: 1.7, to: POSE_IN }
      ], function () { setMode('in'); setZone('in'); openWord('door', false, true); });
    }
    function exit() {
      if (zoneNow !== 'in') return;
      setMode('exiting'); setZone(null); showSide(null);
      runSeq([
        { dur: 0.9, to: { yaw: Math.PI, pitch: -0.05 } },
        { dur: 1.6, to: { x: 0, y: 1.65, z: 6.2, yaw: Math.PI, pitch: -0.02, fov: 64 } },
        { dur: 3.2, to: POSE_OUT },
        { dur: 0.9, tick: function (e) { doorPivot.rotation.y = -1.75 * (1 - e); } }
      ], function () { setMode('out'); setZone('out'); });
    }

    var ANCH = {
      house: [['out', -5.5, 4.2, 3.9]],
      door: [['out', 0, 2.7, 4.0], ['in', 0, 2.5, 3.3]],
      tree: [['out', -6.4, 5.3, 6.0]],
      mailbox: [['out', 2.5, 1.7, 13.6]],
      sofa: [['in', -2.95, 1.4, -0.9]],
      cushion: [['in', -3.0, 1.2, 0.55]],
      coffeetable: [['in', -0.75, 0.42, 0.5]],
      rug: [['in', -1.0, 0.05, 0.85]],
      tv: [['in', 3.15, 1.85, -0.1]],
      remote: [['in', -0.95, 0.82, 0.08]],
      floorlamp: [['in', -3.1, 2.1, -2.5]],
      bookshelf: [['in', 2.2, 2.3, -3.2]],
      book: [['in', -1.5, 0.66, 0.15]],
      window: [['in', -0.5, 1.9, -3.4]],
      curtain: [['in', -1.95, 2.0, -3.3]],
      clock: [['in', -0.5, 3.0, -3.4]],
      frame: [['in', -2.75, 2.25, -3.4]],
      plant: [['in', 3.0, 1.55, -2.4]],
      vase: [['in', -1.2, 1.12, -0.1]],
      cup: [['in', -1.5, 0.95, -0.4]],
      aircon: [['in', 3.3, 2.75, -0.1]],
      ceilinglight: [['in', -0.8, 2.6, -0.1]]
    };
    ANCHX.forEach(function (a) { (ANCH[a[0]] = ANCH[a[0]] || []).push([a[1], a[2], a[3], a[4]]); });

    /* labels */
    WORDS.forEach(function (w) {
      (ANCH[w.id] || []).forEach(function (a) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'lab' + (found[w.id] ? ' seen' : '');
        var be = document.createElement('span'); be.className = 'e'; be.textContent = emo(w.id); b.appendChild(be); b.appendChild(document.createTextNode(w.word));
        b.addEventListener('click', function (e) { e.stopPropagation(); activate(w.id); });
        labelsBox.appendChild(b);
        LABELS.push({ id: w.id, zone: a[0], pos: new THREE.Vector3(a[1], a[2], a[3]), el: b, w: 0, on: false });
      });
    });

    NAVX.forEach(function (n) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'lab nav'; b.textContent = n[1].split(' ')[0] + ' ' + zoneShort(n[2]);
      b.addEventListener('click', function (e) { e.stopPropagation(); activate('nav:' + n[2]); });
      labelsBox.appendChild(b);
      LABELS.push({ id: 'nav:' + n[2], zone: n[0], pos: new THREE.Vector3(n[3], n[4], n[5]), el: b, w: 0, on: false });
    });
    function activate(id) {
      if (id.indexOf('nav:') === 0) { if (!busy && !HUNT.on) goZone(id.slice(4)); return; }
      if (HUNT.on) { if (!busy) huntPick(id); return; }
      if (id === 'door' && zoneNow === 'out') { enter(); return; }
      if (busy) return;
      openWord(id, false, true);
    }
    function lookAt(id) {
      if (busy || !seqQ) return;
      var a = (ANCH[id] || []).filter(function (p) { return p[0] === zoneNow; })[0];
      if (!a) return;
      var dx = a[1] - cam.x, dy = a[2] - cam.y, dz = a[3] - cam.z;
      var yaw = Math.atan2(-dx, -dz), pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
      var limit = isOpen() ? 0.45 : 1.0;
      runSeq([{ dur: 0.8, to: { yaw: isOpen() ? Math.max(-0.9, Math.min(0.9, yaw)) : yaw, pitch: Math.max(-0.3, Math.min(limit, pitch - (window.innerWidth <= 700 ? 0.12 : 0))) } }]);
    }

    /* ================= input ================= */
    var pointers = {}, drag = null, pinch = null, ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    function pickAt(cx, cy) {
      var r = canvas.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      camera.updateMatrixWorld(true);
      ray.setFromCamera(ndc, camera);
      var list = PICK.filter(function (m) { return m.userData.zone === zoneNow || m.userData.zone === 'both' || (m.userData.navMap && m.userData.navMap[zoneNow]); });
      var hits = ray.intersectObjects(list, false);
      if (!hits.length) return null; var ud = hits[0].object.userData; return (ud.navMap && ud.navMap[zoneNow]) ? 'nav:' + ud.navMap[zoneNow] : ud.wordId;
    }
    function nPtr() { return Object.keys(pointers).length; }
    function pdist() { var k = Object.keys(pointers); var a = pointers[k[0]], b = pointers[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
    canvas.addEventListener('pointerdown', function (e) {
      try { canvas.setPointerCapture(e.pointerId); } catch (er) {}
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (nPtr() === 1) { drag = { sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, t: performance.now(), moved: 0 }; canvas.classList.add('drag'); }
      else if (nPtr() === 2) { pinch = pdist(); drag = null; }
    });
    canvas.addEventListener('pointermove', function (e) {
      var p = pointers[e.pointerId];
      if (!p) { if (!busy && e.pointerType === 'mouse') { var id = pickAt(e.clientX, e.clientY); canvas.classList.toggle('hot', !!id); } return; }
      p.x = e.clientX; p.y = e.clientY;
      if (nPtr() === 2 && pinch) { var d = pdist(); cam.fov = Math.max(40, Math.min(90, cam.fov - (d - pinch) * 0.12)); pinch = d; camDirty = true; return; }
      if (drag && !busy) {
        var dx = e.clientX - drag.lx, dy = e.clientY - drag.ly; drag.lx = e.clientX; drag.ly = e.clientY;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        var k = 0.0046 * (cam.fov / 62);
        cam.yaw += dx * k; cam.pitch += dy * k;
        if (isOpen()) { cam.yaw = Math.max(-0.9, Math.min(0.9, cam.yaw)); cam.pitch = Math.max(-0.3, Math.min(0.45, cam.pitch)); }
        else { cam.pitch = Math.max(-1.1, Math.min(1.1, cam.pitch)); cam.yaw = wrapPi(cam.yaw); }
        camDirty = true;
      }
    });
    function up(e) {
      var had = pointers[e.pointerId]; delete pointers[e.pointerId];
      if (drag && had && nPtr() === 0) {
        if (drag.moved < 7 && performance.now() - drag.t < 700 && !busy) { var id = pickAt(e.clientX, e.clientY); if (id) activate(id); }
        drag = null; canvas.classList.remove('drag');
      }
      if (nPtr() < 2) pinch = null;
    }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', function (e) { delete pointers[e.pointerId]; drag = null; pinch = null; canvas.classList.remove('drag'); });
    canvas.addEventListener('wheel', function (e) { e.preventDefault(); cam.fov = Math.max(40, Math.min(90, cam.fov + e.deltaY * 0.03)); camDirty = true; }, { passive: false });
    window.addEventListener('keydown', function (e) {
      if (busy || /INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return;
      var k = 0.08, used = true;
      if (e.key === 'ArrowLeft') cam.yaw += k; else if (e.key === 'ArrowRight') cam.yaw -= k;
      else if (e.key === 'ArrowUp') cam.pitch = Math.min(1.1, cam.pitch + k); else if (e.key === 'ArrowDown') cam.pitch = Math.max(-1.1, cam.pitch - k); else used = false;
      if (used) { if (isOpen()) cam.yaw = Math.max(-0.9, Math.min(0.9, cam.yaw)); camDirty = true; e.preventDefault(); }
    });

    /* ================= loop ================= */
    var W = 0, H = 0;
    function resize() {
      W = view.clientWidth || 1; H = view.clientHeight || 1;
      renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(view); else window.addEventListener('resize', resize);
    resize();

    var tmp = new THREE.Vector3(), lastT = 0;
    function placeLabels() {
      var items = [];
      LABELS.forEach(function (L) {
        var show = labelsOn && zoneNow && (L.zone === zoneNow) && !(HUNT.on && L.id.indexOf('nav:') === 0);
        if (!show) { if (L.on) { L.el.style.display = 'none'; L.on = false; } return; }
        tmp.copy(L.pos).project(camera);
        if (tmp.z > 1 || tmp.z < -1 || Math.abs(tmp.x) > 1.1 || Math.abs(tmp.y) > 1.1) { if (L.on) { L.el.style.display = 'none'; L.on = false; } return; }
        if (!L.on) { L.el.style.display = 'flex'; L.on = true; }
        if (!L.w) L.w = L.el.offsetWidth || 80;
        items.push({ L: L, x: (tmp.x * 0.5 + 0.5) * W, y: (-tmp.y * 0.5 + 0.5) * H, d: camera.position.distanceTo(L.pos) });
      });
      items.sort(function (a, b) { return a.d - b.d; });
      var placed = [];
      items.forEach(function (it) {
        var w = it.L.w, y = it.y, hgt = 34;
        for (var k = 0; k < 6; k++) {
          var hit = false;
          for (var i = 0; i < placed.length; i++) { var p = placed[i]; if (Math.abs(it.x - p.x) < (w + p.w) / 2 + 4 && Math.abs(y - p.y) < hgt) { hit = true; break; } }
          if (!hit) break; y -= hgt;
        }
        placed.push({ x: it.x, y: y, w: w });
        it.L.el.style.transform = 'translate(' + Math.round(it.x - w / 2) + 'px,' + Math.round(y - 15) + 'px)';
      });
    }
    function frame(ts) {
      var dt = lastT ? Math.min(0.1, (ts - lastT) / 1000) : 0; lastT = ts;
      stepSeq(dt);
      clouds.forEach(function (c, i) { c.position.x += dt * (0.4 + i * 0.1); if (c.position.x > 70) c.position.x = -70; });
      camera.position.set(cam.x, cam.y, cam.z);
      camera.rotation.set(cam.pitch, cam.yaw, 0, 'YXZ');
      if (camera.fov !== cam.fov) { camera.fov = cam.fov; camera.updateProjectionMatrix(); }
      camera.updateMatrixWorld(true);
      placeLabels();
      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    api3d = { go: goZone, enter: enter, exit: exit, lookAt: lookAt, _cam: cam, _camera: camera, _labels: LABELS, _pick: pickAt, _scene: scene, _step: stepSeq, _place: placeLabels, _doorPivot: doorPivot };
    setZone('out'); setMode('out');
  }


