const input = document.getElementById("habitInput");
const list = document.getElementById("habitList");
const statsText = document.getElementById("statsText");
const quote = document.getElementById("quote");
const btnTheme = document.getElementById("toggleTheme");

let chart;

const quotes = [
  "No rompas la racha 🔥",
  "Disciplina > motivación",
  "Hazlo aunque no quieras",
  "Vas mejor que el 80%"
];

const rewards = [
  // Comunes 🔵
  { streak: 3, name: "Inicio", type: "common" },
  { streak: 5, name: "Constante", type: "common" },
  { streak: 10, name: "Activo", type: "common" },
  { streak: 20, name: "Firme", type: "common" },
  { streak: 25, name: "Enfocado", type: "common" },
  { streak: 50, name: "Fuerte", type: "common" },

  // Épicas 🟣
  { streak: 75, name: "Máquina", type: "epic" },
  { streak: 100, name: "Guerrero", type: "epic" },
  { streak: 130, name: "Titán", type: "epic" },
  { streak: 160, name: "Alpha", type: "epic" },
  { streak: 200, name: "Rey", type: "epic" },

  // Legendarias 🟡
  { streak: 250, name: "Maestro", type: "legendary" },
  { streak: 320, name: "Sabio", type: "legendary" },
  { streak: 400, name: "Invencible", type: "legendary" },
  { streak: 500, name: "Leyenda", type: "legendary" },
  { streak: 600, name: "Dios II", type: "legendary" },
  { streak: 700, name: "Eterno", type: "legendary" },
  { streak: 800, name: "Overlord", type: "legendary" },
  { streak: 900, name: "Supremo", type: "legendary" },
  { streak: 1000, name: "Inmortal", type: "legendary" }
];

let data = JSON.parse(localStorage.getItem("data")) || {
  habits: [],
  streak: 0,
  history: {},
  lastDate: null,
  fails: 0,
  rewardsUnlocked: []
};

// ------------- HABITOS -------------
function addHabit(){
  if(!input.value.trim()) return;
  data.habits.push({name:input.value,done:false});
  input.value="";
  save();render();
}

function toggleHabit(i){
  data.habits[i].done=!data.habits[i].done;

  const today=new Date().toISOString().split("T")[0];
  const done=data.habits.filter(h=>h.done).length;
  const percent=(done/data.habits.length)*100;

  if(percent>=80){
    data.history[today]=true;
  }

  checkStreak();
  save();render();
}

function checkStreak(){
  const today=new Date().toISOString().split("T")[0];
  if(data.lastDate===today) return;

  const done=data.habits.filter(h=>h.done).length;
  const percent=(done/data.habits.length)*100;

  if(percent>=80){
    data.streak++;
    data.fails=0;
    checkRewards();
  }else{
    data.fails++;
    if(data.fails>=2){
      data.streak=0;
      data.fails=0;
    }
  }

  data.lastDate=today;
}

// ------------- RECOMPENSAS -------------
function checkRewards(){
  rewards.forEach(r=>{
    const alreadyUnlocked = data.rewardsUnlocked.some(c=>c.streak===r.streak);
    if(data.streak>=r.streak && !alreadyUnlocked){
      data.rewardsUnlocked.push(r);
      showCard(r);
    }
  });
}

function showCard(card){
  const modal=document.getElementById("cardModal");
  modal.innerHTML=`
    <div class="card reward ${card.type}">
      <h2>${card.name}</h2>
      <p>Racha: ${card.streak} 🔥</p>
    </div>
  `;
  modal.classList.add("active");
  navigator.vibrate?.(100);
  setTimeout(()=>modal.classList.remove("active"),2500);
}

// ------------- RENDER -------------
function render(){
  // HABITOS
  list.innerHTML="";
  let done=0;
  data.habits.forEach((h,i)=>{
    if(h.done) done++;
    list.innerHTML+=`
      <div class="card">
        ${h.name}
        <button onclick="toggleHabit(${i})">${h.done?"✔":"○"}</button>
      </div>
    `;
  });

  statsText.innerHTML=`🔥 ${data.streak}`;
  renderChart(done,data.habits.length);
  renderCalendar();
  renderCards();
  quote.innerText=quotes[Math.floor(Math.random()*quotes.length)];
}

// GRAFICA
function renderChart(done,total){
  const ctx=document.getElementById("chart");
  if(!ctx) return;
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:["Hecho","Falta"],
      datasets:[{data:[done,total-done]}]
    }
  });
}

// CALENDARIO
function renderCalendar(){
  const cal=document.getElementById("calendar");
  if(!cal) return;
  cal.innerHTML="";
  for(let i=30;i>=0;i--){
    const d=new Date();
    d.setDate(d.getDate()-i);
    const key=d.toISOString().split("T")[0];
    const div=document.createElement("div");
    div.className="day "+(data.history[key]?"done":"");
    cal.appendChild(div);
  }
}

// CARTAS
function renderCards(){
  const c=document.getElementById("cardsContainer");
  c.innerHTML="";
  rewards.forEach(r=>{
    const unlocked = data.rewardsUnlocked.some(card => card.streak===r.streak);
    if(unlocked){
      c.innerHTML+=`
        <div class="reward ${r.type} unlocked">
          <h4>${r.name}</h4>
          <span>Racha: ${r.streak}</span>
        </div>
      `;
    }else{
      c.innerHTML+=`
        <div class="reward locked">
          <div class="locked">?</div>
          <span class="req">Racha ${r.streak}</span>
        </div>
      `;
    }
  });
}

// MODO DÍA/NOCHE
btnTheme.onclick=()=>document.body.classList.toggle("dark");

// PANTALLAS
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// LOCALSTORAGE
function save(){
  localStorage.setItem("data",JSON.stringify(data));
}

// INICIO
render();
