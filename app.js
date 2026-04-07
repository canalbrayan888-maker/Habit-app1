const input = document.getElementById("habitInput");
const list = document.getElementById("habitList");
const statsText = document.getElementById("statsText");
const quote = document.getElementById("quote");
const btnTheme = document.getElementById("toggleTheme");

let chart;

// DATOS
let data = JSON.parse(localStorage.getItem("data")) || {
  habits: [],
  streak: 0,
  lastDate: null
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

// TOGGLE
function toggleHabit(index) {
  data.habits[index].done = !data.habits[index].done;

  checkStreak();
  save();
  render();
}

// RACHA 🔥
function checkStreak() {
  const today = new Date().toDateString();

  if (data.lastDate !== today) {
    const allDone = data.habits.every(h => h.done);

    if (allDone && data.habits.length > 0) {
      data.streak++;
    }

    data.lastDate = today;
  }
}

// GUARDAR
function save() {
  localStorage.setItem("data", JSON.stringify(data));
}

// RENDER PRINCIPAL
function render() {
  list.innerHTML = "";

  let completed = 0;

  data.habits.forEach((h, i) => {
    if (h.done) completed++;

    list.innerHTML += `
      <div class="card habit">
        <span>${h.name}</span>
        <button class="check" onclick="toggleHabit(${i})">
          ${h.done ? "✔" : "○"}
        </button>
      </div>
    `;
  });

  // PROGRESO
  let percent = data.habits.length
    ? Math.round((completed / data.habits.length) * 100)
    : 0;

  statsText.innerHTML = `
    🔥 Racha: ${data.streak} días <br><br>
    📊 Progreso: ${percent}%
    <div style="background:#ccc; border-radius:10px; margin-top:10px;">
      <div style="width:${percent}%; height:10px; background:#6c63ff; border-radius:10px;"></div>
    </div>
  `;

  renderChart(completed, data.habits.length);
}

// GRÁFICA 📊
function renderChart(completed, total) {
  const ctx = document.getElementById("chart");

  if (!ctx) return;

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completado", "Pendiente"],
      datasets: [{
        data: [completed, total - completed]
      }]
    }
  });
}

// FRASES
const quotes = [
  "Disciplina mata motivación",
  "Hazlo incluso sin ganas",
  "Eres lo que repites",
  "No te rindas hoy",
  "Un día o día uno"
];

quote.innerText = quotes[Math.floor(Math.random() * quotes.length)];

// MODO OSCURO 🌙
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

btnTheme.onclick = () => {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
};

// SWIPE 📱
let startX = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;

  if (startX - endX > 50) {
    nextScreen();
  }

  if (endX - startX > 50) {
    prevScreen();
  }
});

const screens = ["home", "stats", "motivation"];
let current = 0;

function nextScreen() {
  current = (current + 1) % screens.length;
  showScreen(screens[current]);
}

function prevScreen() {
  current = (current - 1 + screens.length) % screens.length;
  showScreen(screens[current]);
}

// INICIAR
render();
