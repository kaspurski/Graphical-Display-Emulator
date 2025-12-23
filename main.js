// { r: 255, g: 0, b: 0 }

const bitmapX = 750;
const bitmapY = 625;
// 750 x 625

let lock = false;

class gde {
  constructor() {
    this.width = bitmapX;
    this.height = bitmapY;

    this.bitmap = [];
    for (let i = 0; i < this.width * this.height; i++) {
      this.bitmap[i] = new Color(0, 0, 0);
    }

    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
  }

  putPixel(x, y, color) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    let index = Math.round(y) * this.width + Math.round(x);
    this.bitmap[index] = color;

    //console.log(`X: ${x}, Y: ${y}`);
  }

  render() {
    //console.log(Math.round(Math.random() * 10));

    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    let canvasWidth = this.ctx.canvas.width;
    let canvasHeight = this.ctx.canvas.height;

    let zoomX = canvasWidth / this.width;
    let zoomY = canvasHeight / this.height;

    let zoom = Math.floor(Math.min(zoomX, zoomY));

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let index = y * this.width + x;
        let bitmapColor = this.bitmap[index];

        this.ctx.fillStyle = `rgb(${bitmapColor.r}, ${bitmapColor.g}, ${bitmapColor.b})`;
        this.ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
      }
    }
  }

  line(x1, y1, x2, y2, color) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    // y = kx + m
    let dx = x2 - x1;
    let dy = y2 - y1;

    let k = dy / dx;
    let m = y1 - k * x1;

    function getY(x) {
      if (y1 === y2) {
        return y1;
      }

      return k * x + m;
    }

    function getX(y) {
      if (x1 === x2) {
        return x1;
      }

      return (y - m) / k;
    }

    if (x1 !== x2) {
      for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++) {
        let x = i;
        let y = getY(x);

        this.putPixel(x, y, color);
      }
    }

    if (y1 !== y2) {
      for (let i = Math.min(y1, y2); i <= Math.max(y1, y2); i++) {
        let y = i;
        let x = getX(y);

        this.putPixel(x, y, color);
      }
    }
  }

  rectangle(x1, y1, x2, y2, rotate, type, color) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    const originX = (x1 + x2) / 2;
    const originY = (y1 + y2) / 2;

    function rotatePoint(x, y) {
      const localX = x - originX;
      const localY = y - originY;

      const radius = Math.sqrt((localX**2) + (localY**2));
      const startRot = Math.atan2(localX, localY);
      const endRot = startRot + rotate * (Math.PI / 180);

      const outX = Math.cos(endRot) * radius + originX;
      const outY = Math.sin(endRot) * radius + originY; 

      return [outX, outY];
    }

    let startX = Math.min(x1, x2);
    let endX = Math.max(x1, x2);

    let startY = Math.min(y1, y2);
    let endY = Math.max(y1, y2);

    const cornerTL = rotatePoint(startX, startY);
    const cornerBL = rotatePoint(startX, endY);
    const cornerTR = rotatePoint(endX, startY);
    const cornerBR = rotatePoint(endX, endY);

    if (type === "solid") {
      for(let i = startY; i <= endY; i++) {
        let y = i;
        let left = rotatePoint(startX, y);
        let right = rotatePoint(endX, y);

        this.line(...left, ...right, color);
      }

      for(let j = startX; j <= endX; j++) {
        let x = j;
        let left = rotatePoint(x, startY) ;
        let right = rotatePoint(x, endY);

        this.line(...left, ...right, color);
      }
    }
    
    else if (type === "outline") {
      this.line(...cornerTL, ...cornerBL, color);
      this.line(...cornerTL, ...cornerTR, color);
      this.line(...cornerTR, ...cornerBR, color);
      this.line(...cornerBL, ...cornerBR, color);
    }
  }

  circle(cx, cy, cr, color) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    if (cr + cx > bitmapX || cx - cr < 0 || cy + cr > bitmapY || cy - cr < 0) {
      console.log("Error - circle is overflowing");
      return;
    }

    let x = cr;
    let a = 0;

    let rounding = 1 - cr;

    while (x >= a) {
      this.putPixel(cx + x, cy + a, color);
      this.putPixel(cx + a, cy + x, color);
      this.putPixel(cx - x, cy + a, color);
      this.putPixel(cx - a, cy + x, color);

      // Mirror

      this.putPixel(cx - x, cy - a, color);
      this.putPixel(cx - a, cy - x, color);
      this.putPixel(cx + x, cy - a, color);
      this.putPixel(cx + a, cy - x, color);

      a++;

      if (rounding <= 0) {
        rounding += 2 * a + 1;
      } else {
        x--;
        rounding += 2 * (a - x) + 1;
      }
    }
  }

  triangle(x1, y1, x2, y2, x3, y3, color) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    this.line(x1, y1, x2, y2, color);
    this.line(x2, y2, x3, y3, color);
    this.line(x3, y3, x1, y1, color);
  }

  resize(x, y) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    this.width = x;
    this.height = y;

    this.bitmap = [];
    for (let i = 0; i < this.width * this.height; i++) {
      this.bitmap[i] = { r: 0, g: 0, b: 0 };
    }
  }

  clear(color) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    this.bitmap.forEach((pixel, i) => {
      this.bitmap[i] = { r: color.r, g: color.g, b: color.b };
    });
  }

  scroll(dir) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    // Up
    if (dir === 1) {
      for (let i = 0; i < this.width; i++) {
        this.bitmap.push(new Color(0, 0, 0));
      }

      this.bitmap.splice(0, this.width);
    }

    // Down
    if (dir === 2) {
      for (let i = 0; i < this.width; i++) {
        this.bitmap.unshift(new Color(0, 0, 0));
      }

      this.bitmap.length = this.bitmap.length - this.width;
    }

    // Left
    if (dir === 4) {
      this.bitmap.shift();
      this.bitmap.push(new Color(0, 0, 0));

      for (let i = 0; i < this.bitmap.length; i++) {
        if ((i + 1) % this.width === 0) {
          this.bitmap[i] = new Color(0, 0, 0);
        }
      }
    }

    // Up + Left
    if (dir === 5) {
      this.scroll(1);
      this.scroll(4);
    }

    // Down + Left
    if (dir === 6) {
      this.scroll(2);
      this.scroll(4);
    }

    // Right
    if (dir === 8) {
      this.bitmap.pop();
      this.bitmap.unshift(new Color(0, 0, 0));

      for (let i = 0; i < this.bitmap.length; i++) {
        if (i % this.width === 0) {
          this.bitmap[i] = new Color(0, 0, 0);
        }
      }
    }

    // Up + Right
    if (dir === 9) {
      this.scroll(1);
      this.scroll(8);
    }

    // Down + Right
    if (dir === 10) {
      this.scroll(2);
      this.scroll(8);
    }
  }

  pScroll(dir) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    // Up
    if (dir === 1) {
      const topRow = this.bitmap.splice(0, this.width);
      this.bitmap.push(...topRow);
    }

    // Down
    if (dir === 2) {
      const bottomRow = this.bitmap.splice(-this.width);
      this.bitmap.unshift(...bottomRow);
    }

    // Left
    if (dir === 4) {
      for (let i = 0; i < this.bitmap.length; i += this.width) {
        const first = this.bitmap.splice(i, 1);
        const last = i + this.width - 1;
        this.bitmap.splice(last, 0, first);
      }
    }

    // Up + Left
    if (dir === 5) {
      this.pScroll(1);
      this.pScroll(4);
    }

    // Down + Left
    if (dir === 6) {
      this.pScroll(2);
      this.pScroll(4);
    }

    // Right
    if (dir === 8) {
      for (let i = this.width - 1; i < this.bitmap.length; i += this.width) {
        const last = this.bitmap.splice(i, 1);
        const first = i - this.width + 1;
        this.bitmap.splice(first, 0, last);
      }
    }

    // Up + Right
    if (dir === 9) {
      this.pScroll(1);
      this.pScroll(8);
    }

    // Down + Right
    if (dir === 10) {
      this.pScroll(2);
      this.pScroll(8);
    }
  }

  blit(width, height, sx, sy, dx, dy) {
    for (
      let i = 0;
      i < height;
      i ++
    ) {
      const sourceIndex = this.width * (sy + i);
      const firstColSource = sourceIndex + sx;
      const lastColSource = firstColSource + width;
      const sourceCopy = this.bitmap.slice(firstColSource, lastColSource);

      const destIndex = this.width * (dy + i);
      const firstColDest = destIndex + dx;
      this.bitmap.splice(firstColDest, width, ...sourceCopy);
    }
  }
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  dim(x) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    if (x > 1) {
      alert("ERROR - Value cannot be greater than 1");
      return;
    } else if (x < 0) {
      alert("ERROR - Value cannot be lesser than 0");
      return;
    }

    this.r *= 1 - x;
    this.g *= 1 - x;
    this.b *= 1 - x;
  }

  brighten(x) {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    if (x > 1) {
      alert("ERROR - Value cannot be greater than 1");
      return;
    } else if (x < 0) {
      alert("ERROR - Value cannot be lesser than 0");
      return;
    }

    this.r *= 1 + x;
    this.g *= 1 + x;
    this.b *= 1 + x;

    this.r = this.r > 255 ? 255 : this.r;
    this.g = this.g > 255 ? 255 : this.g;
    this.b = this.b > 255 ? 255 : this.b;
  }

  clear() {
    if (lock) {
      alert("Bitmap is locked!");
      return;
    }

    this.r = 0;
    this.g = 0;
    this.b = 0;
  }
}

const red = new Color(255, 0, 0);
const green = new Color(0, 255, 0);
const blue = new Color(0, 0, 255);
const yellow = new Color(255, 255, 0);
const orange = new Color(255, 165, 0);
const purple = new Color(128, 0, 128);
const pink = new Color(255, 192, 203);
const white = new Color(255, 255, 255);
const black = new Color(0, 0, 0);

const btnPutPixel = document.getElementById("btnPutPixel");
const btnLine = document.getElementById("btnLine");
const btnRectangle = document.getElementById("btnRectangle");
const btnTriangle = document.getElementById("btnTriangle");
const btnCircle = document.getElementById("btnCircle");

const txtPutPixel = document.getElementById("putPixeltxt");
const txtLine = document.getElementById("linetxt");
const txtRectangle = document.getElementById("rectangletxt");
const txtTriangle = document.getElementById("triangletxt");
const txtCircle = document.getElementById("circletxt");

const btnLeft = document.getElementById("left");
const btnRight = document.getElementById("right");
const btnUp = document.getElementById("up");
const btnDown = document.getElementById("down");
const btnUpLeft = document.getElementById("upLeft");
const btnUpRight = document.getElementById("upRight");
const btnDownLeft = document.getElementById("downLeft");
const btnDownRight = document.getElementById("downRight");

const pBtnLeft = document.getElementById("pLeft");
const pBtnRight = document.getElementById("pRight");
const pBtnUp = document.getElementById("pUp");
const pBtnDown = document.getElementById("pDown");
const pBtnUpLeft = document.getElementById("pUpLeft");
const pBtnUpRight = document.getElementById("pUpRight");
const pBtnDownLeft = document.getElementById("pDownLeft");
const pBtnDownRight = document.getElementById("pDownRight");

function clicker(text) {
  text.hidden = false;
}

//

function ppVisibile() {
  txtPutPixel.hidden = false;
  lineHidden();
  rectHidden();
  triHidden();
  circleHidden();
}

function lineVisibile() {
  txtLine.hidden = false;
  ppHidden();
  rectHidden();
  triHidden();
  circleHidden();
}

function rectVisible() {
  txtRectangle.hidden = false;
  ppHidden();
  lineHidden();
  triHidden();
  circleHidden();
}

function triVisible() {
  txtTriangle.hidden = false;
  ppHidden();
  lineHidden();
  rectHidden();
  circleHidden();
}

function circleVisible() {
  txtCircle.hidden = false;
  ppHidden();
  lineHidden();
  rectHidden();
  triHidden();
}

//

function ppHidden() {
  txtPutPixel.hidden = true;
}

function lineHidden() {
  txtLine.hidden = true;
}

function rectHidden() {
  txtRectangle.hidden = true;
}

function triHidden() {
  txtTriangle.hidden = true;
}

function circleHidden() {
  txtCircle.hidden = true;
}

btnPutPixel.addEventListener("click", ppVisibile);
btnLine.addEventListener("click", lineVisibile);
btnRectangle.addEventListener("click", rectVisible);
btnTriangle.addEventListener("click", triVisible);
btnCircle.addEventListener("click", circleVisible);

let myGDE = new gde();

// 1 ^  2 v  4 <  8 >

btnUp.addEventListener("click", () => {
  myGDE.scroll(1);
});

btnDown.addEventListener("click", () => {
  myGDE.scroll(2);
});

btnLeft.addEventListener("click", () => {
  myGDE.scroll(4);
});

btnUpLeft.addEventListener("click", () => {
  myGDE.scroll(5);
});

btnDownLeft.addEventListener("click", () => {
  myGDE.scroll(6);
});

btnRight.addEventListener("click", () => {
  myGDE.scroll(8);
});

btnUpRight.addEventListener("click", () => {
  myGDE.scroll(9);
});

btnDownRight.addEventListener("click", () => {
  myGDE.scroll(10);
});

//

pBtnUp.addEventListener("click", () => {
  myGDE.pScroll(1);
});

pBtnDown.addEventListener("click", () => {
  myGDE.pScroll(2);
});

pBtnLeft.addEventListener("click", () => {
  myGDE.pScroll(4);
});

pBtnUpLeft.addEventListener("click", () => {
  myGDE.pScroll(5);
});

pBtnDownLeft.addEventListener("click", () => {
  myGDE.pScroll(6);
});

pBtnRight.addEventListener("click", () => {
  myGDE.pScroll(8);
});

pBtnUpRight.addEventListener("click", () => {
  myGDE.pScroll(9);
});

pBtnDownRight.addEventListener("click", () => {
  myGDE.pScroll(10);
});

myGDE.line(500, 0, 500, 100, pink);

myGDE.rectangle(100, 100, 200, 200, 0, "outline", orange);
myGDE.rectangle(100, 100, 200, 200, 10, "outline", blue);
myGDE.rectangle(100, 100, 200, 200, 30, "outline", pink);
myGDE.rectangle(100, 100, 200, 200, 55, "outline", green);

myGDE.rectangle(300, 300, 400, 400, 25, "solid", red);

myGDE.rectangle(400, 400, 100, 100, 55, "solid", white);

//myGDE.blit(100, 100, 50, 100, 400, 50);

setInterval(() => {
  myGDE.render();
}, 50);