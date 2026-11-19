let img;
let img1;
let cakes = [];
let poisonedCakeIndices = new Set();
let gameStarted = false;
let visionImpaired = false;
let poisonBitesTaken = 0;
let poisonedCakesEaten = 0;
let health = 100;
let knockedOut = false;
let startButton;
let restartButton;
let backButton;
let transitionActive = false;
let transitionStartedAt = 0;
let transitionToTable = true;
const transitionDuration = 850;

const cakeComments = [
  "These cakes are deathly delicious.",
  "That cake will take you to heaven.",
  "A royal treat… with a suspicious aftertaste.",
  "One bite, and the ball will be unforgettable.",
  "The frosting is almost too good to be true.",
  "A little slice of paradise—or peril.",
  "The Queen's baker has outdone themself.",
];

async function setup() {
  document.body.style.margin = "0";
  document.body.style.backgroundColor = "rgb(72, 32, 54)";
  document.documentElement.style.backgroundColor = "rgb(72, 32, 54)";

  createCanvas(1500, windowHeight);
  img = await loadImage("assets/caketable.jpg");
  img1 = await loadImage("assets/music.jpg");

  const cakeImages = [];
  for (let cakeNumber = 1; cakeNumber <= 14; cakeNumber++) {
    cakeImages.push(await loadImage(`assets/cake${cakeNumber}.png`));
  }

  cakes = [
    { image: cakeImages[0], x: 165, y: 500, w: 100, h: 120 },
    { image: cakeImages[1], x: 1210, y: 450, w: 120, h: 120 },
    { image: cakeImages[2], x: 700, y: 600, w: 120, h: 100 },
    { image: cakeImages[3], x: 910, y: 470, w: 120, h: 100 },
    { image: cakeImages[4], x: 500, y: 600, w: 120, h: 100 },
    { image: cakeImages[5], x: 820, y: 550, w: 120, h: 100 },
    { image: cakeImages[6], x: 600, y: 540, w: 120, h: 100 },
    { image: cakeImages[7], x: 400, y: 550, w: 120, h: 100 },
    { image: cakeImages[8], x: 1000, y: 600, w: 120, h: 100 },
    { image: cakeImages[9], x: 1100, y: 540, w: 120, h: 100 },
    { image: cakeImages[10], x: 1200, y: 600, w: 120, h: 100 },
    { image: cakeImages[11], x: 260, y: 600, w: 120, h: 100 },
    { image: cakeImages[12], x: 380, y: 450, w: 120, h: 100 },
    { image: cakeImages[13], x: 520, y: 420, w: 120, h: 100 },
  ];
  cakes.forEach((cake) => {
    cake.bites = 0;
    cake.bitesNeeded = floor(random(3, 6));
  });

  choosePoisonedCakes();

  startButton = createButton("Let Them Eat Cake!");
  startButton.position(50, 200);
  startButton.size(300, 60);
  startButton.style("font-size", "24px");
  startButton.style("background-color", "#FFB6C1");
  startButton.style("border", "3px solid #FF69B4");
  startButton.style("border-radius", "10px");
  startButton.style("cursor", "pointer");
  startButton.style("font-weight", "bold");
  startButton.mousePressed(() => {
    transitionActive = true;
    transitionToTable = true;
    transitionStartedAt = millis();
    startButton.hide();
  });

  backButton = createButton("← Back to Welcome");
  backButton.position(24, 24);
  backButton.style("font-size", "18px");
  backButton.style("background-color", "#FFB6C1");
  backButton.style("border", "3px solid #FF69B4");
  backButton.style("border-radius", "10px");
  backButton.style("cursor", "pointer");
  backButton.style("font-weight", "bold");
  backButton.mousePressed(() => {
    if (transitionActive) return;
    transitionActive = true;
    transitionToTable = false;
    transitionStartedAt = millis();
    backButton.hide();
    restartButton.hide();
  });
  backButton.hide();

  restartButton = createButton("Try Again");
  restartButton.size(180, 52);
  restartButton.style("font-size", "20px");
  restartButton.style("background-color", "#FFB6C1");
  restartButton.style("border", "3px solid #FF69B4");
  restartButton.style("border-radius", "10px");
  restartButton.style("cursor", "pointer");
  restartButton.style("font-weight", "bold");
  restartButton.mousePressed(() => {
    visionImpaired = false;
    poisonBitesTaken = 0;
    poisonedCakesEaten = 0;
    health = 100;
    knockedOut = false;
    cakes.forEach((cake) => {
      cake.bites = 0;
      cake.bitesNeeded = floor(random(3, 6));
    });
    choosePoisonedCakes();
    restartButton.hide();
  });
  restartButton.hide();
}

function draw() {
  if (transitionActive) {
    drawRoomTransition();
  } else if (gameStarted) {
    cakeTable();
  } else {
    welcome();
  }
}

function drawRoomTransition() {
  const elapsed = millis() - transitionStartedAt;
  const progress = constrain(elapsed / transitionDuration, 0, 1);
  const easedProgress = progress * progress * (3 - 2 * progress);

  if (transitionToTable) {
    // Slide the welcome room left as the cake table enters from the right.
    push();
    translate(-easedProgress * width, 0);
    welcome();
    pop();

    push();
    translate((1 - easedProgress) * width, 0);
    drawCakeTableScene();
    pop();
  } else {
    // Reverse the same head-turn when returning to the welcome screen.
    push();
    translate(easedProgress * width, 0);
    drawCakeTableScene();
    pop();

    push();
    translate((easedProgress - 1) * width, 0);
    welcome();
    pop();
  }

  if (progress >= 1) {
    transitionActive = false;
    gameStarted = transitionToTable;
    if (gameStarted) backButton.show();
    else startButton.show();
  }
}

function drawCakeTableScene() {
  image(img, 0, 0, width, height);
  cakes.forEach((cake) => {
    if (cake.bites >= cake.bitesNeeded) return;
    const sizeFactor = 1 - cake.bites * 0.14;
    const currentW = cake.w * sizeFactor;
    const currentH = cake.h * sizeFactor;
    image(
      cake.image,
      cake.x + (cake.w - currentW) / 2,
      cake.y + cake.h - currentH,
      currentW,
      currentH
    );
  });
}

function welcome() {
  image(img1, 0, 0, width, height);
  fill(255, 235, 241);
  textAlign(LEFT, CENTER);
  textSize(32);
  text("Welcome! You have been invited to the Queen's Ball!", 50, 100);
  textSize(20);
  text("Choose carefully… not every sweet treat is safe.", 50, 150);
}

function cakeTable() {
  image(img, 0, 0, width, height);
  backButton.position(24, 24);
  backButton.show();
  let hoveredCake = -1;

  cakes.forEach((cake, index) => {
    if (cake.bites >= cake.bitesNeeded) return;

    const sizeFactor = 1 - cake.bites * 0.14;
    const currentW = cake.w * sizeFactor;
    const currentH = cake.h * sizeFactor;
    const drawX = cake.x + (cake.w - currentW) / 2;
    const drawY = cake.y + cake.h - currentH;

    const hovered =
      mouseX >= cake.x &&
      mouseX <= cake.x + cake.w &&
      mouseY >= cake.y &&
      mouseY <= cake.y + cake.h;

    if (hovered) hoveredCake = index;

    const glowColor = hovered
      ? poisonedCakeIndices.has(index)
        ? "rgba(145, 5, 26, 0.95)"
        : "rgba(255, 149, 230, 0.95)"
      : "rgba(4, 4, 4, 0.99)";
    drawGlowingCake(cake.image, drawX, drawY, currentW, currentH, glowColor);
  });

  if (hoveredCake !== -1) {
    drawCakeComment(cakeComments[hoveredCake % cakeComments.length]);
    const cake = cakes[hoveredCake];
    if (cake.bites > 0) {
      drawBiteProgress(cake);
    }
  }

  if (visionImpaired) {
    drawImpairedVision();
  }

  if (knockedOut) {
    drawKnockedOutMessage();
    restartButton.position((width - 180) / 2, height - 100);
    restartButton.show();
  } else {
    restartButton.hide();
  }

  drawHealthBar();
}

function choosePoisonedCakes() {
  poisonedCakeIndices.clear();
  const poisonedCakeCount = floor(random(3, 6));
  while (poisonedCakeIndices.size < poisonedCakeCount) {
    poisonedCakeIndices.add(floor(random(cakes.length)));
  }
}

function drawCakeComment(comment) {
  const boxWidth = min(width - 40, 640);
  const boxX = (width - boxWidth) / 2;
  const boxY = 24;

  noStroke();
  fill(35, 12, 25, 210);
  rect(boxX, boxY, boxWidth, 58, 12);
  fill(255, 238, 245);
  textAlign(CENTER, CENTER);
  textSize(22);
  text(comment, width / 2, boxY + 29);
}

function drawBiteProgress(cake) {
  noStroke();
  fill(35, 12, 25, 210);
  rect(width / 2 - 115, 88, 230, 36, 10);
  fill(255, 238, 245);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(`Bites: ${cake.bites} / ${cake.bitesNeeded}`, width / 2, 106);
}

function drawImpairedVision() {
  // Each poisoned bite deepens the vignette and makes the room harder to see.
  const impairment = min(poisonBitesTaken, 6);
  const overlayAlpha = map(impairment, 1, 6, 45, 175);
  noStroke();
  fill(12, 0, 10, overlayAlpha);
  rect(0, 0, width, height);

  drawingContext.save();
  const gradient = drawingContext.createRadialGradient(
    width / 2, 
    height / 2,
    min(width, height) * 0.08,
    width / 2,
    height / 2,
    max(width, height) * 0.62
  );
  gradient.addColorStop(0, `rgba(10, 0, 12, ${map(impairment, 1, 6, 0.02, 0.28)})`);
  gradient.addColorStop(1, `rgba(10, 0, 12, ${map(impairment, 1, 6, 0.25, 0.95)})`);
  drawingContext.fillStyle = gradient;
  drawingContext.fillRect(0, 0, width, height);
  drawingContext.restore();

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  if (!knockedOut) {
    text("Your vision swims… but you can still reach for another cake!", width / 2, height - 45);
  }
}

function drawHealthBar() {
  const barWidth = 210;
  const barHeight = 22;
  const x = width - barWidth - 28;
  const y = 30;

  noStroke();
  fill(45, 20, 35, 220);
  rect(x - 12, y - 23, barWidth + 24, 66, 10);
  fill(255, 238, 245);
  textAlign(LEFT, CENTER);
  textSize(15);
  text("HEALTH", x, y - 10);
  fill(105, 65, 80);
  rect(x, y + 4, barWidth, barHeight, 8);
  fill(health > 30 ? "#D41445" : "#7A102B");
  rect(x, y + 4, barWidth * (health / 100), barHeight, 8);
  fill(255, 238, 245);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(`${health}%`, x + barWidth / 2, y + 15);
}

function drawKnockedOutMessage() {
  noStroke();
  fill(25, 5, 15, 210);
  rect(0, 0, width, height);
  fill(255, 238, 245);
  textAlign(CENTER, CENTER);
  textSize(38);
  text("You've been knocked out!", width / 2, height / 2 - 35);
  textSize(20);
  text("The Queen's cakes were too dangerous.", width / 2, height / 2 + 12);
}

function mousePressed() {
  if (!gameStarted || knockedOut || transitionActive) return;

  const clickedCakeIndex = cakes.findIndex(
    (cake) =>
      mouseX >= cake.x &&
      mouseX <= cake.x + cake.w &&
      mouseY >= cake.y &&
      mouseY <= cake.y + cake.h
  );

  if (clickedCakeIndex === -1) return;

  const cake = cakes[clickedCakeIndex];
  if (cake.bites >= cake.bitesNeeded) return;

  cake.bites++;

  if (poisonedCakeIndices.has(clickedCakeIndex)) {
    poisonBitesTaken++;
    health = max(0, health - 20);
    visionImpaired = true;
    if (health === 0) knockedOut = true;
  }

  // Poison takes effect only when the cake has been completely eaten.
  if (cake.bites < cake.bitesNeeded) return;
  if (!poisonedCakeIndices.has(clickedCakeIndex)) return;

  poisonedCakesEaten++;
  if (poisonedCakesEaten >= 3) knockedOut = true;
}

function drawGlowingCake(cake, x, y, w, h, glowColor) {
  drawingContext.save();
  drawingContext.shadowColor = glowColor;
  drawingContext.shadowBlur = 34;
  image(cake, x, y, w, h);
  drawingContext.restore();
}
