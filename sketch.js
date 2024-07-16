let dory;
let platforms = [];
let nemos = [];
let bgImage; //fondo
let doryImage;
let brickImage; //plataforma
let nemoImage;
let gravity = 0.5;
let jumpForce = -10;
let isJumping = false;
let platformSpacing = 200; 
let lastPlatformY = 100; 
let score = 0; 
let maxNemos = 30; 
let gameWon = false; 
let nemosToWin = 20; 
let idleTime = 0; // tiempo sin acción del usuario
let maxIdleTime =  2 * 60 
let gameOver = false; 
let musica

//camara que sigue a dory
let cameraY = 0; // Posición de la cámara en Y
let cameraSpeed = 0.1; // Velocidad de seguimiento de la cámara

// Variables para la barra de tiempo
let totalTime = 3 * 60 * 60; 
let timeRemaining = totalTime;
let barWidth = 300; 
let barHeight = 20; 

//imagenes y sonidos
function preload() {
  bgImage = loadImage('fondo.png');
  doryImage = loadImage('dory.png');
  brickImage = loadImage('barra.png');
  nemoImage = loadImage('nemo.png');
  musica = loadSound('nemocancion.mp3');
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  resetGame();
  musica.loop ();
}

function draw() {
  if (gameOver || gameWon) {
    background(bgImage);
    fill(255, 165, 0); 
    textSize(64);
    textAlign(CENTER);
    text(gameWon ? '¡Ganaste!' : 'Game Over', width / 2, height / 2);
    textSize(32);
    text('Presiona Enter para reiniciar', width / 2, height / 2 + 60);
    return;
  }

  background(bgImage);

  // Desplazamiento de la camara
  let targetCameraY = dory.y - height / 2 + 100; // altura de Dory en el canvas
  cameraY = lerp(cameraY, targetCameraY, cameraSpeed);

  dory.velocityY += gravity;
  dory.y += dory.velocityY;

  
//detectar si dory esta arriba de las plataformas y hacer que se quede quieta
  let onPlatform = false;
  for (let platform of platforms) {
    if (dory.y + dory.height / 2 >= platform.y &&
        dory.y + dory.height / 2 <= platform.y + platform.height &&
        dory.x + dory.width / 2 > platform.x &&
        dory.x - dory.width / 2 < platform.x + platform.width &&
        dory.velocityY >= 0) {
      dory.velocityY = 0;
      dory.y = platform.y - dory.height / 2;
      onPlatform = true;
      isJumping = false;
      dory.y = platform.y - dory.height / 7 - 1;
    } else if (dory.y - dory.height / 2 <= platform.y + platform.height &&
               dory.y + dory.height / 2 >= platform.y + platform.height &&
               dory.x + dory.width / 2 > platform.x &&
               dory.x - dory.width / 2 < platform.x + platform.width) {
      dory.velocityY = 0;
      dory.y = platform.y + platform.height + dory.height / 2;
    }
  }

  if (!onPlatform) {
    dory.velocityY += gravity;
  }

  if (keyIsDown(LEFT_ARROW)) {
    dory.x -= 5;
    idleTime = 0;
  }
  if (keyIsDown(RIGHT_ARROW)) {
   dory.x += 5;
   idleTime = 0;
  }
  if (keyIsDown(UP_ARROW)) {
   idleTime = 0;
}

  idleTime++;
  if (dory.x > width) {
    dory.x = 0;
  } else if (dory.x < 0) {
    dory.x = width;
  }

  if (dory.y > height) {
    dory.y = height - 100;
    dory.velocityY = 0;
    isJumping = false;
  }

  // Generar plataformas adicionales antes de que Dory llegue al punto de no haber más plataformas
  while (dory.y - 3 * platformSpacing < lastPlatformY) {
    let newPlatform = {
      x: random(width - 150), // Ajusta la posición x para que esté dentro del canvas
      y: lastPlatformY - platformSpacing,
      width: 150,
      height: 60,
      image: brickImage
    };
    platforms.push(newPlatform);
    lastPlatformY = newPlatform.y;

    // Agrega Nemos sobre algunas plataformas
    if (nemos.length < maxNemos && random() < 0.3) { // 30% de probabilidad de agregar un Nemo
      let nemo = {
        x: newPlatform.x + newPlatform.width / 2,
        y: newPlatform.y - 30,
        width: 30,
        height: 30,
        image: nemoImage,
        collected: false
      };
      nemos.push(nemo);
    }
  }

   

  // Ajustar la posición de dibujo para la cámara
  push();
  translate(0, -cameraY + height / 4);

  imageMode(CENTER);
  image(dory.image, dory.x, dory.y, dory.width, dory.height);

  for (let platform of platforms) {
    imageMode(CORNER);
    image(platform.image, platform.x, platform.y, platform.width, platform.height);
  } //dibuja las plataformas en la pantalla en sus posiciones actuales



  for (let nemo of nemos) {
    if (!nemo.collected) {
      imageMode(CENTER);
      image(nemo.image, nemo.x, nemo.y, nemo.width, nemo.height);
      if (dist(dory.x, dory.y, nemo.x, nemo.y) < dory.width / 2 + nemo.width / 2) {
        nemo.collected = true;
        score++;
        timeRemaining += 5 * 60; // Añadir 5 segundos (5*60 frames) al tiempo restante
        if (timeRemaining > totalTime) {
          timeRemaining = totalTime; // Asegurarse de que el tiempo no exceda el tiempo total
        }
      }
    }
  }

  pop();

  // Actualizar y dibujar la barra de tiempo
  timeRemaining--;
  let barProgress = map(timeRemaining, 0, totalTime, 0, barWidth);
  fill(255, 165, 0); 
  rect(width - barWidth - 20, 20, barProgress, barHeight);
  noFill();
  stroke(255);
  rect(width - barWidth - 20, 20, barWidth, barHeight);
  noStroke();

  // Calcular minutos y segundos restantes
  let minutes = floor(timeRemaining / (60 * 60));
  let seconds = floor((timeRemaining % (60 * 60)) / 60);
  let timeText = nf(minutes, 2) + ':' + nf(seconds, 2); // Formato MM:SS

  fill(255, 165, 0); 
  textSize(32);
  textAlign(RIGHT, CENTER);
  text(timeText, width - barWidth - 30, 30); 

  fill(255, 165, 0); 
  textSize(32);
  textAlign(LEFT, TOP);
  text(`Score: ${score}/${nemosToWin}`, 10, 40);

  //game over
  if (timeRemaining <= 0) {
    gameOver = true;
  }

  if (score >= nemosToWin) {
    fill(255, 165, 0); 
    textAlign(CENTER);
    text('¡Ganaste!', width / 2, height / 2);
    gameWon = true;
    noLoop(); // Detiene el juego temporalmente
    textSize(32);
    text('Presiona Enter para reiniciar', width / 2, height / 2 + 60);
  }
}
//detecta las teclas presionadas,  Si es la tecla de flecha hacia arriba y Dory no está saltando, aplica la fuerza de salto.

function keyPressed() {
  if (keyCode === UP_ARROW && !isJumping) {
    dory.velocityY = jumpForce;
    isJumping = true;
  }


  if ((gameWon || gameOver) && keyCode === ENTER) {
    resetGame();
    loop(); // Reinicia el bucle de draw
  }
}
// detecta cuando se suelta una tecla. Si es la tecla de flecha hacia arriba, establece isJumping en false.

function keyReleased() {
  if (keyCode === UP_ARROW) {
    isJumping = false;
  }
}
//arranca de nuevo el juego
function resetGame() {
  dory = {
    x: width / 2,
    y: height / 2, // Ajusta la posición inicial de Dory más arriba en la pantalla
    width: 60,
    height: 60,
    velocityY: 0,
    image: doryImage
  };

  platforms = [];
  nemos = [];
  score = 0;
  gameWon = false;
  gameOver = false;
  idleTime = 0;
  cameraY = 0; // Reiniciar la posición de la cámara
  timeRemaining = totalTime; // Reiniciar el tiempo restante

  // Crear la plataforma inicial fija
  let initialPlatform = {
    x: width / 2 - 75, // Centra la plataforma inicial
    y: height - 100,
    width: 150,
    height: 60,
    image: brickImage
  };
  platforms.push(initialPlatform);
  lastPlatformY = initialPlatform.y;


}
