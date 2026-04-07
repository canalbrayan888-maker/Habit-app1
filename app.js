// ===== ELEMENTOS =====
const input = document.getElementById("habitInput");
const list = document.getElementById("habitList");
const statsText = document.getElementById("statsText");
const quote = document.getElementById("quote");
const btnTheme = document.getElementById("toggleTheme");

let chart;
let currentScreen = 0;

// ===== FRASES =====
const quotes = [
  "No rompas la racha 🔥",
  "Disciplina > motivación",
  "Hazlo aunque no quieras",
  "Vas mejor que el 80%",
  "Un día más cuenta"
];

// ===== CARTAS =====
const rewards = [
  { streak: 3, name: "Inicio", msg: "Empieza", type: "common" },
  { streak: 5, name: "Constante", msg: "Sigue", type: "common" },
  { streak: 10, name: "Activo", msg: "Buen ritmo", type: "common" },
  { streak: 20, name: "Firme", msg: "No pares", type: "common" },
  { streak: 25, name: "Enfocado", msg: "Disciplina", type: "common" },

  { streak: 50, name: "Máquina", msg: "Nivel alto", type: "epic" },
  { streak: 75, name: "Guerrero", msg: "Fuerte", type: "epic" },
  { streak: 100, name: "Titán", msg: "Dominas", type: "epic" },
  { streak: 150, name: "Rey", msg: "Élite", type: "epic" },

  { streak: 200, name: "Sabio", msg: "Disciplina total", type: "legendary" },
  { streak: 300, name: "Invencible", msg: "Nada te detiene", type: "legendary" },
  { streak: 500, name: "Leyenda", msg: "Nivel dios", type: "legendary" },
  { streak: 1000, name: "Inmortal", msg: "Has ganado", type: "legendary" }
];

// ===== DATA =====
let data = JSON.parse(localStorage.getItem("data")) || {
  habits: [],
  streak: 0,
  lastDate: null,
  history: {},
  fails: 0,
  rewardsUnlocked: []
};

// ===== FUNCIONES =====

// Añadir hábito
function addHabit() {
  if (!input.value.trim()) return;

  data.habits.push({ name: input.value, done: false });
  input.value = "";
  save(); render();
}

// Eliminar
function deleteHabit(i) {
  data.habits.splice(i, 1);
  save(); render();
}

// Toggle hábito
function toggleHabit(i) {
  data.habits[i].done = !data.habits[i].done;

  const today = new Date().toISOString().split("T")[0];
  const done = data.habits.filter(h => h.done).length;
  const percent = (done / data.habits.length) * 100;

  if (percent >= 80) data.history[today] = true;
  else delete data.history[today];

  checkStreak();
  save(); render();
}

// ===== RACHA INTELIGENTE =====
function checkStreak() {
  const today = new Date().toISOString().split("T")[0];
  if (data.lastDate === today) return;

  const done = data.habits.filter(h => h.done).length;
  const percent = (done / data.habits.length) * 100;

  if (percent >= 80) {
    data.streak++;
    data.fails = 0;
    checkRewards();
  } else {
    data.fails++;
    if (data.fails >= 2) {
      data.streak = 0;
      data.fails = 0;
    }
  }

  data.lastDate = today;
}

// ===== DESBLOQUEO =====
function checkRewards() {
  rewards.forEach(r => {
    if (data.streak >= r.streak && !data.rewardsUnlocked.includes(r.streak)) {
      data.rewardsUnlocked.push(r.streak);
      showCard(r);
    }
  });
}

// ===== MODAL CARTA =====
function showCard(card) {
  const modal = document.getElementById("cardModal");

  modal.innerHTML = `
    <div class="card-flip">
      <div class="card-inner flipped">
        <div class="card-front">?</div>
        <div class="card-back">
          <h2>${card.name}</h2>
          <p>${card.msg}</p>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
  setTimeout(() => modal.classList.remove("active"), 2500);
}

// ===== RENDER =====
function render() {
  list.innerHTML = "";
  let done = 0;

  data.habits.forEach((h, i) => {
    if (h.done) done++;

    list.innerHTML += `
      <div class="card habit">
        <span>${h.name}</span>
        <div>
          <button onclick="toggleHabit(${i})">${h.done ? "✔" : "○"}</button>
          <button onclick="deleteHabit(${i})">🗑️</button>
        </div>
      </div>
    `;
  });

  let percent = data.habits.length ? Math.round((done / data.habits.length) * 100) : 0;

  statsText.innerHTML = `🔥 ${data.streak} días<br>📊 ${percent}%`;

  renderChart(done, data.habits.length);
  renderCalendar();
  renderCards();
}

// ===== GRÁFICA =====
function renderChart(done, total) {
  const ctx = document.getElementById("chart");
  if (!ctx) return;
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Hecho", "Falta"],
      datasets: [{ data: [done, total - done] }]
    }
  });
}

// ===== CALENDARIO =====
function renderCalendar() {
  const cal = document.getElementById("calendar");
  if (!cal) return;

  cal.innerHTML = "";

  for (let i = 60; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = d.toISOString().split("T")[0];

    const div = document.createElement("div");
    div.className = "day " + (data.history[key] ? "done" : "");

    cal.appendChild(div);
  }
}

// ===== CARTAS =====
function renderCards() {
  const c = document.getElementById("cardsContainer");
  if (!c) return;

  c.innerHTML = "";

  const totalSlots = 30;

  for (let i = 0; i < totalSlots; i++) {
    const r = rewards[i];

    if (r) {
      const unlocked = data.rewardsUnlocked.includes(r.streak);

      c.innerHTML += `
        <div class="reward ${r.type} ${unlocked ? "unlocked" : ""}">
          ${
            unlocked
              ? `<h4>${r.name}</h4><p>${r.msg}</p>`
              : `<div class="locked">?</div><span class="req">${r.streak}</span>`
          }
        </div>
      `;
    } else {
      c.innerHTML += `
        <div class="reward">
          <div class="locked">?</div>
        </div>
      `;
    }
  }
}

// ===== FRASES =====
quote.innerText = quotes[Math.floor(Math.random() * quotes.length)];

// ===== DARK MODE =====
btnTheme.onclick = () => {
  document.body.classList.toggle("dark");
};

// ===== SWIPE =====
let startX = 0;
document.addEventListener("touchstart", e => startX = e.touches[0].clientX);
document.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;

  const screens = ["home","stats","motivation","cards"];

  if (startX - endX > 50) {
    currentScreen = (currentScreen + 1) % screens.length;
  } else if (endX - startX > 50) {
    currentScreen = (currentScreen - 1 + screens.length) % screens.length;
  }

  showScreen(screens[currentScreen]);
});

// ===== CAMBIAR PANTALLA =====
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ===== GUARDAR =====
function save() {
  localStorage.setItem("data", JSON.stringify(data));
}

// ===== INIT =====
render();
