(function () {
  const stone = document.getElementById("stone");
  if (!stone) return;

  const pupils = document.querySelectorAll(".person__pupil");
  const bottlesLayer = document.getElementById("bottles-layer");
  const heroSafe = document.getElementById("hero-safe");
  const logoEl = document.querySelector(".logo");

  let x = 0;
  let y = 0;
  let deg = 0;
  let fallEyeRaf = 0;

  const STEP = 22;
  const PUPIL_MAX = 5;

  const BOTTLE_BRANDS = [
    { mod: "cola", text: "Кока-Кола" },
    { mod: "fresh", text: "Фрешбар" },
    { mod: "fanta", text: "Fanta" },
  ];
  const BOTTLE_COUNT = 9;
  const ZONE_PAD = 18;
  const HIT_INSET = -6;

  function inflateRect(r, pad) {
    return {
      left: r.left - pad,
      top: r.top - pad,
      right: r.right + pad,
      bottom: r.bottom + pad,
    };
  }

  function rectsOverlap(a, b, inset) {
    inset = inset || 0;
    return !(
      a.left + inset > b.right - inset ||
      a.right - inset < b.left + inset ||
      a.top + inset > b.bottom - inset ||
      a.bottom - inset < b.top + inset
    );
  }

  function getExclusionRects() {
    const list = [];
    if (logoEl) list.push(inflateRect(logoEl.getBoundingClientRect(), ZONE_PAD));
    if (heroSafe) list.push(inflateRect(heroSafe.getBoundingClientRect(), ZONE_PAD));
    return list;
  }

  function hitsExclusion(leftPct, topPct, w, h, rotDeg) {
    const ex = getExclusionRects();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = (leftPct / 100) * vw + w / 2;
    const cy = (topPct / 100) * vh + h / 2;
    const rad = (rotDeg * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const rw = (w / 2) * cos + (h / 2) * sin;
    const rh = (w / 2) * sin + (h / 2) * cos;
    const cand = { left: cx - rw, top: cy - rh, right: cx + rw, bottom: cy + rh };
    for (let i = 0; i < ex.length; i++) {
      if (rectsOverlap(cand, ex[i], 0)) return true;
    }
    return false;
  }

  function bottleRectAt(leftPct, topPct, w, h) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      left: (leftPct / 100) * vw,
      top: (topPct / 100) * vh,
      right: (leftPct / 100) * vw + w,
      bottom: (topPct / 100) * vh + h,
    };
  }

  function overlapsPlaced(placed, leftPct, topPct, w, h, rotDeg) {
    const a = bottleRectAt(leftPct, topPct, w, h);
    const cx = (a.left + a.right) / 2;
    const cy = (a.top + a.bottom) / 2;
    const rad = (rotDeg * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const rw = (w / 2) * cos + (h / 2) * sin;
    const rh = (w / 2) * sin + (h / 2) * cos;
    const box = { left: cx - rw, top: cy - rh, right: cx + rw, bottom: cy + rh };
    const gap = 14;
    for (let i = 0; i < placed.length; i++) {
      const p = placed[i];
      if (rectsOverlap(box, p, gap)) return true;
    }
    return false;
  }

  function initBottles() {
    if (!bottlesLayer) return;
    bottlesLayer.innerHTML = "";
    const placed = [];
    const measure = document.createElement("div");
    measure.className = "bottle";
    measure.setAttribute("aria-hidden", "true");
    measure.innerHTML =
      '<div class="bottle__inner bottle__inner--cola"><div class="bottle__cap"></div><div class="bottle__neck"></div><div class="bottle__glass"><span class="bottle__label">X</span></div></div>';
    bottlesLayer.appendChild(measure);
    const mw = measure.offsetWidth;
    const mh = measure.offsetHeight;
    bottlesLayer.removeChild(measure);

    for (let n = 0; n < BOTTLE_COUNT; n++) {
      const brand = BOTTLE_BRANDS[Math.floor(Math.random() * BOTTLE_BRANDS.length)];
      let leftPct = 0;
      let topPct = 0;
      let rot = 0;
      let ok = false;
      for (let t = 0; t < 90; t++) {
        leftPct = 4 + Math.random() * 88;
        topPct = 5 + Math.random() * 82;
        rot = -35 + Math.random() * 70;
        if (hitsExclusion(leftPct, topPct, mw, mh, rot)) continue;
        if (overlapsPlaced(placed, leftPct, topPct, mw, mh, rot)) continue;
        ok = true;
        break;
      }
      if (!ok) continue;

      const wrap = document.createElement("div");
      wrap.className = "bottle";
      wrap.style.left = leftPct + "%";
      wrap.style.top = topPct + "%";
      wrap.style.setProperty("--bottle-rot", rot + "deg");
      wrap.setAttribute("aria-hidden", "true");
      const inner = document.createElement("div");
      inner.className = "bottle__inner bottle__inner--" + brand.mod;
      inner.innerHTML =
        '<div class="bottle__cap"></div><div class="bottle__neck"></div><div class="bottle__glass"><span class="bottle__label"></span></div>';
      inner.querySelector(".bottle__label").textContent = brand.text;
      wrap.appendChild(inner);
      bottlesLayer.appendChild(wrap);

      const br = bottleRectAt(leftPct, topPct, mw, mh);
      const cx = (br.left + br.right) / 2;
      const cy = (br.top + br.bottom) / 2;
      const rad = (rot * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));
      const rw = (mw / 2) * cos + (mh / 2) * sin;
      const rh = (mw / 2) * sin + (mh / 2) * cos;
      placed.push({ left: cx - rw, top: cy - rh, right: cx + rw, bottom: cy + rh });
    }
  }

  function checkBottleHits() {
    if (!bottlesLayer) return;
    const sr = stone.getBoundingClientRect();
    bottlesLayer.querySelectorAll(".bottle:not(.bottle--broken)").forEach(function (b) {
      const br = b.getBoundingClientRect();
      if (rectsOverlap(
        { left: sr.left, top: sr.top, right: sr.right, bottom: sr.bottom },
        { left: br.left, top: br.top, right: br.right, bottom: br.bottom },
        HIT_INSET
      )) {
        b.classList.add("bottle--broken");
      }
    });
  }

  function stoneCenter() {
    const r = stone.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function updateEyes() {
    if (!pupils.length) return;
    const sc = stoneCenter();
    pupils.forEach(function (pupil) {
      const eye = pupil.parentElement;
      if (!eye) return;
      const er = eye.getBoundingClientRect();
      const ex = er.left + er.width / 2;
      const ey = er.top + er.height / 2;
      const dx = sc.x - ex;
      const dy = sc.y - ey;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const r = Math.min(PUPIL_MAX, len * 0.06);
      pupil.style.transform = "translate(" + ux * r + "px, " + uy * r + "px)";
    });
  }

  function tickEyesDuringFall() {
    updateEyes();
    checkBottleHits();
    if (stone.classList.contains("falling")) {
      fallEyeRaf = requestAnimationFrame(tickEyesDuringFall);
    }
  }

  function apply() {
    stone.style.setProperty("--stone-x", x + "px");
    stone.style.setProperty("--stone-y", y + "px");
    stone.style.setProperty("--stone-r", deg + "deg");
    requestAnimationFrame(function () {
      updateEyes();
      checkBottleHits();
    });
  }

  let clickTimer = 0;
  stone.addEventListener("click", function () {
    clearTimeout(clickTimer);
    clickTimer = setTimeout(function () {
      deg += 90;
      apply();
    }, 220);
  });

  stone.addEventListener("dblclick", function (e) {
    e.preventDefault();
    clearTimeout(clickTimer);
    if (stone.classList.contains("falling")) return;
    cancelAnimationFrame(fallEyeRaf);
    stone.classList.add("falling");
    fallEyeRaf = requestAnimationFrame(tickEyesDuringFall);
  });

  stone.addEventListener("animationend", function () {
    cancelAnimationFrame(fallEyeRaf);
    stone.classList.remove("falling");
    x = 0;
    y = 0;
    deg = (deg % 360) + 360;
    apply();
  });

  stone.addEventListener("keydown", function (e) {
    const k = e.key;
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(k)) return;
    e.preventDefault();
    if (k === "ArrowRight") {
      x += STEP;
      deg += 18;
    } else if (k === "ArrowLeft") {
      x -= STEP;
      deg -= 18;
    } else if (k === "ArrowDown") {
      y += STEP;
      deg += 12;
    } else {
      y -= STEP;
      deg -= 12;
    }
    apply();
  });

  document.querySelectorAll(".letter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const i = Number(btn.dataset.i) || 0;
      deg += 20 + i * 5;
      y -= 4;
      apply();
      btn.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0.92)" }, { transform: "scale(1)" }],
        { duration: 160, easing: "ease-out" }
      );
    });
  });

  window.addEventListener("resize", function () {
    requestAnimationFrame(function () {
      updateEyes();
      checkBottleHits();
    });
  });

  initBottles();
  apply();
  requestAnimationFrame(function () {
    updateEyes();
    checkBottleHits();
  });
})();
