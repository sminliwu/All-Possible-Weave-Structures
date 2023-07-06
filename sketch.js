/**
 * The P5.js stuff
 */

const DRAFT_SIZE = 4;

var allFills;

var counter = 0;
var doneFilling = false;
var doneCategorizing = false;

var rowLength;

const startX = CELL_SIZE;
const startY = CELL_SIZE;
const gapSize = padding*CELL_SIZE;

// let wc, bc, uc;
// let cx;
let buf;
let currentX, currentY;

function setup() {
  createCanvas(windowWidth, 13*windowHeight);
  // setupBuffers();

  // noLoop();
  background(220);
  noSmooth();
  frameRate(60);

  rowLength = floor(width/(DRAFT_SIZE*CELL_SIZE+padding*CELL_SIZE)) - 1;
  
  currentX = startX + gapSize;
  currentY = startY + gapSize;

  allFills = allPossFills(new WeaveStruct(DRAFT_SIZE));
  allFills = allFills.filter(x => x.isValid());
  allFills = allFills.map((x, i) => {
    x.id = i;
    return x;
  });
  console.log(allFills);
  // categorizeFills(allFills);

  buf = createGraphics(allFills[0].graphicSize, allFills[0].graphicSize);
  console.log("drawing now");
}

function draw() {
  // console.log(width);
  // let row = floor(width/(DRAFT_SIZE*CELL_SIZE+padding*CELL_SIZE)) - 1;
  // console.log(row);
  // drawStructList(allFills, CELL_SIZE, CELL_SIZE, row);
  if (doneFilling) { noLoop(); }
  else {
    let i = counter;
    [currentX, currentY] = drawStructOfList(allFills[i], i, currentX, currentY, rowLength, CELL_SIZE, startX, gapSize);
    counter++;
    if (counter == allFills.length) { doneFilling = true; }
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

