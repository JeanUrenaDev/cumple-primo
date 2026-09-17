const params = new URLSearchParams(location.search);
const nombre = (params.get("n") || "Jose Angel").trim();

const maze = [
  "S....",
  ".###.",
  "...#.",
  ".#.#.",
  "...#G",
];

const dirs = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

let pos = { r: 0, c: 0 };
let fleeClicks = 0;

function findStart() {
  for (let r = 0; r < maze.length; r++) {
    const c = maze[r].indexOf("S");
    if (c >= 0) return { r, c };
  }
  return { r: 0, c: 0 };
}

function walkable(r, c) {
  return maze[r] && maze[r][c] && maze[r][c] !== "#";
}

function render(step) {
  const app = document.getElementById("app");

  if (step === 0) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">solo para ti</div>
        <h1>Ey, ${escapeHtml(nombre)}…</h1>
        <p>Alguien dejó esto escondido. No es spam. Es un laberinto chiquito. Dale aquí.</p>
        <button class="btn" type="button" data-next="1">Abrir</button>
      </section>`;
  }

  if (step === 1) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">paso 1</div>
        <h2>Un poco más</h2>
        <p>Todavía no. Sigue. El premio está al fondo.</p>
        <button class="btn" type="button" data-next="2">Seguir</button>
      </section>`;
  }

  if (step === 2) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">el laberinto</div>
        <h2>Encuentra la salida</h2>
        <p>Toca una casilla de al lado. La estrella es el final.</p>
        <div class="maze" id="maze"></div>
        <div class="msg" id="maze-msg"></div>
      </section>`;
    drawMaze();
  }

  if (step === 3) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">casi</div>
        <h2>Un poco más…</h2>
        <p>En serio. Un clic más. No te rajes.</p>
        <button class="btn" type="button" data-next="4">Dale</button>
      </section>`;
  }

  if (step === 4) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">ok, ahora sí</div>
        <h2>Atrápame</h2>
        <p>El botón se pone nervioso. Píllalo.</p>
        <div class="flee-wrap">
          <button class="btn flee" id="flee" type="button">Aquí</button>
        </div>
      </section>`;
    setupFlee();
  }

  if (step === 5) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">último</div>
        <h2>Feliz cumple, ${escapeHtml(nombre)}</h2>
        <p>Esto era. Ponte pa’ eso.</p>
        <div class="heart">🎂</div>
        <div class="video-wrap">
          <iframe
            src="https://www.youtube.com/embed/352aSFm5SEU?autoplay=1&rel=0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            title="Ponte Pa Eso"></iframe>
        </div>
      </section>`;
  }

  app.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => render(Number(btn.dataset.next)));
  });
}

function drawMaze() {
  const root = document.getElementById("maze");
  root.innerHTML = "";
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      const ch = maze[r][c];
      if (ch === "#") {
        cell.disabled = true;
        cell.textContent = "";
      } else {
        cell.classList.add("path");
        cell.textContent = ch === "G" ? "★" : "";
        if (ch === "G") cell.classList.add("goal");
        cell.addEventListener("click", () => tryMove(r, c));
      }
      if (pos.r === r && pos.c === c) {
        cell.classList.add("here");
        cell.textContent = "●";
      }
      root.appendChild(cell);
    }
  }
}

function tryMove(r, c) {
  const msg = document.getElementById("maze-msg");
  const ok = dirs.some(([dr, dc]) => pos.r + dr === r && pos.c + dc === c);
  if (!ok || !walkable(r, c)) {
    msg.textContent = "Por ahí no. Un paso a la vez.";
    return;
  }
  pos = { r, c };
  if (maze[r][c] === "G") {
    render(3);
    return;
  }
  msg.textContent = "Eso. Un poco más.";
  drawMaze();
}

function setupFlee() {
  const btn = document.getElementById("flee");
  btn.addEventListener("click", (e) => {
    fleeClicks += 1;
    if (fleeClicks >= 3) {
      render(5);
      return;
    }
    e.preventDefault();
    btn.style.left = 18 + Math.random() * 64 + "%";
    btn.style.top = 18 + Math.random() * 64 + "%";
    btn.textContent = fleeClicks === 1 ? "Casi" : "Un poco más";
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

pos = findStart();
render(0);
