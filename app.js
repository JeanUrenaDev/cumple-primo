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

const pistasMal = [
  "Frío. Pista: palo de lu’… no es por ahí.",
  "Esa pared no canta. Ponte pa’ eso, pero al lado.",
  "Nop. El palo de lu’ está más adelante.",
  "Te desviaste. Sigue el ritmo, un paso.",
];

const pistasBien = [
  "Eso. Un poco más.",
  "Ahí va. Palo de lu’.",
  "Ponte pa’ eso… sigue.",
  "Casi escuchas la pista.",
];

let pos = { r: 0, c: 0 };
let fleeClicks = 0;
let pistaI = 0;

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
        <div class="kicker">pista 1</div>
        <h1>Ey, ${escapeHtml(nombre)}…</h1>
        <p>Alguien dejó esto escondido. Si escuchas “palo de lu’”, vas bien. Dale aquí.</p>
        <button class="btn" type="button" data-next="1">Abrir</button>
      </section>`;
  }

  if (step === 1) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">pista 2</div>
        <h2>Un poco más</h2>
        <p>Todavía no suena. Ponte pa’ eso… pero sigue caminando.</p>
        <button class="btn" type="button" data-next="2">Seguir</button>
      </section>`;
  }

  if (step === 2) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">el laberinto</div>
        <h2>Encuentra el palo de lu’</h2>
        <p>Toca una casilla de al lado. La estrella es la salida. Si te trabas: ponte pa’ eso, no te rajes.</p>
        <div class="maze" id="maze"></div>
        <div class="msg" id="maze-msg">Pista: no cruces las paredes oscuras.</div>
      </section>`;
    drawMaze();
  }

  if (step === 3) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">pista 3</div>
        <h2>Un poco más…</h2>
        <p>Ya casi. El palo de lu’ está detrás de un botón nervioso.</p>
        <button class="btn" type="button" data-next="4">Dale</button>
      </section>`;
  }

  if (step === 4) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">última pista</div>
        <h2>Atrápame</h2>
        <p>Ponte pa’ eso. Píllalo tres veces.</p>
        <div class="flee-wrap">
          <button class="btn flee" id="flee" type="button">Palo de lu’</button>
        </div>
      </section>`;
    setupFlee();
  }

  if (step === 5) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">quédate ahí</div>
        <h2>Falta un poquito más</h2>
        <p>No te vayas. Quédate ahí, quédate ahí…</p>
        <div class="video-wrap">
          <video id="tease" controls autoplay playsinline src="quedate.mp4"></video>
        </div>
        <button class="btn" type="button" data-next="6" style="margin-top:18px">Ok, ahora sí</button>
      </section>`;
    const tease = document.getElementById("tease");
    if (tease) {
      tease.addEventListener("ended", () => render(6));
    }
  }

  if (step === 6) {
    app.innerHTML = `
      <section class="card">
        <div class="kicker">llegaste</div>
        <h2>Feliz cumple, ${escapeHtml(nombre)}</h2>
        <p>Esto era. Ponte pa’ eso.</p>
        <div class="heart">🎂</div>
        <audio id="voz" class="voz" controls autoplay playsinline src="voz.m4a"></audio>
        <p class="msg" id="audio-msg"></p>
      </section>`;
  }

  app.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => render(Number(btn.dataset.next)));
  });

  const voz = document.getElementById("voz");
  if (voz) {
    voz.addEventListener("error", () => {
      voz.style.display = "none";
      const msg = document.getElementById("audio-msg");
      if (msg) msg.textContent = "El audio llega en un rato. Recarga después.";
    });
  }
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
    msg.textContent = pistasMal[pistaI % pistasMal.length];
    pistaI += 1;
    return;
  }
  pos = { r, c };
  if (maze[r][c] === "G") {
    render(3);
    return;
  }
  msg.textContent = pistasBien[pistaI % pistasBien.length];
  pistaI += 1;
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
    btn.textContent = fleeClicks === 1 ? "Ponte pa’ eso" : "Un poco más";
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
