let img;
let cake1;
let cake2;
let cake3;
let cake4;
let cake5; 
let cake6;
let cake7;
let cake8;
let cake9;
let cake10;
let cake11;
let cake12;
let cake13;
let cake14; 
let cakes = [];
let poisonedCakeIndices = new Set();

async function setup() {
    createCanvas(1500, 1200);
    img = await loadImage('assets/caketable.jpg'); 
    cake1 = await loadImage('assets/cake1.png'); 
    cake2 = await loadImage('assets/cake2.png'); 
    cake3 = await loadImage('assets/cake3.png'); 
    cake4 = await loadImage('assets/cake4.png'); 
    cake5 = await loadImage('assets/cake5.png'); 
    cake6 = await loadImage('assets/cake6.png'); 
    cake7 = await loadImage('assets/cake7.png'); 
    cake8 = await loadImage('assets/cake8.png'); 
    cake9 = await loadImage('assets/cake9.png'); 
    cake10 = await loadImage('assets/cake10.png'); 
    cake11 = await loadImage('assets/cake11.png'); 
    cake12 = await loadImage('assets/cake12.png'); 
    cake13 = await loadImage('assets/cake13.png'); 
    cake14 = await loadImage('assets/cake14.png'); 

    cakes = [
        { image: cake1, x: 165, y: 660, w: 100, h: 120 },
        { image: cake2, x: 1120, y: 685, w: 120, h: 120 },
        { image: cake3, x: 700, y: 700, w: 120, h: 100 },
        { image: cake4, x: 900, y: 550, w: 120, h: 100 },
        { image: cake5, x: 500, y: 600, w: 120, h: 100 },
        { image: cake6, x: 800, y: 650, w: 120, h: 100 },
        { image: cake7, x: 600, y: 500, w: 120, h: 100 },
        { image: cake8, x: 400, y: 550, w: 120, h: 100 },
        { image: cake9, x: 1000, y: 600, w: 120, h: 100 },
        { image: cake10, x: 1100, y: 500, w: 120, h: 100 },
        { image: cake11, x: 1200, y: 600, w: 120, h: 100 },
        { image: cake12, x: 260, y: 650, w: 120, h: 100 },
        { image: cake13, x: 380, y: 660, w: 120, h: 100 },
        { image: cake14, x: 500, y: 700, w: 120, h: 100 },
    ];
    const poisonedCakeCount = floor(random(3, 6));
    while (poisonedCakeIndices.size < poisonedCakeCount) {
        poisonedCakeIndices.add(floor(random(cakes.length)));
    }
}

function draw() {
    background(220);
    image(img, 0, 0, width, height);
    cakes.forEach((cake, index) => {
        const hovered = mouseX >= cake.x && mouseX <= cake.x + cake.w
            && mouseY >= cake.y && mouseY <= cake.y + cake.h;
        const glowColor = hovered
            ? (poisonedCakeIndices.has(index) ? 'rgba(4, 255, 0, 0.95)' : 'rgba(255, 149, 230, 0.95)')
            : 'rgba(4, 4, 4, 0.99)';
        drawGlowingCake(cake.image, cake.x, cake.y, cake.w, cake.h, glowColor);
    });

}

function drawGlowingCake(cake, x, y, w, h, glowColor) {
    drawingContext.save();
    drawingContext.shadowColor = glowColor;
    drawingContext.shadowBlur = 24;
    image(cake, x, y, w, h);
    drawingContext.restore();
}
