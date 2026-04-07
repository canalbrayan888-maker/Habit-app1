const input = document.getElementById("habitInput");
const list = document.getElementById("habitList");
const statsText = document.getElementById("statsText");
const quote = document.getElementById("quote");
const btnTheme = document.getElementById("toggleTheme");

let chart;
let selectedCard = null;

// 🎴 CARTAS
const rewards = [
  { streak: 3, name: "Inicio", msg: "Todo empieza contigo" },
  { streak: 5, name: "Constante", msg: "La disciplina nace" },
  { streak: 10, name: "Guerrero", msg: "Ya no eres el mismo" },
  { streak: 20, name: "Imparable", msg: "Sigues aunque cueste" },
  { streak: 25, name: "Firme", msg: "Tu mente se fortalece" },
  { streak: 50, name: "Monstruo", msg: "Disciplina brutal" },
  { streak: 75, name: "Máquina", msg: "No hay excusas" },
  { streak: 100, name: "Dios", msg: "Nivel legendario" },
  { streak: 130, name: "Titán", msg: "Eres constante" },
  { streak: 160, name: "Alpha", msg: "Dominas tu mente" },
  { streak: 200, name: "Rey", msg: "Muy pocos llegan" },
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

// HÁBITOS
function addHabit() {
  if (!input.value.trim()) return;

  data.habits.push({ name: input.value, done: false });
  input.value = "";
  save(); render();
}

function deleteHabit(i) {
  data.habits.splice(i, 1);
  save(); render();
}

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

// RACHA
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

// 🎴 DESBLOQUEO
function checkRewards() {
  rewards.forEach(r => {
    if (data.streak >= r.streak && !data.rewardsUnlocked.includes(r.streak)) {
      data.rewardsUnlocked.push(r.streak);
      selectedCard = r;
      setTimeout(() => showCardModal(r), 300);
    }
  });
}

// MODAL CARTA 💀
function showCardModal(card) {
  const modal = document.getElementById("cardModal");
  modal.classList.add("active");

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

  setTimeout(() => modal.classList.remove("active"), 2500);
}

// GUARDAR
function save() {
  localStorage.setItem("data", JSON.stringify(data));
}

// RENDER
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

// GRÁFICA
function renderChart(done, total) {
  const ctx = document.getElementById("chart");
  if (!ctx) return;
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: { labels: ["Hecho", "Falta"], datasets: [{ data: [done, total - done] }] }
  });
}

// CALENDARIO
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

// CARTAS
function renderCards() {
  const c = document.getElementById("cardsContainer");
  if (!c) return;

  c.innerHTML = "";

  rewards.forEach(r => {
    const unlocked = data.rewardsUnlocked.includes(r.streak);

    c.innerHTML += `
      <div class="reward ${unlocked ? "unlocked" : ""}" onclick="openCard(${r.streak})">
        ${unlocked ? `<h4>${r.name}</h4>` : `<div class="locked">?</div>`}
      </div>
    `;
  });
}

// ABRIR CARTA
function openCard(streak) {
  const r = rewards.find(x => x.streak === streak);

  if (!data.rewardsUnlocked.includes(streak)) {
    alert("🔒 Necesitas racha de " + streak);
    return;
  }

  showCardModal(r);
}

// FRASES
quote.innerText = ["Sigue", "No pares", "Disciplina"][Math.floor(Math.random()*3)];

// DARK MODE
btnTheme.onclick = () => {
  document.body.classList.toggle("dark");
};

// SWIPE
let startX = 0;
document.addEventListener("touchstart", e => startX = e.touches[0].clientX);
document.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) nextScreen();
  if (endX - startX > 50) prevScreen();
});

const screens = ["home","stats","motivation","cards"];
let current = 0;

function nextScreen(){current=(current+1)%screens.length;showScreen(screens[current]);}
function prevScreen(){current=(current-1+screens.length)%screens.length;showScreen(screens[current]);}

// INIT
render();
