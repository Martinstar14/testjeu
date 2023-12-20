let timerElement = document.getElementById('timer');
let niveauElement = document.getElementById('niveau'); // Élément pour afficher le niveau
let heartContainer = document.querySelector('.game-coeur');
let seconds = 0;
let level = 0; // Niveau initial
let timer;
let showTimerId;
let timerRunning;
let rocketPositionX = 450;
let isMovingLeft = false;
let isMovingRight = false;
let obstacles = []; // Pour stocker les obstacles
let obstacleInterval;
let time = 1500; // Durée initiale pour la chute des obstacles (en millisecondes)
let lives = 3; // Nombre de vies initiales
let levelsCount = 10; // Nombre de niveaux
let levelDuration = 30; // Durée de chaque niveau en secondes
let timeReduction = 50; // Réduction du temps pour chaque niveau (en millisecondes)
let currentSeconds = 0; // Temps courant
let totalSeconds = 0; // Temps total écoulé
let obstacleSpeed = 1.3;


const FPS = 60; // Fréquence d'images par seconde
const frameInterval = 1000 / FPS; // Intervalle de temps pour chaque frame

document.addEventListener('DOMContentLoaded', function() {
  gameLoop(); // Affiche la fenêtre modale lorsque la page est chargée
});

// Gèrent le timer du jeu au lancement
function startTimer() {
  timer = setInterval(updateTimer, 1000); // Mettre à jour le chrono chaque seconde (1000ms)
}

// Gèrent le timer du jeu
function showTimer() {
  seconds = timerRunning % levelDuration;

  let formattedMinutes = Math.floor(timerRunning / 60);
  let formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  timerElement.textContent = `TIMER: ${formattedMinutes}:${formattedSeconds}`;
  timerRunning += 1;
}

// Met a jour le timer 
function updateTimer() {
  totalSeconds++; // Incrémente le temps total écoulé
  currentSeconds++;

  let formattedMinutes = Math.floor(totalSeconds / 60);
  let formattedSeconds = totalSeconds % 60;

  timerElement.textContent = `TIMER: ${formattedMinutes}:${formattedSeconds}`;

  if (currentSeconds >= levelDuration) {
    if (level < levelsCount) {
      level++;
      startLevelX(level);
      time -= timeReduction;
      clearInterval(obstacleInterval);
      obstacleInterval = setInterval(createObstacle, time);
      currentSeconds = 0;

      obstacleSpeed += 0.5; // ou tout autre valeur qui convient à ton gameplay

      // Appeler la nouvelle fonction d'animation de fin de niveau
      endLevelAnimation();
    } else {
      stopGame();
    }
  }
}

// Iden pour le timer
function stopTimer() {
  clearInterval(timer); // Arrêter le chrono
}

// Met à jour la position de la fusée en fonction des touches enfoncées
function moveRocket() {
  let rocket = document.getElementById('rocket');
  let gameContainer = document.querySelector('.game-container');

  if (gameContainer) {
    let gameContainerWidth = gameContainer.offsetWidth;

    if (isMovingLeft && rocketPositionX > 0) {
      rocketPositionX -= 10; // Déplacement vers la gauche
    } else if (isMovingRight && (rocketPositionX + rocket.clientWidth) <= gameContainerWidth) {
      rocketPositionX += 10; // Déplacement vers la droite
    }

    rocket.style.left = rocketPositionX + 'px'; // Déplacement horizontal de la fusée
  }
}

// Fonction pour le départ de la game 
function startGame() {
  document.getElementById('jouer-text').style.display = 'none';

  document.addEventListener('keydown', function(event) {
    if (event.code === 'ArrowLeft') {
      isMovingLeft = true;
    } else if (event.code === 'ArrowRight') {
      isMovingRight = true;
    }
  });

  document.addEventListener('keyup', function(event) {
    if (event.code === 'ArrowLeft') {
      isMovingLeft = false;
    } else if (event.code === 'ArrowRight') {
      isMovingRight = false;
    }
  });

  level = 1; // Démarre le jeu au niveau 1
  startTimer();
  toggleRocketFlame();
  startLevelX(level);
  obstacleInterval = setInterval(createObstacle, time);
  gameLoop();
  updateLivesDisplay();
}

// Fonction pour initialise le jeu et les niveaux
function startLevelX(levelX) {
  niveauElement.textContent = "Niveau : " + levelX;

  let obstacleSpeed = calculateObstacleSpeed(levelX); // Utilisation de la fonction calculateObstacleSpeed()

  // Réglage du nombre d'obstacles en fonction du niveau
  let obstaclesCount = levelX * 3; // Nombre d'obstacles augmente progressivement

  if (levelX >= 4 && levelX <= 7) {
    obstacleSpeed = calculateObstacleSpeed(levelX); // Utilisation de calculateObstacleSpeed() pour la vitesse graduelle
    obstaclesCount = levelX * 4; // Augmente le nombre d'obstacles progressivement
  } else if (levelX > 7) {
    obstacleSpeed = calculateObstacleSpeed(levelX); // Utilisation de calculateObstacleSpeed() pour une vitesse plus prononcée
    obstaclesCount = 30 - (levelX * 2); // Réduit légèrement le nombre d'obstacles
  }

  // Mise à jour de la vitesse de tous les obstacles existants
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].speed = obstacleSpeed;
  }

  time = 2000 - (levelX * 100); // Réduit progressivement la durée entre chaque chute d'obstacle

  // Actualiser le nombre d'obstacles
  clearInterval(obstacleInterval);
  obstacleInterval = setInterval(createObstacle, time);

  createHeart(); // Fait tomber un cœur à chaque niveau

  // Appeler la nouvelle fonction d'animation de fin de niveau
  endLevelAnimation();
}

// Fonction pour l'animation quand je passe un niveau
function endLevelAnimation() {
  let h1Element = document.querySelector('h1');
  h1Element.classList.add('rotate-depth-animation');

  setTimeout(function() {
    h1Element.classList.remove('rotate-depth-animation');
  }, 3000); // Supprime la classe après 3 secondes (ajustez la durée selon vos besoins)
}

function toggleRocketFlame() {
  let rocket = document.getElementById('rocket');
  let rocketFlame = document.createElement('div');
  rocketFlame.classList.add('rocket-flame');
  rocket.appendChild(rocketFlame);

  // Activer l'animation lorsque la fusée se déplace
  document.addEventListener('keydown', function(event) {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      rocketFlame.style.display = 'block';
    }
  });

  // Désactiver l'animation lorsque la fusée est immobile
  document.addEventListener('keyup', function(event) {
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      rocketFlame.style.display = 'none';
    }
  });
}

// Foncction pour créer les obstacles qui tombent
function createObstacle() {
  if (obstacles.length < level * 5) {
    let obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.style.width = '50px';
    obstacle.style.height = '50px';
    obstacle.style.backgroundColor = 'none'; // Personnalisez le style de l'obstacle

    let obstaclePositionX = Math.floor(Math.random() * 850); // Position aléatoire sur l'axe X

    obstacle.style.position = 'absolute';
    obstacle.style.left = obstaclePositionX + 'px';
    obstacle.style.top = '-50px'; // Fait apparaître l'obstacle en dehors de la zone de jeu

    let obstacleSpeed = calculateObstacleSpeed(level); // Calcule la vitesse de l'obstacle en fonction du niveau

    obstacle.speed = obstacleSpeed; // Stocke la vitesse dans chaque obstacle initial

    document.querySelector('.game-container').appendChild(obstacle); // Ajoute l'obstacle à la div "game-container"

    obstacles.push(obstacle); // Ajoute l'obstacle au tableau

    let index = obstacles.length - 1; // Récupère l'index du nouvel obstacle ajouté

    setInterval(function () {
      moveObstacle(index);
    }, frameInterval);
  }
}

function createHeart() {
  let heart = document.createElement('img');
  heart.src = 'coeur.png'; // Chemin de l'image du cœur
  heart.alt = 'Coeur';
  heart.classList.add('heart'); // Ajoutez une classe pour styler le cœur

  let heartPositionX = Math.floor(Math.random() * 850); // Position aléatoire sur l'axe X
  heart.style.position = 'absolute';
  heart.style.left = heartPositionX + 'px';
  heart.style.top = '-50px'; // Fait apparaître le cœur en dehors de la zone de jeu

  document.querySelector('.game-container').appendChild(heart); // Ajoute le cœur à la div "game-container"

  // Fait tomber le cœur
  setInterval(function() {
    moveHeart(heart);
  }, frameInterval);
}

function moveHeart(heart) {
  let currentPosition = parseInt(heart.style.top);
  if (currentPosition >= 800) {
    heart.parentNode.removeChild(heart); // Retire le cœur une fois hors de l'écran
  } else {
    heart.style.top = currentPosition + 1 + 'px'; // Vitesse de descente du cœur
    detectHeartCollision(heart); // Vérifie la collision avec la fusée à chaque déplacement
  }
}

function detectHeartCollision(heart) {
  let rocket = document.getElementById('rocket');
  let rocketPosition = rocket.getBoundingClientRect();
  let heartPosition = heart.getBoundingClientRect();

  if (
    rocketPosition.bottom >= heartPosition.top &&
    rocketPosition.top <= heartPosition.bottom &&
    rocketPosition.right >= heartPosition.left &&
    rocketPosition.left <= heartPosition.right
  ) {
    // Collision détectée avec le cœur
    if (lives < 3) { // Vérifie si des vies ont été perdues précédemment
      lives++; // Ajoute un cœur à la vie
      updateLivesDisplay(); // Met à jour l'affichage des vies
    }
    heart.parentNode.removeChild(heart); // Retire le cœur
  }
}

// Fonction pour controler la vitesse des obsatcles pour chaque niveau (ca ne fonctionne pas)
function calculateObstacleSpeed(level) {
  // Calcul de la vitesse de l'obstacle en fonction du niveau
  switch (level) {
    case 1:
      return 6.5;
    case 2:
      return 2.5;
    case 3:
      return 3;
    case 4:
      return 3.5;
    case 5:
      return 4;
    case 6:
      return 4.5;
    case 7:
      return 5;
    case 8:
      return 5.5;
    case 9:
      return 6;
    case 10:
      return 6.5;
    default:
      return 6.5; // Par défaut, retourne une vitesse pour le niveau supérieur à 10
  }
}

// Fonction pour mettre a jour la vie dans le jeu
function updateLivesDisplay() {
  heartContainer.innerHTML = ''; // Réinitialise l'affichage des cœurs

  for (let i = 0; i < lives; i++) {
    let heart = document.createElement('img');
    heart.src = 'coeur.png'; // Ajoute le chemin de ton image de cœur
    heart.alt = 'Coeur';
    heartContainer.appendChild(heart);
  }
}

// Fonction pour le déplacement des obstacles
function moveObstacle(index) {
  let currentPosition = parseInt(obstacles[index].style.top);
  if (currentPosition >= 800) {
    obstacles[index].parentNode.removeChild(obstacles[index]); // Retire l'obstacle une fois hors de l'écran
    obstacles.splice(index, 1); // Retire l'obstacle du tableau
  } else {
    obstacles[index].style.top = currentPosition + obstacleSpeed + 'px'; // Vitesse de déplacement de l'obstacle
  }
}

// Fonction pour déclencher une secousse (ca ne fonctionne pas)
function vibrateDevice() {
  if (navigator.vibrate) {
    navigator.vibrate(200); // 200 millisecondes de secousse
  }
}

// Fonction pour avoir une collision entre la fusée et l'obstacle
function detectCollision() {
  let rocket = document.getElementById('rocket');
  let rocketPosition = rocket.getBoundingClientRect();

  for (let i = 0; i < obstacles.length; i++) {
    let obstacle = obstacles[i];
    let obstaclePosition = obstacle.getBoundingClientRect();

    if (
      rocketPosition.bottom >= obstaclePosition.top &&
      rocketPosition.top <= obstaclePosition.bottom &&
      rocketPosition.right >= obstaclePosition.left &&
      rocketPosition.left <= obstaclePosition.right
    ) {
      // Collision détectée
      lives--;
      updateLivesDisplay(); // Met à jour l'affichage des cœurs
      if (lives === 0) {
        stopGame(); // Arrête le jeu si plus de vies restantes
      }
      obstacle.parentNode.removeChild(obstacle); // Retire l'obstacle
      obstacles.splice(i, 1); // Retire l'obstacle du tableau

      // Déclencher la secousse du téléphone en cas de collision
      vibrateDevice();

      // Clignoter la fusée deux fois
      for (let j = 0; j < 2; j++) {
        setTimeout(function() {
          rocket.classList.add('rocket-blink');
          setTimeout(function() {
            rocket.classList.remove('rocket-blink');
          }, 200); // Changez cette valeur pour ajuster la durée du clignotement
        }, j * 400); // Changez cette valeur pour ajuster l'intervalle entre les clignotements
      }
    }
  }
}

// Fonction qui stop le jeu et la création d'obstacle
function stopGame() {
  clearInterval(obstacleInterval); // Arrête la création d'obstacles
  clearInterval(timer); // Arrête le chrono
  alert('Game Over!'); // Affiche un message de fin de jeu (tu peux personnaliser cette partie)
  location.reload();
}

// Fonction gameLoop qui est la boucle du jeu et qui met à jour les mouvements et vérifie les collisions à chaque frame
function gameLoop() {
  moveRocket();
  detectCollision(); // Détecte les collisions à chaque frame
  setTimeout(gameLoop, frameInterval);
}

// POUR LES TOUCHES PC ET SMARTPHONE

let touchStartX = 0;
let touchEndX = 0;
let touchMoved = false;

document.addEventListener('touchstart', function(event) {
  event.preventDefault();
  touchStartX = event.touches[0].clientX;
  touchMoved = false;
});

document.addEventListener('touchmove', function(event) {
  event.preventDefault();
  touchMoved = true;
  touchEndX = event.touches[0].clientX;

  // Calcul du déplacement horizontal
  let swipeDistance = touchEndX - touchStartX;

  if (swipeDistance < -10) {
    isMovingLeft = true;
    isMovingRight = false;
  } else if (swipeDistance > 10) {
    isMovingRight = true;
    isMovingLeft = false;
  } else {
    isMovingLeft = false;
    isMovingRight = false;
  }
});

document.addEventListener('keydown', function(event) {
  if (event.code === 'ArrowLeft') {
    isMovingLeft = true;
  } else if (event.code === 'ArrowRight') {
    isMovingRight = true;
  } else if (event.code === 'Space') {
    startGame(); // Démarrer le jeu avec la touche espace
  }
});

document.addEventListener('keyup', function(event) {
  if (event.code === 'ArrowLeft') {
    isMovingLeft = false;
  } else if (event.code === 'ArrowRight') {
    isMovingRight = false;
  }
});


document.addEventListener('touchend', function(event) {
  if (!touchMoved) {
    startGame(); // Lance le jeu si aucun déplacement n'a eu lieu (juste un appui)
  } else {
    isMovingLeft = false;
    isMovingRight = false;
  }
});

