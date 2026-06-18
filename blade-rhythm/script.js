// =======================
// 🟢 STATE
// =======================
let player = { health: 100 };
let playerDamage = 20; 
let isAlive = true;
let canAttack = true;
let canHeal = true;
let target;
let enemyX = 200;
let enemyDamage = 5;
let attackSpeed = 50;
let enemySpeed = 5;
let hitZone = 140;
let perfectZone = 70;
let enemyBlocked = false;
let difficulty = 1;
let combo = 0; 
let comboHeal = 20;
let comboGoal = 4; 


let targets = [
  { name: "Gorak", race: "Orc", health: 100 },
  { name: "Lytha", race: "Blood Elf", health: 100 },
  { name: "Thorin", race: "Human", health: 100 }
];
document.addEventListener("keydown", function(event) {
  if (event.code === "Space") {
    handleAttack();
  }

  if (event.key.toLowerCase() === "h") {
    handleHeal();
  }

  if (event.key.toLowerCase() === "r") {
    restartGame();
  }
});

// =======================
// 🟡 INIT
// =======================

spawnEnemy();
updateUI();
gameTick();


// =======================
// 🔵 GAME LOOP
// =======================

function gameTick() {
  if (!isAlive) return;

  // Move enemy
  enemyX -= enemySpeed;

  // Collision (enemy reaches player)
  if (enemyX < 80) {
    if (!enemyBlocked) {
      enemyAttack();
    }

    enemyBlocked = false;
    enemyX = 600; 
  }

  updateUI();

  setTimeout(gameTick, attackSpeed);
}


// =======================
// 🔴 GAME LOGIC
// =======================

function takeDamage(amount) {
  if (!isAlive) return;

  player.health -= amount;

  if (player.health <= 0) {
    player.health = 0;
    isAlive = false;
    console.log("💀 player died to:", target.name);
  }

  updateUI();
}

function enemyAttack() {
  showFeedback("💥 HIT BY ENEMY");
  takeDamage(enemyDamage);
}

function attackEnemy(amount) {
  if(!target || target.health <= 0) return;

  if(enemyX > hitZone) {
  showFeedback("❌ TOO EARLY")
  combo = 0; 
  return;
  }
enemyBlocked = true

let damage = amount

if(enemyX <= perfectZone){
  damage *= 1.5
  showFeedback("🔥 PERFECT");
  combo++; 
} else {
showFeedback("⚔️ HIT");
combo++;
}
target.health -= damage; 

if(combo >= comboGoal) {
player.health += comboHeal; 

if(player.health > 100) player.health = 100; 
showNotification("💚 +" + comboHeal + " HP");
combo = 0; 
}

if (target.health <= 0) {
target.health = 0;  


console.log("💀 Enemy defeated!"); 

increaseDifficulty();
spawnEnemy();

}
  console.log("Enemy health:", target.health);
}   

function spawnEnemy() {
  let i = Math.floor(Math.random() * targets.length);
  let e = targets[i];

  target = { ...e }; 

  enemyX = 600;

showNotification("👾 " + target.name + " has spawned!");  
}

function increaseDifficulty() {
  difficulty++;
  if (difficulty < 5) {
  enemySpeed = 5;
} 
else if (difficulty < 10) {
  enemySpeed = 5 + (difficulty - 5) * 0.5;
} 
else {
  enemySpeed = 7.5 + (difficulty - 10) * 0.7;
}
if (enemySpeed > 11) enemySpeed = 11;
  // Combo heal change
  if (difficulty >= 10) {
    comboHeal = 10;
  }

  // Player damage scaling
  playerDamage += 2;
  if (playerDamage > 50) playerDamage = 50;

  console.log("🔥 Difficulty:", difficulty, "Speed:", enemySpeed, "Heal:", comboHeal, "DMG:", playerDamage);
}


// =======================
// 🟣 UI
// =======================

function updateUI() {
  if (!target) return;

  const healthText = document.getElementById("healthDisplay");
  const reviveBtn = document.getElementById("reviveBtn");
  const restartBtn = document.getElementById("restartBtn");
  const restartHint = document.getElementById("restartHint");
  const hpBar = document.getElementById("hpBar");
  const enemyEl = document.getElementById("enemy");
  if (target.race === "Orc") {
  enemyEl.src = "orc.png";
} else if (target.race === "Blood Elf") {
  enemyEl.src = "blood-elf.png";
} else if (target.race === "Human") {
  enemyEl.src = "human.png";
}

  if (!isAlive) {
  healthText.textContent = "💀 DEAD";
  hpBar.style.width = "0%";

  restartHint.style.display = "block";
  restartHint.classList.add("flash");

  return;
}

  // Enemy movement
  enemyEl.style.left = enemyX + "px";

  // Player UI
  healthText.textContent = "Health: " + player.health;
  hpBar.style.width = player.health + "%";
  document.getElementById("levelDisplay").textContent =
  "difficulty: " + difficulty;
  // Enemy UI
  document.getElementById("enemyHealth").textContent =
    target.name + " ( " + target.race + " ) - HP: " + target.health;

  reviveBtn.style.display = "none";
}

function showFeedback(text) {
  const el = document.getElementById("actionFeedback");
  if (!el) return;
  el.textContent = text;

  setTimeout(() => {
    el.textContent = "";
  }, 500);
}

function showNotification(text) {
  const el = document.getElementById("notification");
  if (!el) return;

  el.textContent = text;

  // 🎨 Color based on type
  if (text.includes("💚")) {
    el.style.color = "lightgreen";
  } else {
    el.style.color = "#ccc";
  }

  el.style.opacity = 1;

  setTimeout(() => {
    el.style.opacity = 0;
  }, 1200);
}


// =======================
// 🟠 INPUT HANDLERS
// =======================

function handleAttack() {
  if(!canAttack) return;
  canAttack = false;
  attackEnemy(playerDamage);

  setTimeout(() => {
    canAttack = true;
  }, 300);
}

function handleDamage() {
  takeDamage(getInputValue());
}

function handleHeal() {
  if (!isAlive || !canHeal) return;

  if (player.health >= 100) {
    console.log("already full hp");
    showFeedback("✨ ALREADY FULL");
    return;
  }

  canHeal = false;
  let amount = 15;
  player.health += amount;

  if (player.health > 100) player.health = 100;

  showFeedback("✨ HEAL!");

  setTimeout(() => {
    canHeal = true;
  }, 2000);

  updateUI();
}


// =======================
// 🟤 UTIL
// =======================

function getInputValue() {
  return Number(document.getElementById("amountInput").value);
}


// =======================
// ⚫ SYSTEM
// =======================

function restartGame() {
  player.health = 100;
  isAlive = true;

  // 🔥 RESET ALL GAME STATE
  difficulty = 1;
  combo = 0;

  playerDamage = 20;
  comboHeal = 20;

  enemyDamage = 5;
  enemySpeed = 5;

  spawnEnemy();

  const restartHint = document.getElementById("restartHint");
  restartHint.style.display = "none";
  restartHint.classList.remove("flash");

  updateUI();

  gameTick(); // restart loop
}

function revive() {
  if (isAlive) return;

  player.health = 100;
  isAlive = true;

  console.log("✨ Player revived");

  updateUI();
}