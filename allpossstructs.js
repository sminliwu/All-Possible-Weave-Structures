/**
 * port of allpossstructs.py to JS
 * none of this code requires P5.js
 * */

class WeaveStructData {
  constructor(size = 4) {
    this.size = size;
    this.data = [];
    let row = [];
    for (let i=0; i < size; i++) {
      row.push(-1);
    }
    for (let i=0; i < size; i++) {
      this.data.push(Array.from(row));
    }
  }

  toString() {
    let res = "";
    for (let row=0; row<this.size; row++) {
      for (let col=0; col<this.size; col++) {
        res += this.data[row][col].toString();
      }
    }
    return res;
  }

  printRow(n, tab = true, nl = true) {
    let printme = tab ? "\t" : "";
    for (let x=0; x<this.size; x++) {
      printme += (this.data[n][x] < 0) ? "-" : this.data[n][x].toString(); 
    }
    return nl ? printme + "\n" : printme;
  }

  print() {
    let printme = "";
    for (let row=0; row<this.size; row++) {
      printme += this.printRow(row);
    }
    return printme;
  }

  copy() {
    let copy = new WeaveStruct(this.size);
    for (let row=0; row<this.size; row++) {
      for (let col=0; col<this.size; col++) {
        copy.data[row][col] = this.data[row][col]
      }
    }
    return copy;
  }

  matches(w) {
    return (this.toString() == w.toString());
  }

  row(n) {
    return this.data[n];
  }

  col(n) {
    let res = [];
    for (let x=0; x<this.size; x++) {
      res.push(this.data[x][n]);
    }
    return res;
  }

  // all data editing methods leave the original WeaveStruct object unchanged, returning a modified copy
  
  unsetAll(val = 0) {
    if (val < 0) {
      return new WeaveStruct(this.size).data;
    } else {
      let res = self.copy();
      for (let row=0; row<this.size; row++) {
        for (let col=0; col<this.size; col++) {
          if (this.data[row][col] == val) {
            res.data[row][col] = -1;
          }
        }
      }
      return res;
    }
  }

  rotate(n = 1) {
    let x = (n+4) % 4;
    if (x <= 0) {
      return this.copy();
    } else {
      let res = new WeaveStruct(this.size);
      res.data = [];
      for (let i=0; i<this.size; i++) {
        res.data.unshift(this.col(i));
      }
      return res.rotate(n-1);
    }
  }

  rowShift(n=1) {
    let ret = this.copy();
    for (let i=0; i < n; i++) {
      ret.data.unshift(ret.data.pop());
    }
    return ret;
  }

  colShift(n=1) {
    return this.rotate().rowShift(n).rotate(-1);
  }

  fill(row, col, val) {
    let res = this.copy();
    res.data[row][col] = val;
    return res;
  }

  // LOGIC FUNCTIONS: is WeaveStruct ___ ?

  isValid() {
    // if each row + col has at least one interlacement (one 1 and one 0)
    for (let row of this.data) {
      if (row.includes(0) && row.includes(1)) {}
      else { return false; }
    }
    for (let col of this.rotate().data) {
      if (col.includes(0) && col.includes(1)) {}
      else { return false; }
    }
    return true;
  }

  // whether this WeaveStruct and w are row shifts of each other
  isRowShift(w) {
    let s = this.copy();
    for (let i=0; i<=this.size; i++) {
      if (s.matches(w)) { return true; }
      s = s.rowShift();
    }
    return false;
  }

  // whether this WeaveStruct and w are col shifts of each other
  isColShift(w) {
    return this.rotate().isRowShift(w.rotate());
  }

  // whether this WeaveStruct and w are some combination of (row, col) shifts of each other
  isSomeShift(w) {
    if (this.isRowShift(w)) { return true; }
    let s = this.rowShift();
    for (let i=0; i<=this.size; i++) {
      if (s.isColShift(w)) { return true; }
      s = s.rowShift();
    }
    return false;
  }

  // counting/parsing functions for fills

  numUnset() {
    let res = 0;
    for (let row=0; row<this.size; row++) {
      for (let col=0; col<this.size; col++) {
        if (this.data[row][col] < 0) { res += 1; }
      }
    }
    return res;
  }

  firstUnset() {
    for (let row=0; row<this.size; row++) {
      for (let col=0; col<this.size; col++) {
        if (this.data[row][col] < 0) { return [row, col]; }
      }
    }
  }

  numFillOptions() {
    return pow(2,(this.numUnset()));
  }
}

class StructDictEntry {
  constructor(struct, id = -1) {
    this.struct = struct;
    this.id = id;
    this.rots = []; // store the string reps
    this.shifts = [];
  }
}

class StructDict {
  constructor(size = DRAFT_SIZE, countRotations = true) {
    this.entries = { length: 0 };
    this.rots = { length: 0 };
    this.shifts = { length: 0 };
    this.size = size;
    this.counter = 0;
    this.duplicates = 0;

    this.countRotations = countRotations;
  }

  get numStructs() {
    console.log(this.entries.length);
    console.log(this.rots.length);
    return (this.entries.length + this.rots.length + this.shifts.length);
  }

  add(struct) {
    // indexed by the weavestruct's string representation
    const newKey = struct.toString();

    // if this struct is already in the unique entries
    if (this.entries[newKey]) {
      this.duplicates++;
    } else if (this.shifts[newKey] || this.rots[newKey]) {
      // if this struct is a shift or rotation of an entry
    } else {
      const newId = this.entries.length;
      this.entries[newKey] = new StructDictEntry(struct, newId);
      this.entries.length++;

      // generate all shifted versions, greatly speeds up the whole thing
      for (let i=0; i<this.size; i++) {
        for (let j=0; j<this.size; j++) {
          const w = struct.rowShift(i).colShift(j);
          const wKey = w.toString();
          if (this.shifts[wKey] || wKey == newKey) {} // due to symmetry, not all shifts will be unique
          else {
            this.shifts[wKey] = new StructDictEntry(w, newId);
            this.entries[newKey].shifts.push(wKey);
            this.shifts.length++;
          }
        }
      }

      // generate rotated versions
      for (let i=1; i < 4; i++) {
        const w = struct.rotate(i);
        const wKey = w.toString();
        if (this.rots[wKey] || wKey == newKey) {} // due to symmetry, some rotations might be the same
        else {
          this.rots[wKey] = new StructDictEntry(w, newId);
          this.entries[newKey].rots.push(wKey);
          this.rots.length++;
        }
      }
    }
    this.counter++;
  }
}

function lineIsFilledWith(list, val) {
  for (var i=0; i<list.length; i++) {
    if (list[i] != val) { return false; }
  }
  return true;
}

/**
 * Takes a WeaveStruct `struct` that is partially or completely unset, and returns an array of WeaveStructs that possibly result from filling in the struct.
 * @param { WeaveStruct } struct 
 * @param { boolean } filter 
 * @returns array of WeaveStructs
 */
function allPossFills(struct, filter = true) {
  let count = struct.numUnset();
  let allPoss = [struct.copy()];
  const lastIdx = struct.size - 1;

  while (count > 0) {
    let [row, col] = allPoss[0].firstUnset();
    let newPoss = [];
    
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

function categorizeFills(poss) {
  const res = new StructDict(poss[0].size);
  const length = poss.length;

  for (struct of poss) {
    res.add(struct);

    if (res.counter % 100 == 0) {
      console.log(res.counter.toString() + "/" + length.toString());
    }
  }

  console.log(res);
  console.log(res.counter.toString() + " structures processed");
  console.log(res.duplicates.toString() + " duplicates");
  console.log(res.numStructs.toString() + " structures registered");
  console.log(res.entries.length.toString() + " unique weaves");

  return res;
}
