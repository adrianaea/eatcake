let img;
let castleimg;
let musicimg;
let medicineRoomImage;
let cakes = [];
let medicineItems = [];
let poisonedCakeIndices = new Set();
let currentRoom = "welcome";
let gameWon = false;
let knockedOut = false;
let invitationOpened = false;
let visionImpaired = false;
let poisonBitesTaken = 0;
let poisonedCakesEaten = 0;
let health = 100;
let startButton;
let enterTableButton;
let medicineButton;
let restartButton;
let backButton;
let transitionActive = false;
let resetGameOnWelcome = false;
let transitionStartedAt = 0;
let transitionFromRoom = "welcome";
let transitionToRoom = "venue";
let transitionDirection = 1;
const transitionDuration = 850;
const cakeLayoutReferenceWidth = 1366;
const cakeLayoutReferenceHeight = 768;

// --- Music & sound effects ---
let enteranceMusic;
let venueMusic;
let cakeMusic;
let eatingSound;

// cake comments for when inspecting cakes
const cakeComments = [
  "These cakes are deathly delicious.",
  "That cake will take you to heaven.",
  "A royal treat… with a suspicious aftertaste.",
  "One bite, and the ball will be unforgettable.",
  "The frosting is almost too good to be true.",
  "A little slice of paradise—or peril.",
  "The Queen's baker has outdone themself.",
];

// ========================================
// SETUP & INITIALIZATION
// ========================================
async function setup() {
  document.body.style.margin = "0";
  document.body.style.backgroundColor = "rgb(72, 32, 54)";
  document.documentElement.style.backgroundColor = "rgb(72, 32, 54)";

  createCanvas(windowWidth, windowHeight);
  img = await loadImage("assets/caketable.jpg");
  castleimg = await loadImage("assets/castle1.jpg");
  musicimg = await loadImage("assets/music.jpg");
  medicineRoomImage = await loadImage("assets/room.jpg");

  
  enteranceMusic = new Audio("assets/enterance.mp3");
  venueMusic = new Audio("assets/music.m4a");
  cakeMusic = new Audio("assets/music+food.m4a");
  eatingSound = new Audio("assets/eating.wav");

  const cakeImages = [];
  for (let cakeNumber = 1; cakeNumber <= 14; cakeNumber++) {
    cakeImages.push(await loadImage(`assets/cake${cakeNumber}.png`));
  }

  // --- Initialize cakes ---
  cakes = [
    { image: cakeImages[0], x: 90, y: 414, w: 82, h: 68 },
    { image: cakeImages[1], x: 250, y: 360, w: 88, h: 68 },
    { image: cakeImages[2], x: 400, y: 362, w: 82, h: 68 },
    { image: cakeImages[3], x: 523, y: 345, w: 82, h: 68 },
    { image: cakeImages[4], x: 740, y: 340, w: 82, h: 68 },
    { image: cakeImages[5], x: 900, y: 370, w: 82, h: 68 },
    { image: cakeImages[6], x: 1080, y: 375, w: 82, h: 68 },
    { image: cakeImages[7], x: 1190, y: 430, w: 82, h: 68 },
    { image: cakeImages[8], x: 180, y: 454, w: 88, h: 72 },
    { image: cakeImages[9], x: 310, y: 454, w: 88, h: 72 },
    { image: cakeImages[10], x: 465, y: 454, w: 88, h: 72 },
    { image: cakeImages[11], x: 635, y: 454, w: 88, h: 72 },
    { image: cakeImages[12], x: 805, y: 454, w: 88, h: 72 },
    { image: cakeImages[13], x: 975, y: 456, w: 90, h: 72 },
  ];
  cakes.forEach((cake) => {
    cake.layoutX = cake.x;
    cake.layoutY = cake.y;
    cake.layoutW = cake.w;
    cake.layoutH = cake.h;
  });
  updateCakeLayout();
  cakes.forEach((cake) => {
    cake.bites = 0;
    cake.bitesNeeded = floor(random(3, 6));
  });

  choosePoisonedCakes();

  startButton = createButton("Accept Invite");
  startButton.size(200, 40);
  startButton.style("font-size", "24px");
  styleRoomButton(startButton);
  startButton.mousePressed(() => {
    transitionTo("venue");
  });
  startButton.hide();

  enterTableButton = createButton("Explore the Cake Table →");
  enterTableButton.size(300, 58);
  styleRoomButton(enterTableButton);
  enterTableButton.mousePressed(() => transitionTo("cake"));
  enterTableButton.hide();

  medicineButton = createButton("Find medicine →");
  styleRoomButton(medicineButton);
  medicineButton.mousePressed(() => transitionTo("medicine"));
  medicineButton.hide();

  backButton = createButton("← Back to Welcome");
  styleRoomButton(backButton);
  backButton.mousePressed(() => {
    if (currentRoom === "cake") transitionTo("venue");
    else if (currentRoom === "medicine") transitionTo("cake");
    else if (currentRoom === "venue") transitionTo("welcome");
  });
  backButton.hide();

  restartButton = createButton("Try Again");
  restartButton.size(180, 52);
  restartButton.style("font-size", "20px");
  restartButton.style("background-color", "#e69898");
  restartButton.style("border", "3px solid #8d0e00");
  restartButton.style("border-radius", "10px");
  restartButton.style("cursor", "pointer");
  restartButton.style("font-weight", "bold");
  restartButton.mousePressed(() => {
    visionImpaired = false;
    resetGameOnWelcome = true;
    transitionTo("welcome");
  });
  restartButton.hide();
}

// ========================================
// UI & INVITATION HELP
// ========================================
function styleRoomButton(button) {
  button.style("font-size", "22px");
  button.style("background-color", "#c49d5e");
  button.style("border", "3px solid #603f14");
  button.style("border-radius", "10px");
  button.style("cursor", "pointer");
  button.style("font-weight", "bold");
}

// --- Invitation bounds ---
function getInvitationBounds() {
  const cardWidth = min(width - 40, 520);
  const cardHeight = 300;
  return {
    x: (width - cardWidth) / 2,
    y: (height - cardHeight) / 2,
    w: cardWidth,
    h: cardHeight,
  };
}

// --- Open invitation ---
function openInvitation() {
  if (invitationOpened || currentRoom !== "welcome") return;
  invitationOpened = true;
  cursor(ARROW);

  // Start audio directly in this click handler so the browser accepts playback.
  positionAcceptButton();
  startButton.show();
  startRoomMusic(enteranceMusic);
}

// --- Position accept button ---
function positionAcceptButton() {
  const card = getInvitationBounds();
  startButton.position((width - 200) / 2, card.y + card.h - 66);
}

// ========================================
// ROOM NAVIGATION & AUDIO
// ========================================
function transitionTo(room) {
  if (transitionActive || room === currentRoom) return;

  transitionFromRoom = currentRoom;
  transitionToRoom = room;
  const roomOrder = { welcome: 0, venue: 1, cake: 2, medicine: 3 };
  transitionDirection = roomOrder[room] > roomOrder[currentRoom] ? 1 : -1;
  startButton.hide();
  enterTableButton.hide();
  medicineButton.hide();
  backButton.hide();
  restartButton.hide();

  if (room === "welcome") {
    startRoomMusic(enteranceMusic);
    invitationOpened = false;
  } else if (room === "venue") {
    startRoomMusic(venueMusic);
  } else if (room === "cake" && transitionFromRoom !== "medicine") {
    startRoomMusic(cakeMusic);
  } else if (room === "medicine" && medicineItems.length === 0) {
    spawnMedicines();
  }

  transitionActive = true;
  transitionStartedAt = millis();
}

// --- Start room music ---
function startRoomMusic(track) {
  try {
    [enteranceMusic, venueMusic, cakeMusic].forEach((music) => {
      if (music && music !== track && !music.paused) {
        music.pause();
        music.currentTime = 0;
      }
    });

    if (track) {
      track.loop = track !== enteranceMusic;
      track.volume = 1;
      if (track.paused) {
        const playback = track.play();
        if (playback && typeof playback.catch === "function") {
          playback.catch((error) => console.warn("Background music could not play:", error));
        }
      }
    }
  } catch (error) {
    console.warn("Audio could not start:", error);
  }
}

// ========================================
// RESIZING & RESPONSIVE LAYOUT
// ========================================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateCakeLayout();
  if (invitationOpened && currentRoom === "welcome") positionAcceptButton();
  medicineItems.forEach((medicine) => {
    medicine.x = medicine.xRatio * width;
    medicine.y = medicine.yRatio * height;
  });
}

// --- Cake layout ---
function updateCakeLayout() {
  const scaleX = width / cakeLayoutReferenceWidth;
  const scaleY = height / cakeLayoutReferenceHeight;

  cakes.forEach((cake) => {
    cake.x = cake.layoutX * scaleX;
    cake.y = cake.layoutY * scaleY;
    cake.w = cake.layoutW * scaleX;
    cake.h = cake.layoutH * scaleY;
  });
}

// ========================================
// DRAW LOOP & TRANSITIONS
// ========================================
function draw() {
  if (transitionActive) {
    drawRoomTransition();
  } else if (currentRoom === "cake") {
    cakeTable();
  } else if (currentRoom === "welcome") {
    welcome();
  } else if (currentRoom === "medicine") {
    medicineRoom();
  } else {
    venue();
  }

  if (visionImpaired) {
    drawImpairedVision();
  }

  if (currentRoom === "medicine" && !transitionActive) {
    drawHealthBar();
  }
}

// --- Room transition ---
function drawRoomTransition() {
  const elapsed = millis() - transitionStartedAt;
  const progress = constrain(elapsed / transitionDuration, 0, 1);
  const easedProgress = progress * progress * (3 - 2 * progress);

  // Move forward to the right, and reverse the slide when going back a room.
  push();
  translate(-transitionDirection * easedProgress * width, 0);
  drawRoom(transitionFromRoom);
  pop();

  push();
  translate(transitionDirection * (1 - easedProgress) * width, 0);
  drawRoom(transitionToRoom);
  pop();

  if (progress >= 1) {
    transitionActive = false;
    currentRoom = transitionToRoom;
    if (currentRoom === "welcome" && resetGameOnWelcome) {
      resetGameState();
      resetGameOnWelcome = false;
    }
    updateRoomButtons();
  }
}

// ========================================
// ROOM RENDERING
// ========================================
function drawRoom(room) {
  if (room === "welcome") welcome();
  else if (room === "venue") venue();
  else if (room === "medicine") medicineRoom();
  else drawCakeTableScene();
}

// --- Music room ---
function venue() {
  image(musicimg, 0, 0, width, height);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255, 238, 245);
  
  const textBoxWidth = width - 140;
  const textBoxX = (width - textBoxWidth) / 2;
  drawingContext.save();
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.9)";
  drawingContext.shadowBlur = 8;
  drawingContext.shadowOffsetX = 1;
  drawingContext.shadowOffsetY = 1;
  
  text("Welcome in! As you're enjoying the ambiance, you can't help but notice how the upper class live their lives. A servant notices your pondering face, and warns you to be careful with the food here. There's a plot for revenge brewing.", textBoxX, 140, textBoxWidth, 100);
  drawingContext.restore();
}

// --- Medicine room ---
function medicineRoom() {
  image(medicineRoomImage, 0, 0, width, height);

  noStroke();
  fill(35, 12, 25, 205);
  
  const headerWidth = 360;
  const headerX = (width - headerWidth) / 2;
  
  rect(headerX, 70, headerWidth, 60, 12);
  fill(255, 238, 245);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Find the medicine!", width / 2, 100);

  medicineItems.forEach((medicine) => {
    if (medicine.found) return;
    drawingContext.save();
    drawingContext.shadowColor = "rgba(255, 245, 140, 0.95)";
    drawingContext.shadowBlur = 20;
    textAlign(CENTER, CENTER);
    textSize(48);
    fill(255, 255, 255, 80);
    text("💉", medicine.x, medicine.y);
    drawingContext.restore();
  });

  if (medicineItems.length > 0 && medicineItems.every((medicine) => medicine.found)) {
    fill(255, 238, 245);
    textSize(22);
    text("You found the medicine! Your strength is returning.", width / 2, height - 48);
  }
}

// --- Spawn medicines ---
function spawnMedicines() {
  medicineItems = [];
  for (let i = 0; i < 3; i++) {
    const xRatio = random(0.1, 0.9);
    const yRatio = random(0.5, 0.84);
    medicineItems.push({
      x: xRatio * width,
      y: yRatio * height,
      xRatio,
      yRatio,
      found: false,
    });
  }
}

// --- Update room buttons ---
function updateRoomButtons() {
  startButton.hide();
  enterTableButton.hide();
  medicineButton.hide();
  backButton.hide();

  if (currentRoom === "welcome") {
    if (invitationOpened) {
      positionAcceptButton();
      startButton.show();
    }
  } else if (currentRoom === "venue") {
    backButton.html("← Back to Welcome");
    backButton.position(24, 24);
    backButton.show();
    enterTableButton.position(CENTER, height - 120);
    enterTableButton.show();
  } else if (currentRoom === "cake") {
    backButton.html("← Back to Music Room");
    backButton.position(24, 24);
    backButton.show();
  } else {
    backButton.html("← Back to Cake Table");
    backButton.position(24, 24);
    backButton.show();
  }
}

// --- Cake table room ---
function drawCakeTableScene() {
  image(img, 0, 0, windowWidth, windowHeight);

  cakes.forEach((cake) => {
    if (cake.bites >= cake.bitesNeeded) return;
    const bounds = getCakeDrawBounds(cake);
    image(cake.image, bounds.x, bounds.y, bounds.w, bounds.h);
  });
}

function getCakeDrawBounds(cake) {
  const sizeFactor = 1 - cake.bites * 0.14;
  const w = cake.w * sizeFactor;
  const h = cake.h * sizeFactor;
  return {
    x: cake.x + (cake.w - w) / 2,
    y: cake.y + cake.h - h,
    w,
    h,
  };
}

// --- Welcome room ---
function welcome() {
  image(castleimg, 0, 0, width, height);
  drawingContext.save();
  drawingContext.restore();
  drawInvitationPopup();
}

// --- Invitation popup ---
function drawInvitationPopup() {
  const card = getInvitationBounds();

  noStroke();
  fill(20, 8, 18, 125);
  rect(0, 0, width, height);


  fill(255, 255, 241);
  textAlign(LEFT, CENTER);
  textSize(32);
  text("What's This? You have been invited to the Queen's Ball!", 50, 100, width - 100);
  textSize(20);
  text("You're famished and curious about what kind of treats there could be.", 50, 180, width - 100);


  drawingContext.save();
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.65)";
  drawingContext.shadowBlur = 24;
  fill(246, 228, 190);
  rect(card.x, card.y, card.w, card.h, 18);
  drawingContext.restore();

  noFill();
  stroke(161, 112, 49);
  strokeWeight(3);
  rect(card.x + 12, card.y + 12, card.w - 24, card.h - 24, 12);
  noStroke();
  textAlign(CENTER, CENTER);

  if (!invitationOpened) {
    fill(83, 43, 48);
    textSize(30);
    text("A Royal Invitation", width / 2, card.y + 64);
    textSize(19);
    text("Sealed with the Queen's crest", width / 2, card.y + 105);
    textSize(58);
    text("✉", width / 2, card.y + 180);
    fill(130, 73, 51);
    textSize(16);
    text("Click below to open and read your invitation", width / 2, card.y + 215);

    if (
      mouseX >= card.x &&
      mouseX <= card.x + card.w &&
      mouseY >= card.y &&
      mouseY <= card.y + card.h
    ) {
      cursor(HAND);
    } else {
      cursor(ARROW);
    }
    return;
  }

  fill(83, 43, 48);
  textSize(27);
  text("HER MAJESTY THE QUEEN", width / 2, card.y + 52);
  fill(69, 37, 43);
  textSize(22);
  text("requests the pleasure", width / 2, card.y + 110);
  text("of your company at the Royal Ball", width / 2, card.y + 130);
  textSize(16);
  text("An evening of music and heavenly sweetness awaits.", width / 2, card.y + 188);
  fill(130, 73, 51);
}

// ========================================
// CAKE TABLE & GAME STATE DISPLAY
// ========================================
function cakeTable() {
  image(img, 0, 0, windowWidth, windowHeight);
  backButton.position(24, 24);
  backButton.show();
  if (
    (poisonBitesTaken > 0 || health < 100) &&
    (medicineItems.length === 0 || medicineItems.some((medicine) => !medicine.found))
  ) {
    medicineButton.position(24, 76);
    medicineButton.show();
  } else {
    medicineButton.hide();
  }
  let hoveredCake = -1;

  cakes.forEach((cake, index) => {
    if (cake.bites >= cake.bitesNeeded) return;

    const bounds = getCakeDrawBounds(cake);

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
    drawGlowingCake(cake.image, bounds.x, bounds.y, bounds.w, bounds.h, glowColor);
  });

  if (hoveredCake !== -1) {
    drawCakeComment(cakeComments[hoveredCake % cakeComments.length]);
    const cake = cakes[hoveredCake];
    if (cake.bites > 0) {
      drawBiteProgress(cake);
    }
  }

  if (knockedOut) {
    drawKnockedOutMessage();
    restartButton.position((width - 180) / 2, height - 300);
    restartButton.html("Try Again");
    restartButton.show();
  } else if (gameWon) {
    drawVictoryPopup();
    restartButton.position((width - 180) / 2, height - 300);
    restartButton.html("Play Again");
    restartButton.show();
  } else {
    restartButton.hide();
  }

  drawHealthBar();
  if (!knockedOut && !gameWon) {
    fill(0, 0, 205);
    textAlign(LEFT, TOP);
    textSize(22);

    drawingContext.save();
    drawingContext.shadowColor = "rgba(0, 0, 0, 0.9)";
    drawingContext.shadowBlur = 8;
    drawingContext.shadowOffsetX = 1;
    drawingContext.shadowOffsetY = 1;

    const textBoxWidth = width - 140;
    const textBoxX = (width - textBoxWidth) / 2;
    text(
      "Eat the unpoisoned cakes before the upper class does—it's your only chance to ensure the lower class gets their revenge. The poisoned ones will be their only option.",
      textBoxX,
      height - 140,
      textBoxWidth,
      100,
    );
    drawingContext.restore();
  }
}

// --- Poisoned cakes ---
function choosePoisonedCakes() {
  poisonedCakeIndices.clear();
  const poisonedCakeCount = floor(random(3, 6));
  while (poisonedCakeIndices.size < poisonedCakeCount) {
    poisonedCakeIndices.add(floor(random(cakes.length)));
  }
}

// --- Reset game state ---
function resetGameState() {
  visionImpaired = false;
  poisonBitesTaken = 0;
  poisonedCakesEaten = 0;
  health = 100;
  knockedOut = false;
  gameWon = false;
  medicineItems = [];
  cakes.forEach((cake) => {
    cake.bites = 0;
    cake.bitesNeeded = floor(random(3, 6));
  });
  choosePoisonedCakes();
}

// --- Cake comments ---
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

// --- Bite progress ---
function drawBiteProgress(cake) {
  noStroke();
  fill(35, 12, 25, 210);
  rect(width / 2 - 115, 88, 230, 36, 10);
  fill(255, 238, 245);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(`Bites: ${cake.bites} / ${cake.bitesNeeded}`, width / 2, 106);
}

// --- Impaired vision ---
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
    max(width, height) * 0.62,
  );
  gradient.addColorStop(
    0,
    `rgba(10, 0, 12, ${map(impairment, 1, 6, 0.02, 0.28)})`,
  );
  gradient.addColorStop(
    1,
    `rgba(10, 0, 12, ${map(impairment, 1, 6, 0.25, 0.95)})`,
  );
  drawingContext.fillStyle = gradient;
  drawingContext.fillRect(0, 0, width, height);
  drawingContext.restore();

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(24);
  if (!knockedOut) {
    text(
      "The poison clouds your vision…",
      width / 2,
      height - 45,
    );
  }
}

// --- Health bar ---
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

// --- Knocked out message ---
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

// --- Victory popup ---
function drawVictoryPopup() {
  noStroke();
  fill(24, 8, 20, 205);
  rect(0, 0, width, height);

  drawingContext.save();
  drawingContext.shadowColor = "rgba(255, 220, 135, 0.9)";
  drawingContext.shadowBlur = 24;
  fill(255, 228, 170);
  textAlign(CENTER, CENTER);
  textSize(44);
  text("Victory!", width / 2, height / 2 - 62);
  drawingContext.restore();

  fill(255, 242, 229);
  textSize(21);
  text("You finished every unpoisoned cake and left the poisoned ones behind.", width / 2, height / 2 - 8);
  textSize(19);
  text("The upper class takes the bait—the lower class gets their revenge!", width / 2, height / 2 + 30);
}

// ========================================
// INPUT HANDLING
// ========================================
function mousePressed() {
  if (transitionActive) return;

  if (currentRoom === "welcome" && !invitationOpened) {
    const card = getInvitationBounds();
    if (
      mouseX >= card.x &&
      mouseX <= card.x + card.w &&
      mouseY >= card.y &&
      mouseY <= card.y + card.h
    ) {
      openInvitation();
    }
    return;
  }

  if (currentRoom === "medicine") {
    const clickedMedicine = medicineItems.find(
      (medicine) => !medicine.found && dist(mouseX, mouseY, medicine.x, medicine.y) < 38,
    );

    if (!clickedMedicine) return;

    clickedMedicine.found = true;
    health = min(100, health + 35);
    poisonBitesTaken = max(0, poisonBitesTaken - 2);
    visionImpaired = poisonBitesTaken > 0;
    if (health > 0) knockedOut = false;
    return;
  }

  if (currentRoom !== "cake" || knockedOut || gameWon) return;

  const clickedCakeIndex = cakes.findIndex(
    (cake) =>
      mouseX >= cake.x &&
      mouseX <= cake.x + cake.w &&
      mouseY >= cake.y &&
      mouseY <= cake.y + cake.h,
  );

  if (clickedCakeIndex === -1) return;

  const cake = cakes[clickedCakeIndex];
  if (cake.bites >= cake.bitesNeeded) return;

  eatingSound.play();
  cake.bites++;

  if (poisonedCakeIndices.has(clickedCakeIndex)) {
    poisonBitesTaken++;
    health = max(0, health - 20);
    visionImpaired = true;
    if (health === 0) knockedOut = true;
  }

  // Eating a full poisoned cake counts toward the knockout condition.
  if (cake.bites >= cake.bitesNeeded && poisonedCakeIndices.has(clickedCakeIndex)) {
    poisonedCakesEaten++;
    if (poisonedCakesEaten >= 3) knockedOut = true;
  }

  const allSafeCakesConsumed = cakes.every(
    (item, index) => poisonedCakeIndices.has(index) || item.bites >= item.bitesNeeded,
  );
  if (!knockedOut && allSafeCakesConsumed) gameWon = true;
}

// ========================================
// DRAWING HELP
// ========================================
function drawGlowingCake(cake, x, y, w, h, glowColor) {
  drawingContext.save();
  drawingContext.shadowColor = glowColor;
  drawingContext.shadowBlur = 34;
  image(cake, x, y, w, h);
  drawingContext.restore();
}