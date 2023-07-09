/**
 * The P5.js stuff
 */

const DRAFT_SIZE = 4;
const BUFFER_SIZE = 50;

let structs;
/** @type {HTMLCanvasElement} */
let cx;

// animation state
let doneFilling = false;
let doneCategorizing = false;

function setup() {
  createCanvas(window.innerWidth, windowHeight);
  background(220);

  // paraphrasing Chrome console message: "Canvas2D will load faster if this drawing context has the 'willReadFrequently' boolean set to true"
  // cx.getContext('2d', { willReadFrequently: true });
  cx = document.getElementById('defaultCanvas0');
  console.log(cx);

  let blankStruct = new WeaveStruct(DRAFT_SIZE);

  let allFills = allPossFills(blankStruct);
  allFills = allFills.filter(x => x.isValid());
  allFills.sort((a, b) => a.toString()-b.toString());
  allFills = allFills.map((x, i) => {
    x.id = i;
    return x;
  });

  console.log(allFills.length);

  structs = new StructList();
  structs.setup(allFills);

  console.log(structs.length);
  
  let adjustWidth = cx.parentElement.clientWidth;
  let newHeight = (ceil(structs.length/structs.rowLength)+1)*(structs.graphicSize+structs.gapSize);
  resizeCanvas(adjustWidth, newHeight);
  
  console.log("drawing now");

  for (let i=0; i<structs.buffers.length; i++) {
    structs.draw(i);
  }
  // console.log(structs.buffers);
}

const drawOnce = false;

function draw() {
  // noLoop();
  // return;

  rect(0, 0, 70, 30);
  text(structs.counter, 10, 20);
  if (drawOnce) {
    drawStructList(structs, startX, startY, rowLength);
    noLoop();
  } else {
    if (doneFilling) { noLoop(); }
    else {
      structs.step(BUFFER_SIZE);

      if (structs.counter == structs.length) { doneFilling = true; }
    }
  }
}

allPoss = [];
newPoss = [];

/**
 * EDITS THINGS IN PLACE SO THEY WILL ANIMATE IN p5
 * 
 * Takes a WeaveStruct `struct` that is partially or completely unset, and returns an array of WeaveStructs that possibly result from filling in the struct.
 * @param { WeaveStruct } struct 
 * @param { boolean } filter 
 * @returns array of WeaveStructs
 */
function drawFillingPossibilities(struct, filter = true) {
  let count = struct.numUnset();
  const lastIdx = struct.size - 1;
  allPoss = [struct.copy()];
  drawWeaveStruct(allPoss[0], CELL_SIZE, CELL_SIZE);

  while (count > 0) {
    let [row, col] = allPoss[0].firstUnset();
    newPoss = [];
    
    for (let s of allPoss) {
      // console.log(s);
      const sRow = s.row(row).slice(0, lastIdx);
      const sCol = s.col(col).slice(0, lastIdx);
      if (filter) { // try not to generate invalid structures
        if (row == lastIdx && col == lastIdx) {
          if (!(lineIsFilledWith(sRow, 0)) && !(lineIsFilledWith(sCol, 0))) {
            newPoss.push(s.fill(row, col, 0));
          }
          if (!(lineIsFilledWith(sRow, 1)) && !(lineIsFilledWith(sCol, 1))) {
            newPoss.push(s.fill(row, col, 1));
          }
        } else if (col == lastIdx) {
          if (!lineIsFilledWith(sRow, 0)) {
            newPoss.push(s.fill(row, col, 0));
          }
          if (!lineIsFilledWith(sRow, 1)) {
            newPoss.push(s.fill(row, col, 1));
          }
        } else if (row == lastIdx) {
          if (!lineIsFilledWith(sCol, 0)) {
            newPoss.push(s.fill(row, col, 0));
          }
          if (!lineIsFilledWith(sCol, 1)) {
            newPoss.push(s.fill(row, col, 1));
          }
        } else {
          newPoss.push(s.fill(row, col, 0));
          newPoss.push(s.fill(row, col, 1));
        }
      } else {
        newPoss.push(s.fill(row, col, 0));
        newPoss.push(s.fill(row, col, 1));
      }
    }

    allPoss = Array.from(newPoss);
    // console.log(allPoss);
    count--;
  }
  return allPoss;
}

