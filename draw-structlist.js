// drawing helper functions for P5.js

let CELL_SIZE = 5;
var padding = 1;
var BACKGROUND_COLOR = 220;

/** wrapper around WeaveStruct for P5 drawing */
class WeaveStruct extends WeaveStructData {
  constructor(size = DRAFT_SIZE, id = -1, xpos = -1, ypos = -1, cellSize = CELL_SIZE, buf = undefined) {
    super(size);
    this.id = id;
    this.x = xpos;
    this.y = ypos;
    this.cellSize = cellSize;

    this.img = buf;
    // console.log(this);
  }

  get graphicSize() { return this.size*this.cellSize+1; }

  setBWpixels(x, y, bw) {
    const pixels = this.img.pixels;
    const d = 1 // why is pixel density actually 1?
    const imgWidth = this.graphicSize*d;

    let idxA = y*imgWidth + x*d;
    let points = [idxA]

    // for (let i=0; i<d; i++) { points.push(idxA + i); }
    // let row = Array.from(points);
    // for (let j=1; j<d; j++) { 
    //   row = row.map(x => x+imgWidth);
    //   points = points.concat(row);
    // }
    // console.log(points);

    points.map((x) => {
      let i = 4*x;
      pixels[i] = bw;
      pixels[i+1] = bw;
      pixels[i+2] = bw;
      pixels[i+3] = 255;
    })
  }

  setCellPixels(col, row, val) {
    const startX = col*this.cellSize;
    const startY = row*this.cellSize;
    const endX = startX + this.cellSize;
    const endY = startY + this.cellSize;

    // console.log(startX, startY, endX, endY);

    for (let x=startX; x<endX; x++) {
      for (let y=startY; y<endY; y++) {
        this.setBWpixels(x, y, val);
      }
    }
  }

  blackCell(col, row, stroke=false) {  
    this.setCellPixels(col, row, 0);
  }

  whiteCell(col, row, stroke=false) {
    this.setCellPixels(col, row, 255);
  }

  // NOT CURRENTLY USED
  unsetCell(x, y, stroke=false) {
    const buf = this.img;

    // buf.stroke(0);
    // if (stroke) {
    //   buf.noFill();
    //   buf.square(x, y, this.cellSize);
    // }

    // buf.line(x, y, x+this.cellSize, y+this.cellSize);
  }

  outline() {
    for (let edge=0; edge<=this.size; edge++) {
      for (let i=0; i<this.graphicSize; i++) {
        this.setBWpixels(i, edge*this.cellSize, 0);
        this.setBWpixels(edge*this.cellSize, i, 0);
      }
    }
  }

  draw() {
    const buf = this.img;
    buf.loadPixels();

    for (let row=0; row<this.size; row++) {
      for (let col=0; col<this.size; col++) {
        let args = [ col, row ];
  
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

    buf.updatePixels();
    // this.show();
  }

  show() {
    image(this.img, this.x, this.y);
  }
}

/**
 * wrapper class for a list of WeaveStructs to render
 * in P5
 */
class StructList extends Array {
  constructor(length = 0) {
    super(length);

    this.structSize;
    this.rowLength;
    this.cellSize;
    this.gapSize;

    this.start = [0, 0];
    this.current = [0, 0];
    this.counter;

    this.buffers = [];
    this.loadSpeed = 100;
  }
    
  /**
   * 
   * @param {Array<WeaveStruct>} preload 
   * @param {*} buf 
   * @param {*} cellSize 
   * @param {*} gapSize 
   * @param {*} width 
   */
  setup(preload, buf = BUFFER_SIZE, cellSize = CELL_SIZE, gapSize = CELL_SIZE) {
    this.cellSize = cellSize;
    this.gapSize = gapSize;

    for (let s of preload) {
      // s.img = this.buffers[s.id % this.buffers.length];
      this.push(s);
    }

    this.bufferPointer = 0;
    this.setupBuffers(buf);
    this.map((x, i) => {
      x.img = this.buffers[x.id % this.buffers.length];
    })

    this.structSize = this[0].size;
    this.rowLength = this.calcRowLength(width);
    console.log(this.rowLength);

    this.restart();    
  }

  restart() {
    this.start = [this.gapSize, this.gapSize];
    this.current = [this.cellSize, this.cellSize];
    this.counter = 0;
  }

  get startX() { return this.start[0]; }
  get startY() { return this.start[1]; }

  get curX() { return this.current[0]; }
  set curX(x) { this.current[0] = x; }

  get curY() { return this.current[1]; }
  set curY(y) { this.current[1] = y; }

  get graphicSize() { 
    if (this.length > 0) { return this[0].graphicSize; }
    else { return 0; }
  }

  get nextBuffer() { return this.counter + this.buffers.length; }

  calcRowLength(displayWidth) {
    if (this.structSize) {
      return floor(displayWidth/(this.graphicSize+this.gapSize)) - 1;
    } else { return 0; }
  }

  setupBuffers(num = BUFFER_SIZE) {
    let imgSize = this.graphicSize;
    this.buffers = [];
    for (let i=0; i<num; i++) {
      this.buffers.push(createImage(imgSize, imgSize));
    }
    this.buffers.map(x => x.loadPixels());
    this.bufferPointer = 0;
  }

  /**
   * 
   * @param {number} index 
   */
  draw(index) {
    if (index < 0) {} // draw all
    else {
      /** @type {WeaveStruct} */
      let struct = this[index];

      struct.x = this.curX;
      struct.y = this.curY;
    
      if (struct.id > 0 && this.counter%this.rowLength == this.rowLength-1) {
        struct.x = this.startX;
        struct.y += struct.graphicSize + this.gapSize;
      }
    
      struct.draw();

      this.current = [ struct.x + struct.graphicSize + this.gapSize, struct.y ];    
    }
  }

  step(n=1) {
    // if (n > this.buffers.length) { return; }
    for (let i=0; i<n; i++) {
      if (this.counter == this.length) { return; }
      this[this.counter].show();
      if (this.nextBuffer < this.length) { this.draw(this.nextBuffer); }
      this.counter++;
    }
  }

  drawAll() {
    // this.restart();
    let x = this.counter;
    for (let i=x; i<this.length; i++) {
      this.step();
    }
  }
}
