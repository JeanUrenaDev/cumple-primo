const params = new URLSearchParams(location.search);
const nombre = (params.get("n") || "Jose Angel").trim();

const quizzes = [
  {
    title: "Una suma",
    q: "¿Cuánto es 4 + 3?",
    ok: 7,
    opts: [5, 7, 8],
  },
  {
    title: "Una resta",
    q: "¿Cuánto es 9 − 2?",
    ok: 7,
    opts: [6, 7, 11],
  },
];

const pistasMal = [
  "Nop. Pista: palo de lu’… cuenta otra vez.",
  "Frío. Ponte pa’ eso, pero mira bien el número.",
  "Esa no. El palo de lu’ no es esa respuesta.",
];

let quizI = 0;
let fleeClicks = 0;
let pistaI = 0;

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
        <p>Todavía no suena. Ponte pa’ eso… primero una cuenta fácil.</p>
        <button class="btn" type="button" data-next="2">Seguir</button>
      </section>`;
  }

  if (step === 2) {
    const item = quizzes[quizI];
    app.innerHTML = `
      <section class="card">
        <div class="kicker">${escapeHtml(item.title)}</div>
        <h2>${escapeHtml(item.q)}</h2>
        <p>Pista: palo de lu’. Si fallas, prueba otra.</p>
        <div class="row" id="opts"></div>
        <div class="msg" id="quiz-msg"></div>
      </section>`;
    const row = document.getElementById("opts");
    item.opts.forEach((n) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn ghost";
      btn.textContent = String(n);
      btn.addEventListener("click", () => answerQuiz(n));
      row.appendChild(btn);
    });
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
      boostSound(tease);
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
    boostSound(voz);
    voz.addEventListener("error", () => {
      voz.style.display = "none";
      const msg = document.getElementById("audio-msg");
      if (msg) msg.textContent = "El audio llega en un rato. Recarga después.";
    });
  }
}

function answerQuiz(n) {
  const item = quizzes[quizI];
  const msg = document.getElementById("quiz-msg");
  if (n !== item.ok) {
    msg.textContent = pistasMal[pistaI % pistasMal.length];
    pistaI += 1;
    return;
  }
  quizI += 1;
  if (quizI >= quizzes.length) {
    render(3);
    return;
  }
  render(2);
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

function boostSound(media) {
  try {
    media.volume = 1;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!window._cumpleAudio) {
      window._cumpleAudio = new Ctx();
    }
    const ctx = window._cumpleAudio;
    ctx.resume();
    const src = ctx.createMediaElementSource(media);
    const gain = ctx.createGain();
    gain.gain.value = 3.2;
    src.connect(gain);
    gain.connect(ctx.destination);
  } catch (_) {
    // el navegador ya lo está reproduciendo igual
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

render(0);
