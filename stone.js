(function () {
  const stone = document.getElementById("stone");
  if (!stone) return;

  let x = 0;
  let y = 0;
  let deg = 0;

  const STEP = 22;

  function apply() {
    stone.style.setProperty("--stone-x", x + "px");
    stone.style.setProperty("--stone-y", y + "px");
    stone.style.setProperty("--stone-r", deg + "deg");
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
    stone.classList.add("falling");
  });

  stone.addEventListener("animationend", function () {
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

  apply();
})();
