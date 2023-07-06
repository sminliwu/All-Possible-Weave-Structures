// drawing helper functions for P5.js

var CELL_SIZE = 5;
var padding = 1;
var BACKGROUND_COLOR = 220;

/** @type enum */
// const numStyle = {
//   'NONE',
//   'TOP_LEFT',
//   'TOP',
//   'BOTTOM',
//   'LEFT'
// }

/** wrapper around WeaveStruct for P5 drawing */
class WeaveStruct extends WeaveStructData {
  constructor(size = DRAFT_SIZE, id = -1, xpos = -1, ypos = -1, cellSize = CELL_SIZE) {
    super(size);
    this.id = id;
    this.x = xpos;
    this.y = ypos;
    this.cellSize = cellSize;
    // console.log(this);
  }

  get graphicSize() { return this.size*this.cellSize; }

  blackCell(x, y, stroke=false) {
    // if (stroke) stroke(0);
    // fill(0);
    // square(x, y, this.cellSize);

    if (stroke) buf.stroke(0);
    buf.fill(0);
    buf.square(x, y, this.cellSize);
  }

  whiteCell(x, y, stroke=false) {
    // if (stroke) stroke(0);
    // fill(255);
    // square(x, y, this.cellSize);

    if (stroke) buf.stroke(0);
    buf.fill(255);
    buf.square(x, y, this.cellSize);
  }

  unsetCell(x, y, stroke=false) {
    buf.stroke(0);
    if (stroke) {
      buf.noFill();
      buf.square(x, y, this.cellSize);
    }
    buf.line(x, y, x+this.cellSize, y+this.cellSize);
  }

  outline() {
    // stroke(0);
    // noFill();
    // square(this.x, this.y, this.graphicSize);

    // buf.stroke(0);
    // buf.noFill();
    // buf.square(0, 0, this.graphicSize);
  }

  draw() {
    buf.loadPixels();
    buf.noStroke();
    for (let row=0; row<this.size; row++) {
      for (let col=0; col<this.size; col++) {
        // let args = [ this.x+col*this.cellSize, this.y+row*this.cellSize ];
        let args = [ col*this.cellSize, row*this.cellSize ];
  
        switch (this.data[row][col]) {
          case -1:
            this.unsetCell(...args);
            break;
          case 0:
            this.whiteCell(...args);
            break;
          case 1:
            this.blackCell(...args);
            break;
          default:
            break;
        }
      }
    }
    this.outline();
    for (let i=1; i<this.size; i++) {
      // horizontal line
      // let ypos = this.y+i*this.cellSize;
      // line(this.x, ypos, this.x+this.graphicSize, ypos);
      let ypos = i*this.cellSize;
      buf.line(0, ypos, this.graphicSize, ypos);

      // vertical line
      // let xpos = this.x+i*this.cellSize;
      // line(xpos, this.y, xpos, this.y+this.graphicSize);
      let xpos = i*this.cellSize;
      buf.line(xpos, 0, xpos, this.graphicSize);
    }
  }

  show() {
    image(buf, this.x, this.y);
  }
}

function setupBuffers() {
  wc = createGraphics(CELL_SIZE, CELL_SIZE);
  // wc.stroke(0);
  wc.fill(255);
  wc.square(0,0,CELL_SIZE);

  bc = createGraphics(CELL_SIZE, CELL_SIZE);
  // bc.stroke(0);
  bc.fill(0);
  bc.square(0,0,CELL_SIZE);

  uc = createGraphics(CELL_SIZE, CELL_SIZE);
  // uc.stroke(0);
  uc.noFill();
  uc.line(0,0, CELL_SIZE, CELL_SIZE);
  uc.square(0,0,CELL_SIZE);
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} size 
 * @returns 
 */
function whiteDraftCell(x, y, size=CELL_SIZE) {
  // stroke(0);
  // fill(255);
  // square(x, y, size);

  // for (let i=0; i<size; i++) {
  //   for (let j=0; j<size; j++) {
  //     if (i == 0 || j == 0 || i == size-1 || j == size-1) {
  //       set(x+i, y+j, color(0));
  //     }
  //     else { set(x+i, y+j, color(255))};
  //   }
  // }
  // updatePixels();

  image(wc, x, y);
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} size 
 * @returns 
 */
function blackDraftCell(x, y, size=CELL_SIZE) {
  // stroke(0);
  // fill(0);
  // return square(x, y, size);

  // for (let i=0; i<size; i++) {
  //   for (let j=0; j<size; j++) {
  //     set(x+i, y+j, color(0));
  //   }
  // }
  // updatePixels();

  copy(bc, x, y);
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} size 
 * @returns 
 */
function unsetDraftCell(x, y, size=CELL_SIZE) {
  stroke(0);
  noFill();
  square(x, y, size);
  return line(x, y, x+size, y+size);
}

/**
 * 
 * @param {WeaveStruct} struct 
 * @param {number} startX 
 * @param {number} startY 
 * @param {number} cellSize 
 */
function drawWeaveStruct(struct, startX, startY, cellSize = CELL_SIZE) {
  let parts = [];
  for (let row=0; row<struct.size; row++) {
    for (let col=0; col<struct.size; col++) {
      let args = [ startX+col*cellSize, startY+row*cellSize, cellSize ];

      switch (struct.data[row][col]) {
        case -1:
          unsetDraftCell(...args);
          break;
        case 0:
          whiteDraftCell(...args);
          break;
        case 1:
          blackDraftCell(...args);
          break;
        default:
          break;
      }
    }
  }

  return parts;
}

/**
 * @param {Array<WeaveStruct>} structs 
 * @param {number} startX
 * @param {number} startY
 * @param {number} rowLength 
 * @param {number} cellSize 
 * @param {number} gapSize 
 * @param {numStyle} numbering 
 */
function drawStructList(structs, startX, startY, rowLength = 36/structs[0].size, cellSize = CELL_SIZE, gapSize = padding*cellSize, numbering = 'NONE') {
  const structSize = structs[0].size;
  let currentX = startX + gapSize;
  let currentY = startY + gapSize;

  for (let i=0; i<structs.length; i++) {
    // // todo: handle numbering?
    // if (numbering) {}
    // if (i>0 && i%rowLength == 0) {
    //   currentX = startX + gapSize;
    //   currentY += structSize*cellSize + gapSize;
    // }

    // drawWeaveStruct(structs[i], currentX, currentY, cellSize);
    // currentX += structSize*cellSize + gapSize;

    let newPos = drawStructOfList(structs[i], i, currentX, currentY, rowLength, cellSize, startX, gapSize);
    currentX = newPos[0];
    currentY = newPos[1];

    // redraw();
  }

  // return y pos below the last row for any additional struct lists
  return currentY + structSize*cellSize + gapSize;
}

function drawStructOfList(struct, i, inputX, inputY, rowLength, cellSize, startX, gapSize) {
  // let outputX = inputX;
  // let outputY = inputY;

  // if (i>0 && i%rowLength == 0) {
  //   outputX = startX + gapSize;
  //   outputY += struct.size*cellSize + gapSize;
  // }

  // drawWeaveStruct(struct, outputX, outputY, cellSize);
  // outputX += struct.size*cellSize + gapSize;

  // return [ outputX, outputY ];

  struct.x = inputX;
  struct.y = inputY;

  if (struct.id > 0 && struct.id%rowLength == 0) {
    struct.x = startX + gapSize;
    struct.y += struct.graphicSize + gapSize;
  }

  struct.draw();
  return [ struct.x + struct.graphicSize + gapSize, struct.y ];
}