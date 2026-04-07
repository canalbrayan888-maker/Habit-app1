const input = document.getElementById("habitInput");
const list = document.getElementById("habitList");
const statsText = document.getElementById("statsText");
const quote = document.getElementById("quote");
const btnTheme = document.getElementById("toggleTheme");

let habits = JSON.parse(localStorage.getItem("habits")) || [];

// CAMBIAR PANTALLA
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// AGREGAR HÁBITO
function addHabit() {
  if (input.value === "") return;

  habits.push({ name: input.value, done: false });
  input.value = "";

  save();
  render();
}

// TOGGLE
function toggleHabit(index) {
  habits[index].done = !habits[index].done;
  save();
  render();
}

// GUARDAR
function save() {
  localStorage.setItem("habits", JSON.stringify(habits));
}

// RENDER
function render() {
  list.innerHTML = "";

  let completed = 0;

  habits.forEach((h, i) => {
    if (h.done) completed++;

    list.innerHTML += `
      <div class="card habit">
        <span>${h.name}</span>
        <button onclick="toggleHabit(${i})">
          ${h.done ? "✔" : "❌"}
        </button>
      </div>
    `;
  });

  statsText.innerText = `Completados: ${completed} / ${habits.length}`;
}

// FRASES
const quotes = [
  "Disciplina > motivación",
  "Hazlo sin ganas",
  "Pequeños pasos diarios",
  "Tu futuro depende de hoy"
];

quote.innerText = quotes[Math.floor(Math.random() * quotes.length)];

// MODO OSCURO
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

// INICIAR
render();
