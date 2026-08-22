/**
 * ETIGE — Diagramme réseau NOC animé (Canvas)
 * Labels visibles, thème jour/nuit réactif, points lumineux animés.
 */

(function () {
  "use strict";

  /* ── Palettes Nuit / Jour ────────────────────────────── */
  function getPalette() {
    const light = document.documentElement.getAttribute("data-theme") === "light";
    return {
      light,
      bg:          light ? "rgba(241,245,249,0.0)"  : "transparent",
      canvasBg:    light ? "rgba(241,245,249,0.0)"  : "transparent",
      line:        light ? "rgba(30,40,60,0.15)"    : "rgba(255,255,255,0.18)",
      red:         "#e31e24",
      redDim:      "rgba(227,30,36,0.7)",
      redRing:     light ? "rgba(227,30,36,0.30)"   : "rgba(227,30,36,0.22)",
      white:       light ? "#1e2a3a"                : "#ffffff",
      whiteRing:   light ? "rgba(30,42,58,0.22)"   : "rgba(255,255,255,0.18)",
      whiteDim:    light ? "rgba(30,42,58,0.80)"   : "rgba(255,255,255,0.75)",
      nodeBg:      light ? "rgba(255,255,255,0.92)" : "rgba(18,20,24,0.92)",
      centerBg:    light ? "rgba(255,255,255,0.97)" : "rgba(14,16,20,0.96)",
      labelMain:   light ? "#0f1113"                : "#ffffff",
      labelSub:    "#e31e24",
      dot:         light ? "rgba(30,42,58,0.50)"   : "rgba(255,255,255,0.80)",
    };
  }

  /* ── Pôles avec marges internes généreuses ───────────── */
  /*
   * relX/relY : position 0‒1, gardée LOIN des bords (<0.12 et >0.88)
   * pour que les labels ne soient jamais coupés.
   */
  const POLES = [
    {
      id: "NET",
      relX: 0.75, relY: 0.20,
      red: true,
      label1: "Réseaux & IT",
      label2: "SWITCH/ROUTEUR/FIREWALL",
      labelAnchor: "right",
    },
    
     {
      id: "ZON",
      relX: 0.50, relY: 0.12,
      red: false,
      label1: "Téléphonie IP",
      label2: "FH GIGABIT 24GHz",
      labelAnchor: "right",
    },
    
    {
      id: "GC",
      relX: 0.25, relY: 0.20,
      red: false,
      label1: "Génie Civil & BTP",
      label2: "BÂTIMENTS, ROUTES",
      labelAnchor: "left",
    },
    
    {
      id: "COM",
      relX: 0.15, relY: 0.72,
      red: true,
      label1: "Pylônes Télécom",
      label2: "AUTOSTABLE/HAUBANES",
      labelAnchor: "left",
    },
    
    {
      id: "FO",
      relX: 0.38, relY: 0.85,
      red: false,
      label1: "Fibre Optique",
      label2: "MONO/MULTI",
      labelAnchor: "right",
    },
    {
      id: "ENR",
      relX: 0.65, relY: 0.85,
      red: true,
      label1: "Énergie",
      label2: "BT/HT/SOLAIRE",
      labelAnchor: "right",
    },
    {
      id: "CAM",
      relX: 0.82, relY: 0.68,
      red: true,
      label1: "TECHNOLOGIE",
      label2: "VIDEOSURVEILLANCE/TELEPHONIE",
      labelAnchor: "right",
    },
  ];

  /* ── Particules voyageant sur les connexions ─────────── */
  function createParticles() {
    const pts = [];
    POLES.forEach((_, i) => {
      const n = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < n; j++) {
        pts.push({
          poleIdx: i,
          t:     Math.random(),
          speed: 0.0006 + Math.random() * 0.001,
          dir:   Math.random() < 0.5 ? 1 : -1,
          size:  1.4 + Math.random() * 1.4,
          alpha: 0.55 + Math.random() * 0.45,
        });
      }
    });
    return pts;
  }

  /* ── Nœud périphérique ───────────────────────────────── */
  function drawNode(ctx, x, y, pole, t, C) {
    const pulse = Math.sin(t * 2 + pole.relX * 10) * 0.5 + 0.5;
    const isPAA = !!pole.isPAA;

    if (isPAA) {
      const r = 26;
      // Halo
      ctx.beginPath();
      ctx.arc(x, y, r + 18 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${C.light ? "30,42,58" : "255,255,255"},${0.05 + pulse * 0.05})`;
      ctx.lineWidth = 1; ctx.stroke();
      // Anneau externe
      ctx.beginPath();
      ctx.arc(x, y, r + 7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${C.light ? "30,42,58" : "255,255,255"},${0.30 + pulse * 0.20})`;
      ctx.lineWidth = 2; ctx.stroke();
      // Disque
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = C.nodeBg; ctx.fill();
      // Anneau interne
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${C.light ? "30,42,58" : "255,255,255"},${0.55 + pulse * 0.20})`;
      ctx.lineWidth = 2.5; ctx.stroke();
      // Dot
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = C.white; ctx.fill();
      return;
    }

    const isRed = pole.red;
    const r = 17;

    // Halo pulsant
    ctx.beginPath();
    ctx.arc(x, y, r + 14 + pulse * 8, 0, Math.PI * 2);
    ctx.strokeStyle = isRed
      ? `rgba(227,30,36,${0.07 + pulse * 0.10})`
      : `rgba(${C.light ? "30,42,58" : "255,255,255"},${0.04 + pulse * 0.06})`;
    ctx.lineWidth = 1; ctx.stroke();

    // Anneau
    ctx.beginPath();
    ctx.arc(x, y, r + 5, 0, Math.PI * 2);
    ctx.strokeStyle = isRed ? C.redRing : C.whiteRing;
    ctx.lineWidth = 1.5; ctx.stroke();

    // Disque
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = C.nodeBg; ctx.fill();

    // Bordure
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = isRed
      ? `rgba(227,30,36,${0.50 + pulse * 0.30})`
      : `rgba(${C.light ? "30,42,58" : "255,255,255"},${0.28 + pulse * 0.20})`;
    ctx.lineWidth = 1.5; ctx.stroke();

    // Dot intérieur
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = isRed ? C.red : C.whiteDim;
    ctx.shadowColor = isRed ? C.red : "transparent";
    ctx.shadowBlur  = isRed ? 8 : 0;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  /* ── Nœud central ────────────────────────────────────── */
  function drawCenter(ctx, x, y, t, C, logoImg) {
    const pulse = Math.sin(t * 1.5) * 0.5 + 0.5;
    const r = 24;

    for (let i = 3; i >= 1; i--) {
      ctx.beginPath();
      ctx.arc(x, y, r + i * 14 + pulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(227,30,36,${0.06 / i})`;
      ctx.lineWidth = 1; ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, r + 8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(227,30,36,${0.25 + pulse * 0.20})`;
    ctx.lineWidth = 1.5; ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = C.centerBg; ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(227,30,36,${0.70 + pulse * 0.30})`;
    ctx.lineWidth = 2; ctx.stroke();

    if (logoImg && logoImg.complete && logoImg.naturalWidth !== 0) {
      const imgW = 28;
      const imgH = 28 * (logoImg.naturalHeight / logoImg.naturalWidth);
      ctx.drawImage(logoImg, x - imgW/2, y - imgH/2, imgW, imgH);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#e31e24";
      ctx.shadowColor = "#e31e24";
      ctx.shadowBlur  = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  /* ── Labels (toujours dans les limites du canvas) ─────── */
  function drawLabel(ctx, x, y, pole, w, h, C) {
    const anchor = pole.labelAnchor || "right";
    const isPAA  = !!pole.isPAA;
    const nodeR  = isPAA ? 33 : 22;
    const gap    = 10;

    let lx = x, ly = y;
    let align = "left";

    // Position brute du label
    switch (anchor) {
      case "right":
        lx = x + nodeR + gap;
        ly = y;
        align = "left";
        break;
      case "left":
        lx = x - nodeR - gap;
        ly = y;
        align = "right";
        break;
      case "top":
        lx = x;
        ly = y - nodeR - gap;
        align = "center";
        break;
      case "bottom":
        lx = x;
        ly = y + nodeR + gap;
        align = "center";
        break;
    }

    // Clamp pour rester dans le canvas (marge de sécurité 8px)
    const margin = 8;
    if (align === "left")  lx = Math.max(lx, margin);
    if (align === "right") lx = Math.min(lx, w - margin);
    if (align === "center") lx = Math.max(margin, Math.min(lx, w - margin));
    ly = Math.max(margin + 14, Math.min(ly, h - margin - 14));

    ctx.textAlign    = align;
    ctx.textBaseline = (anchor === "bottom") ? "top" : (anchor === "top" ? "bottom" : "middle");

    const fs1 = isPAA ? 12 : 10.5;
    const fs2 = 9.5;
    const lineH = isPAA ? 16 : 14;

    // Ligne 1 — nom
    ctx.font = `600 ${fs1}px Inter, sans-serif`;
    ctx.fillStyle = C.labelMain;

    if (anchor === "top" || anchor === "bottom") {
      const offset = anchor === "top" ? -lineH : 0;
      ctx.fillText(pole.label1, lx, ly + offset);
      ctx.font = `500 ${fs2}px JetBrains Mono, monospace`;
      ctx.fillStyle = C.labelSub;
      ctx.fillText(pole.label2, lx, ly + offset + lineH);
    } else {
      ctx.fillText(pole.label1, lx, ly - lineH / 2 - 1);
      ctx.font = `500 ${fs2}px JetBrains Mono, monospace`;
      ctx.fillStyle = C.labelSub;
      ctx.fillText(pole.label2, lx, ly + lineH / 2 + 1);
    }
  }

  /* ── Label central ───────────────────────────────────── */
  function drawCenterLabel(ctx, x, y, C) {
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.fillStyle = C.labelMain;
    ctx.fillText("ETIGE CORE NOC", x, y + 34);
    ctx.font = "9.5px JetBrains Mono, monospace";
    ctx.fillStyle = C.labelSub;
    ctx.fillText("CENTRAL_NOC_ACTIVE", x, y + 48);
  }

  /* ── Init ─────────────────────────────────────────────── */
  function initNetworkDiagram(container) {
    if (!container || container.dataset.initialized) return;
    container.dataset.initialized = "true";

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "width:100%;height:100%;display:block;";
    container.innerHTML  = "";
    container.appendChild(canvas);

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const w = container.clientWidth  || 800;
      const h = container.clientHeight || 400;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = w + "px";
      canvas.style.height = h + "px";
    }
    resize();

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    function getW() { return canvas.width  / dpr; }
    function getH() { return canvas.height / dpr; }

    function getPositions() {
      const W = getW(), H = getH();
      return POLES.map(p => ({ ...p, x: p.relX * W, y: p.relY * H }));
    }

    const logoImg = new Image();
    logoImg.src = "assets/images/logo.png";

    let particles = createParticles();
    let startTime = null;
    let animId    = null;

    function frame(ts) {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) / 1000;
      const W = getW(), H = getH();
      const cx = W / 2, cy = H / 2;
      const C  = getPalette();

      ctx.clearRect(0, 0, W, H);

      const poles = getPositions();

      /* Connexions */
      poles.forEach(pole => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(pole.x, pole.y);
        ctx.strokeStyle = C.line;
        ctx.lineWidth   = 1;
        ctx.stroke();
      });

      /* Particules */
      if (!prefersReduced) {
        particles.forEach(pt => {
          pt.t += pt.speed * pt.dir;
          if (pt.t > 1) pt.t = 0;
          if (pt.t < 0) pt.t = 1;
          const pole = poles[pt.poleIdx];
          const px   = cx + (pole.x - cx) * pt.t;
          const py   = cy + (pole.y - cy) * pt.t;

          ctx.beginPath();
          ctx.arc(px, py, pt.size + 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${C.light ? "30,42,58" : "255,255,255"},${pt.alpha * 0.22})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, pt.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${C.light ? "30,42,58" : "255,255,255"},${pt.alpha})`;
          ctx.fill();
        });
      }

      /* Nœuds périphériques */
      poles.forEach(pole => drawNode(ctx, pole.x, pole.y, pole, elapsed, C));

      /* Nœud central */
      drawCenter(ctx, cx, cy, elapsed, C, logoImg);

      /* Labels périphériques */
      poles.forEach(pole => drawLabel(ctx, pole.x, pole.y, pole, W, H, C));

      /* Label central */
      drawCenterLabel(ctx, cx, cy, C);

      if (!prefersReduced) animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);

    /* ResizeObserver */
    const obs = new ResizeObserver(() => {
      cancelAnimationFrame(animId);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      resize();
      ctx.scale(dpr, dpr);
      startTime = null;
      animId = requestAnimationFrame(frame);
    });
    obs.observe(container);

    container._ndCleanup = () => {
      cancelAnimationFrame(animId);
      obs.disconnect();
      document.removeEventListener("etige:themechange", handleThemeChange);
    };

    /* Ecouteur pour redessiner explicitement si l'animation est en pause */
    const handleThemeChange = () => {
      if (prefersReduced) {
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("etige:themechange", handleThemeChange);
  }

  /* ── Boot ─────────────────────────────────────────────── */
  function initAll() {
    document.querySelectorAll("[data-network-diagram]").forEach(c => {
      if (c._ndCleanup) c._ndCleanup();
      delete c.dataset.initialized;
      initNetworkDiagram(c);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
