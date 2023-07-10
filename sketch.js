/**
 * The P5.js stuff
 */

const DRAFT_SIZE = 4;
const BUFFER_SIZE = 1;

let structs;
/** @type {HTMLCanvasElement} */
let cv;

// animation state
let doneFilling = false;
let doneCategorizing = false;

function setup() {
  // const canvas = document.createElement('canvas');
  // document.getElementById('topbar').append(canvas);
  // const ctx = canvas.getContext('2d', { willReadFrequently: true });
  // console.log(ctx);

  cv = createCanvas(window.innerWidth, windowHeight);
  console.log(cv.elt);
  cv.elt.getContext('2d', { willReadFrequently: true});
  cv.parent('canvas');
  background(220);

  // paraphrasing Chrome console message: "Canvas2D will load faster if this drawing context has the 'willReadFrequently' boolean set to true"
  // cx.getContext('2d', { willReadFrequently: true });

  let blankStruct = new WeaveStruct(DRAFT_SIZE);

  let allFills = allPossFills(blankStruct);
  console.log("generated " + allFills.length + " structures");
  allFills = allFills.filter(x => x.isValid());
  allFills.sort((a, b) => a.toString()-b.toString());
  allFills = allFills.map((x, i) => {
    x.id = i;
    return x;
  });

  console.log(allFills.length + "valid structures");

  let sortedFills = categorizeFills(allFills);
  console.log(sortedFills);
  let uniqueStructs = Object.values(sortedFills.entries).slice(1).map((x) => x.struct );
  uniqueStructs.sort((a, b) => a.toString()-b.toString());

  console.log(uniqueStructs);

  structs = new StructList();
  // structs.setup(allFills);
  structs.setup(uniqueStructs);

  // console.log(structs.length);
  
  let adjustWidth = cv.elt.parentElement.clientWidth;
  // let newHeight = cv.parentElement.clientHeight-1;
  let newHeight = (ceil(structs.length/structs.rowLength))*(structs.graphicSize+structs.gapSize);
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

  // rect(0, 0, 70, 30);
  // text(round(frameRate(), 2), 10, 20);
  if (drawOnce) {
    // drawStructList(structs, startX, startY, rowLength);
    structs.drawAll();
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

