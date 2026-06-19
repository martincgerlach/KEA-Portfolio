// State
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
let gameTimer = null;

let targets = [
  { name: "Gorak", race: "Orc", health: 100 },
  { name: "Lytha", race: "Blood Elf", health: 100 },
  { name: "Thorin", race: "Human", health: 100 },
];

// Controls
document.getElementById("attackBtn").addEventListener("click", handleAttack);
document.getElementById("healBtn").addEventListener("click", handleHeal);
document.getElementById("restartBtn").addEventListener("click", restartGame);

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    event.preventDefault();
    handleAttack();
  }

  if (event.key.toLowerCase() === "h") {
    handleHeal();
  }

  if (event.key.toLowerCase() === "r") {
    restartGame();
  }
});

// Start game
spawnEnemy();
updateUI();
gameTick();

// Game loop
function gameTick() {
  if (!isAlive) return;

  enemyX -= enemySpeed;

  if (enemyX < 80) {
    if (!enemyBlocked) {
      enemyAttack();
    }

    enemyBlocked = false;
    enemyX = 600;
  }

  updateUI();
  gameTimer = setTimeout(gameTick, attackSpeed);
}

// Game logic
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
  if (!target || target.health <= 0) return;

  if (enemyX > hitZone) {
    showFeedback("❌ TOO EARLY");
    combo = 0;
    return;
  }

  enemyBlocked = true;
  let damage = amount;

  if (enemyX <= perfectZone) {
    damage *= 1.5;
    showFeedback("🔥 PERFECT");
    combo++;
  } else {
    showFeedback("⚔️ HIT");
    combo++;
  }

  target.health -= damage;

  if (combo >= comboGoal) {
    player.health += comboHeal;

    if (player.health > 100) player.health = 100;

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
  let index = Math.floor(Math.random() * targets.length);
  let enemy = targets[index];

  target = { ...enemy };
  enemyX = 600;

  showNotification("👾 " + target.name + " has spawned!");
}

function increaseDifficulty() {
  difficulty++;

  if (difficulty < 5) {
    enemySpeed = 5;
  } else if (difficulty < 10) {
    enemySpeed = 5 + (difficulty - 5) * 0.5;
  } else {
    enemySpeed = 7.5 + (difficulty - 10) * 0.7;
  }

  if (enemySpeed > 11) enemySpeed = 11;

  if (difficulty >= 10) {
    comboHeal = 10;
  }

  playerDamage += 2;
  if (playerDamage > 50) playerDamage = 50;

  console.log(
    "🔥 Difficulty:",
    difficulty,
    "Speed:",
    enemySpeed,
    "Heal:",
    comboHeal,
    "DMG:",
    playerDamage,
  );
}

// UI
function updateUI() {
  if (!target) return;

  const healthText = document.getElementById("healthDisplay");
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

  const enemyPosition = Math.min(100, Math.max(0, (enemyX / 700) * 100));
  enemyEl.style.setProperty("--enemy-x", enemyPosition + "%");

  healthText.textContent = player.health;
  hpBar.style.width = player.health + "%";
  document.getElementById("levelDisplay").textContent = difficulty;
  document.getElementById("enemyHealth").textContent =
    target.name + ": " + target.health + " HP";

  if (!isAlive) {
    restartHint.style.display = "block";
    restartHint.classList.add("flash");
    return;
  }

  restartHint.style.display = "none";
  restartHint.classList.remove("flash");
}

function showFeedback(text) {
  const feedback = document.getElementById("actionFeedback");
  if (!feedback) return;

  feedback.textContent = text;

  setTimeout(() => {
    feedback.textContent = "";
  }, 500);
}

function showNotification(text) {
  const notification = document.getElementById("notification");
  if (!notification) return;

  notification.textContent = text;
  notification.style.color = text.includes("💚") ? "lightgreen" : "#ccc";
  notification.style.opacity = 1;

  setTimeout(() => {
    notification.style.opacity = 0;
  }, 1200);
}

// Input handlers
function handleAttack() {
  if (!canAttack) return;

  canAttack = false;
  attackEnemy(playerDamage);

  setTimeout(() => {
    canAttack = true;
  }, 300);
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

// System
function restartGame() {
  if (gameTimer !== null) {
    clearTimeout(gameTimer);
    gameTimer = null;
  }

  player.health = 100;
  isAlive = true;
  canAttack = true;
  canHeal = true;
  enemyBlocked = false;
  difficulty = 1;
  combo = 0;
  playerDamage = 20;
  comboHeal = 20;
  enemyDamage = 5;
  enemySpeed = 5;

  spawnEnemy();
  updateUI();
  gameTick();
}
