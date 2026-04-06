(function () {
  const stone = document.getElementById("stone");
  if (!stone) return;

  const pupils = document.querySelectorAll(".person__pupil");

  let x = 0;
  let y = 0;
  let deg = 0;
  let fallEyeRaf = 0;

  const STEP = 22;
  const PUPIL_MAX = 5;

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
    if (stone.classList.contains("falling")) {
      fallEyeRaf = requestAnimationFrame(tickEyesDuringFall);
    }
  }

  function apply() {
    stone.style.setProperty("--stone-x", x + "px");
    stone.style.setProperty("--stone-y", y + "px");
    stone.style.setProperty("--stone-r", deg + "deg");
    requestAnimationFrame(updateEyes);
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
    requestAnimationFrame(updateEyes);
  });

  apply();
  requestAnimationFrame(updateEyes);
})();
