const input = document.getElementById("habitInput");
const list = document.getElementById("habitList");
const statsText = document.getElementById("statsText");
const quote = document.getElementById("quote");
const btnTheme = document.getElementById("toggleTheme");

let chart;

// 🎴 CARTAS (30 hasta 1000)
const rewards = [
  { streak: 3, name: "Inicio", msg: "Todo empieza contigo" },
  { streak: 5, name: "Constante", msg: "La disciplina nace" },
  { streak: 10, name: "Guerrero", msg: "Ya no eres el mismo" },
  { streak: 20, name: "Imparable", msg: "Sigues aunque cueste" },
  { streak: 25, name: "Firme", msg: "Tu mente se fortalece" },
  { streak: 50, name: "Monstruo", msg: "Disciplina brutal" },
  { streak: 75, name: "Máquina", msg: "No hay excusas" },
  { streak: 100, name: "Dios", msg: "Nivel legendario" },
  { streak: 130, name: "Titán", msg: "Eres constante de verdad" },
  { streak: 160, name: "Alpha", msg: "Dominas tu mente" },
  { streak: 200, name: "Rey", msg: "Muy pocos llegan aquí" },
  { streak: 250, name: "Maestro", msg: "Control total" },
  { streak: 320, name: "Sabio", msg: "Disciplina absoluta" },
  { streak: 400, name: "Invencible", msg: "Nada te detiene" },
  { streak: 500, name: "Leyenda", msg: "Eres élite" },
  { streak: 600, name: "Dios II", msg: "Más allá del límite" },
  { streak: 700, name: "Eterno", msg: "Nunca paras" },
  { streak: 800, name: "Overlord", msg: "Nivel imposible" },
  { streak: 900, name: "Supremo", msg: "Disciplina infinita" },
  { streak: 1000, name: "Inmortal", msg: "Has vencido todo" }
];

// DATOS
let data = JSON.parse(localStorage.getItem("data")) || {
  habits: [],
  streak: 0,
  lastDate: null,
  history: {},
  fails: 0,
  rewardsUnlocked: []
};

// CAMBIAR PANTALLA
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// AGREGAR HÁBITO
function addHabit() {
  if (input.value.trim() === "") return;

  data.habits.push({
    name: input.value,
    done: false
  });

  input.value = "";
  save();
  render();
}

// ELIMINAR
function deleteHabit(index) {
  data.habits.splice(index, 1);
  save();
  render();
}

// TOGGLE
function toggleHabit(index) {
  data.habits[index].done = !data.habits[index].done;

  const today = new Date().toISOString().split("T")[0];

  const completed = data.habits.filter(h => h.done).length;
  const total = data.habits.length;
  const percent = total > 0 ? (completed / total) * 100 : 0;

  if (percent >= 80) {
    data.history[today] = true;
  } else {
    delete data.history[today];
  }

  checkStreak();
  save();
  render();
}

// RACHA INTELIGENTE
function checkStreak() {
  const today = new Date().toISOString().split("T")[0];

  if (data.lastDate === today) return;

  const completed = data.habits.filter(h => h.done).length;
  const total = data.habits.length;
  const percent = total > 0 ? (completed / total) * 100 : 0;

  if (percent >= 80) {
    data.streak++;
    data.fails = 0;
    data.history[today] = true;
    checkRewards();
  } else {
    data.fails++;

    if (data.fails >= 2) {
      data.streak = 0;
      data.fails = 0;
    }

    delete data.history[today];
  }

  data.lastDate = today;
}

// 🎴 RECOMPENSAS
function checkRewards() {
  rewards.forEach(r => {
    if (data.streak >= r.streak && !data.rewardsUnlocked.includes(r.streak)) {
      data.rewardsUnlocked.push(r.streak);
      alert("🎉 Nueva carta: " + r.name);
    }
  });
}

// GUARDAR
function save() {
  localStorage.setItem("data", JSON.stringify(data));
}

// RENDER
function render() {
  list.innerHTML = "";

  if (data.habits.length === 0) {
    list.innerHTML = `<div class="card">Agrega hábitos 🚀</div>`;
    return;
  }

  let completed = 0;

  data.habits.forEach((h, i) => {
    if (h.done) completed++;

    list.innerHTML += `
      <div class="card habit ${h.done ? "done" : ""}">
        <span>${h.name}</span>
        <div>
          <button class="check" onclick="toggleHabit(${i})">
            ${h.done ? "✔" : "○"}
          </button>
          <button onclick="deleteHabit(${i})">🗑️</button>
        </div>
      </div>
    `;
  });

  let percent = Math.round((completed / data.habits.length) * 100);

  statsText.innerHTML = `
    🔥 Racha: ${data.streak}<br>
    📊 ${percent}%
  `;

  renderChart(completed, data.habits.length);
  renderCalendar();
  renderCards();
}

// GRÁFICA
function renderChart(completed, total) {
  const ctx = document.getElementById("chart");
  if (!ctx) return;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Hecho", "Falta"],
      datasets: [{
        data: [completed, total - completed]
      }]
    }
  });
}

// CALENDARIO
function renderCalendar() {
  const calendar = document.getElementById("calendar");
  if (!calendar) return;

  calendar.innerHTML = "";

  for (let i = 60; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = d.toISOString().split("T")[0];

    const div = document.createElement("div");
    div.classList.add("day");

    if (data.history[key]) {
      div.classList.add("done");
    }

    calendar.appendChild(div);
  }
}

// CARTAS
function renderCards() {
  const container = document.getElementById("cardsContainer");
  if (!container) return;

  container.innerHTML = "";

  rewards.forEach(r => {
    const unlocked = data.rewardsUnlocked.includes(r.streak);

    container.innerHTML += `
      <div class="card reward ${unlocked ? "unlocked" : ""}" onclick="openCard(${r.streak})">
        ${
          unlocked
            ? `<h4>${r.name}</h4><p>${r.msg}</p>`
            : `<div class="locked">?</div>`
        }
      </div>
    `;
  });
}

// ABRIR CARTA
function openCard(streak) {
  const reward = rewards.find(r => r.streak === streak);

  if (!data.rewardsUnlocked.includes(streak)) {
    alert("🔒 Desbloquea con racha de " + streak);
    return;
  }

  alert("🎴 " + reward.name + "\n\n" + reward.msg);
}

// FRASES
const quotes = [
  "Hazlo sin ganas",
  "Disciplina > motivación",
  "Un día o día uno"
];

quote.innerText = quotes[Math.floor(Math.random() * quotes.length)];

// MODO OSCURO
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

btnTheme.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
};

// SWIPE
let startX = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;

  if (startX - endX > 50) nextScreen();
  if (endX - startX > 50) prevScreen();
});

const screens = ["home", "stats", "motivation", "cards"];
let current = 0;

function nextScreen() {
  current = (current + 1) % screens.length;
  showScreen(screens[current]);
}

function prevScreen() {
  current = (current - 1 + screens.length) % screens.length;
  showScreen(screens[current]);
}

// INICIO
render();
