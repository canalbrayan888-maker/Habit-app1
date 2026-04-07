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

// AGREGAR
function addHabit() {
  if (input.value.trim() === "") return;

  habits.push({
    name: input.value,
    done: false
  });

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
        <button class="check" onclick="toggleHabit(${i})">
          ${h.done ? "✔" : "○"}
        </button>
      </div>
    `;
  });

  statsText.innerText = `Completados: ${completed} de ${habits.length}`;
}

// FRASES
const quotes = [
  "Disciplina mata motivación",
  "Hazlo incluso sin ganas",
  "1% mejor cada día",
  "No te rindas hoy",
  "El cambio empieza contigo"
];

quote.innerText = quotes[Math.floor(Math.random() * quotes.length)];

// TEMA
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
